<template>
  <a-drawer
    :title="config.title"
    :width="1400"
    :destroyOnClose="true"
    :visible="visible"
    @close="visible=!visible"
  >
    <a-spin :spinning="loading">
      <a-row>
        <a-col :span="18">
          <baidu-map
            :center="center"
            :zoom="zoom"
            :ak="ak"
            @ready="handler"
            :double-click-zoom="false"
            :scroll-wheel-zoom="true"
            @dblclick="clickEvent">
            <bm-view :style="{width: '100%', height: clientHeight - 16 + 'px', flex: 1, marginBottom:'-30px'}"></bm-view>
            <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
            <bm-local-search
              :keyword="keyword"
              :auto-viewport="true"
              :style="{ width: '340px', position: 'relative', 'margin-top': '-' + (clientHeight - 65) + 'px', 'margin-left' : '1035px' }" />
            <bm-city-list anchor="BMAP_ANCHOR_BOTTOM_RIGHT"></bm-city-list>
            <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP', 'BMAP_SATELLITE_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-map-type>
            <bm-marker :position="{lng: locData.longitude, lat: locData.latitude}" :title="locData.address" animation="BMAP_ANIMATION_BOUNCE" v-if="locData.longitude">
              <bm-label v-if="locData.address" :content="locData.address" :labelStyle="{ fontSize : '13px'}" :offset="{width: -35, height: 30}"/>
            </bm-marker>
          </baidu-map>
        </a-col>
        <a-col :span="6" style="padding-left: 10px">
          <a-input-search @search="(e) => { keyword = e }"/>
          <a-row type="flex" align="middle" v-if="locData.longitude">
            <a-col :span="23">{{ locData.longitude }} , {{ locData.latitude }}</a-col>
            <a-col :span="1"><a-icon type="close-circle" @click="clearOverlays"/></a-col>
          </a-row>
        </a-col>
      </a-row>
      <div class="bbar">
        <a-button type="primary" @click="handleSubmit" v-if="config.action === 'set'">保存</a-button>
        <a-button @click="visible=!visible">关闭</a-button>
      </div>
    </a-spin>
  </a-drawer>
</template>
<script>
import { BaiduMap, BmNavigation, BmView, BmGeolocation, BmCityList, BmLocalSearch, BmBoundary, BmMarker, BmLabel, BmMapType } from 'vue-baidu-map'
export default {
  name: 'LocationSet',
  components: {
    BaiduMap,
    BmNavigation,
    BmView,
    BmGeolocation,
    BmCityList,
    BmLocalSearch,
    BmBoundary,
    BmMarker,
    BmLabel,
    BmMapType
  },
  data () {
    return {
      center: { lng: 116.404355, lat: 39.910792 },
      zoom: 13,
      locData: {
        longitude: '',
        latitude: '',
        address: ''
      },
      keyword: '',
      location: '',
      clientHeight: document.documentElement.clientHeight - 110, // 屏幕高度
      config: {},
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      options: [],
      data: {},
      ak: ''
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.ak = this.$store.getters.setting.baidu_ak_browser
      this.keyword = ''
      this.config = config
      const data = config.data.split(',')
      this.locData = {
        longitude: data[0] || '',
        latitude: data[1] || '',
        address: ''
      }
    },
    handler ({ BMap, map }) {
      const _this = this	// 设置一个临时变量指向vue实例，因为在百度地图回调里使用this，指向的不是vue实例；
      var geolocation = new BMap.Geolocation()
      geolocation.getCurrentPosition(function (r) {
        if (_this.locData.longitude) {
          _this.center = { lng: _this.locData.longitude, lat: _this.locData.latitude }
        } else {
          _this.center = { lng: r.longitude, lat: r.latitude }
        }
        // 设置center属性值
        _this.autoLocationPoint = { lng: r.longitude, lat: r.latitude }		// 自定义覆盖物
        _this.initLocation = true
      }, { enableHighAccuracy: true })
      window.map = map
    },
    // 点击地图监听
    clickEvent (e) {
      // eslint-disable-next-line no-undef
      // map.clearOverlays()
      // eslint-disable-next-line no-undef
      // var myMarker = new BMap.Marker(new BMap.Point(e.point.lng, e.point.lat))
      // eslint-disable-next-line no-undef
      // map.addOverlay(myMarker)
      // 用所定位的经纬度查找所在地省市街道等信息
      // eslint-disable-next-line no-undef
      var point = new BMap.Point(e.point.lng, e.point.lat)
      // eslint-disable-next-line no-undef
      var gc = new BMap.Geocoder()
      const _this = this
      gc.getLocation(point, function (rs) {
        // var addComp = rs.addressComponents
        // console.log(addComp) // 地址信息
        _this.locData.address = rs.address
      })
      this.locData.longitude = e.point.lng
      this.locData.latitude = e.point.lat
    },
    clearOverlays () {
      this.locData = {
        longitude: '',
        latitude: '',
        address: ''
      }
    },
    // 定位成功回调
    getLoctionSuccess (point, AddressComponent, marker) {
      // eslint-disable-next-line no-undef
      map.clearOverlays()
      // eslint-disable-next-line no-undef
      var myMarker = new BMap.Marker(new BMap.Point(point.point.lng, point.point.lat))
      // eslint-disable-next-line no-undef
      map.addOverlay(myMarker)
      this.locData.longitude = point.point.lng
      this.locData.latitude = point.point.lat
    },
    handleSubmit () {
      this.loading = true
      if (this.locData.longitude && this.locData.latitude) {
        const data = this.locData.longitude + ',' + this.locData.latitude
        this.$emit('ok', data)
      } else {
        this.$emit('ok', '')
      }
      this.visible = false
      this.$nextTick(() => {
        this.loading = false
      })
    }
  }
}
</script>
