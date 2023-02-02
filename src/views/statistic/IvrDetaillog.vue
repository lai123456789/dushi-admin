<template>
  <a-card>
    <div class="table-search">
      <a-form class="normal">
        <div class="head">
          <div class="title">过滤</div>
          <a-space>
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {searchDate = null; queryParam = {ivr_id: ''}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="IVR节点">
              <a-select v-model="queryParam.ivr_id">
                <a-select-option v-for="(value, key) in selectData" :key="key" :value="value.value">{{ value.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="选择时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getSearchDate"
                v-model="searchDate"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
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
      <span slot="disposition" slot-scope="text">
        <a-badge v-if="text =='ANSWERED'" status="success" text="接听" />
        <a-badge v-else status="error" text="未接听" />
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
      // 下拉框数据
      selectData: {},
      // 时间组件
      searchDate: null,
      // 搜索参数
      queryParam: {
        ivr_id: ''
      },
      // 表头
      columns: [ {
        title: 'ID',
        dataIndex: 'id',
        defaultSortOrder: 'descend',
        sorter: true
      }, {
        title: 'IVR节点',
        dataIndex: 'ivrname',
        sorter: false
      }, {
        title: '按键值',
        dataIndex: 'key',
        sorter: false
      }, {
        title: '按键值说明',
        dataIndex: 'key_desc',
        sorter: false
      }, {
        title: '按键时间',
        dataIndex: 'datetime',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/ivr/detaillog',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.selectData = res.result.ivrar
        return res.result
      })
    },
    handleExport () {
      // let where = '1 = 1'
      // if (this.queryParam.ivr_id) {
      //   where += ' and ivr_id="' + this.queryParam.ivr_id + '"'
      // }
      // if (this.queryParam.starttime) {
      //   where += ' and datetime >= "' + this.queryParam.starttime + '"'
      // }
      // if (this.queryParam.endtime) {
      //   where += ' and datetime <= "' + this.queryParam.endtime + '"'
      // }
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/ivr/exportlog?where=` + encodeURIComponent(where))
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
      this.queryParam.starttime = dateString[0]
      this.queryParam.endtime = dateString[1]
    }
  }
}
</script>
