<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'" :form="form">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
            <a @click="advanced=!advanced">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼叫时间">
              <a-range-picker
                @change="getSearchDate"
                v-decorator="['info[replyTime]', {
                  initialValue: searchDate,
                }]"
                :allowClear="false"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="跟进状态">
              <a-select v-model="queryParam.callback" allow-clear>
                <a-select-option v-for="value in callback" :key="value.value">{{ value.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="主叫号码">
              <a-input v-model="queryParam.src_number" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="被叫号码">
              <a-input v-model="queryParam.dst_number" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="振铃时长">
              <a-input-group compact>
                <a-input v-model="queryParam.ringtime_up" style="width: calc(50% - 15px);" placeholder="单位: 秒" />
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input v-model="queryParam.ringtime_down" style="width: calc(50% - 15px); border-left: 0" placeholder="单位: 秒" />
              </a-input-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button v-action:export icon="download" @click="handleExport()">导出</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <span slot="callback" slot-scope="text">
          <a-badge v-if="text == '1'" status="success" text="已跟进" />
          <a-badge v-else status="error" text="未跟进" />
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="handle(record)">处理</a>
        </div>
      </s-table>
    </a-card>
    <a-modal
      title="处理"
      :visible="visible"
      @ok="handleOk"
      :confirmLoading="loading"
      @cancel="visible = !visible"
    >
      <a-form :label-col="{ span: 4 }" >
        <a-form-item label="电话号码" :wrapper-col="{ span: 20 }">
          <a-row>
            <a-col :span="20"><a-input v-model="dst" :read-only="true" style="background-color: #F5F5F5" /></a-col>
            <a-col :span="2"><a-button @click="handlerDial">回拨</a-button></a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="跟进状态" :wrapper-col="{ span: 20 }">
          <a-radio-group v-model="callbacktype">
            <a-radio value="0">未跟进</a-radio>
            <a-radio value="1">已跟进</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" :wrapper-col="{ span: 20 }">
          <a-textarea
            v-model="remarks"
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <general-export ref="generalExport" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      visible: false,
      loading: false,
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      // 时间组件
      searchDate: null,
      form: this.$form.createForm(this),
      indexRemark: '',
      advanced: false,
      dst: '',
      callbacktype: '0',
      where: '',
      // 搜索参数
      queryParam: {
        callback: '0'
      },
      remarks: '',
      callback: [{
        value: '0',
        type: '未跟进'
      }, {
        value: '1',
        type: '已跟进'
      }],
      // 表头
      columns: [{
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
        title: '主叫号码',
        dataIndex: 'src',
        sorter: true
      }, {
        title: '被叫号码',
        dataIndex: 'dst',
        sorter: true
      }, {
        title: '振铃时长',
        dataIndex: 'ringtime',
        sorter: true
      }, {
        title: '呼叫时间',
        dataIndex: 'calldate',
        sorter: true
      }, {
        title: '跟进状态',
        dataIndex: 'callback',
        scopedSlots: { customRender: 'callback' }
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/callrecord/misscall',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.queryParam.begin_time = res.result.begin_time
        this.queryParam.end_time = res.result.end_time
        this.searchDate = [res.result.begin_time ? this.moment(res.result.begin_time, 'YYYY-MM-DD HH:mm:ss') : '', res.result.end_time ? this.moment(res.result.end_time, 'YYYY-MM-DD HH:mm:ss') : '']
        this.where = res.result.where
        return res.result
      })
    },
    handleExport () {
      this.$refs.generalExport.show({
        controller: 'statistic/Api',
        method: 'exportCallRecord',
        parameter: {
          where: this.where,
          type: 'misscall'
        }
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.begin_time = dateString[0]
      this.queryParam.end_time = dateString[1]
    },
    handle (record) {
      this.visible = true
      this.callbacktype = record.callback
      this.indexRemark = record.id
      this.remarks = record.remarks
      this.callbackid = record.id
      if (record.src !== this.userInfo.extension && record.dst !== this.userInfo.extension) {
        this.dst = record.src.length < record.dst.length ? record.dst : record.src
      } else {
        this.dst = record.src !== this.userInfo.extension ? record.src : record.dst
      }
    },
    handlerDial () {
      if (this.userInfo.extension) {
        this.axios({
          url: '/admin/api/dial?extension=' + this.userInfo.extension + '&extensionDst=' + this.dst
        }).then(res => {
          this.$message.success('操作成功')
        })
      } else {
        this.$message.info('您未设置分机号码')
      }
    },
    handleOk () {
      this.loading = true
      this.axios({
        url: '/statistic/Callrecord/callback',
        data: { id: this.indexRemark, remarks: this.remarks, callback: this.callbacktype }
      }).then(res => {
        this.refresh()
        this.loading = false
        this.visible = false
      })
    },
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
