<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'" :form="form">
        <div class="head">
          <div class="title">过滤</div>
          <a-space class="button">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="reset">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="手机号码">
              <a-input v-model="queryParam.phone" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="发送状态">
              <a-select v-model="queryParam.sendStatus" allow-clear>
                <a-select-option v-for="value in sendStatus" :key="value.value" :value="value.value" >{{ value.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="发送时间">
              <a-range-picker
                @change="onSendTime"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                v-model="queryParam.showTime"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="发送内容">
              <a-input v-model="queryParam.sendContent" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="发送模板">
              <a-select v-model="queryParam.template" allowClear>
                <a-select-option v-for="value in template" :key="value.value" :value="value.value" >{{ value.display }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="回复时间">
              <a-range-picker
                @change="onReplyTime"
                v-model="queryParam.replyShowTime"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="回复内容">
              <a-input v-model="queryParam.replyContent" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="发送人">
              <a-input v-model="queryParam.sendUser" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <a-space style="margin-bottom: 8px;">
        <a-button v-action:send icon="plus" @click="handleAdd" type="primary">发送</a-button>
        <a-button v-action:export icon="download" @click="handleExport()">导出</a-button>
        <a-button v-action:delete icon="delete" @click="handleDelete()" type="danger" :disabled="selectedRowKeys.length == 0">批量删除</a-button>
      </a-space>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :rowSelection="rowSelection"
        :sorter="sorter"
      >
        <span slot="send_status" slot-scope="text">
          <a-badge v-if="text == '1'" status="success" text="发送成功" />
          <a-badge v-else-if="text == '-1'" status="error" text="发送失败" />
          <a-badge v-else status="processing" text="待发送" />
        </span>
        <span slot="receive_status" slot-scope="text">
          <a-badge v-if="text =='1'" status="success" text="成功" />
          <a-badge v-else status="error" text="未知" />
        </span>
        <div slot="action" slot-scope="text, record">
          <a v-action:template_edit @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
      <send-form ref="sendForm" @ok="handleOk" />
    </a-card>
    <general-export ref="generalExport" />
  </div>
</template>
<script>
export default {
  components: {
    SendForm: () => import('./SendForm'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      advanced: false,
      sendStatus: [{
        value: '0',
        type: '待发送'
      }, {
        value: '1',
        type: '发送成功'
      }, {
        value: '-1',
        type: '发送失败'
      }],
      template: [],
      where: '1 = 1',
      // 搜索参数
      queryParam: {
        showTime: [this.moment().startOf('day'), this.moment().endOf('day')],
        sendTime: [this.moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), this.moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')]
      },
      form: this.$form.createForm(this),
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 80,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60
      }, {
        title: '手机号码',
        dataIndex: 'number',
        width: 100
      }, {
        title: '发送时间',
        dataIndex: 'send_time',
        width: 140
      }, {
        title: '发送内容',
        dataIndex: 'send_content',
        ellipsis: false,
        width: 300
      }, {
        title: '计费条数',
        dataIndex: 'count',
        width: 80
      }, {
        title: '发送状态',
        dataIndex: 'send_status',
        width: 100,
        scopedSlots: { customRender: 'send_status' }
      }, {
        title: '接收状态',
        dataIndex: 'receive_status',
        width: 100,
        scopedSlots: { customRender: 'receive_status' }
      }, {
        title: '回复时间',
        dataIndex: 'reply_time',
        width: 140,
        customRender: (text, record) => {
          return text || '--'
        }
      }, {
        title: '回复内容',
        dataIndex: 'reply_content',
        width: 150,
        customRender: (text, record) => {
          return text || '--'
        }
      }, {
        title: '发送人',
        dataIndex: 'send_user',
        width: 120
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      colLayout: {},
      sorter: { field: 'id', order: 'descend' }
    }
  },
  created () {
    this.changeAdvanced(false)
    this.getTemplate()
  },
  methods: {
    getTemplate () {
      this.axios({
        url: '/sms/template/getTemplate'
      }).then((res) => {
        this.template = res.result.data
      })
    },
    loadData (parameter) {
      const me = this
      return this.axios({
        url: '/sms/send/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        me.where = res.result.where
        return res.result
      })
    },
    handleAdd () {
      this.$refs.sendForm.show({
        action: 'add',
        title: '发送',
        url: '/sms/template/getTemplate'
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    onSendTime (date, dateString) {
      this.queryParam.showTime = date
      this.queryParam.sendTime = dateString
    },
    reset () {
      this.queryParam = {}
      this.queryParam.sendTime = [this.moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), this.moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')]
      this.queryParam.showTime = [this.moment().startOf('day'), this.moment().endOf('day')]
      this.$refs.table.refresh()
    },
    onReplyTime (date, dateString) {
      this.queryParam.replyShowTime = date
      this.queryParam.replyTime = dateString
    },
    handleDelete (record) {
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      const that = this
      this.$confirm({
        title: '您确认要删除数据吗？',
        onOk () {
          that.axios({
            url: '/sms/send/bulkDelete',
            data: { id: id }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleExport () {
      // const me = this
      // this.$confirm({
      //   title: '您确认要导出数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}sms/send/export/?where=` + encodeURIComponent(me.where))
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    changeAdvanced (tag) {
      if (tag) {
        this.advanced = !this.advanced
      }
      if (this.advanced) {
        this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
      } else {
        this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
      }
    }
  }
}
</script>
