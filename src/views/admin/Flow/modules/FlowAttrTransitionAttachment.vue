<template>
  <div>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button icon="plus" @click="handleShow">添加</a-button>
        <a-button icon="sort-ascending" @click="handleSort">排序</a-button>
      </div>
      <a-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :dataSource="array_data"
        :pagination="false"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record, index">
          <a-popconfirm
            title="您确定要删除该记录吗?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(index)"
          >
            <a>删除</a>
          </a-popconfirm>
        </div>
        <span slot="formCondition" slot-scope="text, record, index">
          <a @click="handlePriv(record, index)">
            <a-badge :status="text && text.value ? 'success' : 'default' " />
            设置</a>
        </span>
      </a-table>
    </a-card>
    <a-drawer
      :destroyOnClose="true"
      title="添加"
      :width="600"
      :visible="visible"
      @close="visible=!visible" >
      <a-spin :spinning="loading">
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="columnsFile"
          :data="loadDataTable"
          :rowSelection="rowSelection"
        >
        </s-table>
        <div class="bbar">
          <a-button type="primary" html-type="submit" @click="handleSubmit">保存</a-button>
          <a-button @click="visible = !visible">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
    <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
    <!-- 启用条件 -->
    <condition ref="condition" @ok="getFormCondition" :params="{ tableid: tableid, data: data.formCondition || { html:'', value:'' } }"/>
  </div>
</template>
<script>
export default {
  components: {
    FlowAttrTransitionSort: () => import('./FlowAttrTransitionSort'),
    Condition: () => import('@/views/admin/Table/Condition')
  },
  data () {
    return {
      array_data: this.showData,
      loading: false,
      visible: false,
      form: this.$form.createForm(this),
      data: {},
      dataIndex: '',
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        }
      },
      queryParam: {},
      columns: [{
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 140,
        scopedSlots: { customRender: 'action' }
      }, {
        title: '#',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '附件名称',
        dataIndex: 'wjmc'
      }, {
        title: '启用条件',
        dataIndex: 'formCondition',
        scopedSlots: { customRender: 'formCondition' }
      }],
      columnsFile: [{
        title: '#',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '附件编号',
        dataIndex: 'wdbh'
      }, {
        title: '附件名称',
        dataIndex: 'wjmc'
      }, {
        title: '附件类型',
        dataIndex: 'wjlx'
      }]
    }
  },
  props: {
    tableid: {
      type: String,
      default: () => ''
    },
    showData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    array_data () {
      this.$emit('ok', this.array_data)
    }
  },
  methods: {
    handleShow () {
      this.visible = true
    },
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/UserTable/init',
        params: Object.assign(parameter, { flowScope: 'proceed' }),
        data: Object.assign(this.queryParam, { tplviewid: '03d9987c5d5e44f44010261ec7ea62ff' })
      }).then(res => {
        return res.result
      })
    },
    handleSort () {
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: this.array_data
      })
    },
    getSort (data) {
      this.array_data = data
    },
    handlePriv (record, index) {
      this.data = record
      this.dataIndex = index
      this.$refs.condition.show({
        title: '启用条件: ' + record.name
      })
    },
    getFormCondition (data) {
      this.array_data[this.dataIndex].formCondition = data.data
    },
    handleDelete (index) {
      this.array_data.splice(index, 1)
    },
    handleSubmit () {
      this.selectedRows.forEach(item => {
        if (this.array_data.every(arrItem => arrItem.wdbh !== item.wdbh)) {
          item.formCondition = []
          item.name = item.wjmc
          this.array_data.push(item)
        }
      })
      this.$message.success('操作成功')
      this.visible = false
    }
  }
}
</script>
