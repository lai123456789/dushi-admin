<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {};search ('lastSevenDays'), time='最近7天', $refs.table.refresh(true)}">重置</a-button>
            <a-button icon="vertical-align-bottom" v-action:export @click="handleExport()">导出</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="会话时间">
              <a-select v-model="time" >
                <a-select-option value="0" @click="search ('lastSevenDays')">最近7天</a-select-option>
                <a-select-option value="1" @click="search ('yesterday')">最近15天</a-select-option>
                <a-select-option value="2" @click="search ('week')">最近30天</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="来访时间">
              <a-range-picker
                style="width: 100%"
                :value="queryParam.start_time ? [moment(queryParam.start_time), moment(queryParam.end_time)] : []"
                show-time
                @change="onChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1">
        <span slot="tab">每日数据</span>
        <a-card>
          <s-table
            ref="table"
            size="small"
            rowKey="service_id"
            :columns="EverydayData"
            :data="loadDataTable"
            :sorter="sorter"
          >
          </s-table>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="2">
        <span slot="tab">客服人员数据</span>
        <a-card>
          <s-table
            ref="table"
            size="small"
            rowKey="service_id"
            :columns="CustomerServiceData"
            :data="loadDataTable"
            :sorter="sorter"
          >
            <div slot="action" slot-scope="" >
              <a @click="detail()">详细数据</a>
            </div>
          </s-table>

          <a-drawer
            title="详细数据"
            :width="700"
            :visible="myvisible"
            @close="myvisible=!myvisible"
          >
            <s-table
              ref="table"
              size="small"
              rowKey="service_id"
              :columns="detailData"
              :data="loadDataTable"
              :sorter="sorter"
            >
            </s-table>
          </a-drawer>
        </a-card>
      </a-tab-pane>
    </a-tabs>
    <general-export ref="generalExport" />
  </div>
</template>
<script>
var Getdate = function () {
  var now = new Date() // 当前日期
  var nowDay = now.getDate() // 当前日
  var nowMonth = now.getMonth() // 当前月
  var nowYear = now.getYear() // 当前年
  nowYear += (nowYear < 2000) ? 1900 : 0
  // 格式化日期：yyyy-MM-dd
  function formatDate (date) {
    var myyear = date.getFullYear()
    var mymonth = date.getMonth() + 1
    var myweekday = date.getDate()
    if (mymonth < 10) {
      mymonth = '0' + mymonth
    }
    if (myweekday < 10) {
      myweekday = '0' + myweekday
    }
    return (myyear + '-' + mymonth + '-' + myweekday)
  }
  // 获得今天的日期
  this.getTodayDate = function () {
    var todayStartDate = new Date(nowYear, nowMonth, nowDay)
    return formatDate(todayStartDate)
  }
  // 获得最近七天的日期
  this.getLastSevenDaysDate = function () {
    var LastSevenDaysDate = new Date(nowYear, nowMonth, nowDay - 6)
    return formatDate(LastSevenDaysDate)
  }
  // 获得最近15天的日期
  this.getLastFifteenDaysDate = function () {
    var LastFifteenDaysDate = new Date(nowYear, nowMonth, nowDay - 14)
    return formatDate(LastFifteenDaysDate)
  }
  // 最近30天
  this.getLastThirtyDaysDate = function () {
    var LastThirtyDaysDate = new Date(nowYear, nowMonth, nowDay - 29)
    return formatDate(LastThirtyDaysDate)
  }
}
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      myvisible: false,
      modal: '',
      time: '最近7天',
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      advanced: false,
      queryParam: {
        start_time: new Getdate().getLastSevenDaysDate() + ' ' + '00:00:00',
        end_time: new Getdate().getTodayDate() + ' ' + '23:59:59'
      },
      current: 2,
      EverydayData: [{
        title: '日期',
        dataIndex: 'chatday',
        sorter: true
      }, {
        title: '接待人数',
        dataIndex: 'visiters',
        sorter: true
      }, {
        title: '消息总数',
        dataIndex: 'chats',
        sorter: true
      }, {
        title: '回复消息数',
        dataIndex: 'replys',
        sorter: false
      }, {
        title: '会话总数',
        dataIndex: 'conversation',
        sorter: true
      }, {
        title: '有效会话数',
        dataIndex: 'conversation_valid',
        sorter: true
      }, {
        title: '无效会话数',
        dataIndex: 'conversation_invalid',
        sorter: true
      }],
      CustomerServiceData: [{
        title: '客服人员',
        dataIndex: 'service_name',
        sorter: true
      }, {
        title: '接待人数',
        dataIndex: 'visiters',
        sorter: true
      }, {
        title: '消息总数',
        dataIndex: 'chats',
        sorter: true
      }, {
        title: '回复消息数',
        dataIndex: 'replys',
        sorter: false
      }, {
        title: '会话总数',
        dataIndex: 'conversation',
        sorter: true
      }, {
        title: '有效会话数',
        dataIndex: 'conversation_valid',
        sorter: true
      }, {
        title: '无效会话数',
        dataIndex: 'conversation_invalid',
        sorter: true
      },
      {
        title: '操作',
        dataIndex: 'action',
        sorter: true,
        scopedSlots: { customRender: 'action' }
      }],
      detailData: [{
        title: '日期',
        dataIndex: 'date',
        sorter: true
      }, {
        title: '接待人数',
        dataIndex: 'visiters',
        sorter: true
      }, {
        title: '消息总数',
        dataIndex: 'chats',
        sorter: true
      }, {
        title: '回复消息数',
        dataIndex: 'replys',
        sorter: false
      }, {
        title: '会话总数',
        dataIndex: 'conversation',
        sorter: true
      }, {
        title: '有效会话数',
        dataIndex: 'conversation_valid',
        sorter: true
      }, {
        title: '无效会话数',
        dataIndex: 'conversation_invalid',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    detail (record) {
      this.axios({
        url: '/chat/history/chatCount'

      }).then((res) => {
        this.modal = 'detail'
        this.myvisible = true
      })
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/chat/history/chatCount',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    refresh () {
      this.$refs.table.refresh()
    },
    onChange (dates, dateStrings) {
      this.queryParam.start_time = dateStrings[0]
      this.queryParam.end_time = dateStrings[1]
    },
    search (type) {
      const year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      let day = new Date().getDate()
      day = day < 10 ? '0' + day : day
      month = month < 10 ? '0' + month : month
      const sTime = '00:00:00'
      const eTime = '23:59:59'
      if (type === 'lastSevenDays') {
        const mydate = new Getdate()
        this.queryParam.start_time = mydate.getLastSevenDaysDate() + ' ' + sTime
        this.queryParam.end_time = year + '-' + month + '-' + day + ' ' + eTime
      } else if (type === 'LastFifteenDays') {
        const mydate1 = new Getdate()
        this.queryParam.start_time = mydate1.getLastFifteenDaysDate() + ' ' + sTime
        this.queryParam.end_time = year + '-' + month + '-' + day + ' ' + eTime
      } else if (type === 'LastThirtyDays') {
        const mydate2 = new Getdate()
        this.queryParam.start_time = mydate2.getLastThirtyDaysDate() + ' ' + sTime
        this.queryParam.end_time = year + '-' + month + '-' + day + ' ' + eTime
      }
      this.$refs.table.refresh(true)
    },
    handleExport () {
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}chat/history/chatCount?export=1`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    }
  }
}
</script>
<style scoped>
.components-input-demo-size .ant-input {
  width: 200px;
  margin: 0 8px 8px 0;
}
</style>
