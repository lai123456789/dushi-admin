
<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="800"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <div>
        <div >
          <div style="text-align: center">
            <div ><h1><b>{{ formdata.title }}</b></h1></div>
            <div v-if="formdata.time === '0'"><p>本次考试不限时， 共 {{ examData.total }} 道题，满分为 {{ examData.score }} 分</p></div>
            <div v-else><p>本次考试限时{{ formdata.time }}分钟， 共 {{ examData.total }} 道题，满分为 {{ examData.score }} 分</p></div>
            <div><p>本次考试一共可以考 <span class="span">{{ exam_num }}</span> 次，已考 <span class="span2">{{ tested ? tested : 0 }}</span> 次</p></div>
          </div>
          <a-alert
            :message="formdata.remarks"
            type="warning"
            v-if="formdata.remarks"
            style="margin-bottom: 10px"
          />
        </div>
        <a-card title="考卷详情" size="small">
          <s-table
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :showPagination="false"
            :sorter="{ field: 'id', order: 'descend' }"
          >
            <div slot="action" slot-scope="text, record">
              <a @click="lookPage(record)">查看</a>
            </div>
            <div slot="duration" slot-scope="text">
              {{ text + '分钟' }}
            </div>
          </s-table>
        </a-card>
      </div>
      <div class="bbar">
        <a-button type="primary" html-type="submit" @click="examPage" v-if="tested < exam_num && timecheck">{{ tested === 0 ? '开始考试':'重新考试' }}</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <browsing ref="Browsing" @ok="$refs.table.refresh(true)"/>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    Browsing: () => import('./Browsing')
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      queryParam: {},
      config: {},
      exam_num: 0,
      formdata: {},
      colLayout: {},
      tested: null,
      examData: {},
      timecheck: false,
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: '完成时间',
        dataIndex: 'finishtime'
      }, {
        title: '成绩',
        dataIndex: 'grade'
      }, {
        title: '用时',
        dataIndex: 'duration',
        scopedSlots: { customRender: 'duration' }
      }]
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    loadDataTable () {
      return this.axios({
        url: '/exam/Achievement/userGrades',
        params: { paperid: this.config.data.id, username: this.userInfo.username }
      }).then((res) => {
        this.tested = res.result.data.length
        this.examData = res.result.exam
        return res.result
      })
    },
    // 接收数据传参
    show (config) {
      this.loading = true
      this.visible = true
      this.formdata = {}
      this.formdata.setting = {}
      this.config = config
      this.formdata = this.config.data
      this.formdata.settings = JSON.parse(this.formdata.setting)
      this.exam_num = this.formdata.settings.exam_num
      const time = new Date()
      if (Date.parse(time) < Date.parse(config.data.endtime) && Date.parse(time) > Date.parse(config.data.starttime)) {
        this.timecheck = true
      } else {
        this.timecheck = false
      }
      this.loading = false
    },
    // 查看试卷页面
    lookPage (record) {
      this.$refs.Browsing.detailshow({
        action: 'check',
        user: 'person',
        title: '查看试卷',
        url: '',
        data: record
      })
    },
    // 考试页面
    examPage () {
      const self = this
      this.$confirm({
        title: '您确定要开始考试吗？',
        onOk () {
          self.$refs.Browsing.personShow({
            action: 'borwsing',
            user: 'personTest',
            title: '试卷',
            url: '',
            data: self.formdata,
            answer: ''
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.span{
  margin-left: 10px;
  margin-right: 5px;
  font-family:"Microsoft YaHei",微软雅黑;
  font-size: 18px;
  color: #4DAAFF;
}
.span2{
  margin-left: 10px;
  margin-right: 5px;
  font-family:"Microsoft YaHei",微软雅黑;
  font-size: 18px;
  color: #F5222D;
}
</style>
