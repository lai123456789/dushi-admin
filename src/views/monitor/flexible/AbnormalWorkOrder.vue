<template>
  <a-spin :spinning="loading" tip="加载中,请稍等...">
    <div class="all">
      <div class="one">
        <div class="gutter-example">
          <a-row :gutter="32">
            <a-col class="gutter-row" :span="6">
              <div class="gutter-box" :class="currentIndex==1?'activeBg':''" @click="topClick(1)">
                <div class="text">
                  <div>超时工单数</div>
                  <div>{{ type.overtime }}</div>
                </div>
                <img src="../assets/image/abnormal1.png" alt="">
              </div>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <div class="gutter-box" :class="currentIndex==2?'activeBg':''" @click="topClick(2)">
                <div class="text">
                  <div>催办工单数</div>
                  <div>{{ type.urge }}</div>
                </div>
                <img src="../assets/image/abnormal2.png" alt="">
              </div>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <div class="gutter-box" :class="currentIndex==3?'activeBg':''" @click="topClick(3)">
                <div class="text">
                  <div>投诉工单数</div>
                  <div>{{ type.complain }}</div>
                </div>
                <img src="../assets/image/abnormal3.png" alt="">
              </div>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <div
                class="gutter-box"
                :class="currentIndex==4?'activeBg':''"
                @click="topClick(4)">
                <div class="text">
                  <div>不满意工单数</div>
                  <div>{{ type.disappraise }}</div>
                </div>
                <img src="../assets/image/Cirlce6.png" alt="">
              </div>
            </a-col>
          </a-row>

        </div>
      </div>
      <div class="two">
        <div style="border: 1px solid #EEE; border-radius: 10px;">
          <a-row class="itemRow">
            <a-col :span="4" class="first" @click="classifyLeft(1)">
              <div class="firstCol">产品品类：</div>
              <a-tag color="#FFF2F3" class="tag" :class="type1Index?'activeClassify':''">{{ classifyCount.count }}</a-tag>
            </a-col>
            <a-col :span="20" class="firstTwo">
              <a-col :span="4" v-for="(item,index) in countArr.count" :key="index" class="firstTwoItem">
                <div>{{ item.name }}：</div>
                <a-tag color="#EDF9FC" class="tag" :class="type1IndexItem==index?'activeClassifyItem':''" @click="classifyRightItem(1,item,index)">{{ item.count }}</a-tag>
              </a-col>
            </a-col>
          </a-row>
          <a-row class="itemRow">
            <a-col :span="4" class="first" @click="classifyLeft(2)">
              <div class="firstCol">一级部门：</div>
              <a-tag color="#FFF2F3" class="tag" :class="type2Index?'activeClassify':''">{{ classifyCount.count2 }}</a-tag>
            </a-col>
            <a-col :span="20" class="firstTwo">
              <a-col :span="4" v-for="(item,index) in countArr.count2" :key="index" class="firstTwoItem">
                <div>{{ item.name }}：</div>
                <a-tag color="#EDF9FC" class="tag" :class="type2IndexItem==index?'activeClassifyItem':''" @click="classifyRightItem(2,item,index)">{{ item.count }}</a-tag>
              </a-col>
            </a-col>
          </a-row>
          <a-row class="itemRow" v-show="showTwoDept">
            <a-col :span="4" class="first" :style="{ 'margin-bottom': classifyCount.count4 === 0 ? '20px' : '0' }" @click="classifyLeft(4)">
              <div class="firstCol">二级部门：</div>
              <a-tag color="#FFF2F3" class="tag" :class="type4Index?'activeClassify':''">{{ classifyCount.count4 }}</a-tag>
            </a-col>
            <a-col :span="20" class="firstTwo">
              <a-col :span="4" v-for="(item,index) in countArr.count4" :key="index" class="firstTwoItem">
                <div>{{ item.name }}：</div>
                <a-tag color="#EDF9FC" class="tag" :class="type4IndexItem==index?'activeClassifyItem':''" @click="classifyRightItem(4,item,index)">{{ item.count }}</a-tag>
              </a-col>
            </a-col>
          </a-row>
          <a-row class="itemRow" style="border: none !important" v-show="showNode">
            <a-col :span="4" class="first" @click="classifyLeft(3)">
              <div class="firstCol">工单节点：</div>
              <a-tag color="#FFF2F3" class="tag" :class="type3Index?'activeClassify':''">{{ classifyCount.count3 }}</a-tag>
            </a-col>
            <a-col :span="20" class="firstTwo">
              <a-col :span="4" v-for="(item,index) in countArr.count3" :key="index" class="firstTwoItem">
                <div>{{ item.name }}：</div>
                <a-tag color="#EDF9FC" class="tag" :class="type3IndexItem==index?'activeClassifyItem':''" @click="classifyRightItem(3,item,index)">{{ item.count }}</a-tag>
              </a-col>
            </a-col>
          </a-row>
        </div>
        <div class="btn">
          <a-button size="large" @click="() => {showSearch=!showSearch}">
            {{ showSearch?'隐藏搜索栏':'显示搜索栏' }}
          </a-button>
          <!-- <a-button size="large" @click="handleExport">导出工单 <img src="../assets/image/turn_up.png" alt=""></a-button> -->
        </div>
        <div style="margin-top: 24px" v-show="showSearch">
          <a-form :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-row :gutter="[8, 10]">
              <a-col v-bind="colLayout">
                <a-form-item label="摘要">
                  <a-input v-model="queryParam.case_name"/>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="流程编号">
                  <a-input v-model="queryParam.case_number"/>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="发起人">
                  <a-input v-model="queryParam.username"/>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="流程发起时间">
                  <a-range-picker
                    :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                    :placeholder="['开始时间', '结束时间']"
                    @change="getcheck_timeDate"
                    v-model="queryParam.check_time"
                    style="width: 100%"/>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="一级责任部门">
                  <a-input v-model="queryParam.department_responsibility_1"/>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <a-form-item label="二级责任部门">
                  <a-input v-model="queryParam.department_responsibility_2"/>
                </a-form-item>
              </a-col>
              <a-col v-bind="colLayout">
                <div style="margin-left: 32px; padding-top: 2px">
                  <a-button @click="search">搜索</a-button>
                  <a-button @click="reset" style="margin: 0 8px">重置</a-button>
                </div>
              </a-col>
            </a-row>
          </a-form>

        </div>
      </div>
      <div class="three">
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :sorter="{ field: 'id', order: 'descend' }"
          :columns="columns"
          :data="getData"
          id="myTable"
          :scroll="{ x: 1500, y: 600 }"
        >
          <div slot="case_name" slot-scope="text">
            <span v-html="text"></span>
          </div>
          <div slot="restrict_time" slot-scope="text">
            <span v-html="text"></span>
          </div>
          <div slot="enabled_date" slot-scope="text">
            <span v-html="text"></span>
          </div>
          <div slot="start_date" slot-scope="text">
            <span v-html="text"></span>
          </div>
          <div slot="action" slot-scope="text, record">
            <a @click="handleView(record)">查看</a>
          </div>

        </s-table>

      </div>
    </div>
    <!-- 数据表单 -->
    <workflow-handle-form ref="workflowHandleForm" :key="indexKey"></workflow-handle-form>
    <!-- 导出 -->
    <general-export ref="generalExport" />
  </a-spin>
</template>
<script>
export default {
  components: {
    WorkflowHandleForm: () => import('@/views/admin/WorkflowHandleForm'),
    GeneralExport: () => import('@/views/admin/Table/GeneralExport')
  },
  data () {
    return {
      indexKey: 0,
      exportParam: {},
      loading: true,
      showSearch: false,
      current: 1,
      type1Index: false,
      type2Index: false,
      type3Index: false,
      type4Index: false,
      type1IndexItem: -1,
      type2IndexItem: -1,
      type3IndexItem: -1,
      type4IndexItem: -1,
      colLayout: { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 },
      labelCol: { style: 'width: 100px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block;' },
      // 显示搜索栏搜索参数
      queryParam: {
        department_responsibility_1: '',
        department_responsibility_2: ''
      },
      // 接口调用参数
      params: {},
      currentIndex: 0,
      showNode: true,
      showTwoDept: false,
      List: '',
      // 分类首项的数量
      classifyCount: {},
      // 所有分类列表
      countArr: {},
      // 顶部类型数量
      type: {},
      loadDataTable: [],
      // 工单列表
      columns: [ {
        title: '操作',
        dataIndex: 'action',
        width: 150,
        align: 'center',
        scopedSlots: { customRender: 'action' }
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
        width: 300,
        scopedSlots: { customRender: 'case_name' }
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
        width: 80
      }, {
        title: '当前催办次数',
        dataIndex: 'arc_urge',
        width: 100
      }, {
        title: '催办次数',
        dataIndex: 'urge_num',
        width: 80
      }, {
        title: '超时时效',
        dataIndex: '_transition_restrict_time_',
        width: 150,
        scopedSlots: { customRender: 'restrict_time' }
      }, {
        title: '节点时效',
        dataIndex: '_enabled_date_',
        width: 150,
        scopedSlots: { customRender: 'enabled_date' }
      }, {
        title: '整单时效',
        dataIndex: '_start_date_',
        width: 150,
        scopedSlots: { customRender: 'start_date' }
      }, {
        title: '满意度评价',
        dataIndex: 'appraise',
        width: 150
      }, {
        title: '产品品类',
        dataIndex: 'product_category',
        width: 150
      }, {
        title: '一级责任部门',
        dataIndex: 'department_responsibility_1',
        width: 150
      }, {
        title: '二级责任部门',
        dataIndex: 'department_responsibility_2',
        width: 150
      }, {
        title: '责任主办',
        dataIndex: 'department_responsibility_main',
        width: 150
      }, {
        title: '当前办理人',
        dataIndex: 'transition_user',
        width: 150
      }]
    }
  },
  methods: {
    handleView (record) {
      this.indexKey = this.indexKey === 1 ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '查看流程',
            width: 1200,
            tplviewUrl: '/admin/centerflow/viewOrder',
            case_id: record.case_id,
            viewType: 'view'
          },
          flowStatus: 'proceed',
          record: record
        })
      })
    },
    handleExport () {
      // 导出工单
      this.$refs.generalExport.show({
        title: '导出',
        record: {},
        number: 'dict',
        method: 'exportDict'
      })
    },
    // 搜索
    search () {
      this.loading = true
      const myform = this.queryParam
      let str = '1 = 1'
      for (const o in myform) {
        if (myform[o]) {
          if (o === 'check_time_start') {
            // 流程发起时间
            str += ` and start_date >= "${myform[o]}"`
          } else if (o === 'check_time_end') {
            str += ` and start_date <= "${myform[o]}"`
          } else if (o === 'check_time') {
            // antd时间组件默认时间 忽略不上传到接口 如Wed Feb 17 2021 00:00:00 GMT+0800,Sat Feb 20 2021 23:59:59 GMT+0800
          } else {
            str += ' and ' + o + ' = "' + myform[o] + '"'
          }
        }
      }
      this.params.where = str
      // 刷新数据
      this.$refs.table.refresh(true)
    },
    // 重置
    reset () {
      this.loading = true
      this.queryParam = {}
      this.params.where = '1 = 1'
      this.$refs.table.refresh(true)
    },
    getcheck_timeDate (date, dateString) {
      this.queryParam.check_time_start = dateString[0]
      this.queryParam.check_time_end = dateString[1]
    },
    getData (parameter) {
      this.loading = true
      return this.axios({
        url: '/crm/Order/orderProblem',
        params: Object.assign(parameter, this.params)
      }).then(res => {
        this.loading = false
        let countTwo = 0
        if (res.result.count4.length > 0) {
          countTwo = res.result.count4[0].count
        }
        this.classifyCount = {
          count: res.result.count[0].count,
          count2: res.result.count2[0].count,
          count3: res.result.count3[0].count,
          count4: countTwo
        }
        this.type = res.result.type
        // 计算显示栏目
        const countArr = {
          count: [],
          count2: [],
          count3: [],
          count4: []
        }
        for (const i in res.result.count[0].data) {
          countArr.count.push({ name: i, count: res.result.count[0].data[i] })
        }
        for (const i in res.result.count2[0].data) {
          countArr.count2.push({ name: i, count: res.result.count2[0].data[i] })
        }
        for (const i in res.result.count3[0].data) {
          countArr.count3.push({ name: i, count: res.result.count3[0].data[i] })
        }
        if (res.result.count4.length > 0) { // 二级责任部门
          for (const i in res.result.count4[0].data) {
            countArr.count4.push({ name: i, count: res.result.count4[0].data[i] })
          }
        }
        this.countArr = countArr
        return res.result
      })
    },
    // 点击顶部的分类栏目选项
    topClick (index) {
      if (index > 2) {
        this.showNode = false
      } else {
        this.showNode = true
      }
      if (index === 1) { // 超时
        if (this.currentIndex !== index) {
          this.params.order_type = 'overtime'
          this.currentIndex = index
        } else {
          this.params.order_type = ''
          this.currentIndex = 0
        }
      } else if (index === 2) { // 催办
        if (this.currentIndex !== index) {
          this.params.order_type = 'urge'
          this.currentIndex = index
        } else {
          this.params.order_type = ''
          this.currentIndex = 0
        }
      } else if (index === 3) { // 投诉
        if (this.currentIndex !== index) {
          this.params.order_type = 'complain'
          this.currentIndex = index
        } else {
          this.params.order_type = ''
          this.currentIndex = 0
        }
        // 工单节点参数为空
        this.params.transition_status = ''
      } else if (index === 4) { // 不满意
        if (this.currentIndex !== index) {
          this.params.order_type = 'disappraise'
          this.currentIndex = index
        } else {
          this.params.order_type = ''
          this.currentIndex = 0
        }
      }
      this.$refs.table.refresh(true) // 刷新数据
    },
    // 点击分类栏左边第一个选项
    classifyLeft (index) {
      if (index === 1) {
        this.type1Index = !this.type1Index
        // 去除右边item的样式
        this.type1IndexItem = -1
      } else if (index === 2) {
        this.type2Index = !this.type2Index
        this.type2IndexItem = -1
        this.showTwoDept = !this.showTwoDept
      } else if (index === 4) {
        this.type4Index = !this.type4Index
        this.type4IndexItem = -1
      } else if (index === 3) {
        this.type3Index = !this.type3Index
        this.type3IndexItem = -1
      }
      // 根据选择的激活颜色 插入对应的接口参数值
      if (this.type1Index) {
        // 产品品类
        this.params.product_category = 'all'
      } else {
        // 如果选了其他的item项 该项就不置为空
        if (!this.params.product_category) {
          this.params.product_category = ''
        }
      }
      if (this.type2Index) {
        this.params.department_responsibility_1 = 'all'
      } else {
        if (!this.params.department_responsibility_1) {
          this.params.department_responsibility_1 = ''
        }
      }
      if (this.type4Index) {
        this.params.department_responsibility_2 = 'all'
      } else {
        if (!this.params.department_responsibility_2) {
          this.params.department_responsibility_2 = ''
        }
      }
      if (this.type3Index) {
        this.params.transition_status = 'all'
      } else {
        if (!this.params.transition_status) {
          this.params.transition_status = ''
        }
      }
      this.$refs.table.refresh(true) // 刷新数据
    },
    // 点击分类栏右边每一个item项
    classifyRightItem (currentIndex, item, index) {
      if (currentIndex === 1) {
        // 产品品类
        this.type1Index = false
        if (this.type1IndexItem !== index) {
          this.type1IndexItem = index
          this.params = { ...this.params, ...{ product_category: item.name } }
        } else {
          this.type1IndexItem = -1
          this.params.product_category = ''
        }
      }
      if (currentIndex === 2) {
        this.type2Index = false
        // 责任部门一级
        if (this.type2IndexItem !== index) {
          this.type2IndexItem = index
          this.params = { ...this.params, ...{ department_responsibility_1: item.name } }
          this.showTwoDept = true
          this.params.department_responsibility_2 = ''
          this.type4IndexItem = -1
        } else {
          this.type2IndexItem = -1
          this.params.department_responsibility_1 = ''
          this.showTwoDept = false
        }
      }
      if (currentIndex === 3) {
        // 工单节点
        this.type3Index = false
        if (this.type3IndexItem !== index) {
          this.type3IndexItem = index
          this.params = { ...this.params, ...{ transition_status: item.name } }
        } else {
          this.type3IndexItem = -1
          this.params.transition_status = ''
        }
      }
      if (currentIndex === 4) {
        // 二级责任部门
        this.type4Index = false
        if (this.type4IndexItem !== index) {
          this.type4IndexItem = index
          this.params = { ...this.params, ...{ department_responsibility_2: item.name } }
        } else {
          this.type4IndexItem = -1
          this.params.department_responsibility_2 = ''
        }
      }
      this.$refs.table.refresh(true)
    }
  }
}
</script>
<style lang="scss" scoped>
.all{
  padding: 24px 32px;
  background: #F5F6FA;
  .one{
    .activeBg{
      background: linear-gradient(270deg, #28DDDA 0%, #4793ED 100%) !important;
      .text{
        div{
          color: #FFFFFF !important
        }
      }
    }
    .gutter-box {
      background: #ffffff;
      height: 150px;
      border-radius: 10px;
      padding: 36px 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .text{
        div:nth-child(1){
          font-size: 14px;
          color: #8181A5;
        }
        div:nth-child(2){
          line-height: 50px;
          font-weight: bold;
          font-size: 36px;
          color: #1C1D21;
        }
      }
      img{
        width: 56px;
        height: 56px;
      }
    }
  }
  .two{
    border-radius: 10px;
    background: #ffffff;
    margin-top: 30px;
    padding: 36px 25px 24px 25px;
    .itemRow{
      border-bottom: 1px dashed #EEE;
      padding: 20px 20px 0 20px;
      .first{
        display: flex;
        align-items: center;
        .firstCol{
          font-size: 15px;
          color:#333333;
          font-weight: bold;
          width: 110px;
          white-space: nowrap;
        }
      }
      .firstTwo{
        display: flex;
        flex-flow: row wrap;
      }
      .first,.firstTwoItem{
        .tag{
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 30px;
          width: 80px;
          height: 28px;
          font-size: 14px;
        }
      }
      .first{
        .tag{
          color: #FF808B;
          font-weight: bold;
        }
        .activeClassify{
          background-color:#FF808B !important;
          color: #FFFFFF;
        }
      }
      .firstTwoItem{
        display: flex;
        align-items: center;
        color: #129AA2;
        padding-bottom: 20px;
        div:nth-child(1){
          font-size: 14px;
          white-space: nowrap;
          font-weight: bold;
          width: 140px;
          text-align: right;
        }
        .tag{
          color: #129AA2;
          font-weight: bold;
        }
        .activeClassifyItem{
          background-color: #129AA2 !important;
          color: #FFFFFF;
        }
      }

    }
    /deep/.btn{
      padding-top: 30px;
      button{
        background: #28BECA;
        border-radius: 8px;
        color:#FFFFFF;
        margin-right: 15px;
        font-size: 16px;
        img{
          width: 14px;
          height: 14px;
          margin-left: 7px;
          margin-bottom: 5px;
        }
      }
      .ant-btn:active:not(.ant-btn-primary):not(.ant-btn-danger){
        border-color: transparent !important;
      }
    }
  }
  .three{
    background: #FFFFFF;
  }
}
//设置分页栏居中显示
/deep/.three .ant-pagination{
  text-align: center !important;
  float:none !important;
}
//设置表头行高
/deep/.three .ant-table-thead{
  line-height: 50px;
}
</style>
