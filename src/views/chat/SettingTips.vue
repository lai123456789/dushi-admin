<template>
  <div>
    <a-tabs v-model="activeKey">
      <a-tab-pane v-for="(item) in activeData" :key="item.value" :tab="item.display"></a-tab-pane>
    </a-tabs>
    <a-form :form="form" @submit="handleSubmit">
      <div v-for="(item) in activeData" :key="item.value" v-show="item.value == activeKey">
        <a-divider orientation="left" class="divider">
          人工接入提示
        </a-divider>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">人工服务欢迎语</span>
          <a-textarea :autoSize="{ minRows: 4 }" placeholder="您好，很高兴为您服务！" v-decorator="['info[' + item.value + 'HumanWelcome' + ']', {initialValue: parent.setting[item.value + 'HumanWelcome']}]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">人工接入提示</span>
          <a-input v-decorator="['info[' + item.value + 'HumanJoinTips' + ']', {initialValue: parent.setting[item.value + 'HumanJoinTips']}]" readyonly/>
        </a-form-item>
        <a-divider orientation="left" class="divider">
          会话结束提示
        </a-divider>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">访客离开</span>
          <a-input v-decorator="['info[' + item.value + 'VisiterLeaveTips' + ']', {initialValue: parent.setting[item.value + 'VisiterLeaveTips']}]" readyonly/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">会话超时</span>
          <a-input v-decorator="['info[' + item.value + 'ConversationTimeoutTips' + ']', {initialValue: parent.setting[item.value + 'ConversationTimeoutTips']}]" readyonly/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">客服离线</span>
          <a-input v-decorator="['info[' + item.value + 'ServiceOfflineTips' + ']', {initialValue: parent.setting[item.value + 'ServiceOfflineTips']}]" readyonly/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">客服手动结束</span>
          <a-input v-decorator="['info[' + item.value + 'ServiceCloseConversationTips' + ']', {initialValue: parent.setting[item.value + 'ServiceCloseConversationTips']}]" readyonly/>
        </a-form-item>
        <a-divider orientation="left" class="divider">
          排队提示
        </a-divider>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">排队提示消息</span>
          <a-input v-decorator="['info[' + item.value + 'QueueWaitTips' + ']', {initialValue: parent.setting[item.value + 'QueueWaitTips']}]" readyonly/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">排队中转机器人</span>
          <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[' + item.value + 'TransRobotTips' + ']', {initialValue: parent.setting[item.value + 'TransRobotTips'] === '1', valuePropName: 'checked'}]"/>&nbsp;
          开启后，访客在排队中可以根据提示转接到机器人服务（不向访客发送机器人欢迎语和常见问题)
        </a-form-item>
        <a-divider orientation="left" class="divider">
          黑名单提示
        </a-divider>
        <a-form-item :labelCol="labelCol" :wrapperCol="inputWrapperCol">
          <span slot="label">黑名单提示语</span>
          <a-input v-decorator="['info[' + item.value + 'BlacklistTips' + ']', {initialValue: parent.setting[item.value + 'BlacklistTips']}]" readyonly/>
        </a-form-item>
      </div>
      <a-button type="primary" @click="handleSubmit">保存</a-button>
    </a-form>
  </div>
</template>
<script>
export default {
  data () {
    return {
      activeKey: 'web',
      activeData: [{
        display: 'WEB端',
        value: 'web'
      }, {
        display: '微信',
        value: 'wx'
      }, {
        display: '微博',
        value: 'wb'
      }, {
        display: '微信小程序',
        value: 'xcx'
      }, {
        display: '企业微信',
        value: 'qy'
      }],
      labelCol: { span: 3 },
      wrapperCol: { span: 15 },
      inputWrapperCol: { span: 8 },
      form: this.$form.createForm(this)
    }
  },
  props: {
    parent: {
      type: Object,
      default () {
        return {}
      },
      required: true
    }
  },
  methods: {
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.parent.handleSubmit(values)
        }
      })
    }
  }
}
</script>
