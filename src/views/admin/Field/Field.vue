<template>
  <a-spin :spinning="loading">
    <a-card :bordered="false">
      <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
        <a-form-item label="显示名称">
          <a-input v-model="queryParam.name" allowClear />
        </a-form-item>
        <a-form-item label="系统名称">
          <a-input v-model="queryParam.alias" allowClear />
        </a-form-item>
        <a-form-item label="分类名称" >
          <a-auto-complete v-model="queryParam.category" @search="onSearch" allowClear>
            <template slot="dataSource">
              <a-select-option v-for="item1 in typeList" :key="item1.category">
                {{ item1.category }}
              </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-space>
          <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
          <a-button @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
          <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加</a-button>
          <a-button v-action:import icon="upload" @click="handImport">导入</a-button>
          <a-button icon="sort-descending" @click="handleSort">排序</a-button>
          <a-dropdown>
            <a-button><a-icon type="menu" />更多操作</a-button>
            <a-menu slot="overlay" @click="handMenu">
              <a-menu-item key="plus"><a-icon type="plus-circle" />从其他数据表中添加字段</a-menu-item>
              <a-menu-item key="sync"><a-icon type="sync" />字段同步</a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-space>
      </a-form>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="sorter"
      >
        <span slot="fieldkey" slot-scope="text">
          <template v-if="text =='unique_key'"><a-badge status="success" />唯一</template>
          <template v-else-if="text =='key'"><a-badge status="processing" />索引</template>
          <template v-else><a-badge status="default" />未设置</template>
        </span>
        <template slot="rule" slot-scope="text">
          <template v-if="text =='allow'"><a-badge status="success" />允许</template>
          <template v-else><a-badge status="default" />只读</template>
        </template>
        <template slot="width" slot-scope="text">
          <template v-if="text">{{ text }}</template>
          <template v-else>--</template>
        </template>
        <template slot="disabled" slot-scope="text">
          <template v-if="text == '0'"><a-badge status="success" />启用</template>
          <template v-else><a-badge status="default" />禁用</template>
        </template>
        <span slot="required" slot-scope="text">
          <template v-if="text =='true'"><a-badge status="success" />是</template>
          <template v-else><a-badge status="default" />否</template>
        </span>
        <template slot="trace" slot-scope="text">
          <template v-if="text == '1'"><a-badge status="success" />启用</template>
          <template v-else><a-badge status="default" />禁用</template>
        </template>
        <div slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
      <field-form ref="fieldForm" :key="refreshKey" @ok="handleOk" />
      <field-import ref="fieldImport" @ok="handleOk" />
      <field-sort ref="fieldSort" :tableid="tableid" @ok="handleOk"/>
      <field-opreation ref="fieldOpreation" @ok="handleOk" />
    </a-card>
  </a-spin>
</template>
<script>
export default {
  components: {
    FieldForm: () => import('./FieldForm'),
    FieldImport: () => import('./FieldImport'),
    FieldOpreation: () => import('./FieldOpreation'),
    FieldSort: () => import('./FieldSort')
  },
  props: {
    tableid: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      refreshKey: 0,
      loading: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 100,
        scopedSlots: { customRender: 'action' },
        align: 'center'
      }, {
        title: 'ID',
        dataIndex: 'id',
        sorter: true,
        width: 60
      }, {
        title: '排序',
        dataIndex: 'listorder',
        sorter: true,
        width: 60
      }, {
        title: '显示名称',
        dataIndex: 'name',
        sorter: true
      }, {
        title: '系统名称',
        dataIndex: 'alias',
        sorter: true
      }, {
        title: 'UI组件',
        dataIndex: 'myformtype'
      }, {
        title: '字段类型',
        dataIndex: 'fieldtype',
        sorter: true
      }, {
        title: '字段长度',
        dataIndex: 'fieldlength',
        sorter: true
      }, {
        title: '列宽',
        dataIndex: 'setting.width',
        scopedSlots: { customRender: 'width' }
      }, {
        title: '字段状态',
        dataIndex: 'disabled',
        sorter: true,
        scopedSlots: { customRender: 'disabled' }
      }, {
        title: '允许/只读',
        dataIndex: 'setting.rule',
        scopedSlots: { customRender: 'rule' }
      }, {
        title: '索引唯一',
        dataIndex: 'fieldkey',
        scopedSlots: { customRender: 'fieldkey' },
        sorter: true
      }, {
        title: '必填',
        dataIndex: 'setting.attribute.required',
        scopedSlots: { customRender: 'required' }
      }, {
        title: '留痕',
        dataIndex: 'trace',
        scopedSlots: { customRender: 'trace' },
        sorter: true
      }, {
        title: '分类名称',
        dataIndex: 'category',
        sorter: true
      }, {
        title: '最后修改人',
        dataIndex: 'update_user',
        sorter: true
      }, {
        title: '最后修改时间',
        dataIndex: 'update_time',
        sorter: true
      }],
      colLayout: {},
      sorter: { field: 'listorder', order: 'ascend' },
      // 更多操作功能key
      opreationKey: '',
      typeList: [],
      timeoutId: null
    }
  },
  methods: {
    loadDataTable (parameter) {
      let params = Object.assign(parameter, this.queryParam, { tableid: this.tableid })
      params = JSON.parse(JSON.stringify(params))
      return this.axios({
        url: '/admin/field/init',
        params: params
      }).then(res => {
        res.result.data.forEach(item => {
          item.setting = JSON.parse(item.setting)
        })
        return res.result
      })
    },
    // 自动完成搜索
    onSearch (val) {
      if (val) {
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.axios({
            url: '/admin/table/searchCategory/',
            params: {
              type: 'field',
              tableid: this.tableid,
              category: val
            }
          }).then(res => {
            this.typeList = res.result.data
          })
        }, 500)
      }
    },
    handleAdd () {
      this.refreshKey = this.refreshKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.fieldForm.show({
          action: 'add',
          title: '添加',
          url: '/admin/field/add',
          tableid: this.tableid
        })
      })
    },
    // 打开导入抽屉
    handImport () {
      this.$refs.fieldImport.show({
        table_id: this.tableid
      })
    },
    handleSort () {
      this.$refs.fieldSort.show({
        action: 'sort',
        title: '排序',
        data: ''
      })
    },
    handleEdit (record) {
      this.refreshKey = this.refreshKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.fieldForm.show({
          action: 'edit',
          title: '编辑: ' + record.name,
          url: '/admin/field/edit',
          record: record,
          tableid: this.tableid || record.tableid
        })
      })
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    handleDelete (record) {
      const that = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          that.axios({
            url: '/admin/field/delete',
            data: { id: record.fieldid }
          }).then(res => {
            if (res.message) {
              that.$message.warning(res.message)
            } else {
              that.$refs.table.refresh()
            }
          })
        }
      })
    },
    handleReal (record, type) {
      this.loading = true
      if (type === 'edit') {
        record.editreal = true
        this.loading = false
      } else {
        this.handleSubmit(record)
        record.editreal = false
        this.loading = false
      }
    },
    // 更多操作
    handMenu (e) {
      const key = e.key
      const that = this
      switch (key) {
        case 'plus':
          this.$refs.fieldOpreation.show({
            action: 'add',
            title: '添加',
            url: '/admin/field/add',
            tableid: that.tableid
          })
          break
        case 'sync':
          this.$confirm({
            content: '您确认要同步字段吗？',
            onOk () {
              that.loading = true
              that.axios({
                url: '/admin/field/fieldSync',
                params: { tableid: that.tableid }
              }).then(res => {
                that.loading = false
                that.$refs.table.refresh()
                that.$message.success('操作成功')
              })
            }
          })
          break
        default:
          break
      }
    }
  }
}
</script>
