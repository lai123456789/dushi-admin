<template>
  <a-drawer
    :destroyOnClose="true"
    :title="title"
    width="600"
    :visible="visible"
    @close="onClose"
  >
    <a-spin :spinning="loading" >
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="控件类型">
          <a-select @change="handleRadioChange" v-decorator="['type', {rules: [{required: true, message: '请选择控件类型'}], initialValue: item ? item.type :'field'}]">
            <a-select-option value="field">
              字段
            </a-select-option>
            <a-select-option value="component">
              组件
            </a-select-option>
            <a-select-option value="place">
              占位符
            </a-select-option>
            <a-select-option value="divider">
              分割符
            </a-select-option>
            <a-select-option value="work">
              流程办理方式
            </a-select-option>
            <a-select-option value="workRemark">
              流程办理备注
            </a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="showArr === 3">
          <a-form-item label="文本方向" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-radio-group v-decorator="['dividerDirection', {rules: [{required: true, message: '请选择控件类型'}], initialValue: item.dividerDirection ? item.dividerDirection :'left'}]">
              <a-radio value="left">
                左边
              </a-radio>
              <a-radio value="center">
                中间
              </a-radio>
              <a-radio value="right">
                右边
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="展示文字" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['dividerText', {rules: [{required: false}], initialValue: item.dividerText}]"></a-input>
          </a-form-item>
          <a-form-item label="占用列宽" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number v-decorator="['column', {rules: [{required: true, message: '请选择占用列宽'}], initialValue: item.column ? item.column : 24}]" :min="1" :max="24" />
          </a-form-item>
        </template>
        <template v-else-if="showArr === 4">
          <a-form-item label="占用列宽" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number v-decorator="['column', {rules: [{required: true, message: '请选择占用列宽'}], initialValue: item.column ? item.column : 24}]" :min="1" :max="24" />
          </a-form-item>
          <a-form-item label="是否使用分隔符" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-switch v-decorator="['workDivider', {rules: [{required: true, message: '是否使用分隔符'}], initialValue: item.workDivider === '0' ? false : true, valuePropName: 'checked'}]"></a-switch>
          </a-form-item>
        </template>
        <template v-else-if="showArr === 5">
          <a-form-item label="占用列宽" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number v-decorator="['column', {rules: [{required: true, message: '请选择占用列宽'}], initialValue: item.column ? item.column : 24}]" :min="1" :max="24" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item label="选择字段" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr === 0">
            <a-select
              placeholder="请选择字段"
              show-search
              option-filter-prop="children"
              v-decorator="['name', {rules: [{required: true, message: '请选择字段'}], initialValue: item.value ? item.value : undefined}]"
            >
              <a-select-option
                v-for="(myitem, index) in showName"
                :key="index"
                :value="myitem.alias"
                @click="handleClick(index, myitem)"
              >
                {{ myitem.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="组件名称" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr === 1">
            <a-input v-decorator="['componentName', {rules:[{required: true, message: '请填写组件名称'}], initialValue: item ? item.componentName : '' }]" placeholder="请输入"></a-input>
          </a-form-item>
          <a-form-item label="字段规则" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr === 0 || showArr === 1">
            <a-radio-group v-decorator="['fieldrule', {rules: [{required: true, message: '请选择字段规则'}], initialValue: item ? item.fieldrule : 'allow'}]">
              <a-radio value="allow">
                允许
              </a-radio>
              <a-radio value="readonly">
                只读
              </a-radio>
              <a-radio value="hidden">
                隐藏
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="占用列宽" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-input-number v-decorator="['column', {rules: [{required: true, message: '请选择占用列宽'}], initialValue: item.column ? item.column : 6}]" :min="1" :max="24" />
          </a-form-item>
          <a-form-item label="搜索模式" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-radio-group v-decorator="['searchPattern', { rules: [{required: true, message: '请选择搜索模式'}], initialValue: item.searchPattern || 'accurate'}]">
              <a-radio value="accurate">精确搜索</a-radio>
              <a-radio value="fuzzy">模糊搜索</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="隐藏时保留占位符" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr !== 2">
            <a-checkbox @change="handledPlaceholder" :checked="placeholder === '1' ? true : false"></a-checkbox>
          </a-form-item>
          <a-form-item label="修改字段标题" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr !== 2" :required="cTitle ? true : false">
            <a-row :gutter="5">
              <a-col :span="3">
                <a-switch @change="(e) =>{ cTitle = e }" :defaultChecked="item.change_title ? true : false"/>
              </a-col>
              <a-col :span="21" v-if="cTitle">
                <a-form-item>
                  <a-input v-decorator="['change_title', { rules: [{required: cTitle ? true : false, message: '请输入修改字段标题'}], initialValue: item.change_title}]"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr === 0">
            <span slot="label">
              附加属性
              <a-tooltip>
                <template slot="title">
                  实例说明连接：<a href="https://www.yuque.com/xqyyng/lnwitk/wzhdd4" target="_blank">https://www.yuque.com/xqyyng/lnwitk/wzhdd4</a>
                </template>
                <a-icon type="question-circle" v-if="showArr === 0" />
              </a-tooltip>
            </span>
            <a-row type="flex" align="middle" :gutter="8" v-for="(list, index) in attrList" :key="index">
              <a-col flex="auto">
                <a-select @dropdownVisibleChange="onDropdownVisibleChange" v-model="list.eventName" showSearch placeholder="请选择触发事件">
                  <a-select-option v-for="(selItem, selIndex) in dataSource" :key="selIndex" :value="selItem">
                    {{ selItem }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col>
                <a-button @click="codeEditor(list, index)">
                  <a-badge v-if="list.attribute" status="success" text="设置" />
                  <a-badge v-else status="default" text="设置" />
                </a-button>
              </a-col>
              <a-col style="display: flex">
                <a-icon style="font-size: 26px; color: #52c41a; margin-right: 8px;" type="plus-square" theme="filled" @click="add"/>
                <a-icon :style="{ fontSize: '26px', color: minusColor }" type="minus-square" theme="filled" @click="del(index)" />
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-else>
            <span slot="label">
              附加属性
            </span>
            <a-button type="primary" size="small" @click="codeEditor">设置</a-button>
            <a-tag color="green" style="margin-left: 8px;" v-if="item.attribute!=null && item.attribute!=''">已设置</a-tag>
            <a-tag style="margin-left: 8px;" v-else>未设置</a-tag>
          </a-form-item>
          <a-form-item label="有效性检查" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="showArr !== 2">
            <a-select v-decorator="['validitytype', {rules: [{required: false}], initialValue: item ? item.validitytype :''}]" @change="getReg">
              <a-select-option v-for="(regitem, index) in reg" :key="index" :value="regitem[0]">
                {{ regitem[1] }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="校验失败提示" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="regType !== 0">
            <a-input placeholder="请输入校验失败提示" v-decorator="['error_msg', {rules: [{required: true, message:'请输入校验失败提示'}], initialValue: item.validity ? item.validity.error_msg :''}]"></a-input>
          </a-form-item>
          <a-form-item :label="regChoice[1]" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="regType === 2">
            <a-input v-decorator="[regChoice[0], {rules: [{required: true, message:'请填写数值'}], initialValue: item.validity ? item.validity[regKey[0]] :''}]"></a-input>
          </a-form-item>
          <a-form-item :label="regChoice[1]" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="regType === 3">
            <a-input-number v-model="number_scope_min"></a-input-number>
            <a-divider type="vertical" style="opacity: 0"></a-divider>
            <span>-</span>
            <a-divider type="vertical" style="opacity: 0"></a-divider>
            <a-input-number v-model="number_scope_max"></a-input-number>
            <a-divider type="vertical" style="opacity: 0"></a-divider>
            <a-icon type="info-circle" style="color: red;" v-show="number_scope_max_flag || number_scope_min_flag" />
          </a-form-item>
          <a-form-item :label="regChoice[1]" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="regType === 4">
            <a-input v-decorator="[regChoice[0], {rules: [{required: true}], initialValue: regText}]"></a-input>
          </a-form-item>
          <a-form-item label="自定义正则表达式" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="regType === 4">
            <a-select v-decorator="['combo-1623-inputEl', {rules: [{required: false}], initialValue:item.validity ? item.validity['combo-1623-inputEl']:''}]" @change="getRegText">
              <a-select-option v-for="(myitem, index) in regularValue" :key="index" :value="myitem[0]">
                {{ myitem[1] }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="regChoice[1]" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="regType === 5">
            <a-textarea v-decorator="[regChoice[0], {rules: [{required: false}], initialValue: ''}]"></a-textarea>
          </a-form-item>
        </template>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="onClose">关闭</a-button>
      </div>
    </a-spin>
    <!-- 附加属性 -->
    <code-editor ref="codeEditor" @func="getCode"/>
  </a-drawer>
</template>
<script>
export default {
  components: {
    CodeEditor: () => import('@/views/admin/CodeEditor')
  },
  data () {
    return {
      visible: false,
      loading: false,
      config: {},
      item: [], // 设置，父级组件传递的数据
      title: '',
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      form: this.$form.createForm(this),
      selectedItems: [],
      aliasArr: [],
      nameArr: [],
      cTitle: false,
      columnWidth: '',
      choiceIndex: 0,
      showName: [],
      value: '',
      reg: [['', '--无--'],
        ['email', 'Email地址'],
        ['url', 'URL地址'],
        ['idcar', '身份证号'],
        ['postal', '邮政编码'],
        ['text_min', '文本最小长度'],
        ['text_max', '文本最大长度'],
        ['number_max', '数值最大值'],
        ['number_min', '数值最小值'],
        ['number_scope', '数值范围'],
        ['regular', '正则表达式'],
        ['javascript', 'JavaScript脚本']],
      regType: 0, // 0:---无--- ; 1：email、url、idcar、postal; 2：text_min text_max number_max number_min; 3：number_scope; 4： regular 5：javascript;
      showArr: 0, // 选择控件类型，相应选择控件
      regChoice: [],
      regularValue: [['/^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$/', '邮箱'],
        ['/^(1)[0-9]{10}$/', '手机'],
        ['/^[A-Za-z]+$/', '字母'],
        ['/^([+-]?)\\d*\\.?\\d+$/', '数字']],
      regKey: [],
      number_scope_min: '',
      number_scope_max: '',
      number_scope_max_flag: false,
      number_scope_min_flag: false,
      regText: '',
      data: [],
      placeholder: '0', // 占位符
      attrList: [
        { eventName: 'change', attribute: '' }
      ], // 附加属性列表
      dataInit: ['change', 'blur', 'focus', 'click', 'pressEnter', 'search', 'select', 'popupVisibleChange', 'deselect', 'inputKeydown', 'mouseenter', 'mouseleave', 'popupScroll', 'dropdownVisibleChange'],
      dataSource: ['change', 'blur', 'focus', 'click', 'pressEnter', 'search', 'select', 'popupVisibleChange', 'deselect', 'inputKeydown', 'mouseenter', 'mouseleave', 'popupScroll', 'dropdownVisibleChange'],
      listIndex: 0, // 被选中
      minusColor: '#bfbfbf'
    }
  },
  props: {
    fieldsarr: {
      type: Array,
      default () {
        return {}
      },
      required: false
    },
    template: {
      type: Array,
      default () {
        return {}
      },
      required: false
    }
  },
  watch: {
    item (newValue) {
      switch (newValue.type) {
        case 'field':
          this.showArr = 0
          if (newValue.attribute) {
            const attriObj = JSON.parse(newValue.attribute)
            const attriList = []
            for (const key in attriObj) {
              attriList.push({
                eventName: key,
                attribute: attriObj[key]
              })
            }
            this.attrList = attriList
          }
          break
        case 'component':
          this.showArr = 1
          break
        case 'place':
          this.showArr = 2
          break
        case 'divider':
          this.showArr = 3
          break
        case 'work':
          this.showArr = 4
          break
        case 'workRemark':
          this.showArr = 5
          break
        default:
          break
      }
      this.cTitle = !!newValue.change_title
    },
    fieldsarr (newValue) {
      this.nameArr = this.fieldsarr.map((item, index) => {
        return { id: index, name: item.name, alias: item.alias, formtype: item.formtype }
      })
      this.showName = this.nameArr
    },
    attrList (newValue) {
      this.minusColor = newValue.length !== 1 ? '#ff4d4f' : '#bfbfbf'
    }
  },
  created () {
    this.nameArr = this.fieldsarr.map((item, index) => {
      return { id: index, name: item.name, alias: item.alias }
    })
    this.showName = this.nameArr
  },
  methods: {
    // 设置页面显示
    show (config) {
      this.title = config.title
      this.config = config
      this.visible = true
      const item = config.item
      this.item = item
      this.placeholder = item.placeholder
      const obj = {
        alias: item.value,
        name: item.name,
        id: item.fieldid,
        formtype: item.formtype
      }
      if (config.action === 'add') {
        this.regType = 0
      } else {
        this.fieldsarr.unshift(obj)
        if (item.validity) {
          for (var key in item.validity) {
            if (key !== 'error_msg') {
              if (key === 'number_scope_min') {
                this.regType = 3
                this.number_scope_min = item.validity.number_scope_min
              }
              if (key === 'number_scope_max') {
                this.number_scope_max = item.validity.number_scope_max
              }
              this.getReg(key)
            }
          }
        } else {
          this.regType = 0
        }
      }
      switch (item.type) {
        case 'field':
          this.showArr = 0
          break
        case 'component':
          this.showArr = 1
          break
        case 'place':
          this.showArr = 2
          break
        case 'divider':
          this.showArr = 3
          break
        case 'work':
          this.showArr = 4
          break
        case 'workRemark':
          this.showArr = 5
          break
        default:
          break
      }
    },
    // 选择控件类型
    handleRadioChange (e) {
      var key = e
      switch (key) {
        case 'field':
          this.showArr = 0
          break
        case 'component':
          this.showArr = 1
          break
        case 'place':
          this.showArr = 2
          break
        case 'divider':
          this.showArr = 3
          break
        case 'work':
          this.showArr = 4
          break
        case 'workRemark':
          this.showArr = 5
          break
        default:
          break
      }
    },
    // 选择字段
    handleClick (index, item) {
      this.choiceIndex = index
      const { setFieldsValue } = this.form
      if (item.formtype === 'subform' || item.formtype === 'editor') {
        setFieldsValue({ 'column': 24 })
      } else {
        setFieldsValue({ 'column': 6 })
      }
    },
    // 是否保留占位符
    handledPlaceholder (e) {
      this.placeholder = e.target.checked ? '1' : '0'
    },
    // 有效性判断
    getReg (e) {
      if (!e) {
        this.regType = 0
      } else if (['email', 'url', 'idcar', 'postal'].indexOf(e) > -1) {
        this.regType = 1
      } else if (['text_min', 'text_max', 'number_max', 'number_min'].indexOf(e) > -1) {
        this.regType = 2
        this.regKey = [e]
      } else if (['number_scope'].indexOf(e) > -1) {
        this.regType = 3
        this.regKey = ['number_scope_min', 'number_scope_min']
      } else if (['regular'].indexOf(e) > -1) {
        this.regType = 4
        this.regKey = ['regular', 'combo-1623-inputEl']
      } else if (['javascript'].indexOf(e) > -1) {
        this.regType = 5
        this.regKey = [e]
      }
      var arr = this.reg.filter((item) => {
        return e === item[0]
      })
      this.regChoice = arr[0]
    },
    getRegText (e) {
      this.regText = e
    },
    // 打开代码编辑器
    codeEditor (list, index) {
      if (this.showArr === 0) {
        this.listIndex = index
        this.$refs.codeEditor.show({
          value: list.attribute
        })
      } else {
        this.$refs.codeEditor.show({
          value: this.item.attribute
        })
      }
    },
    // 获取代码编辑器数据
    getCode (value) {
      if (this.showArr === 0) {
        const list = this.attrList[this.listIndex]
        list.attribute = value
        this.attrList.splice(this.listIndex, 1, list)
      } else {
        this.item.attribute = value
      }
    },
    // 触发事件的可选值
    onDropdownVisibleChange () {
      this.dataSource = JSON.parse(JSON.stringify(this.dataInit))
      this.attrList.forEach(item => {
        const index = this.dataSource.indexOf(item.eventName)
        this.dataSource.splice(index, 1)
      })
    },
    add () {
      this.attrList.push({
        eventName: undefined,
        attribute: ''
      })
    },
    del (index) {
      if (this.attrList.length !== 1) {
        this.attrList.splice(index, 1)
      }
    },
    onClose () {
      this.visible = false
      this.form.resetFields()
      this.showName = this.nameArr
      if (this.config.action === 'edit') {
        this.fieldsarr.shift()
      }
    },
    // 数据提交给父组件
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          // 判断办理方式是否存在
          if (values.type === 'work') {
            var flag = true
            this.template.forEach(item => {
              if (item.type === 'work') {
                flag = false
              }
            })
            if (this.config.item.type === 'work') {
              flag = true
            }
            if (!flag) {
              this.$message.error('流程办理方式已存在，请勿重复添加')
              return false
            }
          }
          // 判断办理备注是否存在
          if (values.type === 'workRemark') {
            var remarkFlag = true
            this.template.forEach(item => {
              if (item.type === 'workRemark') {
                remarkFlag = false
              }
            })
            if (this.config.item.type === 'workRemark') {
              remarkFlag = true
            }
            if (!remarkFlag) {
              this.$message.error('流程办理备注已存在，请勿重复添加')
              return false
            }
          }
          this.number_scope_max_flag = false
          this.number_scope_max_flag = false
          // 附加属性
          let attribute = ''
          if (this.showArr === 0) {
            const attriObj = {}
            this.attrList.forEach(item => {
              attriObj[item.eventName] = item.attribute
            })
            attribute = JSON.stringify(attriObj)
          } else {
            attribute = this.item.attribute
          }
          var obj = {
            type: values.type,
            name: values.name ? values.name : '',
            formtype: '',
            value: '',
            dividerText: values.dividerText ? values.dividerText : '',
            dividerDirection: values.dividerDirection ? values.dividerDirection : '',
            column: values.column,
            workDivider: '0',
            placeholder: this.placeholder,
            fieldrule: values.fieldrule,
            change_title: values.change_title,
            searchPattern: values.searchPattern,
            attribute: attribute,
            componentName: values.componentName,
            validitytype: values.validitytype,
            validity: {
              error_msg: values.error_msg
            }
          }
          this.regKey.map((item) => {
            obj.validity[item] = values[item]
          })
          if (this.regType === 3) {
            // 自行验证数值范围是否有填写
            if (!this.number_scope_min) {
              this.number_scope_min_flag = true
              this.$message.error('请输入最小值')
              return
            }
            if (!this.number_scope_max) {
              this.number_scope_max_flag = true
              this.$message.error('请输入最大值')
              return
            }
            obj.validity.number_scope_min = this.number_scope_min
            obj.validity.number_scope_max = this.number_scope_max
          }
          switch (values.type) {
            case 'field':
              obj.name = this.choiceIndex || this.choiceIndex === 0 ? this.fieldsarr[this.choiceIndex].name : this.item.name
              obj.formtype = this.choiceIndex || this.choiceIndex === 0 ? this.fieldsarr[this.choiceIndex].formtype : this.item.formtype
              obj.value = this.choiceIndex || this.choiceIndex === 0 ? this.fieldsarr[this.choiceIndex].alias : this.item.value
              break
            case 'component' :
              obj.formtype = 'text'
              obj.name = ''
              obj.value = this.config.action === 'edit' ? this.item.value : (new Date()).valueOf()
              break
            case 'place':
              obj.formtype = 'text'
              obj.fieldrule = 'readonly'
              obj.name = ''
              obj.value = this.config.action === 'edit' ? this.item.value : (new Date()).valueOf()
              break
            case 'divider':
              obj.formtype = ''
              obj.fieldrule = ''
              obj.name = ''
              obj.value = this.config.action === 'edit' ? this.item.value : (new Date()).valueOf()
              break
            case 'work':
              obj.formtype = ''
              obj.fieldrule = ''
              obj.name = ''
              obj.value = this.config.action === 'edit' ? this.item.value : (new Date()).valueOf()
              obj.workDivider = values.workDivider ? '1' : '0'
              break
            case 'workRemark':
              obj.formtype = ''
              obj.fieldrule = ''
              obj.name = ''
              obj.value = this.config.action === 'edit' ? this.item.value : (new Date()).valueOf()
              break
            default:
              break
          }
          this.$emit('func', obj)
          this.visible = false
          if (this.config.action === 'edit') {
            this.fieldsarr.shift()
          }
          this.form.resetFields()
        }
      })
    }
  }
}
</script>
