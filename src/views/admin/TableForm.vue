<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    :destroyOnClose="true"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="编号" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="config.action === 'edit'">
          <a-input v-decorator="['tableid', {initialValue: data.tableid}]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="显示名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input @change="handleChangeName" v-decorator="['info[name]', {initialValue: data.name, rules: [{ required: true, message: '请输入显示名称'},{ min:2, message: '请输入至少两个字符' }]}]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">系统名称
            <a-tooltip placement="top">
              <template slot="title">
                <span>系统名称由显示名称的拼音首字母自动生成。保存时系统进行唯一性校验，若已存在当前名称，则会在末尾以2为起点，以1为步进增加数字标识，直到系统名称唯一。如：xtmc、xtmc2、xtmc3…</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input
            :disabled="aliasDisabled"
            v-decorator="['info[alias]', {
              initialValue: data.alias,
              rules: [
                { required: true, message: '请输入系统名称'},
                { pattern: new RegExp(/^(?![0-9])[a-z0-9_]+$/) , message: '只能包含小写字母、数字和下划线，且不能以数字开头' }
              ]}]"
          >
            <template v-if="config.action === 'edit'">
              <a-icon type="edit" slot="addonAfter" style="cursor: pointer;" v-if="aliasDisabled" @click="handleEdit" />
              <a-icon type="edit" slot="addonAfter" style="cursor: pointer;" v-else @click="aliasDisabled = true" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="分类名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-auto-complete @search="onSearch" v-decorator="['info[category]', {initialValue: data.category, rules: [{ message: '请输入分类名称'}]}]" >
            <template slot="dataSource">
              <a-select-option v-for="item in typeList" :key="item.category">
                {{ item.category }}
              </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item label="最后修改人" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="config.action === 'edit'">
          <a-input v-decorator="['update_user', {initialValue: data.update_user}]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="最后修改时间" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="config.action === 'edit'">
          <a-input v-decorator="['update_time', {initialValue: data.update_time}]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 3, maxRows: 6 }" v-decorator="['info[description]', {initialValue: data.description}]" />
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
  data () {
    return {
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      aliasDisabled: false,
      data: {},
      form: this.$form.createForm(this),
      editable: false,
      typeList: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.aliasDisabled = config.action === 'edit'
      this.axios({
        url: this.config.url,
        params: Object.assign({ tableid: config.record ? config.record.tableid : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
      })
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    // 根据显示名称赋值系统名称
    handleChangeName (e) {
      if (this.aliasDisabled) {
        return false
      }
      const pinyin = require('js-pinyin')
      const reg = new RegExp(/^(?![0-9])[a-z0-9_]+$/)
      const reg2 = new RegExp(/^[a-z0-9_]+$/)
      var val = pinyin.getCamelChars(e.target.value)
      val = val.toLowerCase()
      val = val.split('')
      this.getVal(val, reg)
      val = val.filter(item => {
        return reg2.test(item)
      })
      const { setFieldsValue } = this.form
      setFieldsValue({ 'info[alias]': val.join('') })
    },
    // 递归判断是否首字不是数字
    getVal (val, reg) {
      if (!reg.test(val[0])) {
        val.shift()
        this.getVal(val, reg)
      }
    },
    handleEdit () {
      const that = this
      this.$confirm({
        title: '您确认要修改系统名称吗？',
        content: '修改系统名称会造成系统未知错误，强烈建议不要修改',
        onOk () {
          that.aliasDisabled = false
        }
      })
    },
    // 自动完成搜索
    onSearch (val) {
      val = val.trim()
      if (val) {
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.axios({
            url: 'admin/table/searchCategory/?type=table&category=' + val
          }).then(res => {
            this.typeList = res.result.data
          })
        }, 500)
      } else {
        clearTimeout(this.timeoutId)
        this.typeList = []
      }
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.info.module = this.config.module
          values.info.category = values.info.category ? values.info.category.replace(/\s+/g, '') : ''
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { tableid: this.data.tableid })
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
            }
          })
        }
      })
    }
  }
}
</script>
