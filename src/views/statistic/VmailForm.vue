<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="留言状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="留言状态" v-decorator="[ 'info[status]', {rules: [{ required: true, message: '请选择留言状态'}], initialValue: data.status} ]" >
            <a-select-option :value="0">新留言</a-select-option>
            <a-select-option :value="1">已处理</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="留言摘要" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea v-decorator="['info[message_processing]', {initialValue: data.message_processing}]" placeholder="留言摘要" :rows="4" />
        </a-form-item>
        <a-form-item label="留言处理" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea v-decorator="['info[remark]', {initialValue: data.remark}]" placeholder="留言处理" :rows="4" />
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
import 'ant-design-vue/es/cascader/style'
import { mapGetters } from 'vuex'
export default {
  components: {
    ACascader: () => import('ant-design-vue/es/cascader')
  },
  data () {
    return {
      config: {},
      imageFileList: [],
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      visible: false,
      loading: false,
      data: {},
      form: this.$form.createForm(this),
      role: [],
      department: []
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
      })
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
