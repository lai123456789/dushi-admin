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
      <a-alert message="用户名只能包含中文 、数字、大小写英文字母，英文横线 -、下划线 _" type="info" show-icon />
      <br>
      <a-alert message="密码最小长度8位，且必须同时包含字母大小写，数字，特殊字符" type="info" show-icon />
      <br>
      <a-form :form="form">
        <a-row :gutter="16">
          <a-col :span="24" style="margin-bottom: 16px;">
            <a-upload
              name="file"
              :showUploadList="false"
              :action="uploadUrl"
              @change="handleChange"
            >
              <a-button> <a-icon type="upload" /> 选择文件 </a-button>
            </a-upload>
            {{ uploadMessage }}
          </a-col>
          <a-col :span="12">数据表对应字段</a-col>
          <a-col :span="12">CSV数据源字段</a-col>
        </a-row>
        <a-row v-for="(value, key) in tablefield" :key="key" :value="value" :gutter="16">
          <a-col :span="12">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['source['+key+']', {initialValue: value.source}]" disabled="disabled"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select v-decorator="['csv['+key+']', {initialValue: value.csv}]">
                <a-select-option v-for="(value2, key2) in csvfield" :key="key2" :value="value2.value">{{ value2.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
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
      form: this.$form.createForm(this),
      tablefield: [],
      csvfield: [],
      filename: '',
      uploadMessage: '请选择要导入的文件',
      uploadUrl: `${process.env.VUE_APP_API_BASE_URL}admin/user/import/?type=uploadFile`
    }
  },
  methods: {
    show () {
      this.visible = true
      this.loading = false
      this.filename = ''
      this.tablefield = []
      this.uploadMessage = '请选择要导入的文件'
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.filename = this.filename
          if (this.filename && values.csv) {
            this.axios({
              url: '/admin/user/import',
              data: values
            }).then((res) => {
              this.loading = false
              this.$emit('ok', values)
              if (res.message) {
                this.$message.warning(res.message)
              } else {
                this.visible = false
                this.$message.success(`操作成功，导入用户 ${res.result} 个`)
              }
            })
          } else {
            this.loading = false
            this.$message.warning('请选择要导入的文件')
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
        this.tablefield = info.file.response.result.tablefield
        this.csvfield = info.file.response.result.csvfields
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
