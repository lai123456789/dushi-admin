<template>
  <a-drawer
    :destroyOnClose="true"
    title="填写交底信息"
    :width="1000"
    :visible="visible"
    @close="visible = false; $parent.$parent.formThis.pageLoading = false">
    <a-spin :spinning="false">
      <a-card>
        <a-row :gutter="32" type="flex" align="middle">
          <a-form :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-col :span="6">
              <a-form-item label="工单编号">
                <a-input v-model="queryParam.gdbh" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="交底人">
                <a-input v-model="queryParam.tdyxm" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="交底日期">
                <a-input v-model="queryParam.pgsj" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="交底接受人">
                <a-input v-model="queryParam.jdjsr" disabled/>
              </a-form-item>
            </a-col>
          </a-form>
        </a-row>
        <div style="margin-top: 8px">
          <a-textarea placeholder="请输入内容" :autoSize="{ minRows: 25, maxRows: 40 }" v-model="queryParam.jdnr"/>
        </div>
      </a-card>
      <div class="bbar">
        <a-button type="primary" @click="submit">提交</a-button>
        <a-button @click="visible=!visible; $parent.$parent.formThis.pageLoading = false">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      visible: true,
      config: '',
      parent: '',
      queryParam: {},
      labelCol: { style: 'width: 80px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 80px); display: inline-block;' }
    }
  },
  methods: {
    show (config) {
      console.log('config', config)
      this.config = config
      this.queryParam = config.data.crm_xjaz
      const data = config.data.crm_xjaz
      this.queryParam.jdjsr = data.fxgcs ? data.zxgcs + '/' + data.fxgcs : data.zxgcs
      this.visible = true
      this.parent = config.parent
    },
    submit () {
      const formData = {
        confirm: true,
        extFormData: {
          crm_xjaz: {
            jdr: this.queryParam.tdyxm,
            jdrq: this.queryParam.pgsj,
            jdjsr: this.queryParam.jdjsr,
            jdnr: this.queryParam.jdnr
          }
        }
      }
      this.visible = false
      this.parent.handleSubmit(formData)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
