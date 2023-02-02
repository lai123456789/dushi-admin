<template>
  <div>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="向弧名称">
        <a-input v-model="queryParam.arc_name" />
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
  </div>
</template>
<script>
export default {
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
        width: 60,
        sorter: true
      }, {
        title: '向弧编号',
        width: 240,
        dataIndex: 'arc_id'
      }, {
        title: '向弧名称',
        dataIndex: 'arc_name',
        sorter: true
      }, {
        title: '向弧类型',
        width: 100,
        dataIndex: 'arc_type'
      }, {
        title: '库所编号',
        width: 260,
        dataIndex: 'place_number',
        customRender: (text, record, index) => {
          const data = text.split('(')
          data.splice(0, 1)
          if (data.length) {
            return (<div>{data.map(item => { return <div>{ '(' + item }</div> })}</div>)
          } else {
            return '--'
          }
        }
      }, {
        title: '库所',
        dataIndex: 'place',
        width: 100,
        customRender: (text, record, index) => {
          const data = text.split('(')
          data.splice(0, 1)
          if (data.length) {
            return (<div>{data.map(item => { return <div>{ '(' + item }</div> })}</div>)
          } else {
            return '--'
          }
        }
      }, {
        title: '方向',
        width: 100,
        dataIndex: 'direction'
      }, {
        title: '变迁编号',
        width: 260,
        dataIndex: 'transition_number',
        customRender: (text, record, index) => {
          const data = text.split('(')
          data.splice(0, 1)
          if (data.length) {
            return (<div>{data.map(item => { return <div>{ '(' + item }</div> })}</div>)
          } else {
            return '--'
          }
        }
      }, {
        title: '变迁',
        dataIndex: 'transition',
        customRender: (text, record, index) => {
          const data = text.split('(')
          data.splice(0, 1)
          if (data.length) {
            return (<div>{data.map(item => { return <div>{ '(' + item }</div> })}</div>)
          } else {
            return '--'
          }
        }
      }, {
        title: '业务方法',
        width: 80,
        dataIndex: 'arc_callback'
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
        url: '/admin/arc/init',
        params: Object.assign(parameter, this.queryParam, { workflow_id: this.item.workflow_id })
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.modalForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/arc/add'
      })
    },
    handleEdit (record) {
      this.$refs.modalForm.show({
        action: 'edit',
        title: '编辑',
        url: '/admin/arc/edit',
        record: record
      })
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/arc/delete',
            data: { id: record.workflow_id }
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
