<template>
  <div>
    <a-card class="table-search" :bordered="false">
      <a-form :layout="advanced ? 'vertical' : 'inline'" :class="advanced ? 'advanced' : 'normal'">
        <div class="head">
          <a-space style="margin-left: 8px">
            <a-button icon="search" type="primary" @click="bankSearch" @keyup.enter="bankSearch" >搜索</a-button>
            <a-button icon="sync" @click="() => { queryParam = {}, $refs.table.refresh(true) }">重置</a-button>
          </a-space>
        </div>
        <a-row :gutter="16">
          <a-col v-bind="colLayout">
            <a-form-item label="题库名称">
              <a-input v-model.trim="queryParam.subject"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="创建人">
              <a-input v-model.trim="queryParam.inputuser"/>
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="创建时间">
              <a-range-picker
                v-model="queryParam.inputshowtime"
                @change="getinputtime"
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
        <a-button v-action:add icon="plus" type="primary" @click="handleAdd">添加</a-button>
      </div>
      <s-table
        ref="table"
        rowKey="id"
        :columns="columns"
        :data="loadDataTable"
        size="small"
        :sorter="{ field: 'id', order: 'descend' }"
      >
        <span slot="subject" slot-scope="text, record" >
          <template v-if="!record.namestatus">
            <span>
              {{ record.subject }}
            </span>
          </template>
          <template v-else>
            <a-form :form="form">
              <a-form-item>
                <a-input size="small" v-decorator="['info[subject]', { initialValue: record.subject, rules: [{ required: true, message: '请输入题库名称' },{ max: 20, message: '题库名称不得大于20个字符' },{validator: checkName}]}]"/>
              </a-form-item>
            </a-form>
          </template>
        </span>
        <div slot="action" slot-scope="text, record, index">
          <a @click="setting(record)">题目设置</a>
          <a-divider type="vertical" />
          <a @click="edit(record, index)">
            <span v-if="!record.namestatus">编辑</span>
            <span v-else>保存</span>
          </a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
        </div>
      </s-table>
    </a-card>
    <bank-set ref="questionbankSet" @ok="refresh"/>
  </div>
</template>
<script>
export default {
  components: {
    BankSet: () => import('./QuestionbankSet')
  },
  data () {
    return {
      advanced: false,
      // 搜索参数
      queryParam: {},
      dataSource: [],
      colLayout: { xs: 24, sm: 24, md: 12, lg: 12, xl: 8, xxl: 6 },
      form: this.$form.createForm(this),
      titleArray: [],
      // 表头
      columns: [{
        title: '操作',
        dataIndex: 'action',
        width: 200,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }, {
        title: 'ID',
        dataIndex: 'id',
        width: 40,
        sorter: true
      }, {
        title: '题库名称',
        dataIndex: 'subject',
        width: 250,
        scopedSlots: { customRender: 'subject' }
      }, {
        title: '试题数',
        dataIndex: 'questionTotal'
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
      }],
      keyword: 0,
      editable: 0
    }
  },
  methods: {
    // 数据渲染
    loadDataTable (parameter) {
      return this.axios({
        url: 'exam/Subject/init',
        data: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.titleArray = []
        res.result.data.forEach(item => {
          item.namestatus = false
          this.titleArray.push(item.subject)
          item.questionTotal = Number(item.answer) + Number(item.fills) + Number(item.judge) + Number(item.multiple) + Number(item.single)
        })
        if (res.result.data.length > 0) {
          res.result.data[0].namestatus = this.keyword === 1
          this.keyword = 0
        }
        return res.result
      })
    },
    checkName (rule, value, callback) {
      const string = '题库名称重复'
      if (this.titleArray.includes(value)) {
        callback(string)
      }
      callback()
    },
    // 题目管理页面
    setting (record) {
      this.$refs.questionbankSet.show({
        data: record,
        title: '题目管理'
      })
    },
    // 数据添加
    handleAdd () {
      const table = this.$refs.table
      const newData = {
        action: 'add',
        id: '',
        info: {
          subject: '未命名' + (new Date()).getTime(),
          remarks: ''
        }
      }
      this.axios({
        url: 'exam/Subject/action',
        data: newData
      }).then((res) => {
        table.refresh()
        this.keyword = 1
      })
    },
    // 搜索
    bankSearch () {
      const table = this.$refs.table
      table.refresh()
    },
    // 删除数据
    handleDelete (record) {
      const id = record && record.id || this.selectedRowKeys
      const self = this
      this.$confirm({
        title: record ? '您确认要删除该记录吗？' : '您确认要删除选中的记录吗？',
        onOk () {
          const table = self.$refs.table
          self.axios({
            url: 'exam/Subject/action',
            data: { id: id, action: 'delete' }
          }).then(res => {
            self.$message.success('删除成功')
            table.refresh()
          })
        }
      })
    },
    // 修改当行
    edit (record, key) {
      if (record.subject === this.titleArray[key]) {
        this.titleArray.splice(key, 1)
      }
      if (this.editable === 1 && !record.namestatus) {
        return false
      }
      if (record.namestatus) {
        this.form.validateFields((err, values) => {
          if (!err) {
            record.subject = values.info.subject
            record.namestatus = !record.namestatus
            if (!record.namestatus) {
              const values = {
                action: 'edit',
                id: record.id,
                info: {
                  subject: record.subject,
                  remarks: record.remarks
                }
              }
              this.axios({
                url: 'exam/Subject/action',
                data: values
              }).then(res => {
                this.editable = 0
                this.refresh()
                this.$message.success('操作成功')
              })
            }
          }
        })
      } else {
        record.namestatus = !record.namestatus
        this.editable = 1
      }
    },
    getinputtime (date, dateString) {
      this.queryParam.inputtime = dateString[0] ? dateString : null
      this.queryParam.inputshowtime = date
    },
    refresh () {
      this.$refs.table.refresh()
    }
  }
}
</script>
