<template>
  <a-layout class="mylayout">
    <a-layout-sider
      :trigger="null"
      width="400"
      collapsible
      collapsedWidth="0"
      theme="light"
      style="padding:10px 10px 10px 0"
      v-model="collapsed">
      <a-row :gutter="10" type="flex" align="middle" style="padding-bottom: 10px">
        <a-col :span="19"><a-input-search placeholder="请输入分类名称搜索" v-model="queryParam.name" allowClear @search="categoryRefresh"/></a-col>
        <a-col :span="5"><a-button size="small" icon="plus" type="primary" @click="categoryAdd">添加</a-button></a-col>
      </a-row>
      <s-table
        size="small"
        ref="categoryTable"
        :columns="categoryColumns"
        :data="categoryData"
        rowKey="id"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="actionCategory" slot-scope="text, record">
          <a @click="categoryEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="categoryDel(record)">删除</a>
        </div>
        <a slot="category" slot-scope="text, record" @click="tagdataLoad(record)">{{ text }}</a>
      </s-table>
    </a-layout-sider>
    <a-layout style="background: #ffffff; padding-bottom: 10px">
      <a-row :gutter="10" type="flex" align="middle" style="padding: 10px 0 10px 10px">
        <a-icon
          placement="bottom"
          class="trigger-tag"
          :type="collapsed ? 'double-right' : 'double-left'"
          :title="collapsed ? '展开左侧面板' : '折叠左侧面板'"
          @click="()=> collapsed = !collapsed"
        />
        <a-col>{{ checkName }}</a-col>
        <a-col :span="10"><a-input-search placeholder="请输入分类名称搜索" allowClear v-model="queryParamTag.name" @search="tagdataRefresh"/></a-col>
        <a-col :span="3">
          <a-button size="small" icon="plus" @click="tagdataAdd" type="primary">添加</a-button>
        </a-col>
      </a-row>
      <s-table
        size="small"
        ref="tagdataTable"
        :columns="tagdataColumns"
        rowKey="id"
        :data="tagdataData"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="actionTagdata" slot-scope="text, record">
          <a @click="tagdataEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="tagdataDel(record)">删除</a>
        </div>

        <div slot="actionTagdata" slot-scope="text, record">
          <a @click="tagdataEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="tagdataDel(record)">删除</a>
        </div>
      </s-table>
      <tag-category-form ref="tagCategoryForm" @ok="categoryRefresh" />
      <tag-data-form ref="tagDataForm" :tableid="tableid" @ok="tagdataRefresh" />
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  components: {
    TagCategoryForm: () => import('./TagCategoryForm'),
    TagDataForm: () => import('./TagDataForm')
  },
  props: {
    tableid: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      collapsed: false,
      categoryTitle: '分类管理',
      checkName: '',
      categoryColumns: [{
        title: '#',
        dataIndex: 'id',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '分类名称',
        dataIndex: 'name',
        width: 120,
        scopedSlots: {
          customRender: 'category'
        }
      }, {
        title: '标签类型',
        dataIndex: 'tag_type',
        customRender: (text, record, index) => {
          var str = '--'
          if (text === '1') {
            str = '自动标签'
          } else if (text === '0') {
            str = '手动标签'
          }
          return str
        }
      }, {
        title: '选择类型',
        dataIndex: 'select_type',
        customRender: (text, record, index) => {
          var str = '--'
          if (text === '1') {
            str = '多选'
          } else if (text === '0') {
            str = '单选'
          }
          return str
        }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        align: 'center',
        scopedSlots: {
          customRender: 'actionCategory'
        }
      }],
      tagdataTitle: '标签管理',
      tagdataColumns: [{
        title: '#',
        dataIndex: 'id',
        width: 40,
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '操作',
        align: 'center',
        width: 100,
        scopedSlots: { customRender: 'actionTagdata' }
      }, {
        title: '标签名称',
        width: 200,
        dataIndex: 'name'
      }, {
        title: '所属分类',
        width: 200,
        dataIndex: 'runmber',
        customRender: (text, record, index) => {
          return this.checkName
        }
      }, {
        title: '分值',
        width: 100,
        dataIndex: 'score'
      }, {
        title: '状态',
        width: 100,
        dataIndex: 'status',
        customRender: function (text, record, index) {
          var str = '--'
          if (text === '1') {
            return (<div><a-badge status="success" />启用</div>)
          } else if (text === '0') {
            return (<div><a-badge status="default" />禁用</div>)
          } else {
            return str
          }
        }
      }, {
        title: '备注',
        dataIndex: 'remarks'
      }],
      switchLoading: false, // 开关loading
      queryParam: {},
      queryParamTag: {}
    }
  },
  methods: {
    // 加载分类数据
    categoryData (parameter) {
      return this.axios({
        url: '/admin/Tag/categoryInit',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 标签分类加载
    categoryRefresh () {
      this.$refs.categoryTable.refresh(true)
    },
    // 标签分类添加
    categoryAdd () {
      this.$refs.tagCategoryForm.show({
        action: 'add',
        title: '添加',
        url: '/admin/Tag/categoryAdd'
      })
    },
    // 标签分类编辑
    categoryEdit (record) {
      this.$refs.tagCategoryForm.show({
        action: 'edit',
        title: '编辑：' + record.name,
        url: '/admin/Tag/categoryEdit',
        record: record
      })
    },
    // 标签分类删除
    categoryDel (record) {
      const me = this
      const categoryTable = me.$refs.categoryTable
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          me.axios({
            url: '/admin/Tag/categoryDel',
            params: { number: record.number }
          }).then((res) => {
            if (!res.code) {
              categoryTable.refresh()
              me.$message.success('操作成功')
            } else {
              me.$message.warning(res.message)
            }
          })
        }
      })
    },
    // 加载标签数据
    tagdataData (parameter) {
      return this.axios({
        url: '/admin/Tag/tagdataInit',
        params: Object.assign(parameter, this.queryParamTag, { number: this.queryParam.number || 1 })
      }).then(res => {
        return res.result
      })
    },
    // 标签数据加载
    tagdataRefresh () {
      this.$refs.tagdataTable.refresh(true)
    },
    // 标签数据加载
    tagdataLoad (record) {
      this.queryParam.number = record.number
      this.checkName = record.name
      this.tagdataTitle = record.category
      this.tagdataRefresh()
    },
    // 标签数据添加
    tagdataAdd () {
      if (!this.checkName) {
        this.$message.warning('请选择标签分类')
      } else {
        const option = [{ label: this.checkName, value: this.queryParam.number }]
        this.$refs.tagDataForm.show({
          action: 'add',
          title: '添加',
          url: '/admin/Tag/tagdataAdd',
          option: option,
          record: { rnumber: this.queryParam.number }
        })
      }
    },
    // 标签数据编辑
    tagdataEdit (record) {
      const option = [{ label: this.checkName, value: this.queryParam.number }]
      this.$refs.tagDataForm.show({
        action: 'add',
        title: '编辑：' + record.name,
        url: '/admin/Tag/tagdataEdit',
        option: option,
        record: record
      })
    },
    // 标签数据删除
    tagdataDel (record) {
      const me = this
      const tagdataTable = me.$refs.tagdataTable
      this.$confirm({
        title: '您确认要删除该记录吗？',
        onOk () {
          me.axios({
            url: '/admin/Tag/tagdataDel',
            params: { id: record.id }
          }).then((res) => {
            if (!res.code) {
              tagdataTable.refresh()
              me.$message.success('操作成功')
            } else {
              me.$message.warning(res.message)
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped>
  .mylayout{
    background: #ffffff;
  }
  .mylayout .trigger-tag {
    padding-right: 10px;
    cursor: pointer;
    transition: color 0.3s;
  }
  .mylayout .trigger-tag:hover {
    color: #1890ff;
  }
  .switch-loading {
    display: inline-block;
    margin: 0;
    padding: 0;
    line-height: 10px;
  }
  .switch-loading button {
    top: -1px;
    display: inline-block;
    margin: 0;
    padding: 0;
  }
</style>
