<template>
  <a-layout class="components-layout-demo-custom-trigger" style="background: #FFFFFF;">
    <a-layout-sider
      class="knowledge"
      v-model="collapsed"
      :trigger="null"
      :inline-collapsed="collapsed"
      :collapsedWidth="0"
      :width="300"
      style="margin-right: 10px;"
    >
      <IndexInitCommonTree :type="typeCopy" @ok="changeType"/>
    </a-layout-sider>
    <a-layout>
      <a-layout-content
        :style="{ margin: 0, padding: 0, background: '#fff', minHeight: '657px' }"
      >
        <IndexInitCommonSelect
          :params="params"
          :page="page"
          ref="indexInitCommonSelect"
          :treeId="treeId"
          :delIdArr="delIdArr"
          @ok="handleSearch" />
        <IndexInitCommonList
          :params="params"
          :page="page"
          :type="type"
          :categoryid="categoryid"
          @ok="getDelId"
          @read="handleRead"
          :style="{padding: '10px'}"
        />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  components: {
    IndexInitCommonSelect: () => import('./IndexInitCommonSelect'),
    IndexInitCommonTree: () => import('./IndexInitCommonTree'),
    IndexInitCommonList: () => import('./IndexInitCommonList')
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    page: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      collapsed: false,
      categoryid: 0,
      category: '所有分类',
      typeCopy: '',
      params: {},
      delIdArr: [],
      treeId: []
    }
  },
  methods: {
    // 搜索栏
    handleSearch (sort, words, theme, status, auditStatus, dateStatus) {
      let data = {}
      if (status || status === '') {
        data = { sort, words, theme, status }
      } else if (auditStatus) {
        data = { sort, words, theme, auditStatus, dateStatus }
      } else {
        data = { sort, words, theme }
      }
      this.params = Object.assign(this.params, data)
      this.params = JSON.parse(JSON.stringify(this.params))
    },
    // 选择导航栏标签
    changeType (categoryid, category, treeId) {
      this.categoryid = categoryid
      this.category = category
      this.params.categoryid = categoryid
      this.params.type = this.type
      this.params.theme = null
      this.params = JSON.parse(JSON.stringify(this.params))
      this.treeId = treeId
    },
    getDelId (arr) {
      this.delIdArr = arr
    },
    // 已读知识
    handleRead () {
      this.$refs.indexInitCommonSelect.reset()
      this.$emit('read')
    }
  }
}
</script>
<style scoped>
.componets-layout-demo-custom-trigger{
  width: 100%;
}
/* 自定义触发器样式 */
.components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}
.components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}
/* 侧边栏样式 */
.components-layout-demo-custom-trigger aside{
  max-height: 100%;
  overflow: auto;

}
/* 侧边栏中树选择器样式 */
.components-layout-demo-custom-trigger aside .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected{
  background: #52c41a;
}
.knowledge.ant-layout-sider.ant-layout-sider-dark {
  background: #fff;
}
.knowledge.ant-tree-node-content-wrapper.ant-tree-node-content-wrapper-open.ant-tree-node-selected{
  color:#fff
}
.knowledge.ant-tree li .ant-tree-node-content-wrapper{
  height: 32px;
  line-height:32px;
}
.knowledge.ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left{
  border:none
}

</style>
