<template>
  <a-form :form="form">
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.formtype !== 'switch'">
      <span slot="label">是否允许半星
        <a-tooltip placement="top">
          <template slot="title">
            <span>该属性保存后不支持再次编辑。</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-switch
        un-checked-children="否"
        checked-children="是"
        :disabled="config.action === 'edit'"
        @change="(checked) => { half = checked; data.form.copywriting = writeFlag ? '1' : '0' }"
        v-decorator="['setting[attribute][half]', {initialValue: data.attribute.half === '1', valuePropName: 'checked'}]" />
    </a-form-item>
    <a-form-item label="是否允许再次点击清除" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.formtype !== 'switch'">
      <a-switch
        un-checked-children="否"
        checked-children="是"
        v-decorator="['setting[attribute][clear]', {initialValue: data.attribute.clear === '1', valuePropName: 'checked'}]" />
    </a-form-item>
    <a-form-item label="文案展现" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.formtype !== 'switch' && !half">
      <a-switch
        un-checked-children="否"
        checked-children="是"
        @change="(checked) => { writeFlag = checked; data.form.copywriting = writeFlag ? '1' : '0' }"
        v-decorator="['setting[form][copywriting]', {initialValue: data.form.copywriting === '1', valuePropName: 'checked'}]" />
      <template v-if="writeFlag">
        <a-row v-for="(item, index) in writeList" :key="index">
          <a-col :span="6">
            <a-rate :value="index + 1" disabled />
          </a-col>
          <a-col :span="6">
            <a-input placeholder="请输入文案" :value="item" @change="(e) => { changeWrite(e ,index) }"/>
          </a-col>
        </a-row>
      </template>
    </a-form-item>
    <a-form-item label="替换字符" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <div class="center">
        <a-radio-group name="radioGroup" :default-value="data.form.prefixType ? data.form.prefixType : 'default'" @change="getPrefixType">
          <a-radio value="default">
            默认
          </a-radio>
          <a-radio value="word">
            文字
          </a-radio>
          <a-radio value="icon">
            图标
          </a-radio>
        </a-radio-group>
        <a-input size="small" style="width: 50px;" v-if="iconFlag === 'word'" v-model="prefixVal" @input="getPrefixVal"></a-input>
        <template v-else-if="iconFlag === 'icon'">
          <a-button size="small" @click="handleMenuIcon">
            <a-badge v-if="prefixIcon.type" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
          <a-icon :type="prefixIcon.type" :theme="prefixIcon.theme" v-if="prefixIcon.type" style="font-size: 16px; margin-left: 10px;" />
        </template>
      </div>
    </a-form-item>
    <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-select
            :allowClear="true"
            placeholder="请选择默认值模板"
            v-decorator="['setting[form][defaultTemplate]', {initialValue: data.form.defaultTemplate || 'custom'}]"
            @change="changeDefault">
            <a-select-option v-for="default_template in defalut_templates" :key="default_template.value" :value="default_template.value">{{ default_template.text }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12">
          <a-input-number
            :precision="half ? 1 : 0"
            :step="half ? 0.5 : 1"
            :min="0"
            :max="5"
            v-decorator="['setting[form][defaultValue]',{ initialValue: parseInt(data.form.defaultValue) || 0 }]"
            v-show="defaultType === 'custom'"/>
          <a-button v-show="defaultType === 'linkData'" @click="handleDefaultLink">数据联动</a-button>
          <a-button v-show="defaultType === 'formula'" @click="openFormulate">
            <a-badge v-if="defaultFlag" status="success" text="公式编辑" />
            <a-badge v-else status="default" text="公式编辑" />
          </a-button>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', {initialValue: data.form.quote_type || ''}]">
        <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
      </a-select>
    </a-form-item>
    <formula-edit ref="FormulaEdit" :params="formulaData" @ok="handleFormulate" :key="formulaKey" />
    <menu-icon :key="refreshKey" @ok="getIcon" ref="menuIcon"></menu-icon>
    <DateLinkage ref="dataLinkage" @ok="getDateLinkage" :key="linkKey" />
  </a-form>
</template>

<script>
import { Rate } from 'ant-design-vue'
import Vue from 'vue'
Vue.use(Rate)
export default {
  components: {
    FormulaEdit: () => import('./FormulaEdit'),
    MenuIcon: () => import('../Menu/MenuIcon'),
    DateLinkage: () => import('./DataLinkage')
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    },
    tableField: {
      type: Array,
      default: () => {
        return []
      }
    },
    config: {
      type: Object,
      default: () => {}
    },
    dataOld: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    setting: {
      handler (newVal) {
        this.data = JSON.parse(JSON.stringify(newVal))
        this.data.form = this.data.form && !(this.data.form instanceof Array) ? this.data.form : {}
        this.half = this.data.attribute.half === '1'
        this.writeFlag = this.data.form.copywriting === '1'
        this.writeList = this.data.form.writeList || ['', '', '', '', '']
        this.iconFlag = this.data.form.prefixType
        this.prefixVal = this.data.form.prefixVal
        this.prefixIcon = this.data.form.prefixIcon
        this.defaultType = this.data.form.defaultTemplate
      },
      immediate: true
    }
  },
  data () {
    return {
      linkKey: 'linkKey',
      refreshKey: 0,
      formulaKey: 'formulaKey',
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      data: {},
      half: false,
      writeFlag: false,
      writeList: ['', '', '', '', ''],
      iconFlag: '',
      prefixVal: '',
      prefixIcon: {
        type: ''
      },
      attributeFlag: false,
      defalut_templates: [
        { value: 'custom', text: '自定义' },
        { value: 'linkData', text: '数据联动' },
        { value: 'formula', text: '公式编辑' }
      ],
      quote_types: [
        { value: 'onlyinput', text: '前端页面加载-添加时' },
        { value: 'always', text: '前端页面加载-添加和编辑时' },
        { value: 'onlyinput_db', text: '后台系统加载-添加时' },
        { value: 'onlyupdate_db', text: '后台系统加载-编辑时' },
        { value: 'always_db', text: '后台系统加载-添加和编辑时' }
      ],
      defaultType: '',
      defaultFlag: false,
      formulaData: {}
    }
  },
  methods: {
    // 文案列表
    changeWrite (e, index) {
      const value = e.target.value
      this.writeList.splice(index, 1, value)
    },
    // 获取替换字符
    getPrefixType (e) {
      const val = e.target.value
      this.data.form.prefixType = val
      this.iconFlag = val
      this.prefixIcon = {
        type: '',
        theme: ''
      }
    },
    // 替换字符
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
    // 选择默认值
    changeDefault (val) {
      if (val !== 'linkData' && val !== 'formula') {
        this.defaultType = 'custom'
      } else {
        this.defaultType = val
      }
    },
    // 打开过滤条件
    openFormulate () {
      this.formulaKey = this.formulaKey === 'formulaKey' ? 'formulaKey_1' : 'formulaKey'
      this.formulaData = { tableid: this.tableid, data: this.setting.form.formulateValue || {} }
      this.$nextTick(() => {
        this.$refs.FormulaEdit.show({ title: '公式编辑器' })
      })
    },
    // 公式编辑
    handleFormulate (res) {
      this.setting.form.formulateValue = res.data
    },
    // 默认值数据联动
    handleDefaultLink () {
      this.linkKey = this.linkKey === 'linkKey' ? 'linkKey_1' : 'linkKey'
      this.$nextTick(() => {
        this.$refs.dataLinkage.show({
          data: this.dataOld,
          setting: this.setting,
          table_field: this.tableField,
          tableid: this.config.tableid
        })
      })
    },
    // 获取数据联动值
    getDateLinkage (val) {
      this.setting.form.defaultValueLink = val
    },

    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          values.setting.form = values.setting.form || {}
          values.setting.form.defaultValueLink = this.dataSource === 'linkData' ? this.setting.form.defaultValueLink : undefined
          values.setting.form.writeList = this.writeFlag ? this.writeList : undefined
          values.setting.form.prefixType = this.iconFlag
          if (values.setting.form.prefixType === 'word') {
            values.setting.form.prefixVal = this.prefixVal
          } else if (values.setting.form.prefixType === 'icon') {
            values.setting.form.prefixIcon = this.prefixIcon
          }
          val = values
        }
      })
      return val
    }
  }
}
</script>
