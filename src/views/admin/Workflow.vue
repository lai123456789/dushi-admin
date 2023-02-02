<template>
  <div style="height: 100%">
    <template v-if="!workflowDesignerVisible">
      <a-card>
        <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
          <a-form-item label="工作流名称">
            <a-input v-model="queryParam.workflow_name"/>
          </a-form-item>
          <a-space>
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
            <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
            <a-button @click="handleSettingPriv">参数设置</a-button>
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
          <template slot="create_type" slot-scope="text">
            <span v-if="text =='auto'">自动</span>
            <span v-else-if="text =='handle'">手动</span>
          </template>
          <template slot="is_valid" slot-scope="text">
            <a-badge v-if="text =='1'" status="success" text="启用" />
            <a-badge v-else status="error" text="禁用" />
          </template>
          <template slot="action" slot-scope="text, record">
            <a @click="flowDesign(record)">设计</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">
                更多<a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handleList(record)">查看</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handlePriv(record)">权限</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleStatus(record)">
                    <template v-if="record.is_valid==1">禁用</template>
                    <template v-else>启用</template>
                  </a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleDelete(record)">删除</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
        </s-table>
      </a-card>
    </template>
    <template v-else>
      <flow-designer ref="workflowDesigner" :params="workflowData" @exit="exit" @saveFlow="saveFlow" />
    </template>
    <workflow-form ref="workflowForm" @ok="handleOk" :key="editKey" />
    <workflow-design-form ref="workflowDesignForm" :key="indexKey" @ok="handleOk" />
    <workflow-priv ref="workflowPriv" @ok="handleOk" />
    <fast-filter-permissions ref="fastFilterPermissions"/>
  </div>
</template>
<script>
export default {
  components: {
    WorkflowForm: () => import('./WorkflowForm'),
    WorkflowDesignForm: () => import('./WorkflowDesignForm'),
    FlowDesigner: () => import('@/views/admin/Flow/FlowDesigner'),
    WorkflowPriv: () => import('./WorkflowPriv'),
    FastFilterPermissions: () => import('@/views/admin/Table/FastFilterPermissions')
  },
  data () {
    return {
      workflowDesignerVisible: false,
      workflowData: {},
      indexKey: 0,
      editKey: 'editKey',
      // 搜索参数
      queryParam: { },
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 160,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60,
        sorter: true
      }, {
        title: '工作流名称',
        dataIndex: 'workflow_name',
        width: 120,
        sorter: true
      }, {
        title: '工作流ID',
        width: 240,
        dataIndex: 'workflow_id'
      }, {
        title: '流程对应数据表',
        dataIndex: 'tableName'
      }, {
        title: '创建模式',
        dataIndex: 'create_type',
        width: 80,
        scopedSlots: { customRender: 'create_type' }
      }, {
        title: '工作流状态',
        dataIndex: 'is_valid',
        width: 100,
        scopedSlots: { customRender: 'is_valid' }
      }, {
        title: '业务回调方法',
        width: 240,
        dataIndex: 'arc_callback'
      }, {
        title: '备注',
        dataIndex: 'workflow_desc'
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
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/workflow/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i].arc_callback = res.result.data[i].setting.arc_callback
        }
        return res.result
      })
    },
    flowDesign (record) {
      this.$setLoading(true)
      this.axios({
        url: '/admin/workflow/getFlowData',
        data: { id: record.workflow_id }
      }).then(res => {
        this.$setLoading(false)
        this.workflowData = res.result.data
        this.workflowDesignerVisible = true
      })
    },
    handleAdd () {
      this.editKey = this.editKey === 'editKey' ? 'editKey_1' : 'editKey'
      this.$nextTick(() => {
        this.$refs.workflowForm.show({
          action: 'add',
          title: '添加',
          url: '/admin/workflow/add'
        })
      })
    },
    handleEdit (record) {
      this.editKey = this.editKey === 'editKey' ? 'editKey_1' : 'editKey'
      this.$nextTick(() => {
        this.$refs.workflowForm.show({
          action: 'edit',
          title: '编辑: ' + record.workflow_name,
          url: '/admin/workflow/edit',
          record: record
        })
      })
    },
    handlePriv (record) {
      this.$refs.workflowPriv.show({
        title: '权限设置: ' + record.workflow_name,
        url: '/admin/workflow/priv',
        record: record
      })
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/workflow/delete',
            data: { id: record.workflow_id }
          }).then(res => {
            that.$refs.table.refresh()
          })
        }
      })
    },
    handleList (record) {
      this.indexKey = this.indexKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowDesignForm.show({
          action: 'design',
          title: '流程查看：' + record.workflow_name,
          record: record
        })
      })
    },
    handleStatus (record) {
      const that = this
      this.$confirm({
        title: record.is_valid === '1' ? '您确定要禁用该工作流吗？' : '您确定要启用该工作流吗？',
        onOk () {
          that.axios({
            url: '/admin/workflow/enable',
            data: { id: record.workflow_id, is_valid: record.is_valid }
          }).then(res => {
            if (res.message) {
              that.$message.warning(res.message, 6)
            } else {
              that.$refs.table.refresh()
            }
          })
        }
      })
    },
    handleSettingPriv () {
      this.$refs.fastFilterPermissions.show({
        title: '流程DW筛选按钮全局设置',
        type: 'workflow'
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    // 退出流程
    exit () {
      this.workflowDesignerVisible = false
    },
    // 保存流程图
    saveFlow (data) {
      console.log('数据保存的值是', data)
      this.axios({
        url: '/admin/Workflow/edit',
        data: { id: this.workflowData.id, workflow_id: this.workflowData.workflow_id, flow: data }
      }).then(res => {
        this.$refs.workflowDesigner.saveLoading = false
        this.$message.success('流程图保存成功')
      })
    }
  }
}
</script>
