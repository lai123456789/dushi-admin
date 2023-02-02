<template>
  <div>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button v-action:add icon="plus" @click="handleAdd">添加</a-button>
      </div>
      <a-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :dataSource="sla_data"
        :pagination="false"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record, index">
          <a @click="handleEdit(record, index)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="您确定要删除该记录吗?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(index)"
          >
            <a>删除</a>
          </a-popconfirm>
        </div>
        <div slot="sort" slot-scope="text, record, index">
          <span>{{ index + 1 }}</span>
        </div>
        <div slot="execution_time" slot-scope="text">
          <span v-if="text === 'flowtime_come'">{{ workflowtype === 'work' ? '流程' : '变迁' }}时限到达时</span>
          <span v-else-if="text === 'flowtime_before'">{{ workflowtype === 'work' ? '流程' : '变迁' }}时限到达前</span>
          <span v-else-if="text === 'flowtime_after'">{{ workflowtype === 'work' ? '流程' : '变迁' }}时限到达后</span>
          <span v-else-if="text === 'flowwarn_come'">{{ workflowtype === 'work' ? '流程' : '变迁' }}预警时</span>
          <span v-else-if="text === 'flowserious_come'">{{ workflowtype === 'work' ? '流程' : '变迁' }}超时时</span>
          <span v-else-if="text === 'flowurge_times'">{{ workflowtype === 'work' ? '流程' : '变迁' }}催办次数</span>
          <span v-else-if="text === 'flowcome_start'">变迁启动后</span>
        </div>
        <div slot="runaction" slot-scope="text,record">
          <span>{{ record.custom_jump === '1' ?'自定义跳转':'' }} {{ record.auto_handle === '1'?'自动办理':'' }} {{ record.send_notice === '1' ? '发送通知':'' }} {{ record.custom_handle === '1'?'自定义动作':'' }}</span>
        </div>
      </a-table>
    </a-card>
    <a-drawer
      :destroyOnClose="true"
      :title="config.title"
      :width="1200"
      :visible="visible"
      @close="visible=!visible" >
      <a-spin :spinning="loading">
        <div>
          <a-form :form="form">
            <a-form-item label="SLA名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[name]', {initialValue: config.data && config.data.name ? config.data.name : '', rules: [{ required: true, message: '请输入SLA名称'}]}]" />
            </a-form-item>
            <a-form-item label="SLA描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :auto-size="{ minRows: 3, maxRows: 5 }" v-decorator="['info[describe]', { initialValue: config.data && config.data.describe ? config.data.describe : '' }]"/>
            </a-form-item>
            <a-form-item label="执行时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-row :gutter="10">
                <a-col :span="6">
                  <a-select
                    @change="(e)=>{ $set(config.data, 'execution_time' ,e) }"
                    v-decorator="['info[execution_time]', {initialValue: config.data && config.data.execution_time ? config.data.execution_time : '', rules: [{ required: true, message: '请选择执行时机'}]}]">
                    <a-select-option value="flowtime_come">{{ workflowtype === 'work' ? '流程' : '变迁' }}时限到达时</a-select-option>
                    <a-select-option value="flowtime_before">{{ workflowtype === 'work' ? '流程' : '变迁' }}时限到达前</a-select-option>
                    <a-select-option value="flowtime_after">{{ workflowtype === 'work' ? '流程' : '变迁' }}时限到达后</a-select-option>
                    <a-select-option value="flowwarn_come">{{ workflowtype === 'work' ? '流程' : '变迁' }}预警时</a-select-option>
                    <a-select-option value="flowserious_come">{{ workflowtype === 'work' ? '流程' : '变迁' }}超时时</a-select-option>
                    <a-select-option value="flowurge_times">{{ workflowtype === 'work' ? '流程' : '变迁' }}催办次数</a-select-option>
                    <a-select-option value="flowcome_start" v-if="workflowtype === 'flow'">变迁启动后</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="18">
                  <div v-if="config.data && config.data.execution_time === 'flowtime_before'">
                    <a-input-number :min="0" v-model="execution_time_setting.flowtime_before_day" />
                    <span style="padding: 0 5px 0 5px">天</span>
                    <a-input-number :min="0" :max="23" v-model="execution_time_setting.flowtime_before_hour" />
                    <span style="padding: 0 5px 0 5px">小时</span>
                    <a-input-number :min="0" :max="59" v-model="execution_time_setting.flowtime_before_minute" />
                    <span style="padding-left: 5px">分钟</span>
                  </div>
                  <div v-if="config.data && config.data.execution_time === 'flowtime_after'">
                    <a-input-number :min="0" v-model="execution_time_setting.flowtime_after_day" />
                    <span style="padding: 0 5px 0 5px">天</span>
                    <a-input-number :min="0" :max="23" v-model="execution_time_setting.flowtime_after_hour" />
                    <span style="padding: 0 5px 0 5px">小时</span>
                    <a-input-number :min="0" :max="59" v-model="execution_time_setting.flowtime_after_minute" />
                    <span style="padding-left: 5px">分钟</span>
                  </div>
                  <div v-if="config.data && config.data.execution_time === 'flowurge_times'">
                    <a-row :gutter="10">
                      <a-col :span="4">
                        <a-select v-model="execution_time_setting.urge_symbol">
                          <a-select-option value="eq">等于</a-select-option>
                          <a-select-option value="ge">大于等于</a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :span="12"><a-input-number :min="0" v-model="execution_time_setting.urge_times" /></a-col>
                    </a-row>
                  </div>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="执行条件" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-card>
                <a-row type="flex" align="middle">
                  <a-col :span="22">
                    <a-row
                      v-for="(simpleItem, simpleIndex) in condition_visual"
                      :key="simpleIndex"
                      type="flex"
                      align="middle"
                      :gutter="10"
                      style="padding: 5px 0">
                      <a-col :span="4">
                        <a-select
                          v-model="simpleItem.type"
                          size="small"
                          @change="(value) => {
                            if (value === 'field') {
                              simpleItem.condition = [ {
                                include: '',
                                value: ''
                              }]
                            } else if(value === 'currentUser' || value === 'currentClass' || value === 'currentRole') {
                              $set(simpleItem,'include','bl')
                              simpleItem.condition = [ {
                                include: '',
                                value: []
                              }]
                            }}">
                          <a-select-option value="notSet">无条件</a-select-option>
                          <a-select-option value="field">字段</a-select-option>
                          <a-select-option value="currentUser">创建人</a-select-option>
                          <a-select-option value="currentClass">创建人部门</a-select-option>
                          <a-select-option value="currentRole">创建人角色</a-select-option>
                          <a-select-option value="urgeTimes">{{ workflowtype === 'work' ? '流程' : '变迁' }}催办次数</a-select-option>
                          <a-select-option value="transitionFrom" v-if="workflowtype === 'flow'">来自于变迁</a-select-option>
                          <a-select-option value="custom">自定义</a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :span="18" v-if="simpleItem.type === 'custom'">
                        <a-row type="flex" align="middle">
                          <a-col :span="24"><querier-codemirror-input ref="querierCodemirrorInput" :params.sync="simpleItem.customCode" /></a-col>
                          <div
                            style="position:absolute; right: 15px; cursor: pointer; z-index: 10"
                            size="small"
                            @click="$refs['customCodemirrors'+simpleIndex][0].show({
                              title: '公式编辑器',
                              item: simpleItem,
                              tableid: condition.tableid,
                            })">fx</div>
                          <custom-codemirror :ref="'customCodemirrors' + simpleIndex" @ok="(val) =>{ $set(simpleItem, 'customCode', val) }"/>
                        </a-row>
                      </a-col>
                      <a-col :span="18" v-if="simpleItem.type === 'notSet'"></a-col>
                      <a-col :span="18" v-if="simpleItem.type === 'urgeTimes' || simpleItem.type === 'transitionFrom'">
                        <div v-if="simpleItem.type === 'transitionFrom'">
                          <a-row type="flex" align="middle">
                            <a-col flex="auto">
                              <a-row :gutter="[8,8]" type="flex" align="middle" v-for="(includeItem, includeIndex) in simpleItem.condition" :key="includeIndex">
                                <a-col :span="12">
                                  <a-select style="width: 100%" placeholder="请选择变迁" v-model="includeItem.transitionFromVal" size="small" @change="(e)=>{ includeItem.transitionFromWay = undefined; for(const i in allWayData){if(i.includes(e)){ includeItem.showWay =allWayData[i]}}}">
                                    <a-select-option v-for="value in transition" :key="value.transition_id" :value="value.transition_id">{{ value.transition_name }}</a-select-option>
                                  </a-select>
                                </a-col>
                                <a-col flex="70px">办理方式 : </a-col>
                                <a-col flex="auto">
                                  <a-select
                                    style="width: 100%"
                                    allowClear
                                    placeholder="请选择办理方式"
                                    v-model="includeItem.transitionFromWay"
                                    @change="(e)=>{$forceUpdate()}"
                                    size="small">
                                    <a-select-option v-for="value in includeItem.showWay" :key="value.alias" :value="value.alias">{{ value.way }}</a-select-option>
                                  </a-select>
                                </a-col>
                                <a-col flex="70px" style="display: flex; align-items: center">
                                  <a-icon :style="{ fontSize: '24px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.type === 'field' ? simpleItem.condition.splice(includeIndex + 1, 0, {include: '',value: undefined}) : simpleItem.condition.splice(includeIndex +1, 0, {include: '',value: []})" />
                                  <a-icon :style="{ fontSize: '24px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '8px' }" type="minus-square" theme="filled" @click="simpleItem.condition.length === 1 ? '' : simpleItem.condition.splice(includeIndex, 1)"/>
                                </a-col>
                              </a-row>
                            </a-col>
                            <a-col flex="80px">
                              <a-select v-model="simpleItem.logic" style="width: 100%" size="small">
                                <a-select-option value="and">且(and)</a-select-option>
                                <a-select-option value="or">或(or)</a-select-option>
                              </a-select>
                            </a-col>
                          </a-row>
                        </div>
                        <div v-else-if="simpleItem.type === 'urgeTimes'">
                          <a-row :gutter="10">
                            <a-col :span="4">
                              <a-select size="small" v-model="simpleItem.urge_symbol">
                                <a-select-option value="eq">等于</a-select-option>
                                <a-select-option value="ge">大于等于</a-select-option>
                              </a-select>
                            </a-col>
                            <a-col :span="12"><a-input-number size="small" :min="0" v-model="simpleItem.urge_times"/></a-col>
                          </a-row>
                        </div>
                      </a-col>
                      <a-col :span="4" v-if="simpleItem.type ==='field' && simpleItem.type !== 'custom' && simpleItem.type !== 'notSet' && simpleItem.type !== 'urgeTimes' && simpleItem.type !== 'transitionFrom'">
                        <a-select
                          size="small"
                          show-search
                          :allowClear="true"
                          option-filter-prop="children"
                          v-if="simpleItem.type === 'field'"
                          v-model="simpleItem.alias"
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
                                } else if (item1.formtype === 'tag' && !tagOption.length){
                                  getTagOption()
                                  simpleItem.condition = [{
                                    include: '',
                                    value: []
                                  }]
                                }else if(item1.formtype === 'tag'){
                                  simpleItem.condition = [{
                                    include: '',
                                    value: []
                                  }]
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
                                  simpleItem.condiArr = [{ enName: 'equal', cnName: '等于' },
                                                         { enName: 'ne', cnName: '不等于' },
                                                         { enName: 'contain', cnName: '包含' },
                                                         { enName: 'nc', cnName: '不包含' },
                                                         { enName: 'bw', cnName: '开始于' },
                                                         { enName: 'ew', cnName: '结束于' },
                                                         { enName: 'em', cnName: '为空' },
                                                         { enName: 'nem', cnName: '不为空' }]
                                } else if (['radio', 'checkbox', 'combobox'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.condiArr = [{ enName: 'equal', cnName: '等于' },
                                                         { enName: 'ne', cnName: '不等于' },
                                                         { enName: 'em', cnName: '为空' },
                                                         { enName: 'nem', cnName: '不为空' }]
                                } else if (['number', 'datetime'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.condiArr = [{ enName: 'equal', cnName: '等于' },
                                                         { enName: 'ne', cnName: '不等于' },
                                                         { enName: 'great', cnName: '大于' },
                                                         { enName: 'ge', cnName: '大于等于' },
                                                         { enName: 'lt', cnName: '小于' },
                                                         { enName: 'le', cnName: '小于等于' },
                                                         { enName: 'em', cnName: '为空' },
                                                         { enName: 'nem', cnName: '不为空' }]
                                } else if (['cascader','address','treeselect','tag'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.condiArr = [{ enName: 'contain', cnName: '包含' },
                                                         { enName: 'nc', cnName: '不包含' },
                                                         { enName: 'em', cnName: '为空' },
                                                         { enName: 'nem', cnName: '不为空' }]
                                } else if (['associated'].indexOf(item1.formtype) !== -1) {
                                  simpleItem.condiArr = [{ enName: 'equal', cnName: '等于' },
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
                      <a-col :span="4" style="text-align: center;" v-if="simpleItem.type !=='field' && simpleItem.type !== 'custom' && simpleItem.type !== 'notSet' && simpleItem.type !== 'urgeTimes' && simpleItem.type !== 'transitionFrom'">
                        <a-select size="small" v-model="simpleItem.include">
                          <a-select-option value="bl">属于</a-select-option>
                          <a-select-option value="nbl">不属于</a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :span="14" style="border: 1px solid #E8E8E8; margin-bottom: 4px" v-if="simpleItem.type !== 'custom' && simpleItem.type !== 'notSet' && simpleItem.type !== 'urgeTimes' && simpleItem.type !== 'transitionFrom'">
                        <a-row type="flex" align="middle">
                          <a-col :span="20">
                            <a-row
                              v-for="(includeItem, includeIndex) in simpleItem.condition"
                              :key="includeIndex"
                              type="flex"
                              align="middle"
                              :gutter="10"
                              style="padding: 5px 0"
                            >
                              <a-col :span="6" v-if="simpleItem.type ==='field'">
                                <a-select
                                  size="small"
                                  :dropdownMatchSelectWidth="false"
                                  v-model="includeItem.include"
                                  @change="(value) => { choiceInclude(value, includeItem) }"
                                >
                                  <a-select-option
                                    option-filter-prop="children"
                                    v-for="(crItem, crIndex) in simpleItem.condiArr"
                                    :key="crIndex"
                                    :value="crItem.enName">{{ crItem.cnName }}</a-select-option>
                                </a-select>
                              </a-col>
                              <a-col :span="14" v-if="simpleItem.type ==='field'" >
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
                                  <div v-else>
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
                                </template>
                                <template v-else>
                                  <a-input type="text" disabled size="small" />
                                </template>
                              </a-col>
                              <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentUser'">
                                <a-row type="flex" align="middle">
                                  <a-col :span="23">
                                    <a-select
                                      size="small"
                                      allowClear
                                      mode="multiple"
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
                              <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentClass'">
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
                                      recordKey.simpleIndex = simpleIndex
                                      recordKey.includeIndex = includeIndex
                                      recordKey.type = 'department'
                                      $refs.selectDepartment.show({
                                        optionCustom: [],
                                        option: includeItem.department || [],
                                        optionType: 'department',
                                        selectValue: includeItem.value,
                                        mode: 'multiple',
                                        url: '/admin/Department/getDepartmentUser'
                                      })
                                    }"/></a-col>
                                </a-row>
                              </a-col>
                              <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentRole'">
                                <a-row type="flex" align="middle">
                                  <a-col :span="23">
                                    <a-select
                                      size="small"
                                      allowClear
                                      placeholder="请选择角色"
                                      :open="false"
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
                                        recordKey.simpleIndex = simpleIndex
                                        recordKey.includeIndex = includeIndex
                                        recordKey.type = 'role'
                                        $refs.selectDepartment.show({
                                          optionCustom: [],
                                          option: includeItem.role || [],
                                          optionType: 'role',
                                          selectValue: includeItem.value,
                                          mode: 'multiple',
                                          url: '/admin/Role/getRoleData'
                                        })
                                      }"/></a-col>
                                </a-row>
                              </a-col>
                              <a-col flex="70px" style="display: flex; align-items: center">
                                <a-icon :style="{ fontSize: '24px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.type === 'field' ? simpleItem.condition.splice(includeIndex + 1, 0, {include: '',value: undefined}) : simpleItem.condition.splice(includeIndex +1, 0, {include: '',value: []})" />
                                <a-icon :style="{ fontSize: '24px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="simpleItem.condition.length === 1 ? '' : simpleItem.condition.splice(includeIndex, 1)" />
                              </a-col>
                            </a-row>
                          </a-col>
                          <a-col flex="80px" v-if="simpleItem.type !== 'custom' && simpleItem.type !== 'urgeTimes' && simpleItem.type !== 'transitionFrom'">
                            <a-select v-model="simpleItem.logic" style="width: 80px" size="small">
                              <a-select-option value="and">且(and)</a-select-option>
                              <a-select-option value="or">或(or)</a-select-option>
                            </a-select>
                          </a-col>
                        </a-row>
                      </a-col>
                      <a-col flex="70px" style="display: flex; align-items: center; justify-content: center">
                        <a-icon
                          :style="{ fontSize: '24px', color: '#52c41a'}"
                          type="plus-square"
                          theme="filled"
                          @click="condition_visual.push({
                            type: 'field',
                            alias: '',
                            src: '',
                            condiArr: [],
                            customCode: {
                              html: '',
                              value: ''
                            },
                            condition: [{
                              include: '',
                              value: ''
                            }],
                            logic: 'and'
                          })" />
                        <a-icon :style="{ fontSize: '24px', color: condition_visual.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="condition_visual.length === 1 ? '' : condition_visual.splice(simpleIndex, 1)" />
                      </a-col>
                    </a-row>
                  </a-col>
                  <a-col flex="80px">
                    <a-select v-model="logic" style="width: 80px" size="small" v-if="condition_visual.length > 0">
                      <a-select-option value="and">且(and)</a-select-option>
                      <a-select-option value="or">或(or)</a-select-option>
                    </a-select>
                  </a-col>
                </a-row>
              </a-card>
            </a-form-item>
            <a-form-item label="执行动作" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-checkbox-group
                style="width: 100%; padding-top: 8px"
                v-decorator="['runaction', {initialValue: runaction,
                                            rules: [{ required: true, message: '执行动作不能为空'}]}]">
                <a-row type="flex" align="middle" :gutter="5" v-if="workflowtype === 'work'">
                  <a-col :span="custom_jump ==='1' ? 3 : 19">
                    <a-checkbox value="custom_jump" :checked="custom_jump === '1' " @change="(e) =>{ custom_jump = e.target.checked ? '1' : '0'}">自定义跳转</a-checkbox>
                  </a-col>
                  <a-col v-if="custom_jump === '1'" :span="6">
                    <a-select placeholder="请选择变迁" v-model="custom_jump_transition">
                      <a-select-option v-for="value in transition" :key="value.transition_id" :value="value.transition_id">{{ value.transition_name }}</a-select-option>
                    </a-select>
                  </a-col>
                </a-row>
                <a-row :gutter="5" type="flex" align="middle" v-else>
                  <a-col :span="auto_handle ==='1' ? 3 : 19">
                    <a-checkbox value="auto_handle" :checked="auto_handle === '1' " @change="(e) =>{ auto_handle = e.target.checked ? '1' : '0'}">自动办理</a-checkbox>
                  </a-col>
                  <a-col v-if="auto_handle === '1'" :span="6">
                    <a-select placeholder="请选择办理方式" v-model="auto_handle_way">
                      <a-select-option v-for="value in wayData" :key="value.id" :value="value.alias">{{ value.way }}</a-select-option>
                    </a-select>
                  </a-col>
                </a-row>
                <a-row :gutter="5" type="flex" align="middle" style="padding: 10px 0">
                  <a-col :span="custom_handle === '1' ? 3 : 19">
                    <a-checkbox value="custom_handle" @change="(e) =>{ custom_handle = e.target.checked ? '1' : '0' }">自定义动作</a-checkbox>
                  </a-col>
                  <a-col v-if="custom_handle === '1'" :span="6">
                    <a-button @click="handleCondition">自定义动作</a-button>
                  </a-col>
                  <condition ref="condition" :params="condition" @ok="getCondition"/>
                </a-row>
                <a-checkbox value="send_notice" @change="(e) =>{ send_notice = e.target.checked ? '1' : '0';if(!sendTemplate.length){ getTemplate() } }">发送通知</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <div v-if="send_notice === '1'">
              <a-form-item label="通知方式" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }">
                <a-checkbox-group v-decorator="['info[send_type]', { rules: [{required: true, message: '请选择通知方式'}], initialValue: config.data && config.data.send_type ? config.data.send_type : [] }]">
                  <a-checkbox value="sms">短信</a-checkbox>
                  <!-- <a-checkbox value="0">邮件</a-checkbox> -->
                  <a-checkbox value="msg">站内消息</a-checkbox>
                  <!-- <a-checkbox value="2">微信</a-checkbox> -->
                  <a-checkbox value="msgVoice">站内语音提醒</a-checkbox>
                  <a-checkbox value="appText">App文本提醒</a-checkbox>
                  <a-checkbox value="appVoice">App语音提醒</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
              <a-form-item label="提醒人" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }">
                <a-row type="flex" align="middle" style="margin-top: 3px">
                  <a-col :span="24"><querier-codemirror-input ref="querierCodemirrorInput" :params.sync="remindUser.data" :lineStyle="{lineHeight: '19px'}"/></a-col>
                  <span
                    style="position: absolute; left: 562px; top: -1px; cursor: pointer; z-index: 10"
                    size="small"
                    @click="$refs.remindUserShow.show({
                      title: '公式编辑器',
                    })">fx</span>
                </a-row>
                <condition ref="remindUserShow" :params="Object.assign(remindUser,{tableid:tableid})" @ok="(val) =>{ $set(this, 'remindUser', val) }"/>
              </a-form-item>
              <a-form-item label="文本内容模板" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }">
                <a-select
                  v-decorator="['info[smsTemplate]', { rules: [{required: true, message: '请选择文本内容模板'}], initialValue: config.data && config.data.smsTemplate ? config.data.smsTemplate : undefined }]"
                  @change="handleGetSmsTemplate"
                  allowClear>
                  <a-select-option v-for="tem in sendTemplate" :key="tem.value" :value="tem.value" >{{ tem.display }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                v-for="(value, smsKey) in fieldSmsTemplate"
                v-show="smsTempTag"
                :key="smsKey + 'sms'"
                :value="smsKey + 'sms'"
                :label="value.label"
                :labelCol="{ span: 6 }"
                :wrapperCol="{ span: 12 }">
                <a-input v-decorator="[value.name, {initialValue: config.data && config.data.smsSetting ? config.data.smsSetting[value.label] : '', rules: [{required: smsTempTag, message: '请输入参数'}]}]"/>
              </a-form-item>
              <a-form-item label="文本发送内容" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }" v-if="smsTempTag">
                <a-textarea :disabled="smsTempTag !== 'custom'" :autoSize="{ minRows: 5, maxRows: 10 }" v-decorator="['info[smsSetting][smsContent]', {rules: [{required: true, message: '请输入内容'}], initialValue: smsContent}]"/>
              </a-form-item>
              <a-form-item label="语音标识" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }">
                <a-input v-decorator="['info[voiceIdentify]', {initialValue: config.data && config.data.voiceIdentify ? config.data.voiceIdentify : ''}]"/>
              </a-form-item>
              <!-- <a-form-item label="文本消息模板" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }">
                <a-select
                  v-decorator="['info[msgTemplate]', { initialValue: config.data && config.data.msgTemplate ? config.data.msgTemplate : undefined }]"
                  allowClear
                  @change="handleGetMsgTemplate"
                >
                  <a-select-option v-for="tem in sendTemplate" :key="tem.value" :value="tem.value" >{{ tem.display }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                v-for="(value, msgKey) in fieldMsgTemplate"
                v-show="msgTempTag"
                :key="msgKey + 'mag'"
                :value="msgKey + 'mag'"
                :label="value.label"
                :labelCol="{ span: 6 }"
                :wrapperCol="{ span: 12 }">
                <a-input v-decorator="[value.name, {initialValue: config.data && config.data.msgSetting ? config.data.msgSetting[value.label] : '', rules: [{required: msgTempTag, message: '请输入参数'}]}]"/>
              </a-form-item>
              <a-form-item label="短信发送内容" :labelCol="{ span: 6 }" :wrapperCol="{ span: 12 }" v-if="msgTempTag">
                <a-textarea :disabled="msgTempTag !== 'custom'" :autoSize="{ minRows: 5, maxRows: 10 }" v-decorator="['info[msgSetting][msgContent]', {rules: [{required: msgTempTag, message: '请输入内容'}], initialValue: smsContent}]"/>
              </a-form-item> -->
            </div>
          </a-form>
        </div>
        <div class="bbar">
          <a-button type="primary" html-type="submit" @click="handleSubmit">保存</a-button>
          <a-button @click="visible = !visible">关闭</a-button>
        </div>
      </a-spin>
      <select-user-form ref="selectUserForm" @ok="getUser"/>
      <select-department ref="selectDepartment" @ok="getDepartment"/>
    </a-drawer>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    Condition: () => import('./Table/Condition'),
    Codemirror: () => import('@/views/admin/Formula/Codemirror'),
    QuerierCodemirrorInput: () => import('@/views/admin/Table/QuerierCodemirrorInput'),
    CustomCodemirror: () => import('@/views/admin/Flow/modules/CustomCodemirror'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm'),
    SelectDepartment: () => import('@/views/admin/UserTable/SelectDepartment')
  },
  props: {
    workflowtype: {
      type: String,
      default () {
        return ''
      },
      require: true
    },
    slaData: {
      type: Array,
      default () {
        return []
      }
    },
    allWayData: {
      type: Object,
      default () {
        return {}
      }
    },
    wayData: {
      type: Array,
      default () {
        return []
      }
    },
    tableid: {
      type: String,
      default () {
        return ''
      }
    },
    workflowId: {
      type: String,
      default () {
        return ''
      }
    },
    fieldArr: {
      type: Array,
      default () {
        return []
      }
    },
    department: {
      type: Array,
      default () {
        return []
      }
    },
    role: {
      type: Object,
      default () {
        return {}
      }
    },
    userArr: {
      type: Array,
      default () {
        return []
      }
    }
  },
  watch: {
    sla_data () {
      this.$emit('ok', this.sla_data)
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  data () {
    return {
      visible: false,
      loading: false,
      custom_skip: false,
      custom_action: false,
      sla_data: this.slaData,
      send_mes: false,
      showWay: [],
      recordKey: {},
      condition: {
        tableid: this.tableid,
        data: {}
      },
      custom_handle_setting: '',
      remindUser: {
        tableid: this.tableid,
        data: {
          html: '',
          value: ''
        }
      },
      custom_jump_transition: '',
      auto_handle_way: '',
      execution_time: '',
      sendForm: this.$form.createForm(this, { name: 'sendForm' }),
      config: {},
      queryParam: {},
      data: {},
      transition: [],
      form: this.$form.createForm(this),
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      send_notice: '0',
      custom_jump: '0',
      auto_handle: '0',
      custom_handle: '0',
      runaction: [],
      sendTemplate: [],
      fieldSmsTemplate: [],
      smsContent: '',
      smsTempTag: '',
      // fieldMsgTemplate: [],
      // msgContent: '',
      // msgTempTag: '',
      tagOption: [],
      execution_time_setting: {
        flowtime_before_day: null,
        flowtime_before_hour: null,
        flowtime_before_minute: null,
        flowtime_after_day: null,
        flowtime_after_hour: null,
        flowtime_after_minute: null,
        urge_symbol: 'eq',
        urge_times: null
      },
      condition_visual: [{
        type: 'notSet',
        alias: '',
        src: '',
        condiArr: [],
        customCode: {
          html: '',
          value: ''
        },
        condition: [{
          include: '',
          value: ''
        }],
        logic: 'and'
      }],
      logic: 'and',
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 140,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        dataIndex: 'sort',
        width: 40,
        scopedSlots: { customRender: 'sort' }
      }, {
        title: 'SLA名称',
        dataIndex: 'name',
        width: 150
      }, {
        title: '执行时机',
        dataIndex: 'execution_time',
        width: 120,
        scopedSlots: { customRender: 'execution_time' }
      }, {
        title: '执行动作',
        dataIndex: 'runaction',
        width: 120,
        scopedSlots: { customRender: 'runaction' }
      }, {
        title: '最后修改人',
        width: 120,
        dataIndex: 'updateuser'
      }, {
        title: '最后修改时间',
        width: 140,
        dataIndex: 'updatetime'
      }, {
        title: 'SLA描述',
        dataIndex: 'describe'
      }]
    }
  },
  mounted () {
    this.getTransition()
  },
  methods: {
    // 页面渲染
    handleAdd () {
      this.loading = true
      this.config = {
        action: 'add',
        title: '添加SLA',
        data: {
          execution_time: 'flowtime_come'
        }
      }
      this.send_notice = '0'
      this.custom_jump = '0'
      this.auto_handle = '0'
      this.custom_handle = '0'
      this.runaction = []
      this.smsTempTag = ''
      this.condition_visual = [{
        type: 'notSet',
        alias: '',
        src: '',
        condiArr: [],
        customCode: {
          html: '',
          value: ''
        },
        condition: [{
          include: '',
          value: ''
        }],
        logic: 'and'
      }]
      this.remindUser = {
        tableid: this.tableid,
        data: {
          html: '',
          value: ''
        }
      }
      this.loading = false
      this.visible = true
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
    getTemplate () {
      this.axios({
        url: '/sms/template/getTemplate'
      }).then((res) => {
        this.sendTemplate = res.result.data
        if (this.config.data && this.config.data.smsSetting) {
          this.handleGetSmsTemplate(this.config.data.smsTemplate)
        }
        // if (this.config.data && this.config.data.msgSetting) {
        //   this.handleGetMsgTemplate(this.config.data.msgTemplate)
        // }
      })
    },
    handleGetSmsTemplate (value) {
      this.smsTempTag = value
      const myTemplate = this.sendTemplate
      for (var key in myTemplate) {
        if (myTemplate[key].value === value) {
          this.smsContent = myTemplate[key].text
          this.form.setFieldsValue({
            'info[smsSetting][smsContent]': this.smsContent
          })
          var patt = /{\$[a-zA-Z0-9_]+}/g
          var res = myTemplate[key].text.match(patt)
          this.fieldSmsTemplate = []
          for (var i in res) {
            var fname = res[i].substring(2, res[i].length - 1)
            this.fieldSmsTemplate.push({ label: fname, name: 'info[smsSetting][' + fname + ']' })
          }
        }
      }
    },
    getTransition () {
      this.axios({
        url: '/admin/workflow/getTransition',
        params: { workflow_id: this.workflowId }
      }).then(res => {
        this.transition = res.result.data
      })
    },
    getCondition (val) {
      this.custom_handle_setting = val.data.value
      this.condition.data.value = this.custom_handle_setting
      this.condition.data.html = this.custom_handle_setting
    },
    handleCondition () {
      this.condition.data.value = this.custom_handle_setting
      this.condition.data.html = this.custom_handle_setting
      this.$refs.condition.show({ title: '自定义动作' })
    },
    handleDelete (index) {
      this.sla_data.splice(index, 1)
    },
    getUser (data, index, conIndex, modeCheck) {
      this.condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['userArr'] = data.map(item => { const obj = { username: item, text: item }; return obj })
      this.condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
    },
    getDepartment (data, index, conIndex, option) {
      if (this.recordKey.type === 'role') {
        this.condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['role'] = option
        this.condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
      } else {
        this.condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['department'] = option
        this.condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
      }
    },
    handleEdit (record, index) {
      this.loading = true
      this.config = {
        action: 'edit',
        title: '编辑SLA',
        data: record,
        index: index
      }
      this.send_notice = record.send_notice
      this.custom_jump = record.custom_jump
      this.auto_handle = record.auto_handle
      this.custom_handle = record.custom_handle
      if (record.remindUser) {
        this.remindUser = record.remindUser
      }
      if (record.execution_time === 'flowtime_before') {
        this.execution_time_setting.flowtime_before_day = record.flowtime_before_day
        this.execution_time_setting.flowtime_before_hour = record.flowtime_before_hour
        this.execution_time_setting.flowtime_before_minute = record.flowtime_before_minute
      } else if (record.execution_time === 'flowtime_after') {
        this.execution_time_setting.flowtime_after_day = record.flowtime_after_day
        this.execution_time_setting.flowtime_after_hour = record.flowtime_after_hour
        this.execution_time_setting.flowtime_after_minute = record.flowtime_after_minute
      } else if (record.execution_time === 'flowurge_times') {
        this.execution_time_setting.urge_symbol = record.urge_symbol
        this.execution_time_setting.urge_times = record.urge_times
      }
      this.runaction = []
      if (record.send_notice === '1') {
        this.getTemplate()
        this.runaction.push('send_notice')
      }
      if (record.custom_jump === '1') {
        this.runaction.push('custom_jump')
      }
      if (record.custom_handle === '1') {
        this.runaction.push('custom_handle')
      }
      if (record.auto_handle === '1') {
        this.runaction.push('auto_handle')
      }
      if (record.condition_visual) {
        record.condition_visual.forEach((simpleItem, simpleIndex) => {
          if (simpleItem.type === 'field') {
            this.fieldArr.forEach((fieldItem, fieldIndex) => {
              if (simpleItem.alias === fieldItem.alias) {
                fieldItem.settings = JSON.parse(fieldItem.setting)
                simpleItem.src = fieldItem.settings.form.src ? fieldItem.settings.form.src : ''
                simpleItem.formtype = fieldItem.formtype
                simpleItem.fieldid = fieldItem.fieldid
                simpleItem.form = fieldItem.settings.form
                if (simpleItem.src && fieldItem.formtype === 'treeselect') {
                  this.getTreeOption(simpleItem, fieldItem)
                } else if (fieldItem.formtype === 'tag' && !this.tagOption.length) {
                  this.getTagOption()
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
                  simpleItem.condiArr = [
                    { enName: 'equal', cnName: '等于' },
                    { enName: 'ne', cnName: '不等于' },
                    { enName: 'contain', cnName: '包含' },
                    { enName: 'nc', cnName: '不包含' },
                    { enName: 'bw', cnName: '开始于' },
                    { enName: 'ew', cnName: '结束于' },
                    { enName: 'em', cnName: '为空' },
                    { enName: 'nem', cnName: '不为空' } ]
                } else if (['radio', 'checkbox', 'combobox'].indexOf(fieldItem.formtype) !== -1) {
                  simpleItem.condiArr = [
                    { enName: 'equal', cnName: '等于' },
                    { enName: 'ne', cnName: '不等于' },
                    { enName: 'em', cnName: '为空' },
                    { enName: 'nem', cnName: '不为空' } ]
                } else if (['number', 'datetime'].indexOf(fieldItem.formtype) !== -1) {
                  simpleItem.condiArr = [
                    { enName: 'equal', cnName: '等于' },
                    { enName: 'ne', cnName: '不等于' },
                    { enName: 'great', cnName: '大于' },
                    { enName: 'ge', cnName: '大于等于' },
                    { enName: 'lt', cnName: '小于' },
                    { enName: 'le', cnName: '小于等于' },
                    { enName: 'em', cnName: '为空' },
                    { enName: 'nem', cnName: '不为空' }]
                } else if (['cascader', 'address', 'treeselect', 'tag'].indexOf(fieldItem.formtype) !== -1) {
                  simpleItem.condiArr = [
                    { enName: 'contain', cnName: '包含' },
                    { enName: 'nc', cnName: '不包含' },
                    { enName: 'em', cnName: '为空' },
                    { enName: 'nem', cnName: '不为空' }]
                }
              }
            })
          } else if (simpleItem.condition && simpleItem.condition.some(item => item.transitionFromVal)) {
            simpleItem.condition.forEach(item => {
              for (const i in this.allWayData) { if (i.includes(item.transitionFromVal)) { item.showWay = this.allWayData[i] } }
            })
          }
        })
        this.condition_visual = record.condition_visual
      }
      if (record.logic) {
        this.logic = record.logic
      }
      this.custom_jump_transition = record.custom_jump_transition
      this.auto_handle_way = record.auto_handle_way
      this.custom_handle_setting = record.custom_handle_setting
      this.condition.data.value = this.custom_handle_setting
      this.condition.data.html = this.custom_handle_setting
      this.loading = false
      this.visible = true
    },
    getOption (item) {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: item.src }
      }).then(res => {
        this.$set(item, 'option', res.result)
      })
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
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          values.info.updateuser = this.userInfo.username
          const time = Date.parse(new Date())
          values.info.updatetime = this.moment(time).format('YYYY-MM-DD HH:mm:ss')
          if (this.condition_visual.length > 0 && this.condition_visual.every(item => item.type === 'notSet')) {
            const obj = this.condition_visual[0]
            this.condition_visual = []
            this.condition_visual.push(obj)
          } else if (this.condition_visual.length > 1) {
            this.condition_visual = this.condition_visual.filter((item, index) => item.type !== 'notSet')
          }
          this.condition_visual.forEach(condItem => {
            delete condItem.condiArr
            delete condItem.src
            if (condItem.type === 'field') {
              delete condItem.form
              delete condItem.customCode
              delete condItem.option
              delete condItem.fieldtype
              delete condItem.fieldid
            } else if (condItem.type === 'custom') {
              delete condItem.alias
              delete condItem.condition
            } else if (condItem.type !== 'custom' && condItem.type !== 'field') {
              delete condItem.alias
              delete condItem.customCode
              if (condItem.type === 'transitionFrom') {
                condItem.condition.forEach(tranItem => {
                  delete tranItem.showWay
                })
              }
            }
          })
          values.info.condition_visual = this.condition_visual
          values.info.remindUser = this.remindUser
          values.info.logic = this.logic
          if (this.workflowtype === 'work') {
            values.info.custom_jump = this.custom_jump
            values.info.custom_jump_transition = this.custom_jump_transition
          } else {
            values.info.auto_handle = this.auto_handle
            values.info.auto_handle_way = this.auto_handle_way
          }
          values.info.custom_handle = this.custom_handle
          values.info.custom_handle_setting = this.custom_handle_setting
          values.info.send_notice = this.send_notice
          values.info.execution_time = this.config.data.execution_time
          Object.assign(values.info, this.execution_time_setting)
          if (this.config.action === 'add') {
            values.info.id = parseInt(Math.random() * (10000000 - 100000 + 1) + 100000, 10)
            this.sla_data.push(values.info)
          } else {
            this.sla_data.splice(this.config.index, 1, values.info)
          }
          this.visible = false
        }
      })
    }
  }
}
</script>
