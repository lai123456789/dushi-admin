<template>
  <a-modal
    :destroyOnClose="true"
    title="催办"
    :width="600"
    :visible="visible"
    :maskClosable="!buttonLoading"
    :confirmLoading="buttonLoading"
    :closable="!buttonLoading"
    @cancel="visible=!visible"
    @ok="handleSubmit"
  >
    <a-form :form="form">
      <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="催办原因">
        <a-select show-search v-decorator="['action', { rules: [{ required: true, message: '催办原因不能为空' }] }]">
          <a-select-option v-for="(myitem, myindex) in urgedata" :key="myindex" :value="myitem.name">{{ myitem.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="催办备注">
        <a-textarea :rows="6" v-model="remark"></a-textarea>
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
      remark: '',
      urgedata: [],
      record: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.record = config.record
      this.axios({
        url: '/admin/Workflow/getWorkflowSet',
        data: { case_id: this.config.case_id, type: 'urgedata' }
      }).then(res => {
        this.urgedata = res.result.data
      })
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.buttonLoading = true
          this.axios({
            url: '/admin/Workitem/processing',
            data: {
              case_id: this.config.case_id,
              handleWay: values.action,
              handleRemarks: this.remark,
              operation: 'urge'
            }
          }).then(res => {
            this.buttonLoading = false
            if (res.code > 0) {
              this.$message.error(res.message)
            } else {
              const record = res.result
              const complainNum = res.result.complain_num
              const arcUrge = res.result.arc_urge
              this.visible = false
              record.complainNum = complainNum
              record.arcUrge = arcUrge
              this.$emit('ok', record)
            }
          })
        }
      })
    }
  }
}
</script>
