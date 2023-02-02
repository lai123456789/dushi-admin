<template>
  <a-card>
    <a-tabs :activeKey="currentKey" @change="changeTabs" size="small">
      <!-- 队列搜索 -->
      <a-tab-pane key="search" tab="队列搜索">
        <a-form :form="form">
          <a-form-item label="选择时间">
            <a-range-picker
              @change="onChange"
              v-decorator="['info[time]', {
                initialValue: searchData.startTime ? [moment(searchData.startTime), moment(searchData.endTime)] : [moment().startOf('day'), moment().endOf('day')] ,
                rules: [{ required: true, message: '请选择时间'}]}]"
              :ranges="{
                今天: [moment().startOf('day'), moment().endOf('day')],
                昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                本周: [moment().startOf('week'), moment().endOf('week')],
                本月: [moment().startOf('month'), moment().endOf('month')],
              }"
              :allowClear="false"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
          <a-form-item label="选择坐席">
            <!-- 树组件 -->
            <a-tree
              :default-expanded-keys="['0-0']"
              v-decorator="['info[agent]', {initialValue: checkedKeys, valuePropName: 'checkedKeys', rules: [{ required: true, message: '请选择坐席'}]}]"
              checkable
              :replaceFields="{title:'name'}"
              @check="treeCheck"
              :tree-data="treeData" />
          </a-form-item>
          <a-button @click="handleSubmit" type="primary" html-type="submit">显示报表</a-button>
        </a-form>
      </a-tab-pane>
      <!-- 队列接通 -->
      <a-tab-pane key="answered" tab="队列接通">
        <QueueAnswer :searchData="searchData" :currentKey="currentKey" ref="answered" />
      </a-tab-pane>
      <!-- 队列未接 -->
      <a-tab-pane key="unanswered" tab="队列未接">
        <QueueUnanswer :searchData="searchData" :currentKey="currentKey" ref="unanswered" />
      </a-tab-pane>
      <!-- 队列分布 -->
      <a-tab-pane key="distribution" tab="队列分布">
        <QueueDistribute :searchData="searchData" :currentKey="currentKey" ref="distribution" />
      </a-tab-pane>
      <a-tab-pane key="priv" tab="权限设置">
        <queue-priv />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script>
import * as info from './config'
export default {
  components: {
    QueuePriv: () => import('./QueuePriv'),
    QueueAnswer: () => import('./QueueAnswer'),
    QueueUnanswer: () => import('./QueueUnanswer'),
    QueueDistribute: () => import('./QueueDistribute')
  },
  data () {
    return {
      form: this.$form.createForm(this),
      searchData: {
        startTime: '',
        endTime: '',
        agent: [],
        queue: []
      },
      changeFlag: false,
      config: {},
      treeData: [],
      currentKey: 'search',
      agent: [],
      queue: [],
      checkedKeys: [],
      startTime: '',
      endTime: ''
    }
  },
  // 树数据初始化
  created () {
    this.config = info.config
    this.searchData = localStorage.searchData ? JSON.parse(localStorage.searchData) : this.searchData
    this.axios({
      url: '/queuestat/index/qtree'
    }).then((res) => {
      if (res.result && res.result.length > 0) {
        const obj = { id: 0, name: '全部', pid: 0, type: 'all' }
        obj.children = res.result
        this.treeData = [obj]
        this.treeData[0].key = '0-0'
        this.checkedKeys = this.searchData.checkedKeys
      }
    })
  },
  methods: {
    // 选择时间
    onChange (moment, str) {
      this.searchData.time = moment
      this.searchData.startTime = str[0]
      this.searchData.endTime = str[1]
    },
    // 选择坐席
    treeCheck (checkedKeys, e) {
      this.searchData.agent = []
      this.searchData.queue = []
      for (let i = 0; i < checkedKeys.length; i++) {
        if (e.checkedNodes[i].data.props.type === 'agent') {
          const newName = e.checkedNodes[i].data.props.id + '###' + e.checkedNodes[i].data.props.name
          this.searchData.agent.push(newName)
        } else {
          if (e.checkedNodes[i].data.props.id !== 0) {
            const newName = e.checkedNodes[i].data.props.id + '###' + e.checkedNodes[i].data.props.name
            this.searchData.queue.push(newName)
          }
        }
      }
      this.searchData.checkedKeys = checkedKeys
      this.form.setFieldsValue({ 'info[agent]': checkedKeys })
      this.form.validateFields(['info[agent]'], (errors, values) => { })
    },
    // 显示报表
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.searchData.time = Object.assign({ ...this.searchData.time }, values.info.time)
          this.searchData.startTime = this.moment(this.searchData.time[0]).format('YYYY-MM-DD HH:mm:ss')
          this.searchData.endTime = this.moment(this.searchData.time[1]).format('YYYY-MM-DD HH:mm:ss')
          this.currentKey = 'answered'
          localStorage.searchData = JSON.stringify(this.searchData)
          this.$nextTick(() => {
            this.$refs.answered.init()
          })
        }
      })
    },
    // 切换
    changeTabs (key) {
      if (key === 'priv' || key === 'search') {
        this.currentKey = key
      } else {
        this.form.validateFields((errors, values) => {
          if (!errors) {
            if (this.searchData.agent && this.searchData.startTime) {
              this.currentKey = key
              this.$nextTick(() => {
                this.$refs[key].init()
              })
              localStorage.searchData = JSON.stringify(this.searchData)
            } else {
              this.$message.error('请先点击“显示报表”按钮获取相关信息')
            }
          } else {
            if (errors.info.time) {
              this.$message.error('请在“队列搜索”中选择时间')
            } else if (errors.info.agent) {
              this.$message.error('请在“队列搜索”中选择坐席')
            }
          }
        })
      }
    }
  }
}
</script>
