<template>
  <a-drawer
    :title="config.title"
    width="60%"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-table
        size="small"
        rowKey="menuid"
        :columns="columns"
        :dataSource="data"
        :pagination="false"
        :rowSelection="rowSelection" >
        <span slot="permission" slot-scope="text, record">
          <a-checkbox-group class="mycheckbox" :options="record.permission.actionsOptions" v-model="record.permission.selected" @change="onChangeCheck(record)" />
        </span>
      </a-table>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
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
      visible: false,
      loading: false,
      // 表头
      columns: [{
        title: '菜单权限',
        dataIndex: 'name',
        width: 300
      }, {
        title: '功能权限',
        dataIndex: 'permission',
        scopedSlots: { customRender: 'permission' }
      }],
      data: [],
      selectedRowKeys: []
    }
  },
  computed: {
    rowSelection () {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onSelect: (record, selected, selectedRows) => {
          this.onChangeCheck(record)
          this.setChildrenSelected(record, selected)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          this.data.forEach((item) => {
            this.setChildrenSelected(item, selected)
          })
        }
      }
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: { roleid: this.config.record.roleid }
      }).then(res => {
        this.loading = false
        this.data = res.result.data
        this.selectedRowKeys = res.result.selectedRowKeys
      })
    },
    // 选择功能权限
    onChangeCheck (record) {
      const selected = this.getParentPath(this.data, record.menuid)
      selected.forEach((item) => {
        if (!this.selectedRowKeys.includes(item)) {
          this.selectedRowKeys.push(item)
        }
      })
      this.setParentSelected(this.data, selected)
    },
    // 递归选中或取消选中行及子行数据
    setChildrenSelected (record, selected) {
      const selectedArr = []
      if (selected) {
        // 要勾选的功能权限
        selectedArr.push(`${record.m}>>${record.c}>>${record.a}`)
        record.permission.actionsOptions.forEach((item) => {
          selectedArr.push(item.value)
        })
        // 要勾选的行
        this.selectedRowKeys.push(record.menuid)
      } else {
        // 取消勾选行
        this.selectedRowKeys = this.selectedRowKeys.filter((item) => {
          return item !== record.menuid
        })
      }
      // 设置功能权限选中状态
      record.permission.selected = selectedArr
      // 递归处理子行
      if (record.children) {
        record.children.forEach((item) => {
          this.setChildrenSelected(item, selected)
        })
      }
    },
    // 递归设置行菜单权限
    setParentSelected (data, selected) {
      data.forEach((item) => {
        for (const i in selected) {
          if (item.menuid === selected[i] && !item.permission.selected.includes(`${item.m}>>${item.c}>>${item.a}`)) {
            item.permission.selected.push(`${item.m}>>${item.c}>>${item.a}`)
          }
          if (item.children) {
            this.setParentSelected(item.children, selected)
          }
        }
      })
    },
    // 获取菜单节点路径
    getParentPath (record, menuid, path) {
      path = path || []
      // 方法1
      for (const i in record) {
        let newPath = path.concat(record[i].menuid)
        if (record[i].menuid === menuid) {
          return newPath
        } else {
          if (record[i].children) {
            newPath = this.getParentPath(record[i].children, menuid, newPath)
            if (newPath.length > 0) {
              return newPath
            }
          }
        }
      }
      return []
      // 方法2
      // let output = []
      // record.forEach((item) => {
      //   let newPath = path.concat(item.menuid)
      //   if (item.menuid === menuid) {
      //     output = newPath
      //   } else {
      //     if (item.children) {
      //       newPath = this.getParentPath(item.children, menuid, newPath)
      //       if (newPath.length > 0) {
      //         output = newPath
      //       }
      //     }
      //   }
      // })
      // return output
    },
    // 保存
    handleSubmit () {
      this.loading = true
      this.axios({
        url: this.config.url,
        data: { data: this.data, roleid: this.config.record.roleid }
      }).then((res) => {
        this.visible = false
        this.loading = false
        this.$emit('ok')
        if (res.message) {
          this.$message.warning(res.message)
        } else {
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>
<style scoped>
.mycheckbox >>> .ant-checkbox-group-item {
  min-width: 120px;
}
</style>
