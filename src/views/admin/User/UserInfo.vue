<template>
  <a-drawer
    title="个人信息"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
    :destroyOnClose="true"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="头像" v-bind="formItemLayout" help="图片尺寸为 100 X 100">
          <a-upload
            :action="`${$store.state.env.VUE_APP_API_BASE_URL}admin/attachment/upload/?uploadName=headImage`"
            name="headImage"
            listType="picture-card"
            :fileList="imageFileList"
            :before-upload="beforeUploadImage"
            @preview="handleImagePreview"
            @change="handleImageChange"
          >
            <div v-if="imageFileList.length < 1">
              <a-icon type="plus" />
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
          <a-modal :visible="imagePreviewVisible" :footer="null" @cancel="imagePreviewVisible=!imagePreviewVisible">
            <img alt="example" style="width: 100%" :src="imagePreviewUrl" />
          </a-modal>
        </a-form-item>
        <a-form-item label="用户名" v-bind="formItemLayout">
          <a-input v-decorator="['username', {initialValue: data.username}]" disabled="disabled" />
        </a-form-item>
        <a-form-item label="所属角色" v-bind="formItemLayout">
          <a-input v-decorator="['rolename', {initialValue: data.rolename}]" disabled="disabled" />
        </a-form-item>
        <a-form-item label="所属部门" v-bind="formItemLayout">
          <a-input v-decorator="['departmentname', {initialValue: data.departmentname}]" disabled="disabled" />
        </a-form-item>
        <a-form-item label="真实姓名" v-bind="formItemLayout">
          <a-input v-decorator="['info[realname]', {initialValue: data.realname, rules: [{required: true, min: 2, message: '请输入至少两个字符'}]}]" />
        </a-form-item>
        <a-form-item label="手机号码" v-bind="formItemLayout">
          <a-input v-decorator="['info[phone]', {initialValue: data.phone}]" />
        </a-form-item>
        <a-form-item label="分机号码" v-bind="formItemLayout">
          <a-input-number :min="1" v-decorator="['info[extension]', {initialValue: data.extension}]"/>
        </a-form-item>
        <a-form-item label="性别" v-bind="formItemLayout">
          <a-select v-decorator="['info[sex]', {initialValue: data.sex}]">
            <a-select-option value="是">男</a-select-option>
            <a-select-option value="否">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Email" v-bind="formItemLayout">
          <a-input v-decorator="['info[email]', {initialValue: data.email}]" />
        </a-form-item>
        <a-form-item label="新消息通知" v-bind="formItemLayout">
          <a-switch v-decorator="['info[notice]', {initialValue: data.notice == '1' ? true : false , valuePropName: 'checked'}]" />
        </a-form-item>
        <a-form-item label="备注" v-bind="formItemLayout">
          <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
        </a-form-item>
        <a-form-item label="旧密码" v-bind="formItemLayout" :validateStatus="oldWord.status" :help="oldWord.help">
          <a-input-password :visibility-toggle="true" @change="(e) => { onChange('oldWord', e) }" placeholder="如果不修改密码，此项请留空" v-decorator="['old_password', { initialValue: '' }]" />
        </a-form-item>
        <a-form-item label="新密码" v-bind="formItemLayout" :validateStatus="newWord.status" :help="newWord.help">
          <a-input-password :visibility-toggle="true" type="password" @change="(e) => { onChange('newWord', e) }" v-decorator="['new_password', { initialValue: '' }]" />
        </a-form-item>
        <a-form-item label="重复新密码" v-bind="formItemLayout" :validateStatus="repeat.status" :help="repeat.help">
          <a-input-password :visibility-toggle="true" type="password" @change="(e) => { onChange('repeat', e) }" v-decorator="['check_password', { initialValue: '' }]" />
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
import { mapActions, mapGetters } from 'vuex'
export default {
  data () {
    return {
      visible: false,
      loading: false,
      data: {},
      imageFileList: [],
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      form: this.$form.createForm(this),
      formItemLayout: {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      },
      oldWord: { status: 'success', help: '', value: '' },
      newWord: { status: 'success', help: '', value: '' },
      repeat: { status: 'success', help: '', value: '' }
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    ...mapActions(['UserInfo', 'Logout']),
    show () {
      this.visible = true
      this.loading = true
      this.UserInfo().then(res => {
        this.loading = false
        this.data = res.result
        this.imageFileList = [{
          uid: '-1',
          name: this.data.setting.headImage,
          status: 'done',
          url: this.setting.rootUrl + this.data.setting.headImage,
          response: { result: { filePath: this.data.setting.headImage } }
        }]
      })
    },
    handleImageChange ({ fileList }) {
      this.imageFileList = fileList
    },
    handleImagePreview (file) {
      this.imagePreviewUrl = file.url || file.thumbUrl
      this.imagePreviewVisible = true
    },
    // 上传图片限制
    beforeUploadImage (file, fileList) {
      return new Promise((resolve, reject) => {
        const isImage = file.type
        if (!isImage.includes('image')) {
          this.$message.error('上传的是非图片格式')
          return reject(file)
        }
        return resolve(file)
      })
    },
    // 密码验证
    onChange (type, e) {
      const value = e.target.value.match(/^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*[`~!@#$%^&*()_\-+=<>.?:"{}].*).{8,}$/)
      let flag = false
      if (value != null) {
        flag = value.indexOf(' ') !== -1
      }
      if (type === 'oldWord') {
        this.oldWord.value = value
        if (flag) {
          this.oldWord.status = 'error'
          this.oldWord.help = '密码不能包含空格，请重新输入'
        } else if (value == null) {
          this.oldWord.status = 'error'
          this.oldWord.help = '最小长度8位，且必须同时包含字母大小写，数字，特殊字符'
        } else {
          this.oldWord.status = 'success'
          this.oldWord.help = ''
        }
        if (!value) {
          this.newWord.status = 'success'
          this.newWord.help = ''
        }
      } else if (type === 'newWord') {
        this.newWord.value = value
        if (flag) {
          this.newWord.status = 'error'
          this.newWord.help = '密码不能包含空格，请重新输入'
        } else if (value == null) {
          this.newWord.status = 'error'
          this.newWord.help = '最小长度8位，且必须同时包含字母大小写，数字，特殊字符'
        } else {
          this.newWord.status = 'success'
          this.newWord.help = ''
        }
        if (!value) {
          this.repeat.status = 'success'
          this.repeat.help = ''
        }
      } else {
        this.repeat.value = value
        if (this.newWord.value && value !== this.newWord.value) {
          this.repeat.status = 'error'
          this.repeat.help = '新密码和重复新密码必须一致'
        } else {
          this.repeat.status = 'success'
          this.repeat.help = ''
        }
      }
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (this.oldWord.status === 'error' || this.newWord.status === 'error' || this.repeat.status === 'error') return
        if (this.oldWord.value && !this.newWord.value) {
          this.newWord.status = 'error'
          this.newWord.help = '请输入新密码'
        } else if (this.newWord.value && !this.repeat.value) {
          this.repeat.status = 'error'
          this.repeat.help = '新密码和重复密码必须一致'
        }
        if (!errors) {
          const headImage = this.imageFileList.length ? this.imageFileList[0].response.result.filePath : ''
          values.info.setting = { headImage: headImage }
          values.info.notice = values.info.notice ? '1' : '0'
          this.UserInfo(values).then(res => {
            if (res.code === 0) {
              this.visible = false
              if (this.newWord.value && this.oldWord.value) {
                this.$message.success('密码修改成功，请重新登录')
                this.Logout({}).then(() => {
                  setTimeout(() => {
                    window.location.reload()
                  }, 3000)
                }).catch(err => {
                  this.$message.error({
                    title: '错误',
                    description: err.message
                  })
                })
              } else {
                this.$message.success('操作成功')
              }
            } else if (res.code === 1) {
              if (res.message === '原始密码输入错误') {
                this.oldWord.status = 'error'
                this.oldWord.help = '旧密码输入错误'
              }
            }
          })
        }
      })
    }
  }
}
</script>
