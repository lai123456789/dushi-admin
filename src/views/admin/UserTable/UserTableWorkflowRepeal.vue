<template>
  <a-modal
    :destroyOnClose="true"
    title="取消"
    :width="600"
    :maskClosable="!buttonLoading"
    :closable="!buttonLoading"
    :confirmLoading="buttonLoading"
    :okText="okText"
    @cancel="visible=!visible"
    @ok="handleSubmit"
    :visible="visible" >
    <a-spin :spinning="buttonLoading">
      <a-form :form="form">
        <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="取消原因">
          <a-select show-search v-decorator="['action', { rules: [{ required: true, message: '取消原因不能为空' }] }]" @change="onChange">
            <a-select-option v-for="(myitem, myindex) in repealdata" :key="myindex" :value="myitem.name">{{ myitem.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="取消备注">
          <a-textarea :rows="6" v-decorator="['remark', { rules: [{ required: remarkFlag, message: '取消原因不能为空' }] }]"></a-textarea>
        </a-form-item>
        <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="强制取消" v-if="handleCompel === 'visit'">
          <a-checkbox v-decorator="['handleCompel', { valuePropName: 'checked' }]"></a-checkbox>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      visible: false,
      okText: '确定',
      buttonLoading: false,
      form: this.$form.createForm(this),
      config: {},
      remark: '',
      repealdata: [],
      wait: null,
      timer: null,
      loading: false,
      codeShow: false,
      handleCompel: '',
      remarkFlag: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  destroyed () {
    clearInterval(this.timer)
  },
  methods: {
    show (config) {
      if (this.userInfo.roleid === 'a942fdfe5c81e07417d5f1eed98d027a' && config.tplviewid !== '31efed9258284b93d5e77598af514be6') {
        this.codeShow = true
        this.okText = '发送短信'
      } else {
        this.codeShow = false
        this.okText = '确定'
      }
      this.visible = true
      this.config = config
      this.axios({
        url: '/admin/Workflow/getWorkflowSet',
        data: { case_id: this.config.case_id, type: 'repealdata' }
      }).then(res => {
        this.repealdata = res.result.data
        this.handleCompel = res.result.priv
      })
    },
    onChange (value) {
      if (value === '其它原因') {
        this.remarkFlag = true
      }
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.buttonLoading = true
          if (this.userInfo.roleid === 'a942fdfe5c81e07417d5f1eed98d027a' && this.config.tplviewid !== '31efed9258284b93d5e77598af514be6') {
            if (this.config.record.gdlxdh) {
              this.axios({
                url: 'crm/Api/sendCode',
                data: {
                  phone: this.config.record.gdlxdh,
                  orderNumber: this.config.record.gdbh,
                  reason: values.action
                }
              }).then(res => {
                if (res.code === 0) {
                  this.visible = false
                  this.$message.success('操作成功')
                } else {
                  this.$message.error(res.message)
                  this.buttonLoading = false
                }
              })
            } else {
              this.buttonLoading = false
              this.$message.error('工单联系电话为空，请核查工单')
            }
          } else {
            this.axios({
              url: '/admin/Workitem/processing',
              data: {
                case_id: this.config.case_id,
                handleWay: values.action,
                handleRemarks: values.remark,
                operation: 'repeal',
                handleCompel: values.handleCompel ? '1' : '0'
              }
            }).then(res => {
              this.buttonLoading = false
              if (res.code > 0) {
                this.$message.error(res.message)
              } else {
                this.visible = false
                this.$message.success('操作成功')
                this.$emit('ok')
              }
            })
          }
        }
      })
    }
  }
}
</script>
