<template>
  <div>
    <a-table
      size="small"
      ref="categoryTable"
      :columns="Columns"
      :pagination="false"
      :dataSource="data"
      rowKey="id"
      :defaultExpandedRowKeys="['0']"
      :expandIconColumnIndex="3"
      :loading="loading"
    >
      <a-dropdown slot="actionCategory" slot-scope="text, record">
        <a-menu slot="overlay">
          <a-menu-item @click="handleAdd(record)">
            <a><a-icon type="file-add"/> 添加子分类</a>
          </a-menu-item>
          <a-menu-item @click="handleEdit(record)" :hidden="record.id == 0">
            <a><a-icon type="edit"/> 编辑信息</a>
          </a-menu-item>
          <a-menu-item @click="handleDel(record)" :hidden="record.id == 0">
            <a><a-icon type="delete"/> 删除信息</a>
          </a-menu-item>
        </a-menu>
        <a><a-icon type="more" /></a>
      </a-dropdown>
      <a slot="category" slot-scope="text">{{ text }}</a>
    </a-table>
    <setting-classify-form ref="settingClassifyForm" @ok="categoryRefresh"/>
  </div>
</template>
<script>
export default {
  components: {
    SettingClassifyForm: () => import('./SettingClassifyForm')
  },
  data () {
    return {
      loading: false,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      form: this.$form.createForm(this),
      Columns: [{
        dataIndex: 'action',
        key: 'action',
        width: 40,
        scopedSlots: {
          customRender: 'actionCategory'
        }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        key: 'id'
      }, {
        title: '排序',
        dataIndex: 'listorder',
        width: 80,
        key: 'listorder'
      }, {
        title: '分类名称',
        dataIndex: 'catname',
        key: 'catname'
      }, {
        title: '备注',
        dataIndex: 'remarks',
        key: 'remarks'
      }],
      data: []
    }
  },
  created () {
    this.tableRefresh()
  },
  methods: {
    tableRefresh () {
      this.loading = true
      this.axios({
        url: 'knowledge/setting/categoryInit',
        params: { parentid: 0 }
      }).then(res => {
        this.data = res.result.data
        this.data[0].listorder = 0
        this.loading = false
      })
    },
    categoryRefresh () {
      this.tableRefresh()
    },
    handleAdd (record) {
      this.$refs.settingClassifyForm.show({
        title: '添加：' + record.catname,
        url: 'knowledge/setting/categoryAdd',
        record: record,
        edit: false
      })
    },
    handleEdit (record) {
      this.$refs.settingClassifyForm.show({
        title: '编辑：' + record.catname,
        url: 'knowledge/setting/categoryEdit',
        record: record,
        edit: true
      })
    },
    handleDel (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: 'knowledge/setting/categoryDel',
            data: { id: record.id }
          }).then(res => {
            if (res.code === 0) {
              that.$message.success('操作成功')
              that.tableRefresh()
            } else {
              that.$message.warning(res.message)
            }
          })
        }
      })
    }
  }
}
</script>
