<template>
  <div>
    <a-drawer
      :title="config.title"
      :width="600"
      :visible="visible"
      :destroyOnClose="true"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="上级分组" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              :fieldNames="{ label: 'name', value: 'number', children: 'children' }"
              v-decorator="['info[parent_number]', {initialValue: data.path}]"
              placeholder="作为一级分组"
              :options="options"
              changeOnSelect/>
          </a-form-item>
          <a-form-item label="分组名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请输入分组名称'}], initialValue: data.name}]" />
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
        url: this.config.url,
        params: { action: 'get', number: config.record.number }
      }).then(res => {
        this.options = res.result.options
        this.data.path = res.result.path
      })
      if (config.action === 'edit') {
        this.data = config.record
      }
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
            this.$emit('ok', '')
            this.$message.success('操作成功')
          })
        }
      })
    }
  }
}
</script>
