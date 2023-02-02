<template>
  <div>
    <a-spin :spinning="loading">
      <a-tabs default-active-key="1" tabPosition="left">
        <a-tab-pane key="1" tab="基础设置">
          <setting-base-base :parent="parent"/>
        </a-tab-pane>
        <a-tab-pane key="2" tab="提示语设置">
          <setting-tips :parent="parent"/>
        </a-tab-pane>
        <a-tab-pane key="3" tab="满意度设置">
          <setting-satisfaction :parent="parent"/>
        </a-tab-pane>
        <a-tab-pane key="4" tab="满意度内容">
          建设中...
        </a-tab-pane>
        <a-tab-pane key="5" tab="统计设置">
          <setting-statistics :parent="parent"/>
        </a-tab-pane>
        <a-tab-pane key="6" tab="留言设置">
          <setting-message :parent="parent"/>
        </a-tab-pane>
        <a-tab-pane key="7" tab="接入设置">
          仅限于公有云系统配置使用，不开放私有云系统配置
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </div>
</template>
<script>
export default {
  name: 'SettingBase',
  components: {
    SettingBaseBase: () => import('./SettingBaseBase'),
    SettingTips: () => import('./SettingTips'),
    SettingSatisfaction: () => import('./SettingSatisfaction'),
    SettingStatistics: () => import('./SettingStatistics'),
    SettingMessage: () => import('./SettingMessage')
  },
  data () {
    return {
      setting: {}, // 在线客服配置
      groupList: [], // 客户分组
      parent: this,
      loading: false
    }
  },
  created () {
    this.baseSetting()
    this.groupListApi()
  },
  methods: {
    baseSetting (data = {}) {
      this.loading = true
      this.axios({
        url: '/chat/setting/base',
        data: data
      }).then(res => {
        this.setting = res.result.setting
        this.loading = false
      })
    },
    groupListApi () {
      this.axios({
        url: '/chat/group/groupList',
        params: {}
      }).then(res => {
        this.groupList = res.result
      })
    },
    handleSubmit (data = {}) {
      this.baseSetting(data)
    }
  }
}
</script>
