<template>
  <div style="padding-bottom: 100px">
    <a-form :form="form" :label-col="{ span: 4 }" @submit="handleSubmit" v-bind="formItemLayoutWithOutLabel">
      <a-form-item label="题型" :wrapper-col="{ span: 18 }">
        <a-radio-group button-style="solid" @change="handleChange" v-decorator="['questionType' , { initialValue: questionstype, rules: [{ required: true, message: '请选择题型' }]}]">
          <a-radio value="单选题">单选题</a-radio>
          <a-radio value="多选题">多选题</a-radio>
          <a-radio value="填空题">填空题</a-radio>
          <a-radio value="评分题">评分题</a-radio>
          <a-radio value="简答题">简答题</a-radio>
          <a-radio value="文字描述">文字描述</a-radio>
        </a-radio-group>
      </a-form-item>
      <!-- 测试用id -->
      <a-form-item v-show="false">
        <a-input v-decorator="['id', { initialValue: formdata.id }]" />
      </a-form-item>
      <a-form-item label="标题" :wrapper-col="{ span: 18 }" v-if="allshow">
        <a-textarea
          v-decorator="['title', { initialValue: formdata.title, rules: [{ required: allshow, message: '请输入标题' }] }]"
          :auto-size="{ minRows: 5, maxRows: 8 }"
        />
      </a-form-item>
      <a-form-item label="标题" :wrapper-col="{ span: 18 }" v-if="fill">
        <a-textarea
          v-model="fillstitle"
          :auto-size="{ minRows: 5, maxRows: 8 }"
        />
      </a-form-item>
      <a-col :span="4" v-if="fill"></a-col>
      <p v-if="fill"><a @click="pushfills">插入填空项</a></p>
      <a-form-item label="备注" :wrapper-col="{ span: 18 }">
        <a-input v-decorator="['remark', { initialValue: formdata.remark }]"/>
      </a-form-item>
      <a-form-item label="是否必填" v-if="must" :wrapper-col="{ span: 12 }">
        <a-switch checked-children="是" un-checked-children="否" v-decorator="['mustselect', { valuePropName: 'checked', initialValue: formdata.mustselect}]"/>
      </a-form-item>
      <a-form-item label="展现形式" v-if="showform" :wrapper-col="{ span: 12 }">
        <a-radio-group name="showform" v-model="formdata.showform">
          <a-radio value="1">单选按钮</a-radio>
          <a-radio value="2">下拉框</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="无条件跳转至" v-if="radioJump" :wrapper-col="{ span: 12 }">
        <a-col :span="3">
          <a-switch checked-children="开" un-checked-children="关" :checked="checked" @change="jump(checked)"/>
        </a-col>
        <a-col :span="16" v-if="radioJumpstate">
          <a-select default-value="按问卷试题顺序往下" >
            <a-select-option value="按问卷试题顺序往下">按问卷试题顺序往下</a-select-option>
          </a-select>
        </a-col>
      </a-form-item>
      <a-col :span="4" v-if="batch"></a-col>
      <p v-if="batch"><a :style="{ color : '#4DAAFF' }" @click="bulkEdit">批量编辑</a></p>
      <a-col :span="4" v-if="batch"></a-col>
      <a-form-item v-if="batch" :wrapper-col="{ span: 20 }">
        <drag-list
          style="margin-bottom : 16px;"
          :data.sync="optionsListshow.list"
          :jumpTo="jumpTo"
          @funadd="addOptions"
          @fundel="delOptions"
        />
      </a-form-item>
      <a-col :span="5" v-if="batch"></a-col>
      <a-form-item v-if="batch" :wrapper-col="{ span: 18 }">
        <a-form-item :wrapper-col="{ span: 14 }">
          <a-row type="flex" align="middle">
            <a-col :span="20">
              <a-input :read-only="true" v-model="othermessage" :class="checkedother === 0 ? 'input' : ''"/>
            </a-col>
            <a-col :span="1">
            </a-col>
            <a-checkbox v-decorator="['other', { valuePropName: 'checked',initialValue: formdata.other }]">
            </a-checkbox>
          </a-row>
        </a-form-item>
      </a-form-item>
      <a-form-item label="多行文本框行高" :wrapper-col="{ span: 18 }" v-if="shortAnswer">
        <a-input-number
          v-model="formdata.min"
          :min="1"
          :max="10" />~
        <a-input-number
          v-model="formdata.max"
          :min="formdata.min"
        />
      </a-form-item>
      <a-form-item label="是否允许半星" :wrapper-col="{ span: 18 }" v-if="stars">
        <a-switch checked-children="是" un-checked-children="否" v-decorator="['stars', { valuePropName: 'checked', initialValue: formdata.stars }]" />
      </a-form-item>
    </a-form>
    <div class="bbar" style="position : absolute; bottom : 0; right : 0; width : 100%; background-color : white">
      <a-button type="primary" html-type="submit" @click="handleSubmit">{{ config.action === 'edit' ? '修改':'保存' }}</a-button>
      <a-button @click="cancel_off" >{{ config.action === 'edit' ? '重置':'关闭' }}</a-button>
    </div>
    <!-- 批量修改 -->
    <a-drawer
      :title="configEdit.title"
      :width="600"
      :visible="visiblebulk"
      @close="visiblebulk=!visiblebulk"
    >
      <a-form>
        <a-form-item>
          <a-textarea
            :auto-size="{ minRows: 10, maxRows: 25 }"
            v-model="bulkdata"
          />
        </a-form-item>
      </a-form>
      <div class="bbar" style="position : absolute; bottom : 0; right : 0; width : 100%; background-color : white">
        <a-button type="primary" @click="bulksubmit">保存</a-button>
        <a-button @click="visiblebulk=!visiblebulk">关闭</a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script>
export default {
  props: {
    actions: {
      type: String,
      required: true
    },
    questionstype: {
      type: String,
      required: true
    },
    optionsList: {
      type: Object,
      required: true
    },
    optionsfill: {
      type: Array,
      required: true
    },
    formdata: {
      type: Object,
      required: true
    },
    length: {
      type: Number,
      required: true
    }
  },
  components: {
    DragList: () => import('./QuestionaddDragList')
  },
  data () {
    return {
      visiblebulk: false,
      allshow: true,
      // 必填
      must: true,
      // 展现形式
      showform: false,
      // 多行文本框行高
      shortAnswer: false,
      // 批量编辑
      batch: false,
      // 简答题文本框最小行数
      min: 2,
      max: '',
      stars: false,
      // 填空
      fill: false,
      radioJump: false,
      radioJumpstate: false,
      answer: '',
      fillstitle: '',
      filltitle: this.formdata.title,
      dataEdit: {
        title1: ''
      },
      othermessage: '其他______',
      optionsfill2: [],
      checked: false,
      jumpTo: false,
      config: {
        action: this.actions,
        data: {}
      },
      configEdit: {
        action: 'bulkEdit',
        title: '批量编辑',
        url: '',
        data: {}
      },
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 20, offset: 4 }
        }
      },
      color: '#777',
      colorfill: '#777',
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 }
        }
      },
      optionsListshow: this.optionsList,
      optionsList2: {
        list: ['']
      },
      submitStatus: 0,
      options: [],
      bulkdata: '',
      checkedother: false,
      underline: []
    }
  },
  mounted () {
    this.allState()
  },
  watch: {
    filltitle () {
      console.log(this.formdata.title)
    }
  },
  methods: {
    // 选项添加
    addOptions (key) {
      this.optionsListshow.list.splice(key + 1, 0, '')
      this.color = 'red'
    },
    // 选项删除
    delOptions (key) {
      if (this.optionsListshow.list.length === 1) {
        return false
      } else {
        this.optionsListshow.list.splice(key, 1)
      }
      this.iconcolor()
    },
    // 是否显示选项指定跳转
    jump (checked) {
      this.checked = !this.checked
      if (checked === false) {
        this.radioJumpstate = true
      } else {
        this.radioJumpstate = false
      }
      if (checked === true) {
        this.jumpTo = true
      } else {
        this.jumpTo = false
      }
    },
    // 选项加减样式
    iconcolor () {
      if (this.optionsListshow.list.length === 1) {
        this.color = '#777'
      } else {
        this.color = 'red'
      }
    },
    // 打开批量编辑
    bulkEdit () {
      this.visiblebulk = true
      this.bulkdata = this.optionsListshow.list.join('\n')
    },
    // 批量编辑提交
    bulksubmit () {
      this.visiblebulk = false
      this.optionsListshow.list = this.bulkdata.split('\n')
    },
    // 插入填空选项
    pushfills () {
      this.fillstitle += '___'
      const fillsdata = /[^_]/
      this.underline = this.fillstitle.split(fillsdata)
      console.log(this.fillstitle)
      console.log(this.underline)
    },
    // 数据提交
    handleSubmit (e) {
      e.preventDefault()
      const self = this
      this.form.validateFields((err, values) => {
        const submitData = {
          list: []
        }
        for (const i in this.formdata) {
          submitData[i] = this.formdata[i]
        }
        submitData.list = this.optionsListshow.list
        for (const i in values) {
          submitData[i] = values[i]
        }
        console.log(submitData.questionsType)
        if (submitData.questionType === '填空题') {
          submitData['title'] = this.fillstitle
        }
        console.log(submitData)
        if (submitData.mustselect === true) {
          submitData.mustselect = 1
        } else {
          submitData.mustselect = 0
        }
        if (submitData.stars === true) {
          submitData.stars = 1
        } else {
          submitData.stars = 0
        }
        if (submitData.other === true) {
          submitData.other = 1
        } else {
          submitData.other = 0
        }
        if (!err) {
          if (this.actions === 'edit') {
            self.axios({
              url: '/visit/questionbank/edit',
              data: { data: submitData }
            }).then(res => {
              this.submitStatus = 2
              console.log(res)
              this.$emit('on-show', this.submitStatus)
            })
            console.log('Received values of form: ', values)
          } else if (this.actions === 'testsadd') {
            self.axios({
              url: '/visit/questionnaire/testsadd',
              data: { data: submitData }
            }).then(res => {
              this.submitStatus = 1
              console.log(res)
              this.$emit('on-show', this.submitStatus)
            })
            console.log('Received values of form: ', values)
          } else {
            self.axios({
              url: '/visit/questionbank/add',
              data: { data: submitData }
            }).then(res => {
              this.submitStatus = 1
              console.log(res)
              this.$emit('on-show', this.submitStatus)
            })
            console.log('Received values of form: ', values)
          }
        }
      })
    },
    // 关闭或重置
    cancel_off () {
      if (this.config.action === 'edit') {
        this.visiblebulk = false
        this.optionsListshow = this.optionsList2
        this.submitStatus = 3
        this.$emit('on-show', this.submitStatus)
      }
      if (this.config.action === 'add' || this.actions === 'testsadd') {
        this.visiblebulk = false
        this.submitStatus = 0
        this.$emit('on-show', this.submitStatus)
      }
    },
    // 修改时页面加载对应题目组件
    allState () {
      if (this.actions === 'add' || this.actions === 'testsadd') {
        this.optionsListshow = this.optionsList2
      }
      if (this.questionstype === '单选题') {
        this.showform = true
        this.batch = true
        if (this.config.action === 'testsadd') {
          this.radioJump = true
          this.jumpTo = true
        }
      }
      if (this.questionstype === '多选题') {
        this.batch = true
      }
      if (this.questionstype === '填空题') {
        this.fillstitle = this.formdata.title
        this.fill = true
        this.allshow = false
      }
      if (this.questionstype === '简答题') {
        this.shortAnswer = true
      }
      if (this.questionstype === '评分题') {
        this.stars = true
      }
      if (this.questionstype === '文字描述') {
        this.must = false
      }
    },
    // 题目类型变化加载不同组件
    handleChange (e) {
      console.log(`${e.target.value}`)
      if (`${e.target.value}` === '单选题') {
        this.showform = true
        this.batch = true
        this.shortAnswer = false
        this.stars = false
        this.must = true
        this.allshow = true
        this.fill = false
        if (this.config.action === 'testsadd') {
          this.radioJump = true
          this.jumpTo = true
        }
      }
      if (`${e.target.value}` === '多选题') {
        this.showform = false
        this.batch = true
        this.shortAnswer = false
        this.stars = false
        this.must = true
        this.fill = false
        this.allshow = true
        this.radioJump = false
        this.jumpTo = false
      }
      if (`${e.target.value}` === '简答题') {
        this.showform = false
        this.batch = false
        this.shortAnswer = true
        this.stars = false
        this.must = true
        this.fill = false
        this.allshow = true
        this.radioJump = false
        this.jumpTo = false
      }
      if (`${e.target.value}` === '填空题') {
        this.showform = false
        this.batch = false
        this.allshow = false
        this.shortAnswer = false
        this.stars = false
        this.must = true
        this.fill = true
        this.radioJump = false
      }
      if (`${e.target.value}` === '评分题') {
        this.showform = false
        this.batch = false
        this.shortAnswer = false
        this.stars = true
        this.must = true
        this.allshow = true
        this.fill = false
        this.radioJump = false
      }
      if (`${e.target.value}` === '文字描述') {
        this.showform = false
        this.batch = false
        this.shortAnswer = false
        this.stars = false
        this.must = false
        this.allshow = true
        this.fill = false
        this.radioJump = false
      }
    }
  }
}
</script>
<style scoped>
.margin{
  margin-left: 15px;
}
</style>
