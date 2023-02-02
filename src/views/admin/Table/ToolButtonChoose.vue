<template>
  <div>
    <a-drawer
      :destroyOnClose="true"
      title="从模板中添加"
      :width="600"
      :visible="visible"
      @close="visible = !visible"
    >
      <a-spin :spinning="loading">
        <div>
          <a-alert message="仅显示未使用的默认按钮" banner style="margin-bottom: 8px"/>
          <a-table
            ref="table"
            rowKey="bar_alias"
            :columns="columns"
            :dataSource="unCheckBar"
            :rowSelection="rowSelection"
            size="small"
            :pagination="false"
          >
            <span slot="menu_type" slot-scope="text">
              {{ text === 'line' ? '行菜单' : '工具栏菜单' }}
            </span>
          </a-table>
        </div>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visible= !visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      unCheckBar: [],
      loading: false,
      selectedRowKeys: [],
      listArray: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      columns: [{
        title: '按钮名称',
        dataIndex: 'name'
      }, {
        title: '菜单类型',
        dataIndex: 'menu_type',
        scopedSlots: { customRender: 'menu_type' }
      }]
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.unCheckBar = config.unCheckBar
      this.listArray = config.listArray
    },
    handleSubmit () {
      const data = []
      this.listArray.forEach(item => {
        if (this.selectedRowKeys.includes(item.bar_alias)) {
          data.push(item)
        }
      })
      this.visible = false
      this.$emit('ok', data)
      this.$message.success('操作成功')
    }
  }
}
</script>
