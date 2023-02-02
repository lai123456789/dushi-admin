<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-tabs>
          <a-tab-pane tab="基础设置" key="1">
            <Setting :fieldslist="fieldslist" :workflow="workflow" :data="data" :setting.sync="setting" :pageName="config.variable" />
          </a-tab-pane>
          <a-tab-pane tab="列属性" key="2">
            <Column
              ref="column"
              :fieldsarr="fieldsarr"
              :fieldslist="allList"
              :variable="config.variable"
              :action="config.action"
              :setting="setting"
              :tableType="'ui'"
              :fieldCategory="fieldCategory"/>
          </a-tab-pane>
          <a-tab-pane tab="搜索器" key="3" v-if="config.variable !== 'table_subform_list'">
            <TplviewDataQuerier :fieldsarr="querierFieldsarr" :mytemplate="mytemplate" ref="tplviewdataquerier"/>
          </a-tab-pane>
          <a-tab-pane tab="工具条" key="4">
            <Tool
              ref="tool"
              :barmenu="barmenu"
              :fieldsarr="fieldsarr"
              :fieldslist="allList"
              :config="config"
              @func="getBarMenus"/>
          </a-tab-pane>
          <a-tab-pane tab="表单应用" key="5" v-if="config.variable !== 'table_flow_list'">
            <a-tabs defaultActiveKey="7">
              <a-tab-pane tab="表单应用" key="7">
                <FormApply ref="formapply" :params="{ tplviewArr: tplview_view_arr, tableid: config.tableid}" :formviewData="formview"/>
              </a-tab-pane>
              <a-tab-pane tab="扩展按钮" key="8">
                <ExtendButton ref="extendbutton" :extendbarmenuData="extendbarmenu"/>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>
          <a-tab-pane tab="视图自定义" key="6" >
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit('save')">保存</a-button>
        <a-button type="primary" @click="handleSubmit" >保存并关闭</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
export default {
  components: {
    Setting: () => import('./Table/Setting'),
    Column: () => import('./Table/Column'),
    Tool: () => import('./Table/Tool'),
    FormApply: () => import('./Table/FormApply'),
    ExtendButton: () => import('./Table/ExtendButton'),
    TplviewDataQuerier: () => import('./Table/TplviewDataQuerier')
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      activeid: '1',
      data: {},
      setting: {
        formview: []
      },
      formview: [],
      mytemplate: [],
      fieldsarr: [],
      querierFieldsarr: [],
      fieldslist: [],
      allList: [],
      barmenu: [],
      tplview_view_arr: [],
      extendbarmenu: [],
      fieldCategory: [],
      form: this.$form.createForm(this),
      workflow: []
    }
  },
  watch: {
    fieldsarr (newValue) {
      this.querierFieldsarr = this.getQuerier(newValue)
      const id = this.querierFieldsarr.filter(item => item.alias === 'id')
      this.querierFieldsarr = this.querierFieldsarr.filter(item => item.alias !== 'id')
      this.querierFieldsarr = this.querierFieldsarr.sort(this.compare('data_id'))
      this.querierFieldsarr.unshift(id[0])
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
  methods: {
    show (config) {
      this.activeid = '1'
      this.visible = true
      this.loading = true
      this.config = config
      this.theme.item = this.config.item || {}
      this.axios({
        url: this.config.action === 'add' ? this.config.submitUrl : this.config.url,
        params: Object.assign({ tableid: config.tableid ? config.tableid : 0, variable: this.config.variable, id: config.record ? config.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.theme.viewData = res.result
        this.data = res.result.data
        this.fieldsarr = res.result.fieldsarr
        this.fieldslist = res.result.fieldslist
        this.allList = this.fieldslist.map(item => { const obj = this.fieldsarr.find(arrItem => arrItem.alias === item.value); return obj })
        this.fieldCategory = res.result.fieldCategory
        this.barmenu = res.result.barmenu
        this.barmenu = this.barmenu.sort(this.compare('listorder'))
        this.setting = res.result.setting
        this.formview = res.result.setting.formview
        this.tplview_view_arr = res.result.tplview_view_arr
        this.extendbarmenu = res.result.extendbarmenu
        this.mytemplate = res.result.setting.mytemplate
        this.workflow = res.result.workflow
        if (this.config.action === 'copy') {
          this.data.name = ''
        }
      })
    },
    // 数组对象排序
    compare (property) {
      return (obj1, obj2) => {
        const val1 = obj1[property]
        const val2 = obj2[property]
        return val1 - val2
      }
    },
    getBarMenus (data) {
      this.barmenu = data.sort(this.compare('listorder'))
    },
    handleSubmit (action) {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          values.setting.fieldsarr = this.$refs.column ? this.$refs.column.dataSource : this.fieldsarr
          values.setting.fieldsarr.sort(function (a, b) {
            return parseInt(a.listorder) - parseInt(b.listorder)
          })
          values.setting.formview = this.$refs.formapply ? JSON.parse(JSON.stringify(this.$refs.formapply.formview)) : this.setting.formview
          if (this.$refs.formapply) {
            values.setting.formview.forEach(item => {
              item.nameFlag = undefined
              item.condiFlag = undefined
              item.privFlag = undefined
            })
          }
          values.setting.formview = values.setting.formview.filter(item => item.tplview)
          values.setting.barmenu = this.$refs.tool ? this.$refs.tool.myBarMenus : this.barmenu
          values.setting.extendbarmenu = this.$refs.extendbutton ? this.$refs.extendbutton.extendbarmenu : this.extendbarmenu
          values.setting.mytemplate = this.$refs.tplviewdataquerier ? this.$refs.tplviewdataquerier.data : this.mytemplate
          values.setting.condition = this.setting.condition
          values.setting.searchPriv = this.setting.searchPriv
          values.info.value = this.config.tableid
          values.info.module = this.config.module
          values.info.variable = this.config.variable
          if (this.config.action === 'edit') {
            values.id = this.data.id
            values.uid = this.data.uid
          }
          this.axios({
            url: '/admin/tplview/checkRepeat',
            data: { id: this.config.action === 'edit' ? this.data.id : 0, name: values.info.name, type: this.config.variable, tableid: this.config.tableid }
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
                this.loading = false
                if (action !== 'save') {
                  this.visible = false
                }
                if (res.result) {
                  this.$emit('ok', values, res.result.uid)
                } else {
                  this.$emit('ok', values)
                }
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
          this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改')
        }
      })
    },
    getQuerier (fieldsarr) {
      return fieldsarr.filter(item => {
        return ['image', 'file', 'editor', 'subform'].indexOf(item.formtype) === -1
      })
    }
  }
}
</script>
