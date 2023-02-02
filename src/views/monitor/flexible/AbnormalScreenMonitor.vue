<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="bg">
      <div class="topLogo">
        <img src="../assets/image/logo.png" alt="">
      </div>
      <div class="container">
        <div class="left">
          <div class="left-item">
            <div class="title">超时</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL1" style="width: 100%; height: 100%;" ref="chart1"/>
            </div>
          </div>
          <div class="left-item">
            <div class="title">催办</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL2" style="width: 100%; height: 100%;" ref="chart2"/>
            </div>
          </div>
          <div class="left-item">
            <div class="title">不满意</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL3" style="width: 100%; height: 100%;" ref="chart4"/>
            </div>
          </div>
          <div class="left-item">
            <div class="title">投诉</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsL4" style="width: 100%; height: 100%;" ref="chart3"/>
            </div>
          </div>
        </div>
        <div class="center">
          <div class="centerTitle">异常工单热力图</div>
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
          <div class="chartsContentMap">
            <vueEcharts :auto-resize="true" :options="optionsMap" style="width: 100%; height: 100%;" ref="chart9"/>
          </div>
        </div>
        <div class="right">
          <div class="left-item">
            <div class="title">超时</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR1" style="width: 100%; height: 100%;" ref="chart5"/>
            </div>
          </div>
          <div class="left-item">
            <div class="title">催办</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR2" style="width: 100%; height: 100%;" ref="chart6"/>
            </div>
          </div>
          <div class="left-item">
            <div class="title">不满意</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR3" style="width: 100%; height: 100%;" ref="chart7"/>
            </div>
          </div>
          <div class="left-item">
            <div class="title">投诉</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR4" style="width: 100%; height: 100%;" ref="chart8"/>
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
      clickIndex: 1,
      optionsL1: {},
      optionsL2: {},
      optionsL3: {},
      optionsL4: {},
      optionsMap: {},
      optionsR1: {},
      optionsR2: {},
      optionsR3: {},
      optionsR4: {},
      Interval: null,
      initNum: 0
    }
  },
  activated () {
    // 进入当前页面 每次进入都会触发 mounted只触发一次
    var now = new Date()
    now.setMonth(now.getMonth() - 1) // 近1月
    this.starttime = now
    if (this.initNum !== 0) {
      this.getApiData()
    }
  },
  mounted () {
    // 默认近一月数据
    var now = new Date()
    now.setMonth(now.getMonth() - 1) // 近1月
    this.starttime = now
    this.getApiData()
  },
  // 销毁定时器
  deactivated () {
    clearInterval(this.Interval)
  },
  methods: {
    // 定时器
    runtime (settimeoutTime) {
      this.Interval = setTimeout(() => {
        this.getApiData()
      }, settimeoutTime)
    },
    // 获取接口数据
    getApiData () {
      this.axios({
        url: '/monitor/monitor6/init/?httpget=&',
        data: {
          starttime: this.starttime
        },
        timeout: 5 * 60 * 1000
      }).then(resData => {
        this.initNum++
        this.loading = false
        const pie1 = resData.pie1
        const pie2 = resData.pie2
        const pie3 = resData.pie3
        const pie4 = resData.pie4
        // 左边饼图区域
        this.optionsL1 = {
          color: ['#32DBF3', '#1B9AFF', '#FB9341', '#604DFE', '#FC5976'],
          title: {
            text: '总计\n' + resData.pie1_total,
            textAlign: 'center',
            textStyle: {
              color: '#ffffff',
              lineHeight: 25,
              fontSize: 14
            },
            x: '27%',
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
              fontSize: 14
            },
            orient: 'vertical',
            right: 50,
            top: 30,
            data: pie1
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
            data: pie1
          }]
        }
        this.optionsL2 = {
          color: ['#32DBF3', '#1B9AFF', '#FB9341', '#604DFE', '#FC5976'],
          // 圆点中间文字
          title: {
            text: '总计\n' + resData.pie2_total,
            textAlign: 'center',
            textStyle: {
              color: '#ffffff',
              lineHeight: 25,
              fontSize: 14
            },
            x: '27%',
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
              fontSize: 14
            },
            orient: 'vertical',
            right: 50, // 图例栏偏移
            top: 30,
            data: pie2
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
            data: pie2
          }]
        }
        this.optionsL3 = {
          color: ['#32DBF3', '#1B9AFF', '#FB9341', '#604DFE', '#FC5976'], // 图例颜色
          // 圆点中间文字
          title: {
            text: '总计\n' + resData.pie4_total,
            textAlign: 'center',
            textStyle: {
              color: '#ffffff',
              lineHeight: 25,
              fontSize: 14
            },
            x: '27%',
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
              fontSize: 14
            },
            orient: 'vertical',
            right: 50, // 图例栏偏移
            top: 30,
            data: pie4
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
            data: pie4
          }]
        }
        this.optionsL4 = {
          color: ['#32DBF3', '#1B9AFF', '#FB9341', '#604DFE', '#FC5976'], // 图例颜色
          // 圆点中间文字
          title: {
            text: '总计\n' + resData.pie3_total,
            textAlign: 'center',
            textStyle: {
              color: '#ffffff',
              lineHeight: 25,
              fontSize: 14
            },
            x: '27%',
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
              fontSize: 14
            },
            orient: 'vertical',
            right: 50,
            top: 30,
            data: pie3
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
            data: pie3
          }]
        }
        // 中间地图区域
        const chinaDatas = resData.chinaDatas
        var yData = []
        var barData = chinaDatas
        barData = barData.sort(function (a, b) {
          return b.value - a.value
        })
        for (var j = 0; j < barData.length; j++) {
          if (j < 10) {
            yData.push('0' + j + barData[j].name)
          } else {
            yData.push(j + barData[j].name)
          }
        }
        this.optionsMap = {
          title: [{
            show: true,
            text: '异常工单各省份排行榜',
            subtextStyle: {
              color: '#ffffff',
              lineHeight: 20
            },
            textStyle: {
              color: '#fff',
              fontSize: 16
            },
            right: 10,
            top: 20
          }],
          grid: {
            right: -40,
            top: 60,
            bottom: 20,
            width: '130'
          },
          xAxis: {
            show: false
          },
          yAxis: {
            type: 'category',
            inverse: true,
            nameGap: 10,
            axisLine: {
              show: false,
              lineStyle: {
                color: '#ddd'
              }
            },
            axisTick: {
              show: false,
              lineStyle: {
                color: '#ddd'
              }
            },
            axisLabel: {
              interval: 0,
              margin: 85,
              textStyle: {
                color: '#fff',
                align: 'left',
                fontSize: 14
              },
              rich: {
                // 图例导航条
                a: {
                  color: '#fff',
                  backgroundColor: '#f0515e',
                  width: 20,
                  height: 20,
                  align: 'center',
                  borderRadius: 2
                },
                b: {
                  color: '#fff',
                  backgroundColor: '#24a5cd',
                  width: 20,
                  height: 20,
                  align: 'center',
                  borderRadius: 2
                }
              },
              formatter: function (params) {
                if (parseInt(params.slice(0, 2)) < 3) {
                  return ['{a|' + (parseInt(params.slice(0, 2)) + 1) + '}' + '  ' + params.slice(2)].join('\n')
                } else {
                  return ['{b|' + (parseInt(params.slice(0, 2)) + 1) + '}' + '  ' + params.slice(2)].join('\n')
                }
              }
            },
            data: yData
          },
          tooltip: {
            triggerOn: 'click',
            formatter: function (e, t, n) {
              return e.name + '：' + e.value
            }
          },
          visualMap: {
            left: 150,
            bottom: -30,
            showLabel: true,
            text: ['高', '低'],
            pieces: [{
              gte: 10000,
              label: '> 10000',
              color: '#000044'
            }, {
              gte: 1000,
              lte: 10000,
              label: '1000 - 10000',
              color: '#002A8A'
            }, {
              gte: 500,
              lt: 1000,
              label: '500 - 1000',
              color: '#002EBC'
            }, {
              gt: 100,
              lt: 500,
              label: '100 - 500',
              color: '#0070BC'
            }, {
              gte: 0,
              lt: 100,
              label: '0 - 100',
              color: '#32DBF3'
            }],
            textStyle: {
              color: '#fff'
            },
            show: true
          },
          // 地图
          geo: {
            show: true,
            map: 'china',
            left: 'left',
            right: 180,
            top: 100,
            label: {
              normal: {
                show: !0,
                fontSize: '14',
                color: '#fff'
              }
            },
            roam: false,
            itemStyle: {
              normal: {
                borderColor: 'rgba(0, 0, 0, 0.5)'
              },
              emphasis: {
                // 地图区域鼠标滑过变色
                areaColor: '#B9DEF5',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                borderWidth: 0
              }
            }
          },
          series: [{
            type: 'map',
            map: 'china',
            geoIndex: 0,
            aspectScale: 0.75, // 长宽比
            showLegendSymbol: false, // 存在legend时显示
            label: {
              normal: {
                show: true
              },
              emphasis: {
                show: false,
                textStyle: {
                  color: '#fff'
                }
              }
            },
            roam: true,
            itemStyle: {
              normal: {
                areaColor: '#031525',
                borderColor: '#3B5077'
              },
              emphasis: {
                areaColor: '#2B91B7'
              }
            },
            animation: true,
            data: chinaDatas
          }, {
            name: 'barSer',
            type: 'bar',
            roam: false,
            visualMap: false,
            zlevel: 1,
            barMaxWidth: 16,
            barGap: 0,
            itemStyle: {
              normal: {
                color: function (params) {
                  var colorList = [{
                    colorStops: [{
                      offset: 0,
                      color: '#bf19ff'
                    }]
                  }, {
                    colorStops: [{
                      offset: 0,
                      color: '#854cff'
                    }]
                  }, {
                    colorStops: [{
                      offset: 0,
                      color: '#5f45ff'
                    }]
                  }, {
                    colorStops: [{
                      offset: 0,
                      color: '#02cdff'
                    }]
                  }]
                  if (colorList[params.dataIndex]) {
                    return colorList[params.dataIndex]
                  } else {
                    return colorList[3]
                  }
                },
                barBorderRadius: [0, 15, 15, 0]
              }
            },
            label: {
              normal: {
                show: true,
                textBorderColor: '#333',
                textBorderWidth: 2
              }
            },
            data: barData.sort((a, b) => {
              return b.value - a.value
            })
          }]
        }
        echarts.registerMap('china', china)// 注册并渲染地图
        // 右边条形图区域
        // 条形图1
        const total = resData.bar1_total
        const dataArr = resData.bar1_data
        const dataAxis = dataArr.map(obj => obj.name)
        const TData = dataArr.map(item => Number(item.value))
        // const max = Math.max(...TData)
        // const maxArr = new Array(TData.length).fill(max)
        this.optionsR1 = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (datas) {
              // 服务运营占比10%，服务运营数量为100单，总计超时数量为1000单
              var res = datas[0].name + '<br/>'
              var val = datas[0].value
              res += '<span class="formatter0"></span>占比：' + (total ? val / total * 100 : 0).toFixed(2) + '%<br/>'
              res += '<span class="formatter1"></span>数量：' + val + '<br/>'
              res += '<span class="formatter1"></span>总数：' + total + '<br/>'
              return res
            }
          },
          grid: {
            left: '8%',
            right: 40,
            top: 10,
            bottom: 0,
            containLabel: true
          },
          xAxis: {
            show: false,
            xAxisIndex: 1,
            splitNumber: 3,
            type: 'value',
            nameGap: 30,
            axisTick: {
              show: true
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#fff',
                fontSize: 10
              }
            },
            min: function (value) {
              return value.min > 2 ? value.min - 2 : value.min
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'category',
            data: dataAxis,
            axisTick: {
              show: false
            },
            inverse: true,
            z: 10,
            axisLabel: {
              show: true,
              color: '#fff'
            },
            axisLine: {
              // 分割线
              show: false
            }
          },
          series: [{
            type: 'bar',
            barGap: '-100%',
            barWidth: 7,
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: function (params) {
                  var idy = params.dataIndex > 3 ? 3 : params.dataIndex
                  return (
                    '{color' + idy + '|' + TData[params.dataIndex] + '}'
                  )
                },
                rich: {
                  color0: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color1: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color2: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color3: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  }
                }
              }
            },
            itemStyle: {
              barBorderRadius: 5,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 8,
              shadowOffsetY: 8,
              color: params => {
                // 对每个bar显示一种颜色
                var idx = params.dataIndex
                if (idx === 0) {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#FC4D60' }
                  ])
                } else {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#1B9AFF' }
                  ])
                }
              }
            },
            data: TData
          }]
        }
        // 条形图2
        const total2 = resData.bar2_total
        const dataArr2 = resData.bar2_data
        const dataAxis2 = dataArr2.map(obj => obj.name)
        const TData2 = dataArr2.map(item => Number(item.value))
        this.optionsR2 = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (datas) {
              // 服务运营占比10%，服务运营数量为100单，总计超时数量为1000单
              var res = datas[0].name + '<br/>'
              var val = datas[0].value
              res += '<span class="formatter0"></span>占比：' + (total2 ? val / total2 * 100 : 0).toFixed(2) + '%<br/>'
              res += '<span class="formatter1"></span>数量：' + val + '<br/>'
              res += '<span class="formatter1"></span>总数：' + total2 + '<br/>'
              return res
            }
          },
          grid: {
            left: '8%',
            right: 40,
            top: 10,
            bottom: 0,
            containLabel: true
          },
          xAxis: {
            show: false,
            xAxisIndex: 1,
            splitNumber: 3,
            type: 'value',
            nameGap: 30,
            axisTick: {
              show: true
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#fff',
                fontSize: 10
              }
            },
            min: function (value) {
              return value.min > 2 ? value.min - 2 : value.min
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'category',
            data: dataAxis2,
            axisTick: {
              show: false
            },
            inverse: true,
            z: 10,
            axisLabel: {
              show: true,
              color: '#fff'
            },
            axisLine: {
              show: false
            }
          },
          series: [{
            type: 'bar',
            barGap: '-100%',
            barWidth: 7,
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: function (params) {
                  var idy = params.dataIndex > 3 ? 3 : params.dataIndex
                  return (
                    '{color' + idy + '|' + TData2[params.dataIndex] + '}'
                  )
                },
                rich: {
                  color0: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color1: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color2: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color3: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  }
                }
              }
            },
            itemStyle: {
              barBorderRadius: 5,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 8,
              shadowOffsetY: 8,
              color: params => {
                // 对每个bar显示一种颜色
                var idx = params.dataIndex
                if (idx === 0) {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#FC4D60' }
                  ])
                } else {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#1B9AFF' }
                  ])
                }
              }
            },
            data: TData2
          }]
        }
        // 条形图4
        const total3 = resData.bar3_total
        const dataArr3 = resData.bar3_data
        const dataAxis3 = dataArr3.map(obj => obj.name)
        const TData3 = dataArr3.map(item => Number(item.value))
        this.optionsR4 = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (datas) {
              // 服务运营占比10%，服务运营数量为100单，总计超时数量为1000单
              var res = datas[0].name + '<br/>'
              var val = datas[0].value
              res += '<span class="formatter0"></span>占比：' + (total3 ? val / total3 * 100 : 0).toFixed(2) + '%<br/>'
              res += '<span class="formatter1"></span>数量：' + val + '<br/>'
              res += '<span class="formatter1"></span>总数：' + total3 + '<br/>'
              return res
            }
          },
          grid: {
            left: '8%',
            right: 40,
            top: 10,
            bottom: 0,
            containLabel: true
          },
          xAxis: {
            show: false,
            xAxisIndex: 1,
            splitNumber: 3,
            type: 'value',
            nameGap: 30,
            axisTick: {
              show: true
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#fff',
                fontSize: 10
              }
            },
            min: function (value) {
              return value.min > 2 ? value.min - 2 : value.min
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'category',
            data: dataAxis3,
            axisTick: {
              show: false
            },
            inverse: true,
            z: 10,
            axisLabel: {
              show: true,
              color: '#fff'
            },
            axisLine: {
              // 分割线
              show: false
            }
          },
          series: [{
            type: 'bar',
            barGap: '-100%',
            barWidth: 7,
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: function (params) {
                  var idy = params.dataIndex > 3 ? 3 : params.dataIndex
                  return (
                    '{color' + idy + '|' + TData3[params.dataIndex] + '}'
                  )
                },
                rich: {
                  color0: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color1: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color2: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color3: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  }
                }
              }
            },
            itemStyle: {
              barBorderRadius: 5,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 8,
              shadowOffsetY: 8,
              color: params => {
                // 对每个bar显示一种颜色
                var idx = params.dataIndex
                if (idx === 0) {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#FC4D60' }
                  ])
                } else {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#1B9AFF' }
                  ])
                }
              }
            },
            data: TData3
          }]
        }
        // 条形图3
        const total4 = resData.bar4_total
        const dataArr4 = resData.bar4_data
        const dataAxis4 = dataArr4.map(obj => obj.name)
        const TData4 = dataArr4.map(item => Number(item.value))
        this.optionsR3 = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (datas) {
              // 服务运营占比10%，服务运营数量为100单，总计超时数量为1000单
              var res = datas[0].name + '<br/>'
              var val = datas[0].value
              res += '<span class="formatter0"></span>占比：' + (total4 ? val / total4 * 100 : 0).toFixed(2) + '%<br/>'
              res += '<span class="formatter1"></span>数量：' + val + '<br/>'
              res += '<span class="formatter1"></span>总数：' + total4 + '<br/>'
              return res
            }
          },
          grid: {
            left: '8%',
            right: 40,
            top: 10,
            bottom: 0,
            containLabel: true
          },
          xAxis: {
            show: false,
            xAxisIndex: 1,
            splitNumber: 3,
            type: 'value',
            nameGap: 30,
            axisTick: {
              show: true
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#fff',
                fontSize: 10
              }
            },
            min: function (value) {
              return value.min > 2 ? value.min - 2 : value.min
            },
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'category',
            data: dataAxis4,
            axisTick: {
              show: false
            },
            inverse: true,
            z: 10,
            axisLabel: {
              show: true,
              color: '#fff'
            },
            axisLine: {
              // 分割线
              show: false
            }
          },
          series: [{
            type: 'bar',
            barGap: '-100%',
            barWidth: 7,
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: function (params) {
                  var idy = params.dataIndex > 3 ? 3 : params.dataIndex
                  return (
                    '{color' + idy + '|' + TData4[params.dataIndex] + '}'
                  )
                },
                rich: {
                  color0: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color1: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color2: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  },
                  color3: {
                    color: '#FFF',
                    fontSize: 12,
                    verticalAlign: 'bottom',
                    padding: 15
                  }
                }
              }
            },
            itemStyle: {
              barBorderRadius: 5,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 8,
              shadowOffsetY: 8,
              color: params => {
                // 对每个bar显示一种颜色
                var idx = params.dataIndex
                if (idx === 0) {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#FC4D60' }
                  ])
                } else {
                  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                    { offset: 0, color: '#FFF' },
                    { offset: 1, color: '#1B9AFF' }
                  ])
                }
              }
            },
            data: TData4
          }]
        }
        // 处理页面大小改变
        window.onresize = () => {
          setTimeout(() => {
            for (let i = 1; i <= 9; i++) {
              var str = 'chart' + i
              this.$refs[str].resize()
            }
          }, 500)
        }
        // 定时器请求
        const settimeoutTime = Number(resData.settimeout) * 1000
        clearInterval(this.Interval)
        if (this.$route.meta.component === 'monitor/flexible/AbnormalScreenMonitor' || this.$route.query.view === 'monitor/flexible/AbnormalScreenMonitor') {
          this.runtime(settimeoutTime)
        }
      }).catch(() => {
        this.getApiData()
      })
    },
    btnClick (index) {
      this.clickIndex = index
      this.loading = true
      if (index === 0) { // 近一周
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        // start为7天前的日期，end为当前日期；若想获取一月前的日期，将7给为30即可
        this.starttime = start
      } else if (index === 1) { // 近一月
        const now = new Date()
        now.setMonth(now.getMonth() - 1)
        this.starttime = now
      } else if (index === 2) { // 近三月
        const now = new Date()
        now.setMonth(now.getMonth() - 3) // 近3月--距离当前日期的前3个月的时间点 如2020-12-28
        this.starttime = now
      }
      this.getApiData()
    }
  }
}
</script>
<style scoped>
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
  padding-top: 20px;
}
.topLogo .topLogo img{
  padding-top: 28px;/*logo图片*/
}
.left,.right{
  margin-top: -43px;
}
.left-item{
  text-align: center;
  width: 320px;
  height: 217px;
  margin: 30px 25px;
  background-size: 100% 100%;
  background-image: url('../assets/image/kuang.png');
}
.title{
  font-size: 16px;
  color: #00ECFF;
  padding-top: 3px;
  letter-spacing: 5px;
}
/* 饼图 */
.chartsContent{
  margin: 0 auto;
  padding-top: 10px;
  width: 100%;
  height: 182px; /*设置高度 大小跟着变*/
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
  margin-bottom: 80px;
}
.btnItem{
  width: 132px;
  height: 54px;
  cursor: pointer;
  margin: 0 8px;
  color: #FFF;
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
  width: 884px;
  height: 766px;
}
.footer{
  text-align: center;
  font-size: 15px;
  color: #4A96FD;
  padding-bottom: 10px;
}
</style>
