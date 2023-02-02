<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="上级菜单" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-cascader v-decorator="['info[parentid]', {initialValue: data.parentid}]" placeholder="作为一级菜单" :options="options" changeOnSelect/>
        </a-form-item>
        <a-form-item label="菜单名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请输入菜单名称'}], initialValue: data.name}]" />
        </a-form-item>
        <a-form-item label="模块" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[module]', {rules: [{required: true, message: '请输入模块名'}], initialValue: data.module}]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            视图
            <a-tooltip title="填写视图的页面路径，如果是目录菜单此处留空，如果是空白页请点击后面的'空白页'按钮'">
              <a-icon type="question-circle"/>
            </a-tooltip>
          </span>
          <a-row type="flex" >
            <a-col flex="auto"> <a-input v-decorator="['info[view]', {initialValue: data.view}]" /></a-col>
            <a-col ><a-button @click="getBlank">空白页</a-button></a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="附加参数" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[param]', {initialValue: data.param}]" />
        </a-form-item>
        <a-form-item label="菜单图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :value="iconObj.type" disabled>
            <a-icon @click="handleMenuIcon" slot="addonAfter" :type="iconObj.type ? iconObj.type : 'up'" :theme="iconObj.theme"/>
          </a-input>
        </a-form-item>
        <a-form-item label="是否启用" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[enabled]', {initialValue: data.enabled+''}]">
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否显示" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[display]', {initialValue: data.display+''}]">
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="功能权限" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 4, maxRows: 6 }" v-decorator="['info[priv]', {initialValue: data.priv}]" />
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 4, maxRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <menu-icon :key="refreshKey" @ok="getIcon" ref="menuIcon"></menu-icon>
  </a-drawer>
</template>
<script>
export default {
  components: {
    MenuIcon: () => import('./MenuIcon')
  },
  data () {
    return {
      config: {},
      refreshKey: true,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      options: [],
      data: {},
      iconObj: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
        this.iconObj.type = this.data.icon
        this.options = res.result.options
        if (this.config.action === 'add') {
          const parentid = []
          this.$parent.$parent.breadcrumb.forEach(element => {
            parentid.push(element.menuid)
          })
          this.data.parentid = parentid
        }
      })
    },
    // 显示图标库
    handleMenuIcon () {
      this.refreshKey = !this.refreshKey
      this.$nextTick(() => {
        this.$refs.menuIcon.show()
      })
    },
    // 获取图标
    getIcon (value) {
      this.iconObj = value
    },
    // 添加空白页
    getBlank () {
      const obj = {
        'info[module]': 'admin',
        'info[view]': 'Common/Blank'
      }
      this.form.setFieldsValue(obj)
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.info.icon = this.iconObj.type
          this.axios({
            url: this.config.submitUrl || this.config.url,
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.visible = false
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.form.resetFields()
            }
          })
        }
      })
    }
  }
}
</script>
