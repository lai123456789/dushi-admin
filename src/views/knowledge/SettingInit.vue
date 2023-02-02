<template>
  <a-card>
    <a-tabs size="small">
      <a-tab-pane tab="基础设置" key="1">
        <SettingInitFoundation/>
      </a-tab-pane>
      <a-tab-pane tab="分类设置" key="2">
        <SettingInitClassify/>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script>
export default {
  components: {
    SettingInitFoundation: () => import('./SettingInitFoundation'),
    SettingInitClassify: () => import('./SettingInitClassify')
  },
  data () {
    return {
    }
  }
}
</script>
