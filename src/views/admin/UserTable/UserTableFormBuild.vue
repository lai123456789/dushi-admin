<template>
  <!-- 标签页布局 -->
  <a-tabs
    v-if="record.type === 'tabs'"
    :default-active-key="0"
    :tabBarGutter="Number(record.options.tabBarGutter)"
    :type="record.options.type"
    :size="record.options.size"
    :tabPosition="record.options.tabPosition"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <a-tab-pane
      v-for="(tabItem, index) in record.columns.filter(item => {
        if(item.label === '流程日志' || item.label === '催办日志'){
          if(parentParams.case_id){
            return item
          }else{
            return false
          }
        }else if(item.filterStatus){
          return false
        }else{
          return item
        }
      })"
      :key="index"
      :tab="tabItem.label"
    >
      <buildBlocks
        v-show="tabItem.label !== '知识库'"
        ref="nestedComponents"
        v-for="(item, keys) in tabItem.list"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :key="item.key"
        :record.sync="tabItem.list[keys]"
        :indexs="keys"
        :viewThis="viewThis"
        :formConfig="formConfig"
        :tableName="tableName"
        :templateObj="templateObj"
        :formdata="formdata"
        :handleWayData="handleWayData"
        :params="params"
        :formThis="formThis"
        :linkData="linkData"
        :parentParams="parentParams"
        :fieldRule="fieldRule"
        :config="config"
        :templateOther="templateOther"
        @give="giveData"
        @changeTem="changeTem"
        @templateRule="templateRule"
        @recoveryRule="recoveryRule"
        @sendEvent="sendEvent"
        @wayRule="wayRule"
        @resetTem="resetTem"
        @sentLinkData="sentLinkData"
        @getRuleAlias="getRuleAlias"
        @cardAdd="(data, index)=>{tabItem.list.splice(index + 1, 0, data)}"
        @cardDel="(index)=>{tabItem.list.splice(index, 1)}"
      />
      <div v-if="tabItem.label === '知识库'">
        <knowledge ref="knowledge" />
      </div>
    </a-tab-pane>
  </a-tabs>
  <!-- 栅格布局 -->
  <a-row
    v-else-if="record.type === 'grid'"
    style="display: flex; flex-flow: row wrap;"
    :gutter="Number(record.options.gutter)"
  >
    <a-col
      :class="parentParams.popscreenType && colItem.list.every(item => item.type !== 'field') ? 'temStyle' : ''"
      v-for="(colItem, index) in record.columns"
      :key="index"
      :span="colItem.span || 0"
      v-show="colItem.list.length > 0"
    >
      <buildBlocks
        ref="nestedComponents"
        v-for="(item, keys) in colItem.list"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :key="item.key"
        :viewThis="viewThis"
        :record.sync="colItem.list[keys]"
        :indexs="keys"
        :formConfig="formConfig"
        :tableName="tableName"
        :templateObj="templateObj"
        :formdata="formdata"
        :handleWayData="handleWayData"
        :params="params"
        :formThis="formThis"
        :linkData="linkData"
        :parentParams="parentParams"
        :fieldRule="fieldRule"
        :config="config"
        :templateOther="templateOther"
        @give="giveData"
        @changeTem="changeTem"
        @templateRule="templateRule"
        @recoveryRule="recoveryRule"
        @sendEvent="sendEvent"
        @wayRule="wayRule"
        @resetTem="resetTem"
        @sentLinkData="sentLinkData"
        @getRuleAlias="getRuleAlias"
        @cardAdd="(data, index)=>{colItem.list.splice(index + 1, 0, data)}"
        @cardDel="(index)=>{colItem.list.splice(index, 1)}"
      />
    </a-col>
  </a-row>
  <!-- 卡片布局 -->
  <a-card
    v-else-if="record.type === 'card'"
    :bordered="record.bordered === '1' || !record.bordered"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <a-row slot="title" v-if="record.label" type="flex" align="middle">
      <a-col :span="12">
        <span v-if="record.addShow === '1' && parentParams.popscreenType">
          <a-space>
            <a href="javascript:;" @click="chioseFill">{{ record.label + ' ('+ record.index +')' }}</a>
            <a-icon type="check-circle" theme="filled" style="color:#52c41a" v-if="record.key === viewThis.cardKey"/>
          </a-space>
        </span>
        <span v-else>{{ record.label }}</span>
      </a-col>
      <a-col :span="12" style="text-align: right">
        <a-space>
          <a-button size="small" v-if="record.key && JSON.stringify(record.key).indexOf('card') === -1" @click="delCard" type="danger">删除</a-button>
          <a-button size="small" v-if="record.addShow === '1' && parentParams.popscreenType" @click="cardAddChange" type="primary">添加</a-button>
        </a-space>
      </a-col>
    </a-row>
    <buildBlocks
      v-for="(item, keys) in record.list"
      :disabled="disabled"
      :dynamicData="dynamicData"
      :viewThis="viewThis"
      :key="item.key"
      :record.sync="record.list[keys]"
      :indexs="keys"
      :formConfig="formConfig"
      :tableName="tableName"
      :templateObj="templateObj"
      :formdata="formdata"
      :handleWayData="handleWayData"
      :params="params"
      :formThis="formThis"
      :linkData="linkData"
      :parentParams="parentParams"
      :fieldRule="fieldRule"
      :config="config"
      :templateOther="templateOther"
      @give="giveData"
      @changeTem="changeTem"
      @templateRule="templateRule"
      @recoveryRule="recoveryRule"
      @sendEvent="sendEvent"
      @wayRule="wayRule"
      @resetTem="resetTem"
      @sentLinkData="sentLinkData"
      @getRuleAlias="getRuleAlias"
      @cardAdd="(data, index)=>{record.list.splice(index + 1, 0, data)}"
      @cardDel="(index)=>{record.list.splice(index, 1)}"
    />
    <check-warranty-period ref="checkWarrantyPeriod"/>
  </a-card>
  <!-- 表格布局 -->
  <table
    v-else-if="record.type === 'table'"
    class="kk-table-9136076486841527"
    :class="{
      bright: record.options.bright,
      small: record.options.small,
      bordered: record.options.bordered
    }"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <tr v-for="(trItem, trIndex) in record.trs" :key="trIndex">
      <td
        class="table-td"
        v-for="(tdItem, tdIndex) in trItem.tds"
        v-show="Number(tdItem.colspan) && Number(tdItem.rowspan)"
        :key="tdIndex"
        :style="tdItem.middle ? { verticalAlign: 'middle' } : {}"
        :colspan="Number(tdItem.colspan)"
        :rowspan="Number(tdItem.rowspan)"
      >
        <buildBlocks
          ref="nestedComponents"
          v-for="(item, keys) in tdItem.list"
          :disabled="disabled"
          :dynamicData="dynamicData"
          :key="item.key"
          :viewThis="viewThis"
          :record.sync="tdItem.list[keys]"
          :indexs="keys"
          :formConfig="formConfig"
          :tableName="tableName"
          :handleWayData="handleWayData"
          :templateObj="templateObj"
          :formdata="formdata"
          :params="params"
          :formThis="formThis"
          :linkData="linkData"
          :parentParams="parentParams"
          :fieldRule="fieldRule"
          :config="config"
          :templateOther="templateOther"
          @give="giveData"
          @changeTem="changeTem"
          @templateRule="templateRule"
          @recoveryRule="recoveryRule"
          @sendEvent="sendEvent"
          @wayRule="wayRule"
          @resetTem="resetTem"
          @sentLinkData="sentLinkData"
          @getRuleAlias="getRuleAlias"
          @cardAdd="(data, index)=>{tdItem.list.splice(index + 1, 0, data)}"
          @cardDel="(index)=>{tdItem.list.splice(index, 1)}"
        />
      </td>
    </tr>
  </table>
  <div v-else>
    <!-- 单行文本 -->
    <a-form-item v-if="record.field && record.field.formtype === 'text' && record.fieldrule !== 'hidden'" :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol" :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol">
      <span slot="label">
        <a-tooltip placement="top" v-if="record.field.setting.attribute.help">
          <template slot="title">
            <span>{{ record.field.setting.attribute.help }}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
        <a-tooltip placement="top" >
          <template slot="title">{{ record.change_title ? record.change_title : record.field.name }}</template>
          {{ record.change_title ? record.change_title : record.field.name }}
        </a-tooltip>
      </span>
      <template v-if="record.fieldrule === 'readonly' && record.field.value && record.field.setting.autofill && record.field.setting.autofill.source && record.field.setting.autofill.source.length > 0">
        <a-button type="link" @click="getLinkList(record)" style="padding: 0;">
          {{ record.field.value }}
        </a-button>
      </template>
      <div v-else>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 4px">
          <a-input
            v-if="record.field.setting.form.inputType !== 'password'"
            allowClear
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
              initialValue: record.field.value,
              rules: [{ required: record.field.setting.attribute.required === 'true',
                        message: (record.change_title ? record.change_title : record.name) + '不能为空'}, {
                          validator: (rule, value, callback) => {
                            const info = record.field.setting
                            if(!value) {
                              callback()
                              return
                            }
                            if ((info.attribute.maxLength && info.attribute.minLength) && (value.length > info.attribute.maxLength || value.length < info.attribute.minLength)) {
                              callback((record.change_title ? record.change_title : record.name) + '允许长度：' + info.attribute.minLength + '~' + info.attribute.maxLength)
                            }
                            if(info.attribute.minLength && !info.attribute.maxLength && value.length < info.attribute.minLength ) {
                              callback((record.change_title ? record.change_title : record.name) + '最小长度为' + info.attribute.minLength)
                            }
                            if(info.attribute.maxLength && !info.attribute.minLength && value.length > info.attribute.maxLength) {
                              callback((record.change_title ? record.change_title : record.name) + '最大长度为' + info.attribute.maxLength)
                            }
                            if (info.attribute.regex) {
                              info.attribute.regex = info.attribute.regex.split('/').join('')
                              const reg = new RegExp(info.attribute.regex)
                              if(!reg.test(value)) {
                                callback('请按照正确的格式输入')
                              }
                            }
                            if(record.validitytype === 'regular'){
                              const reg = new RegExp(record.validity.regular)
                              if(!reg.test(value)) {
                                callback(record.validity.error_msg)
                              }
                            }
                            callback()
                          } }]
            }]"
            :disabled="record.fieldrule === 'readonly'"
            :placeholder="record.field.setting.attribute.emptyText"
            @change="(value) => {onChange(record, record.field.formtype, value)}"
            @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
            @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
          >
            <template slot="prefix">
              <span v-if="record.field.setting.form.prefixType === 'word'">{{ record.field.setting.form.prefixVal }}</span>
              <a-icon
                v-else-if="record.field.setting.form.prefixType === 'icon'"
                :type="record.field.setting.form.prefixIcon.type"
                :theme="record.field.setting.form.prefixIcon.theme" />
            </template>
          </a-input>
          <a-input-password
            style="flex: 1;"
            v-else
            :allowClear="record.field.setting.form.clearIcon === '1'"
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
              initialValue: record.field.value,
              rules: [{ required: record.field.setting.attribute.required === 'true',
                        message: ((record.change_title ? record.change_title : record.name)) + '不能为空'}, {
                          validator: (rule, value, callback) => {
                            const info = record.field.setting
                            if(!value) {
                              callback()
                              return
                            }
                            if ((info.attribute.maxLength && info.attribute.minLength) && (value.length > info.attribute.maxLength || value.length < info.attribute.minLength)) {
                              callback((record.change_title ? record.change_title : record.name) + '允许长度：' + info.attribute.minLength + '~' + info.attribute.maxLength)
                            }
                            if(info.attribute.minLength && !info.attribute.maxLength && value.length < info.attribute.minLength ) {
                              callback((record.change_title ? record.change_title : record.name) + '最小长度为' + info.attribute.minLength)
                            }
                            if(info.attribute.maxLength && !info.attribute.minLength && value.length > info.attribute.maxLength) {
                              callback((record.change_title ? record.change_title : record.name) + '最大长度为' + info.attribute.maxLength)
                            }
                            if (info.attribute.regex) {
                              info.attribute.regex = info.attribute.regex.split('/').join('')
                              const reg = new RegExp(info.attribute.regex)
                              if(!reg.test(value)) {
                                callback('请按照正确的格式输入')
                              }
                            }
                            callback()
                          } }]
            }]"
            :disabled="record.fieldrule === 'readonly'"
            :placeholder="record.field.setting.attribute.emptyText"
            @change="(value) => {onChange(record, record.field.formtype, value)}"
            @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
            @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
          >
            <template slot="prefix">
              <span v-if="record.field.setting.form.prefixType === 'word'">{{ record.field.setting.form.prefixVal }}</span>
              <a-icon v-else-if="record.field.setting.form.prefixType === 'icon'" :type="record.field.setting.form.prefixIcon.type" :theme="record.field.setting.form.prefixIcon.theme" />
            </template>
          </a-input-password>
          <template v-if="record.field.setting.form.latterIcon && record.field.setting.form.latterIcon.length > 0">
            <a-button
              icon="mail"
              v-if="record.field.setting.form.latterIcon.indexOf('message') !== -1"
              @click="()=>{
                if(record.field.setting.form.attributeClick){
                  buttonEvent(record.field.setting.form.attributeClick.message)
                }
              }"
              style="margin-left: -1px;">
            </a-button>
            <a-button
              icon="phone"
              v-if="record.field.setting.form.latterIcon.indexOf('telephone') !== -1"
              @click="()=>{
                if(record.field.setting.form.attributeClick){
                  buttonEvent(record.field.setting.form.attributeClick.telephone)
                }
              }"
              style="margin-left: -1px;">
            </a-button>
            <a-button
              icon="deployment-unit"
              v-if="record.field.setting.form.latterIcon.indexOf('custom') !== -1"
              style="margin-left: -1px;">
            </a-button>
          </template>
        </div>
      </div>
    </a-form-item>
    <!-- 地址选择 -->
    <a-form-item
      v-if="record.field && record.field.formtype === 'address' && record.fieldrule !== 'hidden'"
      :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol"
      :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol">
      <span slot="label">
        <a-tooltip placement="top" v-if="record.field && record.field.setting.attribute.help">
          <template slot="title">
            <span>{{ record.field.setting.attribute.help }}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
        <a-tooltip placement="top" >
          <template slot="title">{{ record.change_title ? record.change_title : record.field.name }}</template>
          {{ record.change_title ? record.change_title : record.field.name }}
        </a-tooltip>
      </span>
      <a-input
        v-show="false"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']') + '[address]', {
          initialValue: record.field.value.display || '',
          rules: [{ required: record.field.setting.attribute.required === 'true', message: record.change_title ? record.change_title + '不能为空' : record.field.name + '不能为空'},{ validator: record.field.setting.attribute.required === 'true' && record.field.setting.form.req_series ? checkRequired : '' }]
        }]" />
      <a-input-group compact>
        <address-select
          :ref="tableName + '[' + record.field.alias + ']'"
          :alias="tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']') + '[address]'"
          :series="record.field.setting.form.show_series"
          :defaultValue="record.field.value ? record.field.value.address : ''"
          :display="record.field.value.display"
          :fieldrule="record.fieldrule"
          @send="getAddress"
          :style="{ width: record.field.setting.form.details_show === '1' ? '50%' : '100%'}"
        />
        <a-form-item v-if="record.field.setting.form.details_show === '1'" :style="{ width: record.field.setting.form.details_show === '1' ? '50%' : '0%' }">
          <a-input
            :placeholder="record.fieldrule === 'readonly' ? '':'请输入详细地址'"
            :disabled="record.fieldrule === 'readonly'"
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']') + '[details]', {
              initialValue: record.field.value.details,
              rules: [{ required: record.field.setting.attribute.required === 'true', message: record.change_title ? record.change_title + '详细地址不能为空' : record.field.name + '详细地址不能为空'}]
            }]"/>
        </a-form-item>
      </a-input-group>
    </a-form-item>
    <!-- 子表 -->
    <a-form-item v-else-if="record.field && record.field.formtype === 'subform'" style="margin-bottom: 5px !important">
      <span slot="label">
        <a-tooltip placement="top" v-if="record.field.setting.attribute.help">
          <template slot="title">
            <span>{{ record.field.setting.attribute.help }}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
        <a-tooltip placement="top" >
          <template slot="title">
            <span>{{ record.change_title ? record.change_title : record.field.name }}</span>
          </template>
          {{ record.change_title ? record.change_title : record.field.name }}
        </a-tooltip>
      </span>
      <div v-show="record.fieldrule !== 'hidden'">
        <user-table-subform-list
          :params="{ tplviewid: record.field.setting.form.dataView }"
          :linkValue="record.field.linkValue"
          :fieldData="record.field.subFields"
          :dataList="record.field.value ? record.field.value : []"
          :subformItem="record"
          :changeValue="record.field.changeValue || []"
          :title="record.change_title ? record.change_title : record.field.name"
          :viewThis="viewThis"
          ref="subformList"
          @change="(value) => { handleEvent('change', record.field.alias, value) }"
        ></user-table-subform-list>
      </div>
    </a-form-item>
    <a-form-item
      :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol"
      :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol"
      v-if="record.field && record.fieldrule !== 'hidden' && record.field.formtype !== 'subform' && record.field.formtype !== 'address' && record.field.formtype !== 'image' && record.field.formtype !== 'file' && record.field.formtype !== 'text'"
      :style="record.field.formtype === 'organization' ? { display: 'flex', 'align-items': 'center'} : {}"
    >
      <span slot="label">
        <a-tooltip placement="top" v-if="record.field.setting.attribute.help">
          <template slot="title">
            <span>{{ record.field.setting.attribute.help }}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
        <a-tooltip placement="top" >
          <template slot="title">
            <span>{{ record.change_title ? record.change_title : record.field.name }}</span>
          </template>
          {{ record.change_title ? record.change_title : record.field.name }}
        </a-tooltip>
      </span>
      <!-- 多行文本 -->
      <a-textarea
        style="margin-bottom: 2px"
        v-if="record.field.formtype === 'textarea'"
        :allowClear="record.field.setting.form.clearIcon === '1'"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value,
          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true',
                    message: (record.change_title ? record.change_title : record.name) + '不能为空' }, {
                      validator: (rule, value, callback) => {
                        const info = record.field.setting
                        if(!value) {
                          callback()
                          return
                        }
                        if ((info.attribute.maxLength && info.attribute.minLength) && (value.length > info.attribute.maxLength || value.length < info.attribute.minLength)) {
                          callback((record.change_title ? record.change_title : record.name) + '允许长度：' + info.attribute.minLength + '~' + info.attribute.maxLength)
                        }
                        if(info.attribute.minLength && !info.attribute.maxLength && value.length < info.attribute.minLength ) {
                          callback((record.change_title ? record.change_title : record.name) + '最小长度为' + info.attribute.minLength)
                        }
                        if(info.attribute.maxLength && !info.attribute.minLength && value.length > info.attribute.maxLength) {
                          callback((record.change_title ? record.change_title : record.name) + '最大长度为' + info.attribute.maxLength)
                        }
                        callback()
                      } }]
        }]"
        :disabled="record.fieldrule === 'readonly'"
        :placeholder="record.field.setting.attribute.emptyText"
        :autoSize="{ minRows: record.field.setting.attribute.minRows || 1, maxRows: record.field.setting.attribute.maxRows || record.field.setting.attribute.minRows }"
        @change="(value) => {onChange(record, record.field.formtype, value)}"
        @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
      ></a-textarea>
      <!-- 日期 -->
      <a-date-picker
        v-else-if="record.field.formtype === 'datetime' && record.field.fieldtype == 'DATETIME'"
        :disabled="record.fieldrule === 'readonly'"
        :placeholder="record.fieldrule === 'readonly' ? '':'请选择日期'"
        format="YYYY-MM-DD HH:mm:ss"
        show-time
        :disabled-date="(current) => { return disabledDate(current, record) }"
        @change="(value1, value2) => { onChange(record, record.field.formtype, value1, value2)}"
        @openChange="(status) => { handleEvent('openChange', record.field.alias, status) }"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
        @calendarChange="(dates, dateStrings) => { handleEvent('calendarChange', record.field.alias, dates, dateStrings) }"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          rules: [{required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true',
                   message: (record.change_title ? record.change_title : record.name) + '不能为空'}, {
                     validator: (rule, value, callback) => {
                       const info = record.field.setting
                       if (!value) {
                         callback()
                         return
                       }
                       const minValue = info.form.minValue
                       const maxValue = info.form.maxValue
                       if(moment(value).isBefore(minValue) && minValue) {
                         callback((record.change_title ? record.change_title : record.name) + '最小日期时间值为' + minValue)
                       } else if (moment(maxValue).isBefore(value) && maxValue) {
                         callback((record.change_title ? record.change_title : record.name) + '最大日期时间值为' + maxValue)
                       } else {
                         callback()
                       }
                     } }],
          initialValue: record.field.value && record.field.value !== '0000-00-00 00:00:00' ? moment(record.field.value, 'YYYY-MM-DD HH:mm:ss') : moment(moment(new Date()).format('YYYY-MM-DD HH:00:00'), 'YYYY-MM-DD HH:mm:ss')
        }]"
        style="width: 100%;" />
      <a-date-picker
        v-else-if="record.field.formtype === 'datetime' && record.field.fieldtype == 'DATE'"
        :disabled="record.fieldrule === 'readonly'"
        :placeholder="record.fieldrule === 'readonly' ? '':'请选择日期'"
        format="YYYY-MM-DD"
        :disabled-date="(current) => { return disabledDate(current, record) }"
        @change="(value1, value2) => {onChange(record, record.field.formtype, value1, value2)}"
        @openChange="(status) => { handleEvent('focus', record.field.alias, status) }"
        @panelChange="(value, mode) => { handleEvent('focus', record.field.alias, value, mode) }"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
        @ok="() => { handleEvent('focus', record.field.alias) }"
        @calendarChange="(dates, dateStrings) => { handleEvent('calendarChange', record.field.alias, dates, dateStrings) }"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          rules: [{required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}],
          initialValue: record.field.value && record.field.value !== '0000-00-00' ? moment(record.field.value, 'YYYY-MM-DD') : null
        }]"
        style="width: 100%" />
      <a-time-picker
        v-else-if="record.field.formtype === 'datetime' && record.field.fieldtype == 'TIME'"
        :disabled="record.fieldrule === 'readonly'"
        :placeholder="record.fieldrule === 'readonly' ? '':'请选择日期'"
        format="HH:mm:ss"
        @change="(value1, value2) => {onChange(record, record.field.formtype, value1, value2); record.field.value = value2}"
        @openChange="(status) => { handleEvent('focus', record.field.alias, status) }"
        @panelChange="(value, mode) => { handleEvent('focus', record.field.alias, value, mode) }"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
        @ok="() => { handleEvent('ok', record.field.alias) }"
        @calendarChange="(dates, dateStrings) => { handleEvent('calendarChange', record.field.alias, dates, dateStrings) }"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          rules: [{required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true',
                   message: (record.change_title ? record.change_title : record.name) + '不能为空'}, {
                     validator: (rule, value, callback) => {
                       const val = moment(value).format('LTS')
                       if (!value) {
                         callback()
                         return
                       }
                       const info = record.field.setting
                       let minValue = ''
                       let maxValue = ''
                       if (info.form.minType === 'field') {
                         const alias = info.form.minValue
                         minValue = form.getFieldValue(tableName + '[' + alias + ']')
                         minValue = minValue ? moment(minValue).format('LTS') : ''
                       } else {
                         minValue = info.form.minValue
                       }
                       if (info.form.maxType === 'field') {
                         const alias = info.form.maxValue
                         maxValue = form.getFieldValue(tableName + '[' + alias + ']')
                         maxValue = maxValue ? moment(maxValue).format('LTS') : ''
                       } else {
                         maxValue = info.form.maxValue
                       }
                       if(minValue && handleCompare(val, minValue) === -1 ) {
                         callback((record.change_title ? record.change_title : record.name) + '最小时间值为' + minValue)
                       } else if (maxValue && handleCompare(val, maxValue) === 1) {
                         callback((record.change_title ? record.change_title : record.name) + '最大时间值为' + maxValue)
                       } else {
                         callback()
                       }
                     } }],
          initialValue: record.field.value ? moment(record.field.value, 'HH:mm:ss') : null
        }]"
        style="width: 100%" />
      <!-- 下拉框 -->
      <a-select
        v-else-if="record.field.formtype === 'combobox'"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value ? record.field.value : undefined,
          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
        }]"
        :disabled="record.fieldrule === 'readonly'"
        :mode="record.field.setting.attribute.mode"
        :placeholder="record.field.setting.attribute.emptyText ? record.field.setting.attribute.emptyText : ( record.fieldrule === 'readonly'? '' : '请选择') "
        :showArrow="record.fieldrule !== 'readonly'"
        :allowClear="true"
        show-search
        :show-arrow="record.field.setting.form.loadMode !== 'dynamic'"
        option-filter-prop="children"
        @change="(value) => {onChange(record, record.field.formtype, value)}"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
        @deselect="(e) => { handleEvent('deselect', record.field.alias, e) }"
        @inputKeydown="(e) => { handleEvent('inputKeydown', record.field.alias, e) }"
        @mouseenter="(e) => { handleEvent('mouseenter', record.field.alias, e) }"
        @mouseleave="(e) => { handleEvent('mouseleave', record.field.alias, e) }"
        @popupScroll="(e) => { handleEvent('popupScroll', record.field.alias, e) }"
        @search="(value) => { getOption('', record, value), handleEvent('search', record.field.alias, value) }"
        @select="(value, option) => { handleEvent('select', record.field.alias, value, option) }"
        @dropdownVisibleChange="(open) => { handleEvent('dropdownVisibleChange', record.field.alias, open) }" >
        <template>
          <a-select-option v-for="(myitem, myindex) in record.field.option" :key="myindex" :value="myitem.value" @click="viewThis.num++">{{ myitem.label }}</a-select-option>
        </template>
      </a-select>
      <!-- 单选框 -->
      <a-radio-group
        button-style="solid"
        v-else-if="record.field.formtype === 'radio'"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value || record.field.setting.form.defaultValue,
          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
        }]"
        :disabled="record.fieldrule === 'readonly'"
        @change="(value) => {onChange(record, record.field.formtype, value)}"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }" >
        <template v-if="record.field.setting.attribute.style !== 'btn'">
          <a-radio
            v-for="(myitem, myindex) in record.field.option"
            :key="myindex"
            :value="myitem.value"
            :style="{ width: record.field.setting.attribute.optionWidth + 'px', 'text-overflow': 'ellipsis', 'white-space': 'normal' }">{{ myitem.label }}</a-radio>
        </template>
        <template v-else>
          <a-radio-button
            v-for="(myitem, myindex) in record.field.option"
            :key="myindex"
            :value="myitem.value"
            :style="{ width: record.field.setting.attribute.optionWidth + 'px' }">{{ myitem.label }}</a-radio-button>
        </template>
      </a-radio-group>
      <!-- 复选框 -->
      <template v-else-if="record.field.formtype === 'checkbox'" >
        <div :style="{ borderBottom: '1px solid #E9E9E9', marginBottom: '2px' }" v-if="record.field.setting.attribute.checkAll === '1'">
          <a-checkbox
            :indeterminate="record.indeterminate"
            :disabled="record.fieldrule === 'readonly'"
            :checked="record.checkAll"
            @change="(e) => { onCheckAll(e, record) }">
            全选
          </a-checkbox>
        </div>
        <a-checkbox-group
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
            initialValue: record.field.value || record.field.setting.form.defaultValue,
            rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
          }]"
          :disabled="record.fieldrule === 'readonly'"
          @click="handleCheckbox(record.field.formtype)"
          @change="(value) => {
            onCheck(value, record)
            onChange(record, record.field.formtype, value)
          }"
          @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
          @focus="(e) => { handleEvent('focus', record.field.alias, e) }" >
          <template>
            <a-checkbox
              :style="{ width: record.field.setting.attribute.optionWidth + 'px' }"
              v-for="(myitem, myindex) in record.field.option"
              :key="myindex"
              :value="myitem.value">{{ myitem.label }}</a-checkbox>
          </template>
        </a-checkbox-group>
      </template>
      <!-- 数字 -->
      <a-input-number
        v-else-if="record.field.formtype === 'number'"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value,
          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
        }]"
        :disabled="record.fieldrule === 'readonly'"
        :formatter="value => `${record.field.setting.form.prefixVal || ''}${value}${record.field.setting.form.latterVal || ''}`"
        :parser="value => {
          let latter = record.field.setting.form.latterVal ? record.field.setting.form.latterVal.split('') : []
          const lastLatter = latter[latter.length - 1]
          latter.pop()
          const firstLatter = latter.join('')
          value = value.replace(lastLatter, '').replace(firstLatter, '').replace(record.field.setting.form.prefixVal, '')
          return value }"
        style="width: 100%"
        :min="record.field.setting.attribute.minValue ? Number(record.field.setting.attribute.minValue) : -Infinity "
        :max="record.field.setting.attribute.maxValue ? Number(record.field.setting.attribute.maxValue) : Infinity"
        :step="record.field.setting.attribute.step || 1"
        :precision="parseInt(record.field.fieldlength.split(',')[1]) || 0"
        :placeholder="record.field.setting.attribute.emptyText"
        @change="(value) => {onChange(record, record.field.formtype, value)}"
        @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
      >
      </a-input-number>
      <!-- 流水号 -->
      <a-input
        :placeholder="record.field.setting.attribute.emptyText ? record.field.setting.attribute.emptyText : '自动生成无需填写'"
        v-else-if="record.field.formtype === 'serialnumber'"
        :disabled="true"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value || ''
        }]"
      />
      <!-- 级联选择 -->
      <div v-else-if="record.field.formtype === 'cascader'">
        <a-input
          v-show="false"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
            initialValue: record.field.value.value || '',
            rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'},{ validator: record.field.setting.attribute.required === 'true' && record.field.setting.attribute.select_model === 'end' ? checkleaf : '' }]
          }]"
        />
        <tabs-select
          :field="record.field"
          :valueKey="record.field.setting.form.src || ''"
          :defaultValue="record.field.value ? record.field.value.value : ''"
          :viewThis="viewThis"
          :alias="tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']')"
          fieldType="field"
          :action="parentParams.action"
          :writeBack="record.field.setting.form.writeBack"
          :fieldrule="record.fieldrule"
          :ref="tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']')"
          @send="getcascaderValue" />
      </div>
      <!-- 开关 -->
      <a-switch
        v-else-if="record.field.formtype === 'switch'"
        :disabled="record.fieldrule === 'readonly'"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value === record.field.setting.form.word.value.split('/')[0] ? true : false, valuePropName: 'checked',
          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
        }]"
        :un-checked-children="record.field.setting.form.word.value.split('/')[1]"
        :checked-children="record.field.setting.form.word.value.split('/')[0]"
        @change="(value, e) => {onChange(record, record.field.formtype, value, e)}"
        @click="(value, e) => { handleEvent('click', record.field.alias, value, e) }"
        @blur="(e) => { handleEvent('blur', record.field.alias, e) }"
        @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
      />
      <!-- 关联数据 -->
      <template v-else-if="record.field && record.field.formtype === 'associated'">
        <template v-if="record.fieldrule === 'readonly' && record.field.value && record.field.setting.autofill && record.field.setting.autofill.source && record.field.setting.autofill.source.length > 0">
          <a-button type="link" @click="getLinkList(record)" style="padding: 0;">
            {{ record.field.value }}
          </a-button>
        </template>
        <div style="position: relative; width: 100%; margin-top: -1px" v-else>
          <template v-if="record.field.setting.form.mode === 'combobox'">
            <a-input
              v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
                initialValue: record.field.value,
                rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
              }]"
              read-only
              :disabled="record.fieldrule === 'readonly'"
              :style="{ width: '100%', cursor: record.fieldrule === 'readonly'? '' : 'pointer' }"
              :placeholder="record.field.setting.attribute.emptyText"
              @click="handleLink(record, record.field.setting.form.mode)" />
            <a-icon type="down" @click="handleLink(record, record.field.setting.form.mode)" style="position: absolute; top:8px; margin-left: -22px; color: rgba(0,0,0,.25); cursor: pointer" v-show="!record.field.iconFlag && record.fieldrule !== 'readonly'"/>
            <a-icon type="up" @click="handleLink(record, record.field.setting.form.mode)" style="position: absolute; top:8px; margin-left: -22px; color: rgba(0,0,0,.25);" v-show="record.field.iconFlag && record.fieldrule !== 'readonly'" />
          </template>
          <a-input
            v-else
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
              initialValue: record.field.value,
              rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
            }]"
            :style="{ width: '100%', cursor: record.fieldrule === 'readonly' ? '' : 'pointer' , background: record.fieldrule === 'readonly' ? '#F5F5F5' : '' }"
            :placeholder="record.field.setting.attribute.emptyText"
            @click="handleLink(record, record.field.setting.form.mode)"
            read-only

          >
            <a-icon slot="addonAfter" type="search" v-if="record.fieldrule !== 'readonly'" @click="handleWinlist(record)">
            </a-icon>
          </a-input>
          <div style="position: absolute; left: 0; top: 32px; width: 100%; z-index: 111" v-if="record.field.iconFlag">
            <a-card>
              <a-select
                show-search
                allowClear
                ref="select"
                autoClearSearchValue
                defaultOpen
                option-filter-prop="children"
                :autoFocus="true"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                :default-active-first-option="false"
                :dropdownMatchSelectWidth="false"
                style="width: 100%;"
                placeholder="请输入相关值进行搜索"
                @search="(val) => { handleSearch(val, record) }"
                @blur="linkBlur(record)"
              >
                <a-select-option
                  v-for="(item1, index1) in record.field.selectList"
                  :key="index1"
                  @click="handleChoice(item1, record)"
                  :value="item1.id">
                  {{ item1.label }}
                </a-select-option>
              </a-select>
            </a-card>
          </div>
        </div>
      </template>
      <!-- 组织结构 -->
      <template v-else-if="record.field.formtype === 'organization'">
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1px">
          <a-select
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
              initialValue: parentParams.action === 'edit' ? (record.field.value ? record.field.value : undefined) : (record.field.setting.form.defaultCustom?record.field.setting.form.defaultCustom:undefined),
              rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
            }]"
            allowClear
            :open="false"
            option-filter-prop="children"
            :disabled="record.fieldrule === 'readonly'"
            :showArrow="false"
            style="flex: 1"
            @change="(val) => { formdata[record.field.alias] = val ; record.field.value = val }"
            :mode="record.field.setting.attribute.mode"
            v-if="record.field.setting.form.option_type === 'user'"
          >
            <a-select-option v-for="(item1, index1) in record.field.option" :key="index1" :value="item1.username">
              {{ item1.text }}
            </a-select-option>
          </a-select>
          <a-select
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
              initialValue: parentParams.action === 'edit' ? (record.field.value ? record.field.value : undefined) : (record.field.setting.form.defaultCustom?record.field.setting.form.defaultCustom:undefined),
              rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
            }]"
            :open="false"
            allowClear
            option-filter-prop="children"
            :disabled="record.fieldrule === 'readonly'"
            :show-arrow="false"
            style="flex: 1"
            @change="(val) => {formdata[record.field.alias] = val; record.field.value = val }"
            :mode="record.field.setting.attribute.mode"
            v-else
          >
            <template v-if="record.field.setting.form.option_type === 'department'" >
              <a-select-option v-for="(item1, index1) in record.field.option" :key="index1" :value="item1.departmentid">
                {{ item1.name }}
              </a-select-option>
            </template>
            <template v-else >
              <a-select-option v-for="(item1, index1) in record.field.option" :key="index1" :value="item1.roleid">
                {{ item1.name }}
              </a-select-option>
            </template>
          </a-select>
          <a-button
            icon="user"
            v-if="record.field.setting.form.option_type === 'user'"
            :disabled="record.fieldrule === 'readonly'"
            style="margin-left: -1px;"
            @click="handleSelectUserForm(record)">
          </a-button>
          <a-button
            icon="apartment"
            v-else-if="record.field.setting.form.option_type === 'department'"
            :disabled="record.fieldrule === 'readonly'"
            style="margin-left: -1px;"
            @click="handleSelect(record)">
          </a-button>
          <a-button
            icon="team"
            :disabled="record.fieldrule === 'readonly'"
            v-else
            style="margin-left: -1px;"
            @click="handleSelect(record)">
          </a-button>
        </div>
      </template>
      <!-- 编辑器 -->
      <div v-else-if="record.field.formtype=='editor'">
        <UEditor
          v-if="record.fieldrule !== 'readonly'"
          :initialFrameHeight="parseInt(record.field.setting.attribute.height)"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
            initialValue: record.field.value,
            rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]
          }]"/>
        <a-card v-else-if="record.fieldrule === 'readonly' && record.field.value">
          <div v-html="record.field.value"></div>
        </a-card>
      </div>
      <!-- 自动完成 -->
      <template v-if="record.field && record.field.formtype === 'autocomplete'">
        <div style="display: flex; justify-content: center; align-items: center;" >
          <a-auto-complete
            style="flex: 1;"
            :allowClear="record.field.setting.form.clearIcon === '1'"
            v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
              initialValue: record.field.value,
              rules: [{ required: record.field.setting.attribute.required === 'true',
                        message: (record.change_title ? record.change_title : record.name) + '不能为空'}, {
                          validator: (rule, value, callback) => {
                            const info = record.field.setting
                            if(!value) {
                              callback()
                              return
                            }
                            if ((info.attribute.maxLength && info.attribute.minLength) && (value.length > info.attribute.maxLength || value.length < info.attribute.minLength)) {
                              callback((record.change_title ? record.change_title : record.name) + '允许长度：' + info.attribute.minLength + '~' + info.attribute.maxLength)
                            }
                            if(info.attribute.minLength && !info.attribute.maxLength && value.length < info.attribute.minLength ) {
                              callback((record.change_title ? record.change_title : record.name) + '最小长度为' + info.attribute.minLength)
                            }
                            if(info.attribute.maxLength && !info.attribute.minLength && value.length > info.attribute.maxLength) {
                              callback((record.change_title ? record.change_title : record.name) + '最大长度为' + info.attribute.maxLength)
                            }
                            if (info.attribute.regex) {
                              info.attribute.regex = info.attribute.regex.split('/').join('')
                              const reg = new RegExp(info.attribute.regex)
                              if(!reg.test(value)) {
                                callback('请按照正确的格式输入')
                              }
                            }
                            callback()
                          } }]
            }]"
            :disabled="record.fieldrule === 'readonly'"
            :placeholder="record.field.setting.attribute.emptyText"
            @search="(value) => { onSearch(record, value) }"
            @change="(value) => {onChange(record, record.field.formtype, value)}"
            @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
            @focus="(e) => { handleEvent('focus', record.field.alias, e) }" >
            <template slot="dataSource">
              <a-select-option v-for="(autoItem, autoIndex) in record.field.setting.form.custom_data_list" :key="autoIndex" :value="autoItem.value">
                {{ autoItem.value }}
              </a-select-option>
            </template>
            <template slot="prefix">
              <span v-if="record.field.setting.form.prefixType === 'word'">{{ record.field.setting.form.prefixVal }}</span>
              <a-icon
                v-else-if="record.field.setting.form.prefixType === 'icon'"
                :type="record.field.setting.form.prefixIcon.type"
                :theme="record.field.setting.form.prefixIcon.theme" />
            </template>
          </a-auto-complete>
          <template v-if="record.field.setting.form.latterIcon && record.field.setting.form.latterIcon.length > 0">
            <a-button
              icon="mail"
              v-if="record.field.setting.form.latterIcon.indexOf('message') !== -1"
              style="margin-left: -1px;">
            </a-button>
            <a-button
              icon="phone"
              v-if="record.field.setting.form.latterIcon.indexOf('telephone') !== -1"
              style="margin-left: -1px;">
            </a-button>
            <a-button
              icon="deployment-unit"
              v-if="record.field.setting.form.latterIcon.indexOf('custom') !== -1"
              style="margin-left: -1px;">
            </a-button>
          </template>
        </div>
      </template>
      <!-- 树选择 -->
      <template v-else-if="record.field && record.field.formtype === 'treeselect'">
        <a-tree-select
          v-if="record.field.setting.attribute.dataSource === 'addressBook'"
          :allowClear="true"
          :disabled="record.fieldrule === 'readonly'"
          :tree-data="record.field.option"
          :treeDefaultExpandedKeys="record.field.value || []"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :placeholder="record.field.setting.attribute.emptyText ? record.field.setting.attribute.emptyText :( record.fieldrule === 'readonly' ? '': '请选择' )"
          :multiple="record.field.setting.attribute.multiple === '1'"
          :tree-checkable="record.field.setting.attribute.inherit === '1'"
          :load-data="onLoadData"
          :show-checked-strategy="record.field.setting.attribute.inherit === '1'? SHOW_PARENT : SHOW_CHILD"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'),
                        { initialValue: record.field.value || [],
                          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]}]"
          @search="(value) => { onSearch(record, value) }"
          @change="(value) => { onChange(record, record.field.formtype, value) }"
          @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
          @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
        >
          <a-icon slot="suffixIcon" :type="record.field.setting.form.latterVal.type" v-if="record.field.setting.form.latterIcon === 'custom'"/>
          <span v-else-if="record.field.setting.form.latterIcon === 'string'" slot="suffixIcon">{{ record.field.setting.form.latterVal.type }}</span>
        </a-tree-select>
        <a-tree-select
          v-else
          :allowClear="true"
          :tree-data="record.field.option"
          :disabled="record.fieldrule === 'readonly'"
          :treeDefaultExpandedKeys="record.field.value || []"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :placeholder="record.field.setting.attribute.emptyText ? record.field.setting.attribute.emptyText :( record.fieldrule === 'readonly' ? '': '请选择' )"
          :multiple="record.field.setting.attribute.multiple === '1'"
          :tree-checkable="record.field.setting.attribute.inherit === '1'"
          :show-checked-strategy="record.field.setting.attribute.inherit === '1'? SHOW_PARENT : SHOW_CHILD"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'),
                        { initialValue: record.field.value || [],
                          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]}]"
          @search="(value) => { onSearch(record, value) }"
          @change="(value) => { onChange(record, record.field.formtype, value) }"
          @pressEnter="(e) => { handleEvent('pressEnter', record.field.alias, e) }"
          @focus="(e) => { handleEvent('focus', record.field.alias, e) }"
        >
          <a-icon slot="suffixIcon" :type="record.field.setting.form.latterVal.type" v-if="record.field.setting.form.latterIcon === 'custom'"/>
          <span v-else-if="record.field.setting.form.latterIcon === 'string'" slot="suffixIcon">{{ record.field.setting.form.latterVal.type }}</span>
        </a-tree-select>
      </template>
      <!-- 标签 -->
      <div v-else-if="record.field && record.field.formtype === 'tag'">
        <a-input
          v-show="false"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'),
                        { initialValue: record.field.value.toString(),
                          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]}]"
        />
        <span v-for="(tagItem, tagIndex) in tagData" :key="tagIndex">
          <a-tooltip v-if="tagItem.length > 20" placement="topLeft" :title="tagItem">
            <a-tag :key="tagItem" :color="record.field.tagData.find(item => item.name === tagItem) && record.field.tagData.find(item => item.name === tagItem).tag_type === '1' ? 'green':'purple'">
              {{ `${tagItem.slice(0, 20)}...` }}
            </a-tag>
          </a-tooltip>
          <a-tag :color="record.field.tagData.find(item => item.name === tagItem) && record.field.tagData.find(item => item.name === tagItem).tag_type === '1' ? 'green':'purple'" v-else>{{ tagItem }}</a-tag>
        </span>
        <a-icon type="tags" v-if="record.fieldrule !== 'readonly'" @click="$refs['tagSet' + record.field.alias].show({title:'打标签', record: record, tagData: tagData, field: record.field})"/>
        <tag-set
          :ref="'tagSet' + record.field.alias"
          @ok="(data) => {
            tagData = data
            const obj = {}
            obj[tableName + '[' + record.field.alias + ']'] = data.toString()
            viewThis.form.setFieldsValue(obj)
          }"/>
      </div>
      <!-- 地图选点 -->
      <template v-else-if="record.field && record.field.formtype === 'location'">
        <a-input
          v-show="false"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'),
                        { initialValue: record.field.value,
                          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true', message: (record.change_title ? record.change_title : record.name) + '不能为空'}]}]"
        />
        <a-button
          v-if="record.fieldrule === 'readonly'"
          @click="()=>{
            if($store.getters.setting.baidu_ak_browser){
              if(record.field.value){
                $refs['locationSet' + record.field.alias].show({title: '地图选点', action: 'look', data: record.field.value})
              }else{
                $message.info('位置未设置')
              }
            }else{
              $message.error('未设置百度地图AK')
            }
          }" >
          <a-badge status="success" v-if="record.field.value"/>
          <a-badge status="default" v-else/>
          查看</a-button>
        <a-button
          v-else
          @click="()=>{ if($store.getters.setting.baidu_ak_browser){
            $refs['locationSet' + record.field.alias].show({title: '地图选点', action: 'set', data: record.field.value})
          }else{
            $message.error('未设置百度地图AK')
          } }">
          <a-badge status="success" v-if="record.field.value"/>
          <a-badge status="default" v-else/>
          设置</a-button>
        <location-set
          :ref="'locationSet' + record.field.alias"
          @ok="(val) => {
            $set( record.field, 'value', val);
            const obj = {}
            obj[tableName + '[' + record.field.alias + ']'] = val
            $emit('give', obj) }"/>
      </template>
      <!-- 评分 -->
      <template v-if="record.field && record.field.formtype === 'score'">
        <a-rate
          :allowHalf="record.field.setting.attribute.half === '1'"
          :allowClear="record.field.setting.attribute.clear === '1'"
          :tooltips="record.field.setting.form.writeList"
          :disabled="record.fieldrule === 'readonly'"
          v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'),
                        { initialValue: Number(record.field.value) || 0,
                          rules: [{ required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true' }, {
                            validator: (rule, value, callback) => {
                              if(record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true' && value === 0) {
                                callback((record.change_title ? record.change_title : record.name) + '不能为空')
                              }else{
                                callback()
                              }
                            }
                          }] }]" >
          <a-icon
            slot="character"
            v-if="record.field.setting.form.prefixType === 'icon'"
            :type="record.field.setting.form.prefixIcon.type" />
          <span slot="character" v-if="record.field.setting.form.prefixType === 'word'">
            {{ record.field.setting.form.prefixVal }}
          </span>
        </a-rate>
      </template>
    </a-form-item>
    <!-- 图片 -->
    <a-form-item
      :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol"
      :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol"
      v-else-if="record.field && record.field.formtype === 'image'"
      v-show="record.fieldrule !=='hidden'"
      :id="record.fieldrule === 'readonly' ? 'image' + record.field.alias + Math.random() : ''" >
      <span slot="label">
        <a-tooltip placement="top" >
          <template slot="title">
            <span>{{ record.change_title ? record.change_title : record.field.name }}</span>
          </template>
          {{ record.change_title ? record.change_title : record.field.name }}
        </a-tooltip>
      </span>
      <a-upload
        :action="`${$store.state.env.VUE_APP_API_BASE_URL}admin/attachment/upload/?uploadName=headImage`"
        name="headImage"
        listType="picture-card"
        accept="image/*"
        :disabled="record.fieldrule === 'readonly'"
        :multiple="true"
        :before-upload="(file, fileList) => { beforeUpload(file, fileList, record) }"
        @change="(info) => { fileChange(info) }"
        @preview="(file)=>{handleImagePreview(record, file)}"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value,
          valuePropName: 'fileList',
          getValueFromEvent: normFile,
          rules: [{
            required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true',
            message: (record.change_title ? record.change_title : record.name) + '不能为空'},{
              validator: (rule, value, callback) => {
                if (record.fieldrule === 'hidden') {
                  callback()
                  return
                }
                let length = value.length
                const minLength = record.field.setting.attribute.minFiles
                const maxLength = record.field.setting.attribute.maxFiles
                if(record.field.setting.attribute.required === 'true' && length !== 0){
                  if(length < minLength || length > maxLength){
                    callback('允许文件上传数量：' + minLength + '~' + maxLength)
                  }
                  callback()
                }else{
                  if(length > 0 && (length < minLength || length > maxLength)){
                    callback('允许文件上传数量：' + minLength + '~' + maxLength)
                  }
                  callback()
                }
                record.field.setting.length = length
                record.field.value.length = length
              }
            } ]
        } ]"
        :class="record.field.alias"
        v-viewer
      >
        <div v-if="record.field.value.length < record.field.setting.attribute.maxFiles">
          <a-icon type="plus" style="font-size: 18px;" />
          <div class="ant-upload-text">上传</div>
        </div>
      </a-upload>
    </a-form-item>
    <!-- 附件 -->
    <a-form-item
      :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol"
      :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol"
      v-else-if="record.field && record.field.formtype === 'file' && record.fieldrule !== 'hidden'"
      :id="record.fieldrule === 'readonly' ? 'file' + record.field.alias + Math.random() : ''" >
      <span slot="label">
        <a-tooltip placement="top" >
          <template slot="title">
            <span>{{ record.change_title ? record.change_title : record.field.name }}</span>
          </template>
          {{ record.change_title ? record.change_title : record.field.name }}
        </a-tooltip>
      </span>
      <a-upload
        :action="`${$store.state.env.VUE_APP_API_BASE_URL}admin/attachment/upload/?uploadName=upload`"
        name="upload"
        listType="text"
        :multiple="true"
        :disabled="record.fieldrule === 'readonly'"
        :accept="record.field.setting.form.format"
        :before-upload="(file, fileList) => { beforeUpload(file, fileList, record) }"
        @change="(info) => { fileChange(info) }"
        v-decorator="[tableName + (record.aliasKey ? '[product_' + record.aliasKey + ']' : '') + ( record.field.beforeAlias ? '[' + record.field.beforeAlias + ']' : '[' +record.field.alias + ']'), {
          initialValue: record.field.value,
          valuePropName: 'fileList',
          getValueFromEvent: normFile,
          rules: [{
            required: record.fieldrule !== 'hidden' && record.field.setting.attribute.required === 'true',
            message: (record.change_title ? record.change_title : record.name) + '不能为空'},{
              validator: (rule, value, callback) => {
                if (record.fieldrule === 'hidden') {
                  callback()
                  return
                }
                let length = value.length
                const minLength = record.field.setting.attribute.minFiles
                const maxLength = record.field.setting.attribute.maxFiles
                if(record.field.setting.attribute.required === 'true' && length !== 0){
                  if(length < minLength || length > maxLength){
                    callback('允许文件上传数量：' + minLength + '~' + maxLength)
                  }
                  callback()
                }else{
                  if(length > 0 && (length < minLength || length > maxLength)){
                    callback('允许文件上传数量：' + minLength + '~' + maxLength)
                  }
                  callback()
                }
                record.field.setting.length = length
                record.field.value.length = length
              }
            } ]
        } ]"
      >
        <div v-if="record.field.value.length < record.field.setting.attribute.maxFiles">
          <a-button :disabled="record.fieldrule === 'readonly'"> <a-icon type="upload" />上传</a-button>
        </div>
      </a-upload>
    </a-form-item>
    <!-- 子表DW -->
    <div v-else-if="record.type==='subform' && record.relationTable && record.relationTable.type === 'table_card_list' && record.relationTable.enable === '1' && record.relationTable.access">
      <user-table-list :params="record.relationTable" :formThis="formThis" :viewThis="viewThis"/>
    </div>
    <template v-else-if="record.type==='subform' && record.relationTable && record.relationTable.enable === '1' && record.relationTable.access">
      <user-table-list :params="record.relationTable" :formThis="formThis" />
    </template>
    <div v-else-if="record.type==='flowlog'">
      <a-card class="table-search">
        <a-form :layout="advancedLog ? 'vertical' : 'inline'" :class="advancedLog ? 'advanced' : 'normal'">
          <div class="head">
            <div class="title">过滤</div>
            <span class="button">
              <a-button htmlType="submit" type="primary" @click="$refs.tableLog.refresh(true)">搜索</a-button>
              <a-button @click="() => {queryParamLog = {}, $refs.tableLog.refresh(true)}" style="margin: 0 8px">重置</a-button>
            </span>
          </div>
          <a-row :gutter="16">
            <a-col v-if="advancedLog" span="24">
              <div class="divider"></div>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="流程任务">
                <a-input v-model="queryParamLog.title"/>
              </a-form-item>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="办理人">
                <a-input v-model="queryParamLog.username"/>
              </a-form-item>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="办理方式">
                <a-input v-model="queryParamLog.type"/>
              </a-form-item>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="办理备注">
                <a-input v-model="queryParamLog.content"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
      <s-table
        ref="tableLog"
        size="small"
        rowKey="id"
        :columns="columnsLog"
        :data="loadDataLog"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="username" slot-scope="text" class="userName">
          <div>{{ text }}</div>
        </div>
        <div slot="content" slot-scope="text" v-html="text"></div>
      </s-table>
    </div>
    <div v-else-if="record.type==='urgelog'">
      <a-card class="table-search">
        <a-form :layout="advancedUrge ? 'vertical' : 'inline'" :class="advancedUrge ? 'advanced' : 'normal'">
          <div class="head">
            <div class="title">过滤</div>
            <span class="button">
              <a-button htmlType="submit" type="primary" @click="$refs.tableUrge.refresh(true)">搜索</a-button>
              <a-button @click="() => {queryParamUrge = {}, $refs.tableUrge.refresh(true)}" style="margin: 0 8px">重置</a-button>
            </span>
          </div>
          <a-row :gutter="16">
            <a-col v-if="advancedUrge" span="24">
              <div class="divider"></div>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="流程任务">
                <a-input v-model="queryParamUrge.title"/>
              </a-form-item>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="被催办人">
                <a-input v-model="queryParamUrge.username"/>
              </a-form-item>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="催办原因">
                <a-input v-model="queryParamUrge.urge_reason"/>
              </a-form-item>
            </a-col>
            <a-col v-bind="colLayoutLog">
              <a-form-item label="催办备注">
                <a-input v-model="queryParamUrge.urge_remarks"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
      <s-table
        ref="tableUrge"
        size="small"
        rowKey="id"
        :columns="columnsUrge"
        :data="loadDataUrge"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="username" slot-scope="text" class="userName">
          <div>{{ text }}</div>
        </div>
        <div slot="urge_remarks" slot-scope="text" v-html="text"></div>
      </s-table>
    </div>
    <!-- 隐藏，但是保留占位符 -->
    <a-form-item :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol" :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol" v-else-if="record.fieldrule === 'hidden' && record.placeholder === '1'" ></a-form-item>
    <!-- 原分割符 -->
    <a-divider v-else-if="record.type === 'divider'&& record.dividerText" :orientation="record.dividerDirection">{{ record.dividerText }}</a-divider>
    <!-- 组件 -->
    <div v-else-if="record.type === 'component'">
      <component :is="coms" v-if="record.filePath" :parent="this" :viewThis="viewThis"></component>
      <component :myid="`component-${record.value}`" :ref="`component-${record.value}`" :is="record.component" v-else/>
    </div>
    <!-- button按钮 -->
    <a-form-item
      v-else-if="record.type === 'button'"
    >
      <a-button
        @click="()=>{record.options.handle === 'submit' ? false : record.options.handle === 'reset' ? $emit('handleReset') : record.options.dynamicFun ? this[record.options.dynamicFun](): false}"
        :type="record.options.type"
        :html-type="record.options.handle === 'submit' ? 'submit' : undefined"
        v-text="record.label"
      ></a-button>
    </a-form-item>
    <!-- alert提示 -->
    <a-form-item
      v-else-if="record.type === 'alert'"
    >
      <a-alert
        style="margin: 5px 0"
        :message="record.label"
        :description="record.options.description"
        :type="record.options.type"
        :showIcon="record.options.showIcon === '1'"
        :closable="record.options.closable === '1'"
        :banner="record.options.banner === '1'"
      />
    </a-form-item>
    <!-- 文本 -->
    <a-form-item
      v-else-if="record.type === 'text'"
    >
      <div :style="{ textAlign: record.options.textAlign, minWidth: '50px' }">
        <label
          :class="{ 'ant-form-item-required': record.options.showRequiredMark }"
          v-text="record.label"
        ></label>
      </div>
    </a-form-item>
    <a-form-item
      v-else-if="record.type === 'placeholder'"
    >
      <div>
      </div>
    </a-form-item>
    <!-- html -->
    <div
      v-else-if="record.type === 'html'"
      v-html="record.options.defaultValue"
    ></div>
    <!-- 表单留痕 -->
    <div v-else-if="record.type === 'formmark'" style="margin-bottom: 10px">
      <div v-if="parentParams.action === 'edit'">
        <a-timeline v-if="traceData.length > 0">
          <a-timeline-item v-for="option in traceData" :key="option.id">
            <h3>{{ option.update_time }} {{ option.update_user }}({{ option.update_department_name }})</h3>
            <a-table
              size="small"
              :pagination="false"
              rowKey="field_alias"
              :columns="columnsMark"
              :dataSource="option.setting"></a-table>
          </a-timeline-item>
        </a-timeline>
        <a-empty v-else/>
        <a-row v-if="traceData.length >= 10">
          <a-col :span="24" style="text-align: center;" ><a @click="getMoreTrace" v-if="loadMore">加载更多</a>
            <span v-else>没有更多数据</span>
            <a-spin v-if="tracespin">
              <a-icon slot="indicator" type="loading" style="font-size: 20px" />
            </a-spin>
          </a-col>
        </a-row>
      </div>
      <a-empty v-else/>
    </div>
    <!-- 客户画像 -->
    <a-form-item v-else-if="record.type==='portrait'">
      <a-spin :spinning="record.loading">
        <a-row type="flex" align="middle" :gutter="[0, 8]" v-if="!record.enable && record.data">
          <a-col :span="24" style="text-align: center">
            <img src="../FormDesign/packages/KFormItem/women.png" alt="" style="width: 75px; height: auto" v-if="record.data.xb ==='女'">
            <img src="../FormDesign/packages/KFormItem/men.png" alt="" style="width: 75px; height: auto" v-else>
          </a-col>
          <a-col :span="24" style="text-align: center; font-weight: bold">{{ record.data.khmc }}</a-col>
          <a-col :span="24">
            <a-row type="flex" justify="center">
              <a-col :span="2">
                <a-tooltip title="性别">
                  <a-icon type="man" style="color: #722ED1" v-if="record.data.xb ==='男'"/>
                  <a-icon type="woman" style="color: #ff85c0" v-else-if="record.data.xb ==='女'"/>
                  <a-icon type="question" style="color: #262626" v-else />
                </a-tooltip>
              </a-col>
              <a-col :span="4"> <a-tooltip title="年龄">{{ record.data.nl }} 岁</a-tooltip></a-col>
              <a-col :span="2"><a-tooltip title="地址"><a-icon type="environment" style="color: #1890FF"/></a-tooltip></a-col>
              <a-col :span="6" style="display: inline-block; white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"><a-tooltip placement="topLeft" :title="record.data.ssq">{{ record.data.ssq }}</a-tooltip></a-col>
              <a-col :span="2"><a-tooltip title="标签评分"><a-icon type="star" style="color: #f5222d"/></a-tooltip></a-col>
              <a-col :span="4">{{ record.data.bqfs || 0 }} 分</a-col>
            </a-row>
          </a-col>
          <a-col :span="24">
            <a-row type="flex" justify="center">
              <a-col :span="2" style="text-align: center"></a-col>
              <a-col :span="4" style="text-align: center">
                <a-tooltip title="编辑"><a-button icon="edit" shape="circle" @click="getEnable"/></a-tooltip></a-col>
              <a-col :span="4" style="text-align: center"><a-button icon="phone" shape="circle"/></a-col>
              <a-col :span="4" style="text-align: center"><a-button icon="mail" shape="circle"/></a-col>
              <a-col :span="4" style="text-align: center"><a-tooltip title="更多"><a-button icon="more" shape="circle"/></a-tooltip></a-col>
              <a-col :span="4" style="text-align: center" v-if="parentParams.popscreenType"><a-tooltip title="切换用户" ><a-button icon="swap" shape="circle" @click="handleUserShow(record)"/></a-tooltip></a-col>
              <a-col :span="2" style="text-align: center"></a-col>
            </a-row>
          </a-col>
          <a-divider :dashed="true" style="margin: 12px 0 6px 0"/>
          <a-col :span="24">
            <a-row>
              <a-col :span="23"><a-icon type="tag" /> 客户画像</a-col>
              <a-col :span="1"><a-icon type="edit" /></a-col>
            </a-row>
          </a-col>
          <a-col>
            <a-tag color="orange">男</a-tag>
            <a-tag color="orange">企业高管</a-tag>
            <a-tag color="orange">籍贯广东</a-tag>
            <a-tag color="orange">首选语言粤语</a-tag>
            <a-tag color="orange">服务要求高</a-tag>
            <a-tag color="purple">易投诉客户</a-tag>
            <a-tag color="purple">高价值客户</a-tag>
            <a-tag color="purple">多订单客户</a-tag>
            <a-tag color="purple">VIP客户</a-tag>
          </a-col>
          <a-divider :dashed="true" style="margin: 12px 0 6px 0"/>
          <a-col :span="24">
            <a-row>
              <a-col :span="24"><a-icon type="deployment-unit" /> 交互数据</a-col>
              <a-col>
                <a-tag color="purple">咨询 18 次</a-tag>
                <a-tag color="purple">产品 6 个</a-tag>
                <a-tag color="purple">投诉 1 单</a-tag>
                <a-tag color="purple">订单 10 个</a-tag>
                <a-tag color="purple">安装 8 单</a-tag>
                <a-tag color="purple">来电 35 次</a-tag>
                <a-tag color="purple">维修 1 单</a-tag>
                <a-tag color="purple">不满意 0 单</a-tag>
              </a-col>
            </a-row>
          </a-col>
          <a-divider :dashed="true" style="margin: 12px 0 6px 0"/>
          <a-col :span="24"><a-icon type="user" /> 联系信息</a-col>
          <a-row type="flex" :gutter="16">
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">电话1</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.khdh1 || '--' }}</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">电话2</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.khdh2 || '--' }}</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">邮箱</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.yx || '--' }}</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">客户类别</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.khjb || '--' }}</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">详细地址</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.xxdz || '--' }}</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">是否黑名单</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.sfhmd || '--' }}</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">客户类型</a-col>
            <a-col :span="16" style="font-size: 13px;">{{ record.data.khxz || '--' }}</a-col>
          </a-row>
        </a-row>
        <a-form :form="portraitForm" v-else-if="record.enable && record.params">
          <user-table-form-view
            ref="portraitFormView"
            :params="{ tableName: viewThis.tableName, template: record.params.template, fieldRule: record.params.fieldRule, parentParams: record.params, action: 'add', page: 'user' }"
            :formThis="this"
          />
          <div style="text-align: right; padding-top: 10px;">
            <a-space>
              <a-button @click="handleUserShow" v-if="parentParams.popscreenType && record.action === 'edit'">切换用户</a-button>
              <a-button type="primary" @click="getPortraitForm">保存</a-button>
              <a-button v-if="record.action === 'edit'" @click="$set(record, 'enable', false)">取消</a-button>
            </a-space>
          </div>
        </a-form>
      </a-spin>
      <user-table-win-list ref="userPortraitWinList" @ok="getPortraitVal" />
    </a-form-item>
    <a-form-item v-else-if="record.type==='lifeCycle'">
      <a-timeline style="margin: 20px">
        <a-timeline-item>
          <div>时间：2016年2月11日</div>
          <div>事件：首次购买净水器订单，完成</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2016年2月14日</div>
          <div>事件：上门安装，完成</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2016年5月13日</div>
          <div>事件：新产品使用三个月体验回访，满意</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2018年12月13日</div>
          <div>事件：上门维修，完成</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2018年12月15日</div>
          <div>事件：维修服务回访，满意</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2019年2月13日</div>
          <div>事件：3年老客户NPS调研回访，9分(愿意推荐)</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2020年2月13日</div>
          <div>事件：产品到期提醒-以旧换新推荐，完成</div>
        </a-timeline-item>
        <a-timeline-item>
          <div>时间：2020年3月8日</div>
          <div>事件：二次购买净水器订单，完成</div>
        </a-timeline-item>
      </a-timeline>
    </a-form-item>
    <!-- 分割线 -->
    <div v-else-if="record.type === 'divider' && !record.dividerText">
      <a-divider
        v-if="
          record.type === 'divider' &&
            record.label !== '' &&
            record.options.orientation
        "
        :orientation="record.options.orientation"
      >{{ record.label }}</a-divider>
      <a-divider v-else-if="record.type === 'divider' && record.label !== ''">{{
        record.label
      }}</a-divider>
      <a-divider v-else-if="record.type === 'divider' && record.label === ''" style="margin: 6px 0"/>
    </div>
    <!-- 签名板 -->
    <div v-else-if="record.type === 'signature'">
      <template v-if="!record.file">
        <div style="border: 1px solid #EEE; width: 100%; margin-top: 8px; height: 150px">
          <vue-esign
            :ref="'esign' + record.key"
            style="width: 100%; height: 100%;"
            :isCrop="isCrop"
            :lineWidth="lineWidth"
            :lineColor="lineColor"
            :bgColor.sync="bgColor" />
        </div>
        <a-button @click="handleResetBorad(record)" style="width: 50%">清空画板</a-button>
        <a-button @click="handleGenerate(record)" style="width: 50%">确认签名</a-button>
      </template>
      <img v-else :src="record.file" alt="" style="width: 100%; max-height: 150px">
    </div>
    <!-- 日期组件 -->
    <a-form-item v-else-if="record.type == 'date'" :colon="record.labelShow !== '0' && record.type !== 'signature'">
      <span slot="label">
        <span v-if="record.labelShow !== '0' && record.type !== 'signature'">{{ record.label }}</span>
      </span>
      <a-date-picker
        :style="{width: record.options.width, border: record.borderedShow !== 'all' ? 'none':'', borderBottom: record.borderedShow === 'bottom' ? '1px solid #e8e8e8' : record.borderedShow === 'none' ? 'none' : ''}"
        size="small"
        :disabled="parentParams.readonly || disabled || !!record.options.disabled"
        :placeholder="record.options.placeholder"
        v-model="record.options.defaultValue"
        format="YYYY-MM-DD"
        @change="(val) => { record.options.defaultValue = val }" />
    </a-form-item>
    <a-form-item
      v-else-if="
        [
          'input',
          'textarea',
          'time',
          'number',
          'radio',
          'checkbox',
          'select',
          'rate',
          'uploadImg',
          'uploadFile',
          'switch',
          'cascader',
          'treeSelect'
        ].includes(record.type)
      "
      :label-col="record.labelLocal === '1' ? {} : record.labelShow !== '0' && record.type !== 'signature' ? labelCol : {style: 'display: none'}"
      :wrapper-col="record.labelLocal === '1' ? {} : record.labelShow !== '0' && record.type !== 'signature' ? wrapperCol : { style: 'width: 100%; display: inline-block' }"
      :style="
        formConfig.layout === 'horizontal' && formConfig.labelLayout === 'flex'
          ? { display: 'flex' }
          : {}
      "
      :colon="record.labelShow !== '0' && record.type !== 'signature'"
    >
      <span slot="label">
        <span v-if="record.labelShow !== '0' && record.type !== 'signature'">{{ record.label }}</span>
        <a-tooltip v-if="record.help">
          <span slot="title" v-html="record.help"></span>
          <a-icon
            v-if="record.help"
            class="question-circle"
            type="question-circle-o"
          />
        </a-tooltip>
      </span>
      <!-- 单行文本 -->
      <a-input
        :style="{width: record.options.width, border: record.borderedShow !== 'all' ? 'none':'', borderBottom: record.borderedShow === 'bottom' ? '1px solid #e8e8e8' : record.borderedShow === 'none' ? 'none' : ''}"
        v-if="record.type === 'input'"
        :disabled="parentParams.readonly || disabled || !!record.options.disabled"
        :placeholder="record.options.placeholder"
        :allowClear="!!record.options.clearable"
        :maxLength="record.options.maxLength === '' ? null : record.options.maxLength"
        v-model="record.options.defaultValue"
      />
      <!-- 多行文本 -->
      <a-textarea
        :style="{width: record.options.width, border: record.borderedShow !== 'all' ? 'none':''}"
        v-else-if="record.type === 'textarea'"
        :autoSize="{
          minRows: record.options.minRows,
          maxRows: record.options.maxRows
        }"
        :disabled="parentParams.readonly || disabled || !!record.options.disabled"
        :placeholder="record.options.placeholder"
        :allowClear="!!record.options.clearable"
        :maxLength="record.options.maxLength === '' ? null : record.options.maxLength"
        :rows="4"
        v-model="record.options.defaultValue"
      />
      <!-- 单选框 -->
      <a-radio-group
        v-else-if="record.type === 'radio'"
        :options="
          !record.options.dynamic
            ? record.options.options
            : dynamicData[record.options.dynamicKey]
              ? dynamicData[record.options.dynamicKey]
              : []
        "
        :disabled="parentParams.readonly || disabled || !!record.options.disabled"
        :placeholder="record.options.placeholder"
        v-model="record.options.defaultValue"
      />
      <!-- 多选框 -->
      <a-checkbox-group
        v-else-if="record.type === 'checkbox'"
        :options="
          !record.options.dynamic
            ? record.options.options
            : dynamicData[record.options.dynamicKey]
              ? dynamicData[record.options.dynamicKey]
              : []
        "
        :disabled="parentParams.readonly || disabled || !!record.options.disabled"
        :placeholder="record.options.placeholder"
        v-model="record.options.defaultValue"
      />
      <!-- 开关 -->
      <a-switch
        v-else-if="record.type === 'switch'"
        :disabled="parentParams.readonly || disabled || !!record.options.disabled"
        v-model="record.options.defaultValue"
      />
      <span v-else-if="record.type === 'signature'">
        <img :src="record.file" alt="" style="max-width: 100px; height: auto" v-if="record.file">
      </span>
      <!-- 数字 -->
      <a-input-number
        v-else-if="record.type === 'number'"
        :style="`width:${record.options.width}`"
        :placeholder="record.options.placeholder"
        :disabled="disabled || !!record.options.disabled"
        :min="
          !record.options.min ? Number(record.options.defaultValue) : Number(record.options.min) || Number(record.options.min) === 0
            ? Number(record.options.min)
            : -Infinity
        "
        :max="
          !record.options.max ? Number(record.options.defaultValue) : Number(record.options.max) || Number(record.options.max) === 0
            ? Number(record.options.max)
            : Infinity
        "
        :precision="
          record.options.precision > 50 ||
            (!record.options.precision && record.options.precision !== 0)
            ? null
            : record.options.precision
        "
        :step="record.options.step"
        v-model="record.options.defaultValue"
      />
    </a-form-item>
    <!-- 办理方式配置 -->
    <div v-if="params.page === 'workflow' && parentParams.viewType !== 'view' && record.type === 'work'">
      <a-divider orientation="left" v-if="record.workDivider === '1'">流程办理</a-divider>
      <a-form-item label="办理方式" :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol" :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol">
        <a-radio-group v-decorator="['handleWay', {initialValue: viewThis.defaultWay, rules: [{required: true, message: '请选择办理方式'}]}]" >
          <a-radio
            v-for="(wayItem, wayIndex) in params.handleWayData"
            :key="wayIndex"
            :value="wayItem.alias"
            :checked="wayItem.default === '1'"
            @change="handleWayChange"
            v-show="wayItem.onoff && (wayItem.display==='v' || !wayItem.display)">{{ wayItem.way }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </div>
    <!-- 办理备注 -->
    <a-form-item
      label="办理备注"
      :labelCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: ${parentParams.labelWidth}px; display: inline-block` } : labelCol"
      :wrapperCol="parentParams.labelWidth && parentParams.labelWidth !== '100' ? { style: `width: calc(100% - ${parentParams.labelWidth}px); display: inline-block` } : wrapperCol"
      v-if="params.remarksrule !== 'hidden' && record.type === 'workRemark' && params.page === 'workflow' && parentParams.viewType !== 'view'">
      <a-textarea
        :rows="4"
        v-decorator="['handleRemarks', {initialValue: handleRemarks, rules: [{required: params.remarksrule === 'show_allow' ? true: false, message: '办理备注不能为空'}]}]"
      />
    </a-form-item>
    <select-user-form ref="selectUserForm" @ok="handleSelectUserData" :key="userKey" />
    <select-department ref="selectDepartment" @ok="handleSelectUserData" :key="departmentKey" />
    <!-- 关联数据 -->
    <user-table-win-list ref="userTableWinList" :key="winKey" @ok="getVal" />
    <!-- 链接查看 -->
    <UserTableForm ref="userTableForm" :key="indexKey" />
  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import moment from 'moment'
import { Rate, TreeSelect } from 'ant-design-vue'
import KFormDesign from '@/views/admin/FormDesign/packages/index'
import debounce from 'lodash/debounce'
import vueEsign from 'vue-esign'
Vue.use(KFormDesign)
Vue.use(Rate)
Vue.use(TreeSelect)
Vue.use(vueEsign)
export default {
  name: 'BuildBlocks',
  components: {
    UserTableComponents: () => import('./UserTableComponents'),
    SelectUserForm: () => import('./SelectUserForm'),
    SelectDepartment: () => import('./SelectDepartment'),
    UserTableList: () => import('./UserTableList'),
    UserTableSubformList: () => import('./UserTableSubformList'),
    UserTableWinList: () => import('./UserTableWinList'),
    UserTableForm: () => import('./UserTableForm'),
    UEditor: () => import('@/components/Editor/UEditor'),
    AddressSelect: () => import('../Field/AddressSelect'),
    TabsSelect: () => import('../Field/TabsSelect'),
    TagSet: () => import('@/views/admin/Tag/TagSet'),
    LocationSet: () => import('@/views/admin/Field/LocationSet'),
    UserTableFormView: () => import('./UserTableFormView.vue'),
    Knowledge: () => import('@/views/crm/Knowledge'),
    CheckWarrantyPeriod: () => import('@/views/crm/CheckWarrantyPeriod')
  },
  props: {
    record: {
      type: Object,
      required: true
    },
    formConfig: {
      type: Object,
      default: () => ({
        customStyle: '',
        hideRequiredMark: false,
        labelCol: {
          lg: 4,
          md: 4,
          sm: 4,
          xl: 4,
          xs: 4,
          xxl: 4
        },
        layout: 'horizontal',
        wrapperCol: {
          lg: 18,
          md: 18,
          sm: 18,
          xl: 18,
          xs: 18,
          xxl: 18
        }
      }),
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    dynamicData: {
      type: Object,
      default: () => {},
      required: true
    },
    viewThis: {
      type: Object,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tableName: {
      type: String,
      default: ''
    },
    templateObj: {
      type: Object,
      default: () => {}
    },
    formdata: {
      type: Object,
      default: () => {},
      required: false
    },
    fieldRule: {
      type: Array,
      default: () => []
    },
    handleWayData: {
      type: Array,
      default: () => []
    },
    indexs: {
      type: Number,
      default () {
        return 0
      }
    },
    params: {
      type: Object,
      default () {
        return {
          tableName: '',
          parentParams: {}, // 父级的params
          template: [],
          fileList: [],
          page: '', // 传递来的页面，表单视图为'user', WorkflowHandleForm的页面可以传空值也可以传其他
          handleWayData: [], // WorkflowHandleForm的waydata
          remarksrule: '' // 办理方式show_no_allow可见选填，show_allow可见必填 hidden隐藏
        }
      },
      required: true
    },
    parentParams: {
      type: Object,
      default: () => {}
    },
    formThis: {
      type: Object,
      default () {
        return {}
      }
    },
    templateOther: {
      type: Array,
      default () {
        return []
      }
    },
    linkData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    this.debounceToast = debounce(this.debounceToast, 800)
    return {
      lineWidth: 6,
      lineColor: '#000000',
      bgColor: '',
      resultImg: '',
      isCrop: false,
      // 新增以上
      indexKey: 'tableform',
      role: '',
      department: '',
      username: '',
      loadMore: true,
      tracespin: false,
      SHOW_PARENT: TreeSelect.SHOW_PARENT,
      SHOW_CHILD: TreeSelect.SHOW_CHILD,
      labelCol: { style: 'width: 104px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 104px); display: inline-block' },
      // 用于定制开发作数据交换时使用，自定义组件时使用parent.$set(parent.data, 'mydata', 'hello')
      viewData: { },
      linkDataEffect: {}, // 数据联动
      wayData: [],
      handleWayDataOther: [],
      cascaderState: {},
      addressValue: {},
      pageLoading: false,
      values: {},
      defaultWay: '',
      traceData: [],
      handleRemarks: '',
      imagePreviewVisible: false, // 图片预览
      portraitForm: this.$form.createForm(this),
      imagePreviewUrl: '',
      alias: '', // 鼠标进入的字段
      type: '', // 鼠标进入的字段的类型
      traceParameter: {
        pageNo: 1,
        pageSize: 10,
        sortField: 'id',
        sortOrder: 'descend'
      },
      columnsMark: [ {
        title: '变更字段',
        dataIndex: 'field_name',
        width: 300
      }, {
        title: '变更前',
        dataIndex: 'before',
        width: 400,
        customRender: (text, record, index) => {
          if (text) {
            return text
          } else {
            return '--'
          }
        }
      }, {
        title: '变更后',
        dataIndex: 'after',
        customRender: (text, record, index) => {
          if (text) {
            return text
          } else {
            return '--'
          }
        }
      } ],
      typeActions: new Map([[
        '', value => value
      ], [
        'text', (value) => value.target ? value.target.value : value
      ], [
        'textarea', (value) => value.target ? value.target.value : value
      ], [
        'datetime', (time, timeString) => timeString
      ], [
        'combobox', (value) => value
      ], [
        'radio', (value) => value.target ? value.target.value : value
      ], [
        'checkbox', (value) => value
      ], [
        'number', (value) => value
      ], [
        'cascader', (value) => value
      ], [
        'switch', (value) => String(value)
      ], [
        'autocomplete', (value) => value
      ], [
        'score', (value) => value
      ], [
        'address', (value) => value
      ], [
        'treeselect', (value) => value
      ], [
        'serialnumber', (value) => value
      ], [
        'tag', (value) => value
      ] ]),
      actions: new Map([[
        '', function (value, inputValue) {
          return true
        } ], [
        'contain', function (value, inputValue, allValue, all) {
          if (all) {
            if (all.indexOf(allValue) !== -1 && inputValue) {
              return true
            } else if (all.indexOf(allValue) === -1) {
              return false
            }
          } else if (inputValue.indexOf(value) === -1) {
            return false
          } else if (inputValue.indexOf(value) !== -1) {
            return true
          }
        } ], [
        'nc', function (value, inputValue, allValue, all) {
          if (all) {
            if (all.indexOf(allValue) === -1) {
              return true
            } else if (all.indexOf(allValue) !== -1) {
              return false
            }
          } else if (inputValue.indexOf(value) !== -1) {
            return false
          } else if (inputValue.indexOf(value) === -1) {
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
      queryParamLog: { },
      queryParamUrge: { },
      colLayoutLog: { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 },
      colLayoutUrge: { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 },
      advancedLog: false,
      // 流程日志表头
      columnsLog: [{
        title: 'ID',
        dataIndex: 'id',
        width: 80
      }, {
        title: '流程任务',
        dataIndex: 'logTitle',
        width: 200
      }, {
        title: '办理人',
        dataIndex: 'username',
        ellipsis: false,
        width: 200,
        scopedSlots: { customRender: 'username' }
      }, {
        title: '办理时间',
        dataIndex: 'create_time',
        width: 200
      }, {
        title: '办理方式',
        dataIndex: 'type',
        width: 150
      }, {
        title: '办理备注',
        dataIndex: 'content',
        ellipsis: false,
        minWidth: 200,
        scopedSlots: { customRender: 'content' }
      }],
      advancedUrge: false,
      // 催办日志表头
      columnsUrge: [{
        title: 'ID',
        dataIndex: 'id',
        width: 60
      }, {
        title: '催办人',
        dataIndex: 'urge_user',
        width: 100
      }, {
        title: '催办时间',
        dataIndex: 'urge_time',
        width: 150
      }, {
        title: '催办流程节点',
        dataIndex: 'urgeTitle',
        width: 120
      }, {
        title: '被催办人',
        dataIndex: 'username',
        ellipsis: false,
        width: 150,
        scopedSlots: { customRender: 'username' }
      }, {
        title: '催办原因',
        dataIndex: 'urge_reason',
        width: 150
      }, {
        title: '催办备注',
        ellipsis: false,
        dataIndex: 'urge_remarks',
        scopedSlots: { customRender: 'urge_remarks' }
      }, {
        title: '催办后完成时效',
        dataIndex: 'finish_efective',
        width: 120
      }],
      data: [],
      wayRuleAlias: [], // 转部门字段
      userKey: 'user',
      winKey: 'winKey',
      departmentKey: 0,
      timeout: null,
      tagData: [],
      aliasKey: '',
      selectTimeout: null
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  created () {
    this.data = this.fieldRule
    if (this.record.field && this.record.formtype === 'organization') {
      const optionCustom = this.record.field.setting.form && this.record.field.setting.form.optionCustom ? JSON.parse(JSON.stringify(this.record.field.setting.form.optionCustom)) : []
      const optionType = this.record.field.setting.form.option_type
      const optionName = optionType === 'role' ? 'roleid' : (optionType === 'user' ? 'username' : 'departmentid')
      let optionData = []
      if (this.record.field.option) {
        optionData = JSON.parse(JSON.stringify(this.record.field.option))
        optionData.forEach(item => {
          const obj = {}
          obj[optionName] = item.value
          if (optionName === 'username') {
            obj['text'] = item.label
          } else {
            obj['name'] = item.label
          }
          if (optionCustom.every(opItem => opItem[optionName] !== item.value)) {
            optionCustom.push(obj)
          }
        })
      }
      this.$set(this.record.field, 'option', optionCustom)
      const value = this.record.field.value
      if (typeof (value) === 'string') {
        if (optionCustom.length > 0 && optionCustom.isArray) {
          this.record.field.value = optionCustom.some(optionItem => {
            return optionItem[optionName] === value
          }) ? this.record.field.value : ''
        }
      } else {
        this.record.field.value = value.filter(valueItem => {
          return optionCustom.some(optionItem => {
            return optionItem[optionName] === valueItem
          })
        })
      }
    } else if (this.record.field && this.record.field.formtype === 'checkbox') {
      this.record.indeterminate = false
      this.record.checkAll = false
      this.record.field.value.forEach(valItem => {
        if (this.record.field.option.some(opItem => opItem.value === valItem)) {
          this.record.indeterminate = true
        }
      })
      this.record.checkedList = this.record.field.value
      this.record.optionValue = this.record.field.option.map(item => item.value)
      if (JSON.stringify(this.record.field.value) === JSON.stringify(this.record.optionValue)) {
        this.record.checkAll = true
        this.record.indeterminate = false
      }
    } else if (this.record.type === 'formmark' && this.parentParams.action === 'edit') {
      this.axios({
        url: 'admin/UserTable/getFieldTraceData',
        data: Object.assign(this.traceParameter, { tablename: this.tableName, id: this.parentParams.record.id })
      }).then(res => {
        res.result.data.forEach(item => {
          item.setting = JSON.parse(item.setting)
        })
        this.traceData = res.result.data
        this.traceParameter.pageNo++
      })
    } else if (this.record.type === 'portrait') {
      const obj = {}
      const getTemplate = (array) => {
        array.forEach((item, index) => {
          if (item.columns) {
            getTemplate(item.columns)
          } else if (item.trs) {
            getTemplate(item.trs)
          } else if (item.tds) {
            getTemplate(item.tds)
          } else if (item.list) {
            getTemplate(item.list)
          } else {
            if (item.field && (item.field.alias === 'glkhbh' || item.field.alias === 'khbh' || item.field.alias === 'khdh1')) {
              obj[item.field.alias] = item.field.value
            }
          }
        })
      }
      getTemplate(this.viewThis.template)
      this.record.loading = true
      this.axios({
        url: 'admin/UserTable/init',
        params: {
          sortField: 'id',
          sortOrder: 'descend',
          pageNo: 1,
          pageSize: 30
        },
        data: {
          associated: [],
          customColumns: [],
          searchString: {
            khbh: obj.glkhbh || obj.khbh || 'XXXXXX',
            khdh1: obj.khdh1
          },
          tplviewid: '069d7670919b354b9576cd619604a96f'
        }
      }).then(res => {
        if (res.result.data[0]) {
          this.$set(this.record, 'enable', false)
          this.record.enable = false
          this.record.data = res.result.data[0]
          this.$set(this.record, 'loading', false)
          this.record.action = 'edit'
          this.$forceUpdate()
        } else {
          this.$set(this.record, 'enable', true)
          this.$forceUpdate()
          this.record.action = 'add'
          this.axios({
            url: 'admin/UserTable/add',
            data: {
              action: 'add',
              listTplviewid: '069d7670919b354b9576cd619604a96f',
              tplviewid: '414e1bd4120df8786b035a9d160d0f87'
            }
          }).then(res => {
            if (obj.khdh1) {
              const getPortrait = (array) => {
                array.forEach((item, index) => {
                  if (item.columns) {
                    getPortrait(item.columns)
                  } else if (item.trs) {
                    getPortrait(item.trs)
                  } else if (item.tds) {
                    getPortrait(item.tds)
                  } else if (item.list) {
                    getPortrait(item.list)
                  } else {
                    if (item.field && item.field.alias === 'khdh1') {
                      item.field.value = obj.khdh1
                    } else if (item.field && item.field.alias === 'khjb') {
                      item.field.value = 'ptkh'
                    } else if (item.field && item.field.alias === 'shifu_md') {
                      item.field.value = 'f'
                    }
                  }
                })
              }
              getPortrait(res.result.template)
            }
            this.record.params = res.result
            this.$set(this.record, 'loading', false)
            this.$forceUpdate()
          })
        }
        this.$forceUpdate()
      })
    } else if (this.record.field && this.record.field.formtype === 'combobox' && !['src_path_back', 'linkData', 'addressBook'].includes(this.record.field.setting.attribute.dataSource)) {
      if (this.record.field.setting.attribute.mode === 'default') {
        if (this.record.field.option.every(item => item.value !== this.record.field.value)) {
          this.record.field.value = undefined
        }
      } else {
        const value = []
        this.record.field.value.forEach(item => {
          if (this.record.field.option.some(opItem => opItem.value === item)) {
            value.push(item)
          }
        })
        this.record.field.value = value
      }
    } else if (this.record.field && this.record.field.formtype === 'tag') {
      this.tagData = this.record.field.value || []
    } else if (this.record.type === 'component') {
      this.coms = () => import('@/views/' + this.record.filePath)
    } else if (this.record.type === 'subform') {
      if (this.record.relationTable && this.record.relationTable.relation && !this.record.relationTable.relation.value) {
        const field = this.record.associated_list.field
        const formData = this.viewThis.form.getFieldsValue()[this.tableName]
        const value = this.parentParams.record['_' + field + '_'] ? this.parentParams.record['_' + field + '_'] : this.parentParams.record[field]
        this.record.relationTable.relation.val = formData && formData[field] ? formData[field] : this.record.relationTable.relation.val ? this.record.relationTable.relation.val : value
      }
    }
  },
  methods: {
    handleResetBorad (record) {
      this.$refs['esign' + record.key].reset() // 清空画布
    },
    handleGenerate (record) {
      this.$refs['esign' + record.key].generate().then(res => {
        this.resultImg = res // 得到了签字生成的base64图片
        const file = this.base64ToFile(res)
        const formData = new FormData()
        formData.append('upfile', file)
        formData.append('type', 'ajax')
        this.$nextTick(() => {
          this.axios({
            url: '/admin/attachment/ueditor?action=uploadimage',
            data: formData
          }).then(res => {
            this.$set(this.record, 'file', res.url)
          })
        })
      }).catch(() => { //  没有签名，点击生成图片时调用
        this.$message.warning('未签名！')
      })
    },
    base64ToFile (data) {
      // 将base64 的图片转换成file对象上传 atob将ascii码解析成binary数据
      const binary = atob(data.split(',')[1])
      const mime = data.split(',')[0].match(/:(.*?);/)[1]
      const array = []
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      const fileData = new Blob([new Uint8Array(array)], {
        type: mime
      })
      const file = new File([fileData], `${new Date().getTime()}.png`, { type: mime })
      return file
    },
    // 以上新增
    // 表单赋值方法
    giveData (obj, addressValue, alias) {
      this.$emit('give', obj, addressValue, alias)
    },
    // 改变template内容方法
    changeTem (item) {
      this.$emit('changeTem', item)
    },
    // 实现表单规则
    templateRule (item) {
      this.$emit('templateRule', item)
    },
    // 表单规则恢复
    recoveryRule (item) {
      this.$emit('recoveryRule', item)
    },
    // 事件触发实现
    sendEvent (eventName, alias, options1, options2) {
      this.$emit('sendEvent', eventName, alias, options1, options2)
    },
    getRuleAlias (data) {
      this.$emit('getRuleAlias', data)
    },
    // 办理方式表单规则实现
    wayRule (item) {
      this.$emit('wayRule', item)
    },
    // 重置办理方式表单规则
    resetTem (item, resetItem) {
      this.$emit('resetTem', item, resetItem)
    },
    // 数据联动
    sentLinkData (alias, option) {
      this.$emit('sentLinkData', alias, option)
    },
    // 页面回显图片
    normFile (e) {
      if (Array.isArray(e)) {
        return e
      }
      if (e.fileList.length > 0 && e.fileList.every(item => item.response)) {
        e.fileList = e.fileList.filter(item => item.response && item.response.code === 0)
      }
      return e && e.fileList
    },
    // 链接查看
    getLinkList (item) {
      const tableid = item.field.setting.autofill.source[1]
      const field = item.field.setting.autofill.source_field
      const value = item.field.value
      const tplviewid = item.field.setting.autofill.source_linkview
      this.viewThis.pageLoading = true
      this.axios({
        url: '/admin/UserTable/getLinkRecord',
        params: { tableid, field, value }
      }).then(res => {
        this.indexKey = this.indexKey === 'tableform' ? 'tableform_1' : 'tableform'
        this.$nextTick(() => {
          this.viewThis.pageLoading = false
          this.$refs.userTableForm.show({
            page: 'formview',
            tpl: tplviewid,
            record: res.result.data,
            flowStatus: res.result.dataType === 'history' ? 'finish' : 'proceed',
            title: '详情',
            url: '/admin/UserTable/edit',
            width: '1200'
          })
        })
      })
    },
    // 流程日志
    loadDataLog (parameter) {
      return this.axios({
        url: '/admin/Centerflow/workflowLog',
        params: Object.assign(parameter, this.queryParamLog, { case_id: this.parentParams.case_id, flowStatus: this.parentParams.flowStatus })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['logTitle'] = res.result.data[i].title
        }
        return res.result
      })
    },
    // 流程催办日志
    loadDataUrge (parameter) {
      return this.axios({
        url: '/admin/Centerflow/workflowUrgeLog',
        params: Object.assign(parameter, this.queryParamLog, { case_id: this.parentParams.case_id })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['urgeTitle'] = res.result.data[i].title
        }
        return res.result
      })
    },
    // 图片预览
    handleImagePreview (item, file) {
      let fileList = []
      let idx = 0
      fileList = item.field.initValue ? item.field.initValue : item.field.value
      fileList.forEach((item, index) => {
        if (item.uid === file.uid) {
          idx = index
        }
      })
      const name = '.' + item.field.alias
      const viewer = this.$el.querySelector(name).$viewer
      viewer.view(idx)
    },
    // 附件限制条件
    beforeUpload (file, fileList, item) {
      return new Promise((resolve, reject) => {
        let isLt2M = true
        if (item.field.setting.form && item.field.setting.form.size) {
          isLt2M = file.size / 1024 / 1024 < item.field.setting.form.size
        }
        if (!isLt2M) {
          return reject(file)
        }
        return resolve(file)
      })
    },
    // 多选框选择全部
    onCheckAll (e, item, index) {
      item.checkAll = e.target.checked
      item.checkedList = e.target.checked ? item.optionValue : []
      item.indeterminate = false
      const obj = {}
      obj[this.tableName + '[' + item.field.alias + ']'] = item.checkedList
      this.$emit('give', obj)
    },
    // 多选框选择单个
    onCheck (value, item) {
      this.$set(item, 'indeterminate', !!value.length && !!item.optionValue && value.length < item.optionValue.length)
      this.$set(item, 'checkAll', !!item.optionValue && value.length === item.optionValue.length)
    },
    // 自动完成
    onSearch (item, value) {
      value = value.trim()
      if (item.field.setting.attribute.dataSource !== 'custom') {
        if (value) {
          clearTimeout(item.timeoutId)
          item.timeoutId = setTimeout(() => {
            this.axios({
              url: '/admin/userTable/getAutocompleteData/',
              params: { fieldid: item.fieldid, search: value }
            }).then(res => {
              item.field.setting.form.custom_data_list = res.result.option
              this.$emit('changeTem', item)
            })
          }, 500)
        } else {
          item.field.setting.form.custom_data_list = []
          this.$emit('changeTem', item)
        }
      }
    },
    getAddress (name, number, alias, allValue) {
      const obj = {}
      obj[alias] = name
      this.addressValue[alias] = number
      this.$emit('give', obj, number, alias)
      this.$set(this.record.field.value, 'address', number)
      this.onChange(this.record, this.record.field.formtype, number, '', allValue)
    },
    // 地址选择必填级数
    checkRequired (rule, value, callback) {
      const index = this.record.field.setting.form.req_series
      const string = '地址选择级数不得小于' + index
      const array = value.split('/')
      if (array.length < Number(index)) {
        callback(string)
      } else {
        callback()
      }
    },
    checkleaf (rule, value, callback) {
      const str = '请选择至最后一级'
      if (this.cascaderState[rule.field]) {
        callback(str)
      } else {
        callback()
      }
    },
    getcascaderValue (val, alias, name, state, allValue) {
      const obj = {}
      obj[alias] = val
      this.cascaderState[alias] = state
      this.$emit('give', obj)
      this.onChange(this.record, this.record.field.formtype, val, '', allValue)
    },
    // 数据联动
    getLinkData (alias, inputValue, type, item) {
      if (item.aliasKey) {
        const formData = this.viewThis.form.getFieldsValue()[this.tableName]['product_' + item.aliasKey]
        const obj = {}
        const getLink = (string) => {
          for (const i in this.linkData) {
            if (this.linkData[i].currentFieldEffect === string) {
              obj[this.linkData[i].sourceFieldCause] = formData[this.linkData[i].currentFieldCause]
              getLink(this.linkData[i].currentFieldCause)
            }
          }
        }
        getLink(item.field.beforeAlias)
        const clearOption = (string, string1) => {
          if (string) {
            const getTemplate = (array) => {
              array.forEach((temItem, index) => {
                if (temItem.columns) {
                  getTemplate(temItem.columns)
                } else if (temItem.trs) {
                  getTemplate(temItem.trs)
                } else if (temItem.tds) {
                  getTemplate(temItem.tds)
                } else if (temItem.list) {
                  getTemplate(temItem.list)
                } else {
                  if (temItem.field && temItem.field.alias === (string + '_' + item.aliasKey)) {
                    this.$set(temItem.field, 'option', [])
                    const objData = {}
                    objData[this.tableName + '[product_' + item.aliasKey + ']' + '[' + string + ']'] = undefined
                    this.viewThis.form.setFieldsValue(objData)
                    if (this.linkData[string]) {
                      clearOption(this.linkData[string].currentFieldEffect)
                    }
                  }
                }
              })
            }
            getTemplate(this.viewThis.template)
          }
        }
        if (this.viewThis.num > 2) {
          clearOption(this.linkData[item.field.beforeAlias].currentFieldEffect)
        }
        if (inputValue) {
          const where = this.getWhere(this.linkData[item.field.beforeAlias].sourceFieldCause, inputValue, type)
          this.axios({
            url: '/admin/userTable/getLinkageData',
            params: {
              field: this.linkData[item.field.beforeAlias].sourceFieldEffect,
              tableid: this.linkData[item.field.beforeAlias].dataSource[this.linkData[item.field.beforeAlias].dataSource.length - 1]
            },
            data: { where: Object.assign(obj, where) }
          }).then(res => {
            const getTemplate = (array) => {
              array.forEach((temItem, index) => {
                if (temItem.columns) {
                  getTemplate(temItem.columns)
                } else if (temItem.trs) {
                  getTemplate(temItem.trs)
                } else if (temItem.tds) {
                  getTemplate(temItem.tds)
                } else if (temItem.list) {
                  getTemplate(temItem.list)
                } else {
                  if (temItem.field && temItem.field.alias === (this.linkData[item.field.beforeAlias].currentFieldEffect + '_' + item.aliasKey)) {
                    this.$set(temItem.field, 'option', res.result.option)
                  }
                }
              })
            }
            getTemplate(this.viewThis.template)
          })
        } else {
          this.clearOptionKey(item.field.beforeAlias, item.aliasKey)
        }
      } else {
        const formData = this.viewThis.form.getFieldsValue()
        const obj = {}
        const getLink = (string) => {
          for (const i in this.linkData) {
            if (this.linkData[i].currentFieldEffect === string) {
              obj[this.linkData[i].sourceFieldCause] = formData[this.tableName][this.linkData[i].currentFieldCause]
              getLink(this.linkData[i].currentFieldCause)
            }
          }
        }
        getLink(alias)
        const clearOption = (string, string1) => {
          if (string) {
            const getTemplate = (array) => {
              array.forEach((temItem, index) => {
                if (temItem.columns) {
                  getTemplate(temItem.columns)
                } else if (temItem.trs) {
                  getTemplate(temItem.trs)
                } else if (temItem.tds) {
                  getTemplate(temItem.tds)
                } else if (temItem.list) {
                  getTemplate(temItem.list)
                } else {
                  if (temItem.field && temItem.field.alias === string) {
                    this.$set(temItem.field, 'option', [])
                    const objData = {}
                    objData[this.tableName + '[' + string + ']'] = undefined
                    this.viewThis.form.setFieldsValue(objData)
                    if (this.linkData[string]) {
                      clearOption(this.linkData[string].currentFieldEffect)
                    }
                  }
                }
              })
            }
            getTemplate(this.viewThis.template)
          }
        }
        if (this.viewThis.num > 2) {
          clearOption(this.linkData[alias].currentFieldEffect)
        }
        if (inputValue) {
          if (!this.linkData[alias].sourceFieldEffect) {
            if (item) {
              const src = item.field.setting.form.src
              this.axios({
                url: '/admin/dict/getCascaderData',
                params: {
                  parentNumber: inputValue,
                  src: src
                }
              }).then(res => {
                const effect = this.linkData[alias].currentFieldEffect
                const effectIndex = this.templateObj[effect] ? this.templateObj[effect].index : -1
                if (effectIndex !== -1) {
                  this.$emit('sentLinkData', effect, res.result.option)
                }
              })
            }
          } else {
            const where = this.getWhere(this.linkData[alias].sourceFieldCause, inputValue, type)
            this.axios({
              url: '/admin/userTable/getLinkageData',
              params: {
                field: this.linkData[alias].sourceFieldEffect,
                tableid: this.linkData[alias].dataSource[this.linkData[alias].dataSource.length - 1]
              },
              data: { where: Object.assign(obj, where) }
            }).then(res => {
            // 结果
              const effect = this.linkData[alias].currentFieldEffect
              const effectIndex = this.templateObj[effect] ? this.templateObj[effect].index : -1
              if (effectIndex !== -1) {
                this.$emit('sentLinkData', effect, res.result.option)
              }
            })
          }
        } else {
          this.clearOption(alias)
        }
      }
    },
    // 数据联动获取where
    getWhere (alias, value, type) {
      const that = this
      const result = {}
      result[alias] = value
      if (this.linkDataEffect[alias]) {
        getRes(alias)
      }
      function getRes (alias) {
        const causeAlias = that.linkDataEffect[alias].currentFieldCause
        const value = type === 'change' ? that.formdata[causeAlias] : that.templateObj[causeAlias].field.value
        result[causeAlias] = value
        if (that.linkDataEffect[causeAlias]) {
          getRes(causeAlias)
        }
      }
      return result
    },
    // cause字段清空数据时，清除effect字段的option
    clearOption (alias) {
      const effect = this.linkData[alias].currentFieldEffect
      const effectIndex = this.templateObj[effect] ? this.templateObj[effect].index : -1
      if (effectIndex !== -1) {
        const obj = {}
        obj[this.tableName + '[' + effect + ']'] = undefined
        this.$emit('give', obj)
        this.$emit('sentLinkData', effect, [])
      }
      if (this.linkData[effect]) {
        this.clearOption(effect)
      }
    },
    clearOptionKey (alias, key) {
      const effect = this.linkData[alias].currentFieldEffect
      const getTemplate = (array) => {
        array.forEach((temItem, index) => {
          if (temItem.columns) {
            getTemplate(temItem.columns)
          } else if (temItem.trs) {
            getTemplate(temItem.trs)
          } else if (temItem.tds) {
            getTemplate(temItem.tds)
          } else if (temItem.list) {
            getTemplate(temItem.list)
          } else {
            if (temItem.field && temItem.field.alias === (effect + '_' + key)) {
              this.$set(temItem.field, 'option', [])
              const objData = {}
              objData[this.tableName + '[product_' + key + ']' + '[' + effect + ']'] = undefined
              this.viewThis.form.setFieldsValue(objData)
            }
          }
        })
      }
      getTemplate(this.viewThis.template)
      if (this.linkData[effect]) {
        this.clearOptionKey(effect, key)
      }
    },
    getOption (index, item, value) {
      if (item.field.setting.form.loadMode === 'dynamic') {
        clearTimeout(this.selectTimeout)
        this.selectTimeout = setTimeout(() => {
          const src = item.field.setting.form.src
          if (value) {
            this.axios({
              url: 'admin/userTable/getComboboxData',
              params: {
                src,
                search: value
              }
            }).then(res => {
              item.field.option = res.result.option
              this.$emit('changeTem', item)
            })
          } else {
            item.field.option = []
            this.$emit('changeTem', item)
          }
        }, 300)
      }
    },
    getConditionFlag (logic, conditionFlagArr) {
      if (logic === 'and') {
        return conditionFlagArr.every(item => {
          return item
        })
      } else {
        return conditionFlagArr.some(item => {
          return item
        })
      }
    },
    handleSimple (include, value, inputValue, allValue, all) {
      const action = this.actions.get(`${include}`)
      return action(value, inputValue, allValue, all)
    },
    // 选择办理方式
    handleWayChange (e) {
      const value = e.target.value
      let id = ''
      this.handleWayData.forEach(item => {
        if (item.alias === value) {
          id = item.id
        }
      })
      const wayDataAttribute = this.viewThis.wayDataAttribute.value
      const that = this.viewThis
      if (wayDataAttribute) {
        const str = 'return ' + wayDataAttribute
        // eslint-disable-next-line no-new-func
        const func = new Function(str)
        func()(that, value)
      }
      this.handleWayProRule(id)
    },
    // 办理流程方式配置规则
    handleWayProRule (value) {
      const wayDataRule = this.params.wayDataRule || []
      const wayRuleAlias = []
      this.handleWayData.forEach(item => {
        if (item.id === value) {
          wayDataRule.forEach(wayItem => {
            const simpleFlagArr = []
            wayItem.simpleCondition.forEach(simItem => {
              if (simItem.fieldUser === 'way') {
                simItem.flag = simItem.way === item.alias
              } else if (simItem.fieldUser === 'currentUser') {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  const flag = this.handleUserSimple(this.userInfo.username, myitem.value, simItem.include)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
              } else if (simItem.fieldUser === 'currentClass') {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  const flag = this.handleUserSimple(this.userInfo.departmentid, myitem.value, simItem.include)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
              } else if (simItem.fieldUser === 'currentRole') {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  const flag = this.handleUserSimple(this.userInfo.roleid, myitem.value, simItem.include)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
              } else if (simItem.fieldUser === 'notSet') {
                simItem.flag = true
              } else {
                const conditionFlagArr = []
                simItem.condition.forEach(myitem => {
                  if (simItem.formtype === 'number') {
                    myitem.value = Number(myitem.value)
                  }
                  const formData = this.viewThis.form.getFieldsValue()[this.tableName]
                  const inputValue = formData[simItem.field]
                  const allValue = ''
                  const flag = this.handleSimple(myitem.include, myitem.value, inputValue, myitem.allValue, allValue)
                  conditionFlagArr.push(flag)
                })
                simItem.flag = this.getConditionFlag(item.logic, conditionFlagArr)
              }
              simpleFlagArr.push(simItem.flag)
            })
            wayItem.flag = this.getConditionFlag(wayItem.logic, simpleFlagArr)
            if (wayItem.flag) {
              item.resetTem = []
              const rest = []
              wayItem.event.forEach(eventItem => {
                if (eventItem.type === 'field') {
                  rest.push(eventItem.field)
                  this.templateOther.forEach(otherItem => {
                    if (otherItem.value === eventItem.field) {
                      wayRuleAlias.push(eventItem.field)
                    }
                  })
                  this.$emit('wayRule', eventItem)
                }
              })
              if (wayItem.event.some(someItem => someItem.type !== 'way')) {
                item.resetTem = rest
              }
            }
          })
        } else {
          if (item.resetTem) {
            this.$emit('resetTem', item.resetTem)
          }
        }
      })
      this.wayRuleAlias = [...new Set(wayRuleAlias)]
      this.$emit('getRuleAlias', wayRuleAlias)
    },
    // 判断当前用户，用户所在部门，所属于角色
    handleUserSimple (current, conditionValue, include) {
      if (include === 'bl' || !include) {
        if (conditionValue.indexOf(current) !== -1) {
          return true
        } else {
          return false
        }
      } else {
        if (conditionValue.indexOf(current) !== -1) {
          return false
        } else {
          return true
        }
      }
    },
    // 卡片添加
    cardAddChange () {
      const data = JSON.parse(JSON.stringify(this.record))
      const arr = []
      const floot = parseInt(Math.random() * (100000000 - 1000000 + 1) + 1000000, 10)
      data.aliasKey = floot
      const dataChange = (array) => {
        array.forEach((item, index) => {
          if (item.columns) {
            dataChange(item.columns)
          } else if (item.trs) {
            dataChange(item.trs)
          } else if (item.tds) {
            dataChange(item.tds)
          } else if (item.list) {
            dataChange(item.list)
          } else {
            item.aliasKey = floot
            item.value = item.value + '_' + floot
            if (item.field) {
              if (item.field.beforeAlias) {
                item.field.alias = item.field.beforeAlias + '_' + floot
              } else {
                item.field.beforeAlias = JSON.parse(JSON.stringify(item.field.alias))
                item.field.alias = item.field.alias + '_' + floot
              }
              if (item.formtype === 'address') {
                item.field.value = {
                  address: '',
                  display: ''
                }
              } else if (item.formtype === 'cascader') {
                item.field.value = {
                  value: '',
                  display: ''
                }
              }
            }
          }
        })
      }
      arr.push(data)
      dataChange(arr)
      data.key = new Date().getTime()
      this.$set(this.viewThis, 'cardKey', data.key)
      this.$set(this.viewThis, 'aliasKey', data.aliasKey)
      this.$emit('cardAdd', data, this.indexs)
      this.$nextTick(() => {
        let index = 1
        if (this.parentParams.tableid === 'c289bf71e6254134d7c35833e1014b18') {
          index = 0
        }
        const getIndex = (array) => {
          array.forEach(item => {
            if (item.columns) {
              getIndex(item.columns)
            } else if (item.trs) {
              getIndex(item.trs)
            } else if (item.tds) {
              getIndex(item.tds)
            } else if (item.list) {
              if (item.type === 'card' && item.addShow) {
                this.$set(item, 'index', index)
                index++
              }
              getIndex(item.list)
            }
          })
        }
        getIndex(this.viewThis.template)
      })
    },
    // 卡片删除
    delCard () {
      this.$emit('cardDel', this.indexs)
      this.$set(this.viewThis, 'cardKey', '')
      this.$set(this.viewThis, 'aliasKey', '')
      this.$nextTick(() => {
        let index = 0
        const getIndex = (array) => {
          array.forEach(item => {
            if (item.columns) {
              getIndex(item.columns)
            } else if (item.trs) {
              getIndex(item.trs)
            } else if (item.tds) {
              getIndex(item.tds)
            } else if (item.list) {
              if (item.type === 'card' && item.addShow) {
                this.$set(item, 'index', index)
                index++
              }
              getIndex(item.list)
            }
          })
        }
        getIndex(this.viewThis.template)
      })
    },
    // 选中卡片改变值
    chioseFill () {
      this.$set(this.viewThis, 'cardKey', this.record.key)
      this.$set(this.viewThis, 'aliasKey', this.record.aliasKey)
    },
    // 上传文件失败提示
    debounceToast (item) {
      this.$message.error(item.response.message)
    },
    // 图片附件赋值
    fileChange (info) {
      info.fileList = info.fileList.map(item => {
        if (item.response && item.response.code !== 0) {
          this.debounceToast(item)
        }
        const obj = {
          name: item.name,
          response: item.response,
          status: item.status,
          uid: item.uid,
          url: item.response && item.response.result ? (this.setting.rootUrl + item.response.result.filePath) : ''
        }
        return obj
      })
      if (info.file.status === 'done' || info.file.status === 'removed') {
        this.$set(this.record.field, 'initValue', info.fileList)
      }
    },
    // 流程日志刷新
    refresh () {
      if (this.$refs.tableLog) {
        this.$refs.tableLog.refresh(false)
      }
    },
    // 事件处理
    handleEvent (eventName, alias, options1, options2) {
      this.$emit('sendEvent', eventName, alias, options1, options2)
    },
    // 监听输入值得变化
    onChange (item, type, options1, options2, allValue) {
      const alias = item.field.alias
      this.handleEvent('change', alias, options1, options2)
      if (!this.typeActions.get(type)) {
        return
      }
      const action = this.typeActions.get(type)
      const inputValue = action(options1, options2)
      // 数据联动
      if (this.linkData[alias]) {
        this.getLinkData(alias, inputValue, 'change', item)
      }
      if (item.aliasKey && item.field && this.linkData[item.field.beforeAlias]) {
        this.getLinkData(alias, inputValue, 'change', item)
      }
      // 执行事件字段集合
      let eventArr = []
      for (const i in this.data) {
        for (const j in this.data[i].simpleCondition) {
          for (const k in this.data[i].event) {
            if (this.data[i].event[k].field === this.data[i].simpleCondition[j].field && this.data[i].simpleCondition.every(simConItem => simConItem.field === this.data[i].event[k].field)) {
              this.data[i].event.splice(k, 1)
              this.data[i].simpleCondition.splice(j, 1)
            }
          }
        }
      }
      if (this.data) {
        this.data.forEach(dataItem => {
          const simpleFlagArr = []
          dataItem.simpleCondition.forEach(simItem => {
            const conditionFlagArr = []
            if (simItem.field === alias) {
              simItem.condition.forEach((myitem) => {
                if (type === 'number') {
                  myitem.value = Number(myitem.value)
                }
                if (myitem && !myitem.value) {
                  myitem.value = ''
                }
                const flag = this.handleSimple(myitem.include, myitem.value, inputValue, myitem.allValue, allValue)
                conditionFlagArr.push(flag)
              })
              simItem.flag = this.getConditionFlag(simItem.logic, conditionFlagArr)
            }
            simpleFlagArr.push(simItem.flag)
          })
          dataItem.flag = this.getConditionFlag(dataItem.logic, simpleFlagArr)
          // 规则事件执行
          if (dataItem.flag) {
            dataItem.event.forEach(eventItem => {
              // 该字段被执行事件保留在eventArr中
              eventArr.push(eventItem.field)
              this.$emit('templateRule', eventItem)
            })
          }
        })
        // 编辑事件字段集合，如果该字段没有出现则字段组件显示最初状态
        eventArr.push(...this.viewThis.wayRuleAlias)
        eventArr = Array.from(new Set(eventArr))
      }
      if (!this.handleWayData) {
        return false
      }
      const wayDataRule = this.params.wayDataRule
      if (wayDataRule && wayDataRule.length) {
        wayDataRule.forEach(dataItem => {
          const simpleFlagArr = []
          dataItem.simpleCondition.forEach(simItem => {
            const conditionFlagArr = []
            const handleWay = this.viewThis.form.getFieldsValue().handleWay
            if (simItem.fieldUser === 'way') {
              this.$set(simItem, 'flag', item.way === handleWay)
            } else if (simItem.field === alias) {
              simItem.condition.forEach((myitem) => {
                if (type === 'number') {
                  myitem.value = Number(myitem.value)
                }
                const flag = this.handleSimple(myitem.include, myitem.value, inputValue, myitem.allValue, allValue)
                conditionFlagArr.push(flag)
              })
              this.$set(simItem, 'flag', this.getConditionFlag(simItem.logic, conditionFlagArr))
            }
            simpleFlagArr.push(simItem.flag)
          })
          this.$set(dataItem, 'flag', this.getConditionFlag(dataItem.logic, simpleFlagArr))
          if (dataItem.flag) {
            dataItem.event.forEach(eveItem => {
              if (eveItem.type === 'field') {
                const getTemplate = (array) => {
                  array.forEach((temItem, index) => {
                    if (temItem.columns) {
                      getTemplate(temItem.columns)
                    } else if (temItem.trs) {
                      getTemplate(temItem.trs)
                    } else if (temItem.tds) {
                      getTemplate(temItem.tds)
                    } else if (temItem.list) {
                      getTemplate(temItem.list)
                    } else {
                      if (temItem.field && temItem.field.alias === eveItem.field) {
                        eventArr.push(eveItem.field)
                        this.$emit('templateRule', eveItem)
                      }
                    }
                  })
                }
                getTemplate(this.viewThis.template)
              } else {
                this.handleWayData.forEach(wayItem => {
                  if (eveItem.alias === wayItem.alias) {
                    wayItem.beforeDisplay = wayItem.display
                    wayItem.change = true
                    if (eveItem.status === 'hidden') {
                      this.$set(wayItem, 'display', 'h')
                    } else {
                      this.$set(wayItem, 'display', 'v')
                    }
                  }
                })
              }
            })
          } else {
            wayDataRule.forEach(ruleItem => {
              if (!ruleItem.flag) {
                this.handleWayData.forEach(handleItem => {
                  if (ruleItem.event.findIndex(ruleEventItem => handleItem.alias === ruleEventItem.alias) !== -1 && handleItem.change) {
                    handleItem.display = handleItem.beforeDisplay
                    handleItem.change = false
                  }
                })
              }
            })
            dataItem.event.forEach(eveItem => {
              if (!eventArr.includes(eveItem.field)) {
                eventArr.push(eveItem.field)
              }
            })
          }
        })
      }
      this.$emit('recoveryRule', eventArr)
    },
    // 时间日期组件不可选日期
    disabledDate (current, item) {
      let minValue = ''
      let maxValue = ''
      if (item.field.setting.form.minType === 'field') {
        const alias = item.field.setting.form.minValue
        minValue = this.formdata[alias]
      } else if (item.field.setting.form.minType === 'now') {
        minValue = this.moment().subtract(1, 'day')
      } else {
        minValue = item.field.setting.form.minValue
      }
      if (item.field.setting.form.maxType === 'field') {
        const alias = item.field.setting.form.maxValue
        maxValue = this.formdata[alias]
      } else if (item.field.setting.form.maxType === 'now') {
        maxValue = this.moment().subtract(1, 'day')
      } else {
        maxValue = item.field.setting.form.maxValue
      }
      if (maxValue) {
        maxValue = new Date(maxValue)
        maxValue.setDate(maxValue.getDate() + 1)
      }
      if (minValue && maxValue) {
        return current < moment(minValue) || current > moment(maxValue)
      } else if (minValue) {
        return current < moment(minValue)
      } else if (maxValue) {
        return current > moment(maxValue)
      }
    },
    // 时分秒比较大小
    handleCompare (time, timeTarget) {
      const arr = time.split(':')
      const arrT = timeTarget.split(':')
      const h = arr[0]
      const m = arr[1]
      const s = arr[2]
      const ht = arrT[0]
      const mt = arrT[1]
      const st = arrT[2]
      if (h < ht) {
        return -1
      } else if (h === ht) {
        if (m < mt) {
          return -1
        } else if (m === mt) {
          if (s < st) {
            return -1
          } else if (s === st) {
            return 0
          } else {
            return 1
          }
        } else {
          return 1
        }
      } else {
        return 1
      }
    },
    // 组织结构
    organizationSearch (item, value) {
      clearTimeout(this.timeout)
      if (!value) {
        item.field.selectList = []
        return
      }
      this.timeout = setTimeout(() => {
        let data = []
        const optionCustom = item.field.setting.form.optionCustom
        data = optionCustom.filter(item1 => {
          return item1.username.indexOf(value) > -1
        })
        this.$set(item.field, 'selectList', data)
      }, 300)
    },
    // 打开选择用户界面
    handleSelectUserForm (item, index) {
      const value = this.formdata[this.record.field.alias]
      this.userKey = this.userKey === 'user' ? 'user_1' : 'user'
      this.$nextTick(() => {
        this.$refs.selectUserForm.show({
          fieldid: item.field.fieldid,
          selectValue: value,
          mode: item.field.setting.attribute.mode,
          index: index
        })
      })
    },
    // 打开选择部门，角色窗口
    handleSelect (item, index) {
      const value = this.formdata[this.record.field.alias] || []
      this.departmentKey = this.departmentKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.selectDepartment.show({
          optionCustom: item.field.setting.form.optionCustom,
          option: item.field.option,
          optionType: item.field.setting.form.option_type,
          selectValue: value,
          mode: item.field.setting.attribute.mode,
          index: index,
          url: item.field.setting.form.option_type === 'department' ? '/admin/Department/getDepartmentUser' : '/admin/Role/getRoleData'
        })
      })
    },
    // 选择部门，角色
    handleSelectUserData (selectValue, index, conIndex, option) {
      const name = this.tableName + '[' + this.record.field.alias + ']'
      const obj = {}
      let data
      if (selectValue) {
        data = selectValue
      }
      this.record.field.option = option
      this.formdata[this.record.field.alias] = data
      obj[name] = data
      this.$emit('give', obj)
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
            this.record.field.option.forEach(item => {
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
        }
        resolve()
      })
    },
    getEnable () {
      if (this.record.action === 'edit') {
        this.axios({
          url: 'admin/UserTable/edit',
          data: {
            action: 'edit',
            listTplviewid: '069d7670919b354b9576cd619604a96f',
            record: this.record.data,
            tplviewid: '414e1bd4120df8786b035a9d160d0f87'
          }
        }).then(res => {
          this.record.params = res.result
          this.$set(this.record, 'enable', true)
        })
      } else {
        this.$set(this.record, 'enable', true)
      }
    },
    // 客户画像切换用户
    handleUserShow (record) {
      const formData = this.formdata
      const item = this.templateObj.glkhbh
      const info = item.field.setting
      const filtersData = []
      for (const i in formData) {
        for (const j in info.form.associated) {
          if (i === info.form.associated[j].field) {
            filtersData[j] = {}
            filtersData[j].val = formData[i]
            filtersData[j].op = info.form.associated[j].op
            filtersData[j].field = info.form.associated[j].sourceField
            if (!filtersData[j].val) {
              filtersData[j].val = ''
            }
          }
        }
      }
      filtersData.forEach(item => {
        if (item && !item.val) {
          item.val = this.viewThis.form.getFieldsValue()[this.tableName][item.field]
        }
      })
      this.$nextTick(() => {
        this.$refs.userPortraitWinList.show({
          title: '选择数据',
          alias: item.field.alias,
          screenData: {
            beforeAlias: item.field.beforeAlias,
            aliasKey: item.aliasKey
          },
          info: info,
          tplviewid: info.form.dataView,
          type: 'associated',
          action: 'associated',
          filtersData: filtersData
        })
      })
    },
    // 按钮自定义事件
    buttonEvent (value) {
      const that = this
      if (value) {
        const str = 'return ' + value
        // eslint-disable-next-line no-new-func
        const func = new Function(str)
        func()(that)
      }
    },
    // 客户画像表单提交
    getPortraitForm () {
      this.$refs.portraitFormView.form.validateFields((err, values) => {
        if (!err) {
          const portraitValue = {}
          const getTemplate = (array) => {
            array.forEach((item, index) => {
              if (item.columns) {
                getTemplate(item.columns)
              } else if (item.trs) {
                getTemplate(item.trs)
              } else if (item.tds) {
                getTemplate(item.tds)
              } else if (item.list) {
                getTemplate(item.list)
              } else {
                const tableName = this.$refs.portraitFormView.parentParams.tableName
                portraitValue[tableName] = {}
                if (item.formtype === 'file' || item.formtype === 'image') {
                  const arr = []
                  if (!item.field.initValue) {
                    item.field.initValue = item.field.value
                  }
                  item.field.initValue.forEach(item1 => {
                    arr.push(item1.response.result)
                  })
                  values[this.tableName][item.field.alias] = arr
                } else if (item.formtype === 'datetime' && item.field.fieldtype === 'TIME') {
                  values[this.tableName][item.field.alias] = item.field.value
                } else if (item.formtype === 'datetime') {
                  values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias] ? moment(values[this.tableName][item.field.alias]).format('YYYY-MM-DD HH:mm:ss') : ''
                } else if (item.formtype === 'subform') {
                  values[this.tableName][item.field.alias] = item.field.initValue || item.field.value
                  for (const i in values[this.tableName][item.field.alias]) {
                    delete values[this.tableName][item.field.alias][i].sort
                  }
                  values[this.tableName][item.field.alias].forEach(item => {
                    for (const i in item) {
                      if (i.substr(0, 1) === '_' && i.substr(-1) === '_' && !i.includes('action')) {
                        delete item[i]
                      }
                    }
                  })
                } else if (item.formtype === 'switch') {
                  values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias] ? item.field.setting.form.word.value.split('/')[0] : item.field.setting.form.word.value.split('/')[1]
                } else if (item.formtype === 'autocomplete') {
                  values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias].replace(/\s*/g, '')
                } else if (item.formtype === 'address') {
                  if (!values[this.tableName][item.field.alias]) {
                    values[this.tableName][item.field.alias] = {}
                  }
                  const address = this.tableName + '[' + item.field.alias + ']' + '[address]'
                  values[this.tableName][item.field.alias]['address'] = this.$refs.portraitFormView.addressValue[address] || ''
                } else if (item.formtype === 'treeselect') {
                  values[this.tableName][item.field.alias] = values[this.tableName][item.field.alias].toString()
                }
                portraitValue[tableName] = values[this.tableName]
              }
            })
          }
          getTemplate(this.record.params.template)
          this.axios({
            url: 'crm/Customer/add',
            data: Object.assign(portraitValue, { action: 'submit', id: this.record.data ? this.record.data.id : 0, tplviewid: '414e1bd4120df8786b035a9d160d0f87' })
          }).then(res => {
            if (res.code === 0) {
              this.record.loading = true
              this.$forceUpdate()
              this.axios({
                url: '/admin/UserTable/init',
                params: {
                  sortField: 'id',
                  sortOrder: 'descend',
                  pageNo: 1,
                  pageSize: 30
                },
                data: {
                  associated: [],
                  customColumns: [],
                  searchString: {
                    khbh: portraitValue[this.$refs.portraitFormView.parentParams.tableName].khbh,
                    khdh1: portraitValue[this.$refs.portraitFormView.parentParams.tableName].khdh1
                  },
                  tplviewid: '069d7670919b354b9576cd619604a96f'
                }
              }).then(res => {
                this.record.data = res.result.data[0]
                const obj = {}
                obj[this.tableName + '[glkhbh]'] = this.record.data.khbh
                this.viewThis.form.setFieldsValue(obj)
                this.record.action = 'edit'
                this.$set(this.record, 'enable', false)
                this.$set(this.record, 'loading', false)
                this.$message.success('操作成功')
              })
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
    },
    // 获取关联数据
    getPortraitVal (val, alias, info, record, screenData) {
      const obj = {}
      val.forEach(item => {
        if (item.alias === 'khbh') {
          obj['khbh'] = item.value
        } else if (item.alias === 'khdh1') {
          obj['khdh1'] = item.value
        }
      })
      this.record.loading = true
      this.$forceUpdate()
      if (this.record.enable) {

      } else {
        this.axios({
          url: 'admin/UserTable/init',
          params: {
            sortField: 'id',
            sortOrder: 'descend',
            pageNo: 1,
            pageSize: 30
          },
          data: {
            associated: [],
            customColumns: [],
            searchString: {
              khbh: obj.khbh,
              khdh1: obj.khdh1
            },
            tplviewid: '069d7670919b354b9576cd619604a96f'
          }
        }).then(res => {
          this.record.loading = false
          this.record.data = res.result.data[0]
          this.$forceUpdate()
          const post = this.$route.query
          this.$router.push({
            path: '/CustomPage',
            query: {
              view: this.setting.popurl,
              Event: 'Popscreen',
              Poptime: post.Poptime,
              Callerid: post.Callerid,
              CallerIDName: post.CallerIDName,
              CID: post.CID,
              callFormPhone: post.callFormPhone,
              CalleeIDName: post.CalleeIDName,
              callTime: post.callTime,
              Server: post.Server,
              Calleeid: obj.khdh1,
              Recordfile: post.Recordfile,
              Method: post.Method,
              CalleeidAdress: post.CalleeidAdress,
              Uniqueid: post.Uniqueid
            }
          })
          this.parentParams.popscreenThis.createForm()
        })
      }
    },
    // 关联数据
    handleLink (item, mode, index) {
      if (mode !== 'dialog') {
        this.$set(item.field, 'iconFlag', !item.field.iconFlag)
      }
    },
    // 关联数据搜索选择
    handleSearch (val, item, index) {
      const info = item.field.setting
      if (!val) {
        clearTimeout(this.timeout)
        return
      }
      if (info.form.mode !== 'dialog') {
        const advanceSearch = {}
        advanceSearch.conditions = []
        advanceSearch.logic = 'or'
        advanceSearch.conditions.push(this.getCondition(info.form.linkField, val))
        if (info.form.searchField_1) {
          advanceSearch.conditions.push(this.getCondition(info.form.searchField_1, val))
        }
        if (info.form.searchField_2) {
          advanceSearch.conditions.push(this.getCondition(info.form.searchField_2, val))
        }
        if (info.form.searchField_3) {
          advanceSearch.conditions.push(this.getCondition(info.form.searchField_3, val))
        }
        const parameter = {
          pageNo: 1,
          pageSize: 20,
          sortField: 'id',
          sortOrder: 'descend'
        }
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.axios({
            url: '/admin/Api/linkSearch',
            params: parameter,
            data: Object.assign({ tableid: info.form.linkList[1], fieldid: item.field.fieldid }, { advanceSearch })
          }).then(res => {
            const selectList = []
            res.result.data.forEach((item, index) => {
              const obj = {}
              obj.label = (item[info.form.linkField] || '空') +
              (info.form.searchField_1 ? ' | ' + (item[info.form.searchField_1] || '空') : '') +
              (info.form.searchField_2 ? ' | ' + (item[info.form.searchField_2] || '空') : '') +
              (info.form.searchField_3 ? ' | ' + (item[info.form.searchField_3] || '空') : '')
              obj.value = item
              obj.id = (new Date()).valueOf() + index
              selectList.push(obj)
            })
            this.$set(item.field, 'selectList', selectList)
          })
        }, 500)
      }
    },
    // 选择数据
    handleChoice (item1, item, index) {
      this.axios({
        url: '/admin/UserTable/getTableRecord',
        params: { tableid: item.field.setting.form.linkList[1], id: item1.value.id }
      }).then(res => {
        const val = res.result.data
        const alias = item.field.alias
        const info = item.field.setting
        this.getVal(val, alias, info)
      })
      this.$set(item.field, 'iconFlag', false)
      this.$set(item.field, 'selectList', [])
    },
    // 下拉选择框失去焦点
    linkBlur (item, index) {
      this.$set(item.field, 'iconFlag', false)
      this.$set(item.field, 'selectList', [])
    },
    getCondition (alias, val) {
      const obj = {}
      obj.alias = alias
      obj.logic = 'or'
      obj.condition = [{ include: 'cn', value: val }]
      return obj
    },
    // 表单留痕获取更多加载内容
    getMoreTrace () {
      this.tracespin = true
      this.axios({
        url: 'admin/UserTable/getFieldTraceData',
        data: Object.assign(this.traceParameter, { tablename: this.tableName, id: this.parentParams.record.id })
      }).then(res => {
        if (res.result.data.length === 10) {
          this.loadMore = true
        } else {
          this.loadMore = false
        }
        res.result.data.forEach(item => {
          item.setting = JSON.parse(item.setting)
        })
        this.traceData = [...this.traceData, ...res.result.data]
        this.tracespin = false
        if (res.result.data.length === 10) {
          this.traceParameter.pageNo++
        }
      })
    },
    // 打开关联数据窗口
    handleWinlist (item) {
      const formData = this.viewThis.form.getFieldsValue()[this.tableName]
      const info = item.field.setting
      const filtersData = []
      for (const i in formData) {
        for (const j in info.form.associated) {
          if (i === info.form.associated[j].field) {
            filtersData[j] = {}
            filtersData[j].val = formData[i]
            filtersData[j].realfield = info.form.associated[j].field
            filtersData[j].op = info.form.associated[j].op
            filtersData[j].field = info.form.associated[j].sourceField
            if (!filtersData[j].val) {
              filtersData[j].val = ''
            }
          }
        }
      }
      filtersData.forEach(dataItem => {
        dataItem.val = this.viewThis.form.getFieldsValue()[this.tableName][dataItem.realfield]
      })
      if (filtersData.length && filtersData.every(dataItem => !dataItem.val && dataItem.op && dataItem.field)) {
        filtersData.forEach(dataItem => {
          const data = this.templateObj[dataItem.realfield]
          this.$message.error(data.field.name + '为空，请确认信息或重新选择')
        })
        return false
      }
      if (info.form.mode !== 'combobox') {
        this.winKey = this.winKey === 'winKey' ? 'winKey_1' : 'winKey'
        this.$nextTick(() => {
          this.$refs.userTableWinList.show({
            title: '选择数据',
            alias: item.field.alias,
            screenData: {
              beforeAlias: item.field.beforeAlias,
              aliasKey: item.aliasKey
            },
            info: info,
            tplviewid: info.form.dataView,
            type: 'associated',
            action: 'associated',
            filtersData: filtersData
          })
        })
      }
      this.linkBlur(item)
    },
    get (Array, str) {
      Array.forEach((arr, index) => {
        if (arr.XXX === str) {
          return index
        } else if (arr.list && arr.list.length > 0) {
          this.get(arr.list, str)
          return index
        }
      })
    },
    // 获取关联数据
    getVal (val, alias, info, record, screenData) {
      if (screenData && screenData.aliasKey) {
        const valObj = {}
        val.forEach(item => {
          valObj[item.alias] = item.value
          if (item.option && item.option.length !== 0) {
            valObj['__' + item.alias + '_option__'] = item.option
          }
        })
        const obj = {}
        const name = this.tableName + '[product_' + screenData.aliasKey + ']' + '[' + screenData.beforeAlias + ']'
        obj[name] = valObj[info.form.linkField]
        this.$emit('give', obj)
        let dataItem = {}
        let dataTem = {}
        const getObj = (array, str) => {
          array.forEach((item, index) => {
            if (item.columns) {
              getObj(item.columns, str)
            } else if (item.trs) {
              getObj(item.trs, str)
            } else if (item.tds) {
              getObj(item.tds, str)
            } else if (item.list) {
              getObj(item.list, str)
            } else {
              if (str && item.field && item.field.alias === str) {
                dataTem = item
              } else if (item.field && item.field.alias === alias) {
                dataItem = item
              }
            }
          })
        }
        getObj(this.viewThis.template)
        this.$nextTick(() => {
          this.onChange(dataItem, '', valObj[info.form.linkField])
        })
        if (info.form.conditions && info.form.conditions.length > 0) {
          info.form.conditions.forEach(item => {
            getObj(this.viewThis.template, item.field + '_' + screenData.aliasKey)
            const temItem = dataTem
            if (item.formtype !== 'subform' && temItem) {
              const obj = {}
              if (temItem.formtype === 'switch') {
                const word = temItem.field.setting.form.word.value.split('/')
                const index = word.indexOf(valObj[item.sourceField])
                const name = this.tableName + '[product_' + screenData.aliasKey + ']' + '[' + item.field + ']'
                if (index === 0) {
                  obj[name] = true
                } else if (index === 1) {
                  obj[name] = false
                }
                this.$emit('give', obj)
              } else if (temItem.formtype === 'datetime' && !valObj[item.sourceField]) {
                const name = this.tableName + '[product_' + screenData.aliasKey + ']' + '[' + item.field + ']'
                obj[name] = null
                this.$emit('give', obj)
              } else if (temItem.formtype === 'address') {
                const address = this.tableName + '[product_' + screenData.aliasKey + ']' + '[' + item.field + ']' + '[address]'
                const details = this.tableName + '[product_' + screenData.aliasKey + ']' + '[' + item.field + ']' + '[details]'
                obj[address] = valObj[item.sourceField].display
                if (valObj[item.sourceField].details) {
                  obj[details] = valObj[item.sourceField].details
                }
                this.$emit('give', obj, valObj[item.sourceField].address, address)
                this.$set(temItem.field, 'value', valObj[item.sourceField])
              } else if (temItem.formtype === 'cascader' && item.sourceField === temItem.field.beforeAlias) {
                this.$set(temItem.field, 'value', valObj[item.sourceField])
              } else {
                const name = this.tableName + '[product_' + screenData.aliasKey + ']' + '[' + item.field + ']'
                obj[name] = valObj[item.sourceField]
                this.$emit('give', obj)
              }
              if (valObj['__' + item.sourceField + '_option__']) {
                temItem.field.option = valObj['__' + item.sourceField + '_option__']
              }
              if (this.viewThis.wayRuleAlias.indexOf(temItem.value) === -1) {
                this.$emit('changeTem', temItem)
              }
            } else {
            // 获取源数据表子表数据
              const sourceData = valObj[item.sourceField] ? valObj[item.sourceField] : []
              // 获取子表数据
              const subformData = []
              if (item.mapping && item.mapping.length > 0) {
                sourceData.forEach(sourceItem => {
                  const obj = {}
                  item.mapping.forEach(mapItem => {
                    obj[mapItem.subformField] = sourceItem[mapItem.sourceField]
                  })
                  obj.__action__ = 'add'
                  subformData.push(obj)
                })
              }
              // 子表赋值
              const temItem = this.templateObj[item.field]
              if (temItem) {
                temItem.field.value = temItem.field.value ? temItem.field.value : []
                temItem.field.value = [...temItem.field.value, ...subformData]
                temItem.field.linkValue = subformData
                this.$emit('changeTem', temItem)
              }
            }
          })
        }
      } else {
        const valObj = {}
        val.forEach(item => {
          valObj[item.alias] = item.value
          if (item.option && item.option.length !== 0) {
            valObj['__' + item.alias + '_option__'] = item.option
          }
        })
        const obj = {}
        const name = this.tableName + '[' + alias + ']'
        obj[name] = valObj[info.form.linkField]
        this.$emit('give', obj)
        this.$nextTick(() => {
          this.onChange(this.templateObj[alias], '', valObj[info.form.linkField])
        })
        if (info.form.conditions && info.form.conditions.length > 0) {
          info.form.conditions.forEach(item => {
            if (item.formtype !== 'subform' && this.templateObj[item.field]) {
              const obj = {}
              const temItem = this.templateObj[item.field]
              if (temItem.formtype === 'switch') {
                const word = temItem.field.setting.form.word.value.split('/')
                const index = word.indexOf(valObj[item.sourceField])
                const name = this.tableName + '[' + item.field + ']'
                if (index === 0) {
                  obj[name] = true
                } else if (index === 1) {
                  obj[name] = false
                }
                this.$emit('give', obj)
              } else if (temItem.formtype === 'datetime') {
                if (valObj[item.sourceField] && !valObj[item.sourceField].includes('0000')) {
                  const name = this.tableName + '[' + item.field + ']'
                  obj[name] = this.moment(valObj[item.sourceField])
                } else {
                  const name = this.tableName + '[' + item.field + ']'
                  obj[name] = null
                }
                this.$emit('give', obj)
              } else if (temItem.formtype === 'address') {
                const address = this.tableName + '[' + item.field + ']' + '[address]'
                const details = this.tableName + '[' + item.field + ']' + '[details]'
                obj[address] = valObj[item.sourceField].display
                if (valObj[item.sourceField].details) {
                  obj[details] = valObj[item.sourceField].details
                }
                const getTemplate = (array) => {
                  array.forEach((getItem, index) => {
                    if (getItem.columns) {
                      getTemplate(getItem.columns)
                    } else if (getItem.trs) {
                      getTemplate(getItem.trs)
                    } else if (getItem.tds) {
                      getTemplate(getItem.tds)
                    } else if (getItem.list) {
                      getTemplate(getItem.list)
                    } else {
                      if (getItem.field && temItem.field.alias === getItem.field.alias) {
                        getItem.field.value = valObj[item.sourceField]
                      }
                    }
                  })
                }
                getTemplate(this.viewThis.template)
                this.$emit('give', obj, valObj[item.sourceField].address, address)
                this.$set(temItem.field, 'value', valObj[item.sourceField])
              } else if (temItem.formtype === 'cascader') {
                this.$set(temItem.field, 'value', valObj[item.sourceField])
              } else {
                const name = this.tableName + '[' + item.field + ']'
                obj[name] = valObj[item.sourceField]
                this.$emit('give', obj)
              }
              if (valObj['__' + item.sourceField + '_option__']) {
                temItem.field.option = valObj['__' + item.sourceField + '_option__']
              }
              if (this.viewThis.wayRuleAlias.indexOf(temItem.value) === -1) {
                this.$emit('changeTem', temItem)
              }
              this.onChange(this.templateObj[item.field], temItem.formtype, valObj[item.sourceField])
            } else {
            // 获取源数据表子表数据
              const sourceData = valObj[item.sourceField] ? valObj[item.sourceField] : []
              // 获取子表数据
              const subformData = []
              if (item.mapping && item.mapping.length > 0) {
                sourceData.forEach(sourceItem => {
                  const obj = {}
                  item.mapping.forEach(mapItem => {
                    obj[mapItem.subformField] = sourceItem[mapItem.sourceField]
                  })
                  obj.__action__ = 'add'
                  subformData.push(obj)
                })
              }
              // 子表赋值
              const temItem = this.templateObj[item.field]
              if (temItem) {
                temItem.field.value = temItem.field.value ? temItem.field.value : []
                temItem.field.value = [...temItem.field.value, ...subformData]
                temItem.field.linkValue = subformData
                this.$emit('changeTem', temItem)
              }
            }
          })
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../FormDesign/styles/k-table.less';
  .temStyle {
    max-height: calc(100vh - 90px);
    overflow-x: hidden;
    overflow: auto;
  }
  .userName {
     overflow: hidden; /* 溢出部分隐藏 */
    text-overflow: ellipsis; /* 文字溢出部分省略号显示 */
    display: -webkit-box; /* 弹性伸缩盒子模型显示 */
    -webkit-line-clamp: 3; /* 限制在一个块元素显示的文本的行数 */
    -webkit-box-orient: vertical;
  }
  /deep/.ant-upload-picture-card-wrapper.tupian{
    margin-bottom: -16px;
    margin-top: 3px;
  }
  /deep/.ant-input-affix-wrapper .ant-input-suffix{
    color: rgba(0,0,0,.25);
    display: none;
  }
  /deep/.ant-input:hover + .ant-input-suffix {
    display: flex;
  }
  /deep/.ant-input-suffix:hover {
    display: flex;
  }
</style>
