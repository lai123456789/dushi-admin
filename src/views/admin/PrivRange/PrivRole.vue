<template>
  <a-spin :spinning="loading">
    <a-form :form="form">
      <a-input-search style="margin-bottom: 8px" placeholder="请输入角色名称" v-model="queryParam.rolename" @search="$refs.tableRole.refresh(true)"/>
      <s-table
        size="small"
        ref="tableRole"
        rowKey="roleid"
        :columns="columnsRole"
        :data="loadDataTable"
        :sorter="{ field: 'listorder', order: 'ascend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="dataSelect(record,'role')">选择</a>
        </div>
      </s-table>
    </a-form>
  </a-spin>
</template>
<script>
export default {
  data () {
    return {
      queryParam: {},
      loading: false,
      form: this.$form.createForm(this),
      columnsRole: [{
        title: '角色',
        dataIndex: 'rolename'
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 50,
        scopedSlots: { customRender: 'action' }
      }]
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/role/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    // 选择角色
    dataSelect (record) {
      console.log(record)
      const obj = {
        id: record.roleid,
        name: record.rolename,
        type: 'role'
      }
      this.$emit('ok', obj)
    }
  }
}
</script>
