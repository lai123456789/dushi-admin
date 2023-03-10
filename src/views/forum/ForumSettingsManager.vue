<template>
  <a-drawer
    :destroyOnClose="true"
    title="用户"
    :width="config.mode === 'multiple' ? 1200 : 900"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-row>
          <a-col :span="config.mode === 'multiple' ? 14 : 24">
            <a-row type="flex" >
              <a-col :span="12">
                <a-form-item
                  label="用户名"
                  :labelCol="config.mode === 'multiple' ? { span: 4 } : { span: 3 }"
                  :wrapperCol="config.mode === 'multiple' ? { span: 20 } : { span: 18 }">
                  <a-input placeholder="请输入用户名搜索" v-model="queryParam.username" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="角色"
                  :labelCol="{ span: 4 }"
                  :wrapperCol=" { span: 20 }">
                  <a-select
                    placeholder="请输入角色名称搜索"
                    mode="multiple"
                    allowClear
                    optionFilterProp="children"
                    v-model="queryParam.roleid">
                    <a-select-option v-for="(item, key) in roleList" :key="key" :value="key">{{ item }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row type="flex" justify="space-between">
              <a-col :span="18" :style="config.mode === 'multiple' ? { marginLeft: '-8px' } : { marginLeft: '-28px' }">
                <a-form-item label="部门" :labelCol="{ span: 3 }" :wrapperCol="{ span: 21 }">
                  <a-tree-select
                    v-model="queryParam.departmentid"
                    style="width: 100%"
                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                    :tree-data="department"
                    :replaceFields="replaceFields"
                    placeholder="请输入部门名称搜索"
                    treeNodeFilterProp="title"
                    multiple
                    allowClear
                    treeDefaultExpandAll
                  />
                </a-form-item>
              </a-col>
              <a-col :span="config.mode === 'multiple' ? 2.5 : 2">
                <a-form-item :wrapperCol="{ span: 24 }">
                  <a-button htmlType="submit" @click="$refs.table.refresh(true)">搜索</a-button>
                </a-form-item>
              </a-col>
              <a-col :span="2.5">
                <a-form-item :wrapperCol="wrapperCol">
                  <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
                </a-form-item>
              </a-col>
              <a-col :span="2" v-if="config.mode !== 'multiple'">
                <a-form-item :wrapperCol="{ span: 24 }">
                  <a-button htmlType="submit" @click="$refs.table.clearSelected()">清空</a-button>
                </a-form-item>
              </a-col>
            </a-row>
            <s-table
              ref="table"
              size="small"
              rowKey="username"
              :columns="columns"
              :data="loadDataTable"
              :rowSelection="rowSelection"
              :sorter="{ field: 'id', order: 'descend' }"
            />
          </a-col>
          <a-col :span="10">
            <div v-if="config.mode === 'multiple'" style="display: flex;">
              <div>
                <div style="margin: 10px 0; display: flex; flex-direction: column;">
                  <a-button @click="handleSelect" style="margin: 60px 20px 20px 20px;">添加</a-button>
                  <a-button style="margin: 0 20px;" @click="deleteAll">清空</a-button>
                </div>
              </div>
              <div style="flex: 1; margin-top: 10px;">
                <a-card title="已选中的用户" :bordered="false">
                  <a-table size="small" rowKey="username" :columns="columnsFieldUser" :dataSource="userListData" >
                    <div slot="action" slot-scope="text, record">
                      <a @click="handleDelete(record)">删除</a>
                    </div>
                  </a-table>
                </a-card>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      config: {},
      labelCol: { span: 3 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      userListData: [],
      queryParam: {}, // 搜索参数
      columns: [{
        title: '用户名',
        dataIndex: 'username',
        sorter: true
      }, {
        title: '真实姓名',
        dataIndex: 'realname',
        sorter: true
      }, {
        title: '所属部门',
        dataIndex: 'departmentname',
        sorter: true
      }, {
        title: '所属角色',
        dataIndex: 'rolename',
        sorter: true
      }],
      columnsDepartment: [{
        title: '部门',
        dataIndex: 'text'
      }],
      columnsRole: [{
        title: '角色',
        dataIndex: 'text'
      }],
      columnsFieldUser: [ {
        title: '用户',
        dataIndex: 'username',
        width: 450
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }],
      department: [],
      roleList: [],
      replaceFields: { children: 'children', title: 'name', key: 'id', value: 'departmentid' },
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        type: 'radio',
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onChange
      }
    }
  },
  methods: {
    // 页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/api/userSearch',
        params: Object.assign(parameter, this.queryParam, { init: !this.department.length, fieldid: this.fieldid })
      }).then(res => {
        this.department = res.result.option.department
        this.roleList = res.result.option.role
        res.result.data.forEach(item => {
          item.checked = this.userListData.some(item1 => item.username === item1.username)
          if (item.checked) {
            this.selectedRowKeys.push(item.id)
          }
        })
        res.result.rowSelection = {
          rowKey: 'username',
          selectedRowKeys: this.config.mode === 'multiple' ? this.config.selectValue : [this.config.selectValue]
        }
        return res.result
      })
    },
    // 数据接收
    show (config) {
      this.config = config
      this.visible = true
      if (config.page) {
        this.rowSelection.type = 'checkbox'
      }
      this.fieldid = config.fieldid
      if (config.mode === 'multiple') {
        config.selectValue = config.selectValue ? config.selectValue : []
        this.userListData = config.selectValue ? config.selectValue.map(item => {
          const obj = {}
          obj.username = item
          obj.text = item
          return obj
        }) : []
        this.rowSelection.type = 'checkbox'
      } else {
        this.rowSelection.type = 'radio'
      }
      this.rowSelection.selectedRowKeys = this.selectedRowKeys
    },
    // 选择用户
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    // 添加
    handleSelect () {
      let userListData = [...this.userListData, ...this.selectedRows]
      const obj = {}
      userListData = userListData.reduce((acc, cur) => {
        if (!obj[cur.username]) {
          obj[cur.username] = true
          acc.push(cur)
        }
        return acc
      }, [])
      this.userListData = userListData
    },
    // 删除选中
    handleDelete (record) {
      const dataSource = [...this.userListData]
      this.userListData = dataSource.filter(item => item.username !== record.username)
      this.selectedRows = this.selectedRows.filter(item => item.username !== record.username)
      this.selectedRowKeys = this.selectedRowKeys.filter(item => item !== record.username)
      this.$refs.table.updateSelect(this.selectedRowKeys, this.selectedRows)
    },
    // 删除所有选中
    deleteAll () {
      this.userListData = []
      this.$refs.table.clearSelected()
    },
    handleSubmit () {
      const userListData = this.userListData.map(item => item.username)
      let selectValue
      if (this.config.mode !== 'default') {
        selectValue = userListData
      } else {
        selectValue = this.selectedRows[0] ? this.selectedRows[0].username : ''
      }
      this.$emit('ok', selectValue, this.config.index)
      this.visible = false
    }
  }
}
</script>
