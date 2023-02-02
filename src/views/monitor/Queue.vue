<template>
  <div>
    <a-card style="height: 300px; overflow: hidden; position:relative">
      <a-table
        ref="table"
        size="small"
        :columns="columns"
        rowKey="number"
        :dataSource="queueData"
        :scroll="{y: 240}"
      >
        <div slot="total" slot-scope="text, record" >
          {{ record.agents_status.total }}
        </div>
        <div slot="login" slot-scope="text, record" >
          {{ record.agents_status.login }}
        </div>
        <div slot="idle" slot-scope="text, record" >
          {{ record.agents_status.idle }}
        </div>
        <div slot="action" slot-scope="text, record" >
          <a @click="handleLook(record)">查看</a>
        </div>
      </a-table>
    </a-card>
    <a-card >
      <a-card
        size="small"
        v-for="(item, index) in queueData"
        :key="index"
        :title="item.queue"
        :headStyle="{ background: '#F5F5F6' }"
        style="width: 370px; height:250px; padding:0px;display: inline-block;margin-right: 12px;margin-top: 10px; position: relative" >
        <div ref="main" style="background: #fff; margin: 0; height: 180px;" @loadstart="myEcharts(index, item)"></div>
      </a-card>
    </a-card>
    <a-drawer
      :title="queueTitle"
      :width="700"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="false">
        <a-tabs default-active-key="1">
          <a-tab-pane key="1">
            <span slot="tab">
              坐席详情
            </span>
            <a-table
              ref="table"
              size="small"
              rowKey="extension"
              :columns="agentColumns"
              :dataSource="agentsData"
            >
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="2">
            <span slot="tab">
              排队详情
            </span>
            <a-table
              ref="table"
              size="small"
              rowKey="callerid"
              :columns="waitColumns"
              :data-source="waitData"
            >
              <div slot="action" slot-scope="text, record" >
                <a @click="queuePickup(record)">抢接</a>
              </div>
            </a-table>
          </a-tab-pane>
        </a-tabs>
        <div class="bbar">
          <a-button @click="visible=!visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import echarts from 'echarts'
export default {
  data () {
    return {
      // 定时任务
      timeOut: null,
      // 队列标题
      queueTitle: '',
      // 排队详情
      waitData: [],
      // 队列坐席
      agentsData: [],
      // 队列数据
      queueData: [],
      visible: false,
      // 队列列表
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 60,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '队列名称',
        dataIndex: 'queue'
      }, {
        title: '坐席总数',
        dataIndex: 'agents_total',
        scopedSlots: { customRender: 'total' }
      }, {
        title: '签入坐席',
        dataIndex: 'agents_login',
        scopedSlots: { customRender: 'login' }
      }, {
        title: '空闲坐席',
        dataIndex: 'agents_idle',
        scopedSlots: { customRender: 'idle' }
      }, {
        title: '等待数量',
        dataIndex: 'wait_number'
      }, {
        title: '最长等待时间',
        dataIndex: 'max_wait_time'
      }],
      // 坐席详情列表
      agentColumns: [{
        title: '坐席姓名',
        dataIndex: 'name'
      }, {
        title: '分机号码',
        dataIndex: 'extension'
      }, {
        title: '当前状态',
        dataIndex: 'status'
      }, {
        title: '最后通话时间',
        dataIndex: 'last_call_time',
        width: 120
      }],
      waitColumns: [{
        title: '操作',
        dataIndex: 'action',
        width: 60,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '来电号码',
        dataIndex: 'callerid'
      }, {
        title: '客户名称',
        dataIndex: 'name'
      }, {
        title: '客户级别',
        dataIndex: 'level'
      }, {
        title: '等待时间',
        dataIndex: 'wait_time',
        width: 120
      }]
    }
  },
  watch: {
    queueData: function (val) {
      this.$nextTick(() => {
        this.queueData.forEach((item, index) => {
          this.myEcharts(echarts.init(this.$refs.main[index]), this.queueData[index].agents_status)
        })
      })
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.axios({
        url: '/monitor/queue/init',
        params: this.$route.query
      }).then(res => {
        this.queueData = res.result.data
        clearTimeout(this.timeOut)
        this.upData(res.result.timeout)
      })
    },
    upData (timeout = 100000) {
      const that = this
      this.timeOut = setTimeout(function () {
        that.loadData()
      }, timeout)
    },
    handleLook (record) {
      this.agentsData = record.agents_detail
      this.waitData = record.wait_number_data
      this.queueTitle = record.queue
      this.visible = true
    },
    queuePickup (record) {
      var that = this
      this.axios({
        url: '/monitor/queue/queuePickup',
        params: {
          extension: that.userInfo.extension,
          channel: record.channel
        }
      }).then(res => {
        this.$message.success('操作成功')
        this.loadData()
      })
    },
    myEcharts (echart, status) {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          y: 'middle',
          data: ['空闲', '示忙', '通话', '振铃', '离线']
        },
        series: [ {
          name: '坐席状态',
          type: 'pie',
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          radius: '55%',
          center: ['40%', '50%'],
          data: [
            { value: status.idle, name: '空闲' },
            { value: status.busy, name: '示忙' },
            { value: status.calling, name: '通话' },
            { value: status.ringing, name: '振铃' },
            { value: status.loginout, name: '离线' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        } ]
      }
      echart.setOption(option)
    }
  }
}
</script>
