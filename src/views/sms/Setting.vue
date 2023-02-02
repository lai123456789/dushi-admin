<template>
  <a-card>
    <a-tabs>
      <a-tab-pane tab="模板设置" key="1">
        <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
          <a-form-item label="模板名称" >
            <a-input v-model="queryParam.name" placeholder="" />
          </a-form-item>
          <a-form-item label="模板内容" >
            <a-input v-model="queryParam.content" placeholder="" />
          </a-form-item>
          <a-space>
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)" >搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}" >重置</a-button>
            <a-button v-action:template_add @click="handleAdd">添加</a-button>
            <a-button
              v-action:template_delete
              icon="delete"
              @click="handleBulkDelete()"
              type="danger"
              :disabled="selectedRowKeys.length==0">批量删除</a-button>
            <a-button v-action:import @click="$refs.templateImport.show()" >导入</a-button>
            <a-button v-action:template_add @click="handleExport">导出</a-button>
          </a-space>
        </a-form>
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="columns"
          :data="loadDataTable"
          :rowSelection="rowSelection"
          :sorter="sorter"
        >
          <div slot="action" slot-scope="text, record">
            <a v-action:template_edit @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a v-action:template_edit @click="handleBulkDelete(record)">删除</a>
          </div>
        </s-table>
      </a-tab-pane>
      <a-tab-pane tab="参数设置" key="2" v-if="$auth('setting')">
        <a-button @click="handleReset" style="margin-bottom: 16px;">重启进程</a-button>
        <s-table
          ref="table2"
          size="small"
          rowKey="alias"
          :columns="columns2"
          :data="loadDataTable2"
        >
          <span slot="status" slot-scope="text">
            <a-badge v-if="text =='1'" status="success" text="启用" />
            <a-badge v-else status="error" text="禁用" />
          </span>
          <div slot="action2" slot-scope="text, record">
            <a v-action:template_edit @click="handleEdit2(record)">编辑</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a>更多<a-icon type="down"/></a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a-popconfirm placement="top" ok-text="是" cancel-text="否" @confirm="handleOpen(record)">
                    <template slot="title">
                      请确认是否启用
                    </template>
                    <a :disabled="record.status=='1'">启用</a>
                  </a-popconfirm>
                </a-menu-item>
                <a-menu-item><a @click="handleTop(record)" :disabled="record.id=='0'">置顶</a></a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </s-table>
      </a-tab-pane>
    </a-tabs>
    <setting-template-form ref="settingForm" @ok="handleOk" />
    <setting-param-form ref="settingParamForm" @ok="handleOk2" />
    <setting-template-import ref="templateImport" @ok="handleOk" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    SettingTemplateForm: () => import('./SettingTemplateForm'),
    SettingParamForm: () => import('./SettingParamForm'),
    SettingTemplateImport: () => import('./SettingTemplateImport'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      // 搜索参数
      queryParam: {},
      // 模板设置表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 100,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60
      }, {
        title: '模板名称',
        dataIndex: 'name'
      }, {
        title: '模板编号',
        dataIndex: 'number'
      }, {
        title: 'CODE1',
        dataIndex: 'code1'
      }, {
        title: 'CODE2',
        dataIndex: 'code2'
      }, {
        title: 'CODE3',
        dataIndex: 'code3'
      }, {
        title: '最后修改人',
        dataIndex: 'update_user'
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time'
      }, {
        title: '模板内容',
        dataIndex: 'content'
      }],
      // 参数设置表头
      columns2: [{
        title: '操作',
        dataIndex: 'action2',
        width: 100,
        align: 'center',
        scopedSlots: { customRender: 'action2' }
      }, {
        title: '短信平台',
        dataIndex: 'alias'
      }, {
        title: '短信签名',
        dataIndex: 'signName'
      }, {
        title: '单价/元',
        dataIndex: 'unitprice'
      }, {
        title: '状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' }
      }, {
        title: '模板CODE',
        dataIndex: 'codeNumberDisplay'
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/sms/template/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    loadDataTable2 (parameter) {
      return this.axios({
        url: '/sms/setting/config',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleOk2 () {
      this.$refs.table2.refresh()
    },
    handleAdd () {
      this.$refs.settingForm.show({
        action: 'add',
        title: '添加',
        url: '/sms/template/add'
      })
    },
    handleEdit (record) {
      this.$refs.settingForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/sms/template/edit',
        record: record
      })
    },
    handleEdit2 (record) {
      this.$refs.settingParamForm.show({
        action: 'edit',
        title: '编辑：' + record.alias,
        url: '/sms/setting/edit',
        record: record
      })
    },
    handleOpen (record) {
      const table = this.$refs.table2
      return this.axios({
        url: '/sms/setting/open',
        params: Object.assign({ alias: record.alias })
      }).then(res => {
        this.$message.success('操作成功')
        table.refresh()
      })
    },
    handleTop (record) {
      const table = this.$refs.table2
      return this.axios({
        url: '/sms/setting/top',
        params: Object.assign({ alias: record.alias })
      }).then(res => {
        table.refresh()
      })
    },
    handleReset () {
      const table = this.$refs.table2
      this.loading = true
      return this.axios({
        url: '/sms/setting/resetConfig'
      }).then(res => {
        this.loading = false
        if (res.message) {
          this.$message.warning(res.message)
        } else {
          this.$message.success('操作成功')
          this.form.resetFields()
        }
        table.refresh()
      })
    },
    handleBulkDelete (record) {
      const table = this.$refs.table
      const id = record ? record.id : this.selectedRowKeys.join(',')
      const me = this
      this.$confirm({
        title: '您确认要删除数据吗？',
        onOk () {
          me.axios({
            url: '/sms/template/bulkDelete',
            params: Object.assign({ id: id })
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleExport () {
      // let id = this.selectedRowKeys
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     if (id.length === 0) {
      //       id = 'all'
      //     }
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}sms/template/export?id=${id}`)
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

<style lang="less" scoped>
  .ant-form-inline .ant-form-item {
    margin-right: 8px;
}
</style>
