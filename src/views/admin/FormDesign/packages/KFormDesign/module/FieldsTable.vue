<!--
 * @Description: 折叠组件
 * @Author: kcz
 * @Date: 2020-01-13 00:37:54
 * @LastEditors: kcz
 * @LastEditTime: 2020-03-28 11:32:39
 -->
<template>
  <div>
    <a-input v-model="queryParam.name" style="margin: 5px 0" @change="nameSearch" allowClear placeholder="请输入字段名称搜索"/>
    <table style="width: 100%; height: 32px; background: #FAFAFA; border: 1px solid #D9D9D9; border-bottom: none" >
      <tr>
        <th style="text-align: center; width: 30px">#</th>
        <th style="width: 100px; padding-left: 15px">字段名称</th>
        <th style="padding-left: 5px">UI组件</th>
        <th>分组</th>
      </tr>
    </table>
    <draggable
      tag="ul"
      :value="data"
      style="padding: 0"
      v-bind="{
        group: { name: 'form-draggable', pull: 'clone', put: false },
        sort: false,
        animation: 180,
        ghostClass: 'moving'
      }"
      @start="handleStart($event, data)"
    >
      <li
        v-for="(val, index) in data"
        :key="index"
        style="width: 100%; margin: -1px 0 0 0; padding:8px 2px"
        @dragstart="$emit('generateKey', data, index)"
      >
        <span style="padding-left: 5px;width: 30px; display:inline-block; text-overflow:ellipsis; overflow: hidden; white-space: nowrap">{{ index +1 }}</span>
        <span style="width: 100px; padding-left: 10px; display:inline-block; text-overflow:ellipsis; overflow: hidden; white-space: nowrap">{{ val.name }}</span>
        <span style="width: 60px; display:inline-block; text-overflow:ellipsis; overflow: hidden; white-space: nowrap">
          <span v-if="val.formtype === 'text'">单行文本</span>
          <span v-else-if="val.formtype === 'combobox'">下拉框</span>
          <span v-else-if="val.formtype === 'associated'">关联数据</span>
          <span v-else-if="val.formtype === 'datetime'">日期时间</span>
          <span v-else-if="val.formtype === 'textarea'">多行文本</span>
          <span v-else-if="val.formtype === 'radio'">单选框</span>
          <span v-else-if="val.formtype === 'checkbox'">复选框</span>
          <span v-else-if="val.formtype === 'editor'">编辑器</span>
          <span v-else-if="val.formtype === 'image'">图片</span>
          <span v-else-if="val.formtype === 'file'">附件</span>
          <span v-else-if="val.formtype === 'cascader'">级联选择</span>
          <span v-else-if="val.formtype === 'switch'">开关</span>
          <span v-else-if="val.formtype === 'score'">评分</span>
          <span v-else-if="val.formtype === 'serialnumber'">流水号</span>
          <span v-else-if="val.formtype === 'organization'">组织结构</span>
          <span v-else-if="val.formtype === 'subform'">子表</span>
          <span v-else-if="val.formtype === 'autocomplete'">自动完成</span>
          <span v-else-if="val.formtype === 'number'">数字</span>
          <span v-else-if="val.formtype === 'address'">地址</span>
          <span v-else-if="val.formtype === 'treeselect'">树选择</span>
          <span v-else-if="val.formtype === 'tag'">标签</span>
          <span v-else-if="val.formtype === 'location'">地图选点</span>
          <span v-else>--</span>
        </span>
        <span style="padding-left: 10px; width: 60px; display: inline-block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ val.category || '--' }}</span>
      </li>
    </draggable>
  </div>
</template>
<script>
export default {
  name: 'CollapseItem',
  // eslint-disable-next-line vue/require-prop-types
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    list (newValue) {
      this.data = newValue
      if (this.queryParam.name) {
        this.nameSearch()
      }
    }
  },
  components: {
    draggable: () => import('vuedraggable')
  },
  data () {
    return {
      queryParam: {},
      fieldCategory: [],
      data: [],
      columns: [{
        title: '#',
        width: 40,
        align: 'center',
        dataIndex: 'idSort',
        scopedSlots: { customRender: 'idSort' }
      }, {
        title: '字段名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }

      }, {
        title: 'UI组件',
        dataIndex: 'formtype',
        scopedSlots: { customRender: 'formtype' },
        width: 80
      }, {
        title: '分组',
        dataIndex: 'category',
        scopedSlots: { customRender: 'category' },
        width: 120
      }]
    }
  },
  created () {
    this.data = this.list
  },
  methods: {
    handleStart (e, data, index) {
      this.$emit('start', data[e.oldIndex].formtype, index)
    },
    nameSearch () {
      if (!this.queryParam.name) {
        this.data = this.list
      } else {
        this.data = this.list.filter(item => item.name.includes(this.queryParam.name))
      }
    },
    groupChange () {

    }
  }
}
</script>
