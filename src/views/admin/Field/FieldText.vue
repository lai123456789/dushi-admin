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
    <a-form-item label="正则校验" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][regex]', {initialValue: data.attribute.regex || ''}]">
        <a-select
          slot="addonAfter"
          v-decorator="['setting[attribute][text_regexType_inputEl]', {initialValue: data.attribute.text_regexType_inputEl || ''}]"
          style="width: 120px"
          @change="value => data.attribute.regex=value">
          <a-select-option v-for="regex in regexs" :key="regex.value" :value="regex.value">{{ regex.text }}</a-select-option>
        </a-select>
      </a-input>
    </a-form-item>
    <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][emptyText]', {initialValue: data.attribute.emptyText || ''}]" />
    </a-form-item>
    <a-form-item label="前缀" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <div class="center">
        <a-radio-group name="radioGroup" :default-value="data.form.prefixType ? data.form.prefixType : 'none'" @change="getPrefixType">
          <a-radio value="none">
            无
          </a-radio>
          <a-radio value="word">
            文字
          </a-radio>
          <a-radio value="icon">
            图标
          </a-radio>
        </a-radio-group>
        <a-input
          size="small"
          style="width: 50px;"
          :maxLength="1"
          v-if="iconFlag === 'word'"
          v-decorator="['setting[form][prefixVal]', {initialValue: data.form.prefixVal || '',rules: [{ required: true, message: '请输入文字'}]}]"
        ></a-input>
        <template v-else-if="iconFlag === 'icon'">
          <a-button size="small" @click="handleMenuIcon">
            <a-badge v-if="prefixIcon.type" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
          <a-icon :type="prefixIcon.type" :theme="prefixIcon.theme" v-if="prefixIcon.type" style="font-size: 16px; margin-left: 10px;" />
        </template>
        <a-input
          size="small"
          style="width: 50px;"
          v-if="iconFlag === 'icon'"
          v-show="false"
          v-decorator="['setting[form][prefixIcon][type]', {initialValue: data.form.prefixIcon ? data.form.prefixIcon.type : '',rules: [{ required: true, message: '请选择图标'}]}]"
        ></a-input>
      </div>
    </a-form-item>
    <a-form-item v-if="iconFlag === 'icon'" v-show="false">
      <a-input v-decorator="['setting[form][prefixIcon][theme]', {initialValue: data.form.prefixIcon ? data.form.prefixIcon.theme : ''}]" />
    </a-form-item>
    <a-form-item label="后置图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-checkbox-group @change="handleLatter" :defaultValue="setting.form.latterIcon || []">
        <a-checkbox value="message">
          短信
          <a-button size="small" @click="codeEditor('message')">
            <a-badge v-if="attributeClick.message" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
        </a-checkbox>
        <a-checkbox value="telephone">
          电话
          <a-button size="small" @click="codeEditor('telephone')">
            <a-badge v-if="attributeClick.telephone" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
        </a-checkbox>
        <a-checkbox value="custom">
          自定义
        </a-checkbox>
      </a-checkbox-group>
      <a-button size="small" @click="codeEditor">
        <a-badge v-if="attributeFlag" status="success" text="设置" />
        <a-badge v-else status="default" text="设置" />
      </a-button>
    </a-form-item>
    <a-form-item label="文本框类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-radio-group v-decorator="['setting[form][inputType]', {initialValue: data.form.inputType || 'text'}]">
        <a-radio value="text">文本框</a-radio>
        <a-radio value="password">密码框</a-radio>
      </a-radio-group>
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
        this.attributeFlag = !!this.data.form.latterVal
        if (!this.data.form.attributeClick || this.data.form.attributeClick instanceof Array) {
          this.attributeClick = {}
        } else {
          this.attributeClick = this.data.form.attributeClick
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
      minLength: null,
      data: {},
      regexs: [
        { value: '', text: '无正则校验' },
        { value: '/^([+-]?)\\d*\\.?\\d+$/', text: '数字' },
        { value: '/^-?[1-9]\\d*$/', text: '整数' },
        { value: '/^[A-Za-z]+$/', text: '字母' },
        { value: '/^\\w+$/', text: '字母+数字' },
        { value: '/^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$/', text: 'E-mail' },
        { value: '/^[1-9]*[1-9][0-9]*$/', text: 'QQ' },
        { value: '/^(http://)|(https://)/', text: '超级链接' },
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
      attributeClick: {}// 按钮后置图标自定义click事件
    }
  },
  methods: {
    // 获取前缀
    getPrefixType (e) {
      const val = e.target.value
      this.data.form.prefixType = val
      this.iconFlag = val
      this.prefixIcon = {
        type: '',
        theme: ''
      }
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
      this.form.setFieldsValue({
        'setting[form][prefixIcon][theme]': value.theme,
        'setting[form][prefixIcon][type]': value.type
      })
      this.data.form.prefixIcon = value
    },

    // 后置图标
    handleLatter (val) {
      this.data.form.latterIcon = val
    },
    // 打开设置附加属性
    codeEditor (type) {
      this.codeType = type
      if (type) {
        this.$refs.codeEditor.show({
          value: this.attributeClick[type] || ''
        })
      } else {
        this.$refs.codeEditor.show({
          value: this.data.form.latterVal || ''
        })
      }
    },
    // 获取附加属性
    getCode (value) {
      if (this.codeType) {
        this.$set(this.attributeClick, this.codeType, value)
      } else {
        this.data.form.latterVal = value
        this.attributeFlag = true
      }
    },
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          values.setting.form.prefixType = this.iconFlag
          values.setting.form.latterIcon = this.data.form.latterIcon
          values.setting.form.latterVal = this.data.form.latterVal
          values.setting.form.attributeClick = this.attributeClick
          val = values
        }
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
