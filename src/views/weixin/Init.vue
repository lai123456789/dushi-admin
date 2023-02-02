<template>
  <a-card>
    <a-tabs>
      <a-tab-pane key="1">
        <span slot="tab">
          <a-icon type="wechat" />
          授权列表
        </span>
        <List ref="List"/>
      </a-tab-pane>
      <a-tab-pane key="2">
        <span slot="tab">
          <a-icon type="setting" />
          账户设置
        </span>
        <Account ref="Account" />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script>
export default {
  components: {
    List: () => import('./List'),
    Account: () => import('./Account') },
  data: function () {
    return {

    }
  }
}
</script>
