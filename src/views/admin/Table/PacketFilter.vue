<template>
  <div>
    <a-alert :message="message" type="info" show-icon />
    <a-divider orientation="left">进行中</a-divider>
    <a-row :gutter="[0, 8]">
      <a-col :span="24">
        <a-space>
          <a-button @click="handleAdd('proceed')">添加</a-button>
          <a-button @click="handleSort('proceed')">排序</a-button>
        </a-space>
      </a-col>
      <a-col :span="24">
        <a-table
          ref="table"
          size="small"
          rowKey="value"
          :columns="columns"
          :pagination="false"
          :dataSource="proceed"
          :sorter="{ field: 'id', order: 'descend' }"
        >
          <div slot="enable" slot-scope="text,record">
            <a-switch size="small" :checked="record.enable === '1'" @change="(e)=>{ enableChange(e, record, 'proceed') }" />
          </div>
          <div slot="action" slot-scope="text, record, index">
            <a @click="handleAdd('proceed',record,index)" v-if="record.searchType === 'custom'">编辑</a>
            <a-divider type="vertical" v-if="record.searchType === 'custom'"/>
            <a @click="handleSearchPriv(record, index)">
              <a-badge status="success" v-if="record.searchPriv"/>
              <a-badge status="default" v-else/>
              授权</a>
            <a-divider type="vertical" />
            <a @click="copyPrivShow(record, 'proceed')">复制权限给</a>
          </div>
        </a-table>
      </a-col>
    </a-row>
    <a-row :gutter="[0, 8]">
      <a-divider orientation="left">已结束</a-divider>
      <a-col :span="24">
        <a-space>
          <a-button @click="handleAdd('finish')">添加</a-button>
          <a-button @click="handleSort('finish')">排序</a-button>
        </a-space>
      </a-col>
      <a-col :span="24">
        <a-table
          ref="finishTable"
          size="small"
          rowKey="value"
          :columns="columns"
          :pagination="false"
          :dataSource="finish"
          :sorter="{ field: 'id', order: 'descend' }"
        >
          <div slot="enable" slot-scope="text,record">
            <a-switch size="small" :checked="record.enable === '1'" @change="(e)=> { enableChange(e, record, 'finish') }" />
          </div>
          <div slot="action" slot-scope="text, record, index">
            <a @click="handleAdd('finish',record,index)" v-if="record.searchType === 'custom'">编辑</a>
            <a-divider type="vertical" v-if="record.searchType === 'custom'"/>
            <a @click="handleSearchPriv(record, index)">
              <a-badge status="success" v-if="record.searchPriv"/>
              <a-badge status="default" v-else/>
              授权</a>
            <a-divider type="vertical" />
            <a @click="copyPrivShow(record, 'finish')">复制权限给</a>
          </div>
        </a-table>
      </a-col>
    </a-row>
    <flow-attr-transition-sort ref="flowAttrTransitionSort" @ok="getSort"/>
    <priv-visit-form ref="privVisitForm" :params="privData" @func="getPrivs"/>
    <a-modal
      v-model="visibleCopy"
      title="复制权限给"
      @ok="getCopy"
      @cancel="visibleCopy = !visibleCopy">
      <div :style="{ borderBottom: '1px solid #E9E9E9',marginBottom: '8px' }">
        <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">全选</a-checkbox>
      </div>
      <a-checkbox-group v-model="copyCheck" @change="onChange">
        <a-row :gutter="[8,8]">
          <a-col :span="6" v-for="data in plainOptions" :key="data.value">
            <a-checkbox :value="data.value">{{ data.label }}</a-checkbox>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </a-modal>
    <a-drawer
      :destroyOnClose="true"
      :title="configDrawer.title"
      :width="800"
      :visible="visibleDrawer"
      @close="visibleDrawer = !visibleDrawer"
    >
      <a-spin :spinning="lodingDrawer">
        <a-form :form="form">
          <a-form-item label="按钮名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[name]', {initialValue: configDrawer.record ? configDrawer.record.name : '', rules: [{ required: true, message: '请输入按钮名称'}]}]" />
          </a-form-item>
          <a-form-item label="按钮value值" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['info[value]', {initialValue: configDrawer.record ? configDrawer.record.value:'', rules: [{ required: true, message: '请输入按钮value值'}]}]" />
          </a-form-item>
          <a-form-item label="自定义帮助" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[help]', {initialValue: configDrawer.record ? configDrawer.record.help : ''}]" />
          </a-form-item>
          <a-form-item label="启用禁用" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select v-decorator="['info[enable]', {initialValue: configDrawer.record ? configDrawer.record.enable : '1'}]">
              <a-select-option value="1">启用</a-select-option>
              <a-select-option value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 2, maxRows: 6 }" v-decorator="['info[remark]', {initialValue: configDrawer.record ? configDrawer.record.remark : ''}]" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="visibleDrawer= !visibleDrawer">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
export default {
  components: {
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    PrivVisitForm: () => import('./PrivVisitForm')
  },
  props: {
    config: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      visible: false,
      loading: false,
      lodingDrawer: false,
      visibleCopy: false,
      visibleDrawer: false,
      form: this.$form.createForm(this),
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      message: '',
      privData: {},
      copyCheck: [],
      plainOptions: [{}],
      copyType: '',
      indeterminate: false,
      checkAll: false,
      configDrawer: {},
      typeDrawer: '',
      columns: [{
        title: '#',
        width: 40,
        align: 'center',
        customRender: (text, record, index) => {
          return index + 1
        }
      }, {
        title: '按钮名称',
        dataIndex: 'name',
        width: 100
      }, {
        title: '自定义名称',
        dataIndex: 'customName',
        width: 100,
        scopedSlots: { customRender: 'customName' }
      }, {
        title: '自定义帮助',
        dataIndex: 'help',
        scopedSlots: { customRender: 'help' }
      }, {
        title: '启用',
        dataIndex: 'enable',
        scopedSlots: { customRender: 'enable' }
      }, {
        title: '备注',
        dataIndex: 'remark'
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        align: 'center',
        scopedSlots: { customRender: 'action' }
      }],
      proceed: [{
        name: '我的待办',
        value: 'my_process',
        enable: '1',
        customName: '',
        remark: '独享待办 + 共享待办',
        help: '独享待办 + 共享待办'
      }, {
        name: '独享待办',
        value: 'only_process',
        enable: '1',
        customName: '',
        remark: '仅由我待办的流程',
        help: '仅由我待办的流程'
      }, {
        name: '共享待办',
        value: 'public_process',
        enable: '1',
        customName: '',
        remark: '包含我，但不仅由我的待办流程',
        help: '包含我，但不仅由我的待办流程'
      }, {
        name: '我的已办',
        value: 'my_handle',
        enable: '1',
        customName: '',
        remark: '我已办的流程',
        help: '我已办的流程'
      }, {
        name: '我的发起',
        value: 'my_create',
        enable: '1',
        customName: '',
        remark: '我发起的流程',
        help: '我发起的流程'
      }, {
        name: '所有进行中',
        value: 'all_flow',
        enable: '1',
        customName: '',
        remark: '所有进行中的流程',
        help: '所有进行中的流程'
      }, {
        name: '所有待办',
        value: 'all_process',
        enable: '1',
        customName: '',
        remark: '所有进行中的待办流程',
        help: '所有进行中的待办流程'
      }],
      finish: [{
        name: '我的已办',
        value: 'my_handle',
        enable: '1',
        customName: '',
        remark: '我已办的流程',
        help: '我已办的流程'
      }, {
        name: '我的发起',
        value: 'my_create',
        enable: '1',
        customName: '',
        remark: '我发起的流程',
        help: '我发起的流程'
      }, {
        name: '所有已结束',
        value: 'all_flow',
        enable: '1',
        customName: '',
        remark: '所有已结束的流程',
        help: '所有已结束的流程'
      }]
    }
  },
  mounted () {
    let finishArray = []
    let proceedArray = []
    this.message = (<div>
      <div>1）自定义名称、自定义帮助读取流程管理处的全局配置，不可自定义修改。分组按钮排序默认读取全局配置，可自定义修改。可自定义添加分组按钮。</div>
      <div>2）《进行中》、《已结束》是2个不同的模块，用2个tab页展示。单个模块下至少需要开启1个筛选按钮。单个模块下默认加载排序在最前面的筛选按钮内容。</div>
      <div>3）【授权】控制《流程数据窗口》的筛选按钮权限，没有授权时，所有人都有权限使用。授权后，仅有权限的人可以使用。</div></div>)
    this.axios({
      url: 'admin/Workflow/flowSetting'
    }).then(res => {
      this.loading = false
      if (res.result.data && res.result.data.searchPriv) {
        finishArray = res.result.data.searchPriv.finish
        proceedArray = res.result.data.searchPriv.proceed
        if (this.config.searchPriv && this.config.searchPriv.proceed) {
          this.proceed = this.config.searchPriv.proceed
          this.proceed = this.proceed.map(item => {
            const obj = proceedArray.find(proItem => proItem.value === item.value)
            if (obj) {
              item.customName = obj.customName
              item.help = obj.help
              item.remark = obj.remark
            }
            return item
          })
        } else {
          this.proceed = proceedArray
        }
        if (this.config.searchPriv && this.config.searchPriv.finish) {
          this.finish = this.config.searchPriv.finish
          this.finish = this.finish.map(item => {
            const obj = finishArray.find(proItem => proItem.value === item.value)
            if (obj) {
              item.customName = obj.customName
              item.help = obj.help
              item.remark = obj.remark
            }

            return item
          })
        } else {
          this.finish = finishArray
        }
      }
    })
  },
  methods: {
    handleSort (type) {
      this.$refs.flowAttrTransitionSort.show({
        title: '排序',
        data: type === 'proceed' ? this.proceed : this.finish,
        state: type
      })
    },
    getSort (data, state) {
      if (state === 'proceed') {
        this.proceed = data
      } else {
        this.finish = data
      }
    },
    handleAdd (type, record, index) {
      this.typeDrawer = type
      if (record) {
        this.configDrawer = {
          title: '编辑',
          record: record,
          index: index,
          action: 'edit'
        }
      } else {
        this.configDrawer = {
          title: '添加',
          action: 'add'
        }
      }
      this.visibleDrawer = true
    },
    enableChange (e, record, type) {
      if (type === 'proceed') {
        if (this.proceed.filter(item => item.value !== record.value).every(item => item.enable === '0')) {
          this.$message.warning('请保持至少有一个处于启用状态')
        } else {
          this.$set(record, 'enable', record.enable = e ? '1' : '0')
          this.$forceUpdate()
        }
      } else {
        if (this.finish.filter(item => item.value !== record.value).every(item => item.enable === '0')) {
          this.$message.warning('请保持至少有一个处于启用状态')
        } else {
          this.$set(record, 'enable', record.enable = e ? '1' : '0')
          this.$forceUpdate()
        }
      }
    },
    copyPrivShow (record, type) {
      this.copyPriv = record.searchPriv
      this.copyCheck = []
      this.copyType = type
      this.indeterminate = false
      this.checkAll = false
      if (type === 'proceed') {
        this.plainOptions = this.proceed.map(item => {
          const obj = {
            label: item.name,
            value: item.value
          }
          return obj
        })
      } else {
        this.plainOptions = this.finish.map(item => {
          const obj = {
            label: item.name,
            value: item.value
          }
          return obj
        })
      }
      this.visibleCopy = true
    },
    onCheckAllChange (e) {
      Object.assign(this, {
        copyCheck: e.target.checked ? this.plainOptions.map(item => item.value) : [],
        indeterminate: false,
        checkAll: e.target.checked
      })
    },
    onChange (checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.plainOptions.length
      this.checkAll = checkedList.length === this.plainOptions.length
    },
    handleSubmit () {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          if (this.configDrawer.action === 'add') {
            values.info.searchType = 'custom'
            if (this.typeDrawer === 'proceed') {
              this.proceed.splice(this.proceed.length, 0, values.info)
            } else {
              this.finish.splice(this.finish.length, 0, values.info)
            }
          } else {
            if (this.typeDrawer === 'proceed') {
              Object.assign(this.proceed[this.configDrawer.index], values.info)
            } else {
              Object.assign(this.finish[this.configDrawer.index], values.info)
            }
          }
          this.visibleDrawer = false
        }
      })
    },
    handleSearchPriv (record, index) {
      this.privData = record
      this.$refs.privVisitForm.show({
        action: 'edit',
        title: '授权',
        record: record,
        index: index,
        key: 'searchPriv',
        selectType: 'radio',
        privArr: {
          visit: '可访问'
        },
        defaultpriv: 'visit'
      })
    },
    getPrivs (all, data) {
      this.$forceUpdate()
    },
    getCopy () {
      if (this.copyType === 'proceed') {
        this.proceed.forEach(item => {
          if (this.copyCheck.includes(item.value)) {
            item.searchPriv = this.copyPriv
          }
        })
      } else {
        this.finish.forEach(item => {
          if (this.copyCheck.includes(item.value)) {
            item.searchPriv = this.copyPriv
          }
        })
      }
      this.visibleCopy = false
      this.$forceUpdate()
    }
  }
}
</script>
