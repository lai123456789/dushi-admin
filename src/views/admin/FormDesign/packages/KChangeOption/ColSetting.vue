<template>
  <a-drawer
    :width="900"
    :visible="visible"
    :title="config.title"
    :destroyOnClose="true"
    @close="visible=!visible"
    :afterVisibleChange="(e)=>{if(e)getList()}"
  >
    <a-spin :spinning="loading">
      <div>
        <a-alert message="目前仅限于一个栅格放置一个组件的批量配置，复杂栅格配置需谨慎修改" banner style="margin-bottom: 8px"/>
        <a-row type="flex">
          <a-col flex="420px">
            <a-table
              ref="table"
              size="small"
              rowKey="value"
              :columns="columns"
              :dataSource="data"
              :pagination="false"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onChange }"
              :sorter="{ field: 'id', order: 'descend' }"
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
                <span v-else-if="text === 'divider'">分割线</span>
                <span v-else>--</span>
              </div>
            </a-table>
          </a-col>
          <a-col flex="8px"></a-col>
          <a-col flex="420px">
            <a-card title="配置信息" size="small">
              <div style="margin-bottom: 10px">
                <a @click="refresh" >按排序值刷新</a>
              </div>
              <a-row :gutter="8" style="margin-bottom: 8px">
                <a-col :span="2"></a-col>
                <a-col :span="5">排序值</a-col>
                <a-col :span="10">名称</a-col>
                <a-col :span="4">栅格宽度</a-col>
              </a-row>
              <draggable
                v-model="checkedList"
                animation="200"
                @start="drag = true"
                @end="drag = false"
                handle=".handle"
              >
                <a-row class="list-item" v-for="(element, key) in checkedList" :gutter="8" :key="element.id" style="margin-bottom: 5px">
                  <a-col :span="2" class="handle" >
                    <a-icon type="drag"/>
                  </a-col>
                  <a-col :span="5">
                    <a-input size="small" :value="(key + 1 ) * 10" @blur="changesort($event, key)"/>
                  </a-col>
                  <a-col :span="10" class="text">
                    <a-tooltip placement="topLeft" :title="element.list.map(item => item.name || item.label || item.dividerText).toString()">
                      <span>{{ element.list.map(item => item.name || item.label || item.dividerText).toString() }}</span>
                    </a-tooltip>
                  </a-col>
                  <a-col :span="4">
                    <a-input-number :min="1" :max="24" size="small" v-model="element.span"/>
                  </a-col>
                </a-row>
              </draggable>
            </a-card>
          </a-col>
        </a-row>
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
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      checkedList: [],
      data: [],
      selectedRowKeys: [],
      columns: [{
        title: '#',
        width: 40,
        align: 'center',
        dataIndex: 'idSort',
        scopedSlots: { customRender: 'idSort' }
      }, {
        title: '字段名称',
        dataIndex: 'name'
      }, {
        title: 'UI组件',
        dataIndex: 'formtype',
        scopedSlots: { customRender: 'formtype' },
        width: 80
      }, {
        title: '分组',
        dataIndex: 'category',
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
      this.loading = true
      this.selectedRowKeys = []
      this.data = []
      this.checkedList = []
      this.config = config
    },
    getList () {
      this.checkedList = JSON.parse(JSON.stringify(this.config.checkedList)).filter(item => item.list.length > 0)
      this.data = JSON.parse(JSON.stringify(this.config.nowArray))
      const getTemplate = (array) => {
        array.forEach((temItem, index) => {
          if (temItem.columns) {
            getTemplate(temItem.columns)
          } else if (temItem.trs) {
            getTemplate(temItem.trs)
          } else if (temItem.tds) {
            getTemplate(temItem.tds)
          } else if (temItem.list) {
            getTemplate(temItem.list)
          } else {
            if (temItem.dividerText) {
              temItem.name = temItem.dividerText
              temItem.formtype = 'divider'
            }
            if (temItem.value) {
              this.data.splice(0, 0, temItem)
            }
            this.selectedRowKeys.push(temItem.value)
          }
        })
      }
      getTemplate(this.checkedList)
      this.loading = false
      this.getsortid()
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      const checkKey = []
      const getTemplate = (array, alias) => {
        array.forEach((temItem, index) => {
          if (temItem.columns) {
            getTemplate(temItem.columns)
          } else if (temItem.trs) {
            getTemplate(temItem.trs)
          } else if (temItem.tds) {
            getTemplate(temItem.tds)
          } else if (temItem.list) {
            getTemplate(temItem.list)
          } else {
            checkKey.push(temItem.value)
          }
        })
      }
      getTemplate(this.checkedList)
      const getArrDifference = (arr1, arr2) => {
        return arr1.concat(arr2).filter((v, i, arr) => {
          return arr.indexOf(v) === arr.lastIndexOf(v)
        })
      }
      const notKey = getArrDifference(this.selectedRowKeys, checkKey)
      notKey.forEach((notItem, notIndex) => {
        if (this.selectedRowKeys.some(item => item === notItem)) {
          const obj = {
            sortid: (this.checkedList.length + 1) * 10,
            list: [],
            span: 6
          }
          const data = this.data.find(dataItem => dataItem.value === notItem)
          if (data) {
            data.key = data.formtype + '_' + new Date().valueOf() + notIndex
            obj.list.push(data)
            this.checkedList.push(obj)
          }
        } else if (checkKey.some(item => item === notItem)) {
          this.checkedList = this.checkedList.filter(checkItem => { return checkItem.list.every(item => item.value !== notItem) })
        }
      })
    },
    // 改变排序值
    changesort (e, key) {
      this.checkedList[key].sortid = Number(e.target.value)
    },
    // 比较大小
    compare (key) {
      return function (a, b) {
        var value1 = a[key]
        var value2 = b[key]
        return value1 - value2
      }
    },
    // 刷新
    refresh () {
      // 排序方法
      this.checkedList = this.checkedList.sort(this.compare('sortid'))
      this.getsortid()
    },
    getsortid () {
      for (let i = 0; i < this.checkedList.length; i++) {
        this.checkedList[i]['sortid'] = (i + 1) * 10
      }
    },
    handleSubmit () {
      this.loading = true
      this.checkedList.forEach(item => {
        item.sortid = undefined
      })
      this.$emit('ok', this.checkedList)
      this.visible = false
      this.$message.success('操作成功')
    }
  }
}
</script>
