import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'
const totalCount = 50
const historyVisiter = (options) => {
  /**
   * 传参方式: get
   * 默认排序: { field: 'timestamp', order: 'descend' }
   * 参数:
    {
      start_time: '',//来访时间-开始
      end_time: '',//来访时间-结束
      visiter_name: ''//访客名称
    }
   */
  const parameters = getQueryParameters(options)
  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1
  const date = new Date()
  const myTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  const myStartTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + '00:00:00'
  const myEndTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + '23:59:59'
  const visiteName = parameters.visiter_name
  const timestamp = new Date().getTime()
  const startTime = parameters.start_time || myStartTime
  const endTime = parameters.end_time || myEndTime

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'vid': tmpKey,
      'visiter_id': '1',
      'visiter_name': visiteName,
      'channel': '',
      'avatar': '',
      'ip': '',
      'from': '',
      'timestamp': timestamp,
      'first_time': myTime,
      'state': 'offline',
      'remarks': '',
      'chats_all': tmpKey,
      'chats_visiter': tmpKey,
      'chats_service': tmpKey
    })
  }
  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    start_time: startTime,
    end_time: endTime,
    visiter_name: visiteName
  })
}

const eventMychatdata = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      visiter_id: '',//访客id
      cid: '',//会话记录id
    }
   */
  const parameters = getQueryParameters(options)
  const visiterId = parameters.visiter_id
  const cid = parameters.cid

  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'cid': tmpKey,
      'visiter_id': '1',
      'service_id': 1,
      'conversation_id': 1,
      'content': 'hello',
      'timestamp': 0,
      'state': 'unread',
      'direction': null,
      'datetime': '1970-01-01 08:00:00',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    })
  }

  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    visiter_id: visiterId,
    cid: cid
  })
}

const historyVisiterEdit = (options) => {
  /**
   * get参数:
    {
      vid: ''
    }
    post参数
    {
    "info":{
      'customer_name': '',//客户姓名
      'customer_tel': '',//客户电话
      'remarks': '',//备注
    }
  }
   */

  const parameters = getQueryParameters(options)
  const vid = parameters.vid
  return builder({ vid: vid }, '操作成功')
}

const historyVisiterWhileList = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      vid: ''
    }
   */
  const parameters = getQueryParameters(options)
  const vid = parameters.vid
  return builder({ vid: vid }, '操作成功')
}

Mock.mock(/\/chat\/history\/visiter/, 'get', historyVisiter)// 历史访客 列表
Mock.mock(/\/chat\/event\/mychatdata/, 'get', eventMychatdata)// 历史访客 会话记录
Mock.mock(/\/chat\/history\/visiterEdit/, 'post', historyVisiterEdit)// 历史访客 编辑
Mock.mock(/\/chat\/history\/visiterWhileList/, 'get', historyVisiterWhileList)// 历史访客 编辑白名单
