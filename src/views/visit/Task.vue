<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" @click="taskSearch" @keyup.enter="taskSearch" >搜索</a-button>
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
                <a-select-option v-for="(value,keys) in nairename" :key="keys + 1" :value="value.type" >{{ value.type }}</a-select-option>
              </a-select>
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
        <div slot="action" slot-scope="text, record">
          <a @click="showPage(record)">明细</a>
          <a-divider type="vertical" />
          <a @click="assignPage(record)">分配</a>
          <a-divider type="vertical" />
          <a @click="editPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="taskDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <a-drawer
      :title="config.title"
      :width="600"
      :destroyOnClose="true"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form" :label-col="{ span: 6 }" @submit="handleSubmit">
          <a-form-item label="任务名称" :wrapper-col="{ span: 16 }">
            <a-input v-decorator="['info[taskname]', { initialValue: formdata.taskname, rules: [{ required: true, message: '请输入任务名称' }] }]"/>
          </a-form-item>
          <a-form-item label="选择问卷" :wrapper-col="{ span: 16 }">
            <a-select v-decorator="['info[nairename]', { initialValue: formdata.nairename, rules: [{ required: true, message: '请选择问卷' }] }]">
              <a-select-option v-for="(value, index) in nairenamelist" :key="index" :value="value">{{ value }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="任务备注" :wrapper-col="{ span: 16 }">
            <a-textarea
              v-decorator="['info[taskremark]', { initialValue: formdata.taskremark }]"
              :auto-size="{ minRows: 5, maxRows: 8 }"
            />
          </a-form-item>
          <div v-if="config.action==='edit'">
            <a-form-item label="创建人" :wrapper-col="{ span: 16 }">
              <a-input v-model="formdata.inputuser" :read-only="true" class="input"/>
            </a-form-item>
            <a-form-item label="创建时间" :wrapper-col="{ span: 16 }">
              <a-input v-model="formdata.inputtime" :read-only="true" class="input"/>
            </a-form-item>
            <a-form-item label="最后修改人" :wrapper-col="{ span: 16 }">
              <a-input v-model="formdata.lastModify" :read-only="true" class="input"/>
            </a-form-item>
            <a-form-item label="最后修改时间" :wrapper-col="{ span: 16 }">
              <a-input v-model="formdata.lastModifiedTime" :read-only="true" class="input"/>
            </a-form-item>
          </div>
        </a-form>
        <div class="bbar">
          <a-button type="primary" html-type="submit" @click="handleSubmit">{{ config.action === 'edit' ? '修改':'保存' }}</a-button>
          <a-button @click="cancel_off" >{{ config.action === 'edit' ? '重置':'关闭' }}</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <task-details ref="TaskDetails" @ok="handleOk" />
    <task-assign ref="TaskAssign" @ok="handleOk" />
  </div>
</template>
<script>
export default {
  components: {
    TaskDetails: () => import('./TaskDetails'),
    TaskAssign: () => import('./TaskAssign')
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      // 搜索参数
      queryParam: {},
      nairenamelist: ['这是第一个问卷啊'],
      nairename: [],
      config: {
        data: {}
      },
      form: this.$form.createForm(this, { name: 'task' }),
      formdata: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 200,
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
        title: '问卷总数',
        dataIndex: 'nairenumber',
        width: 100
      }, {
        title: '已分配数',
        dataIndex: 'allocated'
      }, {
        title: '待分配数',
        dataIndex: 'beallocated'
      }, {
        title: '已分配率',
        dataIndex: 'allocatedrate'
      }, {
        title: '已完成数',
        dataIndex: 'completed'
      }, {
        title: '未完成数',
        dataIndex: 'incompleted'
      }, {
        title: '已完成率',
        dataIndex: 'completedrate'
      }, {
        title: '任务创建时间',
        dataIndex: 'inputtime',
        width: 140
      }],
      length: ''
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    // 页面数据渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/visit/task/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        console.log(res.result)
        this.length = res.result.totalCount
        return res.result
      })
    },
    // 打开添加任务页面
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
    // 打开修改任务
    editPage (record) {
      this.visible = true
      const id = record.id
      this.config = {
        id: id,
        action: 'edit',
        title: '修改',
        url: '/visit/task/edit',
        data: {}
      }
      this.formdata = record
      console.log(record)
      this.loading = false
    },
    // 任务搜索
    taskSearch () {
      const table = this.$refs.table
      table.refresh(true)
    },
    // 任务删除
    taskDelete (record) {
      const table = this.$refs.table
      const id = record.id
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/visit/task/delete',
            data: { id: id }
          }).then(res => {
            self.$message.success('删除成功')
            table.refresh(true)
          })
        }
      })
    },
    // 任务数据提交
    handleSubmit (e) {
      e.preventDefault()
      const self = this
      const table = this.$refs.table
      this.form.validateFields((err, values) => {
        console.log(values)
        if (!err) {
          if (this.config.action === 'edit') {
            values['id'] = this.config.id
            console.log(values)
            self.axios({
              url: '/visit/task/edit',
              data: values
            }).then(res => {
              console.log(res)
              this.visible = false
              table.refresh()
              self.$message.success('修改成功')
            })
          } else {
            values.info['id'] = this.length + 1
            console.log(values)
            self.axios({
              url: '/visit/task/add',
              data: values
            }).then(res => {
              console.log(res)
              this.visible = false
              table.refresh()
              self.$message.success('添加成功')
            })
          }
        }
      })
    },
    // 删除或重置
    cancel_off () {
      if (this.config.action === 'edit') {
        this.formdata.taskname = ''
        this.formdata.nairename = undefined
        this.formdata.taskremark = ''
      }
      if (this.config.action === 'add') {
        this.visible = false
      }
    },
    // 查看明细页面
    showPage (record) {
      this.$refs.TaskDetails.show({
        action: 'show',
        title: '查看明细',
        url: '/visit/task/taskdetails'
      })
    },
    // 任务分配页面
    assignPage (record) {
      this.$refs.TaskAssign.show({
        page: 'statistic',
        mode: 'multiple',
        action: 'assign',
        title: '任务分配',
        id: record && record.id || this.selectedRowKeys,
        selectValue: [],
        url: '/visit/task/taskdetails'
      })
    },
    // 刷新
    handleOk () {
      this.$refs.table.refresh(true)
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
<style scoped>
.input{
  background-color: #F5F5F5;
}
</style>
