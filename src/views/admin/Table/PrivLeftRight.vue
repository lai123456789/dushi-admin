<template>
  <a-drawer
    :title="config.title"
    :destroyOnClose="true"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-row :gutter="20">
          <a-col :span="14">
            <a-card>
              <a-tabs default-active-key="user" >
                <a-tab-pane key="user" tab="用户">
                  <priv-user ref="privUser" @ok="listPush" />
                </a-tab-pane>
                <a-tab-pane key="depart" tab="部门">
                  <priv-depart ref="privDepart" @ok="listPush" />
                </a-tab-pane>
                <a-tab-pane key="role" tab="角色">
                  <priv-Role ref="privRole" @ok="listPush" />
                </a-tab-pane>
              </a-tabs>
            </a-card>
          </a-col>
          <a-col :span="10">
            <a-button @click="deleteAll" style="margin-bottom: 10px">清空</a-button>
            <a-table size="small" rowKey="id" :columns="columns" :dataSource="list">
              <div slot="action" slot-scope="text, record">
                <a @click="handleDelete(record)">删除</a>
              </div>
            </a-table>
          </a-col>
        </a-row>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    PrivUser: () => import('@/views/admin/PrivRange/PrivUser'),
    PrivDepart: () => import('@/views/admin/PrivRange/PrivDepart'),
    PrivRole: () => import('@/views/admin/PrivRange/PrivRole')
  },
  data () {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      config: {},
      list: [],
      columns: [ {
        title: '名称',
        dataIndex: 'name',
        width: 450
      }, {
        title: '类型',
        dataIndex: 'type',
        width: 450,
        customRender: (text) => {
          if (text === 'user') {
            return '用户'
          } else if (text === 'role') {
            return '角色'
          } else {
            return '部门'
          }
        }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }]
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.list = config.selectValue || []
    },
    listPush (data) {
      if (this.list.every(item => item.id !== data.id)) {
        this.list.splice(this.list.length, 0, data)
      }
    },
    // 删除单个数据
    handleDelete (record) {
      this.list = this.list.filter(item => item.id !== record.id)
    },
    // 清空
    deleteAll () {
      this.list = []
    },
    handleSubmit () {
      this.visible = false
      this.$emit('ok', this.list)
    }
  }
}
</script>
