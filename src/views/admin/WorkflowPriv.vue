<template>
  <a-drawer
    :title="config.title"
    width="700"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-table
        size="small"
        rowKey="roleid"
        :columns="columns"
        :dataSource="roleData"
        :pagination="false"
        :rowSelection="rowSelection" >
      </a-table>
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
      config: {},
      visible: false,
      loading: false,
      // 表头
      columns: [{
        title: '角色名称',
        dataIndex: 'rolename'
      }],
      roleData: [],
      rowSelection: {
        selectedRowKeys: [],
        onChange: (selectedRowKeys, selectedRows) => {
          this.rowSelection.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.data = config.record
      this.axios({
        url: this.config.url,
        params: { workflow_id: this.data.workflow_id }
      }).then(res => {
        this.loading = false
        this.roleData = res.result.data
        this.rowSelection.selectedRowKeys = res.result.priv
      })
    },
    // 保存
    handleSubmit () {
      this.loading = true
      this.axios({
        url: this.config.url,
        data: { workflow_id: this.data.workflow_id, priv: this.rowSelection.selectedRowKeys }
      }).then((res) => {
        this.visible = false
        this.loading = false
        this.$emit('ok')
        if (res.message) {
          this.$message.warning(res.message)
        } else {
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>
