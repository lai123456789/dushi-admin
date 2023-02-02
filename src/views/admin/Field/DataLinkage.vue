<template>
  <a-drawer
    :destroyOnClose="true"
    title="数据联动设置"
    :width="600"
    :visible="visible"
    @close="visible = !visible"
  >
    <a-spin :spinning="loading">
      <div>
        <a-form :form="form">
          <a-form-item label="联动模式" :labelCol="{ span: 3}" :wrapperCol="{ span: 21}" v-if="data.formtype === 'combobox'">
            <a-radio-group v-model="linkModel" @change="(e) => linkModel = e.target.value">
              <a-radio value="1">本表字段联动</a-radio>
              <a-radio value="2">其他表联动</a-radio>
            </a-radio-group>
          </a-form-item>
          <div v-if="linkModel === '1'">
            <a-form-item label="联动字段">
              <a-select
                placeholder="请选择当前表字段"
                show-search
                option-filter-prop="children"
                :defaultValue="currentFieldCause"
                :allowClear="true"
                @change="changeCurrent" >
                <a-select-option v-for="item in updown" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div v-if="linkModel === '2'">
            <a-form-item label="联动数据表" >
              <a-cascader
                :show-search="true"
                placeholder="请选择源数据表"
                :defaultValue="dataSource"
                :options="table_field"
                @change="changeTable" />
            </a-form-item>
            <a-form-item label="数据联动">
              <a-row>
                <a-col :span="9">
                  <a-select
                    placeholder="请选择当前表字段"
                    show-search
                    option-filter-prop="children"
                    :defaultValue="currentFieldCause"
                    :allowClear="true"
                    @change="changeCurrent" >
                    <a-select-option v-for="item in current_fields_cause" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="3">
                  <div style="width: 100%; text-align: center;">值等于</div>
                </a-col>
                <a-col :span="9">
                  <a-select
                    placeholder="请选择联动数据表字段"
                    show-search
                    option-filter-prop="children"
                    :defaultValue="sourceFieldCause"
                    :allowClear="true"
                    @change="changeSource">
                    <a-select-option v-for="item in source_fields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="3">
                  <div style="width: 100%; text-align: center;">的值时</div>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="9">
                  <a-input placeholder="当前前端名称" :value="data.name" disabled />
                </a-col>
                <a-col :span="3">
                  <div style="width: 100%; text-align: center;">联动显示</div>
                </a-col>
                <a-col :span="9">
                  <a-select
                    placeholder="请选择联动数据表字段"
                    show-search
                    option-filter-prop="children"
                    :defaultValue="sourceFieldEffect"
                    @change="changeSourceEffect" >
                    <a-select-option v-for="item in source_fields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>
          </div>
        </a-form>
      </div>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      loading: false,
      visible: false,
      form: this.$form.createForm(this),
      data: [],
      title: '',
      config: {},
      table_field: [],
      dataSource: [],
      current_fields: [],
      current_fields_cause: [],
      updown: [],
      linkModel: '2',
      current_fieldsObj: {},
      source_fields: [],
      source_fields_cause: [],
      source_fields_effect: [],
      source_fieldsObj: {},
      currentFieldCause: '',
      sourceFieldCause: '',
      sourceFieldEffect: '',
      formtype_cause: '',
      formtype_effect: ''
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.data = config.data || {}
      this.linkModel = this.data.formtype === 'combobox' ? '1' : '2'
      this.formtype_effect = this.data.formtype
      this.table_field = config.table_field
      const currentTableField = config.tableid
      this.loading = true
      const param = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      this.axios({
        url: '/admin/field/init',
        params: Object.assign(param, { tableid: currentTableField })
      }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.current_fields = JSON.parse(JSON.stringify(res.result.data))
          res.result.data.forEach(item => {
            this.current_fieldsObj[item.alias] = item
          })
          this.current_fields_cause = this.current_fields
          this.updown = this.current_fields_cause.filter(item => item.formtype === 'combobox' && item.name !== this.data.name)
        } else {
          this.$message.error(res.message)
        }
      })
      const setting = config.setting
      if (setting.form && setting.form.defaultValueLink) {
        this.currentFieldCause = setting.form.defaultValueLink.currentFieldCause
        this.linkModel = setting.form.defaultValueLink.linkModel
        this.dataSource = setting.form.defaultValueLink.dataSource
        this.sourceFieldCause = setting.form.defaultValueLink.sourceFieldCause
        this.sourceFieldEffect = setting.form.defaultValueLink.sourceFieldEffect
        this.changeTable(this.dataSource)
      }
    },
    // 选择数据表
    changeTable (val) {
      if (!val || val.length === 0) {
        this.source_fields = []
        this.source_fields_cause = []
        this.source_fields_effect = []
      } else {
        this.dataSource = val
        const tableField = val[val.length - 1]
        const param = {
          pageNo: 1,
          pageSize: 1000,
          sortField: 'id',
          sortOrder: 'descend'
        }
        this.axios({
          url: '/admin/field/init',
          params: Object.assign(param, { tableid: tableField })
        }).then(res => {
          if (res.code === 0) {
            this.source_fields = JSON.parse(JSON.stringify(res.result.data))
            res.result.data.forEach(item => {
              this.source_fieldsObj[item.alias] = item
            })
          } else {
            this.$message.error(res.message)
          }
        })
      }
    },
    // 选择当前字段
    changeCurrent (val) {
      this.currentFieldCause = val
    },
    changeSource (val) {
      this.sourceFieldCause = val
    },
    changeSourceEffect (val) {
      this.sourceFieldEffect = val
    },
    handleSubmit () {
      const obj = {}
      obj.currentFieldCause = this.currentFieldCause
      if (this.linkModel === '1') {
        obj.sourceFieldCause = ''
        obj.sourceFieldEffect = ''
        obj.dataSource = []
      } else {
        obj.sourceFieldCause = this.sourceFieldCause
        obj.sourceFieldEffect = this.sourceFieldEffect
        obj.dataSource = this.dataSource
      }
      obj.linkModel = this.linkModel
      this.$emit('ok', obj)
      this.visible = false
    }
  }
}
</script>
