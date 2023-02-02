<template>
  <div>
    <!-- 搜索区域 -->
    <a-card class="table-search" v-show="cardTemplate.length === 0 && loading && (flowStatus === 'finish' || template.length > 0)">
      <a-form :form="formSearch" :class="advancedSearch ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-dropdown-button htmlType="submit" @click="handleSearch({tag: true})" class="dropdown" >
              <span>搜索</span>
              <a-menu slot="overlay">
                <a-menu-item :key="2" @click="showSearch">
                  高级搜索
                </a-menu-item>
                <template v-for="(item, index) in condiList">
                  <a-menu-item :key="index + 3" @click="handleHighSearchMenu(item)">
                    {{ item.name }}
                  </a-menu-item>
                </template>
              </a-menu>
            </a-dropdown-button>
            <a-button @click="() => {queryParam = {}, sorter.end_date = this.moment().startOf('month').format('YYYY-MM'), endDate = moment().startOf('month'), searchString = {}, clearAddress(), formSearch.resetFields() ;handleSearch({tag: false})}">重置</a-button>
            <a v-show="!advancedSearch" @click="changeAdvancedSearch">展开<a-icon type="down" style="fontSize: 12px;" /></a>
            <a v-show="advancedSearch" @click="changeAdvancedSearch">收起<a-icon type="up" style="fontSize: 12px;" /></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advancedSearch" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col :span="6" v-if="flowStatus === 'finish' && timeRangeDisplay !== '0'">
            <a-form-item label="数据时间范围">
              <a-month-picker
                :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                format="YYYY-MM"
                @change="getEndDateChange"
                :allowClear="false"
                v-model="endDate"
                style="width: 100%;"
              ></a-month-picker>
            </a-form-item>
          </a-col>
          <!-- 下面是动态生成区域，要根据不同的组件进行相应展示 -->
          <a-col
            v-for="(item, index) in template"
            :key="index"
            v-show="item.fieldrule !== 'hidden'"
            v-bind="{ span: item.column }"
          >
            <a-form-item :label="item.change_title ? item.change_title : item.name" :validate-status="item.formtype === 'number' ? 'success' : ''" v-if="item.field" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <!-- 单行文本 多行文本 -->
              <a-input
                v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                :disabled="item.fieldrule !== 'allow'"
                :placeholder="item.searchPattern === 'fuzzy' ? '模糊搜索':'精确搜索'"
                v-if="item.formtype === 'text' || item.formtype === 'textarea' || item.formtype === 'associated' || item.formtype === 'serialnumber'"
              />
              <!-- 日期 -->
              <a-range-picker
                v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                :disabled="item.fieldrule !== 'allow'"
                :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')] }"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                v-else-if="item.formtype === 'datetime' && item.field.fieldtype === 'DATETIME'"
              ></a-range-picker>
              <a-range-picker
                v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                :disabled="item.fieldrule !== 'allow'"
                style="width: 100%;"
                format="YYYY-MM-DD"
                v-else-if="item.formtype === 'datetime' && item.field.fieldtype === 'DATE'"
              ></a-range-picker>
              <!-- 地址组件 -->
              <div v-else-if="item.formtype === 'address'">
                <a-input
                  v-show="false"
                  v-decorator="[item.field.alias, {
                    rules: [{ required: item.field.setting.attribute.required === 'true', message: item.field.name + '不能为空'}]
                  }]" />
                <address-select :ref="item.field.alias" :series="item.field.setting.form.show_series" :field="item.field" :alias="item.field.alias" @send="getAddress"/>
              </div>
              <div v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'TIME'" style="display: flex; align-items: center;">
                <a-time-picker
                  showTime
                  @change="(time, timeString) => {
                    item.timeStart = timeString
                    timeObj[item.field.alias] = [item.timeStart, item.timeEnd]
                  }"
                  :disabled="item.fieldrule !== 'allow'"
                  format="HH:mm:ss"
                  style="flex: 1;"
                ></a-time-picker>
                ~
                <a-time-picker
                  showTime
                  @change="(time, timeString) => {
                    item.timeEnd = timeString
                    timeObj[item.field.alias] = [item.timeStart, item.timeEnd]
                  }"
                  :disabled="item.fieldrule !== 'allow'"
                  format="HH:mm:ss"
                  style="flex: 1;"
                ></a-time-picker>
              </div>
              <!-- 下拉框、单选框、复选框 -->
              <a-select
                v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                :disabled="item.fieldrule !== 'allow'"
                mode="multiple"
                v-else-if="item.field.formtype === 'combobox'"
                placeholder="请选择"
                :allowClear="true"
                show-search
                option-filter-prop="children"
              >
                <a-select-option v-for="(myitem,myindex) in item.field.option" :key="myindex" :value="myitem.value">{{ myitem.label }}</a-select-option>
              </a-select>
              <!-- 数字 -->
              <a-input-group compact v-else-if="item.formtype === 'number'" style="margin-bottom: 0px">
                <a-input-number
                  style="width: calc(50% - 15px);"
                  v-decorator="[item.field.alias + '.left']"
                  :disabled="item.fieldrule !== 'allow'"/>
                <a-input placeholder="~" disabled style="width: 32px; pointer-events: none; backgroundColor: #fff;"/>
                <a-input-number
                  v-decorator="[item.field.alias + '.right']"
                  style="width: calc(50% - 15px);"
                  :disabled="item.fieldrule !== 'allow'"/>
              </a-input-group>
              <!-- 级联选择 -->
              <div v-else-if="item.formtype === 'cascader'">
                <a-input v-show="false" v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"/>
                <tabs-select
                  :field="item.field"
                  :valueKey="item.field.setting.form.src || ''"
                  :defaultValue="item.field.value.value ? item.field.value.value : item.field.setting.form.defaultValue"
                  :alias="item.field.alias"
                  searchType="searchType"
                  :writeBack="item.field.setting.form.writeBack"
                  :fieldrule="item.fieldrule"
                  :ref="item.field.alias"
                  @send="getcascaderValue"
                />
              </div>
              <!-- 标签 -->
              <a-cascader
                v-else-if="item.field.formtype === 'tag'"
                v-decorator="[item.field.alias]"
                style="width: 100%"
                :options="tagOption"
                placeholder="请选择"
              />
              <!-- 开关 -->
              <a-select
                v-else-if="item.field.formtype === 'switch'"
                v-decorator="[item.field.alias]"
                placeholder="请选择"
                :allowClear="true" >
                <a-select-option :value="item.field.setting.form.word.value.split('/')[0]">{{ item.field.setting.form.word.value.split('/')[0] }}</a-select-option>
                <a-select-option :value="item.field.setting.form.word.value.split('/')[1]">{{ item.field.setting.form.word.value.split('/')[1] }}</a-select-option>
              </a-select>
              <!-- 树选择 -->
              <div v-else-if="item.field.formtype === 'treeselect'">
                <a-tree-select
                  v-if="item.field.setting.attribute.dataSource === 'addressBook'"
                  v-decorator="[item.field.alias]"
                  :allowClear="true"
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  :tree-data="item.field.option"
                  :load-data="(data)=>{ return onLoadData(data, item) }"
                  placeholder="请选择"
                >
                </a-tree-select>
                <a-tree-select
                  v-else
                  v-decorator="[item.field.alias]"
                  :allowClear="true"
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  :tree-data="item.field.option"
                  placeholder="请选择"
                >
                </a-tree-select>
              </div>
              <!--组织结构  -->
              <div v-else-if="item.field.formtype === 'organization'">
                <a-row type="flex" align="middle">
                  <a-col flex="0 0 calc(100% - 27px)">
                    <a-select
                      v-decorator="[item.field.alias, {
                        rules: [{ required: item.fieldrule !== 'hidden' && item.field.setting.attribute.required === 'true', message: item.name + '不能为空'}]
                      }]"
                      show-search
                      allowClear
                      :default-active-first-option="false"
                      :not-found-content="null"
                      option-filter-prop="children"
                      :show-arrow="false"
                      :filter-option="false"
                      style="width: 100%;"
                      @change="(val) => { item.field.value = val }"
                      mode="multiple"
                      @search="(val) => { organizationSearch(item, index, val) }"
                      @blur="() => { item.field.selectList = [] }"
                      v-if="item.field.setting.form.option_type === 'user'"
                    >
                      <a-select-option v-for="(item1, index1) in item.field.selectList" :key="index1" :value="item1.username">
                        {{ item1.text }}
                      </a-select-option>
                    </a-select>
                    <a-select
                      v-decorator="[item.field.alias, {
                        rules: [{ required: item.fieldrule !== 'hidden' && item.field.setting.attribute.required === 'true', message: item.name + '不能为空'}]
                      }]"
                      show-search
                      allowClear
                      option-filter-prop="children"
                      :show-arrow="false"
                      style="width: 100%;"
                      @change="(val) => { item.field.value = val }"
                      mode="multiple"
                      v-else
                    >
                      <template v-if="item.field.setting.form.option_type === 'department'" >
                        <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.departmentid">
                          {{ item1.name }}
                        </a-select-option>
                      </template>
                      <template v-else >
                        <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.roleid">
                          {{ item1.rolename }}
                        </a-select-option>
                      </template>
                    </a-select>
                  </a-col>
                  <a-col flex="27px">
                    <a-button
                      icon="user"
                      v-if="item.field.setting.form.option_type === 'user'"
                      style="margin-left: -1px; padding-bottom: 2px;"
                      @click="handleSelectUserForm(item, index)">
                    </a-button>
                    <a-button
                      icon="apartment"
                      v-else-if="item.field.setting.form.option_type === 'department'"
                      style="margin-left: -1px; padding-bottom: 2px;"
                      @click="handleSelect(item, index)">
                    </a-button>
                    <a-button
                      icon="user"
                      v-else
                      style="margin-left: -1px; padding-bottom: 2px;"
                      @click="handleSelect(item, index)">
                    </a-button>
                  </a-col>
                </a-row>
              </div>
            </a-form-item>
            <a-divider :orientation="item.dividerDirection" v-else-if="item.type === 'divider'">{{ item.dividerText }}</a-divider>
            <a-input v-else-if="item.type === 'place'" style="opacity: 0"></a-input>
            <component v-else-if="item.type === 'component'" :is="item.component" />
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card v-show="cardTemplate.length === 0 && loading">
      <!-- 操作按钮 -->
      <div class="table-operator">
        <!-- 下面是动态生成区域 -->
        <a-row type="flex" align="middle">
          <a-col :span="23">
            <component v-for="(item, index) in tbar" :key="index" :is="item.component" v-show="flowStatus === 'finish' && ['sys_add','sys_bulkdelete','sys_bulkedit','bar_import'].includes(item.bar_alias) ? false : true"/>
            <a-button :disabled="selectedRowKeys.length === 0" type="primary" @click="() => { $emit('ok', selectedRows, 'line') }" v-if="params.type === 'table_subform_list' && multiSelect">确认选择</a-button>
          </a-col>
          <a-col :span="1" style="text-align: right">
            <a-button icon="setting" style="border: none; font-size: 18px" @click="customShow" v-if="customColumns == '1' ? true : false"></a-button>
          </a-col>
        </a-row>
      </div>
      <!-- 数据列表 -->
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :rowSelection="rowSelection"
        :pageSize="pagesize"
        :pageMode="pageMode"
        :showSizeChanger="false"
        :autoLoad="false"
        :scroll="scroll"
      >
      </s-table>
    </a-card>
    <div v-if="cardTemplate.length !== 0 && loading">
      <user-table-card
        ref="userTableCard"
        :cardTemplate="cardTemplate"
        :sorter="sorter"
        :tplviewid="tplviewid"
        :params="params"
        :dataSource="dataSource"
        :viewThis="viewThis"
        :tbar="tbar"
        :actionArray="actionArray"
        :pagesize="pagesize"
      />
    </div>
    <!-- 数据表单 -->
    <user-table-form ref="userTableForm" @ok="refresh('noRefresh')" :key="indexKey"></user-table-form>
    <!-- 用户自定义列 -->
    <user-table-column-custom ref="userTableColumnCustom" @ok="getData"></user-table-column-custom>
    <!-- 批量编辑 -->
    <user-table-bulk-edit ref="userTableBulkEdit" @ok="refresh('noRefresh')"></user-table-bulk-edit>
    <!-- 导入表单 -->
    <user-table-import ref="userTableImport" @ok="refresh"></user-table-import>
    <!-- 导出表单 -->
    <user-table-export ref="userTableExport" @ok="refresh" :key="exportKey"></user-table-export>
    <user-table-components ref="userTableComponents" />
    <!-- 高级搜索 -->
    <user-table-search ref="userTableSearch" :key="searchKey" @ok="handleHighSearch" @change="handleChange" @save="saveSearch"/>
    <select-user-form ref="selectUserForm" @ok="handleSelectUserData" :key="userKey" />
    <select-department ref="selectDepartment" @ok="handleSelectUserData" :key="departmentKey" />
    <workflow-handle-form ref="workflowHandleForm" @ok="refresh('noRefresh')"/>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Rate, TreeSelect } from 'ant-design-vue'
import debounce from 'lodash/debounce'
Vue.use(Rate)
Vue.use(TreeSelect)
export default {
  components: {
    UserTableBulkEdit: () => import('./UserTableBulkEdit'),
    UserTableImport: () => import('./UserTableImport'),
    UserTableExport: () => import('./UserTableExport'),
    UserTableComponents: () => import('./UserTableComponents'),
    SelectUserForm: () => import('./SelectUserForm'),
    SelectDepartment: () => import('./SelectDepartment'),
    UserTableSearch: () => import('./UserTableSearch'),
    UserTableCard: () => import('./UserTableCard'),
    UserTableColumnCustom: () => import('./UserTableColumnCustom'),
    AddressSelect: () => import('../Field/AddressSelect'),
    TabsSelect: () => import('../Field/TabsSelect'),
    UserTableForm: () => import('./UserTableForm.vue'),
    WorkflowHandleForm: () => import('../WorkflowHandleForm')
  },
  props: {
    params: {
      type: Object,
      default () {
        return {
          tplviewid: ''
        }
      },
      required: true
    },
    viewThis: {
      type: Object,
      default () {
        return {}
      }
    },
    filtersData: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    // userTableFormd的vue实例对象
    formThis: {
      type: Object,
      default () { }
    },
    screenData: {
      type: Object,
      default: () => {}
    },
    flowStatus: {
      type: String,
      default: () => {}
    }
  },
  watch: {
    params: {
      handler (newValue) {
        if (newValue.relation && Object.keys(newValue.relation).length !== 0) {
          // 查看不同的数据时刷新子表
          this.refresh()
        }
      },
      deep: true
    }
  },
  // 祖先级组件数据传递，以及被子孙级组件动态修改
  provide () {
    this.theme = Vue.observable({
      data: this
    })
    return {
      theme: this.theme
    }
  },
  data () {
    this.handleSearch = debounce(this.handleSearch, 500)
    return {
      ENV: process.env,
      visible: false,
      loading: false,
      imgSrc: '', // 点击查看大图
      indexKey: 0, // 用于表单刷新数据
      exportKey: 2,
      searchKey: 4,
      userKey: 'user',
      departmentKey: 'department',
      SHOW_PARENT: TreeSelect.SHOW_PARENT,
      SHOW_CHILD: TreeSelect.SHOW_CHILD,
      role: '',
      username: '',
      department: '',
      endDate: this.moment().startOf('month'),
      tableid: '',
      tplviewid: '',
      // 搜索参数
      queryParam: { },
      labelCol: { style: 'width: 104px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 104px); display: inline-block' },
      customColumnsData: {},
      timeStart: null,
      timeEnd: null,
      timeObj: {},
      // 高级搜索展开/折叠标识
      advancedSearch: true,
      // 搜索表单
      formSearch: this.$form.createForm(this),
      // 搜索表单
      template: [],
      // 表头
      columns: [],
      columnsExport: [],
      actionArray: [],
      // 工具栏菜单
      tbar: [],
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: null,
      multiSelect: false, // table是否多选
      colLayout: {},
      scroll: { x: 0 },
      sorter: {},
      dataSource: '',
      comsShowFlag: false,
      actions: new Map([[
        '', function (value, inputValue) {
          return true
        } ], [
        'contain', function (value, inputValue) {
          if (inputValue.indexOf(value) === -1) {
            return false
          } else {
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
        'nc', function (value, inputValue) {
          if (inputValue.indexOf(value) === -1) {
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
      customColumns: 0,
      lockLeft: 0,
      lockRight: 0,
      pagesize: 20,
      pageMode: 'default', // 分页器模式
      totalCount: 0,
      sendData: false,
      where: '',
      tagOption: [],
      data: [], // 视图规则
      customSearch: [], // 高级搜索数据
      condiList: [],
      searchFlag: true,
      timeRangeDisplay: '',
      searchData: {},
      searchString: {}, // 开窗搜索
      cardTemplate: [] // 卡片数据窗口模板数据
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  created () {
    this.role = this.userInfo.roleid
    this.username = this.userInfo.username
    this.department = this.userInfo.departmentid
    this.changeAdvancedSearch()
    this.axios({
      url: '/admin/UserTable/init',
      data: this.params
    }).then(res => {
      this.loading = true
      this.tableid = res.result.tableid
      this.sorter = res.result.sorter
      this.advancedSearch = res.result.advanced_search === '1'
      this.columns = res.result.columns.filter(item => item.display === 'v')
      this.columnsExport = res.result.columns
      this.actionArray = this.columns.filter(item => item.dataIndex === 'action')
      this.pagesize = Number(res.result.pagesize)
      this.pageMode = res.result.pageMode
      this.cardTemplate = res.result.cardTemplate
      this.lockLeft = res.result.lock_left
      this.lockRight = res.result.lock_right
      this.timeRangeDisplay = res.result.timeRangeDisplay
      for (const i in this.columns) {
        if (this.columns[i].custom_title) {
          this.columns[i].title = this.columns[i].custom_title
        }
        if (['textarea', 'image', 'file', 'editor'].includes(this.columns[i].type)) {
          this.columns[i].sorter = false
        } else {
          if ((this.columns[i].sorter === '1' || !this.columns[i].sorter) && this.columns[i].dataIndex !== 'action') {
            this.columns[i].sorter = true
          } else {
            this.columns[i].sorter = false
          }
        }
      }
      this.template = res.result.search.template
      if (this.template.some(item => item.field && item.field.formtype === 'tag') && !this.tagOption.length) {
        this.axios({
          url: 'admin/Tag/tagOption'
        }).then(res => {
          this.tagOption = res.result.option.map(item => {
            const obj = item
            if (!item.children.length) {
              item.disabled = true
            }
            return obj
          })
        })
      }
      this.customSearch = res.result.customSearch
      this.customColumns = res.result.customColumns
      const columnsList = []
      if (res.result.customColumnsData.id) {
        this.sendData = true
        this.customColumnsData = JSON.parse(res.result.customColumnsData.setting).data
        if (this.customColumnsData) {
          for (const i in res.result.columns) {
            for (const j in this.customColumnsData) {
              if (this.customColumnsData[j].dataIndex === res.result.columns[i].dataIndex) {
                this.customColumnsData[j] = res.result.columns[i]
              }
            }
          }
          this.customColumnsData.forEach(item => {
            if (res.result.columns.indexOf(item) !== -1) {
              columnsList.push(item)
            }
          })
          this.customColumnsData = columnsList
          this.customColumnsData = this.customColumnsData.filter(item => item.display === 'v')
        }
        this.lockLeft = JSON.parse(res.result.customColumnsData.setting).lockLeft
        this.lockRight = JSON.parse(res.result.customColumnsData.setting).lockRight
        this.pagesize = Number(JSON.parse(res.result.customColumnsData.setting).pageSize)
      }
      this.dataSource = res.result.data_source
      this.condiList = this.customSearch.length > 0 ? this.customSearch.map(item => {
        const obj = JSON.parse(item.setting)
        obj.id = item.id
        return obj
      }) : []
      this.tplviewid = res.result.tplviewid
      this.data = res.result.formview
      this.template.forEach(item => {
        if (item.type === 'component') {
          item.component = {
            template: `<span>${item.attribute}</span>`,
            data: () => {
              return {
                parent: this
              }
            }
          }
        }
      })
      this.tbar = res.result.tbar
      this.tbar.forEach(item => {
        item.component = {
          template: `<span>${item.attribute}</span>`,
          data: () => {
            return {
              parent: this
            }
          }
        }
      })
      // 表格是否出现行选择功能
      this.multiSelect = res.result.multiSelect
      this.rowSelection = res.result.multiSelect ? {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        }
      } : null
      const that = this
      if (this.customColumnsData.length > 0) {
        this.columns = this.customColumnsData
      }
      // 循环处理表格的列
      if ((this.params.type === 'table_subform_list' || this.params.type === 'associated') && !this.columns.some(item => item.dataIndex === 'action')) {
        this.columns.unshift({
          align: 'center',
          dataIndex: 'action',
          rowAction: [],
          type: 'action',
          width: 120
        })
      }
      for (let i = 0; i < this.lockLeft; i++) {
        this.columns[i]['fixed'] = 'left'
        this.scroll.x -= Number(this.columns[i].width)
      }
      let keyLength = this.columns.length - 1
      for (let i = 0; i < this.lockRight; i++) {
        this.columns[keyLength]['fixed'] = 'right'
        this.scroll.x -= Number(this.columns[keyLength].width)
        keyLength--
      }
      this.columns.map((item) => {
        let style = {}
        if (item.style) {
          style = {
            'background-color': item.style.bgcolor,
            'color': item.style.color,
            'font-size': item.style.fontsize
          }
        }
        if (item.attribute && !item.attribute.includes('<')) {
          item.attribute = JSON.parse(item.attribute)
        }
        item.ellipsis = true
        item.width = Number(item.width)
        if (item.width === 0) {
          delete item.width
          this.scroll.x = null
        } else {
          if (this.scroll.x !== null) {
            this.scroll.x += item.width
          }
        }
        if (item.dataIndex === 'action') {
          const obj = {}
          if (this.params.type === 'table_subform_list' && this.params.selectAction) {
            obj.attribute = `<a href="javascript:;" @click="() => { const val = [record]; parent.$emit('ok', val, 'line') }">选择</a>`
            item.rowAction.push(obj)
          } else if (this.params.type === 'associated') {
            obj.attribute = `<a href="javascript:;" @click="() => {  parent.axios({url: '/admin/UserTable/getTableRecord',params: { tableid: parent.tableid, id: record.id, flowStatus: parent.flowStatus }}).then(res => { parent.$emit('ok', res.result.data, 'associated', parent.screenData)})}">选择</a>`
            item.rowAction.push(obj)
          }
          if (this.flowStatus === 'finish') {
            item.rowAction = item.rowAction.filter(item => item.bar_alias !== 'sys_delete')
          }
        }
        item.customRender = (text, record, index) => {
          item.func = () => { }
          if (item.attribute) {
            // 获取属性key
            const key = record[item.attribute.key]
            style = item.attribute.value ? item.attribute.value[key] : ''
            if (item.attribute.event) {
              const str = 'return ' + item.attribute.event
              // eslint-disable-next-line no-new-func
              const func = new Function(str)
              item.func = func()
            }
          }
          if (item.attribute && item.attribute.includes('<')) {
            let data = ''
            const MyComponent = Vue.component('my-component', {
              data: function () {
                return { text: text, record: record }
              },
              template: item.attribute
            })
            data = (<MyComponent></MyComponent>)
            return data
          } else {
            switch (item.type) {
              case 'action':
                return (
                  <div>
                    {item.rowAction.map((val, index) => {
                      const Menu = {
                        template: `<span>${val.attribute}</span>`,
                        data: () => {
                          return {
                            parent: this,
                            record: record
                          }
                        }
                      }
                      if (index === item.rowAction.length - 1) {
                        return (
                          <span style={style}>
                            <Menu />
                          </span>
                        )
                      } else {
                        return (
                          <span>
                            <Menu style={style}/>
                            <a-divider type="vertical" />
                          </span>
                        )
                      }
                    })}
                  </div>
                )
              case 'datetime':
                return (
                  <div style={style} onClick={() => { item.func(that, record) }}>
                    {(text === null || text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00') ? '--' : text}
                  </div>
                )
              case 'image':
                if (text.length > 0) {
                  return (
                    <viewer>
                      {text.map((val) => {
                        return (
                          <img src={this.setting.rootUrl + val.filePath} style={style} style="width: 64px; height: 64px; cursor: pointer; margin-right: 2px;" />
                        )
                      })}
                    </viewer>
                  )
                } else {
                  return '--'
                }
              case 'file':
                if (text.length > 0) {
                  return (
                    <div>
                      {text.map((val) => {
                        return (
                          <a href={this.setting.rootUrl + val.filePath} target="_blank" style={style} style="display: block;">{ val.fileName }</a>
                        )
                      })}
                    </div>
                  )
                } else {
                  return '--'
                }
              case 'score':
                return (
                  <a-rate value={Number(text)} disabled allow-half/>
                )
              case 'tag':
                if (record['_' + item.dataIndex + '_']) {
                  return (
                    <div>
                      {record['_' + item.dataIndex + '_'].split(',').map((val) => {
                        return (
                          <a-tag color={text.find(item => item.name === val) && text.find(item => item.name === val).tag_type === '1' ? 'green' : 'purple'}>{val}</a-tag>
                        )
                      })}
                    </div>
                  )
                } else {
                  return '--'
                }
              default:
                return (
                  <div style={style} onClick={() => { item.func(that, record) }} domPropsInnerHTML={text || '--'}>
                  </div>
                )
            }
          }
        }
      })
      this.refresh()
    })
  },
  methods: {
    // 加载表格数据
    loadDataTable (parameter) {
      if (!this.sorter.end_date && this.flowStatus === 'finish' && this.timeRangeDisplay !== '0') {
        this.sorter.end_date = ''
        this.sorter.end_date = this.moment().startOf('month').format('YYYY-MM')
      }
      if (this.params.type !== 'table_card_list') {
        parameter.pageSize = this.pagesize
        const customColumns = []
        if (this.sendData) {
          for (let i = 1; i < this.columns.length; i++) {
            customColumns.push(this.columns[i].dataIndex)
          }
        }
        return this.axios({
          url: this.dataSource || '/admin/UserTable/init',
          params: Object.assign(this.sorter, parameter, { flowStatus: this.flowStatus }),
          data: Object.assign(this.queryParam, this.params, { customColumns: customColumns, associated: this.filtersData })
        }).then(res => {
          this.sendData = false
          this.where = res.result.where
          this.totalCount = res.result.totalCount
          return res.result
        })
      }
    },
    getEndDateChange (date, dateString) {
      this.endDate = date
      this.sorter.end_date = date ? date.format('YYYY-MM') : dateString
    },
    // 刷新表格
    refresh (type) {
      if (this.$refs.table) {
        this.$refs.table.refresh(!type)
      }
    },
    // 打开高级搜索
    showSearch () {
      this.searchKey = this.searchKey === 4 ? 5 : 4
      this.$nextTick(() => {
        this.$refs.userTableSearch.show({
          tableid: this.tableid,
          customSearch: this.customSearch,
          tplviewid: this.tplviewid,
          newFlag: this.searchFlag,
          data: this.searchData
        })
      })
    },
    onLoadData (treeNode, item) {
      const { value } = treeNode.dataRef
      return new Promise((resolve) => {
        this.axios({
          url: '/admin/address/getAddressChildren',
          params: { parent_number: value }
        }).then(res => {
          item.field.option.forEach(item => {
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
    },
    saveSearch (val, flag) {
      this.searchFlag = flag
      this.searchData = JSON.parse(JSON.stringify(val))
    },
    // 获取高级搜索数据
    handleHighSearch (val, flag) {
      this.searchFlag = flag
      this.searchData = JSON.parse(JSON.stringify(val))
      // 不保存这些参数
      val.conditions.forEach(item => {
        item.fieldtype = item.formtype = item.optionValue = item.condiArr = undefined
      })
      this.queryParam = {
        advanceSearch: val
      }
      this.refresh()
    },
    // 获取地址
    getAddress (name, number, alias) {
      const obj = {}
      obj[alias] = number
      this.formSearch.setFieldsValue(obj)
    },
    clearAddress () {
      this.template.forEach(item => {
        if (['address', 'cascader'].includes(item.formtype) && this.$refs[item.value]) {
          this.$refs[item.value][0].resetClear()
        }
      })
    },
    // 获取自定义列点击显示时数据
    getData (data) {
      this.sendData = true
      this.pagesize = Number(data.pageSize)
      this.columns = this.columns.filter(item => item.dataIndex === 'action')
      if (this.columns[0]) {
        this.columns[0].fixed = false
      }
      for (const i in data.data) {
        data.data[i]['ellipsis'] = true
        if (['textarea', 'image', 'file', 'editor'].includes(data.data[i].type)) {
          data.data[i].sorter = false
        } else {
          if ((data.data[i].sorter === '1' || !data.data[i].sorter) && data.data[i].dataIndex !== 'action') {
            data.data[i].sorter = true
          } else {
            data.data[i].sorter = false
          }
        }
        this.columns.push(data.data[i])
      }
      this.columns = this.columns.filter(item => item.display !== 'd')
      const that = this
      this.scroll.x = null
      this.columns.map((item) => {
        let style = {}
        if (item.style) {
          style = {
            'background-color': item.style.bgcolor,
            'color': item.style.color,
            'font-size': item.style.fontsize
          }
        }
        if (item.attribute && !item.attribute.includes('<')) {
          item.attribute = JSON.parse(item.attribute)
        }
        item.ellipsis = true
        item.width = Number(item.width)
        if (item.width === 0) {
          delete item.width
          this.scroll.x = null
        } else {
          if (this.scroll.x !== null) {
            this.scroll.x += item.width
          }
        }
        if (item.dataIndex === 'action') {
          const obj = {}
          if (this.params.type === 'table_subform_list') {
            obj.attribute = `<a href="javascript:;" @click="() => { const val = [record]; parent.$emit('ok', val, 'line') }">选择</a>`
            item.rowAction.push(obj)
          } else if (this.params.type === 'associated') {
            obj.attribute = `<a href="javascript:;" @click="() => {  parent.axios({url: '/admin/UserTable/getTableRecord',params: { tableid: parent.tableid, id: record.id, flowStatus: parent.flowStatus }}).then(res => { parent.$emit('ok', res.result.data, 'associated')})}">选择</a>`
            item.rowAction.push(obj)
          }
          if (this.flowStatus === 'finish') {
            item.rowAction = item.rowAction.filter(item => item.bar_alias !== 'sys_delete')
          }
        }
        item.customRender = (text, record, index) => {
          item.func = () => { }
          if (item.attribute) {
            // 获取属性key
            const key = record[item.attribute.key]
            style = item.attribute.value ? item.attribute.value[key] : ''
            if (item.attribute.event) {
              const str = 'return ' + item.attribute.event
              // eslint-disable-next-line no-new-func
              const func = new Function(str)
              item.func = func()
            }
          }
          if (item.attribute && item.attribute.includes('<')) {
            let data = ''
            const MyComponent = Vue.component('my-component', {
              data: function () {
                return { text: text, record: record }
              },
              template: item.attribute
            })
            data = (<MyComponent></MyComponent>)
            return data
          } else {
            switch (item.type) {
              case 'action':
                return (
                  <div>
                    {item.rowAction.map((val, index) => {
                      const Menu = {
                        template: `<span>${val.attribute}</span>`,
                        data: () => {
                          return {
                            parent: this,
                            record: record
                          }
                        }
                      }
                      if (index === item.rowAction.length - 1) {
                        return (
                          <span style={style}>
                            <Menu />
                          </span>
                        )
                      } else {
                        return (
                          <span>
                            <Menu style={style}/>
                            <a-divider type="vertical" />
                          </span>
                        )
                      }
                    })}
                  </div>
                )
              case 'datetime':
                return (
                  <div style={style} onClick={() => { item.func(that, record) }}>
                    {(text === null || text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00') ? '--' : text}
                  </div>
                )
              case 'image':
                if (text.length > 0) {
                  return (
                    <viewer>
                      {text.map((val) => {
                        return (
                          <img src={this.setting.rootUrl + val.filePath} style={style} style="width: 64px; height: 64px; cursor: pointer; margin-right: 2px;" />
                        )
                      })}
                    </viewer>
                  )
                } else {
                  return '--'
                }
              case 'file':
                if (text.length > 0) {
                  return (
                    <div>
                      {text.map((val) => {
                        return (
                          <a href={this.setting.rootUrl + val.filePath} target="_blank" style={style} style="display: block;">{ val.fileName }</a>
                        )
                      })}
                    </div>
                  )
                } else {
                  return '--'
                }
              case 'score':
                return (
                  <a-rate value={Number(text)} disabled allow-half/>
                )
              case 'tag':
                if (record['_' + item.dataIndex + '_']) {
                  return (
                    <div>
                      {record['_' + item.dataIndex + '_'].split(',').map((val) => {
                        return (
                          <a-tag color={text.find(item => item.name === val) && text.find(item => item.name === val).tag_type === '1' ? 'green' : 'purple'}>{val}</a-tag>
                        )
                      })}
                    </div>
                  )
                } else {
                  return '--'
                }
              default:
                return (
                  <div style={style} onClick={() => { item.func(that, record) }}>
                    {text === '' ? '--' : text}
                  </div>
                )
            }
          }
        }
      })
      this.lockLeft = data.lockLeft
      this.lockRight = data.lockRight
      for (let i = 0; i < this.lockLeft; i++) {
        this.columns[i]['fixed'] = 'left'
        this.scroll.x -= Number(this.columns[i].width)
      }
      let keyLength = this.columns.length - 1
      for (let i = 0; i < this.lockRight; i++) {
        this.columns[keyLength]['fixed'] = 'right'
        this.scroll.x -= Number(this.columns[keyLength].width)
        keyLength--
      }
      this.refresh()
    },
    // 自定义列打开
    customShow () {
      this.$refs.userTableColumnCustom.show({
        title: '用户自定义列',
        data: this.columns,
        tplviewid: this.tplviewid,
        tableid: this.tableid
      })
    },
    // 获取搜索栏级联选择数据
    getcascaderValue (val, alias) {
      const obj = {}
      obj[alias] = val
      this.formSearch.setFieldsValue(obj)
    },
    handleHighSearchMenu (val) {
      this.queryParam = {
        advanceSearch: val
      }
      this.refresh()
    },
    // 高级搜索改变列表值
    handleChange (action, data, index) {
      const obj = {}
      obj.id = data.id
      obj.setting = JSON.stringify(data)
      if (action === 'add') {
        this.customSearch.push(obj)
      } else if (action === 'edit') {
        this.customSearch.splice(index, 1, obj)
      } else {
        this.customSearch.splice(index, 1)
      }
      this.condiList = this.customSearch.length > 0 ? this.customSearch.map(item => {
        const obj = JSON.parse(item.setting)
        obj.id = item.id
        return obj
      }) : []
    },
    // 添加/编辑
    onShow (parameter) {
      parameter.jointable = this.params.jointable
      parameter.flowStatus = this.flowStatus
      this.indexKey = this.indexKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.userTableForm.show(parameter)
      })
    },
    // 删除
    onDelete (parameter) {
      const that = this
      const id = parameter && parameter.record ? parameter.record.id : this.selectedRowKeys
      this.$confirm({
        title: parameter ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: parameter && parameter.url ? parameter.url : '/admin/UserTable/delete',
            data: { id: id, tplviewid: that.params.tplviewid }
          }).then(res => {
            that.refresh('noRefresh')
          })
        }
      })
    },
    // 批量编辑
    onBulkEdit (parameter) {
      this.$refs.userTableBulkEdit.show(Object.assign({
        title: '批量编辑',
        url: '/admin/UserTable/bulkEdit',
        tplviewid: this.params.tplviewid,
        tableid: this.tableid,
        totalCount: this.totalCount
      }, parameter))
    },
    // 导入
    onImport (parameter) {
      this.$refs.userTableImport.show(Object.assign({
        title: '导入',
        url: '/admin/Api/importFile',
        tplviewid: this.params.tplviewid,
        tableid: this.tableid
      }, parameter))
    },
    // 导出
    onExport (parameter) {
      this.exportKey = this.exportKey === 2 ? 3 : 2
      this.$nextTick(() => {
        this.$refs.userTableExport.show(Object.assign({
          title: '导出',
          url: '/admin/UserTable/export',
          tplviewid: this.params.tplviewid,
          tableid: this.tableid,
          flowStatus: this.flowStatus,
          where: this.where,
          columns: this.columnsExport
        }, parameter))
      })
    },
    // 加载级联菜单数据
    loadDataCascader (parameter) {
      const { selectedOptions } = parameter
      const targetOption = selectedOptions[selectedOptions.length - 1]
      const index = parameter.index
      const that = this
      targetOption.loading = true
      this.axios({
        url: '/admin/dict/getCascaderData',
        params: { parentNumber: targetOption.value }
      }).then(res => {
        targetOption.loading = false
        targetOption.children = res.result
        that.template[index].field.option = [...that.template[index].field.option]
      })
    },
    // 数据处理，主要用于发送一个请求到后面，后端进行简单的逻辑处理，如删除数据，标记数据状态等
    onRequest (parameter) {
      const me = this
      if (parameter.confirm) {
        this.$confirm({
          title: parameter.confirm.title || '您确认要处理该记录吗?',
          okText: parameter.confirm.okText || '确定',
          okType: parameter.confirm.okType || 'primary',
          cancelText: parameter.confirm.cancelText || '取消',
          onOk () {
            me.axios({
              url: parameter.url,
              data: Object.assign(parameter, me.params)
            }).then(res => {
              if (res.code === 0) {
                me.$message.info(res.message)
              } else {
                me.$message.warning(res.message)
              }
              me.refresh()
            })
          }
        })
      } else {
        this.axios({
          url: parameter.url,
          data: Object.assign(parameter, me.params)
        }).then(res => {
          if (res.code === 0) {
            me.$message.info(res.message)
          } else {
            me.refresh()
          }
          me.$message.warning(res.message)
        })
      }
    },
    handleSearch (parameter) {
      const { formSearch } = this
      if (parameter.tag) {
        const search = formSearch.getFieldsValue()
        const otherSearch = this.queryParam.searchString || {}
        const searchString = Object.assign(otherSearch, search)
        this.queryParam = {
          searchString
        }
        if (Object.keys(this.timeObj).length) {
          Object.assign(this.queryParam.searchString, this.timeObj)
        }
      } else {
        this.queryParam = {}
      }
      this.refresh()
    },
    changeAdvancedSearch () {
      this.advancedSearch = !this.advancedSearch
      if (this.params.width) {
        if (this.advancedSearch) {
          if (this.params.width >= 1200) {
            this.colLayout = this.labelCol
          } else if (this.params.width >= 900) {
            this.colLayout = { span: 8 }
          } else if (this.params.width >= 600) {
            this.colLayout = { span: 12 }
          } else {
            this.colLayout = { span: 24 }
          }
        } else {
          if (this.params.width >= 1200) {
            this.colLayout = { span: 8 }
          } else if (this.params.width >= 900) {
            this.colLayout = { span: 12 }
          } else {
            this.colLayout = { span: 24 }
          }
        }
      } else {
        if (this.advancedSearch) {
          this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
        } else {
          this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
        }
      }
    },
    // 组织结构
    organizationSearch (item, index, value) {
      clearTimeout(this.timeout)
      if (!value) {
        item.field.selectList = []
        return
      }
      this.timeout = setTimeout(() => {
        item.field.selectList = []
        const optionCustom = item.field.setting.form.optionCustom
        item.field.selectList = optionCustom.filter(item1 => {
          return item1.username.indexOf(value) > -1
        })
        this.template.splice(index, 1, item)
      }, 300)
    },
    // 打开选择用户界面
    handleSelectUserForm (item, index) {
      const { getFieldValue } = this.formSearch
      const value = getFieldValue(item.field.alias)
      this.userKey = this.userKey === 'user' ? 'user_1' : 'user'
      this.$nextTick(() => {
        this.$refs.selectUserForm.show({
          fieldid: item.field.fieldid,
          selectValue: value,
          mode: 'multiple',
          index: index
        })
      })
    },
    // 打开选择部门，角色窗口
    handleSelect (item, index) {
      const { getFieldValue } = this.formSearch
      const value = getFieldValue(item.field.alias) || []
      this.departmentKey = this.departmentKey ? 'department' : 'department_1'
      this.$nextTick(() => {
        this.$refs.selectDepartment.show({
          optionCustom: item.field.setting.form.optionCustom,
          optionType: item.field.setting.form.option_type,
          selectValue: value,
          mode: 'multiple',
          index: index,
          url: item.field.setting.form.option_type === 'department' ? '/admin/Department/getDepartmentData' : '/admin/Role/getRoleData'
        })
      })
    },
    // 选择部门，角色
    handleSelectUserData (selectValue, index) {
      const name = this.template[index].field.alias
      const { setFieldsValue } = this.formSearch
      const obj = {}
      obj[name] = selectValue
      setFieldsValue(obj)
    }
  }
}
</script>
<style lang="less">
// 使用scoped无法修改到css属性
.dropdown {
  button {
    margin-right: 0;
  }
}
</style>
