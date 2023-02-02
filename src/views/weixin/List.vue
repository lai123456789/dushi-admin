<template>
  <div>

    <div class="table-operator">
      <a-button v-action:add icon="plus" @click="handleAdd" type="primary">添加授权</a-button>
      <a-button icon="sync" @click="() => {queryParam = {}, $refs.table.refresh(true)}" style="margin-right: 16px">刷新列表</a-button>
    </div>
    <s-table
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :sorter="{ field: 'id', order: 'descend' }">
      <template slot="head_img" slot-scope="text">
        <div @click="handleImagePreview(text)" style="border: 1px dashed #d9d9d9; border-radius: 5px; padding: 5px;">
          <img :src="text" style="width: 64px; height: 64px;" alt="授权方头像"/>
        </div>
      </template>
      <template slot="app_type" slot-scope="text">
        {{ text == 'weixin'? '公众号':'小程序' }}
      </template>
      <template slot="action" slot-scope="text, record">
        <a @click="handleLook(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="authorizationVisible = !authorizationVisible">解绑</a>
      </template>
    </s-table>
    <detail ref="detail"/>

    <a-modal :visible="imagePreviewVisible" :footer="null" @cancel="imagePreviewVisible = !imagePreviewVisible">
      <img alt="example" style="width: 100%" :src="imagePreviewUrl" />
    </a-modal>
    <a-modal :visible="authorizationVisible" @ok="authorizationVisible = !authorizationVisible" @cancel="authorizationVisible = !authorizationVisible" title="使用帮助">
      <a-list
        size="small"
        bordered
        :data-source="helpList"
      >
        <a-list-item slot="renderItem" slot-scope="item">
          {{ item }}
        </a-list-item>
        <div slot="header">
          如何解除微信公众号服务授权
        </div>
        <div slot="footer">
          小程序解除绑定步骤类似
        </div>
      </a-list>
    </a-modal>
  </div>
</template>
<script>
export default {
  components: { Detail: () => import('./Detail') },
  data () {
    return {
      imagePreviewVisible: false,
      imagePreviewUrl: '',
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 100,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60
      }, {
        title: '授权方头像',
        dataIndex: 'head_img',
        width: 90,
        scopedSlots: { customRender: 'head_img' }
      }, {
        title: '授权方昵称',
        dataIndex: 'nick_name'
      }, {
        title: '主体名称',
        dataIndex: 'principal_name'
      }, {
        title: '主体类型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'app_type' }
      }, {
        title: '授权方类型',
        dataIndex: 'service_type_info'
      }, {
        title: '授权方认证类型',
        dataIndex: 'verify_type_info'
      }],
      authorizationVisible: false,
      helpList: [
        '1.登录您的微信公众号后台，在左侧菜单栏处找到“设置--公众号设置”',
        '2.进入“公众号设置--授权管理”，点击“查看平台详情”',
        '3.点击“取消授权”按钮即可'
      ]
    }
  },
  created () {},
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/weixin/open/list',
        params: Object.assign(parameter)
      }).then(res => {
        return res.result
      })
    },
    // 添加授权
    handleAdd () {
      this.$refs.detail.show({
        action: 'add',
        title: '添加授权',
        url: '/weixin/open/init'
      })
    },
    // 查看授权
    handleLook (record) {
      this.$refs.detail.show({
        action: 'detail',
        title: '查看授权',
        record: record,
        url: '/weixin/open/detail'
      })
    },
    // 解除授权
    handleDelete (record) {
      const table = this.$refs.table
      const that = this
      this.$confirm({
        title: '您确认要解除' + record.nick_name + '的授权吗？',
        onOk () {
          that.axios({
            url: '/weixin/Open/unbind',
            params: { authorizerAppid: record.authorizer_appid }
          }).then(res => {
            if (res.code !== 0) {
              that.$message.warning(res.message)
            } else {
              table.refresh()
            }
          })
        }
      })
    },
    // 图片预览
    handleImagePreview (text) {
      this.imagePreviewUrl = text
      this.imagePreviewVisible = true
    }
  }
}
</script>
