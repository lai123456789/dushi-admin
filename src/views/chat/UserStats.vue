<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {status:'0'}; $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="在线状态">
              <a-select v-model="queryParam.status" :allowClear="true">
                <a-select-option value="1" @click="() => {queryParam = {status: 1}, $refs.table.refresh(true)}">在线</a-select-option>
                <a-select-option value="2" @click="() => {queryParam = {status: 2}, $refs.table.refresh(true)}">示忙</a-select-option>
                <a-select-option value="3" @click="() => {queryParam = {status: 3}, $refs.table.refresh(true)}">离线</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="用户名">
              <a-input v-model="queryParam.user_name" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="昵称">
              <a-input v-model="queryParam.nick_name" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <s-table
        ref="table"
        size="small"
        rowKey="service_id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter" >
        <span slot="state" slot-scope="text">
          <template v-if="text =='idle'"><span style="background-color: #52C41B; padding: 2px 8px; border-radius: 4px; color: white;">在线</span></template>
          <template v-else-if="text =='busy'"><span style="background-color: orange; padding: 2px 8px; border-radius: 4px; color: white;">示忙</span></template>
          <template v-else><span style="background-color: #BFC0BF; padding: 2px 8px; border-radius: 4px; color: white;">离线</span></template>
        </span>
      </s-table>
    </a-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      advanced: false,
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      queryParam: { },
      columns: [{
        title: '用户名',
        dataIndex: 'user_name',
        sorter: true
      }, {
        title: '昵称',
        dataIndex: 'nick_name',
        sorter: true
      }, {
        title: '在线状态',
        dataIndex: 'state',
        scopedSlots: { customRender: 'state' },
        sorter: false
      }, {
        title: '当前接待量',
        dataIndex: 'chating',
        sorter: true
      }, {
        title: '累计会话量',
        dataIndex: 'conversation',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '累计消息量',
        dataIndex: 'chats',
        sorter: true
      },
      {
        title: '平均首次响应时长',
        dataIndex: 'averageFirstAnswerTime',
        sorter: true
      },
      {
        title: '平均会话时长',
        dataIndex: 'averageConversationTime',
        sorter: true
      }],
      sorter: { field: 'user_name', order: 'ascend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/user/stats',
        params: params
      }).then(res => {
        return res.result
      })
    },
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
<style scoped>
.components-input-demo-size .ant-input {
  width: 200px;
  margin: 0 8px 8px 0;
}
</style>
