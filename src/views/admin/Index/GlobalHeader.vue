<template>
  <transition name="showHeader">
    <a-layout-header
      v-if="visible"
      class="header"
      style="display: flex; border-bottom: 1px solid #f0f0f0; padding: 0;" >
      <a-icon class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="toggle"/>
      <!-- 呼叫中心电话条 -->
      <div style="flex: 1; display: flex; align-items: center;">
        <div id="mypanel" style="width: 820px; line-height: normal;"></div>
      </div>
      <!-- 菜单导航搜索 -->
      <a-tooltip title="菜单导航搜索">
        <a-popover v-model="searchShow" trigger="click">
          <a-cascader
            slot="content"
            style="width: 300px"
            :options="menuShow"
            v-model="menuValue"
            :allowClear="false"
            :fieldNames="{ label: 'title', value: 'path', children: 'children' }"
            @change="menuJump"
            :show-search="{ filter }"
            placeholder="请输入菜单名称进行搜索"
          />
          <div class="message" @click="getMenuArray">
            <a-icon type="search" />
          </div>
        </a-popover>
      </a-tooltip>
      <!-- 未接来电 -->
      <a-tooltip v-if="userInfo.misscallMenu!==''">
        <template slot="title">未接来电</template>
        <div class="message" @click="missedCall">
          <a-icon type="customer-service" />
        </div>
      </a-tooltip>
      <!-- 消息中心 -->
      <a-tooltip v-if="userInfo.messageMenu!==''">
        <template slot="title">消息中心</template>
        <div class="message" @click="handleRemind">
          <a-badge :count="count" :offset="[6, -2]">
            <a-icon type="bell" class="icon" />
          </a-badge>
        </div>
      </a-tooltip>
      <!-- 新建工单 -->
      <a-tooltip v-if="setting.createOrder">
        <template slot="title">新建工单</template>
        <div class="message" @click="()=>{popVisible=!popVisible}">
          <a-icon type="plus" />
        </div>
      </a-tooltip>
      <!-- 用户信息菜单 -->
      <a-dropdown>
        <div class="message">
          <a-avatar class="avatar" size="small" :src="setting.rootUrl+userInfo.setting.headImage" style="margin-right: 6px;"/>
          <span>{{ userInfo.username }}</span>
        </div>
        <a-menu slot="overlay" class="user-dropdown-menu-wrapper">
          <a-menu-item key="0">
            <a href="javascript:;" @click="handleUserinfo">
              <a-icon type="user"/>
              <span>个人信息</span>
            </a>
          </a-menu-item>
          <a-menu-item key="3">
            <a href="javascript:;" @click="handleSetTheme">
              <a-icon type="setting"/>
              <span>主题设置</span>
            </a>
          </a-menu-item>
          <a-menu-item key="1">
            <a href="javascript:;" @click="()=>{copyrightVisible=!copyrightVisible}">
              <a-icon type="copyright"/>
              <span>关于我们</span>
            </a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="2">
            <a href="javascript:;" @click="handleLogout">
              <a-icon type="logout"/>
              <span>退出登录</span>
            </a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <a-modal title="关于我们" :width="500" :visible="copyrightVisible" @cancel="copyrightVisible=!copyrightVisible">
        <a-alert type="warning" message="警告: 本计算机程序受版权法及国际公约的保护，未经授权擅自复制或散布本程序的部分或全部，将承受严厉的民事和刑事处罚，对已知的违反者将给予法律范围内的全面制裁。"></a-alert>
        <a-space direction="vertical" style="width: 100%; margin-top: 16px">
          <a-row type="flex">
            <a-col flex="80px" style="text-align: right; color: #262626">产品名称：</a-col><a-col flex="1" style="color: #595959">{{ setting.title }}</a-col>
          </a-row>
          <a-row type="flex">
            <a-col flex="80px" style="text-align: right; color: #262626">版权所有：</a-col><a-col flex="1" style="color: #595959">{{ setting.copyright }}</a-col>
          </a-row>
          <a-row type="flex">
            <a-col flex="80px" style="text-align: right; color: #262626">Vue：</a-col><a-col flex="1" style="color: #595959">v{{ version }} / {{ release }}</a-col>
          </a-row>
          <a-row type="flex">
            <a-col flex="80px" style="text-align: right; color: #262626">Java：</a-col><a-col flex="1" style="color: #595959">v{{ setting.releaseVersion }} / {{ moment(setting.releaseTime).format('YYYY-MM-DD HH:mm:ss') }}</a-col>
          </a-row>
        </a-space>
        <div slot="footer">
          <a-button @click="copyrightVisible=!copyrightVisible">关闭</a-button>
        </div>
      </a-modal>
      <a-modal
        :width="400"
        :visible="popVisible"
        centered
        @ok="popFormSubmit"
        @cancel="popVisible=false">
        <template slot="title"><a-icon type="plus" /> 新建工单</template>
        <a-form ref="popForm" :form="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="客户手机号码">
            <a-input
              placeholder="请输入客户手机号码"
              @keyup.enter="popFormSubmit"
              v-decorator="['contactPhone',{initialValue:'',rules: [{ required: true, message: '电话号码不能为空'},{ validator: checkPhone}]}]"/>
          </a-form-item>
        </a-form>
      </a-modal>
      <Document></Document>
      <modal-user-info ref="modalUserInfo" :key="userKey" />
      <Preview ref="preview"/>
    </a-layout-header>
  </transition>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'GlobalHeader',
  components: {
    SMenu: () => import('@/components/Menu/'),
    ModalUserInfo: () => import('@/views/admin/User/UserInfo'),
    Document: () => import('./Document'),
    Preview: () => import('./Preview')
  },
  props: {
    mode: {
      type: String,
      // sidemenu, topmenu
      default: 'sidemenu'
    },
    menus: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    device: {
      type: String,
      required: false,
      default: 'desktop'
    }
  },
  data () {
    return {
      release: process.env.release,
      version: process.env.VUE_APP_VERSION,
      visible: true,
      searchShow: false,
      menuArray: [],
      menuShow: [],
      menuValue: undefined,
      oldScrollTop: 0,
      path: '',
      socket: '',
      count: 0,
      pinInterval: null,
      form: this.$form.createForm(this),
      copyrightVisible: false,
      popVisible: false,
      userKey: 'userKey'
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  mounted () {
    // 使用实例 window.top.view({filename: 'VIOMI牌MR1072-1000G型双出水净水器.pdf', authcode: '4c30943026ca2e32adac7cbb9a060fc7'})
    window.top.view = (config) => {
      this.$refs.preview.show(config)
    }
    window.mainFrame = true
    this.count = this.userInfo.remindCount
    this.path = this.setting.remind_websocket
    document.addEventListener('scroll', this.handleScroll, { passive: true })
    if (this.$store.getters.userInfo.extension) {
      const element = document.createElement('script')
      element.type = 'text/javascript'
      element.src = `${this.$store.getters.setting.interfaceurl}sdk/index/callcenter/?debug=0&extension=${this.$store.getters.userInfo.extension}&popscreen_callback=mypopscreen&control_container=mypanel`
      document.getElementsByTagName('head')[0].appendChild(element)
    }
    window.mypopscreen = (obj) => {
      const { popmethod, popurl, poptime } = this.$store.getters.setting
      if ((popmethod === 'All' || popmethod === obj.Method) && poptime === obj.Poptime) {
        let url
        const params = Object.keys(obj).map((key) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
        }).join('&')
        if (popurl.indexOf('http') === 0) {
          if (popurl.indexOf('?') === -1) {
            url = `${popurl}?${params}`
          } else {
            url = `${popurl}&${params}`
          }
        } else {
          url = `${process.env.VUE_APP_BASE_URL}CustomPage/?view=${popurl}&${params}`
        }
        window.open(url)
      }
    }
    // 初始化websocket
    if (this.path) {
      this.initWebSocket()
    }
  },
  destroyed () {
    clearInterval(this.pinInterval)
  },
  methods: {
    initWebSocket () {
      if (typeof (WebSocket) === 'undefined') {
        this.$notification.warning({
          message: '系统信息',
          description: '您的浏览器不支持WebSocket，将会导致系统部分功能无法正常使用，请升级浏览器版本或更换浏览器后重试。'
        })
      } else {
        // 实例化socket
        this.socket = new WebSocket(this.path)
        // 监听socket连接
        this.socket.onopen = () => {
          console.log(`onopen: ${this.path}`)
          const msg = `{"action":"subscribe","channel":"remind/${this.userInfo.username}"}`
          this.socket.send(msg)
          clearInterval(this.pinInterval)
          this.pinInterval = setInterval(() => {
            const msg = `{"action":"ping"}`
            this.socket.send(msg)
          }, 30000)
        }
        // 监听socket错误信息
        this.socket.onerror = () => {
          clearInterval(this.pinInterval)
          console.log('WebSocket连接错误')
        }
        // 监听socket关闭连接信息
        this.socket.onclose = () => {
          console.log('WebSocket连接关闭')
          clearInterval(this.pinInterval)
          setTimeout(() => {
            this.initWebSocket()
          }, 3000)
        }
        // 监听socket消息
        this.socket.onmessage = (msg) => {
          if (typeof msg.data === 'string') {
            try {
              var obj = JSON.parse(msg.data)
              if (typeof obj === 'object' && obj.data && obj.data.count) {
                this.count = obj.data.count
              }
            } catch (e) {
              // console.log('error：' + msg.data + '!!!' + e)
            }
          }
        }
      }
    },
    // 打开未接来电页面
    missedCall () {
      this.$router.push('/' + this.userInfo.misscallMenu)
    },
    menuJump (value) {
      const data = value[value.length - 1]
      const menu = this.menuArray.find(item => item.path === data)
      this.$router.push({ path: menu.path, query: menu.query })
      this.searchShow = false
      this.menuValue = undefined
    },
    filter (inputValue, path) {
      return path.some(option => option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    getMenuArray () {
      const addRouters = this.$store.getters.addRouters.filter(item => item.meta)[0].children
      const getChildren = (arr) => {
        arr.forEach(item => {
          item.title = item.meta.title
          if (item.children) {
            getChildren(item.children)
          }
          this.menuArray.push(item)
        })
      }
      getChildren(addRouters)
      this.menuShow = addRouters.filter(item => !item.hidden)
      this.searchShow = !this.searchShow
    },
    handleRemind () {
      this.$router.push('/' + this.userInfo.messageMenu)
    },
    handleScroll () {
      if (!this.autoHideHeader) {
        return
      }
      const scrollTop = document.body.scrollTop + document.documentElement.scrollTop
      if (!this.ticking) {
        this.ticking = true
        requestAnimationFrame(() => {
          if (this.oldScrollTop > scrollTop) {
            this.visible = true
          } else if (scrollTop > 300 && this.visible) {
            this.visible = false
          } else if (scrollTop < 300 && !this.visible) {
            this.visible = true
          }
          this.oldScrollTop = scrollTop
          this.ticking = false
        })
      }
    },
    handleSetTheme () {
      this.$setSetting({ themeShow: true })
    },
    toggle () {
      this.$emit('toggle')
    },
    ...mapActions(['Logout']),
    handleLogout () {
      this.$confirm({
        title: '您确认要退出登录吗 ?',
        onOk: () => {
          return this.Logout({}).then(() => {
            setTimeout(() => {
              window.location.reload()
            }, 16)
          }).catch(err => {
            this.$message.error({
              title: '错误',
              description: err.message
            })
          })
        },
        onCancel () {
        }
      })
    },
    checkPhone (rule, value, callback) {
      const str = '请输入正确的电话号码'
      if (value && !/^([+-]?)\d*\.?\d+$/.test(value)) {
        callback(str)
      } else {
        callback()
      }
    },
    handleUserinfo () {
      this.userKey = this.userKey === 'userKey' ? 'userKey_1' : 'userKey'
      this.$nextTick(() => {
        this.$refs.modalUserInfo.show()
      })
    },
    // 弹屏提交
    popFormSubmit () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          const CID = '' // 话务ID
          const CallerIDName = '' //
          const Poptime = 'Ring'
          const Callerid = '' // 响应坐席
          const Method = 'Dialout' // 方式
          const Server = '' // 服务工号
          const callFormPhone = ''
          const Recordfile = ''// 按键值路径
          const callTime = '' // 来电时间
          const CalleeIDName = '' // 来电姓名
          const CalleeidAdress = ''// 号码归属地
          const url = `${process.env.VUE_APP_BASE_URL}CustomPage/?view=` + this.setting.popurl +
                          '&Event=Popscreen&Poptime=' + Poptime +
                          '&Callerid=' + Callerid +
                          '&CallerIDName=' + CallerIDName +
                          '&CID=' + CID +
                          '&callFormPhone=' + callFormPhone +
                          '&CalleeIDName=' + CalleeIDName +
                          '&callTime=' + callTime +
                          '&Server=' + Server +
                          '&Calleeid=' + values.contactPhone +
                          '&Recordfile=' + Recordfile +
                          '&Method=' + Method +
                          '&CalleeidAdress=' + CalleeidAdress +
                          '&Uniqueid=' + this.uuid()
          window.open(url)
          this.$set(this, 'popVisible', false)
        }
      })
    },
    // 生成唯一ID
    uuid (n) {
      n = 1 // 生成一个唯一id，包含数字和字母
      var random = function () {
        // 生成10-12位不等的字符串
        return Number(
          Math.random()
            .toString()
            .substr(2)
        ).toString(36) // 转换成十六进制
      }
      var arr = []
      function createId () {
        var num = random()
        var _bool = false
        arr.forEach(v => {
          if (v === num) _bool = true
        })
        if (_bool) {
          createId()
        } else {
          arr.push(num)
        }
      }
      var i = 0
      while (i < n) {
        createId()
        i++
      }
      return arr[0] // 将生成的转为我们需要的字符串并赋值
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('scroll', this.handleScroll, true)
  }
}
</script>
<style lang="less" scoped>
@import '../../../components/index.less';
.header-animat{
  position: relative;
  z-index: @ant-global-header-zindex;
}
.showHeader-enter-active {
  transition: all 0.25s ease;
}
.showHeader-leave-active {
  transition: all 0.5s ease;
}
.showHeader-enter, .showHeader-leave-to {
  opacity: 0;
}
.message {
  user-select:none;
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  padding:  0 16px;
  cursor: pointer;
  line-height: 46px;
  &:hover{
    background-color: rgba(0, 0, 0, 0.1);
  }
  .icon {
    font-size: 16px;
    vertical-align: middle;
  }
}
.copyright{
  border-left: 1px solid #ACA899;
  border-top: 1px solid #ACA899;
  border-right: 2px solid #EEEDE5;
  border-bottom: 2px solid #EEEDE5;
  padding: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
