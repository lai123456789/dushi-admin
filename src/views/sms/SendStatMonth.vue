<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <span class="button">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {year: years[0]}, $refs.table.refresh(true)}">重置</a-button>
            <a-button v-action:export_stat icon="download" @click="handleExport()">导出</a-button>
          </span>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="年份">
              <a-select v-model="queryParam.year">
                <a-select-option v-for="(value, key) in years" :key="key" :value="value">
                  {{ value }}
                </a-select-option>
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
        :rowKey="(record) => record.month"
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
      years: [],
      // 搜索参数
      queryParam: {
        year: ''
      },
      // 表头
      columns: [{
        title: '月份',
        dataIndex: 'month',
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
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      colLayout: {},
      sorter: { field: 'month', order: 'ascend' }
    }
  },
  created () {
    this.changeAdvanced(false)
    this.axios({
      url: '/sms/send/getYearCombox'
    }).then(res => {
      this.years = res.result
      this.queryParam.year = this.years[0]
    })
  },
  methods: {
    loadData (parameter) {
      return this.axios({
        url: '/sms/send/statMonth',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleExport () {
      var me = this
      this.$confirm({
        title: '您确认要导出' + me.queryParam.year + '年账单吗?',
        onOk () {
          window.open(`${process.env.VUE_APP_API_BASE_URL}sms/send/exportMonth/?year=${me.queryParam.year}`)
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
