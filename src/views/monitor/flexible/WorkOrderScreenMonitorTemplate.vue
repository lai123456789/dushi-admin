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
            中级部分
            <!-- <vueEcharts :auto-resize="true" :options="optionsMap" style="width: 100%; height: 100%;" ref="chart7"/> -->
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
export default {
  components: {
    echarts,
    vueEcharts
  },
  data () {
    return {
      loading: false,
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
  methods: {

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
