<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="getData">搜索</a-button>
            <a-button @click="() => {queryParam = {groupid:0}; getData(); search ('day'), time='今天';}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item>
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
            <a-form-item label="客户分组">
              <a-select v-model="queryParam.groupid" :allowClear="true">
                <a-select-option v-for="group in groupData" :key="group.value" :value="group.value">{{ group.display }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <div style="height: 80px; line-height: 80px; font-size: 20px">会话统计</div>
    <div style="background-color: #fff; padding: 20px;">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-card title="总会话数" :bordered="true" style="text-align: center;">
            <div style="height: 80px; font-size: 50px; text-align: center;">
              <a slot="extra" href="#">{{ data.conversation }}</a>
            </div>
            <p style="text-align: center;">客服接入率{{ data.answerPercent }}%</p>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card title="总消息数" :bordered="true" style="text-align: center;">
            <div style="height: 80px; font-size: 50px; text-align: center;">
              <a slot="extra" href="#">{{ data.chats }}</a>
            </div>
            <p>答问比{{ data.qa }}%</p>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card title="平均会话时长" :bordered="true" style="text-align: center;">
            <div style="height: 80px; font-size: 50px; text-align: center;">
              <a slot="extra" href="#">{{ data.averagecCnversationTime }}</a>
            </div>
            <p>平均首次响应时长{{ data.averageFirstAnswerTime }}秒</p>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card title="排队数" :bordered="true" style="text-align: center;">
            <div style="height: 80px; font-size: 50px; text-align: center;">
              <a slot="extra" href="#">{{ data.waitNumber }}</a>
            </div>
            <p>平均排队时长{{ data.averageWaitTime }}秒</p>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card title="未接入会话数" :bordered="true" style="text-align: center;">
            <div style="height: 80px; font-size: 50px; text-align: center;">
              <a slot="extra" href="#">0</a>
            </div>
            <p>平均放弃时长{{ data.averageAbandonTime }}秒</p>
          </a-card>
        </a-col>
        <a-col :span="4">
          <a-card title="满意率" :bordered="true" style="text-align: center;">
            <div style="height: 80px; font-size: 50px; text-align: center;">
              <a slot="extra" href="#">{{ data.commentSatisfiedPercent }}%</a>
            </div>
            <p>参评率{{ data.commentPercent }}%</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <div ref="main" style="height: 400px;"></div>
  </div>
</template>
<script>
import echarts from 'echarts'
const Getdate = function () {
  const now = new Date() // 当前日期
  const nowDayOfWeek = now.getDay() // 今天本周的第几天
  const nowDay = now.getDate() // 当前日
  const nowMonth = now.getMonth() // 当前月
  let nowYear = now.getYear() // 当前年
  nowYear += (nowYear < 2000) ? 1900 : 0
  // 格式化日期：yyyy-MM-dd
  function formatDate (date) {
    const myyear = date.getFullYear()
    let mymonth = date.getMonth() + 1
    let myweekday = date.getDate()
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
    const monthStartDate = new Date(nowYear, myMonth, 1)
    const monthEndDate = new Date(nowYear, myMonth + 1, 1)
    const days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24)
    return days
  }
  // 获得今天的日期
  this.getTodayDate = function () {
    const todayStartDate = new Date(nowYear, nowMonth, nowDay)
    return formatDate(todayStartDate)
  }
  // 获得昨天的日期
  this.getYesterdayDate = function () {
    const yesterdayStartDate = new Date(nowYear, nowMonth, nowDay - 1)
    return formatDate(yesterdayStartDate)
  }
  // 获得本周的开端日期
  this.getWeekStartDate = function () {
    let weekStartDate
    if (nowDayOfWeek === 0) {
      weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1 - 7)
    } else {
      weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1)
    }
    return formatDate(weekStartDate)
  }
  // 获得本周的停止日期
  this.getWeekEndDate = function () {
    let weekEndDate
    if (nowDayOfWeek === 0) {
      weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek) + 1 - 7)
    } else {
      weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek) + 1)
    }
    return formatDate(weekEndDate)
  }
  // 获得本月的开端日期
  this.getMonthStartDate = function () {
    const monthStartDate = new Date(nowYear, nowMonth, 1)
    return formatDate(monthStartDate)
  }
  // 获得本月的停止日期
  this.getMonthEndDate = function () {
    const monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth))
    return formatDate(monthEndDate)
  }
}
export default {
  data () {
    return {
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
      queryParam: {
        start_time: new Getdate().getTodayDate() + ' ' + '00:00:00',
        end_time: new Getdate().getTodayDate() + ' ' + '23:59:59'
      },
      groupData: [],
      myChart: '',
      data: {
        abandonNumber: '',
        answerPercent: '',
        averageAbandonTime: '',
        averageFirstAnswerTime: '',
        averageWaitTime: '',
        averagecCnversationTime: '',
        chats: '',
        commentPercent: '',
        commentSatisfiedPercent: '',
        conversation: '',
        waitNumber: '',
        qa: '',
        groupid: '',
        chartData1: [],
        chartData2: [],
        chartData3: [],
        chartData4: []
      }
    }
  },
  mounted () {
    this.getGroupList()
    this.getData()
    this.myChart = echarts.init(this.$refs.main)
  },
  methods: {
    getData () {
      this.axios({
        url: '/chat/history/report',
        params: this.queryParam
      }).then(res => {
        this.data = res.result.data
        this.myEcharts()
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
      this.getData()
    },
    // 获取客服分组
    getGroupList () {
      this.axios({
        url: '/chat/history/groupList'
      }).then(res => {
        this.groupData = res.result.data
      })
    },
    onChange (dates, dateStrings) {
      this.queryParam.start_time = dateStrings[0]
      this.queryParam.end_time = dateStrings[1]
    },
    myEcharts () {
      const option = {
        title: {
          text: '会话分布',
          top: 10
        },
        grid: {
          left: 20,
          right: 30,
          top: 60,
          bottom: 10,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 20,
          data: ['会话总数', '已接入会话数', '未接入会话数', '排队数']
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['0时', '1时', '2时', '3时', '4时', '5时', '6时', '7时', '8时', '9时', '10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时', '20时', '21时', '22时', '23时']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '会话总数',
          data: this.data.chartData1,
          type: 'line'
        }, {
          name: '已接入会话数',
          data: this.data.chartData2,
          type: 'line'
        }, {
          name: '未接入会话数',
          data: this.data.chartData3,
          type: 'line'
        }, {
          name: '排队数',
          data: this.data.chartData4,
          type: 'line'
        }]
      }
      this.myChart.setOption(option)
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
