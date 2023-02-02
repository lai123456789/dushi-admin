<template>
  <div>
    <a-form :form="form" @submit="handleSubmit">
      <a-divider orientation="left" class="divider">
        系统自动邀请
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">PC端</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[commentWeb]', {initialValue: parent.setting.commentWeb === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">APP端</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[commentApp]', {initialValue: parent.setting.commentApp === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">微信端</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[commentWx]', {initialValue: parent.setting.commentWx === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">微博端</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[commentWb]', {initialValue: parent.setting.commentWb === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-divider orientation="left" class="divider">
        客服邀评
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">客服邀评</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[commentEnabled]', {initialValue: parent.setting.commentEnabled === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
        <span slot="label">邀请引导语</span>
        <a-input readyonly />
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
