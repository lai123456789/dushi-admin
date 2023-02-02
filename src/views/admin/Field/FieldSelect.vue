<template>
  <a-form :form="form">
    <!-- 下拉框 -->
    <template v-if="formtype === 'combobox'">
      <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input v-decorator="['setting[attribute][emptyText]', {initialValue: data.attribute.emptyText || ''}]" />
      </a-form-item>
      <a-form-item label="可选择数据模式" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group
          @change="(e) => { mode = e.target.value }"
          v-decorator="['setting[attribute][mode]', { initialValue: data.attribute.mode || 'default', rules: [{ required: true, message: '可选择数据模式不能为空' }] }]" >
          <a-radio value="default">单选</a-radio>
          <a-radio value="multiple">多选</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="隐藏已选择项" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-switch
          un-checked-children="关"
          checked-children="开"
          v-decorator="['setting[attribute][hide]', { initialValue: data.attribute.hide === '0' ? false : true, valuePropName: 'checked' }]" />
      </a-form-item>
    </template>
    <!-- 单选框 -->
    <template v-else-if="formtype === 'radio'">
      <a-form-item label="展现形式" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group
          v-decorator="['setting[attribute][style]', { initialValue: data.attribute.style || 'radio', rules: [{ required: true, message: '展现形式不能为空' }] }]" >
          <a-radio value="radio" style="width: 80px;;">radio</a-radio>
          <a-radio value="btn" >按钮样式</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="选项宽度" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group
          @change="changeType"
          v-decorator="['setting[attribute][optionType]', { initialValue: data.attribute.optionType || 'self', rules: [{ required: true, message: '选项宽度不能为空' }] }]" >
          <a-radio value="self" style="width: 80px;">自适应</a-radio>
          <a-radio value="fixed" >
            固定宽度
            <a-input-number size="small" style="width: 60px;" v-decorator="['setting[attribute][optionWidth]', { initialValue: data.attribute.optionWidth }]" />
            px
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </template>
    <!-- 多选框 -->
    <template v-else>
      <a-form-item label="显示全选" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-switch
          un-checked-children="否"
          checked-children="是"
          v-decorator="['setting[attribute][checkAll]', { initialValue: data.attribute.checkAll === '1' ? true : false, valuePropName: 'checked' }]" />
      </a-form-item>
      <a-form-item label="选项宽度" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group
          @change="changeType"
          v-decorator="['setting[attribute][optionType]', {initialValue: data.attribute.optionType || 'self', rules: [{required: true, message: '选项宽度不能为空'}]}]" >
          <a-radio value="self" style="width: 80px;">自适应</a-radio>
          <a-radio value="fixed" >
            固定宽度
            <a-input-number size="small" style="width: 60px;" v-decorator="['setting[attribute][optionWidth]', { initialValue: data.attribute.optionWidth }]" />
            px
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </template>
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span slot="label">数据源
        <a-tooltip>
          <template slot="title">
            <div>
              <div>自定义：自定义数据源，存储显示均为明文。</div>
              <div>数据字典：从平面数据字典中选择，key/value结构，存储key，显示value。</div>
              <div>其他数据表：从其他数据表生成数据源，存储显示均为明文。</div>
              <div>数据联动：根据本表某字段的值，联动筛选数据源。</div>
              <div>地址簿(回写)：用于地址选择字段回写省市区。</div>
              数据字典(回写)：用于级联选择字段回写级联值。
            </div>
          </template>
          <a-icon type="question-circle"/>
        </a-tooltip>
      </span>
      <a-select
        @change="choiceDataSource"
        v-decorator="['setting[attribute][dataSource]', { initialValue: data.attribute.dataSource || 'src_path', rules: [{required: true, message: '数据源不能为空'}] }]">
        <a-select-option value="custom">
          自定义
        </a-select-option>
        <a-select-option value="src_path">
          数据字典
        </a-select-option>
        <a-select-option value="othertable">
          其他数据表
        </a-select-option>
        <a-select-option value="linkData">
          数据联动
        </a-select-option>
        <a-select-option value="addressBook" v-if="formtype === 'combobox'">
          地址簿(回写)
        </a-select-option>
        <a-select-option value="src_path_back" v-if="formtype === 'combobox'">
          数据字典(回写)
        </a-select-option>
      </a-select>
      <template v-if="dataSource === 'custom'">
        <a-row>
          <a href="#" @click="openModal">批量编辑</a>
          <a-divider type="vertical"></a-divider>
          <a href="#" @click="handleClear">清除默认选项</a>
        </a-row>
        <!-- 单选 -->
        <a-radio-group style="width: 100%;" @change="onChange" :value="radioId" v-if="mode === 'default'">
          <draggable v-model="custom_data_list" animation="200" @start="drag = true" @end="drag = false" handle=".mover">
            <a-form-item v-for="(item, index) in custom_data_list" :key="index" :validateStatus="item.status" :help="item.help" >
              <a-row type="flex" align="middle">
                <a-col :span="1" class="mover">
                  <a-icon type="drag" />
                </a-col>
                <a-col :span="1">
                  <a-radio :value="item.id" />
                </a-col>
                <a-col :span="12">
                  <a-input placeholder="请输入选项值" v-model="item.value" @change="handleValidate(item, index)"/>
                </a-col>
                <a-col :span="1" class="center">
                  <a-icon :style="{ fontSize: '26px', color: '#52c41a' }" type="plus-square" theme="filled" @click="add(index)"/>
                </a-col>
                <a-col :span="1" class="center">
                  <a-icon :style="{ fontSize: '26px', color: color }" type="minus-square" theme="filled" @click="del(index)" />
                </a-col>
              </a-row>
            </a-form-item>
          </draggable>
        </a-radio-group>
        <!-- 多选 -->
        <a-checkbox-group style="width: 100%;" @change="onChange" :value="checkIds" v-else>
          <draggable v-model="custom_data_list" animation="200" @start="drag = true" @end="drag = false" handle=".mover">
            <a-form-item v-for="(item, index) in custom_data_list" :key="index" :validateStatus="item.status" :help="item.help" >
              <a-row type="flex" align="middle">
                <a-col :span="1" class="mover">
                  <a-icon type="drag" />
                </a-col>
                <a-col :span="1">
                  <a-checkbox :value="item.id" />
                </a-col>
                <a-col :span="12">
                  <a-input placeholder="请输入选项值" v-model="item.value" @change="handleValidate(item, index)"/>
                </a-col>
                <a-col :span="1" class="center">
                  <a-icon :style="{ fontSize: '26px', color: '#52c41a' }" type="plus-square" theme="filled" @click="add(index)"/>
                </a-col>
                <a-col :span="1" class="center">
                  <a-icon :style="{ fontSize: '26px', color: color }" type="minus-square" theme="filled" @click="del(index)" />
                </a-col>
              </a-row>
            </a-form-item>
          </draggable>
        </a-checkbox-group>
      </template>
      <template v-if="dataSource === 'linkData'">
        <a-button @click="handleDefaultLink">数据联动</a-button>
      </template>
    </a-form-item>
    <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="dataSource === 'custom'">
      <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', { initialValue: data.form.quote_type || undefined }]">
        <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
      </a-select>
    </a-form-item>
    <template v-if="dataSource === 'src_path'">
      <a-form-item label="数据字典" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-row>
          <a-select
            placeholder="请选择数据字典"
            :showSearch="true"
            allowClear
            :show-arrow="false"
            option-filter-prop="children"
            v-decorator="['setting[form][src]', { initialValue: data.form.src || undefined, rules: [{required: true, message: '数据字典不能为空'}] }]">
            <a-select-option v-for="value in src_path" :key="value.number" :value="value.number" @click="changeDefault(value.number)">
              {{ value.name }}
            </a-select-option>
          </a-select>
        </a-row>
      </a-form-item>
      <a-form-item label="加载模式" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="formtype === 'combobox'">
        <a-radio-group
          v-decorator="['setting[form][loadMode]', {initialValue: data.form.loadMode || 'static', rules: [{required: true, message: '加载模式不能为空'}]}]" >
          <a-radio value="static">静态</a-radio>
          <a-radio value="dynamic">动态</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select allowClear v-decorator="['setting[form][defaultValue]', { initialValue: data.form.defaultValue || undefined }]">
          <a-select-option v-for="item in dictArr" :key="item.value" :value="item.value" >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', { initialValue: data.form.quote_type || undefined }]">
          <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
        </a-select>
      </a-form-item>
    </template>
    <template v-else-if="dataSource === 'othertable'">
      <a-form-item label="源数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-cascader
          v-decorator="['setting[form][otherTable]', {initialValue: data.form.otherTable || [], rules: [{ required: true, message: '请选择源数据表' }] }]"
          placeholder="请选择源数据表"
          :options="tableField"
          @change="handleTable"
          :show-search="true"
          option-filter-prop="children" />
      </a-form-item>
      <a-form-item label="源数据表字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select
          placeholder="请选择源数据表字段"
          show-search
          option-filter-prop="children"
          v-decorator="['setting[form][otherTableField]', { initialValue: data.form.otherTableField || undefined, rules: [{ required: true, message: '请选择源数据表字段' }] }]" >
          <a-select-option v-for="item in fields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="过滤条件" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-button size="small" @click="codeEditor">
          <a-badge v-if="attributeFlag" status="success" text="条件设置" />
          <a-badge v-else status="default" text="条件设置" />
        </a-button>
      </a-form-item>
    </template>
    <a-modal title="批量编辑" :visible="visible" @ok="handleOk" @cancel="visible = !visible" >
      <a-textarea v-model="edits" :auto-size="{ minRows: 7, maxRows: 10 }" placeholder="请输入" />
    </a-modal>
    <dict-form ref="dictForm" />
    <formula-edit ref="FormulaEdit" :params="formulaData" @ok="handleFormulate" :key="refreshKey" />
    <DateLinkage ref="dataLinkage" @ok="getDateLinkage" :key="linkKey" />
  </a-form>
</template>
<script>
export default {
  components: {
    draggable: () => import('vuedraggable'),
    FormulaEdit: () => import('./FormulaEdit'),
    dictForm: () => import('../Dict/DictForm'),
    DateLinkage: () => import('./DataLinkage')
  },
  props: {
    setting: {
      type: Object,
      default: () => { }
    },
    tableField: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => {}
    },
    dataOld: {
      type: Object,
      default: () => {}
    },
    formtype: {
      type: String,
      default: ''
    },
    parentNumber: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    setting: {
      handler (newVal) {
        this.data = JSON.parse(JSON.stringify(newVal))
        this.data.form = this.data.form && !(this.data.form instanceof Array) ? this.data.form : {}
        this.data.attribute = this.data.attribute && !(this.data.attribute instanceof Array) ? this.data.attribute : {}
        this.attributeFlag = !!this.setting.form.formulateValue
        if (this.formtype === 'radio') {
          this.mode = 'default'
        } else if (this.formtype === 'checkbox') {
          this.mode = 'multiple'
        } else {
          this.mode = this.data.attribute.mode || 'default'
        }
        this.dataSource = this.data.attribute.dataSource || 'src_path'
        switch (this.dataSource) {
          case 'custom':
            this.custom_data_list = this.data.form.custom_data_list || this.custom_data_list
            if (this.mode === 'default') {
              this.radioId = this.data.form.radioId || ''
              this.radioValue = this.data.form.defaultValue || ''
            } else {
              this.checkIds = this.data.form.checkIds || []
              this.checkValue = this.data.form.defaultValue || []
            }
            break
          case 'src_path':
            if (this.data.form.src) {
              this.axios({
                url: '/admin/dict/getCascaderData/',
                params: { parentNumber: this.data.form.src }
              }).then(res => {
                this.dictArr = res.result
              })
            }
            break
          case 'othertable':
            const arr = this.data.form.otherTable || []
            this.tableid = arr[arr.length - 1]
            this.axios({
              url: '/admin/tplview/fieldidTplidArr',
              params: { tableid: this.tableid }
            }).then(res => {
              if (res.code === 0) {
                this.fields = res.result.field
              } else {
                this.$message.error(res.message)
              }
            })
            break
          default:
            break
        }
      },
      immediate: true
    },
    custom_data_list: {
      handler (newVal) {
        this.color = newVal.length !== 1 ? '#ff4d4f' : '#bfbfbf'
      },
      immediate: true
    }
  },
  created () {
    this.axios({
      url: 'admin/dict/getDictList/',
      params: { tableid: this.config.tableid, category: '0' }
    }).then(res => {
      this.src_path = res.result
    })
  },
  data () {
    return {
      linkKey: 'linkKey',
      refreshKey: 'formula',
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      visible: false,
      data: {},
      dataSource: '',
      custom_data_list: [ { id: 1, value: '', status: 'success', help: '' } ],
      color: '#bfbfbf',
      drag: true,
      mode: 'default',
      radioId: '',
      radioValue: '',
      checkIds: [],
      checkValue: [],
      edits: '',
      options: [],
      dictRecord: {},
      pathFlag: false,
      path: [],
      src_path: [],
      quote_types: [
        { value: 'onlyinput', text: '前端页面加载-添加时' },
        { value: 'always', text: '前端页面加载-添加和编辑时' },
        { value: 'onlyinput_db', text: '后台系统加载-添加时' },
        { value: 'onlyupdate_db', text: '后台系统加载-编辑时' },
        { value: 'always_db', text: '后台系统加载-添加和编辑时' }
      ],
      dictArr: [],
      fields: [],
      tableid: '',
      formulaData: {},
      attributeFlag: false // 设置
    }
  },
  methods: {
    // 选择模式
    choiceDataSource (value) {
      this.dataSource = value
    },
    // 获取默认值
    changeDefault (e) {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: e }
      }).then(res => {
        this.dictArr = res.result
        this.pathFlag = true
      })
    },
    // 清除默认选项
    handleClear () {
      this.radioId = ''
      this.radioValue = ''
      this.checkIds = []
      this.checkValue = []
    },
    // 选择默认选项
    onChange (e) {
      if (this.mode === 'default') {
        const id = e.target.value
        this.radioId = id
        const arr = this.custom_data_list.filter(item => item.id === id)
        if (arr.length > 0) {
          this.radioValue = arr[0].value
        }
      } else {
        const ids = e
        this.checkIds = e
        const arr = []
        this.custom_data_list.forEach(item => {
          if (ids.indexOf(item.id) !== -1) {
            arr.push(item.value)
          }
        })
        if (arr.length > 0) {
          this.checkValue = arr
        }
      }
    },
    // 单选框复选框选项宽度选择
    changeType (e) {
      const { setFieldsValue } = this.form
      setFieldsValue({ 'setting[attribute][optionWidth]': undefined })
    },
    // 增加数据源自定义选项
    add (index) {
      const id = new Date().valueOf() + index
      this.custom_data_list.splice(index + 1, 0, { id: id, value: '', status: 'success', help: '' })
      this.color = '#ff4d4f'
    },
    // 删除数据源选项
    del (index) {
      if (this.custom_data_list.length === 1) {
        this.color = '#bfbfbf'
      } else {
        this.custom_data_list.splice(index, 1)
      }
    },
    // 打开批量编辑
    openModal () {
      const arr = this.custom_data_list.map(item => item.value)
      this.edits = arr.join('\n')
      this.visible = true
    },
    // 批量编辑
    handleOk () {
      let arr = this.edits.trim().split('\n')
      const arrSet = new Set(arr)
      // 去重，不允许重复字段
      arr = [...arrSet]
      const ids = this.custom_data_list.map(item => item.id)
      const list = []
      arr.forEach((item, index) => {
        const obj = {}
        if (item) {
          if (ids[index]) {
            obj.id = ids[index]
            obj.value = item
          } else {
            obj.id = new Date().valueOf() + index
            obj.value = item
          }
          list.push(obj)
        }
      })
      this.custom_data_list = list
      this.visible = false
    },
    filterOption (value, option) {
      console.log(value)
      console.log(option)
    },
    // 验证不重复选项
    handleValidate (item, index) {
      const value = {}
      let ids = []
      this.custom_data_list.forEach((ele, eleIndex) => {
        if (ele.value) {
          if (!value[ele.value]) {
            value[ele.value] = ele
          } else {
            const index1 = value[ele.value].id
            ids.push(index1)
            ids.push(ele.id)
          }
        }
        ele.status = 'success'
        ele.help = ''
      })
      ids = [...new Set(ids)]
      this.custom_data_list.forEach(ele => {
        if (ids.indexOf(ele.id) !== -1) {
          ele.status = 'error'
          ele.help = '选项值重复'
        }
      })
    },
    // 选择源数据表
    handleTable (val) {
      const { setFieldsValue } = this.form
      // 初始化字段，窗口等信息
      setFieldsValue({ 'setting[form][otherTableField]': undefined })
      const tableField = val[val.length - 1]
      this.tableid = tableField
      this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: { tableid: tableField }
      }).then(res => {
        if (res.code === 0) {
          this.fields = res.result.field
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 打开设置附加属性
    codeEditor () {
      this.refreshKey = this.refreshKey === 'formula' ? 'formula_1' : 'formula'
      this.formulaData = { tableid: this.tableid, data: this.setting.form.formulateValue ? this.setting.form.formulateValue : {} }
      this.$nextTick(() => {
        this.$refs.FormulaEdit.show({ title: '公式编辑器' })
      })
    },
    // 获取附加属性
    handleFormulate (value) {
      this.setting.form.formulateValue = value.data
      this.attributeFlag = !!value.data
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
    // 提交
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          values.setting.form = values.setting.form || {}
          values.setting.form.defaultValueLink = this.dataSource === 'linkData' ? this.setting.form.defaultValueLink : undefined
          if (values.setting.attribute.dataSource === 'custom') {
            values.setting.form.custom_data_list = this.custom_data_list.filter(item => !!item.value)
            if (this.mode === 'default') {
              values.setting.form.radioId = this.radioId
              values.setting.form.defaultValue = this.radioValue
            } else {
              values.setting.form.checkIds = this.checkIds
              values.setting.form.defaultValue = this.checkValue
            }
          } else if (values.setting.attribute.dataSource === 'src_path') {
            values.setting.form.dictRecord = this.dictRecord
          }
          values.setting.form.formulateValue = this.setting.form.formulateValue || {}
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
}
</style>
