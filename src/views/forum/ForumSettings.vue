<template>
  <div>
    <a-card>
      <div class="table-operator">
        <a-button icon="plus" type="primary" @click="addCategroy">添加</a-button>
        <a-button icon="sort-descending" @click="handleSort">排序</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="recommended" slot-scope="text">
          <span>{{ text === '1' ? '是' : '否' }}</span>
        </div>
        <div slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <forum-settings-add ref="forumSettingsAdd" @ok="handleOk"/>
    <forum-settings-sort ref="forumSettingsSort" @ok="handleOk" />
  </div>
</template>
<script>
export default {
  components: {
    ForumSettingsAdd: () => import('./ForumSettingsAdd'),
    ForumSettingsSort: () => import('./ForumSettingsSort')
  },
  data () {
    return {
      data: [],
      columns: [{
        title: '操作',
        width: 100,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40
      }, {
        title: '分类编号',
        dataIndex: 'number',
        width: 240
      }, {
        title: '分类名',
        dataIndex: 'name'
      }, {
        title: '分类负责人',
        dataIndex: 'manager'
      }, {
        title: '是否推荐',
        dataIndex: 'recommended',
        scopedSlots: { customRender: 'recommended' }
      }, {
        title: '备注',
        dataIndex: 'remark'
      }, {
        title: '最后修改人',
        dataIndex: 'updateuser'
      }, {
        title: '最后修改时间',
        dataIndex: 'updatetime'
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/forum/Setting/getCategorys',
        params: { recommended: '0' }
      }).then(res => {
        this.data = res.result.data
        return res.result
      })
    },
    addCategroy () {
      this.$refs.forumSettingsAdd.show({
        action: 'add',
        title: '添加',
        data: {}
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleEdit (record) {
      this.$refs.forumSettingsAdd.show({
        action: 'edit',
        title: '编辑',
        data: record
      })
    },
    handleDelete (record) {
      const table = this.$refs.table
      const number = record.number
      const self = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          self.axios({
            url: '/forum/Setting/deleteCategory',
            data: { number: number }
          }).then((res) => {
            if (res.code) {
              self.$message.error(res.message)
            } else {
              table.refresh()
              self.$message.success('操作成功')
            }
          })
        }
      })
    },
    handleSort () {
      this.$refs.forumSettingsSort.show({
        title: '排序',
        data: this.data
      })
    }
  }
}
</script>
