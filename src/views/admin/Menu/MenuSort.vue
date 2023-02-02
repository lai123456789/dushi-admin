<template>
  <a-drawer
    :title="config.title"
    height="100%"
    placement="top"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
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
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: Object.assign({ parentid: config.parentid })
      }).then((res) => {
        this.loading = false
        this.data = res.result
      })
    },
    handleSubmit () {
      this.loading = true
      this.axios({
        url: this.config.url,
        data: { data: this.data }
      }).then((res) => {
        this.visible = false
        this.loading = false
        this.$emit('ok')
      })
    }
  }
}
</script>
