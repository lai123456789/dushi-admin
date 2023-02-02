<template>
  <div>
    <a-form :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-divider orientation="left">邮件通知默认设置</a-divider>
      <a-form-item label="邮件收件人">
        <a-input v-decorator="['info[email_receiver]', { initialValue: data.email_receiver ? data.email_receiver : '' }]" />
      </a-form-item>
      <a-form-item label="邮件抄送人">
        <a-input v-decorator="['info[email_cc]', { initialValue: data.email_cc ? data.email_cc : '' }]" />
      </a-form-item>
      <a-form-item label="邮件标题模板">
        <a-input v-decorator="['info[email_title_template]', { initialValue: data.email_title_template ? data.email_title_template : '' }]" />
      </a-form-item>
      <a-form-item label="邮件内容模板">
        <a-textarea
          v-decorator="['info[email_content_template]', { initialValue: data.email_content_template ? data.email_content_template : '' }]"
          :auto-size="{ minRows: 5, maxRows: 8 }"
        />
      </a-form-item>
      <a-divider orientation="left">站内信默认设置</a-divider>
      <a-form-item label="收件人">
        <a-input v-decorator="['info[sys_receiver]', { initialValue: data.sys_receiver ? data.sys_receiver : '' }]" />
      </a-form-item>
      <a-form-item label="抄送人">
        <a-input v-decorator="['info[sys_cc]', { initialValue: data.sys_cc ? data.sys_cc : '' }]" />
      </a-form-item>
      <a-form-item label="站内信标题">
        <a-input v-decorator="['info[sys_title_template]', { initialValue: data.sys_title_template ? data.sys_title_template : '' }]" />
      </a-form-item>
      <a-form-item label="站内信内容">
        <a-textarea
          v-decorator="['info[sys_content_template]', { initialValue: data.sys_content_template ? data.sys_content_template : '' }]"
          :auto-size="{ minRows: 5, maxRows: 8 }"
        />
      </a-form-item>
      <a-divider orientation="left">微信消息默认设置</a-divider>
      <a-form-item label="收件人">
        <a-input v-decorator="['info[wechat_receiver]', { initialValue: data.wechat_receiver ? data.wechat_receiver : '' }]" />
      </a-form-item>
      <a-form-item label="抄送人">
        <a-input v-decorator="['info[wechat_cc]', { initialValue: data.wechat_cc ? data.wechat_cc : '' }]" />
      </a-form-item>
      <a-form-item label="微信消息标题">
        <a-input v-decorator="['info[wechat_title_template]', { initialValue: data.wechat_title_template ? data.wechat_title_template : '' }]" />
      </a-form-item>
      <a-form-item label="微信消息内容">
        <a-textarea
          v-decorator="['info[wechat_content_template]', { initialValue: data.wechat_content_template ? data.wechat_content_template : '' }]"
          :auto-size="{ minRows: 5, maxRows: 8 }"
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
export default {
  props: {
    notice: {
      type: Object,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      form: this.$form.createForm(this),
      data: this.notice
    }
  }
}
</script>
