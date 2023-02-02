<template>
  <a-card>
    <a-card type="inner" title="基本信息" style="margin-bottom:20px;">
      <detail-list :col="1" v-if="status">
        <detail-list-item term="授权方昵称">{{ detail.nick_name }}</detail-list-item>
        <detail-list-item term="授权方头像"><img :src="detail.head_img" width="84" height="84"></detail-list-item>
        <detail-list-item term="授权方公众号类型">{{ detail.service_type_info }}</detail-list-item>
        <detail-list-item term="授权方认证类型">{{ detail.verify_type_info }}</detail-list-item>
        <detail-list-item term="公众号的主体名称">{{ detail.principal_name }}</detail-list-item>
        <detail-list-item term="二维码"><a-button type="primary" size="small" @click="showCode">点击查看</a-button></detail-list-item>
        <a-modal :visible="imagePreviewVisible" :footer="null" @cancel="imagePreviewVisible=!imagePreviewVisible">
          <img style="width: 100%" :src="detail.qrcode_url" />
        </a-modal>
        <detail-list-item term="解除授权"><a-button type="primary" size="small" @click="showInfo">点击解除</a-button></detail-list-item>
        <a-modal title="使用帮助" v-model="visible" @ok="handleOk">
          <a-list size="small" bordered :dataSource="info">
            <a-list-item slot="renderItem" slot-scope="item">{{ item }}</a-list-item>
            <div slot="header" class="header">如何解除微信公众号服务授权</div>
          </a-list>
        </a-modal>
      </detail-list>
      <div v-else>
        <img :src="image">
        <span style="display: inline-block;">
          <h4>你还未绑定{{ name }}</h4>
          <a-button type="primary" @click="authorize">立即授权</a-button>
        </span>
      </div>
    </a-card>
    <a-card type="inner" title="权限列表">
      <a-list size="small" bordered :dataSource="list" v-if="status">
        <a-list-item slot="renderItem" slot-scope="item">{{ item }}</a-list-item>
      </a-list>
      <h4 v-else>你还未绑定{{ name }}，请先进行授权</h4>
    </a-card>
  </a-card>
</template>
<script>
import DetailList from '@/components/DescriptionList'
import { mapGetters } from 'vuex'
const DetailListItem = DetailList.Item
const info = [
  '1.登录您的微信公众号后台，在左侧菜单栏处找到“设置--公众号设置”',
  '2.进入“公众号设置--授权管理”，点击“查看平台详情”',
  '3.点击“取消授权”按钮即可',
  '小程序解除绑定步骤类似'
]
export default {
  name: 'Official',
  components: {
    DetailList,
    DetailListItem
  },
  data () {
    return {
      name: '',
      detail: {},
      list: [],
      url: '',
      image: '',
      status: false,
      visible: false,
      imagePreviewVisible: false,
      info
    }
  },
  computed: {
    ...mapGetters(['setting'])
  },
  mounted () {
    this.getList()
  },
  methods: {
    getList () {
      this.axios({
        url: '/weixin/open/init',
        params: { type: this.$route.query.type }
      }).then(res => {
        if (res.status === true) {
          this.detail = res.result.detail
          this.list = res.result.list
          this.status = true
        } else {
          this.url = res.result.url
          this.image = this.setting.rootUrl + res.result.image
        }
        this.name = res.result.name
      })
    },
    authorize () {
      window.location.href = this.url
    },
    showInfo () {
      this.visible = true
    },
    handleOk (e) {
      this.visible = false
    },
    showCode () {
      this.imagePreviewVisible = true
    }
  }
}
</script>
