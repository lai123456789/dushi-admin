<template>
  <a-spin :spinning="loading">
    <a-form :form="form">
      <a-table
        size="small"
        ref="tableDepartment"
        rowKey="value"
        :columns="columnsDepartment"
        :dataSource="selectData"
        :pagination="false"
        @expand="getDepartment"
        :sorter="{ field: 'listorder', order: 'ascend' }"
      >
        <div slot="title">
          <department-search :data="{ mode: 'multiple' }" @ok="(e, dep)=> {depSelect(dep)}"/>
        </div>
        <span slot="label" slot-scope="text,record">
          <a-icon :type="record.icon" v-if="record.icon"/> {{ text }}
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="dataSelect(record, 'department')">选择</a>
        </div>
      </a-table>
    </a-form>
  </a-spin>
</template>
<script>
export default {
  components: {
    DepartmentSearch: () => import('@/views/admin/Department/DepartmentSearch')
  },
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this),
      departmentSearch: [],

      columnsDepartment: [{
        title: '名称',
        dataIndex: 'label',
        scopedSlots: { customRender: 'label' }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }],
      selectData: [] // 部门选择，角色选择
    }
  },
  created () {
    this.axios({
      url: 'admin/Department/getDepartmentUser'
    }).then((res) => {
      this.loading = false
      res.result.data.forEach(item => {
        item.icon = 'home'
        if (item.childCount) {
          item.title = item.label + '(' + item.childCount + ')'
          item.children = [{
            value: parseInt(Math.random() * (100000 - 100 + 1) + 100, 10)
          }]
        } else {
          item.title = item.label
          item.isLeaf = true
        }
      })
      this.selectData = res.result.data
      // 初始化值
    })
  },
  methods: {
    getDepartment (expanded, record) {
      this.axios({
        url: '/admin/Department/getDepartmentUser',
        params: { departmentid: record.value }
      }).then(res => {
        res.result.data.forEach(item => {
          item.icon = 'apartment'
          if (!item.childCount) {
            item.isLeaf = true
            item.title = item.label
          } else {
            item.children = [{
              value: parseInt(Math.random() * (100000 - 100 + 1) + 100, 10)
            }]
            item.title = item.label + '(' + item.childCount + ')'
          }
        })
        const array = res.result.data.filter(item => item.type !== 'user')
        this.$set(record, 'children', array)
      })
    },
    getDepartmentData (e) {
      const page = {
        pageNo: 1,
        pageSize: 999,
        sortField: 'id',
        sortOrder: 'descend'
      }
      if (e) {
        this.axios({
          url: 'admin/Api/departmentSearch',
          params: Object.assign(page, { name: e })
        }).then(res => {
          this.departmentSearch = res.result.data
        })
      } else {
        this.departmentSearch = []
      }
    },
    depSelect (data) {
      const obj = {
        type: 'depart',
        name: data.name,
        id: data.departmentid
      }
      this.$emit('ok', obj)
    },
    // 选择用户
    dataSelect (record) {
      const obj = {
        id: record.value,
        name: record.label,
        type: 'depart'
      }
      this.$emit('ok', obj)
    }
  }
}
</script>
