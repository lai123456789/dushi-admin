<template>
  <div class="main">
    <a-form :form="form" ref="formLogin" >
      <div v-show="!invalidLogin">
        <a-form-item>
          <a-input
            size="large"
            type="text"
            placeholder="请输入用户名"
            v-decorator="[
              'username',
              {rules: [{ required: true, message: '请输入用户名' }]}
            ]"
          >
            <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            size="large"
            type="password"
            autocomplete="false"
            placeholder="请输入密码"
            v-decorator="[
              'password',
              {rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur'}
            ]"
          >
            <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-decorator="['rememberMe', { valuePropName: 'checked' } ]" style="color: white;">自动登录</a-checkbox>
        </a-form-item>
        <a-form-item style="margin-top:24px">
          <a-button
            size="large"
            style="background: #28beca; border: none; color: #ffffff"
            htmlType="submit"
            class="login-button"
            :loading="loginBtn"
            :disabled="loginBtn"
            @click="handleSubmit"
          >登录</a-button>
        </a-form-item>
      </div>
      <div v-if="invalidLogin">
        <a-form-item>
          <a-input
            size="large"
            type="password"
            autocomplete="false"
            placeholder="请输入旧密码"
            v-decorator="[
              'old_password',
              {rules: [{ required: true, message: '请输入旧密码' }], validateTrigger: 'blur'}
            ]"
          >
            <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input>
        </a-form-item>
        <a-form-item :validateStatus="passwordStatus" :help="passwordHelp">
          <a-input
            size="large"
            type="password"
            autocomplete="false"
            placeholder="请输入新密码"
            @change="changePassword"
            v-decorator="[
              'new_password',
              {rules: [{ required: true, message: '请输入新密码' }], validateTrigger: 'blur'}
            ]"
          >
            <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            size="large"
            type="password"
            autocomplete="false"
            placeholder="请输入重复密码"
            v-decorator="[
              'check_password',
              {rules: [{ required: true, message: '请输入重复密码' }], validateTrigger: 'blur'}
            ]"
          >
            <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input>
        </a-form-item>
        <a-form-item style="margin-top:24px">
          <div class="btn_box">
            <a-button
              size="large"
              style="background: #28beca; border: none; color: #ffffff"
              class="login-button"
              @click="resetPassword"
            >重置密码</a-button>
            <div class="divider"></div>
            <a-button
              size="large"
              class="login-button"
              @click="cancel"
            >退出</a-button>
          </div>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>
<script>
import md5 from 'md5'
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      loginBtn: false,
      form: this.$form.createForm(this),
      invalidLogin: false,
      passwordStatus: 'success',
      passwordHelp: ''
    }
  },
  created () {
    return this.axios({
      url: '/admin/index/init'
    }).then(res => {
      this.SetSetting(res.result.setting)
    })
  },
  methods: {
    ...mapActions(['Login', 'SetSetting']),
    // 登录
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.loginBtn = true
          const loginParams = { ...values }
          loginParams.password = md5(values.password)
          this.Login(loginParams)
            .then((res) => {
              if (res.code === 4003) {
                this.invalidLogin = true
              } else {
                this.loginSuccess(res, values.rememberMe)
              }
            })
            .catch(err => this.requestFailed(err))
            .finally(() => {
              this.loginBtn = false
            })
        }
      })
    },
    // 获取密码
    changePassword (e) {
      const value = e.target.value.match(/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*[`~!@#$%^&*()_\-+=<>.?:"{}].*).{8,}$/)
      let flag = false
      if (value != null) {
        flag = value.indexOf(' ') !== -1
      }
      if (flag) {
        this.passwordStatus = 'error'
        this.passwordHelp = '密码不能包含空格，请重新输入'
      } else if (value == null) {
        this.passwordStatus = 'error'
        this.passwordHelp = '最小长度8位，且必须同时包含字母大小写，数字，特殊字符'
      } else {
        this.passwordStatus = 'success'
        this.passwordHelp = ''
      }
    },
    // 重置密码
    resetPassword () {
      if (this.passwordStatus === 'error') {
        return
      }
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.axios({
            url: '/crm/Api/resetPass',
            data: {
              check_password: values.check_password,
              new_password: values.new_password,
              old_password: values.old_password,
              username: values.username }
          }).then((res) => {
            if (res.code === 0) {
              this.invalidLogin = false
              this.form.setFieldsValue({
                password: ''
              })
              this.$message.success('修改密码成功')
            } else {
              this.$notification.error({
                message: res.message
              })
            }
          })
        }
      })
    },
    // 取消重置密码
    cancel () {
      this.invalidLogin = false
    },
    loginSuccess (res, rememberMe) {
      if (res.code === 0) {
        localStorage.setItem('rememberMe', rememberMe)
        this.$cookies.set('Login', 'true')
        this.$router.push({ path: '/' })
      } else {
        this.requestFailed(res)
      }
    },
    requestFailed (err) {
      this.$notification['error']({
        message: '错误',
        description: err.message || '请求出现错误，请稍后再试',
        duration: 4
      })
    }
  }
}
</script>
<style lang="less" scoped>
.main {
  /deep/ .ant-form-explain{
    margin-top: 0;
  }
  .ant-form-item{
    margin-bottom: 24px;
  }

  label {
    font-size: 14px;
  }
  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
}
.btn_box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.divider {
  width: 80px;
  height: 100%;
}
</style>
