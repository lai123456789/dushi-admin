<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {starttime: moment().startOf('day').format('YYYY-MM-DD'), endtime: moment().endOf('day').format('YYYY-MM-DD')};section = [moment().startOf('day'), moment().endOf('day')]; $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="操作时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getSearchDate"
                v-model="section"
                :allowClear="false"
                format="YYYY-MM-DD"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="坐席姓名">
              <a-input v-model="queryParam.username" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="分机号码">
              <a-input v-model="queryParam.extension" />
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
        rowKey="username"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter">
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
      colLayout: {},
      // 时间组件
      section: [this.moment().startOf('day'), this.moment().endOf('day')],
      flag: 0,
      advanced: false,
      // 搜索参数
      queryParam: {
        username: '',
        extension: '',
        starttime: this.moment().startOf('day').format('YYYY-MM-DD'),
        endtime: this.moment().endOf('day').format('YYYY-MM-DD')
      },
      where: '',
      // 排序
      sorter: { field: 'username', order: 'ascend' },
      // 表头
      columns: [ {
        title: '坐席姓名',
        dataIndex: 'username',
        sorter: true
      }, {
        title: '分机号码',
        dataIndex: 'extension',
        sorter: true
      }, {
        title: '示忙总次数',
        dataIndex: 'total',
        sorter: true
      }, {
        title: '示忙总时长',
        dataIndex: 'duration',
        sorter: true
      } ]
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/dnd/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.dndtypeheader = res.result.dndtypeheader
        if (this.flag === 0) {
          for (var i = 0; i < this.dndtypeheader.length; i++) {
            this.columns.push(this.dndtypeheader[i])
          }
          this.flag++
        }
        this.where = res.result.where
        return res.result
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.starttime = dateString[0]
      this.queryParam.endtime = dateString[1]
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
      this.$refs.generalExport.show({
        controller: 'statistic/Api',
        method: 'exportDndStat',
        parameter: {
          where: this.where
        }
      })
    }
  }
}
</script>
