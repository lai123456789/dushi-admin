<template>
  <div style="background: white;">
    <a-tabs
      v-model="activeKey"
      hide-add
      type="editable-card"
      @edit="onEdit"
      @change="chagneTab"
      size="small"
      class="container"
    >
      <!-- 导航面板 -->
      <a-tab-pane :key="0" :closable="false">
        <template v-slot:tab >
          <a-icon type="home" />导航
          <a-icon type="reload" v-show="activeKey === 0" @click="onRefresh(0)" class="reload"/>
        </template>
        <a-layout :key="show0">
          <a-layout-sider
            :trigger="null"
            width="300"
            collapsible
            collapsedWidth="0"
            theme="light"
            v-model="collapsed"
            style="height: calc(100vh - 145px);"
          >
            <a-row :gutter="[5,5]" style="margin-bottom: 5px;">
              <a-col :span="16">
                <a-select style="width: 100%" v-model="queryParam.module" @change="(e)=>{queryParam.searchString = ''; choiceModule(e)}">
                  <a-select-option v-for="(value, index) in modules" :value="value.module" :key="index">{{ value.module+'('+value.count+')' }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="4" >
                <a-dropdown>
                  <a-menu slot="overlay">
                    <a-menu-item key="1" @click="handleAdd">添加数据表</a-menu-item>
                    <a-menu-item key="2" @click="handleExportOverview">导出数据表概览</a-menu-item>
                    <a-menu-item key="5" @click="handleExportTableField">导出数据表字段</a-menu-item>
                    <a-menu-item key="3" @click="handleSync">数据表同步</a-menu-item>
                    <a-menu-item key="6" @click="handleUpdateCache">更新缓存</a-menu-item>
                  </a-menu>
                  <a-button><a-icon type="menu" /></a-button>
                </a-dropdown>
              </a-col>
              <a-col :span="4" >
                <a-tooltip>
                  <template slot="title">高级搜索</template>
                  <a-button @click="openSenior"><a-icon type="filter" /></a-button>
                </a-tooltip>
              </a-col>
              <a-col :span="24">
                <a-input-search
                  v-model="queryParam.searchString"
                  @search="$refs.table.refresh(true)"
                  placeholder="输入关键字搜索" />
              </a-col>
            </a-row>
            <div style="flex-grow: 1; overflow: auto;">
              <s-table
                ref="table"
                size="small"
                rowKey="sortid"
                :columns="columns"
                :data="loadDataTable"
                :expandedRowKeys="showAll"
                @expand="onExpand"
                childrenColumnName="tablechild"
                :sorter="{ field: 'id', order: 'descend' }"
              >
                <div slot="name" slot-scope="text, record" :style="record.style === 'span' ? { 'margin-top': '-20px', 'padding-left': '20px' } : ( record.style === 'datadetails' || record.style === 'viewdetails' ? {'margin-top' : '-20px', 'padding-left' : '50px'} : { 'margin-top' : '-20px', 'padding-left' : '40px'} )">
                  <span @click="openTags(record)" v-if="record.style === 'span'" style="cursor: pointer">{{ record.name }}</span>
                  <span @click="openTags(record)" style="cursor: pointer" v-else>
                    <a-icon type="database" theme="twoTone" v-if="record.style === 'field'" />
                    <a-icon type="desktop" style="color: #faad14" v-if="record.style === 'datadetails'" />
                    <a-icon type="layout" theme="twoTone" two-tone-color="#52c41a" v-if="record.style === 'viewdetails'" />
                    {{ record.name }}
                  </span>
                </div>
                <a-dropdown slot="action" slot-scope="text, record" v-if="record.style === 'span'">
                  <a><a-icon type="more"/></a>
                  <a-menu slot="overlay">
                    <a-menu-item @click="handleEdit(record)"><a><a-icon type="edit"/> 编辑</a></a-menu-item>
                    <a-menu-item @click="handleExport(record)"><a><a-icon type="export"/> 导出</a></a-menu-item>
                    <a-menu-item @click="handleDelete(record)"><a><a-icon type="delete"/> 删除</a></a-menu-item>
                  </a-menu>
                </a-dropdown>
              </s-table>
            </div>
          </a-layout-sider>
          <a-layout style="background: white; padding-left: 10px; height: calc(100vh - 145px)">
            <a-layout-content>
              <a-breadcrumb>
                <a-breadcrumb-item>{{ config.tb_name || configview.tb_name || '导航' }}</a-breadcrumb-item>
                <a-breadcrumb-item>{{ config.title || configview.title || senior }}</a-breadcrumb-item>
              </a-breadcrumb>
              <div style="flex-grow: 1; overflow: auto;">
                <tplview-data
                  @ok="getList"
                  @add="getAdd"
                  @refresh="handleOk"
                  ref="viewData"
                  :item="config.data"
                  v-show="config.styleshow === 'data'" />
                <tplview-form
                  v-show="configview.styleshow === 'view'"
                  @ok="getForm"
                  @add="getViewAdd"
                  @refresh="handleOk"
                  ref="viewForm"
                  :item="configview.data" />
                <data-model-senior ref="seniorTable" :search="queryParam" @getField="getField" v-if="senior" @showTable="showTable"/>
              </div>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-tab-pane>
      <!-- 其他面板 -->
      <a-tab-pane v-for="(pane, index1) in panes" :key="pane.key" :closable="pane.closable">
        <template v-slot:tab >
          <a-icon type="database" theme="twoTone" v-if="pane.content ==='field'" />
          <a-icon type="desktop" style="color: #faad14" v-if="pane.content === 'datadetails'" />
          <a-icon type="layout" theme="twoTone" two-tone-color="#52c41a" v-if="pane.content === 'viewdetails'" />{{ pane.title }}<a-icon type="reload" v-show="activeKey === pane.key" @click="onRefresh(pane.key, index1)" class="reload"/>
        </template>
        <div style="display: flex; flex-direction: column; height: calc(100vh - 145px);" :key="panesKey[index1]">
          <div style="display: flex; margin-bottom: 8px;">
            <a-button v-if="pane.content !== 'field'" type="primary" size="small" @click="handleSubmit('save')">保存</a-button>
            <a-breadcrumb v-if="pane.content !== 'datadetails' && pane.content !== 'viewdetails'" style="margin-left: 8px;">
              <a-breadcrumb-item>{{ pane.alias ? pane.title + '(' + queryParam.module + '_' + pane.alias + ')' : pane.title }}</a-breadcrumb-item>
              <a-breadcrumb-item>{{ pane.name }}</a-breadcrumb-item>
            </a-breadcrumb>
            <a-breadcrumb v-else style="margin-left: 8px;">
              <a-breadcrumb-item>{{ pane.alias ? pane.namefirst + '(' + queryParam.module + '_' + pane.alias + ')' : pane.namefirst }}</a-breadcrumb-item>
              <a-breadcrumb-item>{{ pane.nametwo }}</a-breadcrumb-item>
              <a-breadcrumb-item>{{ pane.title }}</a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          <div :style="pane.content !== 'viewdetails' ? {'flex-grow': 1, overflow: 'auto'} : { 'flex-grow': 1, overflow: 'hidden', 'border-top': '1px solid #D4D4D4'}">
            <!-- 字段管理 -->
            <field :tableid="activeKey !== 0 ? activeKey : ''" v-if="pane.content ==='field'" />
            <!-- 数据窗口 -->
            <tplview-data-form-edit
              ref="tplviewDataFormEdit"
              :tableid="tableid"
              :active="activeKey !== 0 ? String(activeKey) : ''"
              :configdata="pane.data"
              @ok="handleOk"
              @refresh="tabChange"
              v-if="pane.content === 'datadetails'" />
            <!-- 表单视图 -->
            <tplview-form-form
              ref="tplviewFormForm"
              :configdata="pane.data"
              @ok="handleOk"
              @refresh="tabViewChange"
              v-if="pane.content === 'viewdetails'"
            />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <!-- 编辑数据表 -->
    <table-form ref="tableForm" @ok="handleOk" />
    <general-export ref="generalExport" />
    <update-loading ref="UpdateLoading"/>
  </div>
</template>
<script>
export default {
  components: {
    TableForm: () => import('./TableForm'),
    Field: () => import('./Field/Field'),
    TplviewData: () => import('./TplviewData'),
    TplviewForm: () => import('./TplviewForm'),
    TplviewFormForm: () => import('./TplviewFormForm'),
    TplviewDataFormEdit: () => import('./TplviewDataFormEdit'),
    DataModelSenior: () => import('./DataModelSenior'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport'),
    UpdateLoading: () => import('@/views/admin/Table/UpdateLoading')
  },
  data () {
    return {
      panes: [],
      panesKey: [],
      activeKey: 0,
      show0: false,
      collapsed: false,
      showdata: {},
      config: {},
      configfield: {},
      tableShowData: {},
      configdata: {},
      configview: {},
      showAll: [],
      datadetails: {},
      viewdetails: {},
      tableid: [],
      tableData: [],
      modules: [],
      dataFormType: '',
      dataaddType: '',
      viewFormType: '',
      viewaddType: '',
      senior: '高级搜索',
      typeList: [ ], // 自动搜索
      columns: [{
        title: '数据表名称',
        dataIndex: 'name',
        width: 255,
        scopedSlots: {
          customRender: 'name'
        }
      }, {
        dataIndex: 'action',
        scopedSlots: {
          customRender: 'action'
        }
      }],
      queryParam: { module: 'admin', searchString: '' }
    }
  },
  watch: {
    panes (val) {
      if (this.panes.length === 0) {
        this.activeKey = 0
      }
      this.panesKey = val.map(item => {
        return !!item.key + '1'
      })
    },
    tableData (val) {
      if (this.tableShowData) {
        const record = val.find(item => item.tableid === this.tableShowData.tableid)
        if (record && this.showAll.indexOf(record.id) === -1) {
          this.showAll.push(record.id)
          for (const i in record.tablechild) {
            this.showAll.push(record.tablechild[i].id)
          }
        }
      }
    }
  },
  created () {
    localStorage.moduleName = localStorage.moduleName ? localStorage.moduleName : 'crm'
    this.queryParam.module = localStorage.moduleName
  },
  methods: {
    // 刷新面板
    onRefresh (key, index) {
      if (key === 0) {
        this.show0 = !this.show0
      } else {
        this.panesKey.splice(index, 1, !this.panesKey[index])
      }
    },
    onEdit (targetKey, action) {
      this[action](targetKey)
    },
    chagneTab () {
      this.panes.forEach(item => {
        if (item.key === this.activeKey) {
          if (item.content === 'viewdetails') {
            this.viewdetails = item.data
          } else if (item.content === 'datadetails') {
            this.datadetails = item.data
          } else if (item.content === 'field') {
            this.configfield = item.data
          }
        }
      })
    },
    remove (targetKey) {
      let activeKey = this.activeKey
      let lastIndex
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1
        }
      })
      const panes = this.panes.filter(pane => pane.key !== targetKey)
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key
        } else {
          activeKey = panes[0].key
        }
      }
      this.panes = panes
      this.activeKey = activeKey
    },
    loadDataTable (parameter) {
      this.showdata = JSON.parse(JSON.stringify(parameter))
      return this.axios({
        url: '/admin/table/index',
        params: Object.assign(parameter, this.queryParam, { init: !this.modules.length })
      }).then(res => {
        if (this.modules.length === 0) {
          this.modules = res.result.option.modules
        }
        for (const i in res.result.data) {
          res.result.data[i]['style'] = 'span'
          res.result.data[i]['sortid'] = res.result.data[i].id
          res.result.data[i]['tablechild'] = [{
            name: '字段管理', id: 100000000 + i + 1, sortid: 100000000 + i + 1, style: 'field', tableid: res.result.data[i].tableid, tb_name: res.result.data[i].name, data: res.result.data[i]
          }, {
            name: '数据窗口', id: 100000000 + i + 2, sortid: 100000000 + i + 2, style: 'data', tableid: res.result.data[i].tableid, tb_name: res.result.data[i].name, data: res.result.data[i]
          }, {
            name: '表单视图', id: 100000000 + i + 3, sortid: 100000000 + i + 3, style: 'view', tableid: res.result.data[i].tableid, tb_name: res.result.data[i].name, data: res.result.data[i]
          }]
          if (res.result.data[i].data && res.result.data[i].data.window) {
            res.result.data[i].tablechild[1]['tablechild'] = res.result.data[i].data.window
            for (let j = 0; j < res.result.data[i].tablechild[1].tablechild.length; j++) {
              res.result.data[i].tablechild[1].tablechild[j]['sortid'] = res.result.data[i].tablechild[1].tablechild[j].id + 'window'
              res.result.data[i].tablechild[1].tablechild[j]['style'] = 'datadetails'
              res.result.data[i].tablechild[1].tablechild[j]['viewname'] = res.result.data[i].tablechild[1].name
              res.result.data[i].tablechild[1].tablechild[j]['tb_name'] = res.result.data[i].name
              res.result.data[i].tablechild[1].tablechild[j]['alias'] = res.result.data[i].alias
            }
          }
          if (res.result.data[i].data && res.result.data[i].data.form) {
            res.result.data[i].tablechild[2]['tablechild'] = res.result.data[i].data.form
            for (let j = 0; j < res.result.data[i].tablechild[2].tablechild.length; j++) {
              res.result.data[i].tablechild[2].tablechild[j]['sortid'] = res.result.data[i].tablechild[2].tablechild[j].id + 'form'
              res.result.data[i].tablechild[2].tablechild[j]['style'] = 'viewdetails'
              res.result.data[i].tablechild[2].tablechild[j]['viewname'] = res.result.data[i].tablechild[2].name
              res.result.data[i].tablechild[2].tablechild[j]['tb_name'] = res.result.data[i].name
              res.result.data[i].tablechild[2].tablechild[j]['alias'] = res.result.data[i].alias
            }
          }
          res.result.data[i].name = res.result.data[i].name + '(' + res.result.data[i].alias + ')'
        }
        this.tableData = res.result.data
        return res.result
      })
    },
    onExpand (expanded, record) {
      if (expanded) {
        // 设置展开窗Key，代表展开操作
        this.showAll.push(record.id)
      } else {
        // 代表折叠操作
        if (this.showAll.length) {
          this.showAll = this.showAll.filter(v => {
            return v !== record.id
          })
        }
      }
    },
    choiceModule (value) {
      this.queryParam.module = value
      this.$refs.table.refresh(true)
      localStorage.moduleName = value
    },
    // 自动完成搜索
    onSearch (val) {
      if (val) {
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.axios({
            url: 'admin/table/searchCategory/?type=table&category=' + val
          }).then(res => {
            this.typeList = res.result.data
          })
        }, 500)
      }
    },
    openSenior () {
      this.senior = '高级搜索'
      this.configview = {}
      this.config = {}
    },
    handleAdd () {
      this.$refs.tableForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/table/add',
        module: this.queryParam.module
      })
    },
    handleEdit (record) {
      this.$refs.tableForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/admin/table/edit',
        module: this.queryParam.module,
        record: record
      })
    },
    handleExport (record) {
      // this.$confirm({
      //   title: '您确认要导出该数据表的所有配置信息吗？',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/table/exportData/?tableid=${record.tableid}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    handleExportOverview () {
      // const me = this
      // this.$confirm({
      //   title: '您确认要导出数据表概览吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/table/exportOverview/?module=${me.queryParam.module}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    handleExportTableField () {
      // const me = this
      // this.$confirm({
      //   title: '您确认要导出数据表字段吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/table/exportTableField/?module=${me.queryParam.module}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    handleSync () {
      const me = this
      this.$confirm({
        title: '您确认要同步数据表吗?',
        onOk () {
          me.loading = true
          me.axios({
            url: '/admin/table/tableSync',
            params: { module: me.queryParam.module }
          }).then(res => {
            me.loading = false
            me.$refs.table.refresh()
            me.$message.success('操作成功')
          })
        }
      })
    },
    handleUpdateCache () {
      this.$refs.UpdateLoading.show({
        title: '更新缓存'
      })
    },
    handleOk (id) {
      if (id) {
        for (const i in this.panes) {
          if (id === this.panes[i].key) {
            this.panes.splice(i, 1)
          }
        }
      }
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const me = this
      const table = this.$refs.table
      const tableid = record && record.tableid || this.selectedRowKeys
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          me.axios({
            url: '/admin/table/delete',
            data: { tableid: tableid }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    openTags (record) {
      if (record.style === 'span') {
        if (this.showAll.indexOf(record.id) === -1) {
          this.showAll.push(record.id)
          for (const i in record.tablechild) {
            this.showAll.push(record.tablechild[i].id)
          }
        } else {
          const index = this.showAll.indexOf(record.id)
          this.showAll.splice(index, 1)
        }
      } else {
        if (record.style === 'field' && this.panes.every(item => item.key !== record.tableid)) {
          this.configfield = {
            action: 'edit',
            title: record.name,
            url: '/admin/table/edit',
            module: this.queryParam.module,
            record: record
          }
          this.panes.push({ title: record.tb_name, content: 'field', key: record.tableid, name: record.name, alias: record.data.alias, data: this.configfield })
          this.activeKey = record.tableid
        } else if (record.style === 'field') {
          this.activeKey = record.tableid
        } else if (this.panes.every(item => item.key !== record.id)) {
          if (record.style === 'data') {
            this.config = {}
            this.senior = ''
            this.config = {
              action: 'edit',
              title: record.name,
              url: '/admin/table/edit',
              module: this.queryParam.module,
              data: record,
              styleshow: 'data',
              tb_name: record.tb_name,
              loading: true
            }
            this.configview = {}
            this.$nextTick(() => {
              this.$refs.viewData.handleOk()
            })
          }
          if (record.style === 'datadetails') {
            this.datadetails = {
              action: 'edit',
              title: record.name,
              url: '/admin/tplview/editData',
              record: record,
              tableid: record.tableid || record.value,
              variable: record.variable,
              module: this.queryParam.module,
              item: record.data
            }
            this.panes.push({ title: record.name, content: 'datadetails', key: record.id, namefirst: record.tb_name, nametwo: record.viewname, alias: record.alias, data: this.datadetails })
            this.activeKey = record.id
            const name = String(this.activeKey)
            this.tableid[name] = record.tableid || record.value
            this.dataFormType = 'data'
          }
          if (record.style === 'view') {
            this.configview = {}
            this.senior = ''
            this.configview = {
              action: 'edit',
              title: record.name,
              url: '/admin/table/edit',
              module: this.queryParam.module,
              data: record,
              styleshow: 'view',
              tb_name: record.tb_name
            }
            this.config = {}
            this.$nextTick(() => {
              this.$refs.viewForm.handleOk()
            })
          }
          if (record.style === 'viewdetails') {
            this.viewdetails = {
              action: 'edit',
              title: record.name,
              url: '/admin/tplview/editForm',
              record: record,
              variable: record.variable,
              tableid: record.tableid || record.value
            }
            this.panes.push({ title: record.name, content: 'viewdetails', key: record.id, namefirst: record.tb_name, nametwo: record.viewname, alias: record.alias, data: this.viewdetails })
            this.activeKey = record.id
            const name = String(this.activeKey)
            this.tableid[name] = record.tableid || record.value
            this.viewFormType = 'view'
          }
        } else {
          this.activeKey = record.id
        }
      }
    },
    getList (data) {
      if (this.panes.every(item => item.key !== data.record.id)) {
        this.panes.push({ title: data.title, content: 'datadetails', key: data.record.id, namefirst: data.item.tb_name, nametwo: data.item.name, data: data, alias: data.alias })
        this.activeKey = data.record.id
      }
      this.activeKey = data.record.id
      this.datadetails = data
      const name = String(this.activeKey)
      this.tableid[name] = data.tableid
      this.dataFormType = 'data'
    },
    getForm (data) {
      if (this.panes.every(item => item.key !== data.record.id)) {
        this.panes.push({ title: data.title, content: 'viewdetails', key: data.record.id, namefirst: data.item.tb_name, nametwo: data.item.name, data: data, alias: data.alias })
        this.activeKey = data.record.id
      }
      this.activeKey = data.record.id
      this.viewdetails = data
      const name = String(this.activeKey)
      this.tableid[name] = data.tableid
      this.viewFormType = 'view'
    },
    getField (data) {
      if (data.type === '字段') {
        this.configfield = {
          action: 'edit',
          title: data.name,
          url: '/admin/table/edit',
          module: this.queryParam.module,
          record: data
        }
        if (this.panes.every(item => item.key !== data.tableid)) {
          this.panes.push({ title: data.tablename, content: 'field', key: data.tableid, name: data.name, alias: data.alias })
          this.activeKey = data.tableid
        } else {
          this.activeKey = data.tableid
        }
      } else if (['卡片数据窗口', '普通数据窗口', '流程数据窗口', '子表单数据窗口'].includes(data.type)) {
        if (this.panes.every(item => item.key !== data.id)) {
          this.panes.push({ title: data.name, content: 'datadetails', key: data.id, namefirst: data.tablename, nametwo: '数据窗口', data: data, alias: data.alias })
          this.activeKey = data.id
        }
        this.dataFormType = ''
        this.activeKey = data.id
        data['action'] = 'edit'
        if (data.type === '普通数据窗口') {
          data['variable'] = 'table_form_list'
        } else if (data.type === '子表单数据窗口') {
          data['variable'] = 'table_subform_list'
        } else if (data.type === '卡片数据窗口') {
          data['variable'] = 'table_card_list'
        } else {
          data['variable'] = 'table_flow_list'
        }
        data['url'] = '/admin/tplview/editData'
        data['record'] = {}
        data.record['id'] = data.id
        this.datadetails = data
        this.dataFormType = 'data'
        const name = String(this.activeKey)
        this.tableid[name] = data.tableid
      } else {
        if (this.panes.every(item => item.key !== data.id)) {
          this.panes.push({ title: data.name, content: 'viewdetails', key: data.id, namefirst: data.tablename, nametwo: '表单视图', data: data, alias: data.alias })
          this.activeKey = data.id
        }
        this.viewFormType = ''
        data['action'] = 'edit'
        data['url'] = '/admin/tplview/editForm'
        data['record'] = {}
        data.record['id'] = data.id
        this.activeKey = data.record.id
        this.viewdetails = data
        if (data.type === '表格视图') {
          data.variable = 'table_custom_view'
        } else {
          data.variable = 'table_form_view'
        }
        this.viewFormType = 'view'
        const name = String(this.activeKey)
        this.tableid[name] = data.tableid
      }
    },
    showTable (data) {
      this.tableShowData = data
      this.$set(this.queryParam, 'searchString', data.tablename)
      this.$refs.table.refresh(true)
    },
    tabChange (value, id) {
      for (const i in this.panes) {
        if (this.activeKey === this.panes[i].key) {
          this.panes[i].key = id
          this.panes[i].data['record'] = {}
          this.panes[i].data.record['id'] = id
          this.panes[i].title = value.info.name
          this.activeKey = id
          this.datadetails = this.panes[i].data
        }
      }
      this.handleOk()
      this.$nextTick(() => {
        this.$refs.viewForm.handleOk()
      })
    },
    tabViewChange (value, id) {
      for (const i in this.panes) {
        if (this.activeKey === this.panes[i].key) {
          this.panes[i].key = id
          this.panes[i].data['record'] = {}
          this.panes[i].data.record['id'] = id
          this.panes[i].title = value.info.name
          this.activeKey = id
          this.viewdetails = this.panes[i].data
        }
      }
      this.handleOk()
    },
    getAdd (data) {
      this.panes.push({ title: data.title, content: 'datadetails', key: data.Keyid, namefirst: data.item.tb_name, nametwo: data.item.name, data: data })
      this.activeKey = data.Keyid
      this.datadetails = data
      this.dataaddType = 'dataadd'
      const name = String(this.activeKey)
      this.tableid[name] = data.tableid
    },
    getViewAdd (data) {
      this.panes.push({ title: data.title, content: 'viewdetails', key: data.Keyid, namefirst: data.item.tb_name, nametwo: data.item.name, data: data })
      this.activeKey = data.Keyid
      this.viewdetails = data
      this.viewaddType = 'viewadd'
      const name = String(this.activeKey)
      this.tableid[name] = data.tableid
    },
    // 数据提交
    handleSubmit () {
      let type = ''
      this.panes.forEach(item => {
        if (item.key === this.activeKey) {
          type = item.content
        }
      })
      if (type === 'datadetails') {
        for (const i in this.$refs.tplviewDataFormEdit) {
          if (this.$refs.tplviewDataFormEdit[i].data.id === this.activeKey) {
            this.$refs.tplviewDataFormEdit[i].handleSubmit('save')
          } else if (!this.$refs.tplviewDataFormEdit[i].data.id && this.activeKey === this.$refs.tplviewDataFormEdit[i].config.Keyid) {
            this.$refs.tplviewDataFormEdit[i].handleSubmit('save')
          }
        }
      } else if (type === 'viewdetails') {
        for (const i in this.$refs.tplviewFormForm) {
          if (this.$refs.tplviewFormForm[i].data.id === this.activeKey || this.$refs.tplviewFormForm[i].config.Keyid === this.activeKey) {
            this.$refs.tplviewFormForm[i].handleSubmit('save')
          }
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';

.container /deep/ .ant-layout-sider-children{
  display: flex;
  flex-direction: column;
}
.reload{
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.65);
  transition-duration: .2s;
}
.reload:hover{
  color: @primary-color;
}
</style>
