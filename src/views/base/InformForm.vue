<template>
  <a-drawer
    :title="config.title"
    :destroyOnClose="true"
    :width="900"
    :visible="visible"
    @close="visible=!visible" >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[title]', {initialValue: data.title, rules: [{ required: true, message: '请输入标题'}]}]" />
        </a-form-item>
        <a-form-item label="选择用户" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button @click="getUser">
            <a-badge status="success" v-if="receiver.length > 0"/>
            <a-badge status="default" v-else/>
            选择</a-button>
          <a-input v-show="false" v-decorator="['info[receiver]', {initialValue: data.receiver, rules: [{ required: true, message: '请选择用户'}]}]" />
        </a-form-item>
        <a-form-item label="内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <quill-editor style="height: 700px;" v-decorator="['info[content]',{initialValue: data.content}]"/>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
      <inform-visit ref="informVisit" @func="getUserData"/>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    QuillEditor: () => import('@/components/Editor/QuillEditor'),
    InformVisit: () => import('./InformVisit')
  },
  data () {
    return {
      config: {},
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      visible: false,
      loading: false,
      data: {},
      form: this.$form.createForm(this),
      receiver: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.receiver = []
      this.config = config
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        values.info.receiver = this.receiver
        if (!errors) {
          this.loading = true
          this.axios({
            url: this.config.url,
            data: Object.assign(values)
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
              this.content = ''
            }
          })
        }
      })
    },
    getUser () {
      const data = []
      this.receiver.forEach(item => {
        const obj = {
          privdata: item
        }
        data.push(obj)
      })
      this.$refs.informVisit.show({
        title: '选择用户',
        record: data
      })
    },
    getUserData (data) {
      this.receiver = []
      data.forEach(item => {
        this.receiver.push(item.privdata)
      })
      this.form.setFieldsValue({
        'info[receiver]': this.receiver.toString()
      })
    }
  }
}
</script>
