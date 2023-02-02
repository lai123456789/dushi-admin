<template>
  <div>
    <a-drawer
      :zIndex="1001"
      :destroyOnClose="true"
      title="售后系统订单列表"
      :width="1000"
      :visible="visible"
      @close="visible = false" >
      <a-form :form="formEnter" layout="inline" style="display: flex; margin-bottom: 8px;">
        <a-form-item label="手动录入售后系统单号">
          <a-input
            v-decorator="['formParam[systemNum]', { initialValue: formParam.systemNum, rules: [{ required: true, message: '请输入售后系统工单编号' }] }]"
            style="width: 570px"
            :disabled="isDisabled"
            placeholder="当点击【创建工单】失败且在售后系统关联了该CTC单号时，请手动输入售后系统工单编号。" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-popconfirm
              v-if="isDisabled"
              title="请确认售后系统建单失败，是否需要手动录入？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="sureOk"
            >
              <a-button htmlType="submit" type="primary"><a-icon type="copy"/>录入</a-button>
            </a-popconfirm>
            <a-button v-else htmlType="submit" type="primary" @click="entering"><a-icon type="copy"/>保存</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <a-card :bordered="false">
        <a-table
          ref="table1"
          size="small"
          rowKey="id"
          :columns="columnsList"
          :dataSource="loadListTable"
          :autoLoad="false">
          <div slot="action" slot-scope="text, record, index">
            <a @click="handleAdd(record,index)">创建工单</a>
          </div>
        </a-table>
      </a-card>
    </a-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      formEnter: this.$form.createForm(this),
      formParam: {
        systemNum: ''
      },
      isDisabled: true,
      visible: false,
      // 售后系统订单列表
      columnsList: [{
        title: '操作',
        scopedSlots: { customRender: 'action' }
      }, {
        title: '商品skuId',
        dataIndex: 'sku_id'
      }, {
        title: '商品名称',
        dataIndex: 'sku_name',
        scopedSlots: { customRender: 'weight' }
      }, {
        title: '69码',
        dataIndex: 'sku_barcode'
      }, {
        title: '发货单状态',
        dataIndex: 'express_status'
      }, {
        title: '退款工单编号',
        dataIndex: 'service_order_refund_codes'
      }, {
        title: '换货工单编号',
        dataIndex: 'service_order_exchange_codes'
      }, {
        title: '收货联系人电话',
        dataIndex: 'linkman_phone'
      }, {
        title: '收货地址',
        dataIndex: 'address'
      }],
      // 表格数据源数组
      loadListTable: [],
      data: [],
      configData: ''
    }
  },
  methods: {
    // 编辑器代码里接收的show方法
    show (config) {
      console.log('config  config', config)
      if (!config.data.crm_thd.ddbh) {
        this.$message.warning('请输入订单编号')
        return
      }
      // this.visible = true
      this.configData = config
      const { ddbh, cp69m, gdly, gmqd } = config.data.crm_thd
      this.loadListTable = []
      this.axios({
        url: '/crm/ApiCtc/init',
        data: {
          ddbh,
          cp69m,
          gdly,
          gmqd
        }
      }).then(res => {
        if (res.code !== 0) {
          this.$message.error(res.message)
          return
        }
        this.visible = true
        this.loadListTable = res.result
      })
    },
    sureOk () {
      this.isDisabled = false
    },
    entering () {
      if (!this.isDisabled) {
        this.formEnter.validateFields((err) => {
          if (!err) {
            this.$message.success('操作成功')
            this.visible = false
            // 手动录入的系统工单编号
            const inputVal = this.formEnter.getFieldValue('formParam[systemNum]')
            this.configData.data.crm_thd.djxtgdbh = inputVal
            this.$emit('ok', this.configData)
          }
        })
      }
    },
    handleAdd (record, index) {
      this.axios({
        url: '/crm/ApiCtc/orderCreate',
        data: {
          sku_id: record.sku_id,
          id: this.configData.record.id,
          ddbh: this.configData.data.crm_thd.ddbh || ''
        }
      }).then(res => {
        if (res.code === 0) {
          this.configData.data.crm_thd.shdw = res.result.shdw
          this.$emit('ok', this.configData)
          this.visible = false
        }
        this.$message.error(res.message)
      })
    }
  }
}
</script>
