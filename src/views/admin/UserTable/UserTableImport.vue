<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form @submit="handleSubmit" :form="form">
        <a-tabs v-model="activeKey">
          <a-tab-pane tab="导入数据" key="1">
            <a-form-item label="导入操作" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                v-decorator="['parameter[action]', {rules: [{ required: true, message: '请选择导入操作'}], initialValue: 'add' || 'edit' || 'addEdit' || 'editImg' || 'delete'}]"
                @change="actionChange"
              >
                <a-radio value="add" v-if="actionShow.indexOf('add') !== -1">新增</a-radio>
                <a-radio value="edit" v-if="actionShow.indexOf('edit') !== -1">编辑</a-radio>
                <a-radio value="addEdit" v-if="actionShow.indexOf('addEdit') !== -1">新增&编辑</a-radio>
                <a-radio value="editImg" v-if="actionShow.indexOf('editImgs') !== -1">编辑图片</a-radio>
                <a-radio value="delete" v-if="actionShow.indexOf('del') !== -1">删除</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="action">
              <span slot="label">
                关联字段
                <a-tooltip title="数据导入时，系统将根据该字段对已有数据进行「编辑」或「删除」操作，建议选择具备唯一性的字段">
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-select
                showSearch
                option-filter-prop="children"
                v-decorator="['parameter[associated]',
                              {rules: [{ required: true, message: '请选择关联字段'}]} ]">
                <a-select-option v-for="(value, key) in fields" :key="key" :value="key">{{ value.name }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="action && !actionImg">
              <span slot="label">
                图片字段
                <a-tooltip title="数据导入时，系统将根据该字段对已有数据进行「编辑」或「删除」操作，建议选择具备唯一性的字段">
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-select
                showSearch
                option-filter-prop="children"
                v-decorator="['parameter[imgField]',
                              {rules: [{ required: true, message: '请选择图片字段'}]} ]">
                <a-select-option v-for="(value, key) in fields" :key="key" :value="key">{{ value.name }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="下载模板" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="actionImg">
              <a-button @click="handleDownload" icon="download" size="small">点击下载</a-button>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">
                文件上传
                <a-tooltip title="请确保上传的文件格式和下载的模板保持一致，否则会导致数据无法加入">
                  <a-icon type="question-circle"/>
                </a-tooltip>
              </span>
              <a-upload
                name="file"
                :showUploadList="false"
                :action="fileAction"
                @change="handleChange"
              >
                <a-button icon="upload" size="small">点击上传</a-button>
              </a-upload>
              <span style="margin-left: 20px;">{{ filename }}</span>
            </a-form-item>
            <a-table
              rowKey="alias"
              :columns="columns"
              :dataSource="checkdata"
              size="small"
              :pagination="false">
              <span slot="serial" slot-scope="text, record, index">{{ index + 1 }}</span>
              <span slot="unique" slot-scope="text, record">
                {{ record.unique === 1 ? '√' :'×' }}
              </span>
              <span slot="required" slot-scope="text, record">
                {{ record.required === 1 ? '√' :'×' }}
              </span>
              <span slot="check" slot-scope="text, record">
                <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" v-if="record.check === 1"/>
                <a-icon type="close-circle" theme="twoTone" two-tone-color="#f5222d" v-if="record.check === 0"/>
                <a-icon type="exclamation-circle" theme="twoTone" two-tone-color="#faad14" v-if="record.check === 2"/>
              </span>
            </a-table>
          </a-tab-pane>
          <a-tab-pane tab="导入任务" key="2">
            <div class="table-operator">
              <a-button v-action:export icon="reload" @click="() => {queryParamTask = {}, $refs.tableTask.refresh(true)}">刷新</a-button>
            </div>
            <s-table
              ref="tableTask"
              size="small"
              rowKey="id"
              :columns="columnsTask"
              :data="loadDataTable"
              :pageSize="30"
            >
              <span slot="serial" slot-scope="text, record, index">{{ index + 1 }}</span>
              <span slot="status" slot-scope="text">
                <a-badge v-if="text =='0'" status="error" text="未开始" />
                <a-badge v-else-if="text =='1'" status="error" text="进行中" />
                <a-badge v-else-if="text =='2'" status="success" text="已完成" />
                <a-badge v-else-if="text =='3'" status="error" text="失败" />
              </span>
              <div slot="action" slot-scope="text, record">
                <a @click="handleView(record)">查看</a>
                <a-divider type="vertical" />
                <a @click="handleDelete(record)" :disabled="record.status == 1">删除</a>
              </div>
            </s-table>
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit" :disabled="checkdone">导入</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <user-table-import-view ref="userTableImportView"/>
  </a-drawer>
</template>
<script>
export default {
  components: {
    UserTableImportView: () => import('./UserTableImportView')
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      activeKey: '1',
      template: {},
      // 表头
      columns: [{
        title: '#',
        width: 40,
        scopedSlots: { customRender: 'serial' }
      }, {
        title: '模板字段',
        dataIndex: 'field'
      }, {
        title: '唯一',
        dataIndex: 'unique',
        scopedSlots: { customRender: 'unique' }
      }, {
        title: '必填',
        dataIndex: 'required',
        scopedSlots: { customRender: 'required' }
      }, {
        title: '导入字段',
        dataIndex: 'fieldImport'
      }, {
        title: '校验结果',
        dataIndex: 'check',
        scopedSlots: { customRender: 'check' }
      }],
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      checkdata: [],
      check: '',
      action: false,
      actionImg: true,
      fields: [],
      fileAction: '',
      tplviewid: '',
      actionShow: [],
      checkdone: true,
      filename: null,
      filepath: null,
      // 搜索参数
      queryParamTask: {},
      // 表头
      columnsTask: [{
        title: '#',
        width: 40,
        scopedSlots: { customRender: 'serial' }
      }, {
        title: '文件名',
        dataIndex: 'filename',
        flex: 1
      }, {
        title: '创建时间',
        dataIndex: 'create_time',
        width: 150
      }, {
        title: '任务状态',
        dataIndex: 'status',
        width: 90,
        scopedSlots: { customRender: 'status' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 90,
        scopedSlots: { customRender: 'action' }
      }]
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.checkdata = []
      this.activeKey = '1'
      this.bartemplate = config.barData.bartemplate ? JSON.parse(config.barData.bartemplate) : { filepath: '', filename: '', remarks: '', event: '' }
      if (this.bartemplate.event && this.bartemplate.event.tableList) {
        this.bartemplate.event.tableList.forEach(item => {
          const obj = {
            currentField: item.cause.currentField,
            sourceField: item.cause.sourceField
          }
          item.cause = obj
          item.effect = item.effect.map(mapItem => {
            const obj = {
              currentField: mapItem.currentField,
              sourceField: mapItem.currentField
            }
            return obj
          })
        })
      }
      this.fileAction = `${process.env.VUE_APP_API_BASE_URL}${config.url}?tplviewid=${config.tplviewid}`
      this.tplviewid = config.tplviewid
      this.actionShow = this.bartemplate.modal ? this.bartemplate.modal.action : ['add']
      this.filename = null
      // 刚进入的时候数据刷新数据
      this.action = false
      this.axios({
        url: '/admin/UserTable/tableFields/?tableid=' + config.tableid
      }).then((res) => {
        this.loading = false
        this.fields = res.result
      })
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/task/select',
        params: Object.assign(parameter, this.queryParam, { type: 'import', number: this.config.tplviewid, sortField: 'create_time', sortOrder: 'descend' })
      }).then(res => {
        return res.result
      })
    },
    // 文件上传触发
    handleChange (info) {
      this.loading = true
      if (info.file.status === 'done') {
        this.loading = false
        this.checkdata = info.file.response.result.data
        this.checkdone = !info.file.response.result.check
        this.filename = info.file.response.result.filename
        this.filepath = info.file.response.result.filepath
        this.template = info.file.response.result.template
      } else if (info.file.status === 'error') {
        this.loading = false
        this.$message.error(`${info.file.name} file upload failed.`)
      }
    },
    // 模板下载
    handleDownload () {
      if (this.bartemplate.modal) {
        window.open(`${process.env.VUE_APP_API_BASE_URL}admin/Api/downloadTemplate/?tplviewid=${this.tplviewid}`, '', '')
      } else {
        this.$message.error('未设置下载模板')
      }
    },
    actionChange (e) {
      this.action = e.target.value !== 'add'
      this.actionImg = e.target.value !== 'editImg'
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          var checkField = false
          if (values.parameter.action === 'add') {
            checkField = true
          } else {
            for (var key in this.checkdata) {
              if (values.parameter.associated === this.checkdata[key].alias) {
                checkField = true
                break
              }
            }
          }
          if (checkField) {
            this.loading = true
            values.parameter = Object.assign(values.parameter, { tableid: this.config.tableid, filename: this.filename, filepath: this.filepath, maxrows: this.bartemplate.modal.maxRows, importevent: this.bartemplate.event, template: this.template })
            values.info = {
              number: this.config.tplviewid,
              type: 'import',
              controller: this.config.controller ? this.config.controller : 'admin/Api',
              method: this.config.method ? this.config.method : 'import',
              parameter: JSON.stringify(values.parameter)
            }
            this.axios({
              url: 'admin/task/add',
              data: values
            }).then((res) => {
              this.loading = false
              this.$emit('ok', values)
              if (res.message) {
                this.$message.warning(res.message)
              } else {
                this.$message.success('操作成功')
                this.form.resetFields()
                this.activeKey = '2'
                this.checkdata = []
                this.checkdone = true
                this.action = false
                this.filename = null
                this.$nextTick(() => {
                  this.$refs.tableTask.refresh()
                })
              }
            })
          } else {
            this.$message.info('导入的数据中没有关键字段，请调整后重试。')
          }
        }
      })
    },
    // 任务查看
    handleView (record) {
      this.$refs.userTableImportView.show({
        action: 'view',
        title: '查看',
        url: '/admin/task/view',
        record: record
      })
    },
    // 任务删除
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          that.axios({
            url: '/admin/task/delete',
            params: { id: record.id }
          }).then(res => {
            that.$refs.tableTask.refresh()
          })
        }
      })
    }
  }
}
</script>
