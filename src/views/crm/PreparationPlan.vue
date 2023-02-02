<template>
  <a-drawer
    :destroyOnClose="true"
    title="准备方案"
    :width="900"
    :visible="visible"
    @close="visible = false; $parent.$parent.formThis.pageLoading = false">
    <a-spin :spinning="loadingShow">
      <div>
        <a-form :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" :form="form">
          <a-form-item :label="item.label" v-for="(item, index) in readyList" :key="index">
            <div>
              <a-radio-group :value="item.status" @change="(e) => { onChange(e, item) }" v-if="item.value !== 'qtfjsm'">
                <a-radio :value="subItem.wayIndex" v-for="(subItem, subIndex) in item.wayList" :key="subIndex">
                  {{ subItem.way }}
                </a-radio>
              </a-radio-group>
              <a-input type="textarea" v-model="item.remark" placeholder="请输入说明" style="width: 200px; margin-right: 8px" v-else></a-input>
              <a-upload
                :action="imgUpload"
                list-type="text"
                :file-list="item.file || []"
                @change="(e) => {handleChange(e,item)}"
                accept="image/*"
                :multiple="true"
                style="flex: 1"
                name="headImage"
                class="tp"
                v-viewer
              >
                <div v-if="item.file.length === 0 && item.isUpload">
                  <a-button> <a-icon type="upload" /> 上传图片 </a-button>
                </div>
              </a-upload>
            </div>
          </a-form-item>
        </a-form>
      </div>
      <div class="bbar">
        <a-button type="primary" @click="submit">提交</a-button>
        <a-button @click="visible=!visible; $parent.$parent.formThis.pageLoading = false">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      isLt2M: true,
      videoList: [],
      imgUpload: `${process.env.VUE_APP_API_BASE_URL}admin/attachment/upload/?uploadName=headImage`,
      loadingShow: false,
      form: this.$form.createForm(this),
      visible: false,
      config: '',
      readyList: [{
        file: [],
        isUpload: true,
        value: 'sgfa',
        label: '施工方案',
        status: 'wc2',
        wayList: [{
          way: '完成',
          wayIndex: 'wc2'
        }, {
          way: '未完成',
          wayIndex: 'wwc'
        }]
      }, {
        file: [],
        isUpload: true,
        value: 'yjfa',
        label: '应急方案',
        status: 'wc2',
        wayList: [{
          way: '完成',
          wayIndex: 'wc2'
        }, {
          way: '未完成',
          wayIndex: 'wwc'
        }]
      }, {
        file: [],
        isUpload: true,
        value: 'dzfa',
        label: '吊装方案',
        status: 'wc2',
        wayList: [{
          way: '完成',
          wayIndex: 'wc2'
        }, {
          way: '未完成',
          wayIndex: 'wwc'
        }]
      }, {
        file: [],
        isUpload: true,
        value: 'ydfa',
        label: '用电方案',
        status: 'wc2',
        wayList: [{
          way: '完成',
          wayIndex: 'wc2'
        }, {
          way: '未完成',
          wayIndex: 'wwc'
        }]
      }, {
        file: [],
        isUpload: true,
        value: 'dhfa',
        label: '动火方案',
        status: 'wc2',
        wayList: [{
          way: '完成',
          wayIndex: 'wc2'
        }, {
          way: '未完成',
          wayIndex: 'wwc'
        }]
      }, {
        file: [],
        isUpload: true,
        value: 'xcsyfa',
        label: '现场试验方案',
        status: 'wc2',
        wayList: [{
          way: '完成',
          wayIndex: 'wc2'
        }, {
          way: '未完成',
          wayIndex: 'wwc'
        }]
      }, {
        file: [],
        isUpload: true,
        value: 'qtfjsm',
        label: '其他附加说明',
        remark: ''
      }]
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {
    show (config) {
      this.parent = config.parent
      this.config = config
      this.visible = true
    },
    onChange (e, item) {
      this.$set(item, 'status', e.target.value)
      this.$set(item, 'isUpload', true)
      if (item.status === 'wwc') {
        this.$set(item, 'file', '')
        this.$set(item, 'isUpload', false)
      }
    },
    handleChange ({ fileList }, item) {
      const file = fileList.filter(item => item.status !== 'error')
      this.$set(item, 'file', file)
    },
    submit () {
      // 技术员准备方案
      const list = this.readyList.filter(item => {
        return item.status === 'wc2'
      })
      const isEnd = list.every(item => {
        return item.file && item.file.length > 0
      })
      if (!isEnd) {
        this.$message.error('请在选择了完成的方案中提交对应的附件')
        return
      }
      var jsyfa = []
      this.readyList.forEach(item => {
        if (item.file && item.file.length > 0) {
          var imgList = []
          imgList.push({
            fileName: item.file[0].response.result.fileName,
            filePath: item.file[0].response.result.filePath
          })
        }
        jsyfa.push({
          famc: item.label,
          wczt: item.file && item.file.length > 0 ? 'wc2' : 'wwc',
          tp: imgList || '',
          smbz: item.remark || ''
        })
      })
      const data = {
        jsyfa: jsyfa
      }
      const formData = {
        confirm: true,
        extFormData: data
      }
      this.visible = false
      this.parent.handleSubmit(formData)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
