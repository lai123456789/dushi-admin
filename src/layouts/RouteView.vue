<script>
export default {
  name: 'RouteView',
  props: {
    keepAlive: {
      type: Boolean,
      default: true
    },
    routerKey: {
      type: String,
      default: ''
    }
  },
  data () {
    return { }
  },
  render () {
    const { $route: { meta }, $store: { getters } } = this
    const inKeep = process.env.VUE_APP_COMPONENT_MULTIPLEX === 'false' ? (
      <keep-alive>
        <router-view />
      </keep-alive>
    ) : (
      <keep-alive>
        <router-view key={ this.routerKey } />
      </keep-alive>
    )
    const notKeep = (
      <router-view />
    )
    // 这里增加了 multiTab 的判断，当开启了 multiTab 时
    // 应当全部组件皆缓存，否则会导致切换页面后页面还原成原始状态
    // 若确实不需要，可改为 return meta.keepAlive ? inKeep : notKeep
    if (!getters.multiTab && !meta.keepAlive) {
      return notKeep
    }
    return this.keepAlive || getters.multiTab || meta.keepAlive ? inKeep : notKeep
  }
}
</script>
