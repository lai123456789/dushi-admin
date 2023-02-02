<template>
  <div>
    <div class="table-operator">
      <a-button v-action:add icon="plus" @click="handleAdd">添加</a-button>
      <a-button icon="import" @click="darwerOpen">从模板中添加</a-button>
      <a-button icon="sort-ascending" @click="handleSort">排序</a-button>
    </div>
    <a-table
      ref="table"
      rowKey="id"
      :columns="columns"
      :dataSource="myBarMenus"
      size="small"
      :pagination="false"
      v-if="showFlag"
    >
      <span slot="bar_sys" slot-scope="text">
        <template v-if="text =='1'">系统默认</template>
        <template v-else>自定义</template>
      </span>
      <span slot="menu_type" slot-scope="text">
        {{ text === 'line' ? '行菜单' : '工具栏菜单' }}
      </span>
      <span slot="display" slot-scope="text, record">
        <a-switch :disabled="record.disabled == 1" :defaultChecked="text === '1' ? true : false" @change="value => { record.display = value ? '1' : '0' }"/>
      </span>
      <span slot="style" slot-scope="text">
        <template v-if="text =='primary'">Primary</template>
        <template v-else-if="text=='default'">Default</template>
        <template v-else-if="text=='dashed'">Dashed</template>
        <template v-else-if="text=='danger'">Danger</template>
        <template v-else-if="text=='link'">Link</template>
      </span>
      <span slot="barmenupriv" slot-scope="text, record, index">
        <a @click="handleFieldPriv(record, index)"><a-badge :status="text !='' ? 'success' : 'default'" />设置</a>
      </span>
      <span slot="attribute" slot-scope="text">
        <a-badge v-if="text !=''" status="success" text="√" />
        <a-badge v-else status="error" text="×" />
      </span>
      <div slot="action" slot-scope="text, record,index">
        <a @click="handleEdit(record, index)">编辑</a>
        <a-divider type="vertical" v-if="record.bar_alias === 'bar_import' || record.setting_type === 'import' || record.setting_type === 'export'" />
        <a @click="hadnleModel(record, index)" v-if="record.bar_alias === 'bar_import' || record.setting_type === 'import' || record.setting_type === 'export'">模板管理</a>
        <a-divider type="vertical" v-if="record.bar_alias === 'sys_subform' || record.setting_type === 'subform'"/>
        <a @click="hadnleWindow(record, index)" v-if="record.bar_alias === 'sys_subform' || record.setting_type === 'subform'">开窗选择</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record,index)">删除</a>
      </div>
    </a-table>
    <!-- 设置附加属性 -->
    <tool-form ref="toolForm" :myBarMenus="myBarMenus" @ok="handleOk" />
    <!-- 访问权限 -->
    <priv-visit-form ref="privVisitForm" :params="{formview: myBarMenus}" @func="getBarMenus"/>
    <!-- 排序 -->
    <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
    <!-- 导入模板管理 -->
    <tool-import
      :tabThis="tabThis"
      :tableidAll="tableidAll"
      :active="active"
      ref="toolImport"
      @func="getBartemplate"
      :key="importKey"></tool-import>
    <!-- 开窗选择 -->
    <tool-window ref="toolWindow" :key="winKey" @ok="getWinData" />
    <tool-button-choose ref="toolButtonChoose" @ok="getButtonData" />
  </div>
</template>
<script>
import { listButton, cardButton, workListButton, subformButton, workflowButton } from './DefaultButton'
export default {
  components: {
    ToolForm: () => import('./ToolForm'),
    PrivVisitForm: () => import('./PrivVisitForm'),
    ToolImport: () => import('./ToolImport'),
    ToolWindow: () => import('./ToolWindow'),
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    ToolButtonChoose: () => import('@/views/admin/Table/ToolButtonChoose')
  },
  computed: {
    listArray () {
      if (this.config.variable === 'table_flow_list') {
        return workListButton
      } else if (this.config.variable === 'table_card_list') {
        return cardButton
      } else if (this.config.variable === 'table_subform_list') {
        return subformButton
      } else if (this.config.variable === 'workflow_list') {
        return workflowButton
      } else {
        return listButton
      }
    }
  },
  props: {
    barmenu: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    tabThis: {
      type: Object,
      default () {
        return {}
      }
    },
    config: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    tableidAll: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    fieldsarr: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    fieldslist: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    active: {
      type: String,
      default () {
        return ''
      },
      required: false
    }
  },
  watch: {
    barmenu: {
      handler (newValue) {
        if (this.config.action === 'add' && !this.myBarMenus.length) {
          this.myBarMenus = JSON.parse(JSON.stringify(this.listArray)).filter(item => item.bar_alias !== 'sys_copy')
        } else {
          this.myBarMenus = newValue
        }
        this.showFlag = false
        this.$nextTick(() => {
          this.showFlag = true
        })
      },
      immediate: true
    }
  },
  data () {
    return {
      showFlag: true,
      advanced: false,
      importKey: 'importKey',
      winKey: 'winKey',
      // 搜索参数
      queryParam: {},
      columnsDrawer: [{
        title: '按钮名称',
        dataIndex: 'name'
      }, {
        title: '菜单类型',
        dataIndex: 'menu_type',
        scopedSlots: { customRender: 'menu_type' }
      }],
      // 表头
      columns: [{
        title: '#',
        dataIndex: 'listorder',
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '按钮名称',
        dataIndex: 'name'
      }, {
        title: '按钮类型',
        dataIndex: 'bar_sys',
        scopedSlots: { customRender: 'bar_sys' }
      }, {
        title: '菜单类型',
        dataIndex: 'menu_type',
        scopedSlots: { customRender: 'menu_type' }
      }, {
        title: '是否显示',
        dataIndex: 'display',
        scopedSlots: { customRender: 'display' }
      }, {
        title: '按钮样式',
        dataIndex: 'style',
        scopedSlots: { customRender: 'style' }
      }, {
        title: '授权',
        dataIndex: 'barmenupriv',
        scopedSlots: { customRender: 'barmenupriv' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 170,
        scopedSlots: { customRender: 'action' }
      }],
      myBarMenus: '',
      bartemplate: {}
    }
  },
  methods: {
    handleAdd () {
      this.$refs.toolForm.show({
        action: 'add',
        title: '添加工具条',
        record: {
          id: (new Date()).valueOf(),
          listorder: this.myBarMenus.length * 10 + 10,
          name: '',
          bar_sys: 0,
          attribute: ''
        }
      })
    },
    handleEdit (record, index) {
      this.$refs.toolForm.show({
        action: 'edit',
        title: '编辑: ' + record.name,
        record: record,
        index: index
      })
    },
    // 排序
    handleSort () {
      const data = JSON.parse(JSON.stringify(this.myBarMenus))
      data.map(item => {
        item.realName = item.name
        if (item.menu_type === 'bar') {
          item.name = item.name + ' (工具栏菜单)'
        } else {
          item.name = item.name + ' (行菜单)'
        }
        return item
      })
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: data
      })
    },
    getSort (data) {
      data.forEach(item => {
        item.name = item.realName
        delete item.realName
      })
      this.myBarMenus = data
    },
    darwerOpen () {
      this.$refs.toolButtonChoose.show({
        listArray: this.listArray,
        unCheckBar: this.listArray.filter(item => this.myBarMenus.findIndex(barItem => barItem.bar_alias === item.bar_alias) === -1)
      })
    },
    getButtonData (data) {
      this.myBarMenus = [...this.myBarMenus, ...data]
    },
    // 选择开窗
    hadnleWindow (record, index) {
      this.winKey = this.winKey === 'winKey' ? 'winKey_1' : 'winKey'
      this.$nextTick(() => {
        this.$refs.toolWindow.show({
          url: '/admin/field/add',
          tableid: this.config.tableid,
          record: record,
          index: index
        })
      })
    },
    // 获取开窗数据
    getWinData (value, index) {
      this.myBarMenus[index].bartemplate = JSON.stringify(value)
      this.$emit('func', this.myBarMenus)
    },
    handleDelete (record, index) {
      this.myBarMenus.splice(index, 1)
      this.$emit('func', this.myBarMenus)
    },
    handleFieldPriv (record, index) {
      this.$refs.privVisitForm.show({
        action: 'edit',
        title: '访问权限授权: ' + record.name,
        record: record,
        index: index,
        key: 'barmenupriv',
        selectType: 'radio',
        privArr: {
          visit: '可访问'
        },
        defaultpriv: 'visit'
      })
    },
    handleOk () {
      this.$emit('func', this.myBarMenus)
    },
    getBarMenus (e) {
      this.myBarMenus = e
      this.$emit('func', this.myBarMenus)
    },
    getBartemplate (data, index) {
      this.myBarMenus[index].bartemplate = JSON.stringify(data)
      this.$emit('func', this.myBarMenus)
    },
    getExportBartemplate (data, index) {
      this.myBarMenus[index].bartemplate = JSON.stringify(data)
      this.$emit('func', this.myBarMenus)
    },
    hadnleModel (record, index) {
      const that = this
      if (record.bar_alias === 'bar_import' || record.setting_type === 'import') {
        this.importKey = this.importKey === 'importKey' ? 'importKey_1' : 'importKey'
        this.$nextTick(() => {
          this.$refs.toolImport.show({
            tableid: that.config.tableid,
            barmenu: this.barmenu,
            record: record,
            index: index
          })
        })
      }
    }
  }
}
</script>
