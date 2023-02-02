<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="表单" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            placeholder="请选择表单"
            :show-search="true"
            option-filter-prop="children"
            v-decorator="[ 'tplview', {rules: [{ required: true, message: '请选择表单'}], initialValue: data.tplview} ]" >
            <a-select-option v-for="(value, key) in tplviewArr" :key="key" :value="value.value">
              {{ value.text }}
            </a-select-option>
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
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      tplviewArr: [],
      formview: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.data = config.record
      this.recordIndex = config.index
      this.tplviewArr = config.params.tplviewArr
      this.formview = config.params.formview
      this.form.resetFields()
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values = Object.assign(this.data, values)
          values.formCondition = []
          if (this.config.action === 'add') {
            this.formview.push(values)
          } else {
            this.$set(this.formview, this.recordIndex, values)
          }
          this.visible = false
          this.$message.success('操作成功')
          this.$emit('func', this.formview)
        }
      })
    }
  }
}
</script>
