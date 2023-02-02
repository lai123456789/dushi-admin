<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="bg">
      <div class="topLogo">
        <img src="../assets/image/logo.png" alt="">
      </div>
      <div class="container">
        <div class="left">
          <div class="l-item">
            <div class="title">工单来源分布</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL1" style="width: 100%; height: 100%;" ref="chart1"/>
            </div>
          </div>
          <div class="l-item">
            <div class="title">产品品类分布</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL2" style="width: 100%; height: 100%;" ref="chart2"/>
            </div>
          </div>
          <div class="l-item">
            <div class="title">工单类型分布</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL3" style="width: 100%; height: 100%;" ref="chart3"/>
            </div>
          </div>
        </div>
        <div class="center">
          <div class="centerTitle">工单地图分布</div>
          <div class="centerBtn">
            <div class="btnItem" @click="btnClick(0)" :class="clickIndex==0?'activeSelect':'activeNo'">
              近一周
            </div>
            <div class="btnItem" @click="btnClick(1)" :class="clickIndex==1?'activeSelect':'activeNo'">
              近一月
            </div>
            <div class="btnItem" @click="btnClick(2)" :class="clickIndex==2?'activeSelect':'activeNo'">
              近三月
            </div>
          </div>
          <div class="centerQua">
            <div class="allQua">
              <div class="itemOne">
                <div>{{ centerData.today_count + centerData.today_end_count }}</div>
                <div>总工单(件)</div>
              </div>
              <div class="itemOne">
                <div>{{ centerData.today_count }}</div>
                <div>待完结工单(件)</div>
              </div>
              <div class="itemOne">
                <div>{{ centerData.today_end_count }}</div>
                <div>完结工单(件)</div>
              </div>
            </div>
          </div>
          <div class="chartsContentMap">
            <vueEcharts :auto-resize="true" :options="optionsMap" style="width: 100%; height: 100%;" ref="chart7"/>
          </div>
        </div>
        <div class="right">
          <div class="l-item">
            <div class="title">工单满意度</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR1" style="width: 100%; height: 100%;" ref="chart4"/>
            </div>
          </div>
          <div class="l-item">
            <div class="title">工单时效分布</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR2" style="width: 100%; height: 100%;" ref="chart5"/>
            </div>
          </div>
          <div class="l-item">
            <div class="title">网点接单分布</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR3" style="width: 100%; height: 100%;" ref="chart6"/>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">技术支持：深圳市笃实科技有限公司</div>

    </div>
  </a-spin>
</template>
<script>
import echarts from 'echarts'
import vueEcharts from 'vue-echarts'
// 引入中国地图数据json
import china from 'echarts/map/json/china.json'
export default {
  components: {
    echarts,
    vueEcharts
  },
  data () {
    return {
      loading: true,
      starttime: '',
      centerData: {
        history_count: '',
        today_count: '',
        today_end_count: ''
      },
      clickIndex: 1,
      Interval: null,
      initNum: 0,
      optionsL1: {},
      optionsL2: {},
      optionsL3: {},
      optionsMap: {},
      optionsR1: {},
      optionsR2: {},
      optionsR3: {}
    }
  },
  activated () {
    // 页面刷新默认加载近一月的数据
    if (this.initNum !== 0) {
      this.getDateTime(1)
    }
  },
  mounted () {
    this.getDateTime(1)
  },
  // 销毁循环
  deactivated () {
    clearInterval(this.Interval)
  },
  methods: {
    getWorkOrderInfo () {
      this.axios({
        url: '/monitor/monitor3/init/?httpget=&',
        data: {
          starttime: this.starttime
        },
        timeout: 5 * 60 * 1000
      }).then(resData => {
        this.initNum++ // 初始值改变 后续每次切换进入此页面会继续请求定时器
        this.loading = false
        // 中间数字栏目
        this.centerData = {
          history_count: resData.history_count,
          today_count: resData.today_count,
          today_end_count: resData.today_end_count
        }
        this.optionsL1 = {
          color: ['#0dd991', '#32dbf3', '#1b9aff', '#9cc991', '#fc5976', '#fb9341', '#e6d000', '#5cc991', '#99cbf3', '#3b9a99', '#9aa991', '#fb5949', '#bb8371'],
          // 圆点中间文字
          title: {
            text: '总计\n' + Number(resData.order_source_pie.count),
            textAlign: 'center',
            textStyle: {
              color: '#ffffff',
              lineHeight: 25,
              fontSize: 16
            },
            x: '32%',
            y: 'center'
          },
          grid: {
            bottom: 150,
            left: 100,
            right: '10%'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            textStyle: {
              color: '#8AC9FF',
              fontSize: 12
            },
            formatter: function (name) {
              let value = 0
              const arrData = JSON.parse(resData.order_source_pie.data)
              arrData.forEach(item => {
                if (item.name === name) {
                  value = item.value
                }
              })
              return name + ' - ' + value
            },
            orient: 'vertical',
            // 图例栏偏移
            right: 5,
            top: 30
          },
          series: [{
            name: '访问来源',
            type: 'pie',
            right: 140,
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'inner',
              formatter: '{b}：\n{c}'
            },
            labelLine: {
              normal: {
                show: true,
                length: 30,
                length2: 55
              },
              emphasis: {
                show: true
              }
            },
            data: JSON.parse(resData.order_source_pie.data)
          }]
        }
        this.optionsL2 = {
          color: ['#32DBF3', '#1B9AFF', '#FB9341', '#604DFE', '#FC5976', '#3C6BFF'],
          // 圆点中间文字
          title: {
            text: '总计\n' + Number(resData.order_product_big_type.count),
            textAlign: 'center',
            textStyle: {
              color: '#ffffff',
              lineHeight: 25,
              fontSize: 16
            },
            x: '32%',
            y: 'center'
          },
          grid: {
            bottom: 150,
            left: 100,
            right: '10%'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            textStyle: {
              color: '#8AC9FF',
              fontSize: 12
            },
            orient: 'vertical',
            right: 50, // 图例栏偏移
            top: 30,
            formatter: function (name) {
              let value = 0
              const arrDataList = JSON.parse(resData.order_product_big_type.data)
              arrDataList.forEach(item => {
                if (item.name === name) {
                  value = item.value
                }
              })
              return name + ' - ' + value
            }
          },
          series: [{
            name: '访问来源',
            type: 'pie',
            right: 140, // 图形偏移
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'inner',
              formatter: '{b}：\n{c}'
            },
            labelLine: {
              normal: {
                show: true,
                length: 30,
                length2: 55
              },
              emphasis: {
                show: true
              }
            },
            data: JSON.parse(resData.order_product_big_type.data)
          }]
        }
        let sumType = 0
        const arrType = JSON.parse(resData.order_classification_pie.data)
        arrType.forEach(item => {
          sumType = sumType + Number(item.value)
        })
        const rateArrType = arrType.map(item => {
          return (Number(item.value) * 100 / sumType).toFixed(2)
        })
        this.optionsL3 = {
          tooltip: {
            trigger: 'axis',
            formatter: function (datas) {
              var res = datas[0].name + '<br/>'
              res = res + datas[0].marker + datas[0].seriesName + '：' + datas[0].value + '<br/>' + datas[1].marker + datas[1].seriesName + '：' + datas[1].value + '%'
              return res
            }
          },
          grid: {
            left: 70
          },
          legend: {
            data: ['数量', '占比'],
            textStyle: {
              color: '#fff'
            },
            top: 20,
            left: '60%'// 300
          },
          xAxis: [{
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            },
            axisLabel: {
              textStyle: {
                fontSize: 14
              }
            },
            axisTick: {
              // x轴刻度线
              show: false
            },
            data: JSON.parse(resData.order_classification_pie.name)
          }],
          yAxis: [{
            type: 'value',
            axisLabel: {
              formatter: '{value} ',
              textStyle: {
                fontSize: 14
              }
            },
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            },
            axisTick: {
              // y轴刻度线
              show: false
            },
            splitLine: {
              lineStyle: {
                color: '#004984'
              }
            }
          }, {
            type: 'value',
            show: false,
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value} %'
            },
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            },
            axisTick: {
              // y轴刻度线
              show: false
            },
            splitLine: {
              show: false
            }
          }],
          series: [{
            name: '数量',
            type: 'bar',
            barWidth: 15,
            itemStyle: {
              normal: {
                color: ['#32dbf3'],
                barBorderRadius: [30, 30, 0, 0],
                label: {
                  show: false,
                  position: 'top',
                  formatter: '{b}\n{c}',
                  textStyle: {
                    color: '#FFF'
                  }
                }
              }
            },
            data: JSON.parse(resData.order_classification_pie.data)
          }, {
            name: '占比',
            type: 'line',
            smooth: true,
            itemStyle: { /* 设置折线颜色 */
              normal: {
                color: '#fc5976'
              }
            },
            yAxisIndex: 1,
            data: rateArrType
          }]
        }
        this.optionsR1 = {
          tooltip: {
            formatter: '{b} : {c}%',
            textStyle: {
              color: '#FFF'
            }
          },
          series: [{
            title: {
              textStyle: {
                color: '#8ac9ff',
                fontSize: 18
              },
              offsetCenter: [0, '75%']// 设置客户满意率文字位置 第一项水平 第二项垂直
            },
            type: 'gauge',
            center: ['50%', '55%'],
            radius: '80%', // 仪表盘大小
            axisLine: { // 坐标轴线
              lineStyle: { // 属性lineStyle控制线条样式
                color: [[0.1, '#f9387f'], [0.8, '#3488DB'], [1, '#32dbf3']],
                width: 14
              }
            },
            splitLine: {
              show: false // 分割线
            },
            axisTick: {
              show: true // 刻度线
            },
            itemStyle: {
              color: '#2666AB'
            },
            axisLabel: {
              color: '#2B9ABC',
              fontSize: 12, // 刻度数字
              distance: -8 // 文字离表盘的距离
            },
            detail: {
              // 百分比数字样式
              formatter: '{value}%',
              color: '#FFF',
              fontSize: 16
            },
            data: JSON.parse(resData.manyilv_late)
          }]
        }
        this.optionsR2 = {
          color: ['#32DBF3', '#1B9AFF', '#F9387F'], // 颜色
          tooltip: {
            trigger: 'item',
            formatter: '{a}<br/>{b}{d}%' // 鼠标悬浮的显示
          },
          series: [
            {
              name: '工单时效分布',
              type: 'pie',
              animationEasing: 'cubicInOut', // 动画
              animationDuration: 1000,
              radius: ['25%', '60%'], // 圆圈大小
              center: ['50%', '50%'],
              data: JSON.parse(resData.finish_late),
              labelLine: { // 图形外文字线
                normal: {
                  length: 20,
                  length2: 80
                }
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              label: {
                normal: {
                  // 设置文字行高
                  lineHeight: 35,
                  fontSize: 16,
                  // 图形外文字上下显示
                  formatter: '{d}%\n {b}',
                  borderWidth: 20,
                  borderRadius: 4,
                  // 文字和图的边距
                  padding: [0, -80]
                }
              }
            }
          ]
        }
        // 数组的总和
        let sum = 0
        const arr = JSON.parse(resData.yccount_data.yccount_value)
        // 服务网点接单分布1
        arr.forEach(item => {
          sum = sum + Number(item)
        })
        const rateArr = arr.map(item => {
          return (Number(item) * 100 / sum).toFixed(2)
        })
        this.optionsR3 = {
          tooltip: {
            trigger: 'axis',
            formatter: function (datas) {
              var res = datas[0].name + '<br/>'
              res = res + datas[0].marker + datas[0].seriesName + '：' + datas[0].value + '<br/>' + datas[1].marker + datas[1].seriesName + '：' + datas[1].value + '%'
              return res
            }
          },
          grid: {
            left: 70
          },
          legend: {
            data: ['数量', '占比'],
            textStyle: {
              color: '#fff'
            },
            top: 20,
            left: '60%'
          },
          xAxis: [{
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            },
            axisLabel: {
              interval: 0,
              rotate: 40,
              textStyle: {
                fontSize: 14
              }
            },
            axisTick: {
              // x轴刻度线
              show: false
            },
            data: JSON.parse(resData.yccount_data.yccount_name)
          }],
          yAxis: [{
            type: 'value',
            axisLabel: {
              formatter: '{value} ',
              textStyle: {
                fontSize: 14
              }
            },
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            },
            axisTick: {
              // y轴刻度线
              show: false
            },
            splitLine: {
              // show: false, // 去除网格线
              lineStyle: {
                color: '#004984'
              }
            }
          }, {
            type: 'value',
            // 不显示右边百分比文字
            show: false,
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value} %'
            },
            axisLine: {
              lineStyle: {
                color: '#8ac9ff'
              }
            },
            axisTick: {
              // y轴刻度线
              show: false
            },
            splitLine: {
              show: false
            }
          }],
          series: [{
            name: '数量',
            type: 'bar',
            // barWidth1
            barWidth: 15,
            itemStyle: {
              normal: {
                color: ['#32dbf3'],
                barBorderRadius: [30, 30, 0, 0],
                label: {
                  show: false,
                  position: 'top',
                  formatter: '{b}\n{c}123123',
                  textStyle: {
                    color: 'red'
                  }
                }
              }
            },
            data: JSON.parse(resData.yccount_data.yccount_value)
          }, {
            name: '占比',
            type: 'line',
            smooth: true,
            itemStyle: {
              normal: {
                color: '#fc5976'
              }
            },
            yAxisIndex: 1,
            data: rateArr
          }]
        }
        // 中间地图区域
        // 设置获取地图相关
        const myHosName1 = resData.hos_name
        var geoCoordMap = {
          '安徽省': [117.17, 31.52],
          '北京市': [116.24, 39.55],
          '重庆市': [106.54, 29.59],
          '福建省': [119.18, 26.05],
          '甘肃省': [103.51, 36.04],
          '广东省': [113.14, 23.08],
          '广西壮族自治区': [108.19, 22.48],
          '贵州省': [106.42, 26.35],
          '海南省': [110.20, 20.02],
          '河北省': [114.30, 38.02],
          '河南省': [113.40, 34.46],
          '黑龙江省': [128.36, 45.44],
          '湖北省': [112.27, 30.15],
          '湖南省': [112.59, 28.12],
          '吉林省': [125.19, 43.54],
          '江苏省': [118.46, 32.03],
          '江西省': [115.55, 28.40],
          '辽宁省': [123.25, 41.48],
          '宁夏回族自治区': [106.16, 38.27],
          '青海省': [101.48, 36.38],
          '山东省': [118.00, 36.40],
          '山西省': [112.33, 37.54],
          '陕西省': [108.57, 34.17],
          '上海市': [121.29, 31.14],
          '海南': [108.77, 19.10],
          '四川省': [104.04, 30.40],
          '天津市': [117.12, 39.02],
          '西藏自治区': [91.08, 29.39],
          '新疆维吾尔自治区': [87.36, 43.45],
          '内蒙古自治区': [111.77, 40.82],
          '云南省': [102.42, 25.04],
          '浙江省': [120.10, 30.16]
        }
        const BJData = [] // 接口数据
        const orderData = JSON.parse(resData.mapdata.data)
        for (const key in orderData) {
          BJData.push([{
            name: myHosName1
          }, {
            name: orderData[key]['province'],
            value: orderData[key]['count']
          }])
        }
        const planePath = 'triangle'
        const convertData = function (data) {
          const res = []
          for (let i = 0; i < data.length; i++) {
            const dataItem = data[i]
            const fromCoord = geoCoordMap[dataItem[0].name]
            const toCoord = geoCoordMap[dataItem[1].name]
            if (fromCoord && toCoord) {
              res.push({
                fromName: dataItem[0].name,
                toName: dataItem[1].name,
                coords: [toCoord, fromCoord]
              })
            }
          }
          return res
        }
        var color = ['#a6c84c', '#32DBF3', 'black']
        this.optionsMap = {
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              if (params.data.value) {
                return params.name + '<br/>受理中工单：' + params.data.value[2] + '件'
              }
            }
          },
          geo: {
            map: 'china',
            zoom: 1.2, // 放大倍数
            top: 60, // 地图位置
            label: {
              emphasis: {
                show: false
              }
            },
            roam: false, // 是否开启鼠标缩放和平移漫游
            itemStyle: {
              normal: {
                areaColor: '#002689',
                borderColor: '#32daf4',
                borderWidth: 1,
                shadowColor: '#32daf4'
              },
              emphasis: {
                areaColor: '#002EBC' // 鼠标滑过激活颜色
              }
            }
          },
          dataRange: {
            show: false,
            min: 0,
            max: resData.mapdata.max,
            x: 'right',
            y: 'middle',
            text: ['低', '高'],
            color: ['#16F8F3', '#0B8BF8', '#17B9F7', '#6AB9FA', '#556283'] // 颜色按照数量规则 从高->低 第二项开始
          },
          series: [{
            name: myHosName1,
            type: 'lines',
            zlevel: 1,
            effect: {
              show: true,
              period: 6,
              trailLength: 0.7,
              color: '#fff',
              symbolSize: 3
            },
            lineStyle: {
              normal: {
                color: color[0],
                width: 0,
                curveness: 0.2
              }
            },
            data: convertData(BJData)
          }, {
            // 移动点
            name: myHosName1,
            type: 'lines',
            zlevel: 2,
            effect: {
              show: true,
              period: 6,
              trailLength: 0,
              symbol: planePath,
              symbolSize: 10
            },
            lineStyle: {
              normal: {
                color: color[1],
                width: 1,
                opacity: 0.4,
                curveness: 0.2
              }
            },
            data: convertData(BJData)
          }, {
            // 省份圆点
            name: myHosName1,
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: '{b}',
                color: '#FFF'
              }
            },
            symbolSize: function (val) {
              if (val[2] / 20 > 30) {
                return 30
              } else if (val[2] / 20 < 10) {
                return 10
              } else {
                return val[2] / 20
              }
            },
            data: BJData.map(function (dataItem) {
              return {
                name: dataItem[1].name,
                value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]) // 接口
              }
            })
          }, {
            // 设置起点
            name: myHosName1,
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              normal: {
                show: true,
                position: 'right',
                color: '#2EC7C9',
                fontSize: 14,
                fontWeight: 'bold',
                formatter: '{b}'
              }
            },
            symbolSize: function (val) {
              return val[2] / 6
            },
            data: [{
              name: myHosName1,
              value: geoCoordMap[myHosName1].concat([1])
            }]
          }]
        }
        // 注册并渲染地图
        echarts.registerMap('china', china)

        // 处理页面大小改变
        window.onresize = () => {
          setTimeout(() => {
            for (let i = 1; i <= 7; i++) {
              var str = 'chart' + i
              this.$refs[str].resize()
            }
          }, 500)
        }
        // 定时器请求
        clearInterval(this.Interval)
        if (this.$route.meta.component === 'monitor/flexible/WorkOrderScreenMonitor' || this.$route.query.view === 'monitor/flexible/WorkOrderScreenMonitor') {
          this.runtime(Number(resData.settimeout) * 1000)
        }
      }).catch(() => {
        // 请求超时 重新发起请求
        this.getWorkOrderInfo()
      })
    },
    // 定时器
    runtime (time) {
      this.Interval = setTimeout(() => {
        this.getWorkOrderInfo()
      }, time)
    },
    // 时间戳转年月日时分秒 格式：2021-04-08 11:50:22
    getDateTime (index) {
      var dateNow = new Date()
      if (index === 0) { // 近一周
        dateNow.setTime(dateNow.getTime() - 3600 * 1000 * 24 * 7)
      } else if (index === 1) { // 近一月
        dateNow.setMonth(dateNow.getMonth() - 1)
      } else if (index === 2) { // 近三月
        dateNow.setMonth(dateNow.getMonth() - 3) // 近3月
      }
      const ms = dateNow.getTime()
      const date = new Date(ms)
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      const D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' '
      const h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
      const m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':'
      const s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      const time = Y + M + D + h + m + s
      this.starttime = time
      this.getWorkOrderInfo()
    },
    btnClick (index) {
      this.clickIndex = index
      this.loading = true
      this.getDateTime(index)
    }
  }
}
</script>
<style  scoped>
.bg{
  background-image: url('../assets/image/background.jpg');
  background-size: 100% 100%;
  background-position: center center;
  width: 100%;
  min-height: 100vh;
}
.container{
  display: flex;
  justify-content: space-between
}
.topLogo{
  text-align: center;
}
.topLogo img{
  padding-top: 28px;/*logo图片*/
}
.left,.right{
  margin-top: -66px;
  margin-bottom: 30px;
}
.l-item{
  text-align: center;
  width: 400px;
  height: 297px;
  margin: 36px 25px;
  background-size: 100% 100%;
  background-image: url('../assets/image/kuang.png');
}
.title{
  font-size: 16px;
  color: #00ECFF;
  padding-top: 8px;
  letter-spacing:2px;
}
/* 饼图 */
.chartsContent{
  margin: 0 auto;
  padding-top: 10px;
  width: 100%;
  height: 267px;
}
/* 异常工单热力图 中间标题文字 */
.centerTitle{
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #FFF;
  position: absolute;
  left: 45%;
  top: 10%;
}
/* 按钮部分 近一周 */
.centerBtn{
  display: flex;
  justify-content: center;
  position: relative;
  top: 10%;
  margin-bottom: 120px;
}
.btnItem{
  width: 132px;
  height: 54px;
  cursor: pointer;
  margin: 0 8px;
  color:#FFF;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btnItem:hover{
  zoom: 1.06;
  background-size: 100% 100%;
  background-image: url('../assets/image/bg_activeSelected.png');
}
.activeNo{
  background-size: 100% 100%;
  background-image: url('../assets/image/bg_activeNO.png');
}
.activeSelect{
  zoom: 1.06;
  background-size: 100% 100%;
  background-image: url('../assets/image/bg_activeSelected.png');
}
/* 地图 */
.chartsContentMap{
  width: 730px;
  height: 620px;
  margin-top: 30px;
}
.centerQua{
  text-align: center
}
.allQua{
  margin: 0 auto;
  width: 575px;
  height: 102px;
  background-size: 100% 100%;
  background-image: url('../assets/image/tongji.png');
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.itemOne div:nth-child(1){
  font-size: 40px;
  color: #00DEFF;
  font-family: DS-Digital;
  font-weight: bold;
}
.itemOne div:nth-child(2){
  font-size: 14px;
  color: #FFF;
  text-align: center;
  margin-bottom: 10px;
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
</style>
