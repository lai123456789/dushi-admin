<template>
  <a-drawer
    :destroyOnClose="true"
    title="导入"
    width="600"
    placement="right"
    :closable="false"
    :visible="visible"
    @close="onClose"
  >
    <a-spin :spinning="loading">
      <a-form @submit="handleSubmit" :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            模板下载
            <a-tooltip :title="templateRemarks" size="small">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a :href="`${setting.rootUrl}static/field_import_template.xlsx`">
            <a-button size="small" icon="download">点击下载</a-button>
          </a>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            数据导入
          </span>
          <a-upload
            name="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :action="upload_url"
            :showUploadList="false"
            @change="handleChange"
          >
            <a-button size="small" @click="handImport" icon="upload">点击导入</a-button>
          </a-upload>
        </a-form-item>
        <a-table
          :columns="columns"
          :dataSource="importData"
          rowKey="alias"
          size="small"
          :pagination="false"
          :loading="importLoading"
        >
          <span slot="serial">
          </span>
        </a-table>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit" :disabled="checkdone">导入</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters(['setting'])
  },
  data () {
    return {
      loading: false,
      importLoading: false,
      visible: false,
      tableid: '',
      upload_url: `${process.env.VUE_APP_API_BASE_URL}admin/field/import?data=upload&table_id=`,
      upload_init_url: `${process.env.VUE_APP_API_BASE_URL}admin/field/import?data=upload&table_id=`,
      form: this.$form.createForm(this),
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      templateRemarks: null,
      checkdone: true,
      filename: '',
      filepath: '',
      columns: [ {
        title: '数据表对应字段',
        dataIndex: 'field'
      }, {
        title: '系统名称',
        dataIndex: 'alias'
      }, {
        title: 'UI组件',
        dataIndex: 'UI'
      }, {
        title: '检测状态',
        dataIndex: 'check'
      } ],
      importData: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = false
      this.checkdone = true
      this.importLoading = false
      this.tableid = config.table_id
      this.upload_url = this.upload_init_url + config.table_id
    },
    onClose () {
      this.visible = false
      this.importData = []
    },
    // 提交表单
    handleSubmit () {
      this.loading = true
      this.axios({
        url: '/admin/field/import',
        data: Object.assign({ table_id: this.tableid, uploadfile: this.filepath })
      }).then((res) => {
        this.$message.success(`成功导入 ${res.result.number} 条数据`)
        this.loading = false
        this.visible = false
        this.importData = []
        this.checkdone = true
        this.$emit('ok')
      })
    },
    // 导入数据
    handImport () {},
    fetch (params = {}) {},
    handleChange (info) {
      this.loading = true
      this.importLoading = true
      if (info.file.status === 'done') {
        this.loading = false
        this.importLoading = false
        this.importData = info.file.response.result.data
        this.checkdone = !info.file.response.result.check
        this.filename = info.file.response.result.filename
        this.filepath = info.file.response.result.filepath
      } else if (info.file.status === 'error') {
        this.loading = false
        this.importLoading = false
        this.$message.error(`${info.file.name} file upload failed.`)
      }
    }
  }
}
</script>
