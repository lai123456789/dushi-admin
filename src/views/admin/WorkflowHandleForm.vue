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
      <user-table-form-view
        ref="userTableFormView"
        :params="{ tableName, template, fieldRule: fieldRule, parentParams: params, page: 'workflow', handleWayData: handleWayData, templateOther: templateOther, remarksrule: remarksrule, wayDataRule: wayDataRule }"
        :formThis="data_"
        @ok="getVisible"
        @start="handleStart"
      />
      <div class="bbar" v-if="!bbar.every(item => {return item.visible ? item.visible === '0':item.display === '0' })">
        <component v-for="(item, index) in bbar" :key="index" :is="item.component" v-show="item.visible === '1' || item.display === '1'"/>
      </div>
    </a-spin>
    <span v-else>{{ message }}</span>
    <a-modal :visible="imagePreviewVisible" :footer="null" @cancel="imagePreviewVisible=!imagePreviewVisible">
      <img style="width: 100%" :src="imagePreviewUrl" />
    </a-modal>
    <user-table-components ref="userTableComponents" />
    <!-- 添加办理备注 -->
    <user-table-workflow-remarks ref="userTableWorkflowRemarks" :key="remarkKey" @ok="refresh" />
    <!-- 撤销 -->
    <user-table-workflow-repeal ref="userTableWorkflowRepeal" :key="repealKey" @ok="refresh" />
    <!-- 转办 -->
    <user-table-workflow-complaint ref="userTableWorkflowComplaint" :key="complaintKey" @ok="refresh"/>
    <send-message ref="sendMessage" />
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    QuillEditor: () => import('@/components/Editor/QuillEditor'),
    UserTableFormView: () => import('./UserTable/UserTableFormView'),
    UserTableWorkflowList: () => import('./UserTable/UserTableWorkflowList'),
    UserTableList: () => import('./UserTable/UserTableList'),
    UserTableComponents: () => import('./UserTable/UserTableComponents'),
    UserTableWorkflowRemarks: () => import('./UserTable/UserTableWorkflowRemarks'),
    UserTableWorkflowRepeal: () => import('./UserTable/UserTableWorkflowRepeal'),
    SendMessage: () => import('@/views/admin/UserTable/SendMessage'),
    UserTableWorkflowComplaint: () => import('@/views/admin/UserTable/UserTableWorkflowComplaint')
  },
  data () {
    return {
      data_: this,
      activeKey: 0,
      remarkKey: 'remark',
      repealKey: 'repeal',
      complaintKey: 'complaint',
      params: {},
      record: {},
      visible: false,
      pageLoading: false,
      sourceUrl: null,
      loading: false,
      form: this.$form.createForm(this),
      verifJs: '', // 表单提交前的验证脚本
      // 图片预览
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      template: [],
      templateCom: [],
      templateOther: [],
      fieldRule: [],
      // 用于定制开发作数据交换时使用，自定义组件时使用parent.$set(parent.data, 'mydata', 'hello')
      data: { },
      bbar: [],
      handleWayData: [],
      wayDataRule: [],
      wayDataAttribute: {},
      remarksrule: '',
      tableName: '',
      relationTable: [],
      code: 0,
      message: '',
      advancedLog: false,
      // 流程日志表头
      columnsLog: [{
        title: 'ID',
        dataIndex: 'id',
        width: 80
      }, {
        title: '流程任务',
        dataIndex: 'logTitle',
        width: 200
      }, {
        title: '办理人',
        dataIndex: 'username',
        ellipsis: false,
        width: 200
      }, {
        title: '办理时间',
        dataIndex: 'create_time',
        width: 200
      }, {
        title: '办理方式',
        dataIndex: 'type',
        width: 150
      }, {
        title: '办理备注',
        dataIndex: 'content',
        ellipsis: false,
        minWidth: 200
      }],
      advancedUrge: false,
      // 催办日志表头
      columnsUrge: [{
        title: 'ID',
        dataIndex: 'id',
        width: 60
      }, {
        title: '催办人',
        dataIndex: 'urge_user',
        width: 100
      }, {
        title: '催办时间',
        dataIndex: 'urge_time',
        width: 150
      }, {
        title: '催办流程节点',
        dataIndex: 'urgeTitle',
        width: 120
      }, {
        title: '被催办人',
        dataIndex: 'username',
        ellipsis: false,
        width: 150
      }, {
        title: '催办原因',
        dataIndex: 'urge_reason',
        width: 150
      }, {
        title: '催办备注',
        ellipsis: false,
        dataIndex: 'urge_remarks'
      }, {
        title: '催办后完成时效',
        dataIndex: 'finish_efective',
        width: 120
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      queryParamLog: { },
      queryParamUrge: { },
      colLayoutLog: { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 },
      colLayoutUrge: { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 },
      work_order_details: [],
      saveStatus: false, // 提交接口是否请求成功
      returnData: {}, // 提交接口返回数据
      viewMessage: '', // 后台没有返回视图显示
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
    show (parameter) {
      this.$setLoading(true)
      this.params = parameter.config
      this.record = parameter.record
      this.saveStatus = false
      if (parameter.config.viewType === 'handle' || parameter.config.viewType === 'create') {
        this.$setLoading(false)
        this.visible = true
        this.pageLoading = true
      } else {
        const that = this
        this.pageLoading = true
        const role = this.userInfo.roleid
        const user = this.userInfo.username
        const department = this.userInfo.departmentid
        var tplviewid = ''
        var params = { }
        if (parameter.config.viewType === 'view') {
          params.flowStatus = parameter.config.flowStatus
          params.flowCondition = parameter.config.flowCondition
          params.case_id = parameter.config.case_id
        }
        this.axios({
          url: '/admin/UserTable/getFormView',
          data: params
        }).then(res => {
          const data = res.result.data
          const formview = res.result.setting.formview || []
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
          if (tplviewid) {
            this.params.tplviewid = tplviewid
            this.$setLoading(false)
            this.visible = true
            this.pageLoading = true
          } else {
            this.$setLoading(false)
            this.$message.warning('您没有权限查看视图，请联系管理员')
          }
        })
      }
    },
    compare (listorder) {
      return function (a, b) {
        const value1 = a[listorder]
        const value2 = b[listorder]
        return value1 - value2
      }
    },
    // 请求视图列表数据
    requestData () {
      this.axios({
        url: this.params.tplviewUrl,
        data: Object.assign(this.params)
      }).then(res => {
        if (res.code === 0) {
          this.pageLoading = false
          this.params.tableid = res.result.tableid
          this.params.case_id = res.result.case_id
          this.params.record = res.result.data
          this.code = res.result.code
          this.message = res.result.message
          this.tableName = res.result.tableName
          this.bbar = res.result.bbar
          this.verifJs = res.result.tplSetting ? res.result.tplSetting.verifJs : ''
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
          this.handleWayData = res.result.wayData
          this.wayDataRule = res.result.wayDataRule
          if (res.result.wayData) {
            this.handleWayData.sort(this.compare('listorder'))
          }
          this.wayDataAttribute = res.result.wayDataAttribute
          this.remarksrule = res.result.remarksrule
          this.relationTable = res.result.relationTable || []
          this.template = JSON.parse(JSON.stringify(res.result.template)) || []
          this.templateOther = JSON.parse(JSON.stringify(res.result.template)) || []
          this.template.forEach(item => {
            if (item.type === 'component') {
              this.templateCom[item.value] = item
            }
          })
          this.fieldRule = res.result.fieldRule || []
          if (this.template) {
          // 表单初始化loader
            if (res.result.tplSetting && res.result.tplSetting.tplInitJs) {
              var initAttribute = res.result.tplSetting.tplInitJs
              var initTemplate = {
                type: 'component',
                attribute: initAttribute
              }
              this.template.push(initTemplate)
            }
            const getComponent = (array) => {
              array.forEach((item, index) => {
                if (item.columns) {
                  getComponent(item.columns)
                } else if (item.trs) {
                  getComponent(item.trs)
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
                }
              })
            }
            getComponent(this.template)
          }
        } else {
          this.visible = false
          this.$message.error(res.message)
          this.$emit('ok')
        }
        if (this.params.takeFlow) {
          this.$emit('ok')
        }
      })
    },
    handlePlayback () {
      if (this.params.record && this.params.record.uniqueid) {
        this.$setSetting({ audioPlayData: { visible: true } })
        this.axios({
          url: 'admin/Api/getRecordFile',
          params: { uniqueid: this.params.record && this.params.record.uniqueid }
        }).then(res => {
          if (res.code === 0) {
            this.sourceUrl = this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + res.result.file
            this.$setSetting({ audioPlayData: { visible: true, sourceUrl: this.sourceUrl } })
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
      if (this.params.record && this.params.record.uniqueid) {
        this.axios({
          url: 'admin/Api/getRecordFile',
          params: { uniqueid: this.params.record && this.params.record.uniqueid }
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
    // 流程日志
    loadDataLog (parameter) {
      return this.axios({
        url: '/admin/Centerflow/workflowLog',
        params: Object.assign(parameter, this.queryParamLog, { case_id: this.params.case_id, flowStatus: this.params.flowStatus })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['logTitle'] = res.result.data[i].title
        }
        return res.result
      })
    },
    // 流程催办日志
    loadDataUrge (parameter) {
      return this.axios({
        url: '/admin/Centerflow/workflowUrgeLog',
        params: Object.assign(parameter, this.queryParamLog, { case_id: this.params.case_id })
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['urgeTitle'] = res.result.data[i].title
        }
        return res.result
      })
    },
    sendMessage (data) {
      this.$refs.sendMessage.show(data)
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
    // 办理备注
    handleRemarks () {
      this.remarkKey = this.remarkKey === 'remark' ? 'remark_1' : 'remark'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowRemarks.show({
          case_id: this.record.case_id
        })
      })
    },
    // 撤销
    handleRepeal () {
      this.repealKey = this.cancelKey === 'repeal' ? 'repeal_1' : 'repeal'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowRepeal.show({
          case_id: this.record.case_id || this.record.__case_id__
        })
      })
    },
    // 转办
    handleTransfer () {
      this.complaintKey = this.complaintKey === 'complaint' ? 'complaint_1' : 'complaint'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowComplaint.show({
          case_id: this.record.case_id || this.record.__case_id__
        })
      })
    },
    // 刷新日志
    refresh () {
      if (this.$refs.tableLog) {
        this.$refs.tableLog.refresh(false)
      }
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
          this.$refs.userTableFormView.handleSubmit(data)
        }
      } else {
        this.$refs.userTableFormView.handleSubmit(data)
      }
    },
    getVisible (values, tableName, message, data) {
      if (message !== 'error') {
        this.visible = false
        this.saveStatus = true
        this.returnData = data
        this.$emit('ok')
      }
      this.pageLoading = false
    },
    handleStart () {
      this.pageLoading = true
    },
    // 取消
    handleCancel () {
      this.visible = !this.visible
    }
  }
}
</script>
