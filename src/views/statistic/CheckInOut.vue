<template>
  <a-card>
    <a-form class="search" layout="inline" :form="form">
      <a-form-item>
        <a-range-picker
          @change="getSearchDate"
          v-decorator="['info[replyTime]', {
            initialValue: searchDate,
          }]"
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
      <a-form-item>
        <a-select v-model="queryParam.searchField" style="width: 140px;">
          <a-select-option value="username">坐席姓名</a-select-option>
          <a-select-option value="extension">分机号码</a-select-option>
          <a-select-option value="type">签入/签出类型</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-select v-model="queryParam.searchOper" style="width: 100px;">
          <a-select-option value="cn">包含</a-select-option>
          <a-select-option value="eq">等于</a-select-option>
          <a-select-option value="nc">不包含</a-select-option>
          <a-select-option value="ne">不等于</a-select-option>
          <a-select-option value="gt">大于</a-select-option>
          <a-select-option value="lt">小于</a-select-option>
          <a-select-option value="bw">开始于</a-select-option>
          <a-select-option value="bn">不开始于</a-select-option>
          <a-select-option value="ew">结束于</a-select-option>
          <a-select-option value="en">不结束于</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="queryParam.searchField == 'type'">
        <a-select v-model="queryParam.typeSearchString">
          <a-select-option :value="0">签出</a-select-option>
          <a-select-option :value="1">签入</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-else>
        <a-input v-model="queryParam.searchString" placeholder=""/>
      </a-form-item>
      <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
      <a-button @click="() => {searchDate = null; queryParam = {'searchField': 'username','searchOper': 'cn','typeSearchString': 0}; $refs.table.refresh(true)}">重置</a-button>
      <a-button icon="download" @click="handleExport()">导出</a-button>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="sorter"
    >
      <span
        slot="type"
        slot-scope="text"
      >
        <template v-if="text == '1'">签入</template>
        <template v-else>签出</template>
      </span>
    </s-table>
    <general-export ref="generalExport" />
  </a-card>
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
      searchDate: null,
      form: this.$form.createForm(this),
      // 搜索参数
      queryParam: {
        searchField: 'username',
        searchOper: 'cn',
        typeSearchString: 0
      },
      // 表头
      columns: [ {
        title: '坐席姓名',
        dataIndex: 'username',
        sorter: false
      }, {
        title: '分机号码',
        dataIndex: 'extension',
        sorter: false
      }, {
        title: '操作类型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' },
        sorter: false
      }, {
        title: '开始时间',
        dataIndex: 'start_time',
        sorter: false
      }, {
        title: '结束时间',
        dataIndex: 'end_time',
        sorter: false
      }, {
        title: '操作时长',
        dataIndex: 'duration',
        sorter: false
      } ],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      const that = this
      return this.axios({
        url: '/statistic/checkinout/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        that.searchDate = [res.result.time.start_time ? this.moment(res.result.time.start_time, 'YYYY-MM-DD HH:mm:ss') : '', res.result.time.end_time ? this.moment(res.result.time.end_time, 'YYYY-MM-DD HH:mm:ss') : '']
        return res.result
      })
    },
    handleExport () {
      // const where = encodeURIComponent(JSON.stringify(this.queryParam))
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/checkinout/init/?export=1&where=${where}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.start_time = dateString[0]
      this.queryParam.end_time = dateString[1]
    }
  }
}
</script>
<style scoped>
.search{
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.search button{
  margin-right: 8px;
}
</style>
