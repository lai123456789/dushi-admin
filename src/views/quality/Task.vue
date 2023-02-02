<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <a-space>
          <a-button icon="search" type="primary" @click="taskSearch" @keyup.enter="taskSearch">搜索</a-button>
          <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
        </a-space>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="任务名称">
              <a-input v-model.trim="queryParam.taskname" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <!-- 页面数据渲染 -->
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button icon="plus" type="primary" @click="addPage">添加</a-button>
        <a-button icon="download" @click="handleExport()">导出</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="editPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a>更多<a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item><a @click="showModal(record)">查看进度</a></a-menu-item>
              <a-menu-item><a @click="detailsPage(record)">查看明细</a></a-menu-item>
              <a-menu-item><a @click="distributionPage(record)">提取&分配</a></a-menu-item>
              <a-menu-item><a @click="taskDelete(record)">删除信息</a></a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </s-table>
    </a-card>
    <!-- 查看进度 -->
    <a-drawer
      :title="config.title"
      :width="1200"
      :visible="visibleread"
      :destroyOnClose="true"
      @close="visibleread=!visibleread"
    >
      <s-table
        ref="tableread"
        size="small"
        rowKey="quality_agent"
        :columns="columns2"
        :data="progress"
      >
      </s-table>
    </a-drawer>
    <!-- 查看明细 -->
    <a-drawer
      :title="config.title"
      :width="1440"
      :visible="details"
      @close="details=!details"
    >
      <div>
        <a-card class="table-search" :bordered="true" :title="detailsadvanced ? '过滤' : ''" size="small">
          <a slot="extra" href="#" v-if="detailsadvanced">
            <a-button icon="search" type="primary" @click="detailsSearch" @keyup.enter="detailsSearch">搜索</a-button>
            <a-button icon="sync" @click="() => { Paramdetails = {}, $refs.tabledetails.refresh(true)}">重置</a-button>
            <a @click="changedetailsAdvanced(true)">{{ detailsadvanced ? '收起' : '展开' }}<a-icon :type="detailsadvanced ? 'up' : 'down'"/></a>
          </a>
          <a-form :layout="detailsadvanced ? 'vertical' : 'inline'" :class="detailsadvanced ? 'advanced' : 'normal'">
            <div class="head" v-if="!detailsadvanced">
              <div class="title">过滤</div>
              <a-space style="margin-left: 8px">
                <a-button icon="search" type="primary" @click="detailsSearch" @keyup.enter="detailsSearch">搜索</a-button>
                <a-button icon="sync" @click="() => { Paramdetails = {}, $refs.tabledetails.refresh(true)}">重置</a-button>
                <a @click="changedetailsAdvanced(true)">{{ detailsadvanced ? '收起' : '展开' }}<a-icon :type="detailsadvanced ? 'up' : 'down'"/></a>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col v-bind="colLayout">
                <a-form-item label="质检状态">
                  <a-select :allowClear="true" show-search v-model.trim="Paramdetails.status">
                    <a-select-option value="0">未质检</a-select-option>
                    <a-select-option value="1">已质检</a-select-option>
                    <a-select-option value="2">无效数据</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="质检员">
                  <a-select :allowClear="true" show-search v-model.trim="Paramdetails.quality_agent">
                    <a-select-option v-for="(item, key) in quality_agent" :key="key" :value="item.value">{{ item.display }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="坐席姓名">
                  <a-select :allowClear="true" show-search v-model.trim="Paramdetails.agent">
                    <a-select-option v-for="(item, key) in agent" :key="key" :value="item.value">{{ item.display }}</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="主叫号码">
                  <a-input v-model.trim="Paramdetails.src_phone" />
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="被叫号码">
                  <a-input v-model.trim="Paramdetails.dst_phone" />
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="呼叫时间">
                  <a-range-picker showTime @change="getSearchdate" v-model="searchDate" style="width: 100%"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <a-card>
          <div class="table-operator">
            <a-button icon="retweet" @click="Redistribution()" type="primary" :disabled="selectedRowKeys.length==0">重新分配</a-button>
            <a-button icon="delete" @click="detailsDelete()" type="danger" :disabled="selectedRowKeys.length==0">批量删除</a-button>
            <a-button icon="download" @click="Taskexport()">导出</a-button>
          </div>
          <s-table
            ref="tabledetails"
            size="small"
            rowKey="id"
            :columns="columns3"
            :data="detailsDataShow"
            :rowSelection="rowSelection"
            :sorter="{ field: 'id', order: 'descend' }"
          >
            <div slot="action" slot-scope="text, record1">
              <a @click="detailsDelete(record1)">删除</a>
            </div>
          </s-table>
          <a-drawer
            title="重新分配"
            :width="400"
            :visible="visibleRedistribution"
            @close="visibleRedistribution=!visibleRedistribution"
          >
            <a-form :form="form" layout="vertical">
              <a-form-item label="转移数据数量">
                <a-input :read-only="true" class="input" :value="selectedRowKeys.length"/>
              </a-form-item>
              <a-form-item label="转移至坐席">
                <a-select>
                  <a-select-option v-for="(item, key) in quality_agent" :key="key" :value="item.value">
                    {{ item.display }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <div class="bbar">
                <a-button type="primary" @click="Redistributioncheck">保存</a-button>
                <a-button @click="visibleRedistribution=!visibleRedistribution">取消</a-button>
              </div>
            </a-form>
          </a-drawer>
        </a-card>
      </div>
    </a-drawer>
    <!-- 编辑添加分配 -->
    <a-drawer
      :title="config.title"
      :width="1200"
      :destroyOnClose="true"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form" layout="vertical">
          <a-form-item label="任务名称" >
            <a-input
              :read-only="disabled"
              :class="disabled ? 'input' : ''"
              v-decorator="['info[taskname]', { initialValue:config.data.taskname, rules: [{ required: !disstatu, message: '请输入任务名称' }]}]"
              @change="editcheck($event)"/>
          </a-form-item>
          <a-alert type="error" :message="tip" banner v-if="tip"/>
          <a-form-item label="质检模板">
            <a-input v-if="disstatu" :read-only="disabled" :class="disabled ? 'input' : ''" v-model="config.data.template_name"/>
            <a-select :allowClear="true" v-decorator="['info[templateid]', { initialValue:config.data.template_name, rules: [{ required: true, message: '请选择质检模板' }] }]" v-else>
              <a-select-option v-for="(item, key) in temp_name" :key="key" :value="item.value">{{ item.display }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="数据提取">
            <a-card>
              <a-form-item v-show="disstatu" label="呼叫时间">
                <a-range-picker showTime @change="getcallDate" v-decorator="['info[callDate]', { initialValue:callDate, rules: [{ required: disstatu, message: '请输入呼叫时间区间' }] }]"/>
              </a-form-item>
              <a-form-item label="通话时长(单位为秒)">
                <a-input-group compact>
                  <a-input-number
                    style=" width: 100px; text-align: center"
                    v-decorator="['info[min_billsec]', { initialValue: config.data.min_billsec, rules: [{ required: true, message: '请输入通话时长' }] }]"
                    :min="1"
                  />
                  <a-input
                    style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                    placeholder="~"
                    disabled
                  />
                  <a-input-number style="width: 100px; text-align: center; border-left: 0" v-model="config.data.max_billsec" :min="1"/>
                </a-input-group>
              </a-form-item>
              <a-form-item label="呼出类型">
                <a-radio-group name="Call" v-decorator="['info[calltype]', { initialValue: config.data.calltype}]">
                  <a-radio value="2" >呼入&呼出</a-radio>
                  <a-radio value="1" class="margin">呼出</a-radio>
                  <a-radio value="0" class="margin">呼入</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="满意度评价">
                <a-radio-group name="satisfied" v-decorator="['info[unsatisfied_only]', { initialValue: config.data.unsatisfied_only}]">
                  <a-radio value="0">不限评价结果</a-radio>
                  <a-radio value="1" style=" margin-left: 62px">仅不满意</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="每人提取数量">
                <a-radio-group name="number" v-decorator="['info[extra_all]', { initialValue: config.data.extra_all}]">
                  <a-radio value="0" @click="allocateClose">所有</a-radio>
                  <a-radio value="1" @click="allocate" style=" margin-left: 118px">指定数量</a-radio>
                  <a-input-number v-show="allocatestate" :min="1" :max="100" v-decorator="['info[count]', { initialValue: config.data.count}]" />
                </a-radio-group>
              </a-form-item>
              <a-row type="flex" align="middle" :gutter="20">
                <a-col :span="20">
                  <a-form-item label="来自于">
                    <a-textarea
                      :auto-size="{ minRows: 3, maxRows: 5 }"
                      :read-only="true"
                      class="input"
                      v-decorator="['info[extenlist]', { initialValue: config.data.extenlist, rules: [{ required: true, message: '请选择用户' }]}]"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="1">
                  <a-button @click="handleSelect">选择用户</a-button>
                </a-col>
              </a-row>
            </a-card>
          </a-form-item>
          <a-form-item label="数据分配">
            <a-card>
              <a-form-item label="组内分配机制">
                <a-radio-group name="distribution" v-decorator="['info[distribution_mode]', { initialValue: config.data.distribution_mode }]" >
                  <a-radio value="0">平均分配</a-radio>
                  <a-radio value="1" style=" margin-left: 90px">全部分配</a-radio>
                </a-radio-group>
              </a-form-item>
              <div
                v-for="(item, index) in groupAllocation"
                :key="index"
              >
                <a-row type="flex" align="middle">
                  <a-col :span="13">
                    <a-form-item label="分配给" :required="true" :validateStatus="item.agentstatus" :help="item.agenthelp">
                      <a-textarea
                        :auto-size="{ minRows: 3, maxRows: 5 }"
                        v-model="item.agent"
                        :read-only="true"
                        :ref="nowtime + '_' + (random + index)"
                        class="input"
                      />
                    </a-form-item>
                  </a-col>
                  <a-button class="rattio" @click="handleSelectQc(item.agent, index)">选择用户</a-button>
                  <a-col :span="5">
                    <p style="float: left; margin-top: 10px; margin-right:10px" class="rattio">组间分配占比</p>
                    <a-col :span="12">
                      <a-form-item style="margin-top: 5px" :wrapper-col="{ span: 12 }">
                        <a-input-number
                          :min="1"
                          :max="100"
                          :ref="nowtime + '_' + (random + index)"
                          v-model="item.rate"
                        />
                      </a-form-item>
                    </a-col>
                  </a-col>
                  <a-col :span="1">
                    <a-tooltip>
                      <template slot="title">
                        <p v-html="content" >{{ content }}</p>
                      </template>
                      <a-icon type="exclamation-circle" :style="{ fontSize: '24px', color: 'blue' }" style="color:blue"/>
                    </a-tooltip>
                  </a-col>
                  <a-col :span="1">
                    <a-icon :style="{ fontSize: '26px', color: '#52c41a' }" type="plus-circle" @click="addallocation(index)" />
                  </a-col>
                  <a-col :span="1">
                    <a-icon :style="{ fontSize: '26px', color: 'red' }" type="minus-circle" @click="deleteallocation(index)"/>
                  </a-col>
                </a-row>
              </div>
            </a-card>
          </a-form-item>
          <a-form-item label="备注" v-show="disstatu===false">
            <a-textarea
              :auto-size="{ minRows: 3, maxRows: 5 }"
              v-decorator="['info[remark]', { initialValue: config.data.remark}]"
            />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">{{ config.action==='edit'?'修改':'保存' }}</a-button>
          <a-button @click="cancal_off">{{ config.action==='edit'?'重置':'取消' }}</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <select-user-form ref="selectUserFormSeat" @ok="getUser" />
    <select-user-form ref="selectUserFormQc" @ok="getQc" />
    <general-export ref="generalExport" />
  </div>
</template>
<script>
export default {
  components: {
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      advanced: false,
      detailsadvanced: false,
      visibleRedistribution: false,
      visible: false,
      loading: false,
      disstatu: false,
      disabled: false,
      details: false,
      tip: '',
      allocatestate: false,
      length: '',
      nowtime: '',
      random: 0,
      content: '1.当有多组质检员时，组间分配占比指的是该组质检员在多组质检员中所占的比例。如：共增加3组质检员，组件分配占比分别为1、2、3，则第一组质检员分得的比例为1/(1+2+3)，第二组质检员分得比例为2/(1+2+3)。</br>' +
      '2.平均分配时，该组质检员平均分得本组所分配到的指间任务，如：本组5个质检员，分得100条指间任务，则每个质检员分得20条质检任务。全部分配时，该组质检员都分得到本组所分配到的质检任务，如：本组5个质检员，分得100条质检任务，则每个质检员均会分得100条质检任务，最终质检结果取5个质检员质检结果的平均值。',
      // 搜索参数
      queryParam: {},
      Paramdetails: {
        status: undefined,
        quality_agent: undefined,
        agent: undefined,
        src_phone: '',
        dst_phone: '',
        begin_time: '',
        end_time: ''
      },
      callDate: null,
      searchDate: null,
      form: this.$form.createForm(this),
      config: {
        data: {}
      },
      configfen: {},
      quality_agent: [],
      agent: [],
      temp_name: [],
      page: [],
      taskid: '',
      start_time: '',
      end_time: '',
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      groupAllocation: [{
        agent: '',
        rate: 1
      }],
      taskname: '',
      colLayout: {},
      visibleread: false,
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60,
        sorter: true
      }, {
        title: '任务名称',
        dataIndex: 'taskname'
      }, {
        title: '任务类型',
        dataIndex: 'task_type'
      }, {
        title: '质检总数',
        dataIndex: 'sum_number'
      }, {
        title: '已质检数',
        dataIndex: 'finished_number'
      }, {
        title: '待质检数',
        dataIndex: 'unfinish_number'
      }, {
        title: '有效数据',
        dataIndex: 'valid_number'
      }, {
        title: '无效数据',
        dataIndex: 'invalid_number'
      }, {
        title: '完成率',
        dataIndex: 'finish_rate'
      }, {
        title: '质检员',
        dataIndex: 'quality_agent'
      }, {
        title: '创建人',
        dataIndex: 'inputuser'
      }, {
        title: '创建时间',
        dataIndex: 'inputtime'
      }],
      columns2: [{
        title: '质检员',
        dataIndex: 'quality_agent',
        sorter: true
      }, {
        title: '质检总数',
        dataIndex: 'sum_number',
        sorter: true
      }, {
        title: '已质检数',
        dataIndex: 'finished_number',
        sorter: true
      }, {
        title: '待质检数',
        dataIndex: 'unfinish_number',
        sorter: true
      }, {
        title: '有效数据',
        dataIndex: 'valid_number',
        sorter: true
      }, {
        title: '无效数据',
        dataIndex: 'invalid_number',
        sorter: true
      }, {
        title: '完成率',
        dataIndex: 'finish_rate'
      }],
      columns3: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60,
        sorter: true
      }, {
        title: '坐席姓名',
        dataIndex: 'agent'
      }, {
        title: '主叫号码',
        dataIndex: 'src'
      }, {
        title: '被叫号码',
        dataIndex: 'dst'
      }, {
        title: '呼叫时间',
        dataIndex: 'calldate',
        width: 150
      }, {
        title: '通话时长',
        dataIndex: 'billsec'
      }, {
        title: '质检状态',
        dataIndex: 'status'
      }, {
        title: '质检员',
        dataIndex: 'quality_agent'
      }, {
        title: '分配人',
        dataIndex: 'distribute_agent'
      }, {
        title: '分配时间',
        dataIndex: 'distribute_time',
        width: 140
      }]
    }
  },
  created () {
    this.changedetailsAdvanced(false)
  },
  mounted () {
    this.getTemplate()
    this.getyesterday()
    this.getUserName()
  },
  methods: {
    // 添加数据分配 -> 分配给 组件添加
    addallocation (index) {
      this.groupAllocation.splice(index + 1, 0, {
        agent: '',
        rate: 1
      })
    },
    // 添加数据分配 -> 分配给 组件删除
    deleteallocation (index) {
      if (this.groupAllocation.length === 1) {
        return false
      } else {
        this.groupAllocation.splice(index, 1)
      }
    },
    // 页面数据渲染
    loadDataTable (parameter) {
      this.page = parameter
      return this.axios({
        url: '/quality/task/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        for (const i in res.result.data) {
          res.result.data[i]['task_type'] = '录音质检'
        }
        this.length = res.result.totalCount
        this.nowtime = res.timestamp
        parseInt(Math.random() * (100000 - 10000 + 1) + 10000, 10)
        this.random = Math.floor(Math.random() * (100000 - 10000 + 1) + 10000)
        for (const i in res.result.data) {
          for (const j in res.result.data[i].agentlist) {
            if (res.result.data[i].agentlist) {
              res.result.data[i]['quality_agent'] = res.result.data[i].agentlist[j].agent
            }
          }
        }
        return res.result
      })
    },
    // 获取用户信息
    getUserName () {
      return this.axios({
        url: '/quality/data/getUsername',
        params: {}
      }).then(res => {
        this.quality_agent = res.result.data
        this.agent = res.result.data
        return res.result
      })
    },
    // 任务表格数据搜索
    taskSearch () {
      const table = this.$refs.table
      table.refresh()
    },
    // 打开添加页面
    addPage (parameter) {
      this.visible = true
      this.disstatu = false
      this.disabled = false
      this.allocatestate = false
      this.groupAllocation = [{
        agent: '',
        rate: 1
      }]
      this.config = {
        action: 'add',
        title: '添加',
        url: '/quality/task/init',
        data: {
          min_billsec: '1',
          max_billsec: '300',
          calltype: '2',
          unsatisfied_only: '0',
          extra_all: '0',
          count: '1',
          distribution_mode: '0',
          extenlist: '',
          agentlist: ''
        }
      }
    },
    // 核对任务名称重复
    checknamefun (rule, value, callback) {
      if (this.config.action === 'distribution') {
        return false
      } else {
        return this.axios({
          url: '/quality/task/checkName',
          data: { taskname: value }
        }).then(res => {
          this.tip = res.message
        })
      }
    },
    // 获取质检模板信息
    getTemplate () {
      return this.axios({
        url: '/quality/task/getTemplate',
        params: {}
      }).then(res => {
        this.temp_name = res.result.data
      })
    },
    // 编辑时确认模板名称是否重复
    editcheck (e) {
      if (e.target.value === this.taskname) {
        this.tip = ''
      } else {
        this.checknamefun('', e.target.value)
      }
    },
    // 添加或修改任务时 关闭或重置
    cancal_off () {
      if (this.config.action === 'edit') {
        this.config.data = {}
        this.groupAllocation = [{
          agent: '',
          rate: 1
        }]
      } else {
        this.visible = false
      }
    },
    // 查看进度的对应数据
    progress (parameter) {
      parameter['taskid'] = this.config.taskid
      return this.axios({
        url: this.config.url,
        data: Object.assign(parameter)
      }).then(res => {
        return res.result
      })
    },
    // 查看进度对话框
    showModal (record) {
      this.visibleread = true
      const id = record && record.id || this.selectedRowKeys
      this.config = {
        taskid: id,
        action: 'show',
        title: '查看进度',
        url: '/quality/task/viewProgress',
        data: {}
      }
    },
    // 增加、编辑的数据提交
    handleSubmit (value) {
      value.preventDefault()
      const table = this.$refs.table
      const id = this.config.id
      this.form.validateFields((err, values) => {
        const info = values.info
        delete values.info.callDate
        info['max_billsec'] = this.config.data.max_billsec
        values.info['agentlist'] = {}
        let name = JSON.parse(JSON.stringify(this.nowtime + '_'))
        for (const i in this.groupAllocation) {
          const index = JSON.parse(JSON.stringify(this.random + Number(i)))
          name = name + index
          values.info['agentlist'][name] = {}
          values.info['agentlist'][name]['agent'] = this.groupAllocation[i].agent
          values.info['agentlist'][name]['rate'] = this.groupAllocation[i].rate
          name = JSON.parse(JSON.stringify(this.nowtime + '_'))
        }
        // 表单验证是否为空
        for (const i in this.groupAllocation) {
          if (!this.groupAllocation[i].agent) {
            this.$set(this.groupAllocation[i], 'agentstatus', 'error')
            this.$set(this.groupAllocation[i], 'agenthelp', '请选择用户')
          } else {
            this.$set(this.groupAllocation[i], 'agentstatus', 'success')
            this.$set(this.groupAllocation[i], 'agenthelp', '')
          }
        }
        const test = JSON.stringify(this.groupAllocation)
        const flag1 = test.indexOf('error') === -1
        if (!flag1 || this.tip) {
          return false
        }
        if (!err) {
          // 修改数据提交
          if (this.config.action === 'edit') {
            for (const i in this.temp_name) {
              if (values.info['templateid'] === this.temp_name[i].display) {
                values.info['templateid'] = this.temp_name[i].value
              }
            }
            values['id'] = id
            this.axios({
              url: '/quality/task/edit',
              data: values
            }).then(res => {
              this.visible = false
              this.loading = false
              this.$message.success('修改成功')
              table.refresh()
            })
            // 提取分配数据提交
          } else if (this.config.action === 'distribution') {
            const info = values.info
            info['start_time'] = this.start_time
            info['end_time'] = this.end_time
            info['templateid'] = this.config.templateid
            this.axios({
              url: '/quality/task/extractDistribution',
              data: values
            }).then((res) => {
              this.visible = false
              this.loading = false
              this.$message.info(res.message)
              table.refresh()
            })
            // 添加数据提交
          } else {
            this.axios({
              url: '/quality/task/add',
              data: values
            }).then((res) => {
              this.visible = false
              this.loading = false
              this.$message.success('添加成功')
              table.refresh()
            })
          }
        }
      })
    },
    // 数据提取->来自于 选择用户 返回数据
    getUser (val) {
      this.config.data.extenlist = val.toString()
    },
    // 数据分配->分配给 选择用户 返回数据
    getQc (val) {
      const index = this.config.index
      this.groupAllocation[index].agent = val.toString()
      this.$set(this.groupAllocation[index], 'agentstatus', 'success')
      this.$set(this.groupAllocation[index], 'agenthelp', '')
    },
    // 修改的抽屉以及查找对应修改的数据
    editPage (record) {
      this.visible = true
      this.disstatu = false
      this.disabled = false
      if (record.extra_all === '1') {
        this.allocatestate = true
      } else {
        this.allocatestate = false
      }
      const id = record && record.id || this.selectedRowKeys
      this.tip = ''
      this.taskname = record.taskname
      this.config = {
        id: id,
        action: 'edit',
        title: '修改',
        url: '/quality/task/edit',
        data: {}
      }
      this.config.data = record
      if (!record.agentlist) {
        return false
      } else {
        this.groupAllocation = []
        for (const j in record.agentlist) {
          this.groupAllocation.push(record.agentlist[j])
        }
      }
      for (const i in this.temp_name) {
        if (record.templateid === this.temp_name[i].value) {
          this.config.data.template_name = this.temp_name[i].display
        }
      }
      this.loading = false
    },
    // 提取分配抽屉
    distributionPage (record) {
      this.visible = true
      this.disstatu = true
      this.disabled = true
      const id = record && record.id || this.selectedRowKeys
      if (record.extra_all === '1') {
        this.allocatestate = true
      } else {
        this.allocatestate = false
      }
      const templateid = record.templateid
      this.config = {
        templateid: templateid,
        id: id,
        action: 'distribution',
        title: '提取&分配',
        url: '/quality/task/init',
        data: {}
      }
      this.config.data = record
      if (!record.agentlist) {
        return false
      } else {
        this.groupAllocation = []
        for (const j in record.agentlist) {
          this.groupAllocation.push(record.agentlist[j])
        }
      }
      for (const i in this.temp_name) {
        if (record.templateid === this.temp_name[i].value) {
          this.config.data.template_name = this.temp_name[i].display
        }
      }
      this.loading = false
    },
    // 查看明细数据显示
    detailsDataShow (parameter) {
      this.Paramdetails['taskid'] = this.taskid
      return this.axios({
        url: this.config.url,
        params: Object.assign(parameter, this.Paramdetails)
      }).then(res => {
        for (const i in res.result.data) {
          if (res.result.data[i].result === '1') {
            res.result.data[i].result = '合格'
          } else {
            res.result.data[i].result = '不合格'
          }
        }
        return res.result
      })
    },
    // 查看明细页面抽屉打开以及对应数据
    detailsPage (record) {
      this.details = true
      const id = record && record.id || this.selectedRowKeys
      this.taskid = id
      this.Paramdetails = {}
      this.config = {
        taskid: id,
        action: 'details',
        title: '查看明细',
        url: '/quality/task/viewDetails',
        data: {}
      }
      this.$nextTick(() => {
        const table = this.$refs.tabledetails
        table.refresh()
      })
    },
    // 获取搜索框搜索时间
    getSearchdate (date, dateString) {
      this.Paramdetails.begin_time = dateString[0]
      this.Paramdetails.end_time = dateString[1]
    },
    // 查看详情搜索
    detailsSearch () {
      const table = this.$refs.tabledetails
      table.refresh()
    },
    // 提取分配中重新分配抽屉
    Redistribution (record) {
      this.visibleRedistribution = true
      const detailsid = record && record.id || this.selectedRowKeys
      this.configfen = {
        taskid: this.taskid,
        detailsid: detailsid,
        url: '/quality/task/viewDetails',
        data: {}
      }
    },
    // 重新分配提交
    Redistributioncheck () {
      const table = this.$refs.tabledetails
      const self = this
      this.$confirm({
        title: '您确认要重新分配吗？',
        onOk () {
          self.axios({
            url: '/quality/task/redistribution',
            data: { id: self.configfen.detailsid }
          }).then(res => {
            self.$message.success('分配成功')
            table.refresh()
            self.visibleRedistribution = false
          })
        }
      })
    },
    // 每人提取数量
    allocate () {
      this.allocatestate = true
    },
    // 每人提取数据框不显示
    allocateClose () {
      this.allocatestate = false
    },
    // 刷新
    refresh () {
      this.$refs.table.refresh()
    },
    refresh2 () {
      this.$refs.tableread.refresh()
    },
    refresh3 () {
      this.$refs.tabledetails.refresh()
    },
    // 任务删除
    taskDelete (record) {
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      const self = this
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          self.axios({
            url: '/quality/task/delete',
            data: { id: id }
          }).then(res => {
            self.$message.success('删除成功')
            table.refresh()
          })
        }
      })
    },
    // 查看明细删除
    detailsDelete (record) {
      const table = this.$refs.tabledetails
      const id = record && record.id || this.selectedRowKeys
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/quality/task/viewDetailsDelete',
            data: { id: id }
          }).then(res => {
            self.$message.success('删除成功')
            table.refresh3()
          })
        }
      })
    },
    // 导出
    handleExport () {
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}quality/task/export?where=1=1`, '', '')
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    // 查看明细数据导出
    Taskexport () {
      // let where = JSON.stringify(this.Paramdetails)
      // where = where.split('{')
      // where = where[1].split('}')
      // where = where[0].replace(/"/g, '')
      // where = where.replace(/,/g, '&')
      // where = where.replace(/:/g, '=')
      // this.$confirm({
      //   title: '您确认导出所有数据吗?',
      //   onOk () {
      //     window.open(`${process.env.VUE_APP_API_BASE_URL}quality/task/taskExport/?${where}`, '', '')
      //   }
      // })
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    // 获取提取分配中呼叫时间
    getcallDate (date, dateString) {
      this.start_time = dateString[0]
      this.end_time = dateString[1]
    },
    // 当前月第一天至今
    getyesterday () {
      const sTime = '00:00:00'
      const eTime = '23:59:59'
      var yestime = new Date()
      yestime.setTime(yestime.getTime() - 24 * 60 * 60 * 1000)
      var yesterday = yestime.getFullYear() + '-' + (yestime.getMonth() + 1) + '-' + yestime.getDate()
      this.start_time = yesterday + ' ' + sTime
      this.end_time = yesterday + ' ' + eTime
      this.callDate = [this.start_time ? this.moment(this.start_time, 'YYYY-MM-DD HH:mm:ss') : '', this.end_time ? this.moment(this.end_time, 'YYYY-MM-DD HH:mm:ss') : '']
    },
    // 数据提取->来自于 选择用户
    handleSelect () {
      console.log(this.form.getFieldValue('info[extenlist]'))
      this.$refs.selectUserFormSeat.show({
        page: 'statistic',
        mode: 'multiple',
        selectValue: this.form.getFieldValue('info[extenlist]') ? this.form.getFieldValue('info[extenlist]').split(',') : []
      })
    },
    // 数据分配->分配给 选择用户
    handleSelectQc (data, index) {
      this.config.index = index
      this.$refs.selectUserFormQc.show({
        page: 'statistic',
        mode: 'multiple',
        selectValue: data ? data.split(',') : []
      })
    },
    changedetailsAdvanced (tag) {
      if (tag) {
        this.detailsadvanced = !this.detailsadvanced
      }
      if (this.detailsadvanced) {
        this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
      } else {
        this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
      }
    }
  }
}
</script>
<style scoped>
.input{
  background-color: #F5F5F5;
}
.margin{
  margin-left:80px ;
}
.rattio{
  margin-left: 20px;
}
</style>
