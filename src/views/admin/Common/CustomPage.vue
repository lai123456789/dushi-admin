<template>
  <a-spin
    :spinning="$store.state.app.globalSpin.spinning"
    :tip="$store.state.app.globalSpin.tip"
    :size="$store.state.app.globalSpin.size"
    class="globalSpin">
    <component :is="component"/>
  </a-spin>
</template>
<script>
export default {
  data () {
    return {
      component: null
    }
  },
  computed: {
    globalSpin () {
      return !window.mainFrame ? this.$store.state.app.globalSpin : false
    }
  },
  mounted () {
    console.log('this.$route.query', this.$route.query)
    if (this.$route.query.view) {
      this.component = () => import('@/views/' + this.$route.query.view)
    }
  }
}
</script>
<style lang="less" scoped>
  .globalSpin {
  height: 100%;
  /deep/ .ant-spin-container {
     height: 100%;
  }
}
</style>
