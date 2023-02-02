<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="选择时间">
        <a-range-picker
          :ranges="{
            今天: [moment().startOf('day'), moment().endOf('day')],
            昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
            本周: [moment().startOf('week'), moment().endOf('week')],
            本月: [moment().startOf('month'), moment().endOf('month')],
          }"
          :allowClear="false"
          showTime
          @change="getSearchTime"
          v-model="searchtime"
          style="width: 100%"/>
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {'searchtime': null,'endtime': null,'username': null}, username = undefined, $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:export icon="download" @click="handleExport">导出</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="var1"
      :columns="columns"
      :data="loadDataTable"
      :showPagination="false"
    >
    </s-table>
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  data () {
    return {
      // 时间组件
      searchtime: null,
      advanced: false,
      // 搜索参数
      queryParam: {
        'starttime': null,
        'endtime': null
      },
      // 表头
      columns: [ {
        title: '#',
        customRender: (text, record, index) => `${index + 1}`
      }, {
        title: '技能组',
        dataIndex: 'var1',
        sorter: false
      }, {
        title: '总呼叫数',
        dataIndex: 'var2',
        sorter: false
      }, {
        title: '接通数',
        dataIndex: 'var3',
        sorter: false
      }, {
        title: '接通率',
        dataIndex: 'var4',
        sorter: false
      }, {
        title: '接通通话时长',
        dataIndex: 'var5',
        sorter: false
      }, {
        title: '接通平均通话时长',
        dataIndex: 'var6',
        sorter: false
      }, {
        title: '接通排队时长',
        dataIndex: 'var7',
        sorter: false
      }, {
        title: '接通平均排队时长',
        dataIndex: 'var8',
        sorter: false
      }]
    }
  },
  created () {
    this.queryParam.starttime = this.moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
    this.queryParam.endtime = this.moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    this.searchtime = [this.moment().startOf('day'), this.moment().endOf('day')]
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/comment/skillQueue',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleExport () {
      this.$refs.generalExport.show({
        controller: 'statistic/Comment',
        method: 'exportSkillQueue',
        parameter: {
          starttime: this.queryParam.starttime,
          endtime: this.queryParam.endtime,
          userinfo: {
            id: this.userInfo.id,
            roleid: this.userInfo.roleid
          }
        }
      })
    },
    getSearchTime (date, dateString) {
      this.queryParam.starttime = dateString[0]
      this.queryParam.endtime = dateString[1]
    }
  }
}
</script>
