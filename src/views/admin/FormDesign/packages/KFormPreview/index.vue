<template>
  <a-modal
    title="预览"
    :visible="visible"
    @ok="handleCancel"
    @cancel="handleCancel"
    okText="确认"
    cancelText="关闭"
    style="top:20px;"
    :destroyOnClose="true"
    :width="`${previewWidth}px`"
  >
    <k-form-build :value="jsonData" @submit="handleSubmit" ref="KFormBuild" />
    <jsonModel ref="jsonModel" />
  </a-modal>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 */
export default {
  name: 'KFormPreview',
  data () {
    return {
      visible: false,
      previewWidth: 1200,
      jsonData: {}
    }
  },
  components: {
    jsonModel: () => import('../KFormDesign/module/jsonModal')
  },
  methods: {
    handleSubmit (p) {
      p.then(res => {
        console.log(res, '获取数据成功')
        this.$refs.jsonModel.jsonData = res
        this.$refs.jsonModel.visible = true
      }).catch(err => {
        console.log(err, '获取数据失败')
      })
    },
    handleGetData () {
      this.$refs.KFormBuild.getData()
        .then(res => {
          console.log(res, '获取数据成功')
          this.$refs.jsonModel.jsonData = res
          this.$refs.jsonModel.visible = true
        })
        .catch(err => {
          console.log(err, '获取数据失败')
        })
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>
