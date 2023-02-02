<template>
  <div>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="变迁名称">
        <a-input v-model="queryParam.transition_name" />
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
      <span slot="trigger_name" slot-scope="text">
        {{ text.trigger_name }}
      </span>
      <template slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)" disabled>编辑</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)" disabled>删除</a>
      </template>
    </s-table>
    <transition-form ref="transitionForm" @ok="handleOk" />
  </div>
</template>
<script>
export default {
  components: {
    TransitionForm: () => import('./TransitionForm')
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
        title: '变迁编号',
        dataIndex: 'transition_id'
      }, {
        title: '变迁名称',
        dataIndex: 'transition_name'
      }, {
        title: '用户设置',
        dataIndex: 'trigger_user'
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
        url: '/admin/transition/init',
        params: Object.assign(parameter, this.queryParam, { workflow_id: this.item.workflow_id })
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.transitionForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/transition/add',
        workflow_id: this.item.workflow_id
      })
    },
    handleEdit (record) {
      this.$refs.transitionForm.show({
        action: 'edit',
        title: '编辑：' + record.transition_name,
        url: '/admin/transition/edit',
        record: record
      })
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/transition/delete',
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
