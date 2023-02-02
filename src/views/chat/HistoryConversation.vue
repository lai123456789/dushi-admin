<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {status:'0',isvalid: '',groupid: 0,comment: ''}; search ('day'), time='今天', $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="访客进线时间">
              <a-range-picker
                :ranges="{
                  昨天: [moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day')],
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                style="width: 100%"
                :value="queryParam.start_time ? [moment(queryParam.start_time), moment(queryParam.end_time)] : []"
                show-time
                @change="onChange"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="接待客服">
              <a-input v-model="queryParam.user_name" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="访客名称">
              <a-input v-model="queryParam.visiter_name" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="客服分组">
              <a-select v-model="queryParam.groupid" :allowClear="true">
                <a-select-option v-for="(group, key) in groupData" :key="key" :value="group.value">{{ group.display }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="会话状态">
              <a-select v-model="queryParam.status" :allowClear="true">
                <a-select-option value="1">已接待</a-select-option>
                <a-select-option value="2">未接待</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="有效会话">
              <a-select v-model="queryParam.isvalid" :allowClear="true">
                <a-select-option value="1">是</a-select-option>
                <a-select-option value="2">否</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="满意度">
              <a-select v-model="queryParam.comment" :allowClear="true">
                <a-select-option value="1">满意</a-select-option>
                <a-select-option value="2">一般</a-select-option>
                <a-select-option value="3">不满意</a-select-option>
                <a-select-option value="0">未评价</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <div slot="action" slot-scope="text, record" >
          <a @click="handleRecord(record)">会话记录</a>
        </div>
      </s-table>
    </a-card>
    <conversationRecord ref="conversationRecord"/>
  </div>
</template>
<script>
var Getdate = function () {
  var now = new Date() // 当前日期
  var nowDayOfWeek = now.getDay() // 今天本周的第几天
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
  // 获得某月的天数
  function getMonthDays (myMonth) {
    var monthStartDate = new Date(nowYear, myMonth, 1)
    var monthEndDate = new Date(nowYear, myMonth + 1, 1)
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24)
    return days
  }
  // 获得今天的日期
  this.getTodayDate = function () {
    var todayStartDate = new Date(nowYear, nowMonth, nowDay)
    return formatDate(todayStartDate)
  }
  // 获得昨天的开端日期
  this.getYesterdayDate = function () {
    var yesterdayStartDate = new Date(nowYear, nowMonth, nowDay - 1)
    return formatDate(yesterdayStartDate)
  }
  // 获得本周的开端日期
  this.getWeekStartDate = function () {
    var weekStartDate
    if (nowDayOfWeek === 0) {
      weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1 - 7)
    } else {
      weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1)
    }
    return formatDate(weekStartDate)
  }
  // 获得本周的停止日期
  this.getWeekEndDate = function () {
    var weekEndDate
    if (nowDayOfWeek === 0) {
      weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek) + 1 - 7)
    } else {
      weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek) + 1)
    }
    return formatDate(weekEndDate)
  }
  // 获得本月的开端日期
  this.getMonthStartDate = function () {
    var monthStartDate = new Date(nowYear, nowMonth, 1)
    return formatDate(monthStartDate)
  }
  // 获得本月的停止日期
  this.getMonthEndDate = function () {
    var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth))
    return formatDate(monthEndDate)
  }
}
export default {
  components: {
    ConversationRecord: () => import('./ConversationRecord')
  },
  data () {
    return {
      form: this.$form.createForm(this),
      loading: false,
      modal: '',
      myvisible: false,
      advanced: false,
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      time: '今天',
      groupData: [],
      groupid: '',
      queryParam: {
        start_time: new Getdate().getTodayDate() + ' ' + '00:00:00',
        end_time: new Getdate().getTodayDate() + ' ' + '23:59:59'
      },
      current: 2,
      columns: [{
        title: '访客进线时间',
        dataIndex: 'start_time',
        sorter: true
      }, {
        title: '访客名称',
        dataIndex: 'visiter_name',
        sorter: true
      }, {
        title: '接待客服',
        dataIndex: 'user_name',
        sorter: true
      }, {
        title: '客服分组',
        dataIndex: 'groupname',
        sorter: false
      }, {
        title: '会话时长',
        dataIndex: 'total_time',
        sorter: true
      }, {
        title: '消息总数',
        dataIndex: 'message_all',
        sorter: true
      }, {
        title: '访客消息数',
        dataIndex: 'message_vister',
        sorter: true
      },
      {
        title: '客服消息数',
        dataIndex: 'message_service',
        sorter: true
      },
      {
        title: '接待状态',
        dataIndex: 'status',
        sorter: true
      },
      {
        title: '会话状态',
        dataIndex: 'isvalid',
        sorter: true
      },
      {
        title: '结束原因',
        dataIndex: 'end_type',
        sorter: true
      },
      {
        title: '满意度',
        dataIndex: 'comment',
        sorter: true
      },
      {
        title: '操作',
        dataIndex: 'action',
        sorter: true,
        scopedSlots: { customRender: 'action' }
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  created () {
    this.changeAdvanced(false)
    this.getGroupList()
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/chat/history/conversation',
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
    handleRecord (record) {
      this.$refs.conversationRecord.show({
        action: 'edit',
        title: '会话记录',
        url: '/chat/event/mychatdata',
        record: record
      })
    },
    search (type) {
      const year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      let day = new Date().getDate()
      day = day < 10 ? '0' + day : day
      month = month < 10 ? '0' + month : month
      const sTime = '00:00:00'
      const eTime = '23:59:59'
      if (type === 'day') {
        this.queryParam.start_time = year + '-' + month + '-' + day + ' ' + sTime
        this.queryParam.end_time = year + '-' + month + '-' + day + ' ' + eTime
      } else if (type === 'yesterday') {
        const mydate1 = new Getdate()
        this.queryParam.start_time = mydate1.getYesterdayDate() + ' ' + sTime
        this.queryParam.end_time = mydate1.getYesterdayDate() + ' ' + eTime
      } else if (type === 'week') {
        const mydate = new Getdate()
        this.queryParam.start_time = mydate.getWeekStartDate() + ' ' + sTime
        this.queryParam.end_time = mydate.getWeekEndDate() + ' ' + eTime
      } else if (type === 'month') {
        const mydate2 = new Getdate()
        this.queryParam.start_time = mydate2.getMonthStartDate() + ' ' + sTime
        this.queryParam.end_time = mydate2.getMonthEndDate() + ' ' + eTime
      } else if (type === 'all') {
        this.queryParam.start_time = ''
        this.queryParam.end_time = ''
      }
      this.$refs.table.refresh(true)
    },
    // 获取客服分组
    getGroupList () {
      return this.axios({
        url: '/chat/history/groupList'
      }).then(res => {
        this.groupData = res.result
        return res.result
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
<style scoped>
.components-input-demo-size .ant-input {
  width: 200px;
  margin: 0 8px 8px 0;
}
</style>
