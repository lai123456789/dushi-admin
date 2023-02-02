<template>
  <div>
    <a-drawer
      placement="bottom"
      height="60"
      :maskClosable="false"
      :mask="false"
      :zIndex="1002"
      :visible="audioObj.visible"
      @close="close"
    >
      <a-spin :spinning="loading">
        <div style="text-align: center;">
          <audio id="winPlayer" controls="true" autoplay="true" style="margin-top: 10px; vertical-align: middle; width: 450px; height: 40px"><source :src="audioObj.sourceUrl"/></audio>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loading: false
    }
  },
  props: {},
  computed: {
    audioObj () {
      return this.$store.state.app.setting.audioPlayData || {
        visible: false,
        sourceUrl: ''
      }
    }
  },
  watch: {
    audioObj (newVal) {
      this.loading = true
      if (newVal.visible) {
        this.$nextTick(() => {
          this.audio = document.getElementById('winPlayer')
          this.audio.load()
          if (newVal.sourceUrl) {
            this.loading = false
          }
        })
      }
    }
  },
  methods: {
    close () {
      this.audio = document.getElementById('winPlayer')
      this.audio.pause()
      this.$setSetting({ audioPlayData: { visible: false, sourceUrl: '' } })
    }
  }
}
</script>
<style lang="less" scoped>
  /deep/ .ant-drawer-body > :first-child:not(.ant-spin-nested-loading){
    padding: 0px;
  }
  /deep/ .ant-drawer-body {
    padding: 0px;
    height: 60px;
    > .ant-spin-nested-loading {
      > .ant-spin-container {
        > :first-child {
          padding: 0px;
        }
      }
  }
  }
</style>
