<template>
  <a-drawer
    title="导入"
    :width="600"
    :visible="visible"
    :confirmLoading="loading"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="模板下载" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button size="small">
            <a :href="download_url">
              <a-icon type="download" />
              <span>点击下载</span>
            </a>
          </a-button>
        </a-form-item>
        <a-form-item label="导入文件" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            name="file"
            :showUploadList="false"
            :action="uploadUrl"
            accept=".csv"
            @change="handleChange"
          >
            <a-button size="small"> <a-icon type="upload" /> 选择文件 </a-button>
          </a-upload>
          {{ uploadMessage }}
        </a-form-item>

        <table style="margin: 10px 20px;">
          <tr>
            <th width="270">数据表对应字段</th>
            <th width="270">CSV数据源字段</th>
          </tr>
          <tr v-for="(value, key) in tablefield" :key="key" :value="value" >
            <td>
              <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                <a-input v-decorator="['source['+key+']', {initialValue: value.source}]" disabled="disabled"/>
              </a-form-item>
            </td>
            <td >
              <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                <a-select v-decorator="['csv['+key+']', {initialValue: value.csv}]">
                  <a-select-option v-for="(value2, key2) in csvfield" :key="key2" :value="value2.value">{{ value2.text }}</a-select-option>
                </a-select>
              </a-form-item>
            </td>
          </tr>
        </table>
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
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      tablefield: [],
      csvfield: [],
      filename: '',
      uploadMessage: '请选择要导入的文件',
      download_url: `${process.env.VUE_APP_API_BASE_URL}knowledge/Index/exportTemplate`,
      uploadUrl: `${process.env.VUE_APP_API_BASE_URL}knowledge/Index/import/?type=uploadFile`
    }
  },
  methods: {
    show () {
      this.visible = true
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.filename = this.filename
          if (this.filename && values.csv) {
            this.axios({
              url: '/knowledge/Index/import',
              data: values
            }).then((res) => {
              this.loading = false
              if (res.message) {
                this.$message.warning(res.message)
              } else {
                this.$emit('ok')
                this.visible = false
                this.$message.success(`本次成功导入数据${res.result.number}条`)
              }
            })
          } else {
            this.loading = false
            this.$message.warning('请选择字段')
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
