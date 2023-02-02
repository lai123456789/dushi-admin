<template>
  <a-drawer
    :destroyOnClose="true"
    :title="'用户' + (config.mode === 'default' ? '-单选':'-多选')"
    :width="800"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-card v-if="userListData.length > 0" style="border: 1px dashed #e8e8e8;" @mouseenter="delShow = true" @mouseleave="delShow = false">
          <a-tooltip title="清空">
            <a-icon type="delete" v-if="delShow" @click="userListData = []" style="position: absolute; top: 3px; right: 3px; color: #f5222d" />
          </a-tooltip>
          <a-row :gutter="[0,5]" type="flex">
            <a-col v-for="tag in userListData" :key="tag.username">
              <a-tag closable @close="deleteTag(tag)">{{ tag.username }}</a-tag>
            </a-col>
          </a-row>
        </a-card>
        <a-card v-else style="text-align: center; border: 1px dashed #e8e8e8; color: #7F7F7F;">暂无数据</a-card>
        <a-row type="flex" :gutter="10" style="margin: 10px 0;">
          <a-col flex="180px">
            <a-form-item>
              <a-select v-model="userParamType" @change="queryParam = {}">
                <a-select-option value="username">用户名</a-select-option>
                <a-select-option value="department">部门</a-select-option>
                <a-select-option value="role">角色</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col flex="auto">
            <a-form-item v-if="userParamType === 'username'">
              <a-input-search @search="(e) => { queryParam.username = e; $refs.table.refresh(true) }" placeholder="请输入用户名称搜索" />
            </a-form-item>
            <a-form-item v-else-if="userParamType === 'department'">
              <a-input-search @search="(e) => { queryParam.departmentName = e; $refs.table.refresh(true) }" placeholder="请输入部门名称搜索" />
            </a-form-item>
            <a-form-item v-else>
              <a-input-search @search="(e) => { queryParam.roleName = e; $refs.table.refresh(true) }" placeholder="请输入角色名称搜索" />
            </a-form-item>
          </a-col>
        </a-row>
        <s-table
          ref="table"
          size="small"
          rowKey="username"
          :columns="columns"
          :data="loadDataTable"
          :sorter="{ field: 'id', order: 'descend' }"
        >
          <span slot="action" slot-scope="index, record">
            <a href="javascript:;" @click="dataSelect(record)" :disabled="config.dataType === 'optionCustom' ? false : ( !config.optionCustom.length || (config.optionCustom.length && config.optionCustom.some(opItem => opItem.username === record.username)) ? false : true)">选择</a>
          </span>
        </s-table>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { TreeSelect } from 'ant-design-vue'
Vue.use(TreeSelect)
export default {
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      delShow: false,
      form: this.$form.createForm(this),
      data: {},
      userListData: [],
      queryParam: {}, // 搜索参数
      columns: [ {
        title: '用户名',
        dataIndex: 'username',
        sorter: true
      }, {
        title: '真实姓名',
        dataIndex: 'realname',
        sorter: true
      }, {
        title: '所属部门',
        dataIndex: 'departmentname',
        sorter: true
      }, {
        title: '所属角色',
        dataIndex: 'rolename',
        sorter: true
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 60,
        scopedSlots: { customRender: 'action' }
      }],
      userParamType: 'username'
    }
  },
  methods: {
    show (config) {
      this.config = config
      const typeMode = config.optionType + '_' + config.mode
      this.fieldid = config.fieldid
      if (this.config.dataType === 'optionCustom') {
        if (typeMode !== config.initMode) {
          this.userListData = []
        } else {
          config.optionCustom = config.optionCustom ? config.optionCustom : []
          this.userListData = config.optionCustom
        }
      } else {
        if (typeMode !== config.initMode) {
          this.userListData = []
        } else {
          if (config.mode === 'multiple') {
            this.userListData = []
            if (config.defaultValue && config.defaultValue.length) {
              config.defaultValue.forEach(item => {
                if (config.optionCustom && config.optionCustom.length && config.optionCustom.some(opItem => opItem.username === item)) {
                  const obj = {
                    username: item,
                    text: item
                  }
                  this.userListData.push(obj)
                } else {
                  const obj = {
                    username: item,
                    text: item
                  }
                  this.userListData.push(obj)
                }
              })
            }
          } else {
            this.userListData = []
            if (config.defaultValue && config.defaultValue.length && config.optionCustom && config.optionCustom.some(item => item.username === config.defaultValue)) {
              const obj = {
                username: config.defaultValue,
                text: config.defaultValue
              }
              this.userListData.push(obj)
            }
          }
        }
      }
      this.visible = true
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/api/userSearch',
        params: Object.assign(parameter, this.queryParam, { fieldid: this.fieldid })
      }).then(res => {
        return res.result
      })
    },
    dataSelect (record) {
      if (this.userListData.length === 0 && this.config.mode === 'default') {
        this.userListData.push(record)
      } else if (this.config.mode === 'default') {
        this.userListData.splice(0, 1, record)
      } else if (this.config.mode === 'multiple') {
        if (this.userListData.every(item => item.username !== record.username)) {
          this.userListData.splice(this.userListData.length, 0, record)
        }
      }
    },
    deleteTag (record) {
      if (this.config.mode === 'default') {
        this.userListData = []
      } else if (this.config.mode === 'multiple') {
        this.userListData = this.userListData.filter(item => item.username !== record.username)
      }
    },
    handleSubmit () {
      const initMode = this.config.optionType + '_' + this.config.mode
      const userListData = this.userListData.map(item => {
        const obj = {}
        obj.username = item.username
        obj.text = item.username
        return obj
      })
      let selectValue
      if (this.config.dataType === 'optionCustom') {
        selectValue = userListData
      } else {
        selectValue = this.config.mode === 'default' ? userListData[0] ? userListData[0].username : '' : userListData
      }
      if (this.config.mode === 'default') {
        this.$emit('ok', selectValue, this.config.dataType, initMode, this.config.mode)
      } else {
        this.$message.success('成功添加' + this.userListData.length + '个')
        this.$emit('ok', selectValue, this.config.dataType, initMode)
      }
      this.visible = false
    }
  }
}
</script>
