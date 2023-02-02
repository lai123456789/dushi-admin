import T from 'ant-design-vue/es/table/Table'
import get from 'lodash.get'
import VueDraggableResizable from 'vue-draggable-resizable'
import Vue from 'vue'
Vue.component('vue-draggable-resizable', VueDraggableResizable)
export default {
  data () {
    return {
      needTotalList: [],
      selectedRows: [],
      selectedRowKeys: [],
      parameterData: {},
      dataArray: [],
      localLoading: false,
      localDataSource: [],
      localPagination: Object.assign({}, this.pagination),
      // 记录上一次排序方式
      lastSorter: null
    }
  },
  props: Object.assign({}, T.props, {
    rowKey: {
      type: [String, Function],
      default: 'key'
    },
    data: {
      type: Function,
      required: true
    },
    autoLoad: {
      type: Boolean,
      default: true
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'default'
    },
    pageMode: {
      type: String,
      default: 'default'
    },
    alert: {
      type: Object,
      default () {
        /**
         * alert: {
         *   show: true,
         *   clear: Function
         * }
         */
        return {
          show: false,
          clear: () => {
            // 额外的代码
          }
        }
      }
    },
    components: {
      type: Object,
      default () {
        return {
          header: {
            cell: {}
          }
        }
      }
    },
    rowSelection: {
      type: Object,
      default: null
    },
    showPagination: {
      type: String | Boolean,
      default: 'auto'
    },
    showSome: {
      type: Boolean,
      default: false
    },
    /**
     * enable page URI mode
     *
     * e.g:
     * /users/1
     * /users/2
     * /users/3?queryParam=test
     * ...
     */
    pageURI: {
      type: Boolean,
      default: false
    },
    /**
     * 默认排序设置
     *
     * e.g:
     * { field: 'id',order: 'ascend' }
     * { field: 'id',order: 'descend' }
     */
    sorter: {
      type: Object,
      default () {
        return {}
      }
    }
  }),
  watch: {
    'localPagination.current' (val) {
      this.pageURI && this.$router.push({
        ...this.$route,
        name: this.$route.name,
        params: Object.assign({}, this.$route.params, {
          pageNo: val
        })
      })
    },
    pageNum (val) {
      Object.assign(this.localPagination, {
        current: val
      })
    },
    pageSize (val) {
      Object.assign(this.localPagination, {
        pageSize: val
      })
    },
    showSizeChanger (val) {
      Object.assign(this.localPagination, {
        showSizeChanger: val
      })
    }
  },
  created () {
    const { pageNo } = this.$route.params
    const localPageNum = this.pageURI && (pageNo && parseInt(pageNo)) || this.pageNum
    this.localPagination = ['auto', true].includes(this.showPagination) && this.pageMode !== 'simple' && Object.assign({}, this.localPagination, {
      current: localPageNum,
      pageSize: this.pageSize,
      showSizeChanger: this.showSizeChanger
    }) || false
    this.columns.forEach(item => {
      if (item.ellipsis === undefined) {
        item.ellipsis = true
      }
      if (item.customRender === undefined && item.scopedSlots === undefined) {
        item.customRender = (text, record, index) => {
          return (text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00' || text === '00:00:00') ? '--' : text
        }
      }
    })
    const draggingMap = {}

    this.columns.forEach(col => {
      draggingMap[col.key] = col.width
    })
    const draggingState = Vue.observable(draggingMap)
    this.components.header.cell = (h, props, children) => {
      let title = ''
      let thDom = null
      const { key, ...restProps } = props
      const col = this.columns.find(col => {
        title = col.title
        const k = col.dataIndex || col.key
        return k === key
      })
      if (!col || !col.width) {
        return <th {...restProps}>{children}</th>
      }
      const onDrag = x => {
        draggingState[key] = 0
        col.width = Math.max(x, 1)
        const i = title.length
        if (col.width < ((i * 14) + 14)) {
          col.width = (i * 14) + 14
        }
      }

      const onDragstop = () => {
        draggingState[key] = thDom.getBoundingClientRect().width
      }
      return (
        <th {...restProps} v-ant-ref={r => (thDom = r)} width={col.width} class="resize-table-th">
          {children}
          <vue-draggable-resizable
            key={col.key}
            class="table-draggable-handle"
            w={10}
            x={draggingState[key] || col.width}
            z={1}
            axis="x"
            draggable={true}
            resizable={false}
            onDragging={onDrag}
            onDragstop={onDragstop}
          ></vue-draggable-resizable>
        </th>
      )
    }
    this.needTotalList = this.initTotalList(this.columns)
    if (this.autoLoad) {
      this.loadData()
    }
  },
  methods: {
    /**
     * 表格重新加载方法
     * 如果参数为 true, 则强制刷新到第一页
     * @param Boolean bool
     */
    refresh (bool = false) {
      bool && (this.localPagination = Object.assign({}, {
        current: 1, pageSize: this.pageSize
      }))
      if (this.pageMode === 'simple') {
        this.localPagination = false
        if (!bool) {
          this.loadData({ current: this.parameterData.pageNo, pageSize: this.pageSize })
        } else {
          this.loadData()
        }
      } else {
        this.loadData()
      }
    },
    /**
     * 加载数据方法
     * @param {Object} pagination 分页选项器
     * @param {Object} filters 过滤条件
     * @param {Object} sorter 排序条件
     */
    loadData (pagination, filters, sorter) {
      if (sorter && sorter.columnKey) {
        if (!sorter.order) {
          sorter.order = this.lastSorter.order === 'descend' ? 'ascend' : 'descend'
        }
      } else {
        if (this.lastSorter) {
          sorter = this.lastSorter
        } else {
          sorter = this.sorter
        }
      }
      this.lastSorter = sorter
      // 设置columns排序图标
      this.columns.forEach((element, index) => {
        if (this.columns[index].dataIndex === sorter.field) {
          this.columns[index].sortOrder = sorter.order
        } else {
          this.columns[index].sortOrder = false
        }
      })
      this.localLoading = true
      const parameter = Object.assign({
        pageNo: (pagination && pagination.current) ||
          this.showPagination && this.localPagination.current || this.pageNum,
        pageSize: (pagination && pagination.pageSize) ||
          this.showPagination && this.localPagination.pageSize || this.pageSize
      },
      (sorter && sorter.field && {
        sortField: sorter.field
      }) || {},
      (sorter && sorter.order && {
        sortOrder: sorter.order
      }) || {}, {
        ...filters
      }
      )
      this.parameterData = JSON.parse(JSON.stringify(parameter))
      const result = this.data(parameter)
      // 对接自己的通用数据接口需要修改下方代码中的 r.pageNo, r.totalCount, r.data
      // eslint-disable-next-line
      if ((typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function') {

        result.then(r => {
          this.localPagination = this.showPagination && this.pageMode !== 'simple' && Object.assign({}, this.localPagination, {
            current: r.pageNo, // 返回结果中的当前分页数
            total: r.totalCount, // 返回结果中的总记录数
            showSizeChanger: this.showSizeChanger,
            showTotal: (total, range) => `显示第 ${range[0]} 条到 ${range[1]} 条记录, 一共 ${total} 条`,
            pageSize: (pagination && pagination.pageSize) ||
              this.localPagination.pageSize
          }) || false
          // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
          // if (r.data.length === 0 && this.showPagination && this.localPagination.current > 1) {
          // this.localPagination.current--
          // this.loadData()
          // return
          // }
          this.dataArray = r.data
          this.totalAll = r.totalCount
          // 这里用于判断接口是否有返回 r.totalCount 且 this.showPagination = true 且 pageNo 和 pageSize 存在 且 totalCount 小于等于 pageNo * pageSize 的大小
          // 当情况满足时，表示数据不满足分页大小，关闭 table 分页功能
          try {
            if ((['auto', true].includes(this.showPagination) && r.totalCount <= (r.pageNo * this.localPagination.pageSize))) {
              this.localPagination.hideOnSinglePage = false
            }
          } catch (e) {
            this.localPagination = false
          }
          this.localDataSource = r.data // 返回结果中的数组数据
          if (r.rowSelection) {
            // 根据接口返回值选中行
            this.setSelection(r.rowSelection.selectedRowKeys, r.rowSelection.rowKey)
          } else {
            // 选中上一次选中的行
            if (typeof (this.rowKey) === 'string') {
              this.setSelection(this.selectedRowKeys, this.rowKey)
            }
          }
          this.localLoading = false
        })
      }
    },
    initTotalList (columns) {
      const totalList = []
      columns && columns instanceof Array && columns.forEach(column => {
        if (column.needTotal) {
          totalList.push({
            ...column,
            total: 0
          })
        }
      })
      return totalList
    },
    /**
     * 用于更新已选中的列表数据 total 统计
     * @param selectedRowKeys
     * @param selectedRows
     */
    updateSelect (selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
      this.selectedRowKeys = selectedRowKeys
      const list = this.needTotalList
      this.needTotalList = list.map(item => {
        return {
          ...item,
          total: selectedRows.reduce((sum, val) => {
            const total = sum + parseInt(get(val, item.dataIndex))
            return isNaN(total) ? 0 : total
          }, 0)
        }
      })
    },
    /**
     * 清空 table 已选中项
     */
    clearSelected () {
      if (this.rowSelection) {
        this.rowSelection.onChange([], [])
        this.updateSelect([], [])
      }
    },
    // 设置 table 选中行 setSelection(['124', '125', '120'], 'id')
    setSelection (selectedRowKeys, key) {
      key = key || 'id'
      if (this.rowSelection) {
        const selectedRows = this.localDataSource.filter(item => {
          return selectedRowKeys.includes(item[key])
        })
        const newSelectedRowKeys = selectedRows.map(item => {
          return item[key]
        })
        this.rowSelection.onChange(newSelectedRowKeys, selectedRows)
        this.updateSelect(newSelectedRowKeys, selectedRows)
      }
    },
    /**
     * 处理交给 table 使用者去处理 clear 事件时，内部选中统计同时调用
     * @param callback
     * @returns {*}
     */
    renderClear (callback) {
      if (this.selectedRowKeys.length <= 0) return null
      return (
        <a style="margin-left: 24px" onClick={() => {
          callback()
          this.clearSelected()
        }}>清空</a>
      )
    },
    renderAlert () {
      // 绘制统计列数据
      const needTotalItems = this.needTotalList.map((item) => {
        return (<span style="margin-right: 12px">
          {item.title}总计 <a style="font-weight: 600">{!item.customRender ? item.total : item.customRender(item.total)}</a>
        </span>)
      })

      // 绘制 清空 按钮
      const clearItem = (typeof this.alert.clear === 'boolean' && this.alert.clear) ? (
        this.renderClear(this.clearSelected)
      ) : (this.alert !== null && typeof this.alert.clear === 'function') ? (
        this.renderClear(this.alert.clear)
      ) : null

      // 绘制 alert 组件
      return (
        <a-alert showIcon={true} style="margin-bottom: 16px">
          <template slot="message">
            <span style="margin-right: 12px">已选择: <a style="font-weight: 600">{this.selectedRows.length}</a></span>
            {needTotalItems}
            {clearItem}
          </template>
        </a-alert>
      )
    }
  },

  render () {
    const props = {}
    const localKeys = Object.keys(this.$data)
    Object.keys(T.props).forEach(k => {
      const localKey = `local${k.substring(0, 1).toUpperCase()}${k.substring(1)}`
      if (localKeys.includes(localKey)) {
        props[k] = this[localKey]
        return props[k]
      }
      if (k === 'rowSelection') {
        if (this.rowSelection) {
          // 如果需要使用alert，则重新绑定 rowSelection 事件
          props[k] = {
            ...this.rowSelection,
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              this.updateSelect(selectedRowKeys, selectedRows)
              typeof this[k].onChange !== 'undefined' && this[k].onChange(selectedRowKeys, selectedRows)
            }
          }
          return props[k]
        } else {
          // 如果没打算开启 rowSelection 则清空默认的选择项
          props[k] = null
          return props[k]
        }
      }
      this[k] && (props[k] = this[k])
      return props[k]
    })
    const table = (
      <a-table {...{ props, scopedSlots: { ...this.$scopedSlots } }} onChange={this.loadData} onExpand={ (expanded, record) => { this.$emit('expand', expanded, record) } }
        customRow={ (record, index) => {
          return {
            on: {
              click: (event) => {
                if (this.rowSelection) {
                  // 带复选框表格
                  if (typeof (this.rowKey) === 'string') {
                    this.selectedRowKeys = [record[this.rowKey]]
                    this.selectedRows = [record]
                    this.setSelection(this.selectedRowKeys, this.rowKey)
                  }
                } else {
                  // 无复选框表格
                  event.currentTarget.parentNode.querySelectorAll('tr').forEach(item => {
                    item.classList.remove('selected')
                  })
                  event.currentTarget.classList.add('selected')
                }
              }
            }
          }
        }}>
        { Object.keys(this.$slots).map(name => (<template slot={name}>{this.$slots[name]}</template>)) }
      </a-table>
    )
    let simple = (<span></span>)
    if (this.pageMode === 'simple') {
      const upDisabled = this.parameterData.pageNo === 1
      const downDisabled = this.dataArray.length < this.parameterData.pageSize
      const pageTotal = Math.ceil(this.totalAll / this.parameterData.pageSize)
      const indicator = <span></span>
      let current = this.parameterData.pageNo
      const loadNext = () => {
        current++
        this.loadData({ current: current })
      }
      const loadBefore = () => {
        current--
        this.loadData({ current: current })
      }
      const loadPageOn = (page) => {
        this.loadData({ current: page })
      }
      if (this.showSome) {
        const list = (page) => {
          const res = []
          if (pageTotal <= 10) {
            for (let i = 1; i < pageTotal + 1; i++) {
              res.push(<a-button size="small" type={current === i ? 'primary' : ''} onClick={() => { loadPageOn(i) }}>{i}</a-button>)
            }
          } else {
            if (page <= 6) {
              for (let i = 1; i < 11; i++) {
                res.push(<a-button size="small" type={current === i ? 'primary' : ''} onClick={() => { loadPageOn(i) }}>{i}</a-button>)
              }
            } else if (page > pageTotal - 4) {
              for (let i = pageTotal - 9; i < pageTotal + 1; i++) {
                res.push(<a-button size="small" type={current === i ? 'primary' : ''} onClick={() => { loadPageOn(i) }}>{i}</a-button>)
              }
            } else {
              for (let i = page - 5; i <= page; i++) {
                res.push(<a-button size="small" type={current === i ? 'primary' : ''} onClick={() => { loadPageOn(i) }}>{i}</a-button>)
              }
              for (let i = page + 1; i < page + 5; i++) {
                res.push(<a-button size="small" type={current === i ? 'primary' : ''} onClick={() => { loadPageOn(i) }}>{i}</a-button>)
              }
            }
          }

          return res
        }
        simple = (
          <a-spin spinning={this.localLoading} indicator={indicator}>
            <a-space style="text-align: right; height: 30px; width: 100%; justify-content: flex-end; margin-top: 8px">
              <span>一共 {this.totalAll} 条</span>
              <a-button disabled={upDisabled} size="small" onClick={loadBefore}>&lt;</a-button>
              {/* <a-icon type="left" onClick={upDisabled ? '' : loadBefore}/> */}
              {list(current)}
              {/* <a-icon type="right" onClick={downDisabled ? '' : loadNext}/> */}
              <a-button disabled={downDisabled} size="small" onClick={ loadNext }>&gt;</a-button>
            </a-space>
          </a-spin>
        )
      } else {
        simple = (
          <a-spin spinning={this.localLoading} indicator={indicator}>
            <a-space style="text-align: right; height: 30px; width: 100%; justify-content: flex-end; margin-top: 8px">
              <a-button disabled={upDisabled} onClick={loadBefore}>上一页</a-button>
              <a-button disabled={downDisabled} onClick={ loadNext }>下一页</a-button>
            </a-space>
          </a-spin>
        )
      }
    }
    return (
      <div class="table-wrapper">
        { this.alert.show ? this.renderAlert() : null }
        { table }
        { simple }
      </div>
    )
  }
}
