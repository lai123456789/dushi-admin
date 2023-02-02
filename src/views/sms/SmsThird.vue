<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="系统名称">
        <a-input v-model="queryParam.third_name" placeholder="" />
      </a-form-item>
      <a-form-item label="系统编号">
        <a-input v-model="queryParam.third_number" placeholder="" />
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)" >搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}" >重置</a-button>
        <a-button v-action:add icon="plus" @click="handleAdd">添加</a-button>
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
      <span slot="status" slot-scope="text">
        <a-badge v-if="text =='1'" status="success" text="启用" />
        <a-badge v-else status="error" text="禁用" />
      </span>
      <div slot="action" slot-scope="text, record">
        <a v-action:edit @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a v-action:del @click="handleDelete(record)">删除</a>
      </div>
    </s-table>
    <sms-third-form ref="smsThirdForm" @ok="handleOk" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    SmsThirdForm: () => import('./SmsThirdForm'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id'
      }, {
        title: '系统名称',
        dataIndex: 'third_name'
      }, {
        title: '系统编号',
        dataIndex: 'third_number'
      }, {
        title: '状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' }
      }, {
        title: '回调地址',
        dataIndex: 'token_url'
      }, {
        title: '创建人',
        dataIndex: 'inputuser'
      }, {
        title: '创建时间',
        dataIndex: 'inputtime'
      }, {
        title: '最后修改人',
        dataIndex: 'updateuser'
      }, {
        title: '最后修改时间',
        dataIndex: 'updatetime'
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/sms/SmsThird/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleAdd () {
      this.$refs.smsThirdForm.show({
        action: 'add',
        title: '添加',
        url: '/sms/SmsThird/add'
      })
    },
    handleEdit (record) {
      this.$refs.smsThirdForm.show({
        action: 'edit',
        title: '编辑：' + record.third_name,
        url: '/sms/SmsThird/edit',
        record: record
      })
    },
    handleDelete (record) {
      const table = this.$refs.table
      const me = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          me.axios({
            url: '/sms/SmsThird/delete',
            params: { id: record.id }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleExport () {
      // this.$confirm({
      //   title: '您确认要导出数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}sms/send/export/?where=1=1`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    }
  }
}
</script>
