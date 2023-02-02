export const listButton = [
  {
    attribute: `<a-button icon="plus" type= "primary " @click="parent.onShow({ title: '添加', url: '/admin/UserTable/add', tplviewid: '{$tplviewid}', width: '{$drawer_width}' })" >添加</a-button>`,
    bar_alias: 'sys_add',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '10',
    listorder: '10',
    menu_type: 'bar',
    name: '添加',
    style: 'primary'
  },
  {
    attribute:
      '<a-button icon="delete" @click="parent.onDelete()" type="danger" :disabled="parent.selectedRowKeys.length==0">批量删除</a-button>',
    bar_alias: 'sys_bulkdelete',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '20',
    listorder: '20',
    menu_type: 'bar',
    name: '批量删除',
    style: 'default'
  },
  {
    attribute: '<a-button icon="edit" @click="parent.onBulkEdit()">批量编辑</a-button>',
    bar_alias: 'sys_bulkedit',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '30',
    listorder: '30',
    menu_type: 'bar',
    name: '批量编辑',
    style: 'default'
  },
  {
    attribute: '<a-button icon="upload" @click="parent.onImport({barData: {$barData}})">导入</a-button>',
    bar_alias: 'bar_import',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '40',
    listorder: '40',
    menu_type: 'bar',
    name: '导入',
    style: 'default'
  },
  {
    attribute: '<a-button icon="download" @click="parent.onExport({barData: {$barData}})">导出</a-button>',
    bar_alias: 'bar_export',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '50',
    listorder: '50',
    menu_type: 'bar',
    name: '导出',
    style: 'default'
  },
  {
    attribute: `<a href= "javascript:;" @click= "parent.onShow({ title: '详情', url: '/admin/UserTable/edit', width: '{$drawer_width}', record: record }) ">详情</a>`,
    bar_alias: 'bar_detail',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '60',
    listorder: '60',
    menu_type: 'line',
    name: '详情',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.onDelete({ record: record })">删除</a>',
    bar_alias: 'sys_delete',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '70',
    listorder: '70',
    menu_type: 'line',
    name: '删除',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.onDelete({ record: record })">一键复制</a>',
    bar_alias: 'sys_copy',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '80',
    listorder: '80',
    menu_type: 'line',
    name: '一键复制',
    style: 'default'
  }
]
export const cardButton = [
  {
    attribute: `<a-button icon="plus" type= "primary" @click= "parent.onShow({ title: '添加', url: '/admin/UserTable/add', tplviewid: '{$tplviewid}', width: '{$drawer_width}' })">添加</a-button>`,
    bar_alias: 'sys_add',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '10',
    listorder: '10',
    menu_type: 'bar',
    name: '添加',
    style: 'primary'
  },
  {
    attribute:
      '<a-button icon="delete" @click="parent.onDelete()" type="danger" :disabled="parent.selectedRowKeys.length==0">批量删除</a-button>',
    bar_alias: 'sys_bulkdelete',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '20',
    listorder: '20',
    menu_type: 'bar',
    name: '批量删除',
    style: 'default'
  },
  {
    attribute: '<a-button icon="edit" @click="parent.onBulkEdit()">批量编辑</a-button>',
    bar_alias: 'sys_bulkedit',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '30',
    listorder: '30',
    menu_type: 'bar',
    name: '批量编辑',
    style: 'default'
  },
  {
    attribute: '<a-button icon="upload" @click="parent.onImport({barData: {$barData}})">导入</a-button>',
    bar_alias: 'bar_import',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '40',
    listorder: '40',
    menu_type: 'bar',
    name: '导入',
    style: 'default'
  },
  {
    attribute: '<a-button icon="download" @click="parent.onExport({barData: {$barData}})">导出</a-button>',
    bar_alias: 'bar_export',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '50',
    listorder: '50',
    menu_type: 'bar',
    name: '导出',
    style: 'default'
  },
  {
    attribute: `<a href= "javascript:;" @click= "parent.onShow({ title: '详情', url: '/admin/UserTable/edit', width: '{$drawer_width}', record: record })">详情</a>`,
    bar_alias: 'bar_detail',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '60',
    listorder: '60',
    menu_type: 'line',
    name: '选中',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.onDelete({ record: record })">删除</a>',
    bar_alias: 'sys_delete',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '70',
    listorder: '70',
    menu_type: 'line',
    name: '删除',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.onDelete({ record: record })">一键复制</a>',
    bar_alias: 'sys_copy',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '80',
    listorder: '80',
    menu_type: 'line',
    name: '一键复制',
    style: 'default'
  }
]
export const workListButton = [
  {
    attribute: '<a-button icon="plus" type="primary" @click="parent.handleCrate()">创建流程</a-button>',
    bar_alias: 'flow_create',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '10',
    listorder: '10',
    menu_type: 'bar',
    name: '创建流程',
    style: 'primary'
  },
  {
    attribute: '<a-button icon="download" @click="parent.onExport({barData: {$barData}})">导出</a-button>',
    bar_alias: 'flow_export',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '20',
    listorder: '20',
    menu_type: 'bar',
    name: '导出',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleView(record)">查看</a>',
    bar_alias: 'flow_view',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '30',
    listorder: '30',
    menu_type: 'line',
    name: '查看',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleProcess(record)">办理</a>',
    bar_alias: 'flow_process',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '40',
    listorder: '40',
    menu_type: 'line',
    name: '办理',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleTakeFlow(record)">领取</a>',
    bar_alias: 'flow_take',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '50',
    listorder: '50',
    menu_type: 'line',
    name: '领取',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleRemarks(record)">备注</a>',
    bar_alias: 'flow_remarks',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '60',
    listorder: '60',
    menu_type: 'line',
    name: '备注',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleUrge(record)">催办</a>',
    bar_alias: 'flow_urge',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '70',
    listorder: '70',
    menu_type: 'line',
    name: '催办',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleRepeal(record)">取消</a>',
    bar_alias: 'flow_repeal',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '80',
    listorder: '80',
    menu_type: 'line',
    name: '取消',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleDelete(record)">删除</a>',
    bar_alias: 'flow_delete',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '90',
    listorder: '90',
    menu_type: 'line',
    name: '删除',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleJump(record)">流转</a>',
    bar_alias: 'flow_jump',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '100',
    listorder: '100',
    menu_type: 'line',
    name: '流转',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleTransfer(record)">转办</a>',
    bar_alias: 'flow_transfer',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '110',
    listorder: '110',
    menu_type: 'line',
    name: '转办',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleTakeProcess(record)">领办</a>',
    bar_alias: 'flow_takeprocess',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '120',
    listorder: '120',
    menu_type: 'line',
    name: '领办',
    style: 'default'
  }
]
export const subformButton = [
  {
    id: '10',
    listorder: '10',
    name: '添加',
    bar_alias: 'sys_add',
    bar_sys: '1',
    menu_type: 'bar',
    display: '1',
    style: 'primary',
    attribute: `<a-button icon="plus" type="primary" @click="parent.onShow({ title: '添加', url: '/admin/UserTable/add', tplviewid: '{$tplviewid}', width: '{$drawer_width}' })">添加</a-button>`,
    barmenupriv: ''
  },
  {
    id: '20',
    listorder: '20',
    name: '批量删除',
    bar_alias: 'sys_bulkdelete',
    bar_sys: '1',
    menu_type: 'bar',
    display: '0',
    style: 'default',
    attribute:
      '<a-button icon="delete" @click="parent.onDelete()" type="danger" :disabled="parent.selectedRowKeys.length==0">批量删除< /a-button>',
    barmenupriv: ''
  },
  {
    id: '30',
    listorder: '30',
    name: '导入',
    bar_alias: 'bar_import',
    bar_sys: '1',
    menu_type: 'bar',
    display: '0',
    style: 'default',
    attribute: '<a-button icon="upload" @click="parent.onImport({barData: {$barData}})">导入< /a-button>',
    barmenupriv: ''
  },
  {
    id: '40',
    listorder: '40',
    name: '详情',
    bar_alias: 'bar_detail',
    bar_sys: '1',
    menu_type: 'line',
    display: '1',
    style: 'default',
    attribute: `<a href="javascript:; " @click="parent.onShow({ title: '详情', url: '/admin/UserTable/edit', tplviewid: '{$tplviewid}', width: '{$drawer_width}', record: record }) ">详情</a>`,
    barmenupriv: ''
  },
  {
    id: '50',
    listorder: '50',
    name: '删除',
    bar_alias: 'sys_delete',
    bar_sys: '1',
    menu_type: 'line',
    display: '0',
    style: 'default',
    attribute: '<a href="javascript:;" @click="parent.onDelete({ record: record })">删除</a>',
    barmenupriv: ''
  },
  {
    id: '60',
    listorder: '60',
    name: '开窗选择',
    bar_alias: 'sys_subform',
    bar_sys: '1',
    menu_type: 'bar',
    display: '0',
    style: 'default',
    attribute: '<a-button icon="select" @click="parent.onSubform({barData: {$barData}})">开窗选择</a-button>',
    barmenupriv: ''
  }
]
export const menuAllData = [
  {
    id: 10,
    listorder: 10,
    name: '办理',
    bar_alias: 'bar_handle',
    bar_sys: '1',
    visible: '1',
    style: 'primary',
    attribute: '<a-button type="primary" :loading="parent.loading" @click="parent.handleSubmit">办理</a-button>',
    barmenupriv: ''
  },
  {
    id: 20,
    listorder: 20,
    name: '关闭',
    bar_alias: 'bar_cancel',
    bar_sys: 1,
    visible: '1',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleCancel">关闭</a-button>',
    barmenupriv: ''
  },
  {
    id: 30,
    listorder: 30,
    name: '转办',
    bar_alias: 'bar_complaint',
    bar_sys: '1',
    visible: '1',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleTransfer">转办</a-button>',
    barmenupriv: ''
  },
  {
    id: 40,
    listorder: 40,
    name: '传阅',
    bar_alias: 'bar_bcirculated',
    bar_sys: 1,
    visible: '0',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleSubmit">传阅</a-button>',
    barmenupriv: ''
  },
  {
    id: 50,
    listorder: 50,
    name: '特批',
    bar_alias: 'bar_special',
    bar_sys: 1,
    visible: '0',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleSubmit">特批</a-button>',
    barmenupriv: ''
  },
  {
    id: 60,
    listorder: 60,
    name: '取消',
    bar_alias: 'bar_repeal',
    bar_sys: 1,
    visible: '0',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleRepeal">取消</a-button>',
    barmenupriv: ''
  },
  {
    id: 70,
    listorder: 70,
    name: '退回发起人',
    bar_alias: 'bar_return',
    bar_sys: 1,
    visible: '0',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleSubmit">退回发起人</a-button>',
    barmenupriv: ''
  },
  {
    id: 80,
    listorder: 80,
    name: '备注',
    bar_alias: 'bar_remarks',
    bar_sys: 1,
    visible: '1',
    style: 'default',
    attribute: '<a-button type="default" :loading="parent.loading" @click="parent.handleRemarks">备注</a-button>',
    barmenupriv: ''
  }
]
export const extendButton = [
  {
    attribute: '<a-button type="primary" :loading="parent.loading" @click="parent.handleSubmit">保存</a-button>',
    bar_alias: 'sys_save',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '10',
    listorder: '10',
    name: '保存',
    style: 'primary'
  },
  {
    attribute: '<a-button @click="parent.visible=!parent.visible">关闭</a-button>',
    bar_alias: 'sys_cancel',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '20',
    listorder: '20',
    name: '关闭',
    style: 'default'
  }
]
export const workflowButton = [
  {
    attribute: '<a href="javascript:;" @click="parent.handleView(record)">查看</a>',
    bar_alias: 'flow_view',
    disabled: '1',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '30',
    listorder: '30',
    menu_type: 'line',
    name: '查看',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleProcess(record)">办理</a>',
    bar_alias: 'flow_process',
    disabled: '1',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '40',
    listorder: '40',
    menu_type: 'line',
    name: '办理',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleTakeFlow(record)">领取</a>',
    bar_alias: 'flow_take',
    disabled: '1',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '50',
    listorder: '50',
    menu_type: 'line',
    name: '领取',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleTakeProcess(record)">领办</a>',
    bar_alias: 'flow_takeprocess',
    disabled: '1',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '60',
    listorder: '60',
    menu_type: 'line',
    name: '领办',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleRemarks(record)">备注</a>',
    bar_alias: 'flow_remarks',
    bar_sys: '1',
    barmenupriv: '',
    display: '1',
    id: '70',
    listorder: '70',
    menu_type: 'line',
    name: '备注',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleUrge(record)">催办</a>',
    bar_alias: 'flow_urge',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '80',
    listorder: '80',
    menu_type: 'line',
    name: '催办',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleRepeal(record)">取消</a>',
    bar_alias: 'flow_repeal',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '90',
    listorder: '90',
    menu_type: 'line',
    name: '取消',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleJump(record)">流转</a>',
    bar_alias: 'flow_jump',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '100',
    listorder: '100',
    menu_type: 'line',
    name: '流转',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleTransfer(record)">转办</a>',
    bar_alias: 'flow_transfer',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '110',
    listorder: '110',
    menu_type: 'line',
    name: '转办',
    style: 'default'
  },
  {
    attribute: '<a href="javascript:;" @click="parent.handleDelete(record)">删除</a>',
    bar_alias: 'flow_delete',
    bar_sys: '1',
    barmenupriv: '',
    display: '0',
    id: '120',
    listorder: '120',
    menu_type: 'line',
    name: '删除',
    style: 'default'
  }
]
