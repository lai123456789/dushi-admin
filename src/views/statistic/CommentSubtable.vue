<template>
  <a-card>
    <a-drawer
      :title="config.title"
      :width="400"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form" layout="vertical">
          <a-form-item label="按键值">
            <a-input-number style="width: 100%;" v-decorator="['info[key]', { initialValue: this.config.data.key, rules: [{ required: true, message: '按键值不能为空' }] }]" />
          </a-form-item>
          <a-form-item label="显示值" v-if="config.action !== 'edit'">
            <a-input v-decorator="['info[value]', { initialValue: this.config.data.value, rules: [{ required: true, message: '显示值不能为空' }] }]" />
          </a-form-item>
          <a-form-item label="客户满意度">
            <a-select v-decorator="['info[type]', { initialValue: this.config.data.type, rules: [{ required: true, message: '客户满意度不能为空' }] }]">
              <a-select-option value="1">是</a-select-option>
              <a-select-option value="0">否</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="质检数据(不满意)">
            <a-select v-decorator="['info[quality_type]', { initialValue: this.config.data.quality_type, rules: [{ required: true, message: '质检数据(不满意)不能为空' }] }]">
              <a-select-option value="1">是</a-select-option>
              <a-select-option value="0">否</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit(true)">保存</a-button>
          <a-button @click="handleSubmit(false)">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <div class="table-operator">
      <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
    </div>
    <s-table
      ref="table"
      size="small"
      rowKey="key"
      :columns="columns"
      :data="loadDataTable"
      :sorter="sorter"
    >
      <div slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a v-if="$auth('delete')" @click="handleDelete(record)">删除</a>
        <span v-else style="color: gray;">删除</span>
      </div>
    </s-table>
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
      columns: [{
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' },
        width: 150
      }, {
        title: '按键值',
        dataIndex: 'key',
        sorter: false
      }, {
        title: '显示值',
        dataIndex: 'value',
        sorter: false
      }, {
        title: '客户满意度',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' },
        sorter: false,
        customRender: (text) => { if (parseInt(text)) { return '是' } else { return '否' } }
      }, {
        title: '质检数据(不满意)',
        dataIndex: 'quality_type',
        scopedSlots: { customRender: 'quality_type' },
        sorter: false,
        customRender: (text) => { if (parseInt(text)) { return '是' } else { return '否' } }
      }],
      sorter: { field: 'key', order: 'ascend' }
    }
  },
  methods: {
    // 加载表格数据
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/comment/subtable',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 刷新表格
    refresh () {
      this.$refs.table.refresh()
    },
    // 添加
    handleAdd () {
      this.visible = true
      this.loading = true
      this.form.resetFields()
      this.config = {
        action: 'add',
        title: '添加',
        url: '/statistic/comment/subtableAdd',
        data: {}
      }
      this.axios({
        url: this.config.url
      }).then((res) => {
        this.loading = false
        this.config.data = res.result.data
      })
    },
    // 编辑
    handleEdit (record) {
      this.visible = true
      this.loading = true
      const me = this
      this.form.resetFields()
      this.config = {
        action: 'edit',
        title: '编辑：' + record.value,
        url: '/statistic/comment/subtableEdit',
        record: record,
        data: {}
      }
      this.axios({
        url: this.config.url,
        params: { key: record.key }
      }).then((res) => {
        me.loading = false
        this.config.data = res.result.data
      })
    },
    // 删除
    handleDelete (record) {
      const table = this.$refs.table
      const me = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          me.axios({
            url: '/statistic/comment/subtableDel',
            data: { key: record.key }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    // 保存数据
    handleSubmit (tag) {
      if (tag) {
        this.form.validateFields((errors, values) => {
          if (!errors) {
            this.loading = true
            this.axios({
              url: this.config.url,
              data: Object.assign(values, { key: this.config.data.key })
            }).then((res) => {
              this.visible = false
              this.loading = false
              if (res.message) {
                this.$message.warning(res.message)
              } else {
                this.$message.success('操作成功')
                this.$refs.table.refresh()
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
</script>
