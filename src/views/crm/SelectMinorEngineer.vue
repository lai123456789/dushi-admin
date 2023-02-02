<template>
  <a-drawer
    :destroyOnClose="true"
    title="选择辅修工程师"
    :width="1300"
    :visible="visible"
    @close="visible = false; $parent.$parent.formThis.pageLoading = false">
    <a-spin :spinning="loading">
      <a-form layout="inline" >
        <a-row :gutter="8" type="flex" align="middle">
          <a-col :span="5">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.searchString.xm" placeholder=""/>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="电话号码">
              <a-input v-model.trim="queryParam.searchString.dhhm" placeholder=""/>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item style="width: 100%" label="岗位" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
              <a-select
                mode="multiple"
                allowClear
                placeholder="请选择"
                @change="(value) => {queryParam.searchString.gw = value}"
                :showSearch="false"
                v-model="queryParam.searchString.gw"
                changeOnSelect
              >
                <a-select-option v-for="(item, key) in gwList" :key="key" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item style="width: 100%" label="技术等级" :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }">
              <a-select
                mode="multiple"
                allowClear
                placeholder="请选择"
                @change="(value) => {queryParam.searchString.jsdj = value}"
                :showSearch="false"
                v-model="queryParam.searchString.jsdj"
                changeOnSelect
              >
                <a-select-option v-for="(item, key) in jsdjList" :key="key" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="3">
            <a-space>
              <a-button type="primary" @click="$refs.table.refresh(true)">搜索</a-button>
              <a-button @click="queryParam.searchString = {}; $refs.table.refresh(true)" style="margin: 0 8px">重置</a-button>
            </a-space>
          </a-col>
        </a-row>
        <s-table
          style="margin-top: 8px"
          ref="table"
          size="small"
          rowKey="id"
          :columns="columns"
          :data="loadDataTable"
          :rowSelection="rowSelection"
          :sorter="{ field: 'id', order: 'descend' }"
        >
        </s-table>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="submit">提交</a-button>
        <a-button @click="visible=!visible; $parent.$parent.formThis.pageLoading = false">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      loading: false,
      config: '',
      parent: '',
      gwList: [],
      jsdjList: [],
      colLayout: { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 },
      labelCol: { style: 'width: 80px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 80px); display: inline-block;' },
      queryParam: {
        // 工程师信息表
        searchString: {
          ssfgs: ''
        },
        associated: [],
        customColumns: [],
        tplviewid: 'b2ed068b0996174adfa86df412f02ea9'
      },
      // 技术员信息数据
      columns: [ {
        title: '姓名',
        dataIndex: 'xm'
      }, {
        title: '电话号码',
        dataIndex: 'dhhm'
      }, {
        title: '所属部门',
        dataIndex: 'ssbm'
      }, {
        title: '所属分公司',
        dataIndex: 'ssfgs'
      }, {
        title: '岗位',
        dataIndex: 'gw'
      }, {
        title: '职称',
        dataIndex: 'zc'
      }, {
        title: '技术等级',
        dataIndex: 'jsdj'
      }, {
        title: '擅长技能',
        dataIndex: 'szjn'
      }, {
        title: '具备证书',
        dataIndex: 'jbzs'
      }],
      selectedRowKeys: '',
      selectedRows: '',
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        }
      }
    }
  },
  methods: {
    show (config) {
      console.log('config', config)
      this.queryParam.searchString.ssfgs = config.data.crm_xjaz.ssfgs
      this.config = config
      this.visible = true
      this.parent = config.parent
      this.getOption()
      this.getTechnicalGrade()
    },
    // 技术员列表页面渲染
    loadDataTable (parameter) {
      return this.axios({
        url: '/crm/Order/fxgcslb', // '/admin/UserTable/init',
        data: Object.assign(parameter, this.queryParam)
      }).then(res => {
        this.loading = false
        return res.result
      })
    },
    // 获取岗位列表
    getOption () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'gw' }
      }).then(res => {
        this.gwList = res.result
      })
    },
    // 获取技术等级
    getTechnicalGrade () {
      this.axios({
        url: '/admin/dict/getCascaderData/',
        params: { parentNumber: 'jsdj' }
      }).then(res => {
        this.jsdjList = res.result
      })
    },
    submit () {
      const formData = {
        confirm: true,
        // extFormData: Object.assign(this.config.data, { fxgcs_data: this.selectedRows })
        extFormData: { fxgcs_data: this.selectedRows }
      }
      this.visible = false
      this.$parent.$parent.formThis.pageLoading = false
      this.parent.handleSubmit(formData)
    }
  }
}
</script>
