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
  props: {
    params: {
      type: Object,
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
      this.mydata = {
        tableid: this.config.tableid,
        data: this.params.arcEvent ? this.params.arcEvent : { }
      }
    },
    handleSubmit () {
      this.visible = false
      this.params.arcEvent = this.$refs.condition.getValue()
    }
  }
}
</script>
