<template>
  <a-drawer
    title="快捷键大全"
    :width="600"
    :visible="modalVisible"
    @close="modalVisible=!modalVisible">
    <a-spin :spinning="false">
      <a-table
        size="small"
        rowKey="code"
        :pagination="false"
        :columns="columns"
        :dataSource="dataSource">
      </a-table>
      <div class="bbar">
        <a-button @click="modalVisible=!modalVisible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { flowConfig } from '../config/args-config.js'
export default {
  data () {
    return {
      modalVisible: false,
      columns: [ {
        title: '功能',
        key: 'shortcutName',
        dataIndex: 'shortcutName',
        width: '50%'
      }, {
        title: '快捷键',
        key: 'codeName',
        dataIndex: 'codeName',
        width: '50%'
      } ],
      dataSource: []
    }
  },
  created () {
    const obj = Object.assign({}, flowConfig.shortcut)
    for (const k in obj) {
      this.dataSource.push(obj[k])
    }
  },
  methods: {
    open () {
      this.modalVisible = true
    }
  }
}
</script>
