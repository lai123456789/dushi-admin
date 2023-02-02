<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="办理方式显示名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input @change="handleChangeName" v-decorator="['way', {rules: [{required: true, message: '请输入办理方式显示名'},{ min: 2 , message: '请输入至少两个字符'}], initialValue: data.way}]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">办理方式系统名
            <a-tooltip placement="top">
              <template slot="title">
                <span>办理方式系统名由办理方式显示名自动生成。取显示名称前2个字的全拼，从第三个字起取首字母，全拼和首字母之间用下划线连接。保存时系统进行唯一性校验，若已存在当前名称，则会在末尾以2为起点，以1为步进增加数字标识，直到系统名称唯一。如：anzhuang、anzhuang2、anzhuang3</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input :disabled="config.action === 'edit'" v-decorator="['alias', {rules: [{required: true, message: '请输入办理方式系统名'}], initialValue: data.alias}]"/>
        </a-form-item>
        <a-form-item label="启用" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-switch v-decorator="['onoff', { valuePropName: 'checked', initialValue: data.onoff }]" />
        </a-form-item>
        <a-form-item label="是否默认" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['default', {rules: [{required: true}], initialValue: data.default+''}]">
            <a-radio value="1">是</a-radio>
            <a-radio value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :rows="8" v-decorator="['remarks', {initialValue: data.remarks}]"/>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit(1)" v-if="this.config.action === 'add'">保存并添加</a-button>
        <a-button type="primary" @click="handleSubmit(0)">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      config: {},
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {}
    }
  },
  methods: {
    show (config, data) {
      this.visible = true
      this.config = config
      this.data = JSON.parse(JSON.stringify(config.record))
      this.recordIndex = config.index
      this.form.resetFields()
    },
    // 根据显示名称赋值系统名称
    handleChangeName (e) {
      const pinyin = require('js-pinyin')
      const reg = new RegExp(/^(?![0-9]|_)[a-z0-9_]+$/)
      const reg2 = new RegExp(/^[a-z0-9_]+$/)
      let val = pinyin.getCamelChars(e.target.value)
      val = val.toLowerCase()
      val = val.split('')
      this.getVal(val, reg)
      val = val.filter(item => {
        return reg2.test(item)
      })
      if (this.config.action === 'add') {
        let str = val.join('')
        let index = 0
        this.params.wayData.forEach(item => {
          if (item.alias.indexOf(str) !== -1) {
            index++
          }
        })
        if (index) {
          str = str + index
        }
        this.form.setFieldsValue({ 'alias': str })
      }
    },
    // 递归判断是否首字不是数字
    getVal (val, reg) {
      if (!reg.test(val[0])) {
        val.shift()
        this.getVal(val, reg)
      }
    },
    handleSubmit (res) {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values = Object.assign(this.data, values)
          if (this.config.action === 'add') {
            this.$emit('ok', 'add', values)
          } else {
            this.$emit('ok', 'edit', values, this.recordIndex)
          }
          this.$message.success('操作成功')
          if (res === 1) {
            this.form.resetFields()
            this.data = {
              id: (new Date()).valueOf(),
              listorder: this.params.wayData.length + 1,
              way: '',
              default: 0,
              rule: '',
              alias: '',
              onoff: true,
              remarks: ''
            }
          } else {
            this.visible = false
          }
        }
      })
    }
  }
}
</script>
