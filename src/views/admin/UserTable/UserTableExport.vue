<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1000"
    :visible="visible"
    @close="close"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model="activeKey" >
        <a-tab-pane tab="导出数据" :key="1">
          <a-alert :message="messageExport" type="info" />
          <a-row :gutter="10" v-if="!config.customExport">
            <a-col :span="16">
              <div style="display: flex; margin: 8px 0;">
                <a-input-search placeholder="请输入字段名称搜索" @search="(e)=>{showWord = e}" @change="(e)=>{ if(!e.target.value){showWord = e.target.value} }"/>
                <a-button @click="handleField" style="margin: 0 8px;">选择字段</a-button>
                <a-button @click="handleSort">排序</a-button>
              </div>
              <a-table
                ref="table"
                rowKey="dataIndex"
                :columns="columns"
                :dataSource="dataSource.filter(item=> item.title.includes(showWord))"
                :sorter="{ field: 'id', order: 'descend' }"
                size="small"
                :pagination="false">
              </a-table>
            </a-col>
            <a-col :span="8">
              <s-table
                style="margin-top: 8px"
                rowKey="id"
                :columns="columnsTemplate"
                :data="templateData"
                size="small"
                ref="tableTemp"
                :showPagination="false"
              >
                <div slot="name" slot-scope="text, record, index" @mouseenter="onMouseOver(record)" @mouseleave="onMouseOut(record)">
                  <div>
                    <a-col :span="1" style="margin-right: 5px"><a-icon v-show="chiose[index]" type="check" style="margin-top: 4px; color: #52c41a" /></a-col>
                    <a-col :span="21" style="cursor: pointer" @click="changTemplate(record, index)"><span>{{ record.name }}</span></a-col>
                    <a-col :span="1"><a-icon v-show="record.display" type="close" style="float:right; margin-top: 4px; color: #ff4d4f" @click="Tempdelete(record)"/></a-col>
                  </div>
                </div>
              </s-table>
            </a-col>
          </a-row>
          <a-alert message="定制导出功能，请直接点击“导出”按钮" type="info" v-else/>
        </a-tab-pane>
        <a-tab-pane tab="我的任务" :key="2">
          <a-alert :show-icon="false" :message="message" style="margin-bottom: 8px"/>
          <div style="display: flex; margin-bottom: 8px;">
            <a-input-search v-model="queryParamTask.filename" @search="(e)=>{$refs.tableTask.refresh()}" placeholder="请输入文件名搜索"/>
            <a-button style="margin-left: 10px" icon="reload" @click="() => { queryParamTask = {}, $refs.tableTask.refresh()}">刷新</a-button>
          </div>
          <s-table
            ref="tableTask"
            size="small"
            rowKey="id"
            :columns="columnsTask"
            :data="loadDataTable"
          >
            <span slot="serial" slot-scope="text, record, index">{{ index + 1 }}</span>
            <span slot="status" slot-scope="text, record">
              <a-badge v-if="text =='0'" status="error" text="未开始" />
              <a-tooltip v-else-if="text =='1'" :title="'总导出数: ' + record.total_number + ', 已导出数: ' + record.complete_number">
                <a-progress :percent="record.processing" status="active"/>
              </a-tooltip>
              <a-badge v-else-if="text =='2'" status="success" text="已完成" />
              <a-badge v-else-if="text =='3'" status="error" text="失败" />
            </span>
            <span slot="duration" slot-scope="text">{{ text }}</span>
            <div slot="action" slot-scope="text, record">
              <a @click="handleDownload(record)" :disabled="record.status != 2">下载</a>
              <a-divider type="vertical" />
              <a @click="handleDelete(record)" :disabled="record.status == 1">删除</a>
            </div>
          </s-table>
        </a-tab-pane>
        <a-tab-pane tab="所有任务" :key="3">
          <div style="display: flex; margin-bottom: 8px;">
            <a-input-search v-model="queryParamAll.filename" @search="(e)=>{$refs.tableAll.refresh()}" placeholder="请输入文件名搜索"/>
            <a-button style="margin-left: 10px" icon="reload" @click="() => { queryParamAll = {}, $refs.tableAll.refresh()}">刷新</a-button>
          </div>
          <s-table
            ref="tableAll"
            size="small"
            rowKey="id"
            :columns="columnsAll"
            :data="AllDataTable"
          >
            <span slot="serial" slot-scope="text, record, index">{{ index + 1 }}</span>
            <span slot="status" slot-scope="text, record">
              <a-badge v-if="text =='0'" status="error" text="未开始" />
              <a-tooltip v-else-if="text =='1'" :title="'总导出数: ' + record.total_number + ', 已导出数: ' + record.complete_number">
                <a-progress :percent="record.processing" status="active"/>
              </a-tooltip>
              <a-badge v-else-if="text =='2'" status="success" text="已完成" />
              <a-badge v-else-if="text =='3'" status="error" text="失败" />
            </span>
            <span slot="duration" slot-scope="text">{{ text }}</span>
          </s-table>
        </a-tab-pane>
      </a-tabs>
      <div class="bbar" >
        <div style="float: left" v-if="this.activeKey === 1 && !config.customExport">
          <a-button @click="reset" style="margin-left: 0">重置</a-button>
          <a-button @click="check ? setFileName('update') : setFileName('template')">{{ check? '更新导出模板' : '保存导出模板' }}</a-button>
        </div>
        <a-button type="primary" @click="setName" v-if="this.activeKey === 1">导出</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <a-modal
      :title="exportConfig.title"
      :visible="fileVisible"
      :confirmLoading="fileLoading"
      @cancel="fileVisible=!fileVisible"
      @ok="handleOk"
    >
      <div>
        <a-form :form="formfile">
          <a-form-item label="导出文件名称" :colon="false" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
            <a-input v-decorator="['fileName', { initialValue: check ? fileName : nowtime, rules: [{ required: true, message: '请输入导出文件名称' }] }]" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <a-modal
      :title="exportConfig.title"
      :visible="exportVisible"
      :confirmLoading="exportLoading"
      @cancel="exportVisible=!exportVisible"
      @ok="handleOk('template')"
    >
      <div>
        <a-form :form="form">
          <a-form-item label="导出模板名称" :colon="false" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
            <a-input v-decorator="['name', { initialValue: check ? fileName : '', rules: [{ required: true, message: '请输入导出模板名称' }] }]" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <FlowAttrTransitionSort ref="flowAttrTransitionSort" @ok="getSort"/>
    <column-check
      ref="columnCheck"
      @ok="getList"
      :dataList="dataSource.map(item=>{
        const obj ={};obj.name = item.title
        obj.display = item.display
        obj.value = item.dataIndex;return obj; })"/>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    ColumnCheck: () => import('@/views/admin/Table/ColumnCheck')
  },
  data () {
    return {
      config: {},
      exportConfig: {},
      activeKey: 1,
      visible: false,
      exportVisible: false,
      exportLoading: false,
      fileLoading: false,
      fileVisible: false,
      loading: false,
      length: '',
      chiose: [],
      check: false,
      showWord: '',
      nowtime: null,
      fileName: '',
      // 全部字段
      plainOptions: [],
      form: this.$form.createForm(this),
      formfile: this.$form.createForm(this),
      selectedRowKeys: [],
      columns: [{
        title: '#',
        width: 60,
        customRender: (text, record, index) => index + 1
      }, {
        title: '字段列名称',
        dataIndex: 'title'
      }],
      dataSource: [],
      // 表头
      columnsTemplate: [{
        title: '导出模板',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      }],
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
      // 搜索参数
      queryParamTask: {},
      queryParamAll: {},
      // 表头
      columnsTask: [{
        title: '#',
        width: 40,
        scopedSlots: { customRender: 'serial' }
      }, {
        title: '文件名',
        dataIndex: 'filename',
        width: 170
      }, {
        title: '创建时间',
        dataIndex: 'create_time',
        width: 150
      }, {
        title: '开始时间',
        dataIndex: 'run_time',
        width: 150
      }, {
        title: '耗时',
        dataIndex: 'duration',
        scopedSlots: { customRender: 'duration' },
        width: 100
      }, {
        title: '任务状态',
        dataIndex: 'status',
        width: 130,
        scopedSlots: { customRender: 'status' }
      }, {
        title: '文件大小',
        dataIndex: 'filesize',
        scopedSlots: { customRender: 'filesize' }
      }, {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 120,
        scopedSlots: { customRender: 'action' }
      }],
      columnsAll: [{
        title: '#',
        width: 40,
        scopedSlots: { customRender: 'serial' }
      }, {
        title: '文件名',
        dataIndex: 'filename',
        width: 170
      }, {
        title: '创建时间',
        dataIndex: 'create_time',
        width: 150
      }, {
        title: '开始时间',
        dataIndex: 'run_time',
        width: 150
      }, {
        title: '耗时',
        dataIndex: 'duration',
        scopedSlots: { customRender: 'duration' },
        width: 100
      }, {
        title: '任务状态',
        dataIndex: 'status',
        width: 130,
        scopedSlots: { customRender: 'status' }
      }, {
        title: '创建人',
        dataIndex: 'create_user',
        width: 90
      }, {
        title: '创建部门',
        dataIndex: 'create_department'
      }],
      parentQueryParam: {},
      type: '',
      custom_title: {},
      Interval: null,
      message: '',
      messageExport: (<div>
        <div>1、初始打开时，已勾选的为表格中显示的字段，未勾选的为表格中隐藏的字段。</div>
        <div>2、点击【保存导出模板】按钮，保存当前的导出模板。点击右侧的模板，加载已保存好的模板，更改后，点击【更新导出模板】以更新当前右侧选中的模板。</div>
        <div>3、点击【重置】，恢复到初始打开导出界面时的状态，可保存更多导出模板。</div></div>)
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    // 接收传参&获取字段
    templateData () {
      return this.axios({
        url: '/admin/UserTable/customTemplate/',
        params: { action: 'get', type: 'list_export', tplviewid: this.config.tplviewid }
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['display'] = false
          this.chiose.push(false)
          res.result.data[i].name = JSON.parse(res.result.data[i].setting).name
        }
        this.length = res.result.data.length
        return res.result
      })
    },
    show (config) {
      this.visible = true
      this.config = config
      this.parentQueryParam = config.where_queryParam
      this.selectedRowKeys = []
      const time = new Date()
      this.nowtime = String(time.getFullYear()) + ((time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)) + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) + '-' + (new Date()).valueOf()
      this.dataSource = []
      for (const i in config.columns) {
        if (config.columns[i].custom_title) {
          config.columns[i].title = config.columns[i].custom_title
          const alias = config.columns[i].dataIndex
          const title = config.columns[i].custom_title
          this.custom_title[alias] = title
        }
      }
      this.plainOptions = config.columns
      for (let i = 0; i < this.plainOptions.length; i++) {
        if (this.plainOptions[i].type === 'action') {
          this.plainOptions.splice(i, 1)
        }
        if (this.plainOptions[i].display === 'd') {
          this.plainOptions.splice(i, 1)
        }
        if (this.plainOptions[i].display === 'v') {
          this.dataSource.push(this.plainOptions[i])
        }
        this.selectedRowKeys.push(this.plainOptions[i].dataIndex)
        this.plainOptions[i].id = i
      }
    },
    // 删除模板
    Tempdelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该模板吗？',
        onOk () {
          that.axios({
            url: '/admin/UserTable/customTemplate/',
            data: {
              action: 'delete',
              type: 'list_export',
              id: record.id
            }
          }).then(res => {
            that.check = false
            for (const i in that.chiose) {
              that.chiose[i] = false
            }
            that.$nextTick(() => {
              that.reset()
              that.$refs.tableTemp.refresh()
            })
            return res.result
          })
        }
      })
    },
    handleSort () {
      const data = this.dataSource.map(item => {
        const obj = item
        obj.name = item.title
        return obj
      })
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: data,
        width: '100%'
      })
    },
    getSort (data) {
      this.dataSource = data
      this.selectedRowKeys = data.map(item => item.dataIndex)
    },
    handleField () {
      this.plainOptions.forEach(item => {
        item.name = item.title
      })
      const data = this.plainOptions.map(item => {
        const obj = {}
        obj.name = item.title
        obj.display = item.display
        obj.value = item.dataIndex
        return obj
      })
      this.$refs.columnCheck.show({
        action: 'edit',
        title: '选择字段',
        data: data
      })
    },
    getList (data) {
      this.dataSource = []
      data.forEach(item => {
        const obj = this.plainOptions.find(plaItem => plaItem.dataIndex === item.value)
        this.dataSource.push(obj)
      })
      this.selectedRowKeys = data.map(item => item.value)
    },
    // 重置
    reset () {
      this.selectedRowKeys = this.plainOptions.map(item => item.dataIndex)
      this.dataSource = this.plainOptions.filter(item => item.display === 'v')
      this.check = false
      for (const i in this.chiose) {
        this.$set(this.chiose, i, false)
      }
    },
    onMouseOver (record) {
      record.display = true
    },
    onMouseOut (record) {
      record.display = false
    },
    // 设置文件名称
    setFileName (type) {
      this.type = type
      if (type === 'template') {
        if (this.length >= 10) {
          this.exportConfig.action = 'template'
          this.$error({
            title: '同一数据窗口下最多只能保存10个导出模板'
          })
        } else {
          this.exportVisible = true
          this.exportConfig = {
            title: '请输入保存的导出模板名称',
            action: 'template'
          }
        }
      } else {
        const that = this
        this.$confirm({
          title: '您确认要更新模板吗？',
          onOk () {
            that.axios({
              url: '/admin/UserTable/customTemplate/',
              data: {
                uid: that.config.tplviewid,
                tableid: that.config.tableid,
                type: 'list_export',
                data: {
                  fields: that.selectedRowKeys,
                  name: that.fileName
                },
                action: 'edit',
                id: that.templateid
              }
            }).then(res => {
              that.$refs.tableTemp.refresh()
              that.exportVisible = false
            })
          }
        })
      }
    },
    // 设置名字弹窗
    setName (type) {
      this.fileVisible = true
      this.exportConfig = {
        title: '请输入导出文件的名称',
        action: 'file'
      }
    },
    // 选择模板
    changTemplate (record, index) {
      this.fileName = record.name
      this.templateid = record.id
      for (const i in this.chiose) {
        this.$set(this.chiose, i, false)
      }
      this.chiose[index] = true
      this.selectedRowKeys = JSON.parse(record.setting).fields
      this.dataSource = []
      this.selectedRowKeys.forEach(item => {
        const obj = this.plainOptions.find(plaItem => plaItem.dataIndex === item)
        if (obj) {
          this.dataSource.push(obj)
        }
      })
      this.check = true
    },
    handleOk (type) {
      // 模板数据提交
      if (type === 'template') {
        const table = this.$refs.tableTemp
        this.exportLoading = true
        this.form.validateFields((err, values) => {
          values['fields'] = this.selectedRowKeys
          if (!err) {
            this.axios({
              url: '/admin/UserTable/customTemplate/',
              data: {
                uid: this.config.tplviewid,
                tableid: this.config.tableid,
                type: 'list_export',
                data: values,
                action: 'add'
              }
            }).then(res => {
              table.refresh()
              this.exportLoading = false
              this.exportVisible = false
            })
          }
        })
      } else {
        // 导出数据提交
        this.formfile.validateFields((err, values) => {
          if (!err) {
            const me = this
            me.loading = true
            me.fileLoading = true
            const time = new Date()
            const parameter = {
              export_fields: me.selectedRowKeys,
              tableid: me.config.tableid,
              filename: values.fileName + '.xlsx',
              columns: me.selectedRowKeys,
              custom_title: me.custom_title,
              filepath: 'public/upload/' + time.getFullYear() + '/' + ((time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)) + '/' + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) + '/' + (new Date()).valueOf() + '.xlsx',
              flowStatus: me.config.flowStatus,
              where: me.config.flowCondition ? me.parentQueryParam : me.config.where,
              tplviewid: me.config.flowCondition ? me.config.tplviewid : undefined,
              flowCondition: me.config.flowCondition
            }
            this.axios({
              url: '/admin/task/add',
              data: { info: {
                number: me.config.tplviewid,
                type: 'export',
                controller: me.config.controller ? me.config.controller : 'admin/Api',
                method: me.config.method ? me.config.method : (me.config.flowCondition ? 'export_workflow' : 'export'),
                parameter: JSON.stringify(parameter)
              } }
            }).then((res) => {
              me.fileVisible = false
              me.fileLoading = false
              me.loading = false
              me.activeKey = 2
              // 第一次tab跳转表格未创建
              me.$nextTick(() => {
                me.$refs.tableTask.refresh()
              })
            })
          }
        })
      }
    },
    // 我的任务显示
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/task/select',
        params: Object.assign(parameter, this.queryParamTask, { type: 'export', number: this.config.tplviewid, sortField: 'create_time', sortOrder: 'descend', mytask: '1' })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i].filename = res.result.data[i].filename.replace(/.xlsx/, '')
        }
        this.message = res.result.process_msg
        clearInterval(this.Interval)
        if (res.result.data.some(item => item.status !== '2')) {
          this.runtime()
        }
        return res.result
      })
    },
    // 所有任务显示
    AllDataTable (parameter) {
      return this.axios({
        url: '/admin/task/select',
        params: Object.assign(parameter, this.queryParamTask, { type: 'export', number: this.config.tplviewid, sortField: 'create_time', sortOrder: 'descend', alltask: '1' })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i].filename = res.result.data[i].filename.replace(/.xlsx/, '')
        }
        clearInterval(this.Interval)
        if (res.result.data.some(item => item.status !== '2')) {
          this.runtime()
        }
        return res.result
      })
    },
    runtime () {
      this.Interval = setTimeout(() => {
        if (this.activeKey === 2) {
          this.$refs.tableTask.refresh()
        } else if (this.activeKey === 3) {
          this.$refs.tableAll.refresh()
        } else {
          clearInterval(this.Interval)
        }
      }, 5000)
    },
    close () {
      this.visible = !this.visible
      clearInterval(this.Interval)
    },
    // 导出文件下载
    handleDownload (record) {
      window.open(`${process.env.VUE_APP_API_BASE_URL}admin/api/download/?filepath=${record.filepath}&filename=${record.filename}`)
    },
    // 导出任务删除
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/task/delete',
            params: { id: record.id }
          }).then(res => {
            that.$refs.tableTask.refresh()
            return res.result
          })
        }
      })
    }
  }
}
</script>
