<template>
  <a-drawer
    :width="1200"
    title="查看"
    :destroyOnClose="true"
    :visible="visible"
    @close="onClose"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <div class="box" v-if="config.type !== 'myAudited'">
          <div class="content_box">
            <h2>{{ detail.article.title }}</h2>
            <div class="header">
              <span><a-icon type="user" /> {{ detail.article.author }}</span>
              <span>{{ detail.article.inputtime }}</span>
              <span>浏览({{ detail.article.browse_num }})</span>
              <span>评论({{ detail.article.comment_num }})</span>
              <span @click="handleDelete" v-if="detail.error || config.type === 'myAudited' || (config.page === 'myKnowledge' && config.record && (config.record.status === '1' || config.record.status === '2')) || config.page === 'manageKnowledge'" class="header_action">
                <a-tooltip><template slot="title">删除</template><a-icon type="delete" /></a-tooltip>
              </span>
              <span @click="handleBug" class="header_action">
                <a-tooltip><template slot="title">报错</template><a-icon type="bug" /></a-tooltip>
              </span>
              <span @click="handleEdit" class="header_action" v-if="(config.page !== 'init' && config.record && (config.record.status === '1' || config.record.status === '2'))|| config.page ==='manageKnowledge'">
                <a-tooltip><template slot="title"> 编辑</template><a-icon type="edit" /></a-tooltip>
              </span>
            </div>
            <div class="tags" v-if="tagArr.length > 0">
              <a-tag v-for="(item, index) in tagArr" :key="index" style="margin-bottom: 5px">{{ item }}</a-tag>
            </div>
            <div v-html="detail.article.content" class="article"></div>
            <div class="footer">
              <div>
                <span>所属分类：{{ detail.article.catname }}</span>
                <span class="explode">|</span>
                <span>生效时间：{{ detail.article.effect_start_time == '0000-00-00 00:00:00' ? '审核通过后立即生效': detail.article.effect_start_time }}</span>
                <span class="explode">|</span>
                <span>失效时间：{{ detail.article.effect_forever == 1 ? '永久生效' : detail.article.effect_end_time }}</span>
              </div>
              <div v-if="detail" class="footer_action">
                <a @click="handleCollect">
                  <div class="collect" :style="[detail.flag.is_collected ? { color: 'rgb(64, 169, 255)' } : { color: 'rgba(0, 0, 0, 0.45)' }]">
                    <a-icon
                      :theme="detail.flag.is_collected ? 'filled' : 'outlined'"
                      type="star"
                      style="font-size: 24px;" />
                    <span v-if="!detail.flag.is_collected">收藏({{ detail.article.collected_num }})</span>
                    <span v-else>已收藏({{ detail.article.collected_num }})</span>
                  </div>
                </a>
                <a @click="handleLike">
                  <div class="collect" :style="[detail.flag.is_liked ? { color: 'rgb(64, 169, 255)' } : { color: 'rgba(0, 0, 0, 0.45)' }]">
                    <a-icon
                      :theme="detail.flag.is_liked ? 'filled' : 'outlined'"
                      type="like"
                      style="font-size: 24px;" />
                    <span v-if="!detail.flag.is_liked">点赞({{ detail.article.liked_num }})</span>
                    <span v-else>已点赞({{ detail.article.liked_num }})</span>
                  </div>
                </a>
              </div>
            </div>
            <div class="comment">
              <div class="header"><span>评论({{ detail.article.comment_num }})</span></div>
              <div v-for="(item, index) in detail.comment" :key="index" class="record">
                <div class="top">
                  <img :src="setting.rootUrl + item.avatar">
                  <div class="main">
                    <div>
                      <span class="name">{{ item.commenter }}</span>
                      <span class="time">{{ item.inputtime }}</span>
                    </div>
                    <span v-html="item.content" class="content"></span>
                  </div>
                </div>
                <div class="foot" >
                  <div>
                    <a @click="likeComment(item.id, item.is_liked, item)">
                      <a-tooltip>
                        <template slot="title">
                          {{ item.is_liked ? '赞过了' : '赞一个' }}
                        </template>
                        <a-icon :theme="item.is_liked ? 'filled' : 'outlined'" type="like" />
                        <span style="font-size: 12px;">{{ item.liked_num }}</span>
                      </a-tooltip>
                    </a>
                    <a @click="toggleRely(item, !item.show_reply)">
                      <a-tooltip><template slot="title">回复TA</template><a-icon type="message" /></a-tooltip>
                    </a>
                    <a-popconfirm
                      title="当前操作将会删除该评论及其子评论，您确认要删除吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="confirm1(item, index)"
                      @cancel="cancel"
                    >
                      <a href="#" v-show="item.del_comment_priv"><a-icon type="delete" /></a>
                    </a-popconfirm>
                  </div>
                  <div class="divide"></div>
                  <div class="second_comment" v-for="(item2, index2) in item.comment2" :key="index2">
                    <img :src="setting.rootUrl + item2.avatar">
                    <div class="main">
                      <div>
                        <span>{{ item2.commenter }} 回复 {{ item2.commented_person }}：</span>
                        <div class="second_comment_content" v-html="item2.content"></div>
                      </div>
                      <span>{{ item2.comment_time }}
                        <a @click="toggleRely(item, !item.show_reply)" style="margin-left: 10px;">
                          <a-tooltip>
                            <template slot="title">回复TA</template>
                            <a-icon type="message" />
                          </a-tooltip>
                        </a>
                        <a-popconfirm
                          title="您确认要删除该评论么？"
                          ok-text="确认"
                          cancel-text="取消"
                          @confirm="confirm(item, index2)"
                          @cancel="cancel"
                        >
                          <a href="#" v-show="item2.del_comment_priv"><a-icon type="delete" /></a>
                        </a-popconfirm>
                      </span>
                    </div>
                  </div>
                  <a-form-item>
                    <a-input-search
                      :id="'reply' + item.id"
                      style="margin-top: 5px;"
                      v-if="item.show_reply"
                      :placeholder="'评论 ' + item.commenter"
                      @change="(e) => { getReply(e, item) }"
                      v-decorator="['reply' + item.id, { initialValue: item.reply_text, rules: [{ required: true, message: '评论不能为空' }] }]"
                      @search="reply(item, index)">
                      <a-button :loading="loading_reply" slot="enterButton">
                        评论
                      </a-button>
                    </a-input-search>
                  </a-form-item>
                </div>
              </div>
              <quill-editor
                style="height: 200px; margin-top: 20px;"
                :options="editorOption"
                :value="comment_msg"
                @change="onEditorChange"
              >
              </quill-editor>
              <div style="margin: 50px 0 0 0;">
                <div style="color: red;" v-if="comment_flag">评论不能为空</div>
                <a-button style="margin: 10px 0;" :loading="loading_btn" @click="publish" type="primary">发表</a-button>
              </div>
            </div>
          </div>
          <a-spin :spinning="errorLoading" v-if="detail.error">
            <div class="error_box">
              <a-card v-for="(item, index) in errors" :key="index" style="position: relative; margin-bottom: 10px;">
                <div style="margin-bottom: 10px"><span style="color: #262626; padding-left: 14px">报错人 : </span><span style="color: #595959">{{ item.buger }}</span></div>
                <div style="margin-bottom: 10px"><span style="color: #262626">报错时间 : </span><span style="color: #595959">{{ item.inputtime }}</span></div>
                <div style="margin-bottom: 10px"><span style="color: #262626">报错内容 : </span><span style="color: #595959">{{ item.content }} </span></div>
                <div v-if="item.dealer" style="margin-bottom: 10px"><span style="color: #262626; padding-left: 14px">处理人 : </span><span style="color: #595959">{{ item.dealer }}</span></div>
                <div v-if="item.dealer" style="margin-bottom: 10px"><span style="color: #262626">处理时间 : </span><span style="color: #595959">{{ item.dealerTime }}</span></div>
                <div style="display: flex; justify-content: space-around; margin-bottom: 10px">
                  <a-button size="small" type="primary" @click="handleError('success', item, index)" :disabled="item.status != 0">有效报错</a-button>
                  <a-button size="small" type="danger" @click="handleError('error', item, index)" :disabled="item.status != 0">无效报错</a-button>
                </div>
                <div v-if="item.status != 0" style="position: absolute; right: 0px; top: 10px; margin-bottom: 10px">
                  <a-tag v-if="item.status == 1" color="green">有效报错</a-tag>
                  <a-tag v-else color="red">无效报错</a-tag>
                </div>
              </a-card>
            </div>
          </a-spin>
        </div>
        <div class="box" v-else>
          <div class="content_box">
            <div class="header">
              <h2>{{ detail.article.title }}</h2>
              <span><a-icon type="user" /> {{ detail.article.author }}</span>
              <span>{{ detail.article.inputtime }}</span>
              <span @click="handleDelete" v-if="detail.error || config.type === 'myAudited'" class="header_action">
                <a-tooltip><template slot="title">删除</template><a-icon type="delete" /></a-tooltip>
              </span>
              <span @click="handleBug" class="header_action">
                <a-tooltip><template slot="title">报错</template><a-icon type="bug" /></a-tooltip>
              </span>
              <span @click="handleEdit" class="header_action">
                <a-tooltip><template slot="title">编辑</template><a-icon type="edit" /></a-tooltip>
              </span>
            </div>
            <div class="tags">
              <a-tag v-for="(item, index) in tagArr" :key="index" style="margin-bottom: 5px">{{ item }}</a-tag>
            </div>
            <div v-html="detail.article.content" class="article"></div>
            <div class="footer">
              <div>
                <span>所属分类：{{ detail.article.catname }}</span>
                <span class="explode">|</span>
                <span >生效时间：{{ detail.article.effect_start_time }}</span>
                <span class="explode">|</span>
                <span>失效时间：{{ detail.article.effect_forever == 1 ? '永久生效' : detail.article.effect_end_time }}</span>
              </div>
              <div v-if="parseInt(config.record.status) === 1" class="examine">
                <a-button @click="handleVerify('success', config.record)" type="primary" class="examine_btn">审核通过</a-button>
                <a-button @click="handleVerify('error', config.record)">审核不通过</a-button>
              </div>
            </div>
            <a-table
              style="margin-top: 20px;"
              size="small"
              rowKey="id"
              :columns="columns"
              :dataSource="detail.log"
              :pagination="false"
            >
              <span slot="order" slot-scope="text, record, index">{{ index + 1 }}</span>
            </a-table>
          </div>
        </div>
        <index-my-manage-knowledge-form ref="indexMyManageKnowledgeForm" @ok="handleRefresh" />
        <!-- 报错 -->
        <index-init-error ref="indexInitError" />
        <index-my-knowledge-verify ref="indexMyKnowledgeVerify" @ok="handlerError" />
      </a-form>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
export default {
  components: {
    IndexInitCommonPage: () => import('./IndexInitCommonPage'),
    IndexMyManageKnowledgeForm: () => import('./IndexMyManageKnowledgeForm.vue'),
    IndexInitError: () => import('./IndexInitError'),
    quillEditor,
    IndexMyKnowledgeVerify: () => import('./IndexMyKnowledgeVerify')
  },
  data () {
    return {
      showError: false,
      form: this.$form.createForm(this),
      valid: '',
      config: {},
      detail: {
        comment: [],
        flag: { is_collected: 'true', is_liked: true },
        article: { }
      },
      tagArr: [],
      errors: [], // 报错处理列表
      errorLoading: false,
      columns: [{
        title: '#',
        dataIndex: 'order',
        slots: { title: 'order' },
        scopedSlots: { customRender: 'order' }
      }, {
        title: '时间',
        dataIndex: 'inputtime'
      }, {
        title: '操作名称',
        dataIndex: 'operate_name'
      }, {
        title: '操作人',
        dataIndex: 'operater'
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }],
      dealer: null,
      dealerTime: null,
      loading: false,
      loading_btn: false,
      loading_reply: false,
      visible: false,
      comment_msg: '',
      comment_flag: false,
      editorOption: {
        placeholder: '',
        modules: {
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }]
            ]
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {
    show (config) {
      this.config = config
      this.visible = true
      this.loading = true
      if (config.type === 'dealBug') {
        this.axios({
          url: '/knowledge/index/detail',
          params: { id: config.record.id, spec: 'dealBug' }
        }).then(res => {
          if (!res.message) {
            this.loading = false
            this.detail = res.result
            this.errors = res.result.error
            this.errors = this.handleNewArr(this.errors)
            const label = res.result.article.label
            this.tagArr = label.length > 0 ? label.split(',') : label
          }
        })
      } else {
        this.axios({
          url: '/knowledge/index/detail',
          params: { id: config.record.id }
        }).then(res => {
          if (!res.message) {
            this.loading = false
            this.detail = res.result
            const label = res.result.article.label
            this.tagArr = label.length > 0 ? label.split(',') : label
          }
        })
      }
    },
    // 报错信息重排列
    handleNewArr (errors) {
      var arr1 = []
      var arr2 = []
      var arr3 = []
      errors.forEach(item => {
        if (item.status === '0') {
          arr1.push(item)
        } else if (item.status === '1') {
          arr2.push(item)
        } else {
          arr3.push(item)
        }
      })
      return [...arr1, ...arr2, ...arr3]
    },
    // 刷新数据
    handleRefresh () {
      this.show(this.config)
    },
    // 编辑文章
    handleEdit () {
      this.$refs.indexMyManageKnowledgeForm.show({
        title: '编辑',
        detail: this.detail,
        action: 'edit'
      })
    },
    // 报错
    handleBug () {
      this.$refs.indexInitError.show({
        detail: this.detail
      })
    },
    handleDelete () {
      const that = this
      this.$confirm({
        title: '您确认要删除这条知识吗？',
        onOk () {
          that.axios({
            url: 'knowledge/Index/del',
            params: { id: that.config.record.id }
          }).then(res => {
            if (res.code === 0) {
              that.$message.success('操作成功')
              that.visible = false
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          })
        }
      })
    },
    // 点赞评论
    likeComment (commentId, curLike, item) {
      var type = ''
      if (curLike === 1) {
        item.is_liked = 0
        type = 'cancel'
        item.liked_num--
        if (item.liked_num === 0) {
          item.liked_num = '赞'
        }
      } else {
        item.is_liked = 1
        type = 'yes'
        if (item.liked_num === '赞') {
          item.liked_num = 1
        } else {
          item.liked_num++
        }
      }
      this.axios({
        url: '/knowledge/index/myLike',
        params: {
          comment_id: commentId,
          grade: 'second',
          type: type
        }
      }).then(res => {
      })
    },
    onEditorChange ({ quill, html, text }) {
      if (text.trim().length > 0) {
        this.comment_msg = html
        this.comment_flag = false
      } else {
        this.comment_flag = !!this.comment_msg
      }
    },
    // 添加一级评论
    publish () {
      if (!this.comment_flag && this.comment_msg) {
        const data = new FormData()
        data.append('articleId', this.detail.article.id)
        data.append('content', this.comment_msg)
        data.append('grade', 'first')
        this.loading_btn = true
        this.loadContent(this.detail.article.id)
        this.axios({
          url: '/knowledge/index/addComment',
          data: data
        }).then(res => {
          this.loading_btn = false
          if (res.code === 0) {
            this.loadContent(this.detail.article.id)
            this.detail.comment.push({
              avatar: res.result.avatar,
              commenter: this.detail.hoster,
              inputtime: this.getTime(),
              content: this.comment_msg,
              is_liked: 0,
              id: res.result.comment_id,
              liked_num: '赞'
            })
            this.detail.article.comment_num++
            this.comment_msg = undefined
          } else {
            this.$message.warning(res.message)
          }
        })
      } else {
        this.comment_flag = true
      }
    },
    // 删除一级评论
    confirm1 (item, index) {
      const commentNum = item.comment2 ? item.comment2.length + 1 : 1
      const commentId = item.id
      this.axios({
        url: '/knowledge/index/delComment',
        params: {
          id: commentId,
          grade: 'first'
        }
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('删除成功')
          this.detail.comment.splice(index, 1)
          this.detail.article.comment_num -= commentNum
          this.detail.comment = JSON.parse(JSON.stringify(this.detail.comment))
        }
      })
    },
    // 获取二级回复
    getReply (e, item) {
      item.reply_text = e.target.value
    },
    // 二级回复评论
    reply (item, index) {
      item.reply_text = item.reply_text ? item.reply_text : ' '
      item.reply_text = item.reply_text.trim()
      const { validateFields, setFieldsValue } = this.form
      const fieldName = 'reply' + item.id
      const obj = {}
      obj[fieldName] = item.reply_text
      setFieldsValue(Object.assign(obj))
      validateFields(['reply' + item.id], (errors, values) => {
        if (!errors) {
          const data = new FormData()
          data.append('comment_id', item.id)
          data.append('content', item.reply_text)
          data.append('grade', 'second')
          data.append('commenter', this.detail.comment[index].commenter)
          data.append('other', this.userInfo.username)
          if (!this.detail.comment[index].comment2) {
            this.detail.comment[index].comment2 = []
          }
          this.loading_reply = true
          this.axios({
            url: '/knowledge/index/addComment',
            data: data
          }).then(res => {
            if (res.code === 0) {
              this.detail.comment[index].comment2.push({
                avatar: res.result.avatar,
                commenter: this.userInfo.username,
                commented_person: this.detail.comment[index].commenter,
                content: item.reply_text,
                comment_time: '刚刚',
                id: res.result.comment_id
              })
              item.show_reply = false
              item.reply_text = ''
              this.detail.comment = JSON.parse(JSON.stringify(this.detail.comment))
              this.detail.article.comment_num++
              this.loading_reply = false
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      })
    },
    // 删除二级评论
    confirm (item, index2) {
      var id = item.comment2[index2].id
      this.axios({
        url: '/knowledge/index/delComment',
        params: {
          id,
          grade: 'second'
        }
      }).then(res => {
        if (res.code === 0) {
          this.detail.article.comment_num--
          this.$message.success('删除成功')
          item.comment2.splice(index2, 1)
        }
      })
    },
    // 回复输入框的显示与隐藏
    toggleRely (item, value) {
      this.$forceUpdate()
      item.show_reply = value
    },
    handleLike () {
      var curLike = ''
      if (this.detail.flag.is_liked === 0) {
        this.detail.article.liked_num++
        this.detail.flag.is_liked = 1
        curLike = 'yes'
      } else {
        this.detail.article.liked_num--
        this.detail.flag.is_liked = 0
        curLike = 'cancel'
      }
      this.axios({
        url: '/knowledge/index/myLike',
        params: {
          article_id: this.config.record.id,
          type: curLike,
          grade: 'first'
        }
      }).then(res => {
      })
    },
    handleCollect () {
      var curLike = ''
      if (this.detail.flag.is_collected === 0) {
        this.detail.article.collected_num++
        this.detail.flag.is_collected = 1
        curLike = 'yes'
      } else {
        this.detail.article.collected_num--
        this.detail.flag.is_collected = 0
        curLike = 'cancel'
      }
      this.axios({
        url: '/knowledge/index/myCollect',
        params: {
          article_id: this.config.record.id,
          type: curLike
        }
      }).then(res => {
      })
    },
    changePage (page) {
      this.$emit('changepage', page)
    },
    loadContent (id) {
      this.loading = true
      this.$nextTick(() => {
        this.loading = false
        this.visible = true
      })
    },
    onClose () {
      this.visible = false
      this.comment_msg = ''
      // 已读未读知识，未读知识数-1，刷新列表
      if (this.config.type === 'waitRead') {
        this.$emit('read')
      }
    },
    handleChange (value) {
    },
    cancel (e) {
    },
    handleError (type, item, index) {
      var flag = ''
      var articleid = this.detail.article.id
      var errorid = item.id
      if (type === 'success') {
        flag = 'yes'
      } else {
        flag = 'no'
      }
      this.errorLoading = true
      this.axios({
        url: 'knowledge/index/dealError',
        params: { flag, articleid, errorid }
      }).then(res => {
        this.errorLoading = false
        if (res.code === 0) {
          if (type === 'success') {
            item.status = 1
          } else {
            item.status = 2
          }
          this.errors[index].dealerTime = res.result.info.dealerTime
          this.errors[index].dealer = res.result.info.dealer
          this.errors = this.handleNewArr(this.errors)
          this.$message.success('操作成功')
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    //  获取时间
    getTime () {
      var myDate = new Date()
      var y = myDate.getFullYear()
      var m = getFormat(myDate.getMonth() + 1)
      var d = getFormat(myDate.getDate())
      var h = getFormat(myDate.getHours())
      var min = getFormat(myDate.getMinutes())
      var s = getFormat(myDate.getSeconds())
      var nowDate = y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s
      function getFormat (value) {
        if (parseInt(value) < 10) {
          value = '0' + value
          return value
        } else {
          return value
        }
      }
      return nowDate
    },
    // 审核
    handleVerify (type, item) {
      if (type === 'error') {
        this.$refs.indexMyKnowledgeVerify.show({
          item: item,
          url: '/knowledge/index/audit'
        })
      } else {
        this.visible = false
        this.$emit('success', type, item)
      }
    },
    // 审核不通过
    handlerError () {
      this.visible = false
      this.$emit('error')
    }
  }
}
</script>
<style  lang="less" scoped>
.box {
  width: 100%;
  display: flex;

  .content_box {
    flex: 1
  }

  .error_box {
    width: 300px;
    margin-left: 10px;
    padding: 0 10px;
  }
}

.header {
  margin-bottom: 10px;
  .author {
    margin-right: 40px;
  }
  .right {
    float: right;
  }
  span {
    color: rgba(0, 0, 0, 0.92);
    margin-right: 20px;
  }
  .header_action {
    margin: 0 0 0 20px;
    float: right;
    cursor: pointer;
  }
}

.tags {
  font-size: 12px;
  margin: 10px 0;
  .tags_tag {
    margin-right: 10px;
  }
}
.footer {
  margin-top: 10px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);

  .footer_action {
    display: flex;
    justify-content: center;
    align-items: center;

    .collect {
      width: 70px;
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      color: rgba(0, 0, 0, 0.45);
      span {
        text-align: center;
        font-size: 12px;
      }
    }
    .collect:hover {
      color: #40a9ff;
    }
  }

  .explode {
    padding: 0px 10px;
  }
}

.comment {
  .header {
    margin-top: 30px;
    padding: 10px 0px;
    border-bottom: 1px #ccc solid;
    margin-bottom: 16px;
  }

  button {
    margin-top: 10px;
  }
  .ant-btn.ant-input-search-button {
    margin: 0px;
  }
  .record {
    padding-bottom: 20px;
    border-bottom: #ccc solid 1px;
    margin-bottom: 10px;
    .top {
      display: flex;
      flex-direction: row;
      img {
        border-radius: 50%;
        width: 46px;
        height: 46px;
      }
      .name{
        color:rgba(0,0,0,.45);
        margin-bottom: 8px;
      }
    }

    .main {
      display: flex;
      flex-direction: column;
      margin-left: 10px;
    }

    .foot {
      margin-left: 60px;
      a {
        color: rgba(0,0,0,.45);
        margin-right: 10px;
      }
    }
  }

  .content {
    color:rgba(0,0,0,.65);
    margin: 10px 0 0 0;
  }

  .time {
    margin-left: 10px;
    font-size: 12px;
    color: #ccc;
  }

  .divide {
    height: 14px
  }
}

.second_comment {
  padding-top: 6px;
  display: flex;
  flex-direction: row;

  img {
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  .main {
    padding-right: 10px;
    padding-bottom: 6px;
    font-size: 14px;

    .second_comment_content {
      padding: 10px 0 10px 10px;
    }
  }
}

.examine {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  .examine_btn {
    margin-right: 60px;
  }
}

.article {
  margin: 30px 0;
  line-height: 26px;
}

.article /deep/ img {
  max-width: 1150px;
  height: auto;
}
</style>
