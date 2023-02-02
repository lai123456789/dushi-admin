<template>
  <!-- 标签页布局 -->
  <a-tabs
    v-if="record.type === 'tabs'"
    class="grid-row"
    :default-active-key="0"
    :tabBarGutter="record.options.tabBarGutter || null"
    :type="record.options.type"
    :size="record.options.size"
    :tabPosition="record.options.tabPosition"
    :animated="record.options.animated === '1' || record.options.animated "
  >
    <a-tab-pane
      v-for="(tabItem, index) in record.columns"
      :key="index"
      :tab="tabItem.label"
    >
      <buildBlocks
        ref="nestedComponents"
        @handleReset="$emit('handleReset')"
        @change="handleChange"
        v-for="item in tabItem.list"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :key="item.key"
        :record="item"
        :formConfig="formConfig"
        :config="config"
      />
    </a-tab-pane>
  </a-tabs>
  <!-- 栅格布局 -->
  <a-row
    v-else-if="record.type === 'grid'"
    class="grid-row"
    style="display: flex; flex-flow: row wrap;"
    :gutter="Number(record.options.gutter)"
  >
    <a-col
      class="grid-col"
      v-for="(colItem, idnex) in record.columns"
      :key="idnex"
      :span="colItem.span || 0"
    >
      <buildBlocks
        ref="nestedComponents"
        @handleReset="$emit('handleReset')"
        @change="handleChange"
        v-for="item in colItem.list"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :key="item.key"
        :record="item"
        :formConfig="formConfig"
        :config="config"
      />
    </a-col>
  </a-row>
  <!-- 卡片布局 -->
  <a-card
    v-else-if="record.type === 'card'"
    class="grid-row"
    :bordered="record.bordered === '1'"
    :style="{ 'margin-top': record.topMargin + 'px' ,'margin-right': record.rightMargin + 'px', 'margin-bottom': record.downMargin + 'px', 'margin-left': record.leftMargin + 'px'}"
  >
    <a-row slot="title" v-if="record.label">
      <a-col :span="19">{{ record.label }}</a-col>
      <a-col :span="5" style="text-align: right"><a-button size="small" v-if="record.addShow === '1'">添加</a-button></a-col>
    </a-row>
    <buildBlocks
      ref="nestedComponents"
      @handleReset="$emit('handleReset')"
      @change="handleChange"
      v-for="item in record.list"
      :disabled="disabled"
      :dynamicData="dynamicData"
      :key="item.key"
      :record="item"
      :formConfig="formConfig"
      :config="config"
    />
  </a-card>
  <!-- 表格布局 -->
  <table
    v-else-if="record.type === 'table'"
    class="kk-table-9136076486841527"
    :class="{
      bright: record.options.bright || record.options.bright === '1',
      small: record.options.small || record.options.small === '1',
      bordered: record.options.bordered || record.options.bordered === '1'
    }"
    :style="record.options.customStyle"
  >
    <tr v-for="(trItem, trIndex) in record.trs" :key="trIndex">
      <td
        class="table-td"
        v-for="(tdItem, tdIndex) in trItem.tds.filter(
          item => Number(item.colspan) && Number(item.rowspan)
        )"
        :key="tdIndex"
        :style="tdItem.middle ? { verticalAlign: 'middle' } : {}"
        :colspan="tdItem.colspan"
        :rowspan="tdItem.rowspan"
      >
        <buildBlocks
          ref="nestedComponents"
          @handleReset="$emit('handleReset')"
          @change="handleChange"
          v-for="item in tdItem.list"
          :disabled="disabled"
          :dynamicData="dynamicData"
          :key="item.key"
          :record="item"
          :formConfig="formConfig"
          :config="config"
        />
      </td>
    </tr>
  </table>

  <KFormItem
    v-else
    ref="nestedComponents"
    @handleReset="$emit('handleReset')"
    @change="handleChange"
    :disabled="disabled"
    :dynamicData="dynamicData"
    :key="record.key"
    :record="record"
    :formConfig="formConfig"
    :config="config"
  />
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 */
export default {
  name: 'BuildBlocks',
  props: {
    record: {
      type: Object,
      required: true
    },
    formConfig: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    dynamicData: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    KFormItem: () => import('../KFormItem/index')
  },
  methods: {
    validationSubform () {
      // 验证动态表格
      const nestedComponents = this.$refs.nestedComponents
      if (
        typeof nestedComponents === 'object' &&
        nestedComponents instanceof Array
      ) {
        for (let i = 0; nestedComponents.length > i; i++) {
          if (!nestedComponents[i].validationSubform()) {
            return false
          }
        }
        return true
      } else if (typeof nestedComponents !== 'undefined') {
        return nestedComponents.validationSubform()
      } else {
        return true
      }
    },
    handleChange (value, key) {
      this.$emit('change', value, key)
    }
  }
}
</script>
