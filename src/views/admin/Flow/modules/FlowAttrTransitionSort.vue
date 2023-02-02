<template>
  <a-drawer
    :title="config.title"
    height="100%"
    :visible="visible"
    placement="top"
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
import DragList from '@/components/Drag/DragList'
export default {
  components: {
    DragList
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
      data: [],
      state: ''
    }
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
      this.state = config.state
      this.data = this.config.data
      this.data.forEach(item => { item.name = item.name ? item.name : item.way })
      this.data.sort(this.compare('listorder'))
    },
    compare (listorder) {
      return function (a, b) {
        const value1 = a[listorder]
        const value2 = b[listorder]
        return value1 - value2
      }
    },
    handleSubmit () {
      this.data.forEach((item, index) => {
        item.listorder = index + 1
        if (item.way) {
          delete item.name
        }
        delete item.sortid
      })
      this.$emit('ok', this.data, this.state)
      this.visible = false
    }
  }
}
</script>
