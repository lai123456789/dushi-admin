<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="900"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-row :gutter="20">
          <a-col :span="12">
            <a-tabs v-model="activeKey" size="small">
              <a-tab-pane tab="用户" key="user">
                <a-row type="flex" :gutter="10" style="margin: 10px 0">
                  <a-col flex="auto">
                    <a-form-item>
                      <a-select v-model="userParamType" @change="userParam={}">
                        <a-select-option value="username">用户名</a-select-option>
                        <a-select-option value="department">部门</a-select-option>
                        <a-select-option value="role">角色</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col flex="300px">
                    <a-form-item v-if="userParamType === 'username'">
                      <a-input-search @search="(e) => { userParam.username = e; $refs.tableUser.refresh(true) }" placeholder="请输入用户名称搜索" />
                    </a-form-item>
                    <a-form-item v-else-if="userParamType === 'department'">
                      <a-input-search @search="(e) => { userParam.departmentName = e; $refs.tableUser.refresh(true) }" placeholder="请输入部门名称搜索" />
                    </a-form-item>
                    <a-form-item v-else>
                      <a-input-search @search="(e) => { userParam.roleName = e; $refs.tableUser.refresh(true) }" placeholder="请输入角色名称搜索" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <s-table
                  size="small"
                  ref="tableUser"
                  rowKey="id"
                  :columns="columnsUser"
                  :data="loadUserData"
                  :sorter="{ field: 'id', order: 'descend' }"
                >
                  <div slot="action" slot-scope="text, record">
                    <a @click="dataSelect(record,'user')">选择</a>
                  </div>
                </s-table>
              </a-tab-pane>
            </a-tabs>
          </a-col>
          <a-col :span="12">
            <a-popconfirm
              title="您确认要清空所有吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="userListData = []"
            >
              <a-button style="margin-bottom: 10px">清空</a-button>
            </a-popconfirm>
            <a-table size="small" rowKey="id" :columns="columnsFieldPriv" :dataSource="userListData" >
              <span slot="type" slot-scope="text">
                <a-badge v-if="text == 'department'" status="success" text="部门" />
                <a-badge v-else-if="text == 'user'" status="success" text="用户" />
              </span>
              <div slot="action" slot-scope="text, record">
                <a @click="handleDelete(record)">删除</a>
              </div>
            </a-table>
          </a-col>
        </a-row>
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
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      replaceFields: {
        title: 'title',
        key: 'value'
      },
      activeKey: 'user',
      userParamType: 'username',
      config: {},
      defaultFlag: false,
      visible: false,
      loading: false,
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
      form: this.$form.createForm(this),
      data: [],
      userListData: [],
      columnsFieldPriv: [{
        title: '名称',
        dataIndex: 'privdata',
        scopedSlots: { customRender: 'privdata' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 80,
        scopedSlots: { customRender: 'action' }
      }],
      columnsUser: [{
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
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      autoExpandParent: false,
      departmentArr: [],
      userParam: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.userParam = {}
      this.data = config.record
      this.activeKey = 'user'
      this.userListData = config.record || []
    },
    loadUserData (parameter) {
      return this.axios({
        url: '/admin/api/userSearch',
        params: Object.assign(parameter, this.userParam)
      }).then(res => {
        return res.result
      })
    },
    dataSelect (record, type) {
      let obj = {}
      if (type === 'user') {
        obj = {
          type: type,
          privdata: record.username,
          id: record.username
        }
      } else {
        obj = {
          type: type,
          privdata: record.value,
          id: record.value
        }
      }
      if (this.userListData.every(item => item.privdata !== obj.privdata)) {
        this.userListData.push(obj)
      }
    },
    // 删除选中用户
    handleDelete (record) {
      this.userListData = this.userListData.filter(item => item.privdata !== record.privdata)
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.visible = false
          this.$message.success('操作成功')
          this.$emit('func', this.userListData)
        }
      })
    }
  }
}
</script>
