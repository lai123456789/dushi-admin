<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item label="上级菜单" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-cascader v-decorator="['info[parentid]']" placeholder="作为一级菜单" :options="options" changeOnSelect/>
        </a-form-item>
        <a-form-item label="菜单名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请填写菜单名称'}], initialValue: record.name }]"/>
        </a-form-item>
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
  name: 'TplViewDataMenu',
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      form: this.$form.createForm(this),
      options: [],
      data: {},
      record: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.record = config.record
      this.axios({
        url: this.config.url
      }).then((res) => {
        this.loading = false
        this.options = res.result || []
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.visible = false
          values.info.parentid = values.info.parentid || []
          if (this.record.variable === 'table_flow_list') {
            values.view = 'UserTable/UserTableWorkflow'
          }
          this.axios({
            url: this.config.submitUrl,
            data: Object.assign(values, { tplviewid: this.record.uid })
          }).then(res => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
            }
          })
        }
      })
    }
  }
}
</script>
