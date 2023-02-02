<template>
  <a-drawer
    title="从其他数据表中添加字段"
    width="700"
    placement="right"
    :closable="false"
    :destroyOnClose="true"
    :visible="visible"
    @close="onClose"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item :wrapperCol="wrapperCol">
          <a-cascader
            style="width: 100%;"
            :options="table_field"
            :show-search="{ filter }"
            :value="table_value"
            placeholder="请选择源数据表"
            @change="sourceChange" />
        </a-form-item>
        <a-form-item>
          <a-table
            :columns="columns"
            :dataSource="source_fields"
            rowKey="id"
            size="small"
            :loading="sourceLoading"
            :pagination="false"
            :row-selection="{ selectedRows: selectedRows, onChange: onSelectChange }"
          >
          </a-table>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit" :disabled="checkdone">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  name: 'FiledOpreation',
  data () {
    return {
      visible: false,
      form: this.$form.createForm(this),
      fieldWidth: '',
      wrapperCol: { span: 24 },
      loading: false,
      table_field: [],
      checkdone: true,
      columns: [{
        title: '显示名称',
        dataIndex: 'name'
      }, {
        title: '系统名称',
        dataIndex: 'alias'
      }, {
        title: 'UI组件',
        dataIndex: 'formtype'
      }, {
        title: '字段类型',
        dataIndex: 'fieldtype'
      }, {
        title: '字段长度',
        dataIndex: 'fieldlength'
      }],
      source_fields: [ ],
      sourceLoading: false,
      selectedRows: [],
      table_value: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.form.resetFields()
      this.checkdone = true
      this.source_fields = []
      this.table_value = []
      this.selectedRows = []
      this.axios({
        url: this.config.url,
        data: Object.assign({ tableid: config.tableid ? config.tableid : 0, parent_number: [], fieldid: config.record ? config.record.fieldid : 0 })
      }).then((res) => {
        this.table_field = res.result.table_field
      })
    },
    filter (inputValue, path) {
      return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    onClose () {
      this.visible = false
    },
    sourceChange (value) {
      this.table_value = value
      this.sourceLoading = true
      this.axios({
        url: '/admin/field/getSourceOptions',
        params: Object.assign({ source_tableid: value[1], current_tableid: this.config.tableid, virtual: 0 })
      }).then(res => {
        if (res.code === 0) {
          this.source_fields = res.result.source_fields
          this.sourceLoading = false
          this.checkdone = false
        }
      })
    },
    // 拿到某个数据表
    getField (e) {
      console.log('Selected', e)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
    },
    handleSubmit () {
      const fieldId = []
      for (const k in this.selectedRows) {
        fieldId.push(this.selectedRows[k].fieldid)
      }
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: '/admin/field/addFromOther',
            data: { tableid: this.config.tableid, id: fieldId }
          }).then((res) => {
            this.$message.success(res.message)
            this.loading = false
            this.checkdone = true
            this.source_fields = []
            this.table_value = []
            this.visible = false
            this.$emit('ok')
          })
        }
      })
    }
  }
}
</script>
