<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {};logintime = null;logouttime = null; $refs.table.refresh(true)}">重置</a-button>
            <a-button v-action:export @click="handleExport()">导出</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="用户名">
              <a-input v-model="queryParam.username" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="登录时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getSearchDateLogin"
                v-model="logintime"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="退出时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getSearchDateLogout"
                v-model="logouttime"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="登录IP">
              <a-input v-model="queryParam.ip" />
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
        :sorter="sorter"></s-table>
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
      logintime: null,
      logouttime: null,
      advanced: false,
      // 搜索参数
      queryParam: {
        username: '',
        logintime: '',
        logouttime: '',
        ip: ''
      },
      // 排序
      sorter: { field: 'id', order: 'descend' },
      // 表头
      columns: [ {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '用户名',
        dataIndex: 'username',
        sorter: true
      }, {
        title: '登录时间',
        dataIndex: 'login_time',
        sorter: true
      }, {
        title: '退出时间',
        dataIndex: 'logout_time',
        sorter: true
      }, {
        title: '登录时长',
        dataIndex: 'duration',
        sorter: true
      }, {
        title: '登录IP',
        dataIndex: 'ip',
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
        url: '/statistic/loginout/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    handleExport () {
      // let where = '1 = 1 '
      // if (this.queryParam.username) {
      //   where += ' and username = "' + this.queryParam.username + '"'
      // }
      // if (this.queryParam.logintime) {
      //   where += ' and login_time between "' + this.queryParam.logintime[0] + '" and ' + this.queryParam.logintime[1]
      // }
      // if (this.queryParam.logouttime) {
      //   where += ' and logout_time between "' + this.queryParam.logouttime[0] + '" and ' + this.queryParam.logouttime[1]
      // }
      // if (this.queryParam.ip) {
      //   where += ' and ip = "' + this.queryParam.ip + '"'
      // }
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}statistic/loginout/export?where=` + encodeURIComponent(where))
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    getSearchDateLogin (date, dateString) {
      this.queryParam.logintime = dateString
    },
    getSearchDateLogout (date, dateString) {
      this.queryParam.logouttime = dateString
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
