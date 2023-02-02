<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {status:'0', isvalid: '', groupid: 0, comment: ''}; search ('day'), time='今天', $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="来访时间">
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
            <a-form-item label="访客名称">
              <a-input v-model="queryParam.visiter_name" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <s-table
        ref="table"
        size="small"
        rowKey="vid"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <div slot="action" slot-scope="text, record" >
          <a v-if="addWhitelist" @click="Whitelist(record)">加入白名单</a>
          <a v-else @click="Whitelist(record)">取消白名单</a>
          <a-divider type="vertical" />
          <a @click="handleRecord(record)">会话记录</a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">编辑</a>
        </div>
      </s-table>
    </a-card>
    <!-- 历史访客编辑 -->
    <a-drawer
      :title="title"
      :width="600"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="客户姓名" v-bind="formItemLayout">
            <a-input v-decorator="['info[customer_name]', {initialValue: this.data.customer_name,rules: [{ required: true, message: '请输入客户姓名'}]}]" />
          </a-form-item>
          <a-form-item label="客户电话" v-bind="formItemLayout">
            <a-input v-decorator="['info[customer_tel]', {initialValue:this.data.customer_tel,rules: [{ required: true, message: '请输入客户电话'}] }]" />
          </a-form-item>
          <a-form-item label="备注" v-bind="formItemLayout">
            <a-textarea :autoSize="{ minRows: 2, maxRows: 8 }" v-decorator="['info[remarks]', {initialValue:this.data.remarks,rules: [{ required: true, message: '请输入备注'}]}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visible=!visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
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
  // 获得昨天的日期
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
      defaultFileList: [
        {
          uid: '1',
          name: 'xxx.png',
          status: 'done',
          response: 'Server Error 500', // custom error message to show
          url: 'http://www.baidu.com/xxx.png'
        },
        {
          uid: '2',
          name: 'yyy.png',
          status: 'done',
          url: 'http://www.baidu.com/yyy.png'
        },
        {
          uid: '3',
          name: 'zzz.png',
          status: 'error',
          response: 'Server Error 500', // custom error message to show
          url: 'http://www.baidu.com/zzz.png'
        }
      ],
      data: [],
      addWhitelist: true,
      formItemLayout: {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      },
      form: this.$form.createForm(this),
      loading: false,
      visible: false,
      title: '',
      modal: '',
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
      columns: [{
        title: '白名单用户',
        dataIndex: 'white_list',
        sorter: true
      }, {
        title: '来访时间',
        dataIndex: 'timestamp',
        sorter: true
      }, {
        title: '访客名称',
        dataIndex: 'visiter_name',
        sorter: true
      },
      {
        title: '客户姓名',
        dataIndex: 'customer_name',
        sorter: true
      },
      {
        title: '客户电话',
        dataIndex: 'customer_tel',
        sorter: true
      }, {
        title: '消息总数',
        dataIndex: 'chats_all',
        sorter: false
      }, {
        title: '访客消息数',
        dataIndex: 'chats_visiter',
        sorter: true
      }, {
        title: '客服消息数',
        dataIndex: 'chats_service'

      }, {
        title: '备注',
        dataIndex: 'remarks'

      }, {
        title: '操作',
        dataIndex: 'action',
        sorter: true,
        width: 200,
        scopedSlots: { customRender: 'action' }
      }],
      sorter: { field: 'timestamp', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/history/visiterData',
        params: params
      }).then(res => {
        return res.result
      })
    },
    Whitelist (record) {
      // this.$message.info('ddddddddddddddddddddd' + record.vid)
      this.axios({
        url: '/chat/history/visiterWhileList',
        params: { vid: record.vid }
      }).then((res) => {
        this.addWhitelist = !this.addWhitelist
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
    handleRecord (record) {
      this.$refs.conversationRecord.show({
        action: 'edit',
        title: '会话记录：' + record.visiter_name,
        url: '/chat/event/mychatdata',
        record: record
      })
    },
    handleEdit (record) {
      this.visible = true
      this.title = '会话记录：' + record.visiter_name
      this.loading = true
      this.axios({
        url: '/chat/history/visiterEdit',
        params: { vid: record.vid }
      }).then((res) => {
        this.data = res.result.data
        this.loading = false
      })
    },
    handleSubmit () {
      // const { form: { validateFields } } = this
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: '/chat/history/visiterEdit',
            data: Object.assign(values, { vid: this.data.vid })
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$refs.table.refresh()
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
            }
          })
        } else {
          console.log(errors)
        }
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
