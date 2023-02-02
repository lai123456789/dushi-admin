<template>
  <a-drawer
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <!-- 搜索区域 -->
    <a-spin :spinning="false">
      <div>
        <a-card class="table-search">
          <a-form :form="formSearch" :layout="advancedSearch ? 'vertical' : 'inline'" :class="advancedSearch ? 'advanced' : 'normal'">
            <div class="head">
              <div class="title">过滤</div>
              <a-space style="margin-left: 8px">
                <a-button htmlType="submit" type="primary" @click="handleSearch({tag: true})">搜索</a-button>
                <a-button @click="() => {queryParam = {}, handleSearch({tag: false})}">重置</a-button>
                <a @click="changeAdvancedSearch">{{ advancedSearch ? '收起' : '展开' }}<a-icon :type="advancedSearch ? 'up' : 'down'"/></a>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col v-if="advancedSearch" span="24">
                <div class="divider"></div>
              </a-col>
              <!-- 下面是动态生成区域，要根据不同的组件进行相应展示 -->
              <a-col
                v-for="(item, index) in template"
                :key="index"
                v-show="item.fieldrule !== 'hidden'"
                v-bind="{ span: item.column }"
              >
                <a-form-item :label="item.change_title ? item.change_title : item.name" :validate-status="item.formtype === 'number' ? 'success' : ''" v-if="item.field">
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
                  <!-- 组织结构 -->
                  <div style="display: flex; justify-content: center; align-items: center; margin-top: 2px" v-else-if="item.field.formtype === 'organization'">
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
                    <a-button
                      icon="user"
                      v-if="item.field.setting.form.option_type === 'user'"
                      style="margin-left: -1px;"
                      @click="handleSelectUserForm(item, index)">
                    </a-button>
                    <a-button
                      icon="apartment"
                      v-else-if="item.field.setting.form.option_type === 'department'"
                      style="margin-left: -1px;"
                      @click="handleSelect(item, index)">
                    </a-button>
                    <a-button
                      icon="user"
                      v-else
                      style="margin-left: -1px;"
                      @click="handleSelect(item, index)">
                    </a-button>
                  </div>
                </a-form-item>
                <a-divider :orientation="item.dividerDirection" v-else-if="item.type === 'divider'">{{ item.dividerText }}</a-divider>
                <a-input v-else-if="item.type === 'place'" style="opacity: 0"></a-input>
                <component v-else-if="item.type === 'component'" :is="item.component" />
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <a-card>
          <!-- 操作按钮 -->
          <div class="table-operator">
            <!-- 下面是动态生成区域 -->
            <component v-for="(item, index) in tbar" :key="index" :is="item.component" />
          </div>
          <!-- 数据列表 -->
          <s-table
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :rowSelection="rowSelection"
            :autoLoad="false"
            :scroll="scroll"
          >
          </s-table>
        </a-card>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    config: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  components: {
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect')
  },
  data () {
    return {
      visible: false,
      // 搜索表单
      formSearch: this.$form.createForm(this),
      // 表头
      columns: [ ],
      rowSelection: null,
      // 高级搜索展开/折叠标识
      advancedSearch: true,
      // 搜索表单
      template: [],
      scroll: { x: 0 },
      goodsList: [],
      // 搜索参数
      queryParam: { },
      colLayout: {},
      params: {},
      // 工具栏菜单
      tbar: [],
      selectedRowKeys: [],
      selectedRows: [],
      dataSource: '',
      defaultSearch: {}
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  created () {
    this.changeAdvancedSearch()
    this.axios({
      url: '/admin/UserTable/init',
      data: { tplviewid: this.config.tplviewid }
    }).then(res => {
      this.columns = res.result.columns
      this.sorter = res.result.sorter
      this.template = res.result.search.template
      this.dataSource = res.result.data_source
      this.defaultSearch = this.config.parent.defaultSearch || {}
      this.template.forEach(item => {
        if (item.type === 'component') {
          item.component = {
            template: `<span>${item.attribute}</span>`,
            data: () => {
              return {
                top: this.config.parent,
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
              top: this.config.parent,
              parent: this
            }
          }
        }
      })
      // 表格是否出现行选择功能
      this.rowSelection = res.result.multiSelect ? {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        }
      } : null
      // 循环处理表格的列
      this.columns.map((item) => {
        // item.align = 'left'
        item.ellipsis = true
        if (item.width === 0) {
          delete item.width
          this.scroll.x = null
        } else {
          if (this.scroll.x !== null) {
            this.scroll.x += item.width
          }
        }
        if (item.type === 'action') {
          item.customRender = (text, record, index) => {
            return (
              <div>
                {item.rowAction.map((val, index) => {
                  const Menu = {
                    template: `<span>${val.attribute}</span>`,
                    data: () => {
                      return {
                        top: this.config.parent,
                        parent: this,
                        record: record
                      }
                    }
                  }
                  if (index === item.rowAction.length - 1) {
                    return (
                      <span>
                        <Menu/>
                      </span>
                    )
                  } else {
                    return (
                      <span>
                        <Menu/>
                        <a-divider type="vertical" />
                      </span>
                    )
                  }
                })}
              </div>
            )
          }
        } else if (item.type === 'datetime') {
          // 日期时间
          item.customRender = (text, record, index) => {
            return (
              (text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00' || text === '00:00:00') ? '--' : text
            )
          }
        } else if (item.type === 'image') {
          // 图片
          item.customRender = (text, record, index) => {
            if (text && text.length > 0) {
              return (
                <div>
                  {text.map((val) => {
                    return (
                      <a href={this.setting.rootUrl + val.filePath} target="_blank" style="border: 1px dashed #d9d9d9; border-radius: 5px; margin-right: 8px; padding: 5px; display: inline-block;">
                        <img src={this.setting.rootUrl + val.filePath} style="width: 64px; height: 64px;"/>
                      </a>
                    )
                  })}
                </div>
              )
            } else {
              return '--'
            }
          }
        } else if (item.type === 'file') {
          // 附件
          item.customRender = (text, record, index) => {
            if (text && text.length > 0) {
              return (
                <div>
                  {text.map((val) => {
                    return (
                      <a href={this.setting.rootUrl + val.filePath} target="_blank" style="display: block;">{val.fileName + 'aa'}</a>
                    )
                  })}
                </div>
              )
            } else {
              return '--'
            }
          }
        } else {
          item.customRender = (text, record, index) => {
            return (
              text === '' ? '--' : text
            )
          }
        }
      })
      this.refresh()
    })
    this.show()
  },
  methods: {
    show () {
      this.visible = true
    },
    loadDataTable (parameter) {
      return this.axios({
        url: this.dataSource || '/admin/UserTable/init',
        params: Object.assign(this.sorter, parameter),
        data: Object.assign(this.queryParam, { tplviewid: this.config.tplviewid }, { defaultSearch: this.defaultSearch })
      }).then(res => {
        return res.result
      })
    },
    // 获取搜索栏级联选择数据
    getcascaderValue (val, alias) {
      const obj = {}
      obj[alias] = val
      this.formSearch.setFieldsValue(obj)
    },
    // 刷新表格
    refresh () {
      this.$refs.table.refresh()
    },
    changeAdvancedSearch () {
      this.advancedSearch = !this.advancedSearch
      if (this.params.width) {
        if (this.advancedSearch) {
          if (this.params.width >= 1200) {
            this.colLayout = { span: 6 }
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
    handleSearch (parameter) {
      const { formSearch } = this
      if (parameter.tag) {
        this.queryParam = {
          searchString: formSearch.getFieldsValue()
        }
      } else {
        this.queryParam = {}
      }
      this.refresh()
    }
  }
}
</script>
