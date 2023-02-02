<template>
  <div>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="名称">
        <a-input v-model="queryParam.name" allowClear style="width: 300px"/>
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:add icon="plus" @click="handleAdd('field')" type="primary">添加表单视图</a-button>
        <a-button v-action:add icon="plus" @click="handleAdd('custom')" type="primary">添加表格视图</a-button>
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
      <div slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="handleCopy(record)">复制</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)">删除</a>
      </div>
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
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 140,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 60
      }, {
        title: 'UID',
        dataIndex: 'uid',
        sorter: true,
        width: 150
      }, {
        title: '类型',
        dataIndex: 'type'
      }, {
        title: '名称',
        dataIndex: 'name',
        sorter: true
      }, {
        title: '备注',
        dataIndex: 'description'
      }, {
        title: '最后修改人',
        dataIndex: 'update_user',
        sorter: true
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time',
        sorter: true
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      if (this.item.tableid) {
        return this.axios({
          url: '/admin/tplview/form',
          params: Object.assign(parameter, this.queryParam, { tableid: this.item.tableid })
        }).then(res => {
          return res.result
        })
      }
    },
    handleAdd (type) {
      const data = {
        action: 'add',
        Keyid: Math.floor(Math.random() * (10000 - 1000 + 1) + 1000),
        title: type === 'field' ? '表单视图' : '表格视图',
        submitUrl: '/admin/tplview/addForm',
        url: '/admin/tplview/editForm',
        tableid: this.item.tableid,
        variable: type === 'field' ? 'table_form_view' : 'table_custom_view',
        module: this.item.data.module,
        item: this.item
      }
      this.$emit('add', data)
    },
    handleEdit (record) {
      const data = {
        action: 'edit',
        title: record.name,
        url: '/admin/tplview/editForm',
        tableid: this.item.tableid || record.value,
        alias: this.item.data ? this.item.data.alias : '',
        variable: record.variable,
        record: record,
        item: this.item
      }
      this.$emit('ok', data)
    },
    handleCopy (record) {
      const data = {
        action: 'copy',
        title: '复制',
        url: '/admin/tplview/editForm',
        submitUrl: '/admin/tplview/addForm',
        record: record,
        tableid: this.item.tableid || record.value,
        alias: this.item.data ? this.item.data.alias : '',
        variable: record.variable,
        item: this.item,
        module: this.item.module
      }
      this.$emit('ok', data)
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/admin/tplview/delete',
            params: { id: record.id }
          }).then(res => {
            that.$refs.table.refresh()
            that.$emit('refresh', record.id)
          })
        }
      })
    }
  }
}
</script>
