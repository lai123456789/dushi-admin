<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" htmlType="submit" type="primary" @click="Search" @keyup.enter="Search" >搜索</a-button>
            <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true)}">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="创建人">
              <a-select :allowClear="true" :showSearch="true" v-model.trim="queryParam.inputuser">
                <a-select-option v-for="(item, key) in inputuser" :key="key" :value="item.value">{{ item.display }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="模板名称">
              <a-input v-model.trim="queryParam.temp_name" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button icon="plus" type="primary" @click="addPage">添加</a-button>
      </div>
      <s-table
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <div slot="action" slot-scope="text, record">
          <a @click="editPage(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a>更多<a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item><a @click="showModal(record)">预览</a></a-menu-item>
              <a-menu-item><a @click="copyPage(record)">复制</a></a-menu-item>
              <a-menu-item><a @click="TableDelete(record)">删除</a></a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </s-table>
      <!-- 预览 -->
      <a-drawer
        :title="config.title"
        :width="1200"
        :visible="visibleread"
        @close="visibleread=!visibleread"
      >
        <a-spin :spinning="loading">
          <a-row>
            <a-form-item>
              <a-card title="基本信息" size="small">
                <a-col :span="4" >
                  <a-form-item label="主叫号码" :label-col="{ span: 12 }" :wrapper-col="{ span:12 }"><a-input :read-only="true" class="input"/></a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="被叫号码" :label-col="{ span: 12 }" :wrapper-col="{ span:12 }"><a-input :read-only="true" class="input"/></a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="呼叫时间" :label-col="{ span: 12 }" :wrapper-col="{ span:12 }"><a-input :read-only="true" class="input"/></a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="质检员" :label-col="{ span: 12 }" :wrapper-col="{ span:12 }"><a-input :read-only="true" class="input"/></a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item label="当前得分" :label-col="{ span: 12 }" :wrapper-col="{ span:12 }"><a-input :read-only="true" class="input" :value="sum"/></a-form-item>
                </a-col>
              </a-card>
            </a-form-item>
            <div v-for="(item, key) in showingveto" :key="key + 'veto'">
              <a-form-item>
                <a-card title="一票否决" size="small">
                  <a-form-item v-for="(items, string, keys) in item.list" :key="keys">
                    <a-row :gutter="16">
                      <a-col :span="16">
                        <a-form-item :label="keys + 1" :label-col="{ span: 2 }" :wrapper-col="{ span:22 }">
                          <a-col :span="1">
                            <a-tooltip>
                              <template slot="title">
                                {{ items.name }}
                              </template>
                              <a-icon type="question-circle" />
                            </a-tooltip>
                          </a-col>
                          <a-col :span="23"><a-input class="input" :read-only="true" :value="items.name"/></a-col>
                        </a-form-item>
                      </a-col>
                      <a-col :span="1">
                        <a-checkbox @change="vetochange($event, keys)">
                        </a-checkbox>
                        <div>
                          <a-modal v-model="visibleVetoCheck[keys]" title="备注" @ok="handleOk($event, keys)">
                            <a-textarea
                              :auto-size="{ minRows: 10, maxRows: 10 }"
                              v-model="item.list[string].remark"
                            />
                          </a-modal>
                        </div>
                      </a-col>
                      <a-col :span="7">
                        <a-form-item label="备注" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                          <a-textarea
                            :auto-size="{ minRows: 3, maxRows: 5 }"
                            v-model="item.list[string].remark"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-form-item>
                </a-card>
              </a-form-item>
            </div>
            <div v-for="(value, index) in showing" :key="index" >
              <a-form-item>
                <a-card :title="value.name" size="small">
                  <a-form-item v-for="(item, timestamp1, index2) in value.list" :key="index2" >
                    <a-col :span="14">
                      <a-form-item :label="index2 + 1" :label-col="{ span: 2 }" :wrapper-col="{ span: 21 }">
                        <a-col :span="1">
                          <a-tooltip>
                            <template slot="title">
                              <div v-html="item.remark">
                                {{ item.remark }}
                              </div>
                            </template>
                            <a-icon type="question-circle" />
                          </a-tooltip>
                        </a-col>
                        <a-col :span="22"><a-input class="input" :read-only="true" :value="item.name"/></a-col>
                      </a-form-item>
                    </a-col>
                    <a-col :span="3">
                      <a-form-item label="分数" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                        <a-select :default-value="item.scoreall[0]" style="width:80px">
                          <a-select-option v-for="(values, indexs) in item.scoreall" :value="values" :key="indexs">
                            {{ values }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="7">
                      <a-form-item label="备注" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
                        <a-textarea
                          :auto-size="{ minRows: 3, maxRows: 5 }"
                          v-model="item.remarks"
                        />
                      </a-form-item>
                    </a-col>
                  </a-form-item>
                </a-card>
              </a-form-item>
            </div>
            <a-form-item>
              <a-card title="综合评语" size="small">
                <a-row>
                  <a-col :span="5">
                    <a-form-item label="优秀案例" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                      <a-switch
                        checked-children="是"
                        un-checked-children="否"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="5">
                    <a-form-item label="无效数据" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
                      <a-switch
                        checked-children="是"
                        un-checked-children="否"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="综合评语:">
                  <a-textarea :auto-size="{ minRows: 3, maxRows: 5 }"></a-textarea>
                </a-form-item>
              </a-card>
            </a-form-item>
          </a-row>
        </a-spin>
      </a-drawer>
      <!-- 添加编辑复制 -->
      <a-drawer
        :title="config.title"
        :width="1200"
        :visible="visible"
        :destroyOnClose="true"
        @close="visible=!visible"
      >
        <a-spin :spinning="loading">
          <a-form :form="form" layout="vertical" @submit="handleSubmit">
            <a-form-item label="模板名称">
              <a-input v-decorator="['info[templatename]', { initialValue: config.action === 'copy' ? '' : setting.template_name, rules: [{ required: true, message: '请输入模板名称' }]}]" @change="editcheck($event)"/>
            </a-form-item>
            <a-alert type="error" :message="tip" banner v-if="tip"/>
            <a-form-item label="一票否决项">
              <a-form-item v-show="false">
                <a-input v-decorator="['info[itemsname_' + nowtime + ']', { initialValue:' '}]"/>
              </a-form-item>
              <a-form-item v-show="false">
                <a-input v-decorator="['info[itemstype_' + nowtime + ']', { initialValue: 1 }]"/>
              </a-form-item>
              <a-form-item v-show="false">
                <a-input v-decorator="['info[itemsscore_' + nowtime + ']', { initialValue: 0 }]"/>
              </a-form-item>
              <div
                v-for="(item, index) in vetoinput"
                :key="index"
                :index="index">
                <div v-for="(items, indexs) in item.list" :key="indexs" >
                  <a-form-item :validateStatus="items.status" :help="items.help" :required="true">
                    <a-row type="flex" align="middle">
                      <a-col :span="21">
                        <a-input
                          :ref="'itemslistname_' + nowtime + '_' + (lasttime + indexs)"
                          v-model="items.name"
                          @change="(e) => { inputChange('veto', e, index, indexs) }"
                        />
                      </a-col>
                      <a-col :span="1"></a-col>
                      <a-col :span="1">
                        <a-icon :style="{ fontSize: '26px', color: '#52c41a' }" type="plus-square" theme="filled" @click="addvetoinput(indexs)" />
                      </a-col>
                      <a-col :span="1">
                        <a-icon :style="{ fontSize: '26px', color: '#ff4d4f' }" type="minus-square" theme="filled" @click="deletevetoinput(indexs)" />
                      </a-col>
                    </a-row>
                  </a-form-item>
                  <a-form-item v-show="false">
                    <a-input v-decorator="['info[itemslistscore_' + nowtime + '_' + (lasttime + indexs) + ']', { initialValue:' ' }]" />
                  </a-form-item>
                  <a-form-item v-show="false">
                    <a-input v-decorator="['info[itemslistremark_' + nowtime + '_' + (lasttime + indexs) + ']', { initialValue:' ' }]" />
                  </a-form-item>
                </div>
              </div>
            </a-form-item>
            <a-form-item>
              <a-card title="评分项" size="small">
                <a-form-item v-for="(item, index1) in scoring" :key="index1">
                  <a-row type="flex" align="middle">
                    <a-col :span="21">
                      <a-card>
                        <a-form-item v-show="false">
                          <a-input v-decorator="['info[itemstype_'+ (lasttime + index1) +']', { initialValue: 0 }]"/>
                        </a-form-item>
                        <a-form-item>
                          <a-col :span="18">
                            <a-form-item :label="config.action === 'add' ? '分类名称' : '评分大类'" :validateStatus="item.status" :help="item.help" :required="true">
                              <a-input
                                :ref="'itemsname_' + (lasttime + index1)"
                                v-model="item.name"
                                @change="(e) => { inputChange('bigname', e, index1) }"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="1">
                          </a-col>
                          <a-col :span="5">
                            <a-form-item :label="config.action === 'add' ? '总分' : '大类总分'">
                              <a-input
                                v-model="item.score"
                                :ref="'itemsscore_' + (lasttime + index1)"
                                :read-only="true"
                                class="input"
                              />
                            </a-form-item>
                          </a-col>
                        </a-form-item>
                        <div>
                          <a-form-item v-for="(value, option) in item.list" :key="option">
                            <a-row type="flex" align="middle">
                              <a-col :span="8">
                                <a-form-item label="评分项" :validateStatus="value.namestatus" :help="value.namehelp" :required="true">
                                  <a-input
                                    v-model="value.name"
                                    :ref="'itemslistname_' + (lasttime + index1) + '_' + (lasttime + index1 + option + option + 2)"
                                    @change="(e) => { inputChange('smallname', e, index1, option) }"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="4">
                              </a-col>
                              <a-col :span="5">
                                <a-form-item :label="config.action === 'add' ? '分数设置' : '单项分值'" :validateStatus="value.scorestatus" :help="value.scorehelp" :required="true">
                                  <a-input
                                    v-model="value.score"
                                    :ref="'itemslistscore_' + (lasttime + index1) + '_' + (lasttime + index1 + option + option + 2)"
                                    @blur="getScore(index1, option, $event)"
                                    placeholder="10|5|0"
                                    @change="(e) => { inputChange('scoreSetting', e, index1, option) }"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="20">
                                <a-form-item label="细则备注" :validateStatus="value.remarkstatus" :help="value.remarkhelp" :required="true">
                                  <a-textarea
                                    :auto-size="{ minRows: 3, maxRows: 5 }"
                                    v-model="value.remark"
                                    :ref="'itemslistremark_' + (lasttime + index1) + '_' + (lasttime + index1 + option + option + 2)"
                                    @change="(e) => { inputChange('remark', e, index1, option) }"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="1">
                              </a-col>
                              <a-col :span="1">
                                <a-icon :style="{ fontSize: '26px', color: '#52c41a' }" type="plus-square" theme="filled" @click="addmarking(index1, option)" />
                              </a-col>
                              <a-col :span="1">
                                <a-icon :style="{ fontSize: '26px', color: '#ff4d4f' }" type="minus-square" theme="filled" @click="deletemark(index1, option)" />
                              </a-col>
                            </a-row>
                          </a-form-item>
                        </div>
                      </a-card>
                    </a-col>
                    <a-col :span="1">
                    </a-col>
                    <a-col :span="1">
                      <a-icon :style="{ fontSize: '26px', color: '#52c41a' }" type="plus-square" theme="filled" @click="addscoring(index1)" />
                    </a-col>
                    <a-col :span="1">
                      <a-icon :style="{ fontSize: '26px', color: '#ff4d4f' }" type="minus-square" theme="filled" @click="deletescore(index1)"/>
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-card>
            </a-form-item>
            <a-form-item>
              <a-card title="合格条件" size="small">
                <a-form-item label="质检总分">
                  <a-col :span="3">
                    <a-select v-decorator="['info[pass_type]', { initialValue:setting.pass_type }]">
                      <a-select-option value=">=">大于等于</a-select-option>
                      <a-select-option value=">">大于</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="3"><a-input-number :min="1" :max="100" v-model="setting.pass_score" /></a-col>
                </a-form-item>
                <a-form-item label="单项得分">
                  <a-col :span="3">
                    <a-select v-decorator="['info[pass_type2]', {initialValue:setting.pass_type2}]">
                      <a-select-option value=">=">大于等于</a-select-option>
                      <a-select-option value=">">大于</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="3"><a-input-number :min="0" :max="100" v-model="setting.pass_score2" /></a-col>
                </a-form-item>
              </a-card>
            </a-form-item>
          </a-form>
          <div class="bbar">
            <a-button type="primary" html-type="submit" @click="handleSubmit">{{ config.action==='edit'?'修改':'保存' }}</a-button>
            <a-button @click="visible=!visible">关闭</a-button>
          </div>
        </a-spin>
      </a-drawer>
    </a-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      advanced: false,
      visibleread: false,
      visibleVetoCheck: [false, false, false, false, false, false, false, false, false, false],
      score: 10,
      sum: 0,
      tip: '',
      sumstay: '',
      scoring: [{
        type: '0',
        name: '',
        score: '10',
        list: [{
          name: '',
          score: '10|5|0',
          remark: ''
        }]
      }],
      // 搜索参数
      queryParam: {
        inputuser: undefined
      },
      form: this.$form.createForm(this),
      config: {
        data: {}
      },
      selectedRowKeys: [],
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
        }
      },
      inputuser: [],
      colLayout: {},
      length: '',
      lasttime: '0',
      setting: {},
      showing: {},
      showingveto: {},
      nowtime: '',
      page: [],
      template_name: '',
      vetoinput: [{
        type: '0',
        name: '',
        score: '0',
        list: [{
          name: ''
        }]
      }],
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 120,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 60,
        sorter: true
      }, {
        title: '模板名称',
        dataIndex: 'template_name',
        sorter: true
      }, {
        title: '创建人',
        dataIndex: 'inputuser',
        sorter: true
      }, {
        title: '总分',
        dataIndex: 'total_score',
        sorter: true
      }, {
        title: '创建时间',
        dataIndex: 'inputtime',
        sorter: true
      }]
    }
  },
  created () {
    this.changeAdvanced(false)
  },
  watch: {
    setting () {
      this.lasttime = new Date().getTime()
    }
  },
  mounted () {
    this.getUserName()
  },
  methods: {
    // 添加一票否定项
    addvetoinput (index) {
      this.color = 'red'
      this.vetoinput[0].list.splice(index + 1, 0, { name: '' })
    },
    // 删除一票否决项
    deletevetoinput (index) {
      if (this.vetoinput[0].list.length === 1) {
        return false
      } else {
        this.vetoinput[0].list.splice(index, 1)
      }
    },
    // 添加整个评分大类
    addscoring (index) {
      this.scoring.splice(index + 1, 0, {
        type: '1',
        name: '',
        score: '10',
        list: [{
          name: '',
          score: '10|5|0',
          remark: ''
        }]
      })
    },
    // 删除整个评分大类
    deletescore (index) {
      if (this.scoring.length === 1) {
        return false
      } else {
        this.scoring.splice(index, 1)
      }
    },
    // 添加单个评分项
    addmarking (index1, option) {
      this.scoring[index1].score = Number(this.scoring[index1].score) + 10
      this.scoring[index1].list.splice(option + 1, 0, {
        name: '',
        score: '10|5|0',
        remark: ''
      })
    },
    // 删除单个评分项
    deletemark (index1, option) {
      if (this.scoring[index1].list.length === 1) {
        return false
      } else {
        this.scoring[index1].score = this.scoring[index1].score - 10
        this.scoring[index1].list.splice(option, 1)
      }
    },
    // 页面数据渲染
    loadDataTable (parameter) {
      this.page = parameter
      return this.axios({
        url: '/quality/template/init',
        params: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.length = res.result.totalCount
        this.nowtime = res.timestamp
        return res.result
      })
    },
    // 获取用户信息
    getUserName () {
      return this.axios({
        url: '/quality/data/getUsername',
        params: {}
      }).then(res => {
        this.inputuser = res.result.data
        return res.result
      })
    },
    // 总分变化
    getScore (index0, index, e) {
      this.scoring[index0].score = 0
      this.scoring[index0].list[index].score = e.target.value
      for (const j in this.scoring[index0].list) {
        const change = this.scoring[index0].list[j].score
        const test = change.split('|')
        this.scoring[index0].score = this.scoring[index0].score + Number(test[0])
      }
    },
    // 编辑时确认模板名称是否重复
    editcheck (e) {
      if (e.target.value === this.template_name) {
        this.tip = ''
      } else {
        this.checknamefun('', e.target.value)
      }
    },
    // 搜索
    Search () {
      const table = this.$refs.table
      table.refresh()
    },
    // 模板名称核对
    checknamefun (rule, value, callback) {
      return this.axios({
        url: '/quality/template/checkName',
        data: { template_name: value }
      }).then(res => {
        this.tip = res.message
      })
    },
    // 输入时表单验证
    inputChange (type, e, index, indexs) {
      const value = e.target.value
      if (type === 'veto') {
        if (!value) {
          this.vetoinput[index].list[indexs].status = 'error'
          this.vetoinput[index].list[indexs].help = '请输入一票否决项'
        } else {
          this.vetoinput[index].list[indexs].status = 'success'
          this.vetoinput[index].list[indexs].help = ''
        }
      } else if (type === 'bigname') {
        if (!value) {
          this.scoring[index].status = 'error'
          this.scoring[index].help = '请输入分类名称'
        } else {
          this.scoring[index].status = 'success'
          this.scoring[index].help = ''
        }
      } else if (type === 'smallname') {
        if (!value) {
          this.scoring[index].list[indexs].namestatus = 'error'
          this.scoring[index].list[indexs].namehelp = '请输入评分项'
        } else {
          this.scoring[index].list[indexs].namestatus = 'success'
          this.scoring[index].list[indexs].namehelp = ''
        }
      } else if (type === 'scoreSetting') {
        if (!value) {
          this.scoring[index].list[indexs].scorestatus = 'error'
          this.scoring[index].list[indexs].scorehelp = '请输入分数设置'
        } else {
          this.scoring[index].list[indexs].scorestatus = 'success'
          this.scoring[index].list[indexs].scorehelp = ''
        }
      } else if (type === 'remark') {
        if (!value) {
          this.scoring[index].list[indexs].remarkstatus = 'error'
          this.scoring[index].list[indexs].remarkhelp = '请输入细则备注'
        } else {
          this.scoring[index].list[indexs].remarkstatus = 'success'
          this.scoring[index].list[indexs].remarkhelp = ''
        }
      }
    },
    // 打开添加抽屉
    addPage () {
      this.scoring = [{
        type: '0',
        name: '',
        score: '10',
        list: [{
          name: '',
          score: '10|5|0',
          remark: ''
        }]
      }]
      this.vetoinput = [{
        type: '0',
        name: '',
        score: '0',
        list: [{
          name: ''
        }]
      }]
      this.visible = true
      this.config = {
        action: 'add',
        title: '添加',
        url: '/quality/template/add',
        data: {}
      }
      this.setting = {
        template_name: '',
        pass_type: '>=',
        pass_type2: '>=',
        pass_score: 60,
        pass_score2: 3
      }
    },
    // 一票否决项备注窗口弹出
    vetochange (e, index) {
      if (e.target.checked === false) {
        this.visibleVetoCheck.splice(index, 1, false)
      } else {
        this.visibleVetoCheck.splice(index, 1, true)
      }
      if (e.target.checked === true) {
        this.sum = 0
      } else {
        this.sum = this.sumstay
      }
    },
    // 关闭一票否决项备注窗口
    handleOk (e, value) {
      this.visibleVetoCheck.splice(value, 1, false)
    },
    // 数据提交
    handleSubmit (value) {
      value.preventDefault()
      const table = this.$refs.table
      const id = this.config.id
      this.form.validateFields((err, values) => {
        const info = values.info
        info['pass_score'] = this.setting['pass_score']
        info['pass_score2'] = this.setting['pass_score2']
        delete this.$refs.table
        for (const i in this.$refs) {
          if (this.$refs[i] instanceof Array && this.$refs[i].length === 0) {
            delete this.$refs.i
          } else {
            values.info[i] = this.$refs[i]['0'].value
          }
        }
        this.$refs['table'] = table
        for (const i in this.vetoinput[0].list) {
          if (!this.vetoinput[0].list[i].name) {
            this.$set(this.vetoinput[0].list[i], 'status', 'error')
            this.$set(this.vetoinput[0].list[i], 'help', '请输入一票否决项')
          } else {
            this.$set(this.vetoinput[0].list[i], 'status', 'success')
            this.$set(this.vetoinput[0].list[i], 'help', '')
          }
        }
        for (const i in this.scoring) {
          if (!this.scoring[i].name) {
            this.$set(this.scoring[i], 'status', 'error')
            this.$set(this.scoring[i], 'help', '请输入分类名称')
          } else {
            this.$set(this.scoring[i], 'status', 'success')
            this.$set(this.scoring[i], 'help', '')
          }
          for (const j in this.scoring[i].list) {
            if (!this.scoring[i].list[j].name) {
              this.$set(this.scoring[i].list[j], 'namestatus', 'error')
              this.$set(this.scoring[i].list[j], 'namehelp', '请输入评分项')
            } else {
              this.$set(this.scoring[i].list[j], 'namestatus', 'success')
              this.$set(this.scoring[i].list[j], 'namehelp', '')
            }
            if (!this.scoring[i].list[j].score) {
              this.$set(this.scoring[i].list[j], 'scorestatus', 'error')
              this.$set(this.scoring[i].list[j], 'scorehelp', '请输入分数设置')
            } else {
              this.$set(this.scoring[i].list[j], 'scorestatus', 'success')
              this.$set(this.scoring[i].list[j], 'scorehelp', '')
            }
            if (!this.scoring[i].list[j].remark) {
              this.$set(this.scoring[i].list[j], 'remarkstatus', 'error')
              this.$set(this.scoring[i].list[j], 'remarkhelp', '请输入细则备注')
            } else {
              this.$set(this.scoring[i].list[j], 'remarkstatus', 'success')
              this.$set(this.scoring[i].list[j], 'remarkhelp', '')
            }
          }
        }
        const test = JSON.stringify(this.vetoinput)
        const test2 = JSON.stringify(this.scoring)
        const flag1 = test.indexOf('error') === -1
        const flag2 = test2.indexOf('error') === -1
        if (!flag1 || !flag2 || this.tip) {
          return false
        }
        if (!err) {
          if (this.config.action === 'edit') {
            values['id'] = id
            this.axios({
              url: '/quality/template/edit',
              data: values
            }).then(res => {
              this.visible = false
              this.loading = false
              this.$message.success('修改成功')
              table.refresh()
              this.$refs = {}
              this.$refs['table'] = table
            })
          } else {
            this.axios({
              url: '/quality/template/add',
              data: values
            }).then((res) => {
              this.visible = false
              this.loading = false
              this.$message.success('添加成功')
              table.refresh()
              this.$refs = {}
              this.$refs['table'] = table
            })
          }
        }
      })
    },
    // 编辑页面开启以及对应数据
    editPage (record) {
      this.template_name = record.template_name
      this.visible = true
      const id = record && record.id || this.selectedRowKeys
      this.tip = ''
      this.config = {
        id: id,
        action: 'edit',
        title: '编辑',
        url: '/quality/template/edit',
        data: {}
      }
      this.setting = record
      const changesetting = JSON.parse(record.setting)
      const showdata = []
      for (const i in changesetting.template_data) {
        showdata.push(changesetting.template_data[i])
      }
      const vetoinputchange = showdata.slice(0, 1)
      this.vetoinput[0].list = []
      for (const i in vetoinputchange[0].list) {
        this.vetoinput[0].list.push(vetoinputchange[0].list[i])
      }
      this.scoring = showdata.slice(1)
      this.scoring.forEach(item => {
        const arr = []
        for (const key in item.list) {
          arr.push(item.list[key])
        }
        item.list = arr
      })
      for (let i = 0; i < this.scoring.length; i++) {
        for (const j in this.scoring[i].list) {
          this.scoring[i].list[j].remark = this.scoring[i].list[j].remark.replace(/<br\/>/g, '\n')
        }
      }
      this.loading = false
    },
    // 复制页面开启以及对应数据显示
    copyPage (record) {
      this.visible = true
      this.config = {
        action: 'copy',
        title: '复制',
        url: '',
        data: {}
      }
      this.setting = record
      const changesetting = JSON.parse(record.setting)
      const showdata = []
      for (const i in changesetting.template_data) {
        showdata.push(changesetting.template_data[i])
      }
      const vetoinputchange = showdata.slice(0, 1)
      this.vetoinput[0].list = []
      for (const i in vetoinputchange[0].list) {
        this.vetoinput[0].list.push(vetoinputchange[0].list[i])
      }
      this.scoring = showdata.slice(1)
      this.scoring.forEach(item => {
        const arr = []
        for (const key in item.list) {
          arr.push(item.list[key])
        }
        item.list = arr
      })
      for (let i = 0; i < this.scoring.length; i++) {
        for (const j in this.scoring[i].list) {
          this.scoring[i].list[j].remark = this.scoring[i].list[j].remark.replace(/<br\/>/g, '\n')
        }
      }
      this.loading = false
    },
    // 删除数据
    TableDelete (record) {
      const table = this.$refs.table
      const id = record && record.id || this.selectedRowKeys
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          self.axios({
            url: '/quality/template/delete',
            data: { id: id }
          }).then(res => {
            self.$message.success('删除成功')
            table.refresh()
          })
        }
      })
    },
    // 预览信息对话框显示
    showModal (record) {
      this.showing = {}
      this.showingveto = {}
      this.visibleread = true
      const id = record && record.id || this.selectedRowKeys
      this.sum = record.total_score
      this.sumstay = record.total_score
      this.config = {
        id: id,
        action: 'check',
        title: '预览信息',
        url: '/quality/template/public_preview',
        data: {}
      }
      const changesetting = JSON.parse(record.setting)
      const showdata = []
      for (const i in changesetting.template_data) {
        showdata.push(changesetting.template_data[i])
      }
      this.showingveto[0] = showdata[0]
      for (let i = 1; i < showdata.length; i++) {
        this.showing[i] = showdata[i]
      }
      for (const i in this.showing) {
        for (const j in this.showing[i].list) {
          this.showing[i].list[j]['scoreall'] = []
          if (this.showing[i].list[j].score) {
            this.showing[i].list[j]['scoreall'] = this.showing[i].list[j].score.split('|')
          }
        }
      }
      this.loading = false
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
    },
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
<style scoped>
.active{
  color:#D1D1D1
}
.input{
  background-color: #F5F5F5
}
</style>
