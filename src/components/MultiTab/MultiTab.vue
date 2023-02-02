<script>
import events from './events'

export default {
  name: 'MultiTab',
  data () {
    return {
      fullPathList: [],
      pages: [],
      activeKey: '',
      newTabIndex: 0
    }
  },
  created () {
    // bind event
    events.$on('open', val => {
      if (!val) {
        throw new Error(`multi-tab: open tab ${val} err`)
      }
      this.activeKey = val
    }).$on('close', val => {
      if (!val) {
        this.closeThat(this.activeKey)
        return
      }
      this.closeThat(val)
    }).$on('rename', ({ key, name }) => {
      try {
        const item = this.pages.find(item => item.path === key)
        item.meta.customTitle = name
        this.$forceUpdate()
      } catch (e) {
      }
    })

    this.pages.push(this.$route)
    this.fullPathList.push(this.$route.fullPath)
    this.selectedLastPath()
  },
  methods: {
    onEdit (targetKey, action) {
      this[action](targetKey)
    },
    remove (targetKey) {
      this.pages = this.pages.filter(page => page.fullPath !== targetKey)
      this.fullPathList = this.fullPathList.filter(path => path !== targetKey)
      // 判断当前标签是否关闭，若关闭则跳转到最后一个还存在的标签页
      if (!this.fullPathList.includes(this.activeKey)) {
        this.selectedLastPath()
      }
    },
    selectedLastPath () {
      this.activeKey = this.fullPathList[this.fullPathList.length - 1]
    },

    // content menu
    closeThat (e) {
      // 判断是否为最后一个标签页，如果是最后一个，则无法被关闭
      if (this.fullPathList.length > 1) {
        this.remove(e)
      } else {
        this.$message.info('这是最后一个标签了, 无法被关闭')
      }
    },
    closeLeft (e) {
      const currentIndex = this.fullPathList.indexOf(e)
      if (currentIndex > 0) {
        this.fullPathList.forEach((item, index) => {
          if (index < currentIndex) {
            this.remove(item)
          }
        })
      } else {
        this.$message.info('左侧没有标签')
      }
    },
    closeRight (e) {
      const currentIndex = this.fullPathList.indexOf(e)
      if (currentIndex < (this.fullPathList.length - 1)) {
        this.fullPathList.forEach((item, index) => {
          if (index > currentIndex) {
            this.remove(item)
          }
        })
      } else {
        this.$message.info('右侧没有标签')
      }
    },
    closeAll (e) {
      const currentIndex = this.fullPathList.indexOf(e)
      this.fullPathList.forEach((item, index) => {
        if (index !== currentIndex) {
          this.remove(item)
        }
      })
    },
    closeMenuClick (key, route, page) {
      this[key](route, page)
    },
    openNew (route, page) {
      let param = ''
      for (const key in page.query) {
        param = `${param}&${key}=${page.query[key]}`
      }
      const url = `${process.env.VUE_APP_BASE_URL}loadPage/?view=${page.meta.component}${param}`
      window.open(url)
    },
    onRefresh () {
      this.$emit('refresh')
    },
    renderTabPaneMenu (e, page) {
      return (
        <a-menu {...{ on: { click: ({ key, item, domEvent }) => { this.closeMenuClick(key, e, page) } } }}>
          <a-menu-item key="closeThat">关闭当前标签</a-menu-item>
          <a-menu-item key="closeRight">关闭右侧</a-menu-item>
          <a-menu-item key="closeLeft">关闭左侧</a-menu-item>
          <a-menu-item key="closeAll">关闭全部</a-menu-item>
          <a-menu-item key="openNew">新窗口打开</a-menu-item>
        </a-menu>
      )
    },
    // render
    renderTabPane (title, keyPath, page) {
      const menu = this.renderTabPaneMenu(keyPath, page)

      return (
        <a-dropdown overlay={menu} trigger={['contextmenu']}>
          <span style={{ userSelect: 'none' }}>{ title }</span>
        </a-dropdown>
      )
    }
  },
  watch: {
    '$route': function (newVal) {
      this.activeKey = newVal.fullPath
      if (this.fullPathList.indexOf(newVal.fullPath) < 0) {
        this.fullPathList.push(newVal.fullPath)
        this.pages.push(newVal)
      }
    },
    activeKey: function (newPathKey) {
      this.$router.push({ path: newPathKey })
    }
  },
  render () {
    const { onEdit, $data: { pages } } = this
    const panes = pages.map(page => {
      return (
        <a-tab-pane
          style={{ height: 0 }}
          key={page.fullPath} closable={pages.length > 1}
        >
          <span slot="tab">
            {this.renderTabPane(page.meta.customTitle || page.meta.title, page.fullPath, page)}
            <a-icon type="reload" v-show={page.fullPath === this.activeKey} class="reload" {...{ on: { click: () => { this.onRefresh() } } }} />
          </span>
        </a-tab-pane>)
    })

    return (
      <div class="ant-pro-multi-tab">
        <div class="ant-pro-multi-tab-wrapper">
          <a-tabs
            hideAdd
            type={'editable-card'}
            v-model={this.activeKey}
            tabBarStyle={{ background: '#FFF', margin: 0, paddingLeft: '16px', paddingTop: '1px' }}
            {...{ on: { edit: onEdit } }}>
            {panes}
          </a-tabs>
        </div>
      </div>
    )
  }
}
</script>
<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';

.ant-pro-multi-tab-wrapper /deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab.ant-tabs-tab-active{
  background-color: #f0f2f5;
  border-color: #e8e8e8;
  border-bottom-color: #f0f2f5;
}
.ant-pro-multi-tab-wrapper /deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab{
  background-color: #ffffff;
  border-left: 1px solid #ffffff;
  border-right: 1px solid #ffffff;
  border-top: 1px solid #ffffff;
  border-bottom: 1px solid #e8e8e8;
}
.reload{
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.65);
  transition-duration: .2s;
}
.reload:hover{
  color: @primary-color;
}
</style>
