<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" >搜索</a-button>
            <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="用户名">
              <a-input />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="真实姓名">
              <a-input />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="分机号码">
              <a-input />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">权限设置</a>
        </div>
      </s-table>
    </a-card>
  </div>
</template>
<script>

export default {
  data () {
    return {
      advanced: false,
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
        title: 'ID',
        dataIndex: 'id',
        width: 60,
        sorter: true
      }, {
        title: '用户名',
        dataIndex: 'userName',
        sorter: true
      }, {
        title: '真实姓名',
        dataIndex: 'realName',
        sorter: true
      }, {
        title: '分机号码',
        dataIndex: 'number',
        sorter: true
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      creator: [],
      colLayout: {}
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/quality/powered/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.creator = res.result.data.creator
        return res.result
      })
    },
    // 获取现在时间
    getTime (timestamp = +new Date()) {
      if (timestamp) {
        const time = new Date(timestamp)
        const y = time.getFullYear()
        const M = time.getMonth() + 1
        const d = time.getDate()
        const h = time.getHours()
        const m = time.getMinutes()
        const s = time.getSeconds()
        return y + '-' + this.addZero(M) + '-' + this.addZero(d) + ' ' + this.addZero(h) + ':' + this.addZero(m) + ':' + this.addZero(s)
      } else {
        return ''
      }
    },
    addZero (value) {
      return value < 10 ? '0' + value : value
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
