<template>
  <!-- 表单组件 -->
  <a-drawer
    :destroyOnClose="true"
    :title="params.title"
    :width="params.width"
    :visible="visible"
    @close="visible=!visible"
    :class="relationTable.length > 0 ? 'noPaddingTop' : ''"
    :afterVisibleChange="(e)=>{ e ? requestData() : ''}"
  >
    <a-spin :spinning="pageLoading" v-if="code === 0">
      <a-tabs v-if="relationTable.length > 0" v-model="activeKey">
        <a-tab-pane tab="数据窗口" :key="0">
          <user-table-form-view
            ref="userTableFormView"
            :params="{ tableName, template, fieldRule, parentParams: params, templateOther, action, page: 'user' }"
            @ok="getVisible"
            :formThis="data_"
            @start="handleStart"
          />
        </a-tab-pane>
        <a-tab-pane :tab="item.title" v-for="(item, index) in relationTable" :key="index + 1">
          <user-table-list :params="item" :formThis="data_" ></user-table-list>
        </a-tab-pane>
      </a-tabs>
      <user-table-form-view
        v-else
        ref="userTableFormView"
        :params="{ tableName, template, fieldRule, parentParams: params, templateOther, action, page: 'user' }"
        @start="handleStart"
        :formThis="data_"
        @ok="getVisible" />
      <div class="bbar" v-if="bbarshow">
        <component v-for="(item, index) in bbar" :key="index" :is="item.component" v-show="item.display === '1'"/>
      </div>
    </a-spin>
    <span v-else>{{ message }}</span>
    <a-modal :visible="imagePreviewVisible" :footer="null" @cancel="imagePreviewVisible = !imagePreviewVisible">
      <img style="width: 100%" :src="imagePreviewUrl" />
    </a-modal>
    <user-table-components ref="userTableComponents" />
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    QuillEditor: () => import('@/components/Editor/QuillEditor'),
    UserTableComponents: () => import('./UserTableComponents'),
    UserTableFormView: () => import('./UserTableFormView.vue'),
    UserTableList: () => import('./UserTableList.vue')
  },
  data () {
    return {
      data_: this,
      activeKey: 0,
      params: {},
      action: '', // 添加还是编辑
      visible: false,
      pageLoading: false, // 本页面加载
      loading: false, // 保存、办理按钮加载
      parentPage: '',
      record: {},
      // 图片预览
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      verifJs: '', // 表单提交前的验证脚本
      template: [],
      templateInit: [],
      templateCom: {}, // 自定义组件json
      templateOther: [],
      fieldRule: [],
      // 用于定制开发作数据交换时使用，自定义组件时使用parent.$set(parent.data, 'mydata', 'hello')
      data: { },
      bbar: {},
      tableName: '',
      bbarshow: false,
      relationTable: [],
      allData: {},
      code: 0,
      message: '',
      saveStatus: false, // 提交接口是否请求成功
      returnData: {}, // 提交接口返回数据
      actions: new Map([[
        '', function (value, inputValue) {
          return true
        } ], [
        'contain', function (value, inputValue) {
          if (inputValue.indexOf(value) === -1) {
            return false
          } else {
            return true
          }
        } ], [
        'equal', function (value, inputValue) {
          if (inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'great', function (value, inputValue) {
          if (inputValue > value) {
            return true
          } else {
            return false
          }
        } ], [
        'nc', function (value, inputValue) {
          if (inputValue.indexOf(value) === -1) {
            return true
          } else {
            return false
          }
        } ], [
        'ne', function (value, inputValue) {
          if (inputValue !== value) {
            return true
          } else {
            return false
          }
        } ], [
        'lt', function (value, inputValue) {
          if (inputValue < value) {
            return true
          } else {
            return false
          }
        } ], [
        'ge', function (value, inputValue) {
          if (inputValue > value || inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'le', function (value, inputValue) {
          if (inputValue < value || inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'bw', function (value, inputValue) {
          if (inputValue.indexOf(value) === 0) {
            return true
          } else {
            return false
          }
        } ], [
        'ew', function (value, inputValue) {
          const len = value.length
          if (inputValue.slice(-len) === value) {
            return true
          } else {
            return false
          }
        } ] ])
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  methods: {
    show (parameter, page) {
      const that = this
      this.parentPage = page
      this.params = JSON.parse(JSON.stringify(parameter))
      let url = parameter.url
      url = url.split('/')
      this.action = url[url.length - 1]
      this.params.action = this.action
      const role = this.userInfo.roleid
      const user = this.userInfo.username
      const department = this.userInfo.departmentid
      this.saveStatus = false
      var tplviewid = ''
      if (!parameter.record) {
        parameter.record = {}
        parameter.record.id = 0
      }
      this.$setLoading(true)
      this.axios({
        url: '/admin/UserTable/getFormView',
        data: parameter.flowCondition ? {
          flowStatus: parameter.flowStatus,
          flowCondition: parameter.flowCondition,
          id: parameter.id,
          case_id: parameter.case_id
        } : { id: parameter.record.id, listviewid: parameter.tpl || this.$parent.params.tplviewid, flowStatus: parameter.flowStatus }
      }).then(res => {
        this.allData = res.result.data
        const data = res.result.data
        if (data.case_id) this.params.case_id = data.case_id
        const formview = res.result.setting.formview || []
        if (res.result.setting.drawer_width || res.result.setting.drawerPercentage) {
          if (res.result.setting.drawerType === '0' || !res.result.setting.drawerType) {
            this.params.width = res.result.setting.drawer_width || 1200
          } else {
            this.params.width = res.result.setting.drawerPercentage + '%'
          }
        } else {
          this.params.width = parameter.width || 1200
        }
        this.params.labelWidth = res.result.setting.label_width
        // 表单规则实现
        formview.forEach((dataItem, dataIndex) => {
          if (dataItem.formCondition) {
            if (dataItem.formCondition[0]) {
              dataItem.formCondition[0].simpleCondition.forEach((item, index) => {
                item.condition.forEach((myitem, myindex) => {
                  if (item.fieldUser === 'currentUser') {
                    myitem.flag = that.handleUserSimple(user, myitem.value)
                  } else if (item.fieldUser === 'currentClass') {
                    myitem.flag = that.handleUserSimple(department, myitem.value)
                  } else if (item.fieldUser === 'currentRole') {
                    myitem.flag = that.handleUserSimple(role, myitem.value)
                  } else {
                    let inputValue = ''
                    if (item.field) {
                      inputValue = data[item.field]
                    }
                    that.template.forEach(templateItem => {
                      if (templateItem.field) {
                        if (templateItem.field.alias === item.field) {
                          if (templateItem.field.formtype === 'number') {
                            myitem.value = Number(myitem.value)
                          }
                          if (myitem && !myitem.value) {
                            myitem.value = ''
                          }
                        }
                      }
                    })
                    //  如果页面组件内容是否为空
                    if (inputValue) {
                      myitem.flag = that.handleSimple(myitem.include, myitem.value, inputValue)
                    } else {
                      myitem.flag = !myitem.value
                    }
                  }
                })
                if (item.logic === 'and') {
                  item.flag = item.condition.every((myitem, myindex) => {
                    return myitem.flag
                  })
                } else if (item.logic === 'or') {
                  item.flag = item.condition.some((myitem, myindex) => {
                    return myitem.flag
                  })
                }
              })
              if (dataItem.formCondition[0].logic === 'and') {
                dataItem.flag = dataItem.formCondition[0].simpleCondition.every((item, index) => {
                  return item.flag
                })
              } else if (dataItem.formCondition[0].logic === 'or') {
                dataItem.flag = dataItem.formCondition[0].simpleCondition.some((item, index) => {
                  return item.flag
                })
              }
            } else {
              dataItem.flag = true
            }
          }
        })
        var reversalData = JSON.parse(JSON.stringify(formview))
        reversalData.some(dataItem => {
          if (dataItem.formCondition) {
            if (dataItem.flag) {
              tplviewid = dataItem.tplview
              return true
            }
          } else {
            tplviewid = dataItem.tplview
            return true
          }
        })
        if (this.params.tplviewidtpl) {
          this.params.tplviewid = this.params.tplviewidtpl
          this.$setLoading(false)
          this.visible = true
          this.pageLoading = true
        } else if (tplviewid) {
          this.params.tplviewid = this.params.tplviewidtpl ? this.params.tplviewidtpl : tplviewid
          this.$setLoading(false)
          this.visible = true
          this.pageLoading = true
        } else {
          this.$setLoading(false)
          this.$message.warning('您没有权限查看视图，请联系管理员')
        }
      })
    },
    // 请求视图列表数据
    requestData () {
      this.axios({
        url: this.params.url,
        data: Object.assign(this.params, { listTplviewid: this.params.tpl || this.$parent.params.tplviewid, flowStatus: this.params.flowStatus })
      }).then(res => {
        this.viewMessage = res.result.message
        this.code = res.result.code
        this.message = res.result.message
        this.tableName = res.result.tableName
        this.bbar = res.result.bbar
        this.record = res.result.data
        this.verifJs = res.result.tplSetting && res.result.tplSetting.verifJs ? res.result.tplSetting.verifJs : ''
        this.bbar.forEach(item => {
          item.component = {
            template: `<span>${item.attribute}</span>`,
            data: () => {
              return {
                parent: this
              }
            }
          }
        })
        this.bbarshow = !this.bbar.every(item => item.display === '0')
        this.relationTable = res.result.relationTable || []
        this.pageLoading = false
        this.templateInit = res.result.template
        this.templateInit.forEach(item => {
          if (item.type === 'component') {
            this.templateCom[item.value] = item
          }
        })
        this.template = JSON.parse(JSON.stringify(res.result.template)) || []
        this.templateOther = JSON.parse(JSON.stringify(res.result.template)) || []
        // 表单初始化loader
        if (res.result.tplSetting && res.result.tplSetting.tplInitJs) {
          var initAttribute = res.result.tplSetting.tplInitJs
          var initTemplate = {
            type: 'component',
            attribute: initAttribute
          }
          this.template.push(initTemplate)
        }
        this.fieldRule = res.result.fieldRule
        const getComponent = (array) => {
          array.forEach((item, index) => {
            if (item.columns) {
              getComponent(item.columns)
            } else if (item.trs) {
              getComponent(item.trs)
            } else if (item.tds) {
              getComponent(item.tds)
            } else if (item.list) {
              getComponent(item.list)
            } else {
              if (item.type === 'component') {
                item.component = {
                  template: `<span>${item.attribute}</span>`,
                  data: () => {
                    return {
                      parent: this
                    }
                  }
                }
              }
              if (item.label === '工单编号') {
                this.$set(item.options, 'defaultValue', this.params.formData.gdbh || '')
                this.$set(item.options, 'disabled', true)
              }
            }
          })
        }
        getComponent(this.template)
      })
    },
    handlePlayback () {
      if (this.record.uniqueid) {
        this.$setSetting({ audioPlayData: { visible: true } })
        this.axios({
          url: 'admin/Api/getRecordFile',
          params: { uniqueid: this.record.uniqueid }
        }).then(res => {
          if (res.code === 0) {
            this.modal2Visible = true
            this.sourceUrl = this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + res.result.file
          } else {
            this.$setSetting({ audioPlayData: { visible: false } })
            this.$message.warning(res.message)
          }
        })
      } else {
        this.$message.error('未配置uniqueid')
      }
    },
    handleDownload () {
      if (this.record.uniqueid) {
        this.axios({
          url: 'admin/Api/getRecordFile',
          params: { uniqueid: this.record.uniqueid }
        }).then(res => {
          if (res.code === 0) {
            window.open(this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + res.result.file)
          } else {
            this.$message.warning(res.message)
          }
        })
      } else {
        this.$message.error('未配置uniqueid')
      }
    },
    // 判断当前用户，用户所在部门，所属于角色
    handleUserSimple (current, conditionValue) {
      if (conditionValue.indexOf(current) !== -1) {
        return true
      } else {
        return false
      }
    },
    // 规则函数
    handleSimple (include, value, inputValue) {
      const action = this.actions.get(`${include}`)
      return action(value, inputValue)
    },
    // 提交表单
    handleSubmit (data) {
      const verifJs = this.verifJs
      if (verifJs) {
        const parent = this
        const str = 'return ' + verifJs
        // eslint-disable-next-line no-new-func
        const func = new Function(str)
        const flag = func()(parent)
        if (flag) {
          this.$refs.userTableFormView.handleSubmit(data, this.parentPage, this.params.jointable)
        }
      } else {
        this.$refs.userTableFormView.handleSubmit(data, this.parentPage, this.params.jointable)
      }
    },
    getVisible (values, tableName, message, data) {
      if (message !== 'error') {
        this.visible = false
        this.saveStatus = true
        this.returnData = data
        this.$emit('ok', values, tableName)
      }
      this.loading = false
    },
    handleStart () {
      this.loading = true
    },
    // 取消
    handleCancel () {
      this.visible = !this.visible
    }
  }
}
</script>
