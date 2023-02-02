<template>
  <div style="border: 2px solid #000; padding: 16px; margin: 8px; width: 1200px">
    <div class="active">
      <img src="../monitor/assets/image/logo.png" alt="" style="width: 336px; height: 34px">
      <a-row type="flex" justify="center">
        <a-col style="font-size: 24px">配件核销发货单</a-col>
      </a-row>
      <div style="padding: 0 20px 0 40px;">
        <a-row type="flex" justify="end" :gutter="40" style="margin-bottom: 16px">
          <a-col>工单编号</a-col>
          <a-col>{{ dataObj.gdbh }}</a-col>
        </a-row>
        <a-row type="flex" style="margin-bottom: 16px">
          <a-col flex="1">单据日期</a-col>
          <a-col flex="1">{{ dataObj.time }}</a-col>
          <a-col flex="1">物流公司</a-col>
          <a-col flex="1">{{ dataObj.wlgs }}</a-col>
          <a-col flex="1">物流单号</a-col>
          <a-col flex="1">{{ dataObj.wldh }}</a-col>
        </a-row>
        <a-row type="flex" style="margin-bottom: 16px">
          <a-col flex="1">发货单位</a-col>
          <a-col flex="5">{{ dataObj.fhdw }}</a-col>
        </a-row>
        <a-row type="flex" style="margin-bottom: 16px">
          <a-col flex="1">收货单位</a-col>
          <a-col flex="1">{{ dataObj.shdw }}</a-col>
          <a-col flex="1">联系人</a-col>
          <a-col flex="1">{{ dataObj.lxr }}</a-col>
          <a-col flex="1">联系电话</a-col>
          <a-col flex="1">{{ dataObj.lxdh }}</a-col>
        </a-row>
        <a-row type="flex" style="margin-bottom: 16px">
          <a-col flex="1">收货地址</a-col>
          <a-col flex="5">{{ dataObj.shdz }}</a-col>
        </a-row>
        <a-row type="flex" style="margin-bottom: 16px">
          <a-col flex="1">配件明细</a-col>
        </a-row>
      </div>
      <table class="table">
        <thead>
          <tr>
            <td>序号</td>
            <td>配件编码</td>
            <td>配件名称</td>
            <td>配件型号</td>
            <td>单位</td>
            <td>核销数量</td>
            <td>备注</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in columnsData" :key="index">
            <td>{{ item.index }}</td>
            <td>{{ item.pjbm }}</td>
            <td>{{ item.pjmc }}</td>
            <td>{{ item.pjxh }}</td>
            <td>{{ item.dw }}</td>
            <td>{{ item.hxsl }}</td>
            <td>{{ item.bz }}</td>
          </tr>
          <tr>
            <td colspan="5">合计</td>
            <td>123</td>
            <td>测试</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-bottom: 16px;">备注：纸箱表面必须覆膜粘贴此标签，否则不能做核销</div>
      <a-row type="flex" style="margin-bottom: 16px; margin-left: 40px">
        <a-col flex="1">发货员</a-col>
        <a-col flex="5">{{ userInfo.username }}</a-col>
      </a-row>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      dataObj: {
        gdbh: 'pj123486786',
        time: '2021-05-09',
        wlgs: '顺丰速运',
        wldh: '2015781512',
        fhdw: '苏乐电器有限公司',
        shdw: '虚拟仓',
        lxr: '测试者',
        lxdh: '13160512696',
        shdz: '测试省/测试市/测试区/测试街道无需寄回'
      },
      columnsData: [{
        index: '1',
        pjbm: '123123123',
        pjmc: '外桶后组件；外桶后组件；',
        pjxh: 'WG-F8087',
        gdbh: '127845645',
        dw: '个',
        hxsl: '26',
        bz: '测试备注'
      }, {
        index: '2',
        pjbm: '123123123',
        pjmc: '22外桶后组件；',
        pjxh: '22WG-F8087',
        gdbh: '22127845645',
        dw: '个',
        hxsl: '2226',
        bz: '22测试备注'
      }, {
        index: '3',
        pjbm: '123123123',
        pjmc: '33322外桶后组件；',
        pjxh: '3322WG-F8087',
        gdbh: '3322127845645',
        dw: '个',
        hxsl: '332226',
        bz: '2332测试备注'
      }, {
        index: '4',
        pjbm: '123123123',
        pjmc: '22外桶后组件；',
        pjxh: '22WG-F8087',
        gdbh: '22127845645',
        dw: '个',
        hxsl: '2697',
        bz: '12312321'
      }]
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'setting'])
  },
  methods: {

  },
  mounted () {
    console.log('userInfo', this.userInfo)
    console.log('setting', this.setting)
    // this.$nextTick(() => {
    //   window.print()
    // })
  }
}
</script>
<style lang="less" scoped>
.active{
  font-size: 16px;
}

.table{
  border: 1px solid #000;
  tbody,thead{
    tr{
      td{
        height: 36px;
        border: 1px solid #000;
        width: 164px;
        text-align: center;
      }
    }
  }
}
</style>
