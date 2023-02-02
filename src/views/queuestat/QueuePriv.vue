<template>
  <a-spin :spinning="false">
    <a-tabs type="card" size="small">
      <a-tab-pane key="role" tab="角色权限设置">
        <a-alert message="此处权限用于控制队列坐席，个人权限覆盖角色权限" show-icon style="margin-bottom: 8px;" />
        <s-table
          ref="roleTable"
          size="small"
          rowKey="id"
          :columns="roleColumns"
          :data="loadDataRole"
        >
          <template slot="action" slot-scope="text, record1">
            <a @click="handleEdit(record1, 'role')">
              <a-badge v-if="record1.role_status == 1" status="success" />
              <a-badge v-else status="default" />
              设置</a>
          </template>
        </s-table>
      </a-tab-pane>
      <a-tab-pane key="user" tab="个人权限设置">
        <a-form layout="inline" class="table-search" style="display: flex; align-items: center;">
          <a-form-item label="用户名">
            <a-input v-model="queryParam.username" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="真实姓名">
            <a-input v-model="queryParam.realname" placeholder="请输入真实姓名" />
          </a-form-item>
          <a-form-item label="分机号码">
            <a-input v-model="queryParam.extension" placeholder="请输入分机号" />
          </a-form-item>
          <a-space>
            <a-button htmlType="submit" type="primary" @click="$refs.userTable.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.userTable.refresh(true)}">重置</a-button>
          </a-space>
        </a-form>
        <s-table
          ref="userTable"
          size="small"
          rowKey="id"
          :columns="userColumns"
          :data="loadDataUser"
        >
          <template slot="action" slot-scope="text, record1">
            <a @click="handleEdit(record1, 'user')">
              <a-badge v-if="record1.role_status == 1" status="success" />
              <a-badge v-else status="default" />
              设置</a>
          </template>
        </s-table>
      </a-tab-pane>
    </a-tabs>
    <a-drawer
      :title="title"
      :visible="visible"
      :destroyOnClose="true"
      @close="visible = !visible"
      :width="600" >
      <a-spin :spinning="false">
        <a-form>
          <a-tree
            :defaultExpandedKeys="['all-0']"
            checkable
            :auto-expand-parent="autoExpandParent"
            v-model="checkedKeys"
            :tree-data="treeData"
            @check="onCheck" />
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visible=!visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </a-spin>
</template>
<script>
export default {
  data () {
    return {
      queryParam: {},
      visible: false,
      title: '',
      roleColumns: [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
          width: 100
        }, {
          title: 'ID',
          dataIndex: 'id',
          width: 80
        }, {
          title: '角色名称',
          dataIndex: 'rolename',
          width: 200
        }, {
          title: '备注',
          dataIndex: 'description'
        }],
      userColumns: [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
          width: 100
        }, {
          title: 'ID',
          dataIndex: 'id',
          width: 80
        }, {
          title: '用户名',
          dataIndex: 'username'
        }, {
          title: '真实姓名',
          dataIndex: 'realname'
        }, {
          title: '分级号码',
          dataIndex: 'extension'
        }, {
          title: '所属部门',
          dataIndex: 'departmentname'
        }, {
          title: '所属角色',
          dataIndex: 'rolename'
        }],
      autoExpandParent: true,
      checkedKeys: [],
      treeData: [],
      page: '',
      record: {},
      priv: []
    }
  },
  methods: {
    loadDataRole (parameter) {
      return this.axios({
        url: '/queuestat/setting/rolePrivilege',
        params: Object.assign(parameter)
      }).then(res => {
        return res.result
      })
    },
    loadDataUser (parameter) {
      return this.axios({
        url: '/queuestat/setting/personalPrivilege',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 打开编辑权限
    handleEdit (record, page) {
      this.visible = true
      this.title = '设置：' + (page === 'user' ? record.username : record.rolename)
      const treeData = [{
        checked: false,
        id: '0',
        key: 'all-0',
        title: '全部',
        type: 'all'
      }]
      treeData[0].children = record.role_text
      this.checkedKeys = this.getKey(record.role_text)
      this.treeData = treeData
      this.record = record
      this.onCheck(this.checkedKeys)
      this.page = page
    },
    getKey (arr) {
      const result = []
      arr.forEach(item => {
        if (item.children) {
          const flag = item.children.every(child => child.checked)
          if (flag) {
            result.push(item.key)
          } else {
            item.children.forEach(child => {
              if (child.checked) {
                result.push(child.key)
              }
            })
          }
        } else {
          if (item.checked) {
            result.push(item.key)
          }
        }
      })
      return result
    },
    // 清除设置权限
    handleDelete (record, action) {
      if (action === 'role') {
        this.axios({
          url: '/queuestat/setting/roleDel',
          data: { type: 'role', role_id: record.id }
        }).then(res => {
          if (res.code === 0) {
            this.$refs.roleTable.refresh()
            this.$message.success('操作成功')
          }
        })
      } else {
        this.axios({
          url: '/queuestat/setting/roleDel',
          data: { type: 'personal', user_id: record.id }
        }).then(res => {
          if (res.code === 0) {
            this.$refs.userTable.refresh()
            this.$message.success('操作成功')
          }
        })
      }
    },
    onCheck (keys, e) {
      // 初始化赋值
      this.treeData[0].children.forEach(node => {
        node.checked = false
        if (node.children) {
          node.children.forEach(child => {
            child.checked = false
          })
        }
      })
      // 选中赋值
      keys.forEach(item => {
        this.treeData[0].children.forEach(node => {
          if (node.key === item) {
            node.checked = true
          } else if (node.children) {
            node.children.forEach(child => {
              if (child.key === item) {
                child.checked = true
              }
            })
          }
        })
      })
      // 给后台传递数据
      const result = {}
      this.treeData[0].children.forEach(node => {
        if (node.checked) {
          const arr = []
          if (node.children) {
            node.children.forEach(child => {
              arr.push(child.id)
            })
          }
          result[node.id] = arr
        } else {
          const flag = node.children ? node.children.some(child => child.checked) : false
          if (flag) {
            const arr = []
            if (node.children) {
              node.children.forEach(child => {
                if (child.checked) {
                  arr.push(child.id)
                }
              })
            }
            result[node.id] = arr
          }
        }
      })
      this.priv = result
    },
    handleSubmit () {
      if (this.page === 'role') {
        this.axios({
          url: '/queuestat/setting/roleEdit',
          data: {
            type: 'role', info: { role_text: this.priv, role_id: this.record.id }
          }
        }).then(res => {
          this.$refs.roleTable.refresh()
          this.visible = false
        })
      } else {
        this.axios({
          url: '/queuestat/setting/roleEdit',
          data: {
            type: 'personal', info: { role_text: this.priv, user_id: this.record.id }
          }
        }).then(res => {
          this.$refs.userTable.refresh()
          this.visible = false
        })
      }
    }
  }
}
</script>
