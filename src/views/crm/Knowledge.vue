<template>
  <div class="knowledgeAll">
    <a-input-search v-model="queryParam.words" @search="handleSearch"/>
    <a-list :data-source="knowledge" :pagination="knowledge.length>0 ? pagination : false">
      <a-list-item slot="renderItem" slot-scope="data, index">
        <a-card style="width: 100%" :bordered="false" :class="checkedKey === data.id ? 'knowledgeCard checkColor' : 'knowledgeCard'" @click="checkedKey = data.id">
          <a-row>
            <a-col :span="24" style="font-size: 16px"><a @click="openKnowledge(data, index)" v-html="data.title">{{ data.title }}</a></a-col>
            <a-col :span="24" class="content" v-html="data.content">{{ data.content }}</a-col>
          </a-row>
        </a-card>
      </a-list-item>
    </a-list>
    <index-init-common-content ref="indexInitCommonContent"/>
  </div>
</template>
<script>
export default {
  components: {
    IndexInitCommonContent: () => import('@/views/knowledge/IndexInitCommonContent')
  },
  data () {
    return {
      knowledge: [],
      queryParam: {},
      checkedKey: '',
      pagination: {
        onChange: page => {
          const parameter = {
            pageNo: page,
            pageSize: 20,
            start: 0,
            dir: 'DESC'
          }
          this.getKnowledge(parameter)
        },
        pageSize: 20,
        size: 'small',
        showTotal: (total, range) => `显示第 ${range[0]} 条到 ${range[1]} 条记录, 一共 ${total} 条`
      }
    }
  },
  created () {
    const parameter = {
      pageNo: 1,
      pageSize: 20,
      start: 0,
      dir: 'DESC'
    }
    this.getKnowledge(parameter)
  },
  methods: {
    getKnowledge (parameter) {
      this.axios({
        url: 'knowledge/Index/init',
        params: Object.assign(this.queryParam, parameter, {
          categoryid: 0,
          type: 'public',
          theme: 1,
          sort: 'inputtime'
        })
      }).then(res => {
        this.knowledge = res.result.data
        const pagination = { ...this.pagination }
        pagination.total = Number(res.result.totalCount)
        pagination.current = res.result.pageNo
        this.pagination = pagination
      })
    },
    handleSearch (e) {
      const parameter = {
        pageNo: 1,
        pageSize: 20,
        start: 0,
        dir: 'DESC'
      }
      this.getKnowledge(parameter)
    },
    openKnowledge (data, index) {
      this.$refs.indexInitCommonContent.show({
        record: data,
        index: index,
        type: 'public',
        page: 'init'
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';

.knowledgeCard :hover{
    background: @primary-1;
}
.checkColor{
  background: @primary-2
}
.knowledgeAll {
  height: calc(100vh - 140px);
  overflow-x: hidden;
  overflow: auto;
}
.knowledgeAll::-webkit-scrollbar{
  display: none;
}
.content {
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
    -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
    -webkit-line-clamp: 3; /** 显示的行数 **/
    overflow: hidden;  /** 隐藏超出的内容 **/
}
</style>
