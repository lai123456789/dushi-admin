<template>
  <a-modal
    title="高级搜索"
    :width="1200"
    :closable="true"
    :visible="visible"
    @cancel="visible = !visible; $emit('save', data, newFlag)"
    :bodyStyle="{ height: '500px' }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item>
          <a-row v-show="!loading" type="flex" :gutter="8">
            <a-col :span="18" style="height: 450px; overflow: auto;">
              <a-form-item>
                以下条件组合方式：
                <a-select v-model="data.logic" style="width: 80px; padding-left: 10px;" size="small">
                  <a-select-option value="and">且(and)</a-select-option>
                  <a-select-option value="or">或(or)</a-select-option>
                </a-select>
              </a-form-item>
              <a-row type="flex" align="middle" v-for="(item, index) in data.conditions" :key="index" :gutter="8">
                <a-col :span="4">
                  <a-select
                    style="width: 100%;"
                    show-search
                    placeholder="请选择字段"
                    :value="item.alias"
                    @change="(value) => { choiceField(value, item) }"
                    option-filter-prop="children">
                    <a-select-option
                      v-for="(fieldItem, fieldIndex) in fieldArr"
                      :key="fieldIndex"
                      :value="fieldItem.alias">
                      {{ fieldItem.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col flex="auto">
                  <a-row type="flex" align="middle" v-for="(conItem, conIndex) in item.condition" :key="conIndex" :gutter="8">
                    <a-col :span="5">
                      <a-select
                        v-model="conItem.include"
                        @change="(value) => { choiceInclude(value, conItem) }">
                        <a-select-option
                          v-for="(includeItem, includeIndex) in item.condiArr"
                          :key="includeIndex"
                          :value="includeItem.enName" >
                          {{ includeItem.cnName }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col flex="auto">
                      <template v-if="!conItem.type">
                        <a-input v-model="conItem.value" v-if="item.formtype === 'text' || item.formtype === 'textarea' || item.formtype === 'associated' || item.formtype === 'serialnumber'" />
                        <a-input-number style="width: 100%;" v-model="conItem.value" v-else-if="item.formtype === 'number' && item.optionValue.length === 0" />
                        <!-- 日期 -->
                        <a-date-picker
                          style="width: 100%;"
                          :defaultValue="conItem.value && conItem.value !== '0000-00-00 00:00:00' ? moment(conItem.value, 'YYYY-MM-DD HH:mm:ss') : null"
                          :showTime="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }"
                          @change="(dates, dateStrings) => { conItem.value = dateStrings }"
                          format="YYYY-MM-DD HH:mm:ss"
                          v-else-if="item.formtype === 'datetime' && item.fieldtype === 'DATETIME'"
                        ></a-date-picker>
                        <a-date-picker
                          style="width: 100%;"
                          :defaultValue="conItem.value && conItem.value !== '0000-00-00' ? moment(conItem.value, 'YYYY-MM-DD') : null"
                          @change="(dates, dateStrings) => { conItem.value = dateStrings }"
                          format="YYYY-MM-DD"
                          v-else-if="item.formtype === 'datetime' && item.fieldtype === 'DATE'"
                        ></a-date-picker>
                        <a-time-picker
                          style="width: 100%;"
                          :defaultValue="conItem.value && conItem.value !== '00:00:00' ? moment(conItem.value, 'HH:mm:ss') : null"
                          @change="(dates, dateStrings) => { conItem.value = dateStrings }"
                          format="HH:mm:ss"
                          v-else-if="item.formtype === 'datetime' && item.fieldtype === 'TIME'"
                        ></a-time-picker>
                        <!-- 开关 -->
                        <a-select v-else-if="item.formtype === 'switch'" v-model="conItem.value" >
                          <a-select-option :value="item.word[0]">{{ item.word[0] }}</a-select-option>
                          <a-select-option :value="item.word[1]">{{ item.word[1] }}</a-select-option>
                        </a-select>
                        <!-- 树选择 -->
                        <div v-else-if="item.formtype === 'treeselect'">
                          <a-tree-select
                            v-if="item.dataSource && item.dataSource === 'addressBook'"
                            v-model="conItem.value"
                            style="width: 100%"
                            placeholder="请选择"
                            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                            :tree-data="item.option"
                            :load-data="(data)=>{ return onLoadData(data, item)}"
                          >
                          </a-tree-select>
                          <a-tree-select
                            v-else
                            v-model="conItem.value"
                            style="width: 100%"
                            placeholder="请选择"
                            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                            :tree-data="item.option"
                          >
                          </a-tree-select>
                        </div>
                        <!-- 地址 -->
                        <div v-else-if="item.formtype === 'address'">
                          <address-select :defaultValue="conItem.value" fieldType="search" :series="item.settings && item.settings.form ? item.settings.form.show_series : ''" :display="conItem.value" @send="(display, val) =>{ conItem.value = val }" />
                        </div>
                        <div v-else-if="item.formtype === 'organization'">
                          <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1px">
                            <a-select
                              v-model="conItem.value"
                              show-search
                              allowClear
                              :default-active-first-option="false"
                              :not-found-content="null"
                              option-filter-prop="children"
                              :show-arrow="false"
                              :filter-option="false"
                              style="flex: 1"
                              :mode="item.settings.attribute.mode"
                              v-if="item.settings.form.option_type === 'user'"
                            >
                              <a-select-option v-for="(item1, index1) in item.optionValue" :key="index1" :value="item1.label">
                                {{ item1.label }}
                              </a-select-option>
                            </a-select>
                            <a-select
                              v-else
                              v-model="conItem.value"
                              show-search
                              allowClear
                              option-filter-prop="children"
                              :show-arrow="false"
                              style="flex: 1"
                              :mode="item.settings.attribute.mode"
                            >
                              <template v-if="item.settings.form.option_type === 'department'" >
                                <a-select-option v-for="(item1, index1) in item.optionValue" :key="index1" :value="item1.departmentid">
                                  {{ item1.name }}
                                </a-select-option>
                              </template>
                              <template v-else >
                                <a-select-option v-for="(item1, index1) in item.optionValue" :key="index1" :value="item1.roleid">
                                  {{ item1.rolename }}
                                </a-select-option>
                              </template>
                            </a-select>
                            <a-button
                              icon="user"
                              v-if="item.settings.form.option_type === 'user'"
                              style="margin-left: -1px;"
                              @click="handleSelectUserForm(item, index, conIndex)">
                            </a-button>
                            <a-button
                              icon="apartment"
                              v-else-if="item.settings.form.option_type === 'department'"
                              style="margin-left: -1px;"
                              @click="handleSelect(item, index, conIndex)">
                            </a-button>
                            <a-button
                              icon="user"
                              v-else
                              style="margin-left: -1px;"
                              @click="handleSelect(item, index, conIndex)">
                            </a-button>
                          </div>
                        </div>
                        <!-- 标签 -->
                        <a-cascader
                          v-else-if="item.formtype === 'tag'"
                          v-model="conItem.value"
                          style="width: 100%"
                          :options="tagOption"
                          placeholder="请选择"
                        />
                        <a-select
                          v-model="conItem.value"
                          show-search
                          option-filter-prop="children"
                          v-else-if="item.formtype !== 'cascader' && item.optionValue && item.optionValue.length">
                          <a-select-option
                            v-for="(optionItem, optionIndex) in item.optionValue"
                            :key="optionIndex"
                            :value="optionItem.value" >
                            {{ optionItem.label }}
                          </a-select-option>
                        </a-select>
                        <!-- 级联选择 -->
                        <div v-else-if="item.formtype === 'cascader'">
                          <tabs-select
                            :defaultValue="conItem.value"
                            :valueKey="item.settings ? item.settings.form.src : (item.src || '')"
                            action="edit"
                            :display="conItem.display"
                            :field="conItem"
                            :writeBack="item.settings ? item.settings.form.writeBack : []"
                            fieldType="search"
                            @send="(val, alias, display) =>{ conItem.value = val; conItem.display = display }" />
                        </div>
                        <div v-else>
                          <a-input v-model="conItem.value"/>
                        </div>
                      </template>
                      <template v-else>
                        <a-input type="text" disabled />
                      </template>
                    </a-col>
                    <a-col flex="65px" style="display: flex; align-items: center;">
                      <a-icon
                        :style="{ fontSize: '24px', color: '#52c41a'}"
                        type="plus-square"
                        theme="filled"
                        @click="handlePlus(item, conIndex)"/>
                      <a-icon
                        :style="{ fontSize: '24px', color: item.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }"
                        type="minus-square"
                        theme="filled"
                        @click="item.condition.length === 1 ? '':handleSub(item, conIndex)"/>
                    </a-col>
                  </a-row>
                </a-col>
                <a-col flex="100px">
                  <a-select v-model="item.logic">
                    <a-select-option value="and">且(and)</a-select-option>
                    <a-select-option value="or">或(or)</a-select-option>
                  </a-select>
                </a-col>
                <a-col flex="70px" style="display: flex; align-items: center">
                  <a-icon
                    :style="{ fontSize: '24px', color: '#52c41a'}"
                    type="plus-square"
                    theme="filled"
                    @click="handleDataPlus(data.conditions, index)"/>
                  <a-icon
                    :style="{ fontSize: '24px', color: data.conditions.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }"
                    type="minus-square"
                    theme="filled"
                    @click="data.conditions.length === 1 ? '':handleDataSub(data.conditions, index)"/>
                </a-col>
              </a-row>
            </a-col>
            <a-col :span="6">
              <a-card title="保存的搜索" style="width: 100%;" :headStyle="{ height: '30px', 'line-height': '15px' }">
                <div class="list_box">
                  <div
                    class="list"
                    :class="data.id === item.id ? 'active' : ''"
                    v-for="(item, index) in condiList"
                    :key="index"
                    @click="showCondi(item, index)">
                    <span>{{ item.name }}</span>
                    <a-popconfirm
                      title="您确定要删除该项吗？"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="handleDelList(item, index)"
                    >
                      <a-icon type="delete" class="list_icon" @click.stop/>
                    </a-popconfirm>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-form-item>
        <a-modal :destroyOnClose="true" v-model="visibleN" title="请输入需要保存的搜索条件名称" @ok="hideModal">
          <a-form-item>
            <a-input v-decorator="['name', { rules: [{required: true, message: '搜索条件名不能为空'}], initialValue: dataName }]" />
          </a-form-item>
        </a-modal>
      </a-form>
    </a-spin>
    <div class="bbar" slot="footer">
      <a-row>
        <a-col :span="12" style="text-align: left">
          <a-button @click="reset">重置</a-button>
          <a-button @click="handleSave" style="margin-left: 15px;">
            <span v-if="!newFlag">更新搜索条件</span>
            <span v-else>添加搜索条件</span>
          </a-button>
        </a-col>
        <a-col :span="12">
          <a-button type="primary" @click="handleSubmit">搜索</a-button>
          <a-button @click="visible=!visible; $emit('save', data, newFlag)">关闭</a-button>
        </a-col>
      </a-row>
    </div>
    <select-user-form ref="selectUserForm" @ok="handleSelectUserData" />
    <select-department ref="selectDepartment" @ok="handleSelectUserData" />
  </a-modal>
</template>
<script>
export default {
  components: {
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    SelectUserForm: () => import('./SelectUserForm'),
    SelectDepartment: () => import('./SelectDepartment')
  },
  data () {
    return {
      config: {},
      visible: false,
      visibleN: false,
      loading: false,
      form: this.$form.createForm(this),
      fields: {},
      fieldArr: [],
      tableid: '',
      newFlag: true, // 新的搜索条件
      condiObj: { },
      tagOption: [],
      // 初始化搜索条件
      initData: {
        name: '',
        logic: 'or',
        conditions: [{
          alias: '',
          logic: 'or',
          formtype: 'text',
          optionValue: [],
          condiArr: [
            { enName: 'eq', cnName: '等于' },
            { enName: 'ne', cnName: '不等于' } ],
          condition: [{
            include: '',
            value: ''
          }]
        }]
      },
      // 搜索条件
      data: { },
      condiList: [ ],
      dataName: ''
    }
  },
  created () {
    this.condiObj.text = this.condiObj.textarea = this.condiObj.associated = [
      { enName: 'eq', cnName: '等于' },
      { enName: 'ne', cnName: '不等于' },
      { enName: 'cn', cnName: '包含' },
      { enName: 'nc', cnName: '不包含' },
      { enName: 'bw', cnName: '开始于' },
      { enName: 'ew', cnName: '结束于' },
      { enName: 'em', cnName: '为空' },
      { enName: 'nem', cnName: '不为空' } ]
    this.condiObj.number = this.condiObj.datetime = this.condiObj.serialnumber = [
      { enName: 'eq', cnName: '等于' },
      { enName: 'ne', cnName: '不等于' },
      { enName: 'gt', cnName: '大于' },
      { enName: 'ge', cnName: '大于等于' },
      { enName: 'lt', cnName: '小于' },
      { enName: 'le', cnName: '小于等于' },
      { enName: 'em', cnName: '为空' },
      { enName: 'nem', cnName: '不为空' }]
    const arr = ['radio']
    arr.forEach(item => {
      this.condiObj[item] = [
        { enName: 'eq', cnName: '等于' },
        { enName: 'ne', cnName: '不等于' },
        { enName: 'em', cnName: '为空' },
        { enName: 'nem', cnName: '不为空' }]
    })
    this.condiObj.switch = [
      { enName: 'eq', cnName: '等于' },
      { enName: 'ne', cnName: '不等于' }
    ]
    const arr2 = ['cascader', 'address', 'organization', 'combobox', 'checkbox', 'treeselect', 'tag']
    arr2.forEach(item => {
      this.condiObj[item] = [
        { enName: 'cn', cnName: '包含' },
        { enName: 'nc', cnName: '不包含' },
        { enName: 'em', cnName: '为空' },
        { enName: 'nem', cnName: '不为空' }]
    })
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
      this.tableid = config.tableid
      this.loading = true
      this.condiList = config.customSearch.length > 0 ? config.customSearch.map(item => {
        const obj = JSON.parse(item.setting)
        obj.id = item.id
        return obj
      }) : []
      this.newFlag = config.newFlag
      if (config.newFlag) {
        this.data = Object.keys(config.data).length > 0 ? config.data : JSON.parse(JSON.stringify(this.initData))
      } else {
        this.data = config.data
        this.condiList.forEach((item, index) => {
          if (this.data.id === item.id) {
            this.condiListIndex = index
          }
        })
      }
      if (this.data.conditions.some(item => item.formtype === 'tag')) {
        this.getTagOption()
      }
      // 搜索列表
      this.axios({
        url: '/admin/field/init',
        params: {
          pageNo: 1,
          pageSize: 1000,
          sortField: 'id',
          sortOrder: 'ascend',
          tableid: this.tableid
        }
      }).then(res => {
        res.result.data.forEach(item => {
          this.fields[item.alias] = item
        })
        this.condiList.forEach(item => {
          this.handleInit(item.conditions)
        })
        this.loading = false
        this.fieldArr = res.result.data.filter(item => {
          return ['text', 'textarea', 'radio', 'checkbox', 'combobox', 'number', 'datetime', 'cascader', 'organization', 'associated', 'switch', 'address', 'treeselect', 'serialnumber', 'tag'].indexOf(item.formtype) !== -1
        })
      })
    },
    // 打开选择用户界面
    handleSelectUserForm (item, index, conIndex) {
      this.$nextTick(() => {
        this.$refs.selectUserForm.show({
          selectValue: item.condition[conIndex].value,
          mode: item.settings.attribute.mode,
          index: index,
          conIndex: conIndex
        })
      })
    },
    // 打开选择部门，角色窗口
    handleSelect (item, index, conIndex) {
      this.$nextTick(() => {
        this.$refs.selectDepartment.show({
          optionCustom: item.field.setting.form.optionCustom,
          optionType: item.field.setting.form.option_type,
          selectValue: item.condition[conIndex].value,
          mode: item.field.setting.attribute.mode,
          index: index,
          url: item.field.setting.form.option_type === 'department' ? '/admin/Department/getDepartmentData' : '/admin/Role/getRoleData',
          conIndex: conIndex
        })
      })
    },
    // 选择部门，角色
    handleSelectUserData (selectValue, index, conIndex) {
      this.data.conditions[index].condition[conIndex].value = selectValue
    },
    getTagOption () {
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
    },
    onLoadData (treeNode, item) {
      const { value } = treeNode.dataRef
      if (item.settings.attribute.dataSource === 'addressBook') {
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
            params: { fieldid: this.fields[item.alias].fieldid, value: value }
          }).then(res => {
            this.$set(item, 'option', res.result.data.option)
          })
          resolve()
        })
      }
    },
    // 初始化函数
    handleInit (conditions) {
      conditions.forEach(item1 => {
        if (item1.alias) {
          item1.formtype = this.fields[item1.alias].formtype
          item1.settings = JSON.parse(this.fields[item1.alias].setting)
          if (['radio', 'checkbox', 'combobox'].indexOf(item1.formtype) !== -1) {
            if (item1.settings.attribute.dataSource === 'custom') {
              item1.optionValue = item1.settings.form.custom_data_list.map(item => {
                const obj = {
                  value: item.value,
                  label: item.value
                }
                return obj
              })
            } else {
              this.getOption(item1)
            }
          } else if (item1.formtype === 'organization') {
            const option = item1.settings.form.optionCustom
            let label, value
            if (item1.settings.form.option_type === 'user') {
              label = 'text'
              value = 'username'
            } else if (item1.settings.form.option_type === 'role') {
              label = 'rolename'
              value = 'roleid'
            } else {
              label = 'name'
              value = 'departmentid'
            }
            item1.optionValue = option.map(item => {
              const obj = {}
              obj.label = item[label]
              obj.value = item[value]
              return obj
            }) || []
          }
          item1.condiArr = this.condiObj[item1.formtype]
          item1.fieldtype = this.fields[item1.alias].fieldtype
        } else {
          item1.optionValue = []
        }
      })
    },
    getOption (item) {
      this.axios({
        url: '/admin/dict/getCascaderData',
        params: { parentNumber: item.settings.form.src }
      }).then(res => {
        this.$set(item, 'optionValue', res.result)
      })
    },
    // 选择字段
    choiceField (value, item) {
      const field = this.fields[value]
      item.formtype = field.formtype
      item.alias = field.alias
      item.fieldtype = field.fieldtype
      item.settings = JSON.parse(field.setting)
      const formtype = field.formtype
      item.condiArr = this.condiObj[formtype]
      // 根据字段，给出相应条件
      if (['text', 'textarea', 'associated', 'address'].indexOf(formtype) !== -1) {
        item.optionValue = ''
      } else if (item.formtype === 'tag' && this.tagOption.length === 0) {
        this.getTagOption()
      } else if (['radio', 'checkbox', 'combobox', 'organization'].indexOf(formtype) !== -1) {
        if (formtype !== 'organization') {
          if (item.settings.attribute.dataSource === 'custom') {
            item.optionValue = item.settings.form.custom_data_list.map(item => {
              const obj = {
                value: item.value,
                label: item.value
              }
              return obj
            })
          } else {
            if (item.settings.attribute.dataSource === 'src_path') {
              this.getOption(item)
            }
          }
        } else {
          const option = item.settings.form.optionCustom
          let label, value
          if (item.settings.form.option_type === 'user') {
            label = 'text'
            value = 'username'
          } else if (item.settings.form.option_type === 'role') {
            label = 'rolename'
            value = 'roleid'
          } else {
            label = 'name'
            value = 'departmentid'
          }
          item.optionValue = option.map(item => {
            const obj = {}
            obj.label = item[label]
            obj.value = item[value]
            return obj
          })
        }
      } else if (['number', 'datetime'].indexOf(formtype) !== -1) {
        item.optionValue = ''
      } else if (['cascader'].indexOf(formtype) !== -1) {
        item.src = item.settings.form.src
      } else if (formtype === 'switch') {
        item.word = []
        item.word[0] = item.settings.form.word.value.split('/')[0]
        item.word[1] = item.settings.form.word.value.split('/')[1]
      } else if (formtype === 'treeselect') {
        this.getTreeOption(item)
      }
      if (formtype === 'tag') {
        item.condition = [{
          include: '',
          value: undefined
        }]
      } else {
        item.condition = [{
          include: '',
          value: ''
        }]
      }
    },
    getTreeOption (item) {
      this.axios({
        url: '/admin/UserTable/getFieldForm',
        params: { fieldid: this.fields[item.alias].fieldid, value: item.value }
      }).then(res => {
        this.$set(item, 'option', res.result.data.option)
      })
    },
    // 选择关系
    choiceInclude (value, conItem) {
      if (value === 'em' || value === 'nem') {
        conItem.type = 'empty'
      } else {
        conItem.type = undefined
      }
    },
    // 加载级联菜单
    loadDataCascader (parameter) {
      const { selectedOptions } = parameter
      const targetOption = selectedOptions[selectedOptions.length - 1]
      const item = parameter.item
      targetOption.loading = true
      this.axios({
        url: '/admin/dict/getCascaderData',
        params: { parentNumber: targetOption.value, src: parameter.src }
      }).then(res => {
        targetOption.loading = false
        targetOption.children = res.result
        item.optionValue = [...item.optionValue]
      })
    },
    // 增加
    handlePlus (item, conIndex) {
      item.condition.splice(conIndex + 1, 0, {
        include: '',
        value: ''
      })
    },
    handleSub (item, conIndex) {
      item.condition.splice(conIndex, 1)
    },
    handleDataPlus (conditions, index) {
      conditions.splice(index + 1, 0, {
        alias: '',
        logic: 'or',
        formtype: 'text',
        optionValue: [],
        condiArr: [
          { enName: 'eq', cnName: '等于' },
          { enName: 'ne', cnName: '不等于' } ],
        condition: [{
          include: '',
          value: ''
        }]
      })
    },
    handleDataSub (conditions, index) {
      conditions.splice(index, 1)
    },
    // 重置
    reset () {
      this.data = JSON.parse(JSON.stringify(this.initData))
      this.newFlag = true
    },
    // 打开设置名称
    handleSave () {
      if (!this.data.conditions[0].alias) {
        this.$message.error('请选择字段')
        return
      }
      this.visibleN = true
      this.dataName = this.data.name
    },
    // 保存名称
    hideModal () {
      const { getFieldValue, validateFields } = this.form
      validateFields((error, values) => {
        if (!error) {
          this.dataName = getFieldValue('name')
          this.data.name = this.dataName
          this.visibleN = false
          const id = this.newFlag ? undefined : this.data.id
          const data = JSON.parse(JSON.stringify(this.data))
          // 不保存这些参数
          data.conditions.forEach(item => {
            item.fieldtype = item.formtype = item.optionValue = item.condiArr = undefined
            item.condition.forEach(item1 => {
              if (item1.type) {
                item1.include = item1.include === 'em' ? 'eq' : 'ne'
              }
            })
          })
          this.axios({
            url: '/admin/UserTable/customTemplate',
            data: {
              uid: this.config.tplviewid,
              tableid: this.config.tableid,
              type: 'list_search',
              data: data,
              action: this.newFlag ? 'add' : 'edit',
              id
            }
          }).then(res => {
            this.data.id = res.result.id
            if (this.newFlag) {
              this.$emit('change', 'add', data)
              this.condiList.push(this.data)
              this.condiListIndex = this.condiList.length - 1
            } else {
              this.$emit('change', 'edit', data, this.condiListIndex)
              this.condiList.splice(this.condiListIndex, 1, this.data)
            }
            this.newFlag = false
          })
        }
      })
    },
    // 显示搜索
    showCondi (item, index) {
      this.data = []
      this.$nextTick(() => {
        this.data = JSON.parse(JSON.stringify(item))
        if (this.data.conditions.some(item => item.formtype === 'tag' && !this.tagOption.length)) {
          this.getTagOption()
        }
        this.condiListIndex = index
        this.newFlag = false
      })
    },
    // 删除搜索列表项
    handleDelList (item, index) {
      this.axios({
        url: '/admin/UserTable/customTemplate',
        data: {
          action: 'delete',
          id: item.id
        }
      }).then(res => {
        this.condiList.splice(index, 1)
        this.$emit('change', 'delete', index)
      })
    },
    // 搜索
    handleSubmit () {
      const data = JSON.parse(JSON.stringify(this.data))
      if (!data.conditions[0].alias) {
        this.$message.error('请选择字段')
        return
      }
      data.conditions.forEach(item => { delete item.settings })
      this.$emit('ok', data, this.newFlag)
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
.ant-spin-cner {
  .bbar{
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  display:flex;
  justify-content: space-between;
  align-items: center;
    div {
      button{
        margin-left: 15px;
      }
    }
  }
}
.list_box {
  overflow: auto;
  height: 407px;
}
.list {
  margin: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .list_icon {
    opacity: 0;
  }
}
.list:hover {
  color: #1890ff;
  .list_icon {
    opacity: 1;
  }
}
.active {
  color: #1890ff;
}
</style>
