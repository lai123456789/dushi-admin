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
            <a-form-item label="任务名称">
              <a-input v-model.trim="queryParam.taskname"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="问卷名称">
              <a-select :allowClear="true" :showSearch="true" v-model="queryParam.nairename">
                <a-select-option v-for="(value,keys) in nairename" :key="keys + 1" :value="value" >{{ value }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false" v-if="showdata.action ==='waitTask'">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="showPage(record)">回访</a>
          <a-divider type="vertical" />
          <a @click="assignPage(record)">转移</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <a-card :bordered="false" v-if="showdata.action ==='myTask'">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns2"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="showPage(record)">回访</a>
          <a-divider type="vertical" />
          <a @click="assignPage(record)">转移</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <a-card :bordered="false" v-if="showdata.action ==='ProcessedTask'">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="detailsPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <a-card :bordered="false" v-if="showdata.action ==='myProcessed'">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns2"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="detailsPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
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
        <a-form :form="form" :label-col="{ span: 6 }" @submit="handleSubmit">
          <a-form-item label="任务名称" :wrapper-col="{ span: 14 }">
            <a-input v-decorator="['info[taskname]', { initialValue: formdata.taskname, rules: [{ required: true, message: '请输入任务名称' }] }]"/>
          </a-form-item>
          <a-form-item label="选择问卷" :wrapper-col="{ span: 14 }">
            <a-select v-decorator="['info[nairename]', { initialValue: formdata.nairename, rules: [{ required: true, message: '请选择问卷' }] }]">
              <a-select-option v-for="(value, index) in nairenamelist" :key="index" :value="value">{{ value }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="任务备注" :wrapper-col="{ span: 14 }">
            <a-textarea
              v-decorator="['info[taskremark]', { initialValue: formdata.taskremark }]"
              :auto-size="{ minRows: 5, maxRows: 8 }"
            />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" html-type="submit" @click="handleSubmit">{{ config.action === 'edit' ? '修改':'保存' }}</a-button>
          <a-button @click="cancel_off" >{{ config.action === 'edit' ? '重置':'关闭' }}</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <task-assign ref="TaskAssign" @ok="handleOk" />
    <browsing ref="browsing" @ok="handleOk" :showdata="showdata"/>
  </div>
</template>
<script>
export default {
  components: {
    TaskAssign: () => import('./TaskAssign'),
    Browsing: () => import('./QuestionnaireBrowsing')
  },
  props: {
    showdata: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      formdata: {},
      config: {},
      queryParam: {
        nairename: undefined
      },
      nairenamelist: [],
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
      data: {},
      form: this.$form.createForm(this),
      nairename: [],
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 140,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40
      }, {
        title: '任务名称',
        dataIndex: 'taskname',
        width: 200
      }, {
        title: '问卷名称',
        dataIndex: 'nairename',
        width: 200
      }, {
        title: '回访人',
        dataIndex: 'revisiter'
      }, {
        title: '回访时间',
        dataIndex: 'revisitdays',
        width: 140
      }, {
        title: '分配人',
        dataIndex: 'distributor'
      }, {
        title: '分配时间',
        dataIndex: 'allocatetime',
        width: 140
      }, {
        title: '客户名称',
        dataIndex: 'customer'
      }, {
        title: '客户电话1',
        dataIndex: 'phone1'
      }, {
        title: '客户电话2',
        dataIndex: 'phone2'
      }],
      columns2: [{
        title: '操作',
        dataIndex: 'action',
        width: 140,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40
      }, {
        title: '任务名称',
        dataIndex: 'taskname',
        width: 200
      }, {
        title: '问卷名称',
        dataIndex: 'nairename',
        width: 200
      }, {
        title: '分配人',
        dataIndex: 'distributor'
      }, {
        title: '分配时间',
        dataIndex: 'allocatetime',
        width: 140
      }, {
        title: '客户名称',
        dataIndex: 'customer'
      }, {
        title: '客户电话1',
        dataIndex: 'phone1'
      }, {
        title: '客户电话2',
        dataIndex: 'phone2'
      }]
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    // 页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/visit/details/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        console.log(res)
        return res.result
      })
    },
    // 搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    // 打开回访或编辑
    showPage (record) {
      console.log(this.showdata.url)
      this.$refs.browsing.show2({
        action: 'browsing',
        title: '问卷信息',
        id: record.id,
        url: this.showdata.url,
        selectValue: [],
        nairedata: record
      })
    },
    detailsPage (record) {
      this.$refs.browsing.show3({
        action: 'browsedetails',
        title: '问卷详情',
        id: record.id,
        url: this.showdata.url,
        selectValue: [],
        nairedata: record
      })
    },
    // 打开转移或者分配页面
    assignPage (record) {
      this.$refs.TaskAssign.show({
        action: 'assign',
        title: '转移',
        id: record && record.id || this.selectedRowKeys,
        selectValue: [],
        url: '/visit/task/taskdetails'
      })
    },
    // 打开添加页面
    addPage (type) {
      this.visible = true
      this.formdata = {}
      this.config = {
        action: 'add',
        title: '添加',
        url: '/visit/task/add',
        data: {}
      }
    },
    // 关闭或重置
    cancel_off () {
      if (this.config.action === 'edit') {
        this.formdata = {}
      }
      if (this.config.action === 'add') {
        this.visible = false
      }
    },
    // 刷新
    handleOk () {
      this.$refs.table.refresh()
    },
    // 数据提交
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          const headImage = this.imageFileList.length ? this.imageFileList[0].response.result.filePath : ''
          values.info.setting = { headImage: headImage }
          values.info.priv = this.priv
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.visible = false
              this.$message.success('操作成功')
            }
          })
        }
      })
    },
    // 删除数据
    handleDelete (record) {
      const table = this.$refs.table
      const id = record.id
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/visit/details/delete',
            data: { id: id }
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
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
