<template>
  <a-modal
    title="查询质保期"
    :visible="visible"
    :destroyOnClose="true"
    :width="900"
    :bodyStyle="{paddingTop: '0px', maxHeight: '600px', overflow: 'auto'}"
    @cancel="visible =!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-space direction="vertical" size="small" style="width: 100%">
          <a-card v-for="(pro, key) in product" :key="key" >
            <a-row>
              <a-col :span="8">
                <a-form-item :label="'产品' + (key + 1)" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input :disabled="true" v-decorator="['cpxh' + key, {initialValue: pro.cpxh}]" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="质保到期日" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input :disabled="true" v-decorator="['zbdqr' + key, {initialValue: pro.zbdqr}]" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="质保剩余天数" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input :disabled="true" v-decorator="['zbsyts' + key, {initialValue: pro.zbsyts}]" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </a-space>
      </a-form>
    </a-spin>
    <div slot="footer">
      <a-button @click="visible =!visible">取消</a-button>
    </div>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      product: [],
      config: {}
    }
  },
  methods: {
    async show (config) {
      this.product = [{}]
      const array = []
      this.visible = true
      this.loading = true
      this.config = config
      for (let i = 0; i < config.product.length; i++) {
        await this.axios({
          url: 'app/Goods/goodsWarranty',
          data: { info: config.product[i] }
        }).then(res => {
          const obj = res.result.zbsyts ? res.result : {}
          obj['cpxh'] = config.product[i].cpxh
          array.push(obj)
        })
      }
      this.$nextTick(() => {
        this.product = array
        this.loading = false
      })
    }
  }
}
</script>
