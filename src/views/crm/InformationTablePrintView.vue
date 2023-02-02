<template>
  <!-- 表单组件 -->
  <a-spin :spinning="pageLoading">
    <a-form :form="form">
      <buildBlocks
        ref="buildBlocks"
        v-for="(item, keys) in template"
        :key="item.key"
        :record.sync="template[keys]"
        :indexs="keys"
        style="width: 1000px"
        :params="params"
      />
    </a-form>
  </a-spin>
</template>
<script>
export default {
  components: {
    buildBlocks: () => import('./InformationTablePrintBuild')
  },
  data () {
    return {
      form: this.$form.createForm(this),
      viewThis: this,
      template: [],
      pageLoading: false,
      values: {},
      num: 0
    }
  },
  props: {
    params: {
      type: Object,
      default () {
        return {
          template: []
        }
      },
      required: true
    }
  },
  watch: {
    params: {
      handler (newValue) {
        this.pageLoading = true
        this.template = newValue.template
        const gridData = []
        newValue.template.forEach(item => {
          if (item.column) {
            const items = []
            items.push(item)
            const data = {
              'type': 'grid',
              'label': '栅格布局',
              'columns': [{
                'span': item.column,
                'list': items
              }],
              'options': {
                'gutter': 5
              },
              'key': 'grid' + new Date().getTime()
            }
            gridData[0] = data
          } else {
            gridData.push(item)
          }
        })
        this.template = gridData
        this.$nextTick(() => {
          if (this.num > 1) {
            this.pageLoading = false
            setTimeout(() => {
              window.print()
            }, 3000)
          }
        })
        this.num++
      },
      immediate: true
    }
  },
  methods: {
  }
}
</script>
