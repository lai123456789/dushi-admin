<template>
  <a-form :form="form">
    <a-form-item label="允许输入长度" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success">
      <a-row :gutter="8">
        <a-col :span="11">
          <a-form-item>
            <a-input-number
              style="width: 100%"
              :min="minLength"
              @change="handleMin"
              v-decorator="['setting[attribute][minLength]', {initialValue: data.attribute.minLength || ''}]"/>
          </a-form-item>
        </a-col>
        <a-col :span="2"><p style="text-align:center;">至</p></a-col>
        <a-col :span="11"><a-form-item><a-input-number style="width:100%" :min="maxLength" v-decorator="['setting[attribute][maxLength]', {initialValue: data.attribute.maxLength || ''}]"/></a-form-item></a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="格式" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][regex]', { initialValue: data.attribute.regex || '' }]">
        <a-select
          slot="addonAfter"
          style="width: 120px"
          v-decorator="['setting[attribute][text_regexType_inputEl]', {initialValue: data.attribute.text_regexType_inputEl || ''}]"
          @change="getReg">
          <a-select-option v-for="regex in regexs" :key="regex.value" :value="regex.value">{{ regex.text }}</a-select-option>
        </a-select>
      </a-input>
    </a-form-item>
    <a-form-item label="输入提示" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['setting[attribute][emptyText]', {initialValue: data.attribute.emptyText || ''}]" />
    </a-form-item>
    <a-form-item label="关联模式" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-radio-group @change="getMode" v-decorator="['setting[form][mode]', {initialValue: data.form.mode || 'combobox', rules: [{ required: true, message: '请选择关联模式'}] }]" >
        <a-radio value="combobox">
          下拉框模式
        </a-radio>
        <a-radio value="dialog">
          对话框模式
        </a-radio>
        <a-radio value="dialog_com">
          下拉框&对话框模式
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="关联的源数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-cascader
        v-decorator="['setting[form][linkList]', {initialValue: data.form.linkList || [], rules: [{ required: true, message: '请选择关联的源数据表'}] }]"
        placeholder="请选择源数据表"
        :show-search="true"
        option-filter-prop="children"
        :options="tableField"
        @change="handleTable"
      />
    </a-form-item>
    <a-form-item label="关联的源数据表字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select
        placeholder="请选择源数据表字段"
        show-search
        option-filter-prop="children"
        @change="handleLinkField"
        v-decorator="['setting[form][linkField]', {initialValue: data.form.linkField || undefined, rules: [{ required: true, message: '请选择源数据表字段'}]}]"
      >
        <a-select-option v-for="item in textFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="下拉可搜索的字段" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success" v-if="linkMode !== 'dialog'">
      <a-select
        placeholder="请选择源数据表字段"
        allowClear
        show-search
        option-filter-prop="children"
        v-decorator="['setting[form][searchField_1]', {initialValue: data.form.searchField_1 || undefined, rules: [{ required: false, message: '请选择当前表字段'}]}]"
      >
        <a-select-option v-for="item in textFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
      </a-select>
      <a-select
        placeholder="请选择源数据表字段"
        allowClear
        show-search
        option-filter-prop="children"
        v-decorator="['setting[form][searchField_2]', {initialValue: data.form.searchField_2 || undefined, rules: [{ required: false, message: '请选择当前表字段'}]}]"
      >
        <a-select-option v-for="item in textFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
      </a-select>
      <a-select
        placeholder="请选择源数据表字段"
        allowClear
        show-search
        option-filter-prop="children"
        v-decorator="['setting[form][searchField_3]', {initialValue: data.form.searchField_3 || undefined, rules: [{ required: false, message: '请选择当前表字段'}]}]"
      >
        <a-select-option v-for="item in textFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="对话框数据窗口" :labelCol="labelCol" :wrapperCol="wrapperCol" v-show="linkMode !== 'combobox'">
      <a-select
        :allowClear="true"
        show-search
        option-filter-prop="children"
        placeholder="请选择对话框数据窗口"
        v-decorator="['setting[form][dataView]', { initialValue: data.form.dataView || undefined, rules: [{ required:linkMode !== 'combobox'? true : false, message: '请选择对话框数据窗口'}] }]">
        <a-select-option v-for="item in tpl" :key="item.uid" :value="item.uid">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="可关联数据过滤条件" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-button @click="filterAdd">添加</a-button>
      <a-table
        ref="table"
        rowKey="id"
        :columns="filtercolumns"
        :dataSource="filterconditions"
        size="small"
        :pagination="false">
        <span slot="sourceField" slot-scope="text, record">
          <a-select
            size="small"
            show-search
            option-filter-prop="children"
            allowClear
            @change="(val) => { getFilterField(val, record) }"
            :defaultValue="text" >
            <a-select-option v-for="item in record.linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
          </a-select>
        </span>
        <span slot="op" slot-scope="text, record">
          <a-select
            size="small"
            show-search
            option-filter-prop="children"
            allowClear
            @change="(val) => { record.op = val }"
            defaultValue="=" >
            <a-select-option value="=">等于</a-select-option>
            <a-select-option value="!=">不等于</a-select-option>
            <a-select-option value=">" v-if="showType">大于</a-select-option>
            <a-select-option value=">=" v-if="showType">大于等于</a-select-option>
            <a-select-option value="<" v-if="showType">小于</a-select-option>
            <a-select-option value="<=" v-if="showType">小于等于</a-select-option>
          </a-select>
        </span>
        <span slot="field" slot-scope="text, record">
          <a-select
            size="small"
            show-search
            option-filter-prop="children"
            allowClear
            @change="(val) => { getBenField(val, record) }"
            :defaultValue="text" >
            <a-select-option v-for="item in record.currentFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
          </a-select>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleDelFilter(record)">删除</a>
        </span>
      </a-table>
    </a-form-item>
    <a-form-item label="关联映射设置" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-button @click="handleAdd">添加</a-button>
      <a-table
        ref="table"
        rowKey="id"
        :columns="columns"
        :dataSource="conditions"
        size="small"
        :pagination="false">
        <span slot="sourceField" slot-scope="text, record">
          <a-select
            size="small"
            show-search
            option-filter-prop="children"
            allowClear
            @change="(val) => { getSourceField(val, record) }"
            :defaultValue="text" >
            <a-select-option v-for="item in record.linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
          </a-select>
        </span>
        <span slot="field" slot-scope="text, record">
          <a-select
            size="small"
            show-search
            option-filter-prop="children"
            allowClear
            @change="(val) => { getField(val, record) }"
            :defaultValue="text" >
            <a-select-option v-for="item in record.currentFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
          </a-select>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleDel(record)">删除</a>
          <a-divider type="vertical" />
          <a @click="handleSubform(record)" v-if="record.formtype === 'subform'">设置子表字段</a>
        </span>
      </a-table>
    </a-form-item>
    <LinkDataSubform ref="linkDataSubform" @ok="getMapping" />
  </a-form>
</template>
<script>
export default {
  components: {
    LinkDataSubform: () => import('./LinkDataSubform')
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    },
    tableField: {
      type: Array,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    setting: {
      handler (newVal) {
        this.data.attribute = newVal.attribute && !(newVal.attribute instanceof Array) ? newVal.attribute : {}
        this.data.form = newVal.form && !(newVal.form instanceof Array) !== 0 ? newVal.form : {}
        //  初始化本表字段数组
        const parameter = {
          pageNo: 1,
          pageSize: 1000,
          sortField: 'id',
          sortOrder: 'descend'
        }
        const currentP = new Promise((resolve, reject) => {
          this.axios({
            url: '/admin/field/init',
            params: Object.assign(parameter, { tableid: this.config.tableid })
          }).then(res => {
            if (res.code === 0) {
              this.currentFields = res.result.data
              this.filtercurrent = this.currentFields.filter(item => (item.formtype === 'text' || item.formtype === 'number' || item.formtype === 'datetime' || item.formtype === 'associated' || item.formtype === 'combobox' || item.formtype === 'radio' || item.formtype === 'autocomplete' || item.formtype === 'serialnumber'))
              this.currentFields.forEach(item => {
                this.currentFieldsObj[item.alias] = item
              })
              this.filtercurrent.forEach(item => {
                this.filtercurrentObj[item.alias] = item
              })
              resolve()
            } else {
              this.$message.error(res.message)
              reject(res.message)
            }
          })
        })
        // 初始化当前关联数据源
        if (this.config.action !== 'add' && this.config.record.formtype === 'associated') {
          this.conditions = this.data.form.conditions || []
          this.filterconditions = this.data.form.associated || []
          const val = this.data.form.linkList
          const tableField = val[val.length - 1]
          const param = {
            pageNo: 1,
            pageSize: 1000,
            sortField: 'id',
            sortOrder: 'descend'
          }
          const p = new Promise((resolve, reject) => {
            this.axios({
              url: '/admin/field/init',
              params: Object.assign(param, { tableid: tableField })
            }).then(res => {
              if (res.code === 0) {
                this.linkFields = res.result.data
                this.textFields = this.linkFields.filter(item => item.formtype === 'text' || item.formtype === 'associated' || item.formtype === 'serialnumber')
                this.filterFields = this.linkFields.filter(item => (item.formtype === 'text' || item.formtype === 'number' || item.formtype === 'datetime' || item.formtype === 'associated' || item.formtype === 'combobox' || item.formtype === 'radio' || item.formtype === 'autocomplete' || item.formtype === 'cascader' || item.formtype === 'serialnumber'))
                res.result.data.forEach(item => {
                  this.linkFieldsObj[item.alias] = item
                })
                res.result.data.forEach(item => {
                  this.filterFieldsObj[item.alias] = item
                })
                resolve()
              } else {
                this.$message.error(res.message)
              }
            })
          })
          p.then(res => {
            this.conditions = this.conditions.map(item => {
              // item.linkFields = item.sourceField ? this.linkFields.filter(item1 => item1.formtype === this.linkFieldsObj[item.sourceField].formtype) : this.linkFields
              item.linkFields = this.linkFields
              return item
            })
            this.filterconditions = this.filterconditions.map(item => {
              // item.linkFields = item.sourceField ? this.filterFields.filter(item1 => item1.formtype === this.filterFieldsObj[item.sourceField].formtype) : this.filterFields
              item.linkFields = this.filterFields
              return item
            })
          })
          currentP.then(res => {
            this.conditions = this.conditions.map(item => {
              // item.currentFields = item.field ? this.currentFields.filter(item1 => item1.formtype === this.currentFieldsObj[item.field].formtype) : this.currentFields
              item.currentFields = this.currentFields
              return item
            })
            this.filterconditions = this.filterconditions.map(item => {
              // item.currentFields = item.field ? this.filtercurrent.filter(item1 => item1.formtype === this.filtercurrentObj[item.field].formtype) : this.filtercurrent
              item.currentFields = this.filtercurrent
              return item
            })
          })
          this.axios({
            url: '/admin/tplview/fieldidTplidArr',
            params: { tableid: tableField }
          }).then(res => {
            if (res.code === 0) {
              this.tpl = res.result.tpl
            } else {
              this.$message.error(res.message)
            }
          })
          this.linkMode = this.data.form.mode
        }
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
      showType: false,
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
      minLength: 0,
      maxLength: 0,
      linkMode: 'combobox', // 关联模式
      linkFields: [], // 关联数据表字段
      filterFields: [], // 关联数据表字段过滤
      filterFieldsObj: {}, // 选中数据表字段过滤
      textFields: [], // 单行文本字段
      linkFieldId: '',
      linkFieldsObj: {}, // 选中数据表字段
      currentFields: [], // 当前表字段
      filtercurrent: [], // 当前表字段过滤
      currentFieldsObj: {}, // 当前表字段
      filtercurrentObj: {}, // 选中当前表字段过滤
      associated: [{
        linkFields: '', // 关联数据表字段(源数据表字段)
        op: '', // 比较方式
        currentFields: '' // 当前表字段
      }, {
        linkFields: '', // 关联数据表字段(源数据表字段)
        op: '', // 比较方式
        currentFields: '' // 当前表字段
      }],
      tpl: [], // 关联数据视图
      attributeFlag: false, // 是否有设置
      conditions: [],
      filterconditions: [],
      columns: [{
        title: '源数据表字段',
        dataIndex: 'sourceField',
        scopedSlots: { customRender: 'sourceField' },
        width: 240
      }, {
        title: '本表字段',
        dataIndex: 'field',
        scopedSlots: { customRender: 'field' },
        width: 240
      }, {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }],
      filtercolumns: [{
        title: '源数据表字段的值',
        dataIndex: 'sourceField',
        scopedSlots: { customRender: 'sourceField' },
        width: 200
      }, {
        title: '比较方式',
        dataIndex: 'op',
        scopedSlots: { customRender: 'op' },
        width: 100
      }, {
        title: '本表字段的值',
        dataIndex: 'field',
        scopedSlots: { customRender: 'field' },
        width: 200
      }, {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }]
    }
  },
  methods: {
    // 允许输入长度最小值
    handleRequire (val) {
      this.minLength = val === 'true' ? 1 : 0
    },
    // 允许输入长度最大值
    handleMin (val) {
      this.maxLength = val
    },
    getReg (val) {
      const { setFieldsValue } = this.form
      setFieldsValue({ 'setting[attribute][regex]': val })
    },
    // 选择源数据表
    handleTable (val) {
      const { setFieldsValue } = this.form
      // 初始化字段，窗口等信息
      setFieldsValue({ 'setting[form][linkField]': undefined })
      setFieldsValue({ 'setting[form][dataView]': undefined })
      setFieldsValue({ 'setting[form][searchField_1]': undefined })
      setFieldsValue({ 'setting[form][searchField_2]': undefined })
      setFieldsValue({ 'setting[form][searchField_3]': undefined })
      this.conditions = []
      this.filterconditions = []
      const tableField = val[val.length - 1]
      this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: { tableid: tableField }
      }).then(res => {
        if (res.code === 0) {
          this.tpl = res.result.tpl
        } else {
          this.$message.error(res.message)
        }
      })
      const param = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      this.axios({
        url: '/admin/field/init',
        params: Object.assign(param, { tableid: tableField })
      }).then(res => {
        if (res.code === 0) {
          this.linkFields = res.result.data
          this.filterFields = this.linkFields.filter(item => (item.formtype === 'text' || item.formtype === 'number' || item.formtype === 'datetime' || item.formtype === 'associated' || item.formtype === 'combobox' || item.formtype === 'radio' || item.formtype === 'autocomplete' || item.formtype === 'cascader' || item.formtype === 'serialnumber'))
          res.result.data.forEach(item => {
            this.filterFieldsObj[item.alias] = item
          })
          this.textFields = this.linkFields.filter(item => item.formtype === 'text' || item.formtype === 'associated' || item.formtype === 'serialnumber')
          res.result.data.forEach(item => {
            this.linkFieldsObj[item.alias] = item
          })
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 获取源数据表关联字段id
    handleLinkField (val) {
      this.linkFieldId = this.linkFieldsObj[val].fieldid
    },
    getSourceField (val, record) {
      record.sourceField = val
      // if (!val) {
      record.linkFields = this.linkFields
      record.currentFields = this.currentFields
      // } else {
      //   record.linkFields = this.linkFields
      //   record.currentFields = this.currentFields
      // }
      this.conditions = JSON.parse(JSON.stringify(this.conditions))
    },
    getFilterField (val, record) {
      this.showType = true
      for (const i in record.linkFields) {
        if (val === record.linkFields[i].alias && record.linkFields[i].formtype !== 'number' && record.linkFields[i].formtype !== 'datetime') {
          this.showType = false
        }
      }
      record.sourceField = val
      // if (!val) {
      record.linkFields = this.filterFields
      record.currentFields = this.filtercurrent
      // } else {
      //   const formtype = this.filterFieldsObj[val].formtype
      //   record.linkFields = this.filterFields.filter(item => item.formtype === formtype)
      //   record.currentFields = this.filtercurrent.filter(item => item.formtype === formtype)
      // }
      this.filterconditions = JSON.parse(JSON.stringify(this.filterconditions))
    },
    getBenField (val, record) {
      this.showType = true
      record.field = val
      // if (!val) {
      record.linkFields = this.filterFields
      record.currentFields = this.filtercurrent
      // } else {
      // const formtype = this.filtercurrentObj[val].formtype
      // record.linkFields = this.linkFields.filter(item => item.formtype === formtype)
      // record.currentFields = this.filtercurrent.filter(item => item.formtype === formtype)
      if (this.currentFieldsObj[val].formtype === 'subform') {
        record.formtype = this.filtercurrentObj[val].formtype
      } else {
        delete record.formtype
      }
      // }
      for (const i in record.currentFields) {
        if (val === record.currentFields[i].alias && record.currentFields[i].formtype !== 'number' && record.currentFields[i].formtype !== 'datetime') {
          this.showType = false
        }
      }
      this.filterconditions = JSON.parse(JSON.stringify(this.filterconditions))
    },
    getField (val, record) {
      record.field = val
      // if (!val) {
      record.linkFields = this.linkFields
      record.currentFields = this.currentFields
      // } else {
      //   const formtype = this.currentFieldsObj[val].formtype
      //   record.linkFields = this.linkFields.filter(item => item.formtype === formtype)
      //   record.currentFields = this.currentFields.filter(item => item.formtype === formtype)
      if (this.currentFieldsObj[val].formtype === 'subform') {
        record.formtype = this.currentFieldsObj[val].formtype
      } else {
        delete record.formtype
      }
      // }
      this.conditions = JSON.parse(JSON.stringify(this.conditions))
    },
    // 添加映射条件
    handleAdd () {
      this.conditions.push({
        id: new Date().valueOf(),
        sourceField: '',
        field: '',
        linkFields: this.linkFields,
        currentFields: this.currentFields
      })
    },
    // 添加可关联数据过滤条件
    filterAdd () {
      this.filterconditions.push({
        id: new Date().valueOf(),
        sourceField: '',
        field: '',
        op: '=',
        linkFields: this.filterFields,
        currentFields: this.filtercurrent
      })
    },
    // 删除映射条件
    handleDel (record) {
      const conditions = this.conditions.filter(item => item.id !== record.id)
      this.conditions = JSON.parse(JSON.stringify(conditions))
    },
    handleDelFilter (record) {
      const filterconditions = this.filterconditions.filter(item => item.id !== record.id)
      this.filterconditions = JSON.parse(JSON.stringify(filterconditions))
    },
    // 获取关联模式
    getMode (e) {
      this.linkMode = e.target.value
    },
    // 打开子表映射设置
    handleSubform (record) {
      if (this.linkFields.length === 0) {
        const { validateFields } = this.form
        validateFields(['setting[attribute][linkList]'], (errors, values) => { })
      } else {
        this.$refs.linkDataSubform.show({
          title: '子表字段关系映射设置',
          dataView: this.currentFieldsObj[record.field].setting.form ? this.currentFieldsObj[record.field].setting.form.dataSheet[1] : '',
          sourceDataView: this.linkFieldsObj[record.sourceField].setting.form ? this.linkFieldsObj[record.sourceField].setting.form.dataSheet[1] : '',
          record: record
        })
      }
    },
    // 获取子表映射设置
    getMapping (record) {
      this.conditions.forEach(item => {
        if (item.id === record.id) {
          item = record
        }
      })
    },
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          let conditions = JSON.parse(JSON.stringify(this.conditions))
          let filterconditions = JSON.parse(JSON.stringify(this.filterconditions))
          filterconditions = filterconditions.map(item => {
            delete item.linkFields
            delete item.currentFields
            return item
          })
          conditions = conditions.map(item => {
            delete item.linkFields
            delete item.currentFields
            return item
          })
          values.setting.form.associated = filterconditions
          values.setting.form.conditions = conditions
          values.setting.form.linkFieldId = this.linkFieldId
          val = values
        }
      })
      return val
    }
  }
}
</script>
