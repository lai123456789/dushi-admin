<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :required="true">
          <span slot="label">子表关联模式
            <a-tooltip placement="top">
              <template slot="title">
                <span>一对多：如《报销单》与《报销明细》，1条报销单记录关联多条报销单明细记录。<br/>多对多：如《产品信息表》、《配件信息表》与《产品与配件关联表》，1条产品信息关联多条配件信息，1条配件信息也可以关联多条产品信息。</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-radio-group v-decorator="['pattern', {initialValue: data.pattern || '1'}]" @change="patternChange">
            <a-radio value="1">一对多关联</a-radio>
            <a-radio value="2">多对多关联</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="本表关联字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            placeholder="请选择本表关联字段"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'field', {rules: [{ required: true, message: '请选择本表关联字段'}], initialValue: data.field} ]" >
            <a-select-option value="id">ID</a-select-option>
            <a-select-option v-for="(value, key) in params.fieldsarr" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.pattern === '2'">
          <span slot="label">中间数据表
            <a-tooltip placement="top">
              <template slot="title">
                <span>多对多关系时的中间表，如《产品与配件关联表》</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="请选择中间数据表"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'middleTable', {rules: [{ required: true, message: '请选择中间数据表'}], initialValue: data.middleTable} ]"
            @change="value=> middleChange(value)"
          >
            <a-select-option
              v-for="(value, key) in params.table_lists"
              :key="key"
              :value="value.tableid">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.pattern === '2'">
          <span slot="label">中间表与本表关联字段
            <a-tooltip placement="top">
              <template slot="title">
                <span>从中间数据表中选择，与本表的关联字段，如《产品与配件关联表》中的{关联产品编号}</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="请选择中间表与本表关联字段"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'thmdField', {rules: [{ required: true, message: '请选择中间表与本表关联字段'}], initialValue: data.thmdField} ]" >
            <a-select-option v-for="(value, key) in thmdField" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">子表数据表
            <a-tooltip placement="top">
              <template slot="title">
                <span>多对多模式下，选择关联表，如《配件信息表》</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="请选择子表数据表"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'tableid_son', {rules: [{ required: true, message: '请选择子表数据表'}], initialValue: data.tableid_son} ]"
            @change="value=>handleChange(value)">
            <a-select-option
              v-for="(value, key) in params.table_lists"
              :key="key"
              :value="value.tableid">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">子表关联字段
            <a-tooltip placement="top">
              <template slot="title">
                <span>从子表中选择，与中间表的关联字段，如{配件编号}</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="请选择子表关联字段"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'field_son', {rules: [{ required: true, message: '请选择子表关联字段'}], initialValue: data.field_son} ]">
            <a-select-option v-for="(value, key) in field" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.pattern === '2'">
          <span slot="label">中间表与子表关联字段
            <a-tooltip placement="top">
              <template slot="title">
                <span>从中间数据表中选择，与子表的关联字段，如{关联配件编号}</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="请选择中间表与子表关联字段"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'sonmdField', {rules: [{ required: true, message: '请选择中间表与子表关联字段'}], initialValue: data.sonmdField} ]" >
            <a-select-option v-for="(value, key) in thmdField" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">子表数据窗口
            <a-tooltip placement="top">
              <template slot="title">
                <span>选择1个子表的数据窗口</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select
            placeholder="请选择子表数据窗口"
            :allowClear="true"
            show-search
            option-filter-prop="children"
            v-decorator="[ 'tplviewid_son', {rules: [{ required: true, message: '请选择子表数据窗口'}], initialValue: data.tplviewid_son} ]">
            <a-select-option v-for="(value, key) in tpl" :key="key" :value="value.uid">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
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
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      field: [],
      thmdField: [],
      tpl: []
    }
  },
  methods: {
    show (config, data) {
      this.visible = true
      this.config = config
      this.data = config.record
      if (this.data.middleTable) {
        this.middleChange(this.data.middleTable)
      }
      if (this.data.tableid_son) {
        this.handleChange(this.data.tableid_son)
      }
      this.recordIndex = config.index
      this.form.resetFields()
    },
    handleChange (value) {
      return this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: Object.assign({ tableid: value, variable: ['table_form_list', 'table_flow_list', 'table_card_list'] })
      }).then(res => {
        this.field = res.result.field
        this.field.unshift({ alias: 'id', name: 'ID' })
        this.tpl = res.result.tpl
      })
    },
    patternChange (e) {
      this.data.pattern = e.target.value
      this.form.resetFields()
      this.tpl = []
      this.field = []
    },
    middleChange (value) {
      return this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: Object.assign({ tableid: value, variable: ['table_form_list', 'table_flow_list', 'table_card_list'] })
      }).then(res => {
        this.thmdField = res.result.field
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.visible = false
          values.enable = this.params.associated_list.enable
          if (this.params.associated_list.priv) {
            values.priv = this.params.associated_list.priv
          }
          this.$message.success('操作成功')
          this.$emit('func', values)
        }
      })
    }
  }
}
</script>
