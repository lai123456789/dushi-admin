<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="上级部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            showSearch
            v-decorator="['info[parentid]', {initialValue: data.parentid}]"
            placeholder="作为一级部门"
            allowClear
            :filter-option="false"
            :not-found-content="fetching ? undefined : null"
            @search="getDepartment"
            @popupScroll="popupScroll"
            @change="(e)=>{if(!e){departmentData = []}}"
          >
            <a-spin v-if="fetching" slot="notFoundContent" size="small" />
            <a-select-option :value="dep.departmentid" v-for="dep in departmentData" :key="dep.departmentid">{{ dep.full_name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="部门名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['info[name]', {rules: [{required: true, message: '请输入部门名称'}], initialValue: data.name}]" />
        </a-form-item>
        <a-form-item label="访问范围" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button size="small" @click="handlePriv">
            <a-badge v-if="privFlag" status="success" text="设置" />
            <a-badge v-else status="default" text="设置" />
          </a-button>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks}]" />
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
import debounce from 'lodash/debounce'
export default {
  components: { PrivRange: () => import('../PrivRange/PrivRange') },
  data () {
    this.getDepartment = debounce(this.getDepartment, 800)
    return {
      config: {},
      options: [],
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      lastFetchId: 0,
      departmentData: [],
      fetching: false,
      scrollStats: true,
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      searchData: '',
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      data: {},
      privKey: 'privKey',
      priv: {},
      privFlag: false
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.departmentData = []
      this.data = {}
      this.axios({
        url: this.config.url,
        params: Object.assign({ id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.data = res.result.data
        this.priv = this.data.priv ? JSON.parse(this.data.priv) : {}
        if (this.priv) {
          this.privFlag = Object.keys(this.priv).length !== 0
        } else {
          this.privFlag = false
        }
        this.options = res.result.options
        if (this.$parent.$parent.breadcrumb.length > 0 && this.$parent.$parent.breadcrumb[this.$parent.$parent.breadcrumb.length - 1].rdepartmentid) {
          this.data.rdepartmentid = this.$parent.$parent.breadcrumb[this.$parent.$parent.breadcrumb.length - 1].rdepartmentid
        }
        if (this.config.action === 'add' && this.$parent.$parent.breadcrumb.length > 0) {
          this.data.parentid = this.$parent.$parent.breadcrumb[this.$parent.$parent.breadcrumb.length - 1].departmentid
          const obj = {
            departmentid: this.data.parentid,
            full_name: this.$parent.$parent.breadcrumb[this.$parent.$parent.breadcrumb.length - 1].full_name
          }
          this.departmentData.push(obj)
        }
        if (this.config.action === 'edit') {
          const obj = {
            departmentid: this.data.parentid,
            full_name: this.$parent.$parent.breadcrumb[this.$parent.$parent.breadcrumb.length - 1].full_name
          }
          this.departmentData.push(obj)
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
          params: Object.assign(this.page, { name: e, exclude: this.data.departmentid })
        }).then(res => {
          if (fetchId !== this.lastFetchId) {
            return
          }
          this.departmentData = res.result.data
          this.fetching = false
        })
      } else {
        this.departmentData = []
      }
    },
    getDepartmentScroll () {
      this.axios({
        url: 'admin/Api/departmentSearch',
        params: Object.assign(this.page, { name: this.searchData, exclude: this.data.departmentid })
      }).then(res => {
        if (!res.result.data.length) {
          this.scrollStats = false
        }
        this.departmentData = [...this.departmentData, ...res.result.data]
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
    // 打开访问范围
    handlePriv () {
      this.privKey = this.privKey === 'privKey' ? 'privKey_1' : 'privKey'
      this.$nextTick(() => {
        this.$refs.privRange.show({
          page: 'depart'
        })
      })
    },
    // 获取访问范围
    getPriv (val) {
      this.priv = val
      this.privFlag = Object.keys(this.priv).length !== 0
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values.info.priv = Object.keys(this.priv).length > 0 ? this.priv : {
            departLead: ['own', 'depart'],
            departUser: ['own'],
            list: []
          }
          if (this.data.rdepartmentid) {
            values.info.rdepartmentid = this.data.rdepartmentid
          }
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
