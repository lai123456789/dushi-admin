<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" @click="search">搜索</a-button>
            <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="请求时间">
              <a-range-picker
                v-model="start_time"
                @change="getInputTime"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                :allowClear="false"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="请求来源">
              <a-input v-model.trim="queryParam.source" placeholder="精确搜索"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="请求参数">
              <a-input v-model.trim="queryParam.request" placeholder="模糊搜索"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="响应结果">
              <a-input v-model.trim="queryParam.response" placeholder="模糊搜索"/>
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
        <div slot="request" slot-scope="text">
          {{ text }}
        </div>
        <div slot="response" slot-scope="text">
          {{ text }}
        </div>
        <div slot="action" slot-scope="text, record">
          <a @click="() => { infoItem = record; visible = !visible }">查看</a>
        </div>
      </s-table>
    </a-card>
    <a-drawer
      title="查看"
      :width="1200"
      :destroyOnClose="true"
      :visible="visible"
      @close="visible = !visible">
      <a-spin :spinning="loading">
        <a-form :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-form-item label="请求时间">
            <div>{{ infoItem.start_time }}</div>
          </a-form-item>
          <a-form-item label="请求时长">
            <div>{{ infoItem.duration }}s</div>
          </a-form-item>
          <a-form-item label="请求来源">
            <div>{{ infoItem.source }}</div>
          </a-form-item>
          <a-form-item label="请求模式">
            <div>{{ infoItem.mode }}</div>
          </a-form-item>
          <a-form-item label="请求地址">
            <div>{{ infoItem.requrl }}</div>
          </a-form-item>
          <a-form-item label="请求参数" style="margin-bottom: 8px">
            <json-viewer :value="infoItem.request" :expand-depth="2" boxed sort copyable/>
          </a-form-item>
          <a-form-item label="响应结果">
            <json-viewer :value="infoItem.response" :expand-depth="6" boxed sort copyable/>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
import JsonViewer from 'vue-json-viewer'
export default {
  components: {
    JsonViewer
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
      // 搜索参数
      queryParam: {},
      start_time: null,
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 80,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40,
        sorter: true
      }, {
        title: '请求时间',
        dataIndex: 'start_time',
        width: 150
      }, {
        title: '请求时长',
        dataIndex: 'duration',
        width: 80
      }, {
        title: '请求来源',
        dataIndex: 'source',
        width: 100
      }, {
        title: '请求模式',
        dataIndex: 'mode',
        width: 100
      }, {
        title: '请求地址',
        dataIndex: 'requrl'
      }, {
        title: '请求参数',
        dataIndex: 'request',
        scopedSlots: { customRender: 'request' }
      }, {
        title: '响应结果',
        dataIndex: 'response',
        scopedSlots: { customRender: 'response' }
      }],
      colLayout: {},
      infoItem: {}
    }
  },
  created () {
    this.start_time = [this.moment().startOf('day'), this.moment().endOf('day')]
    this.queryParam.start_time = [this.moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), this.moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')]
    this.changeAdvanced(false)
  },
  methods: {
    // 页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/ApiLog/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    getInputTime (date, dateString) {
      this.queryParam.start_time = dateString
    },
    // 搜索
    search () {
      const table = this.$refs.table
      table.refresh(true)
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
