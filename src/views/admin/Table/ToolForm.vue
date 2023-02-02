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
        <a-form-item label="按钮类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['bar_sys', {rules: [{required: true}], initialValue: data.bar_sys+''}]" disabled>
            <a-select-option value="1">系统默认</a-select-option>
            <a-select-option value="0">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="菜单类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            v-decorator="['menu_type', {rules: [{required: true, message: '请选择显示方案'}], initialValue: data.menu_type || 'bar'}]"
            :disabled="data.bar_sys === '1'"
          >
            <a-select-option value="bar">工具栏菜单</a-select-option>
            <a-select-option value="line">行菜单</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否显示" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['display', {rules: [{required: true, message: '请选择显示方案'}], initialValue: data.display || '0'}]">
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="附加设置" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['setting_type', {rules: [{required: true, message: '请选择附加设置'}], initialValue: data.setting_type || 'no'}]">
            <a-select-option value="no">无</a-select-option>
            <a-select-option value="import">导入模板</a-select-option>
            <a-select-option value="export">导出模板</a-select-option>
            <a-select-option value="subform">开窗选择</a-select-option>
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
      <code-editor ref="codeEditor" @func="getCode" :key="codeKey" />
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
  props: {
    myBarMenus: {
      type: Array,
      default () {
        return {}
      },
      required: false
    }
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
      codeKey: 'codeKey'
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
    codeEditor () {
      this.codeKey = this.codeKey === 'codeKey' ? 'codeKey_1' : 'codeKey'
      this.$nextTick(() => {
        this.$refs.codeEditor.show({
          value: this.data.attribute || ''
        }, 'toolForm')
      })
    },
    getCode (value) {
      this.data.attribute = value
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values = Object.assign(this.data, values)
          if (this.config.action === 'add') {
            values.barmenupriv = ''
            this.myBarMenus.push(values)
          } else {
            this.$set(this.myBarMenus, this.recordIndex, values)
          }
          this.visible = false
          this.$message.success('操作成功')
          this.$emit('ok')
        }
      })
    }
  }
}
</script>
