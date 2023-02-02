<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="700"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="字段规则">
          <a-select default-value="inherit" @change="handleRule">
            <a-select-option value="inherit">
              继承
            </a-select-option>
            <a-select-option value="allow">
              允许
            </a-select-option>
            <a-select-option value="readonly">
              只读
            </a-select-option>
            <a-select-option value="hidden">
              隐藏
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-table
          ref="table"
          rowKey="id"
          :columns="columns"
          :dataSource="fieldPrivData"
          size="small"
          :pagination="false">
          <span slot="priv" slot-scope="text">
            <a-badge v-if="text == ''" status="success" text="-" />
            <a-badge v-else status="success" text="√" />
          </span>
          <template slot="rule" slot-scope="text, record">
            <a-select
              :defaultValue="record.rule"
              v-model="record.rule"
              style="width: 70px;"
              size="small">
              <a-select-option value="inherit">
                继承
              </a-select-option>
              <a-select-option value="allow">
                允许
              </a-select-option>
              <a-select-option value="readonly">
                只读
              </a-select-option>
              <a-select-option value="hidden">
                隐藏
              </a-select-option>
            </a-select>
          </template>
          <div slot="priv" slot-scope="text, record, index">
            <a @click="handleEdit(record, index)">
              <a-badge v-if="record.formviewfieldpriv !== ''" status="success" text="设置" />
              <a-badge v-else status="default" text="设置" />
            </a>
          </div>
        </a-table>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible = !visible">关闭</a-button>
      </div>
    </a-spin>
    <!-- 授权 -->
    <priv-visit-form ref="privVisitForm" :params="{formview: fieldPrivData}" @func="getData"/>
  </a-drawer>
</template>
<script>
export default {
  components: { PrivVisitForm: () => import('./PrivVisitForm') },
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    return {
      config: {},
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      // 表头
      columns: [{
        title: '系统名称',
        dataIndex: 'alias'
      }, {
        title: '显示名称',
        dataIndex: 'name'
      }, {
        title: '字段规则',
        dataIndex: 'rule',
        scopedSlots: { customRender: 'rule' }
      }, {
        title: '权限',
        dataIndex: 'formviewfieldpriv',
        width: 100,
        scopedSlots: { customRender: 'priv' }
      }],
      fieldPrivData: [],
      actionOption: { inherit: '继承', allow: '允许', readonly: '只读', hidden: '隐藏' },
      data: []
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.data = config.record
      this.recordIndex = config.index
      this.fieldPrivData = this.data.formviewfieldpriv ? JSON.parse(this.data.formviewfieldpriv) : []
      this.axios({
        url: '/admin/UserTable/tableFields',
        params: { tableid: config.tableid }
      }).then((res) => {
        this.loading = false
        const newFieldData = []
        for (var kk in this.fieldPrivData) {
          newFieldData[this.fieldPrivData[kk].alias] = this.fieldPrivData[kk]
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
    onCellChange (key, dataIndex, value) {
      const newData = [...this.fieldPrivData]
      const target = newData.find(item => item.id === key)
      if (target) {
        target[dataIndex] = value
        this.fieldPrivData = newData
      }
    },
    handleEdit (record, index) {
      this.$refs.privVisitForm.show({
        action: 'edit',
        title: '设置操作权限',
        record: record,
        index: index,
        key: 'formviewfieldpriv',
        selectType: 'radio',
        privArr: {
          inherit: '继承',
          allow: '允许',
          readonly: '只读',
          hidden: '隐藏'
        },
        defaultpriv: 'inherit'
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.data = Object.assign(this.data, { formviewfieldpriv: this.fieldPrivData.length > 0 ? JSON.stringify(this.fieldPrivData) : '' })
          this.$emit('func', this.data, this.recordIndex)
          this.visible = false
          this.$message.success('操作成功')
        }
      })
    },
    handleRule (value) {
      const len = this.fieldPrivData.length
      const arr = this.fieldPrivData
      for (let i = 0; i < len; i++) {
        arr[i].rule = value
      }
      this.fieldPrivData = arr
    },
    getData (e) {
      this.formviewfieldpriv = e
    }
  }
}
</script>
