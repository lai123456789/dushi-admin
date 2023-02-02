<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="bg">
      <div class="topLogo">
        <img src="../assets/image/chengya/logo.png" alt="">
      </div>
      <div class="text">
        <div>{{ timeNow }}</div>
        <div>已运行334天</div>
      </div>
      <div class="container">
        <div class="left">
          <div class="contentItem">
            <div class="itemTitle">
              <div></div>
              <div class="title">人员分布</div>
            </div>
            <div class="chartsContentUser">
              <vueEcharts :auto-resize="true" :options="optionsL1" style="width: 100%; height: 100%;" ref="chart1"/>
            </div>
            <div class="chartsTable" style="margin-top: 8px;">
              <a-table
                :bordered="false"
                :rowKey="(record, index) => index"
                :columns="columnsL1"
                :dataSource="dataR1"
                :pagination="{
                  pageSize: 3,
                  itemRender: itemRender
                }"
              >
              </a-table>
            </div>
          </div>
          <div class="contentItem" style="position: relative">
            <div class="itemTitle">
              <div></div>
              <div class="title">车辆分布</div>
            </div>
            <div class="chartsContentCar">
              <vueEcharts :auto-resize="true" :options="optionsL2" style="width: 100%; height: 100%;" ref="chart2"/>
            </div>
            <div class="chartsTable chartsCar">
              <a-table
                :rowKey="(record, index) => index"
                :columns="columnsL2"
                :dataSource="dataR2"
                :pagination="{
                  pageSize: 3,
                  itemRender: itemRender
                }"
              >
              </a-table>
            </div>
          </div>
        </div>
        <div class="center">
          <div class="chartsContentMap">
            <baidu-map
              ref="chart7"
              @ready="handler"
              style="height: 100%; width: 100%"
              :scroll-wheel-zoom="true">
            </baidu-map>
          </div>
          <div class="contentCenter">
            <a-form>
              <a-row type="flex" style="border-bottom: 1px solid #162D78">
                <a-col v-bind="colLayout">
                  <a-form-item label="机组型号" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <div style="color: #FFF; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ selectMapIconData.jzxh || '无' }}</div>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="机组运行状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <div style="color: #FFF">{{ selectMapIconData.jzyhzt || '无' }}</div>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="本次服务项目" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <div style="color: #FFF">{{ selectMapIconData.fwxm || '无' }}</div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row type="flex" style="border-bottom: 1px solid #162D78">
                <a-col v-bind="colLayout">
                  <a-form-item label="驻地车辆" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <div style="color: #FFF; overflow: hidden; text-overflow: ellipsis; white-space: nowrap" :title="selectMapIconData.cph || '无'">
                      {{ selectMapIconData.cph || '无' }}
                    </div>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="主修工程师" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <div style="color: #FFF">{{ selectMapIconData.zxgcs || '暂未派工' }}</div>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="当前工单进度" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <div style="color: #FFF; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                      {{ selectMapIconData.lczt || '无' }}
                      <span v-if="selectMapIconData.lczt">
                        [<a
                          @click="search">
                          <span style="color: #1E8CFF">进度查询</span>
                        </a>]
                      </span>
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <div style="padding: 14px 48px; display: flex; align-items: center">
              <a-icon type="file-search" :style="{ color: '#FFF' }"/>
              <div style="font-size: 14px; margin-left: 8px; color: #FFF">搜索结果: 当前地图展示机组数据 {{ jizuNum }} 台</div>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="contentItemR1">
            <div class="itemTitle">
              <div></div>
              <div class="title">任务信息</div>
            </div>
            <div class="taskContent">
              <div class="taskItem" @click="taskData('finish')">
                <img src="../assets/image/chengya/task2.png" alt="" style="width: 55px; height: 55px;">
                <div class="num2" v-if="allData">{{ allData.rwlb.ywc }}</div>
                <div class="tastText2">已完成任务</div>
              </div>
              <div class="taskItem" @click="taskData('proceed')">
                <img src="../assets/image/chengya/task1.png" alt="" style="width: 55px; height: 55px;">
                <div class="num1" v-if="allData">{{ allData.rwlb.jxz }}</div>
                <div class="tastText1">正在进行任务</div>
              </div>
            </div>
          </div>
          <div class="contentItemR2">
            <div class="itemTitle">
              <div></div>
              <div class="title">分布排名</div>
              <div style="display: flex; flex: 1; justify-content: flex-end; align-items: center; padding-left: 32px">
                <span style="color: #088EFF; white-space: nowrap;">
                  <span style="margin-right: 4px">●</span>
                  <span>已安装机组</span>
                </span>
              </div>
            </div>
            <div class="itemR2Content">
              <a-table
                v-if="dataRight.length > 0"
                :showHeader="false"
                :rowKey="(record, index) => index"
                :columns="columnsRight"
                :dataSource="dataRight"
                :pagination="{
                  pageSize: 11,
                  itemRender: itemRender
                }">
                <div slot="yazjzsl" slot-scope="text">
                  <span style="color: #2099FF">{{ text }}</span>
                </div>
                <div slot="sz" slot-scope="text">
                  <a-progress
                    :stroke-color="{
                      '0%': '#0053B9',
                      '100%': '#6DCDE6',
                    }"
                    :percent="Number(text)"
                    :show-info="false"
                    :title="Number(text) + '%'"
                  />
                </div>
              </a-table>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="footer">技术支持：深圳市笃实科技有限公司</div> -->
    </div>
    <div v-viewer v-if="showImg">
      <img src="../assets/image/chengya/close.png">
    </div>
    <!-- 任务列表组件 -->
    <TaskScreem ref="TaskScreem"/>
  </a-spin>
</template>

<script>
/* eslint-disable */
import { mapGetters } from 'vuex'
import echarts from 'echarts'
import vueEcharts from 'vue-echarts'
// 自定义地图颜色json文件
import json from '../assets/json/MaintenanceScreemMonitorMap.js'
// 静态数据
import BaiduMap from 'vue-baidu-map'
import BMapLib from 'BMapLib'
// import mapv from 'mapv' 无需引入  已在 public/index.html  引入js文件链接 在vue.config.js 需要配置 这三个地图参数：BMap、BMapLib、mapv
import Vue from 'vue'
Vue.use(BaiduMap, {
  ak: 'EfdtxhiiyTkj5itjSANiZOkKriF3Ignn'
})
export default {
  components: {
    echarts,
    vueEcharts,
    TaskScreem: () => import('@/views/crm/TaskScreem'),
  },
  data () {
    return {
      map: null,
      BMap: null,
      infoBox: null,
      // 接口返回的所有数据
      allData: '',
      showImg: false,
      jizuNum: 0,
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
      colLayout: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 8 },
      // 人员分布
      columnsL1: [ {
        title: '序号',
        dataIndex: 'idSort',
        className: 'headClass',
        width: 50,
        align: 'center'
      }, {
        title: '姓名',
        dataIndex: 'xm',
        className: 'headClass',
        align: 'center'
      }, {
        title: '部门',
        dataIndex: 'ssbm',
        className: 'headClass',
        align: 'center'
      }, {
        title: '分公司',
        dataIndex: 'ssfgs',
        className: 'headClass',
        align: 'center'
      }],
      dataR1: [{
        idSort: '1',
        xm: '向佳杰',
        ssbm: '服务事业部',
        ssfgs: '长庆分公司'
      }, {
        idSort: '2',
        xm: '李树海',
        ssbm: '服务事业部',
        ssfgs: '长庆分公司'
      }, {
        idSort: '3',
        xm: '肖峰',
        ssbm: '服务事业部',
        ssfgs: '长庆分公司'
      }, {
        idSort: '4',
        xm: '温加明',
        ssbm: '服务事业部',
        ssfgs: '长庆分公司'
      }],
      // 车辆分布
      columnsL2: [ {
        title: '序号',
        dataIndex: 'idSort',
        className: 'headClass',
        width: 50,
        align: 'center'
      }, {
        title: '姓名',
        dataIndex: 'sjxm',
        className: 'headClass',
        align: 'center'
      }, {
        title: '车牌号',
        dataIndex: 'cph',
        className: 'headClass',
        align: 'center'
      }, {
        title: '分公司',
        dataIndex: 'ssfgs',
        className: 'headClass',
        align: 'center'
      }],
      dataR2: [{
        idSort: '01',
        sjxm: '彭 勇',
        cph: '川A1UG10',
        ssfgs: '西南分公司'
      }, {
        idSort: '02',
        sjxm: '蔡 强',
        cph: '川ANW787',
        ssfgs: '西南分公司'
      }, {
        idSort: '03',
        sjxm: '邓泽义',
        cph: '川A2A40P',
        ssfgs: '西南分公司'
      }, {
        idSort: '04',
        sjxm: '卢卓海',
        cph: '川A7F90A',
        ssfgs: '西南分公司'
      }],
      // 城市分布排名
      columnsRight: [ {
        title: '序号',
        dataIndex: 'idSort',
        className: 'headClass',
        align: 'center'
      }, {
        title: '城市',
        dataIndex: 'azddshx',
        className: 'headClass',
        align: 'center',
        width: 150
      }, {
        title: '已安装机组数量',
        dataIndex: 'ywc',
        className: 'headClass',
        align: 'center',
        scopedSlots: { customRender: 'yazjzsl' }
      }, {
        title: '数值',
        dataIndex: 'sz',
        className: 'headClass',
        align: 'center',
        width: 240,
        scopedSlots: { customRender: 'sz' }
      }],
      dataRight: [],
      timeNow: '',
      json: json,
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
      optionsL1: {
        color: ['#1B9AFF', '#FB9341', '#32DBF3', '#604DFE', '#FC5976', '#3C6BFF'],
        // 圆点中间文字
        title: {
          text: `人`,
          textAlign: 'center',
          textStyle: {
            color: '#ffffff',
            lineHeight: 25,
            fontSize: 16
          },
          x: '30%',
          y: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}'
        },
        legend: {
          textStyle: {
            color: '#8AC9FF',
            fontSize: 12
          },
          orient: 'vertical',
          right: 50, // 图例栏偏移
          top: 20,
          formatter: function (name) {
            return name
          }
        },
        series: [{
          name: '人员分布',
          type: 'pie',
          right: 140, // 图形偏移
          // 调整大小 内环半径大小 以及 整体饼图大小
          radius: ['50%', '80%'],
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
          data: [
            { name: '西南分公司', value: 93 },
            { name: '东部分公司', value: 28 },
            { name: '新疆分公司', value: 26 },
            { name: '长庆分公司', value: 67 }
          ]
        }]
      },
      optionsL2: {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: 70,
          bottom: '60%',
          top: 10
        },
        xAxis: [{
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#8ac9ff'
            }
          },
          axisLabel: {
            rotate: 40,
            textStyle: {
              fontSize: 10
            }
          },
          axisTick: {
            // x轴刻度线
            show: false
          },
          data: ['西南分公司', '东部分公司', '新疆分公司', '长庆分公司']
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
        }],
        series: [{
          name: '数量',
          type: 'bar',
          barWidth: 15,
          // radius: ['50%', '100%'],
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#25BAEA'
              }, {
                offset: 1,
                color: '#0066CF'
              }]),
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
          data: [
            { name: '西南分公司', value: 5 },
            { name: '东部分公司', value: 5 },
            { name: '新疆分公司', value: 16 },
            { name: '长庆分公司', value: 8 }
          ]
        }]
      },
      selectMapIconData: {},
      optionsMap: {},
      optionsR1: {},
      optionsR2: {},
      optionsR3: {}
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {
    taskData(status){
      this.$refs.TaskScreem.show({
        status: status,
        title: status === 'proceed' ? '正在进行中任务' : '已完成任务'
      })
    },
    search () {
      // window.open(setting.webUrl + 'public/upload/jdcx.png')
      const url = `${process.env.VUE_APP_BASE_URL}loadPage/?view=crm/ProgressSearch&order_number=${this.selectMapIconData.gdbh}`
      window.open(url)
    },
    // 设置分页器
    itemRender (current, type, originalElement) {
      if (type === 'prev') {
        return <a>←</a>
      } else if (type === 'next') {
        return <a>→</a>
      }
      return originalElement
    },
    // 初始化地图实例
    handler ({ BMap, map }) {
      const mapStyle = {
        styleJson: this.json
      }
      map.setMapStyle(mapStyle)
      var point = new BMap.Point(104.065735, 30.659462)
      // 中心点的缩放比例 默认8
      map.centerAndZoom(point, 6)
      map.setCurrentCity('成都')
      map.enableScrollWheelZoom() // 启用滚轮放大缩小
      var topLeftNavigation = new BMap.NavigationControl() // 左上角，添加默认缩放平移控件
      map.addControl(topLeftNavigation)
      this.BMap = BMap
      this.map = map
    },
    // 动态河流
    mapvLine (qianxiData,ssfgs) {
      var lineData = [] // 线
      var timeData = [] // 动画
      for (var i = 0; i < qianxiData.length; i++) {
        var fromColumn = 'from'
        var toColumn = 'to'
        var fromCenter = qianxiData[i][fromColumn]
        var toCenter = qianxiData[i][toColumn]
        if (!fromCenter || !toCenter) {
          continue
        }
        let curve = mapv.utilCurve.getPoints([fromCenter, toCenter]) // 弧线图层
        for (var j in curve) {
          timeData.push({
            geometry: {
              type: 'Point',
              coordinates: curve[j]
            },
            count: 1,
            time: j
          })
        }
        lineData.push({
          geometry: {
            type: 'LineString',
            coordinates: curve
          }
        })
      }
      var lineDataSet = new mapv.DataSet(lineData)
      var lineOptions = {
        // globalCompositeOperation: 'lighter',
        // gradient: {
        //   0: 'rgba(64,158,255, 1)',
        //   1: 'rgba(64,158,255, 1)'
        // },
        strokeStyle: ssfgs === '东部分公司' ? '#1B9AFF' : ssfgs === '新疆分公司' ? '#FB9341' : ssfgs === '西南分公司' ? '#32DBF3' : '#604DFE',
        shadowColor: 'rgba(255, 250, 250, 0.7)',
        shadowBlur: 2,
        lineWidth: 2,
        zIndex: 100,
        draw: 'simple'        
      }
      this.lineLayer = new mapv.baiduMapLayer(this.map, lineDataSet, lineOptions)
      var timeDataSet = new mapv.DataSet(timeData)
      var pointOptions = {
        fillStyle: 'rgba(255, 250, 250, 0.5)',
        zIndex: 150,
        size: 2,
        animation: {
          type: 'time',
          stepsRange: {
            start: 0,
            end: 50
          },
          trails: 10,
          duration: 2
        },
        draw: 'simple'
      }
      let timeMapvLayer = new mapv.baiduMapLayer(this.map, timeDataSet, pointOptions)
    },
    getJizuPoint (value) {
      return new Promise((resolve, reject) => {
        var myGeo = new BMap.Geocoder();
        //中文 省市区详细地址 转成 经纬度
        myGeo.getPoint(value, (point) => {
          resolve(point)
        })
      })
    },
    // 地图标注图标
    async storeMap (BMap, map, dataInfo) {
      map.clearOverlays()
      const fgsData = [ // 各所属分公司的位置经纬度
        { lng: 104.281397, lat: 30.562698, name: '西南分公司' },
        { lng: 116.810575, lat: 38.588465, name: '东部分公司' },
        { lng: 86.181494, lat: 41.732373, name: '新疆分公司' },
        { lng: 108.824435, lat: 38.610027, name: '长庆分公司' }
      ]
      for (const x in fgsData) {
        let iconfgs = ''
        if (fgsData[x].name === '西南分公司') {
          iconfgs = 'iconfengongsi'
        } else if (fgsData[x].name === '东部分公司') {
          iconfgs = 'iconfengongsidb'
        } else if (fgsData[x].name === '新疆分公司') {
          iconfgs = 'iconfengongsixj'
        } else if (fgsData[x].name === '长庆分公司') {
          iconfgs = 'iconfengongsicq'
        }
        var markerfengongsi = new BMap.Marker(new BMap.Point(fgsData[x].lng, fgsData[x].lat), {
          icon: new BMap.Icon(require(`../assets/image/chengya/${iconfgs}.png`), new BMap.Size(48, 48))
        })
        map.addOverlay(markerfengongsi) //  将分公司图标标注添加到地图中
      }
      for (var i = 0; i < dataInfo.length; i++) {
        var icon1 = ''
        if (dataInfo[i].status === '异常运行') {
          icon1 = new BMap.Icon(require('../assets/image/chengya/icon02.gif'), new BMap.Size(38, 48), {
            anchor: new BMap.Size(10, 30),
            imageOffset: new BMap.Size(0, 10)
          })
        }
        if (dataInfo[i].status === '正常运行') {
          icon1 = new BMap.Icon(require('../assets/image/chengya/icon01.gif'), new BMap.Size(38, 48))
        }
        if (dataInfo[i].status === '待运行') {
          icon1 = new BMap.Icon(require('../assets/image/chengya/icon00.gif'), new BMap.Size(38, 48))
        }
        if (dataInfo[i].status === '') {
          icon1 = new BMap.Icon(require('../assets/image/chengya/icon.png'), new BMap.Size(38, 48))
        }
        let jizuPoint = await this.getJizuPoint(dataInfo[i].data.azdd + dataInfo[i].data.azxxdz)
        var marker = new BMap.Marker(new BMap.Point(jizuPoint.lng, jizuPoint.lat), {
          icon: icon1,
          setTop: true,
          setZIndex: 9999999999
        })
        map.addOverlay(marker) // 将机组图标标注添加到地图中
        // 点击图标弹窗
        this.openClick(BMap, map, marker, jizuPoint.lat, jizuPoint.lng, dataInfo[i].data)
        /** 开始绘制线段 *****************************/
        const ssfgs = dataInfo[i].data.azdw
        let array = [] //弧线
        let obj = {
          from: {
          lng: dataInfo[i].fengongsi.lng,
          lat: dataInfo[i].fengongsi.lat
          },
          to: {
            lng: jizuPoint.lng, 
            lat: jizuPoint.lat
          }
        }
        array.push(obj)
        this.mapvLine(array, ssfgs)
      }
    },
    openClick (BMap, map, marker, lng, lat, data) {
      const that = this
      marker.addEventListener('click', function (e) {
        // 关闭其他标记点的弹框
        if (that.infoBox != null) {
          that.infoBox.close()
        }
        that.selectMapIconData = data // 当前选中的弹窗显示内容
        const allJizu = that.allData.zgdt
        const jizuList = allJizu.filter(item => {
          // 判断选择的当前框 机组坐标是否有一致的数据 拼成数组
          return item.jizu.lng == lat && item.jizu.lat == lng
        })
        var html = ''
        for (const i in jizuList) {
          html += `<div class="infoBoxContent" οnclick="imageClick()">
             <div class="infoBoxTitle">累计运行${jizuList[i].data.ljyhsj || ''}小时</div>
             <div class="infoContent">
                <div class="oneDiv">
                  <span> > </span>
                  <span>投产时间：</span>
                  <span>${jizuList[i].data.tysj || ''}</span>
                </div>
                <div class="oneDiv"><span> > </span><span>本次服务项目：</span><span>${jizuList[i].data.fwxm || '无'}</span></div>
                <div class="oneDiv"><span> > </span><span>当前工单进度：</span><span>${jizuList[i].data.lczt || '无'}</span>

                </div>
                <div class="oneDiv"><span> > </span><div class="oneZ">驻地车辆：</div><div>${jizuList[i].data.cph || '无'}</div></div>
                <div class="oneDiv"><span> > </span><span>负责司机：</span><span>${jizuList[i].data.sjxm || '无'}</span></div>
                <div class="rowDiv">
                  <div class="rowTwo"><span> > </span><span>主修工程师：</span><span>${jizuList[i].data.zxgcs || '暂未派工'}</span></div>
                  <div class="rowTwo"><span class="left"> > </span><span>工单编号：</span><span>${jizuList[i].data.gdbh || '无'}</span></div>
                </div>
             </div>
             </div>`
        }
        const opts = {
          // closeIconMargin: '25px 5px 0 0',
          closeIconMargin: '46px 26px 0 0',
          closeIconUrl: require('../assets/image/chengya/close.png'),
          enableAutoPan: true
        // align: 基于哪个位置进行定位，取值为 INFOBOX_AT_TOP 或 INFOBOX_AT_BOTTOM
        }
        that.infoBox = new BMapLib.InfoBox(map, html, opts)
        const point = new BMap.Point(lat, lng)
        const marker1 = new BMap.Marker(point)
        that.infoBox.open(marker1)
      })
    },
    vueImageClick () {
      console.log('弹框中按钮的点击事件')
    },
    getData () {
      this.axios({
        url: '/crm/Order/wbdp',
        timeout: 1 * 60 * 1000 // 请求超时时间1分钟
      }).then(res => {
        this.loading = false
        this.jizuNum = res.result.zgdt.length
        this.allData = res.result
        this.allData.zgdt.forEach(item => {
          let Geo = new BMap.Geocoder();
          let value = item.data.azdd + item.data.azxxdz
          Geo.getPoint(value, (point) => {
            item.jizu = point
          })
        })
        const { kxrytb, kxry, kxcl, kxcltb } = res.result //, csfb
        // 人员列表
        this.optionsL1.series[0].data = kxrytb // 人员分布图表数据
        let kxryNum = 0
        kxrytb.forEach(item => { kxryNum += Number(item.value) })
        this.optionsL1.title.text = kxryNum + '人'
        this.dataR1 = kxry.map((item, index) => { // 人员分布列表数据
          const obj = { ...item, ...{ idSort: index + 1 } }
          return obj
        })
        // 车辆图表分布 暂时不用接口数据
        this.optionsL2.xAxis[0].data = kxcltb.name // 空闲车辆分布图表数据
        this.optionsL2.series[0].data = kxcltb.data
        this.dataR2 = kxcl.map((item, index) => { // 空闲车辆列表数据
          const obj = { ...item, ...{ idSort: index + 1 } }
          return obj
        })
        // 城市分布数据
        // this.dataRight = csfb.map((item, index) => {
        //   let ywcNum = 0
        //   ywcNum += item.ywc
        //   const obj = { ...{ idSort: index + 1 }, ...item, ...{ sz: Math.ceil(item.ywc / ywcNum) * 100 } }
        //   return obj
        // })
        // 地图数据
        const dataInfo = res.result
        dataInfo.zgdt.forEach(item => {
          // 把驻地车辆车牌号和司机姓名拼接在data对象里面
          const cphList = item.clxx.map(subItem => {
            return subItem.cph
          })
          const sjxmList = item.clxx.map(subItem => {
            return subItem.sjxm
          })
          item.data = { ...item.data, ...{ cph: cphList.join('/') }, ...{ sjxm: sjxmList.join('/') } }
        })
        window.localStorage.setItem('data', JSON.stringify(dataInfo))
        const zgdt = dataInfo.zgdt
        this.storeMap(this.BMap, this.map, zgdt)
      })
    }

  },
  mounted () {
    const dataText = [
      { azddshx: '四川省', yazjzsl: 207 },
      { azddshx: '内蒙古自治区', yazjzsl: 105 },
      { azddshx: '新疆维吾尔自治区', yazjzsl: 102 },
      { azddshx: '重庆市', yazjzsl: 70 },
      { azddshx: '山西省', yazjzsl: 55 },
      { azddshx: '陕西省', yazjzsl: 39 },
      { azddshx: '河北省', yazjzsl: 17 },
      { azddshx: '辽宁省', yazjzsl: 12 },
      // { azddshx: '哈萨克斯坦', yazjzsl: 8 },
      // { azddshx: '甘肃省', yazjzsl: 7 },
      { azddshx: '坦桑尼亚', yazjzsl: 3 },
      { azddshx: '黑龙江省', yazjzsl: 4 },
      { azddshx: '青海省', yazjzsl: 4 },
      { azddshx: '山东省', yazjzsl: 3 },
      { azddshx: '海南省', yazjzsl: 3 },
      { azddshx: '河南省', yazjzsl: 1 }
    ]
    let sumArr = 0
    dataText.forEach((item, index) => {
      sumArr += item.yazjzsl
    })
    dataText.forEach((item, index) => {
      const obj = {
        azddshx: item.azddshx, ywc: item.yazjzsl, idSort: (index + 1), sz: Math.ceil(item.yazjzsl / sumArr * 100)
      }
      this.dataRight.push(obj)
    })

    this.timeNow = this.moment().format('YYYY年MM月DD日 HH:mm') // 当前时间
    window.onresize = () => {
      setTimeout(() => {
        this.$refs.chart1.resize()
        this.$refs.chart2.resize()
      }, 500)
    }
    this.getData()
    // 动态添加的dom 调用vue事件
    const _this = this
    window.imageClick = function () {
      _this.vueImageClick()
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/css/font.less';
/deep/.anchorBL{
  display: none;
}
.bg{
  background-image: url('../assets/image/chengya/background.png');
  background-size: 100% 100%;
  background-position: center center;
  width: 100%;
  min-height: 100vh;
  position: relative;
  .text{
    position: absolute;
    display: flex;
    justify-content: space-between;
    width: 100%;
    top: 10px;
    padding: 0 24px;
    color: #4579C0;
  }
}
.container{
  display: flex;
  justify-content: space-between
}
.topLogo{
  text-align: center;
}
.topLogo img{
  padding-top: 22px;
}
.left,.right{
  margin-top: -40px;
  margin-bottom: 46px;
}
.contentItem{
  text-align: center;
  width: 360px;
  height: 467px;
  margin: 20px 25px;
  background-size: 100% 100%;
  background-image: url('../assets/image/chengya/kuang.png');
  .chartsContentUser{
    width: 100%;
    height: 132px;
    // margin-top: -14px;
  }
  .chartsContentCar{
    width: 100%;
    height: 267px;
    margin-top: -14px;
  }
  .chartsCar{
    position: absolute;
    top: 200px;
    width: 100%;
    margin-top: 16px;
  }
}
.contentItemR1{
  text-align: center;
  width: 360px;
  height: 225px;
  margin: 20px 25px;
  background-size: 100% 100%;
  background-image: url('../assets/image/chengya/kuangR1.png');
  .taskContent{
    display: flex;
    justify-content: space-around;
    .taskItem{
      text-align: center;
      cursor: pointer;
      .num1,.num2{
        font-family: 'fontIcon'; //字体图标
        font-size: 42px;
        font-weight: bold;
      }
      .num1{ color: #00FAAC; }
      .num2{ color: #088EFF; }
      .tastText1{ color: #00FAAC; }
      .tastText2{ color: #088EFF; }
    }
  }
}
.contentItemR2{
  text-align: center;
  width: 360px;
  height: 712px;
  margin: 20px 25px;
  background-size: 100% 100%;
  background-image: url('../assets/image/chengya/kuangR2.png');
  /deep/.itemR2Content{
    .ant-progress-inner{
      background-color: #031A53;
    }
  }
}
.itemTitle{
  display: flex;
  align-items: center;
  padding: 30px 24px 16px 24px;
  div:nth-child(1){
    width: 5px;
    height: 17px;
    background: #00ECFF;
    margin-right: 12px;
  }
  .title{
    font-size: 18px;
    color: #00ECFF;
    letter-spacing:2px;
    white-space: nowrap;
  }
}
// 城市分布排行 表格样式
.itemR2Content{
  /deep/.ant-table{
    margin-bottom: 8px;
  }
  /deep/.ant-table-tbody > tr > td{
    margin-bottom: 16px;
    white-space: nowrap;
  }
  /deep/.ant-table-tbody > tr > td:nth-child(1){
    background: #030E2E;
    white-space: nowrap;
  }
  /deep/.ant-table-tbody > tr > td:nth-child(n+2){
    background: #02113C;
    white-space: nowrap;
  }
}
.chartsTable{
  /deep/.ant-pagination-item{
      //每个分页页码数字框
      margin-right: 0;
   }
}
.chartsTable,.itemR2Content{
  padding: 0 20px;
  height: 210px;
  /deep/th.headClass,td.headClass{
    background: linear-gradient(#00BCD7 0%, #006DC1 100%);
    border: none;
    color: white;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  // 表格内容行样式
  /deep/.ant-table-tbody > tr > td{
    border-bottom: 1px solid #0F2567;
    color: #FFF;
    white-space: nowrap;
    height: 46px;
  }
  /deep/.ant-table-tbody > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected) > td {
    background: #03275E;
  }

//滚动条样式
  ::-webkit-scrollbar-track-piece { //滚动条凹槽的颜色，还可以设置边框属性
  background-color:#027BC2;
  }
  ::-webkit-scrollbar {//滚动条的宽度
    width: 9px;
    height: 5px;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-thumb {//滚动条的设置
    background-color:#1059B5;
    background-clip:padding-box;
    min-height:28px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color:#1567CB;
  }
  // 分页器样式
  /deep/.ant-pagination{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    // overflow-x: scroll;
    overflow-x: hidden;
    padding-bottom: 8px;
    // padding-left: 72px;
    .ant-pagination-item-ellipsis{
      //...超过多少页符号
      color: #1890FF;
    }
    // .ant-pagination-item{
    //   //每个分页页码数字框
    //   margin-right: 0;
    // }
    .ant-pagination-disabled{
      opacity: .5;
    }
    // 上一页下一页按钮
    .ant-pagination-prev,.ant-pagination-next{
      a{
        font-size: 24px;
        color: rgb(16, 89, 181);
        font-weight: bold;
        display: flex;
      }
    }
    // 数字
    .ant-pagination-item{
      background: none;
      border: none;
      a{
        color: #3974B7;
        font-weight: bold;
      }
    }
    // 选中的数字 当前选中页码数样式
    .ant-pagination-item-active{
      background: #1059B5;
      a{
        color: #FFF;
        font-weight: bold;
      }
    }
  }
}
/deep/.ant-table-body{
   overflow-x: hidden !important;
}
.center{
  width: 100%;
  /* 地图 */
  .chartsContentMap{
    width: 100%;
    height: 720px;
    margin-top: 30px;
  }
  // 地图下面的中间框
  .contentCenter{
    margin-top: 24px;
    width: 100%;
    height: 160px;
    background-size: 100% 100%;
    background-image: url('../assets/image/chengya/kuangCenter.png');
    /deep/.ant-form-item-label > label{
      color: #8AC9FF;
    }
    /deep/.ant-col{
      padding: 4px 0;
      font-size: 14px;
    }
  }
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
// 地图信息窗口
/deep/.infoBox{
    cursor: pointer;
    width: 357px;
    height: 308px;
    overflow-y: scroll;
    overflow-x: hidden;
    &::-webkit-scrollbar-track-piece { //滚动条凹槽的颜色，还可以设置边框属性
    background-color:#086CD5;
    }
    &::-webkit-scrollbar {//滚动条的宽度
      width: 5px;
      height: 5px;
      border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb {//滚动条的设置
      background-color:#0ABCFF;
      background-clip:padding-box;
      min-height:28px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color:#0ABCFF;
    }
    img{
      width: 24px;
      height: 24px;
      right: -17px !important;
      top: -38px !important;
    }
    .infoBoxContent{
      height: 100%;
      width: 360px;
      // height: 220px;
      background-image: url('../assets/image/chengya/infoBoxBg.png');
      background-size: 100% 100%;
      padding: 24px;
      .infoBoxTitle{
        color: #29FFFC;
        font-size: 24px;
        margin-bottom: 16px;
      }
      .infoContent{
          .oneDiv,.rowDiv{
            margin-bottom: 16px;
            display: flex;
            span:nth-child(1){
              color: #1E8CFF;
              font-weight: bold;
            }
            .oneZ{
              white-space: nowrap;
              font-size: 13px;
            }
            div,span{
              font-size: 13px;
              color: white;
            }
            .select{
              color: #1E8CFF;
            }
          }
          .rowDiv{
              .rowTwo{
                width: 165px;
                white-space: nowrap;
              // white-space: nowrap;
              // overflow: hidden;
              // text-overflow: ellipsis;
              .left{
                color: #1E8CFF;
              }
            }
          }
      }
    }
}
</style>
