<template>
  <a-drawer
    :title="config.title"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <a-row type="flex" :gutter="8">
        <a-col flex="1">
          <a-card title="选择字段" size="small" style="margin-bottom: 20px; overflow-y: scroll; height: calc(100vh - 130px)">
            <a-table
              ref="table"
              size="small"
              rowKey="alias"
              :columns="columns"
              :dataSource="data"
              :pagination="false"
              :rowSelection="rowSelection"
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
                <span v-else>--</span>
              </div>
            </a-table>
          </a-card>
        </a-col>
        <a-col flex="1">
          <a-card title="配置信息" size="small">
            <a-form :form="form" @submit="handleSubmit">
              <a-row type="flex" align="middle">
                <a-col :span="2" style="text-align: center"><a-checkbox :checked="widthcheck" @change="(e) => { widthcheck = e.target.checked }"></a-checkbox></a-col>
                <a-col :span="22">
                  <a-form-item label="列宽" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-input-number style="margin: 0 5px 0 5px" :min="0" :disabled="!widthcheck" v-decorator="['width', { initialValue: 100 }]" />px
                  </a-form-item>
                </a-col>
                <a-col :span="2" style="text-align: center"><a-checkbox :checked="sizecheck" @change="(e) => { sizecheck = e.target.checked }"></a-checkbox></a-col>
                <a-col :span="22">
                  <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <span slot="label">
                      文字大小
                      <a-tooltip placement="top">
                        <template slot="title">
                          <span>字体大小默认为13px</span>
                        </template>
                        <a-icon type="question-circle" />
                      </a-tooltip>
                    </span>
                    <a-col :span="6">
                      <a-select style="margin: 0 5px 0 5px" :disabled="!sizecheck" v-decorator="['fontsize', { initialValue: '13px' }]">
                        <a-select-option v-for="(value, index) in fontsize" :key="index" :value="value">
                          {{ value }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                  </a-form-item>
                </a-col>
                <a-col :span="2" style="text-align: center"><a-checkbox :checked="colorcheck" @change="(e) => { colorcheck = e.target.checked }"></a-checkbox></a-col>
                <a-col :span="22">
                  <a-form-item label="文字颜色" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-col :span="6"><a-input style="margin:0 5px 0 5px" :disabled="!colorcheck" v-decorator="['color']" /></a-col>
                    <a-col :span="2"><a-dropdown>
                      <a-button>选择</a-button>
                      <a-menu slot="overlay">
                        <a-sub-menu v-for="(value, index) in colorTitle" :key="index" :title="value.name" :style="{'background-color': value.color}">
                          <a-menu-item v-for="(values, indexs) in colorAll[index]" :key="indexs" :style="{'background-color': values}" @click="sendColor('color', values)">{{ values }}</a-menu-item>
                        </a-sub-menu>
                      </a-menu>
                    </a-dropdown></a-col>
                  </a-form-item>
                </a-col>
                <a-col :span="2" style="text-align: center"><a-checkbox :checked="bgcheck" @change="(e) => { bgcheck = e.target.checked }"></a-checkbox></a-col>
                <a-col :span="22">
                  <a-form-item label="背景颜色" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-col :span="6"><a-input style="margin:0 5px 0 5px" :disabled="!bgcheck" v-decorator="['bgcolor']" /></a-col>
                    <a-col :span="2"><a-dropdown>
                      <a-button>选择</a-button>
                      <a-menu slot="overlay">
                        <a-sub-menu v-for="(value, index) in colorTitle" :key="index" :title="value.name" :style="{'background-color': value.color}">
                          <a-menu-item v-for="(values, indexs) in colorAll[index]" :key="indexs" :style="{'background-color': values}" @click="sendColor('bgcolor', values)">{{ values }}</a-menu-item>
                        </a-sub-menu>
                      </a-menu>
                    </a-dropdown>
                    </a-col>
                  </a-form-item>
                </a-col>
                <a-col :span="2" style="text-align: center"><a-checkbox :checked="aligncheck" @change="(e) => { aligncheck = e.target.checked }"></a-checkbox></a-col>
                <a-col :span="22">
                  <a-form-item label="对齐" :labelCol="labelCol" :wrapperCol="wrapperCol">
                    <a-col :span="10" style="margin:0 5px 0 5px; white-space: nowrap">
                      <a-radio-group :disabled="!aligncheck" v-decorator="['align', { initialValue: 'left' }]" >
                        <a-radio value="left">居左</a-radio>
                        <a-radio value="center">居中</a-radio>
                        <a-radio value="right">居右</a-radio>
                      </a-radio-group>
                    </a-col>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </a-col>
      </a-row>

      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { magenta, red, volcano, orange, yellow, gold, cyan, lime, green, blue, geekblue, purple } from '@ant-design/colors'
export default {
  components: {
    draggable: () => import('vuedraggable')
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      data: [],
      fontsize: [],
      widthcheck: true,
      sizecheck: true,
      colorcheck: true,
      bgcheck: true,
      aligncheck: true,
      checkedList: [],
      form: this.$form.createForm(this),
      colorAll: [],
      colorTitle: [],
      selectedRowKeys: [],
      rowSelection: {
        selectedRowKeys: this.selectedRowKeys || [],
        onChange: this.onChange
      },
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
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = Array.from(new Set(selectedRowKeys))
      this.rowSelection = {
        selectedRowKeys: Array.from(new Set(selectedRowKeys)),
        onChange: this.onChange
      }
      this.selectedRows = selectedRows
      this.selectedRows.forEach(item => {
        if (!item.index) {
          item.index = selectedRows.length
        }
      })
    },
    show (config) {
      this.visible = true
      this.config = config
      this.data = config.data
      this.fontsize = []
      for (let i = 8; i <= 24; i++) {
        this.fontsize.push(i + 'px')
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
    sendColor (type, color) {
      if (type === 'color') {
        this.form.setFieldsValue({ color: color })
      } else {
        this.form.setFieldsValue({ bgcolor: color })
      }
    },
    handleSubmit (e) {
      e.preventDefault()
      const selectedRowKeys = this.selectedRowKeys
      this.checkedList = this.data.filter((item, index) => {
        return selectedRowKeys.some(keyItem => keyItem === item.alias)
      })
      this.form.validateFields((err, values) => {
        if (!err) {
          for (const i in this.checkedList) {
            if (!this.checkedList[i].style) {
              this.checkedList[i]['style'] = {}
            }
            if (this.widthcheck) {
              this.checkedList[i]['width'] = values.width
            }
            if (this.sizecheck) {
              this.checkedList[i]['style']['fontsize'] = values.fontsize
            }
            if (this.colorcheck) {
              this.checkedList[i]['style']['color'] = values.color
            }
            if (this.bgcheck) {
              this.checkedList[i]['style']['bgcolor'] = values.bgcolor
            }
            if (this.aligncheck) {
              this.checkedList[i]['align'] = values.align
            }
          }
        }
      })
      this.data.map(subItem => {
        const obj = this.checkedList.find(item => item.alias === subItem.alias)
        return obj
      })
      this.$emit('ok', this.data)
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
/deep/.ant-drawer-wrapper-body{
  overflow: hidden;
}
/deep/.ant-drawer-body > .ant-spin-nested-loading > .ant-spin-container > :first-child{
  overflow: hidden;
}
</style>
