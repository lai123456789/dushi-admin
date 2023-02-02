<template>
  <a-drawer
    :destroyOnClose="true"
    title="导出"
    :width="1000"
    :visible="visible"
    @close="close"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model="activeKey" >
        <a-tab-pane tab="导出数据" :key="1">
          <a-form :form="formfile" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
            <a-alert v-if="config.message" :message="config.message" size="small" type="info" style="margin-bottom: 8px"/>
            <a-form-item label="导出文件名称">
              <a-input v-decorator="['fileName', { initialValue: '', rules: [{ required: true, message: '请输入导出文件名称' }] }]"/>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane tab="我的任务" :key="2">
          <a-alert :message="message" style="margin-bottom: 8px"/>
          <div style="display: flex; margin-bottom: 8px;">
            <a-input v-model="queryParamTask.filename" placeholder="请输入文件名搜索"/>
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
            <a-input v-model="queryParamAll.filename" placeholder="请输入文件名搜索"/>
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
        <a-button type="primary" @click="handleOk" v-if="this.activeKey === 1">导出</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      config: {},
      activeKey: 1,
      visible: false,
      loading: false,
      check: false,
      fileName: '',
      formfile: this.$form.createForm(this),
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
      type: '',
      custom_title: {},
      Interval: null,
      message: ''
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    show (config) {
      this.visible = true
      this.activeKey = 1
      this.config = config
    },
    handleOk () {
      // 导出数据提交
      this.formfile.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          const time = new Date()
          this.axios({
            url: '/admin/task/add',
            data: { info: {
              type: 'export',
              controller: this.config.controller, // 控制器，如admin/Api
              method: this.config.method, // 方法
              number: this.config.number ? this.config.number : `${this.config.controller}/${this.config.method}`, // 关联编号，如视图编号
              parameter: JSON.stringify(Object.assign({
                filename: values.fileName + '.xlsx',
                filepath: 'public/upload/' + time.getFullYear() + '/' + ((time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)) + '/' + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) + '/' + (new Date()).valueOf() + '.xlsx',
                param: this.config.param // 新增
              }, this.config.parameter))
            } }
          }).then((res) => {
            this.loading = false
            this.activeKey = 2
            // 第一次tab跳转表格未创建
            this.$nextTick(() => {
              this.$refs.tableTask.refresh()
            })
          })
        }
      })
    },
    // 我的任务显示
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/task/select',
        params: Object.assign(parameter, this.queryParamTask, { type: 'export', number: this.config.number, sortField: 'create_time', sortOrder: 'descend', mytask: '1' })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i].filename = res.result.data[i].filename.replace(/.xlsx/, '')
        }
        this.message = res.result.process_msg
        clearInterval(this.Interval)
        this.runtime()
        return res.result
      })
    },
    // 所有任务显示
    AllDataTable (parameter) {
      return this.axios({
        url: '/admin/task/select',
        params: Object.assign(parameter, this.queryParamTask, { type: 'export', number: this.config.number, sortField: 'create_time', sortOrder: 'descend', alltask: '1' })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i].filename = res.result.data[i].filename.replace(/.xlsx/, '')
        }
        clearInterval(this.Interval)
        this.runtime()
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
