<template>
  <div>
    <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][emptyText]', { initialValue: setting.attribute.emptyText || ''} ]" />
    </a-form-item>
    <a-form-item label="数据源" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-row>
        <a-col :span="7">
          <a-radio-group @change="getSrc" v-decorator="['setting[attribute][dataSource]', { initialValue: data.attribute.dataSource || 'addressBook', rules: [{required: true, message: '数据源不能为空'}] }]">
            <a-radio value="addressBook">地址簿</a-radio>
            <a-radio value="src_path">数据字典</a-radio>
          </a-radio-group>
        </a-col>
        <a-col :span="17">
          <a-form-item v-if="srcShow">
            <a-select
              option-filter-prop="children"
              v-decorator="['setting[form][src]', {initialValue: setting.form.src || undefined, rules: [{ required: true, message:'请选择数据字典' }]}]"
              placeholder="请选择数据字典"
              :showSearch="true"
              allowClear
              @change="getCascader"
            >
              <a-select-option v-for="value in src_path" :key="value.number" :value="value.number">
                {{ value.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="是否必须选到叶子节点" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-switch
        un-checked-children="否"
        checked-children="是"
        v-decorator="['setting[attribute][select_model]', {initialValue: setting.attribute.select_model === 'end' ? true : false, valuePropName: 'checked'}]"
        @change="(e) => { $set(setting.attribute , 'select_model', e ? 'end' : 'any' )}"/>
    </a-form-item>
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-row>
        <a-col :span="8">
          <a-form-item label="多选" :labelCol="{span: 19}" :wrapperCol="{span: 5}">
            <a-switch
              un-checked-children="否"
              checked-children="是"
              v-decorator="['setting[attribute][multiple]', {initialValue: setting.attribute.multiple === '0' ? false : true, valuePropName: 'checked'}]"
              @change="(e) => { $set(setting.attribute , 'multiple', e ? '1' : '0' )}"/>
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item label="勾选继承" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-checkbox
              v-decorator="['setting[attribute][inherit]', {initialValue: setting.attribute.inherit === '1' ? true : false, valuePropName: 'checked'}]"
              @change="(e) => { $set(setting.attribute , 'inherit', e ? '1' : '0' )}"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <!-- 回写内容，下拉框且数据字典是会回写的 -->
    <a-form-item label="回写策略" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <div v-for="(option, index) in writeBack" :key="index">
        <a-row style="margin-left: 5px" :gutter="5">
          <a-col :span="3" style="text-align: center">
            <span>{{ index + 1 }}级值回写到</span>
          </a-col>
          <a-col :span="19">
            <a-select :allowClear="true" v-model="option.value">
              <a-select-option v-for="(drop, indexs) in dropDownField" :key="indexs" :value="drop.alias" >{{ drop.name }}</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="1">
            <a-icon :style="{ fontSize: '24px', color: '#52c41a', 'padding-top': '3px' }" type="plus-square" theme="filled" @click="writeBack.splice(index + 1 , 0, { value: undefined })" />
          </a-col>
          <a-col :span="1">
            <a-icon :style="{ fontSize: '24px', color: writeBack.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-top': '3px'}" type="minus-square" theme="filled" @click="writeBack.length === 1 ? '' : writeBack.splice(index, 1)" />
          </a-col>
        </a-row>
      </div>
    </a-form-item>
    <a-form-item label="后置图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-row>
        <a-col :span="8">
          <a-radio-group @change="(e) =>{ latterIcon = e.target.value }" :defaultValue="setting.form.latterIcon || ''">
            <a-radio value="">
              无
            </a-radio>
            <a-radio value="string" @click="() =>{ if( setting.form.latterVal ){ setting.form.latterVal.type = '' } }">
              文字
            </a-radio>
            <a-radio value="custom">
              图标
            </a-radio>
          </a-radio-group>
        </a-col>
        <a-col :span="12">
          <a-icon :type="latterVal.type" :theme="latterVal.theme" v-if="latterVal.type && latterIcon === 'custom'" />
          <a-button style="margin-left: 10px" size="small" @click="handleMenuIcon" v-if="latterIcon === 'custom'">
            设置
          </a-button>
          <menu-icon @ok="getIcon" ref="menuIcon" />
          <a-form-item v-if="latterIcon === 'string'" style="width: 80px; margin: 0px">
            <a-input v-decorator="['setting[form][latterVal][type]', { initialValue: setting.form.latterVal ? setting.form.latterVal.type : '' , rules: [{ max: 1, message:'字符长度不得大于1' }]}]"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success">
      <a-tree-select
        v-decorator="['setting[form][defaultValue]', { initialValue: setting.form.defaultValue || '' }]"
        style="width: 100%"
        :tree-data="treeData"
        :disabled="true"
        :replaceFields="replaceFields"
        placeholder="请选择默认值"
        tree-default-expand-all
      >
      </a-tree-select>
    </a-form-item>
    <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select :disabled="true" :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', {initialValue: setting.form.quote_type || ''}]">
        <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>
<script>
export default {
  components: {
    MenuIcon: () => import('../Menu/MenuIcon')

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
        this.writeBack = this.data.form.writeBack ? this.data.form.writeBack : [{ value: undefined }]
        this.srcShow = newVal.attribute.dataSource === 'src_path'
        if (this.srcShow) {
          this.axios({
            url: 'admin/dict/getDictList/',
            params: { 'category': '1' }
          }).then(res => {
            this.src_path = res.result
          })
          this.getWriteBack('src_path_back')
        } else {
          this.getWriteBack('addressBook')
        }
        this.latterIcon = newVal.form.latterIcon || ''
        this.latterVal = newVal.form.latterVal || { type: '' }
        this.defaultValueLink = this.data.form.defaultValueLink
        this.defaultType = this.data.form.defaultTemplate
        this.defaultValue = this.data.form.defaultValue
      },
      immediate: true
    }
  },
  data () {
    return {
      visible: false,
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      defaultValueLink: {},
      defaultValue: [],
      data: {},
      srcShow: false,
      src_path: [],
      dropDownField: [],
      writeBack: [{ value: undefined }], // 回写策略
      latterVal: {},
      latterIcon: '',
      defaultFlag: false, // 公式编辑
      treeData: [],
      replaceFields: {
        title: 'name',
        key: 'full_number'
      },
      defalut_templates: [
        { value: '', text: '不设置' }
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
    getWriteBack (type) {
      this.axios({
        url: '/admin/field/getField/',
        params: { tableid: this.config.tableid, formtype: 'combobox' }
      }).then(res => {
        this.dropDownField = res.result.filter(item => item.setting.attribute.dataSource === type)
      })
    },
    getSrc (e) {
      if (e.target.value === 'src_path') {
        this.srcShow = true
        this.axios({
          url: 'admin/dict/getDictList/',
          params: { 'category': '1' }
        }).then(res => {
          this.src_path = res.result
        })
        this.writeBack = [{ value: undefined }]
        this.getWriteBack('src_path_back')
      } else {
        this.srcShow = false
        this.getWriteBack('addressBook')
        this.writeBack = [{ value: undefined }]
      }
    },
    // 获取图标
    getIcon (value) {
      this.latterVal = value
    },
    // 后置图标
    handleLatter (val) {
      this.latterIcon = val.target.value
    },
    // 打开图标库
    handleMenuIcon () {
      this.$refs.menuIcon.show()
    },
    getCascader (value) {
      this.axios({
        url: '/admin/dict/getCascader/',
        params: { rnumber: value || 1 }
      }).then(res => {
        this.treeData = res.result
      })
    }
  }
}
</script>
