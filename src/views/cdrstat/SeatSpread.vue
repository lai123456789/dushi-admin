<template>
  <a-spin :spinning="loading">
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
      style="margin: 20px 0;"
      rowKey="hour"
      :columns="hoursColumns"
      :data-source="hoursData"
      size="small"
      :pagination="false" >
      <template slot="title" >
        <div style="font-weight: bold; font-size: 16px;">
          <span style="margin-right: 20px;"> 每小时数据分布</span>
          <a-button type="primary" icon="download" size="small" @click="download">导出数据</a-button>
        </div>
      </template>
    </a-table>
    <div ref="echart" style="width: 100%; height: 400px; margin: 20px 0;"></div>
    <a-card>
      <a-tabs
        @change="onChange"
        tabPosition="left"
        :style="{ height: '500px' }">
        <a-tab-pane
          v-for="(item, key) of extensionObj"
          :key="key"
          :tab="item"
        >
          <a-spin :spinning="channelLoading">
            <a-table
              rowKey="date"
              :columns="seatColumns"
              :data-source="channelData[key]"
              size="small">
              <template slot="title" >
                <div>
                  <span style="font-weight: bold; font-size: 16px; margin-right: 20px;">{{ item }} </span>
                  <span>24小时 (如 8表示 08:00 - 08:59,单位:分)</span>
                </div>
              </template>
            </a-table>
          </a-spin>
        </a-tab-pane>
      </a-tabs>
    </a-card>
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
    }
  },
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      loading: false,
      loadFlag: true,
      channelLoading: false,
      extension: [],
      extensionObj: {},
      infoColumns: [
        { title: '开始时间', dataIndex: 'startTime' },
        { title: '结束时间', dataIndex: 'endTime' },
        { title: '搜索时间段', dataIndex: 'rangeTime', customRender: text => text + '天' }
      ],
      dataSource: [],
      hoursColumns: [
        { title: '小时段', dataIndex: 'hour' },
        { title: '呼叫次数', dataIndex: 'callcount' },
        { title: '通话时长', dataIndex: 'seconds' }
      ],
      hoursData: [ ],
      seatColumns: [
        { title: '日期', dataIndex: 'date' },
        { title: '0', dataIndex: 'h_0' },
        { title: '1', dataIndex: 'h_1' },
        { title: '2', dataIndex: 'h_2' },
        { title: '3', dataIndex: 'h_3' },
        { title: '4', dataIndex: 'h_4' },
        { title: '5', dataIndex: 'h_5' },
        { title: '6', dataIndex: 'h_6' },
        { title: '7', dataIndex: 'h_7' },
        { title: '8', dataIndex: 'h_8' },
        { title: '9', dataIndex: 'h_9' },
        { title: '10', dataIndex: 'h_10' },
        { title: '11', dataIndex: 'h_11' },
        { title: '12', dataIndex: 'h_12' },
        { title: '13', dataIndex: 'h_13' },
        { title: '14', dataIndex: 'h_14' },
        { title: '15', dataIndex: 'h_15' },
        { title: '16', dataIndex: 'h_16' },
        { title: '17', dataIndex: 'h_17' },
        { title: '18', dataIndex: 'h_18' },
        { title: '19', dataIndex: 'h_19' },
        { title: '20', dataIndex: 'h_20' },
        { title: '21', dataIndex: 'h_21' },
        { title: '22', dataIndex: 'h_22' },
        { title: '23', dataIndex: 'h_23' },
        { title: '总计', dataIndex: 'total', width: 100 }
      ],
      channelData: {}
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
          typeReport: 'outgoing'
        }
        this.params = params
        this.users.forEach(item => {
          if (selectUsers.indexOf(item.nodedata) !== -1) {
            extension.push(item.node.extension)
          }
        })
        this.extension = extension
        this.loading = true
        const p = new Promise((resolve, reject) => {
          this.axios({
            url: '/cdrstat/Index/distribution',
            data: { extension: extension },
            params
          }).then(res => {
            resolve(res.result.extension)
            // 报表信息
            const obj = {}
            obj.startTime = this.seatSearch.startTime.split(' ')[0]
            obj.endTime = this.seatSearch.endTime.split(' ')[0]
            obj.rangeTime = res.result.period
            obj.id = 0
            this.dataSource = [obj]
            // 小时段数据
            this.hoursData = res.result.hourData
            // 分级数据
            this.extensionObj = res.result.extension
            // 图标数据
            const xData = []
            const yData = []
            this.hoursData.forEach(item => {
              xData.push(item.hour)
              yData.push(parseInt(item.callcount))
            })
            this.initCharts(xData, yData)
            this.loading = false
            // this.loadFlag = false
          })
        })
        p.then(res => {
          const keyArr = []
          for (var key in res) {
            keyArr.push(key)
            this.channelData[key] = []
          }
          this.onChange(keyArr[0])
        })
      }
      this.seatColumns.map(item => {
        item.customRender = (text, record, index) => {
          let bgColor = ''
          let textAlign = ''
          if (text === 0 || typeof text === 'string') {
            bgColor = 'rgba(255, 255, 255, 0)'
          } else {
            bgColor = this.getColorByNumber(text, 100)
          }
          if (typeof text !== 'string') {
            textAlign = 'center'
          }
          const style = { backgroundColor: bgColor, textAlign }
          return (
            <div style={style}>{ text }</div>
          )
        }
      })
    },
    // 数值越大颜色越深
    getColorByNumber (n, max) {
      const halfMax = max / 2 // 最大数值的二分之一
      // var 百分之一 = (单色值范围) / halfMax;  单颜色的变化范围只在50%之内
      var one = 255 / halfMax
      var r = 0
      var g = 0
      var b = 0
      if (n < halfMax) {
      // 比例小于halfMax的时候红色是越来越多的,直到红色为255时(红+绿)变为黄色.
        r = one * n
        g = 255
      }
      if (n >= halfMax) {
      // 比例大于halfMax的时候绿色是越来越少的,直到0 变为纯红
        g = (255 - ((n - halfMax) * one)) < 0 ? 0 : (255 - ((n - halfMax) * one))
        r = 255
      }
      r = parseInt(r)// 取整
      g = parseInt(g)// 取整
      b = parseInt(b)// 取整
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    },
    initCharts (xData, yData) {
      const option = {
        color: ['#3398DB'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        title: { text: '每小时数据分布图(单位：次)' },
        grid: { left: '10px', right: '10px', bottom: '10px', containLabel: true },
        xAxis: [ {
          axisLabel: {
            interval: 0,
            rotate: 40
          },
          type: 'category',
          data: xData,
          axisTick: {
            alignWithLabel: true
          },
          nameRotate: '92°'
        } ],
        yAxis: [ {
          type: 'value'
        } ],
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
      const myChart = echarts.init(this.$refs.echart)
      myChart.setOption(option)
    },
    // 导出
    download () {
      const params = {
        startTime: this.seatSearch.startTime,
        endTime: this.seatSearch.endTime,
        noInternal: this.seatSearch.filtration ? 1 : 0,
        sortField: 'calldate',
        sortOrder: 'ascend',
        export: 1,
        extension: this.extension
      }
      // let url = this.urlEncode(params)
      // url = this.setting.rootUrl + 'cdrstat/Index/distributionExport?1' + url
      // window.open(url)
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict',
        param: params // 新增
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
    onChange (key) {
      this.channelLoading = true
      this.axios({
        url: '/cdrstat/Index/distributionDetail',
        params: {
          startTime: this.seatSearch.startTime,
          endTime: this.seatSearch.endTime,
          noInternal: this.seatSearch.filtration ? 1 : 0,
          channel: key
        }
      }).then(res => {
        this.channelLoading = false
        this.channelData[key] = res.result.data
        this.channelData = JSON.parse(JSON.stringify(this.channelData))
      })
    }
  }
}
</script>
