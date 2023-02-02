<template>
  <div
    :class="{
      'layout-width': ['grid', 'table', 'card', 'divider', 'html'].includes(
        record.type
      )
    }"
  >
    <!-- 标签Tabs布局 start -->
    <template v-if="record.type === 'tabs'">
      <div
        class="grid-box"
        :class="{ active: record.key === selectItem.key }"
        @click.stop="handleSelectItem(record)"
      >
        <a-tabs
          @change="(key) => { $emit('handleTabChange', key) }"
          class="grid-row"
          :default-active-key="tabSelectIndex"
          :tabBarGutter="record.options.tabBarGutter || null"
          :type="record.options.type"
          :size="record.options.size"
          :tabPosition="record.options.tabPosition"
          :animated="record.options.animated === '1' || record.options.animated"
        >
          <a-tab-pane
            v-for="(tabItem, index) in record.columns"
            :key="index"
            :tab="tabItem.label"
          >
            <div class="grid-col">
              <draggable
                tag="div"
                class="draggable-box"
                v-bind="{
                  group: 'form-draggable',
                  ghostClass: 'moving',
                  animation: 240,
                  handle: '.drag-move'
                }"
                v-model="tabItem.list"
                @start="$emit('dragStart', $event, tabItem.list)"
                @add="$emit('handleColAdd', $event, tabItem.list)"
              >
                <transition-group tag="div" name="list" class="list-main">
                  <layoutItem
                    class="drag-move"
                    v-for="item in tabItem.list"
                    :key="item.key + 'tab'"
                    :selectItem.sync="selectItem"
                    :startType="startType"
                    :record="item"
                    :config="config"
                    @handleSelectItem="handleSelectItem"
                    @handleColAdd="handleColAdd"
                    @handleCopy="handleCopy"
                    @handleShowRightMenu="handleShowRightMenu"
                    @handleDelete="$emit('handleDelete')"
                    @handlePaste="handlePaste"
                  />
                </transition-group>
              </draggable>
            </div>
          </a-tab-pane>
        </a-tabs>
        <div class="allSelect">
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handleCopy', Number(e.key)) } ">
              <a-menu-item key="0">复制整体</a-menu-item>
              <a-menu-item key="1">复制子组件</a-menu-item>
            </a-menu>
            <div
              class="copy"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="copy" />
            </div>
          </a-dropdown>
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handlePaste', Number(e.key)) }">
              <a-menu-item key="0">粘贴到上方</a-menu-item>
              <a-menu-item key="1">粘贴到子组件</a-menu-item>
              <a-menu-item key="2">粘贴到下方</a-menu-item>
            </a-menu>
            <div
              class="paste"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="snippets" />
            </div>
          </a-dropdown>
          <div
            class="delete"
            :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            @click.stop="$emit('handleDelete')"
          >
            <a-icon type="delete" />
          </div>
        </div>
      </div>
    </template>
    <!-- 标签Tabs布局 end -->
    <!-- 栅格布局 start -->
    <template v-else-if="record.type === 'grid'">
      <div
        class="grid-box"
        :class="{ active: record.key === selectItem.key }"
        @click.stop="handleSelectItem(record)"
      >
        <a-row
          class="grid-row"
          :gutter="Number(record.options.gutter)"
          style="display: flex; flex-flow: row wrap;"
        >
          <a-col
            class="grid-col"
            v-for="(colItem, idnex) in record.columns"
            :key="idnex"
            :span="colItem.span || 0"
          >
            <span style="position: absolute; left: -3px; top: -5px; z-index: 100;"><a-badge :count="idnex + 1 " :number-style="{ backgroundColor: '#1890FF' }" :overflow-count="999"/></span>
            <draggable
              tag="div"
              class="draggable-box"
              v-bind="{
                group: 'form-draggable',
                ghostClass: 'moving',
                animation: 240,
                handle: '.drag-move'
              }"
              v-model="colItem.list"
              @start="$emit('dragStart', $event, colItem.list)"
              @add="$emit('handleColAdd', $event, colItem.list)"
            >
              <transition-group tag="div" name="list" class="list-main">
                <layoutItem
                  class="drag-move"
                  v-for="item in colItem.list"
                  :key="item.key + 'col'"
                  :selectItem.sync="selectItem"
                  :startType="startType"
                  :record="item"
                  :config="config"
                  @handleSelectItem="handleSelectItem"
                  @handleColAdd="handleColAdd"
                  @handleCopy="handleCopy"
                  @handleShowRightMenu="handleShowRightMenu"
                  @handleDelete="$emit('handleDelete')"
                  @handlePaste="handlePaste"
                />
              </transition-group>
            </draggable>
          </a-col>
        </a-row>
        <div class="allSelect">
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handleCopy', Number(e.key)) } ">
              <a-menu-item key="0">复制整体</a-menu-item>
            </a-menu>
            <div
              class="copy"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="copy" />
            </div>
          </a-dropdown>
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handlePaste', Number(e.key)) }">
              <a-menu-item key="0">粘贴到上方</a-menu-item>
              <a-menu-item key="2">粘贴到下方</a-menu-item>
            </a-menu>
            <div
              class="paste"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="snippets" />
            </div>
          </a-dropdown>
          <div
            class="delete"
            :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            @click.stop="$emit('handleDelete')"
          >
            <a-icon type="delete" />
          </div>
        </div>
      </div>
    </template>
    <!-- 栅格布局 end -->
    <!-- 卡片布局 start -->
    <template v-else-if="record.type === 'card'">
      <div
        class="grid-box"
        :class="{ active: record.key === selectItem.key }"
        @click.stop="handleSelectItem(record)"
      >
        <a-card class="grid-row" :bordered="record.bordered === '1'">
          <a-row slot="title" v-if="record.label">
            <a-col :span="19">{{ record.label }}</a-col>
            <a-col :span="5" style="text-align: right"><a-button size="small" v-if="record.addShow === '1'">添加</a-button></a-col>
          </a-row>
          <div class="grid-col">
            <draggable
              tag="div"
              class="draggable-box"
              v-bind="{
                group: 'form-draggable',
                ghostClass: 'moving',
                animation: 240,
                handle: '.drag-move'
              }"
              v-model="record.list"
              @start="$emit('dragStart', $event, record.list)"
              @add="$emit('handleColAdd', $event, record.list)"
            >
              <transition-group tag="div" name="list" class="list-main">
                <layoutItem
                  class="drag-move"
                  v-for="item in record.list"
                  :key="item.key + 'card'"
                  :selectItem.sync="selectItem"
                  :startType="startType"
                  :record="item"
                  :config="config"
                  @handleSelectItem="handleSelectItem"
                  @handleColAdd="handleColAdd"
                  @handleCopy="handleCopy"
                  @handleShowRightMenu="handleShowRightMenu"
                  @handleDelete="$emit('handleDelete')"
                  @handlePaste="handlePaste"
                />
              </transition-group>
            </draggable>
          </div>
        </a-card>
        <div class="allSelect">
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handleCopy', Number(e.key)) } ">
              <a-menu-item key="0">复制整体</a-menu-item>
              <a-menu-item key="1">复制子组件</a-menu-item>
            </a-menu>
            <div
              class="copy"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="copy" />
            </div>
          </a-dropdown>
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handlePaste', Number(e.key)) }">
              <a-menu-item key="0">粘贴到上方</a-menu-item>
              <a-menu-item key="1">粘贴到子组件</a-menu-item>
              <a-menu-item key="2">粘贴到下方</a-menu-item>
            </a-menu>
            <div
              class="paste"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="snippets" />
            </div>
          </a-dropdown>
          <div
            class="delete"
            :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            @click.stop="$emit('handleDelete')"
          >
            <a-icon type="delete" />
          </div>
        </div>
      </div>
    </template>
    <!-- 卡片布局 end -->
    <!-- 表格布局 start -->
    <template v-else-if="record.type === 'table'">
      <div
        class="table-box"
        :class="{ active: record.key === selectItem.key }"
        @click.stop="handleSelectItem(record)"
      >
        <table
          class="table-layout kk-table-9136076486841527"
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
              v-for="(tdItem, tdIndex) in trItem.tds"
              v-show="Number(tdItem.colspan) && Number(tdItem.rowspan)"
              :key="tdIndex"
              :colspan="tdItem.colspan"
              :rowspan="tdItem.rowspan"
              :style="tdItem.middle ? { verticalAlign: 'middle' } : {}"
              @contextmenu.prevent="
                $emit('handleShowRightMenu', $event, record, trIndex, tdIndex)
              "
            >
              <draggable
                tag="div"
                class="draggable-box"
                v-bind="{
                  group: 'form-draggable',
                  ghostClass: 'moving',
                  animation: 240,
                  handle: '.drag-move'
                }"
                v-model="tdItem.list"
                @start="$emit('dragStart', $event, tdItem.list)"
                @add="$emit('handleColAdd', $event, tdItem.list)"
              >
                <transition-group tag="div" name="list" class="list-main">
                  <layoutItem
                    class="drag-move"
                    v-for="item in tdItem.list"
                    :key="item.key + 'table'"
                    :selectItem.sync="selectItem"
                    :startType="startType"
                    :record="item"
                    :config="config"
                    @handleSelectItem="handleSelectItem"
                    @handleColAdd="handleColAdd"
                    @handleCopy="handleCopy"
                    @handleShowRightMenu="handleShowRightMenu"
                    @handleDelete="$emit('handleDelete')"
                    @handlePaste="handlePaste"
                  />
                </transition-group>
              </draggable>
            </td>
          </tr>
        </table>
        <div class="allSelect">
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handleCopy', Number(e.key)) } ">
              <a-menu-item key="0">复制整体</a-menu-item>
              <a-menu-item key="1">复制子组件</a-menu-item>
            </a-menu>
            <div
              class="copy"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="copy" />
            </div>
          </a-dropdown>
          <a-dropdown>
            <a-menu slot="overlay" @click="(e) => { $emit('handlePaste', Number(e.key)) }">
              <a-menu-item key="0">粘贴到上方</a-menu-item>
              <a-menu-item key="1">粘贴到子组件</a-menu-item>
              <a-menu-item key="2">粘贴到下方</a-menu-item>
            </a-menu>
            <div
              class="paste"
              :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            >
              <a-icon type="snippets" />
            </div>
          </a-dropdown>
          <div
            class="delete"
            :class="record.key === selectItem.key ? 'active' : 'unactivated'"
            @click.stop="$emit('handleDelete')"
          >
            <a-icon type="delete" />
          </div>
        </div>
      </div>
    </template>
    <!-- 表格布局 end -->
    <template v-else>
      <formNode
        :key="record.key"
        :selectItem.sync="selectItem"
        :record="record"
        :config="config"
        @handleSelectItem="handleSelectItem"
        @handleCopy="handleCopy"
        @handleDelete="$emit('handleDelete')"
        @handleShowRightMenu="$emit('handleShowRightMenu')"
        @handlePaste="handlePaste"
      />
    </template>
  </div>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 使用递归组件调用自己，生成布局结构及表单
 */
import draggable from 'vuedraggable'
import formNode from './formNode'
export default {
  name: 'LayoutItem',
  props: {
    tabSelectIndex: {
      type: Number,
      default: 0
    },
    record: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    startType: {
      type: String,
      required: true
    }
  },
  components: {
    formNode,
    draggable
  },
  inject: ['getSelectItem'],
  computed: {
    selectItem () {
      return this.getSelectItem()
    }
  },
  methods: {
    handleShowRightMenu (e, record, trIndex, tdIndex) {
      this.$emit('handleShowRightMenu', e, record, trIndex, tdIndex)
    },
    handlePaste (e) {
      this.$emit('handlePaste', e)
    },
    handleCopy (e) {
      this.$emit('handleCopy', e)
    },
    handleSelectItem (record) {
      this.$emit('handleSelectItem', record)
    },
    handleColAdd (e, list) {
      this.$emit('handleColAdd', e, list)
    }
  }
}
</script>
