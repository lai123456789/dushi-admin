<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="用户名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select showSearch :filterOption="filterOption" placeholder="请选择用户" v-decorator="['info[user_name]',{initialValue: data.user_name}]">
            <a-select-option v-for="(value, key) in user" :key="key" :value="value.username">{{ value.username }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="昵称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[nick_name]]', {initialValue: data.nick_name, rules: [{ required: true, message: '请输入昵称'}]}]" />
        </a-form-item>
        <a-form-item label="所属分组" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择所属分组" v-decorator="[ 'info[groupid]', {rules: [{ required: true, message: '请选择所属分组'}], initialValue: data.groupid} ]" >
            <a-select-option v-for="(value, key) in group" :key="key" :value="key">{{ value }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="接入上限" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number :min="0" v-decorator="['info[connect_limit]', {initialValue: data.connect_limit}]"/>
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
      data: {},
      form: this.$form.createForm(this),
      group: [],
      user: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: Object.assign({ service_id: config.record ? config.record.service_id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
        this.group = res.result.option.group
        this.user = res.result.option.user
      })
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { service_id: this.data.service_id })
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
