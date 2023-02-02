
<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1000"
    :visible="visible"
    :maskClosable="config.user === 'personTest' ? false : true"
    :closable="config.user === 'personTest' ? false : true"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <div>
        <div v-if="config.user === 'personTest' && formdata.time !== '0'" style="z-index: 1; position: absolute; background-color: #FFFFFF; right: 50px">
          <a-statistic-countdown
            title="考试剩余时间"
            :value="Date.now() + formdata.time * 60 * 1000"
            format="HH:mm:ss"
            @finish="finish"
          />
        </div>
        <div style="text-align: center">
          <div><h1><b>{{ formdata.title }}</b></h1></div>
          <div v-if="config.title !=='试卷预览'">
            <div v-if="formdata.time === '0'">本次考试不限时， 共 {{ questionTotal }} 道题，满分 {{ scoreTotal }} 分</div>
            <div v-else>本次考试限时 {{ formdata.time }} 分钟， 共 {{ questionTotal }} 道题，满分 {{ scoreTotal }} 分</div>
          </div>
          <div v-if="config.title ==='试卷预览'">共 {{ questionTotal }} 道题，满分 {{ scoreTotal }} 分</div>
        </div>
        <div v-if="config.action ==='check'" >
          <span style="margin-left: 200px; padding-right: 10px">考生姓名:<span style="padding-left: 10px; color:#4DAAFF">{{ formdata.username }}</span></span>
          <span style="margin-left: 80px">得分:<span style="padding-left: 10px; color:#4DAAFF">{{ formdata.grade }}</span></span>
          <span style="margin-left: 80px">得分记录:
            <a-select style="width: 200px; margin-left: 10px" :dropdownMatchSelectWidth="false">
              <a-select-option v-for="(item, index) in formdata.reviewlog" :key="index" :value="index" >
                {{ item.date }} 批改分数 {{ item.grade }} 分
              </a-select-option>
            </a-select>
          </span>
        </div>
        <br>
        <a-alert
          :message="formdata.remarks"
          type="warning"
          v-if="formdata.remarks"
        />
        <a-form :form="form" @submit="handleSubmit" style="margin-bottom: 80px">
          <div v-for="(value, option) in titleData" :key="option">
            <a-divider v-if="option != 0"/>
            <div v-if="value === '单选题' && formdata.single.length > 0">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}( {{ formdata.single.length ? formdata.single.length : '' }} 题，共 {{ singleScore }} 分 )</b></h2></a-col>
              <div v-for="(item, key) in formdata.single" :key="key">
                <a-form-item>
                  <a-col :span="24">
                    <span>{{ key + 1 }}. {{ item.title }} ( {{ item.score }} 分 )</span>
                  </a-col>
                  <a-col :span="24">
                    <a-radio-group
                      v-decorator="['info[single][' + item.id + ']',{ initialValue: item.answer }]"
                      :disabled="true"
                      v-if="config.action === 'check'"
                    >
                      <a-col :span="24">
                        <a-radio
                          :style="radioStyle"
                          v-for="(items, keys) in item.list"
                          :key="keys"
                          :value="String.fromCharCode(65 + keys)"
                        >
                          {{ String.fromCharCode(65 + keys) }}. {{ items }}
                        </a-radio>
                      </a-col>
                    </a-radio-group>
                    <a-radio-group v-else v-decorator="['info[single][' + item.id + ']']">
                      <a-col :span="24">
                        <a-radio
                          :style="radioStyle"
                          v-for="(items, keys) in item.list"
                          :key="keys"
                          :value="String.fromCharCode(65 + keys)"
                        >
                          {{ String.fromCharCode(65 + keys) }}. {{ items }}
                        </a-radio>
                      </a-col>
                    </a-radio-group>
                  </a-col>
                </a-form-item>
                <div v-if="config.action === 'check'">
                  <div style="margin-bottom: 10px">
                    <span class="stuanswer">{{ config.user === 'person' ? '你的答案' : '考生答案' }}</span><span style="margin-right: 10px">{{ item.answer ? item.answer : '未填' }}</span>
                    <span v-if="item.correct === 1 && showcorrect" ><a-icon style="color:#52c41a" type="check" /></span>
                    <span v-if="item.correct === 0 && showcorrect"><a-icon class="color" type="close" /></span>
                  </div>
                  <div style="margin-bottom: 10px" v-if="showanswer">
                    <span class="rightanswer" >正确答案</span><span>{{ item.setting.answer }}</span>
                  </div>
                  <div v-if="item.setting.analysis && showanswer">
                    <span class="analysis">答案解析</span><span>{{ item.setting.analysis }}</span>
                  </div>
                </div>
              </div>
              <br>
            </div>
            <div v-if="value === '多选题' && formdata.multiple.length > 0">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}( {{ formdata.multiple.length }} 题，共 {{ multipleScore }} 分 )</b></h2></a-col>
              <div v-for="(item, key) in formdata.multiple" :key="key">
                <a-form-item>
                  <a-col :span="24">
                    <span>{{ formdata.single.length + key + 1 }}. {{ item.title }} ( {{ item.score }} 分 )</span>
                  </a-col>
                  <a-col :span="24">
                    <a-checkbox-group
                      v-decorator="['info[multiple][' + item.id + ']',{ initialValue: item.answer || [] }]"
                      :disabled="true"
                      v-if="config.action === 'check'"
                    >
                      <a-col :span="24">
                        <a-checkbox
                          :style="radioStyle"
                          :value="String.fromCharCode(65 + keys)"
                          v-for="(items, keys) in item.list"
                          :key="keys"
                        >
                          {{ String.fromCharCode(65 + keys) }}. {{ items }}
                        </a-checkbox>
                      </a-col>
                    </a-checkbox-group>
                    <a-checkbox-group v-else v-decorator="['info[multiple][' + item.id + ']']">
                      <a-col :span="24">
                        <a-checkbox
                          :style="radioStyle"
                          :value="String.fromCharCode(65 + keys)"
                          v-for="(items, keys) in item.list"
                          :key="keys"
                        >
                          {{ String.fromCharCode(65 + keys) }}. {{ items }}
                        </a-checkbox>
                      </a-col>
                    </a-checkbox-group>
                  </a-col>
                </a-form-item>
                <div v-if="config.action === 'check'">
                  <div style="margin-bottom: 10px">
                    <span class="stuanswer">{{ config.user === 'person' ? '你的答案' : '考生答案' }}</span><span style="margin-right: 10px">{{ item.answer && item.answer[0] ? item.answer.toString() : '未填' }}</span>
                    <span v-if="item.correct === 1 && showcorrect" ><a-icon style="color:#52c41a" type="check" /></span>
                    <span v-if="item.correct === 0 && showcorrect"><a-icon class="color" type="close" /></span>
                  </div>
                  <div style="margin-bottom: 10px" v-if="showanswer">
                    <span class="rightanswer">正确答案</span><span>{{ item.setting.answer.toString() }}</span>
                  </div>
                  <div v-if="item.setting.analysis && showanswer">
                    <span class="analysis">答案解析</span><span>{{ item.setting.analysis }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="value === '判断题' && formdata.judge.length > 0">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}( {{ formdata.judge.length }} 题，共 {{ judgeScore }} 分 )</b></h2></a-col>
              <div v-for="(item, key) in formdata.judge" :key="key">
                <a-form-item>
                  <a-col :span="24">
                    <span>{{ formdata.single.length + formdata.multiple.length + key + 1 }}. {{ item.title }} ( {{ item.score }} 分 )</span>
                  </a-col>
                  <a-col :span="24">
                    <a-radio-group
                      v-decorator="['info[judge][' + item.id + ']',{ initialValue: item.answer }]"
                      :disabled="true"
                      v-if="config.action === 'check'"
                    >
                      <a-col :span="24">
                        <a-radio :style="radioStyle" value="1">对</a-radio>
                        <a-radio :style="radioStyle" value="0">错</a-radio>
                      </a-col>
                    </a-radio-group>
                    <a-radio-group v-else v-decorator="['info[judge][' + item.id + ']']">
                      <a-col :span="24">
                        <a-radio :style="radioStyle" value="1">对</a-radio>
                        <a-radio :style="radioStyle" value="0">错</a-radio>
                      </a-col>
                    </a-radio-group>
                  </a-col>
                </a-form-item>
                <div v-if="config.action === 'check'">
                  <div style="margin-bottom: 10px">
                    <span class="stuanswer">{{ config.user ==='person' ? '你的答案' : '考生答案' }}</span>
                    <span v-if="item.answer" style="margin-right: 10px">{{ item.answer === '1' ? '对' : '错' }}</span>
                    <span v-else style="margin-right: 10px">未填</span>
                    <span v-if="item.correct === 1 && showcorrect" ><a-icon style="color: #52c41a" type="check" /></span>
                    <span v-if="item.correct === 0 && showcorrect"><a-icon class="color" type="close" /></span>
                  </div>
                  <div style="margin-bottom: 10px" v-if="showanswer">
                    <span class="rightanswer" >正确答案</span><span>{{ item.setting.answer === '1' ? '对' : '错' }}</span>
                  </div>
                  <div v-if="item.setting.analysis && showanswer">
                    <span class="analysis">答案解析</span><span>{{ item.setting.analysis }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="value === '填空题' && formdata.fills.length > 0">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}( {{ formdata.fills.length }} 题，共 {{ fillsScore }} 分 )</b></h2></a-col>
              <div v-for="(item, key) in formdata.fills" :key="key">
                <a-form-item>
                  <a-col :span="24">
                    <span>{{ formdata.single.length + formdata.multiple.length + formdata.judge.length + key + 1 }}. {{ item.title }} ( {{ item.score }} 分 )</span>
                  </a-col>
                  <a-col :span="24">
                    <a-col :span="12" v-if="config.action === 'check' ">
                      <div v-for="(items, keys) in item.answer" :key="keys">
                        <div style="margin-bottom: 10px">
                          <span class="stuanswer">{{ config.user ==='person' ? '你的答案' : '考生答案' }}</span><span style="margin-right: 10px">{{ items || '未填' }}</span>
                          <span v-if="item.setting.answer[keys] === items && item.setting.allow === '0' && showcorrect" ><a-icon style="color: #52c41a" type="check" /></span>
                          <span v-if="item.setting.answer[keys] !== items && item.setting.allow === '0' && showcorrect"><a-icon class="color" type="close" /></span>
                          <span v-if="item.setting.answer.includes(items) && item.setting.allow === '1' && showcorrect" ><a-icon style="color: #52c41a" type="check" /></span>
                          <span v-if="!item.setting.answer.includes(items) && item.setting.allow === '1' && showcorrect"><a-icon class="color" type="close" /></span>
                        </div>
                        <a-form-item :label="'填空项' + ( keys + 1 )" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" :colon="false">
                          <a-input
                            :read-only="true"
                            :placeholder="'填空项' + (keys + 1) "
                            class="input"
                            v-decorator="['info[fills][' + item.id + '][' + keys + ']',{ initialValue: items }]" />
                        </a-form-item>
                        <div style="margin-bottom: 10px" v-if="showanswer">
                          <span class="rightanswer">正确答案</span><span>{{ item.setting.answer[keys] }}</span>
                        </div>
                      </div>
                      <div v-if="item.setting.analysis && showanswer">
                        <span class="analysis">答案解析</span><span>{{ item.setting.analysis }}</span>
                      </div>
                      <div style="margin-top: 10px" v-if="config.user !== 'person'">
                        <a-form-item>
                          <span style="margin-right: 10px">打分</span><a-input-number :min="0" :max="Number(item.score)" v-decorator="['info[scoring][' + item.id + ']']" />
                        </a-form-item>
                      </div>
                    </a-col>
                    <a-col :span="12" v-else>
                      <div v-for="(items, keys) in item.setting.answer" :key="keys">
                        <a-form-item :label="'填空项' + ( keys + 1 )" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" :colon="false">
                          <a-input
                            :placeholder="'填空项' + (keys + 1) "
                            v-decorator="['info[fills][' + item.id + '][' + keys + ']']"
                          />
                        </a-form-item>
                      </div>
                    </a-col>
                  </a-col>
                </a-form-item>
              </div>
            </div>
            <div v-if="value === '简答题' && formdata.answer.length > 0">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}( {{ formdata.answer.length }} 题，共 {{ answerScore }} 分 )</b></h2></a-col>
              <div v-for="(item, key) in formdata.answer" :key="key">
                <a-form-item>
                  <a-col :span="24">
                    <span>{{ formdata.single.length + formdata.multiple.length + formdata.judge.length + formdata.fills.length + key + 1 }}. {{ item.title }} ( {{ item.score }} 分 )</span>
                  </a-col>
                  <a-col :span="24" v-if="config.action === 'check'">
                    <div style="margin-bottom: 10px">
                      <span class="stuanswer">{{ config.user ==='person'?'你的答案':'考生答案' }}</span><span style="margin-right: 10px">{{ item.answer || '未填' }}</span>
                    </div>
                    <a-textarea
                      :auto-size="{ minRows: 3, maxRows: 5 }"
                      v-decorator="['info[answer][' + item.id + ']',{ initialValue: item.answer }]"
                      :read-only="true"
                      class="input"
                    />
                    <div style="margin-bottom: 10px" v-if="showanswer">
                      <span class="rightanswer" >得分关键词</span><span>{{ item.setting.answer }}</span>
                    </div>
                    <div v-if="item.setting.analysis && showanswer">
                      <span class="analysis" >答案解析</span><span>{{ item.setting.analysis }}</span>
                    </div>
                    <div style="margin-top: 10px" v-if="config.user !== 'person'">
                      <a-form-item>
                        <span style="margin-right: 10px">打分</span><a-input-number :min="0" :max="Number(item.score)" v-decorator="['info[scoring][' + item.id + ']']" />
                      </a-form-item>
                    </div>
                  </a-col>
                  <a-col :span="24" v-else>
                    <a-textarea
                      :auto-size="{ minRows: 3, maxRows: 5 }"
                      v-decorator="['info[answer][' + item.id + ']']"
                    />
                  </a-col>
                </a-form-item>
              </div>
            </div>
          </div>
        </a-form>
      </div>
      <div class="bbar" v-if="config.user ==='personTest' || config.title === '审阅试卷'">
        <a-button type="primary" html-type="submit" @click="handleSubmit">{{ config.user !== 'personTest'?'保存':'交卷' }}</a-button>
        <a-button v-if="config.user !== 'personTest'" @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      advanced: false,
      loading: false,
      visible: false,
      readonly: false,
      config: {},
      formdata: {},
      answer: {},
      single: [],
      showanswer: false,
      showcorrect: false,
      singleScore: 0,
      multiple: [],
      multipleScore: 0,
      judge: [],
      judgeScore: 0,
      fills: [],
      fillsScore: 0,
      briefAnswer: [],
      answerScore: 0,
      questionTotal: 0,
      scoreTotal: 0,
      titleData: [],
      allScore: [],
      timeout: false,
      time: '',
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      mymultiple: {},
      chinese: ['一', '二', '三', '四', '五'],
      form: this.$form.createForm(this),
      timer: ''
    }
  },
  methods: {
    // 传参接收
    show (config) {
      this.formdata = {}
      this.titleData = []
      this.singleScore = 0
      this.multipleScore = 0
      this.judgeScore = 0
      this.fillsScore = 0
      this.answerScore = 0
      this.visible = true
      this.loading = true
      this.timeout = false
      this.config = config
      if (this.config.action === 'check') {
        this.readonly = true
      }
      this.formdata = config.data
      this.questionTotal = config.data.total
      this.scoreTotal = config.data.score
      this.formdata.single = []
      this.formdata.multiple = []
      this.formdata.judge = []
      this.formdata.fills = []
      this.formdata.answer = []
      const data = JSON.parse(this.formdata.setting).data
      this.axios({
        url: '/exam/Examination/view',
        params: { id: config.title === '考试预览' ? config.data.examid : config.data.id }
      }).then(res => {
        if (this.config.type === 'fixed') {
          const details = res.result.question.filter(item => data.some(x => x.question === item.id))
          data.forEach(item => {
            details.forEach(it => {
              if (it.id === item.question) {
                it.score = item.score
                for (const i in it) {
                  item[i] = it[i]
                }
              }
            })
          })
          data.forEach(item => {
            if (item.type === 'single') {
              const data = []
              for (const i in item.setting.list) {
                data.push(item.setting.list[i])
              }
              item.list = data
              this.singleScore = this.singleScore + Number(item.score)
              this.formdata.single.push(item)
            } else if (item.type === 'multiple') {
              const data = []
              for (const i in item.setting.list) {
                data.push(item.setting.list[i])
              }
              item.list = data
              this.multipleScore = this.multipleScore + Number(item.score)
              this.formdata.multiple.push(item)
            } else if (item.type === 'judge') {
              this.judgeScore = this.judgeScore + Number(item.score)
              this.formdata.judge.push(item)
            } else if (item.type === 'fills') {
              const data = []
              for (const i in item.setting.answer) {
                data.push(item.setting.answer[i])
              }
              item.fills = data
              this.fillsScore = this.fillsScore + Number(item.score)
              this.formdata.fills.push(item)
            } else if (item.type === 'answer') {
              this.answerScore = this.answerScore + Number(item.score)
              this.formdata.answer.push(item)
            }
          })
          if (this.formdata.single.length !== 0) {
            this.titleData.unshift('单选题')
          }
          if (this.formdata.multiple.length !== 0) {
            this.titleData.push('多选题')
          }
          if (this.formdata.judge.length !== 0) {
            this.titleData.push('判断题')
          }
          if (this.formdata.fills.length !== 0) {
            this.titleData.push('填空题')
          }
          if (this.formdata.answer.length !== 0) {
            this.titleData.push('简答题')
          }
        } else {
          res.result.question.forEach(item => {
            if (item.type === 'single') {
              const data = []
              for (const i in item.setting.list) {
                data.push(item.setting.list[i])
              }
              item.list = data
              this.singleScore = this.singleScore + Number(item.score)
              this.formdata.single.push(item)
            } else if (item.type === 'multiple') {
              const data = []
              for (const i in item.setting.list) {
                data.push(item.setting.list[i])
              }
              item.list = data
              this.multipleScore = this.multipleScore + Number(item.score)
              this.formdata.multiple.push(item)
            } else if (item.type === 'judge') {
              this.judgeScore = this.judgeScore + Number(item.score)
              this.formdata.judge.push(item)
            } else if (item.type === 'fills') {
              const data = []
              for (const i in item.setting.answer) {
                data.push(item.setting.answer[i])
              }
              item.fills = data
              this.fillsScore = this.fillsScore + Number(item.score)
              this.formdata.fills.push(item)
            } else if (item.type === 'answer') {
              this.answerScore = this.answerScore + Number(item.score)
              this.formdata.answer.push(item)
            }
          })
          if (this.formdata.single.length !== 0) {
            this.titleData.unshift('单选题')
          }
          if (this.formdata.multiple.length !== 0) {
            this.titleData.push('多选题')
          }
          if (this.formdata.judge.length !== 0) {
            this.titleData.push('判断题')
          }
          if (this.formdata.fills.length !== 0) {
            this.titleData.push('填空题')
          }
          if (this.formdata.answer.length !== 0) {
            this.titleData.push('简答题')
          }
        }
        this.questionTotal = this.formdata.single.length + this.formdata.multiple.length + this.formdata.judge.length + this.formdata.fills.length + this.formdata.answer.length
        this.scoreTotal = this.singleScore + this.multipleScore + this.judgeScore + this.fillsScore + this.answerScore
        this.loading = false
      })
    },
    checktime () {
      const time = new Date()
      if (Date.parse(time) === Date.parse(this.formdata.endtime)) {
        this.timeout = true
        this.finish()
      }
    },
    finish () {
      this.timeout = true
      this.$message.info('考试时间到, 试卷已提交')
      this.handleSubmit()
    },
    personShow (config) {
      this.formdata = {}
      this.titleData = []
      this.formdata = config.data
      this.config = config
      this.questionTotal = 0
      this.scoreTotal = 0
      this.singleScore = 0
      this.multipleScore = 0
      this.judgeScore = 0
      this.fillsScore = 0
      this.answerScore = 0
      if (config.user === 'personTest') {
        this.timer = setInterval(this.checktime, 1000)
      }
      this.visible = true
      this.loading = true
      this.axios({
        url: 'exam/Achievement/exam',
        data: { action: 'start', paperid: config.data.id, examid: config.data.examid }
      }).then(res => {
        this.formdata.gradeid	 = res.result.gradeid
        this.formdata.single = []
        this.formdata.multiple = []
        this.formdata.judge = []
        this.formdata.fills = []
        this.formdata.answer = []
        res.result.question.forEach((item, index) => {
          item.sort = index + 1
          item.scoring = ''
          if (item.type === 'single') {
            const data = []
            for (const i in item.setting.list) {
              data.push(item.setting.list[i])
            }
            item.list = data
            this.singleScore = this.singleScore + Number(item.score)
            this.formdata.single.push(item)
          } else if (item.type === 'multiple') {
            const data = []
            for (const i in item.setting.list) {
              data.push(item.setting.list[i])
            }
            item.list = data
            this.multipleScore = this.multipleScore + Number(item.score)
            this.formdata.multiple.push(item)
          } else if (item.type === 'judge') {
            this.judgeScore = this.judgeScore + Number(item.score)
            this.formdata.judge.push(item)
          } else if (item.type === 'fills') {
            const data = []
            for (const i in item.setting.answer) {
              data.push(item.setting.answer[i])
            }
            item.fills = data
            this.fillsScore = this.fillsScore + Number(item.score)
            this.formdata.fills.push(item)
          } else if (item.type === 'answer') {
            this.answerScore = this.answerScore + Number(item.score)
            this.formdata.answer.push(item)
          }
        })
        if (this.formdata.single.length !== 0) {
          this.titleData.unshift('单选题')
        }
        if (this.formdata.multiple.length !== 0) {
          this.titleData.push('多选题')
        }
        if (this.formdata.judge.length !== 0) {
          this.titleData.push('判断题')
        }
        if (this.formdata.fills.length !== 0) {
          this.titleData.push('填空题')
        }
        if (this.formdata.answer.length !== 0) {
          this.titleData.push('简答题')
        }
        this.questionTotal = this.formdata.single.length + this.formdata.multiple.length + this.formdata.judge.length + this.formdata.fills.length + this.formdata.answer.length
        this.scoreTotal = this.singleScore + this.multipleScore + this.judgeScore + this.fillsScore + this.answerScore
        this.loading = false
      })
    },
    detailshow (config) {
      this.formdata = {}
      this.titleData = []
      this.config = config
      this.questionTotal = 0
      this.singleScore = 0
      this.multipleScore = 0
      this.judgeScore = 0
      this.fillsScore = 0
      this.answerScore = 0
      this.scoreTotal = 0
      this.visible = true
      this.loading = true
      if (config.user !== 'person') {
        this.showanswer = true
        this.showcorrect = true
      }
      this.axios({
        url: '/exam/Achievement/checkGrade',
        data: { gradeid: config.data.id }
      }).then(res => {
        this.formdata = res.result.data
        this.formdata.reviewlog = res.result.reviewlog || []
        this.formdata.paper_setting = res.result.paper_setting
        const time = new Date()
        if (res.result.paper_setting.paper_after === '1' && Date.parse(res.result.paper_setting.endtime) > Date.parse(time)) {
          this.showcorrect = true
        }
        if (res.result.paper_setting.paper_after === '2' && Date.parse(res.result.paper_setting.endtime) > Date.parse(time)) {
          this.showcorrect = true
          this.showanswer = true
        }
        if (res.result.paper_setting.exam_after === '1' && Date.parse(res.result.paper_setting.endtime) < Date.parse(time)) {
          this.showcorrect = true
        }
        if (res.result.paper_setting.exam_after	=== '2' && Date.parse(res.result.paper_setting.endtime) < Date.parse(time)) {
          this.showcorrect = true
          this.showanswer = true
        }
        this.formdata.single = []
        this.formdata.multiple = []
        this.formdata.judge = []
        this.formdata.fills = []
        this.formdata.answer = []
        res.result.question.forEach(item => {
          if (item.type === 'single') {
            const data = []
            for (const i in item.setting.list) {
              data.push(item.setting.list[i])
            }
            item.list = data
            this.singleScore = this.singleScore + Number(item.score)
            this.formdata.single.push(item)
          } else if (item.type === 'multiple') {
            const data = []
            for (const i in item.setting.list) {
              data.push(item.setting.list[i])
            }
            item.list = data
            this.multipleScore = this.multipleScore + Number(item.score)
            this.formdata.multiple.push(item)
          } else if (item.type === 'judge') {
            this.judgeScore = this.judgeScore + Number(item.score)
            this.formdata.judge.push(item)
          } else if (item.type === 'fills') {
            const data = []
            for (const i in item.setting.answer) {
              data.push(item.setting.answer[i])
            }
            item.fills = data
            this.fillsScore = this.fillsScore + Number(item.score)
            this.formdata.fills.push(item)
          } else if (item.type === 'answer') {
            this.answerScore = this.answerScore + Number(item.score)
            this.formdata.answer.push(item)
          }
        })
        if (this.formdata.single.length !== 0) {
          this.titleData.unshift('单选题')
        }
        if (this.formdata.multiple.length !== 0) {
          this.titleData.push('多选题')
        }
        if (this.formdata.judge.length !== 0) {
          this.titleData.push('判断题')
        }
        if (this.formdata.fills.length !== 0) {
          this.titleData.push('填空题')
        }
        if (this.formdata.answer.length !== 0) {
          this.titleData.push('简答题')
        }
        this.questionTotal = this.formdata.single.length + this.formdata.multiple.length + this.formdata.judge.length + this.formdata.fills.length + this.formdata.answer.length
        this.scoreTotal = this.singleScore + this.multipleScore + this.judgeScore + this.fillsScore + this.answerScore
        this.loading = false
      })
    },
    // 考试数据提交
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          let title = '题目'
          const setting = []
          const number = []
          for (const i in values.info.single) {
            this.formdata.single.forEach((item, index) => {
              if (item.id === i && !values.info.single[i]) {
                number.push(item.sort)
              }
            })
            const data = {}
            data.question = i
            data.answer = values.info.single[i] ? values.info.single[i] : ''
            setting.push(data)
          }
          for (const i in values.info.multiple) {
            this.formdata.multiple.forEach((item, index) => {
              if (item.id === i && !values.info.multiple[i]) {
                number.push(item.sort)
              }
            })
            const data = {}
            data.question = i
            data.answer = values.info.multiple[i] ? values.info.multiple[i] : []
            setting.push(data)
          }
          for (const i in values.info.judge) {
            this.formdata.judge.forEach((item, index) => {
              if (item.id === i && !values.info.judge[i]) {
                number.push(item.sort)
              }
            })
            const data = {}
            data.question = i
            data.answer = values.info.judge[i] ? values.info.judge[i] : ''
            setting.push(data)
          }
          for (const i in values.info.fills) {
            this.formdata.fills.forEach((item, index) => {
              if (item.id === i && !values.info.fills[i][0]) {
                number.push(item.sort)
              }
            })
            const data = {}
            data.question = i
            data.answer = values.info.fills[i] ? values.info.fills[i] : []
            setting.push(data)
          }
          for (const i in values.info.answer) {
            this.formdata.answer.forEach((item, index) => {
              if (item.id === i && !values.info.answer[i]) {
                number.push(item.sort)
              }
            })
            const data = {}
            data.question = i
            data.answer = values.info.answer[i] ? values.info.answer[i] : ''
            setting.push(data)
          }
          number.sort(function (a, b) { return a - b })
          title += number.toString()
          if (this.config.title !== '审阅试卷') {
            if (this.timeout) {
              this.axios({
                url: 'exam/Achievement/exam',
                data: { action: 'submit', gradeid: this.formdata.gradeid, setting: setting }
              }).then(res => {
                this.$emit('ok', '')
                clearInterval(this.timer)
                this.$message.success('交卷成功')
                this.visible = false
              })
            } else {
              const self = this
              this.$confirm({
                title: number.length > 0 ? title + '尚未填写，您确定要提交试卷吗？' : '您确定要提交试卷吗？',
                onOk () {
                  self.axios({
                    url: 'exam/Achievement/exam',
                    data: { action: 'submit', gradeid: self.formdata.gradeid, setting: setting }
                  }).then(res => {
                    self.$emit('ok', '')
                    clearInterval(self.timer)
                    self.$message.success('交卷成功')
                    self.visible = false
                  })
                }
              })
            }
          } else {
            const set = []
            const info = {}
            info.grade = 0
            this.formdata.single.forEach(item => {
              if (item.correct === 1) {
                item.grade = item.score
                info.grade = info.grade + Number(item.score)
              }
            })
            this.formdata.multiple.forEach(item => {
              if (item.correct === 1) {
                item.grade = item.score
                info.grade = info.grade + Number(item.score)
              }
            })
            this.formdata.judge.forEach(item => {
              if (item.correct === 1) {
                item.grade = item.score
                info.grade = info.grade + Number(item.score)
              }
            })
            for (const i in values.info.fills) {
              const data = {}
              data.question = i
              data.answer = values.info.fills[i]
              set.push(data)
            }
            for (const i in values.info.answer) {
              const data = {}
              data.question = i
              data.answer = values.info.answer[i]
              set.push(data)
            }
            set.forEach(item => {
              delete item.answer
              for (const i in values.info.scoring) {
                if (item.question === i) {
                  item.grade = values.info.scoring[i] || 0
                  info.grade = info.grade + item.grade
                }
              }
            })
            this.axios({
              url: 'exam/Achievement/review',
              data: { action: 'submit', gradeid: this.config.data.id, info: info, setting: set }
            }).then(res => {
              this.$emit('ok', '')
              this.$message.success('操作成功')
              this.visible = false
            })
          }
        }
      })
    }
  }
}
</script>
<style scoped>
.input{
  background-color: #F5F5F5
}
.stuanswer{
  border-radius: 5px;
  background-color: #1890FF;
  color:white;
  padding: 2px;
  margin-right: 15px;
}
.rightanswer{
  border-radius: 5px;
  background-color: #73D13D;
  color:white;
  padding: 2px;
  margin-right: 15px;
}
.analysis{
  border-radius: 5px;
  background-color: #FADB14;
  color:white;
  padding: 2px;
  margin-right: 15px;
}
.color{
  color:#ff4d4f
}
</style>
