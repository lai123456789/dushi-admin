<template>
  <a-drawer
    :title="config.title"
    :width="1200"
    :destroyOnClose="true"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-row :gutter="12" type="flex" align="middle">
          <a-col :span="12">
            <a-form-item label="标题" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-input
                placeholder="请输入标题"
                v-decorator="['info[title]', {initialValue: article.title, rules: [{ required: true, message: '请输入标题'}]}]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="必读用户" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-button
                @click="handleUser"
                size="small"
                style="margin-right: 10px;"
              >选择</a-button>你已选择 {{ userLength ? userLength : 0 }} 人
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-cascader
                :options="options"
                change-on-select
                :fieldNames="fieldNames"
                placeholder="请选择分类"
                v-decorator="['info[parentid]', { initialValue: parentidArr, rules: [{ required: true, message: '请选择分类'}]}]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <span slot="label">标签</span>
              <a-select
                show-search
                mode="tags"
                placeholder="请输入标签,多个标签以英文逗号分开"
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                @search="handleSearch"
                v-decorator="['info[label]', { initialValue: label }]"
              >
                <a-select-option v-for="(item, index) in data" :key="index" :value="item.label">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="product.length > 0">
            <a-form-item label="适配产品" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-button @click="openProduct">
                <a-badge :status="adaptive_product.length > 0 ? 'success' : 'default'" />
                选择
              </a-button>
              <a-input v-show="false" v-decorator="['adaptive_product', { initialValue: adaptive_product.toString() }]"/>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="ad_user.length > 0">
            <a-form-item label="适配用户" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-select
                show-search
                mode="multiple"
                v-decorator="['info[adaptive_user]', { initialValue: adaptive_user, rules: [{ required: true, message: '请选择适配用户'}] }]"
              >
                <a-select-option v-for="(item, index) in ad_user" :key="index" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="生效时间" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-date-picker
                v-if="config.action === 'edit'"
                :placeholder="startTime ? '' : '请选择日期'"
                format="YYYY-MM-DD HH:mm:ss"
                :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }"
                style="width: 50%"
                :disabled="startTime"
                :disabledDate="disabledDate"
                v-decorator="['info[effect_start_time]',
                              {initialValue: Number(article.effect_type) !== 1 ? moment(article.effect_start_time) : null,
                               rules: [{ required: !startTime, message: '请选择生效时间'}]}]" />
              <a-date-picker
                v-else
                format="YYYY-MM-DD HH:mm:ss"
                :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }"
                style="width: 50%"
                :disabled="startTime"
                :disabledDate="disabledDate"
                v-decorator="['info[effect_start_time]',
                              { rules: [{ required: !startTime, message: '请选择生效时间'}]}]" />
              <a-checkbox
                style="margin-left: 10px;"
                @change="(e) => { startTime = e.target.checked;
                                  form.setFieldsValue(form.setFieldsValue({
                                    'info[effect_start_time]':null
                                  }))
                }"
                :checked="startTime" >审核通过后立即生效</a-checkbox>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="失效时间" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
              <a-date-picker
                v-if="config.action === 'edit'"
                :placeholder="endTime ? '' : '请选择日期'"
                format="YYYY-MM-DD HH:mm:ss"
                :show-time="{ defaultValue: moment('23:59:59', 'HH:mm:ss') }"
                style="width: 50%"
                :disabled="endTime"
                :disabledDate="handleDisabledDate"
                v-decorator="['info[effect_end_time]', {initialValue: Number(article.effect_forever) !== 1 ? moment(article.effect_end_time) : null,
                                                        rules: [{ required: !endTime, message: '请选择失效时间'}]}]" />
              <a-date-picker
                v-else
                format="YYYY-MM-DD HH:mm:ss"
                :show-time="{ defaultValue: moment('23:59:59', 'HH:mm:ss') }"
                style="width: 50%"
                :disabled="endTime"
                :disabledDate="handleDisabledDate"
                v-decorator="['info[effect_end_time]', { rules: [{ required: !endTime, message: '请选择失效时间'}]}]" />
              <a-checkbox
                style="margin-left: 10px;"
                @change="(e) => { endTime = e.target.checked;
                                  form.setFieldsValue(form.setFieldsValue({
                                    'info[effect_end_time]':null
                                  }))
                }"
                :checked="endTime">永久生效</a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="内容" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }" style="margin-left: 22px">
          <UEditor
            style="line-height: 20px;"
            :autoSize="{ minRows: 2, maxRows: 6 }"
            :initialFrameHeight="400"
            v-decorator="['info[content]', {rules: [{ required: true, message: '请输入内容'}], initialValue: article.content}]" />
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible = !visible">关闭</a-button>
      </div>
      <a-drawer
        title="适配产品选择"
        :width="600"
        :visible="visibleAddress"
        @close="visibleAddress = !visibleAddress"
        :afterVisibleChange="()=>{ treeExpand = true }"
      >
        <a-spin :spinning="!treeExpand">
          <div>
            <a-tree
              v-if="treeExpand"
              v-model="adaptive_product"
              checkable
              :replaceFields="replaceFields"
              :blockNode="true"
              :multiple="true"
              :checkStrictly="true"
              :tree-data="product"
              defaultExpandAll
              @check="onCheck"
            />
          </div>
          <div class="bbar">
            <a-button type="primary" @click="getProduct">保存</a-button>
            <a-button @click="visibleAddress = !visibleAddress">关闭</a-button>
          </div>
        </a-spin>
      </a-drawer>
      <select-user-form ref="selectUserForm" @ok="getData"/>
    </a-spin>
  </a-drawer>
</template>
<script>
import moment from 'moment'
export default {
  components: {
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm'),
    UEditor: () => import('@/components/Editor/UEditor')
  },
  props: {
    type: {
      type: String,
      default: '1'
    },
    treeId: {
      type: Array,
      default: () => {}
    }
  },
  data () {
    return {
      config: {},
      title: '',
      article: {},
      replaceFields: {
        key: 'value',
        title: 'name'
      },
      parentidArr: [],
      mustReadPersons: '',
      treeExpand: false,
      ad_user: [],
      product: [],
      adaptive_product: [],
      adaptive_user: [],
      articleId: null,
      userLength: '',
      loading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      visible: false,
      visibleAddress: false,
      form: this.$form.createForm(this),
      options: [],
      data: [],
      label: [],
      startTime: false,
      endTime: false,
      fieldNames: {
        label: 'catname',
        value: 'id',
        children: 'children'
      },
      mustRead: false
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = JSON.parse(JSON.stringify(config))
      if (config.action === 'add') {
        this.parentidArr = this.treeId
      }
      this.axios({
        url: '/knowledge/Index/getAddSetting'
      }).then(res => {
        if (res.code === 0) {
          this.options = res.result.categoryTree
          this.product = res.result.productsTree
          this.ad_user = res.result.userOption
          if (config.action === 'edit') {
            this.title = config.title
            this.article = config.detail.article
            if (this.article.label.length > 0) {
              this.label = this.article.label.split(',')
            } else {
              this.label = undefined
            }
            this.adaptive_product = config.detail.article.adaptive_product ? config.detail.article.adaptive_product.split(',') : []
            this.adaptive_user = config.detail.article.adaptive_user.split(',')
            const arr = config.detail.article.catid_all.split(',')
            this.endTime = Number(this.article.effect_forever) === 1
            this.startTime = Number(this.article.effect_type) === 1
            this.parentidArr = arr
            this.articleId = config.detail.article.id
            this.mustReadPersons = config.detail.article.must_read_persons
            this.userLength = this.mustReadPersons === '' ? 0 : this.mustReadPersons.split(',').length
          }
        }
        this.loading = false
      })
    },
    onCheck (checkedKeys) {
      this.adaptive_product = checkedKeys.checked
    },
    // 生效时间不可选
    disabledDate (current) {
      return current && current < this.moment().startOf('day')
    },
    // 获取必读用户
    getData (privData) {
      this.mustReadPersons = privData.toString()
      this.userLength = privData.length
    },
    // 选择必读用户
    handleUser () {
      this.$refs.selectUserForm.show({
        mode: 'multiple',
        selectValue: this.mustReadPersons ? this.mustReadPersons.split(',') : []
      })
    },
    getProduct () {
      const obj = {}
      obj.adaptive_product = this.adaptive_product.toString()
      this.form.setFieldsValue(obj)
      this.visibleAddress = false
    },
    openProduct () {
      this.$set(this, 'visibleAddress', true)
    },
    // 远程搜索标签
    handleSearch (value) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.axios({
          url: '/knowledge/index/getListLabel',
          params: { fieldvalue: value }
        }).then(res => {
          this.data = res.result
        })
      }, 300)
    },
    // 不可选失效时间
    handleDisabledDate (current) {
      const { getFieldValue } = this.form
      let time = getFieldValue('info[effect_start_time]')
      if (this.startTime) {
        time = moment().endOf('day')
      }
      return current < moment(time).endOf('day')
    },
    // 数据提交
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          if (this.endTime) {
            values.info.effect_forever = '1'
            values.info.effect_end_time = ''
          } else {
            // 判断失效时间是否小于或等于生效时间
            if (moment(values.info.effect_end_time).isBefore(values.info.effect_start_time)) {
              this.$message.warning('失效时间不能小于或等于的生效时间，请重新确认')
              return false
            }
            values.info.effect_end_time = values.info.effect_end_time.format('YYYY-MM-DD HH:mm:ss')
          }
          if (this.startTime) {
            values.info.effect_type = '1'
            values.info.effect_start_time = ''
          } else {
            values.info.effect_start_time = values.info.effect_start_time.format('YYYY-MM-DD HH:mm:ss')
          }
          values.info.adaptive_user = values.info.adaptive_user ? values.info.adaptive_user.toString() : ''
          values.info.adaptive_product = this.adaptive_product ? this.adaptive_product.toString() : ''
          if (values.info.label && values.info.label.length > 0) {
            values.info.label = values.info.label.filter(item => { return item && item.trim() })
            values.info.label = values.info.label.join(',')
          } else {
            values.info.label = ''
          }
          values.info.must_read = this.mustReadPersons.length > 0 ? '1' : '0'
          if (values.info.must_read === '1') {
            if (this.mustReadPersons.length === 0) {
              this.$message.warning('至少添加一个必读用户')
              return false
            }
          }
          this.loading = true
          values.info.must_read_persons = this.mustReadPersons
          if (this.config.action === 'edit') {
            this.axios({
              url: '/knowledge/Index/edit',
              params: { article_id: this.articleId },
              data: Object.assign(values)
            }).then(res => {
              if (!res.message) {
                this.visible = false
                this.loading = false
                this.$emit('ok')
              } else {
                this.$message.error(res.message)
              }
            })
          } else {
            this.axios({
              url: '/knowledge/Index/add',
              data: Object.assign(values)
            }).then(res => {
              if (!res.message) {
                this.visible = false
                this.loading = false
                this.$emit('ok')
              } else {
                this.$message.error(res.message)
              }
            })
          }
        }
      })
    }
  }
}
</script>
