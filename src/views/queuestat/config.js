const config = {
  answered: {
    reportInfo: {
      qname: '队列',
      starttime: '开始时间',
      endtime: '结束时间',
      periods: '时间段',
      total_holdtime: '总振铃时长',
      agv_holdtime: '平均振铃时长',
      total_duration: '总通话时长',
      agv_duration: '平均通话时长',
      division: '总呼入数/总接通数',
      allPercent: '整体接通率(总接通数÷总呼入数)'
    },
    tab: [{
      name: '队列接通统计',
      key: 'an_detail',
      head: [
        { title: '队列', dataIndex: 'dl', key: '1' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '接通次数比率', dataIndex: 'jtcsbl', key: 'connectCountPercentage', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetails', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '振铃时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' },
        { title: '录音', dataIndex: 'record', key: 'record', scopedSlots: { customRender: 'record' } }
      ]
    }, {
      name: '坐席接通统计',
      key: 'agent_detail',
      head: [
        { title: '坐席', dataIndex: 'zx', key: 'seat' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'completed' },
        { title: '接通次数比率', dataIndex: 'jtcsbl', key: 'connectCountPercent', customRender: (text) => text + '%' },
        { title: '通话时长', dataIndex: 'thsc', key: 'duration' },
        { title: '通话时长比率', dataIndex: 'thscbl', key: 'connectTimePercent', customRender: (text) => text + '%' },
        { title: '平均通话时长', dataIndex: 'pjth', key: 'callAverage' },
        { title: '等待时长', dataIndex: 'ddsc', key: 'holdtime' },
        { title: '平均等待时长  ', dataIndex: 'pjdd', key: 'waitAverageTime' },
        { title: '导出详细', dataIndex: 'dcxx', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '振铃时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' },
        { title: '录音', dataIndex: 'record', key: 'record', scopedSlots: { customRender: 'record' } }
      ]
    }, {
      name: '队列等待等级',
      key: 'an_level',
      head: [
        { title: '服务级别', dataIndex: 'fwjb', key: 'serviceLevel' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '接通次数比率', dataIndex: 'jtcsbl', key: 'connectCountPercent', customRender: (text) => text + '%' },
        { title: '增量', dataIndex: 'zl', key: 'increment' },
        { title: '增量比率', dataIndex: 'zlbl', key: 'incrementPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '振铃时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' },
        { title: '录音', dataIndex: 'record', key: 'record', scopedSlots: { customRender: 'record' } }
      ]
    }, {
      name: '通话时长等级',
      key: 'duration_level',
      head: [
        { title: '通话时长等级', dataIndex: 'thscdj', key: 'connectTimeLevel' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '接通次数比率', dataIndex: 'jtcsbl', key: 'connectCountPercent', customRender: (text) => text + '%' },
        { title: '等待时长', dataIndex: 'dsss', key: 'timeWait' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '振铃时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' },
        { title: '录音', dataIndex: 'record', key: 'record', scopedSlots: { customRender: 'record' } }
      ]
    }, {
      name: '队列挂断原因',
      key: 'cause_hangup',
      head: [
        { title: '挂断原因', dataIndex: 'gdyy', key: 'failReason' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '接通次数比率', dataIndex: 'jtcsbl', key: 'connectCountPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '振铃时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' },
        { title: '录音', dataIndex: 'record', key: 'record', scopedSlots: { customRender: 'record' } }
      ]
    }, {
      name: '队列呼叫详细',
      key: 'queueCallDeatil',
      head: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '振铃时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' },
        { title: '录音', dataIndex: 'record', key: 'record', scopedSlots: { customRender: 'record' } }
      ],
      headChild: [
        { title: '轨迹', dataIndex: 'gj', key: 'track' },
        { title: '时间', dataIndex: 'sj', key: 'time' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '事件', dataIndex: 'sj1', key: 'event' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '信息1', dataIndex: 'xx1', key: 'message1' },
        { title: '信息2', dataIndex: 'xx2', key: 'message2' },
        { title: '信息3', dataIndex: 'xx3', key: 'message3' },
        { title: '时间点', dataIndex: 'sjd', key: 'timePoint' }
      ]
    }]
  },
  unanswered: {
    reportInfo: {
      qname: '队列',
      starttime: '开始时间',
      endtime: '结束时间',
      periods: '时间段',
      time_out: '总超时数',
      abandon: '总放弃数',
      total_holdtime: '总振铃时长',
      agv_holdtime: '平均振铃时长',
      division: '总呼入数/总接通数',
      allPercent: '整体接通率(总接通数÷总呼入数)'
    },
    tab: [ {
      name: '队列等待等级',
      key: 'un_level',
      head: [
        { title: '服务级别', dataIndex: 'fwjb', key: 'serviceLevel' },
        { title: '未接次数', dataIndex: 'wjcs', key: 'failCount' },
        { title: '未接次数比率', dataIndex: 'wjcsbl', key: 'failCountPercent', customRender: (text) => text + '%' },
        { title: '增量', dataIndex: 'zl', key: 'increment' },
        { title: '增量比率', dataIndex: 'zlbl', key: 'incrementPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'dcxx', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '进入位置', dataIndex: 'jrwz', key: 'inSite' },
        { title: '退出位置', dataIndex: 'tcwz', key: 'outSite' },
        { title: '放弃原因', dataIndex: 'sj', key: 'quitReason' }
      ]
    }, {
      name: '队列未接统计',
      key: 'un_detail',
      head: [
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '未接次数', dataIndex: 'wjcs', key: 'failCount' },
        { title: '未接次数比率', dataIndex: 'wjcsbl', key: 'failCountPercent', customRender: (text) => text + '%' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quit' },
        { title: '放弃次数比率', dataIndex: 'fqcsbl', key: 'quitPercent', customRender: (text) => text + '%' },
        { title: '超时次数', dataIndex: 'cscs', key: 'overtimeCount' },
        { title: '超时次数比率', dataIndex: 'cscssbl', key: 'overtimeCountPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '进入位置', dataIndex: 'jrwz', key: 'inSite' },
        { title: '退出位置', dataIndex: 'tcwz', key: 'outSite' },
        { title: '放弃原因', dataIndex: 'sj', key: 'quitReason' }
      ]
    }, {
      name: '队列未接详细',
      key: 'un_agent',
      head: [
        { title: '来电号码', dataIndex: 'ldhm', key: 'name' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'age' },
        { title: '队列', dataIndex: 'dl', key: 'p1' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'x' },
        { title: '进入位置', dataIndex: 'jrwz', key: 'p2' },
        { title: '退出位置', dataIndex: 'tcwz', key: 'p3' },
        { title: '放弃原因', dataIndex: 'sj', key: 'p4' }
      ],
      headChild: [
        { title: '轨迹', dataIndex: 'gj', key: 'track' },
        { title: '时间', dataIndex: 'sj', key: 'time' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '事件', dataIndex: 'sj1', key: 'event' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '信息1', dataIndex: 'xx1', key: 'message1' },
        { title: '信息2', dataIndex: 'xx2', key: 'message2' },
        { title: '信息3', dataIndex: 'xx3', key: 'message3' },
        { title: '时间点', dataIndex: 'sjd', key: 'timePoint' }
      ]
    } ]
  },
  distribution: {
    reportInfo: {
      qname: '队列',
      starttime: '开始时间',
      endtime: '结束时间',
      periods: '时间段',
      total_times: '总呼叫数',
      total_holdtime: '总等待时长',
      agv_holdtime: '平均等待时长',
      an_times: '总接通数',
      division: '总放弃数 / 总超时数'
    },
    tab: [ {
      name: '分布统计',
      key: 'queue',
      head: [
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '呼入次数', dataIndex: 'hrcs', key: 'callCount' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quitCount' },
        { title: '超时次数', dataIndex: 'cscs', key: 'failCount' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '平均通话时长', dataIndex: 'pjthsc', key: 'connectAverageTime' },
        { title: '接通比例', dataIndex: 'jtbl', key: 'connectPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ]
    }, {
      name: '每月统计',
      key: 'month',
      head: [
        { title: '月', dataIndex: 'y', key: 'month' },
        { title: '呼入次数', dataIndex: 'hrcs', key: 'callCount' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quitCount' },
        { title: '超时次数', dataIndex: 'cscs', key: 'failCount' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '平均通话时长', dataIndex: 'pjthsc', key: 'connectAverageTime' },
        { title: '接通比例', dataIndex: 'jtbl', key: 'connectPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ]
    }, {
      name: '每周统计',
      key: 'week',
      head: [
        { title: '周', dataIndex: 'z', key: 'week' },
        { title: '呼入次数', dataIndex: 'hrcs', key: 'callCount' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quitCount' },
        { title: '超时次数', dataIndex: 'cscs', key: 'failCount' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '平均通话时长', dataIndex: 'pjthsc', key: 'connectAverageTime' },
        { title: '接通比例', dataIndex: 'jtbl', key: 'connectPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ]
    }, {
      name: '每天统计',
      key: 'day',
      head: [
        { title: '天', dataIndex: 't', key: 'day' },
        { title: '呼入次数', dataIndex: 'hrcs', key: 'callCount' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quitCount' },
        { title: '超时次数', dataIndex: 'cscs', key: 'failCount' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '平均通话时长', dataIndex: 'pjthsc', key: 'connectAverageTime' },
        { title: '接通比例', dataIndex: 'jtbl', key: 'connectPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ]
    }, {
      name: '小时统计',
      key: 'dhous',
      head: [
        { title: '小时', dataIndex: 'h', key: 'h' },
        { title: '呼入次数', dataIndex: 'hrcs', key: 'callCount' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quitCount' },
        { title: '超时次数', dataIndex: 'cscs', key: 'failCount' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '平均通话时长', dataIndex: 'pjthsc', key: 'connectAverageTime' },
        { title: '接通比例', dataIndex: 'jtbl', key: 'connectPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ]
    }, {
      name: '周天统计',
      key: 'weekday',
      head: [
        { title: '周天', dataIndex: 'zd', key: 'weekday' },
        { title: '呼入次数', dataIndex: 'hrcs', key: 'callCount' },
        { title: '接通次数', dataIndex: 'jtcs', key: 'connectCount' },
        { title: '放弃次数', dataIndex: 'fqcs', key: 'quitCount' },
        { title: '超时次数', dataIndex: 'cscs', key: 'failCount' },
        { title: '平均等待时长', dataIndex: 'pjddsc', key: 'waitAverageTime' },
        { title: '平均通话时长', dataIndex: 'pjthsc', key: 'connectAverageTime' },
        { title: '接通比例', dataIndex: 'jtbl', key: 'connectPercent', customRender: (text) => text + '%' },
        { title: '导出详细', dataIndex: 'exportDetail', key: 'exportDetails', scopedSlots: { customRender: 'exportDetails' } }
      ],
      headChild: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ]
    }, {
      name: '详细记录',
      key: 'detailCount',
      head: [
        { title: '来电电话', dataIndex: 'ldhm', key: 'callNumber' },
        { title: '来电时间', dataIndex: 'ldsj', key: 'callTime' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '等待时长', dataIndex: 'zlsc', key: 'waitTime' },
        { title: '通话时长', dataIndex: 'thsc', key: 'connectTime' },
        { title: '事件', dataIndex: 'sj', key: 'event' }
      ],
      headChild: [
        { title: '轨迹', dataIndex: 'gj', key: 'track' },
        { title: '时间', dataIndex: 'sj', key: 'time' },
        { title: '队列', dataIndex: 'dl', key: 'queue' },
        { title: '事件', dataIndex: 'sj1', key: 'event' },
        { title: '接听坐席', dataIndex: 'jtzx', key: 'callSeat' },
        { title: '信息1', dataIndex: 'xx1', key: 'message1' },
        { title: '信息2', dataIndex: 'xx2', key: 'message2' },
        { title: '信息3', dataIndex: 'xx3', key: 'message3' },
        { title: '时间点', dataIndex: 'sjd', key: 'timePoint' }
      ]
    } ]
  }
}
const stateInit = {
  tab: {
    queueConnectCount: false,
    fQueueWaitLevel: false,
    distributeCount: false
  },
  tabChild: {
    // 队列接通状态
    queueConnectCount: false,
    seatConnectCount: false,
    queueWaitLevel: false,
    connectTimeLevel: false,
    queueFailReason: false,
    queueCallDeatil: false,
    // 队列未接状态
    fQueueWaitLevel: false,
    queueFailCount: false,
    queueFailDetal: false,
    // 队列分布状态
    distributeCount: false,
    monthCount: false,
    weekCount: false,
    dayCount: false,
    hourCount: false,
    weekdayCount: false,
    detailCount: false
  }
}
const stateDataInit = {
  an_detail: {},
  agent_detail: {},
  an_level: {},
  duration_level: {},
  cause_hangup: {},
  queueCallDeatil: {},
  // 队列未接状态
  un_level: {},
  un_detail: {},
  un_agent: {},
  // 队列分布状态
  queue: {},
  month: {},
  week: {},
  day: {},
  dhous: {},
  weekday: {},
  detailCount: {}
}
export { config, stateInit, stateDataInit }
