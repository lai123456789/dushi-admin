<template>
  <div class="box">
    <div class="content">
      <div class="bianjiao"></div>
      <div class="bianjiao2"></div>
      <div class="bianjiao_rotate"></div>
      <div class="bianjiao_rotate2"></div>
      <div class="leftbigborder"></div>
      <div class="leftbigborder_rotate"></div>
      <div class="line_lf"></div>
      <div class="line_rf"></div>
      <div class="line_bottom"></div>
      <div class="titleBox">
        <div class="lfline"></div>
        <div class="titl addwidth"> <span></span> 坐席人员接线状态大屏展示 <span></span></div>
      </div>
      <div class="Lbox">
        <div class="timeBox">{{ timeStr }}</div>
        <div class="rightBox">技术支持：深圳市笃实科技有限公司</div>
      </div>
      <div class="tablebox">
        <div class="lgbox">
          <div class="kta topbox">
            <div class="small_bianjiao1"></div>
            <div class="small_bianjiao2"></div>
            <div class="small_bianjiao3"></div>
            <div class="small_bianjiao4"></div>
            <div class="top_conten">
              <div class="cen_title">当前等待</div>
              <div class="cen_conten"><b class="ren_num">{{ current_wait }}</b>人</div>
              <div class="cen_bottom">
                <div class="cen_sm">
                  <p>最长等待时长</p>
                  <p class="cl color1">{{ max_wait }}</p>
                </div>
                <div class="cen_sm">
                  <p>平均等待时长</p>
                  <p class="cl color2">{{ avg_wait }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="kta topbox">
            <div class="small_bianjiao1"></div>
            <div class="small_bianjiao2"></div>
            <div class="small_bianjiao3"></div>
            <div class="small_bianjiao4"></div>
            <div class="top_conten">
              <div class="mo_conten">
                <div>
                  <p>来电数</p>
                  <p class="color1">{{ call_data.call_num }}</p>
                </div>
                <div>
                  <p>应答数</p>
                  <p class="color2">{{ call_data.answer_num }}</p>
                </div>
                <div>
                  <p>放弃数</p>
                  <p class="color3">{{ call_data.giveup_num }}</p>
                </div>
              </div>
              <div class="bo_conten">
                平均通话时长 <span class="color3">{{ call_data.avg_duration }}</span>
              </div>
            </div>
          </div>
          <div class="bottombox">
            <div class="kta">
              <div class="lf-a"></div>
              <div class="lf-b"></div>
              <div class="lf-c"></div>
              <div class="lf-d"></div>
              <div class="tl-f frametitle">近12小时通话</div>
              <div class="can_view">
                <div ref="charts" class="chartsview"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="smbox">
          <div class="kta topbox">
            <div class="small_bianjiao1"></div>
            <div class="small_bianjiao2"></div>
            <div class="small_bianjiao3"></div>
            <div class="small_bianjiao4"></div>
            <div class="can_view">
              <div ref="charts_pie" class="chartsview"></div>
            </div>
          </div>
          <div class="bottombox">
            <div class="kta">
              <div class="small_bianjiao1"></div>
              <div class="small_bianjiao2"></div>
              <div class="small_bianjiao3"></div>
              <div class="small_bianjiao4"></div>
              <div class="tl-f frametitle">坐席状态</div>
              <div class="can_view">
                <div ref="charts_pieline" class="chartsview"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import './assets/css/chartframe.css'
import echarts from 'echarts'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      timeStr: '0000-00-00 00:00:00',
      chartsOptions: {
        // 柱状图
        charts: {
          grid: {
            left: '10px',
            right: '10px',
            bottom: '10px',
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          color: ['#2ec7c9', '#5ab1ef', '#b6a2de', '#ffb980', '#0ed814'],
          toolbox: { show: false },
          // 柱子数量
          legend: {
            data: ['呼入量', '转坐席量', '接听量', '放弃量', '接通率']
          },
          // X轴名称
          xAxis: {
            type: 'category',
            data: [],
            splitLine: {
              show: true,
              lineStyle: {
                color: '#1f1f3f',
                width: 0.5
              }
            }
          },
          yAxis: [ { type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                color: '#1f1f3f',
                width: 0.5
              }
            } }
          ],
          // 对应柱子高度
          series: [ { name: '呼入量',
            type: 'bar',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }, { name: '转坐席量',
            type: 'bar',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }, { name: '接听量',
            type: 'bar',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }, { name: '放弃量',
            type: 'bar',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }, { name: '接通率',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          } ]
        },
        // 饼状图
        charts_pie: {
          tooltip: {
            trigger: 'item',
            formatter: '{b}:({d}%)'
          },
          color: ['#b6a2de', '#ffb980', '#0ed814'],
          legend: {
            orient: 'vertical',
            left: 10,
            data: ['放弃率', '接通率']
          },
          series: {
            type: 'pie',
            label: {
              formatter: '{b}：{d}%'
            },
            data: [
              { value: 0, name: '接通率' },
              { value: 0, name: '放弃率' }
            ]
          }
        },
        // 极坐标图
        charts_pieline: {
          color: ['#2ec7c9', '#5ab1ef', '#b6a2de', '#ffb980', '#0ed814', '#cccccc'],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          angleAxis: {
            data: ['在线(0)', '空闲(0)', '示忙(0)', '通话(0)', '振铃(0)', '离线(0)'],
            axisLine: {
              show: false,
              lineStyle: { color: '#00c7ff' }
            }
          },
          radiusAxis: {
            min: 0,
            splitLine: {
              lineStyle: { color: '#00c7ff' }
            },
            axisLabel: { show: false },
            axisLine: {
              lineStyle: { color: '#00c7ff' }
            }
          },
          polar: {
          },
          series: {
            name: '当前数量',
            type: 'bar',
            data: [0, 0, 0, 0, 0, 0],
            coordinateSystem: 'polar'
          }
        }
      },
      fn: null,
      chartview: null,
      chartpie: null,
      pieline: null,
      avg_wait: '00:00:00', // 平均等待时长
      max_wait: '00:00:00', // 最长等待时长
      current_wait: '0', // 当前等待
      call_data: {},
      settimeout: 5,
      Interval: null,
      turntime: null
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  activated () {
    this.loaddata()
    this.timeChange()
    this.intervaldata()
    this.fn = this.resizeHandler()
    this.$nextTick(() => {
      this.fn()
      window.addEventListener('resize', this.fn)
    })
  },
  // 销毁循环
  deactivated () {
    clearInterval(this.xuhuan)
    clearInterval(this.turntime)
    window.removeEventListener('resize', this.fn)
  },
  methods: {
    // 时间改变
    timeChange () {
      this.turntime = setInterval(() => {
        const date = new Date()
        const Y = date.getFullYear() + '-'
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
        const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
        const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
        const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
        this.timeStr = Y + M + D + h + m + s
      }, 1000)
    },
    intervaldata () {
      this.xuhuan = setInterval(() => {
        this.loaddata()
      }, this.settimeout * 1000)
    },
    // 请求接口数据
    loaddata () {
      this.axios({
        url: '/monitor/Monitor4/init',
        params: { httpget: '', moni: JSON.stringify([1, 1]) },
        timeout: 5 * 60 * 1000
      }).then(res => {
        this.avg_wait = res.avg_wait
        this.current_wait = res.current_wait
        this.max_wait = res.max_wait
        this.call_data = res.call_data
        this.chartsOptions.charts.xAxis.data = res.chart2_data.name_data
        this.chartsOptions.charts.series[0].data = res.chart2_data.value_incall
        this.chartsOptions.charts.series[1].data = res.chart2_data.value_answer
        this.chartsOptions.charts.series[2].data = res.chart2_data.value_agent
        this.chartsOptions.charts.series[3].data = res.chart2_data.value_abandon
        this.chartsOptions.charts.series[4].data = res.chart2_data.value_connect
        this.chartsOptions.charts_pie.series.data = res.chart3_data
        this.chartsOptions.charts_pieline.angleAxis.data = res.chart1_data.name_data
        this.chartsOptions.charts_pieline.series.data = res.chart1_data.value_data
        this.settimeout = res.settimeout
        this.drowerpic()
      }).catch(() => {
        this.loaddata()
      })
    },
    // 渲染图表
    drowerpic () {
      this.chartview = echarts.init(this.$refs.charts)
      this.chartview.setOption(this.chartsOptions.charts, true)
      this.chartpie = echarts.init(this.$refs.charts_pie)
      this.chartpie.setOption(this.chartsOptions.charts_pie, true)
      this.pieline = echarts.init(this.$refs.charts_pieline)
      this.pieline.setOption(this.chartsOptions.charts_pieline, true)
    },
    // 处理页面大小改变
    resizeHandler () {
      let timer
      return () => {
        if (timer) window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          if (this.chartview) { this.chartview.resize() }
          if (this.chartpie) { this.chartpie.resize() }
          if (this.pieline) { this.pieline.resize() }
        }, 500)
      }
    }
  }
}
</script>
