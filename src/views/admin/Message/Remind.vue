<template>
  <a-card class="container">
    <a-spin :spinning="false">
      <a-tabs v-model="currentKey" @change="changeKey" tabPosition="left">
        <a-tab-pane key="unread">
          <span slot="tab">
            <a-badge :count="unreadAll" :number-style="{ margin: '0 -8px', fontSize: '12px', }">
              <span>未读消息</span>
            </a-badge>
          </span>
          <a-button-group style="margin-bottom: 8px;">
            <a-button v-for="(value,key) in typeList" :key="key" :type="currentIndex === key ? 'primary' : ''" @click="refresh(value,key)">
              <a-badge
                v-if="noticeMsg > 0 || workflowMsg > 0"
                :count="value.type === 'notice'?noticeMsg:value.type === 'workflow'?workflowMsg:'0'"
                :number-style="{ margin: '2px -8px', fontSize: '12px', }">
                {{ value.name }}
              </a-badge>
              <template v-else>{{ value.name }}</template>
            </a-button>
          </a-button-group>
          <!-- 操作按钮 -->
          <div class="table-operator">
            <a-button @click="handleRead('all')">全部标记已读</a-button>
            <a-button :disabled="selectedRowKeys.length === 0" @click="handleRead">标记已读</a-button>
            <a-button type="danger" :disabled="selectedRowKeys.length === 0" @click="handleDelAll" v-action:delete>批量删除</a-button>
          </div>
          <!-- 数据列表 -->
          <s-table
            v-if="currentKey === 'unread'"
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :rowSelection="rowSelection"
            :sorter="sorter" >
            <span slot="action" slot-scope="text, record">
              <a href="#" @click="handleWay(record)">办理</a>
              <a-divider type="vertical"></a-divider>
              <a href="#" @click="handleDetail(record)">详情</a>
              <a-divider type="vertical" v-action:delete></a-divider>
              <a @click="handleDel(record,'unread')" v-action:delete>删除</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane key="read" tab="已读消息">
          <a-button-group style="margin-bottom: 8px;">
            <a-button v-for="(value,key) in typeList" :key="key" :type="currentIndex === key ? 'primary' : ''" @click="refresh(value,key)">
              {{ value.name }}
            </a-button>
          </a-button-group>
          <!-- 操作按钮 -->
          <div class="table-operator">
            <a-button type="danger" :disabled="selectedRowKeys.length === 0" @click="handleDelAll" v-action:delete>批量删除</a-button>
          </div>
          <!-- 数据列表 -->
          <s-table
            v-if="currentKey === 'read'"
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :rowSelection="rowSelection"
            :sorter="sorter"
          >
            <span slot="action" slot-scope="text, record">
              <a href="#" @click="handleWay(record)">办理</a>
              <a-divider type="vertical"></a-divider>
              <a href="#" @click="handleDetail(record)">详情</a>
              <a-divider type="vertical" v-action:delete></a-divider>
              <a href="#" @click="handleDel(record)" v-action:delete>删除</a>
            </span>
          </s-table>
        </a-tab-pane>
        <a-tab-pane key="all" tab="全部消息">
          <a-button-group style="margin-bottom: 8px;">
            <a-button v-for="(value,key) in typeList" :key="key" :type="currentIndex === key ? 'primary' : ''" @click="refresh(value,key)">
              {{ value.name }}
            </a-button>
          </a-button-group>
          <!-- 操作按钮 -->
          <div class="table-operator">
            <a-button @click="handleRead('all')">全部标记已读</a-button>
            <a-button :disabled="selectedRowKeys.length === 0" @click="handleRead">标记已读</a-button>
            <a-button type="danger" :disabled="selectedRowKeys.length === 0" @click="handleDelAll" v-action:delete>批量删除</a-button>
          </div>
          <!-- 数据列表 -->
          <s-table
            v-if="currentKey === 'all'"
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :rowSelection="rowSelection"
            :sorter="sorter" >
            <span slot="action" slot-scope="text, record">
              <a href="#" @click="handleWay(record)">办理</a>
              <a-divider type="vertical"></a-divider>
              <a href="#" @click="handleDetail(record)">详情</a>
              <a-divider type="vertical" v-action:delete></a-divider>
              <a href="#" @click="handleDel(record)" v-action:delete>删除</a>
            </span>
          </s-table>
        </a-tab-pane>
      </a-tabs>
      <workflow-handle-form ref="workflowHandleForm" />
      <RemindDetail ref="remindDetail"/>
    </a-spin>
  </a-card>
</template>
<script>
export default {
  components: {
    WorkflowHandleForm: () => import('@/views/admin/WorkflowHandleForm'),
    RemindDetail: () => import('./RemindDetail')
  },
  data () {
    return {
      currentIndex: 0,
      typeList: [],
      config: {},
      currentKey: 'unread',
      isread: 0,
      unreadAll: 0,
      sum: 0,
      noticeMsg: 0,
      noticeSum: 0,
      workflowMsg: 0,
      workflowSum: 0,
      queryParam: {
        type: ''
      },
      sorter: { field: 'id', order: 'descend' },
      columns: [{
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
        width: 130,
        align: 'center'
      }, {
        title: '标题',
        width: 300,
        dataIndex: 'title',
        customRender: (text, record) => {
          let style = {}
          if (record.isread === '0') {
            style = { fontWeight: '900' }
          }
          return (<div style={style}>{text}</div>)
        }
      }, {
        title: '内容',
        dataIndex: 'content',
        customRender: (text, record) => {
          text = text.replace(/<[^<>]+>/g, '')
          return (<div>{text}</div>)
        }
      }, {
        title: '接收时间',
        dataIndex: 'input_time',
        width: 150
      }, {
        title: '消息类型',
        dataIndex: 'type',
        width: 150,
        customRender: (text) => {
          if (text === 'notice') {
            return '公告'
          } else if (text) {
            return '流程'
          } else {
            return '全部'
          }
        }
      }],
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  mounted () {
    this.getTypeList()
  },
  methods: {
    getTypeList () {
      this.axios({
        url: '/admin/UserTable/init?sortField=listorder&sortOrder=ascend&pageNo=1&pageSize=30',
        data: {
          associated: [],
          customColumns: [],
          tplviewid: '135b4806e8ae9e2ad0820f54f371fe9d'
        }
      }).then(res => {
        const object = [{
          type: '',
          name: '全部'
        }]
        const arr = [...object, ...res.result.data]
        this.typeList = arr
      })
    },
    show (config) {
      this.config = config
      this.currentKey = 'unread'
    },
    changeKey (key) {
      this.currentIndex = 0
      switch (key) {
        case 'unread':
          this.isread = 0
          this.queryParam.type = ''
          break
        case 'read':
          this.isread = 1
          this.queryParam.type = ''
          break
        case 'all':
          this.isread = undefined
          this.queryParam.type = ''
          break
        default:
          break
      }
    },
    // 加载数据
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/message/remind/',
        params: Object.assign(parameter, this.queryParam, { isread: this.isread })
      }).then(res => {
        if (this.isread !== 1) {
          const sum = (res.result.countlist.notice || 0) + (res.result.countlist.workflow || 0) + (res.result.countlist.workitem || 0)
          this.sum = res.result.countlist.notice > 99 ? '99+' : res.result.countlist.notice
          this.unreadAll = sum > 99 ? '99+' : sum
          this.noticeMsg = res.result.countlist.notice > 99 ? '99+' : res.result.countlist.notice
          this.workflowMsg = res.result.countlist.workflow > 99 ? '99+' : res.result.countlist.workflow
        }
        return res.result
      })
    },
    // 刷新数据
    refresh (value, key) {
      this.currentIndex = key
      this.queryParam.type = value.type
      this.$refs.table.refresh()
    },
    handleWay (record) {
      // 打开办理抽屉
      const caseId = JSON.parse(record.setting).case_id
      this.$refs.workflowHandleForm.show({
        config: {
          title: '办理流程',
          width: 1200,
          tplviewUrl: '/admin/centerflow/handleOrder',
          url: '/admin/workitem/processing',
          flowStatus: 'proceed',
          flowCondition: 'all_process',
          case_id: caseId,
          viewType: 'handle'
        }
      })
    },
    // 详情
    handleDetail (record) {
      if (record.isread === '0') {
        record.isread = '1'
        const id = record.id
        const rnumber = record.rnumber
        this.getRead(id, rnumber, record)
        if (this.sum > 0) {
          this.sum--
          if (this.sum > 99) {
            this.unreadAll = '99+'
          } else {
            this.unreadAll = this.sum
          }
        }
      }
      this.$refs.remindDetail.show({
        title: record.title,
        content: record.content,
        record: record
      })
    },
    // 标记已读
    getRead (id, rnumber, record) {
      this.axios({
        url: '/admin/message/setRemindRead',
        data: { id }
      }).then(res => {
        this.$refs.table.refresh()
        if (res.code === 0) {
          this.$emit('ok')
        }
      })
      if (record.type === 'notice') {
        this.axios({
          url: '/base/Inform/read',
          data: { id: rnumber }
        })
      }
    },
    // 删除数据
    handleDel (record, type) {
      const id = [record.id]
      if (type) {
        const that = this
        this.$confirm({
          title: '您确认要删除选中的记录吗？',
          onOk () {
            that.axios({
              url: '/admin/message/delRemind',
              data: { id }
            }).then(res => {
              if (res.code === 0) {
                const value = {
                  type: that.queryParam.type
                }
                const key = that.currentIndex
                that.refresh(value, key)
                that.$message.success('操作成功')
              }
            })
          }
        })
      } else {
        this.axios({
          url: '/admin/message/delRemind',
          data: { id }
        }).then(res => {
          if (res.code === 0) {
            const value = {
              type: this.queryParam.type
            }
            const key = this.currentIndex
            this.refresh(value, key)
            this.$message.success('操作成功')
          }
        })
      }
    },
    // 删除所有
    handleDelAll () {
      const id = this.selectedRowKeys
      const that = this
      this.$confirm({
        title: '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/admin/message/delRemind',
            data: { id }
          }).then(res => {
            if (res.code === 0) {
              const value = {
                type: that.queryParam.type
              }
              const key = that.currentIndex
              that.refresh(value, key)
              // that.refresh()
              that.$message.success('操作成功')
            }
          })
        }
      })
    },
    // 已读
    handleRead (type = '') {
      let idAll = ''
      let id = []
      if (type === 'all') {
        idAll = 'all'
      } else {
        id = this.selectedRowKeys
      }
      this.axios({
        url: '/admin/message/setRemindRead',
        data: { id: id.length !== 0 ? id : idAll }
      }).then(res => {
        if (res.code === 0) {
          const value = {
            type: this.queryParam.type
          }
          const key = this.currentIndex
          this.refresh(value, key)
          this.$emit('ok')
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.container /deep/ .ant-tabs{
  height: calc(100vh - 120px);
  overflow: auto;
}
</style>
