<template>
  <div style="border: 2px solid #000; padding: 8px; margin: 8px; width: 650px">
    <div class="active">
      <img src="../monitor/assets/image/logo.png" alt="" style="width: 336px; height: 34px">
      <a-row type="flex" justify="center">
        <a-col style="font-size: 24px; margin-bottom: 16px">云米三包件返厂专用标签</a-col>
      </a-row>
      <table class="table">
        <tbody>
          <tr v-for="(item, index) in columnsData" :key="index">
            <td>网点名称</td>
            <td>{{ dataObj.wdmc }}</td>
            <td>核销工单号</td>
            <td>{{ dataObj.gdbh }}</td>

            <td>{{ dataObj.sfsl }}</td>
            <td>{{ dataObj.bz }}</td>
          </tr>
          <tr>
            <td>产品品类</td>
            <td>{{ dataObj.cppl }}</td>
            <td>维修工单号</td>
            <td>{{ dataObj.glgdbh }}</td>
          </tr>
          <tr>
            <td>配件名称</td>
            <td>{{ dataObj.pjmc }}</td>
            <td>SN码</td>
            <td>{{ dataObj.snm }}</td>
          </tr>
          <tr>
            <td>云米编码</td>
            <td>{{ dataObj.bm }}</td>
            <td>故障描述</td>
            <td>{{ dataObj.gzms }}</td>
          </tr>
          <tr>
            <td>产品型号</td>
            <td>{{ dataObj.cpxh }}</td>
            <td>备注</td>
            <td>{{ dataObj.bz }}</td>
          </tr>
        </tbody>
      </table>
      <div>注：1、包装必须完好，避免二次损坏。2、配件必须粘贴此标签，否则不能做核销</div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      dataObj: {
        wdmc: '苏乐电器有限公司',
        gdbh: '202113160512696',
        cppl: '家电类',
        cpxh: '12545',
        glgdbh: '2015781512',
        pjmc: '电器类配件123',
        snm: '123457545454',
        bm: 'a-457545',
        gzms: '坏了，需要维修故障',
        bz: '备注'
      }
    }
  },
  methods: {

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
