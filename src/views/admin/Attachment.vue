<template>
  <a-card>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="{ field: 'id', order: 'descend' }"
    >
      <div slot="action" slot-scope="text, record">
        <a @click="handleView(record)">查看</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)">删除</a>
      </div>
    </s-table>
  </a-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '文件名',
        dataIndex: 'filename',
        sorter: true
      }, {
        title: '上传人',
        dataIndex: 'username',
        sorter: true
      }, {
        title: '上传时间',
        dataIndex: 'uploadtime',
        sorter: true
      }, {
        title: '大小',
        dataIndex: 'filesize',
        sorter: true
      }]
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/attachment/init',
        params: parameter
      }).then(res => {
        return res.result
      })
    },
    handleView (record) {
      window.open(this.setting.rootUrl + record.filepath)
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/attachment/delete',
            params: { id: record.id }
          }).then(res => {
            that.$refs.table.refresh()
          })
        }
      })
    }
  }
}
</script>
