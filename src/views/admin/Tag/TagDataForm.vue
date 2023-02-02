<template>
  <a-drawer
    :title="config.title"
    :destroyOnClose="true"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="标签名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            placeholder="请输入标签名称"
            v-decorator="['info[name]', {rules: [{required: true, message: '请输入标签名称'}], initialValue: data.name}]" />
        </a-form-item>
        <a-form-item label="所属分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            :disabled="true"
            v-decorator="['info[rnumber]', {rules: [{required: true, message: '请选择所属分类'}], initialValue: data.rnumber}]"
            placeholder="请选择所属分类"
          >
            <a-select-option v-for="cate in options" :key="cate.value" :value="cate.value">{{ cate.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分值" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['info[score]', {rules: [{required: true, message: '请输入分值'}], initialValue: data.score || 0}]" />
        </a-form-item>
        <a-form-item label="标签状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['info[status]', {rules: [{required: true, message: '请选择标签状态'}], initialValue: data.status || '1'}]">
            <a-radio style="width: 100px" value="1">启用</a-radio>
            <a-radio style="width: 100px" value="0">禁用</a-radio>
          </a-radio-group>
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
  components: {
    Condition: () => import('@/views/admin/Table/Condition'),
    QuerierCodemirrorInput: () => import('@/views/admin/Table/QuerierCodemirrorInput'),
    CustomCodemirror: () => import('@/views/admin/Flow/modules/CustomCodemirror'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect')
  },
  props: {
    tableid: {
      type: String,
      default: ''
    }
  },
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
      this.options = this.config.option
      this.data = this.config.record || {}
    },
    handleSubmit () {
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
              this.form.resetFields()
            }
          })
        }
      })
    }
  }
}
</script>
