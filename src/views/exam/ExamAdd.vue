<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="800"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <div>
        <a-form :form="form" :label-col="{ span: 4 }" @submit="handleSubmit">
          <a-divider orientation="left">
            基本信息
          </a-divider>
          <a-form-item :wrapper-col="{ span: 20 }">
            <span slot="label">选择试卷
              <a-tooltip placement="top">
                <template slot="title">
                  <span>一经保存则无法修改</span>
                </template>
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-input v-model="formdata.papername" :read-only="true" class="input" v-if="config.action === 'edit'"/>
            <a-select v-else :allowClear="true" option-filter-prop="children" show-search v-decorator="['info[examid]', { rules: [{ required: true, message: '请选择试卷' }] }]">
              <a-select-option v-for="(item, key) in testpaper" :key="key" :value="item.id" @click="maxPass = Number(item.score)">{{ item.title }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="考试名称" :wrapper-col="{ span: 20 }">
            <a-input v-decorator="['info[title]', { initialValue: formdata.title, rules: [{ required: true, message: '请输入考试名称' },{ max: 20, message: '考试名称不得大于20个字符' }] }]"/>
          </a-form-item>
          <a-form-item label="考试说明" :wrapper-col="{ span: 20 }">
            <a-textarea
              v-decorator="['info[remarks]', { initialValue: formdata.remarks }]"
              :auto-size="{ minRows: 5, maxRows: 8 }"
            />
          </a-form-item>
          <a-divider orientation="left">
            考试基础设置
          </a-divider>
          <a-form-item label="考试时间" :wrapper-col="{ span: 20 }">
            <a-range-picker
              v-decorator="['info[testtime]', {initialValue: examtime, rules: [{ required: true, message: '请选择考试时间' }] }]"
              @change="getExamTime"
              :disabled-date="disabledDate"
              :show-time="{ format: 'HH:mm:ss' }"
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 20 }">
            <span slot="label">允许考试次数
              <a-tooltip placement="top">
                <template slot="title">
                  <span>最多可设10次，取最高成绩为最终成绩</span>
                </template>
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-input-number :min="1" :max="10" v-decorator="['setting[exam_num]', { initialValue: config.action === 'edit' && formdata.setting ? formdata.setting.exam_num : '', rules: [{ required: true, message: '请输入允许考试次数' }] }]"/>
          </a-form-item>
          <a-form-item label="考试限时" :wrapper-col="{ span: 20 }">
            <a-input-number :min="0" v-decorator="['info[time]', { initialValue: formdata.time }]" style="margin-right: 10px"/>分钟
          </a-form-item>
          <a-form-item label="合格分数" :wrapper-col="{ span: 20 }">
            <a-input-number :min="0" :max="maxPass" v-decorator="['setting[qualified]', { initialValue: config.action === 'edit' && formdata.setting ? formdata.setting.qualified : '' }]" style="margin-right: 10px"/>分
          </a-form-item>
          <a-form-item label="考生范围" :wrapper-col="{ span: 20 }" :required="true">
            <a-button @click="handleSelect">选择部门或成员</a-button>
            <a-input v-decorator="['username', { initialValue: username , rules: [{ required: true, message: '请选择考生范围' }] }]" :read-only="true" v-show="false"/>
          </a-form-item>
          <a-form-item label="考试管理员" :wrapper-col="{ span: 20 }">
            <a-button @click="handleSelectReview">选择部门或成员</a-button>
          </a-form-item>
          <a-divider orientation="left">
            考试基础设置
          </a-divider>
          <a-form-item label="防作弊设置" :wrapper-col="{ span: 20 }">
            <a-col :span="11">
              <a-checkbox-group v-decorator="['setting[prevent_cheat]', { initialValue: config.action === 'edit' && formdata.setting ? formdata.setting.prevent_cheat : [] }]">
                <a-checkbox value="option_random">
                  选项乱序
                </a-checkbox>
                <a-checkbox @click="cutting" value="restrict_screen">
                  限制切屏次数
                </a-checkbox>
              </a-checkbox-group>
            </a-col>
            <a-col :span="10" v-if="cutstatus">
              <a-input-number :min="0" style="margin-right: 10px" v-model="restrict_screen"/>次切屏后强制交卷
            </a-col>
          </a-form-item>
          <a-form-item label="考生交卷后" :wrapper-col="{ span: 20 }">
            <a-select :allowClear="true" v-decorator="['setting[paper_after]', { initialValue: config.action === 'edit' && formdata.setting ? formdata.setting.paper_after : '' }]">
              <a-select-option v-for="item in afterHanded " :key="item.value" :value="item.value">{{ item.type }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="考试结束后" :wrapper-col="{ span: 20 }">
            <a-select :allowClear="true" v-decorator="['setting[exam_after]', { initialValue: config.action === 'edit' && formdata.setting ? formdata.setting.exam_after : '' }]">
              <a-select-option v-for="item in afterHanded " :key="item.value" :value="item.value">{{ item.type }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="考生提醒" :wrapper-col="{ span: 20 }">
            <a-checkbox-group v-decorator="['setting[user_remind]', { initialValue: config.action === 'edit' && formdata.setting ? formdata.setting.user_remind : [] }]">
              <a-row type="flex" align="middle">
                <a-col :span="24">
                  <a-checkbox value="begin">
                    开考时提醒
                  </a-checkbox>
                </a-col>
                <a-col :span="24" style="margin-top: 25px">
                  <a-row type="flex" align="middle">
                    <a-col :span="7">
                      <a-checkbox @click="beforeBegin" value="begin_before">
                        开考前提醒
                      </a-checkbox>
                    </a-col>
                    <a-col :span="17" v-if="remind">
                      <span>开考前<a-input-number :min="0" style="margin-left: 10px; margin-right: 10px" v-model="begin_before"/>分钟自动提醒</span>
                    </a-col>
                  </a-row>
                </a-col>
                <a-col :span="24" style="margin-top: 25px">
                  <a-row type="flex" align="middle">
                    <a-col :span="7">
                      <a-checkbox @click="beforeEnd" value="end_before" style="width: 160px">
                        截止前提醒未考考生
                      </a-checkbox>
                    </a-col>
                    <a-col :span="17" v-if="remindEnd">
                      <span>截止前<a-input-number :min="0" style=" margin-left: 10px; margin-right: 10px" v-model="end_before" />分钟自动提醒</span>
                    </a-col>
                  </a-row>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
        </a-form>
        <select-user-form ref="ExamSelectUser" @ok="getUser"/>
        <select-user-form ref="ExamSelectReviewUser" @ok="getReviewUser"/>
      </div>
      <div class="bbar">
        <a-button type="primary" html-type="submit" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible" >关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    SelectUserForm: () => import('@/views/admin/UserTable/SelectUserForm')
  },
  data () {
    return {
      visible: false,
      loading: false,
      config: {},
      formdata: {},
      remind: false,
      remindEnd: false,
      cutstatus: false,
      timeType: false,
      testpaper: [],
      maxPass: null,
      examtime: null,
      username: '',
      reviewuser: '',
      afterHanded: [{
        type: '得分可见',
        value: '0'
      }, {
        type: '得分可见&对错可见',
        value: '1'
      }, {
        type: '得分可见&对错可见&正确答案可见',
        value: '2'
      }],
      restrict_screen: '',
      user_remind: [],
      prevent_cheat: [],
      begin_before: '',
      end_before: '',
      form: this.$form.createForm(this, { name: 'ExamAdd' })
    }
  },
  methods: {
    // 接收传参
    show (config) {
      this.visible = true
      this.getTestpaper()
      if (config.action === 'add') {
        this.timeType = false
        this.examtime = null
      }
      this.config = config
      this.cutstatus = false
      this.remind = false
      this.remindEnd = false
      this.restrict_screen = ''
      this.begin_before = ''
      this.end_before = ''
      this.username = ''
      this.reviewuser = ''
      this.formdata = JSON.parse(JSON.stringify(config.data))
      if (config.action === 'edit') {
        this.examtime = [this.moment(config.data.starttime, 'YYYY-MM-DD HH:mm:ss'), this.moment(config.data.endtime, 'YYYY-MM-DD HH:mm:ss')]
        if (Date.parse(config.data.starttime) < Date.parse(new Date())) {
          this.timeType = true
        } else {
          this.timeType = false
        }
        this.testpaper.forEach(item => {
          if (item.id === config.data.examid) {
            this.formdata.papername = item.title + '(' + item.total + '题/' + item.score + '分)'
            this.maxPass = Number(item.score)
          }
        })
        this.formdata.setting = JSON.parse(config.data.setting)
        if (this.formdata.setting.prevent_cheat && this.formdata.setting.prevent_cheat.indexOf('restrict_screen') !== -1) {
          this.cutstatus = true
          this.restrict_screen = this.formdata.setting.restrict_screen
        }
        if (this.formdata.setting.user_remind && this.formdata.setting.user_remind.indexOf('begin_before') !== -1) {
          this.remind = true
          this.begin_before = this.formdata.setting.begin_before
        }
        if (this.formdata.setting.user_remind && this.formdata.setting.user_remind.indexOf('end_before') !== -1) {
          this.remindEnd = true
          this.end_before = this.formdata.setting.end_before
        }
        this.username = config.data.username
        this.reviewuser = config.data.reviewuser
      }
    },
    getTestpaper () {
      const parameter = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      return this.axios({
        url: 'exam/Examination/init',
        params: parameter
      }).then(res => {
        this.testpaper = res.result.data
        return res.result
      })
    },
    disabledDate (current) {
      return current && current < this.moment().startOf('day')
    },
    // 数据提交
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        values.info['starttime'] = this.examtime[0].format('YYYY-MM-DD HH:mm:ss')
        values.info['endtime'] = this.examtime[1].format('YYYY-MM-DD HH:mm:ss')
        values.info['username'] = this.username
        values.info.reviewuser = this.reviewuser
        values.setting.begin_before = this.begin_before
        values.setting.end_before = this.end_before
        values.setting.restrict_screen = this.restrict_screen
        delete values.info.testtime
        if (!err) {
          if (this.config.action === 'edit') {
            values['id'] = this.config.data.id
            values.action = 'edit'
            this.axios({
              url: '/exam/Achievement/action',
              data: values
            }).then((res) => {
              this.visible = false
              this.$emit('on-show', '')
              this.$message.success('操作成功')
              return res.result
            })
          } else {
            values.action = 'add'
            this.axios({
              url: '/exam/Achievement/action',
              data: values
            }).then((res) => {
              this.visible = false
              this.$emit('on-show', '')
              this.$message.success('操作成功')
              return res.result
            })
          }
        }
      })
    },
    // 获取选择用户数据
    getUser (val) {
      this.username = val.toString()
      this.form.setFieldsValue({
        username: this.username
      })
    },
    getReviewUser (val) {
      this.reviewuser = val.toString()
    },
    // 打开选择用户页面
    handleSelect () {
      this.$refs.ExamSelectUser.show({
        mode: 'multiple',
        selectValue: this.username ? this.username.split(',') : ''
      })
    },
    handleSelectReview () {
      this.$refs.ExamSelectReviewUser.show({
        mode: 'multiple',
        selectValue: this.reviewuser ? this.reviewuser.split(',') : ''
      })
    },
    // 考试时间
    getExamTime (date, dateString) {
      this.examtime = date
    },
    // 切屏次数
    cutting () {
      this.cutstatus = !this.cutstatus
    },
    beforeBegin () {
      this.remind = !this.remind
    },
    beforeEnd () {
      this.remindEnd = !this.remindEnd
    }
  }
}
</script>
<style scoped>
.input{
  background-color: #F5F5F5;
}
</style>
