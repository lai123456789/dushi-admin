<template>
  <div>
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-popover v-model="selectshow" :trigger="fieldrule === 'readonly'?'':'click'" placement="bottomLeft">
          <a-form-item>
            <a-input
              read-only
              :disabled="fieldrule === 'readonly'"
              @click.stop="changeStatus"
              :size="size"
              v-model="address"
              :placeholder="fieldrule === 'readonly' ? '' : '请选择地址'"
              :style="fieldrule ? {}:{ cursor: 'pointer' }"/>
          </a-form-item>
          <div slot="content" :style="{ width: '440px' }">
            <a-select
              showSearch
              :value="undefined"
              style="width: 100%"
              placeholder="请输入地址关键字进行搜索"
              allowClear
              :filter-option="false"
              :not-found-content="fetching ? undefined : null"
              @search="searchAddress"
              @popupScroll="popupScroll"
              @change="(e)=>{if(!e){searchdata = []}}"
            >
              <a-spin v-if="fetching" slot="notFoundContent" size="small" />
              <a-select-option v-for="search in searchdata" :key="search.number" @click="setValue(search)" :value="search.number">
                {{ search.full_name }}
              </a-select-option>
            </a-select>
            <a-tabs size="small" v-model="activeKey">
              <a-tab-pane key="1" tab="省">
                <div style="">
                  <a-row>
                    <a-col v-for="value in province" :key="value.number" :span="6">
                      <a-button
                        size="small"
                        @click="firstSelect('province', value.number, value.full_name, value.full_number)"
                        style="cursor: pointer; border: none;"
                        :type="value.number === provinceselect ? 'primary' : ''">{{ value.name }}</a-button>
                    </a-col>
                  </a-row>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab="市" v-if="series !== '1'">
                <a-row>
                  <a-col v-for="value in city" :key="value.number" :span="6">
                    <a-button
                      size="small"
                      @click="firstSelect('city', value.number, value.full_name, value.full_number)"
                      style="cursor: pointer; border: none"
                      :type="value.number === cityselect ? 'primary' : ''">{{ value.name }}</a-button>
                  </a-col>
                </a-row>
              </a-tab-pane>
              <a-tab-pane key="3" tab="区" v-if="series !== '1' && series !== '2' ">
                <a-row>
                  <a-col v-for="value in area" :key="value.number" :span="6">
                    <a-button
                      size="small"
                      @click="firstSelect('area', value.number, value.full_name, value.full_number)"
                      style="cursor: pointer; border: none"
                      :type="value.number === areaselect ? 'primary' : ''">{{ value.name }}</a-button>
                  </a-col>
                </a-row>
              </a-tab-pane>
              <a-tab-pane key="4" tab="街道" v-if="series !== '1' && series !== '2' && series !== '3'">
                <a-row>
                  <a-col v-for="value in county" :key="value.number" :span="6">
                    <a-button
                      size="small"
                      @click="firstSelect('county', value.number, value.full_name, value.full_number)"
                      style="cursor: pointer; border: none"
                      :type="value.number === countyselect ? 'primary' : ''">{{ value.name }}</a-button>
                  </a-col>
                </a-row>
              </a-tab-pane>
              <a-button slot="tabBarExtraContent" type="danger" @click="resetClear" ghost size="small">清除</a-button>
            </a-tabs>
          </div>
        </a-popover>
      </a-form>
    </a-spin>
  </div>
</template>
<script>
import debounce from 'lodash/debounce'
export default {
  props: {
    series: {
      type: String,
      default: () => '1'
    },
    fieldType: {
      type: String,
      default: () => ''
    },
    defaultValue: {
      type: String,
      default: () => ''
    },
    alias: {
      type: String,
      default: () => ''
    },
    display: {
      type: String,
      default: () => ''
    },
    fieldrule: {
      type: String,
      default: () => ''
    },
    size: {
      type: String,
      default: () => 'default'
    }
  },
  data () {
    this.searchAddress = debounce(this.searchAddress, 800)
    return {
      selectshow: false,
      loading: false,
      searchValue: '',
      styleGround: {},
      searchdata: [],
      checkNumber: this.defaultValue,
      lastFetchId: 0,
      fetching: false,
      scrollStats: true,
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      province: [],
      provinceselect: '',
      city: [],
      cityselect: '',
      area: [],
      areaselect: '',
      county: [],
      countyselect: '',
      address: '',
      sendValue: '',
      activeKey: '1',
      form: this.$form.createForm(this)
    }
  },
  watch: {
    display: {
      handler (newValue) {
        this.checkNumber = this.defaultValue
        if (this.fieldType !== 'search') {
          this.getAddress()
        }
      }
    }
  },
  created () {
    this.province = []
    this.provinceselect = ''
    this.city = []
    this.cityselect = ''
    this.area = []
    this.areaselect = ''
    this.county = []
    this.countyselect = ''
    this.address = ''
    this.sendValue = ''
    this.activeKey = '1'
    if (this.fieldType === 'search') {
      this.getAddress()
    } else if (this.display) {
      this.address = this.display
      this.sendValue = this.defaultValue
    } else if (this.fieldType === 'field') {
      this.getAddress()
    }
  },
  methods: {
    searchAddress (val) {
      this.searchValue = val
      this.page.pageNo = 1
      this.scrollStats = true
      if (val) {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.fetching = true
        this.axios({
          url: '/admin/dict/getCascaderSearch',
          params: Object.assign(this.page, { type: 'address', series: this.series, search_name: val })
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
    getAddressScroll () {
      this.axios({
        url: '/admin/dict/getCascaderSearch',
        params: Object.assign(this.page, { type: 'address', series: this.series, search_name: this.searchValue })
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
        this.getAddressScroll()
      }
    },
    reset () {
      this.searchdata = []
    },
    resetClear () {
      this.address = ''
      this.checkNumber = ''
      this.activeKey = '1'
      this.provinceselect = ''
      this.city = []
      this.cityselect = ''
      this.area = []
      this.areaselect = ''
      this.county = []
      this.countyselect = ''
      this.$emit('send', '', '', this.alias)
      this.sendValue = ''
    },
    setValue (search) {
      this.checkNumber = search.number
      this.address = search.full_name
      this.sendValue = search.number
      this.selectshow = false
      this.activeKey = '1'
      this.$emit('send', search.full_name, search.number, this.alias, search.full_number)
    },
    changeStatus () {
      this.selectshow = !this.selectshow
      if (this.activeKey === '1') {
        this.getAddress()
      }
    },
    getAddress () {
      this.axios({
        url: '/admin/address/getAddress',
        params: { number: this.checkNumber }
      }).then(res => {
        this.province = res.result
        this.city = []
        this.cityselect = ''
        if (this.checkNumber) {
          res.result.forEach(item => {
            if (item.children) {
              this.provinceselect = item.number
              this.sendValue = item.number
              this.address = item.full_name
              if (this.series !== '1') {
                this.city = item.children
                this.area = []
                this.areaselect = ''
                item.children.forEach(cityItem => {
                  if (cityItem.children) {
                    this.cityselect = cityItem.number
                    this.sendValue = cityItem.number
                    this.address = cityItem.full_name
                    if (this.series !== '2') {
                      this.area = cityItem.children
                      this.county = []
                      this.countyselect = ''
                      cityItem.children.forEach(areaItem => {
                        if (areaItem.children) {
                          this.areaselect = areaItem.number
                          this.sendValue = areaItem.number
                          this.address = areaItem.full_name
                          if (this.series !== '3') {
                            this.county = areaItem.children
                            areaItem.children.forEach(countyitem => {
                              if (countyitem.number === this.checkNumber) {
                                this.countyselect = countyitem.number
                                this.sendValue = countyitem.number
                                this.address = countyitem.full_name
                              }
                            })
                          }
                        } else if (areaItem.number === this.checkNumber) {
                          this.areaselect = areaItem.number
                          this.address = areaItem.full_name
                          this.firstSelect('area', areaItem.number, areaItem.full_name, areaItem.full_number, 'check')
                        }
                      })
                    }
                  } else if (cityItem.number === this.checkNumber) {
                    this.cityselect = cityItem.number
                    this.address = cityItem.full_name
                    this.firstSelect('city', cityItem.number, cityItem.full_name, cityItem.full_number, 'check')
                  }
                })
              }
            } else if (item.number === this.checkNumber) {
              this.provinceselect = item.number
              this.address = item.full_name
              this.sendValue = item.number
              this.firstSelect('province', item.number, item.full_name, item.full_number, 'check')
            }
          })
        }
        if (this.countyselect) {
          this.activeKey = '4'
        } else if (this.areaselect) {
          this.activeKey = '3'
        } else if (this.cityselect) {
          this.activeKey = '2'
        } else {
          this.activeKey = '1'
        }
      })
    },
    firstSelect (type, value, label, allValue, check) {
      if (type === 'province') {
        if (this.provinceselect === value && this.city.length !== 0) {
          this.activeKey = '2'
        } else {
          this.provinceselect = value
          this.checkNumber = value
          this.address = label
          this.sendValue = value
          this.$emit('send', label, value, this.alias, allValue)
          this.axios({
            url: '/admin/address/getAddressChildren',
            params: { parent_number: value }
          }).then(res => {
            this.city = res.result
            this.cityselect = ''
            if (this.series !== '1' && res.result.length > 0) {
              this.activeKey = '2'
            } else if (!check) {
              this.selectshow = false
            }
            this.area = []
            this.areaselect = ''
            this.county = []
            this.countyselect = ''
          })
        }
      } else if (type === 'city') {
        if (this.cityselect === value && this.area.length !== 0) {
          this.activeKey = '3'
        } else {
          this.cityselect = value
          this.checkNumber = value
          this.address = label
          this.sendValue = value
          this.$emit('send', label, value, this.alias, allValue)
          this.axios({
            url: '/admin/address/getAddressChildren',
            params: { parent_number: value }
          }).then(res => {
            this.area = res.result
            this.areaselect = ''
            if ((this.series === '2' || res.result.length === 0) && !check) {
              this.selectshow = false
            }
            if (res.result.length > 0) {
              this.activeKey = '3'
            }
            this.county = []
            this.countyselect = ''
          })
        }
      } else if (type === 'area') {
        if (this.areaselect === value && this.county.length !== 0) {
          this.activeKey = '4'
        } else {
          this.address = label
          this.areaselect = value
          this.checkNumber = value
          this.sendValue = value
          this.$emit('send', label, value, this.alias, allValue)
          this.axios({
            url: '/admin/address/getAddressChildren',
            params: { parent_number: value }
          }).then(res => {
            this.county = res.result
            this.countyselect = ''
            if ((this.series === '3' || res.result.length === 0) && !check) {
              this.selectshow = false
            }
            if (res.result.length > 0 && this.series === '4') {
              this.activeKey = '4'
            }
          })
        }
      } else if (type === 'county') {
        this.address = label
        this.countyselect = value
        this.checkNumber = value
        this.sendValue = value
        this.$emit('send', label, value, this.alias, allValue)
        this.selectshow = false
      }
    }
  }
}
</script>
