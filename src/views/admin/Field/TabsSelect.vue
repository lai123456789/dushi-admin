<template>
  <div>
    <a-form :form="form">
      <a-popover v-model="selectshow" :trigger="fieldrule === 'readonly' ? '' : 'click'" placement="bottomLeft">
        <a-form-item>
          <a-input
            read-only
            @click.stop="changeStatus"
            :disabled="fieldrule === 'readonly'"
            v-model="contents"
            :size="size"
            :placeholder="fieldrule === 'readonly'? '' : '请选择'"
            :style="fieldrule === 'readonly'? {}:{ cursor: 'pointer' }">
            <a-icon v-if="field && field.setting && field.setting.form.latterIcon === 'custom'" slot="suffix" @click.stop="changeStatus" :type="field.setting.form.latterVal.type" :theme="field.setting.form.latterVal.theme" />
            <span v-else-if="field && field.setting && field.setting.form.latterIcon === 'string'" slot="suffix">{{ field.setting.form.latterVal.type }}</span>
          </a-input>
        </a-form-item>
        <div slot="content" :style="{ width: '600px' }">
          <a-select
            showSearch
            :value="undefined"
            style="width: 100%"
            placeholder="请输入关键字进行搜索"
            allowClear
            :filter-option="false"
            :not-found-content="fetching ? undefined : null"
            @search="searchTabs"
            @popupScroll="popupScroll"
            @change="(e)=>{if(!e){searchdata = []}}"
          >
            <a-spin v-if="fetching" slot="notFoundContent" size="small" />
            <a-select-option v-for="search in searchdata" :key="search.number" @click="setValue(search)" :value="search.number">
              {{ search.full_name }}
            </a-select-option>
          </a-select>
          <a-spin :spinning="loading">
            <a-tabs size="small" v-model="activeKey">
              <a-tab-pane :tab="tabs.tab" v-for="(tabs, key) in showData" :key="key">
                <a-row v-if="tabs.data.length > 0">
                  <a-col v-for="value in tabs.data" :key="value.number" :span="6">
                    <a-tooltip placement="bottom">
                      <template slot="title">
                        {{ value.name }}
                      </template>
                      <a-button
                        size="small"
                        @click="getChildren(tabs, value.number, value.full_name, value.full_number)"
                        style="cursor: pointer; border: none;"
                        :type="value.number === tabs.select ? 'primary' : ''">{{ value.name }}</a-button>
                    </a-tooltip>
                  </a-col>
                </a-row>
                <div v-else>
                  暂无数据
                </div>
              </a-tab-pane>
              <a-button slot="tabBarExtraContent" type="danger" @click="resetClear" ghost size="small">清除</a-button>
            </a-tabs>
          </a-spin>
        </div>
      </a-popover>
    </a-form>
  </div>
</template>
<script>
import debounce from 'lodash/debounce'
export default {
  props: {
    field: {
      type: Object,
      default: () => {}
    },
    valueKey: {
      type: String,
      default: () => ''
    },
    defaultValue: {
      type: String,
      default: () => ''
    },
    action: {
      type: String,
      default: () => {}
    },
    alias: {
      type: String,
      default: () => ''
    },
    fieldType: {
      type: String,
      default: () => ''
    },
    writeBack: {
      type: Array,
      default: () => []
    },
    fieldrule: {
      type: String,
      default: () => ''
    },
    display: {
      type: String,
      default: () => ''
    },
    size: {
      type: String,
      default: () => 'default'
    },
    searchType: {
      type: String,
      default: () => ''
    },
    viewThis: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    this.searchTabs = debounce(this.searchTabs, 800)
    return {
      selectshow: false,
      loading: false,
      searchValue: '',
      styleGround: {},
      activeKey: 0,
      sendValue: '',
      searchdata: [],
      allValue: '',
      contents: '',
      lastFetchId: 0,
      fetching: false,
      scrollStats: true,
      firstIn: false,
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      form: this.$form.createForm(this),
      showData: [{ tab: '1级', data: [] }]
    }
  },
  watch: {
    writeBack: {
      handler (newValue) {
        const tabs = JSON.parse(JSON.stringify(newValue))
        this.showData.forEach((item, index) => {
          item.tab = tabs[index] ? tabs[index].tab : (index + 1) + '级'
        })
      },
      deep: true
    },
    defaultValue: {
      handler (newValue) {
        if (this.fieldType !== 'search') {
          this.loading = true
          this.axios({
            url: '/admin/dict/getCascader/',
            params: { rnumber: this.valueKey || 1, number: newValue }
          }).then(res => {
            this.loading = false
            this.childrenIn(res.result)
          })
        }
      }
    },
    immediate: true
  },
  mounted () {
    this.contents = this.field && this.field.value ? (this.field.value.display ? this.field.value.display : this.display) : ''
    if (this.fieldType === 'field' && this.defaultValue) {
      this.loading = true
      this.firstIn = false
      this.axios({
        url: '/admin/dict/getCascader/',
        params: { rnumber: this.valueKey || 1, number: this.defaultValue }
      }).then(res => {
        this.loading = false
        this.firstIn = true
      })
    }
  },
  methods: {
    searchTabs (val) {
      this.searchValue = val
      this.page.pageNo = 1
      this.scrollStats = true
      if (val) {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.fetching = true
        this.axios({
          url: '/admin/dict/getCascaderSearch',
          params: Object.assign(this.page, { type: 'dict', src: this.valueKey, search_name: val })
        }).then(res => {
          if (fetchId !== this.lastFetchId) {
            return
          }
          this.searchdata = res.result.data
          this.fetching = false
        })
      } else {
        this.searchdata = []
      }
    },
    getTabsScroll () {
      this.axios({
        url: '/admin/dict/getCascaderSearch',
        params: Object.assign(this.page, { type: 'dict', src: this.valueKey, search_name: this.searchValue })
      }).then(res => {
        if (!res.result.data.length) {
          this.scrollStats = false
        }
        this.searchdata = [...this.searchdata, ...res.result.data]
      })
    },
    popupScroll (e) {
      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight
      const clientHeight = e.target.clientHeight
      const scrollBottom = scrollHeight - clientHeight - scrollTop
      if (scrollBottom < 1 && this.scrollStats && this.searchValue) {
        this.page.pageNo++
        this.getTabsScroll()
      }
    },
    childrenIn (data) {
      this.showData[this.activeKey].data = data
      this.showData[this.activeKey].tab = this.writeBack[this.activeKey] ? this.writeBack[this.activeKey].tab : (this.activeKey + 1) + '级'
      data.forEach(item => {
        if (item.children) {
          this.showData[this.activeKey].select = item.number
          this.contents = item.full_name
          this.allValue = item.full_number
          if (item.children.length > 0) {
            this.$emit('send', item.number, this.alias, item.full_name, 'true', item.full_number)
            this.showData.splice(this.activeKey + 1, 0, { data: [], tab: (this.activeKey + 2) + '级' })
            this.activeKey++
            this.childrenIn(item.children)
          } else {
            this.$emit('send', item.number, this.alias, item.full_name, '', item.full_number)
          }
        } else if (item.number === this.defaultValue) {
          this.contents = item.full_name
          this.allValue = item.full_number
          this.showData[this.activeKey].select = item.number
          this.getChildren(item, item.number, item.full_name, item.full_number)
          this.$emit('send', item.number, this.alias, item.full_name, '', item.full_number)
        }
      })
    },
    reset () {
      this.searchdata = []
    },
    resetClear () {
      this.showData.splice(1, this.showData.length - 1)
      this.showData[0].select = ''
      this.contents = ''
      this.allValue = ''
      this.activeKey = 0
      this.$emit('send', '', this.alias)
    },
    setValue (search) {
      this.axios({
        url: '/admin/dict/getCascaderChildren/',
        params: { parent_number: search.number }
      }).then(res => {
        this.selectshow = false
        this.contents = search.full_name
        this.allValue = search.full_number
        this.searchdata = []
        let str = ''
        if (res.result.length > 0) {
          str = 'true'
        }
        this.$emit('send', search.number, this.alias, search.name, str, search.full_number)
      })
    },
    changeStatus () {
      if (this.action === 'edit' && this.showData[0].data.length === 0) {
        this.loading = true
        this.axios({
          url: '/admin/dict/getCascader/',
          params: { rnumber: this.valueKey, number: this.defaultValue }
        }).then(res => {
          this.loading = false
          this.childrenIn(res.result)
        })
      } else if (this.firstIn && this.showData[0].data.length === 0) {
        this.loading = true
        this.axios({
          url: '/admin/dict/getCascader/',
          params: { rnumber: this.valueKey, number: this.defaultValue }
        }).then(res => {
          this.loading = false
          this.childrenIn(res.result)
        })
      } else if (this.showData[0].data.length === 0) {
        this.loading = true
        this.axios({
          url: '/admin/dict/getCascaderChildren/',
          params: { parent_number: this.valueKey || 1 }
        }).then(res => {
          this.loading = false
          this.showData[0].data = res.result
          this.showData[0].tab = this.writeBack[0].tab
        })
      }
      this.selectshow = !this.selectshow
    },
    getChildren (tabs, value, name, allValue) {
      this.$set(tabs, 'select', value)
      this.contents = name
      this.allValue = allValue
      this.loading = true
      this.axios({
        url: '/admin/dict/getCascaderChildren/',
        params: { parent_number: value }
      }).then(res => {
        this.loading = false
        if (res.result.length > 0) {
          this.$emit('send', value, this.alias, name, 'true', allValue)
        } else if (this.defaultValue === value) {
          this.$emit('send', value, this.alias, name, '', allValue)
        } else {
          this.selectshow = false
          this.$emit('send', value, this.alias, name, '', allValue)
        }
        if (!this.showData[this.activeKey + 1] && res.result.length > 0) {
          this.showData.splice(this.activeKey + 1, this.showData.length - (this.activeKey + 1), { data: [], tab: '' })
          this.$set(this.showData[this.activeKey + 1], 'data', res.result)
          this.$set(this.showData[this.activeKey + 1], 'tab', this.writeBack[this.activeKey + 1] ? this.writeBack[this.activeKey + 1].tab : this.activeKey + 2 + '级')
          this.activeKey = this.activeKey + 1
        } else if (res.result.length > 0) {
          this.showData[this.activeKey + 1].data = res.result
          this.showData.splice(this.activeKey + 2, this.showData.length - (this.activeKey + 1))
          this.activeKey = this.activeKey + 1
        } else {
          this.showData.splice(this.activeKey + 1, this.showData.length - (this.activeKey + 1))
        }
      })
    }
  }
}
</script>
