<template>
  <a-card>
    <a-form layout="inline" style="display: flex; margin-bottom: 8px;">
      <a-form-item label="员工姓名">
        <a-input v-model="queryParam.ygxm"/>
      </a-form-item>
      <a-form-item label="搜索月份">
        <a-month-picker
          v-model="queryParam.time"
          format="YYYY-MM"
          @change="getSearchDateMonth"
        />
      </a-form-item>
      <a-space>
        <a-button htmlType="submit" type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
        <a-button @click="() => {queryParam = {}, queryParam.time = moment().format('YYYY-MM'), $refs.table.refresh(true)}" >重置</a-button>
      </a-space>
    </a-form>
    <s-table
      bordered
      ref="table"
      size="small"
      rowKey="id"
      :columns="columns"
      :data="loadDataTable"
      :scroll="{ x: scroll.x, y: windowHeight - 230 }"
      :sorter="{ field: 'id', order: 'descend' }"
    >
    </s-table>
  </a-card>
</template>

<script>
export default {
  data () {
    return {
      scroll: {
        x: 270
      },
      windowHeight: document.documentElement.clientHeight,
      queryParam: {
        time: this.moment().format('YYYY-MM')
      }

    }
  },
  created () {
    window.onresize = () => {
      return (() => {
        window.fullHeight = document.documentElement.clientHeight
        this.windowHeight = window.fullHeight
      })()
    }
    this.columns = [{
      title: '员工姓名',
      width: 70,
      dataIndex: 'ygxm',
      align: 'center'
    }, {
      title: '所属分公司',
      dataIndex: 'ssfgs',
      align: 'center'
    }, {
      title: '部门',
      dataIndex: 'ssbm',
      align: 'center'
    }]
    const week = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
    const weekDataIndex = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
    for (let i = 0; i < week.length; i++) {
      this.columns.splice(this.columns.length, 0, {
        title: week[i],
        dataIndex: weekDataIndex[i],
        align: 'center',
        customRender: (text, record) => {
          let string = ''
          const content = text.split('|')
          const style = { textAlign: 'center', background: content[3] === 'green' ? '#95de64' : content[3] === 'gray' ? '#bfbfbf' : '#ff7875' }
          string = <div style={style}><div>{content[0]}</div><div>{content[1]}</div><div>{content[2]}</div></div>
          return string
        }
      })
    }
  },
  methods: {
    loadDataTable (parameter) {
      return this.axios({
        url: '/crm/Order/rypbbb',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        return res.result
      })
    },
    getSearchDateMonth (date, dateString) {
      this.queryParam.time = dateString
    }
  }
}
</script>

<style scoped lang="less">
/deep/.ant-table-body{
  .ant-table-row-cell-ellipsis{
    // 单元格去除默认padding
    padding: 0 !important;
  }
}

</style>
