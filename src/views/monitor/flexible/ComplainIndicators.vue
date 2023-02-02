<template>
  <div class="bg">
    <a-spin :spinning="loading" tip="加载中,请稍等...">
      <div class="body">
        <div class="up-down">
          <div class="searchList" v-show="!showIcon">
            <a-form :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-row :gutter="[8, 10]">
                <a-col v-bind="colLayout">
                  <a-form-item label="日期">
                    <a-range-picker
                      :default-value="[moment(queryParam.inputtime_b, 'YYYY-MM-DD'), moment(queryParam.inputtime_e, 'YYYY-MM-DD')]"
                      :placeholder="['开始时间', '结束时间']"
                      @change="getcheck_timeDate"
                      v-model="queryParam.inputtime"
                      style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="服务项目">
                    <a-select v-model="queryParam.gdlx" :allowClear="true">
                      <a-select-option :value="value.value" v-for="(value, key) in serviceProject" :key="key">
                        {{ value.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="购买渠道">
                    <a-select v-model="queryParam.gmqd" :allowClear="true">
                      <a-select-option v-for="(value, key) in purchaseList" :key="key" :value="value.value">
                        {{ value.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="产品品类">
                    <a-select v-model="queryParam.cppl" :allowClear="true" @change="handleChange">
                      <a-select-option v-for="(value, key) in product_big_typeList" :key="key" :value="value.value">
                        {{ value.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="产品类别">
                    <a-select v-model="queryParam.cplb" :allowClear="true">
                      <a-select-option v-for="(value, key) in product_typeList" :key="key" :value="value.value">
                        {{ value.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="网点类型">
                    <a-select v-model="queryParam.wdlx" :allowClear="true">
                      <a-select-option v-for="(value, key) in network_typeList" :key="key" :value="value.value">
                        {{ value.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="所属服务分部">
                    <a-select v-model="queryParam.ssfwfb" :allowClear="true">
                      <a-select-option v-for="(value, key) in branchList" :key="key" :value="value.name">
                        {{ value.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <a-form-item label="服务商/网点">
                    <a-select
                      v-model="queryParam.wdbh"
                      show-search
                      allowClear
                      :default-active-first-option="false"
                      :show-arrow="false"
                      :filter-option="false"
                      :not-found-content="null"
                      @search="getwdList"
                      :autoClearSearchValue="false"
                    >
                      <a-select-option :value="value.value" v-for="(value, key) in networkList" :key="key">{{ value.name }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col v-bind="colLayout">
                  <div style="margin-left: 32px">
                    <a-button @click="search">搜索</a-button>
                    <a-button @click="reset" style="margin: 0 8px">重置</a-button>
                  </div>
                </a-col>
              </a-row>
            </a-form>

          </div>
          <div class="iconDiv" @click="showIcon = !showIcon">
            <a-icon type="caret-down" v-show="showIcon"/>
            <a-icon type="caret-up" v-show="!showIcon"/>
          </div>
        </div>
        <a-row class="firstRow">
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">{{ dataTotal.order_total }}</div>
              <div class="itemBottom">
                <div>相关工单总量</div>
                <img src="../assets/image/ic-trending-up.png" alt="">
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">{{ dataTotal.complain_order_total }}</div>
              <div class="itemBottom">
                <div>投诉总量</div>
                <img src="../assets/image/ic-trending-up.png" alt="">
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">{{ dataTotal.mid_order_total }}</div>
              <div class="itemBottom">
                <div>未完结</div>
                <img src="../assets/image/ic-trending-up.png" alt="">
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">{{ dataTotal.end_order_total }}</div>
              <div class="itemBottom">
                <div>已完结</div>
                <img src="../assets/image/ic-trending-up.png" alt="">
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">{{ complaintRate }}</div>
              <div class="itemBottom">
                <div>投诉率</div>
                <img src="../assets/image/ic-trending-up.png" alt="">
              </div>
            </div>
          </a-col>
          <a-col :span="4">
            <div class="item">
              <div class="itemTop">{{ closeRate }}</div>
              <div class="itemBottom">
                <div>关闭率</div>
                <img src="../assets/image/ic-trending-up.png" alt="">
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row class="secondRow" style="margin-bottom: 14px" :gutter="32">
          <a-col :span="8">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_business_center.png" alt="">
                <span>数字销售</span>
              </div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options1" style="width: 100%; height: 100%;" ref="chart1"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <img src="../assets/image/Dot1.png" alt="">
                  <span class="text">投诉量</span>
                  <span class="num">{{ dataTotal.digital_marketing_total }}</span>
                </div>
                <div class="one">
                  <img src="../assets/image/Dot2.png" alt="">
                  <span class="text">相关工单总量</span>
                  <span class="num">{{ dataTotal.digital_marketing_relate_total }}</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_email.png" alt="">
                <span>计划物流</span>
              </div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options2" style="width:100%; height: 100%;" ref="chart2"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <img src="../assets/image/Dot1.png" alt="">
                  <span class="text">投诉量</span>
                  <span class="num">{{ dataTotal.planning_logistics_total }}</span>
                </div>
                <div class="one">
                  <img src="../assets/image/Dot2.png" alt="">
                  <span class="text">相关工单总量</span>
                  <span class="num">{{ dataTotal.planning_logistics_relate_total }}</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_callbag.png" alt="">
                <span>服务运营</span>
              </div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options3" style="width: 100%; height: 100%;" ref="chart3"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <img src="../assets/image/Dot1.png" alt="">
                  <span class="text">投诉量</span>
                  <span class="num">{{ dataTotal.service_operation_total }}</span>
                </div>
                <div class="one">
                  <img src="../assets/image/Dot2.png" alt="">
                  <span class="text">相关工单总量</span>
                  <span class="num">{{ dataTotal.service_operation_relate_total }}</span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>

        <a-row class="secondRow" :gutter="32">
          <a-col :span="8">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_person.png" alt="">
                <span>客服管理</span>
              </div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options4" style="width: 100%; height: 100%;" ref="chart4"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <img src="../assets/image/Dot1.png" alt="">
                  <span class="text">投诉量</span>
                  <span class="num">{{ dataTotal.kefu_management_total }}</span>
                </div>
                <div class="one">
                  <img src="../assets/image/Dot2.png" alt="">
                  <span class="text">相关工单总量</span>
                  <span class="num">{{ dataTotal.kefu_management_relate_total }}</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_business.png" alt="">
                <span>服务分部</span>
              </div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options5" style="width: 100%; height: 100%;" ref="chart5"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <img src="../assets/image/Dot1.png" alt="">
                  <span class="text">投诉量</span>
                  <span class="num">{{ dataTotal.service_division_total }}</span>
                </div>
                <div class="one">
                  <img src="../assets/image/Dot2.png" alt="">
                  <span class="text">相关工单总量</span>
                  <span class="num">{{ dataTotal.service_division_relate_total }}</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_call.png" alt="">
                <span>逆向处理</span>
              </div>
              <div class="s2">
                <div class="s2-echart">
                  <vueEcharts v-if="!loading" :auto-resize="true" :options="options6" style="width: 100%; height: 100%;" ref="chart6"/>
                </div>
              </div>
              <div class="s3">
                <div class="one">
                  <img src="../assets/image/Dot1.png" alt="">
                  <span class="text">投诉量</span>
                  <span class="num">{{ dataTotal.reverse_disposal_total }}</span>
                </div>
                <div class="one">
                  <img src="../assets/image/Dot2.png" alt="">
                  <span class="text">相关工单总量</span>
                  <span class="num">{{ dataTotal.reverse_disposal_relate_total }}</span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>
<script>
import echarts from 'echarts'
import vueEcharts from 'vue-echarts'
import debounce from 'lodash/debounce'
export default {
  components: {
    echarts,
    vueEcharts
  },
  data () {
    this.getwdList = debounce(this.getwdList, 500)
    return {
      queryParam: {},
      colLayout: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 8 },
      labelCol: { style: 'width: 100px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block;' },
      purchaseList: [],
      // 产品品类
      product_big_typeList: [],
      // 产品类别
      product_typeList: [],
      // 服务项目
      serviceProject: [],
      // 网点类型
      network_typeList: [],
      // 所属服务分部
      branchList: [
        { name: '东区服务分部' },
        { name: '南区服务分部' },
        { name: '西区服务分部' },
        { name: '北区服务分部' }
      ],
      // 网点名称
      networkList: [],
      showIcon: true,
      loading: true,
      dataTotal: {},
      closeRate: '',
      complaintRate: '',
      myChart: {}
    }
  },
  created () {
    this.getNowDate()
    this.getprevMonthDate()
    this.getComplainInfo()
    this.getnetwork_typeList()
    this.getPurchase()
    this.getServiceProject()
    this.getProduct_big_type()
  },
  methods: {
    search () {
      this.loading = true
      this.getComplainInfo()
    },
    reset () {
      this.loading = true
      this.queryParam = {}
      // 设置默认日期
      this.getNowDate()
      this.getprevMonthDate()
      // 重新获取数据
      this.getComplainInfo()
    },
    getNowDate () {
      // 获取当前日期 2021-02-01
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var year2 = year
      // 当前月份
      var month2Now = parseInt(month)
      if (month2Now < 10) {
        month2Now = '0' + month2Now
      }
      if (day < 10) {
        day = '0' + day
      }
      const nowDate = year2 + '-' + month2Now + '-' + day
      this.queryParam.inputtime_e = nowDate // 当前月份日期 2021-02-01
    },
    getprevMonthDate () {
      // 获取当前日期上一月日期 2021-01-01
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var year2 = year
      // 前一月份
      var month2 = parseInt(month) - 1
      if (month2 === 0) {
        year2 = parseInt(year2) - 1
        month2 = 12
      }
      var day2 = day
      var days2 = new Date(year2, month2, 0)
      days2 = days2.getDate()
      if (day2 > days2) {
        day2 = days2
      }
      if (month2 < 10) {
        month2 = '0' + month2
      }
      if (day2 < 10) {
        day2 = '0' + day2
      }
      const prevMonthDate = year2 + '-' + month2 + '-' + day2
      this.queryParam.inputtime_b = prevMonthDate // 上一月份日期  2021-01-01
    },
    getComplainInfo () {
      this.axios({
        url: '/crm/Index/complaint',
        data: this.queryParam,
        timeout: 5 * 60 * 1000
      }).then(res => {
        // 缩放自适应
        window.onresize = () => {
          setTimeout(() => {
            for (let i = 1; i <= 6; i++) {
              const str = 'chart' + i
              this.$refs[str].resize()
            }
          }, 500)
        }
        this.loading = false
        this.dataTotal = res.data
        // 关闭率=已完结/投诉总量*100%
        this.closeRate = res.data.complain_order_total > 0 ? ((res.data.mid_order_total / res.data.complain_order_total * 100) || 0).toFixed(2) + '%' : '0.00%'
        // 投诉率=投诉总量/相关工单量*100%
        this.complaintRate = res.data.order_total > 0 ? ((res.data.complain_order_total / res.data.order_total * 100) || 0).toFixed(2) + '%' : '0.00%'
        let digitalRate = 0
        if (res.data.digital_marketing_total > 0 && res.data.digital_marketing_relate_total > 0) {
          digitalRate = (res.data.digital_marketing_total / res.data.digital_marketing_relate_total * 100).toFixed(2)
        }
        this.options1 = {
          color: ['#FF808B', '#FFD56D', '#24C2CA', '#57C964'], // 颜色
          tooltip: {
            trigger: 'item',
            formatter: '{c}<br/>{b}：{d}%'
          },
          // 圆心的文字样式
          graphic: {
            type: 'text',
            left: 'center',
            top: '47%', // center
            style: {
              text: `${digitalRate + '%'}\n投诉率`,
              textAlign: 'center',
              font: 'bolder 16px 黑体',
              fill: '#666',
              lineHeight: 50,
              width: 30,
              height: 30
            }
          },
          series: [{
            type: 'pie',
            itemStyle: {},
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
            radius: ['35%', '60%'],
            center: ['50%', '55%'],
            data: res.type_appeal_2_data['数字营销'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              normal: {
                length: 20,
                length2: 30
              }
            },
            label: {
              normal: {
                lineHeight: 20,
                fontSize: 14,
                formatter: '{d}%\n {b}  ',
                padding: [0, 0]
              }
            }
          }]
        }
        let planningRate = 0
        if (res.data.planning_logistics_total > 0 && res.data.planning_logistics_relate_total > 0) {
          planningRate = res.data.planning_logistics_relate_total > 0 ? (res.data.planning_logistics_total / res.data.planning_logistics_relate_total * 100).toFixed(2) : '0.00'
        }
        this.options2 = {
          color: ['#FF808B', '#FFD56D', '#24C2CA'],
          tooltip: {
            trigger: 'item',
            formatter: '{c}<br/>{b}：{d}%'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: '47%',
            style: {
              text: `${planningRate + '%'}\n投诉率`,
              textAlign: 'center',
              font: 'bolder 16px 黑体',
              fill: '#666',
              lineHeight: 50,
              width: 30,
              height: 30
            }
          },
          series: [{
            type: 'pie',
            itemStyle: {},
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
            radius: ['35%', '60%'],
            center: ['50%', '55%'],
            data: res.type_appeal_2_data['计划物流'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              normal: {
                length: 20,
                length2: 30
              }
            },
            label: {
              normal: {
                lineHeight: 20,
                fontSize: 14,
                formatter: '{d}%\n {b}  ',
                padding: [0, 0]
              }
            }
          }]
        }
        let serviceRate = 0
        if (res.data.service_operation_total > 0 && res.data.service_operation_relate_total > 0) {
          serviceRate = res.data.service_operation_relate_total > 0 ? (res.data.service_operation_total / res.data.service_operation_relate_total * 100).toFixed(2) : '0.00'
        }
        this.options3 = {
          color: ['#FF808B', '#FFD56D', '#24C2CA', '#57C964'],
          graphic: {
            type: 'text',
            left: 'center',
            top: '47%',
            style: {
              text: `${serviceRate + '%'}\n投诉率`,
              textAlign: 'center',
              font: 'bolder 16px 黑体',
              fill: '#666',
              lineHeight: 50,
              width: 30,
              height: 30
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{c}<br/>{b}：{d}%'
          },
          series: [{
            name: '工单时效分布',
            type: 'pie',
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
            radius: ['35%', '60%'],
            center: ['50%', '55%'],
            data: res.type_appeal_2_data['服务运营'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              normal: {
                length: 20,
                length2: 30
              }
            },
            label: {
              normal: {
                lineHeight: 20,
                fontSize: 14,
                formatter: '{d}%\n {b}  ',
                padding: [0, 0]
              }
            }
          }]
        }
        let kefuRate = 0
        if (res.data.kefu_management_total > 0 && res.data.kefu_management_relate_total > 0) {
          kefuRate = (res.data.kefu_management_total / res.data.kefu_management_relate_total * 100).toFixed(2)
        }
        this.options4 = {
          color: ['#FF808B', '#FFD56D', '#24C2CA', '#57C964'],
          tooltip: {
            trigger: 'item',
            formatter: '{c}<br/>{b}：{d}%'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: '47%',
            style: {
              text: `${kefuRate + '%'}\n投诉率`,
              textAlign: 'center',
              font: 'bolder 16px 黑体',
              fill: '#666',
              lineHeight: 50,
              width: 30,
              height: 30
            }
          },
          series: [{
            type: 'pie',
            itemStyle: {
            },
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
            radius: ['35%', '60%'],
            center: ['50%', '55%'],
            data: res.type_appeal_2_data['客服管理'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              normal: {
                length: 20,
                length2: 30
              }
            },
            label: {
              normal: {
                lineHeight: 20,
                fontSize: 14,
                formatter: '{d}%\n {b}  ',
                padding: [0, 0]
              }
            }
          }]
        }
        let serviceDeviceRate = 0
        if (res.data.service_division_total > 0 && res.data.service_division_relate_total > 0) {
          serviceDeviceRate = (res.data.service_division_total / res.data.service_division_relate_total * 100).toFixed(2)
        }
        this.options5 = {
          color: ['#24C2CA', '#4393FF', '#5F54E2', '#FF8743', '#FFD56D', '#FC808B'],
          tooltip: {
            trigger: 'item',
            formatter: '{c}<br/>{b}：{d}%'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: '47%',
            style: {
              text: `${serviceDeviceRate + '%'}\n投诉率`,
              textAlign: 'center',
              font: 'bolder 16px 黑体',
              fill: '#666',
              lineHeight: 50,
              width: 30,
              height: 30
            }
          },
          series: [{
            type: 'pie',
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
            radius: ['35%', '60%'],
            center: ['50%', '55%'],
            data: res.type_appeal_2_data['服务分部'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              normal: {
                length: 20,
                length2: 30
              }
            },
            label: {
              normal: {
                lineHeight: 20,
                fontSize: 14,
                formatter: '{d}%\n {b}  ',
                padding: [0, 0]
              }
            }
          }]
        }
        let reverseRate = 0
        if (res.data.reverse_disposal_total > 0 && res.data.reverse_disposal_relate_total > 0) {
          reverseRate = (res.data.reverse_disposal_total / res.data.reverse_disposal_relate_total * 100).toFixed(2)
        }
        this.options6 = {
          color: ['#FF808B', '#FFD56D', '#24C2CA', '#57C964'],
          tooltip: {
            trigger: 'item',
            formatter: '{c}<br/>{b}：{d}%'
          },
          graphic: {
            type: 'text',
            left: 'center',
            top: '47%',
            style: {
              text: `${reverseRate + '%'}\n投诉率`,
              textAlign: 'center',
              font: 'bolder 16px 黑体',
              fill: '#666',
              lineHeight: 50,
              width: 30,
              height: 30
            }
          },
          series: [{
            type: 'pie',
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
            radius: ['35%', '60%'],
            center: ['50%', '55%'],
            data: res.type_appeal_2_data['逆向处置'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        }
      })
    },
    getcheck_timeDate (date, dateString) {
      this.queryParam.inputtime_b = dateString[0]
      this.queryParam.inputtime_e = dateString[1]
    },
    // 服务项目
    getServiceProject () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'fwdgdlx' }
      }).then(res => {
        this.serviceProject = res.result
      })
    },
    // 网点类型
    getnetwork_typeList () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'wangdian_lx' }
      }).then(res => {
        this.network_typeList = res.result
      })
    },
    // 购买渠道
    getPurchase () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'gmqd2' }
      }).then(res => {
        this.purchaseList = res.result
      })
    },
    // 产品品类
    getProduct_big_type () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'chanpin_fl' }
      }).then(res => {
        this.product_big_typeList = res.result
      })
    },
    // 获取产品类别
    handleChange (value) {
      if (!value) {
        this.product_typeList = []
        this.$set(this.queryParam, 'cplb', undefined)
        return
      }
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: value }
      }).then(res => {
        this.product_typeList = res.result
        this.$set(this.queryParam, 'cplb', undefined)
      })
    },
    // 获取网点
    getwdList (e) {
      if (e) {
        this.axios({
          url: '/crm/OrderRule/wdlist',
          data: { keyword: e }
        }).then(res => {
          this.networkList = res.result.filter(item => {
            return item.type !== 'auto_service' && item.type !== 'auto_network'
          })
          if (this.networkList.length === 0) {
            this.$message.warning('查询不到该网点')
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.bg{
  overflow-x: hidden;
  background: #F5F6FA;
  height: 100%;
}
.body{
  height: calc(100% - 150px);
  padding: 24px 32px;
}
.body .up-down .searchList{
  background-color: #ffffff;
  padding-right: 36px;
}
.body .up-down .iconDiv{
  cursor: pointer;
  background-color: #EEE;
  display: flex;
  justify-content: center;
  align-items: cenrer;
  width: 100%;
}
  /*首行*/
.firstRow{
  background: #FFF;
  box-shadow: 6px 6px 54px rgba(0, 0, 0, 0.05);
  opacity: 1;
  border-radius: 10px;
  margin-bottom: 30px;
  padding: 22px 29px 22px 0;
}
.firstRow div:last-child .item{
  border-right: 0 !important;
}
.item{
  padding: 0 24px;
  border-right: 1px solid #EEE;
}
.itemTop{
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
  border-bottom: 4px solid #FF808B;
  font-size: 28px;
  font-weight: bold;
  }
.itemBottom{
  padding-top: 20px;
  display: flex;
  justify-content: center;
}
.itemBottom div{
  font-size: 14px;
  color: #808080;
}
.itemBottom img{
  width: 24px;
  height: 24px;
  margin-left: 7px;
}
.secondRow{
  border-radius: 10px;
}
.second-item{
  background: #FFF;
  border-radius: 10px;
  height: 400px;
}
.s1{
  padding: 8px 0 0 16px;
  display: flex;
  align-items: center;
}
.s1 img{
  width: 30px;
  height: 30px;
  margin-right: 5px;
}
.s1 span{
  font-size: 22px;
  font-weight: bold;
  line-height: 40px;
}
.s2{
  height: 300px;
  display: flex;
  align-items: center;
}
.s2-echart{
  width: 586px;
  height: 100%;
}
.s3{
  padding: 16px 0 20px 40px;
  display: flex;
  align-items: center;
}
.s3 .one{
  display: flex;
  align-items: center;
  margin-right: 65px;
}
.s3 .one img{
  width: 12px;
  height: 12px;
  margin-right: 14px;
}
.s3 .one .text{
  font-size: 16px;
  color: #B9B9B9;
  margin-right: 14px;
  white-space: nowrap;
}
.s3 .one .num{
  font-size: 16px;
  color: #333333;
  margin-right: 14px;
}
</style>
