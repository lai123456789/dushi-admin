<template>
  <a-drawer
    :title="mdl.title"
    :width="900"
    :destroyOnClose="true"
    :visible="visible"
    @close="visible=!visible" >
    <a-spin :spinning="false">
      <div>
        <div style="margin: -10px 0 10px;">
          <span>
            <a-icon type="user" /> {{ mdl.receiver }}
          </span>
          <span style="margin-left: 40px;">
            {{ mdl.inputtime }}
          </span>
        </div>
        <div>{{ config.content }}</div>
        <div v-html="mdl.content">{{ mdl.content }}</div>
      </div>
      <div class="bbar">
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>

export default {

  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      mdl: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.mdl = this.config.record
    }
  }
}
</script>
<style lang="less" scoped>
 /deep/ img {
    max-width: 850px;
  }
</style>
