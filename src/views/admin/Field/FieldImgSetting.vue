<template>

  <a-drawer
    title="移动端扩展设置"
    :width="800"
    :visible="visible"
    @close="visible = !visible"
  >
    <a-spin :spinning="loading">
      <div>
        <a-button block type="dashed" @click="addData">新增移动端扩展设置</a-button>
        <div style="margin-top: 10px">
          <a-form :form="formDrawer" layout="inline">
            <a-collapse defaultActiveKey="0">
              <a-collapse-panel v-for="(item, key) in dynamicData" :key="key" :header="'移动端扩展设置-' + (key + 1)">
                <a-divider orientation="left" style="font-size: 14px">当：满足以下条件</a-divider>
                <div>
                  <div>
                    <a-button
                      type="primary"
                      size="small"
                      @click="item.conditions.push({
                        fieldUser:'field',
                        condition:[{
                          logic:'and'
                        }],
                        logic:'and'
                      })">添加</a-button>
                    <span style="margin-left: 15px;"> 以下条件组合方式 </span>
                    <a-select v-model="item.logic" style="width: 80px; margin-left: 15px;" size="small">
                      <a-select-option value="and">且(and)</a-select-option>
                      <a-select-option value="or">或(or)</a-select-option>
                    </a-select>
                    <a-card size="small" style="margin-top: 10px" v-if="item.conditions.length > 0">
                      <a-row v-for="(simpleItem, simpleIndex) in item.conditions" :key="simpleIndex" type="flex" align="middle" :gutter="10">
                        <a-col :span="3">
                          <a-select
                            v-model="simpleItem.fieldUser"
                            size="small"
                            @change="(value) => {
                              if (value === 'field') {
                                simpleItem.condition = [ {
                                  include: '',
                                  value: ''
                                }]
                              } else {
                                simpleItem.condition = [ {
                                  include: '',
                                  value: []
                                }]
                              } }">
                            <a-select-option value="field" >字段</a-select-option>
                            <a-select-option value="else">else条件</a-select-option>
                            <a-select-option value="custom" @click="simpleItem.ruleModel = '1'">自定义</a-select-option>
                          </a-select>
                        </a-col>
                        <a-col :span="4" v-if="simpleItem.fieldUser === 'field'">
                          <a-select
                            size="small"
                            show-search
                            :allowClear="true"
                            option-filter-prop="children"
                            v-if="simpleItem.fieldUser === 'field'"
                            v-model="simpleItem.field"
                            @change="(value) => {
                              simpleItem.condition = [{
                                include: '',
                                value: ''
                              }]
                              fieldArr.forEach(item1 => {
                                if (item1.alias === value) {
                                  item1.settings = JSON.parse(item1.setting)
                                  // 判断是否有数据字典
                                  simpleItem.src = item1.settings.form.src ? item1.settings.form.src : ''
                                  simpleItem.formtype = item1.formtype
                                  simpleItem.fieldid = item1.fieldid
                                  simpleItem.fieldtype = item1.fieldtype
                                  if (simpleItem.src && item1.formtype === 'treeselect' ) {
                                    getTreeOption(simpleItem, item1)
                                  } else if (simpleItem.src) {
                                    getOption(simpleItem)
                                  } else if(item1.formtype === 'treeselect'){
                                    simpleItem.dataSource = item1.settings.attribute.dataSource
                                    getTreeOption(simpleItem, item1)
                                  } else {
                                    simpleItem.option = []
                                  }
                                  simpleItem.form = item1.settings.form
                                  // 根据字段，给出相应条件
                                  if (['text', 'textarea'].indexOf(item1.formtype) !== -1) {
                                    simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' },
                                                               { enName: 'ne', cnName: '不等于' },
                                                               { enName: 'contain', cnName: '包含' },
                                                               { enName: 'nc', cnName: '不包含' },
                                                               { enName: 'bw', cnName: '开始于' },
                                                               { enName: 'ew', cnName: '结束于' },
                                                               { enName: 'em', cnName: '为空' },
                                                               { enName: 'nem', cnName: '不为空' }]
                                  } else if (['radio', 'checkbox', 'combobox'].indexOf(item1.formtype) !== -1) {
                                    simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' },
                                                               { enName: 'ne', cnName: '不等于' },
                                                               { enName: 'em', cnName: '为空' },
                                                               { enName: 'nem', cnName: '不为空' }]
                                  } else if (['number', 'datetime'].indexOf(item1.formtype) !== -1) {
                                    simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' },
                                                               { enName: 'ne', cnName: '不等于' },
                                                               { enName: 'great', cnName: '大于' },
                                                               { enName: 'ge', cnName: '大于等于' },
                                                               { enName: 'lt', cnName: '小于' },
                                                               { enName: 'le', cnName: '小于等于' },
                                                               { enName: 'em', cnName: '为空' },
                                                               { enName: 'nem', cnName: '不为空' }]
                                  } else if (['cascader','address','treeselect'].indexOf(item1.formtype) !== -1) {
                                    simpleItem.conditionArr = [{ enName: 'contain', cnName: '包含' },
                                                               { enName: 'nc', cnName: '不包含' }]
                                  } else if (['associated'].indexOf(item1.formtype) !== -1) {
                                    simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' },
                                                               { enName: 'ne', cnName: '不等于' },
                                                               { enName: 'contain', cnName: '包含' },
                                                               { enName: 'nc', cnName: '不包含' },
                                                               { enName: 'bw', cnName: '开始于' },
                                                               { enName: 'ew', cnName: '结束于' },
                                                               { enName: 'em', cnName: '为空' },
                                                               { enName: 'nem', cnName: '不为空' }]
                                  }
                                }
                              })
                            }"
                          >
                            <a-select-option
                              v-for="(fieldItem, fieldIndex) in fieldArr"
                              :key="fieldIndex"
                              :value="fieldItem.alias"
                            >{{ fieldItem.name }}</a-select-option>
                          </a-select>
                        </a-col>
                        <a-col :span="12" style="border: 1px solid #E8E8E8; margin-bottom: 4px" v-if="simpleItem.fieldUser === 'field'">
                          <a-row
                            v-for="(includeItem, includeIndex) in simpleItem.condition"
                            :key="includeIndex"
                            type="flex"
                            align="middle"
                            style="margin: 10px 0"
                            :gutter="5"
                          >
                            <a-col :span="6" v-if="simpleItem.fieldUser ==='field'">
                              <a-select
                                size="small"
                                :dropdownMatchSelectWidth="false"
                                v-model="includeItem.include"
                                @change="(value) => { choiceInclude(value, includeItem) }"
                              >
                                <a-select-option
                                  option-filter-prop="children"
                                  v-for="(crItem, crIndex) in simpleItem.conditionArr"
                                  :key="crIndex"
                                  :value="crItem.enName">{{ crItem.cnName }}</a-select-option>
                              </a-select>
                            </a-col>
                            <a-col :span="14" v-if="simpleItem.fieldUser ==='field'" >
                              <template v-if="!includeItem.type">
                                <!-- 日期 -->
                                <a-date-picker
                                  size="small"
                                  style="width: 100%;"
                                  :defaultValue="includeItem.value && includeItem.value !== '0000-00-00 00:00:00' ? moment(includeItem.value, 'YYYY-MM-DD HH:mm:ss') : null"
                                  @change="(dates, dateStrings) => { includeItem.value = dateStrings }"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  v-if="simpleItem.formtype === 'datetime' && simpleItem.fieldtype === 'DATETIME'"
                                ></a-date-picker>
                                <a-date-picker
                                  size="small"
                                  style="width: 100%;"
                                  :defaultValue="includeItem.value && includeItem.value !== '0000-00-00' ? moment(includeItem.value, 'YYYY-MM-DD') : null"
                                  @change="(dates, dateStrings) => { includeItem.value = dateStrings }"
                                  format="YYYY-MM-DD"
                                  v-else-if="simpleItem.formtype === 'datetime' && simpleItem.fieldtype === 'DATE'"
                                ></a-date-picker>
                                <a-time-picker
                                  size="small"
                                  style="width: 100%;"
                                  :defaultValue="includeItem.value && includeItem.value !== '00:00:00' ? moment(includeItem.value, 'HH:mm:ss') : null"
                                  @change="(dates, dateStrings) => { includeItem.value = dateStrings }"
                                  format="HH:mm:ss"
                                  v-else-if="simpleItem.formtype === 'datetime' && simpleItem.fieldtype === 'TIME'"
                                ></a-time-picker>
                                <!-- 树选择 -->
                                <div v-else-if="simpleItem.formtype === 'treeselect'">
                                  <a-tree-select
                                    v-if="simpleItem.dataSource && simpleItem.dataSource === 'addressBook'"
                                    v-model="includeItem.value"
                                    style="width: 100%"
                                    size="small"
                                    placeholder="请选择"
                                    :treeDefaultExpandedKeys="includeItem.value ? includeItem.value.split(',') : []"
                                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                    :tree-data="simpleItem.option"
                                    :load-data="(data)=>{ return onLoadData(data, simpleItem, includeItem)}"
                                  >
                                  </a-tree-select>
                                  <a-tree-select
                                    v-else
                                    v-model="includeItem.value"
                                    style="width: 100%"
                                    size="small"
                                    placeholder="请选择"
                                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                    :tree-data="simpleItem.option"
                                    :load-data="(data)=>{ return onLoadData(data, simpleItem, includeItem)}"
                                    :treeDefaultExpandedKeys="includeItem.value ? includeItem.value.split(',') : []"
                                  >
                                  </a-tree-select>
                                </div>
                                <!-- 地址 -->
                                <div v-else-if="simpleItem.formtype === 'address'">
                                  <address-select size="small" :defaultValue="includeItem.value" fieldType="field" :series="simpleItem.form.show_series" @send="(display, val, alias, allValue) =>{ includeItem.value = val; includeItem.allValue = allValue }"/>
                                </div>
                                <a-input v-model="includeItem.value" v-else-if="!simpleItem.src" size="small"/>
                                <a-select
                                  size="small"
                                  v-else-if="simpleItem.src && simpleItem.formtype === 'combobox'"
                                  placeholder="请选择"
                                  :defaultValue="includeItem.value ? includeItem.value : undefined"
                                  @change="(value) => {includeItem.value = value}"
                                  changeOnSelect
                                >
                                  <a-select-option v-for="(fieldItem, fieldKey) in simpleItem.option" :key="fieldKey" :value="fieldItem.value">
                                    {{ fieldItem.label }}
                                  </a-select-option>
                                </a-select>
                                <!-- 级联选择 -->
                                <div v-else-if="simpleItem.formtype === 'cascader'">
                                  <tabs-select
                                    :defaultValue="includeItem.value"
                                    :valueKey="simpleItem.form ? simpleItem.form.src : ''"
                                    action="edit"
                                    size="small"
                                    :display="includeItem.display"
                                    :field="includeItem"
                                    :writeBack="simpleItem.form ? simpleItem.form.writeBack : []"
                                    fieldType="search"
                                    @send="(val, alias, display, status, allValue) =>{ includeItem.value = val; includeItem.display = display; includeItem.allValue = allValue }" />
                                </div>
                                <a-select
                                  v-else
                                  size="small"
                                  placeholder="请选择"
                                  :defaultValue="includeItem.value ? includeItem.value : []"
                                  @change="(value) => {
                                    includeItem.value = value
                                  }"
                                >
                                  <a-select-option v-for="(optItem, optIndex) in simpleItem.option" :key="optIndex" :value="optItem.value">{{ optItem.label }}</a-select-option>
                                </a-select>
                              </template>
                              <template v-else>
                                <a-input type="text" disabled size="small" />
                              </template>
                            </a-col>
                            <a-col :span="4" style="padding-top: 2px">
                              <a-icon :style="{ fontSize: '20px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.condition.splice(includeIndex + 1 , 0, {include: '',value: ''})" />
                              <a-icon :style="{ fontSize: '20px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="simpleItem.condition.length === 1 ? '' : simpleItem.condition.splice(includeIndex, 1)" />
                            </a-col>
                          </a-row>
                        </a-col>
                        <a-col :span="16" v-if="simpleItem.fieldUser === 'else'" style="margin-bottom: 4px"></a-col>
                        <a-col :span="3">
                          <a-select v-model="simpleItem.logic" style="width: 80px; margin-left: 5px;" size="small" v-if="simpleItem.condition.length > 1">
                            <a-select-option value="and">且(and)</a-select-option>
                            <a-select-option value="or">或(or)</a-select-option>
                          </a-select>
                        </a-col>
                        <a-col :span="2" style="padding-top: 2px">
                          <a-icon
                            :style="{ fontSize: '20px', color: '#52c41a'}"
                            type="plus-square"
                            theme="filled"
                            @click="item.conditions.splice(simpleIndex + 1, 0, {
                              fieldUser: 'field',
                              condition: [{
                                include: '',
                                value: ''
                              }],
                              logic: 'and'
                            })" />
                          <a-icon :style="{ fontSize: '20px', color: '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="item.conditions.splice(simpleIndex, 1)" />
                        </a-col>
                      </a-row>
                    </a-card>
                  </div>
                  <a-divider orientation="left" style="font-size: 14px">那么：图片上传模式</a-divider>
                  <a-form-item label="最大上传数量" :labelCol="labelCol" :wrapperCol="wrapperCol" style="width: 45%">
                    <a-input-number
                      :precision="0"
                      :max="10"
                      :min="1"
                      v-model="item.load"
                      @change="(value) => { item.load = value }"/>
                  </a-form-item>
                  <a-form-item label="显示上传按钮数量" :labelCol="labelCol" :wrapperCol="wrapperCol" style="width: 45%">
                    <a-input-number
                      :precision="0"
                      :min="1"
                      :max="parseInt(item.load)"
                      v-model="item.btn"
                      @change="(value) => { item.btn = value }"
                      @blur="onBlur(item, key)" />
                  </a-form-item>
                  <a-table :columns="columns" :dataSource="item.imgData" rowKey="id" size="small" :pagination="false">
                    <div slot="#" slot-scope="text, record, index">{{ index + 1 }}</div>
                    <div slot="required" slot-scope="text, record">
                      <a-switch v-model="record.required" />
                    </div>
                    <div slot="words" slot-scope="text, record">
                      <a-input type="text" v-model="record.words" placeholder="请输入提示文字" />
                    </div>
                  </a-table>
                </div>
                <div slot="extra">
                  <div style="display: flex;">
                    <a-icon :style="{ fontSize: '20px', color: '#52c41a'}" type="plus-square" theme="filled" @click.stop="handleAdd(key)"/>
                    <a-icon :style="{ fontSize: '20px', color: '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click.stop="handleDelete(key)"/>
                  </div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </a-form>
        </div>
      </div>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmitRule">保存</a-button>
        <a-button @click="visible = !visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { Collapse } from 'ant-design-vue'
import Vue from 'vue'
Vue.use(Collapse)
export default {
  components: {
    TabsSelect: () => import('./TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect')
  },
  data () {
    return {
      visible: false,
      loading: false,
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
      form: this.$form.createForm(this),
      formDrawer: this.$form.createForm(this),
      fieldArr: [],
      data: {},
      dynamicData: [],
      columns: [ {
        title: '#',
        dataIndex: '#',
        scopedSlots: { customRender: '#' }
      }, {
        title: '必填',
        dataIndex: 'required',
        scopedSlots: { customRender: 'required' }
      }, {
        title: '提示文字',
        dataIndex: 'words',
        scopedSlots: { customRender: 'words' }
      }]
    }
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    show () {
      this.visible = true
      console.log('setting', this.setting)
      const setting = JSON.parse(JSON.stringify(this.setting))
      if (setting.form && Object.prototype.toString.call(setting.form) === '[object Object]') {
        this.dynamicData = setting.form.appSetting || []
        this.dynamicData.forEach(item => {
          if (item.imgData.length > 0) {
            item.imgData.forEach(im => {
              im.required = !!im.required
            })
            return item
          }
        })
      }
      this.setRule()
    },
    addData () {
      this.dynamicData.push({
        conditions: [{
          fieldUser: 'field',
          condition: [{
            include: '',
            value: ''
          }],
          logic: 'and'
        }],
        logic: 'and',
        btn: 1,
        load: 1,
        imgData: [{
          id: 0,
          required: false,
          words: '选择图片'
        }]
      })
    },
    setRule () {
      this.loading = true
      this.axios({
        url: '/admin/field/init',
        params: {
          pageNo: 1,
          pageSize: 999,
          sortField: 'listorder',
          sortOrder: 'ascend',
          tableid: this.config.tableid }
      }).then(res => {
        this.loading = false
        this.fieldArr = res.result.data || []
        this.fieldArr = res.result.data.filter(item => {
          return ['text', 'textarea', 'radio', 'checkbox', 'combobox', 'number', 'datetime', 'cascader', 'associated', 'address', 'treeselect', 'tag'].indexOf(item.formtype) !== -1
        })
        // 遍历规则
        this.dynamicData.forEach((dataItem, dataIndex) => {
          dataItem.conditions.forEach((simpleItem, simpleIndex) => {
            if (!simpleItem.field) {
              simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' }]
            } else {
              this.fieldArr.forEach((fieldItem, fieldIndex) => {
                if (simpleItem.field === fieldItem.alias) {
                  fieldItem.settings = JSON.parse(fieldItem.setting)
                  simpleItem.src = fieldItem.settings.form.src ? fieldItem.settings.form.src : ''
                  simpleItem.formtype = fieldItem.formtype
                  simpleItem.fieldid = fieldItem.fieldid
                  if (simpleItem.src && fieldItem.formtype === 'treeselect') {
                    this.getTreeOption(simpleItem, fieldItem)
                  } else if (simpleItem.src) {
                    this.getOption(simpleItem)
                  } else if (fieldItem.formtype === 'treeselect') {
                    simpleItem.dataSource = fieldItem.settings.attribute.dataSource
                    this.getTreeOption(simpleItem, fieldItem)
                  } else {
                    simpleItem.option = []
                  }
                  // 根据字段，给出相应条件
                  if (['text', 'textarea'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'equal', cnName: '等于' },
                      { enName: 'ne', cnName: '不等于' },
                      { enName: 'contain', cnName: '包含' },
                      { enName: 'nc', cnName: '不包含' },
                      { enName: 'bw', cnName: '开始于' },
                      { enName: 'ew', cnName: '结束于' },
                      { enName: 'em', cnName: '为空' },
                      { enName: 'nem', cnName: '不为空' } ]
                  } else if (['radio', 'checkbox', 'combobox'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'equal', cnName: '等于' },
                      { enName: 'ne', cnName: '不等于' },
                      { enName: 'em', cnName: '为空' },
                      { enName: 'nem', cnName: '不为空' } ]
                  } else if (['number', 'datetime'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'equal', cnName: '等于' },
                      { enName: 'ne', cnName: '不等于' },
                      { enName: 'great', cnName: '大于' },
                      { enName: 'ge', cnName: '大于等于' },
                      { enName: 'lt', cnName: '小于' },
                      { enName: 'le', cnName: '小于等于' },
                      { enName: 'em', cnName: '为空' },
                      { enName: 'nem', cnName: '不为空' }]
                  } else if (['cascader', 'address', 'treeselect'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'contain', cnName: '包含' },
                      { enName: 'nc', cnName: '不包含' }]
                  }
                }
              })
            }
          })
        })
      })
    },
    // 选择关系
    choiceInclude (value, includeItem) {
      includeItem.value = ''
      if (value === 'em' || value === 'nem') {
        includeItem.type = 'empty'
      } else {
        includeItem.type = undefined
      }
    },
    getOption (item) {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: item.src }
      }).then(res => {
        this.$set(item, 'option', res.result)
      })
    },
    getTreeOption (simpleItem, item) {
      this.axios({
        url: 'admin/UserTable/getFieldForm',
        params: { fieldid: item.fieldid, value: simpleItem.value }
      }).then(res => {
        this.$set(simpleItem, 'option', res.result.data.option)
      })
    },
    onLoadData (treeNode, item, includeItem) {
      const { value } = treeNode.dataRef
      if (item.dataSource === 'addressBook') {
        return new Promise((resolve) => {
          this.axios({
            url: '/admin/address/getAddressChildren',
            params: { parent_number: value }
          }).then(res => {
            item.option.forEach(item => {
              if (item.value === value && !item.children) {
                const arr = []
                res.result.forEach(arrItem => {
                  const obj = { label: arrItem.name, value: arrItem.number }
                  arr.push(obj)
                })
                this.$set(item, 'children', arr)
              } else if (item.children) {
                item.children.forEach(childItem => {
                  if (childItem.value === value && !childItem.children) {
                    const arr = []
                    res.result.forEach(arrItem => {
                      const obj = { label: arrItem.name, value: arrItem.number }
                      arr.push(obj)
                    })
                    this.$set(childItem, 'children', arr)
                  } else if (childItem.children) {
                    childItem.children.forEach(childrenItem => {
                      if (childrenItem.value === value && !childrenItem.children) {
                        const arr = []
                        res.result.forEach(arrItem => {
                          const obj = { label: arrItem.name, value: arrItem.number, isLeaf: true }
                          arr.push(obj)
                        })
                        this.$set(childrenItem, 'children', arr)
                      }
                    })
                  }
                })
              }
            })
          })
          resolve()
        })
      } else {
        return new Promise((resolve) => {
          this.axios({
            url: 'admin/UserTable/getFieldForm',
            params: { fieldid: item.fieldid, value: includeItem.value }
          }).then(res => {
            this.$set(item, 'option', res.result.data.option)
          })
          resolve()
        })
      }
    },
    handleAdd (index) {
      const item = {
        conditions: [{
          fieldUser: 'field',
          condition: [{
            include: '',
            value: ''
          }],
          logic: 'and'
        }],
        logic: 'and',
        btn: 1,
        load: 1,
        imgData: [{
          id: 0,
          required: false,
          words: '选择图片'
        }]
      }
      this.dynamicData.splice(index, 0, item)
    },
    handleDelete (index) {
      const that = this
      this.$confirm({
        title: '您确认要删除该设置吗？',
        onOk () {
          that.dynamicData.splice(index, 1)
        }
      })
    },

    // 上传按钮数量
    onBlur (item, index) {
      const len = item.imgData.length
      const num = parseInt(item.btn)
      if (num - len > 0) {
        const arr = []
        for (let i = 0; i < num - len; i++) {
          arr.push({
            id: len + i,
            required: false,
            words: '选择图片'
          })
        }
        item.imgData = [...item.imgData, ...arr]
      } else {
        const n = len - num
        item.imgData.splice(-n, n)
      }
    },

    handleSubmitRule () {
      this.formDrawer.validateFields((err, values) => {
        if (!err) {
          this.dynamicData.forEach((item, index) => {
            for (const i in values) {
              if (i.includes(String(index))) {
                item.string = values[i]
              }
            }
            item.conditions.forEach(condItem => {
              const obj = {
                condition: condItem.condition,
                fieldUser: condItem.fieldUser,
                logic: condItem.logic,
                field: condItem.field
              }
              for (const i in condItem) {
                if (obj[i]) {
                  condItem[i] = obj[i]
                } else {
                  delete condItem[i]
                }
              }
            })
          })
          this.$emit('ok', this.dynamicData)
          this.visible = false
        }
      })
    }
  }
}
</script>
