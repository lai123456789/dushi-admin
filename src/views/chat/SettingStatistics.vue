<template>
  <div>
    <a-form :form="form" @submit="handleSubmit">
      <a-divider orientation="left" class="divider">
        一次性解决率
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">分类判断</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[solveGroup]', {initialValue: parent.setting.solveGroup === '1', valuePropName: 'checked'}]"/>&nbsp;
        开启后，一次性解决率增加对访客二次来访的咨询分类是否与第一次一致的判断。若不一致，则计为一次性解决
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">会话有效判断</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[solveValid]', {initialValue: parent.setting.solveValid === '1', valuePropName: 'checked'}]"/>&nbsp;
        开启后，一次性解决率增加对访客二次来访的咨询分类是否有效进行判断。若为无效会话，则计为一次性解决
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">统计周期</span>
        <a-input-number :min="1" style="width: 80px" v-decorator="['info[solveCycle]', {initialValue: parent.setting.solveCycle}]"/>&nbsp;小时
      </a-form-item>
      <a-divider orientation="left" class="divider">
        有效咨询设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">访客发送消息数不小于</span>
        <a-input-number :min="1" v-decorator="['info[validVisiterMessages]', {initialValue: parent.setting.validVisiterMessages}]" style="width: 80px" :parser="value => value.replace(/^(0+)|[^\d]+/g,'')" />&nbsp;条
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">客服发送消息数不少于</span>
        <a-input-number :min="1" v-decorator="['info[validServiceMessages]', {initialValue: parent.setting.validServiceMessages}]" style="width: 80px" :parser="value => value.replace(/^(0+)|[^\d]+/g,'')" />&nbsp;条
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
