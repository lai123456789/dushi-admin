<template>
  <div class="box">
    <div class="content">
      <div class="bianjiao"></div>
      <div class="bianjiao2"></div>
      <div class="bianjiao_rotate"></div>
      <div class="bianjiao_rotate2"></div>
      <div class="leftbigborder"></div>
      <div class="leftbigborder_rotate"></div>
      <div class="line_lf"></div>
      <div class="line_rf"></div>
      <div class="line_bottom"></div>
      <div class="titleBox">
        <div class="lfline"></div>
        <div class="titl"> <span></span> 客服坐席状态 <span></span></div>
      </div>
      <div class="Lbox">
        <div class="timeBox">{{ timeStr }}</div>
        <div class="rightBox">技术支持：深圳市笃实科技有限公司</div>
      </div>
      <div class="tablebox">
        <div class="tabox">
          <div class="kta">
            <div class="lf-a"></div>
            <div class="lf-b"></div>
            <div class="lf-c"></div>
            <div class="lf-d"></div>
            <div class="table-content">
              <a-table
                ref="onetable"
                size="small"
                rowKey="id"
                :pagination="false"
                :columns="Columns"
                :data-source="tabledata1"
              >
                <span slot="status" slot-scope="status">
                  <a-tag
                    :color="status==='-1'?'#ff5500':(status==='0'?'#87d068':(status==='1'?'#87d068':(status==='2'?'#722ed1':(status==='4'?'#ff5500':(status==='8'?'#e98410':(status==='16'?'#10b1e9':'#108ee9')))))) "
                  >
                    {{ status==='-1'?'离线':(status==='0'?'空闲':(status==='1'?'通话中':(status==='2'?'示忙':(status==='4'?'离线':(status==='8'?'振铃中':(status==='16'?'保持中':'')))))) }}
                  </a-tag>
                </span>

              </a-table>
            </div>
          </div>
        </div>
        <div class="tabox">
          <div class="kta">
            <div class="small_bianjiao1"></div>
            <div class="small_bianjiao2"></div>
            <div class="small_bianjiao3"></div>
            <div class="small_bianjiao4"></div>
            <div class="table-content">
              <a-table
                ref="table"
                size="small"
                rowKey="id"
                :pagination="false"
                :columns="Columns"
                :data-source="tabledata2"
              >
                <span slot="status" slot-scope="status">
                  <a-tag
                    :color="status==='-1'?'#ff5500':(status==='0'?'#87d068':(status==='1'?'#87d068':(status==='2'?'#722ed1':(status==='4'?'#ff5500':(status==='8'?'#e98410':(status==='16'?'#10b1e9':'#108ee9')))))) "
                  >
                    {{ status==='-1'?'离线':(status==='0'?'空闲':(status==='1'?'通话中':(status==='2'?'示忙':(status==='4'?'离线':(status==='8'?'振铃中':(status==='16'?'保持中':'')))))) }}
                  </a-tag>
                </span></a-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import './assets/css/chartframe.css'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      timeStr: '0000-00-00 00:00:00',
      Columns: [ {
        title: 'ID',
        dataIndex: 'id',
        align: 'center'
      }, {
        title: '姓名',
        dataIndex: 'realname',
        align: 'center'
      }, {
        title: '分机',
        dataIndex: 'extension',
        align: 'center'
      }, {
        title: '持续时间',
        dataIndex: 'time',
        align: 'center'
      }, {
        title: '接听量',
        dataIndex: 'call_answer',
        align: 'center'

      }, {
        title: '接听总时长',
        dataIndex: 'call_answer_time',
        align: 'center'

      }, {
        title: '呼出量',
        dataIndex: 'call_out',
        align: 'center'

      }, {
        title: '呼出总时长',
        dataIndex: 'call_out_time',
        align: 'center'
      }, {
        title: '状态',
        dataIndex: 'status',
        align: 'center',
        scopedSlots: { customRender: 'status' }
      } ],
      sorter: { field: 'id', order: 'descend' },
      tabledata1: [],
      tabledata2: [],
      Interval: null,
      settimeout: 5
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  mounted () {
    this.loadTabledata()
    this.timeChange()
  },
  activated () {
    this.tervalload()
  },
  deactivated () {
    clearInterval(this.Interval)
  },
  methods: {
    timeChange () {
      setInterval(() => {
        const date = new Date()
        const Y = date.getFullYear() + '-'
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
        const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
        const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
        const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
        this.timeStr = Y + M + D + h + m + s
      }, 1000)
    },
    loadTabledata () {
      this.axios({
        url: '/monitor/Monitor5/init',
        params: { httpget: '', moni: JSON.stringify([1, 1]) },
        timeout: 5 * 60 * 1000
      }).then(res => {
        if (res.data1) {
          this.tabledata1 = res.data1
          this.tabledata2 = res.data2
        }
        if (res.data2) {
          this.tabledata2 = res.data2
        }
        this.settimeout = res.settimeout
      }).catch(() => {
        this.loadTabledata()
      })
    },
    tervalload () {
      this.Interval = setInterval(() => {
        this.loadTabledata()
      }, this.settimeout * 1000)
    }
  }

}
</script>
