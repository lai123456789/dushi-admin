<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-alert v-if="config.action === 'add'" message="如果你没有修改表格的默认排序方案，新建的数据会展现在最后一页" type="info" style="margin-bottom: 8px"/>
        <a-form-item label="上级字典" v-show="config.type === 'son' && config.record && config.record.category === '1'" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-cascader
            :show-search="true"
            option-filter-prop="children"
            v-decorator="['info[parent_number]', {initialValue: data.parent_number}]"
            placeholder="作为一级字典"
            :options="parent_number"
            :loadData="loadDataCascader({url: '/admin/dict/getCascaderData/'})"
            changeOnSelect/>
        </a-form-item>
        <a-form-item :hidden="config.type === 'son'" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">字典类型
            <a-tooltip placement="top" v-if="config.action !== 'add'">
              <template slot="title">该属性保存后不支持再次编辑</template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select v-decorator="['info[type]', {initialValue: data.type}]" @change="handleType" :disabled="config.action !== 'add'">
            <a-select-option value="basic">基础</a-select-option>
            <a-select-option value="table">数据表</a-select-option>
            <a-select-option value="sql">SQL</a-select-option>
            <a-select-option value="callback">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="config.type==='son' ? '显示名称' : '字典名称'">
          <a-input
            v-if="data.type ==='basic' && config.action === 'add' && config.page !== 'fieldSelect' && config.type !== 'son' "
            @change="changeName"
            v-decorator="['info[name]', {initialValue: data.name, rules: [{required: true, message: '请输入字典名称'}]}]"
            请输入字典名称
          />
          <a-textarea
            v-else-if="data.type ==='basic' && config.action === 'add' && config.page !== 'fieldSelect' && config.type === 'son'"
            @change="changeName"
            :autoSize="{ minRows: 6 }"
            v-decorator="['info[name]', {initialValue: data.name, rules: [{required: true, message: '请输入字典名称'}]}]"
            placeholder="一行一个，可以进行批量添加" />
          <a-input v-else @change="changeName" v-decorator="['info[name]', {initialValue: data.name, rules: [{required: true, message: '请输入字典名称'}]}]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">{{ config.type==='son' ? '系统名称':'字典编号' }}
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ config.type==='son' ? '系统名称':'字典编号' }}由{{ config.type==='son' ? '显示名称':'字典名称' }}自动生成。若为单个字时使用全拼，否则由首字母组成。保存时系统进行唯一性校验，若已存在当前名称，则会在末尾以2为起点，以1为步进增加数字标识，直到系统名称唯一。如：xtmc、xtmc2、xtmc3…</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input v-if="config.type !== 'son' || config.action === 'edit'" v-decorator="['info[number]', {initialValue: data.number, rules: [{required: true, message: '请输入字典系统名称'}]}]" :disabled="editable">
            <template v-if="config.action === 'edit'">
              <a-icon type="edit" slot="addonAfter" style="cursor: pointer;" v-if="editable" @click="handleEdit" />
              <a-icon type="edit" slot="addonAfter" style="cursor: pointer;" v-else @click="editable = true" />
            </template>
          </a-input>
          <a-textarea
            v-else
            :autoSize="{ minRows: 6 }"
            v-decorator="['info[number]', {initialValue: data.number, rules: [{required: true, message: '请输入字典系统名称'}]}]"
            placeholder="一行一个，可以进行批量添加" />
        </a-form-item>
        <a-form-item v-if="data.type==='callback'" label="自定义方法" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[setting][callback]', {initialValue: data.setting.callback, rules: [{required: true, message: '请输入字典名称'}]}]" placeholder="请输入自定义方法" />
        </a-form-item>
        <a-form-item v-else-if="data.type==='sql'" label="SQL" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 6}" v-decorator="['info[setting][sql]', {initialValue: data.setting.sql, rules: [{required: true, message: '请输入SQL语句'}]}]" placeholder="请输入SQL语句" />
        </a-form-item>
        <template v-else-if="data.type==='table'">
          <a-form-item label="关联数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              placeholder="请选择关联数据表"
              v-decorator="['table', {initialValue: data.setting.table, rules: [{required: true, message: '请选择名称字段'}]}]"
              @change="getData"
              :options="tableList" />
          </a-form-item>
          <a-form-item label="名称字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              placeholder="请选择名称字段"
              v-decorator="['info[setting][table_name_field]', {initialValue: data.setting.table_name_field ? [data.setting.table_name_field[2]] : [], rules: [{required: true, message: '请选择名称字段'}]}]"
              :options="fieldArr" />
          </a-form-item>
          <a-form-item label="编号字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              placeholder="请选择编号字段"
              v-decorator="['info[setting][table_number_field]', {initialValue: data.setting.table_number_field ? [data.setting.table_number_field[2]] : [], rules: [{required: true, message: '请选择编号字段'}]}]"
              :options="fieldArr" />
          </a-form-item>
          <a-form-item label="父编号字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              placeholder="请选择父编号字段"
              v-decorator="['info[setting][table_parent_field]', {initialValue: data.setting.table_parent_field}]"
              :options="table_field" />
          </a-form-item>
        </template>
        <a-form-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['info[disabled]', {initialValue: data.disabled+''}]">
            <a-radio value="0">启用</a-radio>
            <a-radio value="1">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="可维护" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['info[maintain]', {initialValue: data.maintain+''}]">
            <a-radio value="0">可维护</a-radio>
            <a-radio value="1">不维护</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item hidden label="字典类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['info[category]', {initialValue: data.category+''}]">
            <a-radio value="0">平面字典</a-radio>
            <a-radio value="1">树形字典</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
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
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      parent_number: [],
      table_field: [],
      fieldList: {}, // 保存数据
      fieldArr: [], // 根据数据表获取相应字段数组
      tableList: [],
      tableName: [],
      data: {},
      editable: false
    }
  },
  methods: {
    // 打开抽屉组件
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        data: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
        this.parent_number = res.result.parent_number
        this.table_field = res.result.table_field
        const tableField = JSON.parse(JSON.stringify(res.result.table_field))
        this.tableList = tableField.map(item => {
          if (item.children) {
            item.children.forEach(item1 => {
              delete item1.children
            })
          }
          return item
        })
        this.table_field.forEach(item => {
          if (item.children) {
            item.children.forEach(item1 => {
              this.fieldList[item1.value] = item1.children
            })
          }
        })
        if (this.data.setting.table_name_field) {
          this.data.setting.table = [this.data.setting.table_name_field[0], this.data.setting.table_name_field[1]]
          this.fieldArr = this.fieldArr = this.fieldList[this.data.setting.table_name_field[1]]
        }
        if (config.action === 'edit') {
          this.editable = true
        } else {
          this.data.category = config.record.category
        }
      })
    },
    // 加载级联菜单数据
    loadDataCascader (params) {
      return (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1]
        targetOption.loading = true
        this.axios({
          url: params.url,
          params: { parentNumber: targetOption.value }
        }).then(res => {
          targetOption.loading = false
          targetOption.children = res.result
          this.parent_number = [...this.parent_number]
        })
      }
    },
    // 修改字典类型
    handleType (val) {
      this.data.type = val
      const { setFieldsValue } = this.form
      setFieldsValue({ 'info[number]': '' })
      setFieldsValue({ 'info[name]': '' })
    },
    // 自动生成系统名称
    changeName (e) {
      if (!this.editable || this.config.action === 'add') {
        const val = e.target.value
        let valArr = val.split('\n')
        const pinyin = require('js-pinyin')
        valArr = valArr.map(item => {
          const reg = new RegExp(/^(?![0-9])[a-z0-9_]+$/)
          const reg2 = new RegExp(/^[a-z0-9_]+$/)
          var val = ''
          if (item.length < 2) {
            val = pinyin.getFullChars(item)
          } else {
            val = pinyin.getCamelChars(item)
          }
          val = val.toLowerCase()
          val = val.split('')
          this.getVal(val, reg)
          val = val.filter(item => {
            return reg2.test(item)
          })
          return val.join('')
        })
        const { setFieldsValue } = this.form
        setFieldsValue({ 'info[number]': valArr.join('\n') })
      }
    },
    // // 递归判断是否首字不是数字
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
          that.editable = false
        }
      })
    },
    // 获取数据表
    getData (val) {
      this.tableName = val
      this.fieldArr = this.fieldList[val[1]]
    },
    // 表单提交
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          if (values.table) {
            delete values.table
            if (this.tableName.length === 0) {
              this.tableName = this.data.setting.table
            }
            values.info.setting.table_name_field = [...this.tableName, ...values.info.setting.table_name_field]
            values.info.setting.table_number_field = [...this.tableName, ...values.info.setting.table_number_field]
          }
          values.info.rnumber = this.config.record.rnumber
          this.loading = true
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { action: 'submit', id: this.data.id, type: this.config.type ? 'option' : 'dict' })
          }).then((res) => {
            this.visible = false
            this.loading = false
            if (res.code === 0) {
              values.info.number = this.config.action !== 'add' ? values.info.number : res.result.number[0]
              this.$emit('ok', values)
              if (res.message) {
                this.$message.success(res.message)
              } else {
                this.$message.success('操作成功')
              }
            } else {
              this.$message.error(res.message)
            }
            this.form.resetFields()
          })
        }
      })
    }
  }
}
</script>
