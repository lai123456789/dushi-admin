<template>
  <div>
    <a-card :bordered="false">
      <a-form :form="form">
        <a-form-item label="示忙类型" help="每行一条,请不要添加空行">
          <a-textarea style="width:420px;height:200px;" v-decorator="['dnd_type',{initialValue: data}]"/>
        </a-form-item>
        <a-form-item style="text-align: left" >
          <a-button htmlType="submit" type="primary" @click="handleSubmit">保存</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      data: null,
      form: this.$form.createForm(this)
    }
  },
  created () {
    this.axios({
      url: '/statistic/dnd/subtable'
    }).then((res) => {
      this.data = res.result
    })
  },
  methods: {
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          this.xios({
            url: '/statistic/dnd/subtable',
            data: values
          }).then((res) => {
            this.loading = false
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
            }
          })
        }
      })
    }
  }
}
</script>
