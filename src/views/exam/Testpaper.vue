<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search" >搜索</a-button>
            <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="试卷类型">
              <a-select :allowClear="true" :showSearch="true" v-model="queryParam.type">
                <a-select-option v-for="value in paperType" :key="value.value" :value="value.value" >{{ value.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="试卷名称">
              <a-input v-model.trim="queryParam.title"/>
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
                v-model="queryParam.inputshowtime"
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
        <a-tooltip>
          <template slot="title">
            <div>自主选择题库中的题目来组成试卷</div>
          </template>
          <a-button v-action:add icon="plus" type="primary" @click="addPage('fixed')">添加固定试卷</a-button>
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            <div>设置抽题规则后，在考试发布时随机分配给每个人不一样的试卷</div>
          </template>
          <a-button v-action:add icon="plus" type="primary" @click="addPage('random')">添加随机试卷</a-button>
        </a-tooltip>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <span slot="type" slot-scope="text">
          {{ text === 'fixed'? '固定试卷':'随机试卷' }}
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="editPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="browsePage(record)">预览</a>
          <a-divider type="vertical" />
          <a @click="Delete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <testpaper-add ref="TestpaperAdd" @on-show="Search"/>
    <browsing ref="Browsing"/>
  </div>
</template>
<script>
export default {
  components: {
    TestpaperAdd: () => import('./TestpaperAdd'),
    Browsing: () => import('./Browsing')
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      // 搜索参数
      queryParam: {},
      inputtime: null,
      paperType: [{
        type: '固定试卷',
        value: 'fixed'
      }, {
        type: '随机试卷',
        value: 'random'
      }],
      config: {
        data: {}
      },
      formdata: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 180,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40,
        sorter: true
      }, {
        title: '试卷名称',
        dataIndex: 'title',
        width: 250
      }, {
        title: '试卷类型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' }
      }, {
        title: '试题数',
        dataIndex: 'total'
      }, {
        title: '总分',
        dataIndex: 'score'
      }, {
        title: '创建人',
        dataIndex: 'inputuser'
      }, {
        title: '创建时间',
        dataIndex: 'inputtime'
      }, {
        title: '最后修改人',
        dataIndex: 'updateuser'
      }, {
        title: '最后修改时间',
        dataIndex: 'updatetime'
      }],
      creator: [],
      colLayout: {},
      questionstype: '',
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
        url: '/exam/Examination/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    getinputtime (date, dateString) {
      this.queryParam.inputshowtime = date
      this.queryParam.inputtime = dateString[0] ? dateString : null
    },
    // 打开添加页面
    addPage (type) {
      const title = type === 'random' ? '添加随机试卷' : '添加固定试卷'
      this.$refs.TestpaperAdd.show({
        action: 'add',
        title: title,
        url: '/exam/testpaper/add',
        type: type,
        data: {}
      })
    },
    // 打开修改页面
    editPage (record) {
      const title = record.type === 'random' ? '编辑:' + record.title : '编辑:' + record.title
      this.$refs.TestpaperAdd.show({
        action: 'edit',
        title: title,
        url: '/exam/testpaper/edit',
        type: record.type,
        data: record
      })
    },
    // 打开预览页面
    browsePage (record) {
      this.$refs.Browsing.show({
        title: '试卷预览',
        action: 'browsing',
        user: '',
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
    // 删除
    Delete (record) {
      const table = this.$refs.table
      const id = record.id
      const self = this
      this.$confirm({
        title: '试卷被删除后将无法恢复，确定删除吗？',
        onOk () {
          self.axios({
            url: '/exam/Examination/action',
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
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
