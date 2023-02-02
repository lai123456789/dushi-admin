<template>
  <a-layout style="padding: 0; height: calc(100vh - 140px); background: white;">
    <a-layout-sider style="background: white; min-width: 35%; overflow: auto;">
      <a-tabs size="small" :tabBarStyle="{marginBottom: 0}" tabPosition="left" style="background: white; min-width: 35%; overflow: auto;margin: 6px;">
        <a-tab-pane tab="本表" key="1">
          <s-table
            size="small"
            ref="fieldSelfTable"
            :columns="fieldColumns"
            rowKey="id"
            :data="fieldSelfData">
            <template slot="title">
              <a-form :form="form">
                <a-form-item>
                  <a-input-search placeholder="请输入显示名称搜索" @search="(e) => { fieldSelfParam.name = e; onChange('fieldSelfTable')}"/>
                </a-form-item>
              </a-form>
            </template>
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.alias, '字段: '+record.name, 'cm-field')}">选择</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="其他表" key="2">
          <s-table
            size="small"
            ref="tableTable"
            :hidden="tableHidden"
            :columns="tableColumns"
            rowKey="id"
            :data="tableData">
            <template slot="title">
              <a-form :form="form">
                <a-form-item>
                  <a-select v-model="tableParam.module" @change="() => {$refs.tableTable.refresh()}" style="width: 120px">
                    <a-select-option v-for="(val, key) in modules" :key="key" :value="val">{{ val }}</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-input-search @search="(e) => { tableParam.name = e; onChange('tableTable') }" placeholder="请输入数据表名搜索"/>
                </a-form-item>
              </a-form>
            </template>
            <span slot="tableName" slot-scope="text, record">
              <a href="javascript:;" @click="() => {tableHidden = !tableHidden, fieldParam.tableid = record.tableid, $refs.fieldTable.refresh()}">{{ text }}</a>
            </span>
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.module + '_' + record.alias, '数据表: '+record.name, 'cm-table')}">选择</a>
            </span>
          </s-table>
          <s-table
            size="small"
            ref="fieldTable"
            :hidden="!tableHidden"
            :columns="fieldColumns"
            rowKey="id"
            :data="fieldData">
            <template slot="title">
              <a-form :form="form">
                <a-form-item>
                  <a-button @click="() => {tableHidden = !tableHidden, fieldParam = {}, $refs.fieldTable.refresh()}">
                    <a-icon type="left"/>返回
                  </a-button>
                </a-form-item>
                <a-form-item>
                  <a-input-search @search="(e)=>{ fieldParam.name = e; $refs.fieldTable.refresh()}" placeholder="请输入显示名称搜索"/>
                </a-form-item>
              </a-form>
            </template>
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.alias, '字段: '+record.name, 'cm-field')}">选择</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="字典" key="3">
          <a-tabs>
            <a-tab-pane tab="平面字典" key="plane">
              <s-table
                ref="dictTable"
                size="small"
                rowKey="id"
                :columns="dictColumns"
                :data="dictData">
                <template slot="title">
                  <a-form>
                    <a-form-item>
                      <a-input-search @search="(e) => { dictParam.key = e; dictParam, onChange('dictTable') }" placeholder="请输入编号或名称" />
                    </a-form-item>
                    <a-form-item>
                      <a-breadcrumb style="line-height: 38px;">
                        <a-breadcrumb-item>
                          <a href="javascript:;" @click="() => {dictParam = {}, $refs.dictTable.refresh()}">所有字典</a>
                        </a-breadcrumb-item>
                        <a-breadcrumb-item v-for="(item, key) in dictPath" :key="key">
                          <a href="javascript:;" @click="() => {dictParam = {parent_number: item.number}, $refs.dictTable.refresh()}">{{ item.name }}</a>
                        </a-breadcrumb-item>
                      </a-breadcrumb>
                    </a-form-item>
                  </a-form>
                </template>
                <span slot="dictName" slot-scope="text, record">
                  <a href="javascript:;" @click="() => {dictParam = {parent_number: record.number}, onChange('dictTable')}">{{ text+(record.subcount>0?'('+record.subcount+')':'') }}</a>
                </span>
                <span slot="action" slot-scope="text, record">
                  <a href="javascript:;" @click="() => {addText(record.number, '字典: '+record.name, 'cm-dict')}">选择</a>
                </span>
              </s-table>
            </a-tab-pane>
            <a-tab-pane tab="树形字典" key="tree">
              <s-table
                ref="treeDictTable"
                size="small"
                rowKey="id"
                :columns="dictColumns"
                :data="treeDictData">
                <template slot="title">
                  <a-form>
                    <a-form-item>
                      <a-input-search @search="(e) => { treeDictParam.key = e; treeDictParam, onChange('treeDictTable') }" placeholder="请输入编号或名称" />
                    </a-form-item>
                    <a-form-item>
                      <a-breadcrumb style="line-height: 38px;">
                        <a-breadcrumb-item>
                          <a href="javascript:;" @click="() => {treeDictParam = {}, $refs.treeDictTable.refresh()}">所有字典</a>
                        </a-breadcrumb-item>
                        <a-breadcrumb-item v-for="(item, key) in treeDictPath" :key="key">
                          <a href="javascript:;" @click="() => {treeDictParam = {parent_number: item.number}, $refs.treeDictTable.refresh()}">{{ item.name }}</a>
                        </a-breadcrumb-item>
                      </a-breadcrumb>
                    </a-form-item>
                  </a-form>
                </template>
                <span slot="dictName" slot-scope="text, record">
                  <a href="javascript:;" @click="() => {treeDictParam = {parent_number: record.number}, onChange('treeDictTable')}">{{ text+(record.subcount>0?'('+record.subcount+')':'') }}</a>
                </span>
                <span slot="action" slot-scope="text, record">
                  <a href="javascript:;" @click="() => {addText(record.number, '字典: '+record.name, 'cm-dict')}">选择</a>
                </span>
              </s-table>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
        <a-tab-pane tab="用户" key="4">
          <s-table
            ref="userTable"
            size="small"
            rowKey="id"
            :columns="userColumns"
            :data="userData"
            :sorter="{ field: 'id', order: 'descend' }"
          >
            <template slot="title">
              <a-form :form="form">
                <a-row type="flex" :gutter="8">
                  <a-col flex="auto">
                    <a-form-item>
                      <a-select v-model="userParamType" @change="userParam = {}">
                        <a-select-option value="username">用户名</a-select-option>
                        <a-select-option value="department">部门</a-select-option>
                        <a-select-option value="role">角色</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col flex="190px">
                    <a-form-item v-if="userParamType === 'username'">
                      <a-input-search @search="(e) => { userParam.username = e; $refs.userTable.refresh(true) }" placeholder="请输入用户名称搜索" />
                    </a-form-item>
                    <a-form-item v-else-if="userParamType === 'department'">
                      <a-input-search @search="(e) => { userParam.departmentName = e; $refs.userTable.refresh(true) }" placeholder="请输入部门名称搜索" />
                    </a-form-item>
                    <a-form-item v-else>
                      <a-input-search @search="(e) => { userParam.roleName = e; $refs.userTable.refresh(true) }" placeholder="请输入角色名称搜索" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </template>
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.username, '用户: ' + record.username)}">选择</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="部门" key="5">
          <s-table
            ref="departmentTable"
            size="small"
            rowKey="departmentid"
            :columns="departmentColumns"
            :showPagination="false"
            :data="departmentData"
            @expand="getDepartment"
          >
            <template slot="title">
              <a-form :form="form">
                <a-form-item>
                  <department-search @ok="(e, dep)=> {addText(dep.departmentid, '部门: ' + dep.name)}"/>
                </a-form-item>
              </a-form>
            </template>
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.departmentid, '部门: ' + record.name)}">选择</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="角色" key="6">
          <s-table
            size="small"
            ref="roleTable"
            :columns="roleColumns"
            rowKey="id"
            :data="roleData">
            <template slot="title">
              <a-form :form="form">
                <a-form-item>
                  <a-input-search @search="(e) => { roleParam.rolename = e; roleParam, onChange('roleTable') }" placeholder="请输入角色名称搜索" />
                </a-form-item>
              </a-form>
            </template>
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.roleid, '角色: ' + record.rolename)}">选择</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="流程变迁" key="7" v-if="transitionData.length > 0">
          <a-table
            rowKey="transition_id"
            :columns="transitionColumns"
            :dataSource="transitionData"
            size="small"
            :pagination="false">
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="() => {addText(record.transition_id, '变迁: ' + record.transition_name, 'cm-transition')}">选择</a>
            </span>
          </a-table>
        </a-tab-pane>
        <a-tab-pane tab="函数列表" key="8">
          <s-table
            ref="funcTable"
            size="small"
            rowKey="id"
            :columns="funcColumns"
            :data="funcData"
            :showPagination="false"
          >
            <template slot="funcName" slot-scope="text, record">
              <a-popover v-if="record.remarks" :title="`@${text}`" placement="leftBottom">
                <div slot="content" style="width: 500px; white-space: pre-wrap;">{{ record.remarks }}</div>
                <a-icon type="code" />
                <span>&nbsp;{{ text }}</span>
              </a-popover>
              <span v-else >
                <a-icon type="calculator" />
                <span style="font-weight: bold">&nbsp;{{ text }}</span>
              </span>
            </template>
            <span slot="action" slot-scope="text, record">
              <a v-if="record.remarks" href="javascript:;" @click="() => {addFun('@'+record.name+'()')}">选择</a>
              <span v-else>--</span>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="辅助输入" key="9">
          <template>
            <a-form :form="form">
              <a-form-item>
                <a-select placeholder="显示名称" @change="helpSelField">
                  <a-select-option v-for="(val, key) in fieldHelpData" :key="key" :value="key">{{ val.name }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-select placeholder="计算公式" v-model="helpData.oper">
                  <a-select-option v-for="(val, key) in fieldHelpFunc" :key="key" :value="val.value">{{ val.text }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-input v-model="helpData.valueStr"/>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="helpInput">
                  生成公式
                </a-button>
              </a-form-item>
            </a-form>
          </template>
        </a-tab-pane>
        <a-tab-pane tab="办理方式" key="10" v-if="handleData.data.length > 0">
          <template>
            <a-form :form="form">
              <a-form-item>
                <a-select placeholder="办理方式" v-model="handleData.handleWay">
                  <a-select-option v-for="(val, key) in handleData.data" :key="key" :value="val.alias">{{ val.way }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="addHandle">
                  生成公式
                </a-button>
              </a-form-item>
            </a-form>
          </template>
        </a-tab-pane>
      </a-tabs>
    </a-layout-sider>
    <a-layout>
      <a-layout-content height="900" style="padding: 5px;">
        <code-mirror
          class="mycode"
          ref="mycode"
          :style="codeStyle"
          :value="codeValue"
          @ready="setValue"
          @inputRead="paste"
          :options="cmOptions">
        </code-mirror>
        <a-textarea rows="6" @change="copycode" placeholder="复制粘贴区域"></a-textarea>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import { codemirror as CodeMirror } from 'vue-codemirror'
import 'codemirror/theme/ambiance.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
require('./mymodel/mymodel')
require('codemirror/mode/javascript/javascript')
require('codemirror/lib/codemirror')
require('codemirror/addon/hint/show-hint')
require('codemirror/mode/xml/xml')
require('codemirror/mode/sql/sql')
require('codemirror/mode/htmlmixed/htmlmixed')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/mode/python/python')
require('codemirror/addon/fold/foldcode')
require('codemirror/addon/fold/foldgutter')
require('codemirror/addon/fold/brace-fold')
require('codemirror/addon/fold/xml-fold')
require('codemirror/addon/fold/indent-fold')
require('codemirror/addon/fold/markdown-fold')
require('codemirror/addon/fold/comment-fold')
require('codemirror/mode/groovy/groovy')
export default {
  components: {
    CodeMirror,
    DepartmentSearch: () => import('@/views/admin/Department/DepartmentSearch')
  },
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: true
    }
  },
  data () {
    return {
      codeStyle: {
        height: '100%',
        fontSize: '13px',
        fontWeight: '600',
        color: 'rgb(95, 97, 97)',
        lineHeight: '20px',
        background: '#FFFFFF',
        border: '1px dashed #a9a7a7'
      },
      // 高亮代码
      codeValue: '',
      cmOptions: {
        value: '',
        styleActiveLine: true,
        lineNumbers: false,
        lineWrapping: 'wrap',
        foldGutter: true,
        mode: 'text/x-mymodel',
        // theme: 'monokai',
        ukeys: '@if @ifs @isempty @and @or @sum @average @max @min @round @int @mod @product @num @rmbupper @roundup @rounddown @abs @concat @mid @left @right @len @upper @lower @replace @startwith @contains @trim @urlencode @urldecode @year @month @day @hour @minute @second @today @now @years @days @hours @minutes @addday @addmonth @addyear @quarter @weekday @weeknum @curUserInfo @getUserInfo @delete @insert @update @updateme @upsert @rdid @getData @getTableData @username @deptname @curuser @rolename @getuser @getusers @sendSms @deptUser @roleUser @innerUser @joinUser @creator @transitionUser @caseInfo @execIf @getConfig @callMethod @getRequest @compute',
        hintOptions: {
          // 当匹配只有一项的时候是否自动补全
          completeSingle: true
        },
        // keyMap: 'sublime',
        matchBrackets: true, // 括号匹配
        readOnly: false
      },
      form: this.$form.createForm(this),
      // 模块数据
      modules: [],
      collapsed: false,
      // 字段条件
      fieldSelfParam: { tableid: this.params.tableid },
      // 字段条件
      fieldParam: {},
      // 字段表头
      fieldColumns: [{
        title: '字段名',
        dataIndex: 'name'
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      // 数据表隐藏显示
      tableHidden: false,
      // 数据表条件
      tableParam: { module: '', name: '' },
      // 数据表字段
      tableColumns: [{
        title: '数据表名',
        dataIndex: 'name',
        scopedSlots: { customRender: 'tableName' }
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      // 数据字典搜索条件
      dictParam: {},
      treeDictParam: {},
      // 当前平面字典路径
      dictPath: [],
      // 当前树形字典路径
      treeDictPath: [],
      // 数据字典表头
      dictColumns: [{
        title: '字典名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'dictName' }
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      departmentParam: {},
      departmentSearch: [],
      // 组织表头
      departmentColumns: [{
        title: '名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'departmentName' }
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      userParam: {},
      userParamType: 'username',
      userColumns: [{
        title: '用户名',
        dataIndex: 'username',
        scopedSlots: { customRender: 'userName' }
      }, {
        title: '所属部门',
        dataIndex: 'departmentname'
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      // 角色搜索条件
      roleParam: {},
      // 角色表头
      roleColumns: [{
        title: '角色名称',
        dataIndex: 'rolename'
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      // 流程变迁表头
      transitionColumns: [{
        title: '变迁名称',
        dataIndex: 'transition_name'
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      // 函数表头
      funcColumns: [{
        title: '函数名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'funcName' }
      }, {
        title: '操作',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      // 辅助输入数据
      helpData: {
        name: '',
        value: '',
        oper: '',
        valueStr: ''
      },
      // 办理方式数据
      handleData: {
        data: this.getHandleData(),
        handleWay: ''
      },
      // 流程变迁数据
      transitionData: this.getTransitionData(),
      // 辅助输入字段
      fieldHelpData: [],
      // 辅助输入公式
      fieldHelpFunc: [
        { value: 'like', text: '包含' },
        { value: '=', text: '等于' },
        { value: 'not like', text: '不包含' },
        { value: '!=', text: '不等于' },
        { value: '>', text: '大于' },
        { value: '<', text: '小于' },
        { value: '>=', text: '大于等于' },
        { value: '<=', text: '小于等于' }
      ],
      newOption: {
        placeholder: '请填写简介',
        history: {
          delay: 100,
          maxStack: 100,
          userOnly: false
        },
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video']
          ]
        }
      },
      timeout: null
    }
  },
  watch: {
    params (val) {
      this.setValue()
      this.handleData.data = this.getHandleData()
      this.handleData.handleWay = ''
      this.transitionData = this.getTransitionData()
    }
  },
  methods: {
    onChange (type) {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.$refs[type].refresh()
      }, 500)
    },
    // 获取办理方式
    getHandleData () {
      var handleArr = []
      if (this.params.flowData && this.params.currentSelect && this.params.currentSelect.type === 'link') {
        const linkList = this.params.flowData.linkList
        const nodeList = this.params.flowData.nodeList
        var currentSelect = this.params.currentSelect
        if (currentSelect.sourceId.indexOf('transition') > -1) {
          for (var k in nodeList) {
            if (nodeList[k].id === currentSelect.sourceId && nodeList[k].wayData) {
              handleArr = nodeList[k].wayData
              break
            }
          }
        } else if (currentSelect.sourceId.indexOf('gateway') > -1) {
          for (var lk in linkList) {
            if (linkList[lk].targetId === currentSelect.sourceId && linkList[lk].sourceId.indexOf('transition') > -1) {
              currentSelect = linkList[lk]
              break
            }
          }
          for (var nk in nodeList) {
            if (nodeList[nk].id === currentSelect.sourceId && nodeList[nk].wayData) {
              handleArr = nodeList[nk].wayData
              break
            }
          }
        }
      }
      return handleArr
    },
    // 获取流程变迁
    getTransitionData () {
      var transitionArr = []
      if (this.params.flowData && this.params.currentSelect && this.params.currentSelect.type.indexOf('transition') > -1) {
        const nodeList = this.params.flowData.nodeList
        for (var k in nodeList) {
          if (!nodeList[k].quoteId && nodeList[k].id.indexOf('transition') > -1) {
            transitionArr.push({ transition_id: nodeList[k].id.split('-')[1], transition_name: nodeList[k].nodeName })
          }
        }
      }
      return transitionArr
    },
    // 复制粘贴
    copycode (e) {
      const text = e.target.value
      e.target.value = ''
      const strList = text.split('#>')
      for (var i in strList) {
        if (!strList[i]) continue
        const arr = strList[i].split('<#')
        if (arr[0]) {
          this.addFun(arr[0])
        }
        if (arr[1]) {
          var json = arr[1].split('|')
          this.addText(json[1], json[0], json[2])
        }
      }
    },
    // 添加文本
    addText (value, name, cls) {
      const editor = this.$refs.mycode.codemirror
      name = name || value
      var msg = document.createElement('a-tag')
      msg.className = cls || 'cm-else'
      msg.innerHTML = name
      msg.readOnly = true
      const cur = editor.getDoc().getCursor()
      var str = '<#' + name + '|' + value + '|' + msg.className + '#>'
      var length = str.length
      editor.replaceSelection(str)
      const options = {
        replacedWith: msg,
        atomic: true,
        selectLeft: true,
        selectRight: true,
        handleMouseEvents: true
      }
      editor.getDoc().markText({
        line: cur.line,
        ch: cur.ch
      }, {
        line: cur.line,
        ch: cur.ch + length
      }, options)
      editor.setCursor({
        line: cur.line,
        ch: cur.ch + length
      })
      editor.focus()
    },
    // 添加函数
    addFun (func) {
      const editor = this.$refs.mycode.codemirror
      editor.replaceSelection(func)
      editor.focus()
    },
    getDepartment (expanded, record) {
      if (record.children.length === 0) {
        this.axios({
          url: '/admin/Department/getDepartmentUser',
          params: { departmentid: record.departmentid }
        }).then(res => {
          res.result.data.forEach(item => {
            if (item.childCount) {
              item.children = []
            }
            item.name = item.label
            item.departmentid = item.value
          })
          const array = res.result.data.filter(item => item.type !== 'user')
          this.$set(record, 'children', array)
        })
      }
    },
    // 添加办理方式
    addHandle () {
      let handleWay = ''
      this.handleData.data.forEach(item => {
        if (item.alias === this.handleData.handleWay) {
          handleWay = item.way
        }
      })
      const editor = this.$refs.mycode.codemirror
      this.addText('@getRequest(post.handleWay)', '办理方式', 'cm-handle')
      editor.replaceSelection('==')
      this.addText(this.handleData.handleWay, handleWay, 'cm-handle')
      var length = handleWay.length
      if (handleWay.indexOf('()') > -1) {
        length -= 1
      }
      const cur = editor.getDoc().getCursor()
      editor.setCursor({
        line: cur.line,
        ch: cur.ch + length
      })
      editor.focus()
    },
    // 辅助输入
    helpInput () {
      const name = this.helpData.name
      const value = this.helpData.value
      const oper = this.helpData.oper
      const valueStr = this.helpData.valueStr
      var fzStr = ''
      const editor = this.$refs.mycode.codemirror
      if (oper.indexOf('like') > -1) {
        fzStr = " '%" + valueStr + "%' "
      } else {
        fzStr = " '" + valueStr + "' "
      }
      var str = ''
      if (value && name) {
        this.addText(value, name, 'cm-field')
      }
      if (oper) {
        str += ' ' + oper
      }
      if (valueStr) {
        str += fzStr
      }
      var length = str.length
      const cur = editor.getDoc().getCursor()
      editor.replaceSelection(str)
      editor.setCursor({
        line: cur.line,
        ch: cur.ch + length
      })
      editor.focus()
    },
    // 粘贴
    paste (c, e) {
      const editor = this.$refs.mycode.codemirror
      if (e.origin === 'paste') {
        const text = e.text
        const cur = editor.getDoc().getCursor()
        for (var i in text) {
          var txt = text[i]
          var oldCh = 0
          if (!txt) continue
          const depLength = txt.length
          const strList = txt.split('#>')
          strList.forEach(item => {
            if (item.length > 0) {
              item += '#>'
              var start = item.lastIndexOf('<#')
              var end = item.indexOf('#>')
              if (start > -1 && end > -1) {
                var jsonstr = item.substring(start + 2, end)
                var json = jsonstr.split('|')
                if (json[0] && json[1] && json[2]) {
                  var msg = document.createElement('a-tag')
                  msg.className = json[2]
                  msg.readOnly = true
                  const repStr = '<#' + jsonstr + '#>'
                  msg.innerHTML = json[0]
                  const step = repStr.length
                  const newCh = cur.ch - depLength + txt.indexOf(repStr) + oldCh
                  oldCh += txt.indexOf(repStr) + step
                  txt = txt.substring(txt.indexOf(repStr) + step)
                  const options = {
                    replacedWith: msg,
                    atomic: true,
                    selectLeft: true,
                    selectRight: true,
                    handleMouseEvents: true
                  }
                  editor.getDoc().markText({
                    line: cur.line,
                    ch: newCh
                  }, {
                    line: cur.line,
                    ch: newCh + step
                  }, options)
                }
              }
            }
          })
        }
      } else {
        // editor.showHint()
      }
    },
    // 解析
    getValue () {
      var editor = this.$refs.mycode.codemirror
      var html = editor.getValue()
      var value = html
      const strList = html.split('#>')
      strList.forEach(item => {
        if (item) {
          item += '#>'
        }
        var start = item.lastIndexOf('<#')
        var end = item.indexOf('#>')
        if (start > -1 && end > -1) {
          const json = item.substring(start + 2, end)
          const arr = json.split('|')
          if (arr[0] && arr[1]) {
            value = value.replace('<#' + json + '#>', arr[1])
          }
        }
      })
      return { 'html': html, 'value': value }
    },
    getDepartmentData (e) {
      const page = {
        pageNo: 1,
        pageSize: 999,
        sortField: 'id',
        sortOrder: 'descend'
      }
      if (e) {
        this.axios({
          url: 'admin/Api/departmentSearch',
          params: Object.assign(page, { name: e })
        }).then(res => {
          this.departmentSearch = res.result.data
        })
      } else {
        this.departmentSearch = []
      }
    },
    // 默认赋值
    setValue () {
      this.$refs.mycode.codemirror.setValue('')
      const text = this.params.data.html
      if (text) {
        const strList = text.split('#>')
        for (var i in strList) {
          if (!strList[i]) continue
          const arr = strList[i].split('<#')
          if (arr[0]) {
            this.addFun(arr[0])
          }
          if (arr[1]) {
            var json = arr[1].split('|')
            this.addText(json[1], json[0], json[2])
          }
        }
      }
    },
    // 加载本表字段数据
    fieldSelfData (parameter) {
      return this.axios({
        url: '/admin/Codemirror/fieldData',
        params: Object.assign(parameter, this.fieldSelfParam)
      }).then(res => {
        this.fieldHelpData = res.result.helpData
        this.tableParam.module = res.result.module
        return res.result
      })
    },
    // 字段数据
    fieldData (parameter) {
      return this.axios({
        url: '/admin/Codemirror/fieldData',
        params: Object.assign(parameter, this.fieldParam)
      }).then(res => {
        return res.result
      })
    },
    // 加载其他表数据
    tableData (parameter) {
      return this.axios({
        url: '/admin/Codemirror/tableData',
        params: Object.assign(parameter, this.tableParam)
      }).then(res => {
        this.modules = res.result.modules
        return res.result
      })
    },
    // 数据字典
    dictData (parameter) {
      return this.axios({
        url: '/admin/dict/init',
        params: Object.assign(parameter, this.dictParam)
      }).then(res => {
        this.dictPath = res.result.path
        return res.result
      })
    },
    treeDictData (parameter) {
      return this.axios({
        url: '/admin/dict/init?category=1',
        params: Object.assign(parameter, this.treeDictParam)
      }).then(res => {
        this.treeDictPath = res.result.path
        return res.result
      })
    },
    // 组织
    departmentData (parameter) {
      return this.axios({
        url: '/admin/department/init',
        params: Object.assign(parameter)
      }).then(res => {
        res.result.data.forEach(item => {
          item.children = []
        })
        return res.result
      })
    },
    userData (parameter) {
      return this.axios({
        url: '/admin/api/userSearch',
        params: Object.assign(parameter, this.userParam)
      }).then(res => {
        return res.result
      })
    },
    // 加载角色
    roleData (parameter) {
      return this.axios({
        url: '/admin/role/init',
        params: Object.assign(parameter, this.roleParam)
      }).then(res => {
        return res.result
      })
    },
    // 函数列表
    funcData (parameter) {
      return this.axios({
        url: '/admin/Codemirror/funcData',
        params: Object.assign(parameter)
      }).then(res => {
        this.cmOptions.ukeys = res.result.funcs
        return res.result
      })
    },
    helpSelField (val) {
      const data = this.fieldHelpData[val]
      this.helpData.name = data.name
      this.helpData.value = data.alias
    }
  }
}
</script>
<style lang="less" scoped>
  .mycode /deep/ .CodeMirror {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 13px;
    font-weight: normal;
  }
  .mycode /deep/ .cm-field,
  .mycode /deep/ .cm-table,
  .mycode /deep/ .cm-dict,
  .mycode /deep/ .cm-handle,
  .mycode /deep/ .cm-transition,
  .mycode /deep/ .cm-else {
    display: inline-block;
    line-height: 18px;
    color: #fff;
    border-radius: 3px;
    padding: 0 6px;
    margin: 4px;
    letter-spacing: 1px;
  }

  /*字段：#5FB257*/
  .mycode /deep/ .cm-field {
    background: #5FB257;
  }

  /*表：#D4584A*/
  .mycode /deep/ .cm-table {
    background: #D4584A;
  }

  /*字典：#9C6A46*/
  .mycode /deep/ .cm-dict {
    background: #377FF7;
  }

  /*办理方式：#58B8B3*/
  .mycode /deep/ .cm-handle {
    background: #58B8B3;
  }

  /*流程变迁：#58B8B3*/
  .mycode /deep/ .cm-transition {
    background: rgb(136, 166, 212);
  }

  /*组织+角色+其他：#8F30AA*/
  .mycode /deep/ .cm-else {
    background: #8F30AA;
  }

  .mycode /deep/ .cm-function {
    color: #aa04bf;
  }
</style>
