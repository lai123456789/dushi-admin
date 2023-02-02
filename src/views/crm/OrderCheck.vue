<template>
  <a-modal v-model="visible" :title="title" @ok="()=>{loading = true,handleSubmit()}" :confirmLoading="loading" :maskClosable="false">
    <a-form :form="checkForm">
      <div v-if="result.code===0">
        <div v-for="(item, index) in result.result" :key="index">
          <a-row v-if="item.code === 0">
            <a-col :span="24"><span v-if="item.message" style="color: #f5222d">{{ item.message }}</span></a-col>
            <a-col :span="1"></a-col>
            <a-col :span="23"><span v-if="item.result.crm_pdgz && item.result.crm_pdgz.id" style="color: #f5222d">当前匹配规则ID: {{ item.result.crm_pdgz.id }}</span></a-col>
          </a-row>
          <a-form-item
            :label="'产品' + (index + 1)"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol">
            <div v-if="item.code === 0 && item.result.type =='send_network'">
              <a-radio-group @change="(e)=>{networkChange(e, index, item.result.crm_pdgz)}" v-decorator="['handle' + (index + 1), {initialValue: item.result.default, rules: [{required: true, message: '请选择网点'}]}]">
                <a-radio :style="radioStyle" :value="item.result.default" :disabled="item.turnSend">
                  {{ item.result.default.wdmc }}
                </a-radio>
                <a-form-item label="转派" v-if="item.result.others.length !== 0" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                  <a-checkbox v-model="item.turnSend" @change="(e)=>{turnSendChange(e, index, item.result.default, item.result.crm_pdgz)}"></a-checkbox>
                </a-form-item>
                <a-row v-if="item.turnSend && item.result.others.length !== 0" >
                  <a-col :span="2"></a-col>
                  <a-col :span="20">
                    <a-radio v-for="(otherItem, otherIndex) in item.result.others" :key="otherIndex" :style="radioStyle" :value="otherItem">
                      {{ otherItem.wdmc }}
                    </a-radio>
                    <a-form-item label="转派原因">
                      <a-textarea
                        v-decorator="['handleRemark' + (index + 1), {initialValue: '', rules: [{required: item.turnSend, message: '请输入转派原因'}]}]"
                        :auto-size="{ minRows: 3, maxRows: 5}" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-radio-group>
            </div>
            <a-radio-group v-else-if="item.code === 0" v-decorator="['handle' + (index + 1), {initialValue: item.result.type, rules: [{required: true, message: '请选择派单方式'}]}]">
              <a-radio :style="radioStyle" :value="item.result.type">
                {{ item.result.text }}
              </a-radio>
            </a-radio-group>
            <div v-else style="color: #f5222d">
              {{ item.message }}
            </div>
          </a-form-item>
        </div>
      </div>
      <div v-else>
        {{ result.message }}
      </div>
    </a-form>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      checkForm: this.$form.createForm(this),
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      url: '/crm/Order/orderCheck',
      result: [],
      parent: {},
      visible: false,
      loading: false,
      turnSend: false,
      title: '匹配结果',
      radioStyle: {
        display: 'block',
        height: '30px',
        width: '380px',
        lineHeight: '30px',
        wordBreak: 'break-all'
      },
      extFormData: {}
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = false
      this.parent = config.parent
      this.title = config.title
      this.result = config.result
      this.extFormData[this.parent.tableName] = {}
      this.extFormData[this.parent.tableName + '_gdcp'] = []
      if (!this.extFormData.parameter) {
        this.extFormData['parameter'] = {}
      }
      if (!this.extFormData.parameter.crm_pdgz_res) {
        this.extFormData['parameter']['crm_pdgz_res'] = []
      }
      if (this.result.code === 0) {
        this.result.result.forEach((item, index) => {
          this.$set(item, 'turnSend', false)
          if (item.code === 0) {
            if (index === 0) {
              if (item.result.type === 'send_network') {
                this.extFormData[this.parent.tableName] = this.$deepmerge(this.extFormData[this.parent.tableName], item.result.default)
              }
            } else {
              this.extFormData[this.parent.tableName + '_gdcp'][index - 1] = {}
              if (item.result.type === 'send_network') {
                this.extFormData[this.parent.tableName + '_gdcp'][index - 1] = this.$deepmerge(this.extFormData[this.parent.tableName + '_gdcp'][index - 1], item.result.default)
              }
            }
            this.extFormData.parameter.crm_pdgz_res[index] = item.result.crm_pdgz
          }
        })
      }
    },
    networkChange (e, index, crmPdgz) {
      const value = e.target.value
      this.dataChange(value, index, crmPdgz)
    },
    dataChange (value, index, crmPdgz) {
      if (index === 0) {
        this.extFormData[this.parent.tableName] = this.$deepmerge(this.extFormData[this.parent.tableName], value)
      } else {
        this.extFormData[this.parent.tableName + '_gdcp'][index - 1] = this.$deepmerge(this.extFormData[this.parent.tableName + '_gdcp'][index - 1], value)
      }
      this.extFormData.parameter.crm_pdgz_res[index] = this.result.result[index].turnSend ? {} : crmPdgz
    },
    turnSendChange (e, index, data, crmPdgz) {
      const obj = {}
      if (!e.target.checked) {
        obj['handle' + (index + 1)] = data
        obj['handleRemark' + (index + 1)] = ''
        this.dataChange(data, index, crmPdgz)
      } else {
        obj['handle' + (index + 1)] = ''
      }
      this.checkForm.setFieldsValue(obj)
    },
    handleSubmit () {
      if (this.result.result.every(item => item.code === 0)) {
        this.checkForm.validateFields((errors, values) => {
          if (!errors) {
            this.extFormData[this.parent.tableName]['bz'] = values.handleRemark1
            if (this.extFormData[this.parent.tableName + '_gdcp'].length > 0) {
              this.extFormData[this.parent.tableName + '_gdcp'].forEach((item, index) => {
                item['bz'] = values['handleRemark' + (index + 2)]
              })
            }

            const formData = {
              confirm: true,
              extFormData: this.extFormData
            }
            this.visible = false
            this.parent.handleSubmit(formData)
          }
        })
      }
    }
  }
}
</script>
