<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {dialinout: '', value: '',inputtime:[moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')]};section = null; $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="评价时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')]
                }"
                showTime
                :allowClear="false"
                @change="getSearchDate"
                v-model="inputtime"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="用户名">
              <a-select
                showSearch
                v-model="queryParam.agent"
                placeholder="请输入用户名关键字进行搜素"
                allowClear
                :filter-option="false"
                :not-found-content="fetching ? undefined : null"
                @search="getUser"
                @popupScroll="popupScroll"
                @change="(e)=>{if(!e){userData = []}}"
              >
                <a-spin v-if="fetching" slot="notFoundContent" size="small" />
                <a-select-option :value="user.username" v-for="user in userData" :key="user.username">{{ user.username }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="分机号码">
              <a-input v-model="queryParam.extension" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="评价号码">
              <a-input v-model="queryParam.number" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼叫类型">
              <a-select v-model="queryParam.dialinout" :allowClear="true">
                <a-select-option value="0">呼入</a-select-option>
                <a-select-option value="1">呼出</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="评价结果">
              <a-select v-model="queryParam.value" :allowClear="true">
                <a-select-option value="-1">直接挂机</a-select-option>
                <a-select-option value="1">满意</a-select-option>
                <a-select-option value="2">一般</a-select-option>
                <a-select-option value="3">不满意</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button v-action:export icon="download" @click="handleExport">导出</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="key"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter">
        <span slot="dialinout" slot-scope="text">
          <template v-if="text =='0'">呼入</template>
          <template v-else >呼出</template>
        </span>
        <span slot="value" slot-scope="text">
          <template v-if="text =='-1'">直接挂机</template>
          <template v-else-if="text =='1'">满意</template>
          <template v-else-if="text =='2'">一般</template>
          <template v-else-if="text =='3'">不满意</template>
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="handlePlayback(record)">播放</a>
          <a-divider type="vertical" />
          <a @click="handleDownload(record)">下载</a>
        </div>
      </s-table>
      <general-export ref="generalExport" />
    </a-card>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    this.getUser = debounce(this.getUser, 800)
    return {
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      lastFetchId: 0,
      userData: [],
      fetching: false,
      scrollStats: true,
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      searchData: '',
      sourceUrl: null,
      // 时间组件
      inputtime: [this.moment().startOf('day'), this.moment().endOf('day')],
      advanced: false,
      // 搜索参数
      queryParam: {
        extension: '',
        agent: '',
        number: '',
        dialinout: '',
        value: '',
        inputtime: [this.moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), this.moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')]
      },
      where: '',
      // 排序
      sorter: { field: 'inputtime', order: 'descend' },
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '用户名',
        dataIndex: 'agent',
        sorter: true
      }, {
        title: '分机号码',
        dataIndex: 'extension',
        sorter: true
      }, {
        title: '评价号码',
        dataIndex: 'number',
        sorter: false
      }, {
        title: '呼叫类型',
        dataIndex: 'dialinout',
        scopedSlots: { customRender: 'dialinout' },
        sorter: false
      }, {
        title: '评价结果',
        dataIndex: 'value',
        scopedSlots: { customRender: 'value' },
        sorter: true
      }, {
        title: '评价时间',
        dataIndex: 'inputtime',
        sorter: true
      }]
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/comment/log',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.where = res.result.where
        return res.result
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.starttime = ''
      this.queryParam.endtime = ''
      this.queryParam.inputtime = dateString
    },
    getUser (e) {
      this.searchData = e
      this.page.pageNo = 1
      this.scrollStats = true
      if (e) {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.fetching = true
        this.axios({
          url: '/admin/user/init',
          params: Object.assign(this.page, { username: e, init: true })
        }).then(res => {
          if (fetchId !== this.lastFetchId) {
            return
          }
          this.userData = res.result.data
          this.fetching = false
        })
      } else {
        this.userData = []
      }
    },
    getUserScroll () {
      this.axios({
        url: '/admin/user/init',
        params: Object.assign(this.page, { username: this.searchData, init: true })
      }).then(res => {
        if (!res.result.data.length) {
          this.scrollStats = false
        }
        this.userData = [...this.userData, ...res.result.data]
      })
    },
    popupScroll (e) {
      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight
      const clientHeight = e.target.clientHeight
      const scrollBottom = scrollHeight - clientHeight - scrollTop
      if (scrollBottom < 1 && this.scrollStats && this.searchData) {
        this.page.pageNo++
        this.getUserScroll()
      }
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
    handleOk () {
      this.$refs.table.refresh()
    },
    handlePlayback (record) {
      this.sourceUrl = this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + record.recordfile
      this.$setSetting({ audioPlayData: { visible: true, sourceUrl: this.sourceUrl } })
    },
    handleDownload (record) {
      window.open(this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + record.recordfile)
    },
    handleExport () {
      this.$refs.generalExport.show({
        controller: 'statistic/Comment',
        method: 'exportLog',
        parameter: {
          where: this.where
        }
      })
    }
  }
}
</script>
