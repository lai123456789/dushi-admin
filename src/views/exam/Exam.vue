<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button type="primary" @click="Search" @keyup.enter="Search">搜索</a-button>
            <a-button @click="() => {queryParam = {}, inputtime = null, $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" :span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="考试名称">
              <a-input v-model.trim="queryParam.title" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="参考状态">
              <a-select :allowClear="true" show-search v-model.trim="queryParam.status">
                <a-select-option v-for="(item, key) in paperstatus" :key="key" :value="item.value">{{ item.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="开始时间">
              <a-range-picker
                v-model="queryParam.startshowtime"
                @change="getSearchDate"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="结束时间">
              <a-range-picker
                v-model="queryParam.endshowtime"
                @change="getSearchEndDate"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="创建人">
              <a-input v-model.trim="queryParam.inputuser"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="创建时间">
              <a-range-picker
                v-model="inputtime"
                @change="getinputtime"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button v-action:add icon="plus" type="primary" @click="addPage">添加</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="status" slot-scope="text">
          <span v-for="value in paperstatus" :key="value.value" v-show="value.value === text">
            {{ value.type }}
          </span>
        </div>
        <div slot="action" slot-scope="text, record">
          <a @click="editPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="analysisPage(record,'exam')">考试分析</a>
          <a-divider type="vertical" />
          <a @click="analysisPage(record,'paper')">试题分析</a>
          <a-divider type="vertical" />
          <a @click="BrowsePage(record)">预览</a>
          <a-divider type="vertical" />
          <a @click="closeTest(record)">关闭考试</a>
          <a-divider type="vertical" />
          <a @click="examDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <exam-add ref="ExamAdd" @on-show="Search"/>
    <exam-analysis ref="ExamAnalysis" />
    <browsing ref="Browsing"/>
  </div>
</template>
<script>
export default {
  components: {
    ExamAdd: () => import('./ExamAdd'),
    ExamAnalysis: () => import('./ExamAnalysis'),
    Browsing: () => import('./Browsing')
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      inputtime: null,
      // 搜索参数
      queryParam: {},
      paperType: [{
        type: '固定试卷'
      }, {
        type: '随机试卷'
      }],
      paperstatus: [{
        type: '未开始',
        value: '0'
      }, {
        type: '进行中',
        value: '1'
      }, {
        type: '已结束',
        value: '2'
      }],
      config: {
        data: {}
      },
      formdata: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 360,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40,
        sorter: true
      }, {
        title: '考试名称',
        dataIndex: 'title',
        width: 200
      }, {
        title: '试卷状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' },
        width: 80
      }, {
        title: '已考/应考人数',
        dataIndex: 'user_num'
      }, {
        title: '开始时间',
        dataIndex: 'starttime',
        width: 140
      }, {
        title: '结束时间',
        dataIndex: 'endtime',
        width: 140
      }, {
        title: '创建人',
        dataIndex: 'inputuser',
        width: 80
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        width: 140
      }, {
        title: '最后修改人',
        dataIndex: 'updateuser'
      }, {
        title: '最后修改时间',
        dataIndex: 'updatetime',
        width: 140
      }],
      colLayout: {},
      optionsList: {
        list: [{
          options: ''
        }]
      }
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    // 页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: 'exam/Achievement/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 打开添加页面
    addPage (type) {
      this.$refs.ExamAdd.show({
        action: 'add',
        title: '添加',
        url: '/exam/exam/add',
        data: {}
      })
    },
    getinputtime (date, dateString) {
      this.inputtime = date
      this.queryParam.inputtime = dateString[0] ? dateString : null
    },
    // 打开分析页面
    analysisPage (record, type) {
      let title = ''
      if (type === 'exam') {
        title = '考试分析'
      } else {
        title = '试题分析'
      }
      this.$refs.ExamAnalysis.show({
        action: type,
        title: title,
        url: '',
        data: record
      })
    },
    // 打开修改页面
    editPage (record) {
      this.$refs.ExamAdd.show({
        action: 'edit',
        title: '编辑',
        url: '/exam/exam/edit',
        data: record
      })
    },
    // 打开预览页面
    BrowsePage (record) {
      this.$refs.Browsing.show({
        action: 'browsing',
        title: '考试预览',
        url: '',
        data: record,
        answer: ''
      })
    },
    // 搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    closeTest (record) {
      const table = this.$refs.table
      const self = this
      this.$confirm({
        title: '您确认要关闭该考试吗？',
        onOk () {
          self.axios({
            url: 'exam/Achievement/endExam',
            data: { paperid: record.id }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    // 删除
    examDelete (record) {
      const table = this.$refs.table
      const id = record.id
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/exam/Achievement/action',
            data: { id: id, action: 'delete' }
          }).then(res => {
            self.$message.success('操作成功')
            table.refresh()
          })
        }
      })
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
    getSearchDate (date, dateString) {
      this.queryParam.startshowtime = date
      this.queryParam.starttime	= dateString[0] ? dateString : null
    },
    getSearchEndDate (date, dateString) {
      this.queryParam.endtshowime = date
      this.queryParam.endtime	= dateString[0] ? dateString : null
    }
  }
}
</script>
