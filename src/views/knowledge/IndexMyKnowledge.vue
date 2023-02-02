<template>
  <div>
    <a-card>
      <a-tabs size="small">
        <a-tab-pane tab="我创建的" key="1">
          <IndexInitCommon type="myCreated" page="myKnowledge" />
        </a-tab-pane>
        <a-tab-pane tab="我收藏的" key="2">
          <IndexInitCommon type="myCollected" page="myKnowledge" />
        </a-tab-pane>
        <a-tab-pane tab="我评论的" key="3">
          <IndexInitCommon type="myCommented" page="myKnowledge" />
        </a-tab-pane>
        <a-tab-pane tab="我报错的" key="4">
          <IndexInitCommon type="myRecordBug" page="myKnowledge" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>
<script>
export default {
  components: {
    IndexInitCommon: () => import('./IndexInitCommon')
  }
}
</script>
