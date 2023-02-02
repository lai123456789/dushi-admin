<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="bg">
      <div class="topLogo">
        <img src="../assets/image/logo.png" alt="">
      </div>
      <div class="time">{{ timeNow }}</div>
      <div class="container">
        <a-row type="flex" class="firstRow" :gutter="32">
          <a-col :span="8">
            <div class="item">
              <div>当前等待</div>
              <div v-if="current_wait !== ''">
                <span style="font-size: 68px; font-weight: bold; color: #00ECFF;">{{ current_wait }}</span>
                <span style="font-size: 28px">人</span>
              </div>
              <div class="text">
                <span>最长等待时长</span>
                <span>平均等待时长</span>
              </div>
              <div class="timeNumber">
                <span class="time1">{{ max_wait }}</span>
                <span class="time2">{{ avg_wait }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="item">
              <div class="text">
                <span>来电数</span>
                <span>应答数</span>
                <span>放弃数</span>
              </div>
              <div class="timeNumber" style="font-size: 64px;" v-if="call_data">
                <span class="time1">{{ call_data.call_num }}</span>
                <span class="time2">{{ call_data.answer_num }}</span>
                <span class="time3">{{ call_data.giveup_num }}</span>
              </div>
              <div class="phoneCallTime">
                <span>平均通话时长</span>
                <span v-if="call_data">{{ call_data.avg_duration }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="item">
              <vueEcharts :auto-resize="true" :options="chartsOptions.charts_pie" style="width: 100%; height: 100%;" ref="chart1"/>
            </div>
          </a-col>
        </a-row>
        <a-row class="secondRow" :gutter="32">
          <a-col :span="16">
            <div class="leftItem">
              <div class="title">近12小时通话</div>
              <vueEcharts :auto-resize="true" :options="chartsOptions.charts" style="width: 100%; height: 100%;" ref="chart2"/>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="rightItme">
              <div class="title">坐席状态</div>
              <vueEcharts :auto-resize="true" :options="chartsOptions.charts_pieline" style="width: 100%; height: 100%;" ref="chart3"/>
            </div>
          </a-col>
        </a-row>
      </div>
      <div class="footer">技术支持：深圳市笃实科技有限公司</div>
    </div>
  </a-spin>
</template>

<script>
import echarts from 'echarts'
import vueEcharts from 'vue-echarts'
export default {
  components: {
    echarts,
    vueEcharts
  },
  data () {
    return {
      timeNow: '',
      loading: true,
      starttime: '',
      Interval: null,
      initNum: 0,
      optionsR1: {},
      optionsR2: {},
      optionsR3: {},
      fn: null,
      chartsOptions: {
        // 柱状图
        charts: {
          grid: {
            left: '3%',
            right: '10px',
            bottom: '10%',
            top: '20%'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          color: ['#0dd991', '#604DFE', '#1b9aff', '#9cc991', '#32dbf3'],
          toolbox: { show: false },
          // 柱子数量
          legend: {
            data: ['呼入量', '转坐席量', '接听量', '放弃量', '接通率'],
            textStyle: {
              color: '#fff',
              fontSize: 16
            }
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
            },
            // x轴下横线样式
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            }
          },
          yAxis: [ {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                color: '#004984',
                width: 0.5
              }
            },
            // y轴下横线样式和文字颜色
            axisLabel: {
              formatter: '{value} ',
              textStyle: {
                fontSize: 14,
                color: '#8ac9ff'
              }
            },
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            }
          }],
          // 对应柱子高度
          series: [ {
            name: '呼入量',
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
          color: ['#32DBF3', '#1B9AFF', '#F9387F'],
          legend: {
            orient: 'vertical',
            left: 40,
            data: ['放弃率', '接通率'],
            textStyle: {
              color: '#fff',
              fontSize: 16
            }
          },
          series: {
            type: 'pie',
            label: {
              formatter: '{b}：{d}%',
              normal: {
                color: '#FFFFFF',
                // 图形外文字上下显示
                formatter: '{b} {d}%',
                fontSize: 16
              }
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
      avg_wait: '00:00:00', // 平均等待时长
      max_wait: '00:00:00', // 最长等待时长
      current_wait: '', // 当前等待
      call_data: {}
    }
  },
  activated () {
    if (this.initNum !== 0) {
      this.loadData()
    }
  },
  // 销毁循环
  deactivated () {
    clearInterval(this.Interval)
  },
  mounted () {
    this.loadData()
    setInterval(() => {
      this.timeNow = this.moment().format('YYYY-MM-DD HH:mm:ss') // 当前时间
    }, 1000)
    this.fn = this.resizeHandler()
    this.$nextTick(() => {
      this.fn()
      window.addEventListener('resize', this.fn)
    })
  },
  methods: {
    resizeHandler () {
      let timer
      return () => {
        if (timer) window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          for (let i = 1; i <= 3; i++) {
            var str = 'chart' + i
            this.$refs[str].resize()
          }
        }, 500)
      }
    },
    // 请求接口数据
    loadData () {
      this.axios({
        url: '/monitor/Monitor4/init',
        params: { httpget: '', moni: JSON.stringify([1, 1]) },
        timeout: 5 * 60 * 1000
      }).then(res => {
        this.initNum++
        this.loading = false
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
        // this.settimeout = res.settimeout
        // 定时器请求
        clearInterval(this.Interval)
        if (this.$route.meta.component === 'monitor/flexible/ServerView' || this.$route.query.view === 'monitor/flexible/ServerView') {
          this.runtime(Number(res.settimeout) * 1000)
        }
      }).catch(() => {
        this.loadData()
      })
    },
    // 定时器
    runtime (time) {
      this.Interval = setTimeout(() => {
        this.loadData()
      }, time)
    }
  }
}
</script>
<style lang="less" scoped>
.bg{
  background-image: url('../assets/image/backgroundNew.jpg');
  background-size: 100% 100%;
  background-position: center center;
  width: 100%;
  min-height: 100vh;
  .topLogo{
    text-align: center;
    img{
      padding-top: 16px;
    }
  }
  .time{
    background-image: url('../assets/image/tongji.png');
    height: 50px;
    background-size: 100% 100%;
    color: #00ECFF;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #00ECFF;
    border-radius: 4px;
    width: 260px;
    margin-left: 24px;
    margin-top: -40px;
    white-space: nowrap;
  }
  .container{
    padding: 0 16px;
    color: white;
    .firstRow{
      margin: 36px 0 56px 0;
      .item{
        padding-top: 20px;
        text-align: center;
        height: 260px;
        width: 100%;
        background-image: url('../assets/image/tongji.png');
        background-size: 100% 100%;
        div:nth-of-type(1){
          font-size: 32px;
        }
        .text,.timeNumber{
          font-size: 26px;
          display: flex;
          justify-content: space-around;
        }
        .timeNumber{
          .time1{
            color: #00ECFF;
          }
          .time2{
            color: #4A96FD;
          }
          .time3{
            color: #b6a2de;
          }
        }
        .phoneCallTime{
          padding-top: 16px;
          font-size: 26px;
          span:nth-of-type(2){
            color: aquamarine;
            margin-left: 8px;
          }
        }
      }
    }
    .secondRow{
      margin-top: 96px;
      .leftItem{
        padding:56px;
      }
      .leftItem,.rightItme{
        position: relative;
        height: 400px;
        width: 100%;
        background-image: url('../assets/image/tongji.png');
        background-size: 100% 100%;
        .title{
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #00ECFF;
          background-image: url('../assets/image/centerTitleIcon.png');
          background-size: 100% 100%;
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 0 12px;
          height: 40px;
        }
      }
    }
  }
  .footer{
    text-align: center;
    font-size: 15px;
    color:#4A96FD;
    position: absolute;
    bottom: 10px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
