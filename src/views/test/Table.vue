<template>
  <a-card>
    <div class="table-operator">
      <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
      <a-button v-action:delete icon="delete" @click="handleDelete" type="danger" :disabled="selectedRowKeys.length==0">批量删除</a-button>
      <a-button icon="filter" @click="handleSearch">搜索</a-button>
      <a-button icon="sync" @click="handleReset">重置</a-button>
    </div>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :rowSelection="rowSelection"
      :sorter="{ field: 'id', order: 'descend' }"
    >
      <div slot="action" slot-scope="text, record">
        <a v-if="$auth('delete')" @click="handleDelete(record)">删除</a>
        <span v-else style="color: gray;">删除</span>
      </div>
    </s-table>
    <a-drawer
      :title="config.title"
      :width="400"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form" layout="vertical">
          <a-form-item label="姓名">
            <a-input v-decorator="['info[name]', {initialValue: config.data.name, rules: [{ required: config.action!=='search', message: '请输入姓名'}]}]" />
          </a-form-item>
          <a-form-item label="电话">
            <a-input v-decorator="['info[number]', {initialValue: config.data.number}]" />
          </a-form-item>
          <a-form-item label="备注">
            <a-textarea :autoSize="{ minRows: 5 }" v-decorator="['info[remark]', {initialValue: config.data.remark}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit(true)">{{ config.action==='search'?'搜索':'保存' }}</a-button>
          <a-button @click="handleSubmit(false)">{{ config.action==='search'?'重置':'关闭' }}</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </a-card>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      config: {
        data: {}
      },
      // 搜索参数
      queryParam: { },
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '姓名',
        dataIndex: 'name',
        sorter: true
      }, {
        title: '电话',
        dataIndex: 'number',
        sorter: true
      }, {
        title: '录入人',
        dataIndex: 'operator',
        sorter: true
      }, {
        title: '录入时间',
        dataIndex: 'inputtime',
        sorter: true
      }, {
        title: '备注',
        dataIndex: 'remark',
        sorter: true
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  methods: {
    // 加载表格数据
    loadDataTable (parameter) {
      return this.axios({
        url: '/test/User/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 刷新表格
    refresh () {
      this.$refs.table.refresh()
    },
    // 搜索
    handleSearch () {
      if (this.config.action !== 'search') {
        this.form.resetFields()
      }
      this.config = {
        action: 'search',
        title: '搜索',
        data: {}
      }
      this.visible = true
    },
    // 重置
    handleReset () {
      this.queryParam = {}
      this.refresh()
    },
    // 添加
    handleAdd () {
      this.visible = true
      this.loading = true
      this.form.resetFields()
      this.config = {
        action: 'add',
        title: '添加',
        url: '/test/User/add',
        data: {}
      }
      this.axios({
        url: this.config.url
      }).then((res) => {
        this.loading = false
        this.config.data = res.result
      })
    },
    // 删除
    handleDelete (record) {
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      const me = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          me.axios({
            url: '/test/User/delete',
            data: { id: id }
          }).then(res => {
            me.$message.success('操作成功')
            table.refresh()
          })
        }
      })
    },
    // 搜索/保存数据
    handleSubmit (tag) {
      if (this.config.action === 'search') {
        if (tag) {
          // 搜索
          const { info } = this.form.getFieldsValue()
          this.queryParam = info
          this.refresh()
        } else {
          // 重置
          this.queryParam = {}
          this.refresh()
        }
        this.visible = false
      } else {
        if (tag) {
          this.form.validateFields((errors, values) => {
            if (!errors) {
              this.loading = true
              this.axios({
                url: this.config.url,
                data: Object.assign(values, { id: this.config.data.id })
              }).then((res) => {
                this.loading = false
                if (res.message) {
                  this.$message.warning(res.message)
                } else {
                  this.visible = false
                  this.refresh()
                  this.$message.success('操作成功')
                }
              })
            }
          })
        } else {
          this.visible = false
        }
      }
    }
  }
}
</script>
