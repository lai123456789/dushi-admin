<template>
  <a-layout class="components-layout-demo-custom-trigger">
    <a-layout style="background: #FFFFFF; min-height: 778px;">
      <a-layout-content style="padding: 20px;">
        <div>
          <a-input-search placeholder="请输入问题标题进行搜索" allowClear v-model="queryParam.keyword" @search="getDataList(1, 0)"/>
          <div style="padding-top: 10px; margin-bottom: 10px">
            <a-button v-for="(value, index) in sortRule" :key="index" style="margin-right: 10px" :type="searchIndex === index ? 'primary' : '' " @click="getDataList(1, index, value.rules)">{{ value.name }}</a-button>
          </div>
          <div>
          </div>
          <a-spin :spinning="loading">
            <div style="overflow: auto; height: calc(100% - 100px)">
              <a-list
                :data-source="dataList"
              >
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-list-item-meta>
                    <a
                      slot="title"
                      @click="showDetails(item)"
                      :style="{'font-weight': 'bold', 'font-size': '16px', 'text-decoration': item.stylechange ? 'underline' : 'none', color: item.stylechange ? '' : 'rgba(0, 0, 0, 0.92)'}"
                      @mouseenter="$set(item,'stylechange',true)"
                      @mouseleave="$set(item,'stylechange',false)">{{ item.title }}</a>

                    <div style="margin-top: 10px; user-select: none; color: rgba(0, 0, 0, 0.45)" slot="description">
                      <span><a-icon type="message" style="margin:0 3px 0 0;" /> {{ item.answer }} 个回答 </span>
                      <span><a-icon type="eye" style="margin:0 3px 0 8px;" />{{ item.views }} 浏览 </span>
                      <span style="float: right">提问时间: {{ item.inputtime }}</span>
                    </div>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </div>
          </a-spin>
        </div>
      </a-layout-content>
    </a-layout>
    <a-layout-sider
      class="knowledge"
      :trigger="null"
      :width="400"
      theme="light"
      style="margin-left: 10px; padding:20px"
    >
      <div style="padding-bottom: 10px">
        <img src="./question.png" style="width: 100%; height: auto"/>
      </div>
      <a-button style="width: 100%" type="primary" @click="questionAdd">我要提问</a-button>

      <a-card :bordered="false" style="margin-top: 20px; height: 200px; padding: 40px 0; background-color: #f5f5f5">
        <a-row type="flex">
          <a-col :span="7" style="text-align: center; line-height: 60px">
            <div>被赞同</div>
            <div style="font-size: 20px">{{ myData.myStarCount }}</div>
          </a-col>
          <a-col :span="1" style="text-align: center"><a-divider type="vertical" style="height: 100%; background-color: #d9d9d9"/></a-col>
          <a-col :span="8" style="text-align: center; line-height: 60px">
            <div>问题</div>
            <div style="font-size: 20px">{{ myData.myquestionCount }}</div>
          </a-col>
          <a-col :span="1" style="text-align: center"><a-divider type="vertical" style="height: 100%; background-color: #d9d9d9"/></a-col>
          <a-col :span="7" style="text-align: center; line-height: 60px">
            <div>回答</div>
            <div style="font-size: 20px">{{ myData.myanswerCount }}</div>
          </a-col>
        </a-row>
      </a-card>
      <a-divider />
      <div :style="{'font-weight': 'bold', 'font-size': '22px', color: 'rgba(0, 0, 0, 0.92)', 'margin-bottom': '20px'}">热门问题分类</div>
      <a-row>
        <a-button style="margin-right: 10px; font-size: 14px; padding: 0px 20px;margin-bottom: 10px;" v-for="value in hotCategroy" :key="value.number" @click="getDataList(1, searchIndex, sortRule[searchIndex].rules, value.number)">{{ value.name }}</a-button>
      </a-row>
    </a-layout-sider>
    <forum-detail ref="forumDetail" @ok="refreshList"/>
    <ask-questions ref="askQuestions" @ok="refreshList"/>
  </a-layout>
</template>
<script>

export default {
  components: {
    AskQuestions: () => import('./AskQuestions'),
    ForumDetail: () => import('./ForumDetail')
  },
  data () {
    return {
      loading: false,
      dataList: [],
      searchIndex: 0,
      hotCategroy: [],
      queryParam: {
        keyword: ''
      },
      sortRule: [],
      myData: {}
    }
  },
  created () {
    this.getDataList(1, 0)
    this.getHot()
    this.getRule()
    this.getMyData()
  },
  methods: {
    getDataList (pageNo, index, value, number) {
      const parameter = {
        pageNo: pageNo,
        pageSize: 20,
        sortRule: value,
        keyword: this.queryParam.keyword,
        categorys: number ? [number] : []
      }
      this.searchIndex = index
      this.loading = true
      this.axios({
        url: 'forum/Index/init',
        data: parameter
      }).then(res => {
        this.dataList = res.result.data
        this.loading = false
      })
    },
    getMyData () {
      this.axios({
        url: 'forum/Index/getCount'
      }).then(res => {
        this.myData = res.result
      })
    },
    getRule () {
      this.axios({
        url: 'forum/Index/sortRules'
      }).then(res => {
        this.sortRule = res.result
      })
    },
    getHot () {
      this.axios({
        url: 'forum/Setting/getCategorys',
        params: { recommended: '1' }
      }).then(res => {
        this.hotCategroy = res.result.data
      })
    },
    showDetails (record) {
      this.$refs.forumDetail.show({
        action: 'show',
        title: '查看',
        data: record
      })
    },
    questionAdd () {
      this.$refs.askQuestions.show({
        action: 'add',
        title: '添加'
      })
    },
    refreshList () {
      this.getDataList(1, 0)
    }
  }
}
</script>
<style scoped>
.componets-layout-demo-custom-trigger{
  width: 100%;
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
