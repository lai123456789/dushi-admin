<template>
  <a-modal
    title="发送短信"
    :visible="visible"
    :destroyOnClose="true"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="visible =!visible"
  >
    <a-form :form="form">
      <a-form-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input v-decorator="['info[number]', {initialValue: config.phone, rules: [{required: true, message: '请输入手机号码'}]}]" />
      </a-form-item>
      <a-form-item label="发送模板" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select placeholder="请选择模板" :disabled="config.disabled" v-decorator="['info[template_number]', {rules: [{ required: true, message: '请选择模板'}], initialValue:''} ]" @change="handleGetTemplate">
          <a-select-option v-for="(value, key) in template" :key="key" :value="value.value">{{ value.display }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-for="(value, key) in fieldTemplate"
        :key="key"
        :value="key"
        :label="value.label"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol">
        <a-input v-decorator="[value.name, {rules: [{required: true, message: '请输入参数'}]}]"/>
      </a-form-item>
      <a-form-item label="发送内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea :disabled="true" :autoSize="{ minRows: 5, maxRows: 10 }" v-decorator="['info[send_content]', {rules: [{required: true, message: '请输入内容'}], initialValue: content}]"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      config: {},
      content: '',
      myfilepath: '',
      template: [],
      fieldTemplate: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.axios({
        url: '/sms/template/getTemplate',
        params: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then(res => {
        this.loading = false
        this.template = res.result.data
        this.handleGetTemplate(config.template_number)
        this.form.setFieldsValue({
          'info[template_number]': config.template_number
        })
        this.$nextTick(() => {
          if (config.dynamicCom) {
            const obj = {}
            for (const i in config.dynamicCom) {
              obj['dynamicCom[' + i + ']'] = config.dynamicCom[i]
            }
            this.form.setFieldsValue(obj)
          }
        })
      })
    },
    handleGetTemplate (value) {
      const myTemplate = this.template
      for (var key in myTemplate) {
        if (myTemplate[key].value === value) {
          this.content = myTemplate[key].text
          this.form.setFieldsValue({
            'info[send_content]': this.content
          })
          var patt = /{\$[a-zA-Z0-9_]+}/g
          var res = myTemplate[key].text.match(patt)
          this.fieldTemplate = []
          for (var i in res) {
            var fname = res[i].substring(2, res[i].length - 1)
            this.fieldTemplate.push({ label: fname, name: 'dynamicCom[' + fname + ']' })
          }
        }
      }
    },
    handleOk () {
      this.loading = true
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values.dataSource = 'manual'
          this.axios({
            url: '/sms/send/send',
            data: values
          }).then((res) => {
            this.loading = false
            if (res.message) {
              this.$message.error(res.message)
            } else {
              this.$message.success('操作成功')
              this.visible = false
            }
          })
        }
      })
    }
  }
}
</script>
