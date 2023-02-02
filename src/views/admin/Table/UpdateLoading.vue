<template>
  <a-drawer
    :title="config.title"
    :visible="visible"
    width="600"
    @close="visible = !visible"
  >
    <a-spin :spinning="false">
      <div style="text-align: center">
        <div style="position: relative; height: 300px"><loading /></div>
        <div>系统正在更新缓存，请不要关闭浏览器并耐心等候……</div>
      </div>
      <div class="bbar">
        <a-button @click="visible = !visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    Loading: () => import('./Loading')
  },
  data () {
    return {
      visible: false,
      config: {}
    }
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
    }
  }
}
</script>
