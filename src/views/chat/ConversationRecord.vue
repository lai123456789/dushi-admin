<template>
  <a-drawer
    :title="config.title"
    :width="650"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <!-- <div
          v-for="item in chatData"
          :key="item.cid"
        >
          <div v-if="(item.name !=='admin1')&&(item.name !=='系统')" style="display: flex; flex-direction: column;">
            <div style="height: 40px;" >
              <img style="width: 40px; height: 100%;" :src="item.avatar">
              <span style="padding: 10px 5px 0 0;">{{ item.name }} {{ item.datetime }}</span>
            </div>
            <div style="width: 500px; margin-left: 40px;" >
              <span v-html="item.content" style="background: #EBEBEB; border-radius: 10px;"></span>
            </div>
          </div>
          <div v-else-if="item.name !=='系统'" style="display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 10px;">
            <div style="height: 40px; display: flex; flex-direction: row-reverse; justify-content: center">
              <img style="width: 40px; height: 100%;" :src="item.avatar">
              <span style="padding: 10px 5px 0 0;">{{ item.datetime }} {{ item.name }} </span>
            </div>
            <div style="width: 500px; overflow: hidden; margin-right: 40px;text-align: right;" >
              <span v-html="item.content" style="background: #EBEBEB; border-radius: 10px;"></span>
            </div>
          </div>
          <div v-else-if="item.name =='系统'" style="display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 10px;">
            <div style="height: 40px; display: flex; flex-direction: row-reverse; justify-content: center">
              <img style="width: 40px; height: 100%;" :src="item.avatar">
              <span style="padding: 10px 5px 0 0;">{{ item.datetime }} {{ item.name }} </span>
            </div>
            <div style="width: 500px; overflow: hidden; margin-right: 40px;text-align: right;" >
              <span v-html="item.content" style="background: #EBEBEB; border-radius: 10px;"></span>
            </div>
          </div>
        </div> -->

        <div style=" overflow:auto;" ref="chat">
          <p style="text-align: center;">没有数据</p>
          <p style="text-align: center;">2020-05-20 16:34:6 您好，当前正在排队，您可以先简单描述您的问题-ok1</p>
          <div
            v-for="item in chatData"
            :key="item.cid"
          >
            <div v-if="(item.name !=='admin1')&&(item.name !=='系统')" style="display: flex; flex-direction: column;">
              <div style="height: 40px; margin-left: 10px;" >
                <img style="width: 40px; height: 100%; margin-top: 15px; border-radius: 5px;" :src="item.avatar">
                <span style="padding: 2px 5px 0 10px;">{{ item.name }} {{ item.datetime }}</span>
              </div>
              <div style="width: 500px; margin-left: 60px; margin-top: 10px;" >
                <span v-html="item.content" style="background: #EBEBEB; border-radius: 10px;"></span>
              </div>
            </div>
            <div v-else-if="item.name !=='系统'" style="display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 10px;">
              <div style="height: 40px; display: flex; flex-direction: row-reverse; justify-content: center">
                <img style="width: 40px; height: 100%; margin-right: 10px; border-radius: 5px;" :src="item.avatar">
                <span style="padding: 2px 10px 0 0;">{{ item.datetime }} {{ item.name }} </span>
              </div>
              <div style="width: 500px; overflow: hidden; margin-right: 60px;text-align: right;" >
                <span v-html="item.content" style="background: #EBEBEB; border-radius: 10px;"></span>
              </div>
            </div>
            <div v-else-if="item.name =='系统'" style="display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 10px;">
              <div style="height: 40px; display: flex; flex-direction: row-reverse; justify-content: center">
                <img style="width: 40px; height: 100%; margin-right: 10px; border-radius: 5px;" :src="item.avatar">
                <span style="padding: 2px 10px 0 0;">{{ item.datetime }} {{ item.name }} </span>
              </div>
              <div style="width: 500px; overflow: hidden; margin-right: 60px;text-align: right;" >
                <span v-html="item.content" style="background: #EBEBEB; border-radius: 10px;"></span>
              </div>
            </div>

          </div>
        </div>
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
      user: [],
      chatData: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.axios({
        url: this.config.url,
        params: { visiter_id: config.record.visiter_id, cid: config.record.cid, start_time: config.record.start_time, end_time: config.record.end_time }
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.chatData = res.result.data
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
