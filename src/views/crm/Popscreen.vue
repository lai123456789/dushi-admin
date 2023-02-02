<template>
  <a-spin :spinning="loading">
    <a-card title="新建工单" :bordered="false">
      <div style="margin-bottom: 40px">
        <user-table-form-view
          ref="userTableFormView"
          :params="{ tableName, template, fieldRule: fieldRule, parentParams: params, page: 'workflow', handleWayData: handleWayData, templateOther: templateOther, remarksrule: remarksrule }"
          :formThis="this"
          @ok="getVisible"
          @start="handleStart"
        />
      </div>
      <div style="position : fixed; bottom : 0; right : 0; width: 100%; border-top: 1px solid #e9e9e9; padding: 5px 16px; background: #fff; text-align: right;">
        <component style="margin: 5px" v-for="(item, index) in bbar" :key="index" :is="item.component" />
      </div>
    </a-card>
    <a-tabs v-if="relationTable.length > 0" :tabBarStyle="{color: 'red'}">
      <a-tab-pane :tab="item.title" v-for="(item, index) in relationTable" :key="index + 1">
        <user-table-list :params="Object.assign(item, {parentForm: {template: template, params: params, productInfo: productInfo}})"></user-table-list>
      </a-tab-pane>
    </a-tabs>
    <a-modal
      title="播放录音"
      centered
      :destroyOnClose="true"
      v-model="modal2Visible"
      @ok="() => modal2Visible = false"
      :footer="null"
    >
      <audio name="winPlayer" controls="true" autoplay="true" style="vertical-align: middle; width: 450px;"><source :src="sourceUrl"/></audio>
    </a-modal>
    <user-table-components ref="userTableComponents" />
    <send-form ref="sendForm"/>
    <preview ref="preview"/>
  </a-spin>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    UserTableFormView: () => import('@/views/admin/UserTable/UserTableFormView'),
    UserTableComponents: () => import('@/views/admin/UserTable/UserTableComponents'),
    SendForm: () => import('@/views/sms/SendForm'),
    UserTableList: () => import('@/views/admin/UserTable/UserTableList'),
    Preview: () => import('@/views/admin/Index/Preview')
  },
  created () {
    this.axios({
      url: '/crm/Popscreen/popData',
      params: {
        Method: this.$route.query.Method,
        Callerid: this.$route.query.Callerid,
        Calleeid: this.$route.query.Calleeid
      }
    }).then(res => {
      this.$set(this, 'callinfo', res.result)
    })
    this.createForm()
    // 使用实例 window.top.view({filename: 'VIOMI牌MR1072-1000G型双出水净水器.pdf', authcode: '4c30943026ca2e32adac7cbb9a060fc7'})
    window.top.view = (config) => {
      this.$refs.preview.show(config)
    }
  },
  data () {
    return {
      data: [],
      form: this.$form.createForm(this),
      // 关联数据表
      relationTable: [],
      labelCol: { style: 'width: 100px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block' },
      tableName: '',
      template: [],
      templateOther: [],
      fieldRule: [],
      modal2Visible: false,
      sourceUrl: null,
      params: {
        url: '/crm/Order/orderAdd',
        workflow_id: '7da0996c5a39882e02fd34a09e39c026',
        viewType: 'create',
        title: '创建流程: 服务单流程',
        popscreenType: 'popscreen',
        popscreenThis: this
      },
      title: '新增服务单信息',
      bbar: [],
      pageLoading: false,
      loading: false,
      handleWayData: [],
      remarksrule: '',
      // 表单默认数据
      formData: {},
      callinfo: {},
      collapsed: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {
    parentForm () {
      return this
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
    // 取消表单
    handleCancel () {
      window.close()
    },
    handleStart () {
      this.$set(this, 'loading', true)
    },
    getVisible (values, tableName, message) {
      this.loading = false
      if (message !== 'error') {
        this.visible = false
        setTimeout(() => {
          this.handleCancel()
        }, 1500)
        this.$emit('ok', values, tableName)
      }
    },
    handlePlayback () {
      if (this.params.record && this.params.record.uniqueid) {
        this.axios({
          url: 'admin/Api/getRecordFile',
          params: { uniqueid: this.params.record.uniqueid }
        }).then(res => {
          if (res.code === 0) {
            this.modal2Visible = true
            this.sourceUrl = this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + res.result.file
          } else {
            this.$message.warning(res.message)
          }
        })
      } else {
        this.$message.error('未配置uniqueid')
      }
    },
    // 创建表单
    createForm (alias, value) {
      this.$set(this, 'loading', true)
      this.username = this.userInfo.username
      this.axios({
        url: '/crm/Popscreen/wcaseadd',
        data: {
          workflow_id: this.params.workflow_id,
          viewType: this.params.viewType,
          number: this.$route.query.Method === 'Dialout' ? this.$route.query.Calleeid : this.$route.query.Callerid
        }
      }).then(res => {
        this.params.tableid = res.result.tableid
        this.params.record = res.result.data
        this.params.case_id = res.result.case_id
        this.params.action = 'edit'
        this.tableName = res.result.tableName
        this.handleWayData = res.result.wayData
        this.remarksrule = res.result.remarksrule
        this.fieldRule = res.result.fieldRule || []
        this.relationTable = res.result.relationTable || []
        this.verifJs = res.result.tplSetting ? res.result.tplSetting.verifJs : ''
        this.bbar = res.result.bbar
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
        this.template = JSON.parse(JSON.stringify(res.result.template)) || []
        this.templateOther = JSON.parse(JSON.stringify(res.result.template))
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
              if (alias && item.field && alias === item.field.alias) {
                this.$set(item.field, 'value', value)
              }
            }
          })
        }
        getComponent(this.template)
        this.loading = false
      })
    }
  }
}
</script>
