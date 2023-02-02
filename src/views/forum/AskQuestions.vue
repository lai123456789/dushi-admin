<template>
  <a-drawer
    :title="config.title"
    :width="900"
    :visible="visible"
    :destroyOnClose="true"
    @close="visible=!visible"
  >
    <a-spin :spinning="false">
      <a-form :form="form">
        <a-form-item label="问题" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea
            :auto-size="{ minRows: 6, maxRows: 10 }"
            placeholder="请输入问题。提问应遵循客观、明确的原则，结尾建议加“？”"
            v-decorator="['title', {
              initialValue: setData.title || '',
              rules: [{ required: true, message: '问题不能为空'}]
            }]"/>
        </a-form-item>
        <a-form-item label="所属分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            placeholder="请选择至少一个分类"
            mode="multiple"
            allowClear
            v-decorator="['category_number', {
              initialValue: setData.category_number || undefined,
              rules: [{ required: true, message: '所属分类不能为空'}]
            }]">
            <a-select-option v-for="value in categroy" :key="value.id" :value="value.number">{{ value.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="热门分类" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
          <a-button style="margin-right: 10px; padding: 0px 20px;" v-for="value in hotCategroy" :key="value.number" @click="pushCategory(value)">{{ value.name }}</a-button>
        </a-form-item>
        <a-form-item label="问题描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea
            :auto-size="{ minRows: 10, maxRows: 15 }"
            v-decorator="['content', {
              initialValue: setData.content || '',}]"/>
        </a-form-item>
        <a-form-item label=" " :colon="false" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <div style="display: flex; flex-flow: column wrap">
            <a-upload
              :action="videoUpload"
              list-type="picture-card"
              :file-list="videoList"
              @change="handleVideoChange"
              accept="video/*"
              style="flex: 1"
              name="upload"
            >
              <div v-if="videoList.length < 1">
                <a-icon type="plus" />
                <div class="ant-upload-text" style="width: 60px; height: 40px; margin: auto">
                  视频上传
                </div>
              </div>
            </a-upload>
          </div>
          <div style="display: flex; flex-flow: column wrap">
            <a-upload
              :action="imgUpload"
              list-type="picture-card"
              :file-list="fileList"
              @preview="handlePreview"
              @change="handleChange"
              accept="image/*"
              :multiple="true"
              style="flex: 1"
              name="headImage"
              class="tp"
              v-viewer
            >
              <div v-if="fileList.length < 8">
                <a-icon type="plus" />
                <div class="ant-upload-text" style="width: 60px; height: 40px; margin: auto">
                  图片上传
                </div>
              </div>
            </a-upload>
          </div>
        </a-form-item>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      visible: false,
      config: {},
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      form: this.$form.createForm(this),
      setData: {},
      categroy: [],
      hotCategroy: [],
      fileList: [],
      isLt2M: true,
      videoList: [],
      imgUpload: `${process.env.VUE_APP_API_BASE_URL}admin/attachment/upload/?uploadName=headImage`,
      videoUpload: `${process.env.VUE_APP_API_BASE_URL}admin/attachment/upload/?uploadName=upload`
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.setData = {}
      this.fileList = []
      this.videoList = []
      this.axios({
        url: '/forum/Setting/getCategorys',
        params: { recommended: '0' }
      }).then(res => {
        this.categroy = res.result.data
      })
      this.axios({
        url: 'forum/Setting/getCategorys',
        params: { recommended: '1' }
      }).then(res => {
        this.hotCategroy = res.result.data
      })
      if (config.action === 'edit') {
        this.setData = JSON.parse(JSON.stringify(config.data))
        this.setData.category_number = config.data.category_number.split(',')
        if (config.data.images && config.data.images.length > 0) {
          config.data.images.forEach((item, index) => {
            const obj = {}
            obj.uid = index
            obj.name = item
            obj.status = 'done'
            obj.url = this.setting.rootUrl + item
            obj.thumbUrl = this.setting.rootUrl + item
            this.fileList.push(obj)
          })
        }
        if (config.data.videos) {
          const video = {}
          video.uid = config.data.number
          video.name = config.data.videos
          video.status = 'done'
          video.url = this.setting.rootUrl + config.data.videos
          video.thumbUrl = this.setting.rootUrl + config.data.videos
          this.videoList.push(video)
        }
      }
    },
    pushCategory (value) {
      const number = this.form.getFieldsValue().category_number || []
      if (number.indexOf(value.number) === -1) {
        number.push(value.number)
        this.form.setFieldsValue({
          'category_number': number
        })
      }
    },
    beforeUpload (file) {
      this.isLt2M = file.size / 1024 / 1024 < 2
      if (!this.isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
      }
      return !this.isLt2M
    },
    handlePreview (file) {
      const name = '.tp'
      const viewer = this.$el.querySelector(name).$viewer
      viewer.view(file.uid)
    },
    handleChange ({ fileList }) {
      this.fileList = fileList.filter(item => item.status !== 'error')
    },
    handleVideoChange ({ fileList }) {
      this.videoList = fileList
    },
    handleSubmit () {
      this.form.validateFields((err, values) => {
        if (!err) {
          values.category_number = values.category_number.toString()
          const images = []
          this.fileList.forEach(item => {
            if (item.response) {
              images.push(item.response.result.filePath)
            } else {
              images.push(item.name)
            }
          })
          values.images = images
          if (this.config.action === 'edit') {
            values.number = this.config.data.number
          }
          let video = ''
          this.videoList.forEach(item => {
            if (item.response) {
              video = item.response.result.filePath
            } else {
              video = item.name
            }
          })
          values.videos = video
          this.axios({
            url: 'forum/Index/saveQuestion',
            data: values
          }).then(res => {
            if (!res.code) {
              this.$message.success(res.message)
            } else {
              this.$message.error(res.message)
            }
            this.$emit('ok', '')
            this.visible = false
          })
        }
      })
    }
  }
}
</script>
