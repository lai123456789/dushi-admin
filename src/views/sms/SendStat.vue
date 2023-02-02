<template>
  <div>
    <a-card>
      <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
        <a-form-item label="类型">
          <a-select v-model="queryParam.type" style="width: 100px;">
            <a-select-option v-for="value in priceType" :key="value.value" :value="value.value" >{{ value.type }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="日期">
          <a-range-picker
            @change="getDate"
            v-model="showtime"
            :ranges="{
              今天: [moment().startOf('day'), moment().endOf('day')],
              昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
              本周: [moment().startOf('week'), moment().endOf('week')],
              本月: [moment().startOf('month'), moment().endOf('month')],
            }"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </a-form-item>
        <a-space>
          <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
          <a-button @click="reset">重置</a-button>
          <a-button v-action:export_stat icon="download" @click="handleExport">导出</a-button>
          <a-button v-action:add @click="() => {visible = true; addCost = ''}">￥ 充值</a-button>
        </a-space>
      </a-form>
      <a-alert :message="'剩余数量：'+ remain_count +' 条, 当前单价：'+ unitprice +' 元, 总计数：' + total_count + ' 条, 总计费：' + total_fee + ' 元'" type="info" style="margin-bottom: 5px"/>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="type" slot-scope="text">
          <span v-for="item in priceType" :key="item.value" v-show="text === item.value">{{ item.type }}</span>
        </div>
      </s-table>
    </a-card>
    <a-modal
      title="￥ 充值"
      :visible="visible"
      @ok="handleOk"
      :confirmLoading="loading"
      :destroyOnClose="true"
      @cancel="visible = !visible"
    >
      <a-form :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-form-item label="类型">
          <a-radio-group
            v-decorator="['info[type]', { initialValue: '1', rules: [{ required: true, message: '请选择充值类型' }] }]"
          >
            <a-radio value="1" style="margin-right: 120px">充值</a-radio>
            <a-radio value="2">回收</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="数量">
          <a-input-number
            :min="1"
            style="width: 100%"
            @change="(e) => { addCost = form.getFieldValue('info[unitprice]') * e}"
            v-decorator="['info[count]', {rules: [{ required: true, message: '请输入数量' }] }]"
          />
        </a-form-item>
        <a-form-item label="单价">
          <a-input-number
            :min="0"
            style="width: 100%"
            @change="(e) => { addCost = form.getFieldValue('info[count]') * e}"
            v-decorator="['info[unitprice]', { initialValue: unitprice, rules: [{ required: true, message: '请输入单价' }] }]"
          />
        </a-form-item>
        <a-form-item label="计费">
          <a-input
            :read-only="true"
            style="background-color: #F5F5F5; width: 100%"
            v-decorator="['info[cost]', { initialValue: addCost || '' }]"
          />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-decorator="['info[remarks]']"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <general-export ref="generalExport" />
  </div>
</template>
<script>
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      visible: false,
      loading: false,
      // 搜索参数
      monthDate: '',
      addCost: '',
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      // 剩余数量
      remain_count: 0,
      // 当前单价
      unitprice: 0,
      showtime: null,
      queryParam: {
        type: '0'
      },
      form: this.$form.createForm(this),
      // 表头
      columns: [{
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '日期',
        dataIndex: 'date',
        sorter: true
      }, {
        title: '总计数',
        dataIndex: 'count',
        sorter: true
      }, {
        title: '单价',
        dataIndex: 'unitprice',
        sorter: true
      }, {
        title: '总费用',
        dataIndex: 'cost',
        sorter: true
      }, {
        title: '类型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' }
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }],
      priceType: [{
        value: '0',
        type: '发送'
      }, {
        value: '1',
        type: '充值'
      }, {
        value: '2',
        type: '回收'
      }],
      // 总计数
      total_count: 0,
      // 总计费
      total_fee: 0
    }
  },
  methods: {
    loadData (parameter) {
      return this.axios({
        url: '/sms/Send/stat',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.total_count = res.result.total_count || 0
        this.total_fee = res.result.total_fee || 0
        this.remain_count = res.result.remain_count || 0
        this.unitprice = res.result.unitprice || 0
        return res.result
      })
    },
    handleExport () {
      // const where = encodeURIComponent(JSON.stringify(this.queryParam))
      // this.$confirm({
      //   title: '您确认要导出账单吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}sms/Send/exportStat/?where=${where}`)
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    getDate (date, dateString) {
      this.showtime = date
      this.queryParam.searchDate = date.length > 0 ? dateString : null
    },
    reset () {
      this.queryParam.type = '0'
      this.queryParam.searchDate = null
      this.showtime = null
      this.$refs.table.refresh()
    },
    // 充值提交
    handleOk () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          this.axios({
            url: 'sms/Send/statAdd',
            data: values
          }).then(res => {
            if (res.message) {
              this.$message.error(res.message)
            } else {
              this.$message.success('操作成功')
            }
            this.loading = false
            this.visible = false
            this.$refs.table.refresh()
          })
        }
      })
    }
  }
}
</script>
