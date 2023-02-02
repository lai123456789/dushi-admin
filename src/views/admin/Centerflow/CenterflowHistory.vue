<template>
  <div class="page-header">
    <a-form :class="advanced ? 'advanced' : 'normal'" :layout="advanced ? 'vertical' : 'inline'" class="table-search">
      <div class="head">
        <div class="title">过滤</div>
        <a-space style="margin-left: 8px">
          <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
          <a-button @click="() => {queryParam = { flow_duration: [], workflow_id: undefined, flowCondition: queryParam.flowCondition }, endDate = moment().startOf('month'), $refs.table.refresh(true)}">重置</a-button>
          <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
        </a-space>
      </div>
      <a-row :gutter="16">
        <a-col v-if="advanced" span="24">
          <div class="divider"></div>
        </a-col>
        <a-col v-bind="colLayout" v-if="!setting.esCaseUrl">
          <a-form-item label="流程结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-month-picker
              :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
              format="YYYY-MM"
              @change="getEndDateChange"
              :allowClear="false"
              v-model="endDate"
              style="width: 100%;"
            ></a-month-picker>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.case_number"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="客户电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.customer_phone"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.transition_status"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="摘要" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.case_name"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              v-model="queryParam.workflow_id"
              :allowClear="true"
              show-search
              option-filter-prop="children">
              <a-select-option v-for="(value, key) in workflow" :key="key" :value="value.value">{{ value.text }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="发起人" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.start_username"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程发起时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-range-picker
              :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
              :placeholder="['开始时间', '结束时间']"
              @change="getStartDate"
              v-model="queryParam.startDate"
              style="width: 100%"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-operator" style="margin-left: 8px; margin-top: 8px">
      <a-space>
        <a-radio-group v-model="queryParam.flowCondition" @change="handleSizeChange" button-style="solid">
          <a-tooltip v-for="item in finish" :key="item.value" v-show="item.priv === 'visit'" :title="item.help">
            <a-radio-button :value="item.value">{{ item.customName ? item.customName : item.name }}</a-radio-button>
          </a-tooltip>
        </a-radio-group>
        <!-- <a-button icon="download" @click="handleExport">导出</a-button> -->
      </a-space>
    </div>
    <s-table
      :scroll="{ x: 1530, y: true }"
      class="table-fill"
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      pageMode="simple"
      :showSome="true"
      :data="loadDataTable"
      :sorter="{ field: 'id', order: 'descend' }"
    >
      <div slot="action" slot-scope="text, record">
        <a @click="handleView(record)">查看</a>
      </div>
      <div slot="case_name" slot-scope="text">
        <span v-html="text"></span>
      </div>
    </s-table>
    <!-- 数据表单 -->
    <workflow-handle-form ref="workflowHandleForm"></workflow-handle-form>
    <general-export ref="generalExport" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport'),
    WorkflowHandleForm: () => import('../WorkflowHandleForm')
  },
  props: {
    finish: {
      type: Array,
      default () {
        return []
      },
      required: true
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: { workflow_id: undefined, flow_duration: [] },
      endDate: this.moment().startOf('month'),
      labelCol: { style: 'width: 104px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 104px); display: inline-block' },
      where: '',
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 80,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 80
      }, {
        title: '发起人',
        dataIndex: 'username',
        width: 100
      }, {
        title: '摘要',
        dataIndex: 'case_name',
        ellipsis: false,
        scopedSlots: { customRender: 'case_name' }
      }, {
        title: '流程类型',
        dataIndex: 'workflow_name',
        width: 100
      }, {
        title: '流程编号',
        dataIndex: 'case_number',
        width: 140
      }, {
        title: '流程发起时间',
        dataIndex: 'start_date',
        sorter: true,
        width: 130
      }, {
        title: '流程状态',
        dataIndex: 'transition_status',
        width: 100
      }],
      colLayout: {},
      workflow: []
    }
  },
  created () {
    this.changeAdvanced(false)
    if (this.finish.length > 0 && this.finish.filter(item => item.priv === 'visit')[0]) {
      this.queryParam.flowCondition = this.finish.filter(item => item.priv === 'visit')[0].value
    } else {
      this.queryParam.flowCondition = 'my_handle'
    }
  },
  methods: {
    loadDataTable (parameter) {
      if (!this.setting.esCaseUrl && !this.queryParam.end_date) {
        this.queryParam.end_date = ''
        this.queryParam.end_date = this.moment().startOf('month').format('YYYY-MM')
      }
      return this.axios({
        url: '/admin/centerflow/init',
        params: Object.assign(parameter, this.queryParam, { init: !this.workflow.length, flowStatus: 'finish' })
      }).then(res => {
        if (this.workflow.length === 0) {
          this.workflow = res.result.option.workflow
        }
        this.where = res.result.where
        return res.result
      })
    },
    handleExport () {
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: '',
        controller: 'crm/Order',
        method: 'orderExport',
        parameter: { where: this.where }
      })
    },
    handleSizeChange (e) {
      this.$set(this.queryParam, 'flowCondition', e.target.value)
      this.$forceUpdate()
      this.$refs.table.refresh(true)
    },
    getStartDate (date, dateString) {
      this.queryParam.start_date_from = dateString[0]
      this.queryParam.start_date_to = dateString[1]
    },
    getEndDateChange (date, dateString) {
      this.endDate = date
      this.queryParam.end_date = date ? date.format('YYYY-MM') : dateString
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
    },
    handleView (record) {
      this.$refs.workflowHandleForm.show({
        config: {
          title: '查看流程',
          width: 1200,
          tplviewUrl: '/admin/centerflow/viewOrder',
          flowStatus: record.case_status === 'op' ? 'proceed' : 'finish',
          flowCondition: this.queryParam.flowCondition,
          case_id: record.case_id,
          viewType: 'view'
        },
        record: record
      })
    }
  }
}
</script>
