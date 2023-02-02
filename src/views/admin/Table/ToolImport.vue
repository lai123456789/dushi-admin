<template>
  <a-drawer
    :destroyOnClose="true"
    title="模板管理：导入"
    :width="900"
    :closable="false"
    :visible="visible"
    @close="visible = false" >
    <a-spin :spinning="loading">
      <a-form :form="form" @submit="handleSubmit">
        <a-tabs>
          <a-tab-pane key="modal" tab="导入模板">
            <a-form-item label="Excel模板名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['modalName', {initialValue: modal.modalName, rules: [{ required: true, message: '请输入模板名称'}]}]" />
            </a-form-item>
            <a-form-item label="导入方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-checkbox-group v-model="modal.action">
                <a-checkbox value="add" disabled>新增</a-checkbox>
                <a-checkbox value="edit">编辑</a-checkbox>
                <a-checkbox value="addEdit">新增&编辑</a-checkbox>
                <a-checkbox value="editImgs">编辑图片</a-checkbox>
                <a-checkbox value="del">删除</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-form-item label="最大行数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number :min="0" v-model="modal.maxRows" placeholder="10000"></a-input-number>
            </a-form-item>
            <a-divider orientation="left">导入字段设置</a-divider>
            <template>
              <a-space>
                <a-button type="primary" @click="choiceField">选择字段</a-button>
                <a-button @click="handleSort">排序</a-button>
                <a-button @click="getColumns">加载数据窗口列</a-button>
              </a-space>
              <a-table
                ref="table"
                rowKey="alias"
                :columns="columns"
                :dataSource="fieldsList"
                size="small"
                style="margin-top: 8px;">
                <template slot="action" slot-scope="text, record">
                  <a href="javascript: void(0)" @click="() => { fieldsList = fieldsList.filter(item => item.alias !== record.alias) }">删除</a>
                </template>
                <template slot="index" slot-scope="text, record, index">
                  {{ index + 1 }}
                </template>
                <template slot="unique" slot-scope="text">
                  <span v-if="text === '1'" ><a-badge status="success" text="√" /></span>
                  <span v-else><a-badge status="default" text="×" /></span>
                </template>
                <template slot="required" slot-scope="text">
                  <span v-if="text === '1'" ><a-badge status="success" text="√" /></span>
                  <span v-else><a-badge status="default" text="×" /></span>
                </template>
                <template slot="regexp" slot-scope="text, record">
                  <a-input v-model="record.regexp" size="small">
                    <a-select
                      slot="addonAfter"
                      style="width: 100px;"
                      defaultValue=""
                      @change="value => record.regexp = value">
                      <a-select-option v-for="regex in regexs" :key="regex.value" :value="regex.value">{{ regex.text }}</a-select-option>
                    </a-select>
                  </a-input>
                </template>
                <template slot="editable" slot-scope="text, record">
                  <a-select size="small" :defaultValue="record.editable || 'cover'" @change="value => record.editable = value" v-if="record.formtype === 'text' || record.formtype === 'textarea'">
                    <a-select-option value="cover">覆盖</a-select-option>
                    <a-select-option value="add">追加</a-select-option>
                  </a-select>
                  <span v-else>
                    --
                  </span>
                </template>
              </a-table>
            </template>
          </a-tab-pane>
          <a-tab-pane key="event" tab="导入事件">
            <a-alert
              :message="message"
              type="info"
            />
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">自定义事件
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>自定义事件：设置函数地址: crm/order/test，数据导入前系统会调用crm模块下order控制器中的test方法</span>
                  </template>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-row>
                <a-col :span="2">
                  <a-switch checked-children="开" un-checked-children="关" :default-checked="event.custom_event === '1'" @change="(checked) => { onChecked('custom_event', checked) }"/>
                </a-col>
                <a-col :span="21" v-if="event.custom_event === '1'">
                  <a-form :form="formremark">
                    <a-form-item label="自定义路径" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                      <a-input v-decorator="['custom_event_url', {initialValue: custom_event_url, rules: [{ required: true, message: '请输入自定义路径'}]}]" />
                    </a-form-item>
                    <a-form-item label="备注" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" :required="true">
                      <a-textarea
                        :auto-size="{ minRows: 3, maxRows: 5 }"
                        v-decorator="['remarks', {initialValue: remarks, rules: [{ required: true, message: '请输入备注'}]}]" />
                    </a-form-item>
                  </a-form>
                </a-col>

              </a-row>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">多字段联合查重
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>导入前事件。最多支持3个字段联合查重，仅支持UI组件为单行文本的字段，字段间为“且”的关系</span>
                  </template>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-switch checked-children="开" un-checked-children="关" :default-checked="event.lookup === '1'" @change="(checked) => { onChecked('lookup', checked) }" />
            </a-form-item>
            <template v-if="event.lookup === '1'">
              <a-form-item label="字段一" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-select v-model="lookupData[0]" :allowClear="lookupData[0] ? true : false">
                  <a-select-option v-for="(item, fieldIndex) in fieldsText" :key="fieldIndex" :value="item.alias" >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="字段二" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-select v-model="lookupData[1]" :allowClear="lookupData[1] ? true : false">
                  <a-select-option v-for="(item, fieldIndex) in fieldsText" :key="fieldIndex" :value="item.alias" >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="字段三" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-select v-model="lookupData[2]" :allowClear="lookupData[2] ? true : false">
                  <a-select-option v-for="(item, fieldIndex) in fieldsText" :key="fieldIndex" :value="item.alias" >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </template>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">联表同步数据
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>导入前事件。设置后会从源数据表，按关键字段同步信息到导入的信息。如：导入{产品编号}后从产品基础信息表同步{产品名称}、{产品型号}等信息</span>
                  </template>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-switch checked-children="开" un-checked-children="关" :default-checked="event.sync === '1'" @change="(checked) => { onChecked('sync', checked) }" />
            </a-form-item>
            <template v-if="event.sync === '1'">
              <a-row
                style="margin:0 0 10px 40px;"
                type="flex"
                align="middle"
                v-for="(list, listIndex) in tableList"
                :key="listIndex"
                :gutter="24">
                <a-col :span="21">
                  <a-card>
                    <a-form-item label="联表同步源数据表">
                      <a-select
                        placeholder="请选择源数据表"
                        :show-search="true"
                        :value="list.sourceData"
                        option-filter-prop="children"
                        allowClear
                        @change="(value) => { handleTable(list, listIndex, value) }"
                      >
                        <a-select-option v-for="table in tableField" :key="table.id" :value="table.tableid">{{ table.alias }}({{ table.name }})</a-select-option>
                      </a-select>
                    </a-form-item>
                    <a-alert message="请选择源数据表" banner v-if="!list.sourceData"/>
                    <a-form-item label="联表同步">
                      <a-spin :spinning="!list.sourceData">
                        <span slot="indicator"></span>
                        <div>
                          <a-row>
                            <a-col :span="9">
                              <a-select
                                placeholder="请选择"
                                :defaultValue="list.cause.currentField"
                                @change=" (value) => { choiceCause(list, listIndex, 'current', value) }"
                                allowClear
                                :show-search="true"
                                option-filter-prop="children">
                                <a-select-option v-for="(field, fieldIndex) in list.cause.currentOption" :key="fieldIndex" :value="field.alias">
                                  {{ field.name }}
                                </a-select-option>
                              </a-select>
                            </a-col>
                            <a-col :span="3" style="text-align: center">
                              值等于
                            </a-col>
                            <a-col :span="9">
                              <a-select
                                placeholder="请选择"
                                :defaultValue="list.cause.sourceField"
                                @change=" (value) => { choiceCause(list, listIndex, 'source', value) }"
                                allowClear
                                :show-search="true"
                                option-filter-prop="children">
                                <a-select-option v-for="(field, fieldIndex) in list.cause.sourceOption" :key="fieldIndex" :value="field.alias">
                                  {{ field.name }}
                                </a-select-option>
                              </a-select>
                            </a-col>
                            <a-col :span="3" style="text-align: center">
                              的值时
                            </a-col>
                          </a-row>
                          <a-row type="flex" align="middle" v-for="(efItem, efIndex) in list.effect" :key="efIndex">
                            <a-col :span="9">
                              <a-select
                                placeholder="请选择"
                                :value="efItem.currentField"
                                @change="(value) => { choiceEffect(list, listIndex, efItem, efIndex, 'current', value) } "
                                allowClear
                                :show-search="true"
                                option-filter-prop="children">
                                <a-select-option v-for="(field, fieldIndex) in efItem.currentOption" :key="fieldIndex" :value="field.alias">
                                  {{ field.name }}
                                </a-select-option>
                              </a-select>
                            </a-col>
                            <a-col :span="3" style="text-align: center">
                              值等于
                            </a-col>
                            <a-col :span="9">
                              <a-select
                                placeholder="请选择"
                                :value="efItem.sourceField"
                                @change="(value) => { choiceEffect(list, listIndex, efItem, efIndex, 'source', value) } "
                                allowClear
                                :show-search="true"
                                option-filter-prop="children">
                                <a-select-option v-for="(field, fieldIndex) in efItem.sourceOption" :key="fieldIndex" :value="field.alias">
                                  {{ field.name }}
                                </a-select-option>
                              </a-select>
                            </a-col>
                            <a-col :span="3" style="display: flex; justify-content: center; align-items: center;">
                              <a-icon
                                style="font-size: 26px; color: #52c41a; margin-right: 8px;"
                                type="plus-square"
                                theme="filled"
                                @click="addEffect(list.effect)"/>
                              <a-icon
                                style="font-size: 26px;"
                                :style="{ color: list.effect.length === 1 ? '#bfbfbf':'#ff4d4f' }"
                                type="minus-square"
                                theme="filled"
                                @click="() => { if (list.effect.length !== 1) { list.effect.splice(efIndex, 1) } }"
                              />
                            </a-col>
                          </a-row>
                        </div>
                      </a-spin>
                    </a-form-item>
                  </a-card>
                </a-col>
                <a-col :span="3" style="height: 200px; display: flex; align-items: center;">
                  <a-icon style="font-size: 26px;color: #52c41a; margin-right: 8px;" type="plus-square" theme="filled" @click="add"/>
                  <a-icon
                    style="font-size: 26px;"
                    :style="{ color: tableList.length === 1 ? '#bfbfbf':'#ff4d4f' }"
                    type="minus-square"
                    theme="filled"
                    @click="() => { if (tableList.length !== 1) { tableList.splice(listIndex, 1) } }"
                  />
                </a-col>
              </a-row>
            </template>
            <a-form-item label="生成工作流" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-row>
                <a-col :span="4">
                  <a-switch checked-children="开" un-checked-children="关" :default-checked="event.workflow === '1'" @change="(checked) => { onChecked('workflow', checked) }" />
                </a-col>
                <a-col :span="8">
                  <a-select v-if="event.workflow === '1'" placeholder="请选择工作流" v-model="workflowData">
                    <a-select-option v-for="item in flows" :key="item.id" :value="item.workflow_id">{{ item.workflow_name }}</a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible = false">关闭</a-button>
      </div>
    </a-spin>
    <column-check ref="columnCheck" @ok="getSaveList" :dataList="initFieldsList" :fieldCategory="fieldCategory"/>
    <ColumnSort ref="columnSort" @ok="getList" />
  </a-drawer>
</template>
<script>
export default {
  components: {
    ColumnSort: () => import('./ColumnSort'),
    ColumnCheck: () => import('./ColumnCheck')
  },
  props: {
    fieldCategory: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    tableidAll: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    active: {
      type: String,
      default () {
        return ''
      },
      required: false
    },
    tabThis: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      initFieldsList: [],
      fieldKey: 'fieldKey',
      loading: false,
      visible: false,
      config: {},
      message: (<div>
        <div>1、导入事件执行优先级：联表同步数据→多字段联合查重→生成工作流。</div>
        <div>2、多字段联合查重时，若遇到查重受阻会停止导入，可在导入查看中看到停止在哪一行数据。</div>
        <div>3、导入前事件：数据导入前要执行的操作，如果操作执行不成功，会停止导入。</div>
        <div>4、导入后事件：数据导入后才执行的操作。</div></div>),
      tableid: '',
      custom_event_url: '',
      remarks: '',
      form: this.$form.createForm(this),
      formremark: this.$form.createForm(this, { name: 'remark' }),
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      templateRemarks: null,
      bartemplate: { }, // 传给父级数据
      modal: {
        modalName: '',
        action: ['add'],
        maxRows: ''
      }, // 导入模板数据
      columns: [{
        title: '操作',
        align: 'center',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        dataIndex: 'index',
        scopedSlots: { customRender: 'index' }
      }, {
        title: '字段系统名',
        dataIndex: 'alias',
        width: 100
      }, {
        title: 'Excel模板列名称',
        dataIndex: 'modalName',
        width: 150
      }, {
        title: '唯一',
        dataIndex: 'unique',
        scopedSlots: { customRender: 'unique' }
      }, {
        title: '必填',
        dataIndex: 'required',
        scopedSlots: { customRender: 'required' }
      }, {
        title: '正则表达式',
        dataIndex: 'regexp',
        width: 300,
        scopedSlots: { customRender: 'regexp' }
      }, {
        title: '编辑模式',
        dataIndex: 'editable',
        scopedSlots: { customRender: 'editable' }
      }],
      fieldsList: [],
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
      checkedList: [],
      tableList: [ {
        sourceData: undefined,
        cause: {
          currentOption: [],
          sourceOption: [],
          formtype: '',
          currentField: undefined,
          sourceField: undefined
        },
        effect: [{
          currentOption: [],
          sourceOption: [],
          formtype: '',
          currentField: undefined,
          sourceField: undefined
        }]
      } ],
      event: {
        lookup: '0',
        workflow: '0',
        sync: '0',
        custom_event: '0'
      },
      fieldsText: [],
      fieldsCurrent: [],
      fieldsCurObj: [],
      fields: [],
      fieldsObj: [],
      lookupData: ['', '', ''],
      workflowData: undefined,
      syncData: [],
      flows: [],
      tableField: [],
      table_value: ''
    }
  },
  inject: {
    theme: {
      default: () => {}
    }
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
      this.flows = this.theme.viewData.workflow
      const bartemplate = config.record.bartemplate
      this.bartemplate = bartemplate ? JSON.parse(bartemplate) : {}
      if (this.bartemplate.event && !this.bartemplate.event.custom_event) {
        Object.assign(this.bartemplate.event, { custom_event: '0' })
      }
      this.modal = this.bartemplate.modal || Object.assign(this.modal, { modalName: this.theme.item.name })
      this.event = this.bartemplate.event || Object.assign(this.event)
      this.custom_event_url = this.event.custom_event === '1' ? (this.event.custom_event_url ? this.event.custom_event_url : '') : ''
      this.remarks = this.event.custom_event === '1' ? (this.event.remarks ? this.event.remarks : '') : ''
      this.lookupData = this.event.lookup === '1' ? (this.event.lookupData ? this.event.lookupData : ['', '', '']) : ['', '', '']
      this.workflowData = this.event.workflow === '1' ? (this.event.workflowData ? this.event.workflowData : undefined) : undefined
      this.syncData = this.event.sync === '1' ? (this.event.syncData ? this.event.syncData : []) : []
      this.fieldsList = this.modal.fieldsList || []
      this.fieldsList.forEach(fieItem => {
        if (this.tabThis.$refs.column && this.tabThis.$refs.column.dataSource) {
          this.tabThis.$refs.column.dataSource.forEach(dataItem => {
            if (dataItem.alias === (fieItem.alias || fieItem.value) && dataItem.custom_title) {
              fieItem.modalName = dataItem.custom_title
            }
          })
        }
      })
      this.tableList = this.event.tableList ? this.event.tableList : this.tableList
      for (const i in this.tableidAll) {
        if (this.active === i) {
          this.tableid = this.tableidAll[i]
        }
      }
      this.recordIndex = config.index
      const parameter = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'listOrder',
        sortOrder: 'ascend'
      }
      this.loading = true
      // 获取所有字段列表
      const p = new Promise((resolve, reject) => {
        this.axios({
          url: '/admin/field/init',
          params: Object.assign(parameter, { tableid: this.tableid })
        }).then(res => {
          const data = res.result.data.map(item => {
            const obj = {}
            obj.alias = item.alias
            obj.name = item.name
            obj.setting = item.setting
            obj.tableid = item.tableid
            obj.formtype = item.formtype
            return obj
          })
          this.fieldsCurrent = JSON.parse(JSON.stringify(data))
          this.fieldsCurObj = this.getObj(this.fieldsCurrent)
          this.fieldsText = data.filter(item => item.formtype === 'text')
          this.checkedList = []
          if (this.tabThis.$refs.column) {
            data.forEach(checkItem => {
              const obj = checkItem
              if (this.tabThis.$refs.column && this.tabThis.$refs.column.dataSource) {
                this.tabThis.$refs.column.dataSource.forEach(dataItem => {
                  if (dataItem.alias === (checkItem.alias || checkItem.value) && dataItem.custom_title) {
                    obj.name = dataItem.custom_title
                  }
                })
              }
              this.checkedList.push(obj)
            })
          } else {
            this.checkedList = data
          }
          resolve()
        })
      })
      // 获取所有数据表
      p.then(() => {
        if (this.event.tableList) {
          const proArr = []
          this.tableList.forEach((item, index) => {
            const tableValue = item.sourceData
            if (tableValue) {
              const p = new Promise((resolve) => {
                this.axios({
                  url: '/admin/field/init',
                  params: {
                    pageNo: 1,
                    pageSize: 1000,
                    sortField: 'listOrder',
                    sortOrder: 'ascend',
                    tableid: tableValue
                  }
                }).then(res => {
                  if (res.code === 0) {
                    const data = res.result.data.map(item => {
                      const obj = {}
                      obj.alias = item.alias
                      obj.name = item.name
                      obj.tableid = item.tableid
                      obj.formtype = item.formtype
                      return obj
                    })
                    item.fields = data
                    item.fieldsObj = this.getObj(item.fields)
                    item.cause.currentOption = item.cause.formtype ? this.fieldsCurrent.filter(field => field.formtype === item.cause.formtype) : this.fieldsCurrent
                    item.cause.sourceOption = item.cause.formtype ? data.filter(field => field.formtype === item.cause.formtype) : data
                    item.effect.forEach(efItem => {
                      efItem.currentOption = efItem.formtype ? this.fieldsCurrent.filter(field => field.formtype === efItem.formtype) : this.fieldsCurrent
                      efItem.sourceOption = efItem.formtype ? data.filter(field => field.formtype === efItem.formtype) : data
                    })
                    resolve({ item, index })
                  } else {
                    this.$message.error(res.message)
                  }
                })
              })
              proArr.push(p)
            }
          })
          Promise.all(proArr)
            .then(() => {
              this.loading = false
              this.tableList = JSON.parse(JSON.stringify(this.tableList))
            })
        } else {
          this.loading = false
          const item = this.tableList[0]
          item.cause.currentOption = this.fieldsCurrent
          const efItem = item.effect[0]
          efItem.currentOption = this.fieldsCurrent
        }
      })
      this.axios({
        url: '/admin/table/getTables'
      }).then(res => {
        this.tableField = res.result.data
      })
    },
    handleSort () {
      for (const i in this.fieldsList) {
        this.fieldsList[i]['name'] = this.fieldsList[i].modalName
      }
      this.$nextTick(() => {
        this.$refs.columnSort.show({
          action: 'sort',
          title: '排序',
          data: this.fieldsList
        })
      })
    },
    getSaveList (data) {
      data.forEach((item, index) => {
        item.sortid = String((index + 1) * 10)
      })
      this.fieldsList = data.map((item, index) => {
        const obj = {
          alias: item.alias,
          formtype: item.formtype,
          modalName: item.name,
          name: item.name,
          regexp: '',
          required: '0',
          unique: '0'
        }
        return obj
      })
    },
    // 获取重新排序列表
    getList (data) {
      data.forEach((item, index) => {
        item.listorder = String((index + 1) * 10)
      })
      this.fieldsList = data
    },
    // 字段数组对象转对象
    getObj (arr) {
      const obj = {}
      arr.forEach(item => {
        obj[item.alias] = item
      })
      return obj
    },
    // 选择字段
    choiceField () {
      this.fieldKey = this.fieldKey === 'fieldKey' ? 'fieldKey_1' : 'fieldKey'
      this.initFieldsList = this.fieldsList.map(item => { const obj = { value: item.alias || item.value }; return obj })
      this.$nextTick(() => {
        this.checkedList = this.checkedList.filter(item => {
          const setting = JSON.parse(item.setting)
          return (setting.attribute.dataSource !== 'addressBook' && setting.attribute.dataSource !== 'src_path_back')
        })
        this.checkedList.forEach((item, index) => {
          item.value = item.alias
        })
        this.$refs.columnCheck.show({
          action: 'edit',
          title: '选择字段',
          data: this.checkedList
        })
      })
    },
    // 获取字段
    getFieldsList (val) {
      this.fieldsList = val
    },
    getColumns () {
      const that = this
      this.$confirm({
        title: '即将加载数据窗口列的配置到导入模板，该操作会覆盖当前已有配置，确定吗？',
        onOk () {
          if (that.tabThis.$refs.column && that.tabThis.$refs.column.dataSource && that.tabThis.$refs.column.dataSource.length) {
            that.fieldsList = that.tabThis.$refs.column.dataSource.map(item => {
              const obj = {
                alias: item.alias,
                formtype: item.formtype,
                modalName: item.name,
                name: item.name,
                regexp: '',
                required: '0',
                unique: '0'
              }
              return obj
            })
          } else {
            that.$message.error('请先添加列属性字段')
          }
        }
      })
    },
    // 导入后事件页面
    // 三个开关触发事件
    onChecked (type, checked) {
      this.event[type] = checked ? '1' : '0'
    },
    // 选择源数据表
    handleTable (list, index, value) {
      list.sourceData = value
      // 清空数据表
      if (!value) {
        list.cause.sourceOption = []
        list.effect.forEach(efItem => {
          efItem.sourceOption = []
        })
        this.tableList.splice(index, 1, list)
        return false
      }
      // 选择数据表
      const parameter = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'listOrder',
        sortOrder: 'ascend'
      }
      this.axios({
        url: '/admin/field/init',
        params: Object.assign(parameter, { tableid: value })
      }).then(res => {
        if (res.code === 0) {
          const data = res.result.data.map(item => {
            const obj = {}
            obj.alias = item.alias
            obj.name = item.name
            obj.tableid = item.tableid
            obj.formtype = item.formtype
            return obj
          })
          list.fields = data
          list.fieldsObj = this.getObj(list.fields)
          list.cause.sourceOption = list.cause.formtype ? data.filter(field => field.formtype === list.cause.formtype) : data
          list.effect.forEach(efItem => {
            efItem.sourceOption = efItem.formtype ? data.filter(field => field.formtype === efItem.formtype) : data
          })
          this.tableList.splice(index, 1, list)
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 选择cause field
    choiceCause (list, listIndex, type, value) {
      // 选择框赋值
      if (type === 'current') {
        list.cause.currentField = value
      } else {
        list.cause.sourceField = value
      }
      // 字段类型赋值
      if (!list.cause.currentField && !list.cause.sourceField) {
        list.cause.formtype = ''
      } else if (type === 'current' && value) {
        list.cause.formtype = this.fieldsCurObj[value].formtype
      } else if (type === 'source' && value) {
        list.cause.formtype = list.fieldsObj[value].formtype
      }
      list.cause.currentOption = list.cause.formtype ? this.fieldsCurrent.filter(field => field.formtype === list.cause.formtype) : this.fieldsCurrent
      list.cause.sourceOption = list.cause.formtype ? list.fields.filter(field => field.formtype === list.cause.formtype) : list.fields
      this.tableList.splice(listIndex, 1, list)
    },
    // 选择effect field
    choiceEffect (list, listIndex, efItem, efIndex, type, value) {
      // 选择框赋值
      if (type === 'current') {
        efItem.currentField = value
      } else {
        efItem.sourceField = value
      }
      // 字段类型赋值
      if (!efItem.currentField && !efItem.sourceField) {
        efItem.formtype = ''
      } else if (type === 'current' && value) {
        efItem.formtype = this.fieldsCurObj[value].formtype
      } else if (type === 'source' && value) {
        efItem.formtype = list.fieldsObj[value].formtype
      }
      efItem.currentOption = efItem.formtype ? this.fieldsCurrent.filter(field => field.formtype === efItem.formtype) : this.fieldsCurrent
      efItem.sourceOption = efItem.formtype ? list.fields.filter(field => field.formtype === efItem.formtype) : list.fields
      this.tableList.splice(listIndex, 1, list)
    },
    // 增加导致结果
    addEffect (effect) {
      effect.push({
        currentOption: this.fieldsCurrent,
        sourceOption: this.fields,
        formtype: '',
        currentField: undefined,
        sourceField: undefined
      })
    },
    // 增加
    add () {
      this.tableList.push({
        sourceData: undefined,
        cause: {
          currentOption: this.fieldsCurrent,
          sourceOption: [],
          formtype: '',
          currentField: undefined,
          sourceField: undefined
        },
        effect: [{
          currentOption: this.fieldsCurrent,
          sourceOption: [],
          formtype: '',
          currentField: undefined,
          sourceField: undefined
        }]
      })
    },
    // 提交
    handleSubmit () {
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (this.event.custom_event === '1' && (!this.formremark.getFieldValue('remarks') || !this.formremark.getFieldValue('custom_event_url'))) {
          const { validateFields } = this.formremark
          validateFields((err, val) => {
            if (err) {
              this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
            }
          })
        } else {
          if (!errors) {
            this.modal.fieldsList = this.fieldsList
            this.modal.modalName = values.modalName
            this.bartemplate.modal = this.modal
            // 导入后事件
            if (this.event.lookup === '1') {
              this.event.lookupData = this.lookupData
            }
            if (this.event.custom_event === '1') {
              this.event.custom_event_url = this.formremark.getFieldValue('custom_event_url')
              this.event.remarks = this.formremark.getFieldValue('remarks')
            }
            if (this.event.workflow === '1') {
              this.event.workflowData = this.workflowData
            }
            if (this.event.sync === '1') {
              const tableList = this.tableList.map(item => {
                const obj = {}
                obj.sourceData = item.sourceData
                obj.cause = {}
                obj.cause.currentField = item.cause.currentField
                obj.cause.formtype = item.cause.formtype
                obj.cause.sourceField = item.cause.sourceField
                obj.effect = item.effect.map(efItem => {
                  const efBbj = {}
                  efBbj.currentField = efItem.currentField
                  efBbj.formtype = efItem.formtype
                  efBbj.sourceField = efItem.sourceField
                  return efBbj
                })
                return obj
              })
              this.event.tableList = tableList
            } else {
              this.event.tableList = undefined
            }
            this.bartemplate.event = this.event
            this.$emit('func', this.bartemplate, this.recordIndex)
            this.$message.success('操作成功')
            this.visible = false
          } else {
            this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
          }
        }
      })
    }
  }
}
</script>
