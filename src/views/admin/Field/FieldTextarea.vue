<template>
  <a-form :form="form">
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span slot="label">
        允许输入长度
        <a-tooltip>
          <a-icon type="question-circle"/>
          <div slot="title">
            <div>1、最小输入长度不得小于1，为空表示不限制最小输入长度。</div>
            <div>2、最大输入长度不能小于最小输入长度，为空表示不限制最大输入长度。</div>
          </div>
        </a-tooltip>
      </span>
      <a-row>
        <a-col :span="4"><a-form-item><a-input-number style="width: 100%" @change="(e)=>{minLength = e}" :min="1" v-decorator="['setting[attribute][minLength]', {initialValue: data.attribute.minLength || ''}]"/></a-form-item></a-col>
        <a-col :span="1" style="text-align:center;">至</a-col>
        <a-col :span="4"><a-form-item><a-input-number style="width: 100%" :min="minLength+1" v-decorator="['setting[attribute][maxLength]', {initialValue: data.attribute.maxLength || ''}]"/></a-form-item></a-col>
      </a-row>
    </a-form-item>
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span slot="label">
        行数范围
        <a-tooltip placement="top">
          <template slot="title">
            <span>设置多行文本在表单视图中的所占行数。超过最大行数时，出现内部滚动条</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-row :gutter="8">
        <a-col :span="4">
          <a-form-item>
            <a-input-number
              @change="(num) => { data.attribute.minRows = num }"
              :min="1"
              v-decorator="['setting[attribute][minRows]', { initialValue: parseInt(data.attribute.minRows) || 2, rules: [{ required: true, message: '最小行数范围不能为空' }] }]"/>
          </a-form-item>
        </a-col>
        <a-col :span="1"><p>至</p></a-col>
        <a-col :span="4">
          <a-form-item>
            <a-input-number
              :min="parseInt(data.attribute.minRows) || 1"
              v-decorator="['setting[attribute][maxRows]', {initialValue: parseInt(data.attribute.maxRows) || 2, rules: [{ required: true, message: '最大行数范围不能为空' }] }]"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][emptyText]', {initialValue: data.attribute.emptyText || ''}]" />
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  props: {
    setting: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    setting: {
      handler (newVal) {
        this.data = JSON.parse(JSON.stringify(newVal))
        this.data.form = this.data.form && !(this.data.form instanceof Array) ? this.data.form : {}
      },
      immediate: true
    }
  },
  data () {
    return {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      data: {},
      minLength: null,
      regexs: [
        { value: '', text: '常用正则' },
        { value: '/^([+-]?)\\d*\\.?\\d+$/', text: '数字' },
        { value: '/^-?[1-9]\\d*$/', text: '整数' },
        { value: '/^[A-Za-z]+$/', text: '字母' },
        { value: '/^\\w+$/', text: '字母+数字' },
        { value: '/^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$/', text: 'E-mail' },
        { value: '/^[1-9]*[1-9][0-9]*$/', text: 'QQ' },
        { value: '/^http:///', text: '超级链接' },
        { value: '/^(1)[0-9]{10}$/', text: '手机号码' },
        { value: '/^[0-9-]{6,13}$/', text: '电话号码' },
        { value: '/^[0-9]{6}$/', text: '邮政编码' }
      ]
    }
  },
  methods: {
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          val = values
        }
      })
      return val
    }
  }
}
</script>
