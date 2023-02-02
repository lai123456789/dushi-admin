<template>
  <div class="knowSelectBox" style="border-bottom: 1px solid #ccc;">
    <div style="display: flex; height: 30px">
      <a-select v-model="status" v-if="page === 'myKnowledge' && params.type==='myCreated'" style="width: 120px; margin-left: 8px">
        <a-select-option value="" @click="getStatus('')">全部</a-select-option>
        <a-select-option value="1" @click="getStatus('1')">待审核</a-select-option>
        <a-select-option value="3" @click="getStatus('3')">审核通过</a-select-option>
        <a-select-option value="2" @click="getStatus('2')">审核不通过</a-select-option>
      </a-select>
      <a-select v-model="status" v-else-if="params.type==='myAudited'" style="width: 120px; margin-left: 8px">
        <a-select-option value="" @click="getStatus('5')">全部</a-select-option>
        <a-select-option value="1" @click="getStatus('1')">待审核</a-select-option>
        <a-select-option value="3" @click="getStatus('3')">审核通过</a-select-option>
        <a-select-option value="2" @click="getStatus('2')">审核不通过</a-select-option>
      </a-select>
      <a-select v-model="status" v-else-if="params.type==='dealBug'" style="width: 120px; margin-left: 8px">
        <a-select-option value="8" @click="getStatus('8')">全部</a-select-option>
        <a-select-option value="6" @click="getStatus('6')">待处理</a-select-option>
        <a-select-option value="7" @click="getStatus('7')">已处理</a-select-option>
      </a-select>
      <a-select @change="onChange" default-value="1" :value="theme" style="margin-left: 8px;" v-if="params.type !== 'questions'">
        <a-select-option value="1" style="width: 32px">全文搜索</a-select-option>
        <a-select-option value="2" style="width: 32px">标签搜索</a-select-option>
      </a-select>
      <a-select
        :open="false"
        :show-arrow="false"
        default-value="1"
        :value="theme"
        style="margin-left: 8px;"
        v-else>
        <a-select-option value="1" style="width: 32px">按标题搜索</a-select-option>
      </a-select>
      <a-form style="flex: 1; margin-top: -4px" :form="form">
        <a-form-item v-if="theme === '1'">
          <a-input
            v-decorator="['words',{initialValue: words || '', rules: [{ required: true, message: '请输入搜索内容'},{ min: 2, message:'请输入至少两个字' }]}]"
            @pressEnter="search"
            allowClear
            :placeholder="params.type !== 'questions' ? '请输入搜索内容，至少输入2个字' : '请输入标题搜索'"
          />
        </a-form-item>
        <a-form-item v-else >
          <a-select
            show-search
            v-model="tagValue"
            placeholder="请输入搜索内容"
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            allowClear
            :not-found-content="null"
            @search="handleSearch"
            @change="handleChange"
          >
            <a-select-option v-for="(item, index) in data" :key="index" :value="item.label">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <a-button @click="search">搜索</a-button>
      <a-button @click="reset" style="margin-left: 8px">重置</a-button>
      <a-dropdown style="margin-left: 8px; padding-right: 8px">
        <a-icon type="sort-ascending" style="font-size: 24px; cursor: pointer; color: #8c8c8c"/>
        <a-menu slot="overlay">
          <a-menu-item v-if="mytype !== 'Hot'">
            <span @click="changeOrder('inputtime')" ><a-icon type="check" style="color: #52c41a" v-if="sortArr[0]"/><span :style="{ 'margin-left': sortArr[0] ? '0px': '20px'}">按创建时间最新到最旧</span></span>
          </a-menu-item>
          <a-menu-item v-if="mytype !== 'Hot'">
            <span @click="changeOrder('inputtimeold')"><a-icon type="check" style="color: #52c41a" v-if="sortArr[3]"/><span :style="{ 'margin-left': sortArr[3] ? '0px': '20px'}">按创建时间最旧到最新</span></span>
          </a-menu-item>
          <a-menu-item v-if="mytype !== 'myAudited'">
            <span @click="changeOrder('comment_num')" ><a-icon type="check" style="color: #52c41a" v-if="sortArr[1]"/><span :style="{ 'margin-left': sortArr[1] ? '0px': '20px'}">按评论数多到少</span></span>
          </a-menu-item>
          <a-menu-item v-if="mytype !== 'myAudited'">
            <span @click="changeOrder('browse_num')" ><a-icon type="check" style="color: #52c41a" v-if="sortArr[2]"/><span :style="{ 'margin-left': sortArr[2] ? '0px': '20px'}">按浏览量多到少</span></span>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <a-row style="padding: 8px 0px">
      <a-col :span="8">
        <a-input-group style="margin-left: 8px;">
          <template v-if="page === 'myKnowledge' && params.type === 'myCreated'">
            <a-button icon="plus" type="primary" @click="handleAdd">新增知识</a-button>
            <a-button
              icon="upload"
              style="margin-left: 10px"
              @click="handleImport"
              v-if="params.type === 'myCreated'">导入</a-button>
          </template>
        </a-input-group>
      </a-col>
    </a-row>
    <div v-if="params.type ==='questions'" style="margin: 0 10px 10px 10px;">
      <a-button-group>
        <a-button @click="getAuditStatus('5')" :type="auditStatus === '5' ? 'primary' : ''" >全部</a-button>
        <a-button @click="getAuditStatus('1')" :type="auditStatus === '1' ? 'primary' : ''" >待审核</a-button>
        <a-button @click="getAuditStatus('3')" :type="auditStatus === '3' ? 'primary' : ''" >审核通过</a-button>
        <a-button @click="getAuditStatus('2')" :type="auditStatus === '2' ? 'primary' : ''" >审核不通过</a-button>
      </a-button-group>
      <a-button-group>
        <a-button @click="getDateStatus('8')" :type="dateStatus === '8' ? 'primary' : ''" style="margin-left: 10px;">全部</a-button>
        <a-button @click="getDateStatus('6')" :type="dateStatus === '6' ? 'primary' : ''" >未过期</a-button>
        <a-button @click="getDateStatus('7')" :type="dateStatus === '7' ? 'primary' : ''" >已过期</a-button>
        <a-popconfirm
          title="您确认要删除选中的记录吗？"
          ok-text="确认"
          cancel-text="取消"
          @confirm="handleDelList"
        >
          <a-button
            type="danger"
            style="margin-left: 10px;"
            :disabled="delDisabled">批量删除</a-button>
        </a-popconfirm>
      </a-button-group>
    </div>
    <!-- 新增知识 -->
    <index-my-manage-knowledge-form ref="indexMyManageKnowledgeForm" @ok="handleRefresh" :treeId="treeId" :key="refreshKey"/>
    <!-- 导入 -->
    <index-import ref="indexImport" :key="importKey" @ok="handleOk"/>
  </div>
</template>
<script>
export default {
  components: { IndexMyManageKnowledgeForm: () => import('./IndexMyManageKnowledgeForm.vue'),
    IndexImport: () => import('./IndexImport.vue')
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
    delIdArr: {
      type: Array,
      default: () => {}
    },
    treeId: {
      type: Array,
      default: () => {}
    }
  },
  watch: {
    params: {
      handler (newValue) {
        this.categoryid = Number(newValue.categoryid) || 0
        if (newValue.theme) {
          this.sort = newValue.sort
          this.words = newValue.words
        } else {
          this.theme = '1'
          this.sort = 'inputtime'
          this.words = ''
        }
        if (!newValue.status) {
          if (newValue.type === 'myCreated' && !newValue.words) {
            this.status = ''
          } else if (newValue.type === 'myAudited' && !newValue.words) {
            this.status = '1'
          } else if (newValue.type === 'dealBug' && !newValue.words) {
            this.status = '8'
          }
        }
        if (newValue.type) {
          this.mytype = newValue.type
          if (newValue.type === 'Hot' && this.init) {
            this.sortArr = [false, false, true]
            this.init = false
          }
        }
      },
      immediate: true
    },
    delIdArr (newValue) {
      if (newValue.length !== 0) {
        this.delDisabled = false
      } else {
        this.delDisabled = true
      }
    }
  },
  data () {
    return {
      detaSource: [],
      refreshKey: 0,
      importKey: 2,
      categoryid: 0,
      init: true, // 是否为初始化页面
      input: '',
      data: [ ],
      searchtype: 1,
      last_query_time: 0,
      label_list: [],
      theme: '1', // 全局搜索
      tagValue: undefined,
      sort: 'inputtime',
      words: '', // 搜索内容
      form: this.$form.createForm(this),
      timeout: null,
      status: '',
      mytype: '',
      auditStatus: '5',
      dateStatus: '8',
      delDisabled: true,
      sortArr: [true, false, false]
    }
  },
  methods: {
    // 获取状态
    getStatus (status) {
      let theme = ''
      if (this.words.length === 0) {
        theme = '2'
      } else {
        theme = this.theme
      }
      this.status = status
      this.$emit('ok', this.sort, this.words, theme, status)
    },
    getAuditStatus (status) {
      let theme = ''
      if (this.words.length === 0) {
        theme = '2'
      } else {
        theme = this.theme
      }
      this.auditStatus = status
      this.$emit('ok', this.sort, this.words, theme, null, status, this.dateStatus)
    },
    getDateStatus (status) {
      let theme = ''
      if (this.words.length === 0) {
        theme = '2'
      } else {
        theme = this.theme
      }
      this.dateStatus = status
      this.$emit('ok', this.sort, this.words, theme, null, this.auditStatus, status)
    },
    // 获取全局搜索还是标签搜索
    onChange (value) {
      this.theme = value
      this.words = ''
    },
    changeOrder (value) {
      let theme = ''
      if (this.words.length === 0) {
        theme = '2'
      } else {
        theme = this.theme
      }
      if (value === 'inputtime') {
        this.sortArr = [true, false, false, false]
      } else if (value === 'inputtimeold') {
        this.sortArr = [false, false, false, true]
      } else if (value === 'comment_num') {
        this.sortArr = [false, true, false, false]
      } else {
        this.sortArr = [false, false, true, false]
      }
      this.sort = value
      this.$emit('ok', this.sort, this.words, theme)
    },
    // 远程搜索标签
    handleSearch (value) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.axios({
          url: '/knowledge/index/getListLabel',
          params: { fieldvalue: value }
        }).then(res => {
          this.data = res.result
        })
      }, 300)
    },
    // 选择标签
    handleChange (value) {
      this.words = value
    },
    // 搜索
    search () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.words = this.form.getFieldsValue().words ? this.form.getFieldsValue().words : this.words
          if (this.page === 'myKnowledge') {
            this.$emit('ok', this.sort, this.words, this.theme, this.status)
          } else if (this.page === 'init') {
            this.$emit('ok', this.sort, this.words, this.theme)
          } else if (this.page === 'manageKnowledge') {
            if (this.params.type !== 'questions') {
              this.$emit('ok', this.sort, this.words, this.theme, this.status)
            } else {
              this.$emit('ok', this.sort, this.words, this.theme, null, this.auditStatus, this.dateStatus)
            }
          }
        }
      })
    },
    // 重置
    reset () {
      this.words = ''
      this.form.resetFields()
      this.tagValue = undefined
      const theme = '2'
      if (this.page === 'myKnowledge') {
        this.$emit('ok', this.sort, this.words, theme, this.status)
      } else if (this.page === 'init') {
        this.$emit('ok', this.sort, this.words, theme)
      } else if (this.page === 'manageKnowledge') {
        if (this.params.type !== 'questions') {
          this.$emit('ok', this.sort, this.words, theme, this.status)
        } else {
          this.$emit('ok', this.sort, this.words, theme, null, this.auditStatus, this.dateStatus)
        }
      }
    },
    // 新增知识
    handleAdd () {
      if (this.refreshKey) {
        this.refreshKey = 0
      } else {
        this.refreshKey = 1
      }
      this.$nextTick(() => {
        this.$refs.indexMyManageKnowledgeForm.show({
          title: '添加',
          action: 'add',
          categoryid: this.categoryid
        })
      })
    },
    // 新增知识之后刷新列表
    handleRefresh  () {
      this.reset()
    },
    //  导入
    handleImport () {
      if (this.importKey === 3) {
        this.importKey = 2
      } else {
        this.importKey = 3
      }
      this.$nextTick(() => {
        this.$refs.indexImport.show()
      })
    },
    // 导入刷新列表
    handleOk () {
      this.reset()
    },
    // 批量删除数据
    handleDelList () {
      var idStr = this.delIdArr.join(',')
      this.axios({
        url: '/knowledge/index/deleteArticle',
        params: { id: idStr }
      }).then(res => {
        if (!res.message) {
          if (this.words.length === 0) {
            this.theme = ''
          }
          this.$emit('ok', this.sort, this.words, this.theme, null, this.auditStatus, this.dateStatus)
        }
      })
    }
  }
}
</script>
