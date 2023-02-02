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
      :dataSource="extendbarmenu"
      size="small"
      :pagination="false">
      <span slot="bar_sys" slot-scope="text">
        <template v-if="text =='1'">系统默认</template>
        <template v-else>自定义</template>
      </span>
      <span slot="display" slot-scope="text">
        <template v-if="text =='1'">是</template>
        <template v-else>否</template>
      </span>
      <span slot="style" slot-scope="text">
        <template v-if="text =='primary'">Primary</template>
        <template v-else-if="text=='default'">Default</template>
        <template v-else-if="text=='dashed'">Dashed</template>
        <template v-else-if="text=='danger'">Danger</template>
        <template v-else-if="text=='link'">Link</template>
      </span>
      <span slot="priv" slot-scope="text, record, index">
        <a @click="handlePriv(record, index)"><a-badge :status="text !='' ? 'success' : 'default'" />设置</a>
      </span>
      <div slot="action" slot-scope="text, record,index">
        <a @click="handleEdit(record,index)">编辑</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)">删除</a>
      </div>
    </a-table>
    <!-- 设置附加属性 -->
    <extend-button-form ref="extendButtonForm" @func="getExtendBarMenus" />
    <!-- 访问权限 -->
    <priv-visit-form ref="privVisitForm" :params="{formview: extendbarmenu}" @func="getPrivExtendBarMenus"/>
    <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
    <tool-button-choose ref="toolButtonChoose" @ok="getButtonData" />
  </div>
</template>
<script>
import { extendButton } from './DefaultButton'
export default {
  components: {
    ExtendButtonForm: () => import('./ExtendButtonForm'),
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    PrivVisitForm: () => import('./PrivVisitForm'),
    ToolButtonChoose: () => import('@/views/admin/Table/ToolButtonChoose')
  },
  props: {
    extendbarmenuData: {
      type: Array,
      default () {
        return []
      },
      required: true
    }
  },
  computed: {
    listArray () {
      return extendButton
    }
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: {},
      // 表头
      columns: [{
        title: '排序',
        dataIndex: 'listorder'
      }, {
        title: '按钮名称',
        dataIndex: 'name'
      }, {
        title: '显示',
        dataIndex: 'display',
        scopedSlots: { customRender: 'display' }
      }, {
        title: '按钮类型',
        dataIndex: 'bar_sys',
        scopedSlots: { customRender: 'bar_sys' }
      }, {
        title: '按钮样式',
        dataIndex: 'style',
        scopedSlots: { customRender: 'style' }
      }, {
        title: '授权',
        dataIndex: 'barmenupriv',
        scopedSlots: { customRender: 'priv' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        scopedSlots: { customRender: 'action' }
      }],
      extendbarmenu: []
    }
  },
  created () {
    this.extendbarmenu = this.extendbarmenuData
  },
  watch: {
    extendbarmenuData (newValue) {
      this.extendbarmenu = newValue
    }
  },
  methods: {
    handleAdd () {
      this.$refs.extendButtonForm.show({
        action: 'add',
        title: '添加',
        record: {
          id: (new Date()).valueOf(),
          listorder: this.extendbarmenu.length * 10 + 10,
          name: '',
          bar_sys: 0,
          display: 1,
          barmenupriv: '',
          attribute: ''
        }
      })
    },
    handleEdit (record, index) {
      this.$refs.extendButtonForm.show({
        action: 'edit',
        title: '编辑: ' + record.name,
        record: record,
        index: index
      })
    },
    darwerOpen () {
      this.$refs.toolButtonChoose.show({
        listArray: this.listArray,
        unCheckBar: this.listArray.filter(item => this.extendbarmenu.findIndex(barItem => barItem.bar_alias === item.bar_alias) === -1)
      })
    },
    getButtonData (data) {
      this.extendbarmenu = [...this.extendbarmenu, ...data]
    },
    handleDelete (record) {
      const dataSource = [...this.extendbarmenu]
      this.extendbarmenu = dataSource.filter(item => item.id !== record.id)
    },
    handleSort (type) {
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: this.extendbarmenu,
        state: type
      })
    },
    getSort (data, state) {
      this.extendbarmenu = data
    },
    getPrivExtendBarMenus (e) {
      this.extendbarmenu = e
    },
    getExtendBarMenus (action, value, index) {
      if (action !== 'edit') {
        this.extendbarmenu.push(value)
      } else {
        this.extendbarmenu.splice(index, 1, value)
      }
    },
    handlePriv (record, index) {
      this.$refs.privVisitForm.show({
        action: 'edit',
        title: '授权: ' + record.name,
        record: record,
        index: index,
        key: 'barmenupriv',
        selectType: 'radio',
        privArr: {
          visit: '可访问'
        },
        defaultpriv: 'visit'
      })
    }
  }
}
</script>
