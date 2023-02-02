
<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <div v-if="config.action ==='exam'">
        <a-card class="table-search" :bordered="true">
          <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
            <div class="head">
              <a-space style="margin-left: 8px">
                <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search">查询</a-button>
                <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col v-bind="colLayout">
                <a-form-item label="参考状态">
                  <a-select :allowClear="true" show-search v-model.trim="queryParam.status">
                    <a-select-option v-for="(item, key) in teststatus" :key="key" :value="key">{{ item.type }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="考生姓名">
                  <a-input v-model.trim="queryParam.username" />
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="成绩">
                  <a-input v-model.trim="queryParam.grade" />
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="考试次数">
                  <a-input v-model.trim="queryParam.exam_num" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <div class="table-operator">
          <a-alert
            :message="'共' + all + ' 人， ' + tested +' 人已考， '+ pass +' 人已通过'"
            type="info"
            show-icon
          />
        </div>
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="columns"
          :data="loadDataTable"
          :sorter="{ field: 'id', order: 'descend' }"
        >
          <div slot="action" slot-scope="text, record">
            <a @click="lookResult(record)">查看结果</a>
          </div>
          <div slot="duration" slot-scope="text">
            {{ text + '分钟' }}
          </div>
        </s-table>
        <a-drawer
          :destroyOnClose="true"
          :title="configresult.title"
          :width="600"
          :visible="resultvisible"
          @close="resultvisible=!resultvisible"
        >
          <a-spin :spinning="loading">
            <s-table
              ref="table2"
              size="small"
              rowKey="id"
              :columns="columns2"
              :data="loadDataTable2"
              :showPagination="false"
              :sorter="{ field: 'id', order: 'descend' }"
            >
              <div slot="action" slot-scope="text, record">
                <a @click="browsePage(record)">查看</a>
              </div>
              <div slot="duration" slot-scope="text">
                {{ text + '分钟' }}
              </div>
            </s-table>
          </a-spin>
        </a-drawer>
      </div>
      <div v-else>
        <a-card class="table-search" :bordered="true">
          <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
            <div class="head">
              <a-space style="margin-left: 8px">
                <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search">查询</a-button>
                <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="所属题库">
                  <a-select :allowClear="true" show-search v-model.trim="queryParam.subjectid">
                    <a-select-option v-for="item in bankname" :key="item.id" :value="item.id">{{ item.subject }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item label="题型">
                  <a-select :allowClear="true" show-search v-model.trim="queryParam.type">
                    <a-select-option v-for="item in questionType" :key="item.value" :value="item.value">{{ item.type }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item label="题目">
                  <a-input v-model.trim="queryParam.title" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="columns3"
          :data="loadDataTable3"
          :showPagination="false"
          :sorter="{ field: 'id', order: 'descend' }"
        >
          <span slot="sort" slot-scope="text, record, index">{{ index + 1 }}</span>
          <div slot="type" slot-scope="text">
            <span v-for="value in questionType" :key="value.value" v-show="value.value === text">{{ value.type }}</span>
          </div>
        </s-table>
      </div>
      <browsing ref="Browsing" @ok="tablerefresh"/>
    </a-spin>
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
      resultvisible: false,
      loading: false,
      queryParam: {},
      config: {},
      configresult: {},
      detailsdata: {},
      formdata: {},
      action: '',
      colLayout: {},
      bankname: [],
      all: 0,
      tesded: 0,
      pass: 0,
      qualified: 0,
      questionType: [{
        type: '单选题',
        value: 'single'
      }, {
        type: '多选题',
        value: 'multiple'
      }, {
        type: '填空题',
        value: 'fills'
      }, {
        type: '判断题',
        value: 'judge'
      }, {
        type: '简答题',
        value: 'answer'
      }],
      teststatus: [{
        type: '未开始',
        value: '0'
      }, {
        type: '进行中',
        value: '1'
      }, {
        type: '已结束',
        value: '2'
      }],
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '考生姓名',
        dataIndex: 'username'
      }, {
        title: '考生所属部门',
        dataIndex: 'department'
      }, {
        title: '完成时间',
        dataIndex: 'finishtime'
      }, {
        title: '总分',
        dataIndex: 'score'
      }, {
        title: '成绩',
        dataIndex: 'grade'
      }, {
        title: '考试次数',
        dataIndex: 'exam_num'
      }, {
        title: '平均用时',
        dataIndex: 'duration',
        scopedSlots: { customRender: 'duration' }
      }
      // , {
      //   title: '状态',
      //   dataIndex: 'state'
      // }
      ],
      columns2: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: '完成时间',
        dataIndex: 'finishtime',
        width: 140
      }, {
        title: '成绩',
        dataIndex: 'grade'
      }, {
        title: '用时',
        dataIndex: 'duration',
        scopedSlots: { customRender: 'duration' }
      }],
      columns3: [{
        title: '#',
        dataIndex: 'sort',
        align: 'center',
        scopedSlots: { customRender: 'sort' },
        width: 40
      }, {
        title: '题目',
        dataIndex: 'title'
      }, {
        title: '题型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' },
        width: 100
      }, {
        title: '所属题库',
        dataIndex: 'subject',
        width: 200
      }, {
        title: '答题次数',
        dataIndex: 'total',
        width: 120
      }, {
        title: '正确次数',
        dataIndex: 'correct',
        width: 120
      }, {
        title: '正确率',
        dataIndex: 'correct_rate',
        width: 100
      }]
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  mounted () {
    this.getBankname()
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    // 数据渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/exam/Achievement/examAnalyze',
        params: Object.assign(parameter, this.queryParam, { paperid: this.config.data.id })
      }).then(res => {
        this.pass = 0
        res.result.data.forEach(item => {
          if (Number(item.grade) > Number(this.qualified)) {
            this.pass++
          }
        })
        return res.result
      })
    },
    getBankname () {
      const parameter = {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      }
      this.axios({
        url: 'exam/Subject/init',
        data: parameter
      }).then(res => {
        this.bankname = res.result.data
      })
    },
    loadDataTable2 (parameter) {
      return this.axios({
        url: '/exam/Achievement/userGrades',
        params: { paperid: this.config.data.id, username: this.formdata.username }
      }).then(res => {
        return res.result
      })
    },
    loadDataTable3 (parameter) {
      return this.axios({
        url: '/exam/Achievement/questionAnalyze',
        params: Object.assign(parameter, this.queryParam, { paperid: this.config.data.id })
      }).then(res => {
        return res.result
      })
    },
    // 接收数据
    show (config) {
      this.config = config
      this.config.settings = JSON.parse(config.data.setting)
      this.qualified = this.config.settings.qualified
      this.visible = true
      const number = config.data.user_num.split('/')
      this.all = number[1]
      this.tested = number[0]
      this.action = config.action
    },
    // 查看考卷详情
    lookResult (record) {
      this.resultvisible = true
      this.configresult.title = '考卷详情'
      this.detailsdata = record.tested
      this.formdata = record
      this.loading = false
    },
    // 审阅试卷页面
    browsePage (record) {
      this.$refs.Browsing.detailshow({
        action: 'check',
        title: '审阅试卷',
        url: '',
        data: record
      })
    },
    // 搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    tablerefresh () {
      const table = this.$refs.table2
      table.refresh()
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
    // 刷新
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
