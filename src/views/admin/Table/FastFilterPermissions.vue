<template>
  <a-drawer
    :title="config.title"
    :destroyOnClose="true"
    width="900"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <div>
        <a-alert :message="message" type="info" show-icon />
        <a-divider orientation="left">进行中</a-divider>
        <a-row :gutter="[0, 8]">
          <a-col :span="24" v-if="config.type === 'workflow'"><a-button @click="handleSort('proceed')">排序</a-button></a-col>
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
              <div slot="customName" slot-scope="text, record">
                <a-input size="small" v-model="record.customName" v-if="config.type === 'workflow'"/>
                <span v-else>{{ text }}</span>
              </div>
              <div slot="help" slot-scope="text, record">
                <a-input size="small" v-model="record.help" v-if="config.type === 'workflow'"/>
                <span v-else>{{ text }}</span>
              </div>
              <div slot="enable" slot-scope="text,record">
                <a-switch size="small" :checked="record.enable === '1'" @change="(e)=>{ enableChange(e, record, 'proceed') }" />
              </div>
              <div slot="action" slot-scope="text, record, index">
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
          <a-col :span="24" v-if="config.type === 'workflow'"><a-button @click="handleSort('finish')">排序</a-button></a-col>
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
              <div slot="customName" slot-scope="text, record">
                <a-input size="small" v-model="record.customName" v-if="config.type === 'workflow'"/>
                <span v-else>{{ text }}</span>
              </div>
              <div slot="help" slot-scope="text, record">
                <a-input size="small" v-model="record.help" v-if="config.type === 'workflow'"/>
                <span v-else>{{ text }}</span>
              </div>
              <div slot="enable" slot-scope="text,record">
                <a-switch size="small" :checked="record.enable === '1'" @change="(e)=> { enableChange(e, record, 'finish') }" />
              </div>
              <div slot="action" slot-scope="text, record, index">
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
      </div>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
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
  </a-drawer>
</template>
<script>
export default {
  components: {
    FlowAttrTransitionSort: () => import('@/views/admin/Flow/modules/FlowAttrTransitionSort'),
    PrivVisitForm: () => import('./PrivVisitForm')
  },
  data () {
    return {
      config: {},
      visible: false,
      loading: false,
      visibleCopy: false,
      message: '',
      privData: {},
      copyCheck: [],
      plainOptions: [{}],
      copyType: '',
      indeterminate: false,
      checkAll: false,
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
        width: 140,
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
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      if (config.type === 'workflow') {
        this.loading = true
        this.message = (<div>
          <div>1）筛选按钮排序、自定义名称、自定义帮助是全局设置，《流程中心》、《流程数据窗口》均依照该设置。</div>
          <div>2）《进行中》、《已结束》是2个不同的模块，用2个tab页展示。单个模块下至少需要开启1个筛选按钮。单个模块下默认加载排序在最前面的筛选按钮内容。</div>
          <div>3）此处的【授权】控制《流程中心》的权限机制，没有授权时，所有人都有权限使用。授权后，仅有权限的人可以使用。</div></div>)
        this.columns = [{
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
          title: '备注',
          dataIndex: 'remark'
        }, {
          title: '操作',
          dataIndex: 'action',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }]
        this.axios({
          url: 'admin/Workflow/flowSetting'
        }).then(res => {
          this.loading = false
          if (res.result.data && res.result.data.searchPriv) {
            this.finish = res.result.data.searchPriv.finish
            this.proceed = res.result.data.searchPriv.proceed
          }
        })
      } else {
        let finishArray = []
        let proceedArray = []
        this.message = (<div>
          <div>1）筛选按钮排序、自定义名称、自定义帮助读取流程管理处的全局配置。</div>
          <div>2）《进行中》、《已结束》是2个不同的模块，用2个tab页展示。单个模块下至少需要开启1个筛选按钮。单个模块下默认加载排序在最前面的筛选按钮内容。</div>
          <div>3）【授权】控制《流程数据窗口》的筛选按钮权限，没有授权时，所有人都有权限使用。授权后，仅有权限的人可以使用。</div></div>)
        this.axios({
          url: 'admin/Workflow/flowSetting'
        }).then(res => {
          this.loading = false
          if (res.result.data && res.result.data.searchPriv) {
            finishArray = res.result.data.searchPriv.finish
            proceedArray = res.result.data.searchPriv.proceed
            if (config.searchPriv && config.searchPriv.proceed) {
              this.proceed = proceedArray
              this.proceed.map(item => {
                const obj = config.searchPriv.proceed.filter(proItem => proItem.value === item.value)[0]
                item.enable = obj.enable
                item.searchPriv = obj.searchPriv
                return item
              })
            } else {
              this.proceed = proceedArray
            }
            if (config.searchPriv && config.searchPriv.finish) {
              this.finish = finishArray
              this.finish.map(item => {
                const obj = config.searchPriv.finish.filter(proItem => proItem.value === item.value)[0]
                item.enable = obj.enable
                item.searchPriv = obj.searchPriv
                return item
              })
            } else {
              this.finish = finishArray
            }
          }
        })
      }
    },
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
        this.plainOptions = [
          { label: '我的待办', value: 'my_process' },
          { label: '独享待办', value: 'only_process' },
          { label: '共享待办', value: 'public_process' },
          { label: '我的已办', value: 'my_handle' },
          { label: '我的发起', value: 'my_create' },
          { label: '所有进行中', value: 'all_flow' },
          { label: '所有待办', value: 'all_process' }
        ]
      } else {
        this.plainOptions = [
          { label: '我的已办', value: 'my_handle' },
          { label: '我的发起', value: 'my_create' },
          { label: '所有已结束', value: 'all_flow' }
        ]
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
    },
    handleSubmit () {
      const value = {
        proceed: this.proceed,
        finish: this.finish
      }
      this.$emit('func', value)
      if (this.config.type === 'workflow') {
        this.axios({
          url: 'admin/Workflow/flowSetting',
          data: { data: { searchPriv: value } }
        }).then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功')
            this.visible = false
          } else {
            this.$message.error(res.message)
          }
        })
      } else {
        this.$message.success('操作成功')
        this.visible = false
      }
    }
  }
}
</script>
