<template>
  <a-drawer
    :title="config.title"
    :width="700"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <div>
        <a-alert
          message="客户画像从客户信息表中读取所有客户数据，从当前表单视图归属的数据表中获取{客户编号}。"
          type="warning"
        />
        <a-form :form="form" >
          <a-divider orientation="left">指定客户信息表及{客户编号}</a-divider>
          <a-form-item label="客户信息表" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select show-search option-filter-prop="children" placeholder="请选择客户信息表" @change="value=>handleChange(value)" v-model="data.table_info">
              <a-select-option
                v-for="(value, key) in params.table_lists"
                :key="key"
                :value="value.tableid">{{ value.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="客户编号字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select show-search option-filter-prop="children" placeholder="请选择客户编号字段" v-model="data.table_fields">
              <a-select-option v-for="(value, key) in field" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-divider orientation="left">获取当前表的关联客户编号</a-divider>
          <a-form-item label="当前数据表的" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select show-search option-filter-prop="children" placeholder="请选择当前数据表的字段" v-model="data.current_fields">
              <a-select-option v-for="(value, key) in params.fieldsarr" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-divider orientation="left">设置客户信息存储到当前表的映射关系</a-divider>
          <a-button style="margin-bottom: 10px" @click="()=>{ data.conditions.splice(0, 0, { id: conditions.length + 1 ,sourceField: undefined, field: undefined })}">添加</a-button>
          <a-table
            ref="table"
            rowKey="id"
            :columns="columns"
            :dataSource="data.conditions"
            size="small"
            :pagination="false"
          >
            <span slot="action" slot-scope="text, record, index">
              <a-popconfirm
                title="您确定要删除该记录吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="()=>{ data.conditions.splice(index, 1) }"
              >
                <a href="#">删除</a>
              </a-popconfirm>
            </span>
            <span slot="sourceField" slot-scope="text, record">
              <a-select
                size="small"
                show-search
                option-filter-prop="children"
                allowClear
                v-model="record.sourceField"
                :defaultValue="text" >
                <a-select-option v-for="(value, key) in field" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
              </a-select>
            </span>
            <span slot="field" slot-scope="text, record">
              <a-select
                size="small"
                show-search
                option-filter-prop="children"
                allowClear
                v-model="record.field"
                :defaultValue="text" >
                <a-select-option v-for="(value, key) in params.fieldsarr" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
              </a-select>
            </span>
          </a-table>
        </a-form>
      </div>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      config: {},
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      visible: false,
      loading: false,
      conditions: [],
      field: [],
      data: {
        conditions: []
      },
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 60,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '客户信息表字段',
        dataIndex: 'sourceField',
        width: 300,
        scopedSlots: { customRender: 'sourceField' }
      }, {
        title: '当前表字段',
        dataIndex: 'field',
        width: 300,
        scopedSlots: { customRender: 'field' }
      }],
      form: this.$form.createForm(this)
    }
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
      this.data = config.data || { conditions: [] }
      if (this.data.table_info) {
        this.handleChange(this.data.table_info)
      }
    },
    handleChange (value) {
      return this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: { tableid: value }
      }).then(res => {
        this.field = res.result.field
      })
    },
    handleSubmit () {
      this.data.conditions = this.conditions
      this.visible = false
      this.$emit('ok', this.data)
      this.$message.success('操作成功')
    }
  }
}
</script>
