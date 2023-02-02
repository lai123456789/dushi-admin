<template>
  <a-card>
    <a-tabs>
      <a-tab-pane key="plane">
        <span slot="tab"><a-icon type="bars" />平面字典</span>
        <DictPlane ref="DictPlane"/>
      </a-tab-pane>
      <a-tab-pane key="tree">
        <span slot="tab"><a-icon type="apartment" />树形字典</span>
        <DictTree ref="DictTree" />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script>
export default {
  components: {
    DictTree: () => import('./DictTree'),
    DictPlane: () => import('./DictPlane')
  },
  data: function () {
    return {
    }
  }
}
</script>
