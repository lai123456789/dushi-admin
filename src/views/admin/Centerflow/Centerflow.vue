<template>
  <div style="height: 100%;">
    <a-tabs class="page-header">
      <a-tab-pane tab="进行中" key="1">
        <centerflow-init :proceed="proceed" :flowCondition="flowCondition"/>
      </a-tab-pane>
      <a-tab-pane :tab="setting.esCaseUrl ? '所有工单' : '已结束'" key="2">
        <centerflow-history :finish="finish"/>
      </a-tab-pane>
      <a-tab-pane tab="发起流程" key="5">
        <workflow-main />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    CenterflowInit: () => import('./CenterflowInit'),
    CenterflowHistory: () => import('./CenterflowHistory'),
    WorkflowMain: () => import('../WorkflowMain')
  },
  data () {
    return {
      proceed: [],
      finish: [],
      flowCondition: ''
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  created () {
    this.axios({
      url: 'admin/Centerflow/centerPriv'
    }).then(res => {
      if (res.result && res.result.searchPriv) {
        this.proceed = res.result.searchPriv.proceed
        this.finish = res.result.searchPriv.finish
        if (this.proceed.length > 0 && this.proceed.filter(item => item.priv === 'visit')[0]) {
          this.flowCondition = this.proceed.filter(item => item.priv === 'visit')[0].value
        }
      } else if (res.result && !res.result.searchPriv) {
        this.$message.error('未配置流程管理->参数设置，快捷筛选无法加载')
      }
    })
  }
}
</script>
<style lang="less" scoped>
/deep/.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content{
  height: 100%;
}
/deep/.page-header .ant-tabs-bar.ant-tabs-top-bar{
    margin-left: 8px;
}
</style>
