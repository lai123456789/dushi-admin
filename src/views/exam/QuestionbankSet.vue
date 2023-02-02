<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <div>
        <a-card class="table-search" :bordered="true">
          <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
            <div class="head">
              <a-space style="margin-left: 8px">
                <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search">搜索</a-button>
                <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="题型">
                  <a-select :allowClear="true" show-search v-model.trim="queryParam.type">
                    <a-select-option v-for="(item, key) in questionType" :key="key" :value="item.value">{{ item.type }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="题目">
                  <a-input v-model.trim="queryParam.title" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <a-card :bordered="true">
          <div class="table-operator">
            <a-button v-action:add icon="plus" type="primary" @click="addPage">添加</a-button>
            <a-button v-action:delect icon="delete" type="danger" @click="handleDelete" :disabled="selectedRowKeys.length==0" >批量删除</a-button>
          </div>
          <s-table
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :rowSelection="rowSelection"
            :sorter="{ field: 'id', order: 'descend' }"
          >
            <div slot="type" slot-scope="text" >
              <span v-for="(value, index) in questionType" :key="index" v-show="text === value.value">{{ value.type }}</span>
            </div>
            <div slot="action" slot-scope="text, record">
              <a @click="editPage(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="handleDelete(record)">删除</a>
            </div>
          </s-table>
        </a-card>
      </div></a-spin>
    <questionadd ref="Questionadd" @on-show="submitRefresh"/>
  </a-drawer>
</template>
<script>
export default {
  components: {
    Questionadd: () => import('./Questionadd')
  },
  data () {
    return {
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      advanced: false,
      queryParam: {
        questiontype: undefined
      },
      visible: false,
      loading: false,
      otherstatus: false,
      must: false,
      config: {},
      nairedata: {},
      nariedetails: [],
      firstshow: [],
      TempData: {},
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
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
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40,
        sorter: true
      }, {
        title: '题目',
        dataIndex: 'title'
      }, {
        title: '题型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' },
        width: 100
      }, {
        title: '创建人',
        dataIndex: 'inputuser',
        width: 100
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        width: 140
      }, {
        title: '最后修改人',
        dataIndex: 'updateuser',
        width: 100
      }, {
        title: '最后修改时间',
        dataIndex: 'updatetime',
        width: 140
      }],
      form: this.$form.createForm(this, { name: 'Setting' })
    }
  },
  methods: {
    // 页面数据渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/exam/Question/init',
        params: Object.assign(parameter, this.queryParam, { subjectid: this.config.data.id })
      }).then(res => {
        return res.result
      })
    },
    // 接收传参
    show (config) {
      this.visible = true
      this.config = config
    },
    // 打开添加页面
    addPage () {
      this.$refs.Questionadd.show({
        action: 'add',
        title: '添加',
        url: 'exam/Question/action',
        type: 'single',
        data: {
          subjectid: this.config.data.id
        }
      })
    },
    // 修改页面
    editPage (record) {
      const type = record.type
      this.$refs.Questionadd.show({
        action: 'edit',
        title: '编辑',
        url: '/exam/Question/action',
        type: type,
        data: record
      })
    },
    // 刷新表格  搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    // 删除
    handleDelete (record) {
      const table = this.$refs.table
      let id = record && record.id || this.selectedRowKeys
      if (id.length > 0) {
        id = id.toString()
      }
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/exam/Question/action',
            data: { id: id, action: 'delete' }
          }).then(res => {
            self.$message.success('删除成功')
            table.refresh()
          })
        }
      })
    },
    refresh () {
      this.$refs.table.refresh()
    },
    submitRefresh () {
      this.$refs.table.refresh()
      this.$emit('ok', '')
    }
  }
}
</script>
