<template>
  <a-drawer
    :destroyOnClose="true"
    :title="title"
    :width="600"
    :visible="visible"
    @close="visible = !visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="审核不通过的原因" >
          <a-textarea style="height: 300px;" v-decorator="['remark', {rules: [{ required: true, message: '请填写审核不通过原因'}]}]">
          </a-textarea>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">提交</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
  },
  props: {
    type: {
      type: String,
      default: '1'
    }
  },
  data () {
    return {
      loading: false,
      visible: false,
      form: this.$form.createForm(this),
      data: [],
      title: '',
      // 表头
      columns: [{
        title: '全部',
        dataIndex: 'text',
        width: 300
      } ],
      selectedRowKeys: [],
      config: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.title = `编辑: ${config.item.title}`
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.axios({
            url: this.config.url,
            params: { id: this.config.item.id, type: 'break' },
            data: Object.assign(values)
          }).then(res => {
            if (!res.message) {
              this.$message.success('操作成功')
              this.visible = false
              this.$emit('ok')
            }
          })
        }
      })
    }
  }
}
</script>
