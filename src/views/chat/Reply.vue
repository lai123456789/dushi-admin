<template>
  <div>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1">
        <span slot="tab" @click="() => {queryParam = {service_id: '1', action:'category'};$refs.table.refresh(true)}"> 个人库 </span>
      </a-tab-pane>
      <a-tab-pane key="2">
        <span slot="tab" @click="() => {queryParam = {service_id: '0', action: 'content',};$refs.table.refresh(true)}">公共库 </span>
        <div style="background-color: #fff; ">
        </div>
      </a-tab-pane>
    </a-tabs>
    <div style="background-color: #fff; ">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input style="width: 220px;" placeholder="搜索分类" v-model="queryParam.searchString"/>
          <a-button v-action:add icon="plus" type="primary" style="margin-left: 10px;" @click="handleAdd()">添加</a-button>
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
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
                <a @click="handleDelete(record)">删除</a>
              </div>
            </s-table>
          </a-card>
        </a-col>
        <a-col :span="16">
          <a-input style="width: 400px;" placeholder="搜索快捷回复" v-model="queryParam.searchString"/>
          <a-button style="margin-left: 10px" @click="$refs.table.refresh(true)">搜索</a-button>
          <a-button style="margin-left: 10px;" @click="() => {queryParam = {action: 'add_category'}; $refs.table.refresh(true)}">重置</a-button>
          <a-button v-action:add icon="plus" type="primary" style="margin-left: 10px;" @click="() => {queryParam = {searchString:''}; handleAdd1() ;$refs.table.refresh(true)}">添加</a-button>
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
                <a @click="handleEdit1(record)">编辑</a>
                <a-divider type="vertical" />
                <a @click="handleDelete(record)">删除</a>
              </div>
            </s-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <!-- 个人库添加 -->
    <a-drawer
      title="请输入分类名称"
      :width="600"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item v-bind="formItemLayout">
            <a-input v-decorator="['info[name]', {initialValue: '',rules: [{ required: true, message: '请输入分类名称'}]}]"/>
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-drawer>
    <!-- 个人库编辑 -->
    <a-drawer
      title="请输入分类名称"
      :width="600"
      :visible="myvisible"
      @close="myvisible=!myvisible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item v-bind="formItemLayout">
            <a-input v-decorator="['info[name]', {initialValue: this.data.name}]" />
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="myvisible=!myvisible">关闭</a-button>
      </div>
    </a-drawer>
    <!-- 快捷回复编辑 -->
    <a-drawer
      title="请输入分类名称"
      :width="600"
      :visible="visible1"
      @close="visible1=!visible1"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="快捷词" v-bind="formItemLayout">
            <a-input v-decorator="['info[tag]', {initialValue: this.data1.tag}]"/>
          </a-form-item>
          <a-form-item label="回复内容" v-bind="formItemLayout">
            <a-input v-decorator="['info[word]', {initialValue: this.data1.word}]"/>
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible1=!visible1">关闭</a-button>
      </div>
    </a-drawer>

    <!-- 快捷回复添加 -->
    <a-drawer
      title="请输入分类名称"
      :width="600"
      :visible="visible2"
      @close="visible2=!visible2"
    >
      <a-spin :spinning="loading">
        <a-form :form="form">
          <a-form-item label="所属分类" v-bind="formItemLayout">
            <a-select placeholder="请选择所属分组" v-decorator="[ 'info[groupid]', {rules: [{ required: true, message: '请选择所属分组'}], initialValue: ''} ]" >
              <a-select-option v-for="(value, key) in group" :key="key" :value="key">{{ value }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="快捷词" v-bind="formItemLayout">
            <a-input v-decorator="['info[tag]', {initialValue: '',rules: [{ required: true, message: '请输入快捷词'}]}]"/>
          </a-form-item>
          <a-form-item label="回复内容" v-bind="formItemLayout">
            <a-input v-decorator="['info[word]', {initialValue: '',rules: [{ required: true, message: '请输入回复内容'}]}]"/>
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible2=!visible2">关闭</a-button>
      </div>
    </a-drawer>

  </div>
</template>
<script>
export default {
  data () {
    return {
      group: ['中央维修', '产品使用', '产品使用视频'],
      data1: {},
      data: {},
      formItemLayout: {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      },
      form: this.$form.createForm(this),
      loading: false,
      visible1: false,
      visible2: false,
      myvisible: false,
      visible: false,
      queryParam: { },
      columns: [{
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 50
      }, {
        title: '名称',
        dataIndex: 'name',
        sorter: true
      }, {
        title: '操作',
        dataIndex: '',
        sorter: true,
        width: 100,
        scopedSlots: { customRender: 'action' }
      } ],
      columns2: [{
        title: '操作',
        dataIndex: '',
        sorter: true,
        width: 100,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '快捷词',
        dataIndex: 'tag',
        sorter: true
      }, {
        title: '回复内容',
        dataIndex: 'word',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  methods: {
    loadDataTable (parameter) {
      this.queryParam.action = 'category'
      this.queryParam.service_id = '1'
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/reply/init',
        params: params
      }).then(res => {
        return res.result
      })
    },
    loadDataTable2 (parameter) {
      this.queryParam.action = 'content'
      this.queryParam.service_id = this.queryParam.service_id
      this.queryParam.searchString = ''
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/reply/init',
        params: params
      }).then(res => {
        return res.result
      })
    },
    handleAdd () {
      this.visible = true
      this.loading = true
      this.queryParam.action = 'add_category'
      this.axios({
        url: '/chat/reply/init',
        params: { action: this.queryParam.action, id: 0 }
      }).then((res) => {
        this.loading = false
        this.data = res.result.data
      })
    },
    handleAdd1 () {
      this.visible2 = true
      this.loading = true
      this.queryParam.action = 'add'
      this.axios({
        url: '/chat/reply/init',
        params: { action: this.queryParam.action, id: 0 }
      }).then((res) => {
        this.loading = false
        this.data2 = res.result.data
      })
    },
    handleEdit (record) {
      this.myvisible = true
      this.loading = true
      this.queryParam.action = 'edit_category'
      this.axios({
        url: '/chat/reply/init',
        params: { action: this.queryParam.action, id: record.id }
      }).then((res) => {
        this.loading = false
        this.data = res.result.data
      })
    },
    handleEdit1 (record) {
      this.visible1 = true
      this.loading = true
      this.queryParam.action = 'edit'
      this.axios({
        url: '/chat/reply/init',
        params: { action: this.queryParam.action, id: record.id }
      }).then((res) => {
        this.loading = false
        this.data1 = res.result.data
      })
    },
    handleDelete (record) {
      const that = this
      const table = this.$refs.table
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/chat/reply/init',
            params: { action: 'delete', id: record.id }
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
            url: '/chat/reply/init',
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.myvisible = false
            this.visible = false
            this.visible1 = false
            this.visible2 = false
            this.loading = false
            this.$refs.table.refresh()
            if (res.message) {
              this.$message.success(res.message)
            } else {
              this.$success.success('操作成功')
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
