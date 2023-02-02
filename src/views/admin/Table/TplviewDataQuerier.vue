<template>
  <div>
    <a-space>
      <a-button @click="handleVisiable(2)">选择字段</a-button>
      <a-button @click="handleVisiable(1)">添加控件</a-button>
      <a-popconfirm
        title="请确实是否清除所有内容？"
        ok-text="确定"
        cancel-text="取消"
        @confirm="handleVisiable(3)"
      >
        <a-button type="danger">清空内容</a-button>
      </a-popconfirm>
      <span>默认展开更多搜索 <a-switch v-model="advanced_search"/></span>
    </a-space>
    <a-divider style="margin: 8px 0"/>
    <draggable
      class="list-group"
      v-model="data"
      animation="200"
      @start="drag = true"
      handle=".handle"
      @end="drag = false"
      v-if="this.data.length !== 0">
      <div :class="['item', 'ant-col-'+element.column]" v-for="element in data" :key="element.id" :style="[element.fieldrule === 'hidden' ?{ backgroundColor: '#f5f5f5' }:{}]">
        <div style="display: flex; align-items: center; margin-bottom: 5px;" >
          <a-icon type="drag" class="handle"/>
          <span style="flex: 1;" v-if="element.type === 'place'"></span>
          <span style="flex: 1;" v-else>{{ element.change_title ? element.change_title : (element.componentName || element.name) }}:</span>
          <a-icon class="action" type="setting" @click="setting(element)" />
          <a-popconfirm
            title="请确认是否删除?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDel(element)"
          >
            <a-icon class="action" type="delete" />
          </a-popconfirm>
        </div>
        <a-input v-if="(element.formtype === 'text' && element.type === 'field') || element.value === '__assist_time__' || element.value === '__assist_user__'" :disabled="element.fieldrule === 'readonly'"/>
        <a-input v-else-if="element.type === 'component'" placeholder="组件"/>
        <a-input v-else-if="element.type === 'place'" placeholder="占位符"/>
        <a-input v-else-if="element.formtype === 'serialnumber'" placeholder="流水号"/>
        <a-divider v-else-if="element.type === 'divider'">分隔符</a-divider>
        <a-textarea v-else-if="element.formtype === 'textarea'" :rows="2" :disabled="element.fieldrule === 'readonly'"/>
        <a-date-picker v-else-if="element.formtype === 'datetime'" format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" :disabled="element.fieldrule === 'readonly'"/>
        <a-select v-else-if="element.formtype === 'combobox' || element.formtype === 'organization'" style="width: 100%;" :disabled="element.fieldrule === 'readonly'">
          <a-select-option value="1">选项1</a-select-option>
          <a-select-option value="2">选项2</a-select-option>
        </a-select>
        <a-radio-group v-else-if="element.formtype === 'radio'" :disabled="element.fieldrule === 'readonly'">
          <a-radio value="1">选项1</a-radio>
          <a-radio value="2">选项2</a-radio>
        </a-radio-group>
        <a-checkbox-group v-else-if="element.formtype ==='checkbox'" :disabled="element.fieldrule === 'readonly'">
          <a-checkbox value="1">选项1</a-checkbox>
          <a-checkbox value="2">选项2</a-checkbox>
        </a-checkbox-group>
        <a-tree-select
          v-else-if="element.formtype === 'treeselect'"
          style="width: 100%"
          placeholder="请选择"
          allow-clear
        >
          <a-tree-select-node key="0-1" value="parent 1" title="根节点1">
            <a-tree-select-node key="random" value="leaf1" title="叶子1" />
            <a-tree-select-node key="random1" value="leaf2" title="叶子2" />
          </a-tree-select-node>
          <a-tree-select-node key="0-2" value="parent 2" title="根节点2">
            <a-tree-select-node key="random2" value="leaf3" title="叶子3" />
            <a-tree-select-node key="random3" value="leaf4" title="叶子4" />
          </a-tree-select-node>
        </a-tree-select>
        <a-switch v-else-if="element.formtype === 'switch'" :checked="true" :disabled="element.fieldrule === 'readonly'"></a-switch>
        <quill-editor v-else-if="element.formtype === 'editor'" style="width: 100%; height: 200px;"/>
        <a-input-number v-else-if="element.formtype === 'number'" style="width: 100%;" :disabled="element.fieldrule === 'readonly'"/>
        <a-upload
          v-else-if="element.formtype === 'image'"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          list-type="picture-card"
          :disabled="element.fieldrule === 'readonly'"
        >
          <a-icon type="plus" />
          <div class="ant-upload-text">Upload</div>
        </a-upload>
        <a-upload
          v-else-if="element.formtype === 'file'"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          :disabled="element.fieldrule === 'readonly'"
        >
          <a-button> <a-icon type="upload" /> Upload </a-button>
        </a-upload>
        <a-cascader
          v-else-if="element.formtype === 'cascader' || element.formtype === 'tag'"
          :disabled="element.fieldrule === 'readonly'"
          style="width: 100%"
          :options="[ {
            value: 'zhejiang',
            label: 'Zhejiang',
            children: [ {
              value: 'hangzhou',
              label: 'Hangzhou',
              children: [ {
                value: 'xihu',
                label: 'West Lake',
              }, ],
            }, ],
          }, {
            value: 'jiangsu',
            label: 'Jiangsu',
            children: [ {
              value: 'nanjing',
              label: 'Nanjing',
              children: [ {
                value: 'zhonghuamen',
                label: 'Zhong Hua Men',
              }, ],
            }, ],
          }, ]"
          placeholder="Please select"
        />
        <!-- 关联数据 -->
        <a-input-search v-else-if="element.formtype === 'associated'" />
        <!-- 地址选择 -->
        <address-select v-else-if="element.formtype === 'address'" style="margin-top: -1px" :fieldrule="element.fieldrule"/>
        <span v-if="!element.formtype"></span>
      </div>
    </draggable>
    <a-empty v-else></a-empty>
    <column-check ref="columnCheck" @ok="saveField" :dataList="data" :fieldCategory="fieldCategory"></column-check>
    <querier-control ref="querierControl" :fieldsarr="controlFieldsarr" :template="data" @func="addOther" />
  </div>
</template>
<script>
export default {
  components: {
    draggable: () => import('vuedraggable'),
    QuillEditor: () => import('@/components/Editor/QuillEditor'),
    QuerierControl: () => import('./QuerierControl'),
    AddressSelect: () => import('../Field/AddressSelect'),
    ColumnCheck: () => import('./ColumnCheck')
  },
  props: {
    fieldsarr: {
      type: Array,
      default () {
        return {}
      },
      required: false
    },
    fieldslist: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    mytemplate: {
      type: Array,
      default () {
        return {}
      }
    },
    fieldCategory: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    expand: {
      type: String,
      default () {
        return '0'
      }
    }
  },
  computed: {
    plainOptions: function () {
      return this.fieldsarr.map((item) => (item.name))
    }
  },
  watch: {
    mytemplate: function (newValue) {
      this.data = newValue
      this.$emit('func', newValue)
      var arr = []
      this.data.map((item) => {
        if (item.name) {
          const obj = {}
          obj.name = item.name
          obj.alias = item.value
          arr.push(obj)
        }
      })
      this.checkedList = arr
    },
    data (newValue) {
      var choiceList = []
      newValue.map(item => {
        if (item.type === 'field') {
          choiceList.push(item.value)
        }
      })
      var arr = []
      this.fieldsarr.map(item => {
        if (choiceList.indexOf(item.alias) === -1) {
          arr.push(item)
        }
      })
      this.controlFieldsarr = arr
    }
  },
  created () {
    this.data = JSON.parse(JSON.stringify(this.mytemplate))
    this.data.forEach(item => {
      item.display = 'v'
    })
    this.checkedList = this.fieldsarr
    this.checkAll = this.checkedList.every(item => item.checked)
    this.indeterminate = this.checkedList.length > 0 ? this.checkedList.some(item => item.checked) : false
  },
  data () {
    return {
      visible: false,
      loading: false,
      advanced_search: this.expand === '1',
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      form: this.$form.createForm(this),
      item: {},
      choiceFieldrule: '',
      data: [ {
        id: '',
        type: 'field',
        name: '',
        formtype: 'textarea',
        value: '',
        column: 12,
        placeholder: false,
        fieldrule: 'allow',
        attribute: '',
        componentName: '',
        validitytype: null
      } ],
      controlFieldsarr: [],
      placeholder: false,
      drag: false,
      addField: false,
      columns: [ {
        title: '字段名称',
        dataIndex: 'name'
      }, {
        title: 'UI组件',
        dataIndex: 'formtype'
      } ],
      checkAll: false,
      indeterminate: true,
      checkedList: [],
      value: [],
      action: ''
    }
  },
  methods: {
    // 打开设置组件
    setting (item) {
      this.item = item
      this.$refs.querierControl.show({
        title: '设置: ' + item.name,
        action: 'edit',
        item: item
      })
      this.action = 'edit'
    },
    // 删除
    handleDel (item) {
      const index = this.data.findIndex((val) => {
        return val === item
      })
      this.checkedList.forEach(checkedItem => {
        if (checkedItem.alias === item.value) {
          checkedItem.checked = false
        }
      })
      this.data.splice(index, 1)
      this.checkAll = this.checkedList.every(item => item.checked)
      this.indeterminate = !this.checkedList.every(item => item.checked)
    },
    listSearch (e) {
      this.checkedList.forEach(item => {
        if (item.name.includes(e)) {
          item.show = true
        } else {
          item.show = false
        }
      })
    },
    // 控件按钮
    handleVisiable (e) {
      switch (parseInt(e)) {
        case 1:
          this.$refs.querierControl.show({
            title: '添加控件',
            action: 'add',
            item: {
              id: '',
              type: 'field',
              name: '',
              formtype: '',
              value: '',
              column: '',
              placeholder: false,
              fieldrule: 'allow',
              attribute: '',
              componentName: '',
              validitytype: '',
              validity: undefined
            }
          })
          this.action = 'add'
          break
        case 2:
          this.$refs.columnCheck.show({
            action: 'edit',
            title: '选择字段',
            data: this.fieldslist
          })
          break
        case 3:
          this.data = []
          this.checkedList.forEach(item => {
            item.checked = false
          })
          this.checkAll = false
          this.indeterminate = false
          break
        default:
          break
      }
    },
    // 保存字段
    saveField (e) { // choiceField
      this.addField = false
      var arr = []
      e.forEach(item => {
        this.fieldsarr.forEach(fieldItem => {
          if (fieldItem.alias === item.alias) {
            arr.push({
              type: 'field',
              name: fieldItem.name,
              fieldid: fieldItem.fieldid,
              value: fieldItem.alias,
              formtype: fieldItem.formtype,
              column: fieldItem.formtype === 'editor' ? 24 : 6,
              placeholder: '0',
              fieldrule: 'allow',
              attribute: '',
              componentName: '',
              validitytype: null
            })
          }
        })
      })
      var choiceAlias = arr.map(item => {
        return item.value
      })
      var existAlias = this.data.map(item => {
        if (item.type === 'field') {
          return item.value
        }
      })
      var common = []
      var delAlias = []
      var addAilas = []
      choiceAlias.map((item) => {
        existAlias.map(item1 => {
          if (item === item1) common.push(item)
        })
      })
      choiceAlias.map(item => {
        if (common.indexOf(item) === -1) {
          addAilas.push(item)
        }
      })
      existAlias.map(item => {
        if (common.indexOf(item) === -1) {
          delAlias.push(item)
        }
      })
      delAlias.map(item => {
        this.data.map((item1, index) => {
          if (item1.value === item) {
            this.data.splice(index, 1)
          }
        })
      })
      addAilas.map(item => {
        arr.map(item1 => {
          if (item1.value === item) {
            this.data.push(item1)
          }
        })
      })
    },
    // 选择字段
    onChange (e, checkItem) {
      checkItem.checked = e.target.checked
      if (this.checkedList.every(item => item.checked)) {
        this.indeterminate = false
        this.checkAll = true
      } else {
        this.indeterminate = this.checkedList.some(item => item.checked)
        this.checkAll = false
      }
    },
    // 选择所有字段
    onCheckAllChange (e) {
      this.checkAll = e.target.checked
      this.indeterminate = false
      this.checkedList.forEach(item => {
        item.checked = e.target.checked
      })
    },
    // 设置添加
    addOther (e) {
      if (this.action === 'edit') {
        const index = this.data.findIndex((val) => {
          return val === this.item
        })
        this.data.splice(index, 1, e)
      } else {
        this.data.push(e)
      }
      this.checkedList.forEach(checkedItem => {
        if (e.value === checkedItem.alias) {
          checkedItem.checked = true
        }
      })
    },
    addClose () {
      this.addField = false
    }
  }
}
</script>
<style lang="less" scoped>
.list-group{
  display: flex;
  flex-wrap: wrap;
  border-radius: 5px;
  padding: 10px;
  background: white;
}
.list-group .item{
  padding: 5px;
  margin-bottom: 20px;
  border: 1px dashed white;
  border-radius: 3px;
}
.list-group .item:hover{
  background: #F9FAFA;
  border: 1px dashed #E5E5E5;
}
.list-group .item[draggable=true] {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group .item .handle{
  padding-right: 8px;
  cursor: move;
}
.list-group .item .action{
  margin-right: 8px;
  cursor: pointer;
  display: none;
}
.list-group .item:hover .action{
  display: unset;
}
</style>
