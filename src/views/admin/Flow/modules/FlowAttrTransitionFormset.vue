<template>
  <div>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button icon="plus" @click="handleShow('add')">添加</a-button>
        <a-button icon="sort-ascending" @click="handleSort">排序</a-button>
      </div>
      <a-table
        ref="table"
        size="small"
        rowKey="name"
        :columns="columns"
        :dataSource="formset_data"
        :pagination="false"
      >
        <div slot="action" slot-scope="text, record, index">
          <a @click="handleShow('edit', record, index)">编辑</a>
          <a-divider type="vertical" />
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
        <a-form :form="form" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
          <a-form-item label="数据表">
            <a-cascader
              placeholder="请选择数据表"
              v-decorator="['table', {initialValue: data.table || [], rules: [{required: true, message: '请选择数据表'}]}]"
              @change="getData"
              :show-search="{ filter }"
              :options="tableList" />
          </a-form-item>
          <a-form-item label="表单视图">
            <a-select showSearch option-filter-prop="children" v-decorator="['tplviewid', {initialValue: data.tplviewid, rules: [{required: true, message: '请选择表单视图'}]}]" >
              <a-select-option v-for="item in tplviewData" :key="item.uid">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
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
      formset_data: this.formsetData,
      loading: false,
      visible: false,
      action: 'add',
      form: this.$form.createForm(this),
      tableList: [],
      tplviewData: [],
      data: {},
      dataIndex: '',
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
        title: '表单名称',
        dataIndex: 'name'
      }, {
        title: '启用条件',
        width: 300,
        dataIndex: 'formCondition',
        scopedSlots: { customRender: 'formCondition' }
      }]
    }
  },
  props: {
    tableid: {
      type: String,
      default: () => ''
    },
    formsetData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    formset_data () {
      this.$emit('ok', this.formset_data)
    }
  },
  methods: {
    handleShow (type, record, index) {
      this.visible = true
      this.action = type
      this.data = record || {}
      this.dataIndex = index
      this.tplviewData = []
      this.axios({
        url: '/admin/field/add',
        data: Object.assign({ tableid: this.tableid })
      }).then((res) => {
        this.tableList = res.result.table_field.map(item => {
          if (item.children) {
            item.children.forEach(item1 => {
              delete item1.children
            })
          }
          return item
        })
        if (type === 'edit') {
          this.getData(record.table)
        }
      })
    },
    filter (inputValue, path) {
      return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    handlePriv (record, index) {
      this.data = record
      this.dataIndex = index
      this.$refs.condition.show({
        title: '启用条件: ' + record.name
      })
    },
    getFormCondition (data) {
      this.formset_data[this.dataIndex].formCondition = data.data
    },
    handleSort () {
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: this.formset_data
      })
    },
    getSort (data) {
      this.formset_data = data
    },
    getData (e) {
      this.axios({
        url: '/admin/UserTable/tableTplviews',
        params: {
          type: 'table_custom_view',
          tableid: e[1]
        }
      }).then(res => {
        this.tplviewData = res.result
      })
    },
    handleDelete (index) {
      this.formset_data.splice(index, 1)
    },
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          values.name = this.tplviewData.find(item => item.uid === values.tplviewid).name
          if (this.action === 'add') {
            this.formset_data.push(values)
          } else {
            values.formCondition = this.formset_data[this.dataIndex].formCondition
            values.condiFlag = this.formset_data[this.dataIndex].condiFlag
            this.formset_data.splice(this.dataIndex, 1, values)
          }
          this.visible = false
        }
      })
    }
  }
}
</script>
