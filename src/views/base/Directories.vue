<template>
  <a-layout class="mylayout" >
    <a-layout-sider
      :trigger="null"
      width="400"
      collapsible
      collapsedWidth="0"
      theme="light"
      v-model="collapsed"
      style="margin-right: 10px"
    >
      <s-table
        size="small"
        ref="directoriesTable"
        :columns="directoriesColumns"
        :data="directoriesData"
        rowKey="id"
        :defaultExpandedRowKeys="['0']"
        :showPagination="false"
      >
        <div slot="title" style="margin-top: 3px">
          <span><a-icon type="unordered-list" /> 分组管理</span>
        </div>
        <a-dropdown slot="action" slot-scope="text, record">
          <a><a-icon type="more" /></a>
          <a-menu slot="overlay">
            <a-menu-item @click="directoriesAdd(record)">
              <a><a-icon type="file-add"/>添加下级分组</a>
            </a-menu-item>
            <a-menu-item @click="directoriesEdit(record)" :hidden="record.id == 0">
              <a><a-icon type="edit"/> 编辑</a>
            </a-menu-item>
            <a-menu-item @click="directoriesDel(record)" :hidden="record.id == 0">
              <a><a-icon type="delete"/> 删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <a slot="name" slot-scope="text, record" @click="tagdataLoad(record)">{{ text }}</a>
      </s-table>
    </a-layout-sider>
    <a-layout style="background: #ffffff;">
      <s-table
        size="small"
        ref="memberTable"
        :columns="tagdataColumns"
        rowKey="id"
        :data="memberData"
      >
        <template slot="title">
          <a-button size="small" icon="plus" @click="memberAdd" type="primary">添加</a-button>
          <a-divider type="vertical" />
          <div class="switch-loading">
            显示子级分组人员：
            <a-switch
              v-model="queryParam.showSub"
              size="small"
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked
              @change="onSwitchLoading"
              :loading="switchLoading" />
          </div>
          <span></span>
        </template>
        <span slot="sort" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="actionTagdata" slot-scope="text, record">
          <a @click="memberEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="memberDel(record)">删除</a>
        </span>
      </s-table>
      <directories-group ref="directoriesGroup" @ok="directoriesRefresh"/>
      <directories-member ref="directoriesMember" @ok="tagdataRefresh"/>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  components: {
    DirectoriesGroup: () => import('./DirectoriesGroup'),
    DirectoriesMember: () => import('./DirectoriesMember')
  },
  data () {
    return {
      collapsed: false,
      expandedKeys: [],
      directoriesColumns: [{
        title: '分组名称',
        dataIndex: 'name',
        width: 200,
        scopedSlots: {
          customRender: 'name'
        }
      }, {
        title: '操作',
        width: 30,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }],
      tagdataColumns: [ {
        title: '#',
        width: 30,
        scopedSlots: { customRender: 'sort' }
      }, {
        title: '操作',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'actionTagdata' }
      }, {
        title: '姓名',
        dataIndex: 'name'
      }, {
        title: '分组',
        dataIndex: 'group_name'
      }, {
        title: '手机',
        dataIndex: 'phone_number'
      }, {
        title: '职务',
        dataIndex: 'position'
      }],
      switchLoading: false, // 开关loading
      queryParam: {
        showSub: true
      }
    }
  },
  methods: {
    onSwitchLoading () {
      this.switchLoading = !this.switchLoading
      this.tagdataRefresh()
      this.switchLoading = !this.switchLoading
    },
    // 加载分组
    directoriesData (parameter) {
      return this.axios({
        url: 'base/Directories/groupInit',
        params: parameter
      }).then(res => {
        return res.result
      })
    },
    // 分组加载
    directoriesRefresh () {
      this.$refs.directoriesTable.refresh()
    },
    // 分组添加
    directoriesAdd (record) {
      this.$refs.directoriesGroup.show({
        action: 'submit',
        title: '添加',
        url: '/base/Directories/groupAdd',
        record: record
      })
    },
    // 分组编辑
    directoriesEdit (record) {
      this.$refs.directoriesGroup.show({
        action: 'edit',
        title: '编辑',
        url: '/base/Directories/groupEdit',
        record: record
      })
    },
    // 分组删除
    directoriesDel (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/base/Directories/groupDel',
            data: { number: record.number }
          }).then((res) => {
            if (res.message) {
              that.$message.info(res.message)
            } else {
              that.$message.success('操作成功')
            }
            that.$refs.directoriesTable.refresh()
          })
        }
      })
    },
    // 加载组员数据
    memberData (parameter) {
      return this.axios({
        url: '/base/Directories/userInit',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 组员数据加载
    tagdataRefresh () {
      this.$refs.memberTable.refresh()
    },
    // 组员数据加载
    tagdataLoad (value) {
      this.queryParam.number = value.number
      this.tagdataRefresh()
    },
    // 组员数据添加
    memberAdd () {
      this.$refs.directoriesMember.show({
        action: 'add',
        title: '添加',
        url: '/base/Directories/userAdd',
        group_number: this.queryParam.number
      })
    },
    // 组员数据编辑
    memberEdit (record) {
      this.$refs.directoriesMember.show({
        action: 'edit',
        title: '编辑',
        url: '/base/Directories/userEdit',
        group_number: record.group_number,
        record: record
      })
    },
    // 组员数据删除
    memberDel (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/base/Directories/userDel',
            data: { id: record.id }
          }).then((res) => {
            that.$refs.memberTable.refresh()
            that.$message.success('操作成功')
          })
        }
      })
    }
  }
}
</script>
<style scoped>
  .mylayout{
    background: #ffffff;
    height: 100%;
  }
  .mylayout .trigger-tag {
    padding-right: 10px;
    cursor: pointer;
    transition: color 0.3s;
  }
  .mylayout .trigger-tag:hover {
    color: #1890ff;
  }
  .switch-loading {
    display: inline-block;
    margin: 0;
    padding: 0;
    line-height: 10px;
  }
  .switch-loading button {
    top: -1px;
    display: inline-block;
    margin: 0;
    padding: 0;
  }
</style>
