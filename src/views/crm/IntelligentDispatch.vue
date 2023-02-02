<template>
  <a-drawer
    :destroyOnClose="true"
    title="智能派单"
    :width="1300"
    :visible="visible"
    @close="visible = false; $parent.$parent.formThis.pageLoading = false">
    <div>
      <a-card style="padding: 24px; margin-bottom: 24px;">
        <a-steps :current="currentStep">
          <a-step title="选择主修" />
          <a-step title="选择技术员" />
          <a-step title="选择车辆" />
          <a-step title="确认信息" />
        </a-steps>
      </a-card>
      <!-- 选择主修 -->
      <div v-if="currentStep === 0" style="margin-bottom: 48px;">
        <div class="itemContent">
          <a-divider orientation="left" class="title">请选择主修</a-divider>
          <a-spin :spinning="loadingSelect">
            <div style="padding: 32px 24px 0 24px;">
              <a-row type="flex" :gutter="32" style="border-bottom: 1px dashed #EEE; padding-bottom: 16px">
                <a-col>
                  <div style="height: 100%; display: flex; align-items: center">智能排序:</div>
                </a-col>
                <a-col
                  v-for="(item, index) in paixu"
                  :key="index"
                >
                  <div
                    style="padding: 8px; border-radius: 8px; cursor: pointer;"
                    @click="() => {
                      currentIndex = index;
                      searchType = item.type;
                      getEngineerList()
                    }"
                    :class="currentIndex === index ? 'paixuActive' : ''">{{ item.text }}</div>
                </a-col>
              </a-row>
              <a-row :gutter="16" type="flex" align="middle" style="border-bottom: 1px dashed #EEE; padding: 16px 0; margin-bottom: 16px">
                <a-form style="display: flex; align-items: center;" :labelCol="labelCol" :wrapperCol="wrapperCol" >
                  <a-col :span="1" style="margin-right: 16px">
                    <div style="height: 100%; display: flex; align-items: center; white-space: nowrap">分类查询:</div>
                  </a-col>
                  <a-col :span="5">
                    <a-form-item label="服务人员姓名" :labelCol="{ span: 10 }" :wrapperCol="{ span: 14 }">
                      <a-input v-model.trim="queryParam.sfxm" placeholder=""/>
                    </a-form-item>
                  </a-col>
                  <a-col :span="5">
                    <a-form-item label="服务人员电话" :labelCol="{ span: 10 }" :wrapperCol="{ span: 14 }">
                      <a-input v-model.trim="queryParam.sfdh" placeholder=""/>
                    </a-form-item>
                  </a-col>
                  <a-col :span="5">
                    <a-form-item label="技能证书">
                      <a-input v-model.trim="queryParam.jnzs" placeholder=""/>
                    </a-form-item>
                  </a-col>
                  <a-col :span="5">
                    <a-form-item label="擅长技能" style="width: 100%" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
                      <a-select
                        mode="multiple"
                        allowClear
                        placeholder="请选择"
                        @change="(value) => {queryParam.szzyjn = value}"
                        :showSearch="false"
                        v-model="queryParam.szzyjn"
                        changeOnSelect
                      >
                        <a-select-option v-for="(item, key) in szzyjnList" :key="key" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="3">
                    <a-space>
                      <a-button @click="getEngineerList()">搜索</a-button>
                      <a-button
                        @click="() => {
                          queryParam = {};
                          getEngineerList()
                        }"
                        style="margin: 0 8px">重置</a-button>
                    </a-space>
                  </a-col>
                </a-form>
              </a-row>
              <a-form
                style="display: flex; align-items: center; border-bottom: 1px dashed #EEE; padding-bottom: 16px; margin-bottom: 8px"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol">
                <a-col :span="5">
                  <a-form-item label="所属分公司">
                    <a-select v-model="department" @change="(e) => { department = e; getEngineerList() }" size="small">
                      <a-select-option
                        v-for="(item, index) in companyList"
                        :key="index"
                        :value="item.value">{{ item.label }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-form>
              <a-card :bordered="false">
                <a-radio-group v-if="engineerList.length > 0" v-model="valueSelect" @change="onChange" style="width: 100%">
                  <div
                    v-for="(item, index) in engineerList"
                    :key="index"
                    style="margin-bottom: 24px; padding: 16px; border: 1px solid #EEE; box-shadow: 1px 0 4px 2px #EEE; border-radius: 10px;"
                    @click="valueSelect = item.data.id; selectDepartment = item.data._ssfgs_">
                    <a-row type="flex" justify="start">
                      <a-col>
                        <a-radio :value="item.data.id" >
                          确认选择
                        </a-radio>
                      </a-col>
                    </a-row>
                    <a-row type="flex" align="middle">
                      <a-col :span="5">
                        <div class="headInfo">
                          <a-avatar v-if="item.data.zp.length > 0" :size="64" :src="setting.rootUrl+item.data.zp[0].filePath"/>
                          <a-avatar v-else :size="64" icon="user" />
                          <div class="headText">
                            <div>{{ item.data.xm }}</div>
                            <div>{{ item.data.zc }}</div>
                            <div>{{ item.data.dhhm }}</div>
                          </div>
                        </div>
                        <div class="numDiv" style="margin: 16px 0">
                          <div class="number">
                            <div>
                              <icon-font type="haoping"></icon-font>
                              <span style="margin-left: 16px; display: inline-block; width: 28px; white-space: nowrap;">{{ item.myd }}%</span>
                            </div>
                            <div>
                              <icon-font type="riqi" style="color: #000"></icon-font>
                              <span style="margin-left: 16px; display: inline-block; width: 28px; white-space: nowrap;">{{ item.gznx }}年</span>
                            </div>
                          </div>
                          <div class="number">
                            <div>
                              <icon-font type="huojiangzhengshu"></icon-font>
                              <span style="margin-left: 16px; display: inline-block; width: 28px; white-space: nowrap;">{{ item.zssl }}个</span>
                            </div>
                            <div>
                              <icon-font type="jixiaokaohebumenpingfen"></icon-font>
                              <span style="margin-left: 16px; display: inline-block; width: 28px; white-space: nowrap;">{{ item.khdf }}分</span>
                            </div>
                          </div>
                          <div class="number">
                            <div>
                              <icon-font type="daichuli" style="color: #000"></icon-font>
                              <span style="margin-left: 16px; display: inline-block; width: 28px; white-space: nowrap;">{{ item.dcl }}单</span>
                            </div>
                            <div>
                              <icon-font type="yichuli1"></icon-font>
                              <span style="margin-left: 16px; display: inline-block; width: 28px; white-space: nowrap;">{{ item.ycl }}单</span>
                            </div>
                          </div>
                        </div>
                        <div class="tag">
                          <!-- 标签 -->
                          <a-tag
                            v-for="(subItem, subIndex) in item.bq"
                            :key="subIndex"
                            color="blue">
                            {{ subItem }}
                          </a-tag>
                        </div>
                        <!-- 证书 -->
                        <div class="tag">
                          <a-tag
                            v-for="(zsItem, zsIndex) in item.zs"
                            :key="zsIndex"
                            color="purple">
                            {{ zsItem.zzzsmc || '待录入' }}
                          </a-tag>
                        </div>
                        <!-- 智能排序 -->
                        <div class="tag">
                          <a-tag
                            v-for="(zncxItem, zncxIndex) in item.zncx"
                            :key="zncxIndex"
                            color="red">
                            {{ zncxItem }}
                          </a-tag>
                        </div>
                      </a-col>
                      <a-col :span="19">
                        <full-calendar
                          :options="item.calendarOptions"
                          lang="zh">
                        </full-calendar>
                      </a-col>
                    </a-row>
                  </div>
                </a-radio-group>
                <a-empty v-else/>
              </a-card>
            </div>
          </a-spin>
        </div>
        <a-row
          v-if="!loadingSelect"
          type="flex"
          justify="end"
          class="bottomBbar">
          <a-col>
            <a-space>
              <a-button
                type="danger"
                @click="() => {
                  visible = false;
                  $parent.$parent.formThis.pageLoading = false
                }">取消</a-button>
              <a-button
                type="primary"
                @click="() => {
                  if(valueSelect > 0){
                    currentStep = 1
                    const gcsData = engineerList.filter(item => item.data.id === this.valueSelect);
                    gcs_data = gcsData[0];
                    //处理最后一步的主修信息表格
                    gcsData[0].data.gznx = gcsData[0].gznx
                    dataMain = [gcsData[0].data]
                  }else{
                    $message.warning('请先选择主修操作者')
                  }
                }">下一步</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>
      <!-- 选择技术员 -->
      <div v-if="currentStep === 1" style="margin-bottom: 48px;">
        <div class="itemContent">
          <a-divider orientation="left" class="title">请选择技术员</a-divider>
          <div style="padding: 32px 24px 0 24px;">
            <a-form style="border-bottom: 1px dashed #EEE; padding: 16px 0" :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-row :gutter="8" type="flex" align="middle">
                <a-col :span="1">
                  <div style="height: 100%; display: flex; align-items: center; white-space: nowrap">查询:</div>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="姓名">
                    <a-input v-model.trim="queryParamOperator.searchString.xm" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="电话号码">
                    <a-input v-model.trim="queryParamOperator.searchString.dhhm" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="ERP编号">
                    <a-input v-model.trim="queryParamOperator.searchString.erpbh" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="在职身份">
                    <a-input v-model.trim="queryParamOperator.searchString.zzsf" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="3">
                  <a-space>
                    <a-button @click="$refs.tableOperator.refresh(true)">搜索</a-button>
                    <a-button @click="queryParamOperator.searchString = {}; $refs.tableOperator.refresh(true)" style="margin: 0 8px">重置</a-button>
                  </a-space>
                </a-col>
              </a-row>
            </a-form>
            <a-card :bordered="false">
              <div>
                <!-- 技术员选择列表 -->
                <s-table
                  ref="tableOperator"
                  size="small"
                  rowKey="id"
                  :columns="columnsOperator"
                  :data="loadDataTableOperator"
                  :rowSelection="rowSelectionOperator"
                  :sorter="{ field: 'id', order: 'descend' }"
                ></s-table>
              </div>
            </a-card>
          </div>
        </div>
        <a-row type="flex" justify="end" class="bottomBbar" v-if="loadingOperator">
          <a-col>
            <a-space>
              <a-button @click="currentStep = 0">上一步</a-button>
              <a-button
                type="primary"
                @click="() => {
                  if(selectedRowKeysOperator.length > 0 && loadingOperator){
                    queryParamCar.searchString.ssfgs = selectDepartment
                    currentStep = 2
                    $nextTick(() => {
                      this.$refs.tableCar.refresh(true)
                    })
                  }else{
                    $message.warning('请先选择技术员')
                  }
                }">下一步</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>
      <!-- 选择车辆 -->
      <div v-if="currentStep === 2" style="margin-bottom: 48px;">
        <div class="itemContent">
          <a-divider orientation="left" class="title">请选择车辆</a-divider>
          <div style="padding: 32px 24px 0 24px;">
            <a-form style="border-bottom: 1px dashed #EEE; padding: 16px 0" :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-row :gutter="8" type="flex" align="middle">
                <a-col :span="1">
                  <div style="height: 100%; display: flex; align-items: center; white-space: nowrap">查询:</div>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="车辆编号">
                    <a-input v-model.trim="queryParamCar.searchString.clbh" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="车辆类型">
                    <a-input v-model.trim="queryParamCar.searchString.cllx" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="车牌号">
                    <a-input v-model.trim="queryParamCar.searchString.cph" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item label="司机姓名">
                    <a-input v-model.trim="queryParamCar.searchString.sjxm" placeholder=""/>
                  </a-form-item>
                </a-col>
                <a-col :span="3">
                  <a-space>
                    <a-button @click="$refs.tableCar.refresh(true)">搜索</a-button>
                    <a-button @click="queryParamCar.searchString = {}; $refs.tableCar.refresh(true)" style="margin: 0 8px">重置</a-button>
                  </a-space>
                </a-col>
              </a-row>
            </a-form>
            <a-card :bordered="false">
              <div>
                <s-table
                  ref="tableCar"
                  size="small"
                  rowKey="id"
                  :columns="columns"
                  :data="loadDataTable"
                  :rowSelection="rowSelection"
                  :sorter="{ field: 'id', order: 'descend' }"
                >
                  <div slot="sjxm" slot-scope="text,record">
                    <a-input v-model="record.sjxm"></a-input>
                  </div>
                  <div slot="sjdh" slot-scope="text,record">
                    <a-input v-model="record.sjdh"></a-input>
                  </div>
                </s-table>
              </div>

            </a-card>
          </div>
        </div>
        <a-row type="flex" justify="end" class="bottomBbar" v-if="loadingCar">
          <a-col>
            <a-space>
              <a-button
                @click="() => {
                  currentStep = 1
                  $nextTick(() => {
                    this.$refs.tableOperator.refresh(true)
                  })
                }">上一步</a-button>
              <a-button
                type="primary"
                @click="() => {
                  currentStep = 3;
                }">下一步</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>
      <!-- 确认信息 -->
      <div v-if="currentStep === 3" style="margin-bottom: 48px;">
        <div class="itemContent">
          <a-divider orientation="left" class="title">请确认派工信息</a-divider>
          <div style="padding: 32px 24px 0 24px;">
            <div class="itemRow" style="margin-bottom: 40px;">
              <div style="font-size: 16px; font-weight: bold">工单概况</div>
              <a-table
                size="small"
                :rowKey="(record, index) => index"
                :columns="columnsCondition"
                :dataSource="dataCondition"
                :pagination="false"
              ></a-table>
            </div>
            <div class="itemRow" style="margin-bottom: 40px;">
              <div style="font-size: 16px; font-weight: bold">主修信息</div>
              <a-table
                size="small"
                :rowKey="(record, index) => index"
                :columns="columnsMain"
                :dataSource="dataMain"
                :pagination="false"
              ></a-table>
            </div>
            <div class="itemTable" style="margin-bottom: 40px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">技术员</div>
              <a-table
                size="small"
                :rowKey="(record, index) => index"
                :columns="columnsOperator"
                :dataSource="dataOperatorShow"
                :pagination="false"
              ></a-table>
            </div>
            <div class="itemTable" style="margin-bottom: 24px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">车辆信息</div>
              <a-table
                size="small"
                :rowKey="(record, index) => index"
                :columns="columns"
                :dataSource="dataCarShow"
                :pagination="false"
              ></a-table>
            </div>
          </div>
        </div>
        <a-row type="flex" justify="end" class="bottomBbar">
          <a-col>
            <a-space>
              <a-button @click="currentStep = 2">上一步</a-button>
              <a-button type="primary" @click="submit">提交</a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-drawer>

</template>
<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Icon } from 'ant-design-vue'
import iconFront from '@/assets/icons/iconfont'
import { mapGetters } from 'vuex'
const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront // 在 iconfont.cn 上生成
})
export default {
  components: {
    FullCalendar,
    IconFont
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  data () {
    return {
      szzyjnList: [],
      gcs_data: {}, // 选中的主修操作者信息
      department: '', // 选择所属分公司
      companyList: [
        { label: '西南分公司', value: 'xnfgs' },
        { label: '东部分公司', value: 'dbfgs' },
        { label: '新疆分公司', value: 'xjfgs' },
        { label: '长庆分公司', value: 'zqfgs' }
      ],
      visible: false,
      loading: false,
      searchType: '',
      // 选择主修服务人员 搜索参数
      queryParam: {},
      // 车辆列表搜索参数
      queryParamCar: {
        searchString: {},
        associated: [],
        customColumns: [],
        tplviewid: 'b761d46cd8391678220c83235541a189'
      },
      // 技术员列表搜索参数
      queryParamOperator: {
        // 工程师信息表中岗位为技术员的数据
        searchString: {
          gw: ['jsy2']
        },
        associated: [],
        customColumns: [],
        tplviewid: 'b2ed068b0996174adfa86df412f02ea9'
      },
      colLayout: { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 },
      labelCol: { style: 'width: 80px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 80px); display: inline-block;' },
      labelColSure: { style: 'width: 120px; display: inline-block' },
      wrapperColSure: { style: 'width: calc(100% - 120px); display: inline-block;' },
      // 新增
      currentIndex: 0,
      paixu: [
        { text: '智能排序', type: '' },
        { text: '近三个月服务优先', type: 'j3gyfwyx' },
        { text: '上次服务优先', type: 'scfwyx' },
        { text: '工作年限优先', type: 'gznxyx' },
        { text: '职称优先', type: 'zcyx' },
        { text: '定期考核优先', type: 'dqkhyx' },
        { text: '满意度优先', type: 'mydyx' },
        { text: '证书多优先', type: 'zsslyx' }
      ],
      // 步骤 索引 0-选择主修操作者 依次叠加1
      currentStep: 0,
      valueSelect: 0,
      selectDepartment: '',
      // 车辆信息数据表头
      columns: [ {
        title: '车辆编号',
        dataIndex: 'clbh'
      }, {
        title: '车辆类型',
        dataIndex: 'cllx'
      }, {
        title: '车牌号',
        dataIndex: 'cph'
      }, {
        title: '司机姓名',
        dataIndex: 'sjxm',
        scopedSlots: { customRender: 'sjxm' }
      }, {
        title: '司机电话',
        dataIndex: 'sjdh',
        scopedSlots: { customRender: 'sjdh' }
      }, {
        title: '复审期限',
        dataIndex: 'fsqx'
      }],
      // 车辆列表选择
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.dataCarShow = selectedRows
        }
      },
      loadingOperator: false,
      loadingCar: false,
      loadingSelect: false,
      // 主修信息数据
      columnsMain: [ {
        title: '主修操作者',
        dataIndex: 'xm'
      }, {
        title: '主修操作者电话',
        dataIndex: 'dhhm'
      }, {
        title: '主修操作者职称',
        dataIndex: 'zc'
      }, {
        title: '工作年限',
        dataIndex: 'gznx'
      }],
      // 技术员信息数据
      columnsOperator: [ {
        title: '姓名',
        dataIndex: 'xm'
      }, {
        title: '电话号码',
        dataIndex: 'dhhm'
      }, {
        title: '性别',
        dataIndex: 'xb'
      }, {
        title: '所属部门',
        dataIndex: 'ssbm'
      }, {
        title: '所属分公司',
        dataIndex: 'ssfgs'
      }, {
        title: 'ERP编号',
        dataIndex: 'erpbh'
      }],
      // 工单概况数据
      columnsCondition: [ {
        title: '要求实施入场日期',
        dataIndex: 'yqssrcrq'
      }, {
        title: '预计完成日期',
        dataIndex: 'yjwcrq'
      }, {
        title: '服务类型',
        dataIndex: 'fwlx'
      }, {
        title: '派工时间',
        dataIndex: 'pgsj'
      }],
      // 技术员选择
      selectedRowKeysOperator: [],
      rowSelectionOperator: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeysOperator = selectedRowKeys
          this.dataOperatorShow = selectedRows
        },
        type: 'radio'
      },
      config: '',
      dataCondition: [], // 最后一步的工单概况表格
      dataMain: [], // 最后一步的主修信息表格
      // 确认信息显示数据 步骤3最后一步
      dataOperatorShow: [], // 技术员选中的数据
      dataCarShow: [], // 车辆选中的数据
      engineerList: []
    }
  },
  created () {

  },
  methods: {
    show (config) {
      this.config = config
      this.department = config.data.crm_xjaz.azdw
      const fwlxList = [{ label: '三包外', value: 'sbw2' }, { label: '三包内', value: 'sbn2' }]
      const fwlxForm = fwlxList.find(item => config.data.crm_xjaz.fwlx === item.value) || '--'
      const fwlx = fwlxForm.label
      const { yqssrcrq, yjwcrq } = config.data.crm_xjaz
      const pgsj = this.moment().format('YYYY-MM-DD HH:mm:ss')
      this.dataCondition = [{
        yqssrcrq, yjwcrq, fwlx, pgsj
      }]
      this.visible = true
      this.parent = config.parent
      this.title = config.title
      this.result = config.result
      this.getEngineerList()
      this.getOption()
    },
    submit () {
      const data = {
        gcs_data: this.gcs_data.data, // 选中的主修操作者
        jsy_data: this.dataOperatorShow, // 选中的技术员
        car_data: this.dataCarShow // 选中的车辆
      }
      const formData = {
        confirm: true,
        extFormData: data
      }
      this.visible = false
      this.parent.handleSubmit(formData)
    },
    // 获取技能列表
    getOption () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'szzyjn' }
      }).then(res => {
        this.szzyjnList = res.result
      })
    },
    getEngineerList () {
      this.loadingSelect = true
      this.axios({
        url: '/crm/Order/orderCheck',
        data: {
          searchType: this.searchType,
          department: this.department, // 所属分公司
          tableid: this.config.data.tableid,
          // 'crm_xjaz[ccbh]': this.config.data.crm_xjaz.ccbh,
          crm_xjaz: {
            ccbh: this.config.data.crm_xjaz.ccbh
          },
          sfxm: this.queryParam.sfxm || '',
          sfdh: this.queryParam.sfdh || '',
          jnzs: this.queryParam.jnzs || '',
          szzyjn: this.queryParam.szzyjn || '',
          bbjn: this.config.data.crm_xjaz.bxmbbjn || [],
          bbzs: this.config.data.crm_xjaz.bxmbbzj || []
        }
      }).then(res => {
        if (res.code === 0) {
          this.loadingSelect = false
          this.engineerList = res.result.map(item => {
            var calendarOptions = {
              // 日历配置项
              plugins: [ dayGridPlugin, interactionPlugin ],
              initialView: 'dayGridMonth',
              // 日历语言 中文
              locale: 'zh-cn',
              // 日历高度
              height: '530px',
              // 显示事件内容
              // events: [{
              //   'title': 'A项目',
              //   'start': '2021-06-01',
              //   'end': '2021-06-02',
              //   'className': 'grayColor',
              //   'borderColor': 'transparent'
              // }, {
              //   'title': 'B项目',
              //   'start': '2021-06-03',
              //   'end': '2021-06-04',
              //   'className': 'redColor',
              //   'borderColor': 'transparent'
              // }, {
              //   'title': 'C项目',
              //   'start': '2021-06-05',
              //   'end': '2021-06-15',
              //   'className': 'greenColor',
              //   'borderColor': 'transparent'
              // }]
              events: item.time
            }
            var obj = Object.assign(item, { calendarOptions: calendarOptions })
            return obj
          })
        }
      })
    },
    onChange (e) {
      this.valueSelect = e.target.value
    },
    // 技术员列表页面渲染
    loadDataTableOperator (parameter) {
      this.queryParamOperator.searchString.ssfgs = this.gcs_data.data._ssfgs_
      this.loadingOperator = false
      return this.axios({
        url: '/admin/UserTable/init',
        data: Object.assign(parameter, this.queryParamOperator)
      }).then(res => {
        this.loadingOperator = true
        return res.result
      })
    },
    // 车辆列表页面渲染
    loadDataTable (parameter) {
      this.loadingCar = false
      return this.axios({
        url: '/admin/UserTable/init',
        data: Object.assign(parameter, this.queryParamCar)
      }).then(res => {
        this.loadingCar = true
        return res.result
      })
    }
  }
}
</script>
<style scoped lang="less">
// 日历插件表头样式 修改默认阴影
/deep/.fc{
  .fc-button-primary:focus,.fc-button:focus{
    box-shadow: 0 0 0 3px #a5adb4 !important;
  }
  .fc-daygrid-day-number{
    padding: 4px 12px !important;
  }
}
.itemContent{
  border-right: 1px solid #EEE;
  border-bottom: 1px solid #EEE;
  border-left: 1px solid #EEE;
  position: relative;
  .title{
    top: -20px;
    position: absolute;
  }
}
.bottomBbar{
  position: absolute;
  bottom: 0;
  width: 100%;
  right: 0;
  padding: 10px 32px;
  background: white;
  z-index: 1;
  border-top: 1px solid #e9e9e9;
}
.paixuActive{
  background: #1890FF;
  color: white;
}
.headInfo{
  display: flex;
  align-items: center;
  justify-content: space-around;
  .headText{
    div{
      text-align: center;
      line-height: 24px;
    }
  }
}
.number{
  display: flex;
  justify-content: space-around;
  padding: 4px 8px;
  /deep/.anticon{
    font-size: 16px;
  }
}
.tag{
  padding: 0 24px;
  .ant-tag{
    margin-bottom: 8px;
  }
}
// 灰色：代表服务已结束，显示时间周期={打卡出发日期}至{服务人员完工日期}
/deep/.grayColor{
  background: #BFBFBF !important;
  color: #000 !important;
}
// 绿色：代表服务待出发，显示时间周期={要求实施入场日期}至{预计完成日期}
/deep/.greenColor{
  background: #a0c468 !important;
  color: #000 !important;
}
// 红色：代表服务进行中，显示时间周期={打卡出发日期}至{预计完成日期}
/deep/.redColor {
  background: #d3818a !important;
  color: #000 !important;
}
</style>
