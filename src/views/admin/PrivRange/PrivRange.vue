<template>
  <a-drawer
    title="访问范围设置"
    :width="1200"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <template v-if="config.page !== 'user'">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="部门负责人设置">
            <a-checkbox-group :default-value="departLead" @change="getDepartLead">
              <a-checkbox v-for="(item, index) of departSetList" :key="index" :value="item.value" :disabled="item.disabled" >
                {{ item.name }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="部门成员设置">
            <a-checkbox-group :default-value="departUser" @change="getDepartUser">
              <a-checkbox v-for="(item, index) of setList" :key="index" :value="item.value" :disabled="item.disabled" >
                {{ item.name }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="覆盖所属部门设置">
            <a-switch @change="getCover" :defaultChecked="cover === '1' ? true : false"/>
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="快捷设置">
            <a-checkbox-group :default-value="departUser" @change="getDepartUser">
              <a-checkbox v-for="(item, index) of setList" :key="index" :value="item.value" :disabled="item.disabled" >
                {{ item.name }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </template>
        <a-divider orientation="left">
          追加范围设置
        </a-divider>
        <a-row :gutter="20">
          <a-col :span="14">
            <a-card>
              <a-tabs default-active-key="user" >
                <a-tab-pane key="user" tab="用户">
                  <priv-user ref="privUser" @ok="listPush" />
                </a-tab-pane>
                <a-tab-pane key="depart" tab="部门">
                  <priv-depart ref="privDepart" @ok="listPush" />
                </a-tab-pane>
                <a-tab-pane key="role" tab="角色">
                  <priv-Role ref="privRole" @ok="listPush" />
                </a-tab-pane>
              </a-tabs>
            </a-card>
          </a-col>
          <a-col :span="10">
            <a-popconfirm
              title="您确定要清空所有记录吗？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="deleteAll"
            >
              <a-button style="margin-bottom: 10px">清空</a-button>
            </a-popconfirm>
            <a-table size="small" rowKey="id" :columns="columns" :dataSource="list" :pagination="{ pageSize: 20 }">
              <div slot="action" slot-scope="text, record">
                <a @click="handleDelete(record)">删除</a>
              </div>
            </a-table>
          </a-col>
        </a-row>
      </a-form>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
export default {
  components: {
    PrivUser: () => import('./PrivUser'),
    PrivDepart: () => import('./PrivDepart'),
    PrivRole: () => import('./PrivRole')
  },
  props: {
    setting: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      config: {},
      departSetList: [
        { value: 'own', name: '自己', disabled: true },
        { value: 'depart', name: '本部门(不含子部门)', disabled: false },
        { value: 'subDepart', name: '本部门子部门', disabled: false },
        { value: 'ownRole', name: '本角色', disabled: false },
        { value: 'all', name: '所有人', disabled: false }
      ],
      setList: [
        { value: 'own', name: '自己', disabled: true },
        { value: 'depart', name: '本部门(不含子部门)', disabled: false },
        { value: 'subDepart', name: '本部门子部门', disabled: false },
        { value: 'ownRole', name: '本角色', disabled: false },
        { value: 'all', name: '所有人', disabled: false }
      ],
      list: [],
      columns: [ {
        title: '名称',
        dataIndex: 'name',
        width: 200
      }, {
        title: '类型',
        dataIndex: 'type',
        customRender: (text) => {
          if (text === 'user') {
            return '用户'
          } else if (text === 'role') {
            return '角色'
          } else {
            return '部门'
          }
        }
      }, {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        scopedSlots: { customRender: 'action' }
      }],
      privSetting: {},
      departLead: [],
      departUser: [],
      cover: '0'
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.config = config
      this.cover = config.page === 'user' ? this.setting.cover : '0'
      this.departLead = this.setting.departLead ? this.setting.departLead : ['own']
      // 兼容上个版本， 默认选中depart且不能取消
      this.departLead = [...this.departLead, 'depart']
      this.departUser = this.setting.departUser ? this.setting.departUser : ['own']
      this.list = this.setting.list && this.setting.list.length !== 0 ? this.setting.list : []
    },
    getDepartLead (val) {
      this.departLead = val
    },
    getDepartUser (val) {
      this.departUser = val
    },
    getCover (val) {
      this.cover = val ? '1' : '0'
    },
    listPush (data) {
      if (this.list.every(item => item.id !== data.id)) {
        this.list.splice(this.list.length, 0, data)
      }
    },
    // 删除单个数据
    handleDelete (record) {
      this.list = this.list.filter(item => item.id !== record.id)
    },
    // 清空
    deleteAll () {
      this.list = []
    },
    handleSubmit () {
      if (this.config.page !== 'user') {
        this.privSetting.departLead = this.departLead
      } else {
        this.privSetting.cover = this.cover
      }
      this.privSetting.departUser = this.departUser
      this.privSetting.list = this.list
      this.visible = false
      this.$emit('ok', this.privSetting)
    }
  }
}
</script>
