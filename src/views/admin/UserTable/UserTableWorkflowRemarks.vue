<template>
  <a-modal
    :destroyOnClose="true"
    title="备注"
    :width="600"
    :visible="visible"
    :maskClosable="!buttonLoading"
    :confirmLoading="buttonLoading"
    :closable="!buttonLoading"
    @cancel="visible=!visible"
    @ok="handleSubmit"
  >
    <a-form :form="form">
      <a-form-item :labelCol="{ span: 3 }" :wrapperCol="{ span: 21 }" label="备注">
        <a-textarea :rows="6" v-decorator="['remark', { rules: [{ required: true, message: '备注不能为空' }] }]"></a-textarea>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      buttonLoading: false,
      form: this.$form.createForm(this),
      config: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.buttonLoading = true
          this.axios({
            url: '/admin/Workitem/processing',
            data: {
              case_id: this.config.case_id,
              handleWay: '备注',
              handleRemarks: values.remark,
              operation: 'log'
            }
          }).then(res => {
            this.visible = false
            this.buttonLoading = false
            if (res.code > 0) {
              this.$message.error(res.message)
            } else {
              this.$message.success('操作成功')
              this.$emit('ok')
            }
          })
        }
      })
    }
  }
}
</script>
