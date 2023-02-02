<template>
  <div class="option-change-container">
    <a-row v-if="type === 'option' || type === 'tab'" :gutter="8">
      <a-col :span="12"><a @click="handleAdd">添加</a></a-col>
      <a-col :span="12" style="text-align: right"><a @click="handleSort">排序</a></a-col>
      <div class="option-change-box" v-for="(val, index) in value" :key="index">
        <a-col
          :span="16"
        ><a-input
          v-model="val.label"
          placeholder="名称"
        /></a-col>
        <a-col :span="8" v-show="false" ><a-input v-model="val.value" placeholder="值"/></a-col>
        <a-col :span="8">
          <a-row :gutter="8">
            <a-col :span="12"><div @click="value.splice(index + 1, 0,{ label: '选项' + (value.length + 1), list: [], value: value.length + 1})" class="option-add-box"><a-icon type="plus" /></div></a-col>
            <a-col :span="12"><div @click="handleDelete(index)" class="option-delete-box"><a-icon type="delete" /></div></a-col>
          </a-row>
        </a-col>
      </div>
    </a-row>
    <a-row v-if="type === 'rules'" :gutter="8">
      <span v-for="(val, index) in value" :key="index">
        <div class="option-change-box" v-if="index !== 0">
          <a-col
            :span="16"
          ><a-input
            v-model="val.message"
            placeholder="提示信息"
          /></a-col>
          <a-col
            :span="16"
          ><a-input
            v-model="val.pattern"
            placeholder="正则表达式pattern"
          /></a-col>
          <a-col
            :span="8"
          ><div @click="handleDelete(index)" class="option-delete-box">
            <a-icon type="delete" /></div
          ></a-col>
        </div>
      </span>
      <a-col :span="24"><a @click="handleAddRules">增加校验</a></a-col>
    </a-row>
    <div v-else-if="type === 'colspan'" >
      <a-row>
        <a-col :span="8"><a @click="handleAddCol">首位添加</a></a-col>
        <a-col :span="8" style="text-align: center"><a @click="handleEndAddCol">末位添加</a></a-col>
        <a-col :span="8" style="text-align: center"><a @click="handleSetting">配置</a></a-col>
      </a-row>
      <a-row :gutter="8">
        <draggable
          v-model="showList"
          animation="200"
          @start="drag = true"
          @end="drag = false"
          handle=".handle"
        >
          <div class="list-item option-change-box" v-for="(val, index) in showList" :key="index">
            <a-col :span="2" class="handle" >
              <a-icon type="drag"/>
            </a-col>
            <a-col :span="4" style="text-align: center">
              <a-badge :count="index + 1 " :number-style="{ backgroundColor: '#1890FF' }" :overflow-count="999"/>
            </a-col>
            <a-col
              :span="10"
            >
              <a-input-number
                style="width:100%"
                :max="24"
                v-model="val.span"
                placeholder="名称"
              /></a-col>
            <a-col :span="8">
              <a-row :gutter="8">
                <a-col :span="12"><div @click="value.splice(index+1, 0,{ span: 6, list: [] })" class="option-add-box"><a-icon type="plus" /></div></a-col>
                <a-col :span="12"> <div @click="handleDelete(index)" class="option-delete-box"><a-icon type="delete" /></div></a-col>
              </a-row>
            </a-col>
          </div>
        </draggable>
      </a-row>
    </div>
    <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
    <col-setting ref="colSetting" @ok="getSetting"/>
  </div>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 修改多选、下拉、单选等控件options的组件，添加移除校验规制的组件
 */
import draggable from 'vuedraggable'
export default {
  components: {
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    draggable,
    ColSetting: () => import ('./ColSetting')
  },
  name: 'KChangeOption',
  props: {
    value: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: 'option'
    },
    nowArray: {
      type: Array,
      required: false,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      showList: this.value
    }
  },
  watch: {
    showList (val) {
      this.$emit('input', val)
    },
    value (val) {
      this.showList = val
    }
  },
  methods: {
    handleAdd () {
      // 添加
      const addData = this.value
      addData.splice(0, 0, {
        value: `${this.value.length + 1}`,
        label: '选项' + (this.value.length + 1),
        list: this.type === 'tab' ? [] : undefined
      })
      this.$emit('input', addData)
    },
    handleAddCol () {
      // 添加栅格Col
      const addData = this.value
      addData.splice(0, 0, {
        span: 6,
        list: []
      })
      this.$emit('input', addData)
    },
    handleEndAddCol () {
      // 添加栅格Col
      const addData = this.value
      addData.splice(addData.length, 0, {
        span: 6,
        list: []
      })
      this.$emit('input', addData)
    },
    handleSort () {
      const data = []
      this.value.forEach(item => {
        let obj = {}
        obj = item
        obj.name = item.label
        data.push(obj)
      })
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: data
      })
    },
    getSort (data) {
      this.$emit('input', data)
    },
    handleSetting () {
      this.$refs.colSetting.show({
        title: '栅格配置',
        checkedList: this.showList,
        nowArray: this.nowArray
      })
    },
    getSetting (data) {
      this.showList = data
    },
    handleAddRules () {
      const addData = [
        ...this.value,
        {
          pattern: '',
          message: ''
        }
      ]
      this.$emit('input', addData)
    },
    handleDelete (deleteIndex) {
      // 删除
      this.$emit(
        'input',
        this.value.filter((val, index) => index !== deleteIndex)
      )
    }
  }
}
</script>
<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';
.option-change-container {
  width: calc(100% - 8px);
}
.option-change-box {
  height: 38px;
  padding-bottom: 6px;
  .option-delete-box {
    background: #ffe9e9;
    color: #f22;
    width: 36px;
    height: 36px;
    line-height: 36px;
    margin-left: 4px;
    text-align: center;
    border-radius: 50%;
    overflow: hidden;
    transition: all 0.3s;
    &:hover {
      background: #f22;
      color: #fff;
    }
  }
  .option-add-box {
    background: #f6ffed;
    color: #52c41a;
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 50%;
    overflow: hidden;
    transition: all 0.3s;
    &:hover {
      background: #52c41a;
      color: #fff;
    }
  }
}
.list-item {
  // padding: 8px;
  margin-bottom: 3px;
  background-color: #fff;
  // border: 1px solid rgba(0, 0, 0, .125);
}
.list-item[draggable=true] {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-item .handle{
  // margin-right: 5px;
  // padding: 0 25px 0 0;
  cursor: move;
}
.list-item .text{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.list-item:first-child {
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}
.list-item:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 2px;
}
</style>
