const path = require('path')
const webpack = require('webpack')
const createThemeColorReplacerPlugin = require('./config/plugin.config')
const resolve = dir => {
  return path.join(__dirname, dir)
}
const timestamp = new Date().getTime()
// 获取当前时间
const getDateTime = () => {
  const date = new Date()
  const Y = date.getFullYear() + '-'
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
  const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
  const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
  const strDate = Y + M + D + h + m + s
  return strDate
}
// vue.config.js
const vueConfig = {
  publicPath: process.env.VUE_APP_BASE_URL,
  runtimeCompiler: true,
  configureWebpack: {
    // webpack plugins
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    // 文件超过2M进行分包处理
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: module => {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`
            }
          }
        }
      }
    },
    // 百度地图 api属性
    externals: {
      'BMap': 'BMap',
      'BMapLib': 'BMapLib',
      'mapv': 'mapv'
    },
    output: {
      filename: `js/[name].[hash].${timestamp}.js`,
      chunkFilename: `js/[id].[chunkhash].${timestamp}.js`
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['process.env'].release = JSON.stringify(getDateTime())
      return args
    })
    config.plugins.delete('prefetch')
    config.resolve.alias.set('@$', resolve('src'))
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'svg/[name].[hash:8].[ext]'
      })
    config.module
      .rule('md-txt')
      .test(/\.(md|txt)$/)
      .use('html-loader')
      .loader('html-loader')
      .end()
      .use('markdown-loader')
      .loader('markdown-loader')
      .end()
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // less vars，customize ant design theme
          // 'primary-color': '#F5222D',
          // 'link-color': '#F5222D',
          'input-height-base': '28px', // input框高度
          'heading-color': 'fade(#000, 92%)', // 主题颜色调整
          'text-color': 'fade(#000, 85%)', // 主题颜色调整
          'text-color-secondary': 'fade(#000, 65%)', // 主题颜色调整
          'font-size-base': '13px', // 字体大小
          'btn-height-base': '28px', // 按钮高度
          'drawer-header-padding': '10px 16px', // 抽屉标题高度调整
          'table-header-bg-sm': '#fafafa', // 表格small样式表头背景颜色
          'card-head-background': '#fafafa', // card标题背景色
          'tabs-card-height': '32px', // tab按钮高度调整
          'tabs-bar-margin': '0 0 8px 0', // tab按钮与主体之间高度调整
          'border-radius-base': '2px'
        },
        // DO NOT REMOVE THIS LINE
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    // development server port 8000
    port: 8001,
    // If you want to turn on the proxy, please remove the mockjs /src/main.jsL11
    proxy: (() => {
      const module = [
        'app',
        'admin',
        'base',
        'cdrstat',
        'chat',
        'crm',
        'exam',
        'knowledge',
        'monitor',
        'queuestat',
        'sms',
        'statistic',
        'test',
        'weixin',
        'forum'
      ]
      const proxy = {}
      module.map(item => {
        proxy[`/${item}/`] = {
          // target: 'http://localhost/',
          target: 'http://dev.doscs.com/',
          // target: 'https://cy.doscs.com/',
          ws: false,
          changeOrigin: true
        }
      })
      return proxy
    })()
  },
  // disable source map in production
  productionSourceMap: false,
  lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}

// preview.pro.loacg.com only do not use in your production;
// if (process.env.VUE_APP_PREVIEW === 'true') {
//   console.log('VUE_APP_PREVIEW', true)
// add `ThemeColorReplacer` plugin to webpack plugins
vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
// }

module.exports = vueConfig
