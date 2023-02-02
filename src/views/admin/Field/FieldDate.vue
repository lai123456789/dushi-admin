<template>
  <a-form :form="form">
    <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][emptyText]', {initialValue: data.attribute.emptyText || ''}]" />
    </a-form-item>
    <a-form-item label="最小值" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-radio-group :default-value="data.form.minType || ''" style="width: 100%;" @change="getMinType" >
        <a-form-item>
          <a-row>
            <a-radio value="">不设置</a-radio>
          </a-row>
        </a-form-item>
        <a-form-item style="margin-top: -8px;">
          <a-row>
            <a-radio value="now">当前时刻</a-radio>
          </a-row>
        </a-form-item>
        <a-form-item style="margin-top: -8px;" :validateStatus="timeStatus" :help="timeHelp">
          <a-row>
            <a-col :span="3">
              <a-radio value="custom">自定义</a-radio>
            </a-col>
            <a-col :span="6">
              <a-date-picker
                style="width: 100%;"
                size="small"
                :disabled="minType !== 'custom'"
                :value="minType === 'custom' && minValue ? moment(minValue) : null"
                :disabled-date="(current) => { if(maxType === 'custom') { return current > moment(maxValue) } }"
                v-if="format === 'YYYY-MM-DD'"
                format="YYYY-MM-DD"
                @change="(val) => { minValue = val }" />
              <a-date-picker
                style="width: 100%;"
                v-else-if="format === 'YYYY-MM-DD HH:mm:ss'"
                format="YYYY-MM-DD HH:mm:ss"
                :disabled="minType !== 'custom'"
                :value="minType === 'custom' && minValue ? moment(minValue) : null"
                :disabled-date="(current) => { if(maxType === 'custom') { return current > moment(maxValue) } }"
                size="small"
                @change="(val) => { minValue = val || null }"
                :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" />
              <a-time-picker
                style="width: 100%;"
                v-else
                size="small"
                :disabled="minType !== 'custom'"
                :value="minType === 'custom' && minValue ? moment(minValue, 'HH:mm:ss') : null"
                @change="(time, timeString) => { changeTime(time, timeString, 'min') }" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-row>
            <a-col :span="3">
              <a-radio value="field">本表字段</a-radio>
            </a-col>
            <a-col :span="6">
              <a-select
                :disabled="minType !== 'field'"
                :value="minType === 'field' ? minValue : undefined"
                size="small"
                showSearch
                option-filter-prop="children"
                placeholder="请选择本表字段"
                @change="(val) => { minValue = val }">
                <a-select-option v-for="item in fieldArr" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </a-form-item>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="最大值" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-radio-group :default-value="data.form.maxType || ''" style="margin-top: 8px; width: 100%;" @change="getMaxType" >
        <a-form-item style="margin-top: -8px;">
          <a-row>
            <a-radio value="">不设置</a-radio>
          </a-row>
        </a-form-item>
        <a-form-item style="margin-top: -8px;">
          <a-row>
            <a-radio value="now">当前时刻</a-radio>
          </a-row>
        </a-form-item>
        <a-form-item style="margin-top: -8px;" :validateStatus="timeStatus" :help="timeHelp">
          <a-row>
            <a-col :span="3">
              <a-radio value="custom">自定义</a-radio>
            </a-col>
            <a-col :span="6">
              <a-date-picker
                style="width: 100%;"
                size="small"
                :format="format"
                :disabled="maxType !== 'custom'"
                :value="maxType === 'custom' && maxValue ? moment(maxValue): null"
                :disabled-date="(current) => { if(minType === 'custom') { return current < moment(minValue) } }"
                v-if="format === 'YYYY-MM-DD' || format === 'YYYY-MM'"
                @change="(val) => { maxValue = val || null }" />
              <a-date-picker
                style="width: 100%;"
                v-else-if="format === 'YYYY-MM-DD HH:mm:ss'"
                format="YYYY-MM-DD HH:mm:ss"
                :disabled="maxType !== 'custom'"
                :value="maxType === 'custom' && maxValue ? moment(maxValue) : null"
                :disabled-date="(current) => { if(minType === 'custom') { return current < moment(minValue) } }"
                size="small"
                @change="(val) => { maxValue = val || null }"
                :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" />
              <a-time-picker
                style="width: 100%;"
                v-else
                size="small"
                :format="format"
                :disabled="maxType !== 'custom'"
                :value="maxType === 'custom' && maxValue ? moment(maxValue, 'HH:mm:ss'): null"
                @change="(time, timeString) => { changeTime(time, timeString, 'max') }" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-row>
            <a-col :span="3">
              <a-radio value="field">本表字段</a-radio>
            </a-col>
            <a-col :span="6">
              <a-select
                :disabled="maxType !== 'field'"
                :value="maxType === 'field' ? maxValue : undefined"
                size="small"
                showSearch
                option-filter-prop="children"
                placeholder="请选择本表字段"
                @change="(val) => { maxValue = val}">
                <a-select-option v-for="item in fieldArr" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </a-form-item>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="默认值" :labelCol="labelCol">
      <a-row type="flex">
        <a-col :span="12">
          <a-select :value="defaultType" placeholder="请选择默认值" allowClear @change="getDefaultType" style="margin-right: 20px; width: 300px;">
            <a-select-option value="now">
              当前时刻
            </a-select-option>
            <a-select-option value="custom">
              自定义
            </a-select-option>
            <a-select-option value="linkData">
              数据联动
            </a-select-option>
            <a-select-option value="formula">
              公式编辑
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12">
          <div v-if="defaultType === 'custom'">
            <a-date-picker
              style="width: 300px;"
              :format="format"
              :value="defaultType === 'custom' && defaultValue ? moment(defaultValue): null"
              v-if="format === 'YYYY-MM-DD' || format === 'YYYY-MM'"
              @change="(val) => { defaultValue = val || null }" />
            <a-date-picker
              style="width: 300px;"
              v-else-if="format === 'YYYY-MM-DD HH:mm:ss'"
              format="YYYY-MM-DD HH:mm:ss"
              :value="defaultType === 'custom' && defaultValue ? moment(defaultValue) : null"
              @change="(val) => { defaultValue = val || null }"
              :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" />
            <a-time-picker
              style="width: 300px;"
              v-else
              :format="format"
              :value="defaultType === 'custom' && defaultValue ? moment(defaultValue, 'HH:mm:ss') : null"
              @change="(val) => { defaultValue = val || null }" />
          </div>
          <a-button v-show="defaultType === 'linkData'" @click="handleDefaultLink">数据联动</a-button>
          <a-button v-show="defaultType === 'formula'" @click="handleDefaultEdit">
            <a-badge v-if="defaultFlag" status="success" text="公式编辑" />
            <a-badge v-else status="default" text="公式编辑" />
          </a-button>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select
        :allowClear="true"
        placeholder="请选择默认值加载时机"
        v-decorator="['setting[form][quote_type]', { initialValue: data.form.quote_type || undefined }]">
        <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
      </a-select>
    </a-form-item>
    <code-editor ref="codeEditor" @func="getCode"/>
    <DateLinkage ref="dataLinkage" @ok="getDateLinkage" :key="linkKey" />
  </a-form>
</template>
<script>
import moment from 'moment'
export default {
  components: {
    CodeEditor: () => import('@/views/admin/CodeEditor'),
    DateLinkage: () => import('./DataLinkage')
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    },
    dataOld: {
      type: Object,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => {}
    },
    formatOld: {
      type: String,
      default: 'Y-m-d H:i:s'
    },
    tableField: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    setting: {
      handler (newVal) {
        this.minValue = this.minType === 'custom' ? moment(new Date()).format(this.format) : undefined
        this.maxValue = this.maxType === 'custom' ? moment(new Date()).format(this.format) : undefined
      },
      deep: true
    },
    formatOld: {
      handler (newVal) {
        this.timeStatus = 'success'
        this.timeHelp = ''
        switch (newVal) {
          case 'Y-m-d H:i:s':
            this.format = 'YYYY-MM-DD HH:mm:ss'
            this.fieldtype = 'DATETIME'
            break
          case 'Y-m-d':
            this.format = 'YYYY-MM-DD'
            this.fieldtype = 'DATE'
            break
          case 'H:i:s':
            this.format = 'HH:mm:ss'
            this.fieldtype = 'TIME'
            break
          default:
            break
        }
        this.minValue = null
        this.maxValue = null
        this.defaultValue = null
        this.fieldArr = this.fieldArrs.filter(item => item.formtype === 'datetime' && item.fieldtype === this.fieldtype && this.dataOld.alias !== item.alias)
      }
    }
  },
  data () {
    return {
      linkKey: 'linkKey',
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      data: {},
      timeStatus: 'success',
      timeHelp: '',
      format: 'YYYY-MM-DD',
      fieldtype: '',
      fieldArr: [],
      fieldArrs: [],
      minType: '',
      minValue: '',
      maxType: '',
      maxValue: '',
      defaultType: '',
      defaultValue: '',
      defaultFlag: false,
      quote_types: [
        { value: 'onlyinput', text: '前端页面加载-添加时' },
        { value: 'always', text: '前端页面加载-添加和编辑时' },
        { value: 'onlyinput_db', text: '后台系统加载-添加时' },
        { value: 'onlyupdate_db', text: '后台系统加载-编辑时' },
        { value: 'always_db', text: '后台系统加载-添加和编辑时' }
      ]
    }
  },
  created () {
    this.data = JSON.parse(JSON.stringify(this.setting))
    this.data.form = this.data.form && !(this.data.form instanceof Array) ? this.data.form : {}
    this.minType = this.data.form.minType ? this.data.form.minType : ''
    this.maxType = this.data.form.maxType ? this.data.form.maxType : ''
    this.minValue = this.data.form.minValue ? this.data.form.minValue : undefined
    this.maxValue = this.data.form.maxValue ? this.data.form.maxValue : undefined
    this.defaultType = this.data.form.defaultType ? this.data.form.defaultType : undefined
    this.defaultValue = this.data.form.defaultValue ? this.data.form.defaultValue : undefined
    this.defaultFlag = !!this.defaultValue
    const parameter = {
      pageNo: 1,
      pageSize: 1000,
      sortField: 'id',
      sortOrder: 'descend'
    }
    this.axios({
      url: '/admin/field/init',
      params: Object.assign(parameter, { tableid: this.config.tableid })
    }).then(res => {
      if (res.code === 0) {
        this.fieldArrs = res.result.data
        switch (this.formatOld) {
          case 'Y-m-d H:i:s':
            this.format = 'YYYY-MM-DD HH:mm:ss'
            this.fieldtype = 'DATETIME'
            break
          case 'Y-m-d':
            this.format = 'YYYY-MM-DD'
            this.fieldtype = 'DATE'
            break
          case 'H:i:s':
            this.format = 'HH:mm:ss'
            this.fieldtype = 'TIME'
            break
          default:
            break
        }
        this.fieldArr = this.fieldArrs.filter(item => item.formtype === 'datetime' && item.fieldtype === this.fieldtype && this.dataOld.alias !== item.alias)
      } else {
        this.$message.error(res.msg)
      }
    })
  },
  methods: {
    // 选择最小值类型
    getMinType (e) {
      this.minType = e.target.value
      this.minValue = null
      this.timeStatus = 'success'
      this.timeHelp = ''
    },
    // 选择最大值类型
    getMaxType (e) {
      this.maxType = e.target.value
      this.maxValue = null
    },
    // 获取最小值最大值
    changeTime (time, timeString, type) {
      if (!timeString) {
        this.timeStatus = 'success'
        this.timeHelp = ''
      }
      if (type === 'min') {
        this.minValue = timeString || null
      } else {
        this.maxValue = timeString || null
      }
      // 如果最大值和最小值都存在，最大值大于最小值
      if (this.minValue && this.maxValue) {
        const num = this.handleCompare(this.maxValue, this.minValue)
        if (num < 0) {
          this.timeStatus = 'error'
          this.timeHelp = '最小值不能大于最大值'
        } else {
          this.timeStatus = 'success'
          this.timeHelp = ''
        }
      }
    },
    // 时分秒比较大小
    handleCompare (time, timeTarget) {
      const arr = time.split(':')
      const arrT = timeTarget.split(':')
      const h = arr[0]
      const m = arr[1]
      const s = arr[2]
      const ht = arrT[0]
      const mt = arrT[1]
      const st = arrT[2]
      if (h < ht) {
        return -1
      } else if (h === ht) {
        if (m < mt) {
          return -1
        } else if (m === mt) {
          if (s < st) {
            return -1
          } else if (s === st) {
            return 0
          } else {
            return 1
          }
        } else {
          return 1
        }
      } else {
        return 1
      }
    },
    // 获取默认值类型
    getDefaultType (value) {
      this.defaultType = value
      this.defaultValue = value === 'now' ? "{:date('Y-m-d H:i:s')}" : undefined
      if (value === 'formula') {
        this.defaultFlag = false
        this.defaultValue = undefined
      }
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
    // 默认值公式编辑
    handleDefaultEdit () {
      this.codeType = 'defaultSetting'
      this.$refs.codeEditor.show({
        value: this.defaultValue || ''
      })
    },
    // 获取公式编辑属性
    getCode (value) {
      this.defaultValue = value
      this.defaultFlag = !!value
    },
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (this.timeStatus === 'error') {
          return false
        }
        if (!errors) {
          values.setting.form = values.setting.form ? values.setting.form : {}
          values.setting.form.minType = this.minType
          values.setting.form.defaultValueLink = this.dataSource === 'linkData' ? this.setting.form.defaultValueLink : undefined
          if (this.format === 'HH:mm:ss') {
            values.setting.form.minValue = this.minValue
            values.setting.form.maxValue = this.maxValue
            values.setting.form.defaultValue = this.defaultValue
          } else {
            values.setting.form.minValue = this.minType !== 'field' && this.minValue ? moment(this.minValue).format(this.format) : this.minValue
            values.setting.form.maxValue = this.maxType !== 'field' && this.maxValue ? moment(this.maxValue).format(this.format) : this.maxValue
            values.setting.form.defaultValue = this.defaultType === 'now' ? "{:date('Y-m-d H:i:s')}" : (this.defaultValue ? moment(this.defaultValue).format(this.format) : undefined)
          }
          values.setting.form.maxType = this.maxType
          values.setting.form.defaultType = this.defaultType
          val = values
        }
      })
      return val
    }
  }
}
</script>
