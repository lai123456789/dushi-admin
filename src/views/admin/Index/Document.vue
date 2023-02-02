<template>
  <a-drawer
    :title="`使用帮助 - `+showDocument.number"
    :width="showDocument.width"
    :visible="visible"
    @close="close"
    :destroyOnClose="true"
    placement="left"
  >
    <a-spin :spinning="loading">
      <div v-html="data"></div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      loading: false,
      data: ''
    }
  },
  watch: {
    visible (newVal, oldVal) {
      this.loading = true
      this.axios({
        url: '/admin/Index/document',
        params: { number: this.$store.state.app.showDocument.number }
      }).then((res) => {
        this.loading = false
        this.data = res.result
      })
    }
  },
  computed: {
    showDocument () {
      return this.$store.state.app.showDocument
    },
    visible () {
      return this.$store.state.app.showDocument.visible
    }
  },
  methods: {
    close () {
      this.$showDocument({ visible: false })
    }
  }
}
</script>
