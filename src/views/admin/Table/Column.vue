<template>
  <div>
    <a-spin :spinning="loading">
      <div style="margin-bottom: 10px; display: flex">
        <a-space>
          <a-button @click="checkShow">选择字段</a-button>
          <a-button @click="batchShow">批量设置</a-button>
          <a-dropdown>
            <a-menu slot="overlay" @click="handlePosition">
              <a-menu-item key="left">
                居左
              </a-menu-item>
              <a-menu-item key="center">
                居中
              </a-menu-item>
              <a-menu-item key="right">
                居右
              </a-menu-item>
            </a-menu>
            <a-button>对齐<a-icon type="down" /></a-button>
          </a-dropdown>
          <a-button icon="sort-ascending" @click="handleSort">排序</a-button>
        </a-space>
        <a-input placeholder="请输入字段显示名称搜索" @change="onSearch" v-model="searchValue" style="margin-left: 8px"/>
      </div>
      <a-form :form="formTable">
        <a-table
          ref="table"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource ? dataSource.filter(item => !item.unshow) : []"
          size="small"
          :pagination="false"
          :scroll="scroll"
          v-if="showFlag"
        >
          <template slot="sortid" slot-scope="text, record">
            <a-input-number step="10" :min="0" size="small" v-model="record.sortid" style="width: 50px;" />
          </template>
          <template slot="custom_title" slot-scope="text, record, index">
            <a-row>
              <a-col :span="20">
                <a-form-item class="customTitle">
                  <a-input
                    size="small"
                    @change="(e)=>getCustomTitle(e, index)"
                    v-decorator="[record.alias, { initialValue: record.custom_title || '', rules: [{ validator: checkName }] }]"
                    style="width: 120px"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </template>
          <template slot="width" slot-scope="text, record">
            <a-input-number step="10" :min="0" size="small" v-model="record.width" style="width: 70px;" />
          </template>
          <template slot="sorter" slot-scope="text, record">
            <a-checkbox :disabled="['textarea', 'image', 'file', 'editor'].includes(record.formtype)" :checked="record.sorter === '1' ? true : false" @change="(e) => {record.sorter = e.target.checked ? '1' : '0'} "></a-checkbox>
          </template>
          <template slot="align" slot-scope="text, record" v-if="alignsReset">
            <a-radio-group :value="record.align" size="small" @change="(e) => { record.align = e.target.value }">
              <a-radio-button value="left">左</a-radio-button>
              <a-radio-button value="center">中</a-radio-button>
              <a-radio-button value="right">右</a-radio-button>
            </a-radio-group>
          </template>
          <template slot="display" slot-scope="text, record" v-if="displayReset">
            <a-checkbox :checked="record.display === 'h' ? true : false" @change="(e) => { record.display = e.target.checked ? 'h' : 'v'} "></a-checkbox>
          </template>
          <template slot="rule" slot-scope="text, record, index">
            <a-radio-group :value="record.rule" size="small" @change="(e) => { choiceRule(e, record, index) }">
              <a-radio-button value="readonly">只读</a-radio-button>
              <a-radio-button value="allow">允许</a-radio-button>
              <a-radio-button value="required">必填</a-radio-button>
            </a-radio-group>
          </template>
          <template slot="style" slot-scope="text, record, index">
            <a @click="exteriorEdit(record, index)">
              <a-badge :status="record.style && (record.style.fontsize != '13px' || record.style.color !='' || record.style.bgcolor !='') ? 'success' : 'default'" />
              设置
            </a>
          </template>
          <template slot="attribute" slot-scope="text, record, index">
            <a @click="handleEdit(record, index)">
              <a-badge :status="record.attribute !='' ? 'success' : 'default'"/>
              设置
            </a>
          </template>
          <template slot="action" slot-scope="text, record, index">
            <a-popconfirm
              title="您确定要删除该记录?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(index)"
            >
              <a>删除</a>
            </a-popconfirm>
          </template>
        </a-table>
      </a-form>
    </a-spin>
    <a-modal
      title="外观设置"
      :visible="visible"
      @ok="handleOk"
      @cancel="visible=!visible"
      :destroyOnClose="true"
    >
      <a-form :form="form" @submit="handleOk" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item >
          <span slot="label">字体大小
            <a-tooltip placement="top">
              <template slot="title">
                <span>字体大小默认为13px</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-select v-decorator="['fontsize', { initialValue: exteriordata.style && exteriordata.style.fontsize ? exteriordata.style.fontsize : '13px' }]">
            <a-select-option v-for="(value, index) in fontsize" :key="index" :value="value">
              {{ value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="字体颜色" >
          <a-row type="flex">
            <a-col flex="auto"><a-input v-decorator="['color',{ initialValue: exteriordata.style && exteriordata.style.color ? exteriordata.style.color :''}]" /></a-col>
            <a-col>
              <a-dropdown>
                <a-button>选择</a-button>
                <a-menu slot="overlay">
                  <a-sub-menu v-for="(value, index) in colorTitle" :key="index" :title="value.name" :style="{'background-color': value.color}">
                    <a-menu-item v-for="(values, indexs) in colorAll[index]" :key="indexs" :style="{'background-color': values}" @click="sendColor('color', values)">{{ values }}</a-menu-item>
                  </a-sub-menu>
                </a-menu>
              </a-dropdown>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="背景颜色" >
          <a-row type="flex">
            <a-col flex="auto"><a-input v-decorator="['bgcolor', { initialValue: exteriordata.style && exteriordata.style.bgcolor ? exteriordata.style.bgcolor :'' }]" /></a-col>
            <a-col>
              <a-dropdown>
                <a-button>选择</a-button>
                <a-menu slot="overlay">
                  <a-sub-menu v-for="(value, index) in colorTitle" :key="index" :title="value.name" :style="{'background-color': value.color}">
                    <a-menu-item v-for="(values, indexs) in colorAll[index]" :key="indexs" :style="{'background-color': values}" @click="sendColor('bgcolor', values)">{{ values }}</a-menu-item>
                  </a-sub-menu>
                </a-menu>
              </a-dropdown>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 设置附加属性 -->
    <CodeEditor ref="codeEditor" :columnData="dataSource" @func="getCode"/>
    <ColumnSort ref="columnSort" @ok="getList" />
    <column-check ref="columnCheck" @ok="getList" :dataList="dataSource" :fieldCategory="fieldCategory"/>
    <column-batch ref="columnBatch" @ok="getList" />
  </div>
</template>
<script>
import { magenta, red, volcano, orange, yellow, gold, cyan, lime, green, blue, geekblue, purple } from '@ant-design/colors'
export default {
  components: {
    CodeEditor: () => import('@/views/admin/CodeEditor'),
    ColumnSort: () => import('./ColumnSort'),
    ColumnCheck: () => import('./ColumnCheck'),
    ColumnBatch: () => import('./ColumnBatch')
  },
  props: {
    fieldsarr: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    fieldslist: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    fieldCategory: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    setting: {
      type: Object,
      default () {
        return {}
      }
    },
    action: {
      type: String,
      default () {
        return null
      },
      required: true
    },
    variable: {
      type: String,
      default: ''
    },
    tableType: {
      type: String,
      default: '',
      required: false
    }
  },
  watch: {
    fieldsarr (newValue) {
      this.showFlag = false
      this.$nextTick(() => {
        this.showFlag = true
      })
      if (this.action === 'edit' || this.action === 'copy') {
        this.dataSource = this.setting.fieldsarr ? this.setting.fieldsarr.filter(item => item.display !== 'd') : []
        this.dataSource.forEach(item => {
          item.unshow = ''
          if (['textarea', 'image', 'file', 'editor'].includes(item.formtype)) {
            item.sorter = '0'
          } else {
            item.sorter = item.sorter ? item.sorter : '1'
          }
        })
      } else {
        this.dataSource = []
      }
      this.data = newValue
      this.data = newValue.map(item => {
        item.rule = item.rule || 'readonly'
        item.sorter = ''
        return item
      })
    }
  },
  data () {
    return {
      showFlag: true,
      advanced: false,
      checked: false,
      visible: false,
      fontsize: [],
      exteriordata: {},
      loading: false,
      exteriorkey: '',
      form: this.$form.createForm(this),
      formTable: this.$form.createForm(this),
      // 搜索参数
      queryParam: {},
      dataSource: [],
      data: {},
      scroll: {},
      recordIndex: 0, //  添加附加属性的index
      // 表头
      columns: [ {
        title: '字段系统名',
        dataIndex: 'alias',
        width: this.tableType !== 'ui' ? 160 : 100
      }, {
        title: '字段显示名',
        dataIndex: 'name',
        width: this.tableType !== 'ui' ? 160 : 100
      }, {
        title: '列显示名',
        dataIndex: 'custom_title',
        width: this.tableType !== 'ui' ? 160 : 130,
        scopedSlots: { customRender: 'custom_title' }
      }, {
        title: '列宽',
        dataIndex: 'width',
        width: this.tableType !== 'ui' ? 120 : 80,
        scopedSlots: { customRender: 'width' }
      }, {
        title: '排序',
        dataIndex: 'sorter',
        width: this.tableType !== 'ui' ? 60 : 40,
        scopedSlots: { customRender: 'sorter' }
      }, {
        title: '对齐',
        dataIndex: 'align',
        width: this.tableType !== 'ui' ? 140 : 120,
        scopedSlots: { customRender: 'align' }
      }, {
        title: '隐藏',
        dataIndex: 'display',
        width: this.tableType !== 'ui' ? 60 : 40,
        scopedSlots: { customRender: 'display' }
      }, {
        title: '合计',
        dataIndex: 'total',
        width: this.tableType !== 'ui' ? 80 : 40,
        scopedSlots: { customRender: 'total' }
      }, {
        title: '外观设置',
        dataIndex: 'style',
        scopedSlots: { customRender: 'style' }
      }, {
        title: '附加属性',
        dataIndex: 'attribute',
        scopedSlots: { customRender: 'attribute' }
      }, {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      }],
      test: '测试',
      alignsReset: true,
      aligns: [
        { value: 'left', text: '居左' },
        { value: 'center', text: '居中' },
        { value: 'right', text: '居右' }
      ],
      displayReset: true,
      displays: [
        { value: 'v', text: '显示' },
        { value: 'h', text: '隐藏' },
        { value: 'd', text: '禁用' }
      ],
      searchValue: '',
      colorAll: [],
      colorTitle: []
    }
  },
  created () {
    if (this.action === 'edit' || this.action === 'copy') {
      this.dataSource = this.setting.fieldsarr ? this.setting.fieldsarr : []
      this.dataSource.forEach(item => {
        item.unshow = ''
        if (['textarea', 'image', 'file', 'editor'].includes(item.formtype)) {
          item.sorter = '0'
        } else {
          item.sorter = item.sorter ? item.sorter : '1'
        }
      })
    }
    for (let i = 8; i <= 24; i++) {
      this.fontsize.push(i + 'px')
    }
    this.scroll.y = document.body.clientHeight - 320
    this.data = this.fieldsarr
    if (this.action === 'add') {
      for (const i in this.data) {
        if (this.data[i].formtype === 'number') {
          this.data[i].align = 'right'
        } else if (this.data[i].formtype === 'datetime') {
          this.data[i].align = 'center'
        }
        this.data[i].display = 'd'
        this.data[i].sorter = ''
      }
    }
    if (this.variable === 'table_subform_list') {
      this.columns.splice(5, 0, {
        title: '输入规则',
        width: 140,
        dataIndex: 'rule',
        scopedSlots: { customRender: 'rule' }
      })
    }
    this.colorAll = []
    this.colorTitle = []
    this.colorAll.push(magenta, red, volcano, orange, yellow, gold, cyan, lime, green, blue, geekblue, purple)
    this.colorAll.push(['#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#d9d9d9', '#bfbfbf', '#8c8c8c', '#595959', '#434343', '#262626', '#1f1f1f', '#141414', '#000000'])
    this.colorTitle.push(
      { name: 'magenta', color: '#eb2f96' },
      { name: 'red', color: '#f5222d' },
      { name: 'volcano', color: '#fa541c' },
      { name: 'orange', color: '#fa8c16' },
      { name: 'yellow', color: '#fadb14' },
      { name: 'gold', color: '#faad14' },
      { name: 'cyan', color: '#13c2c2' },
      { name: 'lime', color: '#a0d911' },
      { name: 'green', color: '#52c41a' },
      { name: 'blue', color: '#1890ff' },
      { name: 'geekblue', color: '#2f54eb' },
      { name: 'purple', color: '#722ed1' },
      { name: 'gray', color: '#bfbfbf' })
  },
  methods: {
    handlePosition (e) {
      const value = e.key
      const len = this.dataSource.length
      const arr = this.dataSource
      for (let i = 0; i < len; i++) {
        arr[i].align = value
      }
      this.dataSource = arr
      this.alignsReset = false
      this.$nextTick(() => {
        this.alignsReset = true
      })
    },
    // 显示名称验证是否重复
    checkName (rule, value, callback) {
      const data = this.dataSource.filter(item => item.alias !== rule.field)
      const string = '列显示名重复'
      if (data.some(item => item.custom_title && item.custom_title === value) || data.some(item => !item.custom_title && item.name && item.name === value)) {
        callback(string)
      } else {
        callback()
      }
    },
    getCustomTitle (e, index) {
      this.dataSource[index].custom_title = e.target.value
    },
    checkShow () {
      this.$refs.columnCheck.show({
        action: this.action,
        title: '选择字段',
        data: this.fieldslist
      })
    },
    sendColor (type, color) {
      if (type === 'color') {
        this.form.setFieldsValue({ color: color })
      } else {
        this.form.setFieldsValue({ bgcolor: color })
      }
    },
    batchShow () {
      this.$refs.columnBatch.show({
        action: this.action,
        title: '批量设置',
        data: this.dataSource
      })
    },
    exteriorEdit (record, index) {
      this.exteriordata = record
      this.visible = true
      this.exteriorkey = index
    },
    handleOk (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.dataSource[this.exteriorkey]['style'] = values
        }
      })
      this.visible = false
    },
    onSearch () {
      const value = this.searchValue
      this.dataSource.forEach(item => {
        if (value) {
          if (item.name.includes(value)) {
            item.unshow = ''
          } else {
            item.unshow = true
          }
        } else {
          this.dataSource.forEach(item => { item.unshow = '' })
        }
      })
    },
    // 排序
    handleSort () {
      this.$refs.columnSort.show({
        action: 'sort',
        title: '排序',
        data: this.dataSource
      })
    },
    // 获取重新排序列表
    getList (data) {
      data.forEach((item, index) => {
        item.sortid = String((index + 1) * 10)
        item.unshow = ''
        const key = this.dataSource.findIndex(dataItem => dataItem.alias === item.alias)
        if (key !== -1) {
          item.sorter = this.dataSource[key].sorter
        } else {
          item.sorter = '0'
        }
      })
      this.dataSource = data
    },
    onCellChange (key, dataIndex, value) {
      const dataSource = [...this.dataSource]
      const target = dataSource.find(item => item.id === key)
      if (target) {
        target[dataIndex] = value
        this.dataSource = dataSource
      }
    },
    handleEdit (record, index) {
      this.recordIndex = index
      this.$refs.codeEditor.show({
        value: record.attribute
      })
    },
    choiceRule (e, record, index) {
      record.rule = e.target.value
      this.dataSource.splice(index, 1, record)
    },
    // 获取附加属性
    getCode (value) {
      var index = this.recordIndex
      this.dataSource[index].attribute = value
    },
    // 删除
    handleDelete (index) {
      this.dataSource.splice(index, 1)
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
.customTitle >>> .ant-form-item-control{
  line-height: 24px;
}
</style>
