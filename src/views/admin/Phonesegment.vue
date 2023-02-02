<template>
  <a-card>
    <a-space style="margin-bottom: 8px">
      <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
      <a-button v-action:import icon="upload" @click="handleImport">导入</a-button>
      <a-button v-action:export icon="download" @click="handleExport">导出</a-button>
      <a-button v-action:delete icon="delete" @click="handleDelete" type="danger" :disabled="selectedRowKeys.length==0">批量删除</a-button>
      <a-button icon="filter" @click="handleSearch">搜索</a-button>
      <a-button icon="sync" @click="()=>{queryParam = {}, refresh()}">重置</a-button>
    </a-space>
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
        <a v-if="$auth('edit')" @click="handleEdit(record)">编辑</a>
        <span v-else style="color: gray;">编辑</span>
        <a-divider type="vertical" />
        <a v-if="$auth('delete')" @click="handleDelete(record)">删除</a>
        <span v-else style="color: gray;">删除</span>
      </div>
    </s-table>
    <a-drawer
      :title="config.title"
      :width="400"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form" layout="vertical">
          <a-form-item label="号码段">
            <a-input v-decorator="['info[segment]', {initialValue: config.data.segment, rules: [{ required: config.action!=='search', message: '请输入号码段'}]}]" :disabled="config.action==='edit'" />
          </a-form-item>
          <a-form-item label="区号">
            <a-input v-decorator="['info[region_code]', {initialValue: config.data.region_code, rules: [{ required: config.action!=='search', message: '请输入区号'}]}]" />
          </a-form-item>
          <a-form-item label="省份">
            <a-input v-decorator="['info[province]', {initialValue: config.data.province, rules: [{ required: config.action!=='search', message: '请输入省份'}]}]" />
          </a-form-item>
          <a-form-item label="城市">
            <a-input v-decorator="['info[city]', {initialValue: config.data.city, rules: [{ required: config.action!=='search', message: '请输入城市'}]}]" />
          </a-form-item>
          <a-form-item label="卡类型">
            <a-input v-decorator="['info[card_type]', {initialValue: config.data.card_type, rules: [{ required: config.action!=='search', message: '请输入卡类型'}]}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit(true)">{{ config.action==='search'?'搜索':'保存' }}</a-button>
          <a-button @click="handleSubmit(false)">{{ config.action==='search'?'重置':'关闭' }}</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      config: {
        data: {}
      },
      // 搜索参数
      queryParam: { },
      // 表头
      columns: [ {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '号码段',
        dataIndex: 'segment',
        sorter: true
      }, {
        title: '区号',
        dataIndex: 'region_code',
        sorter: true
      }, {
        title: '省份',
        dataIndex: 'province',
        sorter: true
      }, {
        title: '城市',
        dataIndex: 'city',
        sorter: true
      }, {
        title: '卡类型',
        dataIndex: 'card_type',
        sorter: true
      }, {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
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
    // 加载表格数据
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/phonesegment/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 刷新表格
    refresh () {
      this.$refs.table.refresh()
    },
    // 搜索
    handleSearch () {
      if (this.config.action !== 'search') {
        this.form.resetFields()
      }
      this.config = {
        action: 'search',
        title: '搜索',
        data: {}
      }
      this.visible = true
    },
    // 添加
    handleAdd () {
      this.visible = true
      this.loading = true
      this.form.resetFields()
      this.config = {
        action: 'add',
        title: '添加',
        url: '/admin/phonesegment/add',
        data: {}
      }
      this.axios({
        url: this.config.url
      }).then((res) => {
        this.loading = false
        this.config.data = res.result.data
      })
    },
    // 编辑
    handleEdit (record) {
      this.visible = true
      this.loading = true
      this.form.resetFields()
      this.config = {
        action: 'edit',
        title: '编辑',
        url: '/admin/phonesegment/edit',
        data: {}
      }
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: record.id })
      }).then((res) => {
        this.loading = false
        this.config.data = res.result.data
      })
    },
    // 删除
    handleDelete (record) {
      const that = this
      const id = record && record.id || this.selectedRowKeys
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/admin/phonesegment/delete',
            data: { id: id }
          }).then(res => {
            that.$refs.table.refresh()
          })
        }
      })
    },
    // 导入
    handleImport () {
      this.$message.info('功能暂未开放')
    },
    // 导出
    handleExport () {
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/phonesegment/export`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    // 搜索/保存数据
    handleSubmit (tag) {
      if (this.config.action === 'search') {
        if (tag) {
          // 搜索
          const { info } = this.form.getFieldsValue()
          this.queryParam = info
          this.refresh()
        } else {
          // 重置
          this.queryParam = {}
          this.refresh()
        }
        this.visible = false
      } else {
        if (tag) {
          this.form.validateFields((errors, values) => {
            if (!errors) {
              this.loading = true
              this.axios({
                url: this.config.url,
                data: Object.assign(values, { id: this.config.data.id })
              }).then((res) => {
                this.visible = false
                this.loading = false
                this.refresh()
                if (res.message) {
                  this.$message.warning(res.message)
                } else {
                  this.$message.success('操作成功')
                }
              })
            }
          })
        } else {
          this.visible = false
        }
      }
    }
  }
}
</script>
