<template>
  <div>
    <a-form :form="form" @submit="handleSubmit">
      <a-divider orientation="left" class="divider">
        留言设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">留言开关</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[message]', {initialValue: parent.setting.message === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-divider orientation="left" class="divider">
        留言引导语
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">PC端</span>
        <a-input v-decorator="['info[messageWeb]', {initialValue: parent.setting.messageWeb}]" readyonly />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">APP端</span>
        <a-input v-decorator="['info[messageApp]', {initialValue: parent.setting.messageApp}]" readyonly />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">微信端</span>
        <a-input v-decorator="['info[messageWx]', {initialValue: parent.setting.messageWx}]" readyonly />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">微博端</span>
        <a-input v-decorator="['info[messageWb]', {initialValue: parent.setting.messageWb}]" readyonly />
      </a-form-item>
      <a-button type="primary" @click="handleSubmit">保存</a-button>
    </a-form>
  </div>
</template>
<script>
export default {
  props: {
    parent: {
      type: Object,
      default () {
        return {}
      },
      required: true
    }
  },
  data () {
    return {
      labelCol: { span: 3 },
      wrapperCol: { span: 15 },
      inputWrapperCol: { span: 8 },
      form: this.$form.createForm(this)
    }
  },
  methods: {
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.parent.handleSubmit(values)
        }
      })
    }
  }
}
</script>
