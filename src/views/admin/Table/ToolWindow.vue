<template>
  <a-drawer
    :destroyOnClose="true"
    title="开窗选择"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item label="开窗目的数据表" :wrapperCol="wrapperCol">
          <a-cascader
            placeholder="请选择开窗目的数据表"
            :showSearch="true"
            :allowClear="true"
            option-filter-prop="children"
            :options="table_field"
            @change="handleTable"
            v-decorator="['winTable', {
              initialValue: data.winTable, rules: [{ required: true, message: '开窗目的数据表不能为空'}]
            }]"
          />
        </a-form-item>
        <a-form-item label="开窗目的数据窗口" :wrapperCol="wrapperCol">
          <a-row>
            <a-col :span="18">
              <a-select
                :allowClear="true"
                show-search
                option-filter-prop="children"
                placeholder="请选择开窗目的数据窗口"
                @change="handleChangeDataForm"
                v-decorator="['dateView', {
                  initialValue: data.dateView, rules: [{ required: true, message: '开窗目数据窗口不能为空'}]
                }]"
              >
                <a-select-option v-for="item in tpl" :key="item.uid" :value="item.uid">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="5">
              <a-button-group style="width: 100%; margin: 4px 20px; display: flex; justify-content: center; align-items: center;">
                <a-button style="padding: 0 18px;" :disabled="dataFormFlag" @click="handleDataForm('add')">添加</a-button>
                <a-button style="padding: 0 18px 0 19px;" :disabled="!dataFormFlag" @click="handleDataForm('edit')">编辑</a-button>
              </a-button-group>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="开窗关联条件" :validate-status="fieldStatus" :help="fieldHelp" :wrapperCol="wrapperCol">
          <a-row>
            <a-col :span="10">
              <a-select
                placeholder="请选择开窗数据表字段"
                show-search
                :allowClear="true"
                option-filter-prop="children"
                @change="getWinField"
                v-decorator="['winField', {
                  initialValue: data.winField
                }]"
              >
                <a-select-option v-for="item in linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <div style="width: 100%; text-align: center;">等于</div>
            </a-col>
            <a-col :span="10">
              <a-cascader
                :options="options"
                :showSearch="true"
                :allowClear="true"
                option-filter-prop="children"
                placeholder="请选择当前子表所在父表的字段"
                change-on-select
                @change="getParentField"
                v-decorator="['parentField', {
                  initialValue: data.parentField
                }]"
              />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="开窗填充关系" :required="true" :wrapperCol="wrapperCol">
          <a @click="handleAdd">
            + 添加映射字段
          </a>
        </a-form-item>
        <a-form-item :validate-status="validate" :help="help" :wrapperCol="wrapperCol">
          <a-row v-for="list in fieldList" :key="list.id">
            <a-col :span="9">
              <a-form-item>
                <a-select
                  placeholder="目的数据表的字段"
                  show-search
                  option-filter-prop="children"
                  allow-clear
                  :value="list.winField"
                  @change="(val) => { handleWinField(val, list) }" >
                  <a-select-option v-for="item in list.linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <div style="width: 100%; text-align: center;">填充到</div>
            </a-col>
            <a-col :span="9">
              <a-select
                placeholder="当前数据表的字段"
                show-search
                allow-clear
                option-filter-prop="children"
                :value="list.currentField"
                @change="(val) => { handleCurrentField(val, list) }" >
                <a-select-option v-for="item in list.currentFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="3" style="margin: 3px 0 0 3px">
              <div style="width: 100%; text-align: center; cursor: pointer;">
                <a-icon
                  :style="{ fontSize: '24px', color: '#52c41a'}"
                  type="plus-square"
                  theme="filled"
                  @click="handleAdd"/>
                <a-icon
                  :style="{ fontSize: '24px', color: fieldList.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-left': '5px' }"
                  type="minus-square"
                  theme="filled"
                  @click="handleSub(list)"
                >
                </a-icon></div>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
    <tplview-data-form ref="tplviewDataForm" @ok="getDataForm" />
  </a-drawer>
</template>
<script>
export default {
  components: {
    TplviewDataForm: () => import('../TplviewDataForm.vue')
  },
  props: {
    tableField: {
      type: Array,
      default: () => {}
    }
  },
  watch: {
    winTable: {
      handler (newVal) {
        if (newVal) {
          const tableField = newVal[newVal.length - 1]
          this.tableId = tableField
          this.axios({
            url: '/admin/tplview/fieldidTplidArr',
            params: { tableid: tableField }
          }).then(res => {
            if (res.code === 0) {
              this.tpl = res.result.tpl
              this.tpl.forEach(item => {
                if (item.uid === this.data.dateView) {
                  this.record.id = item.id
                  this.record.name = item.name
                }
              })
            } else {
              this.$message.error(res.message)
            }
          })
        }
      }
    }
  },
  data () {
    return {
      config: {},
      wrapperCol: { span: 24 },
      tableId: '',
      data: {},
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      dataFormFlag: false,
      fieldStatus: '',
      fieldHelp: '',
      winField: '1',
      parentField: '1',
      table_field: [],
      linkFields: [],
      linkFieldsObj: {},
      currentFields: [],
      currentFieldsObj: {},
      tpl: [],
      fieldList: [{
        id: (new Date()).valueOf(),
        winField: undefined,
        currentField: undefined
      }],
      validate: 'success', // 开窗选择必填条件手动验证
      help: '',
      winTable: [],
      options: [],
      record: {}
    }
  },
  created () {
    this.axios({
      url: '/admin/Tplview/getTablesFields'
    }).then(res => {
      this.options = res.result
    })
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.loading = true
      // 初始化值
      this.data = config.record.bartemplate ? JSON.parse(config.record.bartemplate) : {}
      this.dataFormFlag = !!this.data.dateView
      this.winTable = this.data.winTable || []
      this.fieldList = this.data.fieldList ? this.data.fieldList : [{
        id: (new Date()).valueOf(),
        winField: undefined,
        currentField: undefined
      }]
      this.recordIndex = config.index
      this.axios({
        url: this.config.url,
        data: { tableid: config.tableid ? config.tableid : 0, parent_number: [], fieldid: 0 }
      }).then((res) => {
        this.loading = false
        this.table_field = res.result.table_field
      })
      if (this.winTable.length > 0) {
        this.axios({
          url: '/admin/field/init',
          params: { pageNo: 1, pageSize: 1000, sortField: 'id', sortOrder: 'descend', tableid: this.winTable[this.winTable.length - 1] }
        }).then(res => {
          this.linkFields = res.result.data
          res.result.data.forEach(item => {
            this.linkFieldsObj[item.alias] = item
          })
          this.fieldList = this.fieldList.map(item => {
            item.linkFields = item.winField ? this.linkFields.filter(item1 => item1.formtype === this.linkFieldsObj[item.winField].formtype) : this.linkFields
            return item
          })
        })
      }
      this.axios({
        url: '/admin/field/init',
        params: { pageNo: 1, pageSize: 1000, sortField: 'id', sortOrder: 'descend', tableid: config.tableid }
      }).then(res => {
        if (res.code === 0) {
          this.currentFields = res.result.data
          res.result.data.forEach(item => {
            this.currentFieldsObj[item.alias] = item
          })
          this.fieldList = this.fieldList.map(item => {
            item.currentFields = item.currentField ? this.currentFields.filter(item1 => item1.formtype === this.currentFieldsObj[item.currentField].formtype) : this.currentFields
            return item
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 子表单-> 选择数据表
    handleTable (val) {
      this.winTable = val
      // 清空开窗目的窗口的字段选择
      const { setFieldsValue } = this.form
      setFieldsValue({ winField: undefined })
      setFieldsValue({ dateView: undefined })
      this.fieldList.forEach(item => {
        item.winField = undefined
        item.parentField = undefined
      })
      this.dataFormFlag = false
      this.fieldList = JSON.parse(JSON.stringify(this.fieldList))
      this.axios({
        url: '/admin/field/init',
        params: { pageNo: 1, pageSize: 1000, sortField: 'id', sortOrder: 'descend', tableid: val[val.length - 1] }
      }).then(res => {
        this.linkFields = res.result.data
        res.result.data.forEach(item => {
          this.linkFieldsObj[item.alias] = item
        })
        this.fieldList = this.fieldList.map(item => {
          item.linkFields = item.winField ? this.linkFields.filter(item1 => item1.formtype === this.linkFieldsObj[item.winField].formtype) : this.linkFields
          return item
        })
      })
    },
    // 添加编辑开窗目的窗口
    handleDataForm (action) {
      if (action === 'add') {
        this.$refs.tplviewDataForm.show({
          action: 'add',
          title: '添加: 普通视图视图',
          tableid: this.tableId,
          submitUrl: '/admin/tplview/addData',
          url: '/admin/tplview/editData',
          variable: 'table_form_list'
        })
      } else {
        this.$refs.tplviewDataForm.show({
          action: 'edit',
          title: '编辑：' + this.record.name,
          url: '/admin/tplview/editData',
          tableid: this.tableId,
          record: this.record,
          variable: 'table_form_list'
        })
      }
    },
    // 获取设置数据窗口
    getDataForm (value, id) {
      const uid = value.uid ? value.uid : id
      this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: { tableid: this.tableId }
      }).then(res => {
        if (res.code === 0) {
          this.linkFields = res.result.field
          this.tpl = res.result.tpl
          if (uid) {
            const { setFieldsValue } = this.form
            setFieldsValue({ 'dateView': uid })
            this.dataFormFlag = true
            this.tpl.forEach(item => {
              if (item.uid === uid) {
                this.record.id = item.id
                this.record.name = item.name
              }
            })
          }
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 关联字段
    getWinField (val) {
      this.winField = val
    },
    // 映射条件
    handleWinField (val, item) {
      item.winField = val
      this.fieldList.forEach(listItem => {
        if (listItem.id === item.id) {
          listItem = item
        }
      })
      if (val) {
        const formtype = this.linkFieldsObj[val].formtype
        item.currentFields = this.currentFields.filter(item => item.formtype === formtype)
      } else {
        item.currentFields = this.currentFields
      }
      this.fieldList = JSON.parse(JSON.stringify(this.fieldList))
    },
    handleCurrentField (val, item) {
      item.currentField = val
      this.fieldList.forEach(listItem => {
        if (listItem.id === item.id) {
          listItem = item
        }
      })
      if (val) {
        const formtype = this.currentFieldsObj[val].formtype
        item.linkFields = this.linkFields.filter(item => item.formtype === formtype)
      } else {
        item.linkFields = this.linkFields
      }
      this.fieldList = JSON.parse(JSON.stringify(this.fieldList))
    },
    getParentField (val) {
      this.parentField = val
    },
    // 获取数据窗口id
    handleChangeDataForm (val) {
      this.dataFormFlag = !!val
      this.tpl.forEach(item => {
        if (item.uid === val) {
          this.record.id = item.id
          this.record.name = item.name
        }
      })
    },
    // 增加开窗填充关系
    handleAdd () {
      this.fieldList.push({
        id: (new Date()).valueOf(),
        winField: undefined,
        currentField: undefined,
        linkFields: this.linkFields,
        currentFields: this.currentFields
      })
    },
    // 减少开窗填充关系列表
    handleSub (list) {
      const fieldList = JSON.parse(JSON.stringify(this.fieldList))
      this.fieldList = fieldList.filter(item => item.id !== list.id)
    },
    // 加载级联菜单数据
    loadDataCascader (parameter) {
      const { selectedOptions } = parameter
      const targetOption = selectedOptions[selectedOptions.length - 1]
      const index = parameter.index
      const that = this
      targetOption.loading = true
      this.axios({
        url: '/admin/dict/getCascaderData',
        params: { parentNumber: targetOption.value, src: parameter.src }
      }).then(res => {
        targetOption.loading = false
        targetOption.children = res.result
        that.template[index].field.option = [...that.template[index].field.option]
      })
    },
    handleSubmit () {
      const { validateFields } = this.form
      validateFields((errors, values) => {
        if (this.fieldList.length === 1 && (!this.fieldList[0].winField || !this.fieldList[0].currentField)) {
          this.validate = 'error'
          this.help = '开窗填充关系不能为空'
        }
        if (!errors) {
          values.fieldList = this.fieldList
          this.$emit('ok', values, this.recordIndex)
          this.visible = false
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.box {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
