<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="规则名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', {initialValue: data.name, message: '请输入规则名称'}]"/>
        </a-form-item>
        <a-form-item label="控件类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['type', {rules: [{required: true, message: '请选择控件类型'}], initialValue: data.type}]" @change="onChange">
            <a-select-option value="component">组件</a-select-option>
            <a-select-option value="field">字段</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="itemstype=='field'" label="选择字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            show-search
            option-filter-prop="children"
            v-decorator="['field', {rules: [{required: true}], initialValue: data.field+''}]">
            <a-select-option v-for="(value, key) in fieldData" :key="key" :value="key" :record="value">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="itemstype=='field'" label="字段规则" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['rule', {rules: [{required: true}], initialValue: data.rule}]">
            <a-select-option value="show_allow">显示必填</a-select-option>
            <a-select-option value="show_no_allow">显示不必填</a-select-option>
            <a-select-option value="show">显示</a-select-option>
            <a-select-option value="hidden">隐藏</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="占用列宽" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number :min="1" :max="24" v-decorator="['column', {rules: [{required: true}], initialValue: data.column}]"/>
        </a-form-item>
        <a-form-item label="附加属性" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :rows="12" v-decorator="['attribute', {initialValue: data.attribute}]"/>
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
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      config: {},
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      fieldData: [],
      itemstype: 'field'
    }
  },
  methods: {
    show (config, data) {
      this.visible = true
      this.config = config
      this.data = config.record
      this.recordIndex = config.index
      this.form.resetFields()
      this.itemstype = this.data.type ? this.data.type : this.itemstype
      this.fieldData = this.params.fieldData
    },
    onChange (value) {
      this.itemstype = value
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values = Object.assign(this.data, values)
          if (this.config.action === 'add') {
            this.params.wayRuleData.push(values)
          } else {
            this.$set(this.params.wayRuleData, this.recordIndex, values)
          }
          this.visible = false
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>
