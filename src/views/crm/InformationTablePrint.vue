<template>
  <div style="margin: 0; height: 100vh; -webkit-print-color-adjust: exact;">
    <a-spin :spinning="loading" size="large">
      <user-table-form-view
        ref="userTableFormView"
        :params="{ template, parentParams: params, page: 'workflow' }"
        :formThis="this"
        @ok="getVisible"
        @start="handleStart"
      />
    </a-spin>
  </div>
</template>
<script>
export default {
  components: {
    UserTableFormView: () => import('./InformationTablePrintView')
  },
  created () {
    this.createForm()
  },
  data () {
    return {
      data: [],
      // 关联数据表
      template: [],
      params: {},
      pageLoading: false,
      loading: false
    }
  },
  methods: {
    // 创建表单
    createForm (alias, value) {
      this.$set(this, 'loading', true)
      const sftx = this.$route.query.sftx
      this.axios({
        url: '/admin/UserTable/edit',
        data: {
          action: 'edit',
          flowStatus: 'proceed',
          id: this.$route.query.id,
          tableViewField: sftx === 's' ? 'bgnr' : '',
          record: { id: sftx === 's' ? this.$route.query.id : '' },
          listTplviewid: '32fada055c87eaec523d56f81191c859',
          tplviewid: this.$route.query.tplviewid
        }
      }).then(res => {
        this.params.tableid = res.result.tableid
        this.params.record = res.result.data
        this.params.case_id = res.result.case_id
        this.params.action = 'edit'
        this.template = JSON.parse(JSON.stringify(res.result.template)) || []
        // 表单初始化loader
        if (res.result.tplSetting && res.result.tplSetting.tplInitJs) {
          var initAttribute = res.result.tplSetting.tplInitJs
          var initTemplate = {
            type: 'component',
            attribute: initAttribute
          }
          this.template.push(initTemplate)
        }
        const getComponent = (array) => {
          array.forEach((item, index) => {
            if (item.columns) {
              getComponent(item.columns)
            } else if (item.trs) {
              getComponent(item.trs)
            } else if (item.list) {
              getComponent(item.list)
            } else {
              if (item.type === 'component') {
                item.component = {
                  template: `<span>${item.attribute}</span>`,
                  data: () => {
                    return {
                      parent: this
                    }
                  }
                }
              }
              if (alias && item.field && alias === item.field.alias) {
                this.$set(item.field, 'value', value)
              }
            }
          })
        }
        getComponent(this.template)
        this.loading = false
      })
    },
    handleStart () {
      this.$set(this, 'loading', true)
    },
    getVisible (values, tableName, message) {
      this.loading = false
      if (message !== 'error') {
        this.visible = false
        setTimeout(() => {
          this.handleCancel()
        }, 1500)
        this.$emit('ok', values, tableName)
      }
    }
  }
}
</script>
