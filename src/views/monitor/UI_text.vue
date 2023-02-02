<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="bg">

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
      loading: false,
      starttime: '',
      Interval: null,
      initNum: 0,
      optionsR1: {},
      optionsR2: {},
      optionsR3: {}
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.bg{
  background-image: url('./assets/image/chengya/UI.jpg');
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
