<template>
  <a-form :form="form">
    <a-form-item label="允许输入长度" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-row :gutter="24">
        <a-col :span="4"><a-form-item><a-input-number :min="0" v-decorator="['setting[attribute][minLength]', {initialValue: data.attribute.minLength || ''}]"/></a-form-item></a-col>
        <a-col :span="1"><p style="text-align:center;">至</p></a-col>
        <a-col :span="4"><a-form-item><a-input-number :min="0" v-decorator="['setting[attribute][maxLength]', {initialValue: data.attribute.maxLength || ''}]"/></a-form-item></a-col>
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
    <a-form-item label="后置图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-checkbox-group @change="handleLatter" :defaultValue="setting.form.latterIcon || []">
        <a-checkbox value="message">
          短信
        </a-checkbox>
        <a-checkbox value="telephone">
          电话
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
    <a-form-item label="数据源" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select
        @change="choiceDataSource"
        v-decorator="['setting[attribute][dataSource]', { initialValue: data.attribute.dataSource || 'custom', rules: [{required: true, message: '数据源不能为空'}] }]">
        <a-select-option value="custom">
          自定义
        </a-select-option>
        <a-select-option value="othertable">
          其他数据表
        </a-select-option>
      </a-select>
      <template v-if="dataSource === 'custom'">
        <a-row>
          <a href="#" @click="openModal">批量编辑</a>
        </a-row>
        <draggable v-model="custom_data_list" animation="200" @start="drag = true" @end="drag = false" handle=".mover">
          <a-form-item v-for="(item, index) in custom_data_list" :key="index" :validateStatus="item.status" :help="item.help" >
            <a-row type="flex" align="middle">
              <a-col :span="1" class="mover">
                <a-icon type="drag" />
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
      </template>
    </a-form-item>
    <template v-if="dataSource === 'othertable'">
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
        <a-button size="small" @click="openFormulate">
          <a-badge v-if="attributeFlag" status="success" text="条件设置" />
          <a-badge v-else status="default" text="条件设置" />
        </a-button>
      </a-form-item>
    </template>
    <a-form-item label="清空图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-switch
        un-checked-children="关"
        checked-children="开"
        v-decorator="['setting[form][clearIcon]', { initialValue: data.form.clearIcon === '1' ? true : false, valuePropName: 'checked'}]" />
    </a-form-item>
    <a-modal title="批量编辑" :visible="visible" @ok="handleOk" @cancel="visible = !visible" >
      <a-textarea v-model="edits" :auto-size="{ minRows: 7, maxRows: 10 }" placeholder="请输入" />
    </a-modal>
    <formula-edit ref="FormulaEdit" :params="formulaData" @ok="handleFormulate" :key="refreshKey" />
    <menu-icon :key="menuKey" @ok="getIcon" ref="menuIcon"></menu-icon>
    <code-editor ref="codeEditor" @func="getCode"/>
    <DateLinkage ref="dataLinkage" @ok="getDateLinkage" :key="linkKey" />
  </a-form>
</template>
<script>
export default {
  components: {
    MenuIcon: () => import('../Menu/MenuIcon'),
    CodeEditor: () => import('@/views/admin/CodeEditor'),
    draggable: () => import('vuedraggable'),
    FormulaEdit: () => import('./FormulaEdit'),
    dictForm: () => import('../Dict/DictForm'),
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
        this.data.attribute = this.data.attribute && !(this.data.attribute instanceof Array) ? this.data.attribute : {}
        this.iconFlag = this.data.form.prefixType
        this.prefixVal = this.data.form.prefixVal
        this.prefixIcon = this.data.form.prefixIcon
        this.attributeFlag = !!this.data.form.latterVal
        this.dataSource = this.data.attribute.dataSource || 'custom'
        switch (this.dataSource) {
          case 'custom':
            this.custom_data_list = this.data.form.custom_data_list || this.custom_data_list
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
  data () {
    return {
      linkKey: 'linkKey',
      refreshKey: 'formula',
      menuKey: 'menuKey',
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      visible: false,
      data: {},
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
      formulaData: {}
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
    // 前缀
    getPrefixVal (e) {
      const val = e.target.value
      this.prefixVal = val.slice(0, 1)
      this.data.form.prefixType = this.prefixVal
    },
    // 显示图标库
    handleMenuIcon () {
      this.menuKey = this.menuKey ? 'menuKey_1' : 'menuKey'
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
    handleLatter (val) {
      this.data.form.latterIcon = val
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
    // 选择模式
    choiceDataSource (value) {
      this.dataSource = value
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
    // 打开批量编辑
    openModal () {
      const arr = this.custom_data_list.map(item => item.value)
      this.edits = arr.join('\n')
      this.visible = true
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
    // 批量编辑
    handleOk () {
      let arr = this.edits.trim().split('\n')
      const arrSet = new Set(arr)
      // 去重，不允许重复字段
      arr = [...arrSet]
      const ids = this.custom_data_list.map(item => item.id)
      const list = []
      arr.forEach((item, index) => {
        if (item) {
          const obj = {}
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
    // 打开过滤条件
    openFormulate () {
      this.refreshKey = this.refreshKey === 'formula' ? 'formula_1' : 'formula'
      this.formulaData = { tableid: this.tableid, data: this.setting.form.formulateValue || {} }
      this.$nextTick(() => {
        this.$refs.FormulaEdit.show({ title: '公式编辑器', dataType: 'formulateValue' })
      })
    },
    // 获取附加属性
    handleFormulate (value) {
      this.setting.form.conditinValue = value.data
      this.attributeFlag = !!value.data
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
          values.setting.form.prefixType = this.iconFlag
          values.setting.form.defaultValueLink = this.dataSource === 'linkData' ? this.setting.form.defaultValueLink : undefined
          if (values.setting.form.prefixType === 'word') {
            values.setting.form.prefixVal = this.prefixVal
          } else if (values.setting.form.prefixType === 'icon') {
            values.setting.form.prefixIcon = this.prefixIcon
          }
          values.setting.form.latterIcon = this.data.form.latterIcon
          values.setting.form.latterVal = this.data.form.latterVal
          if (values.setting.attribute.dataSource === 'custom') {
            values.setting.form.custom_data_list = this.custom_data_list.filter(item => !!item.value)
          } else if (values.setting.attribute.dataSource === 'src_path') {
            values.setting.form.dictRecord = this.dictRecord
          }
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
