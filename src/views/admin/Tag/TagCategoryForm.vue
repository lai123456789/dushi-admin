<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :destroyOnClose="true"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="分类名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请输入分类名称'}], initialValue: data.name}]" />
        </a-form-item>
        <a-form-item label="标签类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['info[tag_type]', {rules: [{required: true, message: '请选择标签类型'}], initialValue: data.tag_type || '0'}]">
            <a-radio style="width: 100px" value="0">手动标签</a-radio>
            <a-radio style="width: 100px" value="1">自动标签</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="选择类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['info[select_type]', {rules: [{required: true, message: '请选择选择类型'}], initialValue: data.select_type || '0'}]">
            <a-radio style="width: 100px" value="0">单选</a-radio>
            <a-radio style="width: 100px" value="1">多选</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit(0)">保存</a-button>
        <a-button @click="handleSubmit(1)" v-if="config.action === 'add'">保存并添加</a-button>
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
      form: this.$form.createForm(this),
      options: [],
      data: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.data = this.config.record || {}
    },
    handleSubmit (type) {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.loading = false
            if (res.code) {
              this.$message.warning(res.message)
            } else {
              this.visible = false
              this.$emit('ok', values)
              this.$message.success('操作成功')
            }
            if (type === 1) {
              this.form.resetFields()
            }
          })
        }
      })
    }
  }
}
</script>
