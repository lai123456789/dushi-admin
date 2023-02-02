<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="用户名">
              <a-input v-model="queryParam.user_name"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="昵称">
              <a-input v-model="queryParam.nick_name"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="service_id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <span slot="state" slot-scope="text">
          <a-badge v-if="text =='online'" status="success" text="在线" />
          <a-badge v-else status="error" text="离线" />
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
      <user-form ref="userForm" @ok="handleOk" />
    </a-card>
  </div>
</template>
<script>
export default {
  components: {
    userForm: () => import('./UserForm')
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: 'ID',
        dataIndex: 'service_id',
        sorter: true
      }, {
        title: '用户名',
        dataIndex: 'user_name',
        sorter: true
      }, {
        title: '昵称',
        dataIndex: 'nick_name',
        sorter: true
      }, {
        title: '客服分组',
        dataIndex: 'groupname',
        sorter: true
      }, {
        title: '状态',
        dataIndex: 'state',
        sorter: true,
        scopedSlots: { customRender: 'state' }
      }, {
        title: '接入上限',
        dataIndex: 'connect_limit',
        sorter: true
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }],
      colLayout: {},
      sorter: { field: 'service_id', order: 'ascend' }
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/chat/user/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.userForm.show({
        action: 'add',
        title: '添加',
        url: '/chat/user/add'
      })
    },
    handleEdit (record) {
      this.$refs.userForm.show({
        action: 'edit',
        title: '编辑：' + record.user_name,
        url: '/chat/user/edit',
        record: record
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const that = this
      const table = this.$refs.table
      const id = record && record.service_id || this.selectedRowKeys
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/chat/user/delete',
            data: { service_id: id }
          }).then(res => {
            if (res.message) {
              that.$message.warning(res.message)
            } else {
              table.refresh()
            }
          })
        }
      })
    },
    changeAdvanced (tag) {
      if (tag) {
        this.advanced = !this.advanced
      }
      if (this.advanced) {
        this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
      } else {
        this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
      }
    }
  }
}
</script>
