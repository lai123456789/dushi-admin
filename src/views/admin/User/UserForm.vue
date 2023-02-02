<template>
  <a-drawer
    :title="config.title"
    :width="600"
    :visible="visible"
    :destroyOnClose="true"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="头像" :labelCol="labelCol" :wrapperCol="wrapperCol" help="图片尺寸为 100 X 100">
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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">
            用户名
            <a-tooltip v-if="config.action === 'add'" title="用户名只能包含中文 、数字、大小写英文字母，英文横线 -、下划线 _0">
              <a-icon type="question-circle"/>
            </a-tooltip>
          </span>
          <a-input v-decorator="['info[username]', {initialValue: data.username, rules: [{ required: true, message: '请输入用户名'} , { validator: checkName}]}]" :disabled="config.action==='edit'" />
        </a-form-item>
        <a-form-item label="真实姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[realname]', {initialValue: data.realname, rules: [{ required: true, message: '请输入真实姓名'}]}]" />
        </a-form-item>
        <a-form-item label="密码" :labelCol="labelCol" :wrapperCol="wrapperCol" :validateStatus="passwordStatus" :help="passwordHelp">
          <a-input-password
            @change="changePassword"
            :visibility-toggle="true"
            v-decorator="['password']"
          />
        </a-form-item>
        <a-form-item label="所属角色" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select placeholder="请选择角色" showSearch option-filter-prop="children" v-decorator="[ 'info[roleid]', {rules: [{ required: true, message: '请选择角色'}], initialValue: data.roleid} ]" >
            <a-select-option v-for="(value, key) in role" :key="key" :value="key">{{ value }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            showSearch
            v-decorator="['info[departmentid]', {initialValue: data.departmentid, rules: [{ required: true, message: '请选择部门'}]}]"
            placeholder="请输入部门关键字进行搜素"
            allowClear
            :filter-option="false"
            :not-found-content="fetching ? undefined : null"
            @search="getDepartment"
            @popupScroll="popupScroll"
            @change="(e)=>{if(!e){department = []}}"
          >
            <a-spin v-if="fetching" slot="notFoundContent" size="small" />
            <a-select-option :value="dep.departmentid" v-for="dep in department" :key="dep.departmentid">{{ dep.full_name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属分公司" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[company]', {initialValue: data.company}]">
            <a-select-option value="dbfgs">东部分公司</a-select-option>
            <a-select-option value="xnfgs">西南分公司</a-select-option>
            <a-select-option value="zqfgs">长庆分公司</a-select-option>
            <a-select-option value="xjfgs">新疆分公司</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[status]', {initialValue: data.status+''}]">
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="部门负责人" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[isleader]', {initialValue: data.isleader+''}]">
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="性别" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="['info[sex]', {initialValue: data.sex}]">
            <a-select-option value="男">男</a-select-option>
            <a-select-option value="女">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[phone]', {initialValue: data.phone}]" />
        </a-form-item>
        <a-form-item label="分机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number :min="1" v-decorator="['info[extension]', {initialValue: data.extension}]"/>
        </a-form-item>
        <a-form-item label="观察者" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[observer]', {initialValue: data.observer}]" />
        </a-form-item>
        <a-form-item label="Email" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[email]', {initialValue: data.email}]" />
        </a-form-item>
        <a-form-item label="新消息通知" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-switch v-decorator="['info[notice]', {initialValue: data.notice == '1' ? true : false , valuePropName: 'checked'}]"/>
        </a-form-item>
        <a-form-item label="访问范围" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button size="small" @click="handlePriv">
            <a-badge v-if="privFlag" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
      <priv-range ref="privRange" @ok="getPriv" :key="privKey" :setting="priv"/>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
export default {
  components: { PrivRange: () => import('../PrivRange/PrivRange') },
  data () {
    this.getDepartment = debounce(this.getDepartment, 800)
    return {
      config: {},
      lastFetchId: 0,
      imageFileList: [],
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      fetching: false,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      scrollStats: true,
      searchData: '',
      data: {},
      form: this.$form.createForm(this),
      passwordStatus: 'success',
      passwordHelp: '',
      role: [],
      department: [],
      privKey: 'privKey',
      priv: {},
      privFlag: false,
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      }
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.department = []
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.data = res.result.data
        if (res.result.priv && res.result.priv.length !== 0) {
          this.priv = res.result.priv
        } else {
          this.priv = {}
        }
        if (this.priv) {
          this.privFlag = Object.keys(this.priv).length !== 0
        } else {
          this.privFlag = false
        }
        this.role = res.result.option.role
        if (this.data.setting.headImage) {
          this.imageFileList = [{
            uid: '-1',
            name: this.data.setting.headImage,
            status: 'done',
            url: this.setting.rootUrl + this.data.setting.headImage,
            response: { result: { filePath: this.data.setting.headImage } }
          }]
        }
        if (config.action === 'edit') {
          const obj = {
            full_name: res.result.data.department_full_name,
            departmentid: res.result.data.departmentid
          }
          this.department.push(obj)
        }
      })
    },
    getDepartment (e) {
      this.searchData = e
      this.page.pageNo = 1
      this.scrollStats = true
      if (e) {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.fetching = true
        this.axios({
          url: 'admin/Api/departmentSearch',
          params: Object.assign(this.page, { name: e })
        }).then(res => {
          if (fetchId !== this.lastFetchId) {
            return
          }
          this.department = res.result.data
          this.fetching = false
        })
      } else {
        this.department = []
      }
    },
    getDepartmentScroll () {
      this.axios({
        url: 'admin/Api/departmentSearch',
        params: Object.assign(this.page, { name: this.searchData })
      }).then(res => {
        if (!res.result.data.length) {
          this.scrollStats = false
        }
        this.department = [...this.department, ...res.result.data]
      })
    },
    popupScroll (e) {
      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight
      const clientHeight = e.target.clientHeight
      const scrollBottom = scrollHeight - clientHeight - scrollTop
      if (scrollBottom < 1 && this.scrollStats && this.searchData) {
        this.page.pageNo++
        this.getDepartmentScroll()
      }
    },
    checkName (rule, value, callback) {
      const string = '用户名只能包含中文 、数字、大小写英文字母，英文横线 -、下划线 _'
      const reg = /[a-zA-Z0-9_\u4e00-\u9fa5-]$/
      if (!reg.test(value)) {
        callback(string)
      }
      callback()
    },
    // 打开访问范围
    handlePriv () {
      this.privKey = this.privKey === 'privKey' ? 'privKey_1' : 'privKey'
      this.$nextTick(() => {
        this.$refs.privRange.show({
          page: 'user'
        })
      })
    },
    // 获取访问范围
    getPriv (val) {
      this.priv = val
      this.privFlag = Object.keys(this.priv).length !== 0
    },
    handleImageChange ({ fileList }) {
      this.imageFileList = fileList
    },
    handleImagePreview (file) {
      this.imagePreviewUrl = file.url || file.thumbUrl
      this.imagePreviewVisible = true
    },
    // 获取密码
    changePassword (e) {
      if (!e.target.value) {
        this.passwordStatus = 'success'
        this.passwordHelp = ''
        return
      }
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
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (this.passwordStatus === 'error') {
          return
        }
        if (this.config.action === 'add' && !values.password) {
          this.passwordStatus = 'error'
          this.passwordHelp = '请输入密码'
          return
        }
        if (!errors) {
          this.loading = true
          const headImage = this.imageFileList.length ? this.imageFileList[0].response.result.filePath : ''
          values.info.setting = { headImage: headImage }
          values.info.priv = this.priv
          values.info.notice = values.info.notice ? '1' : '0'
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { id: this.data.id })
          }).then((res) => {
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.visible = false
              this.$message.success('操作成功')
            }
          })
        }
      })
    }
  }
}
</script>
