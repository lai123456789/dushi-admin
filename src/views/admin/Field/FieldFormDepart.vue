<template>
  <a-drawer
    :destroyOnClose="true"
    :title="(config.optionType === 'department' ? '部门' : '角色') + (optionMode === 'default' ? '-单选' : '-多选')"
    :width="500"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-card v-if="selectList.length > 0" style="border: 1px dashed #e8e8e8;" @mouseenter="delShow = true" @mouseleave="delShow = false">
          <a-tooltip title="清空">
            <a-icon type="delete" v-if="delShow" @click="selectList = []" style="position: absolute; top: 0px; right: 0px; color: #f5222d" />
          </a-tooltip>
          <a-row :gutter="[0,5]" type="flex">
            <a-col v-for="tag in selectList" :key="tag.name">
              <a-tag closable @close="deleteTag(tag)">{{ tag.name }}</a-tag>
            </a-col>
          </a-row>
        </a-card>
        <a-card v-else style="text-align: center; border: 1px dashed #e8e8e8; color: #7F7F7F;">暂无数据</a-card>
        <div v-if="config.optionType === 'department'">
          <a-form-item style="margin: 10px 0 0 0">
            <a-select
              showSearch
              :value="undefined"
              placeholder="请输入部门关键字进行搜素"
              allowClear
              :filter-option="false"
              :not-found-content="fetching ? undefined : null"
              @search="getDepartment"
              @popupScroll="popupScroll"
              @change="(e)=>{if(!e){department = []}}"
            >
              <a-spin v-if="fetching" slot="notFoundContent" size="small" />
              <a-select-option :value="dep.departmentid" v-for="dep in departmentData" :key="dep.departmentid" @click="dataSelect('','',dep)">{{ dep.full_name }}</a-select-option>
            </a-select>
          </a-form-item>
          <div>
            <a-tree
              :tree-data="dataList"
              :load-data="onLoadData"
              @select="dataSelect"
              :replace-fields="{
                key:'value',
                title:'label',
              }"/>
          </div>
        </div>
        <a-card style="margin: 10px 0 0 0" v-else>
          <a-input-search style="margin-bottom: 8px" :placeholder="config.optionType === 'department' ? '请输入部门名称搜索':'请输入角色名称搜索'" @search="onChange" />
          <s-table
            ref="table"
            size="small"
            rowKey="id"
            :columns="columnsRole"
            :data="loadDataTable"
            :sorter="{ field: 'listorder', order: 'ascend' }"
          >
            <span slot="action" slot-scope="index, record">
              <a href="javascript:;" @click="dataSelect('', '', record, 'role')" :disabled="config.dataType === 'optionCustom' ? false : (config.optionCustom && config.optionCustom.length && config.optionCustom.every(opItem => opItem.roleid !== record.roleid) ? true : false)">选择</a>
            </span>
          </s-table>
        </a-card>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import debounce from 'lodash/debounce'
export default {
  data () {
    this.getDepartment = debounce(this.getDepartment, 800)
    return {
      optionMode: '',
      config: {},
      checkedNodes: [],
      replaceFields: {
        children: 'children',
        title: 'name'
      },
      lastFetchId: 0,
      queryParam: {},
      dataList: [],
      expandedKeys: [],
      rowKeyList: [],
      selectValue: [], // 初始值和右边显示值
      selectList: [], // 选中值
      visible: false,
      loading: false,
      delShow: false,
      fetching: false,
      scrollStats: true,
      autoExpandParent: false,
      form: this.$form.createForm(this),
      data: {},
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      searchData: '',
      departmentData: [],
      columnsDepartment: [{
        title: '部门',
        dataIndex: 'name',
        width: 450,
        scopedSlots: { customRender: 'name' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }],
      columnsRole: [{
        title: '角色',
        dataIndex: 'rolename',
        scopedSlots: { customRender: 'rolename' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 60,
        scopedSlots: { customRender: 'action' }
      }],
      searchValue: ''
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.optionMode = this.config.mode
      this.dataList = []
      this.selectList = []
      if (config.dataType === 'optionCustom') {
        if (this.optionMode === 'default') {
          if (config.optionCustom.length !== 0) {
            this.selectList.push(config.optionCustom[0])
          }
        } else {
          this.selectList = config.optionCustom || []
        }
      } else {
        const id = config.optionType === 'department' ? 'departmentid' : 'roleid'
        if (this.optionMode === 'default') {
          if (config.optionCustom.length !== 0 && config.defaultValue && config.defaultValue.length > 0) {
            this.selectList = config.defaultValue.map(item => { const obj = config.optionCustom.find(opItem => opItem[id] === item); return obj })
            this.selectList = this.selectList.filter(item => item)
          } else {
            this.selectList = config.defaultValue || []
          }
        } else {
          if (config.optionCustom.length !== 0 && config.defaultValue && config.defaultValue.length > 0) {
            this.selectList = config.defaultValue.map(item => { const obj = config.optionCustom.find(opItem => opItem[id] === item); return obj })
            this.selectList = this.selectList.filter(item => item)
          } else {
            this.selectList = config.defaultValue || []
          }
        }
      }
      this.axios({
        url: config.url
      }).then((res) => {
        this.loading = false
        if (config.optionType === 'department') {
          res.result.data.forEach(item => {
            if (item.childCount && item.childCount !== 0) {
              item.children = [{}]
              if (config.dataType !== 'optionCustom' && config.optionCustom.length !== 0) {
                item.disabled = config.optionCustom.every(opItem => opItem.departmentid !== item.value)
              }
            } else {
              item.isLeaf = true
            }
          })
        }
        this.dataList = res.result.data
      })
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/role/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    getDepartment (e) {
      this.searchData = e
      this.page.pageNo = 1
      this.scrollStats = true
      if (e) {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.fetching = true
        this.axios({
          url: 'admin/Api/departmentSearch',
          params: Object.assign(this.page, { name: e })
        }).then(res => {
          if (fetchId !== this.lastFetchId) {
            return
          }
          this.departmentData = res.result.data
          this.fetching = false
        })
      } else {
        this.departmentData = []
      }
    },
    onExpand (expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onLoadData (treeNode) {
      const { value } = treeNode.dataRef
      return new Promise((resolve) => {
        this.axios({
          url: '/admin/Department/getDepartmentUser',
          params: { departmentid: value }
        }).then(res => {
          res.result.data.forEach(item => {
            if (item.childCount && item.childCount !== 0) {
              item.children = [{}]
              if (this.config.dataType !== 'optionCustom' && this.config.optionCustom.length !== 0) {
                item.disabled = this.config.optionCustom.every(opItem => opItem.departmentid !== item.value)
              }
            } else {
              if (this.config.dataType !== 'optionCustom' && this.config.optionCustom.length !== 0) {
                item.disabled = this.config.optionCustom.every(opItem => opItem.departmentid !== item.value)
              }
              item.isLeaf = true
            }
          })
          treeNode.dataRef.children = res.result.data.filter(item => item.type !== 'user')
        })
        resolve()
      })
    },
    dataSelect (selectedKeys, e, dep, type) {
      let obj = {}
      if (dep) {
        if (type) {
          obj = {
            name: dep.rolename,
            roleid: dep.roleid
          }
        } else {
          obj = {
            name: dep.name,
            departmentid: dep.departmentid
          }
        }
      } else {
        obj = {
          name: e.node.dataRef.label,
          departmentid: e.node.dataRef.value
        }
      }
      if (this.optionMode === 'default' && this.selectList.length === 0) {
        if (this.config.dataType !== 'optionCustom' && this.config.optionCustom.length !== 0) {
          if (this.config.optionCustom.some(item => obj.departmentid ? item.departmentid === obj.departmentid : item.roleid === obj.roleid)) {
            this.selectList.splice(0, 0, obj)
          } else {
            this.$message.error('不在可选范围内')
          }
        } else {
          this.selectList.splice(0, 0, obj)
        }
      } else if (this.optionMode === 'default') {
        if (this.config.dataType !== 'optionCustom' && this.config.optionCustom.length !== 0) {
          if (this.config.optionCustom.some(item => obj.departmentid ? item.departmentid === obj.departmentid : item.roleid === obj.roleid)) {
            this.selectList.splice(0, 1, obj)
          } else {
            this.$message.error('不在可选范围内')
          }
        } else {
          this.selectList.splice(0, 1, obj)
        }
      } else {
        if (this.selectList.every(item => item.departmentid !== obj.departmentid) && !type) {
          if (this.config.dataType !== 'optionCustom' && this.config.optionCustom.length !== 0) {
            if (this.config.optionCustom.some(item => item.departmentid === obj.departmentid)) {
              this.selectList.splice(this.selectList.length, 0, obj)
            } else {
              this.$message.error('不在可选范围内')
            }
          } else {
            this.selectList.splice(this.selectList.length, 0, obj)
          }
        } else if (this.selectList.every(item => item.roleid !== obj.roleid) && type) {
          if (this.config.dataType !== 'optionCustom' && this.config.optionCustom.length !== 0) {
            if (this.config.optionCustom.some(item => item.roleid === obj.roleid)) {
              this.selectList.splice(this.selectList.length, 0, obj)
            } else {
              this.$message.error('不在可选范围内')
            }
          } else {
            this.selectList.splice(this.selectList.length, 0, obj)
          }
        }
      }
    },
    deleteTag (record) {
      if (this.config.mode === 'default') {
        this.selectList = []
      } else if (this.config.mode === 'multiple') {
        this.selectList = this.selectList.filter(item => item.departmentid !== record.departmentid)
      }
    },
    onChange (e) {
      this.queryParam.rolename = e
      this.$refs.table.refresh(true)
    },
    getDepartmentScroll () {
      this.axios({
        url: 'admin/Api/departmentSearch',
        params: Object.assign(this.page, { name: this.searchData })
      }).then(res => {
        if (!res.result.data.length) {
          this.scrollStats = false
        }
        this.departmentData = [...this.departmentData, ...res.result.data]
      })
    },
    popupScroll (e) {
      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight
      const clientHeight = e.target.clientHeight
      const scrollBottom = scrollHeight - clientHeight - scrollTop
      if (scrollBottom < 1 && this.scrollStats && this.searchData) {
        this.page.pageNo++
        this.getDepartmentScroll()
      }
    },
    handleSubmit () {
      // 只保存id
      let selectValue
      const initMode = this.config.optionType + '_' + this.config.mode
      if (this.config.mode === 'default') {
        if (this.config.optionType !== 'department') {
          selectValue = this.config.dataType === 'optionCustom' ? this.selectList : this.selectList.map(item => item.roleid)
        } else {
          selectValue = this.config.dataType === 'optionCustom' ? this.selectList : this.selectList.map(item => item.departmentid)
        }
        this.$emit('ok', selectValue, this.config.dataType, initMode, this.config.mode)
      } else {
        this.$message.success('成功添加' + this.selectList.length + '个')
        selectValue = this.selectList
        if (this.config.optionType !== 'department') {
          selectValue = this.selectList
        } else {
          selectValue = this.selectList
        }
        this.$emit('ok', selectValue, this.config.dataType, initMode, this.config.mode)
      }
      this.visible = false
    }
  }
}
</script>
