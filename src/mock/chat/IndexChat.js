import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'

const eventGetChatList = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      visiter_name: '',//访客名称
    }
   */
  const parameters = getQueryParameters(options)
  const visiterName = parameters.visiter_name
  const result = [{
    'vid': 1,
    'visiter_id': '1',
    'visiter_name': 'cs',
    'channel': '',
    'avatar': '',
    'ip': '',
    'from': '',
    'timestamp': '2020-05-13 04:23:10',
    'first_time': '0000-00-00 00:00:00',
    'state': 'offline',
    'remarks': '',
    'direction': '',
    'lasttime': '',
    'id': '1',
    'content': ''
  }, {
    'vid': 2,
    'visiter_id': '2',
    'visiter_name': 'cs1111',
    'channel': '',
    'avatar': '',
    'ip': '',
    'from': '',
    'timestamp': '2022-05-20 04:23:10',
    'first_time': '0000-00-00 00:00:00',
    'state': 'online',
    'remarks': '2222222',
    'direction': '',
    'lasttime': '',
    'id': '2',
    'content': ''
  }]

  return builder({
    data: result,
    totalCount: 2,
    visiter_name: visiterName
  })
}

const eventGetQueueList = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      visiter_name: '',//访客名称
    }
   */
  const parameters = getQueryParameters(options)
  const visiterName = parameters.visiter_name || 'admin'
  const result = {
    'qid': 130,
    'visiter_id': '1',
    'service_id': 0,
    'groupid': 9,
    'state': 'offline',
    'timestamp': '2020-05-13 04:23:10',
    'vid': 5,
    'visiter_name': 'cs',
    'channel': '',
    'avatar': '',
    'ip': '',
    'from': '',
    'first_time': '0000-00-00 00:00:00',
    'remarks': ''
  }

  return builder({
    data: result,
    totalCount: 1,
    visiter_name: visiterName
  })
}

const replyInit = (options) => {
  const parameters = getQueryParameters(options)
  const pageNo = parseInt(parameters.pageNo)
  const tag = parameters.tag
  const type = parameters.type
  const serviceId = parameters.service_id || '0'
  const action = parameters.action
  const rid = parameters.rid
  const searchString = parameters.searchString
  let result = []

  if (action === 'category') {
    /*
    传参方式: get
    默认排序: 无
    分类列表 参数:
    {
      "action":"category",//查询所有分类时值为category
      "tag":"",//查询所有分类时的必传参，且值为init
      "type":"",//查询所有分类时的必传参，且值为combobox
      "service_id":"",//0 公共库；不为0 个人库
    }
    */
    result = [{
      'id': 0,
      'name': '-所有分类-'
    },
    {
      'id': 1,
      'service_id': 0,
      'name': '子分类A'
    }]
    return builder({
      pageNo: pageNo,
      data: result,
      action: 'category',
      tag: tag,
      type: type,
      service_id: serviceId
    })
  } else if (action === 'content') {
    /*
    传参方式: get
    默认排序: { field: 'id', order: 'descend' }
    回复列表 参数:
    {
      "action":"content",//查询回复列表时值为content
      "service_id":"",//0 公共库；不为0 个人库
      "rid":"",//关联快捷回复分类id
      "searchString":"",//搜索回复内容，模糊查询
    }
    */
    result = [{
      'id': 1,
      'rid': 0,
      'tag': 'a',
      'word': 'zzzz'
    }, {
      'id': 2,
      'rid': 1,
      'tag': 'ab',
      'word': 'zzzz1111'
    }]
    return builder({
      pageNo: pageNo,
      data: result,
      action: 'content',
      service_id: serviceId,
      rid: rid,
      searchString: searchString
    })
  }
}

const indexChangeStatus = (options) => {
  const result = {
    'msg': '"<span style="color: #E23C39">客服状态：示忙</span>"'
  }
  return builder({
    data: result
  })
}

const eventClose = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      visiter_id:'',//访客id
    }
   */
  const parameters = getQueryParameters(options)
  const visiterId = parameters.visiter_id

  const result = {
    'code': 0,
    'msg': 'success',
    'tag': '2001'
  }

  return builder({
    data: result,
    visiter_id: visiterId
  })
}

const eventClaim = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      visiter_id:'',//访客id
    }
   */
  const parameters = getQueryParameters(options)
  const visiterId = parameters.visiter_id

  const result = {
    'code': 0,
    'data': '抓取成功'
  }
  /*
  'code': 1,
    'data': '当前会话数已达上限，请结束部分会话后重试'
  */
  /*
  'code': 1,
    'data': '该访客已经被其他客服抓取'
  */

  return builder({
    data: result,
    visiter_id: visiterId
  })
}

const eventServiceSend = (options) => {
  /**
   * 传参方式: post
   * 默认排序: 无
   * 参数:
    {
      visiter_id:'',//访客id
      content:'',//发送内容
      from:'',//消息来源
      msgtype:'',//消息格式
    }
   */
  const result = {
    'code': 0,
    'msg': 'success'
  }
  /*
    'code': 1,
    'msg': '你发送的信息中包含违禁词，消息发送失败'
  */
  /*
    'code': 1,
    'msg': '访客已离开，会话结束'
  */

  return builder({
    data: result
  })
}

const indexServiceList = (options) => {
  const result = {
    'service_id': 28,
    'user_name': 'test',
    'nick_name': 'wwq',
    'groupid': '9',
    'avatar': 'public/static/images/moren.gif',
    'state': 'online',
    'connect_limit': 0,
    'status': 'idle'
  }
  return builder({
    data: result
  })
}

const eventGetswitch = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      service_id: ''   //目标客服
      visiter_id: '' //访客id
      visiter_name: ''//访客名称
      service_nick_name: ''//原客服昵称
    }
   */
  const parameters = getQueryParameters(options)
  const serviceId = parameters.service_id
  const visiterId = parameters.visiter_id
  const visiterName = parameters.visiter_name
  const serviceNickName = parameters.service_nick_name

  const result = {
    'code': 0,
    'msg': '转接成功！'
  }

  /*
  'code' => 1, 'msg' => '该客服已离线或会话数已达上限'
  */

  return builder({
    data: result,
    service_id: serviceId,
    visiter_id: visiterId,
    visiter_name: visiterName,
    service_nick_name: serviceNickName
  })
}

const eventMychatdata = (options) => {
  /**
   * 传参方式: get
   * 默认排序: 无
   * 参数:
    {
      visiter_id: '' //访客id
      cid: ''
      start_time: ''//会话记录开始时间，默认为空，查询全部记录
      end_time: ''//会话记录结束时间，默认为空，查询全部记录
    }
   */
  const parameters = getQueryParameters(options)
  const visiterId = parameters.visiter_id
  const cid = parameters.cid
  const startTime = parameters.start_time || ''
  const endTime = parameters.end_time || ''

  const result = {
    'code': 0,
    'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
    'data': [{
      'cid': 2164,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '1',
      'timestamp': 1590053603,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 17:33:23',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2165,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '对不起，您的问题我暂时无法解答，您可以回复“人工”或“RG”选择人工服务我猜您是想咨询(请回复对应数字)1. 客户要求看安装场地 环境2. 2根滤芯顾虑效果能保证吗3. 为什么要买纳滤净水机4. 为什么要用净水机5. 电解水原理及颜色显示6. 为什么净水机制出来的水刚接出来时有那么多小水泡7. 重金属对人体有什么影响8. 中国各地水质的TDS值9. 滤芯保质期10. 出水小故障排查方法',
      'timestamp': 1590053604,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:33:24',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    }, {
      'cid': 2166,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '112336',
      'timestamp': 1590053662,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 17:34:22',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2167,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '对不起，您的问题我暂时无法解答，您可以回复“人工”或“RG”选择人工服务我猜您是想咨询(请回复对应数字)1. 客户要求看安装场地 环境2. 2根滤芯顾虑效果能保证吗3. 为什么要买纳滤净水机4. 为什么要用净水机5. 电解水原理及颜色显示6. 为什么净水机制出来的水刚接出来时有那么多小水泡7. 重金属对人体有什么影响8. 中国各地水质的TDS值9. 滤芯保质期10. 出水小故障排查方法',
      'timestamp': 1590053662,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:34:22',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    }, {
      'cid': 2168,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '哈哈',
      'timestamp': 1590054193,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 17:43:13',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2169,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '对不起，您的问题我暂时无法解答，您可以回复“人工”或“RG”选择人工服务我猜您是想咨询(请回复对应数字)1. 客户要求看安装场地 环境2. 2根滤芯顾虑效果能保证吗3. 为什么要买纳滤净水机4. 为什么要用净水机5. 电解水原理及颜色显示6. 为什么净水机制出来的水刚接出来时有那么多小水泡7. 重金属对人体有什么影响8. 中国各地水质的TDS值9. 滤芯保质期10. 出水小故障排查方法',
      'timestamp': 1590054194,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:43:14',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    }, {
      'cid': 2170,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '哈哈',
      'timestamp': 1590054222,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 17:43:42',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2171,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 0,
      'conversation_id': 0,
      'content': '对不起，您的问题我暂时无法解答，您可以回复“人工”或“RG”选择人工服务我猜您是想咨询(请回复对应数字)1. 客户要求看安装场地 环境2. 2根滤芯顾虑效果能保证吗3. 为什么要买纳滤净水机4. 为什么要用净水机5. 电解水原理及颜色显示6. 为什么净水机制出来的水刚接出来时有那么多小水泡7. 重金属对人体有什么影响8. 中国各地水质的TDS值9. 滤芯保质期10. 出水小故障排查方法',
      'timestamp': 1590054223,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:43:43',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    }, {
      'cid': 2172,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': '人工',
      'timestamp': 1590054238,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 17:43:58',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2173,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': -1,
      'conversation_id': 0,
      'content': '转人工服务',
      'timestamp': 1590054238,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:43:58',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    }, {
      'cid': 2174,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': -1,
      'conversation_id': 0,
      'content': '您好，当前正在排队，您可以先简单描述您的问题-ok1',
      'timestamp': 1590054238,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:43:58',
      'avatar': 'modules/chat/statics/images/system.png',
      'name': '系统'
    }, {
      'cid': 2175,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': '您好，很高兴为您服务-web',
      'timestamp': 1590055141,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:59:01',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }, {
      'cid': 2176,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': 'hello<div><br></div>',
      'timestamp': 1590055170,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 17:59:30',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }, {
      'cid': 2177,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': '哈哈哈',
      'timestamp': 1590055195,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 17:59:55',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2178,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': " <img src='modules/chat/statics/images/emoji/001.gif'/>",
      'timestamp': 1590055316,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 18:01:56',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }, {
      'cid': 2179,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': '11',
      'timestamp': 1590055341,
      'state': 'unread',
      'direction': 'to_service',
      'datetime': '2020-05-21 18:02:21',
      'avatar': 'public/upload/2020/0512/202005120442226145.jpg',
      'name': "It's my life"
    }, {
      'cid': 2180,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': '1111',
      'timestamp': 1590056532,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 18:22:12',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }, {
      'cid': 2181,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': 'ttttttt',
      'timestamp': 1590067579,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 21:26:19',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }, {
      'cid': 2182,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': 'fsdfsdfsf',
      'timestamp': 1590068224,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 21:37:04',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }, {
      'cid': 2183,
      'visiter_id': 'oH-e_0icZXMxhV6UMnkX4MIDc46A',
      'service_id': 26,
      'conversation_id': 0,
      'content': 'ewqweqwe',
      'timestamp': 1590068229,
      'state': 'unread',
      'direction': 'to_visiter',
      'datetime': '2020-05-21 21:37:09',
      'avatar': 'public/static/images/moren.gif',
      'name': 'admin1'
    }]
  }

  return builder({
    data: result,
    visiter_id: visiterId,
    cid: cid,
    start_time: startTime,
    end_time: endTime
  })
}

Mock.mock(/\/chat\/event\/getChatList/, 'get', eventGetChatList)// 获取当前对话列表数据
Mock.mock(/\/chat\/event\/getQueueList/, 'get', eventGetQueueList)// 获取当前排队列表数据
Mock.mock(/\/chat\/reply\/init/, 'get', replyInit)// 获取快捷回复
Mock.mock(/\/chat\/index\/changeStatus/, indexChangeStatus)// 更改客服状态
Mock.mock(/\/chat\/event\/close/, 'get', eventClose)// 结束对话按钮
Mock.mock(/\/chat\/event\/claim/, 'get', eventClaim)// 抓取按钮
Mock.mock(/\/chat\/event\/serviceSend/, 'get', eventServiceSend)// 发送
Mock.mock(/\/chat\/index\/serviceList/, indexServiceList)// 转接在线客服列表
Mock.mock(/\/chat\/event\/getswitch/, 'get', eventGetswitch)// 转接按钮
Mock.mock(/\/chat\/event\/mychatdata/, 'get', eventMychatdata)// 获取会话记录
