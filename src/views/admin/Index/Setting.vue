<template>
  <a-card>
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-tabs>
          <a-tab-pane tab="基本配置" key="1">
            <a-form-item label="系统缓存开关" :labelCol="labelCol" :wrapperCol="wrapperCol" help="当要进行系统配置调整时，请先关闭缓存，配置调整完成后，先进行缓存清理，然后开启缓存，配置调整及缓存清理建议在非工作时间使用">
              <a-space>
                <a-switch v-decorator="['info[appCache]', {initialValue: data.appCache==='1', valuePropName: 'checked'}]"/>
                <a-popconfirm
                  title="该操作可能会造成系统卡顿，建议在非工作时间使用，确认清理缓存吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="clearCache"
                >
                  <a-button type="primary" shape="round" size="small">清理缓存</a-button>
                </a-popconfirm>
              </a-space>
            </a-form-item>
            <a-form-item label="系统接口地址" :labelCol="labelCol" :wrapperCol="wrapperCol" help="系统接口地址，http或https开头">
              <a-input v-decorator="['info[rootUrl]', {initialValue: data.rootUrl}]" />
            </a-form-item>
            <a-form-item label="系统访问地址" :labelCol="labelCol" :wrapperCol="wrapperCol" help="系统访问地址">
              <a-input v-decorator="['info[webUrl]', {initialValue: data.webUrl}]" />
            </a-form-item>
            <a-form-item label="每页信息" :labelCol="labelCol" :wrapperCol="wrapperCol" help="信息列表页面每页显示的数据条数">
              <a-select v-decorator="['info[page_size]', {initialValue: data.page_size}]">
                <a-select-option v-for="index of 10" :value="index*5" :key="index">{{ index*5 }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="在线检测周期" :labelCol="labelCol" :wrapperCol="wrapperCol" help="用户在线状态检测周期">
              <a-select v-decorator="['info[refresh_time]', {initialValue: data.refresh_time}]">
                <a-select-option v-for="index of 12" :value="index*5" :key="index">{{ index*5 }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="管理员邮箱" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[admin_email]', {initialValue: data.admin_email}]" />
            </a-form-item>
            <a-form-item label="最大登录失败次数" :labelCol="labelCol" :wrapperCol="wrapperCol" help="登录系统失败的最大尝试次数">
              <a-input-number :min="1" v-decorator="['info[maxloginfailedtimes]', {initialValue: data.maxloginfailedtimes}]"/>
            </a-form-item>
            <a-form-item label="重置密码提示" :labelCol="labelCol" :wrapperCol="wrapperCol" help="在启用之后，新建的用户或用户密码被系统管理员修改过，之后用户第一次登录系统将强制要求修改密码">
              <a-switch v-decorator="['info[reset_password]', {initialValue: data.reset_password==='1', valuePropName: 'checked'}]"/>
            </a-form-item>
            <a-form-item label="登录验证码" :labelCol="labelCol" :wrapperCol="wrapperCol" help="启用后用户登录系统时将要求输入验证码">
              <a-switch v-decorator="['info[security_code]', {initialValue: data.security_code==='1', valuePropName: 'checked'}]"/>
            </a-form-item>
            <a-form-item label="记住密码" :labelCol="labelCol" :wrapperCol="wrapperCol" help="启用后登录界面将出现记住密码的选项">
              <a-switch v-decorator="['info[remember_password]', {initialValue: data.remember_password==='1', valuePropName: 'checked'}]"/>
            </a-form-item>
            <a-form-item label="WEB访问协议" :labelCol="labelCol" :wrapperCol="wrapperCol" help="默认为值http">
              <a-radio-group v-decorator="['info[request_scheme]', {initialValue: data.request_scheme}]">
                <a-radio value="auto">自动选择</a-radio>
                <a-radio value="http">HTTP</a-radio>
                <a-radio value="https">HTTPS</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="浏览器检测" :labelCol="labelCol" :wrapperCol="wrapperCol" help="兼容谷歌、360极速模式、Safari">
              <a-switch v-decorator="['info[browser_detection]', {initialValue: data.browser_detection==='1', valuePropName: 'checked'}]"/>
            </a-form-item>
            <a-form-item label="浏览器下载地址" :labelCol="labelCol" :wrapperCol="wrapperCol" help="浏览器下载地址">
              <a-input v-decorator="['info[browser_download_url]', {initialValue: data.browser_download_url}]" />
            </a-form-item>
            <a-form-item label="小号计费单价" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[small_number_price]', {initialValue: data.small_number_price}]" />
            </a-form-item>
            <a-form-item label="百度地图开放平台AK(浏览器端)" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[baidu_ak_browser]', {initialValue: data.baidu_ak_browser}]" />
            </a-form-item>
            <a-form-item label="密码定时修改时间阈值天数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[resetPasswordDay]', { initialValue: data.resetPasswordDay || 180 }]" :min="0" :step="1"/>
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="邮箱配置" key="2">
            <a-form-item label="邮件服务器" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[mail_server]', {initialValue: data.mail_server}]" />
            </a-form-item>
            <a-form-item label="邮件发送端口" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[mail_port]', {initialValue: data.mail_port}]" />
            </a-form-item>
            <a-form-item label="发件人地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[mail_from]', {initialValue: data.mail_from}]" />
            </a-form-item>
            <a-form-item label="验证用户名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[mail_user]', {initialValue: data.mail_user}]" />
            </a-form-item>
            <a-form-item label="验证密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[mail_password]', {initialValue: data.mail_password}]" />
            </a-form-item>
            <a-form-item label="POP3服务器" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[mail_receive_server]', {initialValue: data.mail_receive_server}]" />
            </a-form-item>
            <a-form-item label="POP3端口" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[mail_receive_server_port]', {initialValue: data.mail_receive_server_port}]" />
            </a-form-item>
            <a-form-item label="邮件测试" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['', {initialValue: ''}]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="接口配置" key="3">
            <a-form-item label="呼叫中心IP地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[CCIP]', {initialValue: data.CCIP}]" />
            </a-form-item>
            <a-form-item label="呼叫中心端口号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[CCPort]', {initialValue: data.CCPort}]" />
            </a-form-item>
            <a-form-item label="接口用户名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[AMIUser]', {initialValue: data.AMIUser}]" />
            </a-form-item>
            <a-form-item label="接口密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[AMIPassword]', {initialValue: data.AMIPassword}]" />
            </a-form-item>
            <a-form-item label="本地区号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[area_code]', {initialValue: data.area_code}]" />
            </a-form-item>
            <a-form-item label="接口地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[interfaceurl]', {initialValue: data.interfaceurl}]" />
            </a-form-item>
            <a-form-item label="弹屏地址" :labelCol="labelCol" :wrapperCol="wrapperCol" help="该弹屏地址仅针对于当前坐席系统有效">
              <a-input v-decorator="['info[popurl]', {initialValue: data.popurl}]" />
            </a-form-item>
            <a-form-item label="弹屏设置" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group v-decorator="['info[popmethod]', {initialValue: data.popmethod}]">
                <a-radio value="">禁用弹屏</a-radio>
                <a-radio value="Dialin">呼入弹屏</a-radio>
                <a-radio value="Dialout">呼出弹屏</a-radio>
                <a-radio value="All">呼入呼出弹屏</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="弹屏时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group v-decorator="['info[poptime]', {initialValue: data.poptime}]">
                <a-radio value="Ring">振铃时弹屏</a-radio>
                <a-radio value="Link">接通时弹屏</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="redis配置" key="4">
            <a-form-item label="服务器IP" :labelCol="labelCol" :wrapperCol="wrapperCol" help="redis服务器IP地址，默认为127.0.0.1">
              <a-input v-decorator="['info[redishost]', {initialValue: data.redishost}]" />
            </a-form-item>
            <a-form-item label="端口" :labelCol="labelCol" :wrapperCol="wrapperCol" help="redis端口，默认为6379">
              <a-input-number v-decorator="['info[redisport]', {initialValue: data.redisport}]" />
            </a-form-item>
            <a-form-item label="密码" :labelCol="labelCol" :wrapperCol="wrapperCol" help="redis登录密码">
              <a-input v-decorator="['info[redispass]', {initialValue: data.redispass}]" />
            </a-form-item>
            <a-form-item label="websocket地址" :labelCol="labelCol" :wrapperCol="wrapperCol" help="websocket地址，默认留空">
              <a-input v-decorator="['info[websocketaddress]', {initialValue: data.websocketaddress}]" />
            </a-form-item>
            <a-form-item label="websocket端口" :labelCol="labelCol" :wrapperCol="wrapperCol" help="websocket端口，默认为7379">
              <a-input-number v-decorator="['info[websocketport]', {initialValue: data.websocketport}]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="支付配置" key="5">
            <a-form-item label="Adapay平台App_ID" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[adapay_app_id]', {initialValue: data.adapay_app_id}]" />
            </a-form-item>
            <a-form-item label="api_key_live" :labelCol="labelCol" :wrapperCol="wrapperCol" help="从配置文件merchantConfig.json获取">
              <a-input v-decorator="['info[api_key_live]', {initialValue: data.api_key_live}]" />
            </a-form-item>
            <a-form-item label="api_key_test" :labelCol="labelCol" :wrapperCol="wrapperCol" help="从配置文件merchantConfig.json获取">
              <a-input v-decorator="['info[api_key_test]', {initialValue: data.api_key_test}]" />
            </a-form-item>
            <a-form-item label="rsa_public_key" :labelCol="labelCol" :wrapperCol="wrapperCol" help="从配置文件merchantConfig.json获取">
              <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[rsa_public_key]', {initialValue: data.rsa_public_key}]" />
            </a-form-item>
            <a-form-item label="rsa_private_key" :labelCol="labelCol" :wrapperCol="wrapperCol" help="从配置文件merchantConfig.json获取">
              <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[rsa_private_key]', {initialValue: data.rsa_private_key}]" />
            </a-form-item>
            <a-form-item label="手续费率" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number :min="0" v-decorator="['info[adapay_poundage]', {initialValue: data.adapay_poundage}]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="Worker服务配置" key="6">
            <a-form-item label="websocket" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[worker_websocket]', {initialValue: data.worker_websocket}]" />
            </a-form-item>
            <a-form-item label="heartbeatTime" :labelCol="labelCol" :wrapperCol="wrapperCol" help="心跳时间间隔，单位为秒">
              <a-input-number :min="0" v-decorator="['info[worker_heartbeatTime]', {initialValue: data.worker_heartbeatTime}]" />
            </a-form-item>
            <a-form-item label="sslpem" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[worker_sslpem]', {initialValue: data.worker_sslpem}]" />
            </a-form-item>
            <a-form-item label="sslkey" :labelCol="labelCol" :wrapperCol="wrapperCol" help="如果设置了sslpem、sslkey，则使用wss模式">
              <a-input v-decorator="['info[worker_sslkey]', {initialValue: data.worker_sslkey}]" />
            </a-form-item>
            <a-form-item label="tcp" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[worker_tcp]', {initialValue: data.worker_tcp}]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="消息提醒配置" key="7">
            <a-form-item label="websocket" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[remind_websocket]', {initialValue: data.remind_websocket}]" />
            </a-form-item>
            <a-form-item label="tcp" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[remind_tcp]', {initialValue: data.remind_tcp}]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="版权信息" key="8">
            <a-form-item label="系统标题" :labelCol="labelCol" :wrapperCol="wrapperCol" help="浏览器的标题">
              <a-input v-decorator="['info[title]', {initialValue: data.title}]" />
            </a-form-item>
            <a-form-item label="版权信息" :labelCol="labelCol" :wrapperCol="wrapperCol" help="系统登录界面底部版权信息">
              <a-input v-decorator="['info[copyright]', {initialValue: data.copyright}]" />
            </a-form-item>
            <a-form-item label="系统名称" :labelCol="labelCol" :wrapperCol="wrapperCol" help="系统框架左上角显示的名称">
              <a-input v-decorator="['info[name]]', {initialValue: data.name}]" />
            </a-form-item>
            <a-form-item label="系统LOGO" :labelCol="labelCol" :wrapperCol="wrapperCol" help="图片尺寸为 32 X 32，图片格式为.png">
              <a-upload
                name="logo"
                listType="picture-card"
                class="logo-uploader"
                :showUploadList="false"
                :action="`${$store.state.env.VUE_APP_API_BASE_URL}admin/index/uploadLogo`"
                :beforeUpload="beforeUpload"
                @change="handleChange"
              >
                <img :src="data.logoUrl" style="width: 32px; height: 32px;" />
              </a-upload>
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="移动端" key="9">
            <a-form-item label="移动端版本号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[versionApp]', {initialValue: data.versionApp}]" />
            </a-form-item>
            <a-form-item label="强制绑定微信" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-switch v-decorator="['info[binding_wechat]', { initialValue: data.binding_wechat === '1', valuePropName: 'checked' }]" />
            </a-form-item>
            <a-form-item label="强制人脸识别" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-switch v-decorator="['info[face_recognition]', { initialValue: data.face_recognition === '1', valuePropName: 'checked' }]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="搜索配置" key="10">
            <a-form-item label="流程搜索" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[esCaseUrl]', {initialValue: data.esCaseUrl}]" />
            </a-form-item>
            <a-form-item label="用户密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['info[esCasePwd]', {initialValue: data.esCasePwd}]" />
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="满意度折扣维护" key="11">
            <a-form-item label="满意" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[satisfied]', { initialValue: data.satisfied || 100 }]" :min="0" :max="100" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"/>
            </a-form-item>
            <a-form-item label="一般" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[general]', { initialValue: data.general || 80 }]" :min="0" :max="100" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"/>
            </a-form-item>
            <a-form-item label="不满意" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[unsatisfied]', { initialValue: data.unsatisfied || 60 }]" :min="0" :max="100" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"/>
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="主修辅修分配比例" key="12">
            <a-form-item label="主修" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[majorRepair]', { initialValue: data.majorRepair || 1.2 }]" :min="0" :step="0.1"/>
            </a-form-item>
            <a-form-item label="辅修" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['info[auxiliaryRepair]', { initialValue: data.auxiliaryRepair || 1 }]" :min="0" :step="0.1"/>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
        <a-form-item :wrapperCol="{ span: 12 }" style="text-align: center" >
          <a-button htmlType="submit" type="primary" @click="handleSubmit">保存</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-card>
</template>
<script>
function getBase64 (img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
export default {
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      labelCol: { span: 4 },
      wrapperCol: { span: 8 }
    }
  },
  created () {
    this.loading = true
    this.axios({
      url: '/admin/index/setting'
    }).then((res) => {
      this.loading = false
      this.data = res.result
    })
  },
  methods: {
    handleChange (info) {
      if (info.file.status === 'done') {
        // Get this url from response in real world.
        getBase64(info.file.originFileObj, imageUrl => {
          this.data.logoUrl = imageUrl
        })
      }
    },
    beforeUpload (file) {
      const isJPG = file.type === 'image/png'
      if (!isJPG) {
        this.$message.error('只能上传png格式的图片!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片必须小于2MB!')
      }
      return isJPG && isLt2M
    },
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          this.axios({
            url: '/admin/index/setting',
            data: values
          }).then((res) => {
            this.loading = false
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
            }
          })
        }
      })
    },
    clearCache () {
      this.loading = true
      this.axios({
        url: '/admin/index/clearCache'
      }).then((res) => {
        this.loading = false
        if (res.message) {
          this.$message.warning(res.message)
        } else {
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>
<style scoped>
.logo-uploader >>> .ant-upload.ant-upload-select-picture-card {
  width: 48px;
  height: 48px;
}
</style>
