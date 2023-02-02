<template>
  <div>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="关键字">
        <a-input v-model="queryParam.searchString" allowClear style="width: 300px"/>
      </a-form-item>
      <a-space>
        <a-button @click="()=>{queryParam.searchType = 'field',$refs.table.refresh(true)}" @keyup.enter="()=>{return false}">搜索字段</a-button>
        <a-button @click="()=>{queryParam.searchType = 'view',$refs.table.refresh(true)}" @keyup.enter="()=>{return false}">搜索视图</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :autoLoad="false"
      :sorter="sorter"
    >
      <div slot="action" slot-scope="text,record">
        <a @click="openTab(record)">{{ queryParam.searchType === 'field' ? '打开字段管理':'打开视图' }}</a>
        <a-divider type="vertical" />
        <a @click="openTable(record)">左侧选中数据表</a>
      </div>
    </s-table>
  </div>
</template>
<script>
export default {
  props: {
    search: {
      type: Object,
      required: true
    }
  },
  watch: {
  },
  data () {
    return {
      autoLoad: false,
      searchType: '',
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 220,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        dataIndex: 'key',
        width: 40,
        scopedSlots: {
          customRender: 'key'
        }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 60
      }, {
        title: '名称',
        dataIndex: 'name',
        width: 450,
        sorter: true
      }, {
        title: '类型',
        dataIndex: 'type',
        width: 120
      }, {
        title: '所属数据表',
        dataIndex: 'tablename'
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      if (this.queryParam.searchString) {
        return this.axios({
          url: '/admin/table/search',
          params: Object.assign(parameter, this.queryParam, { module: this.search.module })
        }).then(res => {
          for (let i = 0; i < res.result.data.length; i++) {
            res.result.data[i]['key'] = i + 1
          }
          return res.result
        })
      } else {
        return this.axios({
          url: '/admin/table/search',
          params: Object.assign(parameter, { searchType: this.queryParam.searchType, module: this.search.module })
        }).then(res => {
          for (let i = 0; i < res.result.data.length; i++) {
            res.result.data[i]['key'] = i + 1
          }
          return res.result
        })
      }
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    openTab (record) {
      this.$emit('getField', record)
    },
    openTable (record) {
      this.$emit('showTable', record)
    }
  }
}
</script>
