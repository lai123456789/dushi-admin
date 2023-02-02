<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <div v-for="(info,index) in data" :key="info.alias">
          <a-form-item v-if="index === 'alias'" label="短信平台" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[alias]', {rules: [{required: true, message: '请输入短信平台'}], initialValue: data.alias}]" :disabled="true"/>
          </a-form-item>
          <a-form-item v-else-if="index === 'signName'" label="短信签名" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-input v-decorator="['info[signName]', {initialValue: data.signName}]"/>
          </a-form-item>
          <a-form-item v-else-if="index === 'unitprice'" label="单价/元" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-input-number :min="0" style="width: 100%;" :step="0.001" v-decorator="['info[unitprice]', {initialValue: data.unitprice}]"/>
          </a-form-item>
          <a-form-item v-else-if="index === 'codeNumber'" label="模板CODE" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select v-decorator="['info[codeNumber]', {initialValue: data.codeNumber}]">
              <a-select-option value="">--</a-select-option>
              <a-select-option value="code1">CODE1</a-select-option>
              <a-select-option value="code2">CODE2</a-select-option>
              <a-select-option value="code3">CODE3</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-else-if="index !== 'status'" :label="index" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-input v-decorator="['info['+index+']',{initialValue: data[index]}]"/>
          </a-form-item>
        </div>
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
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
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
        params: Object.assign({ alias: config.record.alias })
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
            data: Object.assign({ alias: this.data.alias }, values)
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
