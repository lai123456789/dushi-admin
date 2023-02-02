<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {type:'receive'}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="公告类型">
              <a-select v-model="queryParam.type" @change="changeType">
                <a-select-option value="receive">已收公告</a-select-option>
                <a-select-option value="send">已发公告</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="标题">
              <a-input v-model="queryParam.title"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="发送人">
              <a-input v-model="queryParam.sender"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button v-action:add icon="plus" @click="handleAdd" type="primary">发送公告</a-button>
        <a-button v-action:delete icon="delete" @click="handleDelete()" type="danger" :disabled="selectedRowKeys.length==0">批量删除</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :rowSelection="rowSelection"
        :sorter="sorter"
      >
        <span slot="isread" slot-scope="text">
          <a-badge v-if="text =='1'" status="success" text="已读" />
          <a-badge v-else status="error" text="未读" />
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="handleView(record)">查看</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
      <modal-form ref="modalForm" @ok="handleOk" />
      <view-form ref="viewForm" @ok="handleOk" />
    </a-card>
  </div>
</template>
<script>
export default {
  components: {
    modalForm: () => import('./InformForm'),
    viewForm: () => import('./InformView')
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: { type: 'receive' },
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '标题',
        dataIndex: 'title',
        sorter: true
      }, {
        title: '发送人',
        dataIndex: 'sender',
        sorter: true
      }, {
        title: '状态',
        dataIndex: 'isread',
        sorter: true,
        scopedSlots: { customRender: 'isread' }
      }, {
        title: '发送时间',
        dataIndex: 'inputtime',
        sorter: true
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      colLayout: {},
      sorter: { field: 'id', order: 'descend' }
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/base/inform/info',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.$refs.modalForm.show({
        action: 'add',
        title: '发送公告',
        url: '/base/inform/senderInform'
      })
    },
    handleView (record) {
      this.$refs.viewForm.show({
        title: '查看',
        record: record
      })
    },
    changeType (val) {
      if (val === 'receive') {
        this.columns.splice(4, 1, {
          title: '状态',
          dataIndex: 'isread',
          sorter: true,
          scopedSlots: { customRender: 'isread' }
        })
      } else {
        this.columns.splice(4, 1, {
          title: '接收人',
          dataIndex: 'receiver',
          sorter: true
        })
      }
      this.$refs.table.refresh()
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const that = this
      const id = record && record.id || this.selectedRowKeys
      const type = this.queryParam.type
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/base/inform/delete',
            data: { id: id, type: type }
          }).then(res => {
            that.$refs.table.refresh()
          })
        }
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
