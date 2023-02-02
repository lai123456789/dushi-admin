<template>
  <div class="setting-drawer">
    <a-drawer
      width="300"
      title="主题设置"
      placement="right"
      @close="handleClose"
      :visible="visible"
    >
      <a-spin :spinning="false">
        <div class="setting-drawer-index-content">
          <div :style="{ marginBottom: '24px' }">
            <h3 class="setting-drawer-index-title">整体风格设置</h3>
            <div class="setting-drawer-index-blockChecbox">
              <a-tooltip>
                <template slot="title">
                  暗色菜单风格
                </template>
                <div class="setting-drawer-index-item" @click="handleMenuTheme('dark')">
                  <img src="https://gw.alipayobjects.com/zos/rmsportal/LCkqqYNmvBEbokSDscrm.svg" alt="dark">
                  <div class="setting-drawer-index-selectIcon" v-if="navTheme === 'dark'">
                    <a-icon type="check"/>
                  </div>
                </div>
              </a-tooltip>

              <a-tooltip>
                <template slot="title">
                  亮色菜单风格
                </template>
                <div class="setting-drawer-index-item" @click="handleMenuTheme('light')">
                  <img src="https://gw.alipayobjects.com/zos/rmsportal/jpRkZQMyYRryryPNtyIC.svg" alt="light">
                  <div class="setting-drawer-index-selectIcon" v-if="navTheme !== 'dark'">
                    <a-icon type="check"/>
                  </div>
                </div>
              </a-tooltip>
            </div>
          </div>

          <div :style="{ marginBottom: '24px' }">
            <h3 class="setting-drawer-index-title">主题色</h3>

            <div style="height: 20px">
              <a-tooltip class="setting-drawer-theme-color-colorBlock" v-for="(item, index) in colorList" :key="index">
                <template slot="title">
                  {{ item.key }}
                </template>
                <a-tag :color="item.color" @click="changeColor(item.color)">
                  <a-icon type="check" v-if="item.color === primaryColor"></a-icon>
                </a-tag>
              </a-tooltip>

            </div>
          </div>
          <a-divider />
          <div :style="{ marginBottom: '24px' }">
            <h3 class="setting-drawer-index-title">其他设置</h3>
            <div>
              <a-list :split="false">
                <a-list-item>
                  <a-switch slot="actions" size="small" :defaultChecked="colorWeak" @change="onColorWeak" />
                  <a-list-item-meta>
                    <div slot="title">色弱模式</div>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </div>
          </div>
        </div>
        <div class="bbar">
          <a-button @click="handleClose">关闭</a-button>
        </div>
      </a-spin>
    </a-drawer>
  </div>
</template>
<script>
import { DetailList } from '@/components'
import SettingItem from './SettingItem'
import config from '@/config/defaultSettings'
import { updateTheme, updateColorWeak, colorList } from './settingConfig'
import { mixin, mixinDevice } from '@/utils/mixin'
export default {
  components: {
    DetailList,
    SettingItem
  },
  mixins: [mixin, mixinDevice],
  data () {
    return {
      colorList
    }
  },
  computed: {
    visible () {
      return this.$store.state.app.setting.themeShow
    }
  },
  mounted () {
    updateTheme(this.primaryColor)
    if (this.colorWeak !== config.colorWeak) {
      updateColorWeak(this.colorWeak)
    }
  },
  methods: {
    handleClose () {
      this.$setSetting({ themeShow: false })
    },
    onColorWeak (checked) {
      this.$store.dispatch('ToggleWeak', checked)
      updateColorWeak(checked)
    },
    onMultiTab (checked) {
      this.$store.dispatch('ToggleMultiTab', checked)
    },
    handleMenuTheme (theme) {
      this.$store.dispatch('ToggleTheme', theme)
    },
    changeColor (color) {
      if (this.primaryColor !== color) {
        this.$store.dispatch('ToggleColor', color)
        updateTheme(color)
      }
    }
  }
}
</script>

<style lang="less" scoped>

  .setting-drawer-index-content {

    .setting-drawer-index-blockChecbox {
      display: flex;

      .setting-drawer-index-item {
        margin-right: 16px;
        position: relative;
        border-radius: 4px;
        cursor: pointer;

        img {
          width: 48px;
        }

        .setting-drawer-index-selectIcon {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          padding-top: 15px;
          padding-left: 24px;
          height: 100%;
          color: #1890ff;
          font-size: 14px;
          font-weight: 700;
        }
      }
    }
    .setting-drawer-theme-color-colorBlock {
      width: 20px;
      height: 20px;
      border-radius: 2px;
      float: left;
      cursor: pointer;
      margin-right: 8px;
      padding-left: 0px;
      padding-right: 0px;
      text-align: center;
      color: #fff;
      font-weight: 700;

      i {
        font-size: 14px;
      }
    }
  }
</style>
