<template>
  <div>
    <a-card>
      <a-tabs size="small">
        <a-tab-pane tab="公共知识库" key="1" >
          <IndexInitCommon type="public" page="init" />
        </a-tab-pane>
        <a-tab-pane tab="热门知识" key="2">
          <IndexInitCommon type="Hot" page="init" />
        </a-tab-pane>
        <a-tab-pane tab="最新知识" key="3">
          <IndexInitCommon type="Newest" page="init" />
        </a-tab-pane>
        <a-tab-pane tab="已过期知识" key="4">
          <IndexInitCommon type="pastDue" page="init" />
        </a-tab-pane>
        <a-tab-pane v-if="$auth('all')" :tab="'未读知识(' + total + ')'" key="5">
          <IndexInitCommon type="waitRead" page="init" @read="handleRead" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>
<script>
export default {
  components: {
    IndexInitCommon: () => import('./IndexInitCommon')
  },
  data () {
    return {
      total: 0
    }
  },
  created () {
    this.axios({
      url: '/knowledge/index/init',
      params: {
        type: 'waitRead',
        page: 0,
        start: 0,
        limit: 20,
        categoryid: '0'
      }
    }).then(res => {
      this.total = res.result.totalCount
    })
  },
  methods: {
    handleRead () {
      this.total--
    }
  }
}
</script>
