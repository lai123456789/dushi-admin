<template>
  <a-card>
    <a-tabs>
      <a-tab-pane tab="客服设置" key="1">
        <User/>
      </a-tab-pane>
      <a-tab-pane tab="技能组设置" key="2">
        <Group/>
      </a-tab-pane>
      <a-tab-pane tab="机器人设置" key="3">
        <SettingRobot/>
      </a-tab-pane>
      <a-tab-pane tab="快捷回复" key="4">
        <Reply/>
      </a-tab-pane>
      <a-tab-pane tab="敏感词" key="5">
        <Sensitive/>
      </a-tab-pane>
      <a-tab-pane tab="黑名单" key="6">
        <Blacklist/>
      </a-tab-pane>
      <a-tab-pane tab="全局设置" key="7">
        <SettingBase/>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script>
export default {
  components: {
    User: () => import('./User'),
    Group: () => import('./Group'),
    SettingRobot: () => import('./SettingRobot'),
    Reply: () => import('./Reply'),
    Sensitive: () => import('./Sensitive'),
    Blacklist: () => import('./Blacklist'),
    SettingBase: () => import('./SettingBase')
  },
  data () {
    return {
    }
  }
}
</script>
