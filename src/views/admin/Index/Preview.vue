<template>
  <a-drawer
    :title="config.title"
    width="100%"
    height="100%"
    :visible="visible"
    :destroyOnClose="true"
    @close="visible=!visible"
    placement="top"
    :zIndex="9999"
  >
    <a-spin :spinning="loading">
      <iframe
        v-if="config.data && config.data.fileext==='.pdf'"
        :src="config.data.url"
        frameborder="0"
        width="100%"
        height="100%">
      </iframe>
      <div v-else-if="config.data" style="text-align: center; line-height: 250px;">
        <a-button @click="download" icon="download" size="large">该文件不支持在线预览，点击下载</a-button>
      </div>
      <div v-else style="text-align: center; line-height: 250px; font-size: 20px;">文件不存在</div>
      <div class="bbar">
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      visible: false,
      loading: false,
      config: {
        title: '',
        data: {}
      }
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config.title = config.filename
      this.axios({
        url: '/admin/attachment/preview',
        params: { authcode: config.authcode }
      }).then((res) => {
        this.loading = false
        this.config.data = res.result
      })
    },
    download () {
      window.open(`${process.env.VUE_APP_API_BASE_URL}admin/attachment/download/?authcode=${this.config.data.authcode}`)
    }
  }
}
</script>
