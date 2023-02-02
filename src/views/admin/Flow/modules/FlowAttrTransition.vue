<template>
  <a-spin :spinning="false">
    <a-tabs @change="tabChange">
      <a-tab-pane key="information" tab="基础属性">
        <a-form :form="form">
          <a-divider orientation="left">基础信息</a-divider>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="ID" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-input :value="currentSelect.newId ? currentSelect.newId : currentSelect.id" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-input
                  @change="(e) => { currentSelect.nodeName = e.target.value }"
                  v-decorator="['name', {initialValue: currentSelect.nodeName, rules: [{ required: true, message: '请输入名称'}]}]" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="流程状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-select
                  showSearch
                  @change="(value, option) => { currentSelect.transition_status = value }"
                  v-decorator="['transitionStatus', {initialValue: currentSelect.transition_status, rules: [{ required: true, message: '请输入流程状态'}]}]">
                  <a-select-option v-for="item in transition_status_data" :key="item.id" :value="item.status">{{ item.status }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-select
                  @change="(value, option) => { currentSelect.type = value; transitionChange(value, option) }"
                  v-decorator="['type', {initialValue: currentSelect.type, rules: [{ required: true, message: '请输入类型'}]}]">
                  <a-select-option value="transition1" label="用户">用户</a-select-option>
                  <a-select-option value="transition2" label="时间">时间</a-select-option>
                  <a-select-option value="transition3" label="自动">自动</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                <span slot="label">
                  变迁启用回调
                  <a-tooltip>
                    <div slot="title">开启后，当输入网关经过条件判断，路由到当前变迁，并准备启动该变迁前，系统会调用此处的业务方法。返回值格式为：['errcode' => 0, 'errmsg' => '操作成功']，当errcode≠0时，流程无法启用当前变迁，流程保持不动，并提示errmsg对应的值。</div>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-switch v-model="currentSelect.conditionCallback"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                <span slot="label">
                  变迁发射回调
                  <a-tooltip>
                    <div slot="title">
                      <div>开启后，变迁发射时系统会调用此处的业务方法。返回值格式为：['errcode' => 0, 'errmsg' => '操作成功', 'place_id' => '']。</div>
                      <div>1、当errcode≠0时，变迁将无法发射，并提示errmsg对应的值，流程保持不动。</div>
                      <div>2、当errcode=0 & place_id为空时，变迁发射成功，流程将根据系统配置进行流转。</div>
                      <div>3、当errcode=0 & place_id返回了库所编号(该库所编号必须通过网关与当前变迁连接，否则系统会报错)时，流程将路由至 place_id对应的库所。</div>
                    </div>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-switch v-model="currentSelect.callback"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="备注" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-input style="margin-left: -2px;" v-model="currentSelect.remarks"/>
          </a-form-item>
          <template v-if="currentSelect.type === 'transition2'">
            <a-divider orientation="left">时间设置</a-divider>
            <a-form-item :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
              <span slot="label">时间类型
                <a-tooltip title="通过业务数据计算时，公式编辑器返回的值格式为YYYY-MM-DD hh:mm:ss">
                  <a-icon type="question-circle"/>
                </a-tooltip>
              </span>
              <a-row>
                <a-col :span="7">
                  <a-select v-model="triggerTime" @change="getTriggerTime">
                    <a-select-option value="relative">相对时间</a-select-option>
                    <a-select-option value="absolute">绝对时间</a-select-option>
                    <a-select-option value="compute">通过业务数据计算</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="17" style="padding-left: 10px">
                  <a-form-item v-if="triggerTime === 'relative'">
                    <a-input v-show="false" v-decorator="['relativeTime', {rules: [{ required: true,message: '请输入相对时间' }], initialValue: timedata.time_d || timedata.time_h || timedata.time_i ? '1' : undefined }]"></a-input>
                    <a-input-number :value="timedata.time_d" :min="0" @change="(value) => {timedata.time_d = value; currentSelect.triggerTimeRelative = timedata ;if(value){form.setFieldsValue({'relativeTime': value})}}"/> 天
                    <a-input-number :value="timedata.time_h" :min="0" @change="(value) => {timedata.time_h = value; currentSelect.triggerTimeRelative = timedata ;if(value){form.setFieldsValue({'relativeTime': value})}}"/> 时
                    <a-input-number :value="timedata.time_i" :min="0" @change="(value) => {timedata.time_i = value; currentSelect.triggerTimeRelative = timedata ;if(value){form.setFieldsValue({'relativeTime': value})}}"/> 分
                  </a-form-item>
                  <a-form-item v-else-if="triggerTime === 'absolute'">
                    <a-date-picker
                      format="YYYY-MM-DD HH:mm:ss"
                      v-decorator="['triggerTimeAbsolute', {rules: [{required: true,message: '请选择绝对时间'}], initialValue: triggerTimeAbsolute}]"
                      @change="(e, value)=>{ triggerTimeAbsolute = value; currentSelect.triggerTimeAbsolute = value }"/>
                  </a-form-item>
                  <a-form-item v-else>
                    <a-button @click="handleConditionTime">通过业务数据计算</a-button>
                    <condition ref="conditionTime" :params="triggerTimeCompute" @ok="getConditionTime"/>
                    <a-input v-show="false" v-decorator="['conditionTime', {rules: [{required: true, message: '请选择时间设置'}], initialValue: triggerTimeCompute.data.value }]" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form-item>
          </template>
          <template v-else-if="currentSelect.type === 'transition1'">
            <a-divider orientation="left">办理方式</a-divider>
            <div class="table-operator">
              <a-button v-action:add icon="plus" @click="handleAddWay">添加</a-button>
              <a-button icon="sort-ascending" @click="handleSort">排序</a-button>
              <a-button icon="eye" @click="handleEditRule">表单规则</a-button>
              <a-button icon="schedule" @click="() => { $refs.codeEditorWayData.show(wayDataAttribute) }">附加属性</a-button>
              <code-editor ref="codeEditorWayData" @func="getEditorWayData"/>
            </div>
            <a-table
              ref="tableWay"
              rowKey="id"
              :columns="columnsWay"
              :dataSource="wayData"
              size="small"
              :pagination="false">
              <span slot="onoff" slot-scope="text">
                <a-badge v-if="text" status="success" text="是" />
                <a-badge v-else status="error" text="否" />
              </span>
              <span slot="default" slot-scope="text">
                <a-badge v-if="text === '1'" status="success" text="是" />
                <a-badge v-else status="error" text="否" />
              </span>
              <div slot="action" slot-scope="text, record, index">
                <a @click="handleEditWay(record, index)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="请确认是否删除?"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDeleteWay(index)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </div>
            </a-table>
            <a-form-item label="办理备注规则" :labelCol="{span: 2 }" :wrapperCol="wrapperCol" style="margin: 15px 0">
              <a-radio-group :value="remarksrule" @change="getRemarksrule">
                <a-radio value="show_no_allow">可见选填</a-radio>
                <a-radio value="show_allow">可见必填</a-radio>
                <a-radio value="hidden">隐藏</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-divider orientation="left">办理按钮</a-divider>
            <div class="table-operator">
              <a-button v-action:add icon="plus" @click="handleAddMenu">添加</a-button>
              <a-button icon="import" @click="handleDefaultMenu">从模板中添加</a-button>
              <a-button icon="sort-ascending" @click="handleMenuSort">排序</a-button>
            </div>
            <a-table
              ref="tableMenu"
              rowKey="id"
              :columns="columnsMenu"
              :dataSource="menuData"
              size="small"
              :pagination="false">
              <span slot="serial" slot-scope="text, record, index">
                {{ index + 1 }}
              </span>
              <span slot="bar_sys" slot-scope="text">
                <a-badge v-if="text == 1" status="success" text="系统默认" />
                <a-badge v-else status="error" text="自定义" />
              </span>
              <span slot="visible" slot-scope="text">
                <a-badge v-if="text == 1" status="success" text="是" />
                <a-badge v-else status="error" text="否" />
              </span>
              <span slot="attribute" slot-scope="text">
                <a-badge v-if="text != ''" status="success" text="√" />
                <a-badge v-else status="error" text="×" />
              </span>
              <div slot="action" slot-scope="text, record, index">
                <a @click="handleAddressScope(record, index)">
                  <a-badge status="success" v-if="record.bookScope && record.bookScope.priv && record.bookScope.priv.length > 0"/>
                  <a-badge status="default" v-else/>
                  地址簿范围
                </a>
                <a-divider type="vertical" />
                <a @click="handleEditMenu(record, index)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="请确认是否删除?"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDeleteMenu(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </div>
            </a-table>
          </template>
          <a-divider orientation="left">任务通知</a-divider>
          <a-form-item label="通知方式" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-checkbox-group >
              <a-checkbox value="A">
                邮件
              </a-checkbox>
              <a-checkbox value="B">
                站内消息
              </a-checkbox>
              <a-checkbox value="C">
                微信
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="通知模板" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-radio-group>
              <a-radio value="1">使用流程默认模板</a-radio>
              <a-radio value="2">自定义模板</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="通知标题" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-input />
          </a-form-item>
          <a-form-item label="通知内容" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-textarea
              :auto-size="{ minRows: 5, maxRows: 10 }"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="participation" tab="办理人" v-if="currentSelect.type === 'transition1'">
        <a-form>
          <a-form-item label="参与者备注" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" v-model="partuser_remarks" />
          </a-form-item>
          <codemirror ref="condition" :params="mydata"/>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="tplview" tab="表单应用" v-if="currentSelect.type === 'transition1'">
        <a-form>
          <a-form-item label="表单视图" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
            <a-select v-model="currentSelect.transition_tplviewid">
              <a-select-option v-for="(value, key) in tplviewData" :key="key" :value="value.uid" :record="value">{{ value.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-divider orientation="left">操作权限</a-divider>
          <flow-attr-transition-field-priv
            ref="flowAttrTransitionFieldPriv"
            :params="{fieldPrivData: currentSelect.fieldPrivData, flowData: flowData}"
            @change="fieldPrivData = $event"
            @ok="handleOk"/>
        </a-form>
      </a-tab-pane>
      <a-tab-pane tab="变迁时限" key="timeLimit">
        <a-row type="flex" align="middle" style="margin-bottom: 10px">
          <a-col :span="24">
            <a-button block type="dashed" @click="addTimeLimit">新增变迁时限设置</a-button>
          </a-col>
        </a-row>
        <a-collapse defaultActiveKey="0">
          <a-collapse-panel v-for="(item, key) in timeLimitData" :key="key" :header="'变迁时限-' + (key + 1)">
            <a-divider orientation="left">条件：当</a-divider>
            <a-card>
              <a-row type="flex" align="middle">
                <a-col :span="22">
                  <a-row
                    v-for="(simpleItem, simpleIndex) in item.condition_visual"
                    :key="simpleIndex"
                    type="flex"
                    align="middle"
                    :gutter="10"
                    style="padding: 5px 0">
                    <a-col :span="4">
                      <a-select
                        v-model="simpleItem.type"
                        size="small"
                        style="width: 100%"
                        @change="(value) => {
                          if (value === 'field') {
                            simpleItem.condition = [ {
                              include: '',
                              value: ''
                            }]
                          } else if(value.includes('current')){
                            simpleItem.condition = [ {
                              include: '',
                              value: []
                            }]
                            $set(simpleItem,'include','bl')
                          } }">
                        <a-select-option value="notSet">无条件</a-select-option>
                        <a-select-option value="field">字段</a-select-option>
                        <a-select-option value="currentUser">创建人</a-select-option>
                        <a-select-option value="currentClass">创建人部门</a-select-option>
                        <a-select-option value="currentRole">创建人角色</a-select-option>
                        <a-select-option value="transitionFrom">来自于变迁</a-select-option>
                        <a-select-option value="custom">自定义</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="18" v-if="simpleItem.type === 'custom'">
                      <a-row type="flex" align="middle">
                        <a-col :span="24"><querier-codemirror-input ref="querierCodemirrorInput" :params.sync="simpleItem.customCode" /></a-col>
                        <div
                          style="position:absolute; right: 15px; cursor: pointer; z-index: 10"
                          size="small"
                          @click="()=>{
                            showKey = simpleIndex
                            $refs['customCodemirrors' + showKey][0].show({
                              title: '公式编辑器',
                              item: simpleItem,
                              tableid: mydata.tableid,
                            })
                          }">fx</div>
                        <custom-codemirror :ref="'customCodemirrors' +simpleIndex" @ok="(val) =>{ $set(item.condition_visual[showKey], 'customCode', val) }"/>
                      </a-row>
                    </a-col>
                    <a-col :span="18" v-if="simpleItem.type ==='notSet'"></a-col>
                    <a-col :span="18" v-if="simpleItem.type ==='transitionFrom'">
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
                    </a-col>
                    <a-col :span="4" v-if="simpleItem.type ==='field' && simpleItem.type !== 'custom' && simpleItem.type !=='notSet' && simpleItem.type !=='transitionFrom'">
                      <a-select
                        size="small"
                        style="width: 100%"
                        show-search
                        :allowClear="true"
                        option-filter-prop="children"
                        v-if="simpleItem.type === 'field'"
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
                              simpleItem.alias = item1.alias
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
                    <a-col :span="4" v-if="simpleItem.type !=='field' && simpleItem.type !== 'custom' && simpleItem.type !=='notSet' && simpleItem.type !=='transitionFrom'">
                      <a-select size="small" style="width: 100%" v-model="simpleItem.include">
                        <a-select-option value="bl">属于</a-select-option>
                        <a-select-option value="nbl">不属于</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="14" style="border: 1px solid #E8E8E8; margin-bottom: 4px" v-if="simpleItem.type !== 'custom' && simpleItem.type !=='notSet' && simpleItem.type !=='transitionFrom'">
                      <a-row type="flex" align="middle" :gutter="10">
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
                                style="width: 100%"
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
                            <a-col :span="15" v-if="simpleItem.type ==='field'" >
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
                                  style="width: 100%"
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
                                <a-input style="width: 100%" type="text" disabled size="small" />
                              </template>
                            </a-col>
                            <a-col :span="21" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentUser'">
                              <a-row type="flex" align="middle">
                                <a-col :span="23">
                                  <a-select
                                    style="width: 100%"
                                    size="small"
                                    mode="multiple"
                                    :open="false"
                                    placeholder="请选择"
                                    @change="(value) => {includeItem.value = value}"
                                    :showSearch="false"
                                    allowClear
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
                                    recordKey.index = key
                                    recordKey.simpleIndex = simpleIndex
                                    recordKey.includeIndex = includeIndex
                                    recordKey.type = 'user'
                                    $refs.getUser.show({
                                      fieldid: '',
                                      selectValue: includeItem.value,
                                      mode: 'multiple',
                                    })
                                  }"/></a-col>
                              </a-row>
                            </a-col>
                            <a-col :span="21" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentClass'">
                              <a-row type="flex" align="middle">
                                <a-col :span="23">
                                  <a-select
                                    size="small"
                                    style="width: 100%"
                                    mode="multiple"
                                    :open="false"
                                    allowClear
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
                                    recordKey.index = key
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
                            <a-col :span="21" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentRole'">
                              <a-row type="flex" align="middle">
                                <a-col :span="23">
                                  <a-select
                                    size="small"
                                    style="width: 100%"
                                    allowClear
                                    placeholder="请选择角色"
                                    :open="false"
                                    v-model="includeItem.value"
                                    mode="multiple"
                                    changeOnSelect
                                    @change="(value) => {includeItem.value = value}">
                                    <a-select-option v-for="(value, roleKey) in includeItem.role" :key="roleKey" :value="value.roleid">{{ value.name }}</a-select-option>
                                  </a-select>
                                </a-col>
                                <a-col :span="1">
                                  <a-button
                                    style="margin-left: -1px"
                                    size="small"
                                    icon="team"
                                    @click="()=>{
                                      recordKey.index = key
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
                            <a-col :span="3" style="display: flex; align-items: center; justify-content: center">
                              <a-icon :style="{ fontSize: '24px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.type === 'field' ? simpleItem.condition.splice(includeIndex + 1, 0, {include: '',value: undefined}) : simpleItem.condition.splice(includeIndex +1, 0, {include: '',value: []})" />
                              <a-icon :style="{ fontSize: '24px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="simpleItem.condition.length === 1 ? '' : simpleItem.condition.splice(includeIndex, 1)"/>
                            </a-col>
                          </a-row>
                        </a-col>
                        <a-col :span="4">
                          <a-select v-model="simpleItem.logic" style="width: 80px" size="small">
                            <a-select-option value="and">且(and)</a-select-option>
                            <a-select-option value="or">或(or)</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                    </a-col>
                    <a-col :span="2" style="display: flex; align-items: center; justify-content: center">
                      <a-icon
                        :style="{ fontSize: '24px', color: '#52c41a'}"
                        type="plus-square"
                        theme="filled"
                        @click="item.condition_visual.splice(simpleIndex + 1, 0 ,{
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
                      <a-icon :style="{ fontSize: '24px', color: item.condition_visual.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click=" item.condition_visual.length === 1 ? '' : item.condition_visual.splice(simpleIndex, 1)" />
                    </a-col>
                  </a-row>
                </a-col>
                <a-col :span="2">
                  <a-select v-model="item.logic" style="width: 80px;" size="small" v-if="item.condition_visual.length > 0">
                    <a-select-option value="and">且(and)</a-select-option>
                    <a-select-option value="or">或(or)</a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-card>
            <a-divider orientation="left">变迁时限：那么</a-divider>
            <a-form-item label="工作日历" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}">
              <a-row>
                <a-col :span="7">
                  <a-select style="width: 100%" v-model="item.work_calendar">
                    <a-select-option value="0">继承流程全局设置</a-select-option>
                    <a-select-option v-for="(calItem,calIndex) in calendar" :key="calIndex" :value="calItem.value">{{ calItem.label }}</a-select-option>
                    <a-select-option value="1">不设置</a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="变迁时限" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}" :required="true">
              <a-row :gutter="5">
                <a-col :span="24">
                  <a-radio-group v-model="item.restrictType">
                    <a-radio value="0">自定义</a-radio>
                    <a-radio value="1">继承自来源变迁</a-radio>
                  </a-radio-group>
                </a-col>
              </a-row>
              <div v-if="item.restrictType === '0'">
                <a-row :gutter="5">
                  <a-col :span="1">以</a-col>
                  <a-col :span="10">
                    <a-select style="width: 100%" v-model="item.base_time">
                      <a-select-option value="0">当前变迁的启动时间</a-select-option>
                      <a-select-option value="1">其他变迁的启动时间</a-select-option>
                      <a-select-option value="2">字段值时间</a-select-option>
                      <a-select-option value="3">自定义</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="10">
                    <a-select style="width: 100%" v-model="item.fieldValue" v-if="item.base_time === '2'" placeholder="请选择日期时间">
                      <a-select-option :value="field.alias" v-for="field in fieldDate" :key="field.fieldid">{{ field.name }}</a-select-option>
                    </a-select>
                    <a-button @click="$refs['condition' + key][0].show({ title: '变迁时限' })" v-if="item.base_time === '3'" >通过业务数据计算</a-button>
                    <condition :ref="'condition' + key" :params="{ data: item.custom_compute_setting, tableid: mydata.tableid }" @ok="(val)=> { item.custom_compute_setting = val.data }"/>
                    <a-select style="width: 100%" v-model="item.changesField" v-if="item.base_time === '1'" placeholder="请选择变迁">
                      <a-select-option v-for="value in transition" :key="value.transition_id" :value="value.transition_id">{{ value.transition_name }}</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="3">为基准时间</a-col>
                </a-row>
                <a-row :gutter="5">
                  <a-col :span="1">从</a-col>
                  <a-col :span="10">
                    <a-select style="width: 100%" v-model="item.time_starts">
                      <a-select-option value="0">基准时间</a-select-option>
                      <a-select-option value="1">基准时间所属日期的零点</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="10"></a-col>
                  <a-col :span="3">开始计时</a-col>
                </a-row>
                <a-row :gutter="5">
                  <a-col :span="1">按</a-col>
                  <a-col :span="3">
                    <a-select style="width: 100%" v-model="item.calculation_time">
                      <a-select-option value="0">手动输入</a-select-option>
                      <a-select-option value="1">以字段值数值</a-select-option>
                      <a-select-option value="2">自定义</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="17" v-if="item.calculation_time === '0'">
                    <a-input-number :min="0" v-model="item.custom_time_day"/>
                    <span style="padding: 0 5px 0 5px" >天</span>
                    <a-input-number :min="0" :max="23" v-model="item.custom_time_hour" />
                    <span style="padding: 0 5px 0 5px">小时</span>
                    <a-input-number :min="item.custom_time_day === 0 && item.custom_time_hour === 0 && item.custom_time_minute === 0 ? 1 : 0" :max="59" v-model="item.custom_time_minute"/>
                    <span style="padding-left: 5px">分钟</span>
                  </a-col>
                  <a-col :span="17" v-if="item.calculation_time === '1'">
                    <a-row :gutter="10">
                      <a-col :span="10" >
                        <a-select style="width: 100%" v-model="item.field_alias" >
                          <a-select-option :value="field.alias" v-for="field in fieldNumber" :key="field.fieldid">{{ field.name }}</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                  </a-col>
                  <a-col :span="17" v-if="item.calculation_time === '2'">
                    <a-button @click="$refs['conditions' + key][0].show({ title: '变迁时限: 计算时长' })">通过业务数据计算</a-button>
                  </a-col>
                  <a-col :span="3">计算时长</a-col>
                  <condition :ref="'conditions' + key" :params="{ data: item.calculation_setting, tableid: mydata.tableid }" @ok="(val)=> { item.calculation_setting = val.data }"/>
                </a-row>
              </div>
            </a-form-item>
            <a-form-item label="预警时限" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}" v-if="item.restrictType !== '1'">
              <a-row :gutter="5">
                <a-col :span="7">
                  <a-select style="width: 100%" v-model="item.workflow_warn_restrict">
                    <a-select-option value="warn_not_set">不设置</a-select-option>
                    <a-select-option value="warn_percent">时限百分比</a-select-option>
                    <a-select-option value="warn_custom">自定义</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="17" v-if="item.workflow_warn_restrict === 'warn_percent'">
                  <span style="padding-right: 10px">变迁时限 *</span>
                  <a-input-number
                    v-model="item.warn_percent_setting"
                    :min="1"
                    :max="99"
                    :formatter="value => `${value}%`"
                    :parser="value => value.replace('%', '')"
                  />
                </a-col>
                <a-col :span="17" v-if="item.workflow_warn_restrict === 'warn_custom'">
                  <span style="padding-right: 5px">变迁时限到达前</span>
                  <a-input-number :min="0" v-model="item.warn_custom_day" />
                  <span style="padding: 0 5px 0 5px">天</span>
                  <a-input-number :min="0" :max="23" v-model="item.warn_custom_hour" />
                  <span style="padding: 0 5px 0 5px">小时</span>
                  <a-input-number :min="0" :max="59" v-model="item.warn_custom_minute"/>
                  <span style="padding-left: 5px">分钟</span>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="超时时限" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}" v-if="item.restrictType !== '1'">
              <a-row :gutter="5">
                <a-col :span="7">
                  <a-select style="width: 100%" v-model="item.workflow_serious_restrict" >
                    <a-select-option value="serious_not_set">不设置</a-select-option>
                    <a-select-option value="serious_percent">时限百分比</a-select-option>
                    <a-select-option value="serious_custom">自定义</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="17" v-if="item.workflow_serious_restrict === 'serious_percent'">
                  <span style="padding-right: 10px">变迁时限 *</span>
                  <a-input-number
                    v-model="item.serious_percent_setting"
                    :min="100"
                    :formatter="value => `${value}%`"
                    :parser="value => value.replace('%', '')"
                  />
                </a-col>
                <a-col :span="17" v-if="item.workflow_serious_restrict === 'serious_custom'">
                  <span style="padding-right: 5px">变迁时限到达后</span>
                  <a-input-number :min="0" v-model="item.serious_custom_day" />
                  <span style="padding: 0 5px 0 5px">天</span>
                  <a-input-number :min="0" :max="23" v-model="item.serious_custom_hour" />
                  <span style="padding: 0 5px 0 5px">小时</span>
                  <a-input-number :min="0" :max="59" v-model="item.serious_custom_minute" />
                  <span style="padding-left: 5px">分钟</span>
                </a-col>
              </a-row>
            </a-form-item>
            <a-icon slot="extra" type="delete" @click="handleDelete(key)"/>
          </a-collapse-panel>
        </a-collapse>
      </a-tab-pane>
      <a-tab-pane tab="SLA" key="sla">
        <workflow-form-sla
          ref="workflowFormSla"
          :workflowtype="'flow'"
          :wayData="wayData"
          :slaData="sla_data"
          :fieldArr="fieldArr"
          :allWayData="allWayData"
          :department="department"
          :tableid="mydata.tableid"
          :role="role"
          :userArr="userArr"
          @ok="getSla"
          :workflowId="workflow_id"/>
      </a-tab-pane>
      <a-tab-pane tab="填表设置" key="formset">
        <flow-attr-transition-formset
          ref="flowAttrTransitionFormset"
          :formsetData="formsetData"
          :tableid="mydata.tableid"
          @ok="getFormset"
        />
      </a-tab-pane>
      <a-tab-pane tab="附件设置" key="attachment">
        <flow-attr-transition-attachment
          ref="flowAttrTransitionAttachment"
          :showData="attachmentData"
          :tableid="mydata.tableid"
          @ok="getAttachment"
        />
      </a-tab-pane>
    </a-tabs>
    <div class="bbar">
      <a-button type="primary" @click="handleSubmit">保存</a-button>
      <a-button @click="onClose">关闭</a-button>
    </div>
    <!-- 表单规则 -->
    <flow-attr-transition-form-rule ref="flowAttrTransitionFormRule" :params="{wayData: wayData}" @ok="getFormRule" :key="refreshKey" />
    <!-- 办理按钮 -->
    <flow-attr-transition-menu-form ref="flowAttrTransitionMenuForm" @ok="getMenu"/>
    <!-- 办理方式排序 -->
    <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
    <!-- 办理方式 -->
    <flow-attr-transition-way-form ref="flowAttrTransitionWayForm" :params="{wayData: wayData}" @ok="getWay"/>
    <!-- 办理人 -->
    <flow-attr-transition-user ref="flowAttrTransitionUser" :params="currentSelect" @change="currentSelect.transitionUser = $event"/>
    <!-- 地址簿范围 -->
    <select-user-form ref="selectUserForm" @ok="getUser"/>
    <select-user-form ref="getUser" @ok="getUserData"/>
    <select-department ref="selectDepartment" @ok="getDepartment"/>
    <tool-button-choose ref="toolButtonChoose" @ok="getButtonData" />
  </a-spin>
</template>
<script>
import { menuAllData } from '@/views/admin/Table/DefaultButton'
export default {
  components: {
    Codemirror: () => import('@/views/admin/Formula/Codemirror'),
    Condition: () => import('@/views/admin/Table/Condition'),
    CodeEditor: () => import('@/views/admin/CodeEditor'),
    FlowAttrTransitionMenuForm: () => import('./FlowAttrTransitionMenuForm'),
    FlowAttrTransitionWayForm: () => import('./FlowAttrTransitionWayForm'),
    FlowAttrTransitionWayRule: () => import('./FlowAttrTransitionWayRule'),
    FlowAttrTransitionFieldPriv: () => import('./FlowAttrTransitionFieldPriv'),
    FlowAttrTransitionFormRule: () => import('./FlowAttrTransitionFormRule'),
    FlowAttrTransitionSort: () => import('./FlowAttrTransitionSort'),
    FlowAttrTransitionUser: () => import('./FlowAttrTransitionUser'),
    WorkflowFormSla: () => import('@/views/admin/WorkflowFormSla'),
    QuerierCodemirrorInput: () => import('@/views/admin/Table/QuerierCodemirrorInput'),
    CustomCodemirror: () => import('@/views/admin/Flow/modules/CustomCodemirror'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm'),
    SelectDepartment: () => import('@/views/admin/UserTable/SelectDepartment'),
    ToolButtonChoose: () => import('@/views/admin/Table/ToolButtonChoose'),
    FlowAttrTransitionFormset: () => import('@/views/admin/Flow/modules/FlowAttrTransitionFormset'),
    FlowAttrTransitionAttachment: () => import('@/views/admin/Flow/modules/FlowAttrTransitionAttachment')

  },
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  watch: {
    params: {
      handler (val) {
        this.workflow_id = val.workflowId
        this.flowData = val.flowData
        if (this.flowData.params && this.flowData.params.setting) {
          const setting = JSON.parse(this.flowData.params.setting)
          this.transition_status_data = setting.transition_status_data || []
        }
        this.currentSelect = JSON.parse(JSON.stringify(val.currentSelect))
        this.currentSelect.newId = undefined
        if (this.flowData.params && this.flowData.params.flow) {
          const nodeList = JSON.parse(this.flowData.params.flow).nodeList
          nodeList.forEach(item => {
            if (item.wayData) {
              this.allWayData[item.id] = item.wayData
            }
          })
        }
        this.remarksrule = val.currentSelect.remarksrule || 'show_no_allow'
        this.triggerTime = val.currentSelect.triggerTime || 'relative'
        this.currentSelect.triggerTime = this.triggerTime
        this.timedata = val.currentSelect.triggerTimeRelative || { time_d: 0, time_h: 0, time_i: 0 }
        this.triggerTimeAbsolute = val.currentSelect.triggerTimeAbsolute || ''
        this.triggerTimeCompute.data = val.currentSelect.triggerTimeCompute || { tableid: val.flowData.params.modelid, data: { value: '' } }
        this.triggerTimeCompute.tableid = val.flowData.params.modelid
        this.wayDataAttribute = val.currentSelect.wayDataAttribute || { value: '' }
        this.axios({
          url: '/admin/UserTable/tableTplviews',
          params: { tableid: val.flowData.params.modelid, type: 'table_form_view' }
        }).then((res) => {
          this.loading = false
          this.tplviewData = res.result
        })
        if (!val.currentSelect.menuData) {
          this.menuData = menuAllData
        } else {
          this.menuData = val.currentSelect.menuData
        }
        this.wayData = val.currentSelect.wayData ? val.currentSelect.wayData : []
        this.wayData.forEach(item => {
          if (!item.alias) {
            this.getName(item, item.way)
          }
        })
        this.wayData.sort(this.compare('listorder'))
        this.fieldPrivData = val.currentSelect.fieldPrivData ? val.currentSelect.fieldPrivData : []
        this.partuser_remarks = val.currentSelect.partuser_remarks
        this.mydata = {
          tableid: val.flowData.params.modelid,
          data: val.currentSelect.transitionUser ? val.currentSelect.transitionUser : {},
          currentSelect: val.currentSelect,
          flowData: val.flowData
        }
        this.sla_data = val.currentSelect.sla_data || []
        if (val.currentSelect.wayDataRule) {
          this.wayDataRule = val.currentSelect.wayDataRule
        }
        this.formsetData = val.currentSelect.formsetData || []
        this.attachmentData = val.currentSelect.attachmentData || []
        if (val.currentSelect.restrict_time && val.currentSelect.restrict_time instanceof Array) {
          this.timeLimitData = val.currentSelect.restrict_time
        }
      },
      immediate: true
      // deep: true
    }
  },
  data () {
    return {
      refreshKey: 0,
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      form: this.$form.createForm(this),
      activeKey: 'base',
      partuser_remarks: '',
      transition_status_data: [], // 流程状态
      fieldArr: [],
      transition: [],
      fieldDate: [],
      fieldNumber: [],
      userArr: [],
      role: {},
      department: [],
      wayDataRule: [],
      sortData: '',
      tagOption: [],
      // 工作日历
      calendar: [],
      timeLimitData: [{
        condition_mode: '0',
        work_calendar: '0',
        condition_custom: {
          html: '',
          value: ''
        },
        logic: 'and',
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
        base_time: '0', // 基准时间  '0': 流程创建时间; '1': 字段值时间 , '2' : 自定义
        time_starts: '0', // 开始计时 '0'：基准时间; '1': 基准时间所属日期零点
        custom_compute_setting: { // 基准时间自定义存放
          html: '',
          value: ''
        },
        restrictType: '0', // 变迁时限设置 '0':自定义  '1': 继承自来源变迁
        calculation_time: '0', // 计算时长  '0': 手动输入   '1': 以字段值数值  '2': 自定义
        custom_time_day: null, // 手动输入时分秒
        custom_time_hour: null,
        custom_time_minute: null,
        field_alias: '', // 字段值数值 选择字段
        calculation_setting: { // 计算时长自定义
          html: '',
          value: ''
        },
        workflow_warn_restrict: 'warn_not_set', // 预警时限
        warn_percent_setting: 80,
        warn_custom_day: null,
        warn_custom_hour: null,
        warn_custom_minute: null,
        workflow_serious_restrict: 'serious_not_set', // 超时时限
        serious_percent_setting: 120,
        serious_custom_day: null,
        serious_custom_hour: null,
        serious_custom_minute: null
      }],
      sla_data: [],
      formsetData: [],
      attachmentData: [],
      // 办理按钮表头
      columnsMenu: [{
        title: '#',
        scopedSlots: { customRender: 'serial' }
      }, {
        title: '按钮名称',
        dataIndex: 'name'
      }, {
        title: '按钮类型',
        dataIndex: 'bar_sys',
        scopedSlots: { customRender: 'bar_sys' }
      }, {
        title: '按钮样式',
        dataIndex: 'style'
      }, {
        title: '显示',
        dataIndex: 'visible',
        scopedSlots: { customRender: 'visible' }
      }, {
        title: '附加属性',
        dataIndex: 'attribute',
        scopedSlots: { customRender: 'attribute' }
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        scopedSlots: { customRender: 'action' }
      }],
      // 办理方式表头
      columnsWay: [{
        title: '#',
        dataIndex: 'listorder'
      }, {
        title: '办理方式系统名',
        dataIndex: 'alias'
      }, {
        title: '办理方式显示名',
        dataIndex: 'way'
      }, {
        title: '启用',
        dataIndex: 'onoff',
        scopedSlots: { customRender: 'onoff' }
      }, {
        title: '默认',
        dataIndex: 'default',
        scopedSlots: { customRender: 'default' }
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }, {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 260,
        scopedSlots: { customRender: 'action' }
      }],
      recordKey: {},
      tplviewData: [],
      menuData: [],
      showKey: null,
      wayData: [],
      allWayData: {},
      showWay: [],
      fieldPrivData: [],
      flowData: {},
      currentSelect: {},
      remarksrule: '',
      triggerTime: '',
      timedata: {},
      custom_compute_setting: '',
      triggerTimeAbsolute: '',
      triggerTimeCompute: {
        data: {}
      },
      // 办理方式附加属性
      wayDataAttribute: {
        value: ''
      }
    }
  },
  methods: {
    transitionChange (value, options) {
      const oldId = this.currentSelect.id.split('-')[1]
      this.currentSelect.newId = value + '-' + oldId
      this.currentSelect.nodeName = options.componentOptions.propsData.label
    },
    getSla (data) {
      this.sla_data = data
    },
    getFormset (data) {
      this.formsetData = data
    },
    getAttachment (data) {
      this.attachmentData = data
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
    tabChange (e) {
      if (e === 'timeLimit') {
        this.axios({
          url: '/admin/field/init',
          params: {
            pageNo: 1,
            pageSize: 1000,
            sortField: 'id',
            sortOrder: 'ascend',
            tableid: this.mydata.tableid
          }
        }).then(res => {
          this.fieldArr = res.result.data.filter(item => {
            return ['text', 'textarea', 'radio', 'checkbox', 'combobox', 'number', 'datetime', 'cascader', 'associated', 'address', 'treeselect', 'tag'].indexOf(item.formtype) !== -1
          })
          this.fieldDate = res.result.data.filter(item => item.formtype === 'datetime')
          this.fieldNumber = res.result.data.filter(item => item.formtype === 'number')
          if (this.currentSelect.restrict_time && !this.currentSelect.restrict_time.workflow_restrict) {
            // 遍历规则
            this.currentSelect.restrict_time.forEach((dataItem, dataIndex) => {
              dataItem.condition_visual.forEach((simpleItem, simpleIndex) => {
                if (simpleItem.alias) {
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
            })
            this.timeLimitData = this.currentSelect.restrict_time
          }
        })
        // 请求所有的部门，角色，用户列表
        this.axios({
          url: '/admin/user/init',
          params: { pageNo: 1,
            pageSize: 100,
            sortField: 'id',
            sortOrder: 'ascend',
            init: true
          } }).then(res => {
          this.department = res.result.option.department
          this.role = res.result.option.role
          this.userArr = res.result.data
        })
        this.axios({
          url: '/admin/workflow/getTransition',
          params: { workflow_id: this.workflow_id }
        }).then(res => {
          this.transition = res.result.data
        })
        this.axios({
          url: 'admin/Calendar/getCalendar'
        }).then(res => {
          this.calendar = res.result.option
        })
      } else if (e === 'sla') {
        this.axios({
          url: '/admin/field/init',
          params: {
            pageNo: 1,
            pageSize: 1000,
            sortField: 'id',
            sortOrder: 'ascend',
            tableid: this.mydata.tableid
          }
        }).then(res => {
          this.fieldArr = res.result.data.filter(item => {
            return ['text', 'textarea', 'radio', 'checkbox', 'combobox', 'number', 'datetime', 'cascader', 'associated', 'address', 'treeselect', 'tag'].indexOf(item.formtype) !== -1
          })
        })
      } else if (e === 'tplview') {
        this.axios({
          url: '/admin/UserTable/tableTplviews',
          params: { tableid: this.flowData.params.modelid, type: 'table_form_view' }
        }).then((res) => {
          this.tplviewData = res.result
        })
      }
    },
    getUserData (data, index, conIndex, modeCheck) {
      this.timeLimitData[this.recordKey.index].condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['userArr'] = data.map(item => { const obj = { username: item, text: item }; return obj })
      this.timeLimitData[this.recordKey.index].condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
    },
    getDepartment (data, index, conIndex, option) {
      if (this.recordKey.type === 'role') {
        this.timeLimitData[this.recordKey.index].condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['role'] = option
        this.timeLimitData[this.recordKey.index].condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
      } else {
        this.timeLimitData[this.recordKey.index].condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['department'] = option
        this.timeLimitData[this.recordKey.index].condition_visual[this.recordKey.simpleIndex].condition[this.recordKey.includeIndex]['value'] = data
      }
    },
    addTimeLimit () {
      this.timeLimitData.splice(0, 0, {
        condition_mode: '0',
        work_calendar: '0',
        condition_custom: {
          html: '',
          value: ''
        },
        logic: 'and',
        condition_visual: [{
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
        }],
        base_time: '0', // 基准时间  '0': 流程创建时间; '1': 字段值时间 , '2' : 自定义
        time_starts: '0', // 开始计时 '0'：基准时间; '1': 基准时间所属日期零点
        custom_compute_setting: { // 基准时间自定义存放
          html: '',
          value: ''
        },
        restrictType: '0',
        calculation_time: '0', // 计算时长  '0': 手动输入   '1': 以字段值数值  '2': 自定义
        custom_time_day: '', // 手动输入时分秒
        custom_time_hour: '',
        custom_time_minute: '',
        field_alias: '', // 字段值数值 选择字段
        calculation_setting: { // 计算时长自定义
          html: '',
          value: ''
        },
        workflow_warn_restrict: 'warn_not_set', // 预警时限
        warn_percent_setting: 80,
        warn_custom_day: null,
        warn_custom_hour: null,
        warn_custom_minute: null,
        workflow_serious_restrict: 'serious_not_set', // 超时时限
        serious_percent_setting: 120,
        serious_custom_day: null,
        serious_custom_hour: null,
        serious_custom_minute: null
      })
    },
    handleDelete (key, index) {
      event.stopPropagation()
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.timeLimitData.splice(key, 1)
        }
      })
    },
    getUUID: function () {
      const s = []
      const hexDigits = '0123456789abcdef'
      for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
      }
      s[14] = '4'
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
      s[8] = s[13] = s[18] = s[23] = '-'
      const uuid = s.join('')
      return uuid.replace(/-/g, '')
    },
    handleAddMenu () {
      this.$refs.flowAttrTransitionMenuForm.show({
        action: 'add',
        title: '添加',
        record: {
          id: (new Date()).valueOf(),
          name: '',
          bar_alias: 'bar_' + (new Date()).valueOf(),
          bar_sys: 0,
          style: 'default',
          visible: 1,
          attribute: '',
          remarks: ''
        }
      })
    },
    handleDefaultMenu () {
      this.$refs.toolButtonChoose.show({
        listArray: menuAllData,
        unCheckBar: menuAllData.filter(item => this.menuData.findIndex(barItem => barItem.bar_alias === item.bar_alias) === -1)
      })
    },
    getButtonData (data) {
      this.menuData = [...this.menuData, ...data]
      this.handleOk()
    },
    handleEditMenu (record, index) {
      this.$refs.flowAttrTransitionMenuForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        record: record,
        index: index
      })
    },
    handleAddressScope (record, index) {
      this.$refs.selectUserForm.show({
        transition: 'transition',
        modeCheck: record.bookScope && record.bookScope.mode ? record.bookScope.mode : 'multiple',
        mode: 'multiple',
        selectValue: record.bookScope && record.bookScope.priv ? record.bookScope.priv : '',
        index: index
      })
    },
    getUser (data, index, index2, mode) {
      let array = []
      if (typeof (data) === 'string') {
        array.push(data)
      } else {
        array = data
      }
      const obj = {
        priv: array,
        mode: mode
      }
      this.$set(this.menuData[index], 'bookScope', obj)
      this.handleOk()
    },
    handleDeleteMenu (record) {
      const dataSource = [...this.menuData]
      this.menuData = dataSource.filter(item => item.id !== record.id)
      this.handleOk()
    },
    handleAddWay () {
      this.$refs.flowAttrTransitionWayForm.show({
        action: 'add',
        title: '添加',
        record: {
          id: (new Date()).valueOf(),
          listorder: this.wayData.length + 1,
          way: '',
          default: 0,
          rule: '',
          alias: '',
          onoff: true,
          remarks: ''
        }
      })
    },
    handleSort () {
      this.changeData = 'wayData'
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: this.wayData
      })
    },
    getSort (data) {
      this[this.changeData] = data
      this.handleOk()
    },
    handleMenuSort () {
      this.changeData = 'menuData'
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: this.menuData
      })
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
    handleEditWay (record, index) {
      this.$refs.flowAttrTransitionWayForm.show({
        action: 'edit',
        title: '编辑：' + record.way,
        record: record,
        index: index
      })
    },
    handleEditRule (record, index) {
      this.refreshKey = this.refreshKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.flowAttrTransitionFormRule.show({
          action: 'edit',
          title: '表单规则',
          flowData: this.flowData,
          wayDataRule: this.wayDataRule || []
        }, this.wayData)
      })
    },
    handleDeleteWay (index) {
      this.wayData.sort(this.compare('listorder'))
      this.wayData.splice(index, 1)
      this.handleOk()
    },
    // 变迁设置办理方式附加属性获取
    getEditorWayData (value) {
      this.wayDataAttribute.value = value
    },
    handleWayRule (record, index) {
      this.$refs.flowAttrTransitionWayRule.show({
        action: 'edit',
        title: '办理显示规则：' + record.way,
        record: record,
        index: index,
        flowData: this.flowData
      })
    },
    handleOk () {
      this.currentSelect.menuData = this.menuData
      this.currentSelect.wayData = this.wayData
      this.currentSelect.fieldPrivData = this.fieldPrivData
    },
    getFormRule (data) {
      this.wayDataRule = data
      this.currentSelect.wayDataRule = data
    },
    getMenu (action, values, index) {
      if (action !== 'edit') {
        this.menuData.push(values)
      } else {
        this.menuData.splice(index, 1, values)
      }
      this.handleOk()
    },
    compare (listorder) {
      return function (a, b) {
        const value1 = a[listorder]
        const value2 = b[listorder]
        return value1 - value2
      }
    },
    getWay (action, values, index) {
      if (parseInt(values.default) === 1) {
        this.wayData.forEach(item => {
          item.default = '0'
        })
      }
      this.wayData.sort(this.compare('listorder'))
      if (action !== 'edit') {
        this.wayData.push(values)
      } else {
        this.wayData.splice(index, 1, values)
      }
      this.handleOk()
    },
    handleOkWayRule (val) {
      this.wayData.forEach(item => {
        val.forEach(valItem => {
          if (valItem.wayShow && valItem.way === item.alias) {
            const arr = [...item.rule, ...valItem.event]
            item.rule = [...new Set(arr)]
          }
        })
        const array = val.map(strItem => strItem.way)
        if (!array.includes(item.alias)) {
          item.rule = []
        }
      })
      this.currentSelect.wayData = this.wayData
    },
    // 根据显示名称赋值系统名称
    getName (record, e) {
      const pinyin = require('js-pinyin')
      const reg = new RegExp(/^(?![0-9]|_)[a-z0-9_]+$/)
      const reg2 = new RegExp(/^[a-z0-9_]+$/)
      let val = pinyin.getCamelChars(e)
      val = val.toLowerCase()
      val = val.split('')
      this.getVal(val, reg)
      val = val.filter(item => {
        return reg2.test(item)
      })
      this.$set(record, 'alias', val.join(''))
    },
    // 递归判断是否首字不是数字
    getVal (val, reg) {
      if (!reg.test(val[0])) {
        val.shift()
        this.getVal(val, reg)
      }
    },
    getRemarksrule (e) {
      this.remarksrule = e.target.value
      this.currentSelect.remarksrule = e.target.value
    },
    getTriggerTime (e) {
      this.triggerTime = e
      if (e === 'compute') {
        this.triggerTimeCompute = {
          tableid: this.mydata.tableid,
          data: {
            value: ''
          }
        }
      }
      this.currentSelect.triggerTime = e
    },
    onClose () {
      this.$emit('cancel')
    },
    handleCondition () {
      this.$refs.condition2.show({ title: '变迁时限' })
    },
    handleConditionTime () {
      this.$refs.conditionTime.show({ title: '时间设置' })
    },
    getCondition (val) {
      this.custom_compute_setting = val
    },
    getConditionTime (val) {
      this.triggerTimeCompute = val
      this.currentSelect.triggerTimeCompute = val.data
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
    handleSubmit () {
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (!errors) {
          this.currentSelect.transitionUser = this.$refs.condition ? this.$refs.condition.getValue() : this.currentSelect.transitionUser
          this.currentSelect.partuser_remarks = this.partuser_remarks || this.currentSelect.partuser_remarks
          this.currentSelect.fieldPrivData = this.$refs.flowAttrTransitionFieldPriv ? this.$refs.flowAttrTransitionFieldPriv.fieldPrivData : this.currentSelect.fieldPrivData
          this.currentSelect.sla_data = this.sla_data
          this.currentSelect.formsetData = this.formsetData
          this.currentSelect.attachmentData = this.attachmentData
          this.currentSelect.wayDataRule = this.wayDataRule
          this.currentSelect.wayDataAttribute = this.wayDataAttribute
          this.timeLimitData.forEach(item => {
            if (item.condition_visual.length > 0 && item.condition_visual.every(visItem => visItem.type === 'notSet')) {
              const obj = item.condition_visual[0]
              item.condition_visual = []
              item.condition_visual.push(obj)
            } else if (item.condition_visual.length > 1) {
              item.condition_visual = item.condition_visual.filter((visItem, index) => visItem.type !== 'notSet')
            }
            item.condition_visual.forEach(condItem => {
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
          })
          this.currentSelect.restrict_time = this.timeLimitData
          this.params.currentSelect = this.currentSelect
          this.$emit('ok', this.params)
        } else {
          this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改 ')
        }
      })
    }
  }
}
</script>
