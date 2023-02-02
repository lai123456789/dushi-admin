<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="机器人名称">
              <a-input v-model="queryParam.name"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="机器人昵称">
              <a-input v-model="queryParam.nick_name"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="机器人备注">
              <a-input v-model="queryParam.remarks"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="handleSet(record)">设置</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
      <group-form ref="groupForm" @ok="handleOk" />
    </a-card>
  </div>
</template>
<script>
export default {
  components: {
    groupForm: () => import('./GroupForm')
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '机器人名称',
        dataIndex: 'name',
        sorter: true
      }, {
        title: '机器人昵称',
        dataIndex: 'nick_name',
        sorter: true
      }, {
        title: '机器人备注',
        dataIndex: 'remarks',
        sorter: false
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        sorter: true
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }],
      colLayout: {},
      sorter: { field: 'id', order: 'descend' }
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/chat/group/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.groupForm.show({
        action: 'add',
        title: '添加',
        url: '/chat/group/add'
      })
    },
    handleEdit (record) {
      this.$refs.groupForm.show({
        action: 'edit',
        title: '编辑',
        url: '/chat/group/edit',
        record: record
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const that = this
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/chat/group/delete',
            data: { id: id }
          }).then(res => {
            if (res.message) {
              that.$message.warning(res.message)
            } else {
              table.refresh()
            }
          })
        }
      })
    },
    changeAdvanced (tag) {
      if (tag) {
        this.advanced = !this.advanced
      }
      if (this.advanced) {
        this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
      } else {
        this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
      }
    }
  }
}
</script>
