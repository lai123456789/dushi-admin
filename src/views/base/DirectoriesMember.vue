<template>
  <div>
    <a-drawer
      :title="config.title"
      :width="600"
      :destroyOnClose="true"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="所属分组" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              :fieldNames="{ label: 'name', value: 'number', children: 'children' }"
              v-decorator="['info[group_number]', {initialValue: data.path}]"
              placeholder="请选择所属分组"
              :options="options"
              changeOnSelect/>
          </a-form-item>
          <a-form-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请输入姓名'}], initialValue: data.name}]" />
          </a-form-item>
          <a-form-item label="手机" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[phone_number]', {rules: [{required: true, message: '请输入手机号码'}, { validator: checkPhone }], initialValue: data.phone_number}]" />
          </a-form-item>
          <a-form-item label="电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[telephone_number]', { initialValue: data.telephone_number}]" />
          </a-form-item>
          <a-form-item label="职务" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[position]', { initialValue: data.position}]" />
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 3, maxRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visible=!visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      config: {},
      data: {},
      options: [],
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this)
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.data = {}
      this.axios({
        url: config.url,
        params: { action: 'get', number: config.group_number }
      }).then(res => {
        this.data.path = res.result.path
        this.options = res.result.options
      })
      if (config.action === 'edit') {
        this.data = config.record
      }
    },
    // 确认手机号码
    checkPhone (rule, value, callback) {
      const string = '请输入正确的手机号码'
      const reg = /^[0-9]*$/
      if (!reg.test(value)) {
        callback(string)
      }
      callback()
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: this.config.url,
            params: { action: 'submit' },
            data: Object.assign(values, { id: this.data.id })
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
