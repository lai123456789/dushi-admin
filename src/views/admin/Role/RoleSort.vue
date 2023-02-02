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
      this.config = config
      this.visible = true
      this.axios({
        url: '/admin/Api/sort',
        data: {
          action: 'get',
          tablename: 'admin_role',
          name: 'rolename'
        }
      }).then(res => {
        this.data = res.result.data
        this.data.forEach(item => { item.name = item.rolename })
      })
    },
    handleSubmit () {
      this.loading = true
      this.data.forEach(item => {
        item.listorder = item.sortid
      })
      this.axios({
        url: '/admin/Api/sort',
        data: {
          action: 'submit',
          tablename: 'admin_role',
          data: this.data
        }
      }).then(res => {
        this.$message.success('操作成功')
        this.visible = false
        this.$emit('ok', '')
      })
    }
  }
}
</script>
