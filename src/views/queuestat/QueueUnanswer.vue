<template>
  <div>
    <a-tabs v-model="tbKey" size="small" type="card">
      <a-tab-pane key="info" tab="报表信息">
        <a-spin :spinning="infoLoading" style="width: 100%; height: 100px;">
          <a-form>
            <a-form-item
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              v-for="(item, index) of tableViceData"
              :key="index"
              :label="item.name" >
              {{ item.value }}
            </a-form-item>
          </a-form>
        </a-spin>
      </a-tab-pane>
      <a-tab-pane v-for="item in config.tab" :key="item.key" :tab="item.name">
        <a-button type="primary" style="margin-bottom: 8px" @click="handleExport('', tbKey)">导出</a-button>
        <template v-if="item.key !== 'un_agent'">
          <a-table
            v-if="currentKey === 'unanswered'"
            rowKey="key"
            :columns="item.head"
            :data-source="item.tablesData"
            @expand="expand"
            size="small"
            :pagination="false"
            :bordered="true" >
            <template slot="exportDetails" slot-scope="text, record1">
              <a href="#" @click="handleExport(record1)">导出</a>
            </template>
            <template slot="record" slot-scope="text1, recd">
              <a href="#" @click="handlePlay(recd)" style="margin-right: 10px;">
                <a-icon type="play-circle" />
              </a>
              <a href="#" @click="handleDownload(recd)" style="margin-right: 10px;">
                <a-icon type="download" />
              </a>
            </template>
            <s-table
              style="width: 100%;"
              rowKey="id"
              slot="expandedRowRender"
              :columns="item.headChild"
              :data="loadData"
              size="small"
              :bordered="false" >
              <template slot="record" slot-scope="text1, recd">
                <a href="#" @click="handlePlay(recd)" style="margin-right: 10px;">
                  <a-icon type="play-circle" />
                </a>
                <a href="#" @click="handleDownload(recd)" style="margin-right: 10px;">
                  <a-icon type="download" />
                </a>
              </template>
            </s-table>
          </a-table>
        </template>
        <template v-else>
          <s-table
            v-if="currentKey === 'unanswered'"
            rowKey="id"
            :columns="item.head"
            :data="loadDataDetail"
            :expandedRowKeys="expandedRowKeys"
            @expand="expandDetail"
            size="small"
            :bordered="true" >
            <template slot="exportDetails" slot-scope="text, record1">
              <a href="#" @click="handleExport(record1)">导出</a>
            </template>
            <template slot="record" slot-scope="text1, recd">
              <a href="#" @click="handlePlay(recd)" style="margin-right: 10px;">
                <a-icon type="play-circle" />
              </a>
              <a href="#" @click="handleDownload(recd)" style="margin-right: 10px;">
                <a-icon type="download" />
              </a>
            </template>
            <template slot="expandedRowRender" slot-scope="text" v-if="expandedRowKeys[0] === text.id">
              <s-table
                style="width: 100%;"
                rowKey="id"
                :columns="item.headChild"
                :data="loadDatachild"
                size="small"
                ref="detail"
                :bordered="false" >
                <template slot="record" slot-scope="text1, recd">
                  <a href="#" @click="handlePlay(recd)" style="margin-right: 10px;">
                    <a-icon type="play-circle" />
                  </a>
                  <a href="#" @click="handleDownload(recd)" style="margin-right: 10px;">
                    <a-icon type="download" />
                  </a>
                </template>
              </s-table>
            </template>
          </s-table>
        </template>
      </a-tab-pane>
    </a-tabs>
    <a-modal :visible="modelVisible" centered :closable="false" :footer="null" @cancel="modelVisible = !modelVisible" >
      <audio controls="true" autoplay="true" style="vertical-align: middle; width: 100%;">
        <source :src="audioUrl"/>
      </audio>
    </a-modal>
    <general-export ref="generalExport" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as info from './config'
export default {
  props: {
    // 搜索条件
    searchData: {
      type: Object,
      default: () => {}
    },
    currentKey: {
      type: String,
      default: ''
    }
  },
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  watch: {
    searchData: {
      handler () {
        this.changeFlag = true
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  created () {
    this.config = info.config.unanswered
    this.requestUrl = '/queuestat/index/getundata'
  },
  data () {
    return {
      // 子标签页双向绑定key
      tbKey: 'info',
      infoLoading: false,
      // 后台返回的表格数据
      allData: {},
      // 报表信息
      tableViceData: [],
      config: {},
      tableKey: {
        qname: '队列'
      },
      record: {},
      requestData: {},
      modelVisible: false,
      audioUrl: '',
      detailRecord: {},
      expandedRowKeys: [],
      changeFlag: false
    }
  },
  methods: {
    init () {
      if (this.changeFlag) {
        this.infoLoading = true
        this.axios({
          url: '/queuestat/index/unanswered',
          data: {
            type: 'income_un_agent',
            queue: this.searchData.queue,
            agent: this.searchData.agent,
            starttime: this.searchData.startTime,
            endtime: this.searchData.endTime,
            issession: 1
          }
        }).then(res => {
          if (res.code === 0) {
            this.infoLoading = false
            const data = res.result.bbxx
            const keyObj = this.config.reportInfo
            const arr = []
            for (const key in keyObj) {
              if (key === 'periods') {
                data[key] = data[key] + '天'
              }
              if (keyObj[key]) {
                const obj = {}
                obj.name = [keyObj[key]]
                if (key === 'division') {
                  obj.value = res.result.thxx.total_times + '/' + data.total_times
                } else if (key === 'allPercent') {
                  let num = res.result.thxx.total_times ? data.total_times / res.result.thxx.total_times * 100 : 0
                  num = num.toFixed(2)
                  obj.value = num + '%'
                } else {
                  obj.value = data[key]
                }
                arr.push(obj)
              }
            }
            this.tableViceData = arr
            this.config.tab.forEach(item => {
              item.tablesData = res.result.data[item.key]
            })
            this.changeFlag = false
          }
        })
      }
    },
    expand (expanded, record) {
      this.record = record
      this.requestData = {
        type: this.tbKey,
        queue: this.searchData.queue,
        agent: this.searchData.agent,
        starttime: this.searchData.startTime,
        endtime: this.searchData.endTime,
        searchdata: record.key,
        issession: 1
      }
    },
    handleExport (record, key) {
      const data = {
        type: this.tbKey,
        queue: this.searchData.queue,
        agent: this.searchData.agent,
        starttime: this.searchData.startTime,
        endtime: this.searchData.endTime,
        searchdata: record.key,
        issession: 1
      }
      if (key) {
        this.$refs.generalExport.show({
          title: '导出',
          record: record,
          number: '',
          method: key === 'un_agent' ? 'getundataExport' : 'unansweredExport',
          controller: '/queuestat/Export',
          parameter: data // 新增
        })
      } else {
        this.$refs.generalExport.show({
          title: '导出',
          record: record,
          number: '',
          method: 'unDetailExport',
          controller: '/queuestat/Export',
          parameter: data // 新增
        })
      }
    },
    urlEncode (param, key, encode) {
      if (param == null) return ''
      var paramStr = ''
      var t = typeof (param)
      if (t === 'string' || t === 'number' || t === 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param)
      } else {
        for (var i in param) {
          var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
          paramStr += this.urlEncode(param[i], k, encode)
        }
      }
      return paramStr
    },
    handlePlay (record) {
      const url = this.setting.interfaceurl + '/sdk/index/record/?type=download&file=' + record.lywj
      this.modelVisible = true
      this.audioUrl = url
    },
    handleDownload (record) {
      const url = this.setting.interfaceurl + '/sdk/index/record/?type=download&file=' + record.lywj
      window.open(url)
    },
    loadData (parameter) {
      return this.axios({
        data: Object.assign(this.requestData, {
          queue: this.searchData.queue,
          agent: this.searchData.agent,
          starttime: this.searchData.startTime,
          endtime: this.searchData.endTime
        }),
        params: Object.assign(parameter),
        url: '/queuestat/index/getundata'
      }).then((res) => {
        return res.result
      })
    },
    loadDataDetail (parameter) {
      this.expandedRowKeys = []
      return this.axios({
        data: {
          type: 'income_un_agent',
          queue: this.searchData.queue,
          agent: this.searchData.agent,
          starttime: this.searchData.startTime,
          endtime: this.searchData.endTime,
          issession: 1
        },
        params: Object.assign(parameter),
        url: '/queuestat/index/getundata'
      }).then((res) => {
        res.result.data.forEach(item => {
          item.key = item.id
        })
        return res.result
      })
    },
    expandDetail (expanded, record) {
      if (expanded) {
        if (this.detailRecord.uid !== record.uid) {
          this.detailRecord = record
        }
        this.expandedRowKeys = [record.key]
      } else {
        this.expandedRowKeys = []
      }
    },
    loadDatachild (parameter) {
      return this.axios({
        url: '/queuestat/index/getlinedata',
        data: {
          type: 'un_agent',
          queue: this.searchData.queue,
          agent: this.searchData.agent,
          starttime: this.searchData.startTime,
          endtime: this.searchData.endTime,
          issession: 1,
          uniqueid: this.detailRecord.uid
        },
        params: Object.assign(parameter)
      }).then(res => {
        return res.result
      })
    }
  }
}
</script>
