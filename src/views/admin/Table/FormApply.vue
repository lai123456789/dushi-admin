<template>
  <div>
    <div class="table-operator">
      <a-button v-action:add icon="plus" @click="handleAdd">添加</a-button>
      <a-button v-action:sort icon="sort-ascending" @click="handleSort">排序</a-button>
    </div>
    <a-table
      ref="table"
      rowKey="id"
      :columns="columns"
      :dataSource="formview"
      size="small"
      :pagination="false">
      <span slot="tplview" slot-scope="text, record" style="cursor: pointer; user-select: none;" >
        <template v-if="!record.nameFlag">
          <span v-for="(value, index) in tplviewArr" :key="index">
            {{ value.value === text ? value.text : '' }}
          </span>
        </template>
        <template v-else>
          <a-select
            placeholder="请选择视图"
            size="small"
            :show-search="true"
            option-filter-prop="children"
            v-model="record.tplview"
            @change="(val) => { handleTpl(record, val) }"
          >
            <a-select-option v-for="(value, key) in tplviewArr" :key="key" :value="value.value">
              {{ value.text }}
            </a-select-option>
          </a-select>
        </template>
      </span>
      <span slot="formCondition" slot-scope="text, record, index">
        <a @click="handlePriv(record, index)">
          <a-badge :status="record.condiFlag ? 'success' : 'default' " />
          设置</a>
      </span>
      <span slot="formviewfieldpriv" slot-scope="text, record, index">
        <a @click="handleFieldPriv(record, index)">
          <a-badge :status="record.privFlag ? 'success' : 'default'" />
          设置</a>
      </span>
      <div slot="action" slot-scope="text, record, index">
        <a @click="handleEdit(record)">
          <span v-if="!record.nameFlag">编辑</span>
          <span v-else>保存</span>
        </a>
        <a-divider type="vertical" />
        <a-popconfirm
          title="您确认要删除该记录吗？"
          @confirm="handleDelete(index)"
        >
          <a>删除</a>
        </a-popconfirm>
      </div>
    </a-table>
    <!-- 启用条件 -->
    <querier-form-rule ref="querierFormRule" @ok="getFormCondition" />
    <!-- 操作权限 -->
    <priv-action-form ref="privActionForm" :params="{formview: formview}" @func="getFormview"/>
    <!-- 排序 -->
    <ColumnSort ref="columnSort" @ok="getList" />
  </div>
</template>
<script>
export default {
  components: {
    PrivActionForm: () => import('./PrivActionForm'),
    QuerierFormRule: () => import('./QuerierFormRule'),
    ColumnSort: () => import('./ColumnSort')
  },
  props: {
    params: {
      type: Object,
      default () {
        return []
      },
      required: true
    },
    formviewData: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    page: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '名称',
        dataIndex: 'tplview',
        width: 260,
        scopedSlots: { customRender: 'tplview' }
      }, {
        title: '启用条件',
        dataIndex: 'formCondition',
        scopedSlots: { customRender: 'formCondition' }
      }, {
        title: '操作权限',
        dataIndex: 'formviewfieldpriv',
        scopedSlots: { customRender: 'formviewfieldpriv' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 240,
        scopedSlots: { customRender: 'action' }
      }],
      formview: [],
      tplviewArr: [],
      tplviewObj: {},
      tableid: ''
    }
  },
  watch: {
    params: {
      handler (newValue) {
        this.tplviewArr = newValue.tplviewArr
        this.tableid = this.params.tableid
        this.tplviewArr.forEach(item => {
          this.tplviewObj[item.value] = item
        })
      },
      immediate: true
    },
    formviewData: {
      handler (newValue) {
        this.formview = JSON.parse(JSON.stringify(newValue)).filter(item => item.tplview)
      },
      immediate: true
    },
    formview: {
      handler (newValue) {
        newValue.forEach(item => {
          if (!item.tplview_name && item.tplview) {
            item.tplview_name = this.tplviewObj[item.tplview].text
          }
          if (item.formCondition && item.formCondition.length > 0) {
            if (item.formCondition[0].simpleCondition.length === 1) {
              if (item.formCondition[0].simpleCondition[0].fieldUser !== 'field') {
                item.condiFlag = true
              } else {
                item.condiFlag = !!item.formCondition[0].simpleCondition[0].field
              }
            } else {
              item.condiFlag = true
            }
          } else {
            item.condiFlag = false
          }
          if (item.formviewfieldpriv) {
            const priv = JSON.parse(item.formviewfieldpriv)
            item.privFlag = priv.some(privItem => {
              const flag1 = !!privItem.formviewfieldpriv
              const flag2 = privItem.rule !== 'inherit'
              if (flag1 || flag2) {
                return true
              } else {
                return false
              }
            })
          } else {
            item.privFlag = false
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handleAdd () {
      const obj = {
        nameFlag: true,
        formviewfieldpriv: '',
        formviewpriv: '',
        id: (new Date()).valueOf(),
        listorder: this.formview.length * 10 + 10,
        tplview: '',
        tplview_name: ''
      }
      if (this.page === 'workflowForm') {
        this.axios({
          url: '/admin/UserTable/tableFields',
          params: { tableid: this.tableid }
        }).then((res) => {
          const formviewfieldpriv = []
          for (var k in res.result) {
            formviewfieldpriv.push({
              id: (new Date()).valueOf() + Math.random() * 1000,
              alias: res.result[k].alias,
              name: res.result[k].name,
              formviewfieldpriv: '',
              rule: 'readonly'
            })
          }
          obj.formviewfieldpriv = JSON.stringify(formviewfieldpriv)
          this.formview.push(obj)
        })
      } else {
        this.formview.push(obj)
      }
    },
    // 排序
    handleSort () {
      const data = this.formview.map(item => {
        item.name = item.tplview_name
        return item
      })
      this.$refs.columnSort.show({
        action: 'sort',
        title: '排序',
        data: data
      })
    },
    // 获取重新排序列表
    getList (data) {
      data.forEach((item, index) => {
        item.listorder = String((index + 1) * 10)
      })
      this.formview = data.map(item => {
        delete item.name
        return item
      })
    },
    handleTpl (record, val) {
      record.tplview_name = this.tplviewObj[val].text
      record.nameFlag = false
      this.formview = JSON.parse(JSON.stringify(this.formview))
    },
    handleEdit (record) {
      record.nameFlag = !record.nameFlag
      if (!record.tplview) {
        record.nameFlag = true
        this.$message.error('请选择视图')
      }
      this.formview = JSON.parse(JSON.stringify(this.formview))
    },
    getFormview (data, index) {
      this.formview.splice(index, 1, data)
    },
    handleDelete (index) {
      this.formview.splice(index, 1)
    },
    handlePriv (record, index) {
      this.tplviewArr.some(item => {
        if (item.value === record.tplview) {
          record.tplview_name = item.text
          return true
        }
      })
      this.$refs.querierFormRule.show({
        title: '启用条件: ' + record.tplview_name,
        record: record,
        index: index,
        formview: this.formview,
        page: 'dataForm',
        privArr: {
          visit: '可访问'
        },
        defaultpriv: 'visit'
      })
    },
    getFormCondition (index, data) {
      this.formview[index].formCondition = data
      this.formview = JSON.parse(JSON.stringify(this.formview))
    },
    handleFieldPriv (record, index) {
      this.tplviewArr.some(item => {
        if (item.value === record.tplview) {
          record.tplview_name = item.text
          return true
        }
      })
      this.$refs.privActionForm.show({
        action: 'add',
        title: '操作权限: ' + record.tplview_name,
        tableid: this.tableid,
        record: record,
        index: index
      })
    }
  }
}
</script>
