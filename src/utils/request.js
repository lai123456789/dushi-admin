import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import Vue from 'vue'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 30000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    if (error.response.status === 500) {
      notification.error({
        message: '系统信息',
        description: '系统内部错误'
      })
    } else if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
  }
  return new Promise(() => { })
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  if (token) {
    config.headers['Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  config.headers['Dos-Requested-With'] = 'XMLHttpRequest'// ajax请求标识
  if (config.data) {
    // 当传递了data参数时自动使用post请求
    config.method = 'post'
  }
  if (Vue.prototype.mock) {
    const data = {
      url: config.url,
      data: config.data,
      params: config.params
    }
    console.log('%c请求参数=>', 'background-color: green; color: white; padding: 2px 5px; border-radius: 2px;', data)
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  if (response.data.code === 4001) {
    notification.error({
      message: '系统信息',
      description: response.data.message
    })
    if (storage.get(ACCESS_TOKEN)) {
      store.dispatch('Logout').then(() => {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      })
    } else {
      if (Vue.prototype.currentRoute.meta.requireLogin === false) {
        // loadPage加载页面时无须验证用户是否登录了系统，但加载的页面请求的后端接口可能又要求用户要登录系统，此处判断是为了避免页面跳转死循环
        setTimeout(() => {
          window.location.href = process.env.VUE_APP_BASE_URL
        }, 1500)
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    }
    return new Promise(() => {})
  }
  if (Vue.prototype.mock) {
    console.log('%c返回结果=>', 'background-color: green; color: white; padding: 2px 5px;', response.data)
  }
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
