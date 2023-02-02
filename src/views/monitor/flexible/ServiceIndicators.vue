<template>
  <div class="bg">
    <a-spin :spinning="loading" tip="加载中,请稍等...">
      <div class="body">
        <a-row class="firstRow">
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">
                <div class="i1">
                  <div>机组季保</div>
                  <div>15</div>
                </div>
                <img class="i2" src="../assets/image/Cirlce1.png"/>
              </div>
              <div class="itemBottom">
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>未完结</span>
                  </div>
                  <div class="b2">{{ 8 }}</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>已完结</span>
                  </div>
                  <div class="b2">7</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot3.png" alt="">
                    <span>平均完结时间</span>
                  </div>
                  <div class="b2">10天</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">
                <div class="i1">
                  <div>机组月保</div>
                  <div>12</div>
                </div>
                <img class="i2" src="../assets/image/Cirlce2.png"/>
              </div>
              <div class="itemBottom">
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>未完结</span>
                  </div>
                  <div class="b2">3</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>已完结</span>
                  </div>
                  <div class="b2">9</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot3.png" alt="">
                    <span>平均完结时间</span>
                  </div>
                  <div class="b2">15天</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">
                <div class="i1">
                  <div>机组半年保</div>
                  <div>21</div>
                </div>
                <img class="i2" src="../assets/image/Cirlce3.png"/>
              </div>
              <div class="itemBottom">
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>未完结</span>
                  </div>
                  <div class="b2">13</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>已完结</span>
                  </div>
                  <div class="b2">8</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot3.png" alt="">
                    <span>平均完结时间</span>
                  </div>
                  <div class="b2">19天</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">
                <div class="i1">
                  <div>大修改造</div>
                  <div>18</div>
                </div>
                <img class="i2" src="../assets/image/Cirlce4.png"/>
              </div>
              <div class="itemBottom">
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>未完结</span>
                  </div>
                  <div class="b2">7</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>已完结</span>
                  </div>
                  <div class="b2">11</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot3.png" alt="">
                    <span>平均完结时间</span>
                  </div>
                  <div class="b2">25天</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">
                <div class="i1">
                  <div>故障处理</div>
                  <div>16</div>
                </div>
                <img class="i2" src="../assets/image/Cirlce5.png"/>
              </div>
              <div class="itemBottom">
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>未完结</span>
                  </div>
                  <div class="b2">5</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>已完结</span>
                  </div>
                  <div class="b2">11</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot3.png" alt="">
                    <span>平均完结时间</span>
                  </div>
                  <div class="b2">18天</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item" style="border:none !important">
              <div class="itemTop">
                <div class="i1">
                  <div>新机安装</div>
                  <div>23</div>
                </div>
                <img class="i2" src="../assets/image/Cirlce6.png"/>
              </div>
              <div class="itemBottom">
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>未完结</span>
                  </div>
                  <div class="b2">20</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>已完结</span>
                  </div>
                  <div class="b2">3</div>
                </div>
                <div class="b-item">
                  <div class="b1">
                    <img src="../assets/image/Dot3.png" alt="">
                    <span>平均完结时间</span>
                  </div>
                  <div class="b2">24天</div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row class="SecondRow" :gutter="32" style="margin-bottom: 20px">
          <a-col :span="12">
            <div class="second_item">
              <div class="s1">任务完成率</div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options4" style="width: 100%; height: 100%;" ref="chart4"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <span>41</span>
                  <span>16</span>
                </div>
                <div class="two">
                  <div>
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>任务完成数</span>
                  </div>
                  <div>
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>任务未完成数</span>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="second_item">
              <div class="s1">用户满意度</div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options2" style="width: 100%; height: 100%;" ref="chart2"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <span>96</span>
                  <span>4</span>
                </div>
                <div class="two">
                  <div>
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>任务满意数</span>
                  </div>
                  <div>
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>任务不满意数</span>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row class="SecondRow" :gutter="32" style="margin-bottom: 20px">
          <a-col :span="12">
            <div class="second_item">
              <div class="s1">服务及时率</div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options3" style="width: 100%; height: 100%;" ref="chart3"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <span>84</span>
                  <span>3</span>
                </div>
                <div class="two">
                  <div>
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>准时服务数</span>
                  </div>
                  <div>
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>未准时服务数</span>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="second_item">
              <div class="s1">投诉率</div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options1" style="width: 100%; height: 100%;" ref="chart1"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <span>1</span>
                  <span>13</span>
                </div>
                <div class="two">
                  <div>
                    <img src="../assets/image/Dot1.png" alt="">
                    <span>任务投诉数</span>
                  </div>
                  <div>
                    <img src="../assets/image/Dot2.png" alt="">
                    <span>任务未投诉数</span>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>
<script>
import echarts from 'echarts'
import vueEcharts from 'vue-echarts'
import debounce from 'lodash/debounce'
export default {
  components: {
    echarts,
    vueEcharts
  },
  data () {
    this.getwdList = debounce(this.getwdList, 500)
    return {
      showIcon: true,
      searchInputtime: '',
      queryParam: {},
      colLayout: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 8 },
      labelCol: { style: 'width: 100px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block;' },
      purchaseList: [],
      // 产品品类
      product_big_typeList: [],
      // 产品类别
      product_typeList: [],
      // 服务项目
      serviceProject: [],
      // 网点类型
      network_typeList: [],
      // 所属服务分部
      branchList: [
        { name: '东区服务分部' },
        { name: '南区服务分部' },
        { name: '西区服务分部' },
        { name: '北区服务分部' }
      ],
      // 网点名称
      networkList: [],
      loading: true,
      Total: {
        cancel_total: '',
        complain_total_end: '',
        complain_total_mid: '',
        complain_total_time: '',
        complain_total_time_avg: '',
        consult_total_end: '',
        consult_total_mid: '',
        consult_total_time: '',
        consult_total_time_avg: '',
        door_total: '',
        engineer_finish_install_total: '',
        engineer_finish_total: '',
        evaluate_total: '',
        exchange_total_end: '',
        exchange_total_mid: '',
        exchange_total_time: '',
        exchange_total_time_avg: '',
        favourable_total: '',
        install_48h_finish: '',
        install_48h_unfinish: '',
        install_total_end: '',
        install_total_mid: '',
        install_total_time: '',
        install_total_time_avg: '',
        online_total: '',
        order_total: '',
        repair_7d_finish: '',
        repair_7d_unfinish: '',
        repair_total_end: '',
        repair_total_mid: '',
        repair_total_time: '',
        repair_total_time_avg: '',
        return_exchange_7total: '',
        return_total_end: '',
        return_total_mid: '',
        return_total_time: '',
        return_total_time_avg: '',
        satisfied_total: '',
        stimely_total: '',
        timely_total: '',
        undoor_total: ''
      },
      satisfied_total: '', // 工单满意数
      myChart: {}
    }
  },
  created () {
    this.getNowDate()
    this.getprevMonthDate()
    this.getServiceProject()
    this.getPurchase()
    this.getnetwork_typeList()
    this.getProduct_big_type()
    this.getServiceInfo()
  },
  methods: {
    getServiceInfo () {
      // this.axios({
      //   url: '/crm/Index/init/?json=1',
      //   data: this.queryParam,
      //   timeout: 5 * 60 * 1000
      // }).then((res) => {
      // })

      window.onresize = () => {
        setTimeout(() => {
          for (let i = 1; i <= 8; i++) {
            const str = 'chart' + i
            this.$refs[str].resize()
          }
        }, 500)
      }
      this.loading = false
      // this.Total = res.data
      // this.satisfied_total = res.data.order_total - (res.data.complain_total_end + res.data.evaluate_total - res.data.satisfied_total)
      this.options1 = {
        color: ['#24C2CA', '#E2EAF8'],
        series: [{
          type: 'pie',
          center: ['50%', '50%'],
          radius: ['60%', '80%'],
          avoidLabelOverlap: false,
          hoverOffset: 5,
          label: {
            show: true,
            position: 'center',
            fontSize: 24,
            color: '#333',
            formatter: `{d}%`
          },
          labelLine: {
            show: false
          },
          data: [{ name: '投诉率', value: 1 }, { label: { show: false }, value: 13 }]
        }]
      }
      this.options2 = {
        color: ['#24C2CA', '#E2EAF8'],
        series: [{
          type: 'pie',
          center: ['50%', '50%'],
          radius: ['60%', '80%'],
          avoidLabelOverlap: false,
          hoverOffset: 5,
          label: {
            show: true,
            position: 'center',
            fontSize: 24,
            color: '#333',
            formatter: `{d}%`
          },
          labelLine: {
            show: false
          },
          data: [{ name: '用户满意度', value: 120 }, { label: { show: false }, value: 2 }]
        }]
      }
      this.options3 = {
        color: ['#24C2CA', '#E2EAF8'],
        series: [{
          type: 'pie',
          center: ['50%', '50%'],
          radius: ['60%', '80%'],
          avoidLabelOverlap: false,
          hoverOffset: 5,
          label: {
            show: true,
            position: 'center',
            fontSize: 24,
            color: '#333',
            formatter: `{d}%`
          },
          labelLine: {
            show: false
          },
          data: [{ name: '服务及时率', value: 120 }, { label: { show: false }, value: 8 }]
        }]
      }
      this.options4 = {
        color: ['#24C2CA', '#E2EAF8'],
        series: [{
          type: 'pie',
          center: ['50%', '50%'],
          radius: ['60%', '80%'],
          avoidLabelOverlap: false,
          hoverOffset: 5,
          label: {
            show: true,
            position: 'center',
            fontSize: 24,
            color: '#333',
            formatter: `{d}%`
          },
          labelLine: {
            show: false
          },
          data: [{ name: '任务完成率', value: 43 }, { label: { show: false }, value: 60 }]
        }]
      }
    },
    getNowDate () {
      // 获取当前日期 2021-02-01
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var year2 = year
      // 当前月份
      var month2Now = parseInt(month)
      if (month2Now < 10) {
        month2Now = '0' + month2Now
      }
      if (day < 10) {
        day = '0' + day
      }
      const nowDate = year2 + '-' + month2Now + '-' + day
      // 当前月份日期 2021-02-01
      this.queryParam.inputtime_e = nowDate
    },
    getprevMonthDate () {
      // 获取当前日期上一月日期 2021-01-01
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var year2 = year
      // 前一月份
      var month2 = parseInt(month) - 1
      if (month2 === 0) {
        year2 = parseInt(year2) - 1
        month2 = 12
      }
      var day2 = day
      var days2 = new Date(year2, month2, 0)
      days2 = days2.getDate()
      if (day2 > days2) {
        day2 = days2
      }
      if (month2 < 10) {
        month2 = '0' + month2
      }
      if (day2 < 10) {
        day2 = '0' + day2
      }
      const prevMonthDate = year2 + '-' + month2 + '-' + day2
      // 上一月份日期  2021-01-01
      this.queryParam.inputtime_b = prevMonthDate
    },
    getcheck_timeDate (date, dateString) {
      this.queryParam.inputtime_b = dateString[0]
      this.queryParam.inputtime_e = dateString[1]
    },
    // 服务项目/工单类型
    getServiceProject () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'fwdgdlx' }
      }).then(res => {
        this.serviceProject = res.result
      })
    },
    // 网点类型
    getnetwork_typeList () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'wangdian_lx' }
      }).then(res => {
        this.network_typeList = res.result
      })
    },
    // 购买渠道
    getPurchase () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'gmqd2' }
      }).then(res => {
        this.purchaseList = res.result
      })
    },
    // 产品品类
    getProduct_big_type () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'chanpin_fl' }
      }).then(res => {
        this.product_big_typeList = res.result
      })
    },
    // 获取产品类别
    handleChange (value) {
      if (!value) {
        this.product_typeList = []
        this.$set(this.queryParam, 'cplb', undefined)
        return
      }
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: value }
      }).then(res => {
        this.product_typeList = res.result
        this.$set(this.queryParam, 'cplb', undefined)
      })
    },
    // 获取网点
    getwdList (e) {
      if (e) {
        this.axios({
          url: '/crm/OrderRule/wdlist',
          data: { keyword: e }
        }).then(res => {
          this.networkList = res.result.filter(item => {
            return item.type !== 'auto_service' && item.type !== 'auto_network'
          })
          if (this.networkList.length === 0) {
            this.$message.warning('查询不到该网点')
          }
        })
      }
    },
    search () {
      this.loading = true
      this.getServiceInfo()
    },
    reset () {
      this.loading = true
      this.queryParam = {}
      // 设置默认日期
      this.getNowDate()
      this.getprevMonthDate()
      // 重新获取数据
      this.getServiceInfo()
    }
  }
}
</script>

<style scoped>
.bg{
  overflow-x: hidden;
  background: #F5F6FA;
  height: 100%;
}
.body{
  height: calc(100% - 150px);
  padding: 24px 32px;
}
.body .up-down .searchList{
  background-color: #ffffff;
  padding-right: 36px;
}
.body .up-down .iconDiv{
  cursor: pointer;
  background-color: #EEE;
  display: flex;
  justify-content: center;
  align-items: cenrer;
  width: 100%;
}
/*首行*/
.firstRow{
  background:#FFF;
  box-shadow: 6px 6px 54px rgba(0, 0, 0, 0.05);
  opacity: 1;
  border-radius: 10px;
  margin-bottom:30px;
  padding: 22px 29px 22px 0;
}
.item{
  padding: 0 24px;
  border-right: 1px solid #EEE;
}
.itemTop{
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.i1 div:nth-child(1){
  font-size: 14px;
}
.i1 div:nth-child(2){
  font-size: 28px;
  font-weight: bold;
}
.i2{
  width: 56px;
  height: 56px;
}
.itemBottom .b-item{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  line-height: 30px;
}
.b1{
  display: flex;
  align-items: center;
}
.b1 img{
  width: 12px;
  height: 12px;
  margin-right: 7px;
}
/*内容行div*/
.SecondRow{
  border-radius: 10px;
}
.second_item{
  height: 360px;
  background: #FFF;
  border-radius: 10px;
}
.s1{
  font-size: 20px;
  font-weight: bold;
  line-height: 40px;
  padding-left: 20px;
}
.s2-echart{
  /* width: 436px; */
  height: 246px;
}
.one span{
  font-size: 28px;
  font-weight: bold;
  line-height: 36px;
  width: 100px;
  text-align: center;
}
.two{
  margin-top: 10px;
}
.two div{
  display: flex;
  align-items: center;
}
.two span{
  font-size: 16px;
}
.s3{
  padding-bottom: 20px;
}
.s3 div{
  display: flex;
  justify-content: space-around;
}
.s3 div img{
  width: 12px;
  height: 12px;
  margin-right: 7px;
}
</style>
