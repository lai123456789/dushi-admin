import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'
const totalCount = 50
const userInit = (options) => {
  /**
   * 传参方式: get
   * 默认排序: { field: 'service_id', order: 'ascend' }
   * 参数:
    {
      user_name: '',//用户名
      nick_name: '',//昵称
    }
   */
  const parameters = getQueryParameters(options)
  const userName = parameters.user_name
  const nickName = parameters.nick_name
  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'service_id': tmpKey,
      'user_name': 'admin',
      'nick_name': 'z' + tmpKey,
      'groupid': tmpKey,
      'avatar': 'public/static/images/moren.gif',
      'state': 'offline',
      'connect_limit': tmpKey,
      'status': 'idle',
      'groupname': '111'
    })
  }
  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    user_name: userName,
    nick_name: nickName
  })
}

const groupGroupList = (options) => {
  const result = {
    'display': '111',
    'value': 9
  }
  return builder({
    data: result
  })
}

const userAdd = (options) => {
  /**
   * 传参方式: post
   * 参数:
    {
      "info":{
        "user_name":"",
        "nick_name":"",
        "groupid":"",
        "connect_limit":""
      }
    }
   */
  return builder({
  }, '操作成功')
}

const userEdit = (options) => {
  /**
   * 传参方式: post
   * 参数:
    {
      "service_id":"",
      "info":{
        "user_name":"",
        "nick_name":"",
        "groupid":"",
        "connect_limit":""
      }
    }
   */

  return builder({}, '操作成功')
}

const userDelete = (options) => {
  /**
   * 传参方式: get
   * 参数:
    {
      "id":""
    }
   */
  const parameters = getQueryParameters(options)
  const id = parameters.id

  return builder({
    id: id
  }, '操作成功')
}

const groupInit = (options) => {
  /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'ascend' }
   * 参数:
    {
      groupname: '',//分组名称
    }
   */
  const parameters = getQueryParameters(options)
  const groupname = parameters.groupname

  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1
  const date = new Date()
  const myTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'id': tmpKey,
      'groupname': 'test',
      'robot_id': tmpKey,
      'inroute_mode': 'human',
      'distribution_mode': 'auto',
      'setting': {
        'visiterDistributeMemory': '1',
        'visiterDistributeMemoryMode': '0',
        'visiterDistributeMemoryTime': '24',
        'visiterDistributeAuto': 'saturation',
        'worktimeWeek': {
          '1': 'on',
          '2': 'on',
          '3': 'on',
          '4': 'on',
          '5': 'on'
        },
        'baseTime': {
          'startHour': [
            '09',
            '14'
          ],
          'startMinute': [
            '00',
            '00'
          ],
          'endHour': [
            '12',
            '18'
          ],
          'endMinute': [
            '00',
            '00'
          ]
        },
        'holiday': [
          ''
        ],
        'specialWorkTime': {
          'date': [
            ''
          ],
          'startHour': [
            ''
          ],
          'startMinute': [
            ''
          ],
          'endHour': [
            ''
          ],
          'endMinute': [
            ''
          ]
        }
      },
      'inputuser': 'admin',
      'inputtime': myTime,
      'robot_name': null,
      'service': tmpKey
    })
  }
  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    groupname: groupname
  })
}

const groupAdd = (options) => {
  /**
   * 传参方式: post
   * 参数:
    {
      "info":{
        "groupname":""
      }
    }
   */

  return builder('操作成功')
}

const settingRobot = (options) => {
  /**
   * 传参方式: get
   * 参数:
    {
      "action":"combobox"
    }
   */
  const parameters = getQueryParameters(options)
  const action = parameters.action
  const id = parameters.id
  const mykey = parameters.key
  const name = parameters.name
  const nickName = parameters.nick_name
  const remarks = parameters.remarks
  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1
  const date = new Date()
  const myTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  const robotId = parameters.robot_id
  const title = parameters.title
  const commonProblem = parameters.common_problem

  if (commonProblem) {
    // 机器人设置常见问题 列表
    /**
   * 查询方式: get
   * 默认排序: { field: 'id', order: 'ascend' }
   * 查询参数:
    {
      "common_problem":"true",
      "robot_id":""
      "title": ''
    }
   */
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'id': tmpKey,
        'rid': tmpKey,
        'title': title,
        'similar': '',
        'content': 'zzzz',
        'common_problem': 1,
        'updatetime': myTime
      })
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      common_problem: commonProblem,
      robot_id: robotId,
      title: title
    })
  }

  if (action === 'combobox') {
    /*
    技能组设置编辑获取机器人下拉列表
    */
    const result = [{
      'display': 'zzz',
      'value': 1
    }, {
      'display': 'aaa',
      'value': 2
    }, {
      'display': 'cc',
      'value': 3
    }]
    return builder({
      data: result,
      action: 'combobox'
    })
  } else if (action === 'add') {
    // 机器人设置添加
    /**
   * get参数：
   * {
      action: 'add'
   * }
   * post参数:
    {
      "info":{
        "avatar":"",
        "name":"",
        "nick_name":"",
        "remarks":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'delete') {
    // 机器人设置 删除
    /**
   * 传参方式: get
   * 参数:
    {
      action: 'delete'
      id:''
    }
   */
    return builder({
      action: 'delete',
      id: id
    }, '操作成功')
  } else if (action === 'common_problem_list') {
    // 机器人设置常见问题列表
    /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'ascend' }
   * 参数:
    {
      "action":"common_problem_list",
      "robot_id":""
      "title": ''
    }
   */
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'id': tmpKey,
        'rid': tmpKey,
        'title': title,
        'similar': '',
        'content': 'zzzz',
        'common_problem': 1,
        'updatetime': myTime
      })
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      action: 'common_problem_list',
      robot_id: robotId,
      title: title
    })
  } else if (action === 'keyword_list') {
    // 机器人设置关键词列表
    // 机器人设置转人工关键词 列表
    /*
   * 传参方式: get
     默认排序: { field: 'id', order: 'ascend' }
   * 参数:
    {
      action: 'keyword_list',
      robot_id: "1",
      key: "",
    }
   */
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'id': tmpKey,
        'robot_id': robotId,
        'update_time': myTime,
        'key': '222',
        'mode': 'cn',
        'status': 1
      })
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      action: 'keyword_list',
      robot_id: robotId,
      key: mykey
    })
  } else if (action === 'edit') {
    // 机器人设置基础设置
    /**
   * get参数：
   * {
   *  action: 'edit'
   * }
   * post参数:
    {
      "info":{
          "id":"1",
          "avatar":"public/static/images/moren.gif",
          "name":"zzz",
          "nick_name":"zz",
          "remarks":"z"
      },
      "setting":{
          "welcome":"您好，我是小A机器人，很高兴为您服务！",
          "guideWeb":"我猜您是想咨询",
          "guideWx":"我猜您是想咨询(请回复对应数字)",
          "unknownProblemWeb":"对不起，您的问题我暂时无法解答，您可以联系人工客服",
          "unknownProblemWx":"对不起，您的问题我暂时无法解答，您可以回复“人工”或“RG”选择人工服务",
          "commonProblemWeb":"1",
          "commonProblemWx":"0",
          "commonProblemGuide":"我猜您想咨询以下问题",
          "serviceButton":"1",
          "greeting":"1",
          "solveTime":"1",
          "comment":"1"
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'keyword_add') {
    // 机器人设置转人工关键词 添加
    /**
   * get参数：
   * {
   *  action: 'keyword_add'
   * }
   * post参数:
    {
      "info":{
        "robot_id":"",
        "key":"",
        "mode":"",
        "status":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'keyword_edit') {
    // 机器人设置转人工关键词 编辑
  /**
   * get参数：
   * {
   *  action: 'keyword_edit'
   * }
   * post参数:
    {
      "info":{
        "id":"",
        "key":"",
        "mode":"",
        "status":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'keyword_delete') {
    // 机器人设置转人工关键词 删除
    /**
   * 传参方式: get
   * 参数:
    {
      action: 'keyword_delete'
      id:''
    }
   */
    return builder({
      action: 'keyword_delete',
      id: id
    }, '操作成功')
  } else if (action === 'common_problem_add') {
    // 机器人设置常见问题 选择
    /**
   * get参数：
   * {
      action: 'common_problem_add'
      id: ''
   * }
   */
    return builder('操作成功')
  } else if (action === 'common_problem_delete') {
    // 机器人设置常见问题 删除
    /**
   * get参数：
   * {
      action: 'common_problem_delete'
      id: ''
   * }
   */
    return builder({
      action: 'common_problem_delete',
      id: id
    }, '操作成功')
  } else {
    // 机器人设置 列表
    /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'ascend' }
   * 参数:
    {
      name: '',//机器人名称
      nick_name: '',//机器人昵称
      remarks: '',//机器人备注
    }
   */
    for (let i = 1; i < next; i++) {
      const tmpKey = key + i
      result.push({
        'id': tmpKey,
        'name': name,
        'nick_name': nickName,
        'avatar': 'public/static/images/moren.gif',
        'inputtime': myTime,
        'remarks': remarks,
        'setting': {
          'welcome': '您好，我是小A机器人，很高兴为您服务！',
          'guideWeb': '我猜您是想咨询',
          'guideWx': '我猜您是想咨询(请回复对应数字)',
          'unknownProblemWeb': '对不起，您的问题我暂时无法解答，您可以联系人工客服',
          'unknownProblemWx': '对不起，您的问题我暂时无法解答，您可以回复“人工”或“RG”选择人工服务',
          'commonProblemWeb': '1',
          'commonProblemWx': '0',
          'commonProblemGuide': '我猜您想咨询以下问题',
          'serviceButton': '1',
          'greeting': '1',
          'solveTime': '1',
          'comment': '1'
        }
      })
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      name: name,
      nick_name: nickName,
      remarks: remarks
    })
  }
}

const groupEdit = (options) => {
  /**
   * 传参方式: post
   * 参数:
    {
      "id":"",
      "info":{
        "groupname":"",
        "robot_id":"",
        "inroute_mode":"",
        "distribution_mode":""
      },
      "setting":{
        "visiterDistributeMemory":"",
        "visiterDistributeMemoryMode":"",
        "visiterDistributeMemoryTime":"",
        "visiterDistributeAuto":"",
        "worktimeWeek":{
          "1":"on",
          "2":"on",
          "3":"on",
          "4":"on",
          "5":"on"
        },
        "baseTime":{
          "startHour":[
              "09",
              "14"
          ],
          "startMinute":[
              "00",
              "00"
          ],
          "endHour":[
              "12",
              "18"
          ],
          "endMinute":[
              "00",
              "00"
          ]
        },
        "holiday":[
            ""
        ],
        "specialWorkTime":{
          "date":[
              ""
          ],
          "startHour":[
              ""
          ],
          "startMinute":[
              ""
          ],
          "endHour":[
              ""
          ],
          "endMinute":[
              ""
          ]
        }
      }
    }
   */
  return builder('操作成功')
}

const groupDelete = (options) => {
  /**
   * 传参方式: get
   * 参数:
    {
      "id":"12"
    }
   */
  const parameters = getQueryParameters(options)
  const id = parameters.id || '12'

  return builder({
    id: id
  }, '操作成功')
}

const mobileIndex = (options) => {
  /**
   * 传参方式: get
   * 参数:
    {
      "visiter_id":"1001",
      "visiter_name":"小土星",
      "from":"商城",
      "groupid":"12"
    }
   */
  const parameters = getQueryParameters(options)
  const visiterId = parameters.visiter_id || '1001'
  const visiterName = parameters.visiter_name || '小土星'
  const from = parameters.from || '商城'
  const groupid = parameters.groupid || '12'

  const result = [{
    'emoji': [
      {
        'tag': '/::)',
        'key': '微笑',
        'src': 'modules/chat/statics/images/emoji/001.gif'
      },
      {
        'tag': '/::~',
        'key': '撇嘴',
        'src': 'modules/chat/statics/images/emoji/002.gif'
      },
      {
        'tag': '/::B',
        'key': '色',
        'src': 'modules/chat/statics/images/emoji/003.gif'
      }
    ],
    'emoji_json': [{ 'tag': '[\u767c]', 'key': '\u767c', 'src': '099.gif' }, { 'tag': '[Blessing]', 'key': '\u798f', 'src': '100.gif' }],
    'groupid': '12',
    'app_key': 'b054014693241bcd9c20',
    'whost': 'localhost',
    'value': 'false',
    'wport': 9090,
    'port': 'wsPort',
    'url': 'http://localhost/zxy/01.doscss/',
    'visiter_name': '小土星',
    'from': '商城',
    'channel': '31303031',
    'visiter_id': '1001',
    'avatar': 'modules/chat/statics/images/customer.png'
  }]
  return builder({
    data: result,
    visiter_id: visiterId,
    visiter_name: visiterName,
    from: from,
    groupid: groupid
  })
}

const settingRobotKnowledgeCategory = (options) => {
  const parameters = getQueryParameters(options)
  const robotId = parameters.robot_id
  const action = parameters.action
  const id = parameters.id

  if (action === 'list') {
    // 机器人设置机器人知识库 树列表
    /**
   * 传参方式: get
   * 参数:
    {
      action: 'list',
      robot_id: "1",
    }
   */
    const result = [{
      'id': 0,
      'robot_id': 7,
      'name': '全部',
      'expanded': true,
      'children': [
        {
          'id': 2,
          'parentid': 0,
          'robot_id': 1,
          'name': 'aa',
          'leaf': true
        }
      ]
    }, {
      'id': 1,
      'robot_id': 2,
      'name': 'aaa',
      'expanded': true,
      'children': [
        {
          'id': 3,
          'parentid': 1,
          'robot_id': 2,
          'name': 'aa11',
          'leaf': true
        }
      ]
    }]
    return builder({
      data: result,
      action: 'list',
      robot_id: robotId
    })
  } else if (action === 'add') {
    // 机器人设置机器人知识库 树 添加子分类
    /**
   * get参数：
   * {
   *  action: 'add'
   * }
   * post参数:
    {
      "info":{
          "parentid":"",
          "robot_id":"",
          "name":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'edit') {
    // 机器人设置机器人知识库 树 编辑
    /**
   * get参数：
   * {
   *  action: 'edit'
   * }
   * post参数:
    {
      "info":{
          "id":"",
          "name":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'delete') {
    // 机器人设置机器人知识库 树 删除
    /**
   * 传参方式: get
   * 参数:
    {
      "action":"delete",
      "id":"4"
    }
   */
    return builder({
      action: 'delete',
      id: id
    }, '操作成功')
  }
}

const settingRobotKnowledgeContent = (options) => {
  const parameters = getQueryParameters(options)
  const action = parameters.action
  const id = parameters.id
  const robotId = parameters.robot_id
  const pageNo = parseInt(parameters.pageNo)
  const title = parameters.title
  const categoryId = parameters.category_id

  if (action === 'add') {
    // 机器人设置机器人知识库 知识列表 添加
    /**
   * get参数：
   * {
   *  action: 'add'
   * }
   * post参数:
    {
      "info":{
          "rid":"",
          "title":"",
          "content":""
      },
      "textfield-1059-inputEl":""
    }
   */
    return builder('操作成功')
  } else if (action === 'edit') {
    // 机器人设置机器人知识库 知识列表 编辑
    /**
   * get参数：
   * {
   *  action: 'edit'
   * }
   * post参数:
    {
      "info":{
          "id":"25",
          "title":"aaa",
          "content":"aaaa"
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'delete') {
    // 机器人设置机器人知识库 知识列表 删除
    /**
   * 传参方式: get
   * 参数:
    {
      action: 'delete'
      id:''
    }
   */
    return builder({
      action: 'delete',
      id: id
    }, '操作成功')
  } else {
    // 机器人设置机器人知识库 知识列表
  /**
   * 传参方式: get
   * 参数:
    {
      title: 'aaa',
      robot_id: "1",
      category_id：'0'
    }
   */

    const result = [{
      'id': 25,
      'rid': 2,
      'title': 'aaa',
      'similar': '',
      'content': 'aaaa',
      'common_problem': 0,
      'updatetime': '2020-05-15 16:09:04'
    }, {
      'id': 26,
      'rid': 3,
      'title': 'ccc',
      'similar': '',
      'content': 'cc',
      'common_problem': 0,
      'updatetime': '2022-05-16 16:09:04'
    }]
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      robot_id: robotId,
      title: title,
      category_id: categoryId
    })
  }
}

const settingRobotKnowledgeStudy = (options) => {
  const parameters = getQueryParameters(options)
  const action = parameters.action
  const pageNo = parseInt(parameters.pageNo)
  const title = parameters.title
  const rid = parameters.rid

  if (action === 'study') {
    // 机器人设置机器人学习 知识学习
    /**
   * 传参方式: get
   * 默认排序: { field: 'title', order: 'descend' }
   * 参数:
    {
      action：'study',
      title: '',
      rid: ""
    }
   */
    const result = {
      'id': 2,
      'rid': 0,
      'title': 'ddd',
      'updatetime': '2020-05-16 00:00:00',
      'mytitle': null,
      'mycontent': null
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      action: 'study',
      title: title,
      rid: rid
    })
  } else {
    // 机器人设置机器人学习 知识列表
    /**
   * 传参方式: get
   * 默认排序: { field: 'title', order: 'descend' }
   * 参数:
    {
      title: '',
      robot_id: "",
      category_id：''
    }
   */
    const parameters = getQueryParameters(options)
    const pageNo = parseInt(parameters.pageNo)
    const title = parameters.title || 'aaa'
    const robotId = parameters.robot_id || '7'
    const categoryId = parameters.category_id || '0'

    const result = {
      'id': 25,
      'rid': 2,
      'title': 'aaa',
      'similar': '',
      'content': 'aaaa',
      'common_problem': 0,
      'updatetime': '2020-05-15 16:09:04',
      'count': 1
    }

    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      robot_id: robotId,
      title: title,
      category_id: categoryId
    })
  }
}

const settingRobotKnowledgeUnknown = (options) => {
  const parameters = getQueryParameters(options)
  const action = parameters.action
  const id = parameters.id || '1'
  const pageNo = parseInt(parameters.pageNo)
  const title = parameters.title || 'aaa'
  const robotId = parameters.robot_id || '7'

  if (action === 'delete') {
    // 机器人设置未知问题学习 删除
    /**
   * 传参方式: get
   * 参数:
    {
      action: 'delete'
      id:''
    }
   */
    return builder({
      action: 'delete',
      id: id
    }, '操作成功')
  } else {
    // 机器人设置未知问题学习 列表
    /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'descend' }
   * 参数:
    {
      "robot_id":"1",
      "title": '111'
    }
   */
    const result = {
      'id': 5,
      'robot_id': 1,
      'title': '1111',
      'updatetime': '2020-05-15 00:00:00'
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      robot_id: robotId,
      title: title
    })
  }
}

const settingRobotKnowledgeIgnore = (options) => {
  const parameters = getQueryParameters(options)
  const action = parameters.action
  const id = parameters.id
  const pageNo = parseInt(parameters.pageNo)
  const title = parameters.title
  const robotId = parameters.robot_id

  if (action === 'delete') {
    // 机器人设置永久忽略问题 删除
    /**
   * 传参方式: get
   * 参数:
    {
      action: 'delete'
      id:''
    }
   */
    return builder({
      action: 'delete',
      id: id
    }, '操作成功')
  } else {
    // 机器人设置永久忽略问题 列表
    /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'descend' }
   * 参数:
    {
      "robot_id":"1",
      "title": '111'
    }
   */
    const result = {
      'id': 5,
      'robot_id': 1,
      'title': '1111',
      'updatetime': '2020-05-15 00:00:00'
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      robot_id: robotId,
      title: title
    })
  }
}

const replyInit = (options) => {
  const parameters = getQueryParameters(options)
  const action = parameters.action
  const pageNo = parseInt(parameters.pageNo)
  const serviceId = parameters.service_id
  const searchString = parameters.searchString

  if (action === 'category') {
    // 快捷回复 个人库/公共库 列表
    /**
   * 传参方式: get
   * 默认排序: { field: 'name', order: 'ascend' }
   * 参数:
    {
      "action":"category",
      "service_id":"1"
    }
   */
    const result = {
      'id': 2,
      'service_id': 26,
      'name': 'aaaa'
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      service_id: serviceId,
      action: 'category'
    })
  } else if (action === 'content') {
    // 快捷回复 个人库/公共库 快捷回复
    /**
   * 传参方式: get
   * 默认排序: { field: 'name', order: 'ascend' }
   * 参数:
    {
      "action":"content",
      "service_id":"1"
      'searchString':''
    }
   */
    const result = {
      'id': 30,
      'rid': 2,
      'tag': 'a',
      'word': 'zzzz'
    }
    return builder({
      pageNo: pageNo,
      totalCount: totalCount,
      data: result,
      service_id: serviceId,
      action: 'content',
      searchString: searchString
    })
  } else if (action === 'edit_category') {
    // 快捷回复 列表 编辑
    /**
   * get参数：
   * {
   *  action: 'edit_category'
   * }
   * post参数:
    {
      "id":"",
      "info":{
          "name":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'delete') {
    // 快捷回复 列表 删除
    /**
   * 传参方式: get
   * 参数:
    {
      "action":"delete",
      "id":"2",
      "tablename":"",
    }
   */
    const parameters = getQueryParameters(options)
    const id = parameters.id
    return builder({
      action: 'delete',
      id: id,
      tablename: 'chat_reply_category'
    }, '操作成功')
  } else if (action === 'edit') {
    // 快捷回复 回复 编辑
    /**
   * get参数：
   * {
   *  action: 'edit'
   * }
   * post参数:
    {
      "id":"",
      "info":{
          "tag":"",
          "word":""
      }
    }
   */
    return builder('操作成功')
  } else if (action === 'add_category') {
    // 快捷回复 列表 添加
    /**
   * get参数：
   * {
   *  action: 'add_category'
   * }
   * post参数:
    {
      "info":{
          "service_id":"",
          "name":""
      }
    }
   */
    return builder('操作成功')
  } else {
    // 快捷回复 回复 添加
    /**
   * get参数：
   * {
   *  action: 'add'
   * }
   * post参数:
    {
      "info":{
          "rid":"2",
          "tag":"11111",
          "word":""
      }
    }
   */
    return builder('操作成功')
  }
}

const sensitiveInit = (options) => {
  /**
   * 传参方式: get
   * 默认排序: { field: 'id', order: 'ascend' }
   * 参数:
    {
      type: '',
      words: '',
    }
   */
  const parameters = getQueryParameters(options)
  const type = parameters.type
  const words = parameters.words
  const pageNo = parseInt(parameters.pageNo)
  const result = [{
    'id': 1,
    'type': type,
    'words': words,
    'inputuser': 'admin',
    'inputtime': '2020-05-13 00:00:00'
  }, {
    'id': 2,
    'type': type,
    'words': words,
    'inputuser': 'admin111',
    'inputtime': '2020-05-13 00:00:00'
  }, {
    'id': 3,
    'type': type,
    'words': words,
    'inputuser': 'admin222',
    'inputtime': '2020-05-13 00:00:00'
  }, {
    'id': 4,
    'type': type,
    'words': words,
    'inputuser': 'admin333',
    'inputtime': '2020-05-13 00:00:00'
  }]

  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    type: type,
    words: words
  })
}

const sensitiveAdd = (options) => {
  /**
   * post参数:
    {
      "info":{
          "type":"",
          "words":""
      }
    }
   */
  return builder('操作成功')
}

const sensitiveEdit = (options) => {
  /**
   * post参数:
    {
      "id":"",
      "info":{
          "words":""
      }
    }
   */
  return builder('操作成功')
}

const sensitiveDelete = (options) => {
  /**
   * get参数:
    {
      "id":"",
    }
   */
  const parameters = getQueryParameters(options)
  const id = parameters.id
  return builder({ id: id }, '操作成功')
}

const blacklistInit = (options) => {
  /**
   * 查询方式: get
   * 默认排序: { field: 'id', order: 'ascend' }
   * 查询参数:
    {
      status: '',//0 全部 ；1 待审核；2 已生效；3 已失效
      visiter_name: '',
    }
   */
  const parameters = getQueryParameters(options)
  const status = parameters.type || 0
  const visiterName = parameters.visiter_name || '1111'

  const result = []
  const pageNo = parseInt(parameters.pageNo)
  const pageSize = parseInt(parameters.pageSize)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? (totalCount % pageSize) : pageSize) + 1

  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    result.push({
      'id': tmpKey,
      'visiter_id': tmpKey,
      'visiter_name': visiterName,
      'conversation_id': 1,
      'input_user': '',
      'input_time': '2020-05-14 00:00:00',
      'remarks': '',
      'check_user': '',
      'start_time': '2020-05-08',
      'end_time': '2020-05-30',
      'b_start_time': null,
      'b_end_time': null
    })
  }

  return builder({
    pageNo: pageNo,
    totalCount: totalCount,
    data: result,
    status: status,
    visiter_name: visiterName
  })
}

const blacklistDelete = (options) => {
  /**
   * get参数:
    {
      "id":"2",
    }
   */

  return builder('操作成功')
}

const blacklistEdit = (options) => {
  /**
   * post参数:
    {
      "id":"1",
      "info":{
          "end_time":"2020-05-30"
      }
    }
   */

  return builder('操作成功')
}

const eventMychatdata = (options) => {
  /**
   * 查询方式: get
   * 默认排序: 无
   * 查询参数:
    {
      visiter_id: '',
      cid: '',
      start_time: '',
      end_time: '',
    }
   */
  const parameters = getQueryParameters(options)
  const visiterId = parameters.visiter_id
  const cid = parameters.cid
  const startTime = parameters.start_time
  const endTime = parameters.end_time

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
      'content': '1',
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
    cid: cid,
    start_time: startTime,
    end_time: endTime
  })
}

const settingBase = (options) => {
  // 全局设置 基础设置 保存
  /**
   * post参数:
    {
    "info":{
        "reconsult":"1",
        "reconsultTime":"8",
        "worktimeMode":"1",
        "humanUnworkTips":"现在是下班时间",
        "conversationTransferConfirm":"1",
        "conversationCloseConfirm":"1",
        "visiterInputing":"1",
        "conversationTimeoutClose":"0",
        "conversationTimeoutTime":"3",
        "conversationTimeoutRemindService":"0",
        "conversationTimeoutRemindTips":"您好，因为长时间未收到您的消息，本次会话将自动结束，如需继续咨询请重新连接客服",
        "conversationAutoClose":"1",
        "conversationAutoCloseTime":"5",
        "weixinRoute":""
    }
}
   */

  // 全局设置 提示语设置 保存
  /**
   * post参数:
    {
    "info":{
        "webHumanWelcome":"您好，很高兴为您服务-web",
        "webHumanJoinTips":"001号客服为您服务",
        "webVisiterLeaveTips":"访客离开，本次会话已经结束",
        "webConversationTimeoutTips":"本次会话已超时结束，如需继续咨询请重新连接客服",
        "webServiceOfflineTips":"本次会话已被客服结束，如需继续咨询请重新连接客服",
        "webServiceCloseConversationTips":"本次会话已被客服结束，如需继续咨询请重新连接客服",
        "webQueueWaitTips":"您好，当前正在排队，您可以先简单描述您的问题-ok1",
        "webTransRobotTips":"0",
        "webBlacklistTips":"当前所有客服都忙，请稍候再试……ok"
    }
}
   */

  // 全局设置 满意度设置 保存
  /**
   * post参数:
    {
    "info":{
        "commentWeb":"1",
        "commentApp":"1",
        "commentWx":"1",
        "commentWb":"1",
        "commentEnabled":"1",
        "commentGuide":"请您对本次服务进行评价"
    }
}
   */

  // 全局设置 统计设置 保存
  /**
   * post参数:
    {
    "info":{
        "solveGroup":"0",
        "solveValid":"1",
        "solveCycle":"12",
        "validVisiterMessages":"1",
        "validServiceMessages":"4"
    }
}
   */

  // 全局设置 留言设置 保存
  /**
   * post参数:
    {
    "info":{
        "message":"0",
        "messageWeb":"当前没有客服在线，如需帮助请留言",
        "messageApp":"当前没有客服在线，如需帮助请留言",
        "messageWx":"当前没有客服在线，如需帮助请留言",
        "messageWb":"当前没有客服在线，如需帮助请留言"
    }
}
   */
  return builder('操作成功')
}

Mock.mock(/\/chat\/user\/init/, 'get', userInit) // 客服设置列表
Mock.mock(/\/chat\/group\/groupList/, 'get', groupGroupList)// 客服设置 / 全局设置 获取所属分组
Mock.mock(/\/chat\/user\/add/, 'post', userAdd)// 客服设置添加提交
Mock.mock(/\/chat\/user\/edit/, 'post', userEdit)// 客服设置编辑
Mock.mock(/\/chat\/user\/delete/, 'get', userDelete)// 客服设置删除

Mock.mock(/\/chat\/group\/init/, 'get', groupInit)// 技能组设置列表
Mock.mock(/\/chat\/group\/add/, 'post', groupAdd)// 技能组设置列表
Mock.mock(/\/chat\/group\/edit/, 'post', groupEdit)// 技能组设置编辑保存
Mock.mock(/\/chat\/group\/delete/, 'get', groupDelete)// 技能组设置删除
Mock.mock(/\/chat\/mobile\/index/, 'get', mobileIndex)// 技能组设置发起会话手机端
Mock.mock(/\/chat\/setting\/robot/, 'get', settingRobot)// 技能组设置编辑获取机器人

Mock.mock(/\/chat\/setting\/robotKnowledgeCategory/, 'get', settingRobotKnowledgeCategory)// 机器人设置机器人知识库 树列表
Mock.mock(/\/chat\/setting\/robotKnowledgeContent/, 'get', settingRobotKnowledgeContent)// 机器人设置机器人知识库 知识列表
Mock.mock(/\/chat\/setting\/robotKnowledgeStudy/, 'get', settingRobotKnowledgeStudy)// 机器人设置机器人学习 知识列表
Mock.mock(/\/chat\/setting\/robotKnowledgeUnknown/, 'get', settingRobotKnowledgeUnknown)// 机器人设置未知问题学习 列表
Mock.mock(/\/chat\/setting\/robotKnowledgeIgnore/, 'get', settingRobotKnowledgeIgnore)// 机器人设置永久忽略问题 列表

Mock.mock(/\/chat\/reply\/init/, 'get', replyInit)// 快捷回复

Mock.mock(/\/chat\/sensitive\/init/, 'get', sensitiveInit)// 敏感词 列表
Mock.mock(/\/chat\/sensitive\/add/, 'post', sensitiveAdd)// 敏感词 添加
Mock.mock(/\/chat\/sensitive\/edit/, 'post', sensitiveEdit)// 敏感词 编辑
Mock.mock(/\/chat\/sensitive\/delete/, 'get', sensitiveDelete)// 敏感词 删除

Mock.mock(/\/chat\/blacklist\/init/, 'get', blacklistInit)// 黑名单
Mock.mock(/\/chat\/blacklist\/delete/, 'get', blacklistDelete)// 黑名单 删除
Mock.mock(/\/chat\/blacklist\/edit/, 'get', blacklistEdit)// 黑名单 审核
Mock.mock(/\/chat\/event\/mychatdata/, 'get', eventMychatdata)// 黑名单 会话记录

Mock.mock(/\/chat\/setting\/base/, 'post', settingBase)// 全局设置  保存
