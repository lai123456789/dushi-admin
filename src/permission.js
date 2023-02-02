import Vue from 'vue'
import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { setDocumentTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import VueCookies from 'vue-cookies'
Vue.use(VueCookies)
// 设置cookie的存储路径和生命周期
VueCookies.config('Session', process.env.VUE_APP_BASE_URL)
NProgress.configure({ showSpinner: false }) // NProgress Configuration
if (VueCookies.get('Login') !== 'true' && localStorage.getItem('rememberMe') !== 'true') {
  storage.remove(ACCESS_TOKEN)
}
router.beforeEach((to, from, next) => {
  Vue.prototype.currentRoute = to
  NProgress.start() // start progress bar
  const domTitle = store.getters.setting.title
  if (domTitle) {
    if (to.meta && to.meta.title) {
      setDocumentTitle(`${to.meta.title} - ${domTitle}`)
    } else {
      setDocumentTitle(`${domTitle}`)
    }
  }
  if (storage.get(ACCESS_TOKEN)) {
    /* has token */
    if (to.path === '/user/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => {
          const roles = res.result && res.result.role
          store.dispatch('GenerateRoutes', { roles }).then(() => {
            // 根据roles权限生成可访问的路由表
            // 动态添加可访问路由表
            router.addRoutes(store.getters.addRouters)
            // 请求带有 redirect 重定向时，登录自动重定向到该地址
            const redirect = decodeURIComponent(from.query.redirect || to.path)
            if (to.path === redirect) {
              // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
              next({ ...to, replace: true })
            } else {
              // 跳转到目的路由
              next({ path: redirect })
            }
          })
        }).catch(() => {
          next()
        })
      } else {
        next()
      }
    }
  } else {
    if (to.meta.requireLogin === false) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: '/user/login', query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
