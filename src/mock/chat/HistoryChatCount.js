import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'
const totalCount = 50
const historyChatCount = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      couttype: '',//数据类型：time 每日数据; service 客服人员数据
      start_time: '',//会话开始日期
      end_time: '',//会话结束日期
      export: '',//导出
    }
   */
  const parameters = getQueryParameters(options)
  const result = []
  const myexport = parameters.export || ''
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'service_id': '2020-05-' + tmpKey,
      'chatday': '2020-05-' + tmpKey,
      'visiters': tmpKey,
      'chats': tmpKey,
      'replys': tmpKey,
      'service_name': 'admin' + tmpKey,
      'conversation': tmpKey,
      'conversation_valid': tmpKey,
      'conversation_invalid': tmpKey
    })
  }
  if (myexport) {
    /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      export: '1',//导出
    }
   */
    return builder({
      export: myexport
    }, '导出成功')
  } else {
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      couttype: 'time',
      start_time: '2020-05-08',
      end_time: '2020-05-14'
    })
  }
}

Mock.mock(/\/chat\/history\/chatCount/, 'get', historyChatCount)// 数据统计 列表
