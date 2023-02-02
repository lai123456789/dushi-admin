<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="600"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <div>
        <a-form class="normal">
          <a-row :gutter="5">
            <a-col :span="6">
              <a-form-item>
                <a-select :allowClear="true" v-model="queryParam.group" @change="groupChange" placeholder="请选择分类">
                  <a-select-option v-for="value in fieldCategory" :key="value.value" :value="value.value" >{{ value.display }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="18">
              <a-form-item>
                <a-input v-model="queryParam.name" @change="nameSearch" placeholder="请输入字段名称或系统名搜索"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <a-table
          ref="table"
          size="small"
          rowKey="value"
          :columns="columns"
          :dataSource="data"
          :pagination="false"
          :rowSelection="rowSelection"
        >
          <div slot="idSort" slot-scope="text, record, index">{{ index + 1 }}</div>
          <div slot="formtype" slot-scope="text">
            <span v-if="text === 'text'">单行文本</span>
            <span v-else-if="text === 'combobox'">下拉框</span>
            <span v-else-if="text === 'associated'">关联数据</span>
            <span v-else-if="text === 'datetime'">日期时间</span>
            <span v-else-if="text === 'textarea'">多行文本</span>
            <span v-else-if="text === 'radio'">单选框</span>
            <span v-else-if="text === 'checkbox'">复选框</span>
            <span v-else-if="text === 'editor'">编辑器</span>
            <span v-else-if="text === 'image'">图片</span>
            <span v-else-if="text === 'file'">附件</span>
            <span v-else-if="text === 'cascader'">级联选择</span>
            <span v-else-if="text === 'switch'">开关</span>
            <span v-else-if="text === 'score'">评分</span>
            <span v-else-if="text === 'serialnumber'">流水号</span>
            <span v-else-if="text === 'organization'">组织结构</span>
            <span v-else-if="text === 'subform'">子表</span>
            <span v-else-if="text === 'autocomplete'">自动完成</span>
            <span v-else-if="text === 'number'">数字</span>
            <span v-else-if="text === 'address'">地址</span>
            <span v-else-if="text === 'treeselect'">树选择</span>
            <span v-else-if="text === 'tag'">标签</span>
            <span v-else-if="text === 'location'">地图选点</span>
            <span v-else>--</span>
          </div>
        </a-table>
      </div>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    draggable: () => import('vuedraggable')
  },
  props: {
    dataList: {
      type: Array,
      default () {
        return []
      },
      required: false
    },
    fieldCategory: {
      type: Array,
      default () {
        return []
      },
      required: false
    }
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      queryParam: {},
      data: [],
      group: [],
      alldata: [],
      selectedRowKeys: [],
      selectedRows: [],
      rowSelection: {
        selectedRowKeys: this.selectedRowKeys || [],
        onChange: this.onChange
      },
      showData: [],
      columns: [{
        title: '#',
        width: 40,
        align: 'center',
        dataIndex: 'idSort',
        scopedSlots: { customRender: 'idSort' }
      }, {
        title: '字段名称',
        dataIndex: 'name',
        sorter: (a, b) => a.name.length - b.name.length
      }, {
        title: 'UI组件',
        dataIndex: 'formtype',
        scopedSlots: { customRender: 'formtype' },
        sorter: (a, b) => a.formtype.length - b.formtype.length,
        width: 80
      }, {
        title: '分类名称',
        dataIndex: 'category',
        sorter: (a, b) => a.category.length - b.category.length,
        customRender: (text) => {
          return text || '--'
        },
        width: 120
      }]
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      config.data.forEach(item => {
        if (!item.value) {
          item.value = item.alias
        }
      })
      this.alldata = JSON.parse(JSON.stringify(config.data))
      this.data = JSON.parse(JSON.stringify(config.data))
      this.queryParam = {}
      this.selectedRowKeys = []
      this.selectedRows = []
      this.showData = this.dataList
      this.showData.forEach((item, index) => {
        item.index = index + 1
      })
      if (config.action === 'edit') {
        this.selectedRows = this.showData.filter(item => item.display !== 'd')
        this.selectedRowKeys = this.selectedRows.map(item => item.value || item.alias)
        this.rowSelection = {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onChange,
          getCheckboxProps: record => {
            return {
              props: {
                defaultChecked: this.selectedRowKeys.includes(record.value || record.alias)
              }
            }
          }
        }
      }
    },
    nameSearch () {
      if (!this.queryParam.name) {
        this.data = this.alldata
      } else {
        this.data = this.alldata.filter(item => item.name.includes(this.queryParam.name))
      }
    },
    groupChange (e) {
      if (!e) {
        this.data = this.alldata
      } else if (e === '未分组') {
        this.data = this.alldata.filter(item => !item.category)
      } else {
        this.data = this.alldata.filter(item => item.category === e)
      }
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = Array.from(new Set(selectedRowKeys))
      this.rowSelection = {
        selectedRowKeys: Array.from(new Set(selectedRowKeys)),
        onChange: this.onChange
      }
      this.selectedRows = selectedRows
      this.selectedRows.forEach(item => {
        this.showData.forEach(items => {
          if (items.value === (item.value || item.alias)) {
            item.index = items.index
          }
        })
      })
      this.selectedRows.forEach(item => {
        if (!item.index) {
          item.index = selectedRows.length
        }
      })
    },
    handleSubmit () {
      this.visible = false
      const data = []
      this.selectedRowKeys.forEach(item => {
        if (this.alldata.filter(allItem => (allItem.value || allItem.alias) === item)[0]) {
          data.push(this.alldata.filter(allItem => (allItem.value || allItem.alias) === item)[0])
        }
      })
      data.forEach(item => { item.display = item.display === 'd' ? 'v' : item.display })
      this.$emit('ok', data)
    }
  }
}
</script>
