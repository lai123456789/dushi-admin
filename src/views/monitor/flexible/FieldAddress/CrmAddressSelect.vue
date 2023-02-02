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
              placeholder="请选择地址"
              :style="fieldrule ? {}:{ cursor: 'pointer' }"/>
          </a-form-item>
          <div slot="content" :style="{ width: '440px' }">
            <!-- <a-select
              v-model="searchValue"
              style="width: 100%"
              showSearch
              :autoFocus="true"
              :show-arrow="false"
              :not-found-content="null"
              :default-active-first-option="false"
              :dropdownMatchSelectWidth="false"
              @search="searchAddress"
              @blur="reset">
              <a-select-option v-for="i in searchdata" :key="i" @click="setValue" :value="i">
                {{ i }}
              </a-select-option>
            </a-select> -->
            <a-tabs size="small" v-model="activeKey" >
              <a-tab-pane key="1" tab="省">
                <div style="">
                  <a-row>
                    <a-col v-for="value in province" :key="value.id" :span="6">
                      <!-- <a-tooltip placement="bottom">
                        <template slot="title">
                          {{ value.name }}
                        </template> -->
                      <a-button
                        size="small"
                        @click="firstSelect('province', value.id, value.name, value.id)"
                        style="cursor: pointer; border: none;"
                        :type="value.id === provinceselect ? 'primary' : ''">{{ value.name }}</a-button>
                      <!-- </a-tooltip> -->
                    </a-col>
                  </a-row>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab="市" v-if="series !== '1'">
                <a-row>
                  <a-col v-for="value in city" :key="value.id" :span="6">
                    <!-- <a-tooltip placement="bottom">
                      <template slot="title">
                        {{ value.name }}
                      </template> -->
                    <a-button
                      size="small"
                      @click="firstSelect('city', value.id, value.name, value.id)"
                      style="cursor: pointer; border: none"
                      :type="value.id === cityselect ? 'primary' : ''">{{ value.name }}</a-button>
                    <!-- </a-tooltip> -->
                  </a-col>
                </a-row>
              </a-tab-pane>
              <a-tab-pane key="3" tab="区" v-if="series !== '1' && series !== '2' ">
                <a-row>
                  <a-col v-for="value in area" :key="value.id" :span="6">
                    <!-- <a-tooltip placement="bottom">
                      <template slot="title">
                        {{ value.name }}
                      </template> -->
                    <a-button
                      size="small"
                      @click="firstSelect('area', value.id, value.name, value.id)"
                      style="cursor: pointer; border: none"
                      :type="value.id === areaselect ? 'primary' : ''">{{ value.name }}</a-button>
                    <!-- </a-tooltip> -->
                  </a-col>
                </a-row>
              </a-tab-pane>
              <a-tab-pane key="4" tab="街道" v-if="series !== '1' && series !== '2' && series !== '3'">
                <a-row>
                  <a-col v-for="value in county" :key="value.id" :span="6">
                    <!-- <a-tooltip placement="bottom">
                      <template slot="title">
                        {{ value.name }}
                      </template> -->
                    <a-button
                      size="small"
                      @click="firstSelect('county', value.id, value.name, value.id)"
                      style="cursor: pointer; border: none"
                      :type="value.id === countyselect ? 'primary' : ''">{{ value.name }}</a-button>
                    <!-- </a-tooltip> -->
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
    return {
      selectshow: false,
      loading: false,
      searchValue: '',
      styleGround: {},
      activeKey: '1',
      sendValue: '',
      searchdata: [],
      province: [],
      provinceselect: '',
      checkNumber: this.defaultValue,
      city: [],
      cityselect: '',
      area: [],
      areaselect: '',
      county: [],
      countyselect: '',
      address: '',
      form: this.$form.createForm(this)
    }
  },
  watch: {
    display: {
      handler (newValue) {
        this.checkNumber = this.defaultValue
        this.getAddress()
      }
    }
  },
  created () {
    if (this.display) {
      this.address = this.display
      this.sendValue = this.defaultValue
    } else if (this.fieldType === 'field') {
      this.getAddress()
    }
  },
  methods: {
    searchAddress (val) {
      if (val === '测试') {
        this.$set(this, 'searchdata', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, '测试呀'])
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
    setValue () {
      console.log(this.searchValue)
    },
    changeStatus () {
      this.selectshow = !this.selectshow
      this.getAddress()
    },
    getAddress () {
      this.axios({
        url: '/admin/my_api/linkage_list',
        params: { parentid: this.checkNumber }
      }).then(res => {
        this.province = res
        if (this.checkNumber) {
          res.forEach(item => {
            if (item.children) {
              this.provinceselect = item.id
              this.sendValue = item.id
              this.address = item.name
              if (this.series !== '1') {
                this.city = item.children
                item.children.forEach(cityItem => {
                  if (cityItem.children) {
                    this.cityselect = cityItem.number
                    this.sendValue = cityItem.number
                    this.address = cityItem.name
                    if (this.series !== '2') {
                      this.area = cityItem.children
                      cityItem.children.forEach(areaItem => {
                        if (areaItem.children) {
                          this.areaselect = areaItem.number
                          this.sendValue = areaItem.number
                          this.address = areaItem.name
                          if (this.series !== '3') {
                            this.county = areaItem.children
                            areaItem.children.forEach(countyitem => {
                              if (countyitem.number === this.checkNumber) {
                                this.countyselect = countyitem.number
                                this.sendValue = countyitem.number
                                this.address = countyitem.name
                              }
                            })
                          }
                        } else if (areaItem.number === this.checkNumber) {
                          this.areaselect = areaItem.number
                          this.address = areaItem.name
                          this.firstSelect('area', areaItem.number, areaItem.name)
                        }
                      })
                    }
                  } else if (cityItem.number === this.checkNumber) {
                    this.cityselect = cityItem.number
                    this.address = cityItem.name
                    this.firstSelect('city', cityItem.number, cityItem.name)
                  }
                })
              }
            } else if (item.id === this.checkNumber) {
              this.provinceselect = item.id
              this.address = item.name
              this.sendValue = item.id
              this.firstSelect('province', item.id, item.name)
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
    getSearch (key, word) {
      const initials = String.fromCharCode(64 + word)
      console.log(key)
      console.log(initials)
    },
    firstSelect (type, value, label, allValue) {
      if (type === 'province') {
        if (this.provinceselect === value && this.city.length !== 0) {
          this.activeKey = '2'
        } else {
          this.provinceselect = value
          this.address = label
          this.sendValue = value
          // this.$emit('send', label, value, this.alias, allValue)
          this.$emit('send', label, value, type)
          this.axios({
            url: '/admin/my_api/linkage_list',
            params: { parentid: value }
          }).then(res => {
            this.city = res
            this.cityselect = ''
            if (this.series !== '1' && res.length > 0) {
              this.activeKey = '2'
            } else {
              this.selectshow = false
            }
            this.area = []
          })
        }
      } else if (type === 'city') {
        if (this.cityselect === value && this.area.length !== 0) {
          this.activeKey = '3'
        } else {
          this.cityselect = value
          this.address = this.address + '/' + label
          this.sendValue = value
          this.$emit('send', label, value, type)
          this.axios({
            url: '/admin/my_api/linkage_list',
            params: { parentid: value }
          }).then(res => {
            this.area = res
            this.areaselect = ''
            if (this.series === '2') {
              this.selectshow = false
            }
            if (res.length > 0) {
              this.activeKey = '3'
            }
          })
        }
      } else if (type === 'area') {
        if (this.areaselect === value && this.county.length !== 0) {
          this.activeKey = '4'
        } else {
          this.address = this.address + '/' + label
          this.areaselect = value
          this.sendValue = value
          this.$emit('send', label, value, type)
          this.axios({
            url: '/admin/my_api/linkage_list',
            params: { parentid: value }
          }).then(res => {
            this.county = res
            this.countyselect = ''
            if (this.series === '3') {
              this.selectshow = false
            }
            if (res.length > 0) {
              this.activeKey = '4'
            }
          })
        }
      } else if (type === 'county') {
        this.address = this.address + '/' + label
        this.countyselect = value
        this.sendValue = value
        this.$emit('send', label, value, type)
        this.selectshow = false
      }
    }
  }
}
</script>
