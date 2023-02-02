<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    width="100%"
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
  props: {
    tableid: {
      type: String,
      default: ''
    }
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
      this.config = config
      this.visible = true
      this.data = config.data
    },
    handleSubmit () {
      this.loading = true
      const numbers = []
      this.data.forEach(item => {
        numbers.push(item.number)
      })
      this.axios({
        url: '/forum/Setting/setCategorysSort',
        data: { numbers: numbers }
      }).then(res => {
        this.$message.success('操作成功')
        this.visible = false
        this.$emit('ok', '')
      })
    }
  }
}
</script>
