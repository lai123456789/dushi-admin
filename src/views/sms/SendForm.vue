<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    :destroyOnClose="true"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="号码来源" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['dataSource', {initialValue: dataSource}]" name="radioGroup" @change="onChange">
            <a-radio value="manual">
              手动输入
            </a-radio>
            <a-radio value="uploadfile">
              文件导入
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="dataSource==='manual' || dataSource ===''" label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-row :gutter="5">
            <a-col :span="20">
              <a-input v-decorator="['info[number]', {initialValue: number, rules: [{required: true, message: '请输入手机号码'}]}]" />
            </a-col>
            <a-col :span="2">
              <a-button @click="openDirectories">
                选择
              </a-button>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item v-if="dataSource==='uploadfile'" label="选择文件" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            name="file"
            :showUploadList="false"
            :action="uploadUrl"
            @change="handleChange"
          >
            <a-button> 选择文件 </a-button>
          </a-upload>
          {{ uploadMessage }}
          <a-button @click="downloadFile" type="link">模板下载</a-button>
          <div>
            <a-alert type="success" >
              <div slot="description">
                <div>1.点击”模板下载”按钮，在下载好的模板中编辑您要发送你的内容。</div>
                <div>2.模板中的自定义字段1、自定义字段2、自定义字段3等会按照顺序依次替换模板中的变量{$xxxx}。</div>
                <div>3.单次导入数据量如果大于10000，请分多次导入。</div>
              </div>
            </a-alert>
          </div>
        </a-form-item>
        <a-form-item label="发送模板" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择模板" v-decorator="[ 'info[template_number]', {rules: [{ required: true, message: '请选择模板'}], initialValue: 'custom'} ]" @change="handleGetTemplate">
            <a-select-option v-for="(value, key) in template" :key="key" :value="value.value">{{ value.display }}</a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="dataSource==='manual' || dataSource ===''">
          <a-form-item
            v-for="(value, key) in fieldTemplate"
            :key="key"
            :value="key"
            :label="value.label"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol">
            <a-input v-decorator="[value.name, {rules: [{required: true, message: '请输入参数'}]}]"/>
          </a-form-item>
        </template>
        <a-form-item label="发送内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :disabled="tempTag !== 'custom'" :autoSize="{ minRows: 5, maxRows: 10 }" v-decorator="['info[send_content]', {rules: [{required: true, message: '请输入内容'}], initialValue: content}]"/>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit" :disabled="saveFlag">发送</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <send-directories ref="sendDirectories" @ok="getPhone"/>
  </a-drawer>
</template>
<script>
export default {
  components: {
    SendDirectories: () => import('./SendDirectories')
  },
  data () {
    return {
      config: {},
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      template: [],
      dataSource: 'manual',
      number: '',
      tempTag: '',
      myfilepath: '',
      content: '',
      fieldTemplate: [],
      uploadMessage: '请选择要导入的文件',
      uploadUrl: `${process.env.VUE_APP_API_BASE_URL}sms/send/importFile`,
      download_url: `${process.env.VUE_APP_API_BASE_URL}sms/send/exportTemplate`,
      saveFlag: false
    }
  },
  methods: {
    onChange (e) {
      this.dataSource = e.target.value
      if (e.target.value === 'uploadfile') {
        this.saveFlag = !this.myfilepath
      } else {
        this.saveFlag = false
      }
    },
    show (config) {
      this.number = config.number
      this.visible = true
      this.loading = true
      this.config = config
      this.uploadMessage = '请选择要导入的文件'
      this.dataSource = 'manual'
      this.fieldTemplate = []
      this.content = ''
      this.tempTag = 'custom'
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.template = res.result.data
      })
    },
    handleGetTemplate (value) {
      this.tempTag = value
      const myTemplate = this.template
      for (var key in myTemplate) {
        if (myTemplate[key].value === value) {
          this.content = myTemplate[key].text
          this.form.setFieldsValue({
            'info[send_content]': this.content
          })
          var patt = /{\$[a-zA-Z0-9_]+}/g
          var res = myTemplate[key].text.match(patt)
          this.fieldTemplate = []
          for (var i in res) {
            var fname = res[i].substring(2, res[i].length - 1)
            this.fieldTemplate.push({ label: fname, name: 'dynamicCom[' + fname + ']' })
          }
        }
      }
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: '/sms/send/send?filename=' + this.myfilepath + '&fieldTemplate=' + this.fieldTemplate,
            data: values
          }).then((res) => {
            this.loading = false
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
              this.visible = false
              this.$emit('ok', values)
            }
          })
        }
      })
    },
    handleChange (info) {
      this.loading = true
      if (info.file.status === 'uploading') {
        this.uploadMessage = '文件【' + info.file.name + '】上传中...'
      } else if (info.file.status === 'done') {
        this.loading = false
        this.uploadMessage = '文件【' + info.file.name + '】上传完成'
        this.filename = info.file.response.filename
        this.myfilepath = info.file.response.filepath
        this.saveFlag = false
      } else if (info.file.status === 'error') {
        this.loading = false
        this.uploadMessage = '文件【' + info.file.name + '】上传失败'
        this.filename = ''
      }
    },
    openDirectories () {
      let number = []
      if (this.form.getFieldsValue().info.number) {
        number = this.form.getFieldsValue().info.number.split(',')
      }
      this.$refs.sendDirectories.show({
        title: '通讯录',
        number: number
      })
    },
    downloadFile () {
      window.open(this.download_url)
    },
    getPhone (Data) {
      this.number = Data
    }
  }
}
</script>
