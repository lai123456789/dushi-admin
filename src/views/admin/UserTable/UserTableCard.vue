<template>
  <a-spin :spinning="loading">
    <a-row class="cardType" :gutter="[0, 10]" v-if="cardData.length >0">
      <a-col :span="24" v-for="(data, index) in cardData" :key="index" >
        <a-col :span="24">
          <user-table-card-build
            v-for="(item, indexs) in cardTemplate"
            :key="indexs"
            :data="data"
            :record="item"
          />
        </a-col>
        <a-col :span="24" style="text-align: right; margin-top: -16px; border: 1px solid #e8e8e8" v-if="tbar.every(item => item.name !== '不显示选中')">
          <a-space>
            <a-button size="small" @click="showDetails(data)" v-if="editAble">详情</a-button>
            <!-- <a-button style="margin-right: 5px" size="small" @click="sendData(data)">选中</a-button> -->
          </a-space>
        </a-col>
      </a-col>
      <a-col :span="24" style="text-align: center" v-if="cardData.length !== 0 && cardData.length >= pagesize">
        <a v-if="mrorLoading" @click="getCardData">加载更多数据</a><span v-else>没有更多数据</span>
      </a-col>
    </a-row>
    <a-empty v-else />
    <!-- 数据表单 -->
    <user-table-form ref="userTableForm" @ok="() =>{ cardData =[], sorter.pageNo = 1, getCardData() }"/>
  </a-spin>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  components: {
    UserTableCardBuild: () => import('./UserTableCardBuild'),
    UserTableForm: () => import('./UserTableForm')
  },
  computed: {
    ...mapGetters(['setting'])
  },
  props: {
    cardTemplate: {
      type: Array,
      default () {
        return []
      },
      required: true
    },
    dataSource: {
      type: String,
      default () {
        return ''
      },
      required: false
    },
    params: {
      type: Object,
      default () {
        return {
          tplviewid: ''
        }
      },
      required: true
    },
    sorter: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    tplviewid: {
      type: String,
      default () {
        return ''
      },
      required: true
    },
    viewThis: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    pagesize: {
      type: Number,
      default () {
        return 10
      }
    },
    actionArray: {
      type: Array,
      default () {
        return []
      }
    },
    tbar: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      mrorLoading: true,
      loading: false,
      editAble: false,
      queryParam: {},
      cardData: []
    }
  },
  created () {
    this.getCardData()
    this.sorter.pageSize = this.pagesize
    this.sorter.pageNo = 1
    const array = this.actionArray[0] ? this.actionArray[0].rowAction : []
    array.forEach(item => {
      if (item.name === '编辑') {
        this.editAble = true
      }
    })
  },
  methods: {
    // 加载表格数据
    getCardData () {
      this.loading = true
      if (this.params.jointable && !this.params.jointable.field_val) {
        this.viewThis.templateAll.forEach(item => {
          if (item.field && item.field.alias === this.params.jointable.thmdField) {
            this.params.jointable.field_val = item.field.value
          }
        })
      }
      if (this.viewThis.parentParams.popscreenType && this.viewThis.parentParams) {
        this.sorter['gdlxdh'] = this.viewThis.form.getFieldsValue()[this.viewThis.tableName]['gdlxdh']
      }
      this.axios({
        url: this.dataSource || '/admin/UserTable/init',
        params: this.sorter,
        data: Object.assign(this.queryParam, this.params)
      }).then(res => {
        this.loading = false
        if (res.result.data.length === 0) {
          this.mrorLoading = false
        } else {
          this.cardData = [...this.cardData, ...res.result.data]
          this.sorter.pageNo++
        }
      })
    },
    sendData (data) {
      const obj = {}
      const sendData = []
      for (const i in data) {
        const arrData = {}
        arrData.alias = i
        arrData.value = data[i]
        sendData.push(arrData)
        obj[this.viewThis.tableName + '[' + i + ']'] = data[i]
      }
      let sonmdField = ''
      if (this.params.jointable.length === 0) {
        const getTemplate = (array) => {
          array.forEach((item, index) => {
            if (item.columns) {
              getTemplate(item.columns)
            } else if (item.trs) {
              getTemplate(item.trs)
            } else if (item.list) {
              getTemplate(item.list)
            } else {
              if (item.formtype === 'address') {
                for (const i in obj) {
                  if (item.field && (this.viewThis.tableName + '[' + item.field.alias + ']') === i) {
                    const data = {
                      display: obj[this.viewThis.tableName + '[' + item.field.alias + ']'],
                      address: obj[this.viewThis.tableName + '[_' + item.field.alias + '_]']
                    }
                    this.$set(item.field, 'value', data)
                  }
                }
              } else if (item.formtype === 'cascader') {
                for (const i in obj) {
                  if (item.field && (this.viewThis.tableName + '[' + item.field.alias + ']') === i) {
                    const data = {
                      display: '',
                      value: obj[this.viewThis.tableName + '[' + item.field.alias + ']']
                    }
                    this.$set(item.field, 'value', data)
                  }
                }
              } else if (['image', 'file'].includes(item.formtype)) {
                for (const i in obj) {
                  if (item.field && (this.viewThis.tableName + '[' + item.field.alias + ']') === i) {
                    const img = JSON.parse(JSON.stringify(obj[this.viewThis.tableName + '[' + item.field.alias + ']']))
                    obj[this.viewThis.tableName + '[' + item.field.alias + ']'] = img.map((imgItem, imgIndex) => {
                      const imageObj = {
                        name: imgItem.fileName,
                        response: {
                          code: 0,
                          message: '',
                          result: {
                            fileName: imgItem.fileName,
                            filePath: imgItem.filePath
                          },
                          timestamp: new Date().valueOf()
                        },
                        status: 'done',
                        uid: new Date().valueOf(),
                        url: this.setting.rootUrl + imgItem.filePath
                      }
                      return imageObj
                    })
                  }
                }
              }
            }
          })
        }
        getTemplate(this.viewThis.template)
        this.viewThis.form.setFieldsValue(obj)
      } else {
        sonmdField = this.params.jointable.sonmdField
        const sonmdData = sendData.find(item => item.alias === sonmdField)
        sendData.push({
          alias: this.params.jointable.field_son,
          value: sonmdData.value
        })
        const getTemplate = (array) => {
          array.forEach((item, index) => {
            if (item.columns) {
              getTemplate(item.columns)
            } else if (item.trs) {
              getTemplate(item.trs)
            } else if (item.list) {
              getTemplate(item.list)
            } else {
              if (item.formtype === 'address') {
                sendData.forEach(sendItem => {
                  if (sendItem.alias === item.field.alias) {
                    const data = {
                      display: obj[this.viewThis.tableName + '[' + item.field.alias + ']'],
                      address: obj[this.viewThis.tableName + '[_' + item.field.alias + '_]']
                    }
                    this.$set(sendItem, 'value', data)
                  }
                })
              } else if (item.formtype === 'cascader') {
                sendData.forEach(sendItem => {
                  if (sendItem.alias === item.field.alias) {
                    const data = {
                      display: '',
                      value: obj[this.viewThis.tableName + '[' + item.field.alias + ']']
                    }
                    this.$set(sendItem, 'value', data)
                  }
                })
              } else if (item.formtype === 'combobox') {
                sendData.forEach(sendItem => {
                  if (sendItem.alias === item.field.alias) {
                    const value = obj[this.viewThis.tableName + '[_' + item.field.alias + '_]']
                    this.$set(sendItem, 'value', value)
                  }
                })
              }
              if (item.field && item.field.alias === sonmdField) {
                this.$nextTick(() => {
                  this.viewThis.$refs.buildBlocks[0].getVal(sendData, item.field.alias, item.field.setting)
                })
              }
            }
          })
        }
        getTemplate(this.viewThis.template)
      }
    },
    showDetails (data) {
      const parameter = {
        title: '编辑', url: '/admin/UserTable/edit', width: 1200, record: data, tpl: this.tplviewid, cardType: 'table_card_list'
      }
      this.$nextTick(() => {
        this.$refs.userTableForm.show(parameter)
      })
    }
  }
}
</script>
<style scoped>
.cardType::-webkit-scrollbar {
    display: none;
}
.cardType {
  height: calc(100vh - 140px);
  overflow-x: hidden;
  overflow: auto;
}
</style>
