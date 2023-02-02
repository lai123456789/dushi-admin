<template>
  <a-drawer
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <div>
        <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
          <a-form-item label="关键字">
            <a-input v-model="queryParam.key" placeholder="请输入系统名称或显示名称"/>
          </a-form-item>
          <a-space>
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => { queryParam = config.record.category === '0' ? { parent_number: parent_number } :{ rnumber: config.record.rnumber }, $refs.table.refresh(true)}" >重置</a-button>
            <a-button v-action:add type="primary" icon="plus" @click="handleAdd">添加</a-button>
            <a-button v-action:sort icon="sort-ascending" @click="handleSort">排序</a-button>
          </a-space>
        </a-form>
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="config.record && config.record.category == '0' ? columns : columnsTree"
          :data="loadDataTable"
          :showPagination="false"
          :sorter="sorter"
        >
          <span slot="name" slot-scope="text, record">
            {{ text+(record.subcount>0?'('+record.subcount+')':'') }}
          </span>
          <span slot="disabled" slot-scope="text">
            <a-badge v-if="text =='0'" status="success" text="启用" />
            <a-badge v-else status="error" text="禁用" />
          </span>
          <div slot="action" slot-scope="text, record" v-if="config.record.category == '1'">
            <a @click="handleSonAdd(record)">添加</a>
            <a-divider type="vertical" />
            <a :disabled="!record.children" @click="handleSort(record)">排序</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a v-if="$auth('delete')" @click="handleDelete(record)">删除</a>
            <span v-else style="color: gray;">删除</span>
          </div>
          <div slot="action" slot-scope="text, record" v-else>
            <a :disabled="record.maintain == '1'" @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a v-if="$auth('delete')" @click="handleDelete(record)">删除</a>
            <span v-else style="color: gray;">删除</span>
          </div>
        </s-table>
        <dict-form ref="dictForm" @ok="handleOk" />
        <dict-import ref="dictImport" @ok="handleOk" />
        <dict-sort ref="dictSort" @ok="handleOk" />
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    DictForm: () => import('./DictForm'),
    DictImport: () => import('./DictImport'),
    DictSort: () => import('./DictSort')
  },
  data () {
    return {
      config: {},
      visible: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 100,
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
        title: '系统名称',
        dataIndex: 'number',
        sorter: true
      }, {
        title: '显示名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
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
      }],
      columnsTree: [{
        title: '显示名称',
        dataIndex: 'name',
        width: 200,
        scopedSlots: { customRender: 'name' },
        sorter: true
      }, {
        title: '系统名称',
        dataIndex: 'number',
        width: 200,
        sorter: true
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 60
      }, {
        title: '排序',
        dataIndex: 'listorder',
        sorter: true,
        width: 60
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
        width: 100,
        sorter: true
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time',
        width: 150,
        sorter: true
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }],
      sorter: { field: 'listorder', order: 'ascend' }
    }
  },
  methods: {
    // 打开抽屉组件
    show (config) {
      this.visible = true
      this.config = config
      if (config.record.category === '0') {
        this.queryParam.parent_number = config.record.number
      } else {
        this.queryParam.rnumber = config.record.number
      }
      this.parent_number = config.record.number
      if (this.$refs.table) {
        this.$refs.table.refresh(true)
      }
    },
    loadDataTable (parameter) {
      parameter.pageSize = 999
      return this.axios({
        url: this.config.record.category === '0' ? '/admin/dict/init/category=0' : 'admin/dict/initTree',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      let url = ''
      // runmber 为字典编号
      url = '/admin/dict/add/?rnumber=' + this.config.record.rnumber + '&parent_number=' + this.config.record.number
      this.$refs.dictForm.show({
        action: 'add',
        title: '添加',
        url: url,
        type: 'son',
        record: { category: this.config.record.category, rnumber: this.config.record.rnumber || this.config.number }
      })
    },
    handleSonAdd (record) {
      let url = ''
      url = '/admin/dict/add/?rnumber=' + this.config.record.rnumber + '&parent_number=' + record.number
      this.$refs.dictForm.show({
        action: 'add',
        title: '添加',
        url: url,
        type: 'son',
        record: Object.assign(record, { rnumber: this.config.record.rnumber })
      })
    },
    handleEdit (record) {
      this.$refs.dictForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: this.config.record.category === '0' ? '/admin/dict/edit?category=0' : '/admin/dict/edit?category=1',
        type: 'son',
        record: Object.assign(record, { rnumber: this.config.record.rnumber })
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
    handleSort (record) {
      let number = this.config.record.number
      if (record.number) {
        number = record.number
      } else if (this.config.type === 'son') {
        number = this.config.record.number
      } else if (this.queryParam.parent_number) {
        number = this.queryParam.parent_number || ''
      }
      this.$refs.dictSort.show({
        action: 'sort',
        title: '排序',
        url: this.config.record.category === '0' ? '/admin/dict/sort?category=0' : '/admin/dict/sort?category=1',
        parent_number: number
      })
    }
  }
}
</script>
