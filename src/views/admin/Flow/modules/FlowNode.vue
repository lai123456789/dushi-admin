<template>
  <!-- 开始库所 -->
  <div
    v-if="node.type === 'start'"
    :id="node.id"
    class="common-circle-node start"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom-in' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    {{ node.nodeName }}
  </div>
  <!-- 结束库所 -->
  <div
    v-else-if="node.type === 'end'"
    :id="node.id"
    class="common-circle-node end"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom-in' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    {{ node.nodeName }} : {{ node.transition_status ? node.transition_status:'--' }}
  </div>
  <!-- 变迁 -->
  <div
    v-else-if="node.type === 'transition1' || node.type === 'transition2' ||node.type === 'transition3'"
    :id="node.id"
    class="common-rectangle-node"
    :class="{ active: isActive(), quote: node.quoteId!==undefined}"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom-in' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    <a-icon v-if="node.type === 'transition1'" type="user" class="node-icon" />
    <a-icon v-if="node.type === 'transition2'" type="clock-circle" class="node-icon" />
    <a-icon v-if="node.type === 'transition3'" type="setting" class="node-icon" />
    <a-icon v-if="node.conditionCallback && !node.quoteId" type="security-scan" style="color: #722ED1; position: absolute; top: 3px; right: 3px;"/>
    <a-icon v-if="node.callback && !node.quoteId" type="code" style="color: #722ED1; position: absolute; bottom: 3px; right: 3px;"/>
    <span v-if="node.sla_data && node.sla_data.length" style="color: #722ED1; position: absolute; top: 15px; left: 3px;">[SLA]</span>
    {{ node.nodeName }}
  </div>

  <div
    v-else-if="node.type === 'freedom'"
    :id="node.id"
    class="common-rectangle-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom-in' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    <a-icon type="sync" class="node-icon" />
    {{ node.nodeName }}
  </div>

  <div
    v-else-if="node.type === 'event'"
    :id="node.id"
    class="common-circle-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom-in' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    {{ node.nodeName }}
  </div>
  <!-- 网关 -->
  <div
    v-else-if="node.type==='gateway1' ||node.type==='gateway2' ||node.type==='gateway3' ||node.type==='gateway4' ||node.type==='gateway5'"
    :id="node.id"
    class="common-diamond-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    <span>{{ node.nodeName }}</span>
  </div>
  <!-- 子流程 -->
  <div
    v-else-if="node.type === 'child-flow'"
    :id="node.id"
    class="common-rectangle-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px',
              cursor: currentTool.type === 'drag' ? 'move' : (currentTool.type === 'connection' ? 'crosshair' :
                (currentTool.type === 'zoom-in' ? 'zoom-in' :
                  (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default'))) }"
    @click.stop="selectNode"
    @dblclick.stop="setCurrentSelect"
    @contextmenu.stop="showNodeContextMenu">
    <a-icon type="api" class="node-icon" />
    {{ node.nodeName }}
  </div>
  <!-- 横向泳道图 -->
  <div
    v-else-if="node.type === 'x-lane'"
    :id="node.id"
    class="common-x-lane-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px', height: node.height + 'px', width: node.width + 'px',
              cursor: currentTool.type === 'zoom-in' ? 'zoom-in' : (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default') }">
    <div
      class="lane-text-div"
      :style="{ cursor: currentTool.type === 'drag' ? 'move' : 'default' }"
      @click.stop="selectNode"
      @dblclick.stop="setCurrentSelect"
      @contextmenu.stop="showNodeContextMenu">
      <span class="lane-text">{{ node.nodeName }}</span>
    </div>
  </div>
  <!-- 纵向泳道图 -->
  <div
    v-else-if="node.type === 'y-lane'"
    :id="node.id"
    class="common-y-lane-node"
    :class="{ active: isActive() }"
    :style="{ top: node.y + 'px', left: node.x + 'px', height: node.height + 'px', width: node.width + 'px',
              cursor: currentTool.type === 'zoom-in' ? 'zoom-in' : (currentTool.type === 'zoom-out' ? 'zoom-out' : 'default') }">
    <div
      class="lane-text-div"
      :style="{ cursor: currentTool.type === 'drag' ? 'move' : 'default' }"
      @click.stop="selectNode"
      @dblclick.stop="setCurrentSelect"
      @contextmenu.stop="showNodeContextMenu">
      <span class="lane-text">{{ node.nodeName }}</span>
    </div>
  </div>

  <div v-else></div>
</template>

<script>
import jsplumb from 'jsplumb'
import { flowConfig } from '../config/args-config.js'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/draggable'
import 'jquery-ui/ui/widgets/droppable'
import 'jquery-ui/ui/widgets/resizable'
// eslint-disable-next-line no-unused-vars
import { ZFSN } from '../util/ZFSN.js'

export default {
// eslint-disable-next-line vue/require-prop-types
  props: ['select', 'selectGroup', 'node', 'plumb', 'currentTool'],
  components: {
    jsplumb
  },
  mounted () {
    this.registerNode()
  },
  data () {
    return {
      currentSelect: this.select,
      currentSelectGroup: this.selectGroup
    }
  },
  watch: {
    select (val) {
      this.currentSelect = val
    },
    currentSelect: {
      handler (val) {
        this.$emit('update:select', val)
      },
      deep: true
    },
    selectGroup (val) {
      this.currentSelectGroup = val
    },
    currentSelectGroup: {
      handler (val) {
        this.$emit('update:selectGroup', val)
      },
      deep: true
    }
  },
  methods: {
    registerNode () {
      const that = this
      that.plumb.draggable(that.node.id, {
        containment: 'parent',
        handle: function (e, el) {
          var possibles = el.parentNode.querySelectorAll('.common-circle-node,.common-rectangle-node,.common-diamond-node,.lane-text-div')
          for (var i = 0; i < possibles.length; i++) {
            if (possibles[i] === el || e.target.className === 'lane-text') return true
          }
          return false
        },
        grid: flowConfig.defaultStyle.alignGridPX,
        drag: function (e) {
          if (flowConfig.defaultStyle.isOpenAuxiliaryLine) {
            that.$emit('alignForLine', e)
          }
        },
        stop: function (e) {
          that.node.x = e.pos[0]
          that.node.y = e.pos[1]
          if (that.currentSelectGroup.length > 1) {
            that.$emit('updateNodePos')
          }
          that.$emit('hideAlignLine')
        }
      })

      if (that.node.type === 'x-lane' || that.node.type === 'y-lane') {
        $('#' + that.node.id).resizable({
          minHeight: 200,
          minWidth: 200,
          maxHeight: 2000,
          maxWidth: 2000,
          ghost: true,
          autoHide: true,
          stop: function (event, ui) {
            that.node.height = ui.size.height
            that.node.width = ui.size.width
          }
        })
      }
      that.currentSelect = that.node
      that.currentSelectGroup = []
    },
    selectNode () {
      const that = this
      that.currentSelect = this.node
      that.$emit('isMultiple', flag => {
        if (!flag) {
          that.currentSelectGroup = []
        } else {
          const f = that.currentSelectGroup.filter(s => s.id === that.node.id)
          if (f.length <= 0) {
            that.plumb.addToDragSelection(that.node.id)
            that.currentSelectGroup.push(that.node)
          }
        }
      }, this.currentSelect)
    },
    setCurrentSelect () {
      this.currentSelect = this.node
      this.$emit('ok', this.currentSelect)
    },
    showNodeContextMenu (e) {
      this.$emit('showNodeContextMenu', e)
      this.selectNode()
    },
    isActive () {
      const that = this
      if (that.currentSelect.id === that.node.id) return true
      const f = that.currentSelectGroup.filter(n => n.id === that.node.id)
      if (f.length > 0) return true
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/flow-node.scss';
</style>
