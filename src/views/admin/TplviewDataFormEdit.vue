<template>
  <a-spin :spinning="loading" class="container">
    <a-form :form="form">
      <a-tabs tabPosition="bottom" v-model="activeKey">
        <a-tab-pane tab="基础设置" key="1" >
          <Setting :fieldslist="fieldslist" :workflow="workflow" :data="data" :setting.sync="setting" :pageName="configdata.variable" />
        </a-tab-pane>
        <a-tab-pane tab="列属性" key="2" :style="{ overflow: configdata.variable !=='table_card_list'? 'auto' : 'hidden' }">
          <Column
            ref="column"
            :fieldsarr="fieldsarr"
            :fieldslist="allList"
            :setting="setting"
            :action="configdata.action"
            :variable="configdata.variable"
            :fieldCategory="fieldCategory"
            v-if="configdata.variable !=='table_card_list'"/>
          <k-form-design
            tableType="window"
            :fieldsarr="fieldsarr"
            :mytemplate="cardTemplate"
            :formdata="{}"
            :setting="{}"
            ref="kFormDesign"
            v-else/>
        </a-tab-pane>
        <a-tab-pane tab="搜索器" key="3" v-if="configdata.variable !== 'table_subform_list'" >
          <TplviewDataQuerier
            :fieldsarr="querierFieldsarr"
            :fieldslist="allList"
            :mytemplate="mytemplate"
            ref="tplviewdataquerier"
            :fieldCategory="fieldCategory"
            :expand="expand"/>
        </a-tab-pane>
        <a-tab-pane tab="按钮" key="4" >
          <Tool
            ref="tool"
            :barmenu="barmenu"
            :tableidAll="tableid"
            :fieldsarr="fieldsarr"
            :fieldslist="allList"
            :active="active"
            :tabThis="tabThis"
            :config="configdata"
            @func="getBarMenus"/>
        </a-tab-pane>
        <a-tab-pane tab="分组筛选" key="6" v-if="configdata.variable === 'table_flow_list'">
          <packet-filter ref="packetFilter" :config="{searchPriv:setting.searchPriv}"/>
        </a-tab-pane>
        <a-tab-pane tab="表单应用" key="5" v-if="configdata.variable !== 'table_flow_list'" >
          <a-tabs defaultActiveKey="7">
            <a-tab-pane tab="表单应用" key="7">
              <FormApply ref="formapply" :params="{ tplviewArr: tplview_view_arr, tableid: configdata.tableid }" :formviewData="formview"/>
            </a-tab-pane>
            <a-tab-pane tab="扩展按钮" key="8">
              <ExtendButton ref="extendbutton" :extendbarmenuData="extendbarmenu"/>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
        <!-- <a-tab-pane tab="视图自定义" key="6" >
        </a-tab-pane> -->
      </a-tabs>
    </a-form>
  </a-spin>
</template>
<script>
import Vue from 'vue'
import KFormDesign from '@/views/admin/FormDesign/packages/index'
Vue.use(KFormDesign)
export default {
  components: {
    Setting: () => import('./Table/Setting'),
    Column: () => import('./Table/Column'),
    Tool: () => import('./Table/Tool'),
    FormApply: () => import('./Table/FormApply'),
    ExtendButton: () => import('./Table/ExtendButton'),
    TplviewDataQuerier: () => import('./Table/TplviewDataQuerier'),
    PacketFilter: () => import('@/views/admin/Table/PacketFilter')
  },
  props: {
    configdata: {
      type: Object,
      default () {
        return {}
      },
      required: false
    },
    tableid: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    active: {
      type: String,
      default () {
        return ''
      },
      required: true
    }
  },
  data () {
    return {
      config: {},
      loading: false,
      activeKey: '1',
      data: {},
      expand: '0',
      setting: {
        formview: []
      },
      tabThis: this,
      allList: [],
      formview: [],
      mytemplate: [],
      cardTemplate: [],
      fieldsarr: [],
      querierFieldsarr: [],
      fieldCategory: [],
      fieldslist: [],
      barmenu: [],
      tplview_view_arr: [],
      extendbarmenu: [],
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
  mounted () {
    this.show()
  },
  methods: {
    show () {
      if (this.configdata.action === 'edit') {
        this.activeKey = '2'
      } else {
        this.activeKey = '1'
      }
      this.loading = true
      this.config = this.configdata
      this.theme.item = this.configdata.item || {}
      this.axios({
        url: this.config.action === 'add' ? this.config.submitUrl : this.config.url,
        params: Object.assign({ tableid: this.configdata.tableid ? this.config.tableid : 0, variable: this.configdata.variable, id: this.configdata.record ? this.configdata.record.id : 0 })
      }).then((res) => {
        this.loading = false
        this.form.resetFields()
        this.theme.viewData = res.result
        this.data = res.result.data
        this.fieldslist = res.result.fieldslist
        this.fieldsarr = res.result.fieldsarr
        this.allList = this.fieldslist.map(item => { const obj = this.fieldsarr.find(arrItem => arrItem.alias === item.value); return obj })
        this.fieldCategory = res.result.field_category
        this.barmenu = res.result.barmenu
        this.barmenu = this.barmenu.sort(this.compare('listorder'))
        this.setting = res.result.setting
        this.formview = res.result.setting.formview
        this.tplview_view_arr = res.result.tplview_view_arr
        this.extendbarmenu = res.result.extendbarmenu
        this.mytemplate = res.result.setting.mytemplate
        this.cardTemplate = res.result.setting.cardTemplate || []
        this.workflow = res.result.workflow
        if (res.result.data.setting) {
          this.expand = JSON.parse(res.result.data.setting).advanced_search
        }
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
            return parseInt(a.sortid) - parseInt(b.sortid)
          })
          let errKey
          if (this.$refs.column) {
            this.$refs.column.searchValue = ''
            this.$refs.column.formTable.validateFields((err, value) => {
              errKey = err
            })
          }
          if (errKey) {
            this.activeKey = '2'
            return
          }
          values.setting.fieldsarr.forEach(item => { delete item.unshow })
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
          values.setting.advanced_search = this.$refs.tplviewdataquerier ? (this.$refs.tplviewdataquerier.advanced_search ? '1' : '0') : '0'
          values.setting.condition = this.setting.condition
          values.setting.searchPriv = this.$refs.packetFilter ? { proceed: this.$refs.packetFilter.proceed, finish: this.$refs.packetFilter.finish } : this.setting.searchPriv
          values.info.value = this.config.tableid
          values.info.module = this.config.module
          values.info.variable = this.config.variable
          if (this.config.action === 'edit') {
            values.id = this.data.id
            values.uid = this.data.uid
          }
          if (this.config.variable === 'table_card_list' && this.$refs.kFormDesign) {
            values.setting.cardTemplate = this.$refs.kFormDesign.data.list
            values.setting.fieldsarr.forEach(item => {
              item.display = 'v'
            })
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
                if (res.result) {
                  this.$emit('ok', values, res.result.uid)
                  this.$emit('refresh', values, res.result.id)
                } else {
                  this.$emit('ok', values)
                  this.$emit('refresh', values, this.data.id)
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
          this.activeKey = '1'
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
<style lang="less" scoped>
.container /deep/ .ant-tabs-tabpane{
  height: calc(100vh - 240px);
  overflow: auto;
}
</style>
