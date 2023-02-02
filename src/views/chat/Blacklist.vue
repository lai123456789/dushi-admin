<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="快捷菜单">
              <a-select v-model="queryParam.status" :allowClear="true">
                <a-select-option value="1" @click="() => {queryParam = {status: 1}, $refs.table.refresh(true)}">待审核</a-select-option>
                <a-select-option value="2" @click="() => {queryParam = {status: 2}, $refs.table.refresh(true)}">已生效</a-select-option>
                <a-select-option value="3" @click="() => {queryParam = {status: 3}, $refs.table.refresh(true)}">已失效</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item >
              <a-input v-model="queryParam.visiter_name" placeholder="搜索访客名称"/>
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
        :sorter="sorter" >
        <div slot="action" slot-scope="text ,record" >
          <a @click="handleRecord(record)">会话记录</a>
          <a-divider type="vertical" />
          <a @click="handleCheck(record)">审核</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>

        </div>
      </s-table>
    </a-card>
    <a-drawer
      title="审核"
      :width="800"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="快捷选择" v-bind="formItemLayout">
            <a-radio-group :value="size" @change="handleSizeChange" >
              <a-radio-button value="a" @click="search ('forever')"> 永久生效</a-radio-button>
              <a-radio-button value="b" @click="search ('threeDays')"> 3天后失效</a-radio-button>
              <a-radio-button value="c" @click="search ('sevenDays')">7天后失效</a-radio-button>
              <a-radio-button value="d" @click="search ('thirtyDays')"> 30天后失效</a-radio-button>
              <a-radio-button value="e" @click="search ('now')">立即失效</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="失效时间" v-bind="formItemLayout" >
            <a-date-picker
              inputReadOnly="true"
              :value="moment(this.data.end_time)"
              style="width: 468px;"

            />
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
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
  // 获得永久的日期
  this.getForeverDate = function () {
    var ForeverDate = new Date(nowYear, nowMonth, nowDay + 365 * 100)
    return formatDate(ForeverDate)
  }
  // 获得3天后的日期
  this.getThreeDaysDate = function () {
    var ThreeDaysDate = new Date(nowYear, nowMonth, nowDay + 3)
    return formatDate(ThreeDaysDate)
  }
  // 获得7天后的日期
  this.getSevenDaysDate = function () {
    var SevenDaysDate = new Date(nowYear, nowMonth, nowDay + 7)
    return formatDate(SevenDaysDate)
  }
  // 获得30天后的日期
  this.getThirtyDaysDate = function () {
    var ThirtyDaysDate = new Date(nowYear, nowMonth, nowDay + 30)
    return formatDate(ThirtyDaysDate)
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
      dateFormat: 'YYYY/MM/DD',
      loading: false,
      data: {},
      size: '',
      end_time: [],
      formItemLayout: {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      },
      form: this.$form.createForm(this),
      visible: false,
      advanced: false,
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      queryParam: { },
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 170,
        sorter: true,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '访客ID',
        dataIndex: 'visiter_id',
        sorter: true,
        width: 60
      }, {
        title: '访客名称',
        dataIndex: 'visiter_name',
        sorter: true
      }, {
        title: '状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'state' },
        sorter: false
      }, {
        title: '添加人',
        dataIndex: 'input_user',
        sorter: true
      }, {
        title: '添加时间',
        dataIndex: 'input_time',
        width: 150

      }, {
        title: '添加理由',
        dataIndex: 'remarks',
        sorter: true
      },
      {
        title: '审核人',
        dataIndex: 'check_user',
        sorter: true
      },
      {
        title: '生效时间',
        dataIndex: 'start_time',
        sorter: true
      }, {
        title: '失效时间',
        dataIndex: 'end_time',
        sorter: true
      }],
      sorter: { field: 'user_name', order: 'ascend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/blacklist/init',
        params: params
      }).then(res => {
        return res.result
      })
    },
    refresh () {
      this.$refs.table.refresh()
    },
    onChange (date, dateString) {
      this.data.end_time = dateString
      console.log('日期1', this.data.end_time)
      console.log(date, dateString)
      console.log('日期', dateString)
    },
    search (type) {
      if (type === 'forever') {
        const mydate = new Getdate()
        this.data.end_time = mydate.getForeverDate()
      } else if (type === 'threeDays') {
        const mydate1 = new Getdate()
        this.data.end_time = mydate1.getThreeDaysDate()
      } else if (type === 'sevenDays') {
        const mydate2 = new Getdate()
        this.data.end_time = mydate2.getSevenDaysDate()
      } else if (type === 'thirtyDays') {
        const mydate3 = new Getdate()
        this.data.end_time = mydate3.getThirtyDaysDate()
      } else if (type === 'now') {
        const mydate4 = new Getdate()
        this.data.end_time = mydate4.getTodayDate()
      }
      this.$refs.table.refresh(true)
    },

    handleSizeChange (e) {
      this.size = e.target.value
    },
    handleRecord (record) {
      this.$refs.conversationRecord.show({
        action: 'edit',
        title: '会话记录',
        url: '/chat/event/mychatdata',
        record: record
      })
    },
    handleCheck (record) {
      this.visible = true
      this.loading = true
      this.axios({
        url: '/chat/blacklist/edit',
        params: { id: record.id }
      }).then(res => {
        this.data = res.result.data
        this.loading = false
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        console.log('value', values)
        if (!errors) {
          this.loading = true
          this.axios({
            url: '/chat/blacklist/edit',
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.success(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
            }
          })
        }
      })
    },

    handleDelete (record) {
      const that = this
      const table = this.$refs.table
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/chat/blacklist/delete',
            params: { id: record.id }
          }).then(res => {
            if (res.message) {
              that.$message.success(res.message)
            } else {
              table.refresh()
            }
          })
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
