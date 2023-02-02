<template>
  <div class="container">
    <a-card
      hoverable
      class="card"
      v-for="item in list"
      :key="item.id"
      @click="handleCreate(item)"
    >
      <div class="mycontent" :class="item.create_type !== 'handle' ? 'disabled' : '' " >
        <a-icon :type="item.setting.icon.type" :theme="item.setting.icon.theme" style="font-size: 48px; margin: 4px 0 8px 0;" class="grey_color" />
        <div class="grey_color">{{ item.workflow_name }}</div>
      </div>
    </a-card>
    <!-- 数据表单 -->
    <workflow-handle-form ref="workflowHandleForm" :key="indexKey"></workflow-handle-form>
  </div>
</template>
<script>
import Vue from 'vue'
import WorkflowHandleForm from './WorkflowHandleForm'
Vue.component('WorkflowHandleForm', WorkflowHandleForm)
export default {
  data () {
    return {
      // 表头
      columns: [{
        width: 120,
        title: '管理操作',
        dataIndex: 'manage',
        scopedSlots: { customRender: 'manage' }
      }, {
        width: 80,
        title: 'ID',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '工作流名称',
        dataIndex: 'workflow_name',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' },
      indexKey: 0,
      list: []
    }
  },
  created () {
    this.axios({
      url: '/admin/workflow/main',
      params: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      }
    }).then(res => {
      this.list = res.result.data
      this.list.forEach(item => {
        item.setting = JSON.parse(item.setting)
        if (!item.setting.icon) {
          item.setting.icon = { type: 'profile' }
        }
      })
    })
  },
  methods: {
    handleCreate (record) {
      if (record.create_type === 'handle') {
        this.indexKey = this.indexKey ? 0 : 1
        this.$nextTick(() => {
          this.$refs.workflowHandleForm.show({
            config: {
              title: '创建流程: ' + record.workflow_name,
              width: 1200,
              tplviewUrl: '/admin/wcase/add/?action=getview',
              url: '/admin/wcase/add?action=submit',
              workflow_id: record.workflow_id,
              viewType: 'create'
            },
            record: record
          })
        })
      }
    }
  }
}
</script>
<style lang="less" scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  .card {
    width: 120px;
    height: 130px;
    margin: 10px;
    .mycontent {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      div {
        margin-top: 5px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }
    .disabled {
      cursor: not-allowed;
      .grey_color {
        color: #ccc;
      }
    }
  }
}
</style>
