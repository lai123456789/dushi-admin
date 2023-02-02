<template>
  <u-editor class="myEditor" v-model="content" :config="editorConfig"/>
</template>
<script>
import uEditor from 'vue-ueditor-wrap'
export default {
  name: 'UEditor',
  components: { uEditor },
  model: {
    prop: 'value', // 指向props的参数名
    event: 'change'// 事件名称
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: () => {}
    },
    initialFrameHeight: {
      type: Number,
      default: 200
    }
  },
  data () {
    return {
      content: '',
      editorConfig: {
        UEDITOR_HOME_URL: `${process.env.BASE_URL}ueditor/`,
        serverUrl: `${process.env.VUE_APP_API_BASE_URL}admin/attachment/ueditor`,
        wordCount: false,
        initialFrameWidth: '100%',
        initialFrameHeight: this.initialFrameHeight,
        elementPathEnabled: false,
        toolbars: [[
          'fullscreen',
          'bold', 'italic', 'underline', 'fontborder', 'removeformat', 'formatmatch', '|',
          'forecolor', 'backcolor', '|',
          'paragraph', 'fontfamily', 'fontsize', '|',
          'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
          'insertimage', 'attachment', 'wordimage', 'insertvideo', '|',
          'horizontal', 'inserttable', 'link'
        ]]
      }
    }
  },
  created () {
    this.editorConfig = Object.assign(this.editorConfig, this.config)
  },
  watch: {
    value: {
      handler (val) {
        this.content = this.value
      },
      immediate: true
    },
    content (val) {
      this.$emit('change', val)
    }
  }
}
</script>
<style scoped>
.myEditor{
  line-height: initial;
}
</style>
