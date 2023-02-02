<template>
  <a-card>
    <div class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {messageTime = null; processingTime = null; queryParam = {status: ''}, $refs.table.refresh(true)}">重置</a-button>
            <a @click="advanced=!advanced">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="留言时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getMessagehTime"
                v-model="messageTime"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="处理时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getProcessingTime"
                v-model="processingTime"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="留言状态">
              <a-select v-model="queryParam.status" :allowClear="true">
                <a-select-option value="0">新留言</a-select-option>
                <a-select-option value="1">已处理</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="主叫号码">
              <a-input v-model="queryParam.callerid" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="处理工号">
              <a-input v-model="queryParam.processing_work_number" placeholder="" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="table-operator">
      <a-button v-action:export icon="download" @click="handleExport()">导出</a-button>
    </div>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="sorter"
    >
      <span slot="status" slot-scope="text">
        <a-badge v-if="text =='0'" status="success" text="新留言" />
        <a-badge v-else status="default" text="已处理" />
      </span>
      <div slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a>更多<a-icon type="down"/></a>
          <a-menu slot="overlay">
            <a-menu-item @click="handlePlayback(record)">播放</a-menu-item>
            <a-menu-item ><a @click="handleDownload(record)">下载</a></a-menu-item>
            <a-menu-item><a @click="handleDelete(record)">删除</a></a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </s-table>
    <modal-form ref="modalForm" @ok="handleOk" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    ModalForm: () => import('./VmailForm'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      // 时间组件
      messageTime: null,
      processingTime: null,
      advanced: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '主叫号码',
        dataIndex: 'callerid',
        sorter: true
      }, {
        title: '被叫号码',
        dataIndex: 'extension',
        sorter: true
      }, {
        title: '留言时长',
        dataIndex: 'duration',
        sorter: true
      }, {
        title: '留言状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' },
        sorter: false
      }, {
        title: '留言时间',
        dataIndex: 'inputtime',
        sorter: true
      }, {
        title: '处理工号',
        dataIndex: 'operator',
        sorter: true
      }, {
        title: '处理时间',
        dataIndex: 'operate_time',
        sorter: true
      }, {
        title: '留言摘要',
        dataIndex: 'message_processing',
        sorter: false
      }, {
        title: '留言处理',
        dataIndex: 'remark',
        sorter: false
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/Vmail/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleExport () {
      // const where = encodeURIComponent(JSON.stringify(this.queryParam))
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/vmail/export?where=${where}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    handleEdit (record) {
      this.$refs.modalForm.show({
        action: 'edit',
        title: '编辑',
        url: '/statistic/vmail/edit',
        record: record
      })
    },
    handlePlayback (record) {
      this.$setSetting({ audioPlayData: { visible: true, sourceUrl: record.voicefile } })
    },
    handleDownload (record) {
      window.open(record.voicefile)
    },
    handleDelete (record) {
      const table = this.$refs.table
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/statistic/vmail/delete',
            params: { id: record.id }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    getMessagehTime (date, dateString) {
      this.queryParam.message_begin_time = dateString[0]
      this.queryParam.message_end_time = dateString[1]
    },
    getProcessingTime (date, dateString) {
      this.queryParam.processing_begin_time = dateString[0]
      this.queryParam.processing_end_time = dateString[1]
    }
  }
}
</script>
