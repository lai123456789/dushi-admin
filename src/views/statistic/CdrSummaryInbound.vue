<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => { queryParam = {disposition: ''};calldate = null; $refs.table.refresh(true)}">重置</a-button>
            <a-button v-action:export @click="handleExport()">导出</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼入时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getSearchDate"
                v-model="calldate"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼入号码">
              <a-input v-model="queryParam.src" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="DID号码">
              <a-input v-model="queryParam.did" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼叫状态">
              <a-select v-model="queryParam.disposition" :allowClear="true">
                <a-select-option value="ANSWERED">接听</a-select-option>
                <a-select-option value="NO ANSWER">振铃未接</a-select-option>
                <a-select-option value="other">其他未接</a-select-option>
                <a-select-option value="FAILED">失败</a-select-option>
              </a-select>
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
        :sorter="sorter">
        <span slot="disposition" slot-scope="text">
          <template v-if="text =='ANSWERED'">接听</template>
          <template v-else-if="text =='NO ANSWER'">振铃未接</template>
          <template v-else-if="text =='other'">其他未接</template>
          <template v-else-if="text =='FAILED'">失败</template>
        </span>
      </s-table>
    </a-card>
    <general-export ref="generalExport" />
  </div>
</template>
<script>
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      // 时间组件
      calldate: null,
      advanced: false,
      // 搜索参数
      queryParam: {
        src: '',
        disposition: '',
        calldate: '',
        starttime: '',
        endtime: ''
      },
      // 排序
      sorter: { field: 'calldate', order: 'descend' },
      // 表头
      columns: [{
        title: '呼入时间',
        dataIndex: 'calldate',
        sorter: true
      }, {
        title: '呼入号码',
        dataIndex: 'src',
        sorter: true
      }, {
        title: 'DID号码',
        dataIndex: 'did',
        sorter: true
      }, {
        title: '呼叫状态',
        dataIndex: 'disposition',
        scopedSlots: { customRender: 'disposition' },
        sorter: true
      }]
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/CdrSummary/inbound',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.calldate = [res.result.begin_day ? this.moment(res.result.begin_day, 'YYYY-MM-DD hh:mm:ss') : '', res.result.end_day ? this.moment(res.result.end_day, 'YYYY-MM-DD hh:mm:ss') : '']
        this.queryParam.calldate = [res.result.begin_day, res.result.end_day]
        return res.result
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.starttime = dateString[0]
      this.queryParam.endtime = dateString[1]
      this.queryParam.calldate = dateString
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
    handleExport () {
      // let where = '1 = 1 '
      // if (this.queryParam.src) {
      //   where += ' and src = "' + this.queryParam.src + '"'
      // }
      // if (this.queryParam.disposition) {
      //   where += ' and disposition = "' + this.queryParam.disposition + '"'
      // }
      // if (this.queryParam.starttime && this.queryParam.endtime) {
      //   where += ' and calldate >= "' + this.queryParam.starttime + '" and calldate <= "' + this.queryParam.endtime + '"'
      // } else if (this.queryParam.calldate) {
      //   where += ' and calldate >= "' + this.queryParam.calldate[0] + '" and calldate <= "' + this.queryParam.calldate[1] + '"'
      // }
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/CdrSummary/inboundExport?where=` + encodeURIComponent(where))
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    }
  }
}
</script>
