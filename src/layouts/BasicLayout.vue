<template>
  <a-spin
    class="globalSpin"
    :spinning="$store.state.app.globalSpin.spinning"
    :tip="$store.state.app.globalSpin.tip"
    :size="$store.state.app.globalSpin.size"
  >
    <a-layout :class="['layout', device, 'container']">
      <!-- SideMenu -->
      <side-menu mode="inline" :menus="menus" :theme="navTheme" :collapsed="collapsed" :collapsible="true" ></side-menu>
      <!-- layout content -->
      <a-layout-content :style="{ background: 'white', paddingLeft: contentPaddingLeft, display: 'flex', 'flex-direction': 'column' }">
        <!-- layout header -->
        <global-header
          :mode="layoutMode"
          :menus="menus"
          :theme="navTheme"
          :collapsed="collapsed"
          :device="device"
          @toggle="toggle" />
        <multi-tab v-if="multiTab" @refresh="onRefresh"></multi-tab>
        <transition-group name="page-transition" class="content" style="flex-grow: 1; overflow: auto; background: #f0f2f5; padding: 8px;">
          <route-view key="1" :routerKey="routerKey" />
          <div key="2" style="height: 100%" v-show="$route.query.url">
            <iframe
              v-for="(item, i) in iframeList"
              :key="i"
              :src="item"
              width="100%"
              height="100%"
              v-show="$route.query.url === item"
              frameborder="0" >
            </iframe>
          </div>
        </transition-group>
      </a-layout-content>
      <!-- Setting Drawer (show in development mode) -->
      <setting-drawer/>
      <audio-playback/>
    </a-layout>
  </a-spin>
</template>
<script>
import { triggerWindowResizeEvent } from '@/utils/util'
import { mapState, mapActions, mapGetters } from 'vuex'
import { mixin, mixinDevice } from '@/utils/mixin'
import { convertRoutes } from '@/utils/routeConvert'
// import { watermark } from '@/components/_util/watermark'
export default {
  name: 'BasicLayout',
  mixins: [mixin, mixinDevice],
  components: {
    RouteView: () => import('./RouteView'),
    SideMenu: () => import('@/components/Menu/SideMenu'),
    GlobalHeader: () => import('@/views/admin/Index/GlobalHeader'),
    SettingDrawer: () => import('@/components/SettingDrawer'),
    AudioPlayback: () => import('@/views/statistic/AudioPlayback')
  },
  data () {
    return {
      collapsed: false,
      menus: [],
      iframeList: [],
      routerKey: '',
      pages: {}
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.permission.addRouters
    }),
    ...mapGetters(['setting', 'userInfo']),
    contentPaddingLeft () {
      if (this.sidebarOpened) {
        return '256px'
      } else {
        return '80px'
      }
    }
  },
  watch: {
    sidebarOpened (val) {
      this.collapsed = !val
    },
    '$route': {
      handler (to, from) {
        if (typeof (this.pages[to.name]) === 'undefined') {
          this.pages[to.name] = to.name
        }
        this.routerKey = this.pages[to.name]
        if (this.$route.query.url && !this.iframeList.includes(this.$route.query.url)) {
          this.iframeList.push(this.$route.query.url)
        }
      },
      immediate: true
    }
  },
  created () {
    // watermark({ watermark_txt: this.$store.getters.userInfo.username })
    const routes = convertRoutes(this.mainMenu.find(item => item.path === '/'))
    this.menus = (routes && routes.children) || []
    this.collapsed = !this.sidebarOpened
    if (this.$route.query.url && !this.iframeList.includes(this.$route.query.url)) {
      this.iframeList.push(this.$route.query.url)
    }
  },
  methods: {
    ...mapActions(['setSidebar']),
    onRefresh () {
      this.pages[this.$route.name] = this.$route.name + '_' + (new Date().valueOf())
      this.routerKey = this.pages[this.$route.name]
    },
    toggle () {
      this.collapsed = !this.collapsed
      this.setSidebar(!this.collapsed)
      triggerWindowResizeEvent()
    }
  }
}
</script>
<style lang="less" scoped>
/*
 * The following styles are auto-applied to elements with
 * transition="page-transition" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the page transition by editing
 * these styles.
 */
.layout.ant-layout.container{
  height: 100%;
}
.page-transition-enter {
  opacity: 0;
}
.page-transition-leave-active {
  opacity: 0;
}
.page-transition-enter .page-transition-container,
.page-transition-leave-active .page-transition-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
.content{
  >:first-child{
    min-width: 1024px;
  }
}
.globalSpin {
  height: 100%;
  /deep/ .ant-spin-container {
     height: 100%;
  }
}
</style>
