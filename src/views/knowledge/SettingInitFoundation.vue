<template>
  <a-spin :spinning="loading">
    <a-form :form="form">
      <a-form-item v-bind="formItemLayout">
        <a-tooltip>
          <template slot="title">
            同步知识库内容到搜索引擎
          </template>
          <a-button icon="sync" @click="handleSync">同步数据</a-button>
        </a-tooltip>
      </a-form-item>
      <a-form-item label="是否需要审核" v-bind="formItemLayout">
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[is_audit]', {initialValue: data.is_audit == 1 ? true : false, valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item label="最新知识时间范围" v-bind="formItemLayout">
        <a-input-number :min="1" :precision="0" v-decorator="['info[scope]', {initialValue: data.scope, rules: [{ required: true, message: '请输入时间范围'}]}]"/> 小时
      </a-form-item>
      <a-form-item label="热门知识显示数量" v-bind="formItemLayout">
        <a-input-number :min="1" :precision="0" v-decorator="['info[hot_num]', {initialValue: data.hot_num, rules: [{ required: true, message: '请输显示数量'}]}]"/> 条
      </a-form-item>
      <a-form-item label="适配产品" v-bind="formItemLayout">
        <a-switch checked-children="开" un-checked-children="关" @change="(e) => { pro_show = e }" v-decorator="['info[adaptive_products]', {initialValue: data.adaptive_products == '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <div v-if="pro_show">
        <a-form-item label="产品分类数据源" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
          <a-cascader
            style="width: 300px"
            :show-search="true"
            placeholder="请选择产品分类数据源"
            v-decorator="['info[producttableid]', {initialValue: data.producttableid, rules: [{ required: true, message: '请选择产品分类数据源'}]}]"
            :options="table_field"
            @change="changeTable" />
        </a-form-item>
        <a-form-item label="一级属性对应字段" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }" >
          <a-select @change="onChange($event,'1')" v-decorator="['info[level[' + 0 + ']]', {initialValue: data.level[0], rules: [{ required: true, message: '请选择一级属性对应字段'}]}]" style="width: 300px" allowClear>
            <a-select-option v-for="value in one_field" :key="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="二级属性对应字段" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
          <a-select @change="onChange($event,'2')" v-decorator="['info[level[' + 1 + ']]', {initialValue: data.level[1] || undefined}]" style="width: 300px" allowClear>
            <a-select-option v-for="value in two_field" :key="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="三级属性对应字段" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
          <a-select @change="onChange($event,'3')" v-decorator="['info[level[' + 2 + ']]', {initialValue: data.level[2] || undefined}]" style="width: 300px" allowClear>
            <a-select-option v-for="value in three_field" :key="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="四级属性对应字段" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
          <a-select v-decorator="['info[level[' + 3 + ']]', {initialValue: data.level[3] || undefined}]" style="width: 300px" allowClear>
            <a-select-option v-for="value in four_field" :key="value.alias">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </div>
      <a-form-item label="适配用户" v-bind="formItemLayout">
        <a-switch checked-children="开" un-checked-children="关" @change="(e) => { user_show = e }" v-decorator="['info[adaptive_user]', {initialValue: data.adaptive_user == '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }" v-if="user_show">
        <span slot="label">适配用户类型<a-tooltip title="一行一个，空行会被忽略"><a-icon type="question-circle"/></a-tooltip></span>
        <a-textarea v-decorator="['info[user_type]', {initialValue: data.user_type, rules: [{ required: true, message: '请输入适配用户类型'}]}]" :auto-size="{ minRows: 10, maxRows: 15 }" style="width: 300px"/>
      </a-form-item>
      <a-form-item v-bind="formItemLayout">
        <a-button type="primary" htmlType="submit" @click="handleSubmit">保存</a-button>
      </a-form-item>
    </a-form>
  </a-spin>
</template>
<script>
export default {
  data () {
    return {
      loading: false,
      data: {},
      dataSource: [],
      table_field: [],
      one_field: [],
      two_field: [],
      three_field: [],
      four_field: [],
      form: this.$form.createForm(this),
      productCategory: [],
      pro_show: false,
      user_show: false,
      formItemLayout: {
        labelCol: {
          span: 4
        },
        wrapperCol: {
          span: 20
        }
      }
    }
  },
  mounted () {
    this.loading = true
    this.axios({
      url: '/knowledge/Setting/getTableField'
    }).then(res => {
      this.table_field = res.result.table_field
    })
    this.axios({
      url: 'knowledge/setting/setting'
    }).then(res => {
      this.data = res.result.data
      this.data.producttableid = res.result.data.producttableid ? JSON.parse(res.result.data.producttableid) : []
      this.data.level = res.result.data.level ? JSON.parse(res.result.data.level) : []
      const param = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      this.axios({
        url: '/admin/field/init',
        params: Object.assign(param, { tableid: this.data.producttableid[1] || 1 })
      }).then(res => {
        this.one_field = res.result.data
        this.two_field = this.data.level[0] ? this.one_field.filter(item => item.alias !== this.data.level[0]) : ''
        this.three_field = this.data.level[1] ? this.two_field.filter(item => item.alias !== this.data.level[1]) : ''
        this.four_field = this.data.level[2] ? this.three_field.filter(item => item.alias !== this.data.level[2]) : ''
        this.loading = false
      })
      this.pro_show = this.data.adaptive_products === '1'
      this.user_show = this.data.adaptive_user === '1'
      const string = res.result.data.user_type ? JSON.parse(res.result.data.user_type).join('\n') : ''
      this.data.user_type = string
      if (!this.data.user_type) {
        this.data.user_type = ['客户', '客服', '师傅'].join('\n')
      }
    })
  },
  methods: {
    // 选择数据表
    changeTable (val) {
      this.dataSource = val
      const tableField = val[val.length - 1]
      const param = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      this.axios({
        url: '/admin/field/init',
        params: Object.assign(param, { tableid: tableField })
      }).then(res => {
        this.one_field = res.result.data
      })
    },
    onChange (e, type) {
      if (type === '1') {
        if (e) {
          this.two_field = this.one_field.filter(item => item.alias !== e)
        } else {
          this.two_field = []
          this.three_field = []
          this.four_field = []
        }
      } else if (type === '2') {
        if (e) {
          this.three_field = this.two_field.filter(item => item.alias !== e)
        } else {
          this.three_field = []
          this.four_field = []
        }
      } else {
        if (e) {
          this.four_field = this.three_field.filter(item => item.alias !== e)
        } else {
          this.four_field = []
        }
      }
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (this.user_show) {
          const data = values.info.user_type.split('\n')
          values.info.user_type = data.filter(item => item)
          values.info.user_type = Array.from(new Set(values.info.user_type))
        } else {
          values.info.user_type = []
        }
        values.info.adaptive_products = values.info.adaptive_products ? '1' : '0'
        values.info.adaptive_user = values.info.adaptive_user ? '1' : '0'
        values.info.level = values.info.adaptive_products === '1' ? values.info.level.filter(item => item) : []
        if (!errors) {
          this.loading = true
          this.axios({
            url: 'knowledge/setting/setting',
            data: values
          }).then(res => {
            this.loading = false
            this.$message.success('操作成功')
          })
        }
      })
    },
    handleSync () {
      const me = this
      this.$confirm({
        title: '同步数据过程中可能会影响系统性能，您确认要同步吗？',
        onOk () {
          me.loading = true
          me.axios({
            url: 'knowledge/index/sync'
          }).then(res => {
            me.loading = false
            me.$message.success('操作成功')
          })
        }
      })
    }
  }
}
</script>
