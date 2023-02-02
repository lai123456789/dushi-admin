import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'
const totalCount = 50
const historyConversation = (options) => {
  /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'descend' }
   * 参数:
    {
      start_time: '',//访客进线开始时间
      end_time: '',//访客进线结束时间
      groupid: '',//客服分组id
      visiter_name: '',//访客名称
      user_name: '',//接待客服
      status: '',//会话状态：0 全部；1 已接待；2 未接待
      isvalid: '',//有效会话：'' 全部；1 是；0 否
      comment: '',//满意度：'' 全部；1 满意；2 一般；3 不满意；0 未评价
    }
   */
  const parameters = getQueryParameters(options)
  const startTime = parameters.start_time
  const endTime = parameters.end_time
  const groupid = parameters.groupid
  const visiterName = parameters.visiter_name
  const userName = parameters.user_name
  const status = parameters.status || 0
  const isvalid = parameters.isvalid || ''
  const comment = parameters.comment || ''
  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1
  const date = new Date()
  const myTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'id': tmpKey,
      'visiter_id': 'admin' + tmpKey,
      'service_id': date.getTime(),
      'group_id': tmpKey,
      'start_time': '2020-05-12 16:40:50',
      'end_time': '2020-05-12 16:48:27',
      'end_type': 0,
      'comment': 0,
      'message_all': 2,
      'message_service': 1,
      'message_vister': 1,
      'isvalid': 0,
      'wait_time': tmpKey,
      'answer_time': 0,
      'total_time': myTime,
      'solve': 0,
      'status': 1,
      'reconsult': 0,
      'visiter_name': '测试账号',
      'avatar': 'public/upload/2019/1119/201911190444064423.jpg',
      'user_name': 'admin' + tmpKey,
      'groupname': '在线客服组' + tmpKey
    })
  }
  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    start_time: startTime,
    end_time: endTime,
    groupid: groupid,
    visiter_name: visiterName,
    user_name: userName,
    status: status,
    isvalid: isvalid,
    comment: comment
  })
}

const historyGroupList = (options) => {
  const result = [{
    'display': '--全部--',
    'value': 0
  },
  {
    'display': '111',
    'value': 9
  },
  {
    'display': '333',
    'value': 11
  },
  {
    'display': '555',
    'value': 12
  }]
  return builder({
    data: result
  })
}

Mock.mock(/\/chat\/history\/conversation/, 'get', historyConversation)// 历史会话 列表
Mock.mock(/\/chat\/history\/groupList/, historyGroupList)// 获取客服分组下拉列表
