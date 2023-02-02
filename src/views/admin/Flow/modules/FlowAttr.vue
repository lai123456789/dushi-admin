<template>
  <!-- 窗口右侧的属性面板 -->
  <a-drawer
    :title="title"
    :width="drawerWidth"
    :destroyOnClose="true"
    :visible="visible"
    @close="onClose"
  >
    <!-- 库所设置 -->
    <template v-if="activeKey === 'place'">
      <a-spin :spinning="false" v-if="currentSelect.type === 'start'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" />
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
      <a-spin :spinning="false" v-if="currentSelect.type === 'end'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" disabled/>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span slot="label">流程状态
              <a-tooltip title="流程状态通常在“活动”上设置，如遇特殊情况“活动”上设置无法满足需求时可在此处进行设置">
                <a-icon type="question-circle"/></a-tooltip>
            </span>
            <a-select showSearch v-model="currentSelect.transition_status">
              <a-select-option v-for="item in transition_status_data" :key="item.id" :value="item.status">{{ item.status }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
      <a-spin :spinning="false" v-else-if="currentSelect.type === 'event'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" />
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
    </template>
    <!-- 向弧设置 -->
    <template v-if="activeKey === 'arc'">
      <a-spin :spinning="false">
        <a-tabs default-active-key="condition">
          <a-tab-pane key="condition" tab="条件设置">
            <a-form>
              <a-row>
                <a-col :span="12">
                  <a-form-item label="id" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                    <a-input :value="currentSelect.id" disabled />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="向弧编号" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
                    <a-input :value="currentSelect.id" disabled />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-form-item label="向弧显示文本" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
                <a-input :value="currentSelect.label" @change="linkLabelChange" />
              </a-form-item>
              <a-form-item label="条件备注" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
                <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks1" />
              </a-form-item>
              <a-row>
                <a-col :span="8">
                  <a-form-item :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }" >
                    <span slot="label">优先级
                      <a-tooltip title="数字大的将优先参与判断">
                        <a-icon type="question-circle"/>
                      </a-tooltip>
                    </span>
                    <a-input-number v-model="currentSelect.priority" :min="0" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
                    <span slot="label">else条件
                      <a-tooltip title="当勾选此选项时下面的条件设置将无效，流程在进行条件匹配时优先匹配其他条件，如果其他条件都不匹配，则匹配此向弧。">
                        <a-icon type="question-circle"/>
                      </a-tooltip>
                    </span>
                    <a-switch v-model="currentSelect.matching"/>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
                    <span slot="label">禁用
                      <a-tooltip title="启用时，该分支路由显示为绿色。禁用后，该分支路由将不会启用(显示为灰色)。需要点击【刷新】重新绘制，线条颜色才会变化。">
                        <a-icon type="question-circle"/>
                      </a-tooltip>
                    </span>
                    <a-switch v-model="currentSelect.disabled"/>
                  </a-form-item>
                </a-col>
              </a-row>
              <codemirror ref="arcCondition" :params="myCondition"/>
            </a-form>
          </a-tab-pane>
          <a-tab-pane key="trigger" tab="触发事件">
            <a-form :form="form">
              <a-form-item label="子状态" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
                <a-select
                  @change="(value, option) => { currentSelect.arc_status = value }"
                  showSearch
                  v-decorator="['arcStatus', {initialValue: currentSelect.arc_status}]">
                  <a-select-option v-for="item in arc_status_data" :key="item.id" :value="item.status">{{ item.status }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="触发事件备注" :labelCol="{ span: 2 }" :wrapperCol="{ span: 22 }">
                <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks2" />
              </a-form-item>
              <codemirror ref="arcEvent" :params="myEvent"/>
            </a-form>
          </a-tab-pane>
        </a-tabs>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit('arc')">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
    </template>
    <!-- 变迁设置 -->
    <template v-else-if="activeKey === 'transition' && !currentSelect.quoteId">
      <flow-attr-transition
        v-if="currentSelect.type === 'transition1' || currentSelect.type === 'transition2' || currentSelect.type === 'transition3'"
        ref="flowAttrTransition"
        @ok="handleFlowAttrTransition"
        @cancel="onClose"
        :params="{ currentSelect: currentSelect, flowData: flowData , workflowId: workflowId }"/>
      <a-spin :spinning="false" v-else-if="currentSelect.type === 'freedom'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
      <a-spin :spinning="false" v-else-if="currentSelect.type === 'child-flow'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
      <a-spin :spinning="false" v-else-if="currentSelect.type === 'x-lane' || currentSelect.type === 'y-lane'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
    </template>
    <!-- 复用变迁设置 -->
    <template v-else-if="activeKey === 'transition' && currentSelect.quoteId">
      <a-spin :spinning="false">
        <a-form>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="复用id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.quoteId" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" disabled />
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks" disabled />
          </a-form-item>
        </a-form>
      </a-spin>
    </template>
    <!-- 网关设置 -->
    <template v-else-if="activeKey === 'gateway'">
      <a-spin
        :spinning="false"
        v-if="currentSelect.type === 'gateway1' || currentSelect.type === 'gateway2' || currentSelect.type === 'gateway3' || currentSelect.type === 'gateway4' || currentSelect.type === 'gateway5'">
        <a-form>
          <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select v-model="currentSelect.type" @change="gatewayChange">
              <a-select-option value="gateway1" label="排他网关">排他网关</a-select-option>
              <a-select-option value="gateway2" label="并行拆分">并行拆分</a-select-option>
              <a-select-option value="gateway3" label="并行合并">并行合并</a-select-option>
              <a-select-option value="gateway4" label="尽迟拆分">尽迟拆分</a-select-option>
              <a-select-option value="gateway5" label="条件合并">条件合并</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="id" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入节点名称" :value="currentSelect.nodeName" @change="nodeNameChange" />
          </a-form-item>
          <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-textarea :autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入备注" v-model="currentSelect.remarks" />
          </a-form-item>
        </a-form>
        <div class="bbar">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button @click="onClose">关闭</a-button>
        </div>
      </a-spin>
    </template>
    <flow-attr-arc-condition ref="flowAttrArcCondition" :params.sync="currentSelect"/>
    <flow-attr-arc-event ref="flowAttrArcEvent" :params.sync="currentSelect"/>
  </a-drawer>
</template>

<script>
import jsplumb from 'jsplumb'
// eslint-disable-next-line no-unused-vars
import { flowConfig } from '../config/args-config.js'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['plumb', 'flowData', 'select', 'workflowId'],
  components: {
    jsplumb,
    FlowAttrTransition: () => import('./FlowAttrTransition'),
    FlowAttrArcCondition: () => import('./FlowAttrArcCondition'),
    FlowAttrArcEvent: () => import('./FlowAttrArcEvent'),
    Codemirror: () => import('@/views/admin/Formula/Codemirror')
  },
  watch: {
    select: {
      handler (val) {
        this.currentSelect = JSON.parse(JSON.stringify(val))
        if (this.currentSelect.type === 'start' || this.currentSelect.type === 'end' || this.currentSelect.type === 'event') {
        // 库所
          this.activeKey = 'place'
          this.title = '库所设置：' + this.currentSelect.nodeName
          this.drawerWidth = 600
        } else if (this.currentSelect.type === 'transition1' || this.currentSelect.type === 'transition2' || this.currentSelect.type === 'transition3' || this.currentSelect.type === 'child-flow' || this.currentSelect.type === 'x-lane' || this.currentSelect.type === 'y-lane') {
        // 变迁
          this.activeKey = 'transition'
          this.title = '变迁设置：' + this.currentSelect.nodeName
          this.drawerWidth = this.currentSelect.quoteId ? 600 : 1200
        } else if (this.currentSelect.type === 'link') {
        // 向弧
          this.activeKey = 'arc'
          this.title = this.currentSelect.label ? '向弧设置：' + this.currentSelect.label : '向弧设置'
          if (!this.currentSelect.priority) {
            this.$set(this.currentSelect, 'priority', 0)
          }
          this.drawerWidth = 1200
        } else if (this.currentSelect.type === 'gateway1' || this.currentSelect.type === 'gateway2' || this.currentSelect.type === 'gateway3' || this.currentSelect.type === 'gateway4' || this.currentSelect.type === 'gateway5') {
        // 网关
          this.activeKey = 'gateway'
          this.title = '网关设置：' + this.currentSelect.nodeName
          this.drawerWidth = 600
        } else {
        // 流程属性
          this.activeKey = 'flow'
          this.title = '流程属性设置'
        }
        if (this.currentSelect.type === 'link') {
          this.myCondition = {
            tableid: this.flowData.params.modelid,
            data: this.currentSelect.arcCondition ? this.currentSelect.arcCondition : { html: '', value: '' },
            currentSelect: this.currentSelect,
            flowData: this.flowData
          }
          this.myEvent = {
            tableid: this.flowData.params.modelid,
            data: this.currentSelect.arcEvent ? this.currentSelect.arcEvent : { html: '', value: '' },
            currentSelect: this.currentSelect,
            flowData: this.flowData
          }
        }
      },
      immediate: true
    }
  },
  data () {
    return {
      visible: false,
      drawerWidth: 900,
      form: this.$form.createForm(this),
      title: '',
      myEvent: {},
      myCondition: {},
      currentSelect: {},
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 17 }
      },
      activeKey: 'flow',
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      arc_status_data: [],
      transition_status_data: []
    }
  },
  methods: {
    show () {
      this.visible = true
      if (this.flowData.params && this.flowData.params.setting) {
        const setting = JSON.parse(this.flowData.params.setting)
        this.arc_status_data = setting.arc_status_data || []
        this.transition_status_data = setting.transition_status_data || []
      }
    },
    nodeNameChange (e) {
      const that = this
      that.currentSelect.nodeName = e.target.value
      that.flowData.nodeList.forEach(function (node, index) {
        if (node.quoteId === that.currentSelect.id) {
          that.flowData.nodeList[index].nodeName = e.target.value
        }
      })
    },
    linkLabelChange (e) {
      const that = this
      const label = e.target.value
      that.currentSelect.label = label
    },
    handleTransition () {
      this.$refs.flowAttrTransition.show({
        title: '变迁设置',
        currentSelect: this.currentSelect,
        flowData: this.flowData
      })
    },
    handleArcCondition () {
      this.$refs.flowAttrArcCondition.show({
        title: '向弧条件设置',
        currentSelect: this.currentSelect,
        flowData: this.flowData
      })
    },
    handleArcEvent () {
      this.$refs.flowAttrArcEvent.show({
        title: '向弧触发事件设置',
        tableid: this.flowData.params.modelid
      })
    },
    transitionChange (value, option) {
      const that = this
      const newId = value + '-' + this.getUUID()
      this.flowData.nodeList.forEach(function (node, index) {
        if (node.quoteId === that.currentSelect.id) {
          node.quoteId = newId
          node.nodeName = option.componentOptions.propsData.label
        }
      })
      this.flowData.linkList.forEach(function (link, index) {
        if (link.sourceId === that.currentSelect.id) {
          link.sourceId = newId
        }
        if (link.targetId === that.currentSelect.id) {
          link.targetId = newId
        }
      })
      this.currentSelect.id = newId
      this.currentSelect.nodeName = option.componentOptions.propsData.label
    },
    gatewayChange (value, option) {
      const that = this
      const newId = value + '-' + this.getUUID()
      this.flowData.linkList.forEach(function (link, index) {
        if (link.sourceId === that.currentSelect.id) {
          link.sourceId = newId
        }
        if (link.targetId === that.currentSelect.id) {
          link.targetId = newId
        }
      })
      this.currentSelect.id = newId
      this.currentSelect.nodeName = option.componentOptions.propsData.label
    },
    getUUID: function () {
      const s = []
      const hexDigits = '0123456789abcdef'
      for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
      }
      s[14] = '4'
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
      s[8] = s[13] = s[18] = s[23] = '-'
      const uuid = s.join('')
      return uuid.replace(/-/g, '')
    },
    // 关闭
    onClose () {
      this.visible = false
      this.$emit('close')
    },
    // 变迁保存
    handleFlowAttrTransition (val) {
      this.visible = false
      this.$emit('ok', val.currentSelect)
    },
    // 网关保存
    handleSubmit (type) {
      if (type !== 'arc') {
        this.visible = false
        this.currentSelect.arcCondition = this.$refs.arcCondition ? this.$refs.arcCondition.getValue() : this.currentSelect.arcCondition
        this.currentSelect.arcEvent = this.$refs.arcEvent ? this.$refs.arcEvent.getValue() : this.currentSelect.arcEvent
        this.$emit('ok', this.currentSelect)
      } else {
        this.form.validateFields((errors, values) => {
          if (!errors) {
            this.visible = false
            this.currentSelect.arcCondition = this.$refs.arcCondition ? this.$refs.arcCondition.getValue() : this.currentSelect.arcCondition
            this.currentSelect.arcEvent = this.$refs.arcEvent ? this.$refs.arcEvent.getValue() : this.currentSelect.arcEvent
            this.$emit('ok', this.currentSelect)
          } else {
            this.$message.warning('表单填写不符合要求，请参考页面内具体提示修改 ')
          }
        })
      }
    }
  }
}
</script>
<style scoped lang="scss" scoped>
  @import '../style/flow-designer.scss';
  .flow-attr >>> .ant-form{
    padding: 10px;
  }
  .flow-attr >>> .ant-tabs-bar{
    display: none;
  }
</style>
