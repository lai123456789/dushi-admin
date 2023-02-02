<template>
  <a-drawer
    :title="config.title"
    :width="900"
    :destroyOnClose="true"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-row :gutter="[0, 8]">
        <a-card>
          <span>已选的标签 : </span>
          <a-tag
            style="margin-bottom: 5px"
            :closable="config.record && config.record.field.tagData.find(item => item.name === tagItem) && config.record.field.tagData.find(item => item.name === tagItem).tag_type === '1' ? false : true"
            :color="config.record && config.record.field.tagData.find(item => item.name === tagItem) && config.record.field.tagData.find(item => item.name === tagItem).tag_type === '1' ? 'green' : 'purple'"
            @close="()=>closeTab(tagItem)"
            v-for="tagItem in tagData"
            :key="tagItem" >{{ tagItem }}</a-tag>
        </a-card>
        <a-col :span="24">
          <a-row type="flex" align="middle">
            <a-col flex="auto"> {{ config.record ? config.record.name : '' }}</a-col>
            <a-col flex="300px"><a-input-search placeholder="请输入标签名称搜索"/></a-col>
          </a-row>
        </a-col>
        <a-col :span="24">
          <a-row type="flex">
            <a-col flex="auto" style="text-align: center;">
              <a-anchor @change="(e)=>{checkCate = e}">
                <a-anchor-link v-for="cate in category" :key="cate.id" :href="'#' + cate.number" :title="cate.name"/>
              </a-anchor>
            </a-col>
            <a-col flex="700px" style="">
              <div v-for="tag in tagShow" :key="tag.value" :id="tag.value">
                <a-space direction="vertical" >
                  <div v-if="!checkCate.includes(tag.value)">{{ tag.label }} ({{ tag.select_type === '0'?'单选':'多选' }})</div>
                  <a v-else style="cursor: auto">{{ tag.label }} ({{ tag.select_type === '0'?'单选':'多选' }})</a>
                  <div>
                    <a-tag
                      style="margin-bottom: 5px"
                      :color="tagData.includes(tagItem.label) ? '' : 'purple'"
                      @click="()=>{
                        if(!tagData.includes(tagItem.label)){
                          tagData.push(tagItem.label)
                        }
                      }"
                      v-for="(tagItem,tagIndex) in tag.children"
                      :key="tagIndex" >{{ tagItem.label }}</a-tag>
                  </div>
                </a-space>
                <a-divider style="margin: 8px 0"/>
              </div>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <div class="bbar" style="text-align: left">
        <a-row type="flex" align="middle">
          <a-col flex="auto">
            <span>标签颜色提示 : </span>
            <a-tag color="green" >自动标签</a-tag>
            <a-tag color="purple" >手动标签</a-tag>
            <a-tag color="red" >外部标签</a-tag>
            <a-tag>已选标签</a-tag>
          </a-col>
          <a-col flex="200px" style="text-align: right">
            <a-button type="primary" @click="handleSubmit">保存</a-button>
            <a-button @click="visible=!visible">关闭</a-button>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { Anchor } from 'ant-design-vue'
Vue.use(Anchor)
export default {
  data () {
    return {
      config: {},
      tagData: [],
      category: [],
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      options: [],
      data: {},
      tagShow: [],
      checkCate: '',
      parameter: {
        pageNo: 1,
        pageSize: 999,
        sortField: 'id',
        sortOrder: 'descend'
      }
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.config = config
      this.tagData = config.tagData
      this.axios({
        url: '/admin/Tag/categoryInit',
        params: this.parameter
      }).then(res => {
        this.loading = false
        this.category = res.result.data.filter(item => item.tag_type === '0')
        if (config.field) {
          const rnumber = config.field.setting.form.tagSetting.rnumber
          this.category = this.category.filter(item => rnumber.includes(item.number))
        }
      })
      this.axios({
        url: 'admin/Tag/tagOption'
      }).then(res => {
        this.tagShow = res.result.option.filter(item => item.tag_type === '0')
        if (config.field) {
          const rnumber = config.field.setting.form.tagSetting.rnumber
          this.tagShow = this.tagShow.filter(item => rnumber.includes(item.value))
        }
      })
    },
    closeTab (tagItem) {
      const tags = this.tagData.filter(tag => tag !== tagItem)
      this.tagData = tags
    },
    handleSubmit () {
      this.$emit('ok', this.tagData)
      this.visible = false
      this.$message.success('操作成功')
    }
  }
}
</script>
