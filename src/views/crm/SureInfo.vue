<template>
  <a-drawer
    :destroyOnClose="true"
    title="确认准备信息"
    :width="800"
    :visible="visible"
    @close="visible = false; $parent.$parent.formThis.pageLoading = false">
    <a-spin :spinning="false">
      <a-form :form="form">
        <a-card>
          <a-form-item label="是否领取工具" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-radio-group v-decorator="['info[sflqgj]',{initialValue: '0', rules: [{ required: true, message: '请选择'}]}]">
              <a-radio value="0">是</a-radio>
              <a-radio value="1">否</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="是否领取配件" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-radio-group v-decorator="['info[sflqpj]',{initialValue: '0', rules: [{ required: true, message: '请选择'}]}]">
              <a-radio value="0">是</a-radio>
              <a-radio value="1">否</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="是否准备所需资料" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-radio-group v-decorator="['info[sfzbsxzl]',{initialValue: '0', rules: [{ required: true, message: '请选择'}]}]">
              <a-radio value="0">是</a-radio>
              <a-radio value="1">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-card>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="submit">提交</a-button>
        <a-button @click="visible=!visible; $parent.$parent.formThis.pageLoading = false">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      visible: true,
      config: '',
      parent: '',
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this)
    }
  },
  methods: {
    show (config) {
      console.log('config', config)
      this.config = config
      this.visible = true
      this.parent = config.parent
    },
    submit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          const formData = {
            confirm: true,
            extFormData: values.info
          }
          this.visible = false
          this.parent.handleSubmit(formData)
        }
      })
    }
  }
}
</script>
