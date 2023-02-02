<template>
  <div>
    <a-drawer
      :destroyOnClose="true"
      :title="type === 'handle' ? '导入办单' : '导入建单'"
      :width="1000"
      :visible="visible"
      @close="visible = false" >
      <a-spin :spinning="loading">
        <a-form :form="formEnter" layout="inline">
          <a-form-item label="选择文件"></a-form-item>
          <a-form-item>
            <a-space>
              <a-upload
                name="file"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                :action="upload_url"
                @change="handleChange"
                :headers="{'Access-Token' : ACCESS_TOKEN}"
                :show-upload-list="false"
              >
                <a-button><a-icon type="upload"/>导入</a-button>
              </a-upload>
              <a-button @click="downLoadTemplate"><a-icon type="download"/>模板下载</a-button>
            </a-space>
          </a-form-item>
          <a-table
            :scroll="{ x: type === 'create' ? 1300 : 0 }"
            style="margin-top: 8px;"
            ref="table1"
            size="small"
            rowKey="gdbh"
            :columns="columnsList"
            :dataSource="loadListTable"
            :pagination="false"
            :autoLoad="false">
          </a-table>
        </a-form>
        <div class="bbar">
          <a-button type="primary" :disabled="disabled" @click="handleSubmit">提交</a-button>
          <a-button @click="visible=!visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
export default {
  data () {
    return {
      disabled: true,
      loading: false,
      upload_url: '',
      formEnter: this.$form.createForm(this),
      ACCESS_TOKEN: storage.get(ACCESS_TOKEN),
      formParam: {
        systemNum: ''
      },
      visible: false,
      // 数据列表表头
      columnsList: [],
      // 表格数据源数组
      loadListTable: [],
      data: [],
      configData: '',
      filepath: '',
      gdlx: '',
      type: '',
      checkAll: ''
    }
  },
  methods: {
    // 编辑器代码里接收的show方法
    show (param) {
      this.columnsList = []
      this.loadListTable = []
      this.gdlx = param.gdlx
      // 办单类型 handle-导入办单 create-导入建单
      this.type = param.type
      let uploadUrl = ''
      if (param.type === 'handle') {
        // 办单接口  gdlx: pjsq-配件申请 pjhx-配件核销
        uploadUrl = `${process.env.VUE_APP_API_BASE_URL}crm/Order/handleImport?gdlx=${param.gdlx}&type=upload`
      } else {
        // 建单接口 gdlx: zad-安装单 thd-退货单
        uploadUrl = `${process.env.VUE_APP_API_BASE_URL}crm/Order/orderCreateImport?gdlx=${param.gdlx}&type=upload`
      }
      this.upload_url = uploadUrl
      this.visible = true
    },
    // 上传文件成功后的回调
    handleChange (info) {
      var fileList = [...info.fileList]
      var fileListData = fileList.slice(-1)
      this.loadListTable = []
      this.columnsList = []
      this.loading = true
      if (info.file.status === 'done') {
        this.disabled = false
        this.filepath = fileListData[0].response.result.filepath
        this.loading = false
        if (this.type === 'handle') {
          // 配件核销、配件申请单 办单
          this.columnsList = [{
            title: '工单编号',
            dataIndex: 'gdbh'
          }, {
            title: '办理方式',
            dataIndex: 'handleWay'
          }, {
            title: '办理备注',
            dataIndex: 'handleRemarks'
          }, {
            title: '指定仓库',
            dataIndex: 'pjffck'
          }, {
            title: '物流单号',
            dataIndex: 'pjjswldh'
          }, {
            title: '物流公司',
            dataIndex: 'pjjswlgs'
          }, {
            title: '检测结果',
            dataIndex: 'check'
          }]
        } else {
          // 安装单、退货单 建单
          this.columnsList = [{
            title: '检测结果',
            dataIndex: 'check'
          }, {
            title: '用户姓名',
            dataIndex: 'gdlxr'
          }, {
            title: '用户电话',
            dataIndex: 'gdlxdh',
            width: 150
          }, {
            title: '地址',
            dataIndex: 'ssq',
            width: 150
          }, {
            title: '详细地址',
            dataIndex: 'xxdz'
          }, {
            title: '产品69码',
            dataIndex: 'cp69m'
          }, {
            title: 'SN码',
            dataIndex: 'snm'
          }, {
            title: '保内保外',
            dataIndex: 'gdbnw'
          }, {
            title: '购买渠道',
            dataIndex: 'gmqd'
          }, {
            title: '订单编号',
            dataIndex: 'ddbh'
          }, {
            title: '购买时间',
            dataIndex: 'gmsj'
          }, {
            title: '工单来源',
            dataIndex: 'gdly'
          }, {
            title: '付款对象',
            dataIndex: 'fkdx'
          }, {
            title: '办理备注',
            dataIndex: 'bz',
            width: 150
          }, {
            title: '服务项目',
            dataIndex: 'gdlx'
          }, {
            title: '诉求类别',
            dataIndex: 'sqlb'
          }]
        }
        this.loadListTable = fileListData[0].response.result.data
        this.checkAll = fileListData[0].response.result.check
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`)
      }
    },
    handleSubmit () {
      if (!this.checkAll) {
        this.$message.warning('存在不合法字段 请按系统有效值修正后，再导入')
        return
      }
      this.loading = true
      this.disabled = true
      let url
      if (this.type === 'handle') {
        // 办单提交接口
        url = `/crm/Order/handleImport?gdlx=${this.gdlx}&type=handle&filepath=${this.filepath}`
      } else {
        // 建单提交接口
        url = `/crm/Order/handleImport?gdlx=${this.gdlx}&type=create&filepath=${this.filepath}`
      }
      this.axios({
        url: url
      }).then(res => {
        if (res.code === 0) {
          this.loading = false
          this.$emit('ok') // 刷新当前页面表格工单数据
          this.loadListTable = res.result.data
          this.$message.success('操作成功')
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 下载模板
    downLoadTemplate () {
      const gdlx = this.gdlx
      let requestUrl
      if (gdlx === 'azd') {
        requestUrl = 'app/crm/static/tpl_oa_order_install.xlsx'
      } else if (gdlx === 'thd') {
        requestUrl = 'app/crm/static/tpl_oa_order_return.xlsx'
      } else if (gdlx === 'pjsq') {
        requestUrl = 'app/crm/static/handle_oa_order_parts.xlsx'
      } else if (gdlx === 'pjhx') {
        requestUrl = 'app/crm/static/handle_oa_parts_verification.xlsx'
      }
      window.open(`${process.env.VUE_APP_API_BASE_URL}${requestUrl}`)
    }
  }
}
</script>
