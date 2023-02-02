<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="当前表字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择当前表字段" v-decorator="[ 'current_field', {rules: [{ required: true, message: '请选择当前表字段'}]} ]" >
            <a-select-option v-for="(value, key) in params.current_fields" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="源数据表字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择源数据表字段" v-decorator="[ 'source_field', {rules: [{ required: true, message: '请选择源数据表字段'}]} ]">
            <a-select-option v-for="(value, key) in params.source_fields" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
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
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      field: [],
      tpl: []
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
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values = Object.assign(this.data, values)
          if (this.config.action === 'add') {
            this.params.current_fields.forEach(function (arr) {
              if (arr.alias === values.current_field) {
                values.current_field_name = arr.name
              }
            })
            this.params.source_fields.forEach(function (arr) {
              if (arr.alias === values.source_field) {
                values.source_field_name = arr.name
              }
            })
            this.params.source_fillset.push(values)
          } else {
            this.$set(this.params.source_fillset, this.recordIndex, values)
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
