export const tools = [
  {
    type: 'drag',
    icon: 'drag',
    name: '拖拽'
  },
  {
    type: 'connection',
    icon: 'fork',
    name: '连线'
  }/*,
  {
    type: 'zoom-in',
    icon: 'zoom-in',
    name: '放大'
  },
  {
    type: 'zoom-out',
    icon: 'zoom-out',
    name: '缩小'
  } */
]

export const commonNodes = [
  {
    type: 'start',
    nodeName: '开始',
    icon: 'StartIcon'
  },
  {
    type: 'end',
    nodeName: '结束',
    icon: 'EndIcon'
  },
  {
    type: 'transition1',
    nodeName: '用户',
    icon: 'UserIcon'
  },
  {
    type: 'gateway1',
    nodeName: '网关',
    icon: 'GatewayIcon'
  }
]

export const highNodes = [
  {
    type: 'child-flow',
    nodeName: '子流程',
    icon: 'ChildFlowIcon'
  }
]

export const laneNodes = [
  {
    type: 'x-lane',
    nodeName: '横向泳道',
    icon: 'XLaneIcon'
  },
  {
    type: 'y-lane',
    nodeName: '纵向泳道',
    icon: 'YLaneIcon'
  }
]
