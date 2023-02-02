<template>
  <div>
    <a-form :form="form" @submit="handleSubmit">
      <a-divider orientation="left" class="divider">
        重复咨询设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">重复咨询识别</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[reconsult]', {initialValue: parent.setting.reconsult === '1', valuePropName: 'checked'}]"/>
        开启后，系统会对设定时间范围内多次咨询人工客服的访客进行标记
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">重复咨询时间范围</span>
        <a-input-number :min="0" style="width: 80px" v-decorator="['info[reconsultTime]', {initialValue: parent.setting.reconsultTime}]"/>&nbsp;小时
      </a-form-item>
      <a-divider orientation="left" class="divider">
        人工服务时间设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">人工服务时间</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[worktimeMode]', {initialValue: parent.setting.worktimeMode === '1', valuePropName: 'checked'}]"/>
        如果关闭，则表示人工24小时提供服务，分组没有设置工作时间的时候也是24小时提供服务
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="{ span: 10 }">
        <span slot="label">无人工服务提示语</span>
        <a-textarea placeholder="现在是下班时间" :autoSize="{ minRows: 4 }" v-decorator="['info[humanUnworkTips]', {initialValue: parent.setting.humanUnworkTips}]" />
      </a-form-item>
      <a-divider orientation="left" class="divider">
        会话基础设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">会话转接确认</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[conversationTransferConfirm]', {initialValue: parent.setting.conversationTransferConfirm === '1', valuePropName: 'checked'}]"/>
        开启后，被转接客服将收到转接请求确认
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">会话结束二次确认</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[conversationCloseConfirm]', {initialValue: parent.setting.conversationCloseConfirm === '1', valuePropName: 'checked'}]"/>
        开启后，客服手动结束会话需要二次确认
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">访客正在输入信息查看</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[visiterInputing]', {initialValue: parent.setting.visiterInputing === '1', valuePropName: 'checked'}]"/>
        开启后，客服可以预先查看访客正在输入的内容（仅支持网页、App）
      </a-form-item>
      <a-divider orientation="left" class="divider">
        人工结束会话
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">人工结束会话</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[endSessionManually]', {initialValue: parent.setting.endSessionManually === '1', valuePropName: 'checked'}]"/>
        开启后会话需要人工结束，关闭后客服离线时自动结束
      </a-form-item>
      <a-divider orientation="left" class="divider">
        会话超时设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">会话超时设置</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[conversationTimeoutClose]', {initialValue: parent.setting.conversationTimeoutClose === '1', valuePropName: 'checked'}]"/>
        开启后，在设置的时间内没有新消息产生，系统将自动关闭会话，关闭前一分钟，系统会发送会话即将关闭提示
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">会话超时时间</span>
        <a-input-number :min="1" style="width: 80px" :parser="value => value.replace(/^(0+)|[^\d]+/g,'')" v-decorator="['info[conversationTimeoutTime]', {initialValue: parent.setting.conversationTimeoutTime}]"/>&nbsp;分钟
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">是否提示访客</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[conversationTimeoutRemindService]', {initialValue: parent.setting.conversationTimeoutRemindService === '1', valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="{ span:10 }">
        <span slot="label">超时提示消息</span>
        <a-input type="text" v-decorator="['info[conversationTimeoutRemindTips]', {initialValue: parent.setting.conversationTimeoutRemindTips}]" readyonly/>
      </a-form-item>
      <a-divider orientation="left" class="divider">
        沉默访客未响设置
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">自动关闭设置</span>
        <a-switch checked-children="开" un-checked-children="关" v-decorator="['info[conversationAutoClose]', {initialValue: parent.setting.conversationAutoClose === '1', valuePropName: 'checked'}]"/>
        开启后，在设置的时间内访客进入会话后没有发送消息，系统在发送提示语后立即关闭会话
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
        <span slot="label">自动关闭时间</span>
        <a-input-number :min="1" style="width: 80px" v-decorator="['info[conversationAutoCloseTime]', {initialValue: parent.setting.conversationAutoCloseTime}]" :parser="value => value.replace(/^(0+)|[^\d]+/g,'')"/>&nbsp;分钟
      </a-form-item>
      <a-divider orientation="left" class="divider">
        微信接入路由
      </a-divider>
      <a-form-item :labelCol="labelCol" :wrapperCol="{ span:2 }">
        <span slot="label">客户分组</span>
        <a-select v-decorator="['info[weixinRoute]', { initialValue: parent.setting.weixinRoute }]">
          <a-select-option v-for="(item, index) in parent.groupList" :key="index" :value="item.value">
            {{ item.display }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-button type="primary" @click="handleSubmit">保存</a-button>
    </a-form>
  </div>
</template>
<script>
export default {
  props: {
    parent: {
      type: Object,
      default () {
        return {}
      },
      required: true
    }
  },
  data () {
    return {
      labelCol: { span: 3, offset: -1 },
      wrapperCol: { span: 15 },
      form: this.$form.createForm(this)
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
