<template>
  <a-drawer
    :title="config.title"
    height="100%"
    placement="top"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <a-tabs defaultActiveKey="1" >
        <a-tab-pane tab="库所管理" key="1" >
          <Place :item="config.record" />
        </a-tab-pane>
        <a-tab-pane tab="变迁管理" key="2">
          <Transition :item="config.record" />
        </a-tab-pane>
        <a-tab-pane tab="向弧管理" key="3">
          <Arc :item="config.record" />
        </a-tab-pane>
      </a-tabs>
      <div class="bbar">
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>

export default {
  components: {
    Place: () => import('./Place'),
    Transition: () => import('./Transition'),
    Arc: () => import('./Arc')
  },
  data () {
    return {
      config: {},
      visible: false
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
    }
  }
}
</script>
