<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space>
            <a-button icon="search" type="primary" @click="qcSearch" @keyup.enter="qcSearch">搜索</a-button>
            <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="部门">
              <a-select :allowClear="true" show-search v-model.trim="queryParam.department">
                <a-select-option v-for="(item, key) in department" :key="key + 'item'" :value="item.value">{{ item.display }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="质检员">
              <a-select :allowClear="true" show-search v-model.trim="queryParam.quality_agent">
                <a-select-option v-for="(item, key) in quality_agent" :key="key" :value="item.value">{{ item.display }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="9">
            <a-form-item label="评分时间">
              <a-range-picker showTime @change="getSearchDate" v-model="searchDate" style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button icon="download" @click="handleExport()">导出</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
      </s-table>
    </a-card>
    <general-export ref="generalExport" />
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
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      advanced: false,
      loading: false,
      searchDate: null,
      // 搜索参数
      queryParam: {
        department: undefined,
        quality_agent: undefined
      },
      department: [],
      quality_agent: [],
      config: {
        data: {}
      },
      // 表头
      columns: [{
        title: '部门',
        dataIndex: 'department_name',
        sorter: true
      }, {
        title: '质检人员',
        dataIndex: 'quality_agent',
        sorter: true
      }, {
        title: '已质检总数',
        dataIndex: 'quality_number',
        sorter: true
      }, {
        title: '合格数',
        dataIndex: 'pass_number',
        sorter: true
      }, {
        title: '不合格数',
        dataIndex: 'nopass_number',
        sorter: true
      }, {
        title: '无效数',
        dataIndex: 'invalid_number',
        sorter: true
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  mounted () {
    this.gettime()
    this.getDepartment()
    this.getUserName()
  },
  methods: {
    // 数据渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/quality/statistics/quality',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['id'] = i
        }
        return res.result
      })
    },
    // 获取用户信息
    getUserName () {
      return this.axios({
        url: '/quality/data/getUsername',
        params: {}
      }).then(res => {
        this.quality_agent = res.result.data
        return res.result
      })
    },
    // 搜索
    qcSearch () {
      const table = this.$refs.table
      table.refresh()
    },
    // 获取部门
    getDepartment () {
      return this.axios({
        url: '/quality/statistics/getDepartment',
        params: {}
      }).then(res => {
        this.department = res.result.data
      })
    },
    // 导出
    handleExport () {
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open = `${process.env.VUE_APP_API_BASE_URL}admin/user/export?where=1=1`
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    // 时间搜索信息
    getSearchDate (date, dateString) {
      this.queryParam.begin_time = dateString[0]
      this.queryParam.end_time = dateString[1]
    },
    // 获取当前月1日至今时间
    gettime () {
      const sTime = '00:00:00'
      const eTime = '23:59:59'
      var yestime = new Date()
      yestime.setTime(yestime.getTime())
      var yesterday = yestime.getFullYear() + '-' + (yestime.getMonth() + 1) + '-' + yestime.getDate()
      this.begin_time = yesterday + ' ' + sTime
      const mydate2 = new Getdate()
      this.begin_time = mydate2.getMonthStartDate() + ' ' + sTime
      this.end_time = yesterday + ' ' + eTime
      this.searchDate = [this.begin_time ? this.moment(this.begin_time, 'YYYY-MM-DD HH:mm:ss') : '', this.end_time ? this.moment(this.end_time, 'YYYY-MM-DD HH:mm:ss') : '']
    }
  }
}
</script>
