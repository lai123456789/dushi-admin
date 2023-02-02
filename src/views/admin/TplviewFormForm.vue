<template>
  <a-spin :spinning="loading" class="container">
    <a-form :form="form" >
      <k-form-design
        :fieldsarr="fieldsarr"
        :mytemplate="mytemplate"
        :tplInitJs="tplInitJs"
        :verifJs="verifJs"
        :formdata="data"
        :setting="setting"
        :params="{fieldsarr: fieldsarr, table_lists: table_lists, tplview_lists: tplview_lists, tableid: config.tableid, variable: config.variable}"
        ref="kFormDesign"/>
    </a-form>
  </a-spin>
</template>
<script>
import Vue from 'vue'
import KFormDesign from '@/views/admin/FormDesign/packages/index'
Vue.use(KFormDesign)
export default {
  props: {
    configdata: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      data: {},
      setting: { },
      tplInitJs: '',
      verifJs: '',
      mytemplate: [],
      fieldsarr: [],
      table_lists: [],
      tplview_lists: [],
      form: this.$form.createForm(this)
    }
  },
  // 祖先级组件数据传递，以及被子孙级组件动态修改
  provide () {
    this.theme = Vue.observable({
      viewData: {}
    })
    return {
      theme: this.theme
    }
  },
  mounted () {
    this.show()
  },
  methods: {
    show () {
      this.loading = true
      this.config = this.configdata
      this.axios({
        url: this.config.action === 'add' ? this.config.submitUrl : this.config.url,
        params: Object.assign({ tableid: this.config.tableid ? this.config.tableid : 0, id: this.config.record ? this.config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.theme.viewData = res.result
        this.form.resetFields()
        this.data = res.result.data
        this.fieldsarr = res.result.fieldsarr
        this.table_lists = res.result.table_lists
        this.tplview_lists = res.result.tplview_lists
        this.setting = res.result.setting
        this.mytemplate = res.result.setting.mytemplate
        this.tplInitJs = res.result.setting.tplSetting ? res.result.setting.tplSetting.tplInitJs : ''
        this.verifJs = res.result.setting.tplSetting ? res.result.setting.tplSetting.verifJs : ''
        if (this.config.action === 'copy') {
          this.data.name = ''
        }
      })
    },
    handleSubmit (e) {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          const mytemplate = this.$refs.kFormDesign ? this.$refs.kFormDesign.data.list : this.mytemplate
          values.setting.mytemplate = mytemplate
          // 获取表单规则
          values.setting.field_rule = this.theme.viewData.setting.field_rule || []
          // tplSettin初始化
          values.setting.tplSetting = {}
          values.setting.tplSetting.tplInitJs = this.$refs.kFormDesign ? this.$refs.kFormDesign.initJs : this.initJs
          values.setting.tplSetting.verifJs = this.$refs.kFormDesign ? this.$refs.kFormDesign.verifStr : this.verifJs
          values.info.value = this.config.tableid
          values.info.module = this.config.module
          values.info.variable = this.config.variable
          if (this.config.action === 'edit') {
            values.id = this.data.id
            values.uid = this.data.uid
          }
          this.axios({
            url: '/admin/tplview/checkRepeat',
            data: { id: this.config.action === 'edit' ? this.data.id : 0, name: values.info.name, type: 'table_form_view', tableid: this.config.tableid }
          }).then((res) => {
            if (res.message) {
              this.$message.error(res.message)
              this.loading = false
            } else {
              this.loading = true
              this.axios({
                url: this.config.submitUrl || this.config.url,
                data: Object.assign(values)
              }).then((res) => {
                if (e !== 'save') {
                  this.visible = false
                }
                this.loading = false
                this.$emit('ok', values)
                this.$emit('refresh', values, (res.result.id || this.data.id))
                if (res.message) {
                  this.$message.warning(res.message)
                } else {
                  this.$message.success('操作成功')
                  if (this.config.action !== 'edit') {
                    this.config.action = 'edit'
                    this.config.submitUrl = ''
                    this.data.id = res.result.id
                    this.data.uid = res.result.uid
                  }
                }
              })
            }
          })
        } else {
          this.$refs.kFormDesign.showPropertie = false
          this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
        }
      })
    }
  }
}
</script>
