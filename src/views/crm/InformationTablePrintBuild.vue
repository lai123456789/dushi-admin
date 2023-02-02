<template>
  <!-- 标签页布局 -->
  <a-tabs
    v-if="record.type === 'tabs'"
    :default-active-key="0"
    :tabBarGutter="Number(record.options.tabBarGutter)"
    :type="record.options.type"
    :size="record.options.size"
    :tabPosition="record.options.tabPosition"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <a-tab-pane
      v-for="(tabItem, index) in record.columns.filter(item => {
        if(item.label === '流程日志' || item.label === '催办日志'){
          if(params.parentParams.case_id){
            return item
          }else{
            return false
          }
        }else{
          return item
        }
      })"
      :key="index"
      :tab="tabItem.label"
    >
      <buildBlocks
        v-show="tabItem.label !== '知识库'"
        ref="nestedComponents"
        v-for="(item, keys) in tabItem.list"
        :key="item.key"
        :record.sync="tabItem.list[keys]"
        :indexs="keys"
        :params="params"
      />
      <div v-if="tabItem.label === '知识库'">
        <knowledge ref="knowledge" />
      </div>
    </a-tab-pane>
  </a-tabs>
  <!-- 栅格布局 -->
  <a-row
    v-else-if="record.type === 'grid'"
    style="display: flex; flex-flow: row wrap;"
    :gutter="Number(record.options.gutter)"
  >
    <a-col
      v-for="(colItem, index) in record.columns"
      :key="index"
      :span="colItem.span || 0"
      v-show="colItem.list.length > 0"
    >
      <buildBlocks
        ref="nestedComponents"
        v-for="(item, keys) in colItem.list"
        :key="item.key"
        :record.sync="colItem.list[keys]"
        :indexs="keys"
        :params="params"
      />
    </a-col>
  </a-row>
  <!-- 卡片布局 -->
  <a-card
    v-else-if="record.type === 'card'"
    :bordered="record.bordered === '1' || !record.bordered"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <a-row slot="title" v-if="record.label" type="flex" align="middle">
      <a-col :span="19">
        <span v-if="record.addShow === '1'">
          <a-space>
            <a href="javascript:;" @click="chioseFill">{{ record.label + ' ('+ record.index +')' }}</a>
            <a-icon type="check-circle" theme="filled" style="color:#52c41a" v-if="record.key === viewThis.cardKey"/>
          </a-space>
        </span>
        <span v-else>{{ record.label }}</span>
      </a-col>
    </a-row>
    <buildBlocks
      v-for="(item, keys) in record.list"
      :key="item.key"
      :record.sync="record.list[keys]"
      :indexs="keys"
      :params="params"
    />
    <check-warranty-period ref="checkWarrantyPeriod"/>
  </a-card>
  <!-- 表格布局 -->
  <table
    v-else-if="record.type === 'table'"
    class="kk-table-9136076486841527"
    :class="{
      bright: record.options.bright,
      small: record.options.small,
      bordered: record.options.bordered
    }"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <tr v-for="(trItem, trIndex) in record.trs" :key="trIndex">
      <td
        class="table-td"
        v-for="(tdItem, tdIndex) in trItem.tds"
        v-show="Number(tdItem.colspan) && Number(tdItem.rowspan)"
        :key="tdIndex"
        :style="tdItem.middle ? { verticalAlign: 'middle' } : {}"
        :colspan="Number(tdItem.colspan)"
        :rowspan="Number(tdItem.rowspan)"
      >
        <buildBlocks
          ref="nestedComponents"
          v-for="(item, keys) in tdItem.list"
          :key="item.key"
          :record.sync="tdItem.list[keys]"
          :indexs="keys"
          :params="params"
        />
      </td>
    </tr>
  </table>
  <div v-else>
    <!-- 隐藏，但是保留占位符 -->
    <a-form-item v-if="record.fieldrule === 'hidden' && record.placeholder === '1'" ></a-form-item>
    <!-- 原分割符 -->
    <a-divider v-else-if="record.type === 'divider'&& record.dividerText" :orientation="record.dividerDirection">{{ record.dividerText }}</a-divider>
    <!-- 组件 -->
    <component v-else-if="record.type === 'component'" :myid="`component-${record.value}`" :ref="`component-${record.value}`" :is="record.component" />
    <!-- button按钮 -->
    <a-form-item
      v-else-if="record.type === 'button'"
    >
      <a-button
        @click="()=>{record.options.handle === 'submit' ? false : record.options.handle === 'reset' ? $emit('handleReset') : record.options.dynamicFun ? this[record.options.dynamicFun](): false}"
        :type="record.options.type"
        :html-type="record.options.handle === 'submit' ? 'submit' : undefined"
        v-text="record.label"
      ></a-button>
    </a-form-item>
    <!-- alert提示 -->
    <a-form-item
      v-else-if="record.type === 'alert'"
    >
      <a-alert
        :message="record.label"
        :description="record.options.description"
        :type="record.options.type"
        :showIcon="record.options.showIcon === '1'"
        :closable="record.options.closable === '1'"
        :banner="record.options.banner === '1'"
      />
    </a-form-item>
    <!-- 文本 -->
    <a-form-item
      v-else-if="record.type === 'text'"
    >
      <div :style="{ textAlign: record.options.textAlign, minWidth: '50px' }">
        <label
          :class="{ 'ant-form-item-required': record.options.showRequiredMark }"
          v-text="record.label"
        ></label>
      </div>
    </a-form-item>
    <a-form-item
      v-else-if="record.type === 'placeholder'"
    >
      <div>
      </div>
    </a-form-item>
    <!-- html -->
    <div
      v-else-if="record.type === 'html'"
      v-html="record.options.defaultValue"
    ></div>
    <!-- 分割线 -->
    <div v-else-if="record.type === 'divider' && !record.dividerText">
      <a-divider
        v-if="
          record.type === 'divider' &&
            record.label !== '' &&
            record.options.orientation
        "
        :orientation="record.options.orientation"
      >{{ record.label }}</a-divider>
      <a-divider v-else-if="record.type === 'divider' && record.label !== ''">{{
        record.label
      }}</a-divider>
      <a-divider v-else-if="record.type === 'divider' && record.label === ''" style="margin: 6px 0"/>
    </div>
    <a-form-item
      v-else-if="
        [
          'input',
          'textarea',
          'date',
          'time',
          'number',
          'radio',
          'checkbox',
          'select',
          'rate',
          'uploadImg',
          'uploadFile',
          'switch',
          'cascader',
          'treeSelect',
          'signature'
        ].includes(record.type)
      "
      labelAlign="left"
      :label-col="record.labelLocal === '1' ? {} : record.labelShow !== '0' && record.type !== 'signature' ? labelCol : {style: 'display: none'}"
      :wrapper-col="record.labelLocal === '1' ? {} : record.labelShow !== '0' && record.type !== 'signature' ? wrapperCol : { style: 'width: 100%; display: inline-block' }"
      :colon="record.labelShow !== '0' && record.type !== 'signature' "
    >
      <span slot="label">
        <span v-if="record.labelShow !== '0' && record.type !== 'signature'">{{ record.label }}</span>
        <a-tooltip v-if="record.help">
          <span slot="title" v-html="record.help"></span>
          <a-icon
            v-if="record.help"
            class="question-circle"
            type="question-circle-o"
          />
        </a-tooltip>
      </span>
      <!-- 单行文本 -->
      <span v-if="['textarea','input','number'].includes(record.type)">
        <span v-if="record.options.defaultValue">{{ record.options.defaultValue }}</span>
        <a-input :style="{width: record.options.width, border: 'none' }" :readOnly="true" v-else/>
      </span>
      <!-- 单选框 -->
      <a-radio-group
        v-else-if="record.type === 'radio'"
        :options="
          !record.options.dynamic
            ? record.options.options
            : dynamicData[record.options.dynamicKey]
              ? dynamicData[record.options.dynamicKey]
              : []
        "
        :readOnly="true"
        v-model="record.options.defaultValue"
      />
      <!-- 多选框 -->
      <a-checkbox-group
        v-else-if="record.type === 'checkbox'"
        :options="
          !record.options.dynamic
            ? record.options.options
            : dynamicData[record.options.dynamicKey]
              ? dynamicData[record.options.dynamicKey]
              : []
        "
        :readOnly="true"
        v-model="record.options.defaultValue"
      />
      <!-- 开关 -->
      <a-switch
        v-else-if="record.type === 'switch'"
        :readOnly="true"
        v-model="record.options.defaultValue"
      />
      <div v-else-if="record.type === 'signature'">
        <img :src="record.file" alt="" style="max-width: 100px; height: auto" v-if="record.file">
      </div>
    </a-form-item>
  </div>
</template>
<script>
export default {
  name: 'BuildBlocks',
  props: {
    record: {
      type: Object,
      required: true
    },
    params: {
      type: Object,
      default () {
        return {
          tableName: '',
          template: [],
          fileList: [],
          page: '', // 传递来的页面，表单视图为'user', WorkflowHandleForm的页面可以传空值也可以传其他
          handleWayData: [], // WorkflowHandleForm的waydata
          remarksrule: '' // 办理方式show_no_allow可见选填，show_allow可见必填 hidden隐藏
        }
      },
      required: true
    }
  },
  data () {
    return {
      labelCol: { style: 'min-width: 50px; max-width: 104px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 104px); display: inline-block' },
      test: '测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试'
    }
  },
  methods: {
  }
}
</script>
<style lang="less" scoped>
@import '../admin/FormDesign/styles/k-table.less';
</style>
