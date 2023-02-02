<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
    :destroyOnClose="true"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="上级分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-cascader
            changeOnSelect
            :fieldNames="{ label: 'catname', value: 'id', children: 'children' }"
            v-decorator="['info[parentid]', {rules: [{required: true, message: '请选择上级分类'}], initialValue: data.parentid}]"
            :options="options"
            :allowClear="false"
          />
        </a-form-item>
        <a-form-item label="分类名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[catname]', {rules: [{required: true, message: '请输入分类名称'}], initialValue: data.catname}]" />
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['info[listorder]', {rules: [{required: true, message: '请输入排序'}], initialValue: this.config.edit ? data.listorder : 0}]" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
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
      form: this.$form.createForm(this),
      options: [],
      data: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.data = []
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: config.record.id })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.options = res.result.option
        if (this.config.edit) {
          this.data = res.result.data
        } else {
          this.data.parentid = res.result.data.parentid
        }
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { id: this.config.edit ? this.data.id : 0 })
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
