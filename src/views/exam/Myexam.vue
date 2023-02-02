<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search">搜索</a-button>
            <a-button icon="sync" @click="() => {(queryParam = {}), $refs.table.refresh(true)}">重置</a-button>
            <a @click="changeAdvanced(true)" >{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="考试状态">
              <a-select :allowClear="true" show-search v-model.trim="queryParam.status">
                <a-select-option v-for="(item, key) in paperstatus" :key="key" :value="key">{{ item.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="考试名称">
              <a-input v-model.trim="queryParam.title" />
            </a-form-item>
          </a-col>
          <!-- <a-col v-bind="colLayout">
            <a-form-item label="参考状态">
              <a-select :allowClear="true" show-search v-model.trim="queryParam.status">
                <a-select-option v-for="(item, key) in paperstatus" :key="key" :value="key">{{ item.type }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
          <a-col v-bind="colLayout">
            <a-form-item label="开始时间">
              <a-range-picker
                v-model="queryParam.showstarttime"
                @change="getSearchDate"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="结束时间">
              <a-range-picker
                v-model="queryParam.showendtime"
                @change="getSearchDateEnd"
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="status" slot-scope="text">
          <span v-for="value in paperstatus" :key="value.value" v-show="text === value.value">{{ value.type }}</span>
        </div>
        <div slot="action" slot-scope="text, record">
          <a @click="checkPage(record)">查看</a>
        </div>
      </s-table>
    </a-card>
    <myexam-look ref="MyexamLook" />
  </div>
</template>
<script>
export default {
  components: {
    MyexamLook: () => import('./MyexamLook')
  },
  data () {
    return {
      advanced: false,
      visible: false,
      loading: false,
      // 搜索参数
      queryParam: {},
      paperstatus: [{
        type: '未开始',
        value: '0'
      }, {
        type: '进行中',
        value: '1'
      }, {
        type: '已结束',
        value: '2'
      }],
      config: {
        data: {}
      },
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 80,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40,
        sorter: true
      }, {
        title: '考试名称',
        dataIndex: 'title',
        width: 300
      }, {
        title: '考试状态',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' },
        width: 120
      }, {
        title: '参考状态',
        dataIndex: 'exam_status',
        scopedSlots: { customRender: 'exam_status' },
        width: 120
      }, {
        title: '开始时间',
        dataIndex: 'starttime',
        width: 140
      }, {
        title: '结束时间',
        dataIndex: 'endtime',
        width: 140
      }],
      colLayout: {}
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    // 页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/exam/Achievement/myExam',
        params: Object.assign(parameter, this.queryParam)
      }).then((res) => {
        return res.result
      })
    },
    // 打开查看页面
    checkPage (record) {
      this.$refs.MyexamLook.show({
        data: record,
        action: 'check',
        title: '查看',
        url: '',
        type: record.mystatus
      })
    },
    // 搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    // 删除
    examDelete (record) {
      const table = this.$refs.table
      const id = record.id
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self
            .axios({
              url: '/visit/questionbank/delete',
              data: { id: id }
            })
            .then((res) => {
              self.$message.success(res.result)
              table.refresh()
            })
        }
      })
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
    getSearchDate (date, dateString) {
      this.queryParam.starttime = dateString[0] ? dateString : null
      this.queryParam.showstarttime = date
    },
    getSearchDateEnd (date, dateString) {
      this.queryParam.endtime = dateString[0] ? dateString : null
      this.queryParam.showendtime = date
    }

  }
}
</script>
