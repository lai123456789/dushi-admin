<template>
  <a-card>
    <a-space style="margin-bottom: 8px;">
      <a-button type="primary" v-action:add icon="plus" @click="handleAdd">添加</a-button>
      <a-button v-action:import icon="upload" @click="handleImport">导入</a-button>
      <a-button icon="sort-descending" @click="handleSort">排序</a-button>
      <a-breadcrumb>
        <a-breadcrumb-item><a href="javascript:;" @click="() => {queryParam = {}, $refs.table.refresh(true)}">所有部门</a></a-breadcrumb-item>
        <a-breadcrumb-item v-for="(item, key) in breadcrumb" :key="key"><a href="javascript:;" @click="() => {queryParam = {parentid: item.departmentid}, $refs.table.refresh(true)}">{{ item.name }}</a></a-breadcrumb-item>
      </a-breadcrumb>
    </a-space>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :pageSize="999"
      :sorter="{ field: 'listorder', order: 'ascend' }"
    >
      <span slot="name" slot-scope="text, record" :title="text">
        <a href="javascript:;" @click="() => {queryParam = {parentid: record.departmentid}, $refs.table.refresh(true)}">{{ text }}</a>
      </span>
      <div slot="action" slot-scope="text, record">
        <a v-action:edit @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a>更多<a-icon type="down"/></a>
          <a-menu slot="overlay">
            <a-menu-item v-if="$auth('export')"><a @click="handleExport(record)">导出</a></a-menu-item>
            <a-menu-item disabled v-else>导出</a-menu-item>
            <a-menu-item v-if="$auth('delete')"><a @click="handleDelete(record)">删除</a></a-menu-item>
            <a-menu-item disabled v-else>删除</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </s-table>
    <department-form ref="departmentForm" @ok="handleOk" />
    <department-import ref="departmentImport" @ok="handleOk" />
    <department-sort ref="departmentSort" @ok="handleOk" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    DepartmentForm: () => import('./DepartmentForm'),
    DepartmentImport: () => import('./DepartmentImport'),
    DepartmentSort: () => import('./DepartmentSort'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      // 当前部门路径
      breadcrumb: [],
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 120,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 80
      }, {
        title: '排序',
        dataIndex: 'listorder',
        width: 80
      }, {
        title: '编号',
        dataIndex: 'departmentid',
        width: 300
      }, {
        title: '名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      }, {
        title: '最后修改人',
        dataIndex: 'update_user'
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time'
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/department/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.breadcrumb = res.result.path
        return res.result
      })
    },
    handleAdd () {
      this.$refs.departmentForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/department/add'
      })
    },
    handleEdit (record) {
      this.$refs.departmentForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/admin/department/edit',
        record: record
      })
    },
    handleDelete (record) {
      const table = this.$refs.table
      const that = this
      this.$confirm({
        title: '您确认要删除该部门及其子部门吗？',
        onOk () {
          that.axios({
            url: '/admin/department/delete',
            params: { departmentid: record.departmentid }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleSort () {
      this.$refs.departmentSort.show({
        action: 'sort',
        title: '排序',
        parentid: this.queryParam.parentid,
        data: ''
      })
    },
    handleImport () {
      let parentNubmer = ''
      if (this.breadcrumb.length > 0) {
        parentNubmer = this.breadcrumb[this.breadcrumb.length - 1]['departmentid']
      }
      this.$refs.departmentImport.show({
        title: '导入',
        url: '/admin/department/import',
        parentNubmer: parentNubmer
      })
    },
    handleExport (record) {
      // this.$confirm({
      //   title: '您确认要导出当前部门及其子部门?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/department/export/?departmentid=${record.departmentid}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: record,
        number: 'dict',
        method: 'exportDict'
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    }
  }
}
</script>
