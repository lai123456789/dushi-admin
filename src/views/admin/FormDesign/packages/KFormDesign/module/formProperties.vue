<template>
  <div class="properties-centent kk-checkbox">
    <div class="head-title">
      表单属性设置
    </div>
    <div class="properties-body">
      <a-form-item label="表单名称" v-if="!config.tableType">
        <a-input v-decorator="['info[name]', { initialValue: data.name || '', rules: [{ required: true, message: '请输入表单名称'}]}]" />
      </a-form-item>
      <!-- <a-form-item
        v-if="(typeof config.layout) !== 'undefined' && !config.tableType"
        label="表单布局"
      >
        <a-radio-group buttonStyle="solid" v-model="config.layout">
          <a-radio-button value="horizontal">水平</a-radio-button>
          <a-radio-button value="vertical">垂直</a-radio-button>
          <a-radio-button value="inline">行内</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="labelCol（水平布局生效）" v-if="!config.tableType">
        <div class="change-col-box">
          <a-slider
            id="test"
            :max="24"
            :min="0"
            v-model="config.labelCol.xs"
            @change="handleChangeCol"
          />
          <div>
            <label>xs:</label>
            <a-input-number v-model="config.labelCol.xs" />
          </div>
          <div>
            <label>sm:</label>
            <a-input-number v-model="config.labelCol.sm" />
          </div>
          <div>
            <label>md:</label>
            <a-input-number v-model="config.labelCol.md" />
          </div>
          <div>
            <label>lg:</label>
            <a-input-number v-model="config.labelCol.lg" />
          </div>
          <div>
            <label>xl:</label>
            <a-input-number v-model="config.labelCol.xl" />
          </div>
          <div>
            <label>xxl:</label>
            <a-input-number v-model="config.labelCol.xxl" />
          </div>
        </div>
      </a-form-item>
      <a-form-item label="wrapperCol（水平布局生效）" v-if="!config.tableType">
        <div class="change-col-box">
          <div>
            <label>xs:</label>
            <a-input-number v-model="config.wrapperCol.xs" />
          </div>
          <div>
            <label>sm:</label>
            <a-input-number v-model="config.wrapperCol.sm" />
          </div>
          <div>
            <label>md:</label>
            <a-input-number v-model="config.wrapperCol.md" />
          </div>
          <div>
            <label>lg:</label>
            <a-input-number v-model="config.wrapperCol.lg" />
          </div>
          <div>
            <label>xl:</label>
            <a-input-number v-model="config.wrapperCol.xl" />
          </div>
          <div>
            <label>xxl:</label>
            <a-input-number v-model="config.wrapperCol.xxl" />
          </div>
        </div>
      </a-form-item> -->
      <a-form-item label="预览模态框宽度">
        <a-input-number style="width:100%;" v-model="previewOptions.width" />
      </a-form-item>
      <a-form-item label="帮助说明">
        <a-switch @change="(e)=>{helptext = e}" v-decorator="['setting[helptext]', {initialValue: setting.helptext == 1 ? true : false , valuePropName: 'checked'}]"/>
      </a-form-item>
      <a-form-item label="链接地址" v-if="helptext">
        <a-input placeholder="如：https://www.yuque.com/" v-decorator="['setting[linkAddress]', {rules: [{ required: helptext, message: '请输入链接地址'},{pattern: /^http:\/\/|^https:\/\//, message: '请输入正确链接地址'}],initialValue: setting.linkAddress || ''}]"/>
      </a-form-item>
      <!-- <a-form-item label="表单CSS">
          <a-input v-model="config.customStyle" />
        </a-form-item> -->
      <!-- <a-form-item label="表单属性">
          <kCheckbox
            v-if="typeof config.hideRequiredMark !== 'undefined'"
            v-model="config.hideRequiredMark"
            label="隐藏必选标记"
          />
        </a-form-item> -->
      <a-form-item label="表单备注" v-if="!config.tableType">
        <a-textarea :autoSize="{ minRows: 3, maxRows: 6 }" v-decorator="['setting[description]', {initialValue: setting.description || ''}]" />
      </a-form-item>
      <a-form-item label="提示">
        实际预览效果请点击预览查看
      </a-form-item>
    </div>
  </div>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 * description 表单属性设置面板组件
 */
export default {
  name: 'FormProperties',
  components: {
    kCheckbox: () => import('../../KCheckbox/index.vue')
  },
  props: {
    config: {
      type: Object,
      required: true
    },
    previewOptions: {
      type: Object,
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
      required: true
    }
  },
  watch: {
    setting (val) {
      this.helptext = val.helptext === '1'
    }
  },
  data () {
    return {
      helptext: false
    }
  },
  methods: {
    handleChangeCol (e) {
      this.config.labelCol.xs = this.config.labelCol.sm = this.config.labelCol.md = this.config.labelCol.lg = this.config.labelCol.xl = this.config.labelCol.xxl = e
      this.config.wrapperCol.xs = this.config.wrapperCol.sm = this.config.wrapperCol.md = this.config.wrapperCol.lg = this.config.wrapperCol.xl = this.config.wrapperCol.xxl =
        24 - e
    }
  }
}
</script>
<style lang="less" scoped>
.change-col-box {
  > div {
    padding: 5px;
    display: flex;
    > label {
      text-align: right;
      padding-right: 8px;
      display: block;
      font-size: 16px;
      width: 45px;
    }
  }
}
</style>
