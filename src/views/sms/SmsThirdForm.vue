<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="系统编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[third_number]', {rules: [{required: true, message: '请输入系统编号'}], initialValue: data.third_number}]" :disabled="config.action==='edit'"/>
        </a-form-item>
        <a-form-item label="系统名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[third_name]', {rules: [{required: true, message: '请输入系统名称'}], initialValue: data.third_name}]" />
        </a-form-item>
        <a-form-item label="回调地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[token_url]', {rules: [{required: true, message: '请输入回调地址'}], initialValue: data.token_url}]" />
        </a-form-item>
        <a-form-item label="对接状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[status]', {initialValue: data.status+''}]">
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">禁用</a-select-option>
          </a-select>
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
