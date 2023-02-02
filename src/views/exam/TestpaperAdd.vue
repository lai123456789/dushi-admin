
<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="1000"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" @submit="handleSubmit" style="padding-bottom: 100px">
        <div style="margin-bottom:25px">
          <a-form-item label="试卷名称" :label-col="{ span: 2 }" :wrapper-col="{ span: 22 }">
            <a-input
              v-decorator="['info[title]', { initialValue: formdata.title, rules: [{ required: true, message: '请输入试卷名称' },{ max: 20, message: '试卷名称不得大于20个字符' }] }]"
            />
          </a-form-item>
          <div style="text-align: center;">
            <table cellspacing="0" cellpadding="5" border="1px" style="width:900px; text-align: center; border-color: #D9D9D9; margin: auto;">
              <tr>
                <td style="background-color: #F2F2F2">单选题</td>
                <td>{{ config.type === 'fixed' ? singleList.length : singlechiose }}题, {{ singleScore }}分</td>
                <td style="background-color: #F2F2F2">多选题</td>
                <td>{{ config.type === 'fixed' ? multipleList.length : multiplechiose }}题, {{ multipleScore }}分</td>
                <td style="background-color: #F2F2F2">判断题</td>
                <td>{{ config.type === 'fixed' ? judgeList.length : judgechiose }}题, {{ judgeScore }}分</td>
                <td style="background-color: #F2F2F2">填空题</td>
                <td>{{ config.type === 'fixed' ? fillsList.length : fillschiose }}题, {{ fillsScore }}分</td>
                <td style="background-color: #F2F2F2">简答题</td>
                <td>{{ config.type === 'fixed' ? answerList.length : answerchiose }}题, {{ answerScore }}分</td>
              </tr>
              <tr>
                <td style="background-color: #F2F2F2">总分</td>
                <td colspan="9">{{ scoreTotal }}分</td>
              </tr>
            </table>
          </div>
        </div>
        <div v-if="config.type === 'fixed'">
          <a-form-item>
            <a-button type="dashed" block icon="plus" @click="addPage">从题库中选择题目</a-button>
          </a-form-item>
          <div v-for="(value, option) in titleData" :key="option">
            <a-divider v-if="option !== 0 "/>
            <div v-if="value === '单选题' && singleList.length > 0">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}({{ singleList.length }}题，共{{ singleScore }}分)</b></h2></a-col>
              <a-col :span="17"><a style="display: block; margin-top: 10px" @click="batchPage(value)">批量设置分数</a></a-col>
              <div v-for="(item, key) in singleList" :key="key">
                <a-col :span="24">
                  <span>{{ key + 1 }}. {{ item.title }}</span>
                </a-col>
                <a-col :span="24">
                  <a-radio-group
                    v-decorator="['info[list' + key + ']']"
                  >
                    <a-col :span="24">
                      <a-radio
                        :style="radioStyle"
                        :value="keys"
                        v-for="(items, keys) in item.lists"
                        :key="keys"
                      >
                        {{ String.fromCharCode(65 + keys) }}. {{ items }}
                      </a-radio>
                    </a-col>
                  </a-radio-group>
                </a-col>
                <a-col :span="12">
                  <a-form-item>
                    分值<a-input-number :min="1" @blur="scorechange($event, key, '0', value)" style="margin-left: 15px" v-decorator="['score'+ key + '0' , { initialValue: item.score, rules: [{ required: true, message: '请输入分值' }] }]" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <div style="text-align: right">
                    <a :class="key === 0 ? 'up' : ''" @click="up(key, value)">上移</a>
                    <a-divider type="vertical" />
                    <a :class="key === singleList.length - 1 ? 'up' : ''" @click="down(key, value)">下移</a>
                    <a-divider type="vertical" />
                    <a @click="testdelete(key, value)">删除</a>
                  </div>
                </a-col>
              </div>
            </div>
            <div v-if="value === '多选题'">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}({{ multipleList.length }}题，共{{ multipleScore }}分)</b></h2></a-col>
              <a-col :span="17"><a style="display: block; margin-top: 10px" @click="batchPage(value)">批量设置分数</a></a-col>
              <div v-for="(item, key) in multipleList" :key="key">
                <a-col :span="24">
                  <span>{{ singleList.length + key + 1 }}. {{ item.title }}</span>
                </a-col>
                <a-col :span="24">
                  <a-checkbox-group
                    v-decorator="['info[list' + key + ']']"
                  >
                    <a-col :span="24">
                      <a-checkbox
                        :style="radioStyle"
                        :value="keys"
                        v-for="(items, keys) in item.lists"
                        :key="keys"
                      >
                        {{ String.fromCharCode(65 + keys) }}. {{ items }}
                      </a-checkbox>
                    </a-col>
                  </a-checkbox-group>
                </a-col>
                <a-col :span="12">
                  <a-form-item>
                    分值<a-input-number @blur="scorechange($event, key, '1', value)" :min="1" style="margin-left: 15px" v-decorator="['score'+ key + '1' , { initialValue: item.score, rules: [{ required: true, message: '请输入分值' }] }]" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <div style="text-align: right">
                    <a :class="key === 0 ? 'up' : ''" @click="up(key, value)">上移</a>
                    <a-divider type="vertical" />
                    <a :class="key === multipleList.length - 1 ? 'up' : ''" @click="down(key, value)">下移</a>
                    <a-divider type="vertical" />
                    <a @click="testdelete(key, value)">删除</a>
                  </div>
                </a-col>
              </div>
            </div>
            <div v-if="value === '判断题'">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}({{ judgeList.length }}题，共{{ judgeScore }}分)</b></h2></a-col>
              <a-col :span="17"><a style="display: block; margin-top: 10px" @click="batchPage(value)">批量设置分数</a></a-col>
              <div v-for="(item, key) in judgeList" :key="key">
                <a-col :span="24">
                  <span>{{ singleList.length + multipleList.length + key + 1 }}. {{ item.title }}</span>
                </a-col>
                <a-col :span="24">
                  <a-radio-group
                    v-decorator="['info[list' + key + ']']"
                  >
                    <a-col :span="24">
                      <a-radio :style="radioStyle" :value="1">对</a-radio>
                      <a-radio :style="radioStyle" :value="0">错</a-radio>
                    </a-col>
                  </a-radio-group>
                </a-col>
                <a-col :span="12">
                  <a-form-item>
                    分值<a-input-number :min="1" @blur="scorechange($event, key, '2', value)" style="margin-left: 15px" v-decorator="['score'+ key + '2' , { initialValue: item.score, rules: [{ required: true, message: '请输入分值' }] }]" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <div style="text-align: right">
                    <a :class="key === 0 ? 'up' : ''" @click="up(key, value)">上移</a>
                    <a-divider type="vertical" />
                    <a :class="key === judgeList.length - 1 ? 'up' : ''" @click="down(key, value)">下移</a>
                    <a-divider type="vertical" />
                    <a @click="testdelete(key, value)">删除</a>
                  </div>
                </a-col>
              </div>
            </div>
            <div v-if="value === '填空题'">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}({{ fillsList.length }}题，共{{ fillsScore }}分)</b></h2></a-col>
              <a-col :span="17"><a style="display: block; margin-top: 10px" @click="batchPage(value)">批量设置分数</a></a-col>
              <div v-for="(item, key) in fillsList" :key="key">
                <a-col :span="24">
                  <span>{{ singleList.length + multipleList.length + judgeList.length + key + 1 }}. {{ item.title }}</span>
                </a-col>
                <a-col :span="12">
                  <a-form-item>
                    分值<a-input-number :min="1" @blur="scorechange($event, key, '3', value)" style="margin-left: 15px" v-decorator="['score'+ key + '3' , { initialValue: item.score, rules: [{ required: true, message: '请输入分值' }] }]" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <div style="text-align: right">
                    <a :class="key === 0 ? 'up' : ''" @click="up(key, value)">上移</a>
                    <a-divider type="vertical" />
                    <a :class="key === fillsList.length - 1 ? 'up' : ''" @click="down(key, value)">下移</a>
                    <a-divider type="vertical" />
                    <a @click="testdelete(key, value)">删除</a>
                  </div>
                </a-col>
              </div>
            </div>
            <div v-if="value === '简答题'">
              <a-col :span="7"><h2><b>{{ chinese[option] }}、{{ value }}({{ answerList.length }}题，共{{ answerScore }}分)</b></h2></a-col>
              <a-col :span="17"><a style="display: block; margin-top: 10px" @click="batchPage(value)">批量设置分数</a></a-col>
              <div v-for="(item, key) in answerList" :key="key">
                <a-col :span="24">
                  <span>{{ singleList.length + multipleList.length + judgeList.length + fillsList.length + key + 1 }}. {{ item.title }}</span>
                </a-col>
                <a-col :span="24">
                  <a-textarea
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                  />
                </a-col>
                <a-col :span="12">
                  <a-form-item>
                    分值<a-input-number :min="1" @blur="scorechange($event, key, '4', value)" style="margin-left: 15px" v-decorator="['score'+ key + '4' , { initialValue: item.score, rules: [{ required: true, message: '请输入分值' }] }]" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <div style="text-align: right">
                    <a :class="key === 0 ? 'up' : ''" @click="up(key, value)">上移</a>
                    <a-divider type="vertical" />
                    <a :class="key === answerList.length - 1 ? 'up' : ''" @click="down(key, value)">下移</a>
                    <a-divider type="vertical" />
                    <a @click="testdelete(key, value)">删除</a>
                  </div>
                </a-col>
              </div>
            </div>
          </div>
        </div>
        <div v-if="config.type === 'random'">
          <a-col :span="24">
            <a-form-item>
              <a-button type="dashed" block icon="plus" @click="bankAddPage">选择题库</a-button>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="已选择题库" :label-col="{ span: 2 }" :wrapper-col="{ span: 22 }" :colon="false">
              <a-select
                mode="multiple"
                style="width: 100%"
                placeholder="请选择题库"
                v-model="banknameshow"
                @change="handleChange"
              >
                <a-select-option v-for="(value, index) in bankname" :key="index" :value="value.id">
                  {{ value.subject }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <div >
              <a-card>
                <div>
                  <a-col :span="8">
                    <div style="text-align: left">单选题数量<span class="span">{{ singlenumber }}</span>题</div>
                  </a-col>
                  <a-col :span="8" style="text-align: center; margin: auto;">
                    抽题数量<a-input-number @change="chiose($event, 0)" :min="0" :max="singlenumber" v-model="singlechiose" style="margin-left: 10px"/>
                  </a-col>
                  <a-col :span="8" style="text-align: right;">
                    <a-form-item>
                      每题分值<a-input-number
                        @blur="changscore($event, 0)"
                        :min="0"
                        v-decorator="['allScore[0]', { initialValue: allScore[0], rules: [{ required: singlechiose > 0, message: '请输入每题分值' }] }]"
                        style="margin-left: 10px"/>
                    </a-form-item>
                  </a-col>
                </div>
              </a-card>
              <a-card>
                <div>
                  <a-col :span="8">
                    <div style=" text-align: left">多选题数量<span class="span">{{ multiplenumber }}</span>题</div>
                  </a-col>
                  <a-col :span="8" style="text-align: center; margin: auto;">
                    抽题数量<a-input-number @change="chiose($event, 1)" :min="0" :max="multiplenumber" v-model="multiplechiose" style="margin-left: 10px"/>
                  </a-col>
                  <a-col :span="8" style="text-align: right;">
                    <a-form-item>
                      每题分值<a-input-number
                        @blur="changscore($event, 1)"
                        :min="0"
                        v-decorator="['allScore[1]', { initialValue: allScore[1], rules: [{ required: multiplechiose > 0, message: '请输入每题分值' }] }]"
                        style="margin-left: 10px"/>
                    </a-form-item>
                  </a-col>
                </div>
              </a-card>
              <a-card>
                <div>
                  <a-col :span="8">
                    <div style=" text-align: left">判断题数量<span class="span">{{ judgenumber }}</span>题</div>
                  </a-col>
                  <a-col :span="8" style="text-align: center; margin: auto;">
                    抽题数量<a-input-number @change="chiose($event, 2)" :min="0" :max="judgenumber" v-model="judgechiose" style="margin-left: 10px"/>
                  </a-col>
                  <a-col :span="8" style="text-align: right;">
                    <a-form-item>
                      每题分值<a-input-number
                        @blur="changscore($event, 2)"
                        :min="0"
                        v-decorator="['allScore[2]', { initialValue: allScore[2], rules: [{ required: judgechiose > 0, message: '请输入每题分值' }] }]"
                        style="margin-left: 10px"/>
                    </a-form-item>
                  </a-col>
                </div>
              </a-card>
              <a-card>
                <div>
                  <a-col :span="8">
                    <div style="text-align: left">填空题数量<span class="span">{{ fillsnumber }}</span>题</div>
                  </a-col>
                  <a-col :span="8" style="text-align: center; margin: auto;">
                    抽题数量<a-input-number @change="chiose($event, 3)" :min="0" :max="fillsnumber" v-model="fillschiose" style="margin-left: 10px"/>
                  </a-col>
                  <a-col :span="8" style="text-align: right;">
                    <a-form-item>
                      每题分值<a-input-number
                        @blur="changscore($event, 3)"
                        :min="0"
                        v-decorator="['allScore[3]', { initialValue: allScore[3], rules: [{ required: fillschiose > 0, message: '请输入每题分值' }] }]"
                        style="margin-left: 10px"/>
                    </a-form-item>
                  </a-col>
                </div>
              </a-card>
              <a-card>
                <div>
                  <a-col :span="8">
                    <div style=" text-align: left">简答题数量<span class="span">{{ answernumber }}</span>题</div>
                  </a-col>
                  <a-col :span="8" style="text-align: center; margin: auto;">
                    抽题数量<a-input-number @change="chiose($event, 4)" :min="0" :max="answernumber" v-model="answerchiose" style="margin-left: 10px"/>
                  </a-col>
                  <a-col :span="8" style="text-align: right;">
                    <a-form-item>
                      每题分值<a-input-number
                        @blur="changscore($event, 4)"
                        :min="0"
                        v-decorator="['allScore[4]', { initialValue: allScore[4], rules: [{ required: answerchiose > 0, message: '请输入每题分值' }] }]"
                        style="margin-left: 10px"/>
                    </a-form-item>
                  </a-col>
                </div>
              </a-card>
            </div>
          </a-col>
        </div>
      </a-form>
      <div class="bbar" style="position:fixed; bottom: 0; text-align: right; width: 1000px; background-color: white; padding-right: 30px">
        <a-button type="primary" html-type="submit" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
      <a-drawer
        :destroyOnClose="true"
        :title="configadd.title"
        :width="1000"
        :visible="addvisible"
        @close="addvisible=!addvisible">
        <div>
          <a-card class="table-search" :bordered="true">
            <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
              <div class="head">
                <a-space style="margin-left: 8px">
                  <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search" >搜索</a-button>
                  <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
                </a-space>
              </div>
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="所属题库">
                    <a-select :allowClear="true" show-search v-model.trim="queryParam.subjectid">
                      <a-select-option v-for="item in bankname" :key="item.id" :value="item.id">{{ item.subject }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="7">
                  <a-form-item label="题型">
                    <a-select :allowClear="true" show-search v-model.trim="queryParam.type">
                      <a-select-option v-for="(item, key) in questionType" :key="key" :value="item.value">{{ item.type }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
          <a-card>
            <div class="table-operator">
              <a-button v-action:add icon="select" type="primary" :disabled="selectedRowKeys.length==0" @click="select">选择</a-button>
            </div>
            <s-table
              ref="table"
              size="small"
              rowKey="id"
              :columns="columnsadd"
              :data="loadDataTable"
              :rowSelection="rowSelection"
              :sorter="{ field: 'id', order: 'descend' }"
            >
              <div slot="type" slot-scope="text" >
                <span v-for="(value, index) in questionType" :key="index" v-show="text === value.value">{{ value.type }}</span>
              </div>
              <div slot="subjectid" slot-scope="text" >
                <span v-for="(value, index) in bankname" :key="index" v-show="text === value.id">{{ value.subject }}</span>
              </div>
            </s-table>
          </a-card>
        </div>
      </a-drawer>
      <a-drawer
        :destroyOnClose="true"
        :title="configrandom.title"
        :width="1000"
        :visible="randomvisible"
        @close="randomvisible=!randomvisible">
        <div>
          <a-card class="table-search" :bordered="true">
            <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
              <div class="head">
                <a-space style="margin-left: 8px">
                  <a-button icon="search" type="primary" @click="Search" @keyup.enter="Search" >搜索</a-button>
                  <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
                </a-space>
              </div>
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-form-item label="题库名称">
                    <a-input v-model.trim="queryParam.subject"/>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="创建人">
                    <a-input v-model.trim="queryParam.inputuser"/>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="创建时间">
                    <a-range-picker
                      v-model="queryParam.inputtime"
                      :ranges="{
                        今天: [moment().startOf('day'), moment().endOf('day')],
                        昨天: [moment().startOf('day').subtract('day', 1) , moment().endOf('day').subtract('day', 1)],
                        本周: [moment().startOf('week'), moment().endOf('week')],
                        本月: [moment().startOf('month'), moment().endOf('month')],
                      }"
                      :show-time="{ format: 'HH:mm:ss' }"
                      format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
          <a-card>
            <div class="table-operator">
              <a-button v-action:add icon="select" type="primary" :disabled="selectedRowKeys.length==0" @click="selectrandom">选择</a-button>
            </div>
            <s-table
              ref="table"
              size="small"
              rowKey="id"
              :columns="columnsrandom"
              :data="loadDataTable2"
              :rowSelection="rowSelection"
              :sorter="{ field: 'id', order: 'descend' }"
            >
            </s-table>
          </a-card>
        </div>
      </a-drawer>
      <a-modal
        :destroyOnClose="true"
        :title="configbatch.title"
        :visible="batchvisible"
        @ok="batchSubmit"
        @cancel="batchvisible=!batchvisible"
      >
        <div>
          <a-form :form="formbatch" :label-col="{ span: 4 }" @submit="batchSubmit">
            <a-form-item label="分值" :wrapper-col="{ span: 18 }">
              <a-col :span="24">
                <a-input-number style="width: 400px" :min="0" v-decorator="['allScore', { rules: [{ required: true, message: '请输入分值' }] }]" />
              </a-col>
            </a-form-item>
          </a-form>
        </div>
      </a-modal>
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
      addvisible: false,
      randomvisible: false,
      batchvisible: false,
      config: {},
      configadd: {},
      configrandom: {},
      configbatch: {},
      formdata: {},
      singleList: [],
      multipleList: [],
      judgeList: [],
      colLayout: {},
      fillsList: [],
      Type: '',
      answerList: [],
      queryParam: {},
      allbank: [],
      bankname: [],
      banknameshow: [],
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      single: [],
      singlenumber: 0,
      singlechiose: 0,
      singleScore: 0,
      multiple: [],
      multiplenumber: 0,
      multiplechiose: 0,
      multipleScore: 0,
      judge: [],
      judgenumber: 0,
      judgechiose: 0,
      judgeScore: 0,
      fills: [],
      fillsnumber: 0,
      fillschiose: 0,
      fillsScore: 0,
      answer: [],
      answernumber: 0,
      answerchiose: 0,
      answerScore: 0,
      questionTotal: 0,
      scoreTotal: 0,
      titleData: [],
      allScore: [],
      form: this.$form.createForm(this, { name: 'TestpaperAdd' }),
      formbatch: this.$form.createForm(this, { name: 'batch' }),
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      chinese: ['一', '二', '三', '四', '五'],
      questionType: [{
        type: '单选题',
        value: 'single'
      }, {
        type: '多选题',
        value: 'multiple'
      }, {
        type: '填空题',
        value: 'fills'
      }, {
        type: '判断题',
        value: 'judge'
      }, {
        type: '简答题',
        value: 'answer'
      }],
      columnsadd: [{
        title: 'ID',
        dataIndex: 'id',
        align: 'center',
        width: 40
      }, {
        title: '题目',
        dataIndex: 'title',
        width: 200
      }, {
        title: '题型',
        dataIndex: 'type',
        scopedSlots: { customRender: 'type' },
        width: 100
      }, {
        title: '所属题库',
        dataIndex: 'subjectid',
        scopedSlots: { customRender: 'subjectid' }
      }, {
        title: '创建人',
        dataIndex: 'inputuser'
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        width: 140
      }, {
        title: '最后修改人',
        dataIndex: 'updateuser'
      }, {
        title: '最后修改时间',
        dataIndex: 'updatetime',
        width: 140
      }],
      columnsrandom: [{
        title: 'ID',
        dataIndex: 'id',
        width: 40
      }, {
        title: '题库名称',
        dataIndex: 'subject',
        width: 250
      }, {
        title: '试题数',
        dataIndex: 'total'
      }, {
        title: '单选题',
        dataIndex: 'single'
      }, {
        title: '多选题',
        dataIndex: 'multiple'
      }, {
        title: '判断题',
        dataIndex: 'judge'
      }, {
        title: '填空题',
        dataIndex: 'fills'
      }, {
        title: '简答题',
        dataIndex: 'answer'
      }, {
        title: '创建人',
        dataIndex: 'inputuser'
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        width: 140
      }]
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  methods: {
    // 从题库中选择题目数据渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/exam/Question/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.single = []
        this.multiple = []
        this.judge = []
        this.fills = []
        this.answer = []
        for (const i in res.result.data) {
          if (res.result.data[i].type === 'single') {
            const data = res.result.data[i]
            data.list = JSON.parse(data.setting).list
            const arr = []
            for (const i in data.list) {
              arr.push(data.list[i])
            }
            data.lists = arr
            this.single.push(data)
          } else if (res.result.data[i].type === 'multiple') {
            const data = res.result.data[i]
            data.list = JSON.parse(data.setting).list
            const arr = []
            for (const i in data.list) {
              arr.push(data.list[i])
            }
            data.lists = arr
            this.multiple.push(data)
          } else if (res.result.data[i].type === 'fills') {
            this.fills.push(res.result.data[i])
          } else if (res.result.data[i].type === 'judge') {
            this.judge.push(res.result.data[i])
          } else if (res.result.data[i].type === 'answer') {
            this.answer.push(res.result.data[i])
          }
        }
        return res.result
      })
    },
    // 选择题库数据渲染
    loadDataTable2 (parameter) {
      return this.axios({
        url: 'exam/Subject/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        res.result.data.forEach(item => {
          item.total = Number(item.answer) + Number(item.fills) + Number(item.judge) + Number(item.multiple) + Number(item.single)
          this.allbank.push(item)
        })
        return res.result
      })
    },
    // 接收数据
    show (config) {
      this.visible = true
      this.loading = true
      this.formdata = {}
      this.titleData = []
      this.banknameshow = []
      this.allScore = []
      this.singlenumber = 0
      this.singlechiose = 0
      this.multiplenumber = 0
      this.multiplechiose = 0
      this.judgenumber = 0
      this.judgechiose = 0
      this.fillsnumber = 0
      this.fillschiose = 0
      this.answernumber = 0
      this.answerchiose = 0
      this.singleScore = 0
      this.singleList = []
      this.multipleList = []
      this.multipleScore = 0
      this.judgeList = []
      this.judgeScore = 0
      this.scoreTotal = 0
      this.fillsList = []
      this.fillsScore = 0
      this.answerList = []
      this.answerScore = 0
      this.config = config
      this.bankname = []
      const parameter = {
        pageNo: 1,
        pageSize: 1000,
        sortField: 'id',
        sortOrder: 'descend'
      }
      this.axios({
        url: '/exam/Subject/init',
        params: parameter
      }).then(res => {
        this.bankname = res.result.data
        if (config.type === 'fixed' && config.action === 'edit') {
          this.formdata = config.data
          const data = JSON.parse(this.formdata.setting).data
          data.forEach((item, index) => {
            this.scoreTotal = this.scoreTotal + Number(item.score)
          })
          this.axios({
            url: '/exam/Question/init',
            params: Object.assign(parameter)
          }).then(res => {
            const details = res.result.data.filter(item => data.some(x => x.question === item.id))
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
                for (const i in JSON.parse(item.setting).list) {
                  data.push(JSON.parse(item.setting).list[i])
                }
                item.lists = data
                this.singleScore = this.singleScore + Number(item.score)
                this.singleList.push(item)
              } else if (item.type === 'multiple') {
                const data = []
                for (const i in JSON.parse(item.setting).list) {
                  data.push(JSON.parse(item.setting).list[i])
                }
                item.lists = data
                this.multipleScore = this.multipleScore + Number(item.score)
                this.multipleList.push(item)
              } else if (item.type === 'judge') {
                this.judgeScore = this.judgeScore + Number(item.score)
                this.judgeList.push(item)
              } else if (item.type === 'fills') {
                this.fillsScore = this.fillsScore + Number(item.score)
                this.fillsList.push(item)
              } else if (item.type === 'answer') {
                this.answerScore = this.answerScore + Number(item.score)
                this.answerList.push(item)
              }
            })
            if (this.singleList.length > 0) {
              this.titleData.unshift('单选题')
            }
            if (this.multipleList.length > 0) {
              this.titleData.push('多选题')
            }
            if (this.judgeList.length > 0) {
              this.titleData.push('判断题')
            }
            if (this.fillsList.length > 0) {
              this.titleData.push('填空题')
            }
            if (this.answerList.length > 0) {
              this.titleData.push('简答题')
            }
          })
        } else if (config.type !== 'fixed' && config.action === 'edit') {
          this.formdata = config.data
          const data = JSON.parse(this.formdata.setting)
          this.banknameshow = data.subject
          data.data.forEach(item => {
            if (item.type === 'single') {
              this.singlechiose = item.num
              this.allScore[0] = item.score
              this.singleScore = item.num * item.score
            }
            if (item.type === 'multiple') {
              this.multiplechiose = item.num
              this.allScore[1] = item.score
              this.multipleScore = item.num * item.score
            }
            if (item.type === 'judge') {
              this.judgechiose = item.num
              this.allScore[2] = item.score
              this.judgeScore = item.num * item.score
            }
            if (item.type === 'fills') {
              this.fillschiose = item.num
              this.allScore[3] = item.score
              this.fillsScore = item.num * item.score
            }
            if (item.type === 'answer') {
              this.answerchiose = item.num
              this.allScore[4] = item.score
              this.answerScore = item.num * item.score
            }
          })
          this.scoreTotal = this.answerScore + this.fillsScore + this.judgeScore + this.multipleScore + this.singleScore
          for (let i = 0; i < this.banknameshow.length; i++) {
            for (const j in this.bankname) {
              if (this.banknameshow[i] === this.bankname[j].id) {
                this.singlenumber = this.singlenumber + Number(this.bankname[j].single)
                this.multiplenumber = this.multiplenumber + Number(this.bankname[j].multiple)
                this.judgenumber = this.judgenumber + Number(this.bankname[j].judge)
                this.fillsnumber = this.fillsnumber + Number(this.bankname[j].fills)
                this.answernumber = this.answernumber + Number(this.bankname[j].answer)
              }
            }
          }
        }
        this.loading = false
      })
    },
    // 打开选择题库
    bankAddPage () {
      this.randomvisible = true
      this.configrandom = {
        action: 'add',
        title: '选择题库'
      }
    },
    // 数据提交
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        this.questionTotal = this.config.type === 'fixed' ? this.singleList.length + this.multipleList.length + this.judgeList.length + this.fillsList.length + this.answerList.length : Number(this.singlechiose) + Number(this.multiplechiose) + Number(this.fillschiose) + Number(this.judgechiose) + Number(this.answerchiose)
        if (!err) {
          const sendData = {}
          sendData.info = values.info
          sendData.info['type'] = this.config.type
          sendData.info['total'] = this.questionTotal
          sendData.info['score'] = this.scoreTotal
          if (this.config.action === 'edit') {
            sendData.id = this.config.data.id
            sendData.action = 'edit'
            if (this.config.type === 'fixed') {
              sendData.setting = {}
              sendData.setting.data = []
              this.singleList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.multipleList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.judgeList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.fillsList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.answerList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
            } else {
              sendData.setting = {}
              sendData.setting.subject = this.banknameshow
              sendData.setting.data = [{
                type: 'single',
                num: this.singlechiose,
                score: this.form.getFieldsValue().allScore[0]
              }, {
                type: 'multiple',
                num: this.multiplechiose,
                score: this.form.getFieldsValue().allScore[1]
              }, {
                type: 'judge',
                num: this.judgechiose,
                score: this.form.getFieldsValue().allScore[2]
              }, {
                type: 'fills',
                num: this.fillschiose,
                score: this.form.getFieldsValue().allScore[3]
              }, {
                type: 'answer',
                num: this.answerchiose,
                score: this.form.getFieldsValue().allScore[4]
              }]
            }
            this.axios({
              url: '/exam/Examination/action',
              data: sendData
            }).then((res) => {
              this.visible = false
              this.$emit('on-show', '')
              return res.result
            })
          } else {
            sendData.action = 'add'
            if (this.config.type === 'fixed') {
              sendData.setting = {}
              sendData.setting.data = []
              this.singleList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.multipleList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.judgeList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.fillsList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
              this.answerList.forEach(item => {
                const data = {}
                data.question = item.id
                data.score = item.score
                sendData.setting.data.push(data)
              })
            } else {
              sendData.setting = {}
              sendData.setting.subject = this.banknameshow
              sendData.setting.data = [{
                type: 'single',
                num: this.singlechiose,
                score: this.form.getFieldsValue().allScore[0]
              }, {
                type: 'multiple',
                num: this.multiplechiose,
                score: this.form.getFieldsValue().allScore[1]
              }, {
                type: 'judge',
                num: this.judgechiose,
                score: this.form.getFieldsValue().allScore[2]
              }, {
                type: 'fills',
                num: this.fillschiose,
                score: this.form.getFieldsValue().allScore[3]
              }, {
                type: 'answer',
                num: this.answerchiose,
                score: this.form.getFieldsValue().allScore[4]
              }]
            }
            this.axios({
              url: 'exam/Examination/action',
              data: sendData
            }).then((res) => {
              this.visible = false
              this.$emit('on-show', '')
              return res.result
            })
          }
        }
      })
    },
    // 打开从题库中选择
    addPage () {
      this.addvisible = true
      this.configadd = {
        action: 'add',
        title: '从题库中选择'
      }
    },
    // 搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    // 选择题库提交
    selectrandom () {
      const id = this.selectedRowKeys
      const table = this.$refs.table
      for (const i in id) {
        for (const j in this.allbank) {
          if (id[i] === this.allbank[j].id) {
            if (this.banknameshow.indexOf(this.allbank[j].id) === -1) {
              this.banknameshow.push(this.allbank[j].id)
              this.singlenumber = this.singlenumber + Number(this.allbank[j].single)
              this.multiplenumber = this.multiplenumber + Number(this.allbank[j].multiple)
              this.judgenumber = this.judgenumber + Number(this.allbank[j].judge)
              this.fillsnumber = this.fillsnumber + Number(this.allbank[j].fills)
              this.answernumber = this.answernumber + Number(this.allbank[j].answer)
            }
          }
        }
      }
      table.refresh()
      this.randomvisible = false
    },
    // 选择题目去重
    unique (arr1) {
      const array = arr1
      const res = new Map()
      return array.filter((obj) => !res.has(obj.title) && res.set(obj.title, 1))
    },
    // 从题库中选择题目选择
    select () {
      const id = this.selectedRowKeys
      const table = this.$refs.table
      for (const i in id) {
        for (const j in this.single) {
          if (id[i] === this.single[j].id) {
            this.singleList.push(this.single[j])
            this.singleList = this.unique(this.singleList)
          }
        }
        for (const j in this.multiple) {
          if (id[i] === this.multiple[j].id) {
            this.multipleList.push(this.multiple[j])
            this.multipleList = this.unique(this.multipleList)
          }
        }
        for (const j in this.judge) {
          if (id[i] === this.judge[j].id) {
            this.judgeList.push(this.judge[j])
            this.judgeList = this.unique(this.judgeList)
          }
        }
        for (const j in this.fills) {
          if (id[i] === this.fills[j].id) {
            this.fillsList.push(this.fills[j])
            this.fillsList = this.unique(this.fillsList)
          }
        }
        for (const j in this.answer) {
          if (id[i] === this.answer[j].id) {
            this.answerList.push(this.answer[j])
            this.answerList = this.unique(this.answerList)
          }
        }
      }
      this.titleData = []
      if (this.singleList.length !== 0 && this.titleData.indexOf('单选题') === -1) {
        this.titleData.unshift('单选题')
      }
      if (this.multipleList.length !== 0 && this.titleData.indexOf('多选题') === -1) {
        this.titleData.push('多选题')
      }
      if (this.judgeList.length !== 0 && this.titleData.indexOf('判断题') === -1) {
        this.titleData.push('判断题')
      }
      if (this.fillsList.length !== 0 && this.titleData.indexOf('填空题') === -1) {
        this.titleData.push('填空题')
      }
      if (this.answerList.length !== 0 && this.titleData.indexOf('简答题') === -1) {
        this.titleData.push('简答题')
      }
      this.addvisible = false
      this.loading = false
      table.refresh()
    },
    // 随机卷题库各题型题目数量
    handleChange (e) {
      this.singlenumber = 0
      this.multiplenumber = 0
      this.judgenumber = 0
      this.fillsnumber = 0
      this.answernumber = 0
      this.singlechiose = 0
      this.multiplechiose = 0
      this.judgechiose = 0
      this.fillschiose = 0
      this.answerchiose = 0
      this.singlechiose = 0
      this.multiplechiose = 0
      this.judgechiose = 0
      this.fillschiose = 0
      this.answerchiose = 0
      this.singleScore = 0
      this.multipleScore = 0
      this.judgeScore = 0
      this.fillsScore = 0
      this.answerScore = 0
      this.scoreTotal = 0
      for (let i = 0; i < this.banknameshow.length; i++) {
        for (const j in this.bankname) {
          if (this.banknameshow[i] === this.bankname[j].id) {
            this.singlenumber = this.singlenumber + Number(this.bankname[j].single)
            this.multiplenumber = this.multiplenumber + Number(this.bankname[j].multiple)
            this.judgenumber = this.judgenumber + Number(this.bankname[j].judge)
            this.fillsnumber = this.fillsnumber + Number(this.bankname[j].fills)
            this.answernumber = this.answernumber + Number(this.bankname[j].answer)
          }
        }
      }
    },
    // 随机卷选择提数变化
    chiose (e, key) {
      const number = this.form.getFieldsValue().allScore[key]
      if (key === 0) {
        this.singlechiose = Number(e)
        if (number) {
          this.singleScore = Number(number) * Number(e)
        }
      } else if (key === 1) {
        this.multiplechiose = Number(e)
        if (number) {
          this.multipleScore = Number(number) * this.multiplechiose
        }
      } else if (key === 2) {
        this.judgechiose = Number(e)
        if (number) {
          this.judgeScore = Number(number) * this.judgechiose
        }
      } else if (key === 3) {
        this.fillschiose = Number(e)
        if (number) {
          this.fillsScore = Number(number) * this.fillschiose
        }
      } else if (key === 4) {
        this.answerchiose = Number(e)
        if (number) {
          this.answerScore = Number(number) * this.answerchiose
        }
      }
      this.scoreTotal = this.answerScore + this.fillsScore + this.judgeScore + this.multipleScore + this.singleScore
    },
    // 随机卷每题分数变化
    changscore (e, key) {
      if (key === 0) {
        this.singleScore = Number(e.target.value) * this.singlechiose
      }
      if (key === 1) {
        this.multipleScore = Number(e.target.value) * this.multiplechiose
      }
      if (key === 2) {
        this.judgeScore = Number(e.target.value) * this.judgechiose
      }
      if (key === 3) {
        this.fillsScore = Number(e.target.value) * this.fillschiose
      }
      if (key === 4) {
        this.answerScore = Number(e.target.value) * this.answerchiose
      }
      this.scoreTotal = this.answerScore + this.fillsScore + this.judgeScore + this.multipleScore + this.singleScore
    },
    // 每题分值变化
    scorechange (e, key, index, type) {
      const name = String(key) + String(index)
      if (type === '单选题') {
        this.singleList[key]['score'] = e.target.value
        this.singleScore = 0
        this.singleList.forEach((item, index) => {
          this.singleScore = item.score ? (this.singleScore + Number(item.score)) : this.singleScore
        })
        this.singleList['score'] = this.singleScore
      }
      if (type === '多选题') {
        this.multipleList[key]['score'] = e.target.value
        this.multipleScore = 0
        this.multipleList.forEach((item, index) => {
          this.multipleScore = item.score ? (this.multipleScore + Number(item.score)) : this.multipleScore
        })
        this.multipleList['score'] = this.multipleScore
      }
      if (type === '判断题') {
        this.judgeList[key]['score'] = e.target.value
        this.judgeScore = 0
        this.judgeList.forEach((item, index) => {
          this.judgeScore = item.score ? (this.judgeScore + Number(item.score)) : this.judgeScore
        })
        this.judgeList['score'] = this.judgeScore
      }
      if (type === '填空题') {
        this.fillsList[key]['score'] = e.target.value
        this.fillsScore = 0
        this.fillsList.forEach((item, index) => {
          this.fillsScore = item.score ? (this.fillsScore + Number(item.score)) : this.fillsScore
        })
        this.fillsList['score'] = this.fillsScore
      }
      if (type === '简答题') {
        this.answerList[key]['score'] = e.target.value
        this.answerScore = 0
        this.answerList.forEach((item, index) => {
          this.answerScore = item.score ? (this.answerScore + Number(item.score)) : this.answerScore
        })
        this.answerList['score'] = this.answerScore
      }
      this.scoreTotal = this.answerScore + this.fillsScore + this.judgeScore + this.multipleScore + this.singleScore
      this.allScore[name] = Number(e.target.value)
    },
    // 上移
    up (index, type) {
      if (index === 0) {
        return false
      }
      if (type === '单选题') {
        const change = this.singleList[index - 1]
        const obj = {}
        const text1 = 'score' + String(index - 1) + '0'
        const text2 = 'score' + String(index) + '0'
        obj[text1] = this.singleList[index].score
        obj[text2] = change.score
        this.form.setFieldsValue(obj)
        this.$set(this.singleList, index - 1, this.singleList[index])
        this.$set(this.singleList, index, change)
      }
      if (type === '多选题') {
        const change = this.multipleList[index - 1]
        const obj = {}
        const text1 = 'score' + String(index - 1) + '1'
        const text2 = 'score' + String(index) + '1'
        obj[text1] = this.multipleList[index].score
        obj[text2] = change.score
        this.form.setFieldsValue(obj)
        this.$set(this.multipleList, index - 1, this.multipleList[index])
        this.$set(this.multipleList, index, change)
      }
      if (type === '判断题') {
        const change = this.judgeList[index - 1]
        const obj = {}
        const text1 = 'score' + String(index - 1) + '2'
        const text2 = 'score' + String(index) + '2'
        obj[text1] = this.judgeList[index].score
        obj[text2] = change.score
        this.form.setFieldsValue(obj)
        this.$set(this.judgeList, index - 1, this.judgeList[index])
        this.$set(this.judgeList, index, change)
      }
      if (type === '填空题') {
        const change = this.fillsList[index - 1]
        const obj = {}
        const text1 = 'score' + String(index - 1) + '3'
        const text2 = 'score' + String(index) + '3'
        obj[text1] = this.fillsList[index].score
        obj[text2] = change.score
        this.form.setFieldsValue(obj)
        this.$set(this.fillsList, index - 1, this.fillsList[index])
        this.$set(this.fillsList, index, change)
      }
      if (type === '简答题') {
        const change = this.answerList[index - 1]
        const obj = {}
        const text1 = 'score' + String(index - 1) + '4'
        const text2 = 'score' + String(index) + '4'
        obj[text1] = this.answerList[index].score
        obj[text2] = change.score
        this.form.setFieldsValue(obj)
        this.$set(this.answerList, index - 1, this.answerList[index])
        this.$set(this.answerList, index, change)
      }
    },
    // 下移
    down (index, type) {
      if (type === '单选题') {
        if (index === this.singleList.length) {
          return false
        } else {
          const change = this.singleList[index]
          const obj = {}
          const text1 = 'score' + String(index) + '0'
          const text2 = 'score' + String(index + 1) + '0'
          obj[text1] = this.singleList[index + 1].score
          obj[text2] = change.score
          this.form.setFieldsValue(obj)
          this.$set(this.singleList, index, this.singleList[index + 1])
          this.$set(this.singleList, index + 1, change)
        }
      }
      if (type === '多选题') {
        if (index === this.multipleList.length) {
          return false
        } else {
          const change = this.multipleList[index]
          const obj = {}
          const text1 = 'score' + String(index) + '0'
          const text2 = 'score' + String(index + 1) + '0'
          obj[text1] = this.multipleList[index + 1].score
          obj[text2] = change.score
          this.form.setFieldsValue(obj)
          this.$set(this.multipleList, index, this.multipleList[index + 1])
          this.$set(this.multipleList, index + 1, change)
        }
      }
      if (type === '判断题') {
        if (index === this.judgeList.length) {
          return false
        } else {
          const change = this.judgeList[index]
          const obj = {}
          const text1 = 'score' + String(index) + '0'
          const text2 = 'score' + String(index + 1) + '0'
          obj[text1] = this.judgeList[index + 1].score
          obj[text2] = change.score
          this.form.setFieldsValue(obj)
          this.$set(this.judgeList, index, this.judgeList[index + 1])
          this.$set(this.judgeList, index + 1, change)
        }
      }
      if (type === '填空题') {
        if (index === this.fillsList.length) {
          return false
        } else {
          const change = this.fillsList[index]
          const obj = {}
          const text1 = 'score' + String(index) + '0'
          const text2 = 'score' + String(index + 1) + '0'
          obj[text1] = this.fillsList[index + 1].score
          obj[text2] = change.score
          this.form.setFieldsValue(obj)
          this.$set(this.fillsList, index, this.fillsList[index + 1])
          this.$set(this.fillsList, index + 1, change)
        }
      }
      if (type === '简答题') {
        if (index === this.answerList.length) {
          return false
        } else {
          const change = this.answerList[index]
          const obj = {}
          const text1 = 'score' + String(index) + '0'
          const text2 = 'score' + String(index + 1) + '0'
          obj[text1] = this.answerList[index + 1].score
          obj[text2] = change.score
          this.form.setFieldsValue(obj)
          this.$set(this.answerList, index, this.answerList[index + 1])
          this.$set(this.answerList, index + 1, change)
        }
      }
    },
    // 固定卷删除
    testdelete (index, type) {
      const self = this
      this.$confirm({
        title: '确认删除该题目吗？',
        onOk () {
          if (type === '单选题') {
            self.singleList.splice(index, 1)
            self.singleScore = 0
            self.singleList.forEach((item, index) => {
              self.singleScore = Number(self.singleScore) + Number(item.score)
            })
            const key = self.titleData.indexOf('单选题')
            if (self.singleList.length === 0 && key > -1) {
              self.titleData.splice(key, 1)
            }
          }
          if (type === '多选题') {
            self.multipleList.splice(index, 1)
            self.multipleScore = 0
            self.multipleList.forEach((item, index) => {
              self.multipleScore = Number(self.multipleScore) + Number(item.score)
            })
            const key = self.titleData.indexOf('多选题')
            if (self.multipleList.length === 0 && key > -1) {
              self.titleData.splice(key, 1)
            }
          }
          if (type === '判断题') {
            self.judgeList.splice(index, 1)
            self.judgeScore = 0
            self.judgeList.forEach((item, index) => {
              self.judgeScore = Number(self.judgeScore) + Number(item.score)
            })
            const key = self.titleData.indexOf('判断题')
            if (self.judgeList.length === 0 && key > -1) {
              self.titleData.splice(key, 1)
            }
          }
          if (type === '填空题') {
            self.fillsList.splice(index, 1)
            self.fillsScore = 0
            self.fillsList.forEach((item, index) => {
              self.fillsScore = Number(self.fillsScore) + Number(item.score)
            })
            const key = self.titleData.indexOf('填空题')
            if (self.fillsList.length === 0 && key > -1) {
              self.titleData.splice(key, 1)
            }
          }
          if (type === '简答题') {
            self.answerList.splice(index, 1)
            self.answerScore = 0
            self.answerList.forEach((item, index) => {
              self.answerScore = Number(self.answerScore) + Number(item.score)
            })
            const key = self.titleData.indexOf('简答题')
            if (self.answerList.length === 0 && key > -1) {
              self.titleData.remove('简答题')
            }
          }
          self.scoreTotal = self.answerScore + self.fillsScore + self.judgeScore + self.multipleScore + self.singleScore
        }
      })
    },
    // 打开批量设置分数
    batchPage (value) {
      this.Type = value
      this.configbatch = {
        title: '批量设置分数(' + value + ')'
      }
      this.batchvisible = true
    },
    // 批量设置分数提交
    batchSubmit (e) {
      e.preventDefault()
      this.formbatch.validateFields((err, values) => {
        if (!err) {
          if (this.Type === '单选题') {
            const obj = {}
            this.singleList.forEach((item, index) => {
              item.score = values.allScore
              const text = 'score' + index + '0'
              obj[text] = values.allScore
            })
            this.form.setFieldsValue(obj)
            this.batchvisible = false
            this.singleScore = Number(values.allScore) * this.singleList.length
          } else if (this.Type === '多选题') {
            const obj = {}
            this.multipleList.forEach((item, index) => {
              item.score = values.allScore
              const text = 'score' + index + '1'
              obj[text] = values.allScore
            })
            this.form.setFieldsValue(obj)
            this.batchvisible = false
            this.multipleScore = Number(values.allScore) * this.multipleList.length
          } else if (this.Type === '判断题') {
            const obj = {}
            this.judgeList.forEach((item, index) => {
              item.score = values.allScore
              const text = 'score' + index + '2'
              obj[text] = values.allScore
            })
            this.form.setFieldsValue(obj)

            this.batchvisible = false
            this.judgeScore = Number(values.allScore) * this.judgeList.length
          } else if (this.Type === '填空题') {
            const obj = {}
            this.fillsList.forEach((item, index) => {
              item.score = values.allScore
              const text = 'score' + index + '3'
              obj[text] = values.allScore
            })
            this.form.setFieldsValue(obj)
            this.batchvisible = false
            this.fillsScore = Number(values.allScore) * this.fillsList.length
          } else if (this.Type === '简答题') {
            const obj = {}
            this.answerList.forEach((item, index) => {
              item.score = values.allScore
              const text = 'score' + index + '4'
              obj[text] = values.allScore
            })
            this.form.setFieldsValue(obj)
            this.batchvisible = false
            this.answerScore = Number(values.allScore) * this.answerList.length
          }
          this.scoreTotal = this.answerScore + this.fillsScore + this.judgeScore + this.multipleScore + this.singleScore
        }
      })
    },
    changeAdvanced (tag) {
      if (tag) {
        this.advanced = !this.advanced
      }
      if (this.advanced) {
        this.colLayout = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }
      } else {
        this.colLayout = { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 }
      }
    }
  }
}
</script>
<style scoped>
.margin{
  margin-left: 15px;
}
.span{
  margin-left: 10px;
  margin-right: 5px;
  font-family: "Microsoft YaHei", 微软雅黑;
  font-size: 18px;
  color: #4DAAFF;
}
.up{
  color: #D9D9D9;
}
</style>
