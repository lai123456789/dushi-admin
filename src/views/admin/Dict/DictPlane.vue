<template>
  <a-card :bordered="false">
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="关键字">
        <a-input v-model="queryParam.key" placeholder="请输入字典编号或字典名称"/>
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:add type="primary" icon="plus" @click="handleAdd">添加</a-button>
        <a-button v-action:sort icon="sort-ascending" @click="handleSort">排序</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="sorter"
    >
      <span slot="name" slot-scope="text, record">
        {{ text+(record.subcount>0?'('+record.subcount+')':'') }}
      </span>
      <span slot="type" slot-scope="text">
        {{ type[text] }}
      </span>
      <span slot="disabled" slot-scope="text">
        <a-badge v-if="text =='0'" status="success" text="启用" />
        <a-badge v-else status="error" text="禁用" />
      </span>
      <div slot="action" slot-scope="text, record">
        <a :disabled="record.type != 'basic'" @click="handleList(record)">设计</a>
        <a-divider type="vertical" />
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a :disabled="!$auth('delete')" @click="handleDelete(record)">删除</a>
        <a-divider type="vertical" />
        <a :disabled="record.type !== 'basic'" @click="handleExport(record)">导出</a>
      </div>
    </s-table>
    <dict-form ref="dictForm" @ok="handleOk" />
    <dict-list ref="dictList" @ok="handleOk" />
    <dict-import ref="dictImport" @ok="handleOk" />
    <dict-sort ref="dictSort" @ok="handleOk" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    DictForm: () => import('./DictForm'),
    DictList: () => import('./DictList'),
    DictImport: () => import('./DictImport'),
    DictSort: () => import('./DictSort'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 80
      }, {
        title: '排序',
        dataIndex: 'listorder',
        sorter: true,
        width: 80
      }, {
        title: '字典编号',
        dataIndex: 'number',
        width: 300,
        sorter: true
      }, {
        title: '字典名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
        sorter: true
      }, {
        title: '类型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' },
        sorter: true
      }, {
        title: '状态',
        dataIndex: 'disabled',
        scopedSlots: { customRender: 'disabled' },
        sorter: true
      }, {
        title: '备注',
        dataIndex: 'remarks',
        sorter: true
      }, {
        title: '最后修改人',
        dataIndex: 'update_user',
        width: 150,
        sorter: true
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time',
        width: 150,
        sorter: true
      } ],
      sorter: { field: 'listorder', order: 'ascend' },
      type: {
        basic: '基础',
        table: '数据表',
        sql: 'SQL',
        callback: '自定义'
      }
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/dict/init?category=0',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleExport (record) {
      this.$refs.generalExport.show({
        controller: 'admin/Api',
        method: 'exportDict',
        number: 'dict', // 关联编号
        message: '导出字典: ' + record.name,
        parameter: {
          number: record.number, // 字典编号
          category: record.category // 字典类型，平面或树形
        }
      })
    },
    handleAdd () {
      this.$refs.dictForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/dict/add?category=0',
        record: { category: 0 }
      })
    },
    handleEdit (record) {
      this.$refs.dictForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/admin/dict/edit?category=0',
        record: record
      })
    },
    handleDelete (record) {
      const table = this.$refs.table
      const self = this
      this.$confirm({
        title: '您确认要删除该字典及其子字典吗？',
        onOk () {
          self.axios({
            url: '/admin/dict/delete',
            params: { number: record.number }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    // 排序
    handleSort () {
      this.$refs.dictSort.show({
        action: 'sort',
        title: '排序',
        url: '/admin/dict/sort?category=0',
        parent_number: this.queryParam.parent_number || ''
      })
    },
    // 设计
    handleList (record) {
      this.$refs.dictList.show({
        action: 'list',
        title: '设计：' + record.name,
        record: record
      })
    }
  }
}
</script>
