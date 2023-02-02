<template>
  <a-form :form="form">
    <a-form-item label="允许输入数值范围" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-row :gutter="8">
        <a-col :span="4">
          <a-form-item>
            <a-input-number
              @blur="onBlur"
              :max="max"
              :precision="numPrecision"
              v-decorator="['setting[attribute][minValue]', {initialValue: data.attribute.minValue || ''}]"/>
          </a-form-item>
        </a-col>
        <a-col :span="1"><p style="text-align:center;">至</p></a-col>
        <a-col :span="4">
          <a-form-item>
            <a-input-number
              :precision="numPrecision"
              :min="min"
              v-decorator="['setting[attribute][maxValue]', {initialValue: data.attribute.maxValue || ''}]"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="步进值" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input-number :precision="numPrecision" v-decorator="['setting[attribute][step]', { initialValue: data.attribute.step }]" />
    </a-form-item>
    <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][emptyText]', {initialValue: data.attribute.emptyText || ''}]" />
    </a-form-item>
    <a-form-item label="前缀" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <div class="center">
        <a-radio-group name="radioGroup" :default-value="data.form.prefixType ? data.form.prefixType : ''" @change="getPrefixType">
          <a-radio value="">
            无
          </a-radio>
          <a-radio value="￥">
            ￥
          </a-radio>
          <a-radio value="$">
            $
          </a-radio>
          <a-radio value="word">
            文字
          </a-radio>
        </a-radio-group>
        <a-input size="small" style="width: 50px;" v-if="iconFlag === 'word'" v-model="prefixVal" @input="getPrefixVal"></a-input>
      </div>
    </a-form-item>
    <a-form-item label="后置图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-radio-group @change="handleLatter" :defaultValue="setting.form.latterIcon || ''">
        <a-radio value="">
          无
        </a-radio>
        <a-radio value="%">
          %
        </a-radio>
        <a-radio value="custom">
          自定义
        </a-radio>
      </a-radio-group>
      <a-button size="small" @click="codeEditor" v-if="latterIcon === 'custom'">
        <a-badge v-if="attributeFlag" status="success" text="设置" />
        <a-badge v-else status="default" text="设置" />
      </a-button>
    </a-form-item>
    <menu-icon :key="refreshKey" @ok="getIcon" ref="menuIcon"></menu-icon>
    <code-editor ref="codeEditor" @func="getCode"/>
  </a-form>
</template>

<script>
export default {
  components: {
    MenuIcon: () => import('../Menu/MenuIcon'),
    CodeEditor: () => import('@/views/admin/CodeEditor')
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    },
    precision: {
      type: Number,
      default: 0
    },
    fieldtype: {
      type: String,
      default: ''
    }
  },
  watch: {
    setting: {
      handler (newVal) {
        this.data = JSON.parse(JSON.stringify(newVal))
        this.data.form = this.data.form && !(this.data.form instanceof Array) ? this.data.form : {}
        this.iconFlag = this.data.form.prefixType
        this.prefixVal = this.data.form.prefixVal
        this.prefixIcon = this.data.form.prefixIcon
        this.latterIcon = this.data.form.latterIcon
        this.attributeFlag = !!this.data.form.latterVal
      },
      immediate: true
    },
    fieldtype: {
      handler (newVal) {
        if (newVal === 'INT') {
          this.numPrecision = 0
        } else {
          this.numPrecision = this.precision
        }
      },
      immediate: true
    },
    precision: {
      handler (newVal) {
        if (this.fieldtype === 'INT') {
          this.numPrecision = 0
        } else {
          this.numPrecision = newVal
        }
      },
      immediate: true
    }
  },
  data () {
    return {
      refreshKey: 0,
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      data: {},
      numPrecision: 0, // 小数位数
      min: -Infinity,
      max: Infinity,
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
      ],
      iconFlag: '',
      prefixVal: '',
      prefixIcon: {
        type: ''
      },
      attributeFlag: false,
      latterIcon: ''
    }
  },
  methods: {
    onBlur (e) {
      this.min = Number(e.target.value)
    },
    // 获取前缀
    getPrefixType (e) {
      const val = e.target.value
      this.data.form.prefixType = val
      this.iconFlag = val
      this.prefixVal = ''
      this.prefixIcon = {
        type: '',
        theme: ''
      }
    },
    // 前缀
    getPrefixVal (e) {
      const val = e.target.value
      this.prefixVal = val.slice(0, 1)
      this.data.form.prefixType = this.prefixVal
    },
    // 显示图标库
    handleMenuIcon () {
      this.refreshKey = this.refreshKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.menuIcon.show()
      })
    },
    // 获取图标
    getIcon (value) {
      this.prefixIcon = value
      this.data.form.prefixIcon = this.prefixIcon
    },
    // 后置图标
    handleLatter (e) {
      const val = e.target.value
      this.data.form.latterIcon = val
      this.latterIcon = val
    },
    // 打开设置附加属性
    codeEditor () {
      this.$refs.codeEditor.show({
        value: this.data.form.latterVal || ''
      })
    },
    // 获取附加属性
    getCode (value) {
      this.data.form.latterVal = value
      this.attributeFlag = true
    },
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        values.setting.form = values.setting.form || {}
        values.setting.form.prefixType = this.iconFlag
        if (values.setting.form.prefixType === 'word') {
          values.setting.form.prefixVal = this.prefixVal
        } else if (values.setting.form.prefixType === 'icon') {
          values.setting.form.prefixVal = this.prefixIcon
        } else {
          values.setting.form.prefixVal = this.data.form.prefixType
        }
        values.setting.form.latterIcon = this.data.form.latterIcon
        if (this.data.form.latterIcon === 'custom') {
          values.setting.form.latterVal = this.data.form.latterVal
        } else {
          values.setting.form.latterVal = this.data.form.latterIcon
        }
        val = values
      })
      return val
    }
  }
}
</script>
<style lang="less" scoped>
.center {
  height: 41px;
  padding: 0 0 2px;
  display: flex;
  align-items: center;
}
</style>
