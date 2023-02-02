<template>
  <div>
    <a-form :form="form">
      <a-form-item label="显示级数" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group v-decorator="['setting[form][show_series]', {initialValue: setting.form.show_series || '1', rules: [{ required: true, message: '请选择显示级数' }]}]" @change="(e) =>{ back_show = e.target.value; if(setting.attribute.required == 'true'){form.setFieldsValue({'setting[form][req_series]':'1'})}}">
          <a-radio value="1">省</a-radio>
          <a-radio value="2">省市</a-radio>
          <a-radio value="3">省市区</a-radio>
          <a-radio value="4">省市区街道</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }" v-if="back_show !== '1'">
        <span slot="label">省回写字段
          <a-tooltip title="只能回写到下拉框，且数据源为地址簿(回写)的字段。回写目的字段不要设置到表单视图中">
            <a-icon type="question-circle"/>
          </a-tooltip>
        </span>
        <a-select v-decorator="['setting[form][province]', {initialValue: setting.form.province || undefined}]" allowClear>
          <a-select-option v-for="item in writeBackData" :key="item.id" :value="item.alias">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }" v-if="back_show !== '1' && back_show !== '2'">
        <span slot="label">市回写字段
          <a-tooltip title="只能回写到下拉框，且数据源为地址簿(回写)的字段。回写目的字段不要设置到表单视图中">
            <a-icon type="question-circle"/>
          </a-tooltip>
        </span>
        <a-select v-decorator="['setting[form][city]', {initialValue: setting.form.city || undefined}]" allowClear>
          <a-select-option v-for="item in writeBackData" :key="item.id" :value="item.alias">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }" v-if="back_show !== '1' && back_show !== '2' && back_show !== '3'">
        <span slot="label">区回写字段
          <a-tooltip title="只能回写到下拉框，且数据源为地址簿(回写)的字段。回写目的字段不要设置到表单视图中">
            <a-icon type="question-circle"/>
          </a-tooltip>
        </span>
        <a-select v-decorator="['setting[form][area]', {initialValue: setting.form.area || undefined}]" allowClear>
          <a-select-option v-for="item in writeBackData" :key="item.id" :value="item.alias">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="详细地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-switch
          un-checked-children="关"
          checked-children="开"
          v-decorator="['setting[form][details_show]', {initialValue: setting.form.details_show == '1' ? true : false, valuePropName: 'checked'}]"
          @change="openDetails"/>
      </a-form-item>
      <a-form-item :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }" v-if="details_show === '1'">
        <span slot="label">详细地址回写字段
          <a-tooltip title="只能回写到单行文本。回写目的字段不要设置到表单视图中">
            <a-icon type="question-circle"/>
          </a-tooltip>
        </span>
        <a-select v-decorator="['setting[form][details]', {initialValue: setting.form.details || undefined, rules: [{ required: true, message: '请选择详细地址回写字段' }]}]" allowClear>
          <a-select-option v-for="item in detalisBack" :key="item.id" :value="item.alias">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">是否必填
          <a-tooltip placement="top">
            <span slot="title">字段在表单视图中默认的“必填”属性，若表单视图中有新的配置，则会覆盖当前的默认配置。</span>
            <a-icon type="question-circle" />
          </a-tooltip>
        </span>
        <a-switch
          un-checked-children="否"
          checked-children="是"
          v-decorator="['setting[attribute][required]', {initialValue: setting.attribute.required == 'true' ? true : false, valuePropName: 'checked'}]"
          @change="(e) => { $set(setting.attribute , 'required', e ? 'true' : 'false' )}"/>
      </a-form-item>
      <a-form-item label="必填级数" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="setting.attribute.required === 'true'">
        <a-radio-group v-decorator="['setting[form][req_series]', {initialValue: setting.form.req_series || '1', rules: [{ required: true, message: '请选择必填级数' }]}]">
          <a-radio value="1">省</a-radio>
          <a-radio value="2" v-if="back_show !== '1'">省市</a-radio>
          <a-radio value="3" v-if="back_show !== '1' && back_show !== '2'">省市区</a-radio>
          <a-radio value="4" v-if="back_show !== '1' && back_show !== '2' && back_show !== '3'">省市区街道</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success">
        <a-row :gutter="8">
          <a-col :span="8">
            <a-select
              placeholder="请选择默认值模板"
              v-decorator="['setting[form][defaultTemplate]', {initialValue: setting.form.defaultTemplate || ''}]"
              @change="changeDefault">
              <a-select-option v-for="default_template in defalut_templates" :key="default_template.value" :value="default_template.value">{{ default_template.text }}</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="12">
            <div v-if="defaultType === 'addressSelect'"><address-select :series="back_show" :defaultValue="defaultValue" fieldType="field" ref="addressSelect" @send="getDefaultValue"/></div>
            <a-button v-else-if="defaultType === 'linkData'" @click="handleDefaultLink">数据联动</a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', {initialValue: setting.form.quote_type || ''}]">
          <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
    <data-linkage ref="dataLinkage" @ok="getDataLinkage" />
  </div>
</template>
<script>
export default {
  components: {
    DataLinkage: () => import('./DataLinkage'),
    AddressSelect: () => import('./AddressSelect')
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
        this.defaultValueLink = this.data.form.defaultValueLink
        this.openDetails(this.data.form.details_show === '1')
        this.defaultType = this.data.form.defaultTemplate
        this.back_show = this.data.form.show_series ? this.data.form.show_series : '1'
        this.defaultValue = this.data.form.defaultValue
      },
      immediate: true
    }
  },
  mounted () {
    this.axios({
      url: '/admin/field/getField/',
      params: { tableid: this.config.tableid, formtype: 'combobox' }
    }).then(res => {
      this.writeBackData = res.result.filter(item => item.setting.attribute.dataSource === 'addressBook' || item.setting.attribute.dataSource === 'src_path_back')
    })
  },
  data () {
    return {
      visible: false,
      visibleAddress: false,
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      defaultValueLink: {},
      defaultValue: [],
      details_show: '0',
      back_show: '1',
      data: {},
      writeBackData: [],
      detalisBack: [],
      defaultFlag: false, // 公式编辑
      defalut_templates: [
        { value: '', text: '不设置' },
        { value: 'linkData', text: '数据联动' },
        { value: 'addressSelect', text: '自定义' }
      ],
      defaultType: 'custom',
      quote_types: [
        { value: 'onlyinput', text: '前端页面加载-添加时' },
        { value: 'always', text: '前端页面加载-添加和编辑时' },
        { value: 'onlyinput_db', text: '后台系统加载-添加时' },
        { value: 'onlyupdate_db', text: '后台系统加载-编辑时' },
        { value: 'always_db', text: '后台系统加载-添加和编辑时' }
      ]
    }
  },
  methods: {
    // 选择默认值
    changeDefault (val) {
      this.setting.form.defaultTemplate = val
      this.defaultType = val
    },
    getDataLinkage (val) {
      this.defaultValueLink = val
    },
    // 默认值数据联动
    handleDefaultLink () {
      this.$refs.dataLinkage.show({
        data: this.data,
        setting: this.setting,
        table_field: this.tableField,
        tableid: this.config.tableid
      })
    },
    openDetails (e) {
      if (e) {
        this.details_show = '1'
        this.axios({
          url: '/admin/field/getField/',
          params: { tableid: this.config.tableid, formtype: 'text' }
        }).then(res => {
          this.detalisBack = res.result
        })
      } else {
        this.details_show = '0'
      }
    },
    getDefaultValue (label, value) {
      this.defaultValue = value
    },
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          values.setting.form.details_show = values.setting.form.details_show ? '1' : '0'
          values.setting.form.defaultValueLink = this.defaultValueLink
          if (!values.setting.attribute.required) {
            values.setting.form.req_series = '1'
          }
          values.setting.form.defaultValue = values.setting.form.defaultTemplate === 'addressSelect' ? this.defaultValue : ''
          val = values
        }
      })
      return val
    }
  }
}
</script>
