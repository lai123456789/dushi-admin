<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" @click="bankSearch" @keyup.enter="bankSearch" >搜索</a-button>
            <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="题型">
              <a-select :allowClear="true" :showSearch="true" v-model="queryParam.questionstype">
                <a-select-option v-for="(value,keys) in questionTypeShow" :key="keys + 1" :value="value.type" >{{ value.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="标题">
              <a-input v-model.trim="queryParam.title"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button v-action:add icon="plus" type="primary" @click="addPage('单选题')">添加</a-button>
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
          <a @click="editPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="bankDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <a-drawer
      :title="config.title"
      :width="800"
      :destroyOnClose="true"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <Questionadd
          :actions="config.action"
          :questionstype="questionstype"
          :formdata="config.data"
          :optionsList="optionsList"
          :optionsfill="optionsfill"
          @on-show="listenChild"
          :length="length"
        >
        </Questionadd>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
export default {
  components: {
    Questionadd: () => import('./Questionadd')
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      // 搜索参数
      queryParam: {
        questionstype: undefined
      },
      optionsfill: [],
      questionTypeShow: [{
        type: '单选题'
      }, {
        type: '多选题'
      }, {
        type: '填空题'
      }, {
        type: '评分题'
      }, {
        type: '简答题'
      }, {
        type: '文字描述'
      }],
      config: {
        data: {
        }
      },
      formdata: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40
      }, {
        title: '标题',
        dataIndex: 'title',
        width: 350
      }, {
        title: '题型',
        dataIndex: 'questionType',
        width: 100
      }, {
        title: '创建人',
        dataIndex: 'inputuser',
        width: 100
      }, {
        title: '创建时间',
        dataIndex: 'inputtime'
      }, {
        title: '最后修改人',
        dataIndex: 'lastModify',
        width: 100
      }, {
        title: '最后修改时间',
        dataIndex: 'lastModifiedTime'
      }],
      creator: [],
      colLayout: {},
      questionstype: '',
      optionsList: {
        list: [{
          options: ''
        }]
      },
      length: ''
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    // 页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/visit/questionbank/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        console.log(res.result)
        this.length = res.result.totalCount
        return res.result
      })
    },
    // 监听子组件传参
    listenChild (status) {
      const table = this.$refs.table
      console.log(status)
      if (status === 1) {
        this.visible = false
        this.loading = false
        this.$message.success('添加成功')
        table.refresh()
      }
      if (status === 2) {
        this.visible = false
        this.loading = false
        this.$message.success('修改成功')
        table.refresh()
      }
      if (status === 3) {
        this.config.data = {}
        this.refresh()
      }
      if (status === 0) {
        this.visible = false
      }
    },
    // 打开添加页面
    addPage (type) {
      this.visible = true
      this.questionstype = type
      this.config = {
        action: 'add',
        title: '添加',
        url: '/visit/questionbank/add',
        data: {
          mustselect: false,
          showform: '1',
          stars: false,
          min: 2,
          max: ''
        }
      }
    },
    // 打开修改页面
    editPage (record) {
      this.visible = true
      const id = record.id
      this.questionstype = record.questionType
      this.optionsfill = record.fill
      this.optionsList.list = record.list
      this.config = {
        id: id,
        action: 'edit',
        title: '修改',
        url: '/visit/questionbank/edit',
        data: {}
      }
      console.log(record)
      // 必填变化
      if (record.mustselect === 1) {
        record.mustselect = true
      } else {
        record.mustselect = false
      }
      // 半星变化
      if (record.stars === 1) {
        record.stars = true
      } else {
        record.stars = false
      }
      // 选项其他选项变化
      if (record.other === 1) {
        record.other = true
      } else {
        record.other = false
      }
      this.config.data = record
      console.log(this.config.data)
      this.loading = false
    },
    // 题库搜索
    bankSearch () {
      const table = this.$refs.table
      table.refresh(true)
    },
    // 删除题目
    bankDelete (record) {
      const table = this.$refs.table
      const id = record.id
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/visit/questionbank/delete',
            data: { id: id }
          }).then(res => {
            self.$message.success(res.result)
            table.refresh(true)
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
    }
  }
}
</script>
