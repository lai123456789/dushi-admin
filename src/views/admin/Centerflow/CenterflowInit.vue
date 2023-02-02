<template>
  <a-spin :spinning="loading" class="page-header" style="height: 100%">
    <a-form :layout="advanced ? 'vertical' : 'inline'" class="table-search" :class="advanced ? 'advanced' : 'normal'">
      <div class="head">
        <div class="title">过滤</div>
        <a-space style="margin-left: 8px">
          <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
          <a-button @click="() => {queryParam = {workflow_id: undefined, flowCondition: queryParam.flowCondition, flow_duration: []}, $refs.table.refresh(true)}">重置</a-button>
          <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
        </a-space>
      </div>
      <a-row :gutter="16">
        <a-col v-if="advanced" span="24">
          <div class="divider"></div>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.case_number"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="客户电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.customer_phone"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.transition_status"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="摘要" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.case_name"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              v-model="queryParam.workflow_id"
              :allowClear="true"
              show-search
              option-filter-prop="children">
              <a-select-option v-for="(value, key) in workflow" :key="key" :value="value.value">{{ value.text }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="发起人" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParam.start_username"/>
          </a-form-item>
        </a-col>
        <a-col v-bind="colLayout">
          <a-form-item label="流程发起时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-range-picker
              :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
              :placeholder="['开始时间', '结束时间']"
              @change="getStartDate"
              v-model="queryParam.startDate"
              style="width: 100%"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-operator" style="margin-left: 8px; margin-top: 8px">
      <a-space>
        <a-radio-group :value="queryParam.flowCondition" @change="handleSizeChange" button-style="solid">
          <a-tooltip v-for="item in proceed" :key="item.value" :title="item.help" v-show="item.priv === 'visit'">
            <a-radio-button :value="item.value">{{ item.customName ? item.customName : item.name }}</a-radio-button>
          </a-tooltip>
        </a-radio-group>
        <!-- <a-button icon="download" @click="handleExport">导出</a-button> -->
      </a-space>
    </div>
    <s-table
      :scroll="{ y: true, x: 1570 }"
      class="table-fill"
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="{ field: 'id', order: 'descend' }"
      v-if="queryParam.flowCondition"
    >
      <div slot="case_name" slot-scope="text">
        <span v-html="text"></span>
      </div>
    </s-table>
    <!-- 数据表单 -->
    <workflow-handle-form ref="workflowHandleForm" @ok="refresh('noRefresh')" :key="indexKey"></workflow-handle-form>
    <!-- 转办 -->
    <user-table-workflow-complaint ref="userTableWorkflowComplaint" :key="complaintKey" @ok="refresh('noRefresh')"/>
    <!-- 办理备注 -->
    <user-table-workflow-remarks ref="userTableWorkflowRemarks" :key="remarkKey" @ok="refresh('noRefresh')" />
    <!-- 催办 -->
    <user-table-workflow-urge ref="userTableWorkflowUrge" :key="urgeKey" @ok="urgeOk" />
    <!-- 取消工单 -->
    <user-table-workflow-repeal ref="userTableWorkflowRepeal" :key="repealKey" @ok="refresh('noRefresh')" />
    <!-- 流转 -->
    <user-table-workflow-jump ref="userTableWorkflowJump" :key="jumpKey" @ok="refresh('noRefresh')" />
    <general-export ref="generalExport" />
  </a-spin>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    UserTableWorkflowComplaint: () => import('@/views/admin/UserTable/UserTableWorkflowComplaint'),
    WorkflowHandleForm: () => import('../WorkflowHandleForm'),
    UserTableWorkflowRemarks: () => import('../UserTable/UserTableWorkflowRemarks'),
    UserTableWorkflowUrge: () => import('../UserTable/UserTableWorkflowUrge'),
    UserTableWorkflowRepeal: () => import('../UserTable/UserTableWorkflowRepeal'),
    UserTableWorkflowJump: () => import('../UserTable/UserTableWorkflowJump'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  props: {
    proceed: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    flowCondition: {
      type: String,
      default () {
        return ''
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  data () {
    return {
      indexKey: 0,
      remarkKey: 'remark',
      urgeKey: 'urge',
      repealKey: 'repeal',
      jumpKey: 'jump',
      complaintKey: 'complaint',
      advanced: false,
      // 搜索参数
      queryParam: { workflow_id: undefined, flow_duration: [] },
      enableDate: null,
      handle_time: null,
      labelCol: { style: 'width: 104px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 104px); display: inline-block' },
      where: '',
      // 表头
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        align: 'center',
        customRender: this.actionRender
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 80
      }, {
        title: '发起人',
        dataIndex: 'username',
        width: 100
      }, {
        title: '摘要',
        dataIndex: 'case_name',
        ellipsis: false,
        scopedSlots: { customRender: 'case_name' }
      }, {
        title: '流程类型',
        dataIndex: 'workflow_name',
        width: 100
      }, {
        title: '流程编号',
        dataIndex: 'case_number',
        width: 140
      }, {
        title: '流程发起时间',
        dataIndex: 'start_date',
        sorter: true,
        width: 130
      }, {
        title: '流程状态',
        dataIndex: 'transition_status',
        width: 100
      }],
      colLayout: {},
      workflow: [],
      barmenus: {}
    }
  },
  created () {
    this.changeAdvanced(false)
    this.loading = true
    if (this.proceed.length > 0 && this.proceed.filter(item => item.priv === 'visit')[0]) {
      this.loading = false
      this.queryParam.flowCondition = this.proceed.filter(item => item.priv === 'visit')[0].value
    } else {
      this.queryParam.flowCondition = this.flowCondition
    }
  },
  watch: {
    flowCondition (newVal) {
      if (newVal) {
        this.loading = false
        this.queryParam.flowCondition = newVal
      }
    }
  },
  methods: {
    actionRender (text, record) {
      const buttons = this.barmenus[record.workflow_id] || []
      const menuArr = []
      buttons.map(rowItem => {
        const Menu = {
          template: `<span>${rowItem.attribute}</span>`,
          data: () => {
            return {
              parent: this,
              record: record
            }
          }
        }
        if (parseInt(rowItem.display) === 1) {
          switch (rowItem.bar_alias) {
            case 'flow_process':
              if ((this.queryParam.flowCondition === 'my_process' && record.transition_user === this.userInfo.username) ||
              this.queryParam.flowCondition === 'only_process' || this.queryParam.flowCondition === 'all_process') {
                menuArr.push(Menu)
              }
              break
            case 'flow_takeprocess':
              if (this.queryParam.flowCondition === 'public_process' || (this.queryParam.flowCondition === 'my_process' && record.transition_user !== this.userInfo.username)) {
                menuArr.push(Menu)
              }
              break
            case 'flow_take':
              if ((this.queryParam.flowCondition === 'my_process' && record.transition_user !== this.userInfo.username) || this.queryParam.flowCondition === 'public_process') {
                menuArr.push(Menu)
              }
              break
            default:
              menuArr.push(Menu)
              break
          }
        }
      })
      if (menuArr.length < 4) {
        return (
          <div>
            {
              menuArr.map((menuItem, menuIndex) => {
                if (menuIndex === menuArr.length - 1) {
                  return (
                    <span>
                      <menuItem />
                    </span>
                  )
                } else {
                  return (
                    <span>
                      <menuItem/>
                      <a-divider type="vertical" />
                    </span>
                  )
                }
              })
            }
          </div>
        )
      } else {
        return (
          <span>
            <span>
              {
                menuArr.map((menuItem, menuIndex) => {
                  if (menuIndex < 2) {
                    return (
                      <span>
                        <menuItem />
                        <a-divider type="vertical" />
                      </span>
                    )
                  }
                })
              }
            </span>
            <a-dropdown>
              <a>更多 <a-icon type="down" /></a>
              <a-menu slot="overlay">
                {
                  menuArr.map((menuItem, menuIndex) => {
                    if (menuIndex > 1) {
                      return (
                        <a-menu-item>
                          <menuItem />
                        </a-menu-item>
                      )
                    }
                  })
                }
              </a-menu>
            </a-dropdown>
          </span>
        )
      }
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/centerflow/init',
        params: Object.assign(parameter, this.queryParam, { init: !this.workflow.length, flowStatus: 'proceed' })
      }).then(res => {
        if (this.workflow.length === 0) {
          this.workflow = res.result.option.workflow
        }
        if (res.result.barmenus) {
          this.barmenus = res.result.barmenus || {}
        }
        this.where = res.result.where
        return res.result
      })
    },
    handleExport () {
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: '',
        controller: 'crm/Order',
        method: 'orderExport',
        parameter: { where: this.where }
      })
    },
    handleSizeChange (e) {
      this.queryParam.flowCondition = e.target.value
      if (['my_handle', 'my_create', 'all_flow'].includes(e.target.value)) {
        this.columns = [ {
          title: '操作',
          dataIndex: 'action',
          width: 150,
          align: 'center',
          customRender: this.actionRender
        }, {
          title: 'ID',
          dataIndex: 'id',
          sorter: true,
          width: 80
        }, {
          title: '发起人',
          dataIndex: 'username',
          width: 100
        }, {
          title: '摘要',
          dataIndex: 'case_name',
          ellipsis: false,
          scopedSlots: { customRender: 'case_name' }
        }, {
          title: '流程类型',
          dataIndex: 'workflow_name',
          width: 100
        }, {
          title: '流程编号',
          dataIndex: 'case_number',
          width: 140
        }, {
          title: '流程发起时间',
          dataIndex: 'start_date',
          sorter: true,
          width: 130
        }, {
          title: '流程状态',
          dataIndex: 'transition_status',
          width: 100
        }, {
          title: '流程子状态',
          dataIndex: 'arc_status',
          width: 150
        }]
      } else {
        this.columns = [ {
          title: '操作',
          dataIndex: 'action',
          width: 150,
          align: 'center',
          customRender: this.actionRender
        }, {
          title: 'ID',
          dataIndex: 'id',
          sorter: true,
          width: 80
        }, {
          title: '发起人',
          dataIndex: 'username',
          width: 100
        }, {
          title: '摘要',
          dataIndex: 'case_name',
          ellipsis: false,
          scopedSlots: { customRender: 'case_name' }
        }, {
          title: '流程类型',
          dataIndex: 'workflow_name',
          width: 100
        }, {
          title: '流程编号',
          dataIndex: 'case_number',
          width: 140
        }, {
          title: '流程发起时间',
          dataIndex: 'start_date',
          sorter: true,
          width: 130
        }, {
          title: '流程状态',
          dataIndex: 'transition_status',
          width: 100
        }]
      }
      this.refresh()
    },
    // 领取
    handleTakeFlow (record) {
      this.$forceUpdate()
      this.axios({
        url: '/admin/Centerflow/takeFlow',
        data: {
          handleWay: '领取',
          operation: 'take_flow',
          case_id: record.case_id
        }
      }).then(res => {
        this.loading = false
        this.$forceUpdate()
        if (res.code === 0) {
          this.$message.success('领取成功')
        } else {
          this.$message.error(res.message)
        }
        this.$refs.table.refresh()
      })
    },
    getStartDate (date, dateString) {
      this.queryParam.start_date_from = dateString[0]
      this.queryParam.start_date_to = dateString[1]
    },
    getEnabledDate (date, dateString) {
      this.queryParam.enable_time[0] = dateString[0]
      this.queryParam.enable_time[1] = dateString[1]
    },
    getHandleTime (date, dateString) {
      this.queryParam.handle_time[0] = dateString[0]
      this.queryParam.handle_time[1] = dateString[1]
    },
    changeAdvanced (tag) {
      if (tag) {
        this.advanced = !this.advanced
      }
      if (this.advanced) {
        this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
      } else {
        this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
      }
    },
    // 刷新表格
    refresh (type) {
      this.$refs.table.refresh(!type)
    },
    handleView (record) {
      this.indexKey = this.indexKey === 1 ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '查看流程',
            width: 1200,
            tplviewUrl: '/admin/centerflow/viewOrder',
            case_id: record.case_id,
            flowStatus: 'proceed',
            flowCondition: this.queryParam.flowCondition,
            viewType: 'view'
          },
          record: record
        })
      })
    },
    handleProcess (record) {
      this.indexKey = this.indexKey === 1 ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '办理流程',
            width: 1200,
            tplviewUrl: '/admin/centerflow/handleOrder',
            url: '/admin/workitem/processing',
            flowStatus: 'proceed',
            flowCondition: this.queryParam.flowCondition,
            case_id: record.case_id,
            viewType: 'handle'
          },
          record: record
        })
      })
    },
    // 转办
    handleTransfer (record) {
      this.complaintKey = this.complaintKey === 'complaint' ? 'complaint_1' : 'complaint'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowComplaint.show({
          case_id: record.case_id
        })
      })
    },
    // 办理，领办
    handleTakeProcess (record) {
      this.indexKey = this.indexKey === 1 ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '办理流程',
            width: 1200,
            tplviewUrl: '/admin/centerflow/handleOrder',
            url: '/admin/workitem/processing',
            case_id: record.case_id,
            flowStatus: 'proceed',
            flowCondition: this.queryParam.flowCondition,
            viewType: 'handle',
            takeFlow: 1
          },
          record: record
        })
      })
    },
    // 办理备注
    handleRemarks (record) {
      this.remarkKey = this.remarkKey === 'remark' ? 'remark_1' : 'remark'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowRemarks.show({
          case_id: record.case_id
        })
      })
    },
    // 催办
    handleUrge (record) {
      this.urgeKey = this.urgeKey === 'urge' ? 'urge_1' : 'urge'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowUrge.show({
          case_id: record.case_id,
          record
        })
      })
    },
    // 催办成功，2次及以上催办生成弹窗
    urgeOk (record) {
      this.refresh('noRefresh')
      const that = this
      const { arcUrge, complainNum, khdh1 } = record
      const { gdbh, wdbh, wdmc, wdlx, sfxm, sfdh, sfyhm } = record
      const urlObj = {
        gdlx: 'ts2',
        Callerid: khdh1,
        gdbh,
        wdbh,
        wdmc,
        wdlx,
        sfxm,
        sfdh,
        sfyhm
      }
      let url = `${process.env.VUE_APP_BASE_URL}CustomPage/?view=crm/Popscreen&Uniqueid=${that.uuid()}`
      for (const key in urlObj) {
        if (urlObj[key]) {
          url = `${url}&${key}=${urlObj[key]}`
        }
      }
      url = url.substr(0, url.length)
      if (arcUrge > 1) {
        const content = arcUrge === 2 ? '催办成功，是否生成投诉单？' : `催办成功，此前已生成${complainNum}个投诉单，是否新增投诉单`
        this.$confirm({
          title: '提示',
          content,
          okText: '确定',
          cancelText: '无需',
          onOk () {
            return new Promise((resolve, reject) => {
              window.open(url)
              resolve()
            }).catch()
          },
          onCancel () {}
        })
      }
    },
    // 生成唯一ID
    uuid (n) {
      n = 1 // 生成一个唯一id，包含数字和字母
      var random = function () {
        // 生成10-12位不等的字符串
        return Number(
          Math.random()
            .toString()
            .substr(2)
        ).toString(36) // 转换成十六进制
      }
      var arr = []
      function createId () {
        var num = random()
        var _bool = false
        arr.forEach(v => {
          if (v === num) _bool = true
        })
        if (_bool) {
          createId()
        } else {
          arr.push(num)
        }
      }
      var i = 0
      while (i < n) {
        createId()
        i++
      }
      return arr[0] // 将生成的转为我们需要的字符串并赋值
    },
    // 撤销
    handleRepeal (record, type) {
      if (record.gdbh && record.gdbh.includes('WX') && !type) {
        type = 'WX'
      }
      this.repealKey = this.repealKey === 'repeal' ? 'repeal_1' : 'repeal'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowRepeal.show({
          case_id: record.case_id,
          record: record,
          type: type
        })
      })
    },
    // 办理流转
    handleJump (record) {
      this.jumpKey = this.jumpKey === 'jump' ? 'jump_1' : 'jump'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowJump.show({
          case_id: record.case_id
        })
      })
    },
    // 删除
    handleDelete (record) {
      const me = this
      this.$confirm({
        title: '您确认要删除该流程吗？',
        onOk () {
          me.axios({
            url: '/admin/Wcase/delete',
            data: { case_id: record.case_id }
          }).then(res => {
            me.refresh()
          })
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
/deep/.ant-spin-container{
  display: flex;
    flex-direction: column;
}
</style>
