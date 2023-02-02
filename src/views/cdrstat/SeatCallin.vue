<template>
  <a-spin :spinning="loading">
    <!-- 报表信息 -->
    <a-table
      rowKey="id"
      :columns="infoColumns"
      :data-source="dataSource"
      size="small"
      :pagination="false" >
      <template slot="title" >
        <div style="font-weight: bold; font-size: 16px;">报表信息</div>
      </template>
    </a-table>
    <a-table
      style="margin-top: 16px"
      rowKey="extension"
      :columns="columns"
      :data-source="calloutData"
      :expandedRowKeys="expandedRowKeys"
      @expand="onExpand"
      size="small"
      :pagination="false"
    >
      <template slot="title" >
        <div style="font-weight: bold; font-size: 16px;">
          呼入通话
          <a-button @click="downloadAll" icon="download" size="small" style="margin-left: 20px;" type="primary">导出数据</a-button>
        </div>
      </template>
      <template slot="exportDetail" slot-scope="text, record">
        <a href="#" @click="download(record)">导出</a>
      </template>
      <s-table
        slot="expandedRowRender"
        slot-scope="text"
        v-if="expandKey === text.extension && currentKey === 'callIn'"
        size="small"
        rowKey="row"
        :columns="childColumns"
        :data="loadDataDetail"
        :sorter="{ field: 'calldate', order: 'descend' }" >
        <template slot="action" slot-scope="text1, recd">
          <a href="#" @click="handlePlay(recd)" style="margin-right: 10px;">
            <a-icon type="play-circle" />
          </a>
          <a href="#" @click="handleDownload(recd)" style="margin-right: 10px;">
            <a-icon type="download" />
          </a>
        </template>
      </s-table>
    </a-table>
    <!-- 图表展示 -->
    <div ref="top" style="height: 500px; margin-top: 20px;"></div>
    <div ref="middle" style="height: 500px; margin-top: 20px;"></div>
    <div ref="bottom" style="height: 500px; margin-top: 20px;"></div>
    <general-export ref="generalExport" />
  </a-spin>
</template>
<script>
import echarts from 'echarts'
import { mapGetters } from 'vuex'
export default {
  props: {
    searchData: {
      type: Object,
      default: () => {}
    },
    users: {
      type: Array,
      default: () => {
        return []
      }
    },
    currentKey: {
      type: String,
      default: ''
    }
  },
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      loading: false,
      loadFlag: true,
      seatSearch: {},
      params: {},
      extension: [],
      infoColumns: [
        { title: '开始时间', dataIndex: 'start_parts' },
        { title: '结束时间', dataIndex: 'end_parts' },
        { title: '搜索时间段', dataIndex: 'period', customRender: text => text + '天' },
        { title: '总呼叫数', dataIndex: 'total_calls' },
        { title: '总接通数', dataIndex: 'total_nomissed' },
        { title: '总接通百分比', dataIndex: 'percent_total_nomissed' },
        { title: '总未接数', dataIndex: 'total_missed' },
        { title: '总时长', dataIndex: 'total_bill_print' },
        { title: '平均振铃时间', dataIndex: 'avg_ring_full' }
      ],
      columns: [
        { title: '座席', dataIndex: 'agentname' },
        { title: '总计', dataIndex: 'calls' },
        { title: '接通', dataIndex: 'nomissed' },
        { title: '接通百分比', dataIndex: 'percent_nomissed' },
        { title: '未接', dataIndex: 'missed' },
        { title: '通话时长', dataIndex: 'bill_print' },
        { title: '通话时长百分比', dataIndex: 'total_bill' },
        { title: '平均通话时长', dataIndex: 'avg_duration_print' },
        { title: '总振铃时长', dataIndex: 'ring_time' },
        { title: '平均振铃时长', dataIndex: 'avg_ring_time' },
        { title: '导出详细', dataIndex: 'exportDetail', scopedSlots: { customRender: 'exportDetail' } }
      ],
      childColumns: [
        { title: '序号', dataIndex: 'row', width: 80 },
        { title: '呼叫时间', dataIndex: 'calldate' },
        { title: '主叫', dataIndex: 'src' },
        { title: '被叫', dataIndex: 'dst' },
        { title: '计费时长', dataIndex: 'billsec' },
        { title: '振铃时长', dataIndex: 'ringtime' },
        { title: '呼叫结果', dataIndex: 'disposition' },
        { title: '操作', dataIndex: 'action', scopedSlots: { customRender: 'action' } }
      ],
      dataSource: [],
      calloutData: [],
      // s-table搜索参数
      queryParam: { },
      expandKey: '',
      expandedRowKeys: [],
      audioUrl: ''
    }
  },
  watch: {
    searchData: {
      handler () {
        this.loadFlag = true
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    init () {
      if (this.loadFlag) {
        const extension = []
        const selectUsers = this.searchData.seat
        const seatSearch = localStorage.seatSearch ? JSON.parse(localStorage.seatSearch) : {}
        this.seatSearch = seatSearch
        const params = {
          startTime: seatSearch.startTime,
          endTime: seatSearch.endTime,
          noInternal: seatSearch.filtration ? 1 : 0,
          typeReport: 'incoming'
        }
        this.params = params
        this.users.forEach(item => {
          if (selectUsers.indexOf(item.nodedata) !== -1) {
            extension.push(item.node.extension)
          }
        })
        this.extension = extension
        this.loading = true
        this.axios({
          url: '/cdrstat/Index/report',
          data: { extension: extension },
          params
        }).then(res => {
          this.loading = false
          const obj = { id: 0, avg_ring_full: '', end_parts: '', period: '', start_parts: '', total_bill_print: '', total_calls: '', total_nomissed: '', percent_total_nomissed: '', total_missed: '' }
          for (const key in obj) {
            if (key !== 'id') {
              obj[key] = res.result.data[key]
            }
          }
          this.dataSource = [obj]
          this.calloutData = res.result.data.extensionData
          let chartData = this.calloutData.map(item => {
            const arr = []
            arr[0] = item.agentname
            arr[1] = item.nomissed
            arr[2] = item.missed
            return arr
          })
          chartData = [['product', '接听', '未接'], ...chartData]
          this.initCharts(chartData)
          // this.loadFlag = false
        })
      }
    },
    loadData (parameter) {
      return this.axios({
        url: '/cdrstat/Index/report',
        data: { extension: this.extension },
        params: Object.assign(this.params, parameter)
      }).then(res => {
        return res.result.data.extensionData
      })
    },
    onExpand (expanded, record) {
      if (expanded === true) {
        this.queryParam = { channel: record.channel }
        this.expandKey = record.extension
        this.expandedRowKeys = [record.extension]
      } else {
        this.expandedRowKeys = []
      }
    },
    // 初始化子表格数据
    loadDataDetail (parameter) {
      return this.axios({
        params: Object.assign(parameter, this.params, this.queryParam),
        url: '/cdrstat/Index/reportDetail'
      }).then((res) => {
        return res.result
      })
    },
    downloadAll () {
      const params = {
        startTime: this.seatSearch.startTime,
        endTime: this.seatSearch.endTime,
        noInternal: this.seatSearch.filtration ? 1 : 0,
        typeReport: 'incoming',
        sortField: 'calldate',
        sortOrder: 'ascend',
        export: 1,
        extension: this.extension
      }
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'reportExport',
        controller: 'cdrstat/Index',
        method: 'reportExport',
        parameter: params // 新增
      })
    },
    // 导出
    download (record) {
      const params = {
        startTime: this.seatSearch.startTime,
        endTime: this.seatSearch.endTime,
        noInternal: this.seatSearch.filtration ? 1 : 0,
        typeReport: 'incoming',
        sortField: 'calldate',
        sortOrder: 'ascend',
        export: 1,
        extension: this.extension,
        channel: record.channel
      }
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'reportDetailExport',
        controller: 'cdrstat/Index',
        method: 'reportDetailExport',
        parameter: params // 新增
      })
    },
    urlEncode (param, key, encode) {
      if (param == null) return ''
      var paramStr = ''
      var t = typeof (param)
      if (t === 'string' || t === 'number' || t === 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param)
      } else {
        for (var i in param) {
          var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
          paramStr += this.urlEncode(param[i], k, encode)
        }
      }
      return paramStr
    },
    // 录音播放
    handlePlay (record) {
      const url = this.setting.interfaceurl + '/sdk/index/record/?type=download&file=' + record.recordfile
      this.$setSetting({ audioPlayData: { visible: true, sourceUrl: url } })
    },
    handleDownload (record) {
      const url = this.setting.interfaceurl + '/sdk/index/record/?type=download&file=' + record.recordfile
      window.open(url)
    },
    // 初始化图表数据
    initCharts () {
      // 第一个图
      let chartData = this.calloutData.map(item => {
        const arr = []
        arr[0] = item.agentname
        arr[1] = item.nomissed
        arr[2] = item.missed
        return arr
      })
      chartData = [['product', '接听', '未接'], ...chartData]
      const option = {
        grid: { left: '10px', right: '10px', bottom: '10px', containLabel: true },
        color: ['#67DC00', '#C52518'],
        title: { text: '呼入接听数与未接数对比图' },
        toolbox: { show: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        dataset: {
          source: chartData
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              formatter: '{@接听}',
              fontSize: 16,
              position: 'top',
              rich: {
                name: {
                  textBorderColor: '#fff'
                }
              }
            }
          },
          {
            type: 'bar',
            label: {
              show: true,
              formatter: '{@未接}',
              fontSize: 16,
              position: 'top',
              rich: {
                name: {
                  textBorderColor: '#fff'
                }
              }
            }
          }
        ]
      }
      const chartsTop = echarts.init(this.$refs.top)
      chartsTop.setOption(option)
      // 第二个图
      const xData = []
      const yData = []
      const bottomY = [] // 第三个图的Y轴数据
      this.calloutData.forEach(item => {
        xData.push(item.agentname)
        item.bill_print = this.getMin(item.bill_print)
        yData.push(item.bill_print)
        bottomY.push(item.calls)
      })
      const optionMiddle = {
        color: ['#3398DB'],
        title: { text: '座席总呼叫时长统计图（单位：分）' },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: { left: '10px', right: '10px', bottom: '10px', containLabel: true },
        xAxis: [ {
          type: 'category',
          data: xData,
          axisTick: { alignWithLabel: true }
        } ],
        yAxis: [ { type: 'value' } ],
        series: [ {
          type: 'bar',
          barWidth: '60%',
          data: yData,
          label: {
            show: true,
            formatter: '{c}',
            fontSize: 16,
            position: 'top',
            rich: {
              name: {
                textBorderColor: '#fff'
              }
            }
          }
        } ]
      }
      const chartsMiddle = echarts.init(this.$refs.middle)
      chartsMiddle.setOption(optionMiddle)
      //  第三个图
      const optionBottom = {
        color: ['#3398DB'],
        title: { text: '座席呼入的总数统计图（单位：次）' },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: { left: '10px', right: '10px', bottom: '10px', containLabel: true },
        xAxis: [ {
          type: 'category',
          data: xData,
          axisTick: { alignWithLabel: true }
        } ],
        yAxis: [ { type: 'value' } ],
        series: [ {
          type: 'bar',
          barWidth: '60%',
          data: bottomY,
          label: {
            show: true,
            formatter: '{c}',
            fontSize: 16,
            position: 'top',
            rich: {
              name: {
                textBorderColor: '#fff'
              }
            }
          }
        } ]
      }
      const chartsBottom = echarts.init(this.$refs.bottom)
      chartsBottom.setOption(optionBottom)
    },
    // 获取多少分
    getMin (date) {
      const arr = date.split(':')
      let result = arr[0] * 60 + parseInt(arr[1]) + arr[2] / 60
      result = result.toFixed(2)
      return result
    }
  }
}
</script>
