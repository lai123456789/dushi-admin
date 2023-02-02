<template>
  <div>
    <a-form :form="form">
      <a-form-item label="流水规则" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-dropdown>
          <a-button><a-icon type="menu" />添加</a-button>
          <a-menu slot="overlay">
            <a-menu-item @click="addRule('date')"><a>日期时间</a></a-menu-item>
            <a-menu-item @click="addRule('string')"><a>固定字符</a></a-menu-item>
            <a-menu-item @click="addRule('form')"><a>动态生成</a></a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-form-item>
      <a-row>
        <a-col :span="5"></a-col>
        <a-col :span="19">
          <draggable
            v-model="serial"
            animation="200"
            @start="drag = true"
            @end="drag = false"
            handle=".handle"
          >
            <div
              v-for="(value, key) in serial"
              :key="key"
              class="list-item"
            >
              <a-row>
                <a-col :span="2" class="handle">
                  <a-icon type="drag"/>
                </a-col>
                <a-col :span="3" style="margin-right: 10px">
                  <a-input size="small" :read-only="true" :value="value.name" style="background-color: #F5F5F5; color: #62B1FB"/>
                </a-col>
                <a-col :span="6">
                  <a-row type="flex" align="middle" v-if="value.type ==='automatic'">
                    <a-col flex="60px">计数位数</a-col>
                    <a-col flex="auto"><a-input-number size="small" :min="2" :max="12" v-model="value.countNumber"/></a-col>
                  </a-row>
                  <a-select size="small" v-model="value.format" v-if="value.type ==='date'">
                    <a-select-option v-for="(item, index) in Dateformat" :value="item.type" :key="index">{{ item.value }}</a-select-option>
                  </a-select>
                  <a-form-item v-if="value.type ==='string'" class="string" >
                    <a-input size="small" v-decorator="['string' + '_' + key, { initialValue: value.string, rules: [{ required: true, message: '请输入动态生成内容' },{ validator: checkRequired }]}]"/>
                  </a-form-item>
                  <a-input size="small" v-if="value.type ==='form'" :read-only="true" value="动态生成" style="background-color: #F5F5F5" />
                </a-col>
                <a-col :span="6" class="text" v-if="value.type ==='automatic'">
                  <a-row type="flex" align="middle" >
                    <a-col flex="60px">计数方式</a-col>
                    <a-col flex="auto">
                      <a-select v-model="value.countWay" size="small">
                        <a-select-option v-for="(item, index) in resetPeriod" :key="index" :value="item.value">{{ item.type }}</a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-col>
                <a-col :span="1" style="padding: 2px 0 0 15px" v-if="value.type ==='form'">
                  <a-icon :style="{ fontSize: '16px' }" type="setting" @click="setRule(value, key)"/>
                </a-col>
                <a-col :span="1" style="padding: 2px 0 0 15px">
                  <a-popconfirm
                    title="您确定要删除该记录吗？"
                    v-if="value.type !=='automatic'"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm="serial.splice(key, 1)"
                  >
                    <a-icon :style="{ fontSize: '18px', color: '#ff4d4f', cursor: 'pointer' }" type="minus-square" theme="filled" />
                  </a-popconfirm>
                </a-col>
              </a-row>
            </div>
          </draggable>
        </a-col>
      </a-row>
      <a-drawer
        title="动态生成设置"
        :width="800"
        :visible="visible"
        @close="visible = !visible"
      >
        <a-spin :spinning="loading">
          <div>
            <a-button block type="dashed" @click="addData"><a-icon type="plus" />新增动态生成设置</a-button>
            <div style="margin-top: 10px">
              <a-form :form="formDrawer">
                <a-collapse defaultActiveKey="0" v-model="activeKey" @change="activeKey=Array.from(new Set(activeKey))">
                  <a-collapse-panel v-for="(item, key) in dynamicData" :key="String(key + 1)" :header="'动态生成设置-' + (key + 1)">
                    <a-divider orientation="left" style="font-size: 14px">当：满足以下条件</a-divider>
                    <div>
                      <div>
                        <span style="margin-left: 15px;"> 以下条件组合方式 </span>
                        <a-select v-model="item.logic" style="width: 80px; margin-left: 15px;" size="small">
                          <a-select-option value="and">且(and)</a-select-option>
                          <a-select-option value="or">或(or)</a-select-option>
                        </a-select>
                        <a-card size="small" style="margin-top: 10px" v-if="item.conditions && item.conditions.length > 0">
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
                                      if (['text', 'textarea','associated'].indexOf(item1.formtype) !== -1) {
                                        simpleItem.conditionArr = [{ enName: 'eq', cnName: '等于' },
                                                                   { enName: 'ne', cnName: '不等于' },
                                                                   { enName: 'cn', cnName: '包含' },
                                                                   { enName: 'nc', cnName: '不包含' },
                                                                   { enName: 'bw', cnName: '开始于' },
                                                                   { enName: 'ew', cnName: '结束于' },
                                                                   { enName: 'em', cnName: '为空' },
                                                                   { enName: 'nem', cnName: '不为空' }]
                                      } else if (['radio', 'checkbox', 'combobox'].indexOf(item1.formtype) !== -1) {
                                        simpleItem.conditionArr = [{ enName: 'eq', cnName: '等于' },
                                                                   { enName: 'ne', cnName: '不等于' },
                                                                   { enName: 'em', cnName: '为空' },
                                                                   { enName: 'nem', cnName: '不为空' }]
                                      } else if (['number', 'datetime'].indexOf(item1.formtype) !== -1) {
                                        simpleItem.conditionArr = [{ enName: 'eq', cnName: '等于' },
                                                                   { enName: 'ne', cnName: '不等于' },
                                                                   { enName: 'gt', cnName: '大于' },
                                                                   { enName: 'ge', cnName: '大于等于' },
                                                                   { enName: 'lt', cnName: '小于' },
                                                                   { enName: 'le', cnName: '小于等于' },
                                                                   { enName: 'em', cnName: '为空' },
                                                                   { enName: 'nem', cnName: '不为空' }]
                                      } else if (['cascader','address','treeselect'].indexOf(item1.formtype) !== -1) {
                                        simpleItem.conditionArr = [{ enName: 'cn', cnName: '包含' },
                                                                   { enName: 'nc', cnName: '不包含' }]
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
                                        :valueKey="simpleItem.form.src || ''"
                                        action="edit"
                                        size="small"
                                        :display="includeItem.display"
                                        :field="includeItem"
                                        :writeBack="simpleItem.form.writeBack"
                                        fieldType="search"
                                        @send="(val, alias, display, status, allValue) =>{ includeItem.value = val; includeItem.display = display; includeItem.allValue = allValue }" />
                                    </div>
                                    <a-select
                                      v-else-if="simpleItem.option && simpleItem.option.length > 0"
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
                              <a-select v-model="simpleItem.logic" style="width: 80px; margin-left: 5px;" size="small">
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
                              <a-icon :style="{ fontSize: '20px', color: item.conditions.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="item.conditions.length === 1 ? '' : item.conditions.splice(simpleIndex, 1)" />
                            </a-col>
                          </a-row>
                        </a-card>
                      </div>
                      <a-divider orientation="left" style="font-size: 14px">那么：动态生成内容为</a-divider>
                      <a-form-item label="动态生成内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
                        <a-input v-decorator="['content' + '_' + key, {initialValue: item.string, rules: [{ required: true, message: '请输入动态生成内容'},{ validator: checkRequired }]}]"/>
                      </a-form-item>
                    </div>
                    <div slot="extra">
                      <a-icon
                        style="margin-right: 10px"
                        @click.stop="()=>{dynamicData.splice(key+1,0,{
                                            conditions: [{
                                              fieldUser: 'field',
                                              condition: [{
                                                include: '',
                                                value: ''
                                              }],
                                              logic: 'and'
                                            }],
                                            logic: 'and'
                                          });
                                          activeKey.push(String(key+2))}"
                        type="plus" />
                      <a-icon type="delete" @click.stop="handleDelete"/>
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
    </a-form>
  </div>
</template>
<script>
import { Collapse } from 'ant-design-vue'
import Vue from 'vue'
Vue.use(Collapse)
export default {
  components: {
    draggable: () => import('vuedraggable'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect')
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
  watch: {
    setting: {
      handler (newVal) {
        this.data = JSON.parse(JSON.stringify(newVal))
        this.serial = newVal.form.serialRule || [{
          name: '自动计数',
          type: 'automatic',
          countNumber: '5',
          value: '',
          countWay: ''
        }]
      },
      immediate: true
    }
  },
  data () {
    return {
      visible: false,
      loading: false,
      activeKey: ['1'],
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      formDrawer: this.$form.createForm(this),
      dateShow: true,
      fieldArr: [],
      data: {},
      ruleKey: '',
      dynamicData: [],
      serial: [{
        name: '自动计数',
        type: 'automatic',
        countNumber: '5',
        value: '',
        countWay: ''
      }],
      resetPeriod: [{
        type: '一直累加',
        value: ''
      }, {
        type: '每日重置',
        value: 'day'
      }, {
        type: '每周重置',
        value: 'week'
      }, {
        type: '每月重置',
        value: 'month'
      }, {
        type: '每年重置',
        value: 'year'
      }],
      Dateformat: [{
        type: 'year4',
        value: '年(全4位)'
      }, {
        type: 'year2',
        value: '年(后2位)'
      }, {
        type: 'mounth',
        value: '月(2位)'
      }, {
        type: 'day',
        value: '日(2位)'
      }, {
        type: 'hour',
        value: '时(2位)'
      }, {
        type: 'minute',
        value: '分(2位)'
      }, {
        type: 'seconds',
        value: '秒(2位)'
      }]
    }
  },
  methods: {
    addRule (type) {
      if (type === 'date') {
        this.serial.push({
          name: '日期时间',
          type: 'date',
          format: 'year4'
        })
      } else if (type === 'string') {
        this.serial.push({
          name: '固定字符',
          type: 'string'
        })
      } else if (type === 'form') {
        this.serial.push({
          name: '动态生成',
          type: 'form'
        })
      }
    },
    setRule (data, index) {
      this.ruleKey = index
      this.dynamicData = data.generateRules || [{
        conditions: [{
          fieldUser: 'field',
          condition: [{
            include: '',
            value: ''
          }],
          logic: 'and'
        }],
        logic: 'and'
      }]
      this.axios({
        url: '/admin/field/init',
        params: {
          pageNo: 1,
          pageSize: 999,
          sortField: 'listorder',
          sortOrder: 'ascend',
          tableid: this.config.tableid }
      }).then(res => {
        this.fieldArr = res.result.data.filter(item => {
          return ['text', 'radio', 'checkbox', 'combobox', 'cascader'].indexOf(item.formtype) !== -1
        })
        // 遍历规则
        this.dynamicData.forEach((dataItem, dataIndex) => {
          dataItem.conditions.forEach((simpleItem, simpleIndex) => {
            if (!simpleItem.field) {
              simpleItem.conditionArr = [{ enName: 'eq', cnName: '等于' }]
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
                  if (['text', 'textarea', 'associated'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'eq', cnName: '等于' },
                      { enName: 'ne', cnName: '不等于' },
                      { enName: 'cn', cnName: '包含' },
                      { enName: 'nc', cnName: '不包含' },
                      { enName: 'bw', cnName: '开始于' },
                      { enName: 'ew', cnName: '结束于' },
                      { enName: 'em', cnName: '为空' },
                      { enName: 'nem', cnName: '不为空' } ]
                  } else if (['radio', 'checkbox', 'combobox'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'eq', cnName: '等于' },
                      { enName: 'ne', cnName: '不等于' },
                      { enName: 'em', cnName: '为空' },
                      { enName: 'nem', cnName: '不为空' } ]
                  } else if (['number', 'datetime'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'eq', cnName: '等于' },
                      { enName: 'ne', cnName: '不等于' },
                      { enName: 'gt', cnName: '大于' },
                      { enName: 'ge', cnName: '大于等于' },
                      { enName: 'lt', cnName: '小于' },
                      { enName: 'le', cnName: '小于等于' },
                      { enName: 'em', cnName: '为空' },
                      { enName: 'nem', cnName: '不为空' }]
                  } else if (['cascader', 'address', 'treeselect'].indexOf(fieldItem.formtype) !== -1) {
                    simpleItem.conditionArr = [
                      { enName: 'cn', cnName: '包含' },
                      { enName: 'nc', cnName: '不包含' }]
                  }
                }
              })
            }
          })
        })
      })
      this.visible = true
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
        logic: 'and'
      })
      this.activeKey.push(String(this.dynamicData.length))
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
    checkRequired (rule, value, callback) {
      const string = '请输入英文字母（大小写）、数字、符号（仅限：_、-）'
      if (!/^[a-zA-Z-_\d]+/.test(value)) {
        callback(string)
      } else {
        callback()
      }
    },
    handleDelete (index) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.dynamicData.splice(index, 1)
        }
      })
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
          this.serial.forEach((serItem, serIndexs) => {
            if (serIndexs === this.ruleKey) {
              serItem.generateRules = this.dynamicData
            }
          })
          this.visible = false
        }
      })
    },
    handleSubmit () {
      let val = {}
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          for (const i in values) {
            const arr = i.split('_')
            this.serial[Number(arr[1])].string = values[i]
          }
          val = this.serial
        }
      })
      return val
    }
  }
}
</script>
<style lang="less" scoped>
.list-item {
  padding: 8px;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, .125);
}
.list-item[draggable=true] {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-item .handle{
  margin-right: 5px;
  padding: 0 25px 0 10px;
  cursor: move;
}
.list-item .text{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.list-item:first-child {
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}
.list-item:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 2px;
}
.string /deep/ .ant-form-item-control{
  line-height: 23px;
}
</style>
