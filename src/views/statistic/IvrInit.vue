<template>
  <div>
    <a-drawer
      :title="config.title"
      :width="400"
      :visible="visible"
      @close="visible=!visible"
    >
      <a-spin :spinning="loading">
        <a-form :form="form" layout="vertical">
          <a-form-item label="IVR_ID">
            <a-input v-decorator="['info[ivr_id]', {initialValue: this.config.data.ivr_id}]" />
          </a-form-item>
          <a-form-item label="IVR节点">
            <a-input v-decorator="['info[name]', {initialValue: this.config.data.name}]" />
          </a-form-item>
          <a-form-item label="按键值">
            <a-input v-decorator="['info[key]', {initialValue: this.config.data.key}]" />
          </a-form-item>
          <a-form-item label="按键值说明">
            <a-input v-decorator="['info[key_desc]', {initialValue: this.config.data.key_desc}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit(true)">保存</a-button>
          <a-button @click="handleSubmit(false)">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <div class="title">过滤</div>
          <a-space style="margin-left: 8px">
            <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
            <a-button @click="() => {queryParam = {}; $refs.table.refresh(true)}">重置</a-button>
            <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
            <a-button @click="handleDelete" type="danger" :disabled="selectedRowKeys.length==0">批量删除</a-button>
            <a @click="changeAdvanced(true)">{{ advanced ? '收起' : '展开' }}<a-icon :type="advanced ? 'up' : 'down'"/></a>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-if="advanced" span="24">
            <div class="divider"></div>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="ID">
              <a-input v-model="queryParam.id" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="IVR_ID">
              <a-input v-model="queryParam.ivr_id" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="IVR节点">
              <a-input v-model="queryParam.name" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="按键值">
              <a-input v-model="queryParam.key" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="按键值说明">
              <a-input v-model="queryParam.key_desc" />
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
        :rowSelection="rowSelection"
        :sorter="sorter">
        <div slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      colLayout: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 6,
        xxl: 6
      },
      advanced: false,
      // 搜索参数
      form: this.$form.createForm(this),
      config: {
        data: {}
      },
      queryParam: {
        id: '',
        ivr_id: '',
        name: '',
        key: '',
        key_desc: ''
      },
      // 排序
      sorter: { field: 'id', order: 'descend' },
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 150,
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: 'IVR_ID',
        dataIndex: 'ivr_id',
        sorter: true
      }, {
        title: 'IVR节点',
        dataIndex: 'name',
        sorter: false
      }, {
        title: '按键值',
        dataIndex: 'key',
        sorter: true
      }, {
        title: '按键值说明',
        dataIndex: 'key_desc',
        sorter: false
      }],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/statistic/ivr/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
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
    // 添加
    handleAdd () {
      this.visible = true
      this.loading = true
      this.form.resetFields()
      this.config = {
        action: 'add',
        title: '添加',
        url: '/statistic/ivr/ivrAdd',
        data: {}
      }
      this.axios({
        url: this.config.url
      }).then((res) => {
        this.loading = false
        this.config.data = res.result
      })
    },
    // 编辑
    handleEdit (record) {
      this.visible = true
      this.loading = true
      const me = this
      this.form.resetFields()
      this.config = {
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/statistic/ivr/ivrEdit',
        record: record,
        data: {}
      }
      this.axios({
        url: this.config.url,
        params: { id: record.id }
      }).then((res) => {
        me.loading = false
        this.config.data = res.result
      })
    },
    // 删除
    handleDelete (record) {
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      const me = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          me.axios({
            url: '/statistic/ivr/ivrDel',
            data: { id: id }
          }).then(res => {
            table.refresh()
          })
        }
      })
    },
    // 搜索/保存数据
    handleSubmit (tag) {
      if (tag) {
        this.form.validateFields((errors, values) => {
          if (!errors) {
            this.loading = true
            this.axios({
              url: this.config.url,
              data: Object.assign(values, { id: this.config.data.id })
            }).then((res) => {
              this.visible = false
              this.loading = false
              if (res.message) {
                this.$message.warning(res.message)
              } else {
                this.$message.success('操作成功')
                this.$refs.table.refresh()
              }
            })
          }
        })
      } else {
        this.visible = false
      }
    }
  }
}
</script>
