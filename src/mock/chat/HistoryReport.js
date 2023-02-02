import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'
const myRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}
const geneData = (num, min, max) => {
  const output = []
  for (let i = 0; i < num; i++) {
    output.push(myRandom(min, max))
  }
  return output
}
const historyReport = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      start_time: '',//会话开始时间
      end_time: '',//会话结束时间
      group_id: '',//客服分组id
    }
   */
  const parameters = getQueryParameters(options)
  const groupId = parameters.group_id || '0'
  const pageNo = parseInt(parameters.pageNo)
  const result = {
    'conversation': myRandom(10, 20), // 会话总数
    'chats': 0, // 消息总数
    'qa': '0.00', // 答问比
    'answerPercent': '0.00', // 接入率
    'averagecCnversationTime': '00:00:00', // 平均会话时长
    'waitNumber': 0, // 排队数
    'averageFirstAnswerTime': 0, // 平均首次回复时长
    'averageWaitTime': 0, // 平均排队时长
    'abandonNumber': 0, // 未接入会话数
    'averageAbandonTime': 0, // 平均放弃时长
    'commentPercent': '0.00', // 参评率
    'commentSatisfiedPercent': '0.00', // 满意率
    'chartData1': geneData(24, 80, 100),
    'chartData2': geneData(24, 60, 75),
    'chartData3': geneData(24, 40, 75),
    'chartData4': geneData(24, 10, 40),
    'start_time': '2020-05-14 00:00:00',
    'end_time': '2020-05-14 23:59:59',
    'yest_day': '2020-05-13 00:00:00',
    'yest_end': '2020-05-13 23:59:59',
    'begin_week': '2020-05-11 00:00:00',
    'begin_month': '2020-05-01 00:00:00'
  }
  return builder({
    pageNo: pageNo,
    data: result,
    start_time: '2020-05-14 00:00:00',
    end_time: '2020-05-14 23:59:59',
    group_id: groupId
  })
}

const historyGroupList = (options) => {
  const result = [ {
    'display': '--全部--',
    'value': 0
  }, {
    'display': '111',
    'value': 9
  } ]
  return builder({
    data: result
  })
}

Mock.mock(/\/chat\/history\/report/, 'get', historyReport)// 会话总览 图表数据
Mock.mock(/\/chat\/history\/groupList/, historyGroupList)// 获取客服分组下拉列表
