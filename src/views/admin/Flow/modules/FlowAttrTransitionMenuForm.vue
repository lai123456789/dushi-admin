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
          <a-input v-decorator="['name', {rules: [{required: true, message: '请输入按钮名称'}], initialValue: data.name}]" />
        </a-form-item>
        <a-form-item label="按钮类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['bar_sys', {rules: [{required: true}], initialValue: data.bar_sys+''}]" disabled>
            <a-select-option value="1">系统默认</a-select-option>
            <a-select-option value="0">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="按钮样式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['style', {rules: [{required: true}], initialValue: data.style}]">
            <a-select-option value="primary">Primary</a-select-option>
            <a-select-option value="default">Default</a-select-option>
            <a-select-option value="dashed">Dashed</a-select-option>
            <a-select-option value="danger">Danger</a-select-option>
            <a-select-option value="link">Link</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="显示" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['visible', {rules: [{required: true}], initialValue: data.visible+''}]">
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="附加属性" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button type="primary" size="small" @click="codeEditor">设置</a-button>
          <a-tag color="green" style="margin-left: 8px;" v-if="data.attribute!=null && data.attribute!=''">已设置</a-tag>
          <a-tag style="margin-left: 8px;" v-else>未设置</a-tag>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :rows="8" v-decorator="['remarks', {initialValue: data.remarks}]"/>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <!-- 附加属性 -->
    <code-editor ref="codeEditor" @func="getCode"/>
  </a-drawer>
</template>
<script>
export default {
  components: { CodeEditor: () => import('@/views/admin/CodeEditor') },
  data () {
    return {
      config: {},
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {}
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
        value: this.data.attribute
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
          if (this.config.action === 'add') {
            this.$emit('ok', 'add', values)
          } else {
            this.$emit('ok', 'edit', values, this.recordIndex)
          }
          this.visible = false
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>
