<template>
  <div>
    <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input v-decorator="['info[name]', {initialValue: data.name || '', rules: [{ required: true, message: '请输入名称'}]}]" />
    </a-form-item>
    <a-form-item v-if="data.variable == 'table_flow_list'" label="关联流程" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select placeholder="请选择流程" show-search v-decorator="['setting[workflow_id]', {initialValue: setting.workflow_id || '', rules: [{ required: true, message: '请选择流程'}]} ]" >
        <a-select-option v-for="(value, key) in workflow" :key="key" :value="value.workflow_id">
          {{ value.workflow_name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="pageName !== 'fieldForm'">
      <span slot="label">{{ pageName === 'table_card_list' ? '预加载数量': '每页行数' }}
        <a-tooltip placement="top">
          <template slot="title">
            <span v-if="pageName === 'table_card_list'">每页行数 最小为5，最大为10</span>
            <span v-else>每页行数 最小为5，最大为50</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-input-number v-if="pageName === 'table_card_list'" :min="5" :max="10" v-decorator="['setting[pagesize]', {initialValue: setting.pagesize || 5, rules: [{ required: true, message: '请输入预加载数量'}]}]"/>
      <a-input-number v-else :min="5" :max="50" v-decorator="['setting[pagesize]', {initialValue: setting.pagesize || 30, rules: [{ required: true, message: '请输入每页行数'}]}]"/>
    </a-form-item>
    <a-row v-else>
      <a-col :span="8">
        <a-form-item label="是否分页" :labelCol="{ span: 12 }" :wrapperCol="{ span: 8 }" >
          <a-switch v-decorator="['setting[paging]', { initialValue: false, valuePropName: 'checked' }]" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
          <span slot="label">每页行数
            <a-tooltip placement="top">
              <template slot="title">
                <span>每页行数 最小为10，最大为50</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input-number :min="1" v-decorator="['setting[pagesize]', {initialValue: setting.pagesize || 20, rules: [{ required: true, message: '请输入每页行数'}]}]"/>
        </a-form-item>
      </a-col>
    </a-row>
    <a-form-item label="排序方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-row :gutter="8">
        <a-col :span="4">
          <a-form-item>
            <a-select show-search option-filter-prop="children" v-decorator="[ 'setting[sort]', {rules: [{ required: true, message: '请选择排序字段'}], initialValue: setting.sort || 'id'} ]" >
              <a-select-option v-for="(value, key) in fieldslist" :key="key" :value="value.value">{{ value.display }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item>
            <a-select v-decorator="[ 'setting[dir]', {rules: [{ required: true, message: '请选择排序方式'}], initialValue: setting.dir || 'descend'} ]" >
              <a-select-option value="descend">降序</a-select-option>
              <a-select-option value="ascend">升序</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="多选" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-switch v-decorator="['setting[multi_select]', {initialValue: setting.multi_select == '1' ? true : false, valuePropName: 'checked'}]"/>
    </a-form-item>
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="pageName !== 'table_subform_list'">
      <span slot="label">抽屉宽度
        <a-tooltip placement="top" title="设置数据窗口打开表单视图时抽屉的宽度。固定宽度：打开的表单视图使用固定宽度。百分比：打开的表单视图使用分辨率百分比。">
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-row :gutter="8">
        <a-col :span="4">
          <a-form-item>
            <a-select v-decorator="['setting[drawerType]', {initialValue: setting.drawerType || '0'}]" @change="(e)=>{ setting.drawerType = e }" >
              <a-select-option value="0">固定宽度</a-select-option>
              <a-select-option value="1">百分比</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="20">
          <a-input-number
            v-if="setting.drawerType === '0'"
            :min="100"
            v-decorator="['setting[drawer_width]', {initialValue: setting.drawer_width || 1200}]"/>
          <a-input-number
            v-else
            :min="10"
            :max="100"
            v-decorator="['setting[drawerPercentage]', {initialValue: setting.drawerPercentage || 80}]"/>
          <span> {{ setting.drawerType === '0' ? 'px': '%' }}</span>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="表单Label宽度" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="pageName !== 'table_subform_list'">
      <a-input-number :min="50" v-decorator="['setting[label_width]', {initialValue: setting.label_width || 100}]"/>
    </a-form-item>
    <a-form-item label="列锁的起始列数" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="pageName !== 'table_subform_list'">
      <span style="margin-right:10px">从左往右</span><a-input-number :min="0" :max="10" v-decorator="['setting[lock_left]', {initialValue: setting.lock_left || 0}]"/>
    </a-form-item>
    <a-form-item label=" " :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="pageName !== 'table_subform_list'" :colon="false">
      <span style="margin-right:10px">从右往左</span><a-input-number :min="0" :max="10" v-decorator="['setting[lock_right]', {initialValue: setting.lock_right || 0}]"/>
    </a-form-item>
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span slot="label">分页模式
        <a-tooltip placement="top" title="简易模式下仅显示上一页和下一页分页按钮">
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-radio-group name="radioGroup" v-decorator="['setting[pageMode]', { initialValue: setting.pageMode || 'default' }]">
        <a-radio value="default">默认模式</a-radio>
        <a-radio value="simple">简易模式</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="用户自定义列" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="pageName !== 'table_subform_list'">
      <a-switch v-decorator="['setting[customColumns]', {initialValue: setting.customColumns == '1' ? true : false , valuePropName: 'checked'}]"/>
    </a-form-item>
    <a-form-item label="添加编辑样式" :labelCol="labelCol" :wrapperCol="wrapperCol" v-else>
      <a-radio-group name="radioGroup" v-decorator="['setting[style]', { initialValue: setting.style || 'dialog' }]">
        <a-radio value="dialog">
          对话框样式
        </a-radio>
        <a-radio value="inline">
          行内样式
        </a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="条件设置" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-button size="small" @click="handleCondition">
        <a-badge v-if="settingFlag" status="success" text="设置" />
        <a-badge v-else status="default" text="设置" />
      </a-button>
    </a-form-item>
    <a-form-item label="帮助说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-switch @change="(e)=>{helptext = e}" v-decorator="['setting[helptext]', {initialValue: setting.helptext == '1' ? true : false , valuePropName: 'checked'}]"/>
    </a-form-item>
    <a-form-item label="链接地址" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="helptext">
      <a-input placeholder="如：https://www.yuque.com/" v-decorator="['setting[linkAddress]', {rules: [{ required: helptext, message: '请输入链接地址'},{pattern: /^http:\/\/|^https:\/\//, message: '请输入正确链接地址'}],initialValue: setting.linkAddress || ''}]"/>
    </a-form-item>
    <a-form-item label="自定义数据源" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-input placeholder="如：/admin/api/test" v-decorator="['setting[data_source]', {initialValue: setting.data_source || ''}]"/>
    </a-form-item>
    <a-form-item v-if="data.variable == 'table_form_list'" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span slot="label">显示数据范围
        <a-tooltip>
          <template slot="title">
            <div>1、进行中&已结束，显示顶部tab页签，分别显示进行中、已结束的数据</div>
            <div>2、进行中，不出现顶部tab页签，仅显示进行中的数据</div>
            <div>3、已结束，不出现顶部tab页签，仅显示已结束的数据</div>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-radio-group name="radioGroup" v-decorator="['setting[flowScope]', { initialValue: setting.flowScope || 'proceed' }]" @change="(e)=>{ timeRangeShow = timePartition = e.target.value !== 'proceed'; }">
        <a-radio value="proceed">进行中</a-radio>
        <a-radio value="finish">已结束</a-radio>
        <a-radio value="all">进行中&已结束</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="时间分区" v-if="data.variable == 'table_form_list' && (timePartition || ( setting.flowScope && setting.flowScope !== 'proceed' ))" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-select show-search option-filter-prop="children" v-decorator="[ 'setting[timePartition]', {rules: [{ required: timePartition || ( setting.flowScope && setting.flowScope !== 'proceed' ), message: '请选择时间分区'}], initialValue: setting.timePartition || undefined} ]" >
        <a-select-option v-for="(value, key) in fieldslist" :key="key" :value="value.value">{{ value.display }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="data.variable == 'table_flow_list'" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span slot="label">显示流程范围
        <a-tooltip>
          <template slot="title">
            <div>1、进行中&已结束，显示顶部tab页签，分别显示进行中、已结束的流程</div>
            <div>2、进行中，不出现顶部tab页签，仅显示进行中的流程</div>
            <div>3、已结束，不出现顶部tab页签，仅显示已结束的流程</div>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </span>
      <a-radio-group name="radioGroup" v-decorator="['setting[flowScope]', { initialValue: setting.flowScope || '' }]" @change="(e)=>{ timeRangeShow = e.target.value !== 'proceed'}">
        <a-radio value="proceed">进行中</a-radio>
        <a-radio value="finish">已结束</a-radio>
        <a-radio value="">进行中&已结束</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item
      :label="data.variable == 'table_form_list' ? '数据时间范围' : '流程结束时间'"
      v-if="(['table_form_list'].includes(data.variable) && setting.flowScope && setting.flowScope !== 'proceed') || (['table_flow_list'].includes(data.variable) && setting.flowScope !== 'proceed')"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol">
      <a-radio-group name="radioGroup" v-decorator="['setting[timeRangeDisplay]', { initialValue: setting.timeRangeDisplay || '1' }]">
        <a-radio value="1">显示</a-radio>
        <a-radio value="0">隐藏</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="data.variable == 'table_flow_list'" label="快捷搜索按钮样式" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-radio-group name="radioGroup" v-decorator="['setting[searchStyle]', { initialValue: setting.searchStyle || '' }]">
        <a-radio value="">平铺</a-radio>
        <a-radio value="select">下拉</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-textarea :rows="4" v-decorator="['setting[description]', {initialValue: setting.description}]" />
    </a-form-item>
    <condition ref="condition" :params="condition" @ok="getCondition"/>
    <fast-filter-permissions ref="fastFilterPermissions" @func="getPrivs"/>
  </div>
</template>
<script>
export default {
  components: {
    Condition: () => import('../Table/Condition'),
    FastFilterPermissions: () => import('./FastFilterPermissions')
  },
  props: {
    fieldslist: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    workflow: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    data: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    setting: {
      type: Object,
      default () {
        return {}
      },
      required: true,
      deep: true
    },
    pageName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      config: {},
      labelCol: { span: 3 },
      wrapperCol: { span: 10 },
      visible: false,
      loading: false,
      helptext: false,
      timePartition: false,
      timeRangeShow: false,
      condition: {
        data: {}
      },
      settingFlag: false
    }
  },
  watch: {
    condition (val) {
      this.$emit('update:setting', Object.assign(this.setting, { condition: val.data }))
    },
    setting (val) {
      if (val.condition) {
        if (val.condition.value) {
          this.settingFlag = true
          return
        }
      }
      this.helptext = val.helptext === '1'
      if (!val.drawerType) {
        val.drawerType = '0'
      }
      this.settingFlag = false
    }
  },
  methods: {
    handleCondition () {
      this.condition = { tableid: this.data.value, data: this.setting.condition || {} }
      this.$refs.condition.show({ title: '条件设置' })
    },
    getCondition (val) {
      this.condition = val
      this.setting.condition = val.data
      if (this.setting.condition) {
        if (this.setting.condition.value) {
          this.settingFlag = true
          return
        }
      }
      this.settingFlag = false
    },
    handleSearchPriv () {
      if (!this.setting.searchPriv) {
        this.axios({
          url: 'admin/Centerflow/centerPriv'
        }).then(res => {
          if (res.result && res.result.searchPriv) {
            this.$refs.fastFilterPermissions.show({
              title: '快捷搜索权限设置',
              searchPriv: {
                proceed: res.result.searchPriv.proceed,
                finish: res.result.searchPriv.finish
              }
            })
          }
        })
      } else {
        this.$refs.fastFilterPermissions.show({
          title: '快捷搜索权限设置',
          searchPriv: this.setting.searchPriv
        })
      }
    },
    getPrivs (e) {
      this.setting.searchPriv = e
      this.$emit('update:setting', this.setting)
    }
  }
}
</script>
