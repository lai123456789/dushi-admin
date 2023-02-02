<template>
  <a-config-provider :locale="locale">
    <div class="form-designer-container-9136076486841527">
      <k-header v-if="showHead" :title="title" />
      <!-- 操作区域 start -->
      <operatingArea
        v-if="toolbarsTop"
        :showToolbarsText="showToolbarsText"
        :toolbars="toolbars"
        :recordList="recordList"
        :redoList="redoList"
        @handlePreview="handlePreview"
        @handleOpenImportJsonModal="handleOpenImportJsonModal"
        @handleOpenCodeModal="handleOpenCodeModal"
        @handleOpenJsonModal="handleOpenJsonModal"
        @handleReset="handleReset"
        @handleUndo="handleUndo"
        @handleRedo="handleRedo"
      >
        <template slot="left-action">
          <slot name="left-action"></slot>
        </template>

        <template slot="right-action">
          <slot name="right-action"></slot>
        </template>
      </operatingArea>
      <!-- 操作区域 end -->
      <div
        class="content"
        :class="{
          'show-head': showHead,
          'toolbars-top': toolbarsTop,
          'show-head-and-toolbars-top': toolbarsTop && showHead
        }"
      >
        <!-- 左侧控件区域 start -->
        <aside class="left" :style="{ height: tableType ? 'calc(100% - 240px)' : 'calc(100% - 180px)'}">
          <a-collapse
            @change="collapseChange"
            :defaultActiveKey="collapseDefaultActiveKey"
          >
            <!-- 布局控件 start -->
            <a-collapse-panel
              v-if="layoutArray.length > 0"
              header="布局"
              key="1"
            >
              <collapseItem
                :list="layoutArray"
                tableKey="table"
                @generateKey="generateKey"
                @handleListPush="handleListPush"
                @start="handleStart"
              />
            </a-collapse-panel>
            <!-- 布局控件 end -->
            <!-- 基础控件 start -->
            <a-collapse-panel
              v-if="basicsArray.length > 0 && !tableType"
              header="系统组件"
              key="2"
            >
              <collapseItem
                :list="basicsArray"
                @generateKey="generateKey"
                @handleListPush="handleListPush"
                @start="handleStart"
              />
            </a-collapse-panel>
            <!-- 基础控件 end -->
            <!-- 自定义控件 start -->
            <a-collapse-panel
              v-if="customComponents.list.length > 0"
              :header="customComponents.title"
              key="3"
            >
              <collapseItem
                :list="customComponents.list"
                @generateKey="generateKey"
                @handleListPush="handleListPush"
                @start="handleStart"
              />
            </a-collapse-panel>
            <!-- 自定义控件 end -->
            <!-- 字段控件 start -->
            <a-collapse-panel
              v-if="myArray.length > 0 && params.variable !== 'table_custom_view'"
              header="字段"
              key="4"
            >
              <fields-table
                :list="myArray"
                @generateKey="generateKey"
                @handleListPush="handleListPush"
                @start="handleStart"
              />
            </a-collapse-panel>
            <!-- 字段控件 end -->
          </a-collapse>
        </aside>
        <!-- 左侧控件区域 end -->

        <!-- 中间面板区域 start -->
        <section :style="{ height: tableType ? 'calc(100% - 240px)' : 'calc(100% - 180px)'}">
          <!-- 操作区域 start -->
          <operatingArea
            v-if="!toolbarsTop"
            :showToolbarsText="showToolbarsText"
            :toolbars="toolbars"
            :tableType="tableType"
            :recordList="recordList"
            :redoList="redoList"
            @handlePreview="handlePreview"
            @changeAllStatus="changeAllStatus"
            @saveAs="saveAsvisible = true"
            @querierFormRule="querierFormRule"
            @handleOpenImportJsonModal="handleOpenImportJsonModal"
            @handleOpenCodeModal="handleOpenCodeModal"
            @handleOpenJsonModal="handleOpenJsonModal"
            @handleReset="handleReset"
            @handleUndo="handleUndo"
            @handleRedo="handleRedo"
          >
            <template slot="left-action">
              <slot name="left-action"></slot>
            </template>
            <template slot="right-action">
              <slot name="right-action"></slot>
            </template>
          </operatingArea>
          <!-- 操作区域 end -->
          <k-form-component-panel
            :class="{ 'no-toolbars-top': !toolbarsTop }"
            :data="data"
            :selectItem="selectItem"
            :params="params"
            :noModel="noModel"
            :startType="startType"
            ref="KFCP"
            @handleSetSelectItem="handleSetSelectItem"
          />
          <!-- 操作区域 start -->
          <k-json-modal ref="jsonModal" />
          <k-code-modal ref="codeModal" />
          <importJsonModal ref="importJsonModal" />
          <previewModal ref="previewModal" />
          <querier-form-rule ref="querierFormRule" @ok="getRule" @func="getCode"/>
          <a-modal
            title="另存为组件命名"
            :visible="saveAsvisible"
            @ok="saveAs"
            @cancel="saveAsvisible = !saveAsvisible"
          >
            <a-form :form="form">
              <a-form-item label="组件名称" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                <a-input v-decorator="['info[name]', { rules: [{ required: true, message: '请输入组件名称'},{ min:2, message: '请输入至少两个字符' },{ max: 6, message: '最多请输入六个字符' }], initialValue: ''}]" @change="handleChangeName"/>
              </a-form-item>
              <a-form-item label="系统名称" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                <a-input :disabled="true" v-decorator="['info[alias]', { rules: [{ required: true, message: '请输入组件名称'}],initialValue: ''}]"/>
              </a-form-item>
            </a-form>
          </a-modal>
        </section>
        <!-- 中间面板区域 end -->

        <!-- 右侧控件属性区域 start -->
        <aside class="right" :style="{ height: tableType ? 'calc(100% - 240px)' : 'calc(100% - 180px)'}">
          <formProperties
            :config="data.config"
            :data="formdata"
            :setting="setting"
            :previewOptions="previewOptions"
          />
          <formItemProperties
            :class="{ 'show-properties': showPropertie }"
            class="form-item-properties"
            :selectItem="selectItem"
            :params="params"
            :basicsArray="basicsArray"
            :myArray="allMyArray"
            :nowArray="myArray"
            :tableType="tableType"
            @handleHide="showPropertie = false"
          />
        </aside>
        <!-- 右侧控件属性区域 end -->
      </div>
      <!-- <k-footer /> -->
    </div>
  </a-config-provider>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 表单设计器
 */
// import draggable from "vuedraggable";
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import {
  basicsList,
  // highList,
  layoutList,
  customComponents
} from './config/formItemsConfig'
import { Collapse } from 'ant-design-vue'
import { Revoke } from '../core/revoke'
import Vue from 'vue'
Vue.use(Collapse)
export default {
  name: 'KFormDesign',
  components: {
    kHeader: () => import('./module/header'),
    // kFooter,
    operatingArea: () => import('./module/operatingArea'),
    collapseItem: () => import('./module/collapseItem'),
    FieldsTable: () => import('./module/FieldsTable'),
    kJsonModal: () => import('./module/jsonModal'),
    kCodeModal: () => import('./module/codeModal'),
    importJsonModal: () => import('./module/importJsonModal'),
    previewModal: () => import('../KFormPreview/index.vue'),
    kFormComponentPanel: () => import('./module/formComponentPanel'),
    formItemProperties: () => import('./module/formItemProperties'),
    formProperties: () => import('./module/formProperties'),
    QuerierFormRule: () => import('@/views/admin/Table/QuerierFormRule')
    // draggable
  },
  props: {
    title: {
      type: String,
      default: '表单设计器'
    },
    showHead: {
      type: Boolean,
      default: false
    },
    toolbarsTop: {
      type: Boolean,
      default: false
    },
    toolbars: {
      type: Array,
      default: () => [
        // 'save',
        'preview',
        'importJson',
        'exportJson',
        // 'exportCode',
        'reset',
        'undo',
        'redo'
        // 'close'
      ]
    },
    showToolbarsText: {
      type: Boolean,
      default: false
    },
    fieldsarr: {
      type: Array,
      default () {
        return {}
      },
      required: false
    },
    mytemplate: {
      type: Array,
      default () {
        return {}
      }
    },
    formdata: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    setting: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    tplInitJs: {
      type: String,
      default: ''
    },
    verifJs: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    },
    tableType: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      visible: false,
      saveAsvisible: false,
      locale: zhCN,
      customComponents,
      updateTime: 0,
      updateRecordTime: 0,
      showPropertie: false,
      revoke: null,
      recordList: [],
      redoList: [],
      startType: '',
      form: this.$form.createForm(this),
      fields: [
        // 'input',
        // 'textarea',
        // 'number',
        // 'select',
        // 'checkbox',
        // 'radio',
        // 'date',
        // 'time',
        // 'rate',
        // 'uploadFile',
        // 'uploadImg',
        // 'cascader',
        // 'treeSelect',
        // 'batch',
        // 'editor',
        // 'switch',
        'formmark',
        'subform',
        'button',
        'alert',
        'text',
        'placeholder',
        'html',
        'divider',
        'card',
        'tabs',
        'grid',
        'work',
        'workRemark',
        'portrait',
        'component',
        'lifeCycle',
        'serialnumber',
        'flowlog',
        'urgelog',
        'table'
      ],
      noModel: [
        'button',
        'divider',
        'card',
        'grid',
        'table',
        'alert',
        'text',
        'placeholder',
        'html',
        'formmark',
        'work',
        'workRemark',
        'component'
      ],
      myArray: [],
      allMyArray: [],
      associated_list: [],
      data: {
        list: [],
        config: {
          layout: 'horizontal',
          labelCol: { xs: 4, sm: 4, md: 4, lg: 4, xl: 4, xxl: 4 },
          wrapperCol: { xs: 18, sm: 18, md: 18, lg: 18, xl: 18, xxl: 18 },
          hideRequiredMark: false,
          customStyle: ''
        }
      },
      previewOptions: {
        width: this.tableType ? 400 : 1200
      },
      selectItem: {
        key: ''
      }
    }
  },
  provide () {
    return {
      getSelectItem: () => this.selectItem
    }
  },
  created () {
    this.revoke = new Revoke()
    this.recordList = this.revoke.recordList
    this.redoList = this.revoke.redoList
    this.data.config.tableType = this.tableType
    if (this.tableType) {
      this.myArray = this.fieldsarr
      this.allMyArray = JSON.parse(JSON.stringify(this.fieldsarr))
    }
  },
  watch: {
    tplInitJs (newValue) {
      this.initJs = newValue
    },
    params (newVal) {
      if (newVal.variable === 'table_custom_view') {
        this.fields = ['text', 'input', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'time', 'rate', 'uploadFile', 'uploadImg', 'html', 'placeholder', 'switch', 'signature', 'imageShow', 'alert', 'divider', 'card', 'tabs', 'grid', 'table']
      }
    },
    mytemplate (newValue) {
      if (!this.tableType) {
        this.mytemplate.forEach((temItem, temIndex) => {
          temItem.key = (temItem.alias || temItem.type) + '_' + new Date().getTime() + temIndex
          this.fieldsarr.forEach(fieldItem => {
            if (temItem.value === fieldItem.alias) {
              temItem.name = fieldItem.name
              temItem.formtype = fieldItem.formtype
              temItem.fieldid = fieldItem.id
            }
          })
        })
        if (this.mytemplate.some(item => item.column)) {
          const gridData = [{
            'type': 'grid',
            'label': '栅格布局',
            'columns': [],
            'options': {
              'gutter': 5
            },
            'key': 'grid' + new Date().getTime()
          }]
          this.mytemplate.forEach(item => {
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
          this.data.list = gridData
        } else {
          this.data.list = newValue
        }
        this.fieldsarr.forEach(item => {
          const obj = {
            type: 'field',
            name: item.name,
            labelShow: item.labelShow,
            fieldid: item.id,
            value: item.alias,
            formtype: item.formtype,
            change_title: item.change_title,
            placeholder: '0',
            fieldrule: item.setting && item.setting.rule ? item.setting.rule : 'allow',
            attribute: '',
            componentName: '',
            validitytype: null
          }
          const string = JSON.stringify(this.mytemplate)
          if (string.indexOf(item.alias) === -1) {
            this.myArray.push(obj)
          }
          this.allMyArray.push(obj)
        })
        this.initJs = this.tplInitJs
        this.verifStr = this.verifJs
      } else {
        this.data.list = newValue
      }
    },
    data: {
      handler (newValue) {
        this.$nextTick(() => {
          this.revoke.push(newValue)
        })
        this.myArray = JSON.parse(JSON.stringify(this.allMyArray))
        if (!this.tableType) {
          const getList = (array) => {
            array.forEach(item => {
              if (item.columns) {
                getList(item.columns)
              } else if (item.trs) {
                getList(item.trs)
              } else if (item.tds) {
                getList(item.tds)
              } else if (item.list) {
                getList(item.list)
              } else {
                this.myArray = this.myArray.filter(arrItem => arrItem.value !== item.value)
              }
            })
          }
          getList(newValue.list)
        } else {
          const getList = (array) => {
            array.forEach(item => {
              if (item.columns) {
                getList(item.columns)
              } else if (item.tds) {
                getList(item.tds)
              } else if (item.trs) {
                getList(item.trs)
              } else if (item.list) {
                getList(item.list)
              } else {
                this.myArray = this.myArray.filter(arrItem => arrItem.alias !== item.alias)
              }
            })
          }
          getList(newValue.list)
        }
      },
      immediate: true,
      deep: true
    },
    fieldsarr (newValue) {
      if (this.tableType) {
        this.myArray = newValue
        this.allMyArray = JSON.parse(JSON.stringify(newValue))
      }
    }
  },
  computed: {
    basicsArray () {
      // 计算需要显示的基础字段
      return basicsList.filter(item => this.fields.includes(item.type) || this.fields.includes(item.getType))
    },
    layoutArray () {
      // 计算需要显示的布局字段
      return layoutList.filter(item => this.tableType ? this.fields.includes(item.type) : this.fields.includes(item.type))
    },
    collapseDefaultActiveKey () {
      // 计算当前展开的控件列表
      const defaultActiveKey = window.localStorage.getItem(
        'collapseDefaultActiveKey'
      )
      if (defaultActiveKey) {
        return defaultActiveKey.split(',')
      } else {
        return ['1']
      }
    }
  },
  methods: {
    generateKey (list, index) {
      // 生成key值
      const key = (list[index].formtype || list[index].type) + '_' + new Date().getTime()
      this.$set(list, index, {
        ...list[index],
        key,
        model: key
      })
      if (this.noModel.includes(list[index].type)) {
        // 删除不需要的model属性
        delete list[index].model
      }
    },
    handleListPush (item) {
      // 双击控件按钮push到list
      // 生成key值
      if (!this.selectItem.key) {
        // 在没有选择表单时，将数据push到this.data.list
        const key = (item.formtype || item.type) + '_' + new Date().getTime()
        item = {
          ...item,
          key,
          model: key
        }
        if (this.noModel.includes(item.formtype || item.type)) {
          // 删除不需要的model属性
          delete item.model
        }
        // const itemString = JSON.stringify(item)
        const record = JSON.parse(JSON.stringify(item))
        // 删除icon及compoent属性
        delete record.icon
        delete record.component
        this.data.list.push(record)
        this.handleSetSelectItem(record)
        return false
      }
      this.$refs.KFCP.handleCopy(false, item)
    },
    handleOpenJsonModal () {
      // 打开json预览模态框
      this.$refs.jsonModal.jsonData = this.data
      this.$refs.jsonModal.visible = true
    },
    handleOpenCodeModal () {
      // 打开代码预览模态框
      this.$refs.codeModal.jsonData = this.data
      this.$refs.codeModal.visible = true
    },
    handleOpenImportJsonModal () {
      // 打开json预览模态框
      this.$refs.importJsonModal.jsonData = this.data
      this.$refs.importJsonModal.handleSetSelectItem = this.handleSetSelectItem
      this.$refs.importJsonModal.visible = true
    },
    handlePreview () {
      // 打开预览模态框
      this.$refs.previewModal.jsonData = this.data
      this.$refs.previewModal.previewWidth = this.previewOptions.width
      this.$refs.previewModal.visible = true
    },
    querierFormRule () {
      this.$refs.querierFormRule.show({
        title: '表单规则',
        page: 'viewForm',
        valueinit: this.initJs,
        value: this.verifStr
      })
    },
    getRule (value) {
      this.field_rule = value
    },
    changeAllStatus (e) {
      this.allStatus(this.data.list, e.key)
    },
    saveAs () {
      this.form.validateFields((err, val) => {
        if (!err) {
          console.log(this.form.getFieldsValue())
        }
      })
    },
    // 根据显示名称赋值系统名称
    handleChangeName (e) {
      this.data.name = e.target.value
      if (this.aliasDisabled) {
        return false
      }
      const pinyin = require('js-pinyin')
      const reg = new RegExp(/^(?![0-9]|_)[a-z0-9_]+$/)
      const reg2 = new RegExp(/^[a-z0-9_]+$/)
      var val = pinyin.getCamelChars(e.target.value)
      val = val.toLowerCase()
      val = val.split('')
      this.getVal(val, reg)
      val = val.filter(item => {
        return reg2.test(item)
      })
      const { setFieldsValue } = this.form
      setFieldsValue({ 'info[alias]': val.join('') })
    },
    // 递归判断是否首字不是数字
    getVal (val, reg) {
      if (!reg.test(val[0])) {
        val.shift()
        this.getVal(val, reg)
      }
    },
    allStatus (array, type) {
      array.forEach((item, index) => {
        if (item.columns) {
          this.allStatus(item.columns, type)
        } else if (item.trs) {
          this.allStatus(item.trs, type)
        } else if (item.tds) {
          this.allStatus(item.tds, type)
        } else if (item.list) {
          this.allStatus(item.list, type)
        } else {
          if (type === '1' && item.type === 'field') {
            this.$set(item, 'fieldrule', 'allow')
          } else if (type === '0' && item.type === 'field') {
            this.$set(item, 'fieldrule', 'readonly')
          }
        }
      })
    },
    getCode (value, type) {
      if (type === 'init') {
        this.initJs = value
      } else if (type === 'verif') {
        this.verifStr = value
      }
    },
    handleReset () {
      // 清空
      this.$confirm({
        title: '警告',
        content: '是否确认清空内容?',
        okText: '是',
        okType: 'danger',
        cancelText: '否',
        onOk: () => {
          this.data.list = []
          this.handleSetSelectItem({ key: '' })
          this.$message.success('已清空')
        }
      })
    },
    handleSetSelectItem (record) {
      // 操作间隔不能低于100毫秒
      const newTime = new Date().getTime()
      if (newTime - this.updateTime < 100) {
        return false
      }
      this.updateTime = newTime
      // 设置selectItem的值
      this.selectItem = record
      // 判断是否选中控件，如果选中则弹出属性面板，否则关闭属性面板
      if (record.key) {
        this.startType = record.formtype || record.type
        this.showPropertie = true
      } else {
        this.showPropertie = false
      }
      this.$nextTick(() => {
        this.$set(this.data.config, 'show', !this.data.config['show'])
      })
    },
    handleSetData (data) {
      // 用于父组件赋值
      try {
        if (typeof data !== 'object') {
          return false
        } else {
          this.data = data
          // 导入json数据后，需要清除已选择key
          this.handleSetSelectItem({ key: '' })
        }
        return true
      } catch (error) {
        return false
      }
    },
    collapseChange (val) {
      // 点击collapse时，保存当前collapse状态
      window.localStorage.setItem('collapseDefaultActiveKey', val)
    },
    handleStart (type, index) {
      this.startType = type
    },
    /**
     * @description: 撤销
     * @param {*}
     * @return {*}
     */
    handleUndo () {
      const record = this.revoke.undo()
      if (!record) {
        return false
      }
      this.data = record

      this.handleSetSelectItem({ key: '' })
    },

    /**
     * @description: 重做
     * @param {*}
     * @return {*}
     */
    handleRedo () {
      const record = this.revoke.redo()
      if (!record) {
        return false
      }
      this.data = record
    }

  }
}
</script>
