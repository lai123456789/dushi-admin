<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="config.action === 'preview' ? 800 : 1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-row>
          <a-col :span="8" v-if="config.action !== 'preview'">
            <a-card title="基础信息" size="small">
              <a-form :labelCol="{ span: 7 }">
                <a-form-item label="客户姓名" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-input :read-only="true" class="input" v-model="nairedata.customer"/>
                </a-form-item>
                <a-form-item label="性别" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-input :read-only="true" class="input" v-model="nairedata.sex"/>
                </a-form-item>
                <a-form-item label="客户电话1" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-col :span="22">
                    <a-input :read-only="true" class="input" v-model="nairedata.phone1"/>
                  </a-col>
                  <a-col :span="1"></a-col>
                  <a-col :span="1">
                    <a-icon type="mobile" />
                  </a-col>
                </a-form-item>
                <a-form-item label="客户电话2" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-col :span="22">
                    <a-input :read-only="true" class="input" v-model="nairedata.phone2"/>
                  </a-col>
                  <a-col :span="1"></a-col>
                  <a-col :span="1">
                    <a-icon type="mobile" />
                  </a-col>
                </a-form-item>
                <a-form-item label="客户类型" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-input :read-only="true" class="input"/>
                </a-form-item>
                <a-form-item label="客户级别" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-input :read-only="true" class="input"/>
                </a-form-item>
                <a-form-item label="关联客户编号" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-input :read-only="true" class="input"/>
                </a-form-item>
                <a-form-item label="问卷任务编号" :wrapperCol="{ span: 16 }" :colon="false">
                  <a-input :read-only="true" class="input" v-model="nairedata.id"/>
                </a-form-item>
              </a-form>
            </a-card>
          </a-col>
          <a-col :span="config.action === 'preview'? 24 : 15" :class="config.action === 'preview'?'':'margin'">
            <a-alert :show-icon="false" message="界面仅为问卷预览界面，问卷回访界面会增加业务信息。" type="warning" v-if="config.action ==='preview'" />
            <br v-if="config.action ==='preview'">
            <a-card :title="config.action ==='preview' ? '' : '问卷信息'" :bordered="config.action === 'preview' ? false : true" size="small">
              <a-row type="flex" justify="center">
                <a-col :span="24"><div style="text-align:center"><h2><b>{{ nairedata.nairename }}</b></h2></div></a-col>
                <a-col :span="23"><div>开头语：{{ nairedata.openingRemarks }}</div></a-col>
                <a-col :span="24">
                  <a-form :form="form">
                    <div
                      v-for="(item, key) in firstshow"
                      :key="key"
                    >
                      <a-col :span="1"></a-col>
                      <a-col :span="23">
                        <div v-if="item.questionType === '单选题'">
                          <a-form-item :label-col="{ span: 1 }" :wrapper-col="{ span: 22 }">
                            <a-col :span="24">
                              <h3><b>{{ key &lt; 9 ? '0'+ (key + 1) : key + 1 }}. {{ item.title }}：{{ item.questionType }}</b></h3>
                            </a-col>
                            <a-col :span="24" v-if="item.remark">
                              <div>
                                <p style=" background: #E6F7FF; border: solid 1px #91D5FF ; border-radius: 5px ; padding: 0 20px 0 20px">{{ item.remark }}</p>
                              </div>
                            </a-col>
                            <a-col :span="6" v-if="item.questionType === '单选题'&& item.showform === '1'">
                              <a-radio-group
                                v-decorator="['info[list' + key + ']', { initialValue:config.action === 'browsedetails' ? formdata.answer[key].answer : '', rules: [{ required: item.mustselect === '1' ? true : false, message: '请选择选项' }] }]"
                                :disabled="disabled"
                              >
                                <a-col :span="24">
                                  <a-radio
                                    :style="radioStyle"
                                    :value="keys"
                                    v-for="(items, keys) in item.list"
                                    :key="keys"
                                    @click="config.action !== 'browsedetails' ? jump(nairedata.jump[firstshow[key].id][keys], key) : ''"
                                    @change="closeinput(key)"
                                  >{{ nairedata.jump[firstshow[key].id][keys] }}
                                    {{ items }}
                                  </a-radio>
                                </a-col>
                                <a-col :span="12">
                                  <a-radio :style="radioStyle" :value="item.list.length + 1" v-if="item.other" @change="otherinput($event, key)">
                                    {{ item.other }}
                                  </a-radio>
                                </a-col>
                                <a-col :span="12">
                                  <a-input v-if="item.otherstatus"/>
                                </a-col>
                              </a-radio-group>
                            </a-col>
                            <a-col :span="6" v-if="item.questionType === '单选题' && item.showform === '2'">
                              <a-select
                                v-decorator="['info[list' + key + ']', { initialValue:config.action === 'browsedetails' ? formdata.answer[key].answer : '', rules: [{ required: item.mustselect === '1' ? true : false, message: '请选择选项' }] }]"
                                style="width: 240px"
                                :disabled="disabled"
                              >
                                <a-select-option :value="keys" v-for="(items, keys) in item.list" :key="keys" @click="jump(nairedata.jump[firstshow[key].id][keys], key)">{{ nairedata.jump[firstshow[key].id][keys] }}
                                  {{ items }}
                                </a-select-option>
                                <a-select-option :value="item.list.length + 1" v-if="item.other">
                                  {{ item.other }}
                                </a-select-option>
                              </a-select>
                            </a-col>
                          </a-form-item>
                        </div>
                        <div v-else>
                          <a-form-item>
                            <a-col :span="24">
                              <h3 ><b>{{ key &lt; 9 ? '0' + (key + 1) : key + 1 }}. {{ item.title }}：{{ item.questionType }}</b></h3>
                            </a-col>
                            <a-col :span="13" v-if="item.questionType === '填空题'">
                              <div v-for="(value, keys) in item.fill" :key="keys">
                                <a-form-item>
                                  <a-input :read-only="disabled" :class="disabled ? 'input' : ''" v-decorator="['info[fill' + key + keys +']', { initialValue:config.action === 'browsedetails' ? formdata.answer[key].answer[keys] : '' ,rules: [{ required: item.mustselect === '1' ? true : false, message: '请输入填空内容' }] }]"/>
                                </a-form-item>
                              </div>
                            </a-col>
                            <a-col :span="24" v-if="item.remark">
                              <div>
                                <p style=" background: #E6F7FF; border: solid 1px #91D5FF ; border-radius: 5px ; padding: 0 20px 0 20px">{{ item.remark }}</p>
                              </div>
                            </a-col>
                            <a-col :span="6">
                              <a-checkbox-group :disabled="disabled" v-if="item.questionType==='多选题'" v-decorator="['info[more' + key + ']', { initialValue:config.action === 'browsedetails' ? formdata.answer[key].answer : '', rules: [{ required: item.mustselect === '1' ? true : false, message: '请选择选项' }] }]" >
                                <a-col :span="24">
                                  <a-checkbox :style="radioStyle" :value="keys" v-for="(items, keys) in item.list" :key="keys" >
                                    {{ items }}
                                  </a-checkbox>
                                </a-col>
                                <a-col :span="12">
                                  <a-checkbox :style="radioStyle" :value="item.other" v-if="item.other" @change="otherinput($event, key)">
                                    {{ item.other }}
                                  </a-checkbox>
                                </a-col>
                                <a-col :span="12">
                                  <a-input v-if="item.otherstatus"/>
                                </a-col>
                              </a-checkbox-group>
                            </a-col>
                            <a-col :span="24">
                              <a-form-item>
                                <rate
                                  :disabled="disabled"
                                  v-decorator="['info[stars' + key + ']', { initialValue:config.action === 'browsedetails' ? formdata.answer[key].answer : '', rules: [{ required: item.mustselect === '1' ? true : false, message: '请选择评分' }] }]"
                                  v-if="item.questionType==='评分题'"
                                  :allow-half="item.stars === '1' ? true : false"/>
                              </a-form-item>
                            </a-col>
                            <a-col :span="24">
                              <a-form-item>
                                <a-textarea
                                  :read-only="disabled"
                                  :class="disabled ? 'input' : ''"
                                  :auto-size="{ minRows: item.min, maxRows: item.max }"
                                  v-if="item.questionType === '简答题'"
                                  v-decorator="['info[brief' + key + ']', { initialValue:config.action === 'browsedetails' ? formdata.answer[key].answer : '', rules: [{ required: item.mustselect === '1' ? true : false, message: '请输入简答内容' }] }]" />
                              </a-form-item>
                            </a-col>
                          </a-form-item>
                        </div>
                      </a-col>
                    </div>
                  </a-form>
                </a-col>
              </a-row>
            </a-card>
          </a-col>
        </a-row>
      </a-form>
      <div class="bbar" v-if="showdata.operation !== 'handle'">
        <a-button type="primary" @click="previewsubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { Rate } from 'ant-design-vue'
export default {
  components: {
    Rate
  },
  props: {
    showdata: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      visible: false,
      loading: false,
      otherstatus: false,
      disabled: false,
      must: false,
      config: {},
      nairedata: {},
      nariedetails: [],
      firstshow: [],
      formdata: [],
      TempData: {},
      form: this.$form.createForm(this, { name: 'Browsing' })
    }
  },
  mounted () {
  },
  watch: {
  },
  methods: {
    // 预览获取数据
    show (config) {
      this.visible = true
      this.loading = true
      this.disabled = false
      this.config = config
      this.TempData = []
      this.firstshow = []
      this.nairedata = []
      this.nairedata = config.nairedata
      this.axios({
        url: this.config.url,
        data: { id: this.config.id }
      }).then(res => {
        console.log(res)
        this.loading = false
        this.nariedetails = res.result.data
        console.log(this.nariedetails)
        for (const i in this.nariedetails) {
          if (this.nariedetails[i].other === '1') {
            this.nariedetails[i].other = '其他'
          } else {
            this.nariedetails[i].other = null
          }
        }
        for (let i = 0; i < this.nariedetails.length; i++) {
          if (this.nariedetails[i].questionType === '单选题') {
            this.firstshow = this.nariedetails.slice(0, i + 1)
            this.TempData[i] = this.firstshow
            return false
          } else {
            this.firstshow.push(this.nariedetails[i])
            console.log(this.firstshow)
          }
        }
      })
    },
    // 回访获取数据
    show2 (config) {
      this.visible = true
      this.loading = true
      this.disabled = false
      this.config = config
      this.TempData = []
      this.firstshow = []
      this.nairedata = []
      this.axios({
        url: this.config.url,
        data: { id: this.config.id }
      }).then(res => {
        console.log(res)
        this.loading = false
        this.nariedetails = res.result.data
        this.nairedata = res.result.naireData
        for (const i in this.nariedetails) {
          if (this.nariedetails[i].other === '1') {
            this.nariedetails[i].other = '其他'
          } else {
            this.nariedetails[i].other = null
          }
        }
        for (let i = 0; i < this.nariedetails.length; i++) {
          if (this.nariedetails[i]) {
            if (this.nariedetails[i].questionType === '单选题') {
              this.firstshow = this.nariedetails.slice(0, i + 1)
              this.TempData[i] = this.firstshow
              return false
            } else {
              this.firstshow.push(this.nariedetails[i])
            }
          }
        }
      })
    },
    // 详情数据接收
    show3 (config) {
      this.visible = true
      this.loading = true
      this.disabled = true
      this.config = config
      this.TempData = []
      this.firstshow = []
      this.axios({
        url: this.config.url,
        data: { id: this.config.id }
      }).then(res => {
        console.log(res)
        this.loading = false
        this.nariedetails = res.result.data
        this.nairedata = res.result.naireData
        this.formdata = res.result.naireData
        for (const i in this.nariedetails) {
          if (this.nariedetails[i].other === '1') {
            this.nariedetails[i].other = '其他'
          } else {
            this.nariedetails[i].other = null
          }
        }
        this.firstshow = this.nariedetails
      })
    },
    // 预览数据提交
    previewsubmit () {
      if (this.config.action === 'preview') {
        this.$message.error('这是问卷预览界面，不允许提交')
      }
    },
    // 弹出选项其他input框
    otherinput (e, key) {
      if (e.target.checked === true) {
        this.firstshow[key]['otherstatus'] = true
      } else {
        this.firstshow[key]['otherstatus'] = false
      }
      console.log(e.target.checked)
      console.log(key)
    },
    // 关闭选项其他input框
    closeinput (key) {
      this.firstshow[key]['otherstatus'] = false
    },
    // 预览逻辑跳转
    jump (keys, id) {
      // keys 跳转问卷题目位置
      // id 当前单选题位置
      this.TempData[id] = [...new Set(this.TempData[id])]
      this.firstshow = this.TempData[id]
      for (let i = 0; i < this.nariedetails.length + 1; i++) {
        if (i === keys) {
          for (let j = keys - 1; j < this.nariedetails.length + 1; j++) {
            if (this.nariedetails[j]) {
              if (this.nariedetails[j].questionType === '单选题') {
                this.firstshow.push(this.nariedetails[j])
                this.firstshow = [...new Set(this.firstshow)]
                const length = this.firstshow.length
                this.TempData[length - 1] = this.firstshow.slice(0, j)
                this.TempData[length - 1] = [...new Set(this.TempData[length - 1])]
                return false
              } else {
                this.firstshow.push(this.nariedetails[j])
                this.TempData[id] = this.firstshow.slice(0, id + 1)
              }
            }
          }
        }
      }
    },
    // 回访逻辑跳转
    jump2 (keys, id) {
      // keys 跳转问卷题目位置
      // id 当前单选题位置
      console.log(keys)
      console.log(id)
      this.firstshow = this.TempData[id]
      console.log(this.TempData)
      for (let i = 0; i < this.nariedetails.length + 1; i++) {
        if (i === keys) {
          console.log(i)
          for (let j = keys - 1; j < this.nariedetails.length + 1; j++) {
            console.log(this.nariedetails[j])
            if (this.nariedetails[j]) {
              if (this.nariedetails[j].questionType === '单选题') {
                console.log(this.nariedetails[j])
                this.firstshow.push(this.nariedetails[j])
                this.length = this.firstshow.length - 1
                const length = this.firstshow.length
                this.TempData[length - 1] = this.firstshow
                console.log(i)
                return false
              } else {
                this.firstshow.push(this.nariedetails[j])
                this.TempData[id] = this.nariedetails.slice(0, id + 1)
              }
            }
          }
        }
      }
    }
  }
}
</script>
<style scoped>
.input{
  background-color: #F5F5F5;
}
.margin{
  margin-left: 20px;
}
</style>
