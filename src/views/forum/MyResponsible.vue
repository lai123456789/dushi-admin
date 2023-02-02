<template>
  <div>
    <a-card class="table-search">
      <a-form :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {views: [],answer: []}, $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="提问时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                @change="getSearchDate"
                v-model="queryParam.inputtimeShow"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="问题标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-model="queryParam.keyword"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="浏览数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-group compact>
                <a-input style="width: calc(50% - 15px); text-align: center" placeholder="最小浏览数" v-model="queryParam.views[0]"/>
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input style="width: calc(50% - 15px); text-align: center; border-left: 0" placeholder="最大浏览数" v-model="queryParam.views[1]" />
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="回答数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-group compact>
                <a-input style="width: calc(50% - 15px); text-align: center" placeholder="最小回答数" v-model="queryParam.answer[0]"/>
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input style="width: calc(50% - 15px); text-align: center; border-left: 0" placeholder="最大回答数" v-model="queryParam.answer[1]" />
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="是否有最佳答案" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select v-model="queryParam.bestanswer" allowClear>
                <a-select-option value="1">是</a-select-option>
                <a-select-option value="2">否</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button icon="delete" type="danger" @click="handleDelete" :disabled="selectedRowKeys.length==0" >批量删除</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="number"
        :columns="columns"
        :data="loadDataTable"
        :rowSelection="rowSelection"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="category_name" slot-scope="text">
          {{ text.toString() }}
        </div>
        <div slot="have_best_answer" slot-scope="text">
          {{ text == '1' ? '是':'否' }}
        </div>
        <div slot="action" slot-scope="text, record">
          <a @click="handleView(record)">查看</a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <forum-detail ref="forumDetail" @ok="refresh"/>
    <ask-questions ref="askQuestions" @ok="refresh"/>
  </div>
</template>
<script>
export default {
  components: {
    AskQuestions: () => import('./AskQuestions'),
    ForumDetail: () => import('./ForumDetail')
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: {
        views: [],
        answer: []
      },
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      // 表头
      columns: [ {
        title: '操作',
        align: 'center',
        dataIndex: 'action',
        width: 160,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 40
      }, {
        title: '问题标题',
        dataIndex: 'title',
        width: 300
      }, {
        title: '作者',
        dataIndex: 'inputuser'
      }, {
        title: '提问时间',
        dataIndex: 'inputtime'
      }, {
        title: '所属分类',
        dataIndex: 'category_name',
        scopedSlots: { customRender: 'category_name' }
      }, {
        title: '浏览数',
        dataIndex: 'views'
      }, {
        title: '回答数',
        dataIndex: 'answer'
      }, {
        title: '是否有最佳回答',
        dataIndex: 'have_best_answer',
        scopedSlots: { customRender: 'have_best_answer' }
      }],
      colLayout: {},
      workflow: [],
      indexKey: 0
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/forum/Index/Mymanager',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.inputtime = dateString
      this.queryParam.inputtimeShow = date
    },
    handleView (record) {
      this.$refs.forumDetail.show({
        action: 'show',
        title: '查看',
        data: record
      })
    },
    handleEdit (record) {
      this.$refs.askQuestions.show({
        action: 'edit',
        title: '编辑',
        data: record
      })
    },
    // 删除
    handleDelete (record) {
      const table = this.$refs.table
      let number = []
      if (record && record.number) {
        number.push(record.number)
      } else {
        number = this.selectedRowKeys
      }
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/forum/Index/delQuestion',
            data: { number: number }
          }).then(res => {
            self.$message.success('删除成功')
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
    // 刷新表格
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
