<template>
  <a-card>
    <div class="table-search">
      <a-form class="normal">
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getDate"
                v-model="queryParam.searchtime"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item style="width: 450px">
              <a-space>
                <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
                <a-button @click="() => {queryParam = {searchtime: null, endtime: null, username: null}, $refs.table.refresh(true)}">重置</a-button>
                <a-button v-action:export @click="handleExport()">导出</a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <s-table
      ref="table"
      size="small"
      rowKey="ivr_id"
      :columns="columns"
      :data="loadDataTable"
    >
    </s-table>
    <div ref="main" style="height: 400px;"></div>
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
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      // 时间组件
      searchtime: null,
      mychartData: [],
      // 搜索参数
      queryParam: {
        'starttime': null,
        'endtime': null
      },
      // 表头
      columns: [ {
        title: 'IVR节点',
        dataIndex: 'ivrname',
        sorter: false
      }, {
        title: '按键次数',
        dataIndex: 'total',
        sorter: false
      }, {
        title: '百分比%',
        dataIndex: 'percent',
        sorter: false
      } ]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/ivr/allivr',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.mychartData = res.result.chart
        this.myEcharts()
        return res.result
      })
    },
    getDate (date, dateString) {
      this.queryParam.starttime = dateString[0]
      this.queryParam.endtime = dateString[1]
    },
    handleExport () {
      // let where = '1 = 1 '
      // if (this.queryParam.searchtime) {
      //   where += ' and datetime >= "' + this.queryParam.searchtime[0] + '" and datetime <= "' + this.queryParam.searchtime[1] + '"'
      // }
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/ivr/exportall?where=` + encodeURIComponent(where))
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
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
          y: 50,
          x2: 120,
          y2: 50,
          borderWidth: 1
        },
        legend: {
          orient: 'vertical',
          x: 'right',
          y: 'center',
          data: this.mychartData.data1
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          data: this.mychartData.data2
        }],
        yAxis: [{
          type: 'value'
        }],
        series: this.mychartData.data3
      }
      myChart.setOption(option)
    }
  }
}
</script>
