<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="模板编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number :min="1000" style="width: 100%;" v-decorator="['info[number]', {rules: [{required: true, message: '请输入模板编号'}], initialValue: data.number}]" />
        </a-form-item>
        <a-form-item label="模板名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请输入模板名称'}], initialValue: data.name}]" />
        </a-form-item>
        <a-form-item label="CODE1" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[code1]', {initialValue: data.code1}]" />
        </a-form-item>
        <a-form-item label="CODE2" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[code2]', {initialValue: data.code2}]" />
        </a-form-item>
        <a-form-item label="CODE3" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[code3]', {initialValue: data.code3}]" />
        </a-form-item>
        <a-form-item label="模板内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autosize="{ minRows: 5, maxRows: 10 }" v-decorator="['info[content]', {rules: [{required: true, message: '请输入模板内容'}], initialValue: data.content}]"/>
        </a-form-item>
        <a-alert type="info" >
          <div slot="description">
            <div>1.模板CODE和模板内容直接从短信平台系统中复制过来，在使用文件导入的方式进行批量发送短信时，模板文件中的自定义字段1、自定义字段2、自定义字段3等会按照顺序依次替换模板中的变量{$xxxx}</div>
            <div>2.当模板CODE为空时，发送短信内容，将为模板内容</div>
            <div>3.例如：您的注册验证码为：{$code}，请于{$minute}分钟内完成注册。如非本人操作，请忽略。模板文件中的自定义字段1和自定义字段2会分别替换变量{$code}和{$minute}</div>
          </div>
        </a-alert>
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
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
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
        params: Object.assign({ id: config.record ? config.record.id : 0 })
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
          this.axios({
            url: this.config.url,
            data: Object.assign({ id: this.data.id }, values)
          }).then((res) => {
            this.loading = false
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
              this.visible = false
              this.$emit('ok', values)
            }
          })
        }
      })
    }
  }
}
</script>
