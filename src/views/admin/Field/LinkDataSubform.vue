<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-card>
        <a-button type="primary" style="margin: -10px 0 10px;" @click="handleAdd">添加</a-button>
        <a-table
          ref="table"
          rowKey="id"
          :columns="columns"
          :dataSource="subformConditions"
          size="small"
          :pagination="false">
          <span slot="sourceField" slot-scope="text, record">
            <a-select
              style="width: 100%"
              size="small"
              show-search
              option-filter-prop="children"
              @change="(val) => { getSourceField(val, record) }"
              :defaultValue="text" >
              <a-select-option v-for="item in record.linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
            </a-select>
          </span>
          <span slot="subformField" slot-scope="text, record">
            <a-select
              style="width: 100%"
              size="small"
              show-search
              option-filter-prop="children"
              @change="(val) => { getField(val, record) }"
              :defaultValue="text" >
              <a-select-option v-for="item in record.subformFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
            </a-select>
          </span>
          <span slot="action" slot-scope="text, record">
            <a @click="handleDel(record)">删除</a>
          </span>
        </a-table>
      </a-card>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      subformConditions: [],
      columns: [{
        title: '源数据表子表字段',
        dataIndex: 'sourceField',
        scopedSlots: { customRender: 'sourceField' },
        width: 240
      }, {
        title: '当前表子表单字段',
        dataIndex: 'subformField',
        scopedSlots: { customRender: 'subformField' },
        width: 240
      }, {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }],
      linkFields: [],
      subformFields: [],
      subformFieldsObj: {},
      linkFieldsObj: {}
    }
  },
  methods: {
    show (config) {
      this.loading = true
      this.config = config
      this.visible = true
      this.tableId = config.dataView
      if (this.config.record.mapping && this.config.record.mapping.length !== 0) {
        this.subformConditions = this.config.record.mapping
      }
      const param = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      // 当前表字段
      this.axios({
        url: '/admin/field/init',
        params: Object.assign(param, { tableid: this.tableId })
      }).then(res => {
        if (res.code === 0) {
          this.subformFields = res.result.data
          res.result.data.forEach(item => {
            this.subformFieldsObj[item.alias] = item
          })
          this.subformConditions = this.subformConditions.map(item => {
            item.subformFields = item.field ? this.subformFields.filter(item1 => item1.formtype === this.subformFieldsObj[item.field].formtype) : this.subformFields
            return item
          })
        } else {
          this.$message.error(res.message)
        }
      })
      // 源数据表字段
      this.axios({
        url: '/admin/field/init',
        params: { pageNo: 1, pageSize: 1000, sortField: 'id', sortOrder: 'descend', tableid: config.sourceDataView }
      }).then(res => {
        if (res.code === 0) {
          this.linkFields = res.result.data
          res.result.data.forEach(item => {
            this.linkFieldsObj[item.alias] = item
          })
          this.subformConditions = this.subformConditions.map(item => {
            item.linkFields = item.sourceField ? this.linkFields.filter(item1 => item1.formtype === this.linkFieldsObj[item.sourceField].formtype) : this.linkFields
            return item
          })
          this.loading = false
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 添加映射条件
    handleAdd () {
      this.subformConditions.push({
        id: new Date().valueOf(),
        sourceField: '',
        subformField: '',
        subformFields: this.subformFields,
        linkFields: this.linkFields
      })
    },
    // 删除映射条件
    handleDel (record) {
      this.subformConditions = this.subformConditions.filter(item => item.id !== record.id)
    },
    // 映射关系字段类型一致
    getSourceField (val, record) {
      record.sourceField = val
      if (!val) {
        record.linkFields = this.linkFields
        record.subformFields = this.subformFields
      } else {
        const formtype = this.linkFieldsObj[val].formtype
        record.linkFields = this.linkFields.filter(item => item.formtype === formtype)
        record.subformFields = this.subformFields.filter(item => item.formtype === formtype)
      }
      this.subformConditions = JSON.parse(JSON.stringify(this.subformConditions))
    },
    getField (val, record) {
      record.subformField = val
      if (!val) {
        record.linkFields = this.linkFields
        record.subformFields = this.subformFields
      } else {
        const formtype = this.subformFieldsObj[val].formtype
        record.linkFields = this.linkFields.filter(item => item.formtype === formtype)
        record.subformFields = this.subformFields.filter(item => item.formtype === formtype)
        if (this.subformFieldsObj[val].formtype === 'subform') {
          record.formtype = this.subformFieldsObj[val].formtype
        } else {
          delete record.formtype
        }
      }
      this.subformConditions = JSON.parse(JSON.stringify(this.subformConditions))
    },
    // 保存
    handleSubmit () {
      this.visible = false
      this.config.record.mapping = this.subformConditions
      this.$emit('ok', this.config.record)
    }
  }
}
</script>
