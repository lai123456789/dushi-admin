<template>
  <a-drawer
    :title="config.title"
    :destroyOnClose="true"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-alert type="warning">
          <template slot="message">
            1、批量编辑属于危险操作，请谨慎使用。<br/>
            2、批量编辑会影响系统性能，强烈建议在非工作时间使用。<br/>
            3、本次操作将会影响 {{ config.totalCount }} 条数据。
          </template>
        </a-alert>
        <a-form-item label="操作字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['field', { rules: [{ required: true, message: '请选择操作字段'}]}]" @change="onChange" showSearch option-filter-prop="children">
            <a-select-option v-for="(value, key) in fields" :key="key" :value="key" :record="value">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="更新为" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <!-- 单行文本 -->
          <a-input
            v-if="['text','location','autocomplete','associated'].includes(fieldtype) || ( fieldtype === 'combobox' && ['addressBook','src_path_back','linkData'].includes(fieldData.setting.attribute.dataSource))"
            :autoSize="{ minRows: 6, maxRows: 20 }"
            v-decorator="[fieldalias + '[value]', { rules: [{ required: true, message: '请输入内容'}]} ]" />
          <!-- 多行文本 -->
          <a-textarea v-else-if="fieldtype === 'textarea' || fieldtype === 'editor'" :autoSize="{ minRows: 6, maxRows: 20 }" v-decorator="[fieldalias + '[value]', { rules: [{ required: true, message: '请输入内容'}]}]" />
          <!-- 日期 -->
          <a-date-picker
            v-decorator="[fieldalias + '[value]', { rules: [{ required: true, message: '请选择时间' }]}]"
            style="width: 100%;"
            format="YYYY-MM-DD"
            :showTime="{ defaultValue: moment('', 'HH:mm:ss') }"
            v-else-if="fieldtype === 'datetime' || fieldtype === 'date'"
          ></a-date-picker>
          <!-- 下拉框、单选框、复选框 -->
          <a-select v-else-if="fieldtype === 'combobox' || fieldtype === 'checkbox'" :mode="fieldtype === 'checkbox' ? 'multiple' : 'default'" v-decorator="[fieldalias + '[value]', { rules: [{ required: true, message: '请选择' }]} ]">
            <a-select-option v-for="(value, key) in combobox" :key="key" :value="value.number">{{ value.name }}</a-select-option>
          </a-select>
          <!-- 级联选择 -->
          <div v-else-if="fieldtype === 'cascader'">
            <a-input v-show="false" v-decorator="[fieldalias + '[value]', { rules: [{ required: true, message: '请选择级联值' }]} ]"/>
            <tabs-select
              :field="fieldData"
              :valueKey="fieldData.setting.form.src || ''"
              :alias="fieldalias + '[value]'"
              action="add"
              :writeBack="fieldData.setting.form.writeBack"
              @send="getcascaderValue"
            />
          </div>
          <!-- 数字 -->
          <div v-else-if="fieldtype === 'number'">
            <a-input-number style="width: 100%;" v-decorator="[fieldalias + '[value]', { rules: [{ required: true, message: '请输入数字' }]} ]"/>
          </div>
          <!-- 地址选择 -->
          <div v-else-if="fieldtype === 'address'">
            <a-input v-show="false" v-decorator="[fieldalias + '[value[address]]', { rules: [{ required: true, message: '请选择地址' }]} ]"/>
            <a-input-group compact>
              <address-select
                :alias="fieldalias+'[value[address]]'"
                :series="fieldData.setting.form.show_series"
                @send="getAddress"
                :style="{ width:fieldData.setting.form.details_show === '1' ? '25%' : '100%'}"
              />
              <a-form-item v-if="fieldData.setting.form.details_show === '1'" :style="{ width: fieldData.setting.form.details_show === '1' ? '75%' : '0%' }">
                <a-input
                  placeholder="请输入详细地址"
                  v-decorator="[fieldalias + '[value[details]]']"/>
              </a-form-item>
            </a-input-group>
          </div>
          <!-- 开关 -->
          <a-select
            v-else-if="fieldtype === 'switch'"
            v-decorator="[fieldalias + '[value]', { initialValue: '', rules: [{ required: true, message: '请选择开关' }] } ]"
            placeholder="请选择"
            :allowClear="true" >
            <a-select-option v-for="(value, key) in combobox" :key="key" :value="value">{{ value }}</a-select-option>
          </a-select>
          <!-- 评分 -->
          <a-rate
            v-else-if="fieldtype === 'score'"
            :allowHalf="fieldData.setting.attribute.half === '1'"
            :allowClear="fieldData.setting.attribute.clear === '1'"
            :tooltips="fieldData.setting.form.writeList"
            v-decorator="[fieldalias + '[value]',{ rules: [{ required: true, message: '请选择评分' }]}]"
          >
          </a-rate>
          <!-- 树选择 -->
          <template v-else-if="fieldtype === 'treeselect'">
            <a-tree-select
              v-if="fieldData.setting.attribute.dataSource === 'addressBook'"
              :allowClear="true"
              :tree-data="fieldData.option"
              :treeDefaultExpandedKeys="fieldData.value || []"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :placeholder="fieldData.setting.attribute.emptyText ? fieldData.setting.attribute.emptyText : '请选择'"
              :multiple="fieldData.setting.attribute.multiple === '1'"
              :tree-checkable="fieldData.setting.attribute.inherit === '1'"
              :load-data="onLoadData"
              :show-checked-strategy="fieldData.setting.attribute.inherit === '1'? SHOW_PARENT : SHOW_CHILD"
              v-decorator="[fieldalias + '[value]',{ rules: [{ required: true, message: '请选择' }]}]"
            >
              <a-icon slot="suffixIcon" :type="fieldData.setting.form.latterVal.type" v-if="fieldData.setting.form.latterIcon === 'custom'"/>
              <span v-else-if="fieldData.setting.form.latterIcon === 'string'" slot="suffixIcon">{{ fieldData.setting.form.latterVal.type }}</span>
            </a-tree-select>
            <a-tree-select
              v-else
              :allowClear="true"
              :tree-data="fieldData.option"
              :treeDefaultExpandedKeys="fieldData.value || []"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :placeholder="fieldData.setting.attribute.emptyText ? fieldData.setting.attribute.emptyText : '请选择'"
              :multiple="fieldData.setting.attribute.multiple === '1'"
              :tree-checkable="fieldData.setting.attribute.inherit === '1'"
              :show-checked-strategy="fieldData.setting.attribute.inherit === '1'? SHOW_PARENT : SHOW_CHILD"
              v-decorator="[fieldalias + '[value]',{ rules: [{ required: true, message: '请选择' }]}]"
            >
              <a-icon slot="suffixIcon" :type="fieldData.setting.form.latterVal.type" v-if="fieldData.setting.form.latterIcon === 'custom'"/>
              <span v-else-if="fieldData.setting.form.latterIcon === 'string'" slot="suffixIcon">{{ fieldData.setting.form.latterVal.type }}</span>
            </a-tree-select>
          </template>
          <!-- 组织结构 -->
          <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1px" v-else-if="fieldtype === 'organization'">
            <a-select
              v-decorator="[fieldalias + '[value]',{ rules: [{ required: true, message: '请选择' }]}]"
              show-search
              allowClear
              :default-active-first-option="false"
              :not-found-content="null"
              option-filter-prop="children"
              :show-arrow="false"
              :filter-option="false"
              style="flex: 1"
              :mode="fieldData.setting.attribute.mode"
              v-if="fieldData.setting.form.option_type === 'user'"
            >
              <a-select-option v-for="(item1, index1) in fieldData.selectList" :key="index1" :value="item1.username">
                {{ item1.text }}
              </a-select-option>
            </a-select>
            <a-select
              v-decorator="[fieldalias + '[value]',{ rules: [{ required: true, message: '请选择' }]}]"
              show-search
              allowClear
              option-filter-prop="children"
              :show-arrow="false"
              style="flex: 1"
              :mode="fieldData.setting.attribute.mode"
              v-else
            >
              <template v-if="fieldData.setting.form.option_type === 'department'" >
                <a-select-option v-for="(item1, index1) in fieldData.option" :key="index1" :value="item1.departmentid">
                  {{ item1.name }}
                </a-select-option>
              </template>
              <template v-else >
                <a-select-option v-for="(item1, index1) in fieldData.option" :key="index1" :value="item1.roleid">
                  {{ item1.name }}
                </a-select-option>
              </template>
            </a-select>
            <a-button
              icon="user"
              v-if="fieldData.setting.form.option_type === 'user'"
              style="margin-left: -1px;"
              @click="handleSelectUserForm(fieldData)">
            </a-button>
            <a-button
              icon="apartment"
              v-else-if="fieldData.setting.form.option_type === 'department'"
              style="margin-left: -1px;"
              @click="handleSelect(fieldData)">
            </a-button>
            <a-button
              icon="user"
              v-else
              style="margin-left: -1px;"
              @click="handleSelect(fieldData)">
            </a-button>
          </div>
        </a-form-item>
      </a-form>
      <select-user-form ref="selectUserForm" @ok="handleSelectUserData"/>
      <select-department ref="selectDepartment" @ok="handleSelectUserData"/>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { TreeSelect } from 'ant-design-vue'
Vue.use(TreeSelect)
export default {
  components: {
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    SelectUserForm: () => import('./SelectUserForm'),
    SelectDepartment: () => import('./SelectDepartment')
  },
  data () {
    return {
      config: {},
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      SHOW_PARENT: TreeSelect.SHOW_PARENT,
      SHOW_CHILD: TreeSelect.SHOW_CHILD,
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      fields: {},
      fieldtype: 'text',
      fieldalias: '',
      combobox: [],
      fieldData: {},
      parentQueryParam: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.parentQueryParam = this.$parent.queryParam
      this.form.resetFields()
      this.fieldtype = 'text'
      this.axios({
        url: `/admin/UserTable/tableFields/?tableid=${config.tableid}`
      }).then((res) => {
        this.loading = false
        const newfields = {}
        for (const k in res.result) {
          if (!['image', 'file', 'subform', 'tag', 'serialnumber'].includes(res.result[k].formtype) && res.result[k].virtual !== 1) {
            newfields[k] = res.result[k]
          }
        }
        this.fields = newfields
      })
    },
    getcascaderValue (val, alias) {
      const obj = {}
      obj[alias] = val
      this.form.setFieldsValue(obj)
    },
    getAddress (name, number, alias) {
      const obj = {}
      obj[alias] = number
      this.form.setFieldsValue(obj)
    },
    // 打开选择用户界面
    handleSelectUserForm (fieldData) {
      this.$nextTick(() => {
        this.$refs.selectUserForm.show({
          fieldid: fieldData.fieldid,
          selectValue: '',
          mode: fieldData.setting.attribute.mode
        })
      })
    },
    // 打开选择部门，角色窗口
    handleSelect (fieldData) {
      this.$nextTick(() => {
        this.$refs.selectDepartment.show({
          optionCustom: fieldData.setting.form.optionCustom,
          option: fieldData.option || [],
          optionType: fieldData.setting.form.option_type,
          selectValue: '',
          mode: fieldData.setting.attribute.mode,
          url: fieldData.setting.form.option_type === 'department' ? '/admin/Department/getDepartmentUser' : '/admin/Role/getRoleData'
        })
      })
    },
    // 选择部门，角色
    handleSelectUserData (selectValue, index, conIndex, option) {
      const name = this.fieldalias + '[value]'
      const obj = {}
      let data
      if (selectValue) {
        data = selectValue
      }
      this.fieldData.option = option
      obj[name] = data
      this.form.setFieldsValue(obj)
    },
    // 树选择地址簿数据加载
    onLoadData (treeNode) {
      const { value } = treeNode.dataRef
      return new Promise((resolve) => {
        if (value.charAt(value.length - 1) === '0') {
          this.axios({
            url: '/admin/address/getAddressChildren',
            params: { parent_number: value }
          }).then(res => {
            this.fieldData.option.forEach(item => {
              if (item.value === value && !item.children) {
                const arr = []
                res.result.forEach(arrItem => {
                  const obj = { label: arrItem.name, value: arrItem.number }
                  arr.push(obj)
                })
                this.$set(item, 'children', arr)
                this.$forceUpdate()
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
        }
        resolve()
      })
    },
    onChange (value, record) {
      this.fieldData = record.data.attrs.record
      this.fieldalias = value
      const formtype = record.data.attrs.record.formtype
      if (formtype === 'combobox' || formtype === 'radio' || formtype === 'checkbox') {
        this.fieldtype = formtype === 'checkbox' ? 'checkbox' : 'combobox'
        this.loading = true
        this.axios({
          url: 'admin/dict/linkageDictList/?parent_number=' + record.data.attrs.record.setting.form.src
        }).then((res) => {
          this.loading = false
          this.combobox = res.result
        })
      } else if (formtype === 'switch') {
        this.fieldtype = 'switch'
        this.combobox = [...[this.fieldData.setting.form.word.value.split('/')[0]], ...[this.fieldData.setting.form.word.value.split('/')[1]]]
      } else if (formtype === 'treeselect') {
        this.axios({
          url: 'admin/UserTable/getFieldForm',
          params: { fieldid: this.fieldData.fieldid }
        }).then(res => {
          this.fieldtype = 'treeselect'
          this.fieldData.option = res.result.data.option
          console.log(this.fieldData)
        })
      } else {
        this.fieldtype = formtype
      }
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          const isArray = values[this.fieldalias].value instanceof Array
          if (isArray) {
            values[this.fieldalias].value = values[this.fieldalias].value.join(',')
          }
          this.axios({
            url: this.config.url,
            data: Object.assign(values, this.parentQueryParam, { tableid: this.config.tableid })
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
              this.fieldtype = 'text'
            }
          })
        }
      })
    }
  }
}
</script>
