<template>
  <div>
    <a-drawer
      :destroyOnClose="true"
      :title="config.title"
      :width="config.page === 'viewForm' ? 1200 : 1100"
      :visible="visible"
      @close="onClose"
    >
      <a-spin :spinning="false">
        <div>
          <a-tabs default-active-key="1" v-if="config.page === 'viewForm'">
            <a-tab-pane key="1" tab="表单规则">
              <div style="margin-bottom: 35px">
                <a-form :form="form" >
                  <div class="table-operator" v-if="config.page !== 'dataForm'"><a-button icon="plus" type="primary" size="small" @click="addData">添加</a-button></div>
                  <div
                    v-show="data.length !== 0"
                    class="card-box"
                    v-for="(item, index) in data"
                    :key="index"
                  >
                    <a-card
                      style="flex: 1; margin-bottom: 10px;"
                      :headStyle="{ height: '10px' }"
                    >
                      <a-form-item :wrapper-col="{ span : 24 }">
                        <a-row type="flex" align="middle" :gutter="10">
                          <a-col :span="1">
                            <span style="font-weight: bold">如果</span>
                          </a-col>
                          <a-col :span="21">
                            <div>
                              <a-row v-for="(simpleItem, simpleIndex) in item.simpleCondition" :key="simpleIndex" type="flex" align="middle" :gutter="8">
                                <a-col flex="auto">
                                  <a-select
                                    v-model="simpleItem.fieldUser"
                                    size="small"
                                    @change="(value) => {
                                      if (value === 'field') {
                                        simpleItem.condition = [ {
                                          include: '',
                                          value: ''
                                        }]
                                      } else if(value.includes('current')) {
                                        $set(simpleItem,'include','bl')
                                        simpleItem.condition = [{
                                          include: '',
                                          value: []
                                        }]
                                      } }">
                                    <a-select-option value="field">字段</a-select-option>
                                    <a-select-option value="currentUser">当前用户</a-select-option>
                                    <a-select-option value="currentClass">当前用户所属部门</a-select-option>
                                    <a-select-option value="currentRole">当前用户所属角色</a-select-option>
                                    <a-select-option value="custom">自定义</a-select-option>
                                    <a-select-option value="notSet">无条件满足</a-select-option>
                                  </a-select>
                                </a-col>
                                <a-col :span="18" v-if="simpleItem.fieldUser === 'custom'">
                                  <a-row type="flex" align="middle">
                                    <a-col :span="24"><querier-codemirror-input ref="querierCodemirrorInput" :params.sync="item.condition" /></a-col>
                                    <div style="position:absolute; right: 15px; cursor: pointer; z-index: 10" size="small" @click="handleCodemirror(item, index)">fx</div>
                                  </a-row>
                                </a-col>
                                <a-col :span="18" v-if="simpleItem.fieldUser === 'notSet'"></a-col>
                                <a-col :span="4" v-if="simpleItem.fieldUser ==='field'">
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
                                        value: undefined
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
                                          }else if (item1.formtype === 'tag' && !tagOption.length){
                                            getTagOption()
                                            simpleItem.condition = [{
                                              include: '',
                                              value: []
                                            }]
                                          } else if(item1.formtype === 'tag'){
                                            simpleItem.condition = [{
                                              include: '',
                                              value: []
                                            }]
                                          }else if (simpleItem.src) {
                                            getOption(simpleItem)
                                          } else if(item1.formtype === 'treeselect'){
                                            simpleItem.dataSource = item1.settings.attribute.dataSource
                                            getTreeOption(simpleItem, item1)
                                          } else {
                                            simpleItem.option = []
                                          }
                                          simpleItem.form = item1.settings.form
                                          // 根据字段，给出相应条件
                                          if (['text', 'textarea','serialnumber'].indexOf(item1.formtype) !== -1) {
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
                                          } else if (['address','treeselect','tag'].indexOf(item1.formtype) !== -1) {
                                            simpleItem.conditionArr = [{ enName: 'contain', cnName: '包含' },
                                                                       { enName: 'nc', cnName: '不包含' },
                                                                       { enName: 'em', cnName: '为空' },
                                                                       { enName: 'nem', cnName: '不为空' }]
                                          } else if (['associated'].indexOf(item1.formtype) !== -1) {
                                            simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' },
                                                                       { enName: 'ne', cnName: '不等于' },
                                                                       { enName: 'contain', cnName: '包含' },
                                                                       { enName: 'nc', cnName: '不包含' },
                                                                       { enName: 'bw', cnName: '开始于' },
                                                                       { enName: 'ew', cnName: '结束于' },
                                                                       { enName: 'em', cnName: '为空' },
                                                                       { enName: 'nem', cnName: '不为空' }]
                                          }else if (['cascader'].indexOf(item1.formtype) !== -1) {
                                            simpleItem.conditionArr = [ { enName: 'equal', cnName: '等于' },
                                                                        { enName: 'ne', cnName: '不等于' },
                                                                        { enName: 'contain', cnName: '包含' },
                                                                        { enName: 'nc', cnName: '不包含' },
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
                                <a-col :span="4" style="text-align: center;" v-if="simpleItem.fieldUser !=='field' && simpleItem.fieldUser !=='custom' && simpleItem.fieldUser !== 'notSet'">
                                  <a-select size="small" v-model="simpleItem.include">
                                    <a-select-option value="bl">属于</a-select-option>
                                    <a-select-option value="nbl">不属于</a-select-option>
                                  </a-select>
                                </a-col>
                                <a-col :span="14" style="border: 1px solid #E8E8E8; margin-bottom: 4px" v-if="simpleItem.fieldUser !=='custom' && simpleItem.fieldUser !== 'notSet'">
                                  <a-row type="flex" align="middle">
                                    <a-col :span="20">
                                      <a-row
                                        v-for="(includeItem, includeIndex) in simpleItem.condition"
                                        :key="includeIndex"
                                        type="flex"
                                        align="middle"
                                        :gutter="10"
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
                                            <!-- 标签 -->
                                            <a-cascader
                                              size="small"
                                              v-else-if="simpleItem.formtype === 'tag'"
                                              v-model="includeItem.value"
                                              style="width: 100%"
                                              :options="tagOption"
                                              placeholder="请选择"
                                            />
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
                                              v-else
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
                                        <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.fieldUser ==='currentUser'">
                                          <a-row type="flex" align="middle">
                                            <a-col :span="23">
                                              <a-select
                                                size="small"
                                                mode="multiple"
                                                allowClear
                                                placeholder="请选择"
                                                @change="(value) => {includeItem.value = value}"
                                                :showSearch="false"
                                                :open="false"
                                                v-model="includeItem.value"
                                                changeOnSelect
                                              >
                                                <a-select-option v-for="(userItem, userKey) in includeItem.userArr" :key="userKey" :value="userItem.username">
                                                  {{ userItem.username }}
                                                </a-select-option>
                                              </a-select>
                                            </a-col>
                                            <a-col :span="1"><a-button
                                              style="margin-left: -1px"
                                              size="small"
                                              icon="user"
                                              @click="()=>{
                                                recordKey.index = index
                                                recordKey.simpleIndex = simpleIndex
                                                recordKey.includeIndex = includeIndex
                                                recordKey.type = 'user'
                                                $refs.selectUserForm.show({
                                                  fieldid: '',
                                                  selectValue: includeItem.value,
                                                  mode: 'multiple',
                                                })
                                              }"/></a-col>
                                          </a-row>
                                        </a-col>
                                        <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.fieldUser ==='currentClass'">
                                          <a-row type="flex" align="middle">
                                            <a-col :span="23">
                                              <a-select
                                                size="small"
                                                allowClear
                                                :open="false"
                                                mode="multiple"
                                                placeholder="请选择部门"
                                                @change="(value) => {includeItem.value = value}"
                                                v-model="includeItem.value"
                                                :showSearch="false"
                                                changeOnSelect
                                              >
                                                <a-select-option v-for="(depItem, depKey) in includeItem.department" :key="depKey" :value="depItem.departmentid">
                                                  {{ depItem.name }}
                                                </a-select-option>
                                              </a-select>
                                            </a-col>
                                            <a-col :span="1"><a-button
                                              style="margin-left: -1px"
                                              size="small"
                                              icon="apartment"
                                              @click="()=>{
                                                recordKey.index = index
                                                recordKey.simpleIndex = simpleIndex
                                                recordKey.includeIndex = includeIndex
                                                recordKey.type = 'department'
                                                $refs.selectDepartment.show({
                                                  optionCustom: [],
                                                  option: includeItem.department || [],
                                                  optionType: 'department',
                                                  selectValue: includeItem.value,
                                                  mode: 'multiple',
                                                  index: index,
                                                  url: '/admin/Department/getDepartmentUser'
                                                })
                                              }"/></a-col>
                                          </a-row>
                                        </a-col>
                                        <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.fieldUser ==='currentRole'">
                                          <a-row type="flex" align="middle">
                                            <a-col :span="23">
                                              <a-select
                                                allowClear
                                                :open="false"
                                                size="small"
                                                placeholder="请选择角色"
                                                v-model="includeItem.value"
                                                mode="multiple"
                                                changeOnSelect
                                                @change="(value) => {includeItem.value = value}">
                                                <a-select-option v-for="(value, key) in includeItem.role" :key="key" :value="value.roleid">{{ value.name }}</a-select-option>
                                              </a-select>
                                            </a-col>
                                            <a-col :span="1">
                                              <a-button
                                                style="margin-left: -1px"
                                                size="small"
                                                icon="team"
                                                @click="()=>{
                                                  recordKey.index = index
                                                  recordKey.simpleIndex = simpleIndex
                                                  recordKey.includeIndex = includeIndex
                                                  recordKey.type = 'role'
                                                  $refs.selectDepartment.show({
                                                    optionCustom: [],
                                                    option: includeItem.role || [],
                                                    optionType: 'role',
                                                    selectValue: includeItem.value,
                                                    mode: 'multiple',
                                                    index: index,
                                                    url: '/admin/Role/getRoleData'
                                                  })
                                                }"/></a-col>
                                          </a-row>
                                        </a-col>
                                        <a-col flex="70px" style="display: flex; align-items: center">
                                          <a-icon :style="{ fontSize: '24px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.fieldUser === 'field' ? simpleItem.condition.splice(includeIndex + 1, 0, {include: '',value: undefined}) : simpleItem.condition.splice(includeIndex +1, 0, {include: '',value: []})" />
                                          <a-icon :style="{ fontSize: '24px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }" type="minus-square" theme="filled" @click="deleteCondition(index, simpleIndex, includeIndex)" />
                                        </a-col>
                                      </a-row>
                                    </a-col>
                                    <a-col :span="4">
                                      <a-select v-model="simpleItem.logic" style="width: 100%" size="small">
                                        <a-select-option value="and">且(and)</a-select-option>
                                        <a-select-option value="or">或(or)</a-select-option>
                                      </a-select>
                                    </a-col>
                                  </a-row>
                                </a-col>
                                <a-col flex="80px" style="display: flex; align-items: center; justify-content: center; padding-right: 0px">
                                  <a-icon
                                    :style="{ fontSize: '24px', color: '#52c41a'}"
                                    type="plus-square"
                                    theme="filled"
                                    @click="item.simpleCondition.splice(simpleIndex + 1, 0 , {
                                      fieldUser: 'field',
                                      selectUser: '',
                                      src: '',
                                      condition: [{
                                        include: '',
                                        value: ''
                                      }],
                                      logic: 'and'
                                    })" />
                                  <a-icon :style="{ fontSize: '24px', color: item.simpleCondition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }" type="minus-square" theme="filled" @click="item.simpleCondition.length === 1 ? '' : data[index].simpleCondition.splice(simpleIndex, 1)" />
                                </a-col>
                              </a-row>
                            </div>
                          </a-col>
                          <a-col flex="80px">
                            <a-select v-model="item.logic" style="width: 100%" size="small">
                              <a-select-option value="and">且(and)</a-select-option>
                              <a-select-option value="or">或(or)</a-select-option>
                            </a-select>
                          </a-col>
                        </a-row>
                      </a-form-item>
                      <a-form-item :wrapper-col="{ span : 24 }" v-for="(eventItem, key) in item.event" :key="key">
                        <a-row type="flex" align="middle" :gutter="10">
                          <a-col :span="1">
                            <span v-if="key === 0" style="font-weight: bold">那么</span>
                          </a-col>
                          <a-col :span="8">
                            <a-row :gutter="10">
                              <a-col :span="12">
                                <a-select
                                  size="small"
                                  show-search
                                  optionFilterProp="children"
                                  :allowClear="true"
                                  placeholder="请选择字段"
                                  v-model="eventItem.field"
                                  @change="(val) => { choiceField(index, key, 'so', val) }" >
                                  <a-select-option
                                    v-for="(fieldItem, fieldIndex) in fieldsarr"
                                    :key="fieldIndex"
                                    :value="fieldItem.alias" >
                                    {{ fieldItem.name }}
                                  </a-select-option>
                                </a-select>
                              </a-col>
                              <a-col :span="12">
                                <a-select
                                  size="small"
                                  :defaultValue="eventItem.mandatory ? eventItem.status + '_' + eventItem.mandatory : eventItem.status"
                                  @change="(e) => {
                                    eventItem.status = e.split('_')[0]
                                    eventItem.mandatory = e.split('_')[1]
                                    if(e === 'change_title'){
                                      eventItem.titleField = true
                                    }else{
                                      eventItem.titleField = false
                                    }
                                    eventItem.changeValue = ''
                                  }"
                                >
                                  <a-select-option value="allow_true">允许必填</a-select-option>
                                  <a-select-option value="allow_false">允许不必填</a-select-option>
                                  <a-select-option value="readonly_true">只读必填</a-select-option>
                                  <a-select-option value="readonly_false" >只读不必填</a-select-option>
                                  <a-select-option value="hidden">隐藏</a-select-option>
                                  <a-select-option value="change_title" >修改字段标题</a-select-option>
                                  <a-select-option value="changeValue">修改字段值</a-select-option>
                                </a-select>
                              </a-col>
                            </a-row>
                          </a-col>
                          <a-col :span="4" v-if="eventItem.titleField">
                            <a-input size="small" v-model="eventItem.change_title"/>
                          </a-col>
                          <a-col :span="4" v-if="eventItem.status === 'changeValue'">
                            <a-input size="small" v-model="eventItem.changeValue"/>
                          </a-col>
                          <a-col flex="70px" style="display: flex; align-items: center; justify-content: center">
                            <a-icon :style="{ fontSize: '24px', color: '#52c41a' }" type="plus-square" theme="filled" @click="item.event.splice(key + 1, 0 ,{field: '',status: '', mandatory: ''})" />
                            <a-icon :style="{ fontSize: '24px', color: item.event.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }" type="minus-square" theme="filled" @click="deleteEvent (index, key)" />
                          </a-col>
                        </a-row>
                      </a-form-item>
                    </a-card>
                    <a-icon :style="{ fontSize: '24px', color: '#52c41a', 'padding-left':'10px' }" type="plus-square" theme="filled" @click="addData(index, 'true')" />
                    <a-icon :style="{ fontSize: '24px', color: '#ff4d4f', 'padding-left':'10px' }" type="minus-square" theme="filled" @click="handleDelete(index)" />
                  </div>
                  <div v-show="data.length === 0">
                    <a-empty />
                  </div>
                </a-form>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="表单加载后脚本" force-render style="height: calc(100vh - 175px)">
              <editor ref="editorinit" :params="mydatainit"/>
            </a-tab-pane>
            <a-tab-pane key="3" tab="表单提交前脚本" force-render style="height: calc(100vh - 175px)">
              <editor ref="editor" :params="mydata" />
            </a-tab-pane>
          </a-tabs>
          <a-form :form="form" style="margin-bottom: 35px" v-else>
            <div
              v-for="(item,index) in data"
              :key="index"
            >
              <a-card
                style="margin-bottom: 10px;"
                :headStyle="{ height: '10px' }"
                :bordered="config.page === 'dataForm' ? false : true"
              >
                <a-alert message="满足以下条件时，当前内容被启用" type="info" show-icon size="small" v-if="config.page === 'dataForm'"/>
                <a-button
                  style="margin-top: 8px"
                  @click="item.simpleCondition.push({
                    fieldUser: 'field',
                    selectUser: '',
                    src: '',
                    condition: [{
                      include: '',
                      value: ''
                    }],
                    logic: 'and'
                  })">添加</a-button>
                <a-form-item>
                  <span v-if="item.simpleCondition.length > 0">
                    <span>以下组合方式</span>
                    <a-select v-model="item.logic" style="width: 100px; padding-left: 10px;" size="small">
                      <a-select-option value="and">且(and)</a-select-option>
                      <a-select-option value="or">或(or)</a-select-option>
                    </a-select>
                  </span>
                  <div style="width: 100%;" v-if="item.simpleCondition.length > 0">
                    <a-row v-for="(simpleItem, simpleIndex) in item.simpleCondition" :key="simpleIndex" type="flex" align="middle" :gutter="8">
                      <a-col flex="auto">
                        <a-select
                          size="small"
                          v-model="simpleItem.fieldUser"
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
                          <a-select-option value="notSet">无条件满足</a-select-option>
                          <a-select-option value="field">字段</a-select-option>
                          <a-select-option value="currentUser">当前用户</a-select-option>
                          <a-select-option value="currentClass">当前用户所属部门</a-select-option>
                          <a-select-option value="currentRole">当前用户所属角色</a-select-option>
                          <a-select-option value="custom">自定义</a-select-option>
                        </a-select>
                      </a-col>
                      <a-col flex="auto" v-if="simpleItem.fieldUser === 'custom'">
                        <a-row type="flex" align="middle">
                          <a-col :span="24"><querier-codemirror-input ref="querierCodemirrorInput" :params.sync="item.condition" /></a-col>
                          <div style="position:absolute; right: 15px; cursor: pointer; z-index: 10" size="small" @click="handleCodemirror(item, index)">fx</div>
                        </a-row>
                      </a-col>
                      <a-col flex="auto" v-if="simpleItem.fieldUser === 'notSet'"></a-col>
                      <a-col :span="4" v-if="simpleItem.fieldUser ==='field'">
                        <a-select
                          size="small"
                          show-search
                          :allowClear="true"
                          option-filter-prop="children"
                          v-if="simpleItem.fieldUser === 'field'"
                          v-model="simpleItem.field"
                          @change="(value) => {
                            simpleItem.condition = [ {
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
                                if (['text', 'textarea','serialnumber'].indexOf(item1.formtype) !== -1) {
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
                                } else if (['associated'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.conditionArr = [{ enName: 'equal', cnName: '等于' },
                                                             { enName: 'ne', cnName: '不等于' },
                                                             { enName: 'contain', cnName: '包含' },
                                                             { enName: 'nc', cnName: '不包含' },
                                                             { enName: 'bw', cnName: '开始于' },
                                                             { enName: 'ew', cnName: '结束于' },
                                                             { enName: 'em', cnName: '为空' },
                                                             { enName: 'nem', cnName: '不为空' }]
                                }else if (['address','treeselect', 'tag'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.conditionArr = [ { enName: 'contain', cnName: '包含' },
                                                              { enName: 'nc', cnName: '不包含' },
                                                              { enName: 'em', cnName: '为空' },
                                                              { enName: 'nem', cnName: '不为空' }]
                                }else if (['cascader'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.conditionArr = [ { enName: 'equal', cnName: '等于' },
                                                              { enName: 'ne', cnName: '不等于' },
                                                              { enName: 'contain', cnName: '包含' },
                                                              { enName: 'nc', cnName: '不包含' },
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
                      <a-col :span="4" v-if="simpleItem.fieldUser !=='field' && simpleItem.fieldUser !=='custom' && simpleItem.fieldUser !== 'notSet'">
                        <a-select size="small" v-model="simpleItem.include">
                          <a-select-option value="bl">属于</a-select-option>
                          <a-select-option value="nbl">不属于</a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :span="12" v-if="simpleItem.fieldUser !=='custom' && simpleItem.fieldUser !== 'notSet'">
                        <a-row v-for="(includeItem, includeIndex) in simpleItem.condition" :key="includeIndex" type="flex" align="middle" :gutter="8">
                          <a-col :span="6" v-if="simpleItem.fieldUser ==='field'">
                            <a-select
                              size="small"
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
                          <a-col :span="15" v-if="simpleItem.fieldUser ==='field'">
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
                              <div v-else-if="simpleItem.formtype === 'address'">
                                <address-select size="small" :series="simpleItem.form.show_series" @send="(display, val) =>{ includeItem.value = val }"/>
                              </div>
                              <!-- 标签 -->
                              <a-cascader
                                v-else-if="simpleItem.formtype === 'tag'"
                                v-model="includeItem.value"
                                style="width: 100%"
                                :options="tagOption"
                                placeholder="请选择"
                              />
                              <a-input size="small" v-model="includeItem.value" v-else-if="!simpleItem.src" />
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
                              <a-cascader
                                size="small"
                                v-else
                                :options="simpleItem.option"
                                change-on-select
                                placeholder="请选择"
                                :loadData="(selectedOptions)=>{loadDataCascader({ selectedOptions: selectedOptions, index, simpleIndex, src: simpleItem.src})}"
                                :defaultValue="includeItem.value ? includeItem.value : []"
                                @change="(value) => {
                                  includeItem.value = value
                                }"
                              />
                            </template>
                            <template v-else>
                              <a-input size="small" type="text" disabled />
                            </template>
                          </a-col>
                          <a-col :span="21" style="padding-right: 8px;" v-else-if="simpleItem.fieldUser ==='currentUser'">
                            <a-row type="flex" align="middle">
                              <a-col :span="23">
                                <a-select
                                  size="small"
                                  mode="multiple"
                                  allowClear
                                  :open="false"
                                  placeholder="请选择"
                                  @change="(value) => {includeItem.value = value}"
                                  :showSearch="false"
                                  v-model="includeItem.value"
                                  changeOnSelect
                                >
                                  <a-select-option v-for="(userItem, userKey) in includeItem.userArr" :key="userKey" :value="userItem.username">
                                    {{ userItem.username }}
                                  </a-select-option>
                                </a-select>
                              </a-col>
                              <a-col :span="1"><a-button
                                style="margin-left: -1px"
                                size="small"
                                icon="user"
                                @click="()=>{
                                  recordKey.index = index
                                  recordKey.simpleIndex = simpleIndex
                                  recordKey.includeIndex = includeIndex
                                  recordKey.type = 'user'
                                  $refs.selectUserForm.show({
                                    fieldid: '',
                                    selectValue: includeItem.value,
                                    mode: 'multiple',
                                  })
                                }"/></a-col>
                            </a-row>
                          </a-col>
                          <a-col :span="21" style="padding-right: 8px;" v-else-if="simpleItem.fieldUser ==='currentClass'">
                            <a-row type="flex" align="middle">
                              <a-col :span="23">
                                <a-select
                                  size="small"
                                  allowClear
                                  mode="multiple"
                                  :open="false"
                                  placeholder="请选择部门"
                                  @change="(value) => {includeItem.value = value}"
                                  v-model="includeItem.value"
                                  :showSearch="false"
                                  changeOnSelect
                                >
                                  <a-select-option v-for="(depItem, depKey) in includeItem.department" :key="depKey" :value="depItem.departmentid">
                                    {{ depItem.name }}
                                  </a-select-option>
                                </a-select>
                              </a-col>
                              <a-col :span="1"><a-button
                                style="margin-left: -1px"
                                size="small"
                                icon="apartment"
                                @click="()=>{
                                  recordKey.index = index
                                  recordKey.simpleIndex = simpleIndex
                                  recordKey.includeIndex = includeIndex
                                  recordKey.type = 'department'
                                  $refs.selectDepartment.show({
                                    optionCustom: [],
                                    option: includeItem.department || [],
                                    optionType: 'department',
                                    selectValue: includeItem.value,
                                    mode: 'multiple',
                                    index: index,
                                    url: '/admin/Department/getDepartmentUser'
                                  })
                                }"/></a-col>
                            </a-row>
                          </a-col>
                          <a-col :span="21" style="padding-right: 8px;" v-else-if="simpleItem.fieldUser ==='currentRole'">
                            <a-row type="flex" align="middle">
                              <a-col :span="23">
                                <a-select
                                  size="small"
                                  allowClear
                                  :open="false"
                                  placeholder="请选择角色"
                                  v-model="includeItem.value"
                                  mode="multiple"
                                  changeOnSelect
                                  @change="(value) => {includeItem.value = value}">
                                  <a-select-option v-for="(value, key) in includeItem.role" :key="key" :value="value.roleid">{{ value.name }}</a-select-option>
                                </a-select>
                              </a-col>
                              <a-col :span="1">
                                <a-button
                                  style="margin-left: -1px"
                                  size="small"
                                  icon="team"
                                  @click="()=>{
                                    recordKey.index = index
                                    recordKey.simpleIndex = simpleIndex
                                    recordKey.includeIndex = includeIndex
                                    recordKey.type = 'role'
                                    $refs.selectDepartment.show({
                                      optionCustom: [],
                                      option: includeItem.role || [],
                                      optionType: 'role',
                                      selectValue: includeItem.value,
                                      mode: 'multiple',
                                      index: index,
                                      url: '/admin/Role/getRoleData'
                                    })
                                  }"/></a-col>
                            </a-row>
                          </a-col>
                          <a-col flex="65px" style="display: flex; align-items: center; justify-content: center">
                            <a-icon :style="{ fontSize: '24px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.fieldUser === 'field' ? simpleItem.condition.splice(includeIndex + 1, 0 ,{include: '',value: undefined}) : simpleItem.condition.splice(includeIndex + 1, 0 ,{include: '',value: []})" />
                            <a-icon :style="{ fontSize: '24px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }" type="minus-square" theme="filled" @click="deleteCondition(index, simpleIndex, includeIndex)" />
                          </a-col>
                        </a-row>
                      </a-col>
                      <a-col flex="107px" v-if="simpleItem.fieldUser !=='custom' && simpleItem.fieldUser !== 'notSet'">
                        <a-select v-model="simpleItem.logic" style="width: 100%" size="small">
                          <a-select-option value="and">且(and)</a-select-option>
                          <a-select-option value="or">或(or)</a-select-option>
                        </a-select>
                      </a-col>
                      <a-col flex="70px" style="display: flex; align-items: center">
                        <a-icon
                          :style="{ fontSize: '24px', color: '#52c41a'}"
                          type="plus-square"
                          theme="filled"
                          @click="item.simpleCondition.splice(simpleIndex + 1, 0, {
                            fieldUser: 'field',
                            selectUser: '',
                            src: '',
                            condition: [{
                              include: '',
                              value: ''
                            }],
                            logic: 'and'
                          })" />
                        <a-icon :style="{ fontSize: '24px', color: '#ff4d4f', 'padding-left': '8px' }" type="minus-square" theme="filled" @click="deleteSimpleCondition(index, simpleIndex)" />
                      </a-col>
                      <a-divider v-if="item.simpleCondition.length !== 1"></a-divider>
                    </a-row>
                  </div>
                  <div v-show="item.simpleCondition.length === 0">
                    <a-empty />
                  </div>
                </a-form-item>
              </a-card>
            </div>
          </a-form>
          <QuerierCodemirror ref="querierCodemirror" :params.sync="data" />
        </div>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
      <select-user-form ref="selectUserForm" @ok="getUser"/>
      <select-department ref="selectDepartment" @ok="getDepartment"/>
    </a-drawer>
  </div>
</template>
<script>
export default {
  name: 'QuerierFormRule',
  components: {
    QuerierCodemirror: () => import('./QuerierCodemirror'),
    Editor: () => import('@/views/admin/Formula/Editor'),
    QuerierCodemirrorInput: () => import('./QuerierCodemirrorInput'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm'),
    SelectDepartment: () => import('@/views/admin/UserTable/SelectDepartment')
  },
  data () {
    return {
      config: {},
      recordIndex: 0,
      record: {},
      recordKey: {},
      visible: false,
      labelCol: { span: 3 },
      wrapperCol: { span: 4 },
      tableid: '',
      form: this.$form.createForm(this),
      fieldsarr: [],
      mydatainit: {},
      mydata: {},
      tagOption: [],
      data: [{
        ruleModel: '0',
        logic: 'and',
        condition: {
          html: '',
          value: ''
        },
        simpleCondition: [{
          fieldUser: 'field',
          field: '',
          src: '',
          conditionArr: [],
          condition: [{
            include: '',
            value: ''
          }],
          logic: 'and'
        } ],
        event: [{
          field: '',
          status: '',
          mandatory: ''
        } ]
      } ],
      initData: [{
        ruleModel: '0',
        logic: 'and',
        condition: {
          html: '',
          value: ''
        },
        simpleCondition: [],
        event: [{
          field: '',
          status: '',
          mandatory: ''
        } ]
      }],
      department: [],
      role: [],
      userArr: [],
      fieldArr: [] // 所有字段的所有信息,用来获取数据字典
    }
  },
  inject: {
    theme: {
      default: () => ({})
    }
  },
  methods: {
    show (config) {
      this.mydatainit.value = config.valueinit
      this.mydata.value = config.value
      this.config = config
      if (this.theme && this.theme.viewData) {
        var formViewData = JSON.parse(JSON.stringify(this.theme.viewData))
        this.tableid = formViewData.tableid || formViewData.data.value
      } else {
        this.tableid = config.tableid
      }
      if (config.page === 'viewForm') {
        if (formViewData.setting.field_rule) {
          this.data = formViewData.setting.field_rule.length !== 0 ? formViewData.setting.field_rule : []
        } else {
          this.data = []
        }
      } else if (config.page === 'dataForm') {
        this.recordIndex = config.index
        this.record = config.record
        if (config.record.formCondition) {
          if (config.record.formCondition.length !== 0) {
            this.data = config.record.formCondition !== 0 ? JSON.parse(JSON.stringify(config.record.formCondition)) : JSON.parse(JSON.stringify(this.initData))
          } else {
            this.data = JSON.parse(JSON.stringify(this.initData))
          }
        } else {
          this.data = JSON.parse(JSON.stringify(this.initData))
        }
      }
      this.data.forEach(item => {
        if (item.simpleCondition.some(conItem => conItem.fieldUser === 'tag')) {
          this.getTagOption()
        }
        item.simpleCondition.forEach(item1 => {
          item1.condition.forEach(item2 => {
            if (item2.type === 'empty') {
              item2.include = item2.include === 'equal' ? 'em' : 'nem'
            }
          })
        })
      })
      this.visible = true
      // 请求某个表单的所有字段
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
        this.fieldsarr = res.result.data
        this.fieldArr = res.result.data.filter(item => {
          return ['text', 'textarea', 'radio', 'checkbox', 'combobox', 'number', 'datetime', 'cascader', 'associated', 'address', 'treeselect', 'serialnumber', 'tag'].indexOf(item.formtype) !== -1
        })
        // 遍历规则
        if (this.data.length !== 0) {
          this.data.forEach((dataItem, dataIndex) => {
            dataItem.simpleCondition.forEach((simpleItem, simpleIndex) => {
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
                    if (['text', 'textarea', 'serialnumber'].indexOf(fieldItem.formtype) !== -1) {
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
                    } else if (['address', 'treeselect', 'tag'].indexOf(fieldItem.formtype) !== -1) {
                      simpleItem.conditionArr = [
                        { enName: 'contain', cnName: '包含' },
                        { enName: 'nc', cnName: '不包含' },
                        { enName: 'em', cnName: '为空' },
                        { enName: 'nem', cnName: '不为空' }]
                    } else if (['cascader'].indexOf(fieldItem.formtype) !== -1) {
                      simpleItem.conditionArr = [
                        { enName: 'equal', cnName: '等于' },
                        { enName: 'ne', cnName: '不等于' },
                        { enName: 'contain', cnName: '包含' },
                        { enName: 'nc', cnName: '不包含' },
                        { enName: 'em', cnName: '为空' },
                        { enName: 'nem', cnName: '不为空' }]
                    }
                  }
                })
              }
            })
          })
        }
      })
    },
    // 选择字段
    choiceField (index, key, template, val) {
      if (template === 'so') {
        var arr = this.data[index]
        arr.event[key].field = val
        arr.event[key].formtype = this.fieldsarr.find(item => item.alias === val).formtype
        this.data.splice(index, 1, arr)
        this.data.forEach((item, index) => {
          item.event.forEach(myItem => {
            this.fieldsarr.filter((fieldItem, fieldIndex) => {
              if (fieldItem.alias === myItem.field) {
                myItem.name = fieldItem.name
              }
            })
          })
        })
      } else {
        var obj = this.data[index].simpleCondition[key]
        obj.selectUser = val
      }
    },
    // 选择关系
    choiceInclude (value, includeItem) {
      includeItem.value = undefined
      if (value === 'em' || value === 'nem') {
        includeItem.type = 'empty'
      } else {
        includeItem.type = undefined
      }
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
    deleteCondition (index, simpleIndex, includeIndex) {
      if (this.data[index].simpleCondition[simpleIndex].condition.length === 1) {
        return false
      } else {
        this.data[index].simpleCondition[simpleIndex].condition.splice(includeIndex, 1)
        this.data = JSON.parse(JSON.stringify(this.data))
      }
    },
    deleteSimpleCondition (index, simpleIndex) {
      this.data[index].simpleCondition.splice(simpleIndex, 1)
      this.data = JSON.parse(JSON.stringify(this.data))
    },
    deleteEvent (index, key) {
      if (this.data[index].event.length === 1) {
        return false
      } else {
        var arr = this.data[index]
        arr.event.splice(key, 1)
        this.data.splice(index, 1, arr)
      }
    },
    getUser (data, index, conIndex, modeCheck) {
      this.data[this.recordKey.index].simpleCondition[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['userArr'] = data.map(item => { const obj = { username: item, text: item }; return obj })
      this.data[this.recordKey.index].simpleCondition[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
    },
    getDepartment (data, index, conIndex, option) {
      if (this.recordKey.type === 'role') {
        this.data[this.recordKey.index].simpleCondition[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['role'] = option
        this.data[this.recordKey.index].simpleCondition[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
      } else {
        this.data[this.recordKey.index].simpleCondition[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['department'] = option
        this.data[this.recordKey.index].simpleCondition[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
      }
    },
    addData (index, type) {
      var arr = {
        ruleModel: '0',
        logic: 'and',
        condition: {
          html: '',
          value: ''
        },
        simpleCondition: [{
          fieldUser: 'field',
          selectUser: '',
          src: '',
          condition: [{
            include: '',
            value: ''
          }],
          logic: 'and'
        }],
        event: [{
          field: '',
          status: '',
          mandatory: ''
        } ]
      }
      if (type) {
        this.data.splice(index + 1, 0, arr)
      } else {
        this.data.push(arr)
      }
    },
    handleDelete (index) {
      this.data.splice(index, 1)
    },
    // 提交数据
    handleSubmit () {
      if (this.config.page === 'viewForm') {
        let valueinit = this.$refs.editorinit.getValue()
        valueinit = valueinit.replace(/ +/g, '')
        valueinit = valueinit.replace(/[\r\n]/g, '')
        if (valueinit) {
          this.$emit('func', this.$refs.editorinit.getValue(), 'init')
        } else {
          valueinit = ''
          this.$emit('func', valueinit, 'init')
        }
        let value = this.$refs.editor.getValue()
        value = value.replace(/ +/g, '')
        value = value.replace(/[\r\n]/g, '')
        if (this.$refs.editor.getValue()) {
          this.$emit('func', this.$refs.editor.getValue(), 'verif')
        } else {
          value = ''
          this.$emit('func', value, 'verif')
        }
      }
      const data = JSON.parse(JSON.stringify(this.data))
      data.forEach(item => {
        item.simpleCondition.forEach(item1 => {
          item1.condition.forEach(item2 => {
            if (item2.type === 'empty') {
              item2.include = item2.include === 'em' ? 'equal' : 'ne'
            }
          })
        })
      })
      if (this.config.page === 'viewForm') {
        this.theme.viewData.setting.field_rule = data
      } else if (this.config.page === 'dataForm') {
        if (data[0]) {
          data[0].simpleCondition = data[0].simpleCondition.filter(item => item.fieldUser !== 'notSet')
        }
        this.$emit('ok', this.recordIndex, data)
      }
      this.visible = false
    },
    // 显示公式编辑器
    handleCodemirror (item, index) {
      this.$refs.querierCodemirror.show({
        title: '公式编辑器',
        item: item,
        index: index,
        tableid: this.tableid
      })
    },
    getOption (item) {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: item.src }
      }).then(res => {
        this.$set(item, 'option', res.result)
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
    getTreeOption (simpleItem, item) {
      this.axios({
        url: 'admin/UserTable/getFieldForm',
        params: { fieldid: item.fieldid, value: simpleItem.value }
      }).then(res => {
        this.$set(simpleItem, 'option', res.result.data.option)
      })
    },
    // 加载级联菜单
    loadDataCascader (parameter) {
      const { selectedOptions } = parameter
      const targetOption = selectedOptions[selectedOptions.length - 1]
      const index = parameter.index
      const simpleIndex = parameter.simpleIndex
      const that = this
      targetOption.loading = true
      this.axios({
        url: '/admin/dict/getCascaderData',
        params: { parentNumber: targetOption.value, src: parameter.src }
      }).then(res => {
        targetOption.loading = false
        targetOption.children = res.result
        that.data[index].simpleCondition[simpleIndex].option = [...that.data[index].simpleCondition[simpleIndex].option]
        that.data = JSON.parse(JSON.stringify(that.data))
      })
    },
    // 关闭抽屉
    onClose () {
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
.card-box {
  display:flex;
  justify-content: center;
  align-items: center;
}
</style>
