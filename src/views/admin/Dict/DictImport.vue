<template>
  <a-modal
    :title="config.title"
    :width="600"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-upload v-decorator="['file']" :action="`${$store.state.env.VUE_APP_API_BASE_URL}${config.url}?type=uploadFile`" :showUploadList="false" @change="handleChange">
          <a-button> <a-icon type="upload" /> 选择文件 </a-button>
        </a-upload>
        {{ uploadMessage }}
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      filename: '',
      uploadMessage: '请选择要导入的文件'
    }
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
      this.filename = ''
      this.uploadMessage = '请选择要导入的文件'
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
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          if (this.filename) {
            this.loading = true
            this.axios({
              url: this.config.url,
              data: { filename: this.filename, parentNubmer: this.config.parentNubmer }
            }).then((res) => {
              this.loading = false
              this.$emit('ok', values)
              if (res.message) {
                this.$message.warning(res.message)
              } else {
                this.visible = false
                this.$message.success('操作成功')
                this.form.resetFields()
              }
            })
          } else {
            this.$message.warning('请选择要导入的文件')
          }
        }
      })
    }
  }
}
</script>
