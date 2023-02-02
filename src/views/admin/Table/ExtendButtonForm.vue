<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="按钮名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', {rules: [{required: true, message: '请输入按钮名称'}], initialValue: data.name}]"/>
        </a-form-item>
        <a-form-item label="显示" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择是否显示" v-decorator="['display', {rules: [{required: true, message: '请选择是否显示'}], initialValue: data.display+''}]">
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="按钮类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['bar_sys', {rules: [{required: true}], initialValue: data.bar_sys+''}]" disabled>
            <a-select-option value="1">系统默认</a-select-option>
            <a-select-option value="0">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="按钮样式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择按钮样式" v-decorator="['style', {rules: [{required: true, message: '请选择按钮样式'}], initialValue: data.style}]">
            <a-select-option value="primary">Primary</a-select-option>
            <a-select-option value="default">Default</a-select-option>
            <a-select-option value="dashed">Dashed</a-select-option>
            <a-select-option value="danger">Danger</a-select-option>
            <a-select-option value="link">Link</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="附加属性" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button size="small" @click="codeEditor">
            <a-badge v-if="data.attribute" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
        </a-form-item>
      </a-form>
      <code-editor ref="codeEditor" @func="getCode"/>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    CodeEditor: () => import('@/views/admin/CodeEditor')
  },
  data () {
    return {
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      extendbarmenu: []
    }
  },
  methods: {
    show (config, data) {
      this.visible = true
      this.config = config
      this.data = config.record
      this.recordIndex = config.index
      this.form.resetFields()
    },
    // 打开设置附加属性
    codeEditor () {
      this.$refs.codeEditor.show({
        value: this.data.attribute ? this.data.attribute : ''
      })
    },
    // 获取附加属性
    getCode (value) {
      this.data.attribute = value
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values = Object.assign(this.data, values)
          this.visible = false
          this.$message.success('操作成功')
          if (this.config.action === 'add') {
            this.$emit('func', 'add', values)
          } else {
            this.$emit('func', 'edit', values, this.recordIndex)
          }
        }
      })
    }
  }
}
</script>
