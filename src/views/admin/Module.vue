<template>
  <a-card>
    <s-table
      size="small"
      rowKey="directory"
      :columns="columns"
      :data="loadDataTable"
      :showPagination="false"
    >
    </s-table>
  </a-card>
</template>
<script>
export default {
  data () {
    return {
      // 表头
      columns: [{
        title: '#',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '模块目录',
        dataIndex: 'directory',
        width: 150
      }, {
        title: '版本号',
        dataIndex: 'version',
        width: 150
      }, {
        title: '更新时间',
        dataIndex: 'release',
        width: 150
      }, {
        title: '模块描述',
        dataIndex: 'introduce'
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/module/init',
        params: parameter
      }).then(res => {
        return res.result
      })
    }
  }
}
</script>
