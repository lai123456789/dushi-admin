<template>
  <div>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1">
        <span slot="tab"> 访客敏感词 </span>
        <a-alert message="当访客发送的消息包含敏感词时，该词将会被*号代替。" type="info" show-icon style="margin-bottom: 10px;" />
        <div style="background-color: #fff; ">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-input style="width: 400px;" placeholder="搜索访客敏感词" v-model="queryParam.words"/>
              <a-button style="margin-left: 10px" @click="$refs.table.refresh(true)">搜索</a-button>
              <a-button style="margin-left: 10px;" @click="() => {queryParam = {}; $refs.table.refresh(true)}">重置</a-button>
              <a-button type="primary" style="margin-left: 10px;" @click="handleAdd1()">添加</a-button>
              <a-card :bordered="true" style="margin-top: 10px;">
                <s-table
                  ref="table"
                  size="small"
                  rowKey="id"
                  :columns="columns"
                  :data="loadDataTable"
                  :sorter="sorter"
                >
                  <div slot="action" slot-scope="text,record" >
                    <a @click="handleEdit1(record)">编辑</a>
                    <a-divider type="vertical" />
                    <a @click="handleDelete(record)">删除</a>
                  </div>
                </s-table>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2">
        <span slot="tab">客服违禁词</span>
        <a-alert message="当客服发送的消息包含违禁词时，该消息将不允许发送。" type="info" show-icon style="margin-bottom: 10px;" />
        <div style="background-color: #fff; ">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-input style="width: 400px;" placeholder="搜索客服违禁词" v-model="queryParam.words"/>
              <a-button style="margin-left: 10px" @click="$refs.table.refresh(true)">搜索</a-button>
              <a-button style="margin-left: 10px;" @click="() => {queryParam = {}; $refs.table.refresh(true)}">重置</a-button>
              <a-button type="primary" style="margin-left: 10px;" @click="handleAdd2()" >添加</a-button>
              <a-card :bordered="true" style="margin-top: 10px;">
                <s-table
                  ref="table"
                  size="small"
                  rowKey="id"
                  :columns="columns2"
                  :data="loadDataTable2"
                  :sorter="sorter"
                >
                  <div slot="action" slot-scope="text,record" >
                    <a @click="handleEdit2(record)">编辑</a>
                    <a-divider type="vertical" />
                    <a @click=" handleDelete(record)">删除</a>
                  </div>
                </s-table>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </a-tab-pane>
    </a-tabs>
    <!-- 访客敏感词编辑表单 -->
    <a-drawer
      :title="title1"
      :width="600"
      :visible="visible1"
      @close="visible1=!visible1"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="敏感词" v-bind="formItemLayout">
            <a-input v-decorator="['info[words]', {initialValue: this.data.words,rules: [{ required: true, message: '请输入敏感词'}]}]" />
          </a-form-item>
          <a-form-item label="创建人" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputuser]', {initialValue: this.data.inputuser,rules: [{ required: true, message: '请输入创建人'}]}]" />
          </a-form-item>
          <a-form-item label="创建时间" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputtime]', {initialValue: this.data.inputtime,rules: [{ required: true, message: '请输入创建时间'}]}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visible1=!visible1">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <!--  访客敏感词添加表单 -->
    <a-drawer
      title="添加"
      :width="600"
      :visible="visible2"
      @close="visible2=!visible2"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="敏感词" v-bind="formItemLayout">
            <a-input v-decorator="['info[words]', {initialValue: '',rules: [{ required: true, message: '请输入敏感词'}]}]" />
          </a-form-item>
          <a-form-item label="创建人" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputuser]', {initialValue: '',rules: [{ required: true, message: '请输入创建人'}]}]" />
          </a-form-item>
          <a-form-item label="创建时间" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputtime]', {initialValue: '',rules: [{ required: true, message: '请输入创建时间'}]}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visible2=!visible2">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <!-- 客服违禁词编辑 -->
    <a-drawer
      :title="title3"
      :width="600"
      :visible="visible3"
      @close="visible3=!visible3"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="违禁词" v-bind="formItemLayout">
            <a-input v-decorator="['info[words]', {initialValue: this.data.words,rules: [{ required: true, message: '请输入敏感词'}]}]" />
          </a-form-item>
          <a-form-item label="创建人" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputuser]', {initialValue: this.data.inputuser,rules: [{ required: true, message: '请输入创建人'}]}]" />
          </a-form-item>
          <a-form-item label="创建时间" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputtime]', {initialValue: this.data.inputtime,rules: [{ required: true, message: '请输入创建时间'}]}]" />
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible3=!visible3">关闭</a-button>
      </div>
    </a-drawer>
    <!-- 客服违禁词添加 -->
    <a-drawer
      title="添加"
      :width="600"
      :visible="visible4"
      @close="visible4=!visible4"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="违禁词" v-bind="formItemLayout">
            <a-input v-decorator="['info[words]', {initialValue: '',rules: [{ required: true, message: '请输入违禁词'}]}]" />
          </a-form-item>
          <a-form-item label="创建人" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputuser]', {initialValue: '',rules: [{ required: true, message: '请输入创建人'}]}]" />
          </a-form-item>
          <a-form-item label="创建时间" v-bind="formItemLayout">
            <a-input v-decorator="['info[inputtime]', {initialValue: '',rules: [{ required: true, message: '请输入创建时间'}]}]" />
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible4=!visible4">关闭</a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      data: {},
      loading: false,
      formItemLayout: {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      },
      form: this.$form.createForm(this),
      visible1: false,
      visible2: false,
      visible3: false,
      visible4: false,
      title1: '',
      title3: '',
      queryParam: { },
      columns: [{
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 40

      }, {
        title: '操作',
        dataIndex: '',
        sorter: true,
        width: 100,
        scopedSlots: { customRender: 'action' }

      }, {
        title: '敏感词',
        dataIndex: 'words',
        sorter: true
      }, {
        title: '创建人',
        dataIndex: 'inputuser',
        sorter: true
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        sorter: true
      }],
      columns2: [{
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 40

      }, {
        title: '操作',
        dataIndex: '',
        sorter: true,
        width: 100,
        scopedSlots: { customRender: 'action' }

      }, {
        title: '违禁词',
        dataIndex: 'words',
        sorter: true
      }, {
        title: '创建人',
        dataIndex: 'inputuser',
        sorter: true
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/sensitive/init',
        params: params
      }).then(res => {
        return res.result
      })
    },
    loadDataTable2 (parameter) {
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/sensitive/init',
        params: params
      }).then(res => {
        return res.result
      })
    },
    handleAdd1 () {
      this.visible2 = true
      this.loading = true
      this.axios({
        url: '/chat/sensitive/add',
        data: { id: 0 }
      }).then((res) => {
        this.loading = false
        this.data = res.result.data
      })
    },
    handleAdd2 () {
      this.visible4 = true
      this.loading = true
      this.axios({
        url: '/chat/sensitive/add',
        data: { id: 0 }
      }).then((res) => {
        this.loading = false
        this.data = res.result.data
      })
    },
    handleEdit1 (record) {
      this.visible1 = true
      this.title1 = '编辑：' + record.words
      this.loading = true
      this.axios({
        url: '/chat/sensitive/edit',
        params: { id: record.id }
      }).then((res) => {
        this.data = res.result.data[0]
        this.loading = false
      })
    },
    handleEdit2 (record) {
      this.visible3 = true
      this.title3 = '编辑：' + record.words
      this.loading = true
      this.axios({
        url: '/chat/sensitive/edit',
        params: { id: record.id }
      }).then((res) => {
        this.data = res.result.data[0]
        console.log(this.data)
        this.loading = false
      })
    },
    handleDelete (record) {
      const that = this
      const table = this.$refs.table
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/chat/sensitive/delete',
            params: { id: record.id }
          }).then(res => {
            if (res.message) {
              that.$message.success(res.message)
            } else {
              table.refresh()
            }
          })
        }
      })
    },
    handleSubmit () {
      // const { form: { validateFields } } = this
      this.form.validateFields((errors, values) => {
        console.log('values', values)
        if (!errors) {
          this.loading = true
          this.axios({
            url: '/chat/sensitive/edit',
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.visible1 = false
            this.visible2 = false
            this.visible3 = false
            this.visible4 = false
            this.loading = false
            this.$refs.table.refresh()
            if (res.message) {
              this.$message.success(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
            }
          })
        } else {
          console.log(errors)
        }
      })
    }
  }
}
</script>
