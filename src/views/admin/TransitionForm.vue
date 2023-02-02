<template>
  <a-drawer
    :title="config.title"
    :width="700"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-divider orientation="left">基础信息</a-divider>
        <a-form-item label="变迁名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[transition_name]', {initialValue: data.transition_name, rules: [{ required: true, message: '请输入变迁名称'}]}]" />
        </a-form-item>
        <a-form-item label="视图模板" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择视图模板" v-decorator="[ 'info[setting][tplviewid]', {rules: [{ required: true, message: '请选择视图模板'}], initialValue: setting.tplviewid} ]" >
            <a-select-option v-for="(value, key) in table_form_view" :key="key" :value="value.value">{{ value.display }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            触发器类型
            <a-tooltip
              title="自动：任务一触发就被启用，而不是放在队列中，例如来自广州的客户，当合同金额大于20万由部门经理亲自审批。
              时间：启用的任务实例由一个时钟触发。比如当到预定义的时间后，任务就被执行。
              用户：任务由人类参与者触发，例如合同审批、文章发布审核、信息浏览等">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-radio-group v-decorator="['info[transition_trigger]',{initialValue: data.transition_trigger}]">
            <a-radio value="user">用户</a-radio>
            <a-radio value="time">时间</a-radio>
            <a-radio value="automatic">自动</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            时间设置
            <a-tooltip
              title="当指定时间到达时，变迁将自动发射。">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-form-item label="时间类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-radio-group v-decorator="['info[trigger_time]',{initialValue: data.trigger_time}]">
              <a-radio value="relative">相对时间</a-radio>
              <a-radio value="absolute">绝对时间</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="相对时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-row :gutter="8">
              <a-col :span="6"><a-form-item><a-input v-decorator="['info[time_d]', {initialValue: data.time_d}]" /></a-form-item></a-col>
              <a-col :span="2"><p>天</p></a-col>
              <a-col :span="6"><a-form-item><a-input v-decorator="['info[time_h]', {initialValue: data.time_h}]" /></a-form-item></a-col>
              <a-col :span="2"><p>时</p></a-col>
              <a-col :span="6"><a-form-item><a-input v-decorator="['info[time_i]', {initialValue: data.time_i}]" /></a-form-item></a-col>
              <a-col :span="2"><p>分</p></a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="绝对时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-date-picker showTime placeholder="选择时间" :defaultValue="moment('2020-03-26 16:37:45', 'YYYY-MM-DD HH:mm')" />
          </a-form-item>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            办理方式模板
            <a-tooltip
              title="{TRANSITION_ACTION}: 变迁操作 {HANDLE_WAY}: 工单办理方式 {系统名称}: 字段值">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input v-decorator="['info[setting][template_action]', {initialValue: setting.template_action}]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            办理备注模板
            <a-tooltip
              title="{CURRENT_USER}: 当前变迁处理人
              {CASE_NAME}: 流程名称
              {START_DATE}: 流程创建时间
              {CASE_CREATOR}: 流程创建人
              {WORKFLOW_NAME}: 所属工作流名称
              {TRANSITION_NAME}: 变迁名称
              {CURRENT_DATE}: 当前日期
              {CURRENT_TIME}: 当前时间
              {CURRENT_DATETIME}: 当前日期时间
              {HANDLE_REMARKS}: 工单办理备注
              {系统名称}: 字段值">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[setting][template_description]',{initialValue: setting.template_description}]" />
        </a-form-item>
        <a-divider orientation="left">提醒设置</a-divider>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            邮件标题模板
            <a-tooltip
              title="{CURRENT_USER}: 当前变迁处理人
              {CASE_NAME}: 流程名称
              {START_DATE}: 流程创建时间
              {CASE_CREATOR}: 流程创建人
              {WORKFLOW_NAME}: 所属工作流名称
              {TRANSITION_NAME}: 变迁名称
              {CURRENT_DATE}: 当前日期
              {CURRENT_TIME}: 当前时间
              {CURRENT_DATETIME}: 当前日期时间
              {系统名称}: 字段值">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input v-decorator="['info[setting][template_email_title]', {initialValue: setting.template_email_title}]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            邮件内容模板
            <a-tooltip
              title="{CURRENT_USER}: 当前变迁处理人
              {CASE_NAME}: 流程名称
              {START_DATE}: 流程创建时间
              {CASE_CREATOR}: 流程创建人
              {WORKFLOW_NAME}: 所属工作流名称
              {TRANSITION_NAME}: 变迁名称
              {CURRENT_DATE}: 当前日期
              {CURRENT_TIME}: 当前时间
              {CURRENT_DATETIME}: 当前日期时间
              {系统名称}: 字段值">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[setting][template_email_content]',{initialValue: setting.template_email_content}]" />
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <quill-editor style="height: 200px" v-decorator="['info[workflow_desc]',{initialValue: data.workflow_desc}]"/>
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
    QuillEditor: () => import('@/components/Editor/QuillEditor')
  },
  data () {
    return {
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      data: {},
      form: this.$form.createForm(this),
      table_form_view: [],
      setting: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: Object.assign({ transition_id: config.record ? config.record.transition_id : 0, workflow_id: this.config.workflow_id })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
        this.table_form_view = res.result.table_form_view
        this.setting = res.result.setting
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.info.workflow_id = this.config.workflow_id
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { place_id: this.data.place_id })
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
