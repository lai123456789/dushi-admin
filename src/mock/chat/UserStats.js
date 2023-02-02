import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'
const totalCount = 50
const userStats = (options) => {
  /**
   * 传参方式: get
   * 默认排序: { field: 'service_id', order: 'ascend' }
   * 参数:
    {
      user_name: '',//用户名
      nick_name: '',//昵称
      status: '',//状态：0 所有; 1 在线; 2 示忙; 3 离线
    }
   */
  const parameters = getQueryParameters(options)
  const userName = parameters.user_name
  const nickName = parameters.nick_name
  const status = parameters.status
  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1
  const date = new Date()
  const averageConversationTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()

  if (status === '0' || status === '1') {
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'service_id': tmpKey,
        'user_name': userName,
        'nick_name': nickName,
        'groupid': tmpKey,
        'avatar': 'public/static/images/moren.gif',
        'state': '在线',
        'connect_limit': 0,
        'status': status,
        'chats': 0,
        'chating': 0,
        'conversation': 0,
        'averageFirstAnswerTime': 0,
        'averageConversationTime': averageConversationTime
      })
    }
  } else if (status === '2') {
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'service_id': tmpKey,
        'user_name': userName,
        'nick_name': nickName,
        'groupid': tmpKey,
        'avatar': 'public/static/images/moren.gif',
        'state': '示忙',
        'connect_limit': 0,
        'status': status,
        'chats': 0,
        'chating': 0,
        'conversation': 0,
        'averageFirstAnswerTime': 0,
        'averageConversationTime': averageConversationTime
      })
    }
  } else if (status === '3') {
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'service_id': tmpKey,
        'user_name': userName,
        'nick_name': nickName,
        'groupid': tmpKey,
        'avatar': 'public/static/images/moren.gif',
        'state': '离线',
        'connect_limit': 0,
        'status': status,
        'chats': 0,
        'chating': 0,
        'conversation': 0,
        'averageFirstAnswerTime': 0,
        'averageConversationTime': averageConversationTime
      })
    }
  }

  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    user_name: userName,
    nick_name: nickName,
    status: status
  })
}

Mock.mock(/\/chat\/user\/stats/, 'get', userStats)// 今日客服活动列表
