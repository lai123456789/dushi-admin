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
            <a-icon type="delete" v-if="delShow" @click="selectList = []" style="position: absolute; top: 3px; right: 3px; color: #f5222d" />
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
              :mode="optionMode"
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
          <a-input-search style="margin-bottom: 8px" placeholder="请输入角色名称搜索" @search="onChange" />
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
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      dataList: [],
      rowKeyList: [],
      selectValue: [], // 初始值和右边显示值
      selectList: [], // 选中值
      searchData: '',
      visible: false,
      loading: false,
      delShow: false,
      fetching: false,
      lastFetchId: 0,
      scrollStats: true,
      autoExpandParent: false,
      form: this.$form.createForm(this),
      data: {},
      departmentData: [],
      queryParam: {},
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
      let selectValue = []
      if (this.optionMode === 'default') {
        const id = config.optionType === 'department' ? 'departmentid' : 'roleid'
        if (Array.isArray(config.selectValue) && config.selectValue.length !== 0) {
          selectValue.push(config.selectValue)
          if (config.optionCustom.length) {
            this.selectList = config.optionCustom.filter(item => item[id] === config.selectValue[0])
          } else {
            this.selectList = config.option.filter(item => item[id] === config.selectValue)
          }
        } else if (typeof (config.selectValue) === 'string') {
          if (config.optionCustom.length) {
            this.selectList = config.optionCustom.filter(item => item[id] === config.selectValue)
          } else {
            this.selectList = config.option.filter(item => item[id] === config.selectValue)
          }
          selectValue.push(config.selectValue)
        }
      } else {
        selectValue = config.selectValue
        const id = config.optionType === 'department' ? 'departmentid' : 'roleid'
        if (config.optionCustom.length !== 0) {
          this.selectList = config.optionCustom.filter(item => {
            return config.selectValue.indexOf(item[id]) !== -1
          })
        } else {
          this.selectList = config.option.filter(opItem => opItem[id] === config.selectValue.find(item => item === opItem[id]))
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
              if (config.optionCustom.length !== 0) {
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
              if (this.config.optionCustom.length !== 0) {
                item.disabled = this.config.optionCustom.every(opItem => opItem.departmentid !== item.value)
              }
            } else {
              item.isLeaf = true
              if (this.config.optionCustom.length !== 0) {
                item.disabled = this.config.optionCustom.every(opItem => opItem.departmentid !== item.value)
              }
            }
          })
          treeNode.dataRef.children = res.result.data.filter(item => item.type !== 'user')
        })
        resolve()
      })
    },
    dataSelect (selectedKeys, e, dep) {
      let obj = {}
      if (dep) {
        if (dep.departmentid) {
          obj = {
            name: dep.name,
            departmentid: dep.departmentid
          }
        } else {
          obj = {
            name: dep.rolename,
            roleid: dep.roleid
          }
        }
      } else {
        obj = {
          name: e.node.dataRef.label,
          departmentid: e.node.dataRef.value
        }
      }
      const id = obj.departmentid ? 'departmentid' : 'roleid'
      if (this.optionMode === 'default' && this.selectList.length === 0) {
        if (this.config.optionCustom && this.config.optionCustom.length > 0 && this.config.optionCustom.some(item => item[id] === obj[id])) {
          this.selectList.splice(0, 0, obj)
        } else if (this.config.optionCustom && this.config.optionCustom.length > 0 && !this.config.optionCustom.some(item => item[id] === obj[id])) {
          this.$message.warning('不在可选范围内')
        } else {
          this.selectList.splice(0, 0, obj)
        }
      } else if (this.optionMode === 'default') {
        if (this.config.optionCustom && this.config.optionCustom.length > 0 && this.config.optionCustom.some(item => item[id] === obj[id])) {
          this.selectList.splice(0, 1, obj)
        } else if (this.config.optionCustom && this.config.optionCustom.length > 0 && !this.config.optionCustom.some(item => item[id] === obj[id])) {
          this.$message.warning('不在可选范围内')
        } else {
          this.selectList.splice(0, 1, obj)
        }
      } else {
        if (obj.departmentid && this.selectList.every(item => item.departmentid !== obj.departmentid)) {
          if (this.config.optionCustom && this.config.optionCustom.length > 0 && this.config.optionCustom.some(item => item[id] === obj[id])) {
            this.selectList.splice(this.selectList.length, 0, obj)
          } else if (this.config.optionCustom && this.config.optionCustom.length > 0 && !this.config.optionCustom.some(item => item[id] === obj[id])) {
            this.$message.warning('不在可选范围内')
          } else {
            this.selectList.splice(this.selectList.length, 0, obj)
          }
        } else if (obj.roleid && this.selectList.every(item => item.roleid !== obj.roleid)) {
          this.selectList.splice(this.selectList.length, 0, obj)
        }
      }
    },
    deleteTag (record) {
      if (this.config.mode === 'default') {
        this.selectList = []
      } else if (this.config.mode === 'multiple') {
        if (this.config.optionType !== 'department') {
          this.selectList = this.selectList.filter(item => item.roleid !== record.roleid)
        } else {
          this.selectList = this.selectList.filter(item => item.departmentid !== record.departmentid)
        }
      }
    },
    onChange (e) {
      this.queryParam.rolename = e
      this.$refs.table.refresh(true)
    },
    handleSubmit () {
      // 只保存id
      let selectValue
      let id = ''
      if (this.config.optionType === 'department') {
        selectValue = this.optionMode === 'default' ? (this.selectList[0] ? this.selectList[0].departmentid : '') : this.selectList.map(item => item.departmentid)
        id = 'departmentid'
      } else {
        selectValue = this.optionMode === 'default' ? (this.selectList[0] ? this.selectList[0].roleid : '') : this.selectList.map(item => item.roleid)
        id = 'roleid'
      }
      const option = this.config.option
      this.selectList.forEach(item => {
        if (this.config.option.every(opItem => opItem[id] !== item[id])) {
          option.push(item)
        }
      })
      this.$emit('ok', selectValue, this.config.index, this.config.conIndex, option)
      this.visible = false
    }
  }
}
</script>
