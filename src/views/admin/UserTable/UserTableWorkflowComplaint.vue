<template>
  <a-drawer
    :destroyOnClose="true"
    title="转办"
    :width="900"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }" label="备注" style="margin-top: 10px" v-if="config.page !== 'vipWorkOrder'">
          <a-textarea :rows="3" v-decorator="['remark', { rules: [{ required: true, message: '备注不能为空' }] }]" />
        </a-form-item>
        <a-form-item label="转办给" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }" :required="true">
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
        </a-form-item>
        <a-row type="flex" style="margin: 10px 0;">
          <a-col flex="180px" style="padding-right: 10px">
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
            <a href="javascript:;" @click="dataSelect(record)">选择</a>
          </span>
        </s-table>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      config: {},
      userListData: [],
      scrollStats: true,
      delShow: false,
      parameter: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      queryParam: {}, // 搜索参数
      columns: [{
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }, {
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
      }],
      columnsDepartment: [{
        title: '部门',
        dataIndex: 'text'
      }],
      userParamType: 'username'
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/Centerflow/transferUsers',
        params: Object.assign(parameter, this.queryParam, { case_id: this.config.case_id })
      }).then(res => {
        this.config.mode = res.result.selectMode || this.config.mode || 'multiple'
        return res.result
      })
    },
    dataSelect (record) {
      if (this.userListData.length === 0 && this.config.mode === 'default') {
        this.userListData.push(record)
      } else if (this.config.mode === 'default') {
        this.userListData.splice(0, 1, record)
      } else if (this.config.mode === 'multiple') {
        this.userListData.splice(this.userListData.length, 0, record)
        this.userListData = [...new Set(this.userListData)]
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
      if (this.userListData.length) {
        if (this.config.page === 'vipWorkOrder') {
          this.$emit('ok', {
            case_number: this.config.case_number,
            userData: this.userListData[0]
          })
          this.visible = false
          return false
        }
        this.form.validateFields((errors, values) => {
          if (!errors) {
            this.loading = true
            const user = this.userListData.map(item => item.username).toString()
            const obj = {
              operation: 'change_user',
              case_id: this.config.case_id,
              handleRemarks: values.remark,
              handleWay: '转办',
              parameter: { 'assign_user': user }
            }
            this.axios({
              url: '/admin/Workitem/processing',
              data: obj
            }).then(res => {
              if (res.code > 0) {
                this.$message.error(res.message)
              } else {
                this.visible = false
                this.loading = false
                this.$message.success('操作成功')
                this.$emit('ok')
              }
            })
          }
        })
      } else {
        this.$message.error('请选择被转办人')
      }
    }
  }
}
</script>
