<template>
  <a-form :form="form">
    <!-- 报表 -->
    <a-table
      rowKey="id"
      :columns="columns"
      :data-source="dataSource"
      size="small"
      :pagination="false" >
      <template slot="title" >
        <div style="font-weight: bold; font-size: 16px;">今日统计</div>
      </template>
    </a-table>
    <a-row>
      <!-- 穿梭框 -->
      <a-form-item label="选择座席">
        <!-- 树组件 -->
        <a-tree
          v-decorator="['seat', { initialValue: checkedKeys, valuePropName: 'checkedKeys', rules: [{ required: true, message: '请选择坐席'}] }]"
          checkable
          :replaceFields="{ title:'text', key: 'nodedata' }"
          @check="treeCheck"
          :tree-data="treeData" />
      </a-form-item>
      <!-- 时间选择 -->
      <a-form-item label="选择时间">
        <a-range-picker
          v-decorator="['time', { initialValue: [moment(searchData.startTime), moment(searchData.endTime)], rules: [{ required: true, message: '请选择时间'}]}]"
          :ranges="{
            今天: [moment().startOf('day'), moment().endOf('day')],
            昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
            本周: [moment().startOf('week'), moment().endOf('week')],
            本月: [moment().startOf('month'), moment().endOf('month')],
          }"
          @change="getTime"
          :allowClear="false"
          :show-time="{ format: 'HH:mm:ss' }"
          format="YYYY-MM-DD HH:mm:ss" />
      </a-form-item>
      <a-form-item label="内部通话">
        <a-checkbox
          @change="getFiltration"
          v-decorator="['filtration',{ initialValue: searchData.filtration, valuePropName: 'checked', rules: [{ required: false, message: '请选择是否过滤'}]}]" >
          过滤内部通话
        </a-checkbox>
      </a-form-item>
      <a-button type="primary" @click="handleSubmit" html-type="submit">显示报表</a-button>
    </a-row>
  </a-form>
</template>
<script>
export default {
  data () {
    return {
      form: this.$form.createForm(this),
      columns: [
        { title: '总通话数', dataIndex: 'totalcall' },
        { title: '总通话时长', dataIndex: 'totaltime' },
        { title: '总呼入数', dataIndex: 'inbound' },
        { title: '总呼入时长', dataIndex: 'totalinboundtime' },
        { title: '总呼出数', dataIndex: 'outbound' },
        { title: '总呼出时长', dataIndex: 'totaloutboundtime' },
        { title: '内部通话总数', dataIndex: 'internal' },
        { title: '内部通话总时长', dataIndex: 'totaloutinternaltime' },
        { title: '平均呼入通话时长', dataIndex: 'avgtimein' },
        { title: '平均呼出通话时长', dataIndex: 'avgtimeout' },
        { title: '平均内部通话时长', dataIndex: 'avgtimeinternal' }
      ],
      dataSource: [],
      searchData: {},
      transferDataSource: [],
      treeDataInit: [],
      targetKeys: [],
      checkedKeys: [],
      checked: [],
      treeData: []
    }
  },
  created () {
    this.searchData = localStorage.seatSearch ? JSON.parse(localStorage.seatSearch) : this.searchData
    this.searchData.startTime = this.searchData.startTime ? this.searchData.startTime : this.moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
    this.searchData.endTime = this.searchData.endTime ? this.searchData.endTime : this.moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    this.$emit('load', true)
    this.axios({
      url: '/cdrstat/Index/init'
    }).then(res => {
      this.$emit('load', false)
      res.result.info.id = 0
      this.dataSource = [res.result.info]
      const users = []
      this.treeData = this.getTreeData(res.result.users, users)
      this.$emit('getUsers', users)
      this.checkedKeys = this.searchData.seat
    })
  },
  methods: {
    getTreeData (data, users) {
      const treeData = []
      data.forEach(item => {
        if (item.nodetype === 'user' && item.node.extension) {
          item.text = item.node.extension + '(' + item.text + ')'
          treeData.push(item)
          users.push(item)
        }
        if (item.nodetype === 'department' && item.children) {
          const obj = JSON.parse(JSON.stringify(item))
          delete obj.children
          obj.children = this.getTreeData(item.children, users)
          const flag = this.getFlag(item)
          if (flag) {
            treeData.push(obj)
          }
        }
      })
      return treeData
    },
    // 获取部门下面是否拥有有分机号的用户
    getFlag (item) {
      if (item.children) {
        const flag = item.children.some(child => {
          if (child.nodetype === 'department') {
            return this.getFlag(child)
          } else if (child.nodetype === 'user') {
            child.node = child.node ? child.node : {}
            return child.node.extension
          }
        })
        return flag
      } else {
        return false
      }
    },
    getData (data, users) {
      data.forEach(item => {
        item.key = item.nodedata
        item.title = item.text
        if (item.children) {
          this.getData(item.children, users)
        }
        if (item.nodetype === 'user') {
          if (item.node.extension) {
            item.text = item.node.extension + '(' + item.text + ')'
          } else {
            item = null
          }
          users.push(item)
        }
      })
    },
    treeCheck (checkedKeys, e) {
      const keyArr = []
      e.checkedNodes.forEach(item => {
        if (item.data.props.nodetype === 'user') {
          keyArr.push(item.data.props.nodedata)
        }
      })
      this.searchData.seat = keyArr
      this.form.setFieldsValue({ 'seat': checkedKeys })
    },
    // 选择时间
    getTime (moment, str) {
      this.searchData.startTime = str[0]
      this.searchData.endTime = str[1]
    },
    getFiltration (e) {
      this.searchData.filtration = e.target.checked
    },
    // 处理提交
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.searchData.filtration = values.filtration
          this.$emit('ok', this.searchData)
        }
      })
    }
  }
}
</script>
