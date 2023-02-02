<template>
  <a-spin :spinning="saveLoading" class="saveSpin">
    <a-layout class="container">
      <a-layout-sider
        collapsible
        :trigger="null"
        v-model="collapsedLeft"
        collapsedWidth="0"
        width="250"
        theme="light"
        class="select-area"
        style="overflow: hidden"
      >
        <a-layout-header class="header-option" style="width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 4px;">
          <span :title="params.workflow_name">
            <a-icon type="edit" style="margin: 0 10px;"/>流程: {{ params.workflow_name }}
          </span>
        </a-layout-header>
        <a-card size="small" title="工具" :bodyStyle="{ paddingBottom: '0px'}">
          <div style="padding-left: 5px;">
            <a-list :grid="{ gutter: 8, column: 1 }" v-if="tag.toolShow">
              <a-list-item>
                <a-button-group>
                  <a-button
                    v-for="(tool, index) in field.tools"
                    :key="index"
                    :icon="tool.icon"
                    :type="currentTool.type == tool.type ? 'primary': 'default'"
                    @click="selectTool(tool.type)"
                    size="small">{{ tool.name }}</a-button>
                </a-button-group>
              </a-list-item>
            </a-list>
          </div>
        </a-card>
        <a-card size="small" title="基础节点" :bodyStyle="{ paddingBottom: '0px'}">
          <div align="center">
            <a-list :grid="{ gutter: 8, column: 1 }" v-if="tag.commonNodeShow">
              <a-list-item v-for="(commonNode, index) in field.commonNodes" :key="index">
                <div class="node-item" :type="commonNode.type" belongto="commonNodes">
                  <a-icon :component="icon[commonNode.icon]" /> {{ commonNode.nodeName }}
                </div>
              </a-list-item>
            </a-list>
          </div>
        </a-card>
        <a-card size="small" title="高级节点" :bodyStyle="{ paddingBottom: '0px'}">
          <div align="center">
            <a-list :grid="{ gutter: 8, column: 1 }" v-if="tag.highNodeShow">
              <a-list-item v-for="(highNode, index) in field.highNodes" :key="index">
                <div class="node-item" :type="highNode.type" belongto="highNodes">
                  <a-icon :component="icon[highNode.icon]" /> {{ highNode.nodeName }}
                </div>
              </a-list-item>
            </a-list>
          </div>
        </a-card>
        <a-card size="small" title="泳道" :bodyStyle="{ paddingBottom: '0px'}">
          <div align="center">
            <a-list :grid="{ gutter: 8, column: 1 }" v-if="tag.laneNodeShow">
              <a-list-item v-for="(laneNode, index) in field.laneNodes" :key="index">
                <div class="node-item" :type="laneNode.type" belongto="laneNodes">
                  <a-icon :component="icon[laneNode.icon]" /> {{ laneNode.nodeName }}
                </div>
              </a-list-item>
            </a-list>
          </div>
        </a-card>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="header-option" style="display: flex;">
          <div style="flex: 1">
            <a-tooltip :title="collapsedLeft ? '展开左侧面板' : '折叠左侧面板'" placement="bottom">
              <a-button @click="()=> collapsedLeft = !collapsedLeft" class="header-option-button" size="small" :icon="collapsedLeft ? 'menu-unfold' : 'menu-fold'"></a-button>
            </a-tooltip>
            <a-tooltip title="保存流程" placement="bottom">
              <a-button class="mybutton" @click="saveFlow" size="small" type="primary">保存</a-button>
            </a-tooltip>
            <a-popconfirm title="您确认要清空流程吗？" placement="bottom" okText="确认" cancelText="取消" @confirm="clear">
              <a-tooltip title="清空流程" placement="bottom">
                <a-button class="mybutton" size="small">清空</a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip title="刷新流程" placement="bottom">
              <a-button class="mybutton" @click="refresh" size="small">刷新</a-button>
            </a-tooltip>
            <a-tooltip :title="flowData.config.showGridText" placement="bottom">
              <a-button class="mybutton" @click="toggleShowGrid" size="small" :icon="flowData.config.showGridIcon">网格</a-button>
            </a-tooltip>
            <a-tooltip title="设置" placement="bottom" v-if="0">
              <a-button class="mybutton" @click="setting" size="small" >设置</a-button>
            </a-tooltip>
            <a-tooltip title="快捷键" placement="bottom">
              <a-button class="mybutton" @click="shortcutHelper" size="small" >快捷键</a-button>
            </a-tooltip>
            <a-popconfirm title="您确认要退出设计吗？" placement="bottom" okText="确认" cancelText="取消" @confirm="exit">
              <a-tooltip title="退出设计" placement="bottom">
                <a-button class="mybutton" size="small">退出</a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-select class="mybutton" v-model="zoom" style="width: 70px" size="small" @change="setZoom">
              <a-select-option v-for="index of 16" :key="index" :value="index*10+40">{{ index*10+40 }}</a-select-option>
            </a-select>
            <a-button size="small" icon="zoom-in" @click="setMyZoom('enlarge')"></a-button>
            <a-button class="mybutton" size="small" icon="zoom-out" @click="setMyZoom('narrow')"></a-button>
          </div>
        </a-layout-header>
        <a-layout-content class="content">
          <flow-area
            ref="flowArea"
            :browserType="browserType"
            :flowData="flowData"
            :select.sync="currentSelect"
            :selectGroup.sync="currentSelectGroup"
            :plumb="plumb"
            :currentTool="currentTool"
            @ok="getCurrentSelect"
            @findNodeConfig="findNodeConfig"
            @selectTool="selectTool"
            @getShortcut="getShortcut"
            @saveFlow="saveFlow">
          </flow-area>
          <vue-context-menu :contextMenuData="linkContextMenuData" @deleteLink="deleteLink">
          </vue-context-menu>

        </a-layout-content>
      </a-layout>
      <flow-attr
        ref="flowAttr"
        :key="flowIdx"
        :plumb="plumb"
        :flowData="flowData"
        :workflowId="params.workflow_id"
        :select="currentSelect"
        @ok="editCurrentSelect"
        @close="onClose"
      ></flow-attr>
      <a-modal
        :title="'流程设计图_' + flowData.attr.id + '.png'"
        centered
        width="90%"
        :closable="flowPicture.closable"
        :maskClosable="flowPicture.maskClosable"
        :visible="flowPicture.modalVisible"
        okText="下载到本地"
        cancelText="取消"
        @ok="downLoadFlowPicture"
        @cancel="cancelDownLoadFlowPicture">
        <div align="center">
          <img :src="flowPicture.url" />
        </div>
      </a-modal>
      <setting-modal ref="settingModal"></setting-modal>
      <shortcut-modal ref="shortcutModal"></shortcut-modal>
      <test-modal ref="testModal" @loadFlow="loadFlow"></test-modal>
    </a-layout>
  </a-spin>
</template>
<script>
import jsplumb from 'jsplumb'
import { tools, commonNodes, highNodes, laneNodes } from './config/basic-node-config.js'
import { flowConfig } from './config/args-config.js'
import { startSvg, endSvg, commonSvg, freedomSvg, gatewaySvg, eventSvg, childFlowSvg, xLaneSvg, yLaneSvg, lanePoolSvg, userSvg, clockSvg, automaticSvg } from './config/basic-icon-config.js'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/draggable'
import 'jquery-ui/ui/widgets/droppable'
import 'jquery-ui/ui/widgets/resizable'
import html2canvas from 'html2canvas'
import canvg from 'canvg'
import { ZFSN } from './util/ZFSN.js'
import FlowArea from './modules/FlowArea'

export default {
  name: 'Vfd',
  components: {
    jsplumb,
    flowConfig,
    html2canvas,
    canvg,
    FlowArea,
    FlowAttr: () => import('./modules/FlowAttr'),
    SettingModal: () => import('./modules/SettingModal'),
    ShortcutModal: () => import('./modules/ShortcutModal'),
    TestModal: () => import('./modules/TestModal')
  },
  props: {
    params: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  mounted () {
    this.shortcutEnabled = true
    const that = this
    that.dealCompatibility()
    that.initNodeSelectArea()
    that.initJsPlumb()
    that.listenShortcut()
    that.initFlow()
    // that.listenPage()
    // 初始化流程数据
    // const str = '{"nodeList":[{"type":"start","nodeName":"开始","icon":"StartIcon","id":"start-ffb37f3ec19d451e80396b237c2480b3","height":50,"x":3335,"width":50,"y":3110},{"type":"end","nodeName":"结束","icon":"EndIcon","id":"end-a2ebf41194da4e3a829938bce78358fc","height":50,"x":3720,"width":50,"y":3155},{"type":"gateway2","nodeName":"并行分支","icon":"GatewayIcon","id":"gateway2-2771a94f18884b5d8ec5e366bb504897","height":50,"x":3715,"width":50,"y":3250},{"type":"gateway1","nodeName":"显示条件分支","icon":"GatewayIcon","id":"gateway1-6d9cc17b4ca944aa8f0abcab020755ab","height":50,"x":3590,"width":50,"y":3115},{"type":"gateway4","nodeName":"隐式条件分支","icon":"GatewayIcon","id":"gateway4-6bda68b018e94592bf53b936734c7eb8","height":50,"x":3450,"width":50,"y":3260},{"type":"gateway3","nodeName":"并行汇聚","icon":"GatewayIcon","id":"gateway3-184eb13045e9490e9202219e71593377","height":50,"x":3450,"width":50,"y":3120}],"linkList":[],"attr":{"id":"flow-0f9dde4a70614da78c5d777e9d2a2252"},"config":{"showGrid":true,"showGridText":"隐藏网格","showGridIcon":"eye"},"status":"1","remarks":[]}'
    if (this.params.flow) {
      that.loadFlow(this.params.flow)
    }
  },
  destroyed () {
    // 页面销毁后要把快捷键取消掉，防止报错，待完善
    this.shortcutEnabled = false
    console.log('页面销毁了')
  },
  data () {
    return {
      shortcutEnabled: true,
      flowIdx: 0,
      collapsedLeft: false,
      collapsedRight: false,
      saveLoading: false,
      zoom: 100, // 画布显示比例
      tag: {
        checked0: true,
        checked1: true,
        checked2: true,
        checked3: true,
        toolShow: true,
        commonNodeShow: true,
        highNodeShow: true,
        laneNodeShow: true
      },
      icon: {
        StartIcon: { template: startSvg },
        EndIcon: { template: endSvg },
        CommonIcon: { template: commonSvg },
        FreedomIcon: { template: freedomSvg },
        GatewayIcon: { template: gatewaySvg },
        EventIcon: { template: eventSvg },
        ChildFlowIcon: { template: childFlowSvg },
        XLaneIcon: { template: xLaneSvg },
        YLaneIcon: { template: yLaneSvg },
        LanePoolIcon: { template: lanePoolSvg },
        UserIcon: { template: userSvg },
        CockIcon: { template: clockSvg },
        AutomaticIcon: { template: automaticSvg }
      },
      browserType: 3,
      plumb: {},
      field: {
        tools: tools,
        commonNodes: commonNodes,
        highNodes: highNodes,
        laneNodes: laneNodes
      },
      flowData: {
        nodeList: [],
        linkList: [],
        attr: {
          id: ''
        },
        config: {
          showGrid: true,
          showGridText: '隐藏网格',
          showGridIcon: 'eye'
        },
        status: flowConfig.flowStatus.CREATE,
        remarks: '',
        params: this.params
      },
      currentTool: {
        type: 'drag',
        icon: 'drag',
        name: '拖拽'
      },
      currentSelect: {},
      currentIndex: -1,
      currentSelectGroup: [],
      activeShortcut: true,
      linkContextMenuData: flowConfig.contextMenu.link,
      flowPicture: {
        url: '',
        modalVisible: false,
        closable: true,
        maskClosable: true
      }
    }
  },
  methods: {
    toggleNodeShow0 (flag) {
      if (!flag) {
        this.tag.toolShow = false
      } else {
        this.tag.toolShow = true
      }
    },
    toggleNodeShow1 (flag) {
      if (!flag) {
        this.tag.commonNodeShow = false
      } else {
        this.tag.commonNodeShow = true
      }
    },
    toggleNodeShow2 (flag) {
      if (!flag) {
        this.tag.highNodeShow = false
      } else {
        this.tag.highNodeShow = true
      }
    },
    toggleNodeShow3 (flag) {
      if (!flag) {
        this.tag.laneNodeShow = false
      } else {
        this.tag.laneNodeShow = true
      }
    },
    getBrowserType () {
      const userAgent = navigator.userAgent
      const isOpera = userAgent.indexOf('Opera') > -1
      if (isOpera) {
        return 1
      };
      if (userAgent.indexOf('Firefox') > -1) {
        return 2
      }
      if (userAgent.indexOf('Chrome') > -1) {
        return 3
      }
      if (userAgent.indexOf('Safari') > -1) {
        return 4
      }
      if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
        alert('IE浏览器支持性较差，推荐使用Firefox或Chrome')
        return 5
      }
      if (userAgent.indexOf('Trident') > -1) {
        alert('Edge浏览器支持性较差，推荐使用Firefox或Chrome')
        return 6
      };
    },
    dealCompatibility () {
      const that = this

      that.browserType = that.getBrowserType()
      if (that.browserType === 2) {
        flowConfig.shortcut.scaleContainer = {
          code: 16,
          codeName: 'SHIFT(chrome下为ALT)',
          shortcutName: '画布缩放'
        }
      }
    },
    initJsPlumb () {
      const that = this

      // eslint-disable-next-line no-undef
      that.plumb = jsPlumb.getInstance(flowConfig.jsPlumbInsConfig)
      // 当下面两个参数全部设置为true时，连线可以重新连接到其他节点
      that.plumb.importDefaults({
        ConnectionsDetachable: false,
        ReattachConnections: false
      })
      that.plumb.bind('beforeDrop', function (info) {
        const sourceId = info.sourceId
        const targetId = info.targetId

        if (sourceId === targetId) return false
        const filter = that.flowData.linkList.filter(link => (link.sourceId === sourceId && link.targetId === targetId))
        if (filter.length > 0) {
          that.$message.error('同方向的两节点连线只能有一条！')
          return false
        }
        return true
      })
      // 节点连线事件
      that.plumb.bind('connection', function (conn, e) {
        const connObj = conn.connection.canvas
        const o = {}; let id; let label
        if (that.flowData.status === flowConfig.flowStatus.CREATE || that.flowData.status === flowConfig.flowStatus.MODIFY) {
          id = 'link-' + ZFSN.getId()
          label = ''
        } else if (that.flowData.status === flowConfig.flowStatus.LOADING) {
          const l = that.flowData.linkList[that.flowData.linkList.length - 1]
          id = l.id
          label = l.label
        }
        connObj.id = id
        o.type = 'link'
        o.id = id
        o.sourceId = conn.sourceId
        o.targetId = conn.targetId
        o.label = label
        o.cls = {
          linkType: flowConfig.jsPlumbInsConfig.Connector[0],
          linkColor: flowConfig.jsPlumbInsConfig.PaintStyle.stroke,
          linkThickness: flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth
        }
        $('#' + id).bind('contextmenu', function (e) {
          that.showLinkContextMenu(e)
          that.currentSelect = that.flowData.linkList.filter(l => l.id === id)[0]
        })
        // 阻止事件冒泡
        $('#' + id).bind('click', function (e) {
          const event = window.event || e
          event.stopPropagation()
        })
        $('#' + id).bind('dblclick', function (e) {
          const event = window.event || e
          event.stopPropagation()
          that.currentSelect = that.flowData.linkList.filter(l => l.id === id)[0]
          that.flowData.linkList.forEach((l, i) => {
            if (l.id === id) {
              that.currentIndex = i
            }
          })
          that.flowIdx = that.flowIdx === 0 ? 1 : 0
          that.$nextTick(() => {
            that.shortcutEnabled = false
            that.$refs.flowAttr.show()
          })
        })
        if (that.flowData.status !== flowConfig.flowStatus.LOADING) that.flowData.linkList.push(o)
      })
      ZFSN.consoleLog(['实例化JsPlumb成功...'])
    },
    initNodeSelectArea () {
      $(document).ready(function () {
        $('.node-item').draggable({
          opacity: flowConfig.defaultStyle.dragOpacity,
          helper: 'clone',
          cursorAt: {
            top: 16,
            left: 60
          },
          containment: 'window',
          revert: 'invalid'
        })
        ZFSN.consoleLog(['初始化节点选择列表成功...'])
      })
    },
    listenShortcut () {
      const routeName = this.$route.fullPath
      const that = this
      // 启用画布拖拽功能
      that.$refs.flowArea.container.dragFlag = true
      // 启用画面绽放功能
      // that.$refs.flowArea.container.scaleFlag = true
      document.onkeydown = function (e) {
        if (that.$route.fullPath === routeName && that.shortcutEnabled) {
          const event = window.event || e

          if (!that.activeShortcut) return
          const key = event.keyCode

          switch (key) {
            case flowConfig.shortcut.multiple.code:
              that.$refs.flowArea.rectangleMultiple.flag = true
              break
            case flowConfig.shortcut.dragContainer.code:
            // that.$refs.flowArea.container.dragFlag = true
              break
            case flowConfig.shortcut.scaleContainer.code:
            // that.$refs.flowArea.container.scaleFlag = true
              break
            case flowConfig.shortcut.dragTool.code:
              that.selectTool('drag')
              break
            case flowConfig.shortcut.connTool.code:
              that.selectTool('connection')
              break
            case flowConfig.shortcut.zoomInTool.code:
              that.selectTool('zoom-in')
              break
            case flowConfig.shortcut.zoomOutTool.code:
              that.selectTool('zoom-out')
              break
            case 37:
              that.moveNode('left')
              break
            case 38:
              that.moveNode('up')
              break
            case 39:
              that.moveNode('right')
              break
            case 40:
              that.moveNode('down')
              break
          }

          if (event.ctrlKey) {
            if (event.altKey) {
              switch (key) {
                case flowConfig.shortcut.settingModal.code:
                  that.setting()
                  break
                case flowConfig.shortcut.testModal.code:
                  that.openTest()
                  break
              }
            }
          }
        }
      }
      document.onkeyup = function (e) {
        if (that.$route.fullPath === routeName && that.shortcutEnabled) {
          const event = window.event || e

          const key = event.keyCode
          if (key === flowConfig.shortcut.dragContainer.code) {
          // that.$refs.flowArea.container.dragFlag = false
          } else if (key === flowConfig.shortcut.scaleContainer.code) {
          // event.preventDefault()
          // that.$refs.flowArea.container.scaleFlag = false
          } else if (key === flowConfig.shortcut.multiple.code) {
            that.$refs.flowArea.rectangleMultiple.flag = false
          }
        }
      }

      ZFSN.consoleLog(['初始化快捷键成功...'])
    },
    listenPage () {
      window.onbeforeunload = function (e) {
        e = e || window.event
        if (e) {
          e.returnValue = '关闭提示'
        }
        return '关闭提示'
      }
    },
    initFlow () {
      const that = this

      if (that.flowData.status === flowConfig.flowStatus.CREATE) {
        that.flowData.attr.id = 'flow-' + ZFSN.getId()
      } else {
        that.loadFlow()
      }
      ZFSN.consoleLog(['初始化流程图成功...'])
    },
    loadFlow (json) {
      console.log('要加载的数据', json)
      const that = this

      that.clear()
      const loadData = JSON.parse(json)
      that.flowData.attr = loadData.attr
      that.flowData.config = loadData.config
      that.flowData.status = flowConfig.flowStatus.LOADING
      that.plumb.batch(function () {
        const nodeList = loadData.nodeList
        nodeList.forEach(function (node, index) {
          that.flowData.nodeList.push(node)
        })
        const linkList = loadData.linkList
        that.$nextTick(() => {
          linkList.forEach(function (link, index) {
            that.flowData.linkList.push(link)
            let linkChange = false
            const start = link.sourceId.split('-')[0]
            const end = link.targetId.split('-')[0]
            if (start.includes('transition') && end.includes('transition')) {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            } else if (start.includes('transition') && end === 'gateway4') {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            } else if (start.includes('transition') && end === 'gateway3') {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            } else if (start === 'gateway5' && end.includes('transition')) {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            } else if (start === 'gateway1' && end.includes('transition')) {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            } else if (start === 'gateway2' && end.includes('transition')) {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            } else if (start === 'start' || end === 'end') {
              link.cls.linkColor = '#722ed1'
              linkChange = true
            }
            const conn = that.plumb.connect({
              source: link.sourceId,
              target: link.targetId,
              anchor: flowConfig.jsPlumbConfig.anchor.default,
              connector: [
                link.cls.linkType,
                {
                  gap: 0,
                  cornerRadius: 3,
                  stub: 0
                }
              ],
              paintStyle: {
                stroke: link.disabled ? '#d9d9d9' : '#52c41a',
                strokeWidth: link.cls.linkThickness,
                dashstyle: linkChange ? '' : '1'
              }
            })
            if (link.label !== '' || link.arcCondition && link.arcCondition.html || link.arcEvent && link.arcEvent.html) {
              const label = (link.label ? `<span style="color: #FFF; background: #d4b106; padding: 2px 5px ; border: 1px solid #d4b106; border-radius: 10%">${link.label}</span>` : '') + (link.arcCondition && link.arcCondition.html ? '&nbsp;<span style="color: #FFF; background: #722ED1; padding: 2px 5px ; border: 1px solid #722ED1; border-radius: 10%">条件</span>' : '') + (link.arcEvent && link.arcEvent.html ? '&nbsp;<span style="color: #FFF; background: #3f6600; padding: 2px 5px ; border: 1px solid #3f6600; border-radius: 10%">事件</span>' : '')
              if (conn) {
                conn.setLabel({
                  label: label,
                  cssClass: 'linkLabel'
                })
              }
            }
          })
          that.currentSelect = {}
          that.currentSelectGroup = []
          that.flowData.status = flowConfig.flowStatus.MODIFY
        })
      }, true)
      const canvasSize = that.computeCanvasSize()
      that.$refs.flowArea.container.pos = {
        top: -canvasSize.minY + 100,
        left: -canvasSize.minX + 100
      }
    },
    findNodeConfig (belongto, type, callback) {
      let node = null
      switch (belongto) {
        case 'commonNodes':
          node = commonNodes.filter(n => n.type === type)
          break
        case 'highNodes':
          node = highNodes.filter(n => n.type === type)
          break
        case 'laneNodes':
          node = laneNodes.filter(n => n.type === type)
          break
      }
      if (node && node.length >= 0) node = node[0]
      callback(node)
    },
    selectTool (type) {
      const tool = tools.filter(t => t.type === type)
      if (tool && tool.length > 0) {
        this.currentTool = tool[0]
      }
      switch (type) {
        case 'drag':
          this.changeToDrag()
          break
        case 'connection':
          this.changeToConnection()
          break
      }
    },
    changeToDrag () {
      const that = this

      that.flowData.nodeList.forEach(function (node, index) {
        const f = that.plumb.toggleDraggable(node.id)
        if (!f) {
          that.plumb.toggleDraggable(node.id)
        }
        if (node.type !== 'x-lane' && node.type !== 'y-lane') {
          that.plumb.unmakeSource(node.id)
          that.plumb.unmakeTarget(node.id)
        }
      })
    },
    changeToConnection () {
      const that = this

      that.flowData.nodeList.forEach(function (node, index) {
        const f = that.plumb.toggleDraggable(node.id)
        if (f) {
          that.plumb.toggleDraggable(node.id)
        }
        // if (node.type !== 'x-lane' && node.type !== 'y-lane') {
        //   that.plumb.makeSource(node.id, flowConfig.jsPlumbConfig.makeSourceConfig)
        //   that.plumb.makeTarget(node.id, flowConfig.jsPlumbConfig.makeTargetConfig)
        // }
        that.plumb.unmakeSource(node.id)
        that.plumb.unmakeTarget(node.id)
        that.plumb.makeSource(node.id, flowConfig.jsPlumbConfig.makeSourceConfig)
        that.plumb.makeTarget(node.id, flowConfig.jsPlumbConfig.makeTargetConfig)
      })

      that.currentSelect = {}
      that.currentSelectGroup = []
    },
    checkFlow () {
      const that = this
      const nodeList = that.flowData.nodeList

      if (nodeList.length <= 0) {
        this.$message.error('流程图中无任何节点！')
        return false
      }
      return true
    },
    // 保存流程数据
    saveFlow () {
      const that = this
      const flowObj = Object.assign({}, that.flowData)
      this.saveLoading = true
      if (!that.checkFlow()) return
      flowObj.status = flowConfig.flowStatus.SAVE
      flowObj.params = ''
      const d = JSON.stringify(flowObj)
      this.$emit('saveFlow', d)
    },
    // 刷新流程
    refresh () {
      const that = this
      const flowObj = Object.assign({}, that.flowData)

      if (!that.checkFlow()) return
      flowObj.status = flowConfig.flowStatus.SAVE
      flowObj.params = ''
      const d = JSON.stringify(flowObj)
      that.clear()
      this.$message.info('流程图清空后将会重新绘制，请稍候……')
      setTimeout(() => {
        // 如果不延时绘制，界面将会报错
        this.loadFlow(d)
      }, 1500)
    },
    exportFlowPicture () {
      const that = this

      if (!that.checkFlow()) return

      const $Container = that.$refs.flowArea.$el.children[0]
      const svgElems = $($Container).find('svg[id^="link-"]')
      const removeArr = []

      svgElems.each(function (index, svgElem) {
        const linkCanvas = document.createElement('canvas')
        const canvasId = 'linkCanvas-' + ZFSN.getId()
        linkCanvas.id = canvasId
        removeArr.push(canvasId)

        const svgContent = svgElem.outerHTML.trim()
        canvg(linkCanvas, svgContent)
        if (svgElem.style.position) {
          linkCanvas.style.position += svgElem.style.position
          linkCanvas.style.left += svgElem.style.left
          linkCanvas.style.top += svgElem.style.top
        }
        $($Container).append(linkCanvas)
      })

      const canvasSize = that.computeCanvasSize()

      const pbd = flowConfig.defaultStyle.photoBlankDistance
      const offsetPbd = ZFSN.div(pbd, 2)

      html2canvas($Container, {
        width: canvasSize.width + pbd,
        height: canvasSize.height + pbd,
        scrollX: -canvasSize.minX + offsetPbd,
        scrollY: -canvasSize.minY + offsetPbd,
        logging: false,
        onclone: function (args) {
          removeArr.forEach(function (id, index) {
            $('#' + id).remove()
          })
        }
      }).then(canvas => {
        const dataURL = canvas.toDataURL('image/png')
        that.flowPicture.url = dataURL
        that.flowPicture.modalVisible = true
      })
    },
    // 获取选中节点
    getCurrentSelect (index, currentSelect) {
      this.currentSelect = currentSelect
      this.currentIndex = index
      this.flowIdx = this.flowIdx === 0 ? 1 : 0
      this.$nextTick(() => {
        this.shortcutEnabled = false
        this.$refs.flowAttr.show()
      })
    },
    // 修改选中节点
    editCurrentSelect (currentSelect) {
      this.shortcutEnabled = true
      const that = this
      if (currentSelect.type === 'link') {
        this.flowData.linkList.splice(this.currentIndex, 1, currentSelect)
        const conn = that.plumb.getConnections({
          source: that.currentSelect.sourceId,
          target: that.currentSelect.targetId
        })[0]
        if (currentSelect.label !== '' || currentSelect.arcCondition && currentSelect.arcCondition.html || currentSelect.arcEvent && currentSelect.arcEvent.html) {
          const label = (currentSelect.label ? `<span style="color: #FFF; background: #d4b106; padding: 2px 5px ; border: 1px solid #d4b106; border-radius: 10%">${currentSelect.label}</span>` : '') + (currentSelect.arcCondition && currentSelect.arcCondition.html ? '&nbsp;<span style="color: #FFF; background: #722ED1; padding: 2px 5px ; border: 1px solid #722ED1; border-radius: 10%">条件</span>' : '') + (currentSelect.arcEvent && currentSelect.arcEvent.html ? '&nbsp;<span style="color: #FFF; background: #3f6600; padding: 2px 5px ; border: 1px solid #3f6600; border-radius: 10%">事件</span>' : '')
          if (conn) {
            conn.setLabel({
              label: label,
              cssClass: 'linkLabel'
            })
          }
        } else {
          const labelOverlay = conn.getLabelOverlay()
          if (labelOverlay) conn.removeOverlay(labelOverlay.id)
        }
      } else {
        if (currentSelect.type === 'transition1' || currentSelect.type === 'transition2' || currentSelect.type === 'transition3') {
          this.flowData.nodeList.forEach(item => {
            if (item.quoteId) {
              if (item.quoteId === currentSelect.id) {
                item.nodeName = currentSelect.nodeName
                if (currentSelect.newId) {
                  item.quoteId = currentSelect.newId
                  item.type = currentSelect.type
                }
              }
            }
          })
        }
        if (currentSelect.newId) {
          // 节点之间的连线
          this.flowData.linkList.forEach((link, index) => {
            if (link.sourceId === currentSelect.id) {
              link.sourceId = currentSelect.newId
            }
            if (link.targetId === currentSelect.id) {
              link.targetId = currentSelect.newId
            }
          })
          currentSelect.id = currentSelect.newId
          currentSelect.newId = undefined
        }
        this.flowData.nodeList.splice(this.currentIndex, 1, currentSelect)
        this.flowData.nodeList = JSON.parse(JSON.stringify(this.flowData.nodeList))
      }
    },
    // 弹窗消失
    onClose () {
      this.shortcutEnabled = true
    },
    downLoadFlowPicture () {
      const that = this
      const alink = document.createElement('a')
      const alinkId = 'alink-' + ZFSN.getId()
      alink.id = alinkId
      alink.href = that.flowPicture.url
      alink.download = '流程设计图_' + that.flowData.attr.id + '.png'
      alink.click()
    },
    cancelDownLoadFlowPicture () {
      this.flowPicture.url = ''
      this.flowPicture.modalVisible = false
    },
    computeCanvasSize () {
      const that = this
      const nodeList = Object.assign([], that.flowData.nodeList)
      let minX = nodeList[0].x
      let minY = nodeList[0].y
      let maxX = nodeList[0].x + nodeList[0].width
      let maxY = nodeList[0].y + nodeList[0].height
      nodeList.forEach(function (node, index) {
        minX = Math.min(minX, node.x)
        minY = Math.min(minY, node.y)
        maxX = Math.max(maxX, node.x + node.width)
        maxY = Math.max(maxY, node.y + node.height)
      })
      const canvasWidth = maxX - minX
      const canvasHeight = maxY - minY
      return {
        width: canvasWidth,
        height: canvasHeight,
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
      }
    },
    clear () {
      const that = this
      that.flowData.nodeList.forEach(function (node, index) {
        that.plumb.remove(node.id)
      })
      that.currentSelect = {}
      that.currentSelectGroup = []
      that.flowData.nodeList = []
      that.flowData.linkList = []
      that.flowData.remarks = ''
    },
    toggleShowGrid () {
      const flag = this.flowData.config.showGrid
      if (flag) {
        this.flowData.config.showGrid = false
        this.flowData.config.showGridText = '显示网格'
        this.flowData.config.showGridIcon = 'eye-invisible'
      } else {
        this.flowData.config.showGrid = true
        this.flowData.config.showGridText = '隐藏网格'
        this.flowData.config.showGridIcon = 'eye'
      }
    },
    setting () {
      this.$refs.settingModal.open()
    },
    shortcutHelper () {
      this.$refs.shortcutModal.open()
    },
    exit () {
      this.$emit('exit')
    },
    showLinkContextMenu (e) {
      const event = window.event || e

      event.preventDefault()
      event.stopPropagation()
      $('.vue-contextmenuName-flow-menu').css('display', 'none')
      $('.vue-contextmenuName-node-menu').css('display', 'none')
      const x = event.clientX
      const y = event.clientY
      this.linkContextMenuData.axis = { x, y }
    },
    deleteLink () {
      const that = this
      const sourceId = that.currentSelect.sourceId
      const targetId = that.currentSelect.targetId
      that.plumb.deleteConnection(that.plumb.getConnections({
        source: sourceId,
        target: targetId
      })[0])
      const linkList = that.flowData.linkList
      linkList.splice(linkList.findIndex(link => (link.sourceId === sourceId || link.targetId === targetId)), 1)
      that.currentSelect = {}
    },
    loseShortcut () {
      this.activeShortcut = false
    },
    getShortcut () {
      this.activeShortcut = true
    },
    openTest () {
      const that = this

      const flowObj = Object.assign({}, that.flowData)
      that.$refs.testModal.flowData = flowObj
      that.$refs.testModal.testVisible = true
    },
    moveNode (type) {
      const that = this

      let m = flowConfig.defaultStyle.movePx; let isX = true
      switch (type) {
        case 'left':
          m = -m
          break
        case 'up':
          m = -m
          isX = false
          break
        case 'right':
          break
        case 'down':
          isX = false
      }

      if (that.currentSelectGroup.length > 0) {
        that.currentSelectGroup.forEach(function (node, index) {
          if (isX) {
            node.x += m
          } else {
            node.y += m
          }
        })
        that.plumb.repaintEverything()
      } else if (that.currentSelect.id) {
        if (isX) {
          that.currentSelect.x += m
        } else {
          that.currentSelect.y += m
        }
        that.plumb.repaintEverything()
      }
    },
    setZoom (value) {
      this.$refs.flowArea.setZoom(value)
    },
    setMyZoom (type) {
      if (type === 'enlarge') {
        if (this.zoom < 200) {
          this.zoom += 10
        }
      } else if (type === 'narrow') {
        if (this.zoom > 50) {
          this.zoom -= 10
        }
      } else {
        this.zoom = 100
      }
      this.setZoom(this.zoom)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './style/flow-designer.scss';

.saveSpin {
  height: 100%;
  /deep/ .ant-spin-container {
     height: 100%;
  }
}
</style>
