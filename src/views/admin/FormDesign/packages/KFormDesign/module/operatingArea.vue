<!--
 * @Description: 头部
 * @Author: kcz
 * @Date: 2019-12-30 00:37:05
 * @LastEditors: kcz
 * @LastEditTime: 2020-03-26 20:05:57
 -->
<template>
  <div class="operating-area">
    <!-- 头部操作按钮区域 start -->
    <!-- 操作左侧区域 start -->
    <div class="left-btn-box">
      <!-- <a-button size="small" type="primary" @click="$emit('handleSave')">保存</a-button> -->
      <a-space>
        <a-button size="small" @click="$emit('handlePreview')">预览</a-button>
        <a-button size="small" @click="$emit('querierFormRule')" v-if="!tableType">表单规则</a-button>
        <a-button size="small" type="danger" @click="$emit('handleReset')">清空</a-button>
        <a-tooltip title="导入">
          <a
            v-if="toolbars.includes('importJson')"
            @click="$emit('handleOpenImportJsonModal')"
          >
            <a-icon type="upload" />
            <span v-if="showToolbarsText">导入</span>
          </a>
        </a-tooltip>
        <a-tooltip title="生成JSON">
          <a
            v-if="toolbars.includes('exportJson')"
            @click="$emit('handleOpenJsonModal')"
          >
            <a-icon type="credit-card" />
            <span v-if="showToolbarsText">生成JSON</span>
          </a>
        </a-tooltip>
        <!--
      <a-tooltip title="生成代码">
        <a
          v-if="toolbars.includes('exportCode')"
          @click="$emit('handleOpenCodeModal')"
        >
          <a-icon type="code" />
          <span v-if="showToolbarsText">生成代码</span>
        </a>
      </a-tooltip>

      <a-tooltip title="清空">
        <a v-if="toolbars.includes('reset')" @click="$emit('handleReset')">
          <a-icon type="delete" />
          <span v-if="showToolbarsText">清空</span>
        </a>
      </a-tooltip> -->
        <a-divider type="vertical" />
        <a-tooltip title="撤销">
          <a
            v-if="toolbars.includes('undo')"
            :class="{ disabled: recordList.length === 0 }"
            @click="$emit('handleUndo')"
          >
            <a-icon type="undo" />
            <span v-if="showToolbarsText">撤销</span>
          </a>
        </a-tooltip>
        <a-tooltip title="前进">
          <a
            v-if="toolbars.includes('redo')"
            :class="{ disabled: redoList.length === 0 }"
            @click="$emit('handleRedo')"
          >
            <a-icon type="redo" />
            <span v-if="showToolbarsText">重做</span>
          </a>
        </a-tooltip>
        <!-- 按钮左侧插槽 start -->
        <slot name="left-action"></slot>
        <!-- 按钮左侧插槽 end -->
      </a-space>
    </div>
    <!-- 操作左侧区域 end -->

    <!-- 操作右侧区域 start -->
    <div class="right-btn-box">
      <a-space>
        <a-button v-if="!tableType" @click="$emit('saveAs')">另存为组件</a-button>
        <a-dropdown v-if="!tableType">
          <a-menu slot="overlay" @click="(e)=>{ $emit('changeAllStatus',e) }">
            <a-menu-item key="1">全部允许</a-menu-item>
            <a-menu-item key="0">全部只读</a-menu-item>
          </a-menu>
          <a-button size="small">批量设置<a-icon type="down" /></a-button>
        </a-dropdown>
      </a-space>
      <!-- 按钮右侧插槽 start -->
      <slot name="right-action">
      </slot>
      <!-- 按钮右侧插槽 end -->
    </div>
    <!-- 操作右侧区域 end -->

    <!-- 头部操作按钮区域 end -->
  </div>
  <!-- 操作区域 start -->
</template>
<script>
export default {
  props: {
    toolbars: {
      type: Array,
      default: () => [
        'save',
        'preview',
        'importJson',
        'exportJson',
        'exportCode',
        'reset',
        'close'
      ]
    },
    recordList: {
      type: Array,
      default: () => []
    },
    redoList: {
      type: Array,
      default: () => []
    },
    showToolbarsText: {
      type: Boolean,
      default: false
    },
    tableType: {
      type: String,
      default () {
        return ''
      }
    }
  }
}
</script>
