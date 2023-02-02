<template>
  <a-drawer
    :destroyOnClose="true"
    title="数据联动设置"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="联动数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-cascader
            v-decorator="['linkList', {initialValue: linkList }]"
            placeholder="请选择源数据表"
            :options="tableField"
            @change="virtualSourceChange"
          />
        </a-form-item>
        <a-form-item validate-status="success" label="数据联动" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            placeholder="请选择当前表字段"
            show-search
            option-filter-prop="children"
            v-decorator="['link[current_value]', {initialValue: link.current_value || undefined, rules: [{ required: true, message: '请选择当前表字段'}]}]"
            style="width: 150px; margin-right: 10px;">
            <a-select-option v-for="(value, key) in current_fields" :key="key" :value="value.alias">{{ value.name }}</a-select-option>
          </a-select>值等于
          <a-select
            placeholder="请选择源数据表关联字段"
            show-search
            option-filter-prop="children"
            v-decorator="['link[relative_value]', {initialValue: link.relative_value || undefined, rules: [{ required: true, message: '请选择源数据表关联字段'}]} ]"
            style="width: 150px; margin: 0 10px 0 24px;">
            <a-select-option v-for="source_field in source_fields" :key="source_field.fieldid" :value="source_field.fieldid">{{ source_field.name }}</a-select-option>
          </a-select>的值时
          <a-select
            show-search
            option-filter-prop="children"
            :disabled="true"
            v-decorator="['link[current_field]', {initialValue: config.name || undefined}]"
            style="width: 150px; margin-right: 10px;">
            <a-select-option :value="config.alias">{{ config.name }}</a-select-option>
          </a-select>联动显示
          <a-select
            placeholder="请选择源数据表关联字段"
            show-search
            option-filter-prop="children"
            v-decorator="['link[relative_text]', {initialValue: link.relative_text || undefined, rules: [{ required: true, message: '请选择源数据表关联字段'}]}]"
            style="width: 150px; margin: 0 10px;">
            <a-select-option v-for="source_field in source_fields" :key="source_field.fieldid" :value="source_field.fieldid">{{ source_field.name }}</a-select-option>
          </a-select>的值
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
    tableField: {
      type: Array,
      default: () => {}
    }
  },
  data () {
    return {
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      source_fields: [],
      current_fields: [],
      link: [],
      linkList: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      if (this.config.data && this.config.data.linkList) {
        this.link = this.config.data.link
        this.linkList = this.config.data.linkList
        this.dataLink = this.config.data
        if (this.linkList.length !== 0) {
          this.virtualSourceChange(this.linkList)
        }
      }
      this.form.resetFields()
    },
    virtualSourceChange (value) {
      this.axios({
        url: '/admin/field/getSourceOptions',
        params: Object.assign({ source_tableid: value[1], current_tableid: this.config.tableid, virtual: 0 })
      }).then(res => {
        this.source_fields = res.result.source_fields
        this.current_fields = res.result.current_fields
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.visible = false
          this.$message.success('操作成功')
          this.$emit('ok', { dataType: this.config.dataType, data: values })
        }
      })
    }
  }
}
</script>
