<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="名称">
        <a-input v-model="queryParam.keyword" placeholder="" />
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
        <a-button v-action:add type="primary" icon="plus" @click="handleAdd">添加</a-button>
      </a-space>
    </a-form>
    <a-row type="flex" :gutter="8">
      <a-col flex="1">
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="columns"
          :data="loadDataTable"
          :sorter="{ field: 'id', order: 'descend' }"
          :customRow="customRow"
        >
          <div slot="action" slot-scope="text,record">
            <a @click="handleView(record)">详情</a>
            <a-divider type="vertical" />
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </div>
        </s-table>
      </a-col>
      <!-- 详情框 -->
      <a-col flex="1" v-if="showContent">
        <a-spin :spinning="loading">
          <a-card :title="showContent?'详情':contentTitle">
            <a-form :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-form-item label="名称" style="margin-bottom: 8px">
                <a-input disabled v-decorator="['selectRowForm[name]', { initialValue: selectRowForm.name}]"/>
              </a-form-item>
              <a-form-item label="优先级" style="margin-bottom: 8px">
                <a-input disabled v-model="selectRowForm.priority"></a-input>
              </a-form-item>
              <a-form-item label="条件设置">
                <a-select disabled v-model="defaultValueExset" style="width: 80px; margin-bottom: 8px" size="small">
                  <a-select-option value="and">且(and)</a-select-option>
                </a-select>
                <a-row type="flex" align="middle" style="margin-bottom: 12px;" v-for="(value, index) in simpleCondition" :key="index">
                  <a-col :span="22" style="border: 1px solid #EEE">
                    <a-row type="flex" align="middle" :gutter="10" style="padding: 10px 0 8px 10px">
                      <!-- 详情框 -->
                      <!-- 外层 -->
                      <a-col :span="8">
                        <a-select
                          disabled
                          placeholder="请选择"
                          v-model="value.type"
                          :allowClear="true"
                          size="small"
                          @change="()=>{value.settingList2 = [{}] }">
                          <a-select-option :value="valueList.name" v-for="(valueList, indexList) in value.settingList" :key="indexList">
                            {{ valueList.name }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <!-- 子级 非地址栏 -->
                      <a-col :span="9" v-if="!value.isAddress && value.show && !value.isAscader">
                        <a-row type="flex" align="middle" :gutter="10">
                          <a-col :span="24" v-for="(valueItem, key) in value.settingList2" :key="key">
                            <a-select disabled placeholder="请选择" :allowClear="true" size="small" v-model="valueItem.label">
                              <a-select-option v-for="(valueSetting, indexSetting) in typeList" :key="indexSetting" :value="valueSetting.value">
                                {{ valueSetting.label }}
                              </a-select-option>
                            </a-select>
                          </a-col>
                        </a-row>
                      </a-col>
                      <!-- 子级 地址栏 -->
                      <a-col :span="9" v-if="value.isAddress && value.show">
                        <a-row>
                          <a-col :span="24" v-for="(valueItem, key) in value.settingList2" :key="key">
                            <a-input :value="valueItem.name" disabled></a-input>
                          </a-col>
                        </a-row>
                      </a-col>
                      <!-- 产品类别 级联选择栏 -->
                      <a-col :span="9" v-if="!value.isAddress && value.show && value.isAscader">
                        <a-row>
                          <a-col :span="24" v-for="(valueItem, key) in value.settingList2" :key="key">
                            <a-input disabled :value="valueItem.name"></a-input>
                          </a-col>
                        </a-row>
                      </a-col>
                    </a-row>
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item label="派送目的地" style="margin-bottom: 8px">
                <a-card >
                  <a-table
                    ref="tableExportMy"
                    size="small"
                    :rowKey="(record, index) => index"
                    :columns="columnsDestination"
                    :dataSource="dataDestination"
                    :pagination="false"
                  >
                    <div slot="weight" slot-scope="text,record">
                      <a-input disabled type="number" v-model="record.weight"></a-input>
                    </div>
                    <div slot="num" slot-scope="text,record">
                      <a-input disabled type="number" v-model="record.num"></a-input>
                    </div>
                  </a-table>
                </a-card>
              </a-form-item>
            </a-form>
          </a-card>
        </a-spin>
      </a-col>
      <!-- 页面初始显示 暂无数据组件 -->
      <a-col flex="1" v-if="!showContent">
        <a-card style="display: flex; justify-content: center; width: 100%; height: 100%">
          <a-empty />
        </a-card>
      </a-col>
    </a-row>
    <!-- 编辑抽屉 -->
    <a-drawer
      :destroyOnClose="true"
      :title="contentTitle"
      :width="1000"
      :visible="visible"
      @close="visible = false" >
      <a-spin :spinning="loading">
        <a-card>
          <a-form :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-form-item label="名称" style="margin-bottom: 8px">
              <a-input v-decorator="['selectRowForm[name]', { initialValue: selectRowForm.name, rules: [{ required: true, message: '请输入名称' }] }]"/>
            </a-form-item>
            <a-form-item label="优先级" style="margin-bottom: 8px">
              <a-input placeholder="" type="number" v-model="selectRowForm.priority"></a-input>
            </a-form-item>
            <a-form-item label="条件设置" :required="true">
              <a-select v-model="defaultValueExset" style="width: 80px; margin-bottom: 8px" size="small">
                <a-select-option value="and">且(and)</a-select-option>
              </a-select>
              <a-row type="flex" align="middle" style="margin-bottom: 12px;" v-for="(value, index) in simpleCondition" :key="index">
                <a-col :span="22" style="border: 1px solid #EEE">
                  <a-row type="flex" align="middle" :gutter="10" style="padding: 10px 0 8px 10px">
                    <!-- 编辑框 -->
                    <!-- 外层 -->
                    <a-col :span="8">
                      <a-select placeholder="请选择" v-model="value.type" :allowClear="true" size="small" @change="()=>{value.settingList2 = [{}] }">
                        <a-select-option :value="valueList.name" v-for="(valueList, indexList) in value.settingList" :key="indexList" @click="selectedSetting(valueList,indexList,index)">
                          {{ valueList.name }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <!-- 子级 非地址栏 -->
                    <a-col :span="9" v-if="!value.isAddress && value.show && !value.isAscader">
                      <a-row type="flex" align="middle" :gutter="10">
                        <a-col :span="24" v-for="(valueItem, key) in value.settingList2" :key="key">
                          <a-select
                            placeholder="请选择"
                            :allowClear="true"
                            size="small"
                            v-model="valueItem.value">
                            <a-select-option
                              v-for="(valueSetting, indexSetting) in value.typeList"
                              :key="indexSetting"
                              :disabled="value.settingList2.some(item=> item.value === valueSetting.value)"
                              :value="valueSetting.value"
                              @click="(e)=>{
                                valueItem.label=valueSetting.label;
                              }">
                              {{ valueSetting.label }}
                            </a-select-option>
                          </a-select>
                        </a-col>
                      </a-row>
                    </a-col>
                    <!-- 子级 地址栏 -->
                    <a-col :span="9" v-if="value.isAddress && value.show">
                      <a-row>
                        <a-col :span="24" v-for="(valueItem, key) in value.settingList2" :key="key">
                          <address-select size="small" series="4" :defaultValue="valueItem.value" :display="valueItem.name" @send="(name,number) => {valueItem.name = name;valueItem.value = number;}"/> <!---->
                        </a-col>
                      </a-row>
                    </a-col>
                    <!-- 产品类别 级联选择栏 -->
                    <a-col :span="9" v-if="!value.isAddress && value.show && value.isAscader">
                      <a-row>
                        <a-col :span="24" v-for="(valueItem, key) in value.settingList2" :key="key">
                          <tabs-select
                            :defaultValue="valueItem.value"
                            :writeBack="[{
                              tab:'产品分类',
                              value:''
                            },{
                              tab:'产品品类',
                              value:''
                            }]"
                            :field="{
                              value:'test'
                            }"
                            valueKey="chanpin_fl"
                            size="small"
                            fieldType="search"
                            action="edit"
                            :display="valueItem.name"
                            @send="(val, alias, display, status, allValue) =>{ valueItem.value = val; valueItem.name = display; valueItem.allValue = allValue }" />
                        </a-col>
                      </a-row>
                    </a-col>
                    <!-- 子级加号/减号 -->
                    <a-col :span="2" style="display: flex; align-items: center" v-if="value.show">
                      <a-icon
                        :style="{ fontSize: '24px', color: '#52c41a'}"
                        type="plus-square"
                        theme="filled"
                        @click="value.settingList2.push({})"/> <!-- value.settingList2.splice(index + 1, 0 , {}) -->
                      <a-icon
                        :style="{ fontSize: '24px', color: value.settingList2.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }"
                        type="minus-square"
                        theme="filled"
                        @click="() => {
                          if(value.settingList2.length > 1){
                            value.settingList2.pop()
                          }
                        }" /> <!-- value.settingList2.splice(index + 1, 0 , {}) -->
                    </a-col>
                    <!-- 或 -->
                    <a-col :span="2">
                      <a-select v-model="value.logic" style="width: 80px; margin-left: 15px;" size="small">
                        <a-select-option value="or">或(or)</a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-col>
                <!-- 外级加号/减号（外层数组） -->
                <a-col :span="2" style="padding-top: 8px; padding-left: 4px">
                  <a-icon
                    :style="{ fontSize: '24px', color: '#52c41a'}"
                    type="plus-square"
                    theme="filled"
                    @click="simpleCondition.splice(index + 1, 0 , {
                      settingList: [
                        { name: '服务项目' },
                        { name: '产品类别' },
                        { name: '购买渠道' },
                        { name: '客户地址' },
                        { name: '网点承包范围' },
                        { name: '只派自营网点' },
                        { name: '只派服务商' },
                        { name: '谁安装谁处理' },
                        { name: '同一个客户报修时间内再处理' },
                        { name: '谁未完成谁处理' },
                        { name: '优先派送服务商' }
                      ],
                      settingList2: [{}],
                      logic: 'or',
                      isAddress: false,
                      isAscader: false,
                      show: true,
                    })"/>
                  <a-icon
                    :style="{ fontSize: '24px', color: simpleCondition.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }"
                    type="minus-square"
                    theme="filled"
                    @click="() => {
                      if(simpleCondition.length !== 1){
                        simpleCondition.splice(index, 1)
                      }
                    }" />
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item :required="true" label="派送目的地" style="margin-bottom: 8px">
              <a-card >
                <div slot="title">
                  <a-select
                    show-search
                    placeholder="请选择"
                    option-filter-prop="children"
                    :filter-option="filterOption">
                    <a-select-option :value="valueAddress.name" v-for="(valueAddress,indexAddress) in websiteList" :key="indexAddress" @click="selected(valueAddress)">
                      {{ valueAddress.name }}
                    </a-select-option>
                  </a-select>

                </div>
                <a-table
                  ref="tableExportMy"
                  size="small"
                  :rowKey="(record, index) => index"
                  :columns="columnsDestination"
                  :dataSource="dataDestination"
                  :pagination="false"
                >
                  <div slot="weight" slot-scope="text,record">
                    <a-input type="number" min="0" v-model="record.weight"></a-input>
                  </div>
                  <div slot="num" slot-scope="text,record">
                    <a-input type="number" min="0" v-model="record.num"></a-input>
                  </div>
                  <span slot="action" slot-scope="text, record, index">
                    <a @click="DeleteData(record,index)">删除</a>
                  </span>
                </a-table>
              </a-card>
            </a-form-item>
          </a-form>
          <div slot="actions" style="text-align: right; margin-right: 16px;">
            <a-button type="primary" @click="handleSubmit">保存</a-button>
          </div>
        </a-card>
      </a-spin>

    </a-drawer>
  </a-card>
</template>
<script>
export default {
  components: {
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect')
  },
  data () {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      // 是否显示级联选择框
      showContent: false,
      contentTitle: '编辑信息：1',
      rowId: 1,
      defaultValueExset: 'and',
      selectRowForm: {
        name: '',
        priority: 0
      },
      deliveryAddress: '',
      // 服务项目、购买渠道 接口返回
      fwxmOption: [],
      gmqdOption: [],
      // 网点 派送目的地
      websiteList: [],
      // 服务项目 产品类别 等类型字段
      typeList: [
        { label: '安装', value: 'azd' },
        { label: '维修', value: 'wxd' },
        { label: '退货', value: 'thd' },
        { label: '换货', value: 'hhd' }
      ],
      // 条件设置栏 选择器
      simpleCondition: [{
        settingList: [
          { name: '服务项目' },
          { name: '产品类别' },
          { name: '购买渠道' },
          { name: '客户地址' },
          { name: '网点承包范围' },
          { name: '只派自营网点' },
          { name: '只派服务商' },
          { name: '谁安装谁处理' },
          { name: '同一个客户报修时间内再处理' },
          { name: '谁未完成谁处理' },
          { name: '优先派送服务商' }
        ],
        // 每一项的数组条数
        settingList2: [{}],
        logic: 'or',
        isAddress: false, // 是否显示地址栏 否则显示其他选择栏
        isAscader: false, // 级联选择
        show: true, // 是否显示设置选择器栏
        // type: '' // settingList 选中的值
        typeList: [
          { label: '安装', value: 'azd' },
          { label: '维修', value: 'wxd' },
          { label: '退货', value: 'thd' },
          { label: '换货', value: 'hhd' }
        ]
      }],
      // 重置 默认显示数据跟simpleCondition相同
      resetData: [{
        settingList: [
          { name: '服务项目' },
          { name: '产品类别' },
          { name: '购买渠道' },
          { name: '客户地址' },
          { name: '网点承包范围' },
          { name: '只派自营网点' },
          { name: '只派服务商' },
          { name: '谁安装谁处理' },
          { name: '同一个客户报修时间内再处理' },
          { name: '谁未完成谁处理' },
          { name: '优先派送服务商' }
        ],
        settingList2: [{}],
        logic: 'or',
        isAddress: false,
        isAscader: false,
        show: true
      }],
      queryParam: {
        sortOrder: 'ascend'
      },
      // 表头
      columns: [{
        title: '操作',
        align: 'center',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '优先级',
        dataIndex: 'yxj',
        width: 100
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 100
      }, {
        title: '名称',
        dataIndex: 'mc'
      }, {
        title: '最后修改人',
        dataIndex: 'zhxgr',
        width: 120
      }, {
        title: '最后修改时间',
        dataIndex: 'zhxgsj',
        width: 150
      }],
      selectedRowKeys: [],
      labelCol: { style: 'width: 90px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block' },
      // 派送目的地表格
      columnsDestination: [{
        title: '目的地',
        dataIndex: 'name'
      }, {
        title: '派单权重',
        dataIndex: 'weight',
        scopedSlots: { customRender: 'weight' }
      }, {
        title: '已派单次数',
        dataIndex: 'num',
        scopedSlots: { customRender: 'num' }
      }, {
        title: '操作',
        scopedSlots: { customRender: 'action' }
      }],
      // 表格数据源数组
      dataDestination: [{
        name: '',
        value: '',
        type: 'auto_service',
        weight: 1,
        num: 1
      }]
    }
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },

    // 获取服务项目
    getfwxmOption () {
      this.axios({
        url: '/crm/OrderRule/getfwxmOption'
      }).then(res => {
        this.fwxmOption = res.result
      })
    },
    // 获取购买渠道
    getgmqdOption () {
      this.axios({
        url: '/crm/OrderRule/getgmqdOption'
      }).then(res => {
        this.gmqdOption = res.result
      })
    },
    // 派送目的地列表
    getWebsiteList () {
      this.axios({
        url: '/crm/OrderRule/wdlist'
      }).then(res => {
        // this.$nextTick(() => {

        // })
        this.websiteList = res.result
        this.dataDestination = [{
          // name: res.result[0].wdmc,
          // value: res.result[0].wdbh,
          name: res.result[0].name,
          value: res.result[0].value,
          weight: 1,
          num: 0
        }]
      })
    },
    handleDelete (record) {
      this.rowId = record.id
      const that = this
      this.$confirm({
        title: '您确认要删除该记录吗',
        onOk () {
          that.axios({
            url: '/crm/OrderRule/delete',
            data: {
              id: record.id
            }
          }).then(res => {
            that.$message.success('删除成功')
            that.$refs.table.refresh(true)
            that.showContent = false
          })
        }
      })
    },
    // 保存
    handleSubmit () {
      this.form.validateFields((err, values) => {
        // 表单校验通过
        if (!err) {
          const isSure = this.simpleCondition.some(item => {
            // 判断是否 选择了父条件 没有选子级条件
            return (JSON.stringify(item.settingList2[0]) === '{}' && item.show)
          })
          if (isSure) {
            this.$message.warning('请确认设置条件')
            return
          }
          if (this.dataDestination.length === 0) {
            this.$message.warning('请至少选择一个派送目的地')
            return
          }
          // return false
          // 校验通过提交接口参数
          this.loading = true
          const conditionArr = this.simpleCondition.map((item, index) => {
            return ({
              myid: Number(new Date().valueOf()) + index, // 时间戳（前端自动生成，每次改变）
              type: item.type,
              value: JSON.stringify(item.settingList2[0]) === '{}' ? ['system'] : item.settingList2, // 判断对象是否空 表示不用选子级菜单项 如网点承包范围
              exset: 'or'
            })
          })
          let formData = {
            name: this.form.getFieldValue('selectRowForm[name]'), // 名称 this.form.getFieldValue('')
            yxj: this.selectRowForm.priority, // 优先级
            exset: this.defaultValueExset, // 条件连接方式 默认"and"
            // 条件数组（数组）
            condition: conditionArr,
            // 派送目的地（数组）
            target: this.dataDestination
          }
          if (this.contentTitle === '添加') {
            // 编辑的时候传 新增不用
          } else {
            formData = Object.assign(formData, { id: this.rowId })
          }
          this.axios({
            url: '/crm/OrderRule/saveRule',
            data: formData
          }).then(res => {
            this.visible = false
            this.loading = false
            this.$message.success(res.message)
            this.$refs.table.refresh(true) // 刷新数据
            // 清空表单
            if (this.contentTitle === '添加') {
              this.simpleCondition = this.resetData
              this.typeList = []
              this.dataDestination = []
              this.$nextTick(() => {
                this.form.setFieldsValue({
                  'selectRowForm[name]': ''
                })
              })
              this.selectRowForm.priority = 0
              this.deliveryAddress = undefined
            }
          })
        }
      })
    },
    // 加载表格数据
    loadDataTable (parameter) {
      // this.queryParam.sortOrder = parameter.sortOrder === 'ascend' ? 'ASC' : 'DESC'
      this.queryParam.sortOrder = 'ascend'
      parameter.sortField = ['yxj', 'id']
      // parameter.sortOrder = 'ascend'
      return this.axios({
        url: '/crm/OrderRule/loadlist',
        data: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    DeleteData (record, index) {
      this.dataDestination.splice(index, 1)
    },
    selected (e) {
      console.log(e)
      const object = {
        name: e.name,
        value: e.value,
        type: e.type,
        weight: 1,
        num: 0
      }
      const arr = this.dataDestination.map(item => {
        return item.name
      })
      if (arr.indexOf(e.name) !== -1) {
      } else {
        this.dataDestination.push(object)
      }
    },
    // 条件设置 选择框1
    selectedSetting (valueList, indexList, index) {
      this.simpleCondition[index].type = valueList.name
      this.simpleCondition[index].show = true
      this.simpleCondition[index].isAddress = false
      this.simpleCondition[index].isAscader = false
      // isAscader
      switch (indexList) {
        // 服务项目
        case 0:
          this.simpleCondition[index].typeList = this.fwxmOption
          break
        // 产品类别
        case 1:
          this.simpleCondition[index].isAscader = true
          break
        // 购买渠道
        case 2:
          this.simpleCondition[index].typeList = this.gmqdOption
          break
          // 客户地址
        case 3:
          this.simpleCondition[index].isAddress = true
          break
          // 网点承包范围(不显示选择框)
        case 4:
          this.simpleCondition[index].show = false
          this.$message.warning('该条件自动读取系统网点承包范围，无需手动设置')
          break
          // 只派自营网点(不显示选择框)
        case 5:
          this.simpleCondition[index].show = false
          this.$message.warning('该条件限定只派送自营网点')
          break
          // 服务商承包范围(不显示选择框)
        // case 6:
        //   this.simpleCondition[index].show = false
        //   this.$message.warning('该条件自动读取系统服务商承包范围，无需手动设置')
        //   break
          // 只派服务商(不显示选择框)
        case 6:
          this.simpleCondition[index].show = false
          this.$message.warning('该条件限定只派送服务商')
          break
          // 谁安装谁处理(不显示选择框)
        case 7:
          this.simpleCondition[index].show = false
          this.$message.warning('该条件找到上一次安装处理的网点或服务商')
          break
          // 同一个客户报修时间内处理 月
        case 8:
          const arr = []
          for (let i = 0; i <= 11; i++) {
            arr.push({
              label: i,
              value: i
            })
          }
          this.simpleCondition[index].typeList = arr
          break
          // 谁未完成谁处理（同 服务项目）
        case 9:
          this.simpleCondition[index].typeList = this.fwxmOption
          break
          // 优先派送服务商
        case 10:
          this.simpleCondition[index].show = false
          this.$message.warning('该条件优先派送目的地第一个服务商，并不会判断服务范围')
          break
      }
    },
    // 详情查看
    handleView (record) {
      this.showContent = true
      this.contentTitle = '详情'
      this.getInfo(record)
    },
    // 编辑
    handleEdit (record) {
      this.visible = true
      this.contentTitle = '编辑信息：' + record.id
      this.getInfo(record)
    },
    // 获取信息
    getInfo (record) {
      this.rowId = record.id
      this.$nextTick(() => {
        this.form.setFieldsValue({
          'selectRowForm[name]': record.mc
        })
      })
      this.selectRowForm.priority = record.yxj || 0
      // 加载对应id 规则详情
      this.axios({
        url: '/crm/OrderRule/detailes',
        data: { id: record.id }
      }).then(res => {
        this.dataDestination = res.result.target
        const condition = res.result.condition
        this.simpleCondition = []
        condition.forEach((item, index) => {
          this.simpleCondition.push({
            settingList: [
              { name: '服务项目' },
              { name: '产品类别' },
              { name: '购买渠道' },
              { name: '客户地址' },
              { name: '网点承包范围' },
              { name: '只派自营网点' },
              { name: '只派服务商' },
              { name: '谁安装谁处理' },
              { name: '同一个客户报修时间内再处理' },
              { name: '谁未完成谁处理' },
              { name: '优先派送服务商' }
            ],
            settingList2: item.value, // 每一项的 选中的数组条数
            logic: item.exset,
            isAddress: item.type === '客户地址', // 是否显示地址栏 否则显示其他选择栏
            isAscader: item.type === '产品类别',
            show: item.type === '服务项目' || item.type === '产品类别' || item.type === '购买渠道' || item.type === '客户地址' || item.type === '同一个客户报修时间内处理' || item.type === '谁未完成谁处理' || item.type === '优先派送服务商', // 是否显示设置选择器栏
            type: item.type, // settingList 选中的值

            typeList: item.type === '服务项目' ? this.fwxmOption : item.type === '谁未完成谁处理' ? this.fwxmOption : this.gmqdOption
          })
        })
      })
    },
    // 表格行 触发
    customRow (record, index) {
      return {
        on: {
          click: (event) => {
            // 无复选框表格
            // selected为公共样式
            event.currentTarget.parentNode.querySelectorAll('tr').forEach(item => {
              item.classList.remove('selected')
            })
            event.currentTarget.classList.add('selected')
          }
        }
      }
    },
    handleAdd () {
      // 显示empty组件
      this.showContent = false
      this.dataDestination = []
      this.$nextTick(() => {
        this.form.setFieldsValue({
          'selectRowForm[name]': ''
        })
      })

      this.selectRowForm.priority = 0
      this.rowId = 0
      this.contentTitle = '添加'
      // this.simpleCondition = this.resetData
      // 重置条件设置表单
      this.simpleCondition = [{
        settingList: [
          { name: '服务项目' },
          { name: '产品类别' },
          { name: '购买渠道' },
          { name: '客户地址' },
          { name: '网点承包范围' },
          { name: '只派自营网点' },
          { name: '只派服务商' },
          { name: '谁安装谁处理' },
          { name: '同一个客户报修时间内再处理' },
          { name: '谁未完成谁处理' },
          { name: '优先派送服务商' }
        ],
        settingList2: [{}],
        logic: 'or',
        isAddress: false,
        isAscader: false,
        show: true
      }]

      this.visible = true
    }
  },
  mounted () {
    this.getWebsiteList()
    this.getfwxmOption()
    this.getgmqdOption()
  }
}
</script>
