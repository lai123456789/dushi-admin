<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="用户名">
              <a-input v-model="queryParam.username" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="真实姓名">
              <a-input v-model="queryParam.realname" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="所属角色">
              <a-select v-model="queryParam.roleid" :allowClear="true" showSearch option-filter-prop="children">
                <a-select-option v-for="(value, key) in role" :key="key" :value="key">{{ value }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="所属部门">
              <a-select
                v-model="queryParam.department"
                show-search
                allowClear
                placeholder="请输入部门名称"
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                @search="getDepartment"
                @change="(e)=>{if(!e){department = []}}"
                :autoClearSearchValue="false"
              >
                <a-select-option :value="dep.full_id" v-for="dep in department" :key="dep.departmentid">{{ dep.full_name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="状态">
              <a-select v-model="queryParam.status" :allowClear="true">
                <a-select-option value="1">启用</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="性别">
              <a-select v-model="queryParam.sex" :allowClear="true">
                <a-select-option value="男">男</a-select-option>
                <a-select-option value="女">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="手机号码">
              <a-input v-model="queryParam.phone"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="分机号码">
              <a-input v-model="queryParam.extension"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <a-space style="margin-bottom: 8px;">
        <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
        <a-button v-action:import icon="upload" @click="$refs.userImport.show()">导入</a-button>
        <a-button v-action:export icon="download" @click="handleExport()">导出</a-button>
        <a-button v-action:delete icon="delete" @click="handleDelete()" type="danger" :disabled="selectedRowKeys.length==0">批量删除</a-button>
      </a-space>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :rowSelection="rowSelection"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <span slot="status" slot-scope="text">
          <a-badge v-if="text =='1'" status="success" text="启用" />
          <a-badge v-else status="error" text="禁用" />
        </span>
        <span slot="isleader" slot-scope="text">
          <a-badge v-if="text =='1'" status="success" text="是" />
          <a-badge v-else status="error" text="否" />
        </span>
        <div slot="action" slot-scope="text, record">
          <a v-action:edit @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a>更多<a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item v-if="$auth('delete') && record.username !='admin'"><a @click="handleDelete(record)">删除</a></a-menu-item>
              <a-menu-item disabled v-else>删除</a-menu-item>
              <a-menu-item v-if="$auth('login')"><a @click="handleLogin(record)">一键登录</a></a-menu-item>
              <a-menu-item disabled v-else>一键登录</a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </s-table>
      <user-form ref="userForm" @ok="handleOk" :key="userFormKey" />
      <user-import ref="userImport" @ok="handleOk" />
      <general-export ref="generalExport" />
    </a-card>
  </div>
</template>
<script>
export default {
  components: {
    UserForm: () => import('./UserForm'),
    UserImport: () => import('./UserImport'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      advanced: false,
      userFormKey: 'userForm',
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 120,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '用户名',
        dataIndex: 'username',
        sorter: true
      }, {
        title: '真实姓名',
        dataIndex: 'realname',
        sorter: true
      }, {
        title: '状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' },
        sorter: true
      }, {
        title: '所属部门',
        dataIndex: 'departmentname',
        sorter: true
      }, {
        title: '部门负责人',
        dataIndex: 'isleader',
        scopedSlots: { customRender: 'isleader' },
        sorter: true
      }, {
        title: '所属角色',
        dataIndex: 'rolename',
        sorter: true
      }, {
        title: '性别',
        dataIndex: 'sex',
        sorter: true
      }, {
        title: '分机号码',
        dataIndex: 'extension',
        sorter: true
      }, {
        title: '最后登录时间',
        dataIndex: 'lastlogintime',
        sorter: true
      }, {
        title: '最后修改人',
        dataIndex: 'update_user',
        sorter: true
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time',
        sorter: true
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      colLayout: {},
      role: [],
      department: [],
      where: ''
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      this.queryParam.departmentid = ''
      if (this.queryParam.department) {
        this.queryParam.departmentid = this.queryParam.department.split('/')
      }
      return this.axios({
        url: '/admin/user/init',
        params: Object.assign(parameter, this.queryParam, { init: true })
      }).then(res => {
        this.role = res.result.option.role
        this.where = res.result.where
        return res.result
      })
    },
    // 获取部门
    getDepartment (e) {
      const page = {
        pageNo: 1,
        pageSize: 999,
        sortField: 'id',
        sortOrder: 'descend'
      }
      if (e) {
        this.axios({
          url: 'admin/Api/departmentSearch',
          params: Object.assign(page, { name: e })
        }).then(res => {
          this.department = res.result.data
        })
      }
    },
    handleAdd () {
      this.userFormKey = this.userFormKey === 'userForm' ? 'userForm_1' : 'userForm'
      this.$nextTick(() => {
        this.$refs.userForm.show({
          action: 'add',
          title: '添加',
          url: '/admin/user/add'
        })
      })
    },
    handleEdit (record) {
      this.userFormKey = this.userFormKey === 'userForm' ? 'userForm_1' : 'userForm'
      this.$nextTick(() => {
        this.$refs.userForm.show({
          action: 'edit',
          title: '编辑：' + record.username,
          url: '/admin/user/edit',
          record: record
        })
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const me = this
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          me.axios({
            url: '/admin/user/delete',
            data: { id: id }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    handleLogin (record) {
      const me = this
      this.$confirm({
        title: '您确认要切换当前登录用户身份为 ' + record.username + ' 吗?',
        onOk () {
          me.axios({
            url: '/admin/user/login',
            params: { id: record.id }
          }).then(res => {
            window.location = process.env.VUE_APP_BASE_URL
          })
        }
      })
    },
    handleExport () {
      // const me = this
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}admin/user/export?where=${encodeURIComponent(me.where)}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: '',
        controller: 'admin/Api',
        method: 'exportSysUser'
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
