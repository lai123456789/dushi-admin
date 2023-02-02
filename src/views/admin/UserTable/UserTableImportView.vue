<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="创建时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :value="data.create_time" disabled />
        </a-form-item>
        <a-form-item label="执行时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :value="data.run_time" disabled />
        </a-form-item>
        <a-form-item label="结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :value="data.end_time" disabled />
        </a-form-item>
        <a-form-item label="执行时长/s" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :value="data.duration" disabled />
        </a-form-item>
        <a-form-item label="任务状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select :value="data.status+''" disabled>
            <a-select-option value="0">未开始</a-select-option>
            <a-select-option value="1">进行中</a-select-option>
            <a-select-option value="2">已完成</a-select-option>
            <a-select-option value="3">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 4, maxRows: 20 }" :value="data.catch" disabled/>
        </a-form-item>
      </a-form>
      <div class="bbar">
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
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {}
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
      })
    }
  }
}
</script>
