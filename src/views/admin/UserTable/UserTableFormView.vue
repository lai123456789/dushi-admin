<template>
  <!-- 表单组件 -->
  <a-spin :spinning="pageLoading">
    <a-form :form="form" @submit="handleSubmit">
      <buildBlocks
        ref="buildBlocks"
        v-for="(item, keys) in template"
        :disabled="item.disabled"
        :dynamicData="{}"
        :key="item.key"
        :record.sync="template[keys]"
        :indexs="keys"
        :formConfig="item.formConfig"
        :config="{}"
        :tableName="tableName"
        :viewThis="viewThis"
        :formdata="formdata"
        :params="params"
        :parentParams="parentParams"
        :formThis="formThis"
        :templateObj="templateObj"
        :fieldRule="fieldRule"
        :handleWayData="handleWayData"
        :linkData="linkData"
        :templateOther="templateOther"
        @templateRule="templateRule"
        @recoveryRule="recoveryRule"
        @give="giveData"
        @changeTem="changeTem"
        @sendEvent="sendEvent"
        @wayRule="wayRule"
        @resetTem="resetTem"
        @sentLinkData="sentLinkData"
        @getRuleAlias="getRuleAlias"
        @cardAdd="(data, index)=>{template.splice(index + 1, 0, data)}"
        @cardDel="(index)=> {template.splice(index, 1)}"
      />
      <a-row v-if="params.page === 'workflow' && parentParams.viewType !== 'view' && !workExist && num > 0">
        <a-divider orientation="left">流程办理</a-divider>
        <a-form-item
          label="办理方式"
          :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol"
          :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol">
          <a-radio-group v-decorator="['handleWay', {initialValue: defaultWay, rules: [{required: true, message: '请选择办理方式'}]}]" >
            <a-radio
              v-for="(item, index) in params.handleWayData"
              :key="index"
              @change="handleWayChange"
              :value="item.alias"
              :checked="item.default === '1'"
              v-show="item.onoff && (item.display === 'v' || !item.display) ">{{ item.way }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol" :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol" label="办理备注" v-if="params.remarksrule !== 'hidden' && !workRemarkExist">
          <a-textarea
            :rows="4"
            v-decorator="['handleRemarks', {initialValue: handleRemarks, rules: [{required: params.remarksrule === 'show_allow' ? true : false, message: '办理备注不能为空'}]}]"
          />
        </a-form-item>
      </a-row>
      <a-row v-if="params.remarksrule !== 'hidden' && !workRemarkExist && workExist && params.page === 'workflow' && parentParams.viewType !== 'view' && num > 1">
        <a-form-item :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol" :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol" label="办理备注" >
          <a-textarea
            :rows="4"
            v-decorator="['handleRemarks', {initialValue: handleRemarks, rules: [{required: params.remarksrule === 'show_allow' ? true : false, message: '办理备注不能为空'}]}]"
          />
        </a-form-item>
      </a-row>
    </a-form>
    <!-- 办理按钮 其他办理事项（不是直接提交办理）：如弹出另一个抽屉  智能派单界面-->
    <component ref="submitPreView" :is="submitPreView"/>
    <order-check ref="orderCheck" />
    <!-- 自定义引入组件 -->
    <user-table-components ref="userTableComponents" />
  </a-spin>
</template>
<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  components: {
    OrderCheck: () => import('@/views/crm/OrderCheck'),
    buildBlocks: () => import('./UserTableFormBuild'),
    UserTableComponents: () => import('./UserTableComponents')
  },
  data () {
    return {
      submitPreView: null, // 提交前视图
      action: 'edit',
      form: this.$form.createForm(this),
      labelCol: { style: 'width: 100px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block' },
      viewThis: this,
      tableName: '',
      template: [],
      viewData: { },
      // 用于定制开发作数据交换时使用，自定义组件时使用parent.$set(parent.data, 'mydata', 'hello')
      linkData: {}, // 用于数据联动
      linkDataEffect: {}, // 数据联动
      handleWayData: [],
      wayDataRule: [],
      handleWayDataOther: [],
      wayDataAttribute: {},
      templateObj: {},
      templateOtherObj: {},
      templateOther: [], // 用于恢复template数据
      pageLoading: false,
      values: {},
      defaultWay: '',
      handleRemarks: '',
      alias: '', // 鼠标进入的字段
      type: '', // 鼠标进入的字段的类型
      actions: new Map([[
        '', function (value, inputValue) {
          return true
        } ], [
        'contain', function (value, inputValue, allValue, all) {
          if (all) {
            if (all.indexOf(allValue) !== -1 && inputValue) {
              return true
            } else if (all.indexOf(allValue) === -1) {
              return false
            }
          } else if (inputValue.indexOf(value) === -1) {
            return false
          } else if (inputValue.indexOf(value) !== -1) {
            return true
          }
        } ], [
        'nc', function (value, inputValue, allValue, all) {
          if (all) {
            if (all.indexOf(allValue) === -1) {
              return true
            } else if (all.indexOf(allValue) !== -1) {
              return false
            }
          } else if (inputValue.indexOf(value) !== -1) {
            return false
          } else if (inputValue.indexOf(value) === -1) {
            return true
          }
        } ], [
        'equal', function (value, inputValue) {
          if (inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'great', function (value, inputValue) {
          if (inputValue > value) {
            return true
          } else {
            return false
          }
        } ], [
        'ne', function (value, inputValue) {
          if (inputValue !== value) {
            return true
          } else {
            return false
          }
        } ], [
        'lt', function (value, inputValue) {
          if (inputValue < value) {
            return true
          } else {
            return false
          }
        } ], [
        'ge', function (value, inputValue) {
          if (inputValue > value || inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'le', function (value, inputValue) {
          if (inputValue < value || inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'bw', function (value, inputValue) {
          if (inputValue.indexOf(value) === 0) {
            return true
          } else {
            return false
          }
        } ], [
        'ew', function (value, inputValue) {
          const len = value.length
          if (inputValue.slice(-len) === value) {
            return true
          } else {
            return false
          }
        } ] ]),
      data: [],
      addressValue: {},
      workExist: false, // 判断表单视图中是否有配置办理流程
      workRemarkExist: false, // 判断表单视图中是否有配置办理方式备注
      cardKey: '',
      aliasKey: '',
      wayRuleAlias: [], // 转部门字段
      templateAll: [],
      formdata: {}, // 表单元素
      fieldRule: [],
      num: 0 // 初始化进入
    }
  },
  props: {
    params: {
      type: Object,
      default () {
        return {
          tableName: '',
          parentParams: {}, // 父级的params
          template: [],
          fileList: [],
          page: '', // 传递来的页面，表单视图为'user', WorkflowHandleForm的页面可以传空值也可以传其他
          handleWayData: [], // WorkflowHandleForm的waydata
          wayDataAttribute: {},
          templateOther: [],
          remarksrule: '' // 办理方式show_no_allow可见选填，show_allow可见必填 hidden隐藏
        }
      },
      required: true
    },
    formThis: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  watch: {
    params: {
      handler (newValue) {
        const val = newValue
        this.action = val.action
        this.tableName = val.tableName
        this.template = newValue.template
        this.templateOther = []
        this.workExist = false
        this.workRemarkExist = false
        const gridData = [{
          'type': 'grid',
          'label': '栅格布局',
          'columns': [],
          'options': {
            'gutter': 5
          },
          'key': 'grid' + new Date().getTime()
        }]
        newValue.template.forEach(item => {
          if (item.column) {
            const items = []
            items.push(item)
            gridData[0].columns.push({
              'span': item.column,
              'list': items
            })
          } else {
            gridData.push(item)
          }
        })
        this.template = gridData
        if (this.action === 'add') {
          this.template = this.filterSubForm(this.template)
        }
        this.templateAll = []
        this.getArray(this.template)
        this.$nextTick(() => {
          this.formdata = this.form.getFieldsValue()[this.tableName] || {}
        })
        this.fieldRule = val.fieldRule
        this.getRecoveryArray(JSON.parse(JSON.stringify(val.templateOther)))
        // 判断办理方式在视图中是否有配置
        this.templateOther.forEach((item, index) => {
          if (item.field) {
            this.templateObj[item.field.alias] = JSON.parse(JSON.stringify(item))
            this.templateOtherObj[item.field.alias] = JSON.parse(JSON.stringify(item))
            this.templateObj[item.field.alias].index = index
            if (item.field.setting && item.field.setting.attribute && item.field.setting.attribute.dataSource === 'linkData') {
              const obj = {}
              const defaultValueLink = item.field.setting.form.defaultValueLink
              for (var key in defaultValueLink) {
                obj[key] = defaultValueLink[key]
              }
              const alias = item.field.alias
              obj.currentFieldEffect = alias
              this.linkData[defaultValueLink.currentFieldCause] = obj
              this.linkDataEffect[alias] = obj
            }
          }
          if (item.type === 'work') {
            this.workExist = true
          }
          if (item.type === 'workRemark') {
            this.workRemarkExist = true
          }
        })
        const getTemplate = (array) => {
          array.forEach((item, index) => {
            if (item.columns) {
              getTemplate(item.columns)
            } else if (item.trs) {
              getTemplate(item.trs)
            } else if (item.tds) {
              getTemplate(item.tds)
            } else if (item.tds) {
              getTemplate(item.tds)
            } else if (item.list) {
              if (item.type === 'card' && item.addShow === '1') {
                this.$set(this, 'cardKey', item.key)
                this.$set(this, 'aliasKey', item.aliasKey)
                if (!item.index) {
                  item.index = 1
                }
              }
              getTemplate(item.list)
            } else {
              if (item.field && item.field.formtype === 'subform' && this.num < 2) {
                const templateObj = {}
                if (item.field && item.field.subFields) {
                  item.field.subFields.forEach(item => {
                    templateObj[item.alias] = item
                  })
                }
                const value = []
                this.$set(item.field, 'changeValue', [])
                item.field.value.forEach(valItem => {
                  const obj = {}
                  valItem.forEach(listItem => {
                    obj[listItem.alias] = listItem.value
                    if (listItem.option) {
                      obj['__' + listItem.alias + '_option__'] = listItem.option
                    }
                  })
                  value.splice(value.length, 0, obj)
                })
                const valueChange = JSON.parse(JSON.stringify(value))
                const valueInit = JSON.parse(JSON.stringify(value))
                valueChange.forEach(valItem => {
                  for (const i in valItem) {
                    if (templateObj[i] && templateObj[i].formtype === 'cascader' && typeof (valItem[i] === 'object') && !valItem[i].value) {
                      valItem[i] = ''
                    }
                    if (i.substr(0, 1) === '_' && i.substr(-1) === '_') {
                      delete valItem[i]
                    }
                    valItem['__action__'] = 'edit'
                  }
                })
                valueInit.forEach(valItem => {
                  for (const i in valItem) {
                    if (templateObj[i] && templateObj[i].formtype === 'treeselect') {
                      valItem[i] = valItem[i].toString()
                    } else if (templateObj[i] && templateObj[i].formtype === 'cascader' && typeof (valItem[i] === 'object') && !valItem[i].value) {
                      valItem[i] = ''
                    } else if (templateObj[i] && templateObj[i].formtype === 'cascader') {
                      valItem[i] = valItem[i].value
                    }
                    if (i.substr(0, 1) === '_' && i.substr(-1) === '_') {
                      delete valItem[i]
                    }
                    valItem['__action__'] = 'edit'
                  }
                })
                this.$nextTick(() => {
                  this.$set(item.field, 'changeValue', valueChange)
                  this.$set(item.field, 'initValue', valueInit)
                  this.$forceUpdate()
                })
              } else if (item.field && item.field.formtype === 'address' && item.field) {
                const address = this.tableName + '[' + item.field.alias + ']' + '[address]'
                this.addressValue[address] = item.field.value.address
              }
              if (this.num < 2) {
                if (item.field && item.field.value && this.linkData[item.field.alias]) {
                  this.getLinkData(item.field.alias, item.field.value, 'edit')
                }
              }
            }
          })
        }
        getTemplate(this.template)
        this.parentParams = val.parentParams
        this.handleWayData = val.handleWayData
        if (this.handleWayData) {
          this.handleWayData.forEach(item => { item.display = 'v' })
        }
        this.wayDataRule = val.wayDataRule
        this.wayDataAttribute = val.wayDataAttribute || {}
        this.defaultWay = ''
        this.handleRemarks = ''
        if (val.handleWayData && val.wayDataRule) {
          val.handleWayData.forEach((item) => {
            if (parseInt(item.default) === 1 && item.onoff) {
              this.defaultWay = item.alias
              // 初始化执行表单流程规则
              this.$nextTick(() => {
                this.handleWayProRule(item.id)
              })
              return false
            }
          })
          this.handleWayDataOther = JSON.parse(JSON.stringify(val.handleWayData))
          // 初始化执行表单方式规则
          this.handleWayRule()
        }
        if (this.fieldRule) {
        // 初始化执行表单规则
          this.handleRule()
        }
        this.num++
      },
      immediate: true
    }
  },
  inject: {
    theme: {
      default: () => {
        return {
          data: {
            params: {}
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  mounted () {
    this.num = 0
  },
  methods: {
    // 赋值渲染填充显示到父文件表单
    getSystemList (data) {
      this.$refs.workflowHandleForm.$refs.userTableFormView.form.setFieldsValue({
        'crm_thd[djxtgdbh]': data.data.crm_thd.djxtgdbh,
        'crm_thd[shdw]': data.data.crm_thd.shdw
      })
    },
    // 改变表单赋值
    giveData (obj, addressValue, alias) {
      if (addressValue) {
        this.addressValue[alias] = addressValue
      }
      this.form.setFieldsValue(obj)
    },
    // 改变表单组件对应内容
    changeTem (tem) {
      this.getTemplate(this.template, tem)
    },
    getRuleAlias (data) {
      this.wayRuleAlias = data
    },
    getTemplate (array, tem) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.getTemplate(item.columns, tem)
        } else if (item.trs) {
          this.getTemplate(item.trs, tem)
        } else if (item.tds) {
          this.getTemplate(item.tds, tem)
        } else if (item.list) {
          this.getTemplate(item.list, tem)
        } else {
          if (item.value === tem.value) {
            array.splice(index, 1, tem)
          }
        }
      })
    },
    changeFieldValue (array, alias, value) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.changeFieldValue(item.columns, alias, value)
        } else if (item.trs) {
          this.changeFieldValue(item.trs, alias, value)
        } else if (item.tds) {
          this.changeFieldValue(item.tds, alias, value)
        } else if (item.list) {
          this.changeFieldValue(item.list, alias, value)
        } else {
          if (item.value === alias) {
            item.field.value = value
          }
        }
      })
    },
    // 表单规则实现
    templateRule (item) {
      this.getRule(this.template, item)
    },
    getRule (array, tem) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.getRule(item.columns, tem)
        } else if (item.trs) {
          this.getRule(item.trs, tem)
        } else if (item.tds) {
          this.getRule(item.tds, tem)
        } else if (item.list) {
          this.getRule(item.list, tem)
        } else {
          if (item.field && item.field.alias === tem.field) {
            if (tem.status === 'changeValue') {
              const obj = {}
              const name = this.tableName + '[' + tem.field + ']'
              obj[name] = tem.changeValue
              if (tem.formtype === 'address' || tem.formtype === 'cascader' || tem.formtype === 'treeselect') {
                const getArray = (array) => {
                  array.forEach((item, index) => {
                    if (item.columns) {
                      getArray(item.columns)
                    } else if (item.trs) {
                      getArray(item.trs)
                    } else if (item.tds) {
                      getArray(item.tds)
                    } else if (item.list) {
                      getArray(item.list)
                    } else {
                      if (item.field && item.field.alias === tem.field) {
                        if (tem.formtype === 'address') {
                          this.form.setFieldsValue(obj)
                          this.$set(item.field, 'value', { address: tem.changeValue, display: 'test' })
                        } else if (tem.formtype === 'treeselect') {
                          if (item.field.setting.attribute.multiple === '1') {
                            obj[name] = [tem.changeValue]
                          } else {
                            obj[name] = tem.changeValue
                          }
                          this.form.setFieldsValue(obj)
                        } else {
                          this.form.setFieldsValue(obj)
                          this.$set(item.field, 'value', { value: tem.changeValue })
                        }
                      }
                    }
                  })
                }
                getArray(this.template)
              } else {
                this.form.setFieldsValue(obj)
                this.changeFieldValue(this.template, tem.field, tem.changeValue)
              }
            } else {
              tem.mandatory = tem.status === 'hidden' ? false : tem.mandatory
              item.field.setting.attribute.required = tem.mandatory
              if (tem.titleField) {
                item.field.name = tem.change_title
              }
              item.fieldrule = tem.status
            }
          }
        }
      })
    },
    // 表单规则确认值
    changeValue (array, tem, myitem) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.changeValue(item.columns, tem, myitem)
        } else if (item.trs) {
          this.changeValue(item.trs, tem, myitem)
        } else if (item.tds) {
          this.changeValue(item.tds, tem, myitem)
        } else if (item.list) {
          this.changeValue(item.list, tem, myitem)
        } else {
          let inputValue = ''
          if (item.field && item.field.alias === tem.field) {
            inputValue = item.field.value
            if (item.field && item.field.formtype === 'number') {
              this.$set(myitem, 'value', Number(myitem.value))
            } else if (item.field && item.field.formtype === 'address') {
              inputValue = item.field.value.address
            } else if (item.field && item.field.formtype === 'cascader') {
              inputValue = item.field.value.value
            }
            if (myitem && !myitem.value) {
              myitem.value = ''
            }
            this.$set(myitem, 'flag', this.handleSimple(myitem.include, myitem.value, inputValue, myitem.allValue))
          }
        }
      })
    },
    // 表单规则恢复
    recoveryRule (item) {
      this.getRecovery(this.template, item)
    },
    getRecovery (array, tem) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.getRecovery(item.columns, tem)
        } else if (item.trs) {
          this.getRecovery(item.trs, tem)
        } else if (item.tds) {
          this.getRecovery(item.tds, tem)
        } else if (item.list) {
          this.getRecovery(item.list, tem)
        } else {
          if (item.field && tem.indexOf(item.field.alias) === -1) {
            const obj = this.templateOtherObj[item.field.alias]
            item.field.setting.attribute.required = obj.field.setting.attribute.required
            item.fieldrule = obj.fieldrule
            item.field.name = obj.field.name
          }
        }
      })
    },
    // 获取所有组件配置的二维数组
    getArray (array) {
      array.forEach(item => {
        if (item.columns) {
          this.getArray(item.columns)
        } else if (item.trs) {
          this.getArray(item.trs)
        } else if (item.tds) {
          this.getArray(item.tds)
        } else if (item.list) {
          this.getArray(item.list)
        } else {
          this.templateAll.push(item)
        }
      })
    },
    // 获取恢复表单的二维数组
    getRecoveryArray (array) {
      array.forEach(item => {
        if (item.columns) {
          this.getRecoveryArray(item.columns)
        } else if (item.trs) {
          this.getRecoveryArray(item.trs)
        } else if (item.tds) {
          this.getRecoveryArray(item.tds)
        } else if (item.list) {
          this.getRecoveryArray(item.list)
        } else {
          this.templateOther.push(item)
        }
      })
    },
    // 事件触发实现
    sendEvent (eventName, alias, options1, options2) {
      this.getEvent(this.template, eventName, alias, options1, options2)
    },
    getEvent (array, eventName, alias, options1, options2) {
      const that = this
      let attr = ''
      array.forEach(item => {
        if (item.columns) {
          this.getEvent(item.columns, eventName, alias, options1, options2)
        } else if (item.trs) {
          this.getEvent(item.trs, eventName, alias, options1, options2)
        } else if (item.tds) {
          this.getEvent(item.tds, eventName, alias, options1, options2)
        } else if (item.list) {
          this.getEvent(item.list, eventName, alias, options1, options2)
        } else {
          if (item.field && item.field.alias === alias) {
            attr = item.attribute
            attr = item.attribute ? JSON.parse(attr) : {}
            if (attr[eventName]) {
              const str = 'return ' + attr[eventName]
              // eslint-disable-next-line no-new-func
              const func = new Function(str)
              func()(that, options1, options2)
            }
          }
        }
      })
    },
    // 选择办理方式
    handleWayChange (e) {
      const value = e.target.value
      var id = ''
      this.handleWayData.forEach(item => {
        if (item.alias === value) {
          id = item.id
        }
      })
      const wayDataAttribute = this.wayDataAttribute.value
      const that = this
      const str = 'return ' + wayDataAttribute
      // eslint-disable-next-line no-new-func
      const func = new Function(str)
      func()(that, value)
      this.handleWayProRule(id)
    },
    wayRule (item) {
      this.getWayRule(this.template, item)
    },
    // 退回地址
    returnAddress () {
      const formData = this.form.getFieldsValue()[this.tableName]
      const obj = {
        glcpbh: formData.glcpbh,
        fuwu_xm: formData.fuwu_xm,
        ssq: {
          address: this.addressValue[this.tableName + '[ssq][address]']
        }
      }
      this.axios({
        url: 'crm/Order/searchRebackAddress',
        data: { info: obj }
      }).then(res => {
        if (res.code === 0) {
          this.$info({
            title: '退回地址',
            content: h => <div>
              <div>产品 : { formData.cpmc }</div>
              <div>寄回收件人 : { res.result.lxr } </div>
              <div>收件人电话 : { res.result.lxfs }</div>
              <div>寄回地址 : { res.result.lxdz }</div>
              <div>邮寄方式 : { res.result.yjfs } </div>
              <div>发货方式 : { res.result.fhfs }</div>
            </div>,
            okText: '确认'
          })
        } else {
          this.$warning({
            title: res.message,
            okText: '确认'
          })
        }
      })
    },
    getWayRule (array, tem) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.getWayRule(item.columns, tem)
        } else if (item.trs) {
          this.getWayRule(item.trs, tem)
        } else if (item.tds) {
          this.getWayRule(item.tds, tem)
        } else if (item.list) {
          this.getWayRule(item.list, tem)
        } else {
          if (item.field && item.field.alias === tem.field) {
            this.wayRuleAlias.push(tem.field)
            this.$nextTick(() => {
              this.$set(item.field.setting.attribute, 'required', tem.mandatory)
              this.$set(item, 'fieldrule', tem.status)
            })
          }
        }
      })
    },
    resetTem (resetTem) {
      this.getResetTem(this.template, resetTem)
    },
    getResetTem (array, resetTem) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.getResetTem(item.columns, resetTem)
        } else if (item.trs) {
          this.getResetTem(item.trs, resetTem)
        } else if (item.tds) {
          this.getResetTem(item.tds, resetTem)
        } else if (item.list) {
          this.getResetTem(item.list, resetTem)
        } else {
          if (item.field && resetTem && resetTem.includes(item.field.alias)) {
            this.templateOther.forEach(otherItem => {
              if (item.field && otherItem.field && item.field.alias === otherItem.field.alias) {
                item.fieldrule = otherItem.fieldrule
                item.field.setting.attribute.required = otherItem.field.setting.attribute.required
              }
            })
          }
        }
      })
    },
    // 办理方式表单规则
    handleWayRule () {
      const that = this
      this.wayDataRule.forEach((dataItem, dataIndex) => {
        dataItem.simpleCondition.forEach((item, index) => {
          item.condition.forEach((myitem, myindex) => {
            if (item.fieldUser === 'currentUser') {
              myitem.flag = that.handleUserSimple(this.userInfo.username, myitem.value, item.include)
            } else if (item.fieldUser === 'currentClass') {
              myitem.flag = that.handleUserSimple(this.userInfo.departmentid, myitem.value, item.include)
            } else if (item.fieldUser === 'currentRole') {
              myitem.flag = that.handleUserSimple(this.userInfo.roleid, myitem.value, item.include)
            } else {
              this.changeValue(this.template, item, myitem)
            }
          })
          if (item.logic === 'and') {
            item.flag = item.condition.every((myitem, myindex) => {
              return myitem.flag
            })
          } else if (item.logic === 'or') {
            item.flag = item.condition.some((myitem, myindex) => {
              return myitem.flag
            })
          }
        })
        if (dataItem.logic === 'and') {
          dataItem.flag = dataItem.simpleCondition.every((item, index) => {
            return item.flag
          })
        } else if (dataItem.logic === 'or') {
          dataItem.flag = dataItem.simpleCondition.some((item, index) => {
            return item.flag
          })
        }
        if (dataItem.flag) {
          dataItem.event.forEach(eventItem => {
            this.handleWayData.forEach(wayItem => {
              if (wayItem.alias === eventItem.alias) {
                wayItem.display = eventItem.status === 'hidden' ? 'h' : 'v'
              }
            })
          })
        }
      })
    },
    // 办理流程方式配置规则
    handleWayProRule (value) {
      this.$set(this, 'wayRuleAlias', [])
      const formData = this.form.getFieldsValue()[this.tableName]
      this.handleWayData.forEach(item => {
        if (item.id === value) {
          this.wayDataRule.forEach(wayItem => {
            const simpleFlagArr = []
            wayItem.simpleCondition.forEach(simItem => {
              if (simItem.fieldUser === 'way') {
                simItem.flag = simItem.way === item.alias
              } else if (simItem.fieldUser === 'currentUser') {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  const flag = this.handleUserSimple(this.userInfo.username, myitem.value, simItem.include)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
              } else if (simItem.fieldUser === 'currentClass') {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  const flag = this.handleUserSimple(this.userInfo.departmentid, myitem.value, simItem.include)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
              } else if (simItem.fieldUser === 'currentRole') {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  const flag = this.handleUserSimple(this.userInfo.roleid, myitem.value, simItem.include)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
              } else if (simItem.fieldUser === 'notSet') {
                simItem.flag = true
              } else {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  if (simItem.formtype === 'number') {
                    myitem.value = Number(myitem.value)
                  }
                  const inputValue = formData[simItem.field]
                  const allValue = ''
                  const flag = this.handleSimple(myitem.include, myitem.value, inputValue, myitem.allValue, allValue)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(item.logic, conditionFlagArr)
              }
              simpleFlagArr.push(simItem.flag)
            })
            wayItem.flag = this.getConditionFlag(wayItem.logic, simpleFlagArr)
            if (wayItem.flag) {
              const rest = []
              wayItem.event.forEach(eventItem => {
                if (eventItem.type === 'field') {
                  rest.push(eventItem.field)
                  this.templateOther.forEach(otherItem => {
                    if (otherItem.value === eventItem.field && this.wayRuleAlias.indexOf(eventItem.field) === -1) {
                      this.wayRuleAlias.push(eventItem.field)
                      this.wayRuleAlias = [...new Set(this.wayRuleAlias)]
                    }
                  })
                  this.getWayRule(this.template, eventItem)
                } else if (eventItem.type === 'way') {
                  this.handleWayData.forEach(wayDataItem => {
                    if (eventItem.alias === wayDataItem.alias) {
                      if (eventItem.status === 'hidden') {
                        this.$set(wayDataItem, 'display', 'h')
                      } else {
                        this.$set(wayDataItem, 'display', 'v')
                      }
                    }
                  })
                }
              })
              if (wayItem.event.some(someItem => someItem.type !== 'way')) {
                this.$set(item, 'resetTem', rest)
              }
            }
          })
        } else {
          if (item.resetTem) {
            item.resetTem.forEach(resetItem => {
              this.getResetTem(this.template, item.resetTem)
            })
          }
        }
      })
    },
    getConditionFlag (logic, conditionFlagArr) {
      if (logic === 'and') {
        return conditionFlagArr.every(item => {
          return item
        })
      } else {
        return conditionFlagArr.some(item => {
          return item
        })
      }
    },
    sentLinkData (alias, option) {
      this.getSentLinkData(this.template, alias, option)
    },
    getSentLinkData  (array, alias, option) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.getSentLinkData(item.columns, alias, option)
        } else if (item.trs) {
          this.getSentLinkData(item.trs, alias, option)
        } else if (item.tds) {
          this.getSentLinkData(item.tds, alias, option)
        } else if (item.list) {
          this.getSentLinkData(item.list, alias, option)
        } else {
          if (item.field && item.field.alias === alias) {
            this.$set(item.field, 'option', option)
          }
        }
      })
    },
    // 页面创建时候判断当前用户、用户所在部门、所属角色执行的表单规则
    handleRule () {
      const that = this
      // 表单规则实现
      this.fieldRule.forEach((dataItem, dataIndex) => {
        dataItem.simpleCondition.forEach((item, index) => {
          item.condition.forEach((myitem, myindex) => {
            if (item.fieldUser === 'currentUser') {
              myitem.flag = that.handleUserSimple(this.userInfo.username, myitem.value, item.include)
            } else if (item.fieldUser === 'currentClass') {
              myitem.flag = that.handleUserSimple(this.userInfo.departmentid, myitem.value, item.include)
            } else if (item.fieldUser === 'currentRole') {
              myitem.flag = that.handleUserSimple(this.userInfo.roleid, myitem.value, item.include)
            } else if (item.fieldUser === 'notSet') {
              myitem.flag = true
            } else {
              this.changeValue(this.template, item, myitem)
            }
          })
          if (item.logic === 'and') {
            item.flag = item.condition.every((myitem, myindex) => {
              return myitem.flag
            })
          } else if (item.logic === 'or') {
            item.flag = item.condition.some((myitem, myindex) => {
              return myitem.flag
            })
          }
        })
        if (dataItem.logic === 'and') {
          dataItem.flag = dataItem.simpleCondition.every((item, index) => {
            return item.flag
          })
        } else if (dataItem.logic === 'or') {
          dataItem.flag = dataItem.simpleCondition.some((item, index) => {
            return item.flag
          })
        }
        if (dataItem.flag) {
          dataItem.event.forEach(eventItem => {
            this.getRule(that.template, eventItem)
          })
        }
      })
    },
    // 判断当前用户，用户所在部门，所属于角色
    handleUserSimple (current, conditionValue, include) {
      if (include === 'bl' || !include) {
        if (conditionValue.indexOf(current) !== -1) {
          return true
        } else {
          return false
        }
      } else {
        if (conditionValue.indexOf(current) !== -1) {
          return false
        } else {
          return true
        }
      }
    },
    // 数据联动
    getLinkData (alias, inputValue, type, item) {
      if (inputValue) {
        if (!this.linkData[alias].sourceFieldEffect) {
          if (item) {
            const src = item.field.setting.form.src
            this.axios({
              url: '/admin/dict/getCascaderData',
              params: {
                parentNumber: inputValue,
                src: src
              }
            }).then(res => {
              const effect = this.linkData[alias].currentFieldEffect
              const effectIndex = this.templateObj[effect] ? this.templateObj[effect].index : -1
              if (effectIndex !== -1) {
                this.getSentLinkData(this.template, effect, res.result)
              }
            })
          }
        } else {
          const where = this.getWhere(this.linkData[alias].sourceFieldCause, inputValue, type)
          this.axios({
            url: '/admin/userTable/getLinkageData',
            params: {
              field: this.linkData[alias].sourceFieldEffect,
              tableid: this.linkData[alias].dataSource[this.linkData[alias].dataSource.length - 1]
            },
            data: {
              where: where
            }
          }).then(res => {
            // 结果
            const effect = this.linkData[alias].currentFieldEffect
            const effectIndex = this.templateObj[effect] ? this.templateObj[effect].index : -1
            if (effectIndex !== -1) {
              this.getSentLinkData(this.template, effect, res.result.option)
            }
          })
        }
      } else {
        this.clearOption(alias)
      }
    },
    // 数据联动获取where
    getWhere (alias, value, type) {
      const that = this
      const result = {}
      result[alias] = value
      if (this.linkDataEffect[alias]) {
        getRes(alias)
      }
      function getRes (alias) {
        const causeAlias = that.linkDataEffect[alias].currentFieldCause
        const value = type === 'change' ? that.form.getFieldValue(that.tableName + '[' + causeAlias + ']') : that.templateObj[causeAlias].field.value
        result[causeAlias] = value
        if (that.linkDataEffect[causeAlias]) {
          getRes(causeAlias)
        }
      }
      return result
    },
    // cause字段清空数据时，清除effect字段的option
    clearOption (alias) {
      const effect = this.linkData[alias].currentFieldEffect
      const effectIndex = this.templateObj[effect] ? this.templateObj[effect].index : -1
      if (effectIndex !== -1) {
        const effectItem = this.templateAll[effectIndex]
        effectItem.field.option = []
        const obj = {}
        obj[this.tableName + '[' + effectItem.field.alias + ']'] = undefined
        this.form.setFieldsValue(obj)
        this.getSentLinkData(this.template, effectItem.field.alias, [])
        // this.template.splice(effectIndex, 1, effectItem)
      }
      if (this.linkData[effect]) {
        this.clearOption(effect)
      }
    },
    handleSimple (include, value, inputValue, allValue) {
      const action = this.actions.get(`${include}`)
      return action(value, inputValue, allValue)
    },
    // 数组对象排序
    compare (property) {
      return (obj1, obj2) => {
        const val1 = obj1[property]
        const val2 = obj2[property]
        return val1 - val2
      }
    },
    filterSubForm (array) {
      array.forEach((item) => {
        if (item.columns && item.columns.length) {
          if (item.columns.every(chiItem => chiItem.type === 'subform' || chiItem.filterStatus)) {
            item.filterStatus = true
          }
          this.filterSubForm(item.columns)
        } else if (item.trs && item.trs.length) {
          if (item.trs.every(chiItem => chiItem.type === 'subform' || chiItem.filterStatus)) {
            item.filterStatus = true
          }
          this.filterSubForm(item.trs)
        } else if (item.tds && item.tds.length) {
          if (item.tds.every(chiItem => chiItem.type === 'subform' || chiItem.filterStatus)) {
            item.filterStatus = true
          }
          this.filterSubForm(item.tds)
        } else if (item.list && item.list.length) {
          if (item.list.every(chiItem => chiItem.type === 'subform' || chiItem.filterStatus)) {
            item.filterStatus = true
          }
          this.filterSubForm(item.list)
        } else {
        }
      })
      return array
    },

    handleSubmit (data = {}, page, jointable) {
      const result = this.getValueData(data, page, jointable)
      let values, valueData
      if (result) {
        values = result.values
        valueData = result.valueData
        if (page !== 'subform') {
        // 提交表单前是否通过后台校验且需对返回值处理
          if (data.submitPreView && !data.confirm) {
            this.submitPreView = () => import('@/views/' + data.submitPreView)
            setTimeout(() => {
              this.$refs.submitPreView.show({
                parent: this,
                data: valueData,
                params: data.params
              })
            }, 1000)
          } else {
            if (this.parentParams.tableType) {
              valueData.tableViewField = this.parentParams.tableViewField
              valueData.tableViewVal = this.template
              valueData[this.tableName] = {}
              valueData[this.tableName]['sftx'] = 's'
              this.axios({
                url: data.url || this.parentParams.submitUrl || this.parentParams.url,
                data: valueData
              }).then((res) => {
                if (res.code === 0) {
                  if (res.message) {
                    this.$message.success({
                      content: h => { return <span domPropsInnerHTML={res.message}></span> }
                    })
                  } else {
                    this.$message.success('操作成功')
                  }
                  this.$emit('ok', values, this.tableName, '', res)
                } else {
                  this.$emit('ok', '', '', 'error')
                  if (res.message) {
                    this.$message.error({
                      content: h => { return <span domPropsInnerHTML={res.message}></span> }
                    })
                  } else {
                    this.$message.error('操作失败')
                  }
                }
              })
            } else {
              this.axios({
                url: data.url || this.parentParams.submitUrl || this.parentParams.url,
                data: valueData
              }).then((res) => {
                if (res.code === 0) {
                  if (res.message) {
                    this.$message.success({
                      content: h => { return <span domPropsInnerHTML={res.message}></span> }
                    })
                  } else {
                    this.$message.success('操作成功')
                  }
                  this.$emit('ok', values, this.tableName, '', res)
                } else {
                  this.$emit('ok', '', '', 'error')
                  if (res.message) {
                    this.$message.error({
                      content: h => { return <span domPropsInnerHTML={res.message}></span> }
                    })
                  } else {
                    this.$message.error('操作失败')
                  }
                }
              })
            }
          }
        } else {
          this.$emit('ok', values, this.tableName)
        }
      }
    },

    // 提交表单
    getValueData (data = {}, page, jointable) {
      // data = {
      //   url: 'http://www.abc.com', //表单提交的额外指定地址
      //   extFormData: {             //表单提交的额外指定数据
      //     aa: 101,
      //     bb: 102
      //   }
      // }
      let result
      const me = this
      this.form.validateFields((errors, values) => {
        if (!errors) {
          values.jointable = jointable
          // 图片，附件只需要传fileName和filePath
          const getTemplate = (array) => {
            let bool
            array.forEach((item, index) => {
              if (item.columns) {
                getTemplate(item.columns)
              } else if (item.trs) {
                getTemplate(item.trs)
              } else if (item.tds) {
                getTemplate(item.tds)
              } else if (item.list) {
                getTemplate(item.list)
              } else {
                if (item.field && (item.field.formtype === 'file' || item.field.formtype === 'image')) {
                  if (item.field.beforeAlias) {
                    const arr = []
                    if (!item.field.initValue) {
                      item.field.initValue = item.field.value
                    }
                    item.field.initValue.forEach(item1 => {
                      if (item1.response && item1.response.code === 0) {
                        arr.push(item1.response.result)
                      }
                    })
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = arr.length
                      ? arr : values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias].map(valItem => {
                        let dataobj = {}
                        if (valItem.response && valItem.response.code === 0) {
                          dataobj = valItem.response.result
                        }
                        return dataobj
                      }).filter(filItem => filItem)
                  } else {
                    const arr = []
                    if (!item.field.initValue) {
                      item.field.initValue = item.field.value
                    }
                    item.field.initValue.forEach(item1 => {
                      if (item1.response && item1.response.code === 0) {
                        arr.push(item1.response.result)
                      }
                    })
                    values[this.tableName][item.field.alias] = arr.length ? arr : values[this.tableName][item.field.alias].map(valItem => {
                      let dataobj = {}
                      if (valItem.response && valItem.response.code === 0) {
                        dataobj = valItem.response.result
                      }
                      return dataobj
                    }).filter(filItem => filItem)
                  }
                } else if (item.field && item.field.formtype === 'datetime' && item.field.fieldtype === 'TIME') {
                  if (item.field.beforeAlias) {
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = item.field.value
                  } else {
                    values[this.tableName][item.field.alias] = item.field.value
                  }
                } else if (item.field && item.field.formtype === 'datetime') {
                  if (item.field.beforeAlias) {
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] ? moment(values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias]).format('YYYY-MM-DD HH:mm:ss') : ''
                  } else {
                    values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias] ? moment(values[this.tableName][item.field.alias]).format('YYYY-MM-DD HH:mm:ss') : ''
                  }
                } else if (item.field && item.field.formtype === 'subform') {
                  let value = []
                  const getSubForm = (array) => {
                    array.forEach(subItem => {
                      if (subItem.subformItem && subItem.subformItem.field && subItem.subformItem.field.alias === item.field.alias) {
                        value = subItem.dataTotal
                        subItem.form.validateFields((errors, values) => {
                          if (errors) {
                            bool = true
                          } else {
                            bool = false
                          }
                        })
                      } else if (subItem.$refs && subItem.$refs.nestedComponents) {
                        getSubForm(subItem.$refs.nestedComponents)
                      } else if (subItem.$children.length !== 0) {
                        getSubForm(subItem.$children)
                      }
                    })
                  }
                  getSubForm(this.$refs.buildBlocks)
                  if (item.field.beforeAlias) {
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = value || item.field.value
                    for (const i in values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias]) {
                      delete values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias][i].sort
                    }
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias].forEach(item => {
                      for (const i in item) {
                        if (i.substr(0, 1) === '_' && i.substr(-1) === '_' && !i.includes('action')) {
                          delete item[i]
                        }
                      }
                    })
                  } else {
                    values[this.tableName][item.field.alias] = value || item.field.value
                    for (const i in values[this.tableName][item.field.alias]) {
                      delete values[this.tableName][item.field.alias][i].sort
                    }
                    values[this.tableName][item.field.alias].forEach(item => {
                      for (const i in item) {
                        if (i.substr(0, 1) === '_' && i.substr(-1) === '_' && !i.includes('action')) {
                          delete item[i]
                        }
                      }
                    })
                  }
                } else if (item.field && item.field.formtype === 'switch') {
                  if (item.field.beforeAlias) {
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] ? item.field.setting.form.word.value.split('/')[0] : item.field.setting.form.word.value.split('/')[1]
                  } else {
                    values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias] ? item.field.setting.form.word.value.split('/')[0] : item.field.setting.form.word.value.split('/')[1]
                  }
                } else if (item.field && item.field.formtype === 'autocomplete') {
                  if (item.field.beforeAlias) {
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias].replace(/\s*/g, '')
                  } else {
                    values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias].replace(/\s*/g, '')
                  }
                } else if (item.field && item.field.formtype === 'address') {
                  if (item.field.beforeAlias) {
                    if (!values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias]) {
                      values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = {}
                    }
                    const address = this.tableName + '[product_' + item.aliasKey + ']' + '[' + item.field.beforeAlias + ']' + '[address]'
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias]['address'] = this.addressValue[address] || ''
                  } else {
                    if (!values[this.tableName][item.field.alias]) {
                      values[this.tableName][item.field.alias] = {}
                    }
                    const address = this.tableName + '[' + item.field.alias + ']' + '[address]'
                    values[this.tableName][item.field.alias]['address'] = this.addressValue[address] || ''
                  }
                } else if (item.field && item.field.formtype === 'treeselect') {
                  if (item.field.beforeAlias) {
                    values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias] = values[this.tableName]['product_' + item.aliasKey][item.field.beforeAlias].toString()
                  } else {
                    values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias].toString()
                  }
                }
              }
            })
            unsubmitBool.push(bool)
          }
          let unsubmitBool = []
          getTemplate(this.template)
          unsubmitBool = unsubmitBool.every(boolItem => !boolItem)
          if (!unsubmitBool) {
            this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
            result = false
            return false
          }
          // 主表关联信息
          if (this.theme.data.params.relation && Object.keys(this.theme.data.params.relation).length > 0 && values[this.tableName]) {
            values[this.tableName][this.theme.data.params.relation.key] = this.theme.data.params.relation.val
          }
          values[this.tableName + '_gdcp'] = []
          for (const key in values[this.tableName]) {
            if (!values[this.tableName][key]) {
              values[this.tableName][key] = ''
            }
            if (key.includes('product')) {
              const getTemplate = (array) => {
                array.forEach((item, index) => {
                  if (item.columns) {
                    getTemplate(item.columns)
                  } else if (item.trs) {
                    getTemplate(item.trs)
                  } else if (item.tds) {
                    getTemplate(item.tds)
                  } else if (item.list) {
                    if (item.type === 'card' && item.aliasKey) {
                      if (values[this.tableName]['product_' + item.aliasKey]) {
                        values[this.tableName]['product_' + item.aliasKey]['index'] = item.index
                      }
                    }
                    getTemplate(item.list)
                  }
                })
              }
              getTemplate(this.template)
              values[this.tableName + '_gdcp'].push(values[this.tableName][key])
              delete values[this.tableName][key]
            }
          }
          values[this.tableName + '_gdcp'] = values[this.tableName + '_gdcp'].sort(this.compare('index'))
          values[this.tableName + '_gdcp'].forEach(item => {
            delete item.index
          })
          if (!values[this.tableName + '_gdcp'].length) {
            values[this.tableName + '_gdcp'] = undefined
          }
          this.$emit('start')
          if (page !== 'subform') {
            const valueData = this.$deepmerge(values, {
              action: 'submit',
              id: me.parentParams.record ? me.parentParams.record.id : 0
            })
            if (data.extFormData) {
              for (const i in data.extFormData) {
                if (i === this.tableName) {
                  valueData[this.tableName] = this.$deepmerge(valueData[this.tableName], data.extFormData[this.tableName])
                } else if (i === (this.tableName + '_gdcp') && data.extFormData[i]) {
                  data.extFormData[this.tableName + '_gdcp'].forEach((item, index) => {
                    valueData[this.tableName + '_gdcp'][index] = this.$deepmerge(valueData[this.tableName + '_gdcp'][index], data.extFormData[this.tableName + '_gdcp'][index])
                  })
                } else {
                  valueData[i] = data.extFormData[i]
                }
              }
            }
            if (me.parentParams.tplviewid) {
              valueData.tplviewid = me.parentParams.tplviewid
            }
            if (me.parentParams.tableid) {
              valueData.tableid = me.parentParams.tableid
            }
            if (me.parentParams.workflow_id) {
              valueData.workflow_id = me.parentParams.workflow_id
            }
            if (me.parentParams.case_id) {
              valueData.case_id = me.parentParams.case_id
            }
            result = { values, valueData }
          } else {
            this.$emit('ok', values, this.tableName)
            result = { values }
          }
        } else {
          this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
          result = false
        }
      })
      return result
    }

  }
}
</script>
