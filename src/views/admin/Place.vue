<template>
  <div>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="库所名称">
        <a-input v-model="queryParam.place_name" />
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="{ field: 'id', order: 'descend' }"
    >
      <template slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)" disabled>编辑</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)" disabled>删除</a>
      </template>
    </s-table>
    <place-form ref="placeForm" @ok="handleOk" />
  </div>
</template>
<script>
export default {
  components: {
    PlaceForm: () => import('./PlaceForm')
  },
  props: {
    item: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      // 搜索参数
      queryParam: { },
      // 表头
      columns: [ {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        sorter: true
      }, {
        title: '库所编号',
        dataIndex: 'place_id'
      }, {
        title: '库所名称',
        dataIndex: 'place_name'
      }, {
        title: '更新时间',
        dataIndex: 'updatetime',
        width: 140,
        sorter: true
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/place/init',
        params: Object.assign(parameter, this.queryParam, { workflow_id: this.item.workflow_id })
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.placeForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/place/add',
        workflow_id: this.item.workflow_id
      })
    },
    handleEdit (record) {
      this.$refs.placeForm.show({
        action: 'edit',
        title: '编辑：' + record.place_name,
        url: '/admin/place/edit',
        record: record
      })
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/place/delete',
            data: { place_id: record.place_id }
          }).then(res => {
            that.$refs.table.refresh()
          })
        }
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    }
  }
}
</script>
