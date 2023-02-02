import { isIE } from '@/utils/util'
import Vue from 'vue'
import config from '@/config/defaultSettings'
if (config.mock) {
  if (isIE()) {
    console.error('ERROR: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.')
  }
  Vue.prototype.mock = true
  // 使用同步加载依赖
  // 防止 vuex 中的 GetInfo 早于 mock 运行，导致无法 mock 请求返回结果
  console.log('mock mounting')
  const Mock = require('mockjs2')
  require('./admin/')
  require('./base/')
  require('./chat/')
  require('./exam/')
  require('./test/')

  Mock.setup({
    timeout: 800 // setter delay time
  })
  console.log('mock mounted')
}
