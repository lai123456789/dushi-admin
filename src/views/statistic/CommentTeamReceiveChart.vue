<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="选择时间">
        <a-date-picker
          :allowClear="false"
          format="YYYY-MM-DD"
          v-model="searchtime"
          @change="getDate"
        />
      </a-form-item>
      <a-space>
        <a-button @click="userDrawer">
          <a-badge status="success" v-if="selectnames.length>0"/>
          <a-badge status="default" v-else/>
          选择用户</a-button>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {'searchtime': null,},selectnames= [], $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:export icon="download" @click="handleExport()">导出</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="var3"
      :columns="columns"
      :data="loadDataTable"
    >
    </s-table>
    <priv-left-right ref="privLeftRight" @ok="getUser"/>
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport'),
    PrivLeftRight: () => import('@/views/admin/Table/PrivLeftRight')
  },
  data () {
    return {
      // 时间组件
      searchtime: null,
      // 搜索参数
      queryParam: {
        'searchtime': null
      },
      selectnames: [],
      // 表头
      columns: [ {
        title: '#',
        customRender: (text, record, index) => `${index + 1}`
      }, {
        title: '日期',
        dataIndex: 'var1',
        sorter: false
      }, {
        title: '坐席姓名',
        dataIndex: 'var2',
        sorter: false
      }, {
        title: '分机号码',
        dataIndex: 'var3',
        sorter: false
      }, {
        title: '呼入量',
        dataIndex: 'var4',
        sorter: false
      }, {
        title: '呼入接通量',
        dataIndex: 'var5',
        sorter: false
      }, {
        title: '呼入接通率',
        dataIndex: 'var6',
        sorter: false
      }, {
        title: '通话总时长(s)',
        dataIndex: 'var7',
        sorter: false
      }, {
        title: '平均通话时长(s)',
        dataIndex: 'var8',
        sorter: false
      }, {
        title: '签入总时长(h)',
        dataIndex: 'var9',
        sorter: false
      }, {
        title: '空闲总时长(s)',
        dataIndex: 'var10',
        sorter: false
      }, {
        title: '示忙总时长(s)',
        dataIndex: 'var11',
        sorter: false
      }, {
        title: '工时利用率',
        dataIndex: 'var12',
        sorter: false
      }, {
        title: '员工利用率(8h)',
        dataIndex: 'var13',
        sorter: false
      }, {
        title: '员工有效利用率',
        dataIndex: 'var14',
        sorter: false
      }]
    }
  },
  created () {
    this.queryParam.searchtime = this.moment().startOf('day').subtract('day', 1).format('YYYY-MM-DD')
    this.searchtime = this.moment().startOf('day').subtract('day', 1)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/comment/teamreceivechart',
        params: Object.assign(parameter, this.queryParam),
        data: { selectnames: this.selectnames }
      }).then(res => {
        return res.result
      })
    },
    userDrawer () {
      this.$refs.privLeftRight.show({
        title: '选择用户',
        selectValue: this.selectnames
      })
    },
    getUser (val) {
      this.selectnames = val
    },
    handleExport () {
      this.$refs.generalExport.show({
        controller: 'statistic/Comment',
        method: 'exportTeamReceiveChart',
        parameter: {
          searchtime: this.queryParam.searchtime,
          selectnames: this.selectnames
        }
      })
    },
    getDate (date, dateString) {
      this.queryParam.searchtime = dateString
    }
  }
}
</script>
