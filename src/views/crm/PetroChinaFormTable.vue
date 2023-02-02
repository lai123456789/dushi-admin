<template>
  <div style="padding-bottom: 16px;">
    <a-form :form="form" :labelCol="labelCol" :wrapperCol="wrapperCol" style="border: 1px solid #EEE; margin: 8px; border-radius: 8px">
      <div style="background: #EEE; font-size: 16px; padding: 8px">表单概要</div>
      <div style="padding: 16px">
        <a-row :gutter="[8, 10]">
          <a-col v-bind="colLayout">
            <a-form-item label="工程名称">
              <a-input placeholder="请输入" v-decorator="['param[value]']" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="工程编号">
              <a-input placeholder="请输入" v-decorator="['param[value]']" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="单位工程名称">
              <a-input placeholder="请输入" v-decorator="['param[value]']" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="压缩机组型号">
              <a-input placeholder="请输入" v-decorator="['param[value]']" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="安装地点">
              <a-input placeholder="请输入" v-decorator="['param[value]']" />
            </a-form-item>
          </a-col>
          <a-col v-bind="colLayout">
            <a-form-item label="机组编号">
              <a-input placeholder="请输入" v-decorator="['param[value]']" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
      <a-row style="border-top: 1px solid #EEE">
        <a-col v-bind="colLayout" v-for="(item, index) in AllData" :key="index" style="padding: 8px 16px;">
          <div style="font-size: 15px; padding: 8px 0; background: #EEE; text-align: center;">{{ item.title }} 数据{{ index }}</div>
          <a-form-item :label="value.name" :class="value.noInput ? 'sonTitle' : ''" v-for="(value, key) in item.paramList" :key="key">
            <div v-if="value.noInput"></div>
            <a-switch
              v-else-if="value.isOpen"
              un-checked-children="关"
              checked-children="开"
              v-decorator="[`param[checked${value.num + index}]`, {initialValue: false, valuePropName: 'checked'}]"
              @change="openDetails"/>
            <a-input
              v-else
              :placeholder="(index === 1 || index === 7 || index === 13 || index === 16 || index === 19 || index === 22) ? 'H:' : (index === 2
                || index === 8 || index === 14 || index === 17 || index === 20 || index === 23) ? 'HH：' : (index === 4 || index === 10) ? 'L：'
                : (index === 5 || index === 11) ? 'LL：' : (index !== 1 || index !== 7 || index !== 13 || index !== 16 || index !== 19 ||
                  index !== 22) ? '请输入不高于报警高限的正常值测试' : '请输入'"
              v-decorator="[`param[${value.value + index}]`]" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div style="font-size: 15px; margin: 8px; padding: 8px 16px; border: 1px solid #EEE; border-radius: 8px">
      <div>说明：</div>
      <div>1.“H”高报警值；“HH”高停机值；“L”低报警值；“LL”低停机值</div>
      <div>2.在“口”内选择结果。当前显示值为此时实际显示值，测试输入值为测试人员输入一个低于（高于）显示值的设定值用于测试报警和停机有效性。</div>
      <div>3.此表格为标准表格，若某些项目没有，可以不填写，打“/”。</div>
      <div><span style="margin-right: 80px">测试记录人（签字）：</span><span>建设单位现场代表（签字）：</span></div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      colLayout: { xs: 24, sm: 24, md: 8, lg: 8, xl: 8, xxl: 8 },
      labelCol: { style: 'width: 120px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 120px); display: inline-block;' },
      form: this.$form.createForm(this),
      param: {},
      titleList: ['发动机燃料气压力(高)MPa-1', '发动机燃料气压力(高)MPa-2', '发动机燃料气压力(高)MPa-3',
        '发动机燃料气压力(低)MPa-1', '发动机燃料气压力(低)MPa-2', '发动机燃料气压力(低)MPa-3',
        '发动机机油压力(高)MPa-1', '发动机机油压力(高)MPa-2', '发动机机油压力(高)MPa-3',
        '发动机机油压力(低)MPa-1', '发动机机油压力(低)MPa-2', '发动机机油压力(低)MPa-3',
        '发动机冷却液温度℃-1', '发动机冷却液温度℃-2', '发动机冷却液温度℃-3',
        '进气歧途管绝对压力MPa-1', '进气歧途管绝对压力MPa-2', '进气歧途管绝对压力MPa-3',
        '发动机负荷KW-1', '发动机负荷KW-2', '发动机负荷KW-3',
        '发动机总排烟温度℃-1', '发动机总排烟温度℃-2', '发动机总排烟温度℃-3'],
      dataList: [
        { name: '现场操作', 'noInput': true },
        { name: '信号输入源信号', value: 'xhsryxh1' },
        { name: '触摸屏显示实时值', value: 'cmpxsssz1' },
        { name: '报警/停车设定值', value: 'bjsdz1' },
        { name: '测试项目', 'noInput': true },
        { name: '声光报警器是否动作', 'isOpen': true, num: 's1' },
        { name: '输出到发动机ESM或ECM的故障停机继电器是否动作', 'isOpen': true, num: 'sc1' },
        { name: '没有ESM或ECM的机组切断点火CEC的继电器是否动作', 'isOpen': true, num: 'm1' },
        { name: '上位机状态', 'noInput': true },
        { name: '数据显示是否正确', 'isOpen': true, num: 'sj1' },
        { name: '有无报警显示或报警内容是否正确', 'isOpen': true, num: 'yw1' },
        { name: '触摸屏', 'noInput': true },
        { name: '有无报警显示报警是否正确', 'isOpen': true, num: 'ywb1' },
        { name: '有无停机故障停机显示或显示故障是否正确', 'isOpen': true, num: 'ywtj1' }
      ],
      AllData: []
    }
  },
  mounted () {
    const Array = []
    this.titleList.forEach((item, index) => {
      const obj = {
        title: item,
        paramList: this.dataList
      }
      Array.push(obj)
    })
    this.AllData = Array
  },
  methods: {
    openDetails (e) {
      console.log(e)
    }
  }
}
</script>
<style lang="less" scoped>
/deep/.ant-form-item.sonTitle{
  font-weight: bold;
  font-size: 15px;
  .ant-form-item-label{
    text-align: left;
    label{
      font-size: 15px;
    }
    label::after{
      display: none;
    }
  }
}
</style>
