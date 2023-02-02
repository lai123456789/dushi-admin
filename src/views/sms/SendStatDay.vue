<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <span class="button">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {monthDate = '',queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
            <a-button v-action:export_stat icon="download" @click="handleExport()">导出</a-button>
          </span>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="月份">
              <a-month-picker @change="getMonth" :allowClear="false" v-model="monthDate" style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <s-table
        ref="table"
        size="small"
        :rowKey="(record) => record.id"
        :columns="columns"
        :data="loadData"
        :rowSelection="rowSelection"
        :sorter="sorter"
      >
      </s-table>
    </a-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      advanced: false,
      // 搜索参数
      monthDate: '',
      queryParam: {},
      // 表头
      columns: [{
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '日期',
        dataIndex: 'date',
        sorter: true
      }, {
        title: '总计数',
        dataIndex: 'count',
        sorter: true
      }, {
        title: '单价',
        dataIndex: 'unitprice',
        sorter: true
      }, {
        title: '总费用',
        dataIndex: 'total',
        sorter: true
      }],
      selectedRowKeys: [],
      rowSelection: {
        selectedRowKeys: this.selectedRowKeys,
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
    this.setMonthDate()
  },
  watch: {
    monthDate: function (val) {
      if (!val) {
        this.setMonthDate()
      }
    }
  },
  methods: {
    // 月份选择器初始化
    setMonthDate () {
      var day = new Date()
      var year = day.getFullYear()
      var month = day.getMonth() + 1
      month = month < 10 ? '0' + month : month
      this.monthDate = this.moment(year + '-' + month, 'YYYY-MM')
    },
    loadData (parameter) {
      var me = this
      return me.axios({
        url: '/sms/send/statDay',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        me.queryParam.monthDate = res.result.monthDate
        return res.result
      })
    },
    getMonth (date, dateString) {
      this.queryParam.monthDate = dateString
    },
    handleExport () {
      var me = this
      this.$confirm({
        title: '您确认要导出' + me.queryParam.monthDate + '账单吗?',
        onOk () {
          window.open(`${process.env.VUE_APP_API_BASE_URL}sms/send/exportDay/?monthDate=${me.queryParam.monthDate}`)
        }
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
