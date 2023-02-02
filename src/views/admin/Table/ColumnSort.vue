<template>
  <a-drawer
    :title="config.title"
    height="100%"
    placement="top"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <drag-list :data.sync="data"/>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    DragList: () => import('@/components/Drag/DragList')
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      data: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.data = config.data
    },
    handleSubmit () {
      this.visible = false
      this.$emit('ok', this.data)
    }
  }
}
</script>
