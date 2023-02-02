<template>
  <div ref="getPlayback">
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {startValue = null; endValue = null; queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
            <a @click="advanced=!advanced">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼叫时间">
              <a-range-picker
                :ranges="{
                  今天: [moment().startOf('day'), moment().endOf('day')],
                  昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  本月: [moment().startOf('month'), moment().endOf('month')],
                }"
                showTime
                :allowClear="false"
                @change="getSearchDate"
                v-model="searchDate"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="主叫号码">
              <a-input v-model="queryParam.src_number" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="被叫号码">
              <a-input v-model="queryParam.dst_number" placeholder="" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="呼叫状态">
              <a-select v-model="queryParam.disposition" :allowClear="true">
                <a-select-option value="ANSWERED">接听</a-select-option>
                <a-select-option value="NO ANSWER">未接听</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="通话时长">
              <a-input-group compact>
                <a-input v-model="queryParam.duration_up" style="width: calc(50% - 15px);" placeholder="单位: 秒" />
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input v-model="queryParam.duration_down" style="width: calc(50% - 15px); border-left: 0" placeholder="单位: 秒" />
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="振铃时长">
              <a-input-group compact>
                <a-input v-model="queryParam.ringtime_up" style="width: calc(50% - 15px);" placeholder="单位: 秒" />
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input v-model="queryParam.ringtime_down" style="width: calc(50% - 15px); border-left: 0" placeholder="单位: 秒" />
              </a-input-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <div class="table-operator">
        <a-button v-action:export icon="download" @click="handleExport()">导出</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <span slot="disposition" slot-scope="text">
          <a-badge v-if="text =='ANSWERED'" status="success" text="接听" />
          <a-badge v-else status="error" text="未接听" />
        </span>
        <span slot="hangup" slot-scope="text">
          <template v-if="text == 'Caller'" >主叫挂断</template>
          <template v-else >被叫挂断</template>
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="handlePlayback(record)">录音播放</a>
          <a-divider type="vertical" />
          <a @click="handleDownload(record)">录音下载</a>
        </div>
      </s-table>
      <general-export ref="generalExport" />
    </a-card>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    GeneralExport: () => import('@/views/admin/Table/GeneralExport'),
    AudioPlayback: () => import('@/views/statistic/AudioPlayback')
  },
  data () {
    return {
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      sourceUrl: null,
      // 时间组件
      searchDate: null,
      advanced: false,
      // 搜索参数
      queryParam: {},
      where: '',
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '主叫号码',
        dataIndex: 'src',
        sorter: true
      }, {
        title: '被叫号码',
        dataIndex: 'dst',
        sorter: true
      }, {
        title: '呼叫状态',
        dataIndex: 'disposition',
        scopedSlots: { customRender: 'disposition' },
        sorter: false
      }, {
        title: '振铃时长',
        dataIndex: 'ringtime',
        sorter: true
      }, {
        title: '通话时长',
        dataIndex: 'duration',
        sorter: true
      }, {
        title: '挂断方',
        dataIndex: 'hangup',
        scopedSlots: { customRender: 'hangup' },
        sorter: false
      }, {
        title: '呼叫时间',
        dataIndex: 'calldate',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' }
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/callrecord/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.queryParam.begin_time = res.result.begin_time
        this.queryParam.end_time = res.result.end_time
        this.searchDate = [res.result.begin_time ? this.moment(res.result.begin_time, 'YYYY-MM-DD HH:mm:ss') : '', res.result.end_time ? this.moment(res.result.end_time, 'YYYY-MM-DD HH:mm:ss') : '']
        this.where = res.result.where
        return res.result
      })
    },
    handlePlayback (record) {
      this.sourceUrl = this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + record.recordingfile
      this.$setSetting({ audioPlayData: { visible: true, sourceUrl: this.sourceUrl } })
    },
    handleDownload (record) {
      window.open(this.setting.interfaceurl + 'sdk/index/record/?type=download&file=' + record.recordingfile)
    },
    handleEdit (record) {
      this.$refs.modalForm.show({
        action: 'edit',
        title: '编辑',
        url: '/admin/user/edit',
        record: record
      })
    },
    handleExport () {
      this.$refs.generalExport.show({
        controller: 'statistic/Api',
        method: 'exportCallRecord',
        parameter: {
          where: this.where,
          type: 'all'
        }
      })
    },
    getSearchDate (date, dateString) {
      this.queryParam.begin_time = dateString[0]
      this.queryParam.end_time = dateString[1]
    }
  }
}
</script>
