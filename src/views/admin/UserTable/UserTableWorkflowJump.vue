<template>
  <a-modal
    :destroyOnClose="true"
    title="流转"
    :width="600"
    :visible="visible"
    :maskClosable="!buttonLoading"
    :confirmLoading="buttonLoading"
    :closable="!buttonLoading"
    @cancel="visible=!visible"
    @ok="handleSubmit"
  >
    <a-form :form="form">
      <a-form-item :labelCol="{ span: 3 }" :wrapperCol="{ span: 21 }" label="活动">
        <a-select v-decorator="['event', { rules: [{ required: true, message: '活动不能为空' }] }]">
          <a-select-option v-for="event in eventData" :key="event.transition_id" :value="event.transition_id">{{ event.transition_name }}</a-select-option>
        </a-select>
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
      config: {},
      eventData: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.axios({
        url: '/admin/Centerflow/jumpFlow',
        params: { action: 'get', case_id: config.case_id }
      }).then(res => {
        this.eventData = res.result.data
      })
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.buttonLoading = true
          this.axios({
            url: '/admin/Centerflow/jumpFlow',
            params: {
              action: 'jump',
              case_id: this.config.case_id,
              transition_id: values.event
            }
          }).then(res => {
            this.buttonLoading = false
            if (res.code > 0) {
              this.$message.error(res.message)
            } else {
              this.visible = false
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
