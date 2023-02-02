<template>
  <a-drawer
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <codemirror ref="condition" :params="mydata" />
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  name: 'QuerierCodemirror',
  props: {
    params: {
      type: Array,
      default () {
        return {}
      },
      required: true
    }
  },
  components: {
    Codemirror: () => import('@/views/admin/Formula/Codemirror')
  },
  data () {
    return {
      config: {},
      visible: false,
      mydata: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.recordIndex = this.config.index
      this.mydata = {
        tableid: config.tableid,
        data: this.config.item.condition
      }
    },
    handleSubmit () {
      this.visible = false
      this.params[this.recordIndex].condition = this.$refs.condition.getValue()
    }
  }
}
</script>
