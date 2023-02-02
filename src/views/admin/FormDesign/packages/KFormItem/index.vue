<!--
 * @Description: 传入record数据，通过判断record.type，来渲染对应的组件
 * @Author: kcz
 * @Date: 2020-01-02 22:41:48
 * @LastEditors: kcz
 * @LastEditTime: 2020-10-28 22:44:09
 -->
<template>
  <div>
    <div v-if="!formConfig.tableType">
      <a-form-item
        v-if="[
          'text',
          'textarea',
          'datetime',
          'combobox',
          'organization',
          'time',
          'number',
          'radio',
          'checkbox',
          'select',
          'rate',
          'switch',
          'autocomplete',
          'image',
          'score',
          'file',
          'associated',
          'address',
          'cascader',
          'subform',
          'editor',
          'treeselect',
          'component',
          'serialnumber',
          'tag',
          'location',
        ].includes(record.formtype) || ['work', 'workRemark', 'formmark'].includes(record.type)
        "
        :label="record.labelShow === '0' ? '' : (record.name || record.label)"
        :label-col="record.labelLocal === '1' ? {} : labelCol"
        :wrapper-col="record.labelLocal === '1' ? {} : wrapperCol"
      >
        <a-input v-if="record.formtype === 'text' && record.type !=='place'" :disabled="record.fieldrule === 'readonly'" :placeholder="record.placeholder"/>
        <a-input v-else-if="record.type === 'component'" :disabled="record.fieldrule === 'readonly'" placeholder="组件"/>
        <a-input v-else-if="record.formtype === 'serialnumber'" :disabled="true" placeholder="流水号" />
        <a-input v-else-if="record.type === 'work'" disabled placeholder="流程办理方式"/>
        <a-textarea v-else-if="record.type === 'workRemark'" placeholder="流程办理备注"></a-textarea>
        <a-divider v-else-if="record.type === 'divider'" :orientation="record.dividerDirection">{{ record.dividerText ? record.dividerText : '分隔符' }}</a-divider>
        <a-textarea v-else-if="record.formtype === 'textarea'" :rows="2" :disabled="record.fieldrule === 'readonly'"/>
        <a-date-picker v-else-if="record.formtype === 'datetime'" format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" :disabled="record.fieldrule === 'readonly'"/>
        <a-select v-else-if="record.formtype === 'combobox' || record.formtype === 'organization'" style="width: 100%;" :disabled="record.fieldrule === 'readonly'">
          <a-select-option value="1">选项1</a-select-option>
          <a-select-option value="2">选项2</a-select-option>
        </a-select>
        <div v-else-if="record.formtype === 'tag'"><a-tag>500元以下</a-tag><a-tag>500元~1000元</a-tag><a-tag>1000元以上</a-tag><a-icon type="tags" /></div>
        <a-radio-group v-else-if="record.formtype=='radio'" :disabled="record.fieldrule === 'readonly'">
          <a-radio value="1">选项1</a-radio>
          <a-radio value="2">选项2</a-radio>
        </a-radio-group>
        <a-checkbox-group v-else-if="record.formtype=='checkbox'" :disabled="record.fieldrule === 'readonly'">
          <a-checkbox value="1">选项1</a-checkbox>
          <a-checkbox value="2">选项2</a-checkbox>
        </a-checkbox-group>
        <a-button v-else-if="record.formtype === 'location'"><a-badge status="default" />设置</a-button>
        <a-tree-select
          v-else-if="record.formtype === 'treeselect'"
          style="width: 100%"
          placeholder="请选择"
          allow-clear
          tree-default-expand-all
        >
          <a-tree-select-node key="0-1" value="parent 1" title="根节点1">
            <a-tree-select-node key="random" value="leaf1" title="叶子1" />
            <a-tree-select-node key="random1" value="leaf2" title="叶子2" />
          </a-tree-select-node>
          <a-tree-select-node key="0-2" value="parent 2" title="根节点2">
            <a-tree-select-node key="random2" value="leaf3" title="叶子3" />
            <a-tree-select-node key="random3" value="leaf4" title="叶子4" />
          </a-tree-select-node>
        </a-tree-select>
        <a-switch v-else-if="record.formtype === 'switch'" :checked="true" :disabled="record.fieldrule === 'readonly'"></a-switch>
        <quill-editor v-else-if="record.formtype=='editor'" style="width: 100%; height: 200px;" :disabled="record.fieldrule === 'readonly'" />
        <a-input-number v-else-if="record.formtype=='number'" style="width: 100%;" :disabled="record.fieldrule === 'readonly'"/>
        <a-auto-complete v-else-if="record.formtype === 'autocomplete'" style="width: 100%;" :disabled="record.fieldrule === 'readonly'" />
        <a-rate v-else-if="record.formtype === 'score'" style="width: 100%;" :disabled="record.fieldrule === 'readonly'" />
        <a-upload
          v-else-if="record.formtype === 'image'"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          list-type="picture-card"
          :disabled="record.fieldrule === 'readonly'"
        >
          <div :style="[record.fieldrule === 'readonly' ? {margin: '-8px' ,width: '118%', height: '118%', background: '#f5f5f5', display: 'flex', flexDirection: 'column', justifyContent: 'center'}: {}]">
            <a-icon type="plus" />
            <div class="ant-upload-text">Upload</div>
          </div>
        </a-upload>
        <a-upload
          v-else-if="record.formtype === 'file'"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          :disabled="record.fieldrule === 'readonly'"
        >
          <a-button :disabled="record.fieldrule === 'readonly'"> <a-icon type="upload" /> Upload </a-button>
        </a-upload>
        <a-cascader
          v-if="record.formtype=='cascader'"
          :disabled="record.fieldrule === 'readonly'"
          style="width: 100%"
          :options="[ {
            value: 'zhejiang',
            label: 'Zhejiang',
            children: [ {
              value: 'hangzhou',
              label: 'Hangzhou',
              children: [ {
                value: 'xihu',
                label: 'West Lake',
              }, ],
            }, ],
          }, {
            value: 'jiangsu',
            label: 'Jiangsu',
            children: [ {
              value: 'nanjing',
              label: 'Nanjing',
              children: [ {
                value: 'zhonghuamen',
                label: 'Zhong Hua Men',
              }, ],
            }, ],
          }, ]"
          placeholder="请选择"
        />
        <!-- 子表 -->
        <a-table
          v-else-if="record.formtype === 'subform'"
          size="small"
          :pagination="false"
          rowKey="id"
          :columns="columns"
          :dataSource="[{ id: 1, name: '子表', formtype: 'subform' }]"></a-table>
        <!-- 关联数据 -->
        <a-input-search v-else-if="record.formtype === 'associated'" :disabled="record.fieldrule === 'readonly'" />
        <!-- 地址选择 -->
        <address-select v-else-if="record.formtype === 'address'" style="margin-top: -1px" :fieldrule="record.fieldrule"/>
        <div v-else-if="record.type === 'formmark'">
          <a-timeline>
            <a-timeline-item>
              <h3>{{ moment(new Date()).format('YYYY-MM-DD hh:mm:ss') }} 张三(项目经理)</h3>
              <a-table
                size="small"
                :pagination="false"
                rowKey="id"
                :columns="columnsMark"
                :dataSource="[{ id: 1, name: '项目负责人', before: '李四', after:'张三' }]"></a-table>
            </a-timeline-item>
            <a-timeline-item>
              <h3>{{ moment(new Date()).format('YYYY-MM-DD hh:mm:ss') }} 张三(项目经理)</h3>
              <a-table
                size="small"
                :pagination="false"
                rowKey="id"
                :columns="columnsMark"
                :dataSource="[{ id: 1, name: '项目负责人', before: '王五', after:'李四' }]"></a-table>
            </a-timeline-item>
          </a-timeline>
        </div>
        <span v-if="!record.formtype"></span>
      </a-form-item>
      <a-form-item
        v-else-if="
          [
            'input',
            'textarea',
            'date',
            'time',
            'number',
            'radio',
            'checkbox',
            'select',
            'rate',
            'uploadImg',
            'uploadFile',
            'switch',
            'cascader',
            'treeSelect'
          ].includes(record.type)
        "
        :label-col="record.labelLocal === '1' ? {} : record.labelShow !== '0' ? labelCol : {style: 'display: none'}"
        :wrapper-col="record.labelLocal === '1' ? {} : record.labelShow !== '0' ? wrapperCol : { style: 'width: 100%; display: inline-block' }"
        :style="
          formConfig.layout === 'horizontal' && formConfig.labelLayout === 'flex'
            ? { display: 'flex' }
            : {}
        "
        :colon="record.labelShow !== '0'"
      >
        <span slot="label">
          <span v-if="record.labelShow !== '0'">{{ record.label }}</span>
          <a-tooltip v-if="record.help">
            <span slot="title" v-html="record.help"></span>
            <a-icon
              v-if="record.help"
              class="question-circle"
              type="question-circle-o"
            />
          </a-tooltip>
        </span>
        <!-- 单行文本 -->
        <a-input
          :style="{width: record.options.width, border: record.borderedShow !== 'all' ? 'none':'', borderBottom: record.borderedShow === 'bottom' ? '1px solid #e8e8e8' : record.borderedShow === 'none' ? 'none' : ''}"
          v-if="record.type === 'input'"
          :disabled="disabled || !!record.options.disabled"
          :placeholder="record.options.placeholder"
          :allowClear="!!record.options.clearable"
          :maxLength="record.options.maxLength === '' ? null : record.options.maxLength"
          v-decorator="[
            record.model, // input 的 name
            {
              initialValue: record.options.defaultValue, // 默认值
              rules: record.rules // 验证规则
            }
          ]"
        />
        <!-- 多行文本 -->
        <a-textarea
          :style="{width: record.options.width, border: record.borderedShow !== 'all' ? 'none':''}"
          v-else-if="record.type === 'textarea'"
          :autoSize="{
            minRows: record.options.minRows,
            maxRows: record.options.maxRows
          }"
          :disabled="disabled || !!record.options.disabled"
          :placeholder="record.options.placeholder"
          :allowClear="!!record.options.clearable"
          :maxLength="record.options.maxLength === '' ? null : record.options.maxLength"
          :rows="4"
          v-decorator="[
            record.model, // input 的 name
            {
              initialValue: record.options.defaultValue, // 默认值
              rules: record.rules // 验证规则
            }
          ]"
        />
        <!-- 单选框 -->
        <a-radio-group
          v-else-if="record.type === 'radio'"
          :options="
            !record.options.dynamic
              ? record.options.options
              : dynamicData[record.options.dynamicKey]
                ? dynamicData[record.options.dynamicKey]
                : []
          "
          :disabled="disabled || !!record.options.disabled"
          :placeholder="record.options.placeholder"
          v-decorator="[
            record.model,
            {
              initialValue: record.options.defaultValue,
              rules: record.rules
            }
          ]"
        />
        <!-- 多选框 -->
        <a-checkbox-group
          v-else-if="record.type === 'checkbox'"
          :options="
            !record.options.dynamic
              ? record.options.options
              : dynamicData[record.options.dynamicKey]
                ? dynamicData[record.options.dynamicKey]
                : []
          "
          :disabled="disabled || !!record.options.disabled"
          :placeholder="record.options.placeholder"
          v-decorator="[
            record.model,
            {
              initialValue: record.options.defaultValue,
              rules: record.rules
            }
          ]"
        />
        <!-- 开关 -->
        <a-switch
          v-else-if="record.type === 'switch'"
          :disabled="disabled || !!record.options.disabled"
          v-decorator="[
            record.model,
            {
              initialValue: record.options.defaultValue,
              valuePropName: 'checked',
              rules: record.rules
            }
          ]"
        />
        <!-- 数字 -->
        <a-input-number
          v-else-if="record.type === 'number'"
          :style="`width:${record.options.width}`"
          :placeholder="record.options.placeholder"
          :disabled="disabled || !!record.options.disabled"
          :min="
            Number(record.options.min) || Number(record.options.min) === 0
              ? Number(record.options.min)
              : -Infinity
          "
          :max="
            Number(record.options.max) || Number(record.options.max) === 0
              ? Number(record.options.max)
              : Infinity
          "
          :precision="
            record.options.precision > 50 ||
              (!record.options.precision && record.options.precision !== 0)
              ? null
              : record.options.precision
          "
          :step="record.options.step"
          v-decorator="[
            record.model,
            {
              initialValue: record.options.defaultValue,
              rules: record.rules
            }
          ]"
        />
        <component
          v-else
          :style="`width:${record.options.width}`"
          v-bind="componentOption"
          :min="
            record.options.min || record.options.min === 0
              ? record.options.min
              : -Infinity
          "
          :max="
            record.options.max || record.options.max === 0
              ? record.options.max
              : Infinity
          "
          :precision="
            record.options.precision > 50 ||
              (!record.options.precision && record.options.precision !== 0)
              ? null
              : record.options.precision
          "
          :parentDisabled="disabled || !!record.options.disabled"
          :disabled="disabled || !!record.options.disabled"
          :record="record"
          :config="config"
          :filterOption="
            record.options.showSearch
              ? (inputValue, option) => {
                return (
                  option.componentOptions.children[0].text
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0
                );
              }
              : false
          "
          :allowClear="record.options.clearable"
          :dynamicData="dynamicData"
          :treeData="
            !record.options.dynamic
              ? record.options.options
              : dynamicData[record.options.dynamicKey]
                ? dynamicData[record.options.dynamicKey]
                : []
          "
          :options="
            !record.options.dynamic
              ? record.options.options
              : dynamicData[record.options.dynamicKey]
                ? dynamicData[record.options.dynamicKey]
                : []
          "
          :mode="record.options.multiple ? 'multiple' : ''"
          v-decorator="[
            record.model, // input 的 name
            {
              initialValue: record.options.defaultValue, // 默认值
              rules: record.rules // 验证规则
            }
          ]"
          :is="componentItem"
        ></component>
      </a-form-item>
      <!-- 分割线 -->
      <div v-else-if="record.type === 'divider'">
        <!-- 分割线 -->
        <a-divider
          v-if="record.label !== '' && record.options && record.options.orientation"
          :orientation="record.options.orientation"
        >{{ record.label }}</a-divider>
        <a-divider v-else-if="record.dividerText" :orientation="record.dividerDirection">{{ record.dividerText ? record.dividerText : '分隔符' }}</a-divider>
        <a-divider v-else-if="record.label !== ''">{{ record.label }}</a-divider>
        <a-divider v-else-if="record.label === ''" />
      </div>
      <!-- 客户画像 -->
      <a-form-item v-else-if="record.type==='portrait'" style="padding-right: 20px">
        <a-row type="flex" align="middle">
          <a-col :span="24" style="text-align: center"><img src="./men.png" alt="" style="width: 75px; height: auto"></a-col>
          <a-col :span="24">
            <a-row type="flex" justify="center">
              <a-col :span="2"><a-icon type="man" style="color: #722ED1"/></a-col>
              <a-col :span="4">36岁</a-col>
              <a-col :span="2"><a-icon type="environment" style="color: #1890FF"/></a-col>
              <a-col :span="6">广东深圳</a-col>
              <a-col :span="2"><a-icon type="star" /></a-col>
              <a-col :span="4">128</a-col>
            </a-row>
          </a-col>
          <a-col :span="24">
            <a-row type="flex" justify="center">
              <a-col :span="4" style="text-align: center"></a-col>
              <a-col :span="4" style="text-align: center"><a-button icon="edit" shape="circle"/></a-col>
              <a-col :span="4" style="text-align: center"><a-button icon="phone" shape="circle"/></a-col>
              <a-col :span="4" style="text-align: center"><a-button icon="mail" shape="circle"/></a-col>
              <a-col :span="4" style="text-align: center"><a-button icon="more" shape="circle"/></a-col>
              <a-col :span="4" style="text-align: center"></a-col>
            </a-row>
          </a-col>
          <a-divider :dashed="true" style="margin: 12px 0 6px 0"/>
          <a-col :span="24">
            <a-row>
              <a-col :span="23"><a-icon type="tag" /> 客户画像</a-col>
              <a-col :span="1"><a-icon type="edit" /></a-col>
            </a-row>
          </a-col>
          <a-col><a-tag color="orange">男</a-tag><a-tag color="orange">线下门店</a-tag><a-tag color="orange">双子座</a-tag><a-tag color="orange">企业高管</a-tag><a-tag color="purple">月签到22天</a-tag></a-col>
          <a-divider :dashed="true" style="margin: 12px 0 6px 0"/>
          <a-col :span="24">
            <a-row>
              <a-col :span="24"><a-icon type="deployment-unit" /> 交互数据</a-col>
              <a-col>
                <a-tag color="purple">咨询 18</a-tag>
                <a-tag color="purple">产品 6</a-tag>
                <a-tag color="purple">投诉 1</a-tag>
                <a-tag color="purple">订单 10</a-tag>
                <a-tag color="purple">安装 8</a-tag>
                <a-tag color="purple">来电 35</a-tag>
                <a-tag color="purple">维修 1</a-tag>
                <a-tag color="purple">不满意 0</a-tag>
              </a-col>
            </a-row>
          </a-col>
          <a-col></a-col>
          <a-divider :dashed="true" style="margin: 12px 0 6px 0"/>
          <a-col :span="24"><a-icon type="user" /> 联系信息</a-col>
          <a-row type="flex" align="middle" :gutter="16">
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">电话1</a-col>
            <a-col :span="16" style="font-size: 13px;">13800138000</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">电话2</a-col>
            <a-col :span="16" style="font-size: 13px;">13800138001</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">邮箱</a-col>
            <a-col :span="16" style="font-size: 13px;">doscs@doscs.com</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">客户类别</a-col>
            <a-col :span="16" style="font-size: 13px;">普通客户</a-col>
            <a-col :span="8" style="text-align: right; font-size: 13px; color: #8c8c8c;">详细地址</a-col>
            <a-col :span="16" style="font-size: 13px;">客户的详细地址信息</a-col>
          </a-row>
        </a-row>
      </a-form-item>
      <a-form-item v-else-if="record.type==='lifeCycle'">
        <a-timeline>
          <a-timeline-item>
            <div>时间：2016年2月11日</div>
            <div>事件：首次购买净水器订单，完成</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2016年2月14日</div>
            <div>事件：上门安装，完成</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2016年5月13日</div>
            <div>事件：新产品使用三个月体验回访，满意</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2018年12月13日</div>
            <div>事件：上门维修，完成</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2018年12月15日</div>
            <div>事件：维修服务回访，满意</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2019年2月13日</div>
            <div>事件：3年老客户NPS调研回访，9分(愿意推荐)</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2020年2月13日</div>
            <div>事件：产品到期提醒-以旧换新推荐，完成</div>
          </a-timeline-item>
          <a-timeline-item>
            <div>时间：2020年3月8日</div>
            <div>事件：二次购买净水器订单，完成</div>
          </a-timeline-item>
        </a-timeline>
      </a-form-item>
      <!-- 子表DW -->
      <a-form-item
        v-else-if="record.type === 'subform' || record.type === 'flowlog' || record.type === 'urgelog'"
      >
        <label
          v-text="record.label"
        ></label>
      </a-form-item>
      <!-- 可隐藏label -->
      <!-- button按钮 -->
      <a-form-item
        v-else-if="!(record.options.hidden === true) && record.type === 'button'"
      >
        <a-button
          :disabled="disabled || !!record.options.disabled"
          @click="
            record.options.handle === 'submit'
              ? false
              : record.options.handle === 'reset'
                ? $emit('handleReset')
                : dynamicData[record.options.dynamicFun]
                  ? dynamicData[record.options.dynamicFun]()
                  : false
          "
          :type="record.options.type"
          :html-type="record.options.handle === 'submit' ? 'submit' : undefined"
          v-text="record.label"
        ></a-button>
      </a-form-item>
      <!-- alert提示 -->
      <a-form-item
        v-else-if="!(record.options.hidden === true) && record.type === 'alert'"
      >
        <a-alert
          :message="record.label"
          :description="record.options.description"
          :type="record.options.type"
          :showIcon="record.options.showIcon === '1'"
          :closable="record.options.closable === '1'"
          :banner="record.options.banner === '1'"
        />
      </a-form-item>
      <!-- 文本 -->
      <a-form-item
        v-else-if="!(record.options.hidden === true) && ['text','signature'].includes(record.type)"
      >
        <div :style="{ textAlign: record.options.textAlign }">
          <label
            :class="{ 'ant-form-item-required': record.options.showRequiredMark }"
            v-text="record.label"
          ></label>
        </div>
      </a-form-item>
      <!-- 图片展示 -->
      <a-form-item v-else-if="!(record.options.hidden === true) && record.type === 'imageShow'">
        <span v-if="!record.fileList.length">{{ record.label }}</span>
        <div v-else>
          <img v-viewer :src="record.fileList[0].url" alt="" :style="{ width: record.width + 'px', height: record.height ? record.height + 'px' : 'auto' }">
        </div>
      </a-form-item>
      <!-- 占位符 -->
      <a-form-item v-else-if="!(record.options.hidden === true) && record.type === 'placeholder'">
        <div :style="{ textAlign: record.options.textAlign }">
          <label
            :class="{ 'ant-form-item-required': record.options.showRequiredMark }"
            v-text="record.label"
          ></label>
        </div>
      </a-form-item>
      <!-- html -->
      <div
        v-else-if="!(record.options.hidden === true) && record.type === 'html'"
        v-html="record.options.defaultValue"
      ></div>
      <!-- 自定义组件 -->
      <customComponent
        v-else-if="customList.includes(record.type)"
        :record="record"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :formConfig="formConfig"
      />
    </div>
    <div v-else>
      <a-form-item
        :label-col="record.labelLocal === '1' ? {} : labelCol"
        :wrapper-col="record.labelLocal === '1' ? {} : wrapperCol"
        :label="(!record.labelShow || record.labelShow === '1') ? record.name : false"
        v-if="record.formtype==='image'">
        <div :style="{ width: '75px', height: '75px', border:'1px solid #000', 'border-radius': record.borderRadius === '1' ? '50%': '5px'}"></div>
      </a-form-item>
      <div v-else-if="record.type === 'divider'">
        <a-divider style="margin: 0px"/>
      </div>
      <div v-else>
        <div v-if="record.fontSize === '1'" :style="{ 'font-weight': 'bold', 'font-size': '2em'}">
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }}{{ record.labelColor }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </div>
        <h2 v-else-if="record.fontSize === '2'" >
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </h2>
        <h3 v-else-if="record.fontSize === '3'" >
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </h3>
        <h4 v-else-if="record.fontSize === '4'">
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </h4>
        <h5 v-else-if="record.fontSize === '5'">
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </h5>
        <h6 v-else-if="record.fontSize === '6'">
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </h6>
        <div v-else>
          <span v-if="!record.labelShow || record.labelShow === '1'" :style="{ color: record.labelColor }">{{ record.name }} : </span>
          <span
            :style="{
              borderRadius: '2px',
              color: record.color,
              background: record.backGroundColor,
              paddingTop: record.topPadding + 'px',
              paddingBottom: record.bottomPadding + 'px',
              paddingLeft: record.leftPadding + 'px',
              paddingRight: record.rightPadding + 'px',
              marginTop: record.topMargin + 'px',
              marginBottom: record.bottomMargin + 'px',
              marginLeft: record.leftMargin + 'px',
              marginRight: record.rightMargin + 'px',
              display: 'inline-block'
            }"> {{ record.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 */
import Vue from 'vue'
import { Rate, Timeline } from 'ant-design-vue'
import ComponentArray from '../core/components_use'
import { mapGetters } from 'vuex'
const _ = require('lodash/object')
Vue.use(Rate)
Vue.use(Timeline)
export default {
  components: {
    customComponent: () => import('./customComponent'),
    AddressSelect: () => import('@/views/admin/Field/AddressSelect'),
    TabsSelect: () => import('@/views/admin/Field/TabsSelect'),
    QuillEditor: () => import('@/components/Editor/QuillEditor')
  },
  name: 'KFormItem',
  props: {
    // 表单数组
    record: {
      type: Object,
      required: true
    },
    // form-item 宽度配置
    formConfig: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    dynamicData: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      labelCol: { style: 'width: 100px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 100px); display: inline-block' },
      columns: [ {
        title: '字段名称',
        dataIndex: 'name'
      }, {
        title: 'UI组件',
        dataIndex: 'formtype'
      } ],
      columnsMark: [ {
        title: '变更字段',
        dataIndex: 'name'
      }, {
        title: '变更前',
        dataIndex: 'before'
      }, {
        title: '变更后',
        dataIndex: 'after'
      } ]
    }
  },
  computed: {
    customList () {
      if (window.$customComponentList) {
        return window.$customComponentList.map(item => item.type)
      } else {
        return []
      }
    },
    componentItem () {
      return ComponentArray[this.record.type]
    },
    componentOption () {
      return _.omit(this.record.options, ['defaultValue', 'disabled'])
    },
    ...mapGetters(['setting'])
  }
}
</script>
<style lang="less" scoped>
.slider-box {
  display: flex;
  > .slider {
    flex: 1;
    margin-right: 16px;
  }
  > .number {
    width: 70px;
  }
}
.anticon.anticon-question-circle-o {
  margin-left: 5px;
}
</style>
