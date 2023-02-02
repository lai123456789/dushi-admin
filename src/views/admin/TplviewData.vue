<template>
  <div>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="名称">
        <a-input v-model="queryParam.name" allowClear style="width: 300px"/>
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:add icon="plus" @click="handleAddData('table_form_list')">添加普通数据窗口</a-button>
        <a-button v-action:add icon="plus" @click="handleAddData('table_flow_list')">添加流程数据窗口</a-button>
        <a-button v-action:add icon="plus" @click="handleAddData('table_card_list')">添加卡片数据窗口</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter=" { field: 'id', order: 'descend' }"
    >
      <div slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="handleCopy(record)">复制</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)">删除</a>
        <a-divider type="vertical" />
        <a @click="handleCreateMenu(record)">创建菜单</a>
      </div>
      <template slot="UID" slot-scope="text" >
        <span :title="text">{{ text }}</span>
      </template>
    </s-table>
    <tplView-data-menu ref="tplviewDataMenu" @ok="handleOk"/>
  </div>
</template>
<script>
export default {
  components: {
    TplViewDataMenu: () => import('./TplViewDataMenu')
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
      queryParam: {},
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 210,
        scopedSlots: { customRender: 'action' },
        align: 'center'
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 60
      }, {
        title: 'UID',
        dataIndex: 'uid',
        sorter: true,
        width: 150,
        scopedSlots: { customRender: 'uid' }
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
      } ]
    }
  },
  methods: {
    loadDataTable (parameter) {
      if (this.item.tableid) {
        return this.axios({
          url: '/admin/tplview/data',
          params: Object.assign(parameter, this.queryParam, { tableid: this.item.tableid, variable: 'table_form_list' })
        }).then(res => {
          return res.result
        })
      }
    },
    handleAddData (type) {
      let title = ''
      switch (type) {
        case 'table_form_list':
          title = '普通视图'
          break
        case 'table_flow_list':
          title = '流程视图'
          break
        case 'table_card_list':
          title = '卡片视图'
          break
      }
      const data = {
        Keyid: String(Math.floor(Math.random() * (100000 - 1000 + 1) + 1000)),
        action: 'add',
        title: title,
        submitUrl: '/admin/tplview/addData',
        url: '/admin/tplview/editData',
        tableid: this.item.tableid,
        variable: type,
        module: this.item.module,
        item: this.item
      }
      this.$emit('add', data)
    },
    handleEdit (record) {
      const data = {
        action: 'edit',
        title: record.name,
        url: '/admin/tplview/editData',
        record: record,
        tableid: this.item.tableid || record.value,
        variable: record.variable,
        module: this.item.module,
        alias: this.item.data ? this.item.data.alias : '',
        item: this.item
      }
      this.$emit('ok', data)
    },
    handleCopy (record) {
      const data = {
        action: 'copy',
        title: '复制: ' + record.name,
        url: '/admin/tplview/editData',
        submitUrl: '/admin/tplview/addData',
        record: record,
        tableid: this.item.tableid || record.value,
        variable: record.variable,
        module: this.item.module,
        alias: this.item.data ? this.item.data.alias : '',
        item: this.item
      }
      this.$emit('ok', data)
    },
    handleCreateMenu (record) {
      this.$refs.tplviewDataMenu.show({
        title: '创建菜单: ' + record.name,
        url: '/admin/menu/getTreeMenu',
        submitUrl: '/admin/tplview/addMenu',
        record: record
      })
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
