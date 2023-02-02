<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible" >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-tabs v-model="activeid" @change="tabChange">
          <a-tab-pane tab="基础设置" key="1">
            <a-divider orientation="left">基础设置</a-divider>
            <a-form-item label="流程名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[workflow_name]', {initialValue: data.workflow_name, rules: [{ required: true, message: '请输入流程名称'}]}]" />
            </a-form-item>
            <a-form-item label="流程对应数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择流程对应数据表" show-search option-filter-prop="children" v-decorator="['info[modelid]', {rules: [{ required: true, message: '请选择流程对应数据表'}], initialValue: data.modelid} ]" @change="getTableFields" >
                <a-select-option v-for="(value, key) in table_lists" :key="key" :value="value.value">{{ value.display }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="创建模式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select v-decorator="['info[setting][create_type]', {initialValue: setting.create_type || 'handle'}]">
                <a-select-option value="auto">自动</a-select-option>
                <a-select-option value="handle">手动</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                业务回调方法
                <a-tooltip :overlayStyle="{width: '500px'}">
                  <div slot="title">
                    <div>1、为方便开发人员基于现有流程引擎进行二次开发，系统中提供了业务回调方法设置，时机到达时系统将自动回调，业务回调类型有活动启用、活动发射、流程取消、流程催办等。</div>
                    <div>2、例如，你设置的回调方法为: crm/workflow/mycallback，则系统会调用crm模块下workflow控制器中的mycallback方法，调用的时候会传递一个参数，开发人员可以使用参数中action对应的值来判断业务回调类型。</div>
                  </div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-input v-decorator="['info[setting][arc_callback]', { initialValue: setting.arc_callback } ]" />
            </a-form-item>
            <a-form-item label="工作日历" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select v-decorator="['info[setting][work_calendar]', {initialValue: setting.work_calendar || ''}]">
                <a-select-option value="">不设置</a-select-option>
                <a-select-option v-for="(calItem,calIndex) in calendar" :key="calIndex" :value="calItem.value">{{ calItem.label }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                流程摘要规则
                <a-tooltip title="{系统名称} 将会替换为字段值">
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[setting][case_name_rule]', {rules: [{ required: true, message: '请输入流程摘要规则'}], initialValue: setting.case_name_rule}]" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                办理方式模板
                <a-tooltip
                  title="{TRANSITION_ACTION}: 变迁操作 {HANDLE_WAY}: 工单办理方式 {系统名称}: 字段值">
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-input v-decorator="['info[setting][template_action]', {initialValue: setting.template_action ? setting.template_action : '{HANDLE_WAY}'}]" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                办理备注模板
                <a-tooltip>
                  <div slot="title">
                    <div>{CURRENT_USER}: 当前变迁处理人</div>
                    <div>{CASE_NAME}: 流程名称</div>
                    <div>{START_DATE}: 流程创建时间</div>
                    <div>{CASE_CREATOR}: 流程创建人</div>
                    <div>{WORKFLOW_NAME}: 所属工作流名称</div>
                    <div>{TRANSITION_NAME}: 变迁名称</div>
                    <div>{CURRENT_DATE}: 当前日期</div>
                    <div>{CURRENT_TIME}: 当前时间</div>
                    <div>{CURRENT_DATETIME}: 当前日期时间</div>
                    <div>{HANDLE_REMARKS}: 工单办理备注</div>
                    <div>{系统名称}: 字段值</div>
                  </div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[setting][template_description]',{initialValue: setting.template_description ? setting.template_description :'{HANDLE_REMARKS}'}]" />
            </a-form-item>
            <a-form-item label="菜单图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input :value="iconObj.type" disabled>
                <a-icon @click="handleMenuIcon" slot="addonAfter" :type="iconObj.type ? iconObj.type : 'profile'" :theme="iconObj.theme"/>
              </a-input>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">备注业务回调
                <a-tooltip >
                  <div slot="title">开启后，当流程执行【备注】操作时，系统会调用该业务方法。</div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-switch v-decorator="[ 'info[setting][remarkCallback]', { initialValue: setting.remarkCallback === '1' , valuePropName: 'checked' } ]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">结束业务回调
                <a-tooltip >
                  <div slot="title">开启后，当流程结束时，系统会调用该业务方法。</div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-switch v-decorator="[ 'info[setting][endCallback]', { initialValue: setting.endCallback === '1' , valuePropName: 'checked' } ]"/>
            </a-form-item>
            <!-- 流程取消 -->
            <a-divider orientation="left">取消原因设置</a-divider>
            <div class="table-operator">
              <a-button v-action:add icon="plus" @click="handleAddSet('repeal')">添加</a-button>
              <a-button icon="edit" @click="openModal('repeal')">批量编辑</a-button>
              <a-button icon="sort-ascending" @click="handleSort('repeal')">排序</a-button>
              <a-button @click="privShow">
                <a-badge :status="repealPriv.length !== 0 ? 'success' : 'default'" />
                强制取消授权</a-button>
              <priv-visit-form ref="privVisitForm" @func="getPriv"/>
            </div>
            <a-table
              ref="table"
              rowKey="id"
              :columns="columnsSet"
              :dataSource="repealdata"
              size="small"
              :pagination="false">
              <template slot="name" slot-scope="text, record">
                <span v-if="!record.editable">{{ text }}</span>
                <a-input v-else v-model="record.name" size="small"/>
              </template>
              <div slot="action" slot-scope="text, record">
                <a @click="handleEditSet(record)">{{ record.editable ? '保存' : '编辑' }}</a>
                <a-divider type="vertical" />
                <a @click="handleDeleteSet(record, 'repeal')">删除</a>
              </div>
            </a-table>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                取消业务回调
                <a-tooltip >
                  <div slot="title">
                    开启后，当流程执行【取消】操作时，系统会调用该业务方法，回调返回值格式为：['errcode' => 0, 'errmsg' => '操作成功']，当errcode≠0时，流程将无法取消，并提示errmsg对应的值。
                  </div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-switch v-decorator="[ 'info[setting][repealCallback]', { initialValue: setting.repealCallback === '1' , valuePropName: 'checked' } ]"/>
            </a-form-item>
            <a-form-item label="取消时流程状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择流程状态" show-search option-filter-prop="children" v-decorator="[ 'info[setting][cancelWorkflow]', { initialValue: setting.cancelWorkflow} ]" >
                <a-select-option v-for="(value, key) in workflowList" :key="key" :value="value.status">{{ value.status }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="取消时流程子状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择流程子状态" show-search option-filter-prop="children" v-decorator="[ 'info[setting][cancelWorkflowSub]', { initialValue: setting.cancelWorkflowSub} ]" >
                <a-select-option v-for="(value, key) in workflowSubList" :key="key" :value="value.status">{{ value.status }}</a-select-option>
              </a-select>
            </a-form-item>
            <!-- 流程催办 -->
            <a-divider orientation="left">催办原因设置</a-divider>
            <div class="table-operator">
              <a-button v-action:add icon="plus" @click="handleAddSet('urge')">添加</a-button>
              <a-button icon="edit" @click="openModal('urge')">批量编辑</a-button>
              <a-button icon="sort-ascending" @click="handleSort('urge')">排序</a-button>
            </div>
            <a-table
              ref="table"
              rowKey="id"
              :columns="columnsSetUrge"
              :dataSource="urgedata"
              size="small"
              :pagination="false">
              <template slot="name" slot-scope="text, record">
                <span v-if="!record.editable">{{ text }}</span>
                <a-input v-else v-model="record.name" size="small"/>
              </template>
              <div slot="action" slot-scope="text, record">
                <a @click="handleEditSet(record)">{{ record.editable ? '保存' : '编辑' }}</a>
                <a-divider type="vertical" />
                <a @click="handleDeleteSet(record, 'urge')">删除</a>
              </div>
            </a-table>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                催办业务回调
                <a-tooltip>
                  <div slot="title">
                    开启后，当流程执行【催办】操作时，系统会调用该业务方法，回调方法返回值格式为：['errcode' => 0, 'errmsg' => '操作成功']，当errcode≠0时，流程将无法催办，并提示errmsg对应的值。
                  </div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-switch v-decorator="[ 'info[setting][urgeCallback]', { initialValue: setting.urgeCallback === '1', valuePropName: 'checked' }]"/>
            </a-form-item>
            <a-divider orientation="left">字段回写设置
              <a-tooltip title="将流程表的字段值回写至流程对应数据表中">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </a-divider>
            <a-button
              style="margin-bottom: 8px"
              @click="()=>{
                writebackData.push({});
                fildStatus[writebackData.length - 1] = {
                  processStatus: 'success',
                  serviceStatus:'success',
                  backStatus:'success',
                  processMsg:'',
                  serviceMsg:'',
                  backMsg:'',
                }
              }">添加</a-button>
            <a-table
              ref="id"
              rowKey="processField"
              :columns="columnsWriteback"
              :dataSource="writebackData"
              size="small"
              v-if="backShow"
              :pagination="false">
              <div slot="action" slot-scope="text, record, index">
                <a @click="writebackData.splice(index, 1)" :disabled="record.required === '1'">删除</a>
              </div>
              <a-form-item
                slot="processField"
                slot-scope="text, record, index"
                :validate-status="fildStatus[index] ? fildStatus[index].processStatus :'success'"
                :help="fildStatus[index] ? fildStatus[index].processMsg :''"
              >
                <a-select
                  :disabled="record.required === '1'"
                  placeholder="流程数据表字段"
                  size="small"
                  show-search
                  option-filter-prop="children"
                  @change="(e) =>{
                    const data = writebackData.filter((item,key) => key !==index)
                    fildStatus[index] = {}
                    if(data.every(item => item.processField !== e )){
                      fildStatus[index].processStatus = 'success' ; fildStatus[index].processMsg = ''
                    }else{
                      $message.error('已存在该流程数据表字段')
                      record.processField = undefined
                    }
                  }"
                  v-model="record.processField"
                >
                  <a-select-option v-for="pro in workflow_field" :key="pro.alias" :value="pro.alias">{{ pro.name }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                :validate-status="fildStatus[index] ? fildStatus[index].serviceStatus :'success'"
                :help="fildStatus[index] ? fildStatus[index].serviceMsg :''"
                slot="serviceField"
                slot-scope="text,record,index">
                <a-select
                  placeholder="请选择业务数据表字段"
                  size="small"
                  show-search
                  option-filter-prop="children"
                  @change="(e) =>{ fildStatus[index].serviceStatus = 'success' ; fildStatus[index].serviceMsg = '' }"
                  v-model="record.serviceField"
                >
                  <a-select-option v-for="(value, key) in table_field" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                :validate-status="fildStatus[index] ? fildStatus[index].backStatus :'success'"
                :help="fildStatus[index] ? fildStatus[index].backMsg :''"
                slot="writebackMode"
                slot-scope="text, record, index">
                <a-select
                  size="small"
                  placeholder="请选择回写模式"
                  @change="(e) =>{ fildStatus[index].backStatus = 'success' ; fildStatus[index].backMsg = ''}"
                  v-model="record.writebackMode"
                >
                  <a-select-option value="1">流程表->业务表</a-select-option>
                  <a-select-option value="2">业务表->流程表</a-select-option>
                </a-select>
              </a-form-item>
            </a-table>
            <a-divider orientation="left">提醒设置</a-divider>
            <a-form-item label="邮件收件人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select mode="multiple" style="width: 100%" placeholder="请选择邮件收件人" v-decorator="['info[setting][fire_email_user]',{initialValue: setting.fire_email_user}]">
                <a-select-option v-for="(value, key) in user_data" :key="key" :value="value.value">{{ value.display }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="邮件抄送人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select mode="multiple" style="width: 100%" placeholder="请选择邮件抄送人" v-decorator="['info[setting][fire_email_cc]',{initialValue: setting.fire_email_cc}]">
                <a-select-option v-for="(value, key) in user_data" :key="key" :value="value.value">{{ value.display }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                邮件标题模板
                <a-tooltip>
                  <div slot="title">
                    <div>{CURRENT_USER}: 当前变迁处理人</div>
                    <div>{CASE_NAME}: 流程名称</div>
                    <div>{START_DATE}: 流程创建时间</div>
                    <div>{CASE_CREATOR}: 流程创建人</div>
                    <div>{WORKFLOW_NAME}: 所属工作流名称</div>
                    <div>{TRANSITION_NAME}: 变迁名称</div>
                    <div>{CURRENT_DATE}: 当前日期</div>
                    <div>{CURRENT_TIME}: 当前时间</div>
                    <div>{CURRENT_DATETIME}: 当前日期时间</div>
                    <div>{系统名称}: 字段值</div>
                  </div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-input v-decorator="['info[setting][template_email_title]', {initialValue: setting.template_email_title}]" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                邮件内容模板
                <a-tooltip>
                  <div slot="title">
                    <div>{CURRENT_USER}: 当前变迁处理人</div>
                    <div>{CASE_NAME}: 流程名称</div>
                    <div>{START_DATE}: 流程创建时间</div>
                    <div>{CASE_CREATOR}: 流程创建人</div>
                    <div>{WORKFLOW_NAME}: 所属工作流名称</div>
                    <div>{TRANSITION_NAME}: 变迁名称</div>
                    <div>{CURRENT_DATE}: 当前日期</div>
                    <div>{CURRENT_TIME}: 当前时间</div>
                    <div>{CURRENT_DATETIME}: 当前日期时间</div>
                    <div>{系统名称}: 字段值</div>
                  </div>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[setting][template_email_content]',{initialValue: setting.template_email_content}]" />
            </a-form-item>
            <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-decorator="['info[workflow_desc]',{initialValue: data.workflow_desc}]" />
            </a-form-item>
            <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
          </a-tab-pane>
          <a-tab-pane tab="查看视图" key="2">
            <a-tabs defaultActiveKey="3">
              <a-tab-pane tab="表单应用" key="3">
                <a-alert message="查看表单视图默认会设置为全部只读，如需要编辑功能，需自定义设置" type="info" show-icon style="margin-bottom: 10px;" />
                <FormApply ref="formapply" :params="{ tplviewArr: tplview_view, tableid: data.modelid}" page="workflowForm" :formviewData="formview"/>
              </a-tab-pane>
              <a-tab-pane tab="扩展按钮" key="4">
                <ExtendButton ref="extendbutton" :extendbarmenuData="extendbarmenu" flowType="workflow"/>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>
          <a-tab-pane tab="流程时限" key="3" v-if="config.action !== 'add'">
            <a-row type="flex" align="middle" style="margin-bottom: 10px">
              <a-col :span="24">
                <a-tooltip placement="bottomLeft">
                  <template slot="title">此处设置的流程时限，在流程创建时生成。后面流程流转时，不会按此处的配置再次生成新的流程时限。若需要在流程流转过程中修改流程时限，请使用公式编辑器。</template>
                  <a-button block type="dashed" @click="addTimeLimit">新增流程时限设置</a-button>
                </a-tooltip>
              </a-col>
            </a-row>
            <a-collapse defaultActiveKey="0">
              <a-collapse-panel v-for="(item, key) in timeLimitData" :key="key" :header="'流程时限-' + (key + 1)">
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
                            @change="(value) => {
                              if (value === 'field') {
                                simpleItem.condition = [ {
                                  include: '',
                                  value: ''
                                }]
                              } else if(value.includes('current')) {
                                $set(simpleItem,'include','bl')
                                simpleItem.condition = [ {
                                  include: '',
                                  value: []
                                }]
                              } }">
                            <a-select-option value="notSet">无条件</a-select-option>
                            <a-select-option value="field">字段</a-select-option>
                            <a-select-option value="currentUser">创建人</a-select-option>
                            <a-select-option value="currentClass">创建人部门</a-select-option>
                            <a-select-option value="currentRole">创建人角色</a-select-option>
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
                                  tableid: condition.tableid,
                                })
                              }">fx</div>
                            <custom-codemirror :ref="'customCodemirrors' +simpleIndex" @ok="(val) =>{ $set(item.condition_visual[showKey], 'customCode', val) }"/>
                          </a-row>
                        </a-col>
                        <a-col :span="4" v-if="simpleItem.type ==='field' && simpleItem.type !== 'custom'">
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
                        <a-col :span="18" v-if="simpleItem.type ==='notSet'"></a-col>
                        <a-col :span="4" style="text-align: center;" v-if="simpleItem.type !=='field' && simpleItem.type !== 'custom' && simpleItem.type !== 'notSet'">
                          <a-select size="small" v-model="simpleItem.include">
                            <a-select-option value="bl">属于</a-select-option>
                            <a-select-option value="nbl">不属于</a-select-option>
                          </a-select>
                        </a-col>
                        <a-col :span="14" style="border: 1px solid #E8E8E8; margin-bottom: 4px" v-if="simpleItem.type !== 'custom' && simpleItem.type !== 'notSet'">
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
                                        mode="multiple"
                                        :open="false"
                                        placeholder="请选择"
                                        allowClear
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
                                        recordKey.index = key
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
                                        mode="multiple"
                                        placeholder="请选择部门"
                                        :open="false"
                                        allowClear
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
                                <a-col :span="20" style="padding-right: 14px;" v-else-if="simpleItem.type ==='currentRole'">
                                  <a-row type="flex" align="middle">
                                    <a-col :span="23">
                                      <a-select
                                        size="small"
                                        placeholder="请选择角色"
                                        :open="false"
                                        v-model="includeItem.value"
                                        allowClear
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
                                <a-col :span="4" style="display: flex; align-items: center; justify-content: center">
                                  <a-icon :style="{ fontSize: '24px', color: '#52c41a'}" type="plus-square" theme="filled" @click="simpleItem.type === 'field' ? simpleItem.condition.splice(includeIndex + 1, 0, {include: '',value: undefined}) : simpleItem.condition.splice(includeIndex +1, 0, {include: '',value: []})" />
                                  <a-icon :style="{ fontSize: '24px', color: simpleItem.condition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="simpleItem.condition.length === 1 ? '' : simpleItem.condition.splice(includeIndex, 1)"/>
                                </a-col>
                              </a-row>
                            </a-col>
                            <a-col :span="4" style="text-align: center">
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
                            @click="item.condition_visual.splice(simpleIndex + 1, 0, {
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
                          <a-icon :style="{ fontSize: '24px', color: item.condition_visual.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }" type="minus-square" theme="filled" @click="item.condition_visual.length === 1 ? '' : item.condition_visual.splice(simpleIndex, 1)" />
                        </a-col>
                      </a-row>
                    </a-col>
                    <a-col :span="2">
                      <a-select v-model="item.logic" style="width: 80px" size="small">
                        <a-select-option value="and">且(and)</a-select-option>
                        <a-select-option value="or">或(or)</a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-card>
                <a-divider orientation="left">流程时限：那么</a-divider>
                <a-form-item label="工作日历" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}">
                  <a-row>
                    <a-col :span="7">
                      <a-select v-model="item.work_calendar">
                        <a-select-option value="0">继承流程全局设置</a-select-option>
                        <a-select-option v-for="(calItem,calIndex) in calendar" :key="calIndex" :value="calItem.value">{{ calItem.label }}</a-select-option>
                        <a-select-option value="1">不设置</a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-form-item>
                <a-form-item label="流程时限" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}" :required="true">
                  <a-row :gutter="5">
                    <a-col :span="1">以</a-col>
                    <a-col :span="10">
                      <a-select v-model="item.base_time">
                        <a-select-option value="0">流程创建时间</a-select-option>
                        <a-select-option value="1">字段值时间</a-select-option>
                        <a-select-option value="2">自定义</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="10">
                      <a-select v-model="item.fieldValue" v-if="item.base_time === '1'">
                        <a-select-option :value="field.alias" v-for="field in fieldDate" :key="field.fieldid">{{ field.name }}</a-select-option>
                      </a-select>
                      <a-button @click="$refs['condition' + key][0].show({ title: '流程时限' })" v-if="item.base_time === '2'" >通过业务数据计算</a-button>
                      <condition :ref="'condition' + key" :params="{ data: item.custom_compute_setting, tableid: condition.tableid}" @ok="(val)=> { item.custom_compute_setting = val.data }"/>
                    </a-col>
                    <a-col :span="3">为基准时间</a-col>
                  </a-row>
                  <a-row :gutter="5">
                    <a-col :span="1">从</a-col>
                    <a-col :span="10">
                      <a-select v-model="item.time_starts">
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
                      <a-select v-model="item.calculation_time">
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
                          <a-select v-model="item.field_alias" >
                            <a-select-option :value="field.alias" v-for="field in fieldNumber" :key="field.fieldid">{{ field.name }}</a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                    </a-col>
                    <a-col :span="17" v-if="item.calculation_time === '2'">
                      <a-button @click="$refs['conditions' + key][0].show({ title: '流程时限: 计算时长' })">通过业务数据计算</a-button>
                    </a-col>
                    <a-col :span="3">计算时长</a-col>
                    <condition :ref="'conditions' + key" :params="{ data: item.calculation_setting, tableid: condition.tableid }" @ok="(val)=> { item.calculation_setting = val.data }"/>
                  </a-row>
                </a-form-item>
                <a-form-item label="预警时限" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}">
                  <a-row :gutter="5">
                    <a-col :span="7">
                      <a-select v-model="item.workflow_warn_restrict">
                        <a-select-option value="warn_not_set">不设置</a-select-option>
                        <a-select-option value="warn_percent">时限百分比</a-select-option>
                        <a-select-option value="warn_custom">自定义</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="17" v-if="item.workflow_warn_restrict === 'warn_percent'">
                      <span style="padding-right: 10px">流程时限 *</span>
                      <a-input-number
                        v-model="item.warn_percent_setting"
                        :min="1"
                        :max="99"
                        :formatter="value => `${value}%`"
                        :parser="value => value.replace('%', '')"
                      />
                    </a-col>
                    <a-col :span="17" v-if="item.workflow_warn_restrict === 'warn_custom'">
                      <span style="padding-right: 5px">流程时限到达前</span>
                      <a-input-number :min="0" v-model="item.warn_custom_day" />
                      <span style="padding: 0 5px 0 5px">天</span>
                      <a-input-number :min="0" :max="23" v-model="item.warn_custom_hour" />
                      <span style="padding: 0 5px 0 5px">小时</span>
                      <a-input-number :min="0" :max="59" v-model="item.warn_custom_minute"/>
                      <span style="padding-left: 5px">分钟</span>
                    </a-col>
                  </a-row>
                </a-form-item>
                <a-form-item label="超时时限" :labelCol="{ span: 2 }" :wrapperCol="{span: 22}">
                  <a-row :gutter="5">
                    <a-col :span="7">
                      <a-select v-model="item.workflow_serious_restrict" >
                        <a-select-option value="serious_not_set">不设置</a-select-option>
                        <a-select-option value="serious_percent">时限百分比</a-select-option>
                        <a-select-option value="serious_custom">自定义</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="17" v-if="item.workflow_serious_restrict === 'serious_percent'">
                      <span style="padding-right: 10px">流程时限 *</span>
                      <a-input-number
                        v-model="item.serious_percent_setting"
                        :min="100"
                        :formatter="value => `${value}%`"
                        :parser="value => value.replace('%', '')"
                      />
                    </a-col>
                    <a-col :span="17" v-if="item.workflow_serious_restrict === 'serious_custom'">
                      <span style="padding-right: 5px">流程时限到达后</span>
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
          <a-tab-pane tab="SLA" key="4" v-if="config.action !== 'add'">
            <workflow-form-sla
              ref="workflowFormSla"
              :workflowtype="'work'"
              :slaData="sla_data"
              @ok="getSla"
              :fieldArr="fieldArr"
              :department="department"
              :role="role"
              :userArr="userArr"
              :tableid="condition.tableid"
              :workflowId="config.record ? config.record.workflow_id : ''" />
          </a-tab-pane>
          <a-tab-pane tab="通知" key="5">
            <workflow-form-notice ref="workflowFormNotice" :notice="notice"/>
          </a-tab-pane>
          <a-tab-pane tab="流程状态设置" key="6">
            <a-row :gutter="10">
              <a-col :span="12">
                <a-card title="状态设置" size="small">
                  <a-button size="small" @click="openModal('workflow')">批量编辑</a-button>
                  <a-table
                    style="margin-top: 10px;"
                    size="small"
                    rowKey="id"
                    :columns="columnsStatus"
                    :data-source="workflowList"
                    :pagination="false">
                    <template slot="action" slot-scope="text, record, index">
                      <a href="javascript:void(0)" v-if="!record.editable" @click="handleEdit(record, index, 'workflow')" :disabled="record.status === '已取消'">编辑</a>
                      <a href="javascript:void(0)" v-else @click="handleBlur(record, index, 'workflow')">保存</a>
                      <a-divider type="vertical" />
                      <a href="javascript:void(0)" :disabled="record.status === '已取消'" @click="handleDel(index, 'workflow')" >删除</a>
                    </template>
                    <template slot="status" slot-scope="text, record, index">
                      <span v-if="!record.editable">{{ text }}</span>
                      <a-input v-else v-model="record.status" size="small" @blur="handleBlur(record, index, 'workflow')" />
                    </template>
                  </a-table>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="子状态设置" size="small">
                  <a-button size="small" @click="openModal('workflowSub')">批量编辑</a-button>
                  <a-table
                    style="margin-top: 10px;"
                    size="small"
                    rowKey="id"
                    :columns="columnsSubstatus"
                    :data-source="workflowSubList"
                    :pagination="false">
                    <template slot="action" slot-scope="text, record, index">
                      <a href="javascript:void(0)" v-if="!record.editable" @click="handleEdit(record, index, 'workflowSub')">编辑</a>
                      <a href="javascript:void(0)" v-else @click="handleBlur(record, index, 'workflowSub')">保存</a>
                      <a-divider type="vertical" />
                      <a href="javascript:void(0)" :disabled="workflowSubList.length === 1" @click="handleDel(index, 'workflowSub')">删除</a>
                    </template>
                    <template slot="status" slot-scope="text, record, index">
                      <span v-if="!record.editable">{{ text }}</span>
                      <a-input v-else v-model="record.status" size="small" @blur="handleBlur(record, index, 'workflowSub')" />
                    </template>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane tab="操作按钮" key="7">
            <Tool
              ref="tool"
              :barmenu="barmenu"
              :config="configdata"
              @func="getBarMenus"/>
          </a-tab-pane>
        </a-tabs>
        <menu-icon :key="refreshKey" @ok="getIcon" ref="menuIcon"></menu-icon>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <a-modal title="批量编辑" :visible="editVisible" @ok="handleOk" @cancel="editVisible = !editVisible" >
      <a-textarea v-model="edits" :auto-size="{ minRows: 7, maxRows: 10 }" placeholder="请输入" />
    </a-modal>
    <select-user-form ref="selectUserForm" @ok="getUser"/>
    <select-department ref="selectDepartment" @ok="getDepartment"/>
  </a-drawer>
</template>
<script>
import { Collapse } from 'ant-design-vue'
import { workflowButton } from './Table/DefaultButton'
import Vue from 'vue'
Vue.use(Collapse)
export default {
  components: {
    FormApply: () => import('./Table/FormApply'),
    ExtendButton: () => import('./Table/ExtendButton'),
    MenuIcon: () => import('./Menu/MenuIcon'),
    Condition: () => import('./Table/Condition'),
    WorkflowFormSla: () => import('./WorkflowFormSla'),
    WorkflowFormNotice: () => import('./WorkflowFormNotice'),
    Codemirror: () => import('@/views/admin/Formula/Codemirror'),
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    QuerierCodemirrorInput: () => import('@/views/admin/Table/QuerierCodemirrorInput'),
    CustomCodemirror: () => import('@/views/admin/Flow/modules/CustomCodemirror'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    PrivVisitForm: () => import('@/views/admin/Table/PrivVisitForm'),
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm'),
    SelectDepartment: () => import('@/views/admin/UserTable/SelectDepartment'),
    Tool: () => import('./Table/Tool')
  },
  data () {
    return {
      config: {},
      activeid: '1',
      condition: {
        data: {}
      },
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      refreshKey: 0,
      recordKey: {},
      visible: false,
      editVisible: false,
      loading: false,
      data: {},
      form: this.$form.createForm(this),
      table_lists: [],
      user_data: [],
      setting: {},
      formview: [],
      tplview_view: [],
      extendbarmenu: [],
      table_field: [],
      fieldArr: [],
      iconObj: {},
      showKey: null,
      columnsSet: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        width: 80,
        dataIndex: 'listorder'
      }, {
        title: '取消原因',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      }],
      columnsSetUrge: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        width: 80,
        dataIndex: 'listorder'
      }, {
        title: '催办原因',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      }],
      fildStatus: [
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' },
        { serviceStatus: 'success', serviceMsg: '' }],
      backShow: true,
      writebackData: [{
        processField: 'workflow_id',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'case_id',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'case_status',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'username',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'transition_user',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'completed_user',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'transition_status',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'arc_status',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }, {
        processField: 'case_number',
        serviceField: undefined,
        writebackMode: '1',
        required: '1'
      }],
      columnsWriteback: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        width: 40,
        dataIndex: 'id',
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '流程数据表字段',
        dataIndex: 'processField',
        scopedSlots: { customRender: 'processField' }
      }, {
        title: '业务数据表字段',
        width: 350,
        dataIndex: 'serviceField',
        scopedSlots: { customRender: 'serviceField' }
      }, {
        title: '回写模式',
        width: 250,
        dataIndex: 'writebackMode',
        scopedSlots: { customRender: 'writebackMode' }
      }],
      workflow_field: [],
      repealdata: [],
      repealPriv: [],
      // 工作日历
      calendar: [],
      tagOption: [],
      timeLimitData: [{
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
      fieldDate: [],
      notice: {},
      urgedata: [],
      userArr: [],
      role: {},
      department: [],
      columnsStatus: [{
        title: '操作',
        width: 100,
        dataIndex: 'action',
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        dataIndex: '#',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '流程状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' }
      }],
      columnsSubstatus: [{
        title: '操作',
        width: 100,
        dataIndex: 'action',
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        dataIndex: '#',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '子状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' }
      }],
      workflowList: [
        { id: 0, status: '已取消', editable: false }
      ],
      workflowSubList: [
        { id: 0, status: '', editable: true }
      ],
      edits: '', // 批量编辑
      configdata: {
        action: 'add',
        variable: 'workflow_list'
      },
      barmenu: []
    }
  },
  // 祖先级组件数据传递，以及被子孙级组件动态修改
  provide () {
    this.theme = Vue.observable({
      viewData: {}
    })
    return {
      theme: this.theme
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.configdata.action = config.action
      this.activeid = '1'
      this.axios({
        url: this.config.url,
        params: Object.assign({ workflow_id: config.record ? config.record.workflow_id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
        this.theme.viewData.tableid = this.data.modelid
        this.workflow_field = res.result.workflow_field
        this.condition.tableid = this.data.modelid
        this.notice = res.result.notice || {}
        this.table_lists = res.result.table_lists
        this.table_field = res.result.table_field
        this.user_data = res.result.user_data
        this.setting = res.result.setting
        this.barmenu = this.setting.barmenus || workflowButton
        this.sla_data = this.setting.sla_data
        this.iconObj = this.setting.icon ? this.setting.icon : { type: 'profile' }
        if (res.result.setting.writebackData) {
          const writebackData = JSON.parse(JSON.stringify(this.writebackData))
          this.writebackData = res.result.setting.writebackData
          writebackData.forEach((item, index) => {
            if (this.writebackData.findIndex(dataItem => dataItem.processField === item.processField) === -1) {
              this.writebackData.splice(index, 0, item)
            }
          })
          this.fildStatus = this.writebackData.map(item => {
            const obj = {
              processStatus: 'success',
              serviceStatus: 'success',
              backStatus: 'success',
              processMsg: '',
              serviceMsg: '',
              backMsg: ''
            }
            return obj
          })
        }
        this.workflowList = this.setting.transition_status_data ? this.setting.transition_status_data : this.workflowList
        if (this.workflowList.every(item => item.status !== '已取消')) {
          this.workflowList.splice(0, 0, {
            editable: '',
            id: new Date().getTime(),
            status: '已取消'
          })
        }
        this.workflowSubList = this.setting.arc_status_data ? this.setting.arc_status_data : this.workflowSubList
        this.formview = res.result.setting.formview || []
        this.tplview_view = res.result.tplview_view
        this.extendbarmenu = this.setting.extendbarmenu
        this.repealdata = this.setting.repealdata
        this.repealPriv = this.setting.repealPriv || []
        this.urgedata = this.setting.urgedata
      })
      this.axios({
        url: 'admin/Calendar/getCalendar'
      }).then(res => {
        this.calendar = res.result.option
      })
    },
    tabChange (e) {
      if (e === '3' || e === '4') {
        // 请求所有的部门，角色，用户列表
        if (this.fieldArr.length === 0) {
          this.axios({
            url: '/admin/field/init',
            params: {
              pageNo: 1,
              pageSize: 1000,
              sortField: 'id',
              sortOrder: 'ascend',
              tableid: this.data.modelid
            }
          }).then(res => {
            this.fieldArr = res.result.data.filter(item => {
              return ['text', 'textarea', 'radio', 'checkbox', 'combobox', 'number', 'datetime', 'cascader', 'associated', 'address', 'treeselect', 'tag'].indexOf(item.formtype) !== -1
            })
            this.fieldDate = res.result.data.filter(item => item.formtype === 'datetime')
            this.fieldNumber = res.result.data.filter(item => item.formtype === 'number')
            if (this.setting.restrict_time && !this.setting.restrict_time.workflow_restrict) {
              // 遍历规则
              this.setting.restrict_time.forEach((dataItem, dataIndex) => {
                dataItem.condition_visual.forEach((simpleItem, simpleIndex) => {
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
                  }
                })
              })
              this.timeLimitData = this.setting.restrict_time
            }
          })
        }
      }
    },
    getUser (data, index, conIndex, modeCheck) {
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
    handleSort (type) {
      if (type === 'repeal') {
        this.$refs.flowAttrTransitionSort.show({
          title: '排序',
          data: this.repealdata,
          state: type
        })
      } else {
        this.$refs.flowAttrTransitionSort.show({
          title: '排序',
          data: this.urgedata,
          state: type
        })
      }
    },
    privShow () {
      this.$refs.privVisitForm.show({
        action: 'edit',
        title: '强制取消授权',
        record: {
          repealPriv: JSON.stringify(this.repealPriv)
        },
        key: 'repealPriv',
        selectType: 'radio',
        privArr: {
          visit: '可访问'
        },
        defaultpriv: 'visit'
      })
    },
    getPriv (all, data) {
      this.repealPriv = data
    },
    getSort (data, state) {
      if (state === 'repeal') {
        this.$set(this, 'repealdata', data)
      } else {
        this.$set(this, 'urgedata', data)
      }
    },
    addTimeLimit () {
      this.timeLimitData.splice(0, 0, {
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
    getTableFields (tableid) {
      return this.axios({
        url: '/admin/tplview/getFields',
        params: Object.assign({ tableid: tableid })
      }).then(res => {
        this.table_field = res.result.field
      })
    },
    // 显示图标库
    handleMenuIcon () {
      this.refreshKey = this.refreshKey ? 1 : 0
      this.$nextTick(() => {
        this.$refs.menuIcon.show()
      })
    },
    // 获取图标
    getIcon (value) {
      this.iconObj = value
    },
    getCondition (val) {
      this.custom_compute_setting = val.data.value
    },
    handleCondition () {
      this.$refs.condition.show({ title: '流程时限' })
    },
    getSla (data) {
      this.sla_data = data
    },
    handleAddSet (type) {
      if (type === 'repeal') {
        this.repealdata.push({
          id: (new Date()).valueOf(),
          listorder: this.repealdata.length + 1,
          name: '',
          editable: true
        })
      } else {
        this.urgedata.push({
          id: (new Date()).valueOf(),
          listorder: this.urgedata.length + 1,
          name: '',
          editable: true
        })
      }
    },
    handleEditSet (record, index, type) {
      record.editable = !record.editable
    },
    handleDeleteSet (record, type) {
      if (type === 'repeal') {
        const dataSource = [...this.repealdata]
        this.repealdata = dataSource.filter(item => item.id !== record.id)
      } else {
        const dataSource = [...this.urgedata]
        this.urgedata = dataSource.filter(item => item.id !== record.id)
      }
    },
    // 流程状态设置
    // 增加
    addFlow (workflowList) {
      const obj = {}
      obj.id = new Date().valueOf() + workflowList.length
      obj.status = ''
      obj.editable = true
      workflowList.push(obj)
    },
    handleEditAll () {

    },
    handleEdit (record, index, workflowType) {
      record.editable = true
    },
    handleSave (record, key) {
      record.editable = false
    },
    // 流程状态删除
    handleDel (index, workflowType) {
      if (workflowType === 'workflow') {
        this.workflowList.splice(index, 1)
      } else {
        this.workflowSubList.splice(index, 1)
      }
    },
    // 输入框失去焦点
    handleBlur (record, key, type) {
      if (type === 'workflow') {
        const array = this.workflowList.filter((item, index) => index !== key)
        if (!record.status) {
          this.$message.error('请重新输入流程状态')
        } else if (array.some(item => { return item.status === record.status })) {
          this.$message.error('流程状态重复，请重新输入')
        } else {
          record.editable = false
        }
      } else {
        const array = this.workflowSubList.filter((item, index) => index !== key)
        if (!record.status) {
          this.$message.error('请重新输入子状态')
        } else if (array.some(item => { return item.status === record.status })) {
          this.$message.error('子状态重复，请重新输入')
        } else {
          record.editable = false
        }
      }
    },
    // 显示公式编辑器
    handleCodemirror (item, key, index) {
      this.$refs.customCodemirror.show({
        title: '公式编辑器',
        item: item,
        tableid: this.condition.tableid,
        key: key,
        index: index
      })
    },
    // 打开批量编辑
    openModal (type) {
      this.workflowType = type
      if (type !== 'urge' && type !== 'repeal') {
        const workflowList = type === 'workflow' ? this.workflowList : this.workflowSubList
        const arr = workflowList.map(item => item.status).filter(items => items !== '已取消')
        this.edits = arr.join('\n')
        this.editVisible = true
      } else if (type === 'urge') {
        const arr = this.urgedata.map(item => item.name)
        this.edits = arr.join('\n')
        this.editVisible = true
      } else if (type === 'repeal') {
        const arr = this.repealdata.map(item => item.name)
        this.edits = arr.join('\n')
        this.editVisible = true
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
    // 批量编辑
    handleOk () {
      if (this.workflowType !== 'urge' && this.workflowType !== 'repeal') {
        const workflowList = this.workflowType === 'workflow' ? this.workflowList : this.workflowSubList
        let arr = this.edits.trim().split('\n')
        const arrSet = new Set(arr)
        // 去重，不允许重复字段
        arr = [...arrSet]
        const index = arr.indexOf('已取消')
        if (index !== -1) {
          arr.splice(index, 1)
        }
        const ids = workflowList.map(item => item.id)
        let list = []
        arr.forEach((item, index) => {
          const obj = {}
          if (ids[index]) {
            obj.id = ids[index]
            obj.status = item
            obj.editable = false
          } else {
            obj.id = new Date().valueOf() + index
            obj.status = item
            obj.editable = false
          }
          list.push(obj)
        })
        // 状态流程，子状态
        if (this.workflowType === 'workflow') {
          list = [...new Set(list)]
          list.splice(0, 0, {
            id: new Date().getTime(),
            status: '已取消',
            editable: false
          })
          this.workflowList = list
        } else {
          list = [...new Set(list)]
          this.workflowSubList = list
        }
      } else if (this.workflowType === 'urge') {
        let arr = this.edits.trim().split('\n')
        arr = Array.from(new Set(arr))
        this.urgedata = []
        arr.forEach((item, index) => {
          const obj = {
            editable: '',
            id: new Date().getTime() + index,
            listorder: index + 1,
            name: item
          }
          this.urgedata.push(obj)
        })
      } else if (this.workflowType === 'repeal') {
        let arr = this.edits.trim().split('\n')
        arr = Array.from(new Set(arr))
        this.repealdata = []
        arr.forEach((item, index) => {
          const obj = {
            editable: '',
            id: new Date().getTime() + index,
            listorder: index + 1,
            name: item
          }
          this.repealdata.push(obj)
        })
      }
      this.editVisible = false
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
    // 数组对象排序
    compare (property) {
      return (obj1, obj2) => {
        const val1 = obj1[property]
        const val2 = obj2[property]
        return val1 - val2
      }
    },
    // 获取操作按钮配置
    getBarMenus (data) {
      this.barmenu = data.sort(this.compare('listorder'))
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          let barMenus = this.$refs.tool ? this.$refs.tool.myBarMenus : this.barmenu
          barMenus = barMenus.sort(this.compare('listorder'))
          this.writebackData.forEach((item, index) => {
            if (!item.processField) {
              this.$set(this.fildStatus, index, {
                processStatus: 'error',
                processMsg: '请选择流程数据表字段'
              })
            }
            if (!item.serviceField) {
              this.backShow = false
              this.$set(this.fildStatus[index], 'serviceStatus', 'error')
              this.$set(this.fildStatus[index], 'serviceMsg', '请选择业务数据表字段')
              this.$nextTick(() => {
                this.backShow = true
              })
            }
            if (!item.writebackMode) {
              this.backShow = false
              this.$set(this.fildStatus[index], 'backStatus', 'error')
              this.$set(this.fildStatus[index], 'backMsg', '请选择回写模式')
              this.$nextTick(() => {
                this.backShow = true
              })
            }
          })
          if (this.writebackData.some(item => !item.processField) || this.writebackData.some(item => !item.serviceField) || this.writebackData.some(item => !item.writebackMode)) {
            this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
            return
          }
          values.info.setting.formview = this.$refs.formapply ? this.$refs.formapply.formview : this.setting.formview
          values.info.setting.extendbarmenu = this.$refs.extendbutton ? this.$refs.extendbutton.extendbarmenu : this.extendbarmenu
          values.info.setting.repealdata = this.repealdata
          values.info.setting.writebackData = this.writebackData
          values.info.setting.repealPriv = this.repealPriv
          values.info.setting.urgedata = this.urgedata
          values.info.setting.repealCallback = values.info.setting.repealCallback ? '1' : '0'
          values.info.setting.urgeCallback = values.info.setting.urgeCallback ? '1' : '0'
          values.info.setting.remarkCallback = values.info.setting.remarkCallback ? '1' : '0'
          values.info.setting.endCallback = values.info.setting.endCallback ? '1' : '0'
          values.info.setting.sla_data = this.sla_data
          values.info.setting.notice = this.$refs.workflowFormNotice && this.$refs.workflowFormNotice.form ? this.$refs.workflowFormNotice.form.getFieldsValue().info : {}
          values.info.setting.icon = this.iconObj
          values.info.setting.transition_status_data = this.workflowList.filter(item => !item.editable)
          values.info.setting.arc_status_data = this.workflowSubList.filter(item => !item.editable)
          this.timeLimitData.forEach(item => {
            if (item.condition_visual.length > 0 && item.condition_visual.every(item => item.type === 'notSet')) {
              const obj = item.condition_visual[0]
              item.condition_visual = []
              item.condition_visual.push(obj)
            } else if (item.condition_visual.length > 1) {
              item.condition_visual = item.condition_visual.filter((item, index) => item.type !== 'notSet')
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
                delete condItem.formtype
              } else if (condItem.type === 'custom') {
                delete condItem.alias
                delete condItem.condition
              } else if (condItem.type !== 'custom' && condItem.type !== 'field') {
                delete condItem.alias
                delete condItem.customCode
              }
            })
          })

          values.info.setting.restrict_time = this.timeLimitData
          values.info.setting.barmenus = barMenus
          this.loading = true
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { workflow_id: this.data.workflow_id })
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
            }
          })
        } else {
          this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
        }
      })
    }
  }
}
</script>
