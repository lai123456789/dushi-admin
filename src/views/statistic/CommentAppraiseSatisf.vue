<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="选择时间">
        <a-range-picker @change="getDate" v-model="searchtime"/>
      </a-form-item>
      <a-space>
        <a-button @click="handleSelect">选择用户</a-button>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {'searchtime': null,'endtime': null,'username': null}, username = undefined, $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:export icon="download" @click="handleExport">导出</a-button>
      </a-space>
    </a-form>
    <s-table
      ref="table"
      size="small"
      rowKey="var3"
      :columns="columns"
      :data="loadDataTable"
      :showPagination="false"
    >
    </s-table>
    <select-user-form ref="selectUserForm" @ok="getUser" />
    <general-export ref="generalExport" />
  </a-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    SelectUserForm: () => import('../admin/UserTable/SelectUserForm'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      // 时间组件
      searchtime: null,
      // 搜索参数
      queryParam: {
        'searchtime': null,
        'endtime': null,
        'username': null
      },
      // 表头
      columns: [ {
        title: '#',
        customRender: (text, record, index) => `${index + 1}`
      }, {
        title: '坐席姓名',
        dataIndex: 'var2',
        sorter: false
      }, {
        title: '分机号码',
        dataIndex: 'var3',
        sorter: false
      }, {
        title: '参评数',
        dataIndex: 'var4',
        sorter: false
      }, {
        title: '参评率',
        dataIndex: 'var5',
        sorter: false
      }, {
        title: '邀评数',
        dataIndex: 'var6',
        sorter: false
      }, {
        title: '邀评率',
        dataIndex: 'var7',
        sorter: false
      }, {
        title: '客户满意度(CSAT)',
        dataIndex: 'var8',
        sorter: false
      }],
      departmentid: null,
      username: undefined
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/comment/appraiseSatisfactionChart',
        params: Object.assign(parameter, this.queryParam, { init: this.columns.length === 8 }),
        data: Object.assign({ username: this.username })
      }).then(res => {
        this.departmentid = res.result.departmentid
        this.queryParam.searchtime = res.result.searchtime
        this.queryParam.endtime = res.result.endtime
        this.searchtime = [this.moment(res.result.searchtime, 'YYYY-MM-DD'), this.moment(res.result.endtime, 'YYYY-MM-DD')]
        if (this.columns.length === 8) {
          this.columns = [...this.columns, ...res.result.option]
        }
        return res.result
      })
    },
    handleExport () {
      this.$refs.generalExport.show({
        controller: 'statistic/Comment',
        method: 'exportAppraiseSatisfaction',
        parameter: {
          searchtime: this.queryParam.searchtime,
          endtime: this.queryParam.endtime,
          username: this.queryParam.username,
          departmentid: this.departmentid
        }
      })
    },
    getDate (date, dateString) {
      this.queryParam.searchtime = dateString[0]
      this.queryParam.endtime = dateString[1]
    },
    // 打开选择用户
    handleSelect () {
      this.$refs.selectUserForm.show({
        page: 'statistic',
        mode: 'multiple',
        selectValue: []
      })
    },
    // 获取用户
    getUser (val) {
      this.username = val
    }
  }
}
</script>
