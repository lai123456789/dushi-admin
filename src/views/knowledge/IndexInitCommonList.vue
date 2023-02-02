<template>
  <div>
    <a-list
      v-if="myType !== 'questions'"
      item-layout="vertical"
      size="large"
      :pagination="listData.length > 0 ? pagination : false"
      :data-source="listData"
      :loading="loading"
    >
      <a-list-item slot="renderItem" key="item.title" slot-scope="item, index" style="position: relative; ">
        <a-list-item-meta>
          <span slot="title" class="input">
            <a
              @mouseenter="$set(item,'stylechange',true)"
              :href="item.href"
              @mouseleave="$set(item,'stylechange',false)"
              :style="{'text-decoration': item.stylechange ? 'underline' : 'none', color: item.stylechange ? '' : 'rgba(0, 0, 0, 0.92)'}"
              @click="showDetail(item, index)"
              v-html="item.title"></a>
          </span>
        </a-list-item-meta>
        <div v-if="page ==='manageKnowledge' && parseInt(item.status) === 1" style="position: absolute; right: 0; top: 10px;">
          <a-button @click="handleVerify('success', item)" type="primary" style="margin-right: 15px;">审核通过</a-button>
          <a-button @click="handleVerify('error', item)">审核不通过</a-button>
        </div>
        <div v-if="page ==='manageKnowledge' && parseInt(item.status) === 2" style="position: absolute; right: 0; top: 10px;"><a-tag color="red"> 审核不通过</a-tag></div>
        <div v-if="page ==='manageKnowledge' && parseInt(item.status) === 3" style="position: absolute; right: 0; top: 10px;"><a-tag color="blue">审核通过</a-tag></div>
        <div v-if="page ==='manageKnowledge' && parseInt(item.status) === 4" style="position: absolute; right: 0; top: 10px;"><a-tag>无需审核</a-tag></div>
        <div style="margin-top: -20px; color: rgba(0, 0, 0, 0.45)" >
          <a-row>
            <a-col :span="20" >
              <div class="one">
                <span style="margin-right: 10px;"><a-icon type="user" />{{ item.author }}</span>
                <a-tag v-for="(labelItem, labelIndex) in item.label" :key="labelIndex">{{ labelItem }}</a-tag>
              </div>
            </a-col>
            <a-col :span="4" style="text-align: right">{{ item.inputtime }}</a-col>
          </a-row>
        </div>
        <div style="margin-top: 10px;" v-html="item.content" class="three"></div>
        <div style="margin-top: 20px; user-select: none; color: rgba(0, 0, 0, 0.45)" v-if="page !== 'manageKnowledge' || type=='dealBug'">
          <span><a-icon type="message" style="margin:0 3px 0 0;" />评论 {{ item.comment_num }}</span>
          <span><a-icon type="star-o" style="margin:0 3px 0 8px;" />收藏 {{ item.collected_num }}</span>
          <span><a-icon type="eye" style="margin:0 3px 0 8px;" />浏览 {{ item.browse_num }}</span>
        </div>
      </a-list-item>
    </a-list>
    <a-table
      v-else
      :columns="columns"
      rowKey="id"
      :data-source="data"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
    >
      <div slot="title1" slot-scope="text, record, index" @click="showDetail(record, index)" style="cursor: pointer;" class="one">{{ text }}</div>
      <div slot="overTimeStr" slot-scope="text"><span :style="[text === '未过期' ? { color: 'green' } : { color: 'red' }]" >{{ text }}</span></div>
    </a-table>
    <index-init-common-content ref="indexInitCommonContent" @read="handleRead" @ok="handleDelete" @error="handlerError" @success="handleVerify" />
    <!-- 审核不通过的原因 -->
    <index-my-knowledge-verify ref="indexMyKnowledgeVerify" @ok="handlerError" />
  </div>
</template>
<script>
export default {
  components: {
    IndexInitCommonContent: () => import('./IndexInitCommonContent'),
    IndexMyKnowledgeVerify: () => import('./IndexMyKnowledgeVerify')
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    page: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      listData: [],
      url: '',
      pagination: {
        onChange: page => {
          var parameter = Object.assign(this.params, {
            pageNo: page,
            pageSize: 10,
            start: 0,
            dir: this.params.sort !== 'inputtimeold' ? 'DESC' : 'ASC'
          })
          if (this.params.sort === 'inputtimeold') {
            parameter.sort = 'inputtime'
          }
          if (this.myType === 'questions') {
            parameter.auditStatus = '5'
            parameter.dateStatus = '8'
          }
          this.fetch(parameter)
        },
        pageSize: 10,
        size: 'small',
        showTotal: (total, range) => `显示第 ${range[0]} 条到 ${range[1]} 条记录, 一共 ${total} 条`
      },
      actions: [
        { type1: 'message', text: '2' },
        { type1: 'star-o', text: '156' },
        { type1: 'eye', text: '156' },
        { type1: 'file-text', text: '2' }
      ],
      parameter: {},
      myType: '',
      selectedRowKeys: [],
      columns: [ {
        title: '标题',
        dataIndex: 'title',
        scopedSlots: { customRender: 'title1' },
        width: 350
      }, {
        title: '作者',
        dataIndex: 'author',
        key: 'sort',
        width: 90
      }, {
        title: '审核状态',
        dataIndex: 'statusStr',
        width: 110,
        key: '2'
      }, {
        title: '是否过期',
        dataIndex: 'overTimeStr',
        scopedSlots: { customRender: 'overTimeStr' },
        width: 100,
        key: '3'
      }, {
        title: '浏览量',
        dataIndex: 'browse_num',
        key: '4'
      }, {
        title: '评论数',
        dataIndex: 'comment_num',
        key: '5'
      }, {
        title: '点赞数',
        dataIndex: 'liked_num',
        key: '6'
      }, {
        title: '报错量',
        dataIndex: 'bug_num',
        key: '7'
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        key: '8'
      }],
      data: [],
      loading: false
    }
  },
  watch: {
    params: {
      handler (newValue) {
        var parameter = Object.assign(newValue, {
          pageNo: 1,
          pageSize: 10,
          start: 0,
          dir: newValue.sort !== 'inputtimeold' ? 'DESC' : 'ASC'
        })
        if (newValue.sort === 'inputtimeold') {
          parameter.sort = 'inputtime'
        }
        parameter = JSON.parse(JSON.stringify(parameter))
        if (newValue.type) {
          this.myType = newValue.type
          if (newValue.type === 'questions') {
            this.url = '/knowledge/index/knowledgeList'
            parameter.type = undefined
            if (!newValue.auditStatus) {
              parameter.auditStatus = '5'
              parameter.dateStatus = '8'
            }
          }
          this.selectedRowKeys = []
        }
        this.parameter = parameter
        this.fetch(parameter)
      }
    },
    page: {
      handler (newValue) {
        this.url = `/knowledge/Index/${newValue}`
      },
      immediate: true
    }
  },
  methods: {
    fetch (parameter = {}) {
      this.loading = true
      this.axios({
        url: this.url,
        params: parameter
      }).then(res => {
        this.loading = false
        const pagination = { ...this.pagination }
        pagination.total = Number(res.result.totalCount)
        pagination.current = res.result.pageNo
        this.pagination = pagination
        if (this.params.type !== 'questions') {
          this.listData = res.result.data
          this.listData.forEach(item => {
            if (item.label) {
              item.label = item.label.split(',')
            } else {
              item.label = []
            }
          })
        } else {
          this.data = res.result.data
          this.data.forEach(item => {
            if (parseInt(item.status) === 1) {
              item.statusStr = '待审核'
            } else if (parseInt(item.status) === 2) {
              item.statusStr = '审核不通过'
            } else {
              item.statusStr = '审核通过'
            }
            if (parseInt(item.over_time) === 1) {
              item.overTimeStr = '未过期'
            } else {
              item.overTimeStr = '已过期'
            }
          })
          this.data = JSON.parse(JSON.stringify(this.data))
        }
      })
    },
    // 查看详情
    showDetail (record, index) {
      if (this.params.type !== 'myAudited') {
        this.axios({
          url: '/knowledge/index/updateBrowseNum',
          params: { article_id: record.id }
        })
      }
      this.$refs.indexInitCommonContent.show({
        record: record,
        index: index,
        type: this.params.type,
        page: this.page
      })
    },
    // 审核
    handleVerify (value, item) {
      if (value === 'success') {
        this.axios({
          url: '/knowledge/index/audit',
          params: { id: item.id }
        }).then(res => {
          if (!res.message) {
            this.$message.success('操作成功')
            this.fetch(this.parameter)
          }
        })
      } else if (value === 'error') {
        this.$refs.indexMyKnowledgeVerify.show({
          item: item,
          url: '/knowledge/index/audit'
        })
      }
    },
    // 报错删除
    handleDelete () {
      this.fetch(this.parameter)
    },
    // 审核不通过
    handlerError () {
      this.fetch(this.parameter)
    },
    // 已读知识
    handleRead () {
      this.$emit('read')
    },
    // '批量删除'使用的函数
    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
      this.$emit('ok', selectedRowKeys)
    }
  }
}
</script>
<style lang="less" scpoed>
.label {
  font-size: 12px;
  border: 1px solid #DCDCDC;
  text-align: center;
  margin: 0 5px;
  border-radius: 20px;
  padding: 2px 4px;
  background-color: #EEEEEE;
}
em {
  color: red;
  font-style: normal;
}
.three {
  width:100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;/*超出3行部分显示省略号，去掉该属性 显示全部*/
  -webkit-box-orient: vertical;
}
.one {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;/*超出1行部分显示省略号，去掉该属性 显示全部*/
  -webkit-box-orient: vertical;
}
.input {
  width: calc(100% - 200px);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;/*超出1行部分显示省略号，去掉该属性 显示全部*/
  -webkit-box-orient: vertical;
}

</style>
