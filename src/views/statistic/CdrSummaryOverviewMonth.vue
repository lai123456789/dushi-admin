<template>
  <a-card>
    <a-form class="search" layout="inline">
      <a-form-item label="呼叫时间">
        <a-select v-model="queryParam.searchmonth" initValue>
          <a-select-option v-for="(value, key) in year_list" :key="key" :value="value">{{ value }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)" v-show="!visible">搜索</a-button>
      <a-button @click="() => {queryParam = {};date = null; $refs.table.refresh(true)}" v-show="!visible">重置</a-button>
      <a-button v-action:export @click="handleExport()" v-show="!visible">导出</a-button>
      <a-button @click="handlerGetDayData()" v-show="!visible">生成今日数据</a-button>
      <a-button @click="showDrawer">{{ visible ? '关闭' : '图表展示' }}</a-button>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="date"
      :columns="columns"
      :data="loadDataTable"
      v-show="!visible"
    >
    </s-table>
    <div v-show="visible" ref="main" style="height: 400px;"></div>
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
import echarts from 'echarts'
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      visible: false,
      placement: 'top',
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      flag: 0,
      // 搜索参数
      queryParam: {
        'searchmonth': null
      },
      year_list: [],
      mychartData: [],
      // 表头
      columns: [{
        title: '呼叫总量',
        dataIndex: 'total'
      }, {
        title: '呼入百分比(%)',
        dataIndex: 'inbound_percent'
      }, {
        title: '呼出百分比(%)',
        dataIndex: 'outbound_percent'
      }, {
        title: '呼入',
        children: [ {
          title: '呼入总量',
          dataIndex: 'inbound_total'
        }, {
          title: '坐席接通量',
          dataIndex: 'inbound_answered'
        }, {
          title: '坐席振铃未接量',
          dataIndex: 'inbound_unanswered'
        }, {
          title: '其他',
          dataIndex: 'inbound_other'
        } ]
      }, {
        title: '呼出',
        children: [ {
          title: '呼出总量',
          dataIndex: 'outbound_total'
        }, {
          title: '呼出接通量',
          dataIndex: 'outbound_answered'
        }, {
          title: '呼出未接量',
          dataIndex: 'outbound_unanswered'
        } ]
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/CdrSummary/overviewMonth',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.timefieldheader = res.result.timefieldheader
        this.year_list = res.result.year_list
        this.queryParam.searchmonth = this.year_list[0]
        if (this.flag === 0) {
          this.columns.unshift(this.timefieldheader)
          this.flag++
        }
        this.mychartData = res.result.chart_data
        return res.result
      })
    },
    handleExport () {
      // let where = '1 = 1 '
      // const sTime = '-01-01 00:00:00'
      // const eTime = '-12-31 23:59:59'
      // const myyear = this.queryParam.searchmonth.substr(0, this.queryParam.searchmonth.length - 1)
      // console.log(myyear)
      // where += ' and calldate >= "' + myyear + sTime + '" and calldate <= "' + myyear + eTime + '"'
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/CdrSummary/overviewExport?where=` + encodeURIComponent(where) + '&action=overview_month')
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    showDrawer () {
      this.visible = !this.visible
      setTimeout(() => {
        this.myEcharts()
      }, 100)
    },
    onClose () {
      this.visible = false
    },
    onChange (e) {
      this.placement = e.target.value
    },
    handlerGetDayData (parameter) {
      const time = new Date().toLocaleTimeString()
      const me = this
      me.$confirm({
        title: '确认生成今日上午 00:00 至 ' + time + ' 点前的数据？',
        onOk () {
          me.axios({
            url: '/statistic/Api/dataAnalsys/?today=1'
          }).then((res) => {
            me.$message.info('操作成功')
            me.$refs.table.refresh()
          })
        }
      })
    },
    myEcharts () {
      const myChart = echarts.init(this.$refs.main)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          x: 50,
          y: 80,
          x2: 50,
          y2: 50,
          borderWidth: 1
        },
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: '30',
          data: this.mychartData.legend
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          data: this.mychartData.xAxis
        }],
        yAxis: [{
          type: 'value'
        }],
        series: this.mychartData.series
      }
      myChart.setOption(option)
    }
  }
}
</script>
<style scoped>
.search{
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.search button{
  margin-right: 8px;
}
</style>
