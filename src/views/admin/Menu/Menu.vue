<template>
  <a-card>
    <a-space style="margin-bottom: 8px;">
      <a-button type="primary" v-action:add icon="plus" @click="handleAdd">添加</a-button>
      <a-button v-action:import icon="upload" @click="$refs.menuImport.show()">导入</a-button>
      <a-button v-action:sort icon="sort-ascending" @click="handleSort">排序</a-button>
      <a-breadcrumb>
        <a-breadcrumb-item><a href="javascript:;" @click="() => {queryParam = {}, $refs.table.refresh(true)}">所有菜单</a></a-breadcrumb-item>
        <a-breadcrumb-item v-for="(item, key) in breadcrumb" :key="key"><a href="javascript:;" @click="() => {queryParam = {parentid: item.menuid}, $refs.table.refresh(true)}">{{ item.name }}</a></a-breadcrumb-item>
      </a-breadcrumb>
    </a-space>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :pageSize="999"
    >
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
      <span slot="icon" slot-scope="text">
        <a-icon :type="text" />
      </span>
      <span slot="name" slot-scope="text, record">
        <a href="javascript:;" @click="() => {queryParam = {parentid: record.menuid}, $refs.table.refresh(true)}">{{ text+(record.subcount>0?'('+record.subcount+')':'') }}</a>
      </span>
      <span slot="enabled" slot-scope="text">
        <a-badge v-if="text =='1'" status="success" text="是" />
        <a-badge v-else status="error" text="否" />
      </span>
      <span slot="display" slot-scope="text">
        <a-badge v-if="text =='1'" status="success" text="是" />
        <a-badge v-else status="error" text="否" />
      </span>
      <div slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a>更多<a-icon type="down"/></a>
          <a-menu slot="overlay">
            <a-menu-item><a @click="handleDelete(record)">删除</a></a-menu-item>
            <a-menu-item><a @click="handleCopy(record)">复制</a></a-menu-item>
            <a-menu-item><a @click="handleExport(record)">导出</a></a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </s-table>
    <menu-form ref="menuForm" @ok="handleOk" />
    <menu-import ref="menuImport" @ok="handleOk" />
    <menu-sort ref="menuSort" @ok="handleOk" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    MenuForm: () => import('./MenuForm'),
    MenuImport: () => import('./MenuImport'),
    MenuSort: () => import('./MenuSort'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      // 当前菜单路径
      breadcrumb: [],
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
        title: '#',
        width: 40,
        scopedSlots: { customRender: 'serial' }
      }, {
        title: 'ID',
        dataIndex: 'id'
      }, {
        title: '图标',
        dataIndex: 'icon',
        scopedSlots: { customRender: 'icon' }
      }, {
        title: '菜单名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      }, {
        title: '模块',
        dataIndex: 'module'
      }, {
        title: '视图',
        dataIndex: 'view'
      }, {
        title: '是否启用',
        dataIndex: 'enabled',
        scopedSlots: { customRender: 'enabled' }
      }, {
        title: '是否显示',
        dataIndex: 'display',
        scopedSlots: { customRender: 'display' }
      }, {
        title: '功能权限',
        dataIndex: 'priv',
        scopedSlots: { customRender: 'priv' }
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/menu/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.breadcrumb = res.result.path
        return res.result
      })
    },
    handleAdd () {
      this.$refs.menuForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/menu/add'
      })
    },
    handleEdit (record) {
      this.$refs.menuForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/admin/menu/edit',
        record: record
      })
    },
    handleCopy (record) {
      this.$refs.menuForm.show({
        action: 'copy',
        title: '复制',
        url: '/admin/menu/edit',
        submitUrl: '/admin/menu/add',
        record: record
      })
    },
    handleSort () {
      this.$refs.menuSort.show({
        action: 'sort',
        title: '排序',
        url: '/admin/menu/sort',
        parentid: this.queryParam.parentid || ''
      })
    },
    handleExport (record) {
      // this.$confirm({
      //   title: '您确认要导出当菜单与子菜单?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/menu/export/?menuid=${record.menuid}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: record,
        number: 'dict',
        method: 'exportDict'
      })
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/menu/delete',
            params: { menuid: record.menuid }
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
