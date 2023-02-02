<template>
  <a-card>
    <a-tabs size="small">
      <a-tab-pane tab="审核知识" key="1">
        <IndexInitCommon type="myAudited" page="manageKnowledge" />
      </a-tab-pane>
      <a-tab-pane tab="报错处理" key="2">
        <IndexInitCommon type="dealBug" page="manageKnowledge" />
      </a-tab-pane>
      <a-tab-pane tab="批量删除" key="4">
        <IndexInitCommon type="questions" page="manageKnowledge" />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script>

export default {
  components: {
    IndexInitCommon: () => import('./IndexInitCommon')
  }
}
</script>
