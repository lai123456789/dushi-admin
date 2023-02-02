<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="库所名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 8, maxRows: 8 }" v-decorator="['info[place_name]', {initialValue: data.place_name, rules: [{ required: true, message: '请输入库所名称'}]}]" placeholder="一行一个" />
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 3, maxRows: 6 }" v-decorator="['info[place_desc]', {initialValue: data.place_desc}]" />
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
  data () {
    return {
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      data: {},
      form: this.$form.createForm(this)
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: Object.assign({ place_id: config.record ? config.record.place_id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          if (this.config.action === 'add') {
            values.info.workflow_id = this.config.workflow_id
          }
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { place_id: this.data.place_id })
          }).then((res) => {
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
