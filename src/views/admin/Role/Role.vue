<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="角色名称">
        <a-input v-model="queryParam.rolename" placeholder="" />
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}" >重置</a-button>
        <a-button type="primary" v-action:add icon="plus" @click="handleAdd">添加</a-button>
        <a-button icon="sort-descending" @click="handleSort">排序</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="{ field: 'listorder', order: 'ascend' }"
    >
      <span slot="status" slot-scope="text">
        <a-badge v-if="text == 0" status="success" text="启用" />
        <a-badge v-else status="error" text="禁用" />
      </span>
      <div slot="action" slot-scope="text, record">
        <a v-if="record.id != 1 && $auth('priv')" @click="handlePriv(record)">权限设置</a>
        <span v-else style="color: gray;">权限设置</span>
        <a-divider type="vertical" />
        <a-dropdown>
          <a>更多<a-icon type="down"/></a>
          <a-menu slot="overlay">
            <a-menu-item v-if="record.id != 1 && $auth('priv_synch')" @click="$message.warning('功能暂未开放')">权限同步</a-menu-item>
            <a-menu-item v-else disabled>权限同步</a-menu-item>
            <a-menu-item v-if="record.id != 1 && $auth('workflow_priv')" @click="$message.warning('功能暂未开放')">工作流权限</a-menu-item>
            <a-menu-item v-else disabled>工作流权限</a-menu-item>
            <a-menu-item @click="$message.warning('功能暂未开放')">弹屏设置</a-menu-item>
            <a-menu-item v-if="record.id != 1 && $auth('edit')" v-action:edit @click="handleEdit(record)">编辑</a-menu-item>
            <a-menu-item v-else disabled>编辑</a-menu-item>
            <a-menu-item v-if="record.id != 1 && $auth('delete')" v-action:delete @click="handleDelete(record)">删除</a-menu-item>
            <a-menu-item v-else disabled>删除</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </s-table>
    <role-form ref="roleForm" @ok="handleOk" />
    <role-priv ref="rolePriv" @ok="handleOk" />
    <role-sort ref="roleSort" @ok="handleOk"/>
  </a-card>
</template>
<script>
export default {
  components: {
    RoleForm: () => import('./RoleForm'),
    RolePriv: () => import('./RolePriv'),
    RoleSort: () => import('./RoleSort')
  },
  data () {
    return {
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        sorter: true
      }, {
        title: '排序',
        width: 80,
        dataIndex: 'listorder',
        sorter: true
      }, {
        title: '编号',
        dataIndex: 'roleid',
        width: 270,
        sorter: true
      }, {
        title: '角色名称',
        dataIndex: 'rolename',
        width: 150,
        sorter: true
      }, {
        title: '状态',
        dataIndex: 'disabled',
        scopedSlots: { customRender: 'status' },
        width: 150,
        sorter: true
      }, {
        title: '最后修改人',
        dataIndex: 'update_user',
        width: 150,
        sorter: true
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time',
        width: 150,
        sorter: true
      }, {
        title: '备注',
        dataIndex: 'description',
        width: 200,
        sorter: true
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/role/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.roleForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/role/add'
      })
    },
    handleEdit (record) {
      this.$refs.roleForm.show({
        action: 'edit',
        title: '编辑：' + record.rolename,
        url: '/admin/role/edit',
        record: record
      })
    },
    handleSort () {
      this.$refs.roleSort.show({
        action: 'sort',
        title: '排序',
        parentid: this.queryParam.parentid,
        data: ''
      })
    },
    handlePriv (record) {
      this.$refs.rolePriv.show({
        title: '权限设置：' + record.rolename,
        url: '/admin/role/priv',
        record: record
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该角色吗？',
        onOk () {
          that.axios({
            url: '/admin/role/delete',
            params: { roleid: record.roleid }
          }).then(res => {
            that.$refs.table.refresh()
          })
        }
      })
    }
  }
}
</script>
