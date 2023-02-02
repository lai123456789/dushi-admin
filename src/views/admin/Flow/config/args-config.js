export const flowConfig = {
  jsPlumbInsConfig: {
    // 连线的类型
    Connector: [
      'Flowchart',
      {
        gap: 0,
        cornerRadius: 3,
        stub: 0
      }
    ],
    // 连线上面的箭头
    ConnectionOverlays: [
      [
        'Arrow',
        {
          width: 10,
          length: 10,
          location: 1
        }
      ]
    ],
    // 连线的样式
    PaintStyle: {
      stroke: '#52c41a',
      strokeWidth: 4
    },
    // 鼠标经过连线时的样式
    HoverPaintStyle: {
      stroke: '#1890ff',
      strokeWidth: 5
    },
    // 端点样式
    EndpointStyle: {
      fill: '#52c41a',
      stroke: '#52c41a',
      strokeWidth: 1,
      radius: 1
    },
    // 鼠标经过端点时样式
    EndpointHoverStyle: {
      fill: '#1890ff',
      radius: 2
    }
  },
  jsPlumbConfig: {
    anchor: {
      // 定义元素可以连接点的位置，当前定义上下左右四个点可以连接
      default: ['Bottom', 'Right', 'Top', 'Left']
    },
    makeSourceConfig: {
      filter: 'a',
      filterExclude: true,
      maxConnections: -1,
      endpoint: [ 'Dot', { radius: 7 } ],
      anchor: 'Continuous'
    },
    makeTargetConfig: {
      filter: 'a',
      filterExclude: true,
      maxConnections: -1,
      endpoint: [ 'Dot', { radius: 7 } ],
      anchor: 'Continuous'
    }
  },
  defaultStyle: {
    dragOpacity: 0.7,
    alignGridPX: [5, 5],
    alignSpacing: {
      level: 70,
      vertical: 70
    },
    alignDuration: 300,
    containerScale: {
      init: 1,
      min: 0.5,
      max: 3,
      onceNarrow: 0.1,
      onceEnlarge: 0.1
    },
    isOpenAuxiliaryLine: true,
    showAuxiliaryLineDistance: 20,
    movePx: 5,
    photoBlankDistance: 200
  },
  // ID的生成类型。1.uuid uuid 2.time_stamp 时间戳 3.sequence 序列 4.time_stamp_and_sequence 时间戳加序列 5.custom 自定义
  idType: 'uuid',
  flowStatus: {
    CREATE: '0',
    SAVE: '1',
    MODIFY: '2',
    LOADING: '3'
  },
  shortcut: {
    multiple: {
      code: 17,
      codeName: 'CTRL',
      shortcutName: '多选'
    },
    dragContainer: {
      code: 32,
      codeName: 'SPACE',
      shortcutName: '画布拖拽'
    },
    scaleContainer: {
      code: 18,
      codeName: 'ALT(firefox下为SHIFT)',
      shortcutName: '画布缩放'
    },
    dragTool: {
      code: 68,
      codeName: 'D',
      shortcutName: '拖拽工具'
    },
    connTool: {
      code: 69,
      codeName: 'E',
      shortcutName: '连线工具'
    },
    zoomInTool: {
      code: 190,
      codeName: '<',
      shortcutName: '放大工具'
    },
    zoomOutTool: {
      code: 188,
      codeName: '>',
      shortcutName: '缩小工具'
    },
    leftMove: {
      code: 37,
      codeName: '←',
      shortcutName: '左移'
    },
    upMove: {
      code: 38,
      codeName: '↑',
      shortcutName: '上移'
    },
    rightMove: {
      code: 39,
      codeName: '→',
      shortcutName: '右移'
    },
    downMove: {
      code: 40,
      codeName: '↓',
      shortcutName: '下移'
    },
    settingModal: {
      code: 83,
      codeName: 'CTRL+ALT+S',
      shortcutName: '打开设置页面'
    },
    testModal: {
      code: 84,
      codeName: 'CTRL+ALT+T',
      shortcutName: '打开测试页面'
    }
  },
  contextMenu: {
    container: {
      menuName: 'flow-menu',
      axis: {
        x: null,
        y: null
      },
      menulists: [
        {
          fnHandler: 'flowInfo',
          icoName: 'edit',
          btnName: '流程图信息'
        },
        {
          fnHandler: 'quote',
          icoName: 'edit',
          btnName: '复用'
        },
        {
          fnHandler: 'paste',
          icoName: 'edit',
          btnName: '粘贴'
        },
        {
          fnHandler: 'selectAll',
          icoName: 'edit',
          btnName: '全选'
        },
        {
          fnHandler: 'saveFlow',
          icoName: 'edit',
          btnName: '保存流程'
        },
        {
          iconName: 'edit',
          fnHandler: 'addRemark',
          btnName: '添加备注'
        },
        {
          icoName: 'edit',
          btnName: '对齐方式',
          children: [
            {
              icoName: 'edit',
              fnHandler: 'verticaLeft',
              btnName: '垂直左对齐'
            },
            {
              icoName: 'edit',
              fnHandler: 'verticalCenter',
              btnName: '垂直居中'
            },
            {
              icoName: 'edit',
              fnHandler: 'verticalRight',
              btnName: '垂直右对齐'
            },
            {
              icoName: 'edit',
              fnHandler: 'levelUp',
              btnName: '水平上对齐'
            },
            {
              icoName: 'edit',
              fnHandler: 'levelCenter',
              btnName: '水平居中'
            },
            {
              icoName: 'edit',
              fnHandler: 'levelDown',
              btnName: '水平下对齐'
            }
          ]
        }
      ]
    },
    node: {
      menuName: 'node-menu',
      axis: {
        x: null,
        y: null
      },
      menulists: [
        {
          fnHandler: 'copyNode',
          icoName: 'edit',
          btnName: '复制节点'
        },
        {
          fnHandler: 'deleteNode',
          icoName: 'edit',
          btnName: '删除节点'
        }
      ]
    },
    link: {
      menuName: 'link-menu',
      axis: {
        x: null,
        y: null
      },
      menulists: [
        {
          fnHandler: 'deleteLink',
          icoName: 'edit',
          btnName: '删除连线'
        }
      ]
    }
  }
}
