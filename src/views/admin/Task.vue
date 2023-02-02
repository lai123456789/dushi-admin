<template>
  <div>
    <a-card class="table-search">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="refresh">重置</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="任务状态">
              <a-select v-model="queryParam.status" :allowClear="true">
                <a-select-option value="0">未开始</a-select-option>
                <a-select-option value="1">进行中</a-select-option>
                <a-select-option value="2">已完成</a-select-option>
                <a-select-option value="3">失败</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="任务类型">
              <a-select v-model="queryParam.type" :allowClear="true">
                <a-select-option value="export">导出</a-select-option>
                <a-select-option value="import">导入</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="创建人">
              <a-input v-model="queryParam.create_user"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="创建时间">
              <a-range-picker
                :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                :placeholder="['开始时间', '结束时间']"
                v-model="rangeTime"
                @change="getStartDate"
                style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="执行时长">
              <a-input-group compact style="width: 100%; display: flex;">
                <a-input-number
                  style="flex: 1; text-align: center"
                  :min="0"
                  :value="startTime"
                  placeholder="最小值"
                  @change="(val) => getTime(val, endTime)" />
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input-number
                  style="flex: 1; text-align: center; border-left: 0"
                  :min="0"
                  :value="endTime"
                  placeholder="最大值"
                  @change="(val) => getTime(startTime, val)"/>
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="业务编号">
              <a-input v-model="queryParam.number"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
        :scroll="{ x: 1570 }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="handleView(record)">查看</a>
          <a-divider type="vertical" />
          <a @click="handleDownload(record)" :disabled="record.status !== '已完成'" >下载</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <user-table-import-view ref="userTableImportView" />
  </div>
</template>
<script>
export default {
  components: {
    UserTableImportView: () => import('./UserTable/UserTableImportView')
  },
  data () {
    return {
      indexKey: 0,
      advanced: false,
      // 搜索参数
      queryParam: {},
      colLayout: {},
      sorter: {},
      taskType: [],
      rangeTime: null,
      startTime: '',
      endTime: '',
      // 表头
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
        title: '任务名称',
        dataIndex: 'filename',
        ellipsis: false,
        sorter: true
      }, {
        title: '任务类型',
        dataIndex: 'type',
        sorter: true,
        width: 100
      }, {
        title: '创建人',
        dataIndex: 'create_user',
        sorter: true,
        width: 120
      }, {
        title: '创建时间',
        dataIndex: 'create_time',
        sorter: true,
        width: 150
      }, {
        title: '任务状态',
        dataIndex: 'status',
        sorter: true,
        width: 100
      }, {
        title: '执行时间',
        dataIndex: 'run_time',
        sorter: true,
        width: 150
      }, {
        title: '执行时长/s',
        dataIndex: 'duration',
        sorter: true,
        width: 100
      }, {
        title: '业务编号',
        dataIndex: 'number',
        sorter: true,
        width: 280
      }]
    }
  },
  created () {
    this.changeAdvanced()
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/Task/init',
        params: Object.assign(this.sorter, parameter),
        data: Object.assign(this.queryParam)
      }).then(res => {
        res.result.data.forEach(item => {
          item.type = item.type !== 'export' ? '导入' : '导出'
          switch (item.status) {
            case '0':
              item.status = '未完成'
              break
            case '1':
              item.status = '进行中'
              break
            case '2':
              item.status = '已完成'
              break
            case '3':
              item.status = '失败'
              break
            default:
              break
          }
        })
        return res.result
      })
    },
    // 获取创建时间
    getStartDate (date, dateString) {
      this.queryParam.create_time = dateString
    },
    // 获取执行时长
    getTime (startTime, endTime) {
      this.startTime = startTime
      this.endTime = endTime
      this.queryParam.duration = [startTime, endTime]
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
    refresh () {
      this.queryParam = {
        status: '',
        type: ''
      }
      this.rangeTime = null
      this.startTime = ''
      this.endTime = ''
      this.$refs.table.refresh()
    },
    // 查看
    handleView (record) {
      this.$refs.userTableImportView.show({
        action: 'view',
        title: '查看',
        url: '/admin/task/view',
        record: record
      })
    },
    // 下载
    handleDownload (record) {
      window.open(`${process.env.VUE_APP_API_BASE_URL}admin/api/download/?filepath=${record.filepath}&filename=${record.filename}`)
    },
    // 删除
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: '您确认要删除这条数据吗?',
        onOk () {
          that.axios({
            url: '/admin/Task/delete',
            params: { id: record.id }
          }).then(res => {
            if (res.code === 0) {
              that.$message.success('已删除')
            } else {
              that.$message.error(res.message)
            }
            that.$refs.table.refresh()
          })
        },
        onCancel () {}
      })
    }
  }
}
</script>
