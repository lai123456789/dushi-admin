<template>
  <a-drawer
    :title="config.title || '任务列表'"
    :width="1400"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
      </s-table>
      <!-- <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div> -->
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {

  },
  data () {
    return {
      config: {},
      visible: false,
      // 搜索参数
      queryParam: {},
      start_time: null,
      // 表头
      columns: [ {
        title: '工单编号',
        dataIndex: 'gdbh'
      }, {
        title: '创建时间',
        dataIndex: 'cjsj',
        width: 130
      }, {
        title: '服务项目',
        dataIndex: 'fwxm'
      }, {
        title: '流程状态',
        dataIndex: 'lczt'
      }, {
        title: '机组型号',
        dataIndex: 'jzxh'
      }, {
        title: '机组类型',
        dataIndex: 'jzlx'
      }, {
        title: '累计运行时间',
        dataIndex: 'ljyhsj'
      }, {
        title: '出厂编号',
        dataIndex: 'ccbh'
      }, {
        title: '安装地点',
        dataIndex: 'azdd'
      }, {
        title: '安装详细地址',
        dataIndex: 'azxxdz'
      }, {
        title: '制造单位',
        dataIndex: 'zzdw'
      }, {
        title: '处理单位',
        dataIndex: 'azdw'
      }],
      status: 'proceed'
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.$nextTick(() => {
        this.$refs.table.refresh()
      })
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/UserTable/init',
        data: Object.assign(parameter, {
          tplviewid: 'ffc6e784cfa4ae079aa91ea6c45e6845',
          searchString: {
            lcslzt: this.config.status === 'proceed' ? 'op' : 'cl'
          }
        })
      }).then(res => {
        return res.result
      })
    },
    handleSubmit () {
      this.visible = false
    }
  }
}
</script>
