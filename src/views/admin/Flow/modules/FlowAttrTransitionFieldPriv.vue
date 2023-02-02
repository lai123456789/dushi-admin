<template>
  <a-spin :spinning="false">
    <a-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :dataSource="fieldPrivData"
      :pagination="false">
      <span slot="priv" slot-scope="text">
        <a-badge v-if="text == ''" status="success" text="-" />
        <a-badge v-else status="success" text="√" />
      </span>
      <span slot="rule" slot-scope="text, record">
        <a-select style="width: 100px;" :defaultValue="text" @change="value => handleChange(value, record, 'rule')">
          <a-select-option value="inherit">继承</a-select-option>
          <a-select-option value="allow">允许</a-select-option>
          <a-select-option value="readonly">只读</a-select-option>
          <a-select-option value="hidden">隐藏</a-select-option>
        </a-select>
      </span>
      <div slot="priv" slot-scope="text, record, index">
        <a @click="handleEdit(record, index)">
          <a-badge v-if="record.formviewfieldpriv !== ''" status="success" text="设置" />
          <a-badge v-else status="default" text="设置" />
        </a>
      </div>
    </a-table>
    <priv-visit-form ref="privVisitForm" :params="{ fieldPrivData: fieldPrivData }"/>
  </a-spin>
  <!-- 授权 -->
</template>
<script>
export default {
  components: {
    PrivVisitForm: () => import('@/views/admin/Table/PrivVisitForm')
  },
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  created () {
    this.show()
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      // 表头
      columns: [{
        title: '系统名称',
        dataIndex: 'alias',
        width: 250
      }, {
        title: '显示名称',
        dataIndex: 'name',
        width: 250
      }, {
        title: '字段规则',
        dataIndex: 'rule',
        scopedSlots: { customRender: 'rule' },
        width: 250
      }, {
        title: '权限',
        dataIndex: 'formviewfieldpriv',
        scopedSlots: { customRender: 'priv' }
      }],
      fieldPrivData: [],
      flowData: {}
    }
  },
  methods: {
    show () {
      this.axios({
        url: '/admin/UserTable/tableFields',
        params: { tableid: this.params.flowData.params.modelid }
      }).then((res) => {
        this.loading = false
        const newFieldData = []
        for (var kk in this.params.fieldPrivData) {
          newFieldData[this.params.fieldPrivData[kk].alias] = this.params.fieldPrivData[kk]
        }
        const formviewfieldpriv = []
        for (var k in res.result) {
          formviewfieldpriv.push({
            id: newFieldData[res.result[k].alias] ? newFieldData[res.result[k].alias].id : (new Date()).valueOf() + Math.random() * 1000,
            alias: res.result[k].alias,
            name: res.result[k].name,
            formviewfieldpriv: newFieldData[res.result[k].alias] ? newFieldData[res.result[k].alias].formviewfieldpriv : '',
            rule: newFieldData[res.result[k].alias] ? newFieldData[res.result[k].alias].rule : 'inherit'
          })
        }
        this.fieldPrivData = formviewfieldpriv
      })
    },
    handleChange (value, record, column) {
      const newData = [...this.fieldPrivData]
      const target = newData.filter(item => record.id === item.id)[0]
      if (target) {
        target[column] = value
        this.fieldPrivData = newData
        target.editable = false
      }
    },
    editTableCell (record, editable) {
      const newData = [...this.fieldPrivData]
      const target = newData.filter(item => record.id === item.id)[0]
      if (target) {
        target.editable = editable
        this.fieldPrivData = newData
      }
    },
    handleEdit (record, index) {
      this.$refs.privVisitForm.show({
        action: 'edit',
        title: '授权：' + record.name,
        defaultpriv: 'inherit',
        selectType: 'radio',
        privArr: {
          inherit: '继承',
          allow: '允许',
          readonly: '只读',
          hidden: '隐藏'
        },
        key: 'formviewfieldpriv',
        record: record,
        index: index
      })
    },
    handleSubmit () {
      this.$emit('change', this.fieldPrivData)
      this.visible = false
      this.$emit('ok')
    }
  }
}
</script>
<style scoped>
  .editable-cell {
    position: relative;
  }

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    line-height: 18px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell:hover .editable-cell-icon {
    display: inline-block;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
</style>
