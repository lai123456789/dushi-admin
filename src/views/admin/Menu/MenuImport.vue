<template>
  <a-modal
    title="导入"
    :width="640"
    :visible="visible"
    :confirmLoading="loading"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload v-decorator="['file']" :action="`${$store.state.env.VUE_APP_API_BASE_URL}admin/menu/import/?type=uploadFile`" :showUploadList="false" @change="handleChange">
            <a-button> <a-icon type="upload" /> 选择文件 </a-button>
          </a-upload>
          {{ uploadMessage }}
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },
      visible: false,
      loading: false,
      parentid: '',
      form: this.$form.createForm(this),
      filename: '',
      uploadMessage: '请选择要导入的文件'
    }
  },
  methods: {
    show () {
      this.visible = true
      this.loading = false
      this.filename = ''
      this.uploadMessage = '请选择要导入的文件'
      this.parentid = ''
      if (this.$parent.$parent.breadcrumb.length) {
        this.parentid = this.$parent.$parent.breadcrumb[this.$parent.$parent.breadcrumb.length - 1]['menuid']
      }
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          if (this.filename) {
            this.axios({
              url: '/admin/menu/import',
              data: { filename: this.filename, parentid: this.parentid }
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
          } else {
            this.loading = false
            this.$message.warning('请选择文件')
          }
        }
      })
    },
    handleCancel () {
      this.visible = false
    },
    handleChange (info) {
      this.loading = true
      if (info.file.status === 'uploading') {
        this.uploadMessage = '文件【' + info.file.name + '】上传中...'
      } else if (info.file.status === 'done') {
        this.loading = false
        this.uploadMessage = '文件【' + info.file.name + '】上传完成'
        this.filename = info.file.response.result.filename
      } else if (info.file.status === 'error') {
        this.loading = false
        this.uploadMessage = '文件【' + info.file.name + '】上传失败'
        this.filename = ''
      }
    }
  }
}
</script>
