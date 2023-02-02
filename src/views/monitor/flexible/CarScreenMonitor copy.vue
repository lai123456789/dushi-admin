<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="bg">
      <div class="topLogo">
        <img src="../assets/image/chengya/logo.png" alt="">
        <!-- <div style="height: 53px; padding-top: 16px; font-size: 44px; color: #00ECFF; margin-bottom: 24px">成压数字化服务管理平台</div> -->
      </div>
      <!-- <div class="time">{{ timeNow }}</div> -->
      <div class="container">
        <div class="center">
          <div class="centerIcon">车辆实时工作状态</div>
          <baidu-map @ready="handler" style="height: 100%; width: 100%" :scroll-wheel-zoom="true"></baidu-map>
          <div class="msg">
            <div class="msg1">
              <span class="title">作业车辆数量</span>
              <span class="number">
                <span class="val">1</span>
                <span class="val">4</span>
              </span>
              <span class="text">辆</span>
            </div>
            <div class="msg2">
              <span class="title">闲置车辆数量</span>
              <span class="number">
                <span class="val">3</span>
              </span>
              <span class="text">辆</span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="contentItem">
            <div class="title">车辆使用率</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR1" style="width: 100%; height: 100%;" ref="chart2"/>
            </div>
          </div>
          <div class="contentItem">
            <div class="title">车辆各地分布</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR2" style="width: 100%; height: 100%;" ref="chart3"/>
            </div>
          </div>
          <div class="contentItem">
            <div class="title">今日出车情况</div>
            <div class="chartsContent">
              <vueEcharts :auto-resize="true" :options="optionsR3" style="width: 100%; height: 100%;" ref="chart4"/>
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
// 自定义地图颜色json文件
import json from '../assets/json/CarScreenMonitorMap.js'
// 静态数据
import resData from '../assets/json/CarScreenMonitorData.js'
import BaiduMap from 'vue-baidu-map'
import Vue from 'vue'
Vue.use(BaiduMap, {
  ak: 'EfdtxhiiyTkj5itjSANiZOkKriF3Ignn'
})
export default {
  components: {
    echarts,
    vueEcharts
  },
  data () {
    return {
      resData: resData,
      json: json,
      timeNow: '',
      loading: true,
      starttime: '',
      centerData: {
        history_count: '',
        today_count: '',
        today_end_count: ''
      },
      Interval: null,
      initNum: 0,
      optionsR1: {},
      optionsR2: {},
      optionsR3: {}
    }
  },
  activated () {
    // 页面刷新默认加载近一月的数据
    if (this.initNum !== 0) {
      this.getCarInfo()
    }
  },
  mounted () {
    this.timeNow = this.moment().format('YYYY-MM-DD HH:mm:ss') // 当前时间
    this.getCarInfo()
  },
  // 销毁循环
  deactivated () {
    clearInterval(this.Interval)
  },
  methods: {
    // 初始化地图实例
    handler ({ BMap, map }) {
      const mapStyle = {
        styleJson: this.json
      }
      map.setMapStyle(mapStyle)
      var point = new BMap.Point(104.065735, 30.659462)
      map.centerAndZoom(point, 9)
      map.setCurrentCity('成都')
      map.enableScrollWheelZoom() // 启用滚轮放大缩小
      var topLeftNavigation = new BMap.NavigationControl() // 左上角，添加默认缩放平移控件
      map.addControl(topLeftNavigation)
      var dataInfo = []
      var cs = { lng: 104.065735, lat: 30.659462 }
      var xx = { lng: 102.739735, lat: 32.314296 }
      var lngSpan = Math.abs(cs.lng - xx.lng)
      var latSpan = Math.abs(xx.lat - cs.lat)
      for (var x = 0; x < 25; x++) {
        dataInfo.push({
          lng: (xx.lng + lngSpan * (Math.random() * 1.3)),
          lat: (cs.lat - latSpan * (Math.random() * 0.3)),
          name: '车牌号' + (x + 1),
          content: '1、车辆：川A  99999，负责司机：张三\n' +
                    '2、本次服务项目：半年保\n' +
                    '3、当前工单进度：待工程师精度性能检测  【进度查询】\n' +
                    '4、主修工程师：小王，辅修工程师：张三/李四\n' +
                    '5、机组运行状态：运行\n' +
                    '6、累计运行时间：1年2个月22天\n' +
                    '7、投产时间：2020-01-02'
        })
      }
      this.storeMap(BMap, map, dataInfo)
    },
    // 地图标注车辆
    storeMap (BMap, map, dataInfo) {
      map.clearOverlays()
      for (var i = 0; i < dataInfo.length; i++) {
        var myIcon = new BMap.Icon(require('../assets/image/car.png'), new BMap.Size(30, 30))
        var marker = new BMap.Marker(new BMap.Point(dataInfo[i].lng, dataInfo[i].lat), {
          icon: myIcon,
          title: dataInfo[i].content
        })
        var label = new BMap.Label(dataInfo[i].name, { offset: new BMap.Size(0, -20) })
        label.setStyle({
          color: '#00ECFF',
          fontSize: '12px',
          background: '#03286F',
          padding: '4px',
          border: '1px solid #15439D'
        })
        marker.setLabel(label)
        map.addOverlay(marker) // 将标注添加到地图中
        this.addClickHandler(BMap, map, marker, i, dataInfo[i].name)
      }
    },
    // 点击车辆事件
    addClickHandler (BMap, map, marker, i, name) {
      marker.addEventListener('click', function (e) {
        var p = e.target
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat)
        var p1 = new BMap.Point(p.getPosition().lng - 0.025, p.getPosition().lat + 0.025)
        // var p2 = new BMap.Point(p.getPosition().lng - 0.05, p.getPosition().lat + 0.025)
        var p2 = new BMap.Point(109.15784, 30.1545451)
        var p3 = new BMap.Point(p.getPosition().lng - 0.05, p.getPosition().lat)
        var p4 = new BMap.Point(p.getPosition().lng - 0.05, p.getPosition().lat - 0.025)
        var p5 = new BMap.Point(p.getPosition().lng, p.getPosition().lat - 0.025)
        console.log('p', p)
        console.log('p1', p1)
        console.log('p2', p2)
        var driving = new BMap.DrivingRoute(map, {
          renderOptions: { map: map, autoViewport: true },
          onMarkersSet: function (res) {
          }
        })
        // 设置轨迹路线颜色
        driving.setSearchCompleteCallback(() => {
          var plan = driving.getResults().getPlan(0)
          for (var i = 0; i < plan.getNumRoutes(); i++) {
            var pts = plan.getRoute(i).getPath()
            var polyline = new BMap.Polyline(pts, { strokeColor: '#32DBF3', strokeWeight: 2, strokeOpacity: 1 })
            map.addOverlay(polyline)
          }
        })
        // 绘制轨迹线
        driving.search(point, p5, { waypoints: [p1, p2, p3, p4] })// waypoints表示途经点
      })
    },
    getCarInfo () {
      const resData = this.resData
      // 初始值改变 后续每次切换进入此页面会继续请求定时器
      this.initNum++
      this.loading = false
      this.optionsR1 = {
        tooltip: {
          formatter: '{b} : {c}%',
          textStyle: {
            color: '#FFF'
          }
        },
        series: [{
          title: {
            // 隐藏标题文字
            show: false
          },
          type: 'gauge',
          center: ['50%', '50%'],
          radius: '75%', // 仪表盘大小
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
            color: '#00ECFF',
            fontSize: 22,
            // 位置偏移
            offsetCenter: [0, '70%']
          },
          data: resData.data_chart5
        }]
      }
      this.optionsR2 = {
        color: ['#32DBF3', '#1B9AFF', '#F9387F', '#32DCC4', '#1B9C9A', '#90BCB6', '#10CBF3', '#30CBF9'], // 颜色
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>{d}%' // 鼠标悬浮的显示
        },
        series: [{
          name: '车辆各地分布',
          type: 'pie',
          animationEasing: 'cubicInOut', // 动画
          animationDuration: 1000,
          radius: ['25%', '50%'], // 圆圈大小
          center: ['50%', '45%'],
          data: resData.data_chart3.data,
          labelLine: { // 图形外文字线
            normal: {
              length: 20,
              length2: 30
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
              fontSize: 14,
              // 图形外文字上下显示
              formatter: '{b}{d}%',
              borderWidth: 20,
              borderRadius: 4,
              // 文字和图的边距
              padding: [0, 0]
            }
          }
        }]
      }
      const dataName = ['车辆作业中', '今日出发', '今日返回']
      const dataValue = [333, 116, 888]
      this.optionsR3 = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#384757'
            }
          }
        },
        grid: {
          left: '20%',
          bottom: '30%'
        },
        xAxis: [{
          type: 'category',
          axisPointer: {
            type: 'shadow'
          },
          axisLine: {
            lineStyle: {
              color: '#8ac9ff'
            }
          },
          axisLabel: {
            // 文字倾斜40度显示
            // rotate: 40,
            textStyle: {
              fontSize: 14,
              color: '#00ECFF'
            }
          },
          axisTick: {
            // x轴刻度线
            show: false
          },
          data: dataName // resData.data_chart6.name
        }],
        yAxis: [{
          name: '数量',
          type: 'value',
          min: 0,
          axisLabel: {
            show: true,
            textStyle: {
              color: '#00ECFF'
            }
          },
          splitArea: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#8ac9ff'
            }
          },
          splitLine: {
            show: false
          }
        }],
        series: [{
          name: '数量',
          type: 'bar',
          barWidth: 20,
          itemStyle: {
            normal: {
              color: ['#00ECFF'],
              barBorderRadius: [30, 30, 0, 0],
              label: {
                show: true,
                position: 'top',
                formatter: '{c}',
                textStyle: {
                  color: '#00ECFF'
                }
              }
            }
          },
          data: dataValue// resData.data_chart6.value
        }]
      }
      // 处理页面大小改变
      window.onresize = () => {
        setTimeout(() => {
          for (let i = 2; i <= 4; i++) {
            const str = 'chart' + i
            this.$refs[str].resize()
          }
        }, 500)
      }
      // 定时器请求
      clearInterval(this.Interval)
      if (this.$route.meta.component === 'monitor/flexible/CarScreenMonitor' || this.$route.query.view === 'monitor/flexible/CarScreenMonitor') {
        this.runtime(Number(resData.settimeout) * 1000)
      }
    },
    // 定时器
    runtime (time) {
      this.Interval = setTimeout(() => {
        this.getCarInfo()
      }, time)
    }
  }
}
</script>
<style lang="less" scoped>
/deep/.anchorBL{
  display: none;
}
.bg{
  background-image: url('../assets/image/backgroundNew.jpg');
  background-size: 100% 100%;
  background-position: center center;
  width: 100%;
  min-height: 100vh;
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
  display: flex;
  justify-content: space-between;
  height: 100%;
  margin-top: -34px;
}
.topLogo{
  text-align: center;
}
.topLogo img{
  padding-top: 22px;/*logo图片*/
}
.container .center{
  flex: 1;
  height: 900px;
  margin: 48px 0px 60px 24px;
  background-size: 100% 100%;
  padding: 24px;
  background: #03174C;
  border: 1px solid #00B9FD;
  position: relative;
}
.container .center .centerIcon{
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #00ECFF;
  background-image: url('../assets/image/centerTitleIcon.png');
  background-size: 100% 100%;
  position: absolute;
  top: -24px;
  left: 60px;
  padding: 0 12px;
  height: 40px;
}
.container .center .msg{
  background-image: url('../assets/image/tongji.png');
  background-size: 100% 100%;
  position: absolute;
  left: 90px;
  top: 80px;
  z-index: 999;
  color: #ffffff;
  .msg1,.msg2{
    padding: 10px 20px;
    .title,.text{
      font-size: 20px;
      line-height: 32px;
      color: #00ECFF;
      text-shadow: 0 0 0.1em #caf4fe, 0 0 0.1em #caf4fe;
    }
    .text{
      margin-left: 8px;
    }
    .number{
      font-size: 30px;
      color: #09152D;
      text-align: center;
      line-height: 32px;
      .val{
        margin-left: 8px;
        font-size: 32px;
        border: 1px solid #00ECFF;
        color: #00ECFF;
      }
    }
  }
}
.container .right{
  margin-top: -16px;
}
.container .right .contentItem{
  text-align: center;
  width: 400px;
  height: 275px;
  margin: 46px 25px;
  background-size: 100% 100%;
  background-image: url('../assets/image/kuang.png');
}
.container .right .contentItem .title{
  font-size: 16px;
  color: #00ECFF;
  padding-top: 8px;
  letter-spacing: 2px;
}
/* 饼图 */
.container .right .contentItem .chartsContent{
  margin: 0 auto;
  width: 100%;
  height: 267px;
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
