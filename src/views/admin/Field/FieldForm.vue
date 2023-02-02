<template>
  <a-drawer
    :destroyOnClose="true"
    :title="config.title"
    :width="900"
    :visible="visible"
    @close="visible=!visible;"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <!-- 基础设置 -->
        <a-divider orientation="left">基础设置</a-divider>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">显示名称
            <a-tooltip placement="top">
              <span slot="title">字段在表单视图、数据窗口中的默认显示名称，建议控制在6个字符以内。</span>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input @change="handleChangeName" placeholder="取名也是一种艺术，少即是多，请克制在六个字以内" v-decorator="['info[name]', {initialValue: data.name, rules: [{ required: true, message: '请输入显示名称'}, { min:2, message: '请输入至少两个字符' }, { validator: checkName }]}]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">系统名称
            <a-tooltip placement="top">
              <template slot="title">
                <span>系统名称由显示名称的拼音首字母自动生成。保存时系统进行唯一性校验，若已存在当前名称，则会在末尾以2为起点，以1为步进增加数字标识，直到系统名称唯一。如：xtmc、xtmc2、xtmc3…</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input
            :disabled="aliasDisabled"
            v-decorator="['info[alias]', {
              initialValue: data.alias,
              rules: [
                { required: true, message: '请输入系统名称'},
                { pattern: new RegExp(/^(?![0-9])[a-z0-9_]+$/) , message: '只能包含小写字母、数字和下划线，且不能以数字开头' }
              ]}]"
          >
            <template v-if="config.action === 'edit'">
              <a-icon type="edit" slot="addonAfter" style="cursor: pointer;" v-if="aliasDisabled" @click="handleEdit" />
              <a-icon type="edit" slot="addonAfter" style="cursor: pointer;" v-else @click="aliasDisabled = true" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">分类名称
            <a-tooltip placement="top">
              <span slot="title">字段的所属分类，设置好字段分类会提升字段管理、表单视图/数据窗口中选择字段的效率。</span>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-auto-complete
            @search="onSearch"
            allowClear
            v-decorator="['info[category]', { initialValue: config.action === 'edit' ? config.record.category : ( setting.attribute.typename?setting.attribute.typename : '未分类' ), rules: [{ required: true, message: '请输入分类名称'}] }]">
            <template slot="dataSource">
              <a-select-option v-for="item1 in typeList" :key="item1.category">
                {{ item1.category }}
              </a-select-option>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <span slot="label">
            留痕
            <a-tooltip placement="top">
              <template slot="title">
                <span>当设置为开时，系统将记录该字段的变更日志</span>
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-switch v-decorator="['info[trace]', {initialValue: data.trace === '1', valuePropName: 'checked'}]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <span slot="label">列宽
            <a-tooltip placement="top">
              <span slot="title">字段在数据窗口的默认列宽。</span>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-input-number v-decorator="['setting[width]', {initialValue: data.setting ? data.setting.width : 150}]"/>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">允许/只读
            <a-tooltip placement="top">
              <span slot="title">字段在表单视图中默认的“允许/只读”属性，若表单视图中有新的配置，则会覆盖当前的默认配置。</span>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-radio-group v-decorator="['setting[rule]', {initialValue: data.setting ? data.setting.rule : 'allow'}]">
            <a-radio value="allow">允许</a-radio>
            <a-radio value="readonly">只读</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
          <span slot="label">字段状态
            <a-tooltip placement="top">
              <span slot="title">字段的“启用/禁用”状态。“禁用”时，该字段在所有表单视图、数据窗口将不可用。</span>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-radio-group v-decorator="['info[disabled]', {initialValue: data.disabled || '0'}]" >
            <a-radio value="0">启用</a-radio>
            <a-radio value="1">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <span slot="label">虚拟字段
            <a-tooltip placement="top">
              <span slot="title">该字段在数据库中并不真实存在，仅用于显示某关联表的关联字段值。该属性保存后不支持再次编辑。</span>
              <a-icon type="question-circle" />
            </a-tooltip>
          </span>
          <a-switch :disabled="config.action === 'edit'" v-decorator="['info[virtual]', {initialValue: data.virtual === '1' ? true : false, valuePropName: 'checked'}]" @change="checked => { data.virtual=checked ? '1' : '0' }"/>
        </a-form-item>
        <template v-if="data.virtual === '1'">
          <a-form-item label="源数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-cascader
              v-decorator="['setting[virtual][source]', {initialValue: setting.virtual.source || [], rules: [{ required: true, message: '请选择源数据表' }] }]"
              placeholder="请选择源数据表"
              :options="table_field"
              @change="virtualSourceChange"
            />
          </a-form-item>
          <a-form-item label="源数据表筛选字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              placeholder="请选择源数据表筛选字段"
              v-decorator="['setting[virtual][source_link_field]',
                            {initialValue: setting.virtual.source_link_field || '', rules: [{ required: true, message: '请选择源数据表筛选字段' }]}]">
              <a-select-option v-for="source_field in virtual_source_fields" :key="source_field.fieldid" :value="source_field.alias">{{ source_field.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="本表筛选字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              placeholder="请选择本表筛选字段"
              v-decorator="['setting[virtual][current_link_field]',
                            {initialValue: setting.virtual.current_link_field || '', rules: [{ required: true, message: '请选择本表筛选字段' }]}]">
              <a-select-option v-for="current_field in virtual_current_fields" :key="current_field.fieldid" :value="current_field.alias">{{ current_field.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="显示源数据表字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              placeholder="请选择显示源数据表字段"
              v-decorator="['setting[virtual][source_field]',
                            {initialValue: setting.virtual.source_field || '', rules: [{ required: true, message: '请选择显示源数据表字段' }]}]">
              <a-select-option v-for="source_field in virtual_source_fields" :key="source_field.fieldid" :value="source_field.alias">{{ source_field.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </template>
        <a-form-item label="字段备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :autoSize="{ minRows: 3, maxRows: 6 }" v-decorator="['info[remarks]', {initialValue: data.remarks || ''}]" />
        </a-form-item>
        <!-- UI组件 -->
        <template v-if="data.virtual !== '1'">
          <a-divider orientation="left">UI组件</a-divider>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
            <span slot="label">UI组件
              <a-tooltip placement="top">
                <span slot="title">表单控件在表单视图/数据窗口的展现形式。如：单行、多行、单选、多选、下拉等。</span>
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-select
              placeholder="请选择UI组件"
              show-search
              option-filter-prop="children"
              v-decorator="[ 'info[formtype]', {rules: [{ required: true, message: '请选择UI组件'}], initialValue: data.formtype || ''}]"
              @change="handleComponentChange">
              <a-select-option v-for="(item, key, index) in formtypes" :key="index" :value="item.value">{{ item.text }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-row v-if="['location','combobox','checkbox','image','file','organization','treeselect','tag'].includes(data.formtype)">
            <a-col :span="5"></a-col>
            <a-col :span="19">
              <a-alert v-if="['location'].includes(data.formtype)" message="该字段保存的是经纬度信息，经度在前，纬度在后，使用英文逗号分隔" banner />
              <a-alert v-else-if="['combobox','checkbox','organization','treeselect'].includes(data.formtype)" message="多选时，请结合实际情况，设置合理的字段长度。" banner />
              <a-alert v-else-if="['image','file','tag'].includes(data.formtype)" message="请结合实际情况，设置合理的字段长度。" banner />
            </a-col>

          </a-row>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.formtype !== 'subform'">
            <span slot="label">字段类型
              <a-tooltip placement="top">
                <span slot="title">由“UI组件”决定，一般情况下采用默认值即可。</span>
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-select
              placeholder="请选择字段类型"
              v-decorator="[ 'info[fieldtype]', {initialValue: data.fieldtype || '', rules: [{ required: true, message: '请选择字段类型'}]}]"
              @change="changeFieldtype">
              <a-select-option v-for="field_type in fieldtypes" :key="field_type.value" :value="field_type.value">{{ field_type.text }}</a-select-option>
            </a-select>
          </a-form-item>
          <template v-if="data.fieldtype === 'VARCHAR' && data.formtype !== 'subform'">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <span slot="label">字段长度
                <a-tooltip placement="top">
                  <span slot="title">由“UI组件”决定，一般情况下采用默认值即可。</span>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-input-number :disabled="data.formtype === 'switch'" :precision="0" :min="1" v-decorator="['info[fieldlength]', { initialValue: data.fieldlength || fieldlength[data.formtype], rules: [{ required: true, message: '请输入字段长度'}] }]"/>
            </a-form-item>
          </template>
          <template v-else-if="data.fieldtype === 'INT' || data.fieldtype === 'TINYINT' || data.fieldtype === 'SMALLINT' || data.fieldtype === 'MEDIUMINT' || data.fieldtype === 'BIGINT'">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">字段长度
                <a-tooltip placement="top">
                  <span slot="title">由“UI组件”决定，一般情况下采用默认值即可。</span>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-input-number :precision="0" :min="1" v-decorator="['info[fieldlength]', { initialValue: data.fieldlength || 11, rules: [{ required: true, message: '请输入字段长度'}] }]"/>
            </a-form-item>
          </template>
          <template v-else-if="data.fieldtype === 'DECIMAL'">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">字段长度
                <a-tooltip placement="top">
                  <span slot="title">由“UI组件”决定，一般情况下采用默认值即可。</span>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-input-number :precision="0" :min="1" v-decorator="['info[fieldlength]', { initialValue: data.fieldlength || 11, rules: [{ required: true, message: '请输入字段长度'}] }]"/>
            </a-form-item>
            <a-form-item label="小数位数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number @change="(val) => { data.fielddecimal = val }" :precision="0" :min="1" v-decorator="['fielddecimal', {initialValue: parseInt(data.fielddecimal) || 2}]"/>
            </a-form-item>
          </template>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.formtype === 'text' || data.formtype === 'associated' || data.formtype === 'datetime' || data.formtype === 'serialnumber'">
            <span slot="label">索引唯一
              <a-tooltip placement="top">
                <span slot="title">索引：即数据库普通Index索引。索引唯一：即数据库Unique Index索引，不允许重复。</span>
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-radio-group :disabled="data.formtype ==='serialnumber'" v-decorator="[ 'info[fieldkey]', { initialValue: data.fieldkey || '', rules: [{ required: false, message: '请选择索引'}]}]">
              <a-radio v-for="field_key in fieldkeys" :key="field_key.value" :value="field_key.value" >
                {{ field_key.text }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="帮助说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['setting[attribute][help]', { initialValue: setting.attribute.help || '' }]" />
          </a-form-item>
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="data.formtype !== 'switch' && data.formtype !== 'address' && data.formtype !=='serialnumber'">
            <span slot="label">是否必填
              <a-tooltip placement="top">
                <span slot="title">字段在表单视图中默认的“必填”属性，若表单视图中有新的配置，则会覆盖当前的默认配置。</span>
                <a-icon type="question-circle" />
              </a-tooltip>
            </span>
            <a-switch
              un-checked-children="否"
              checked-children="是"
              v-decorator="['setting[attribute][required]', {initialValue: setting.attribute.required == 'true' ? true : false, valuePropName: 'checked'}]"
              @change="(e) => { $set(setting.attribute , 'required', e ? 'true' : 'false' )}"/>
          </a-form-item>
          <!-- 单行文本 -->
          <template v-if="data.formtype === 'text'">
            <field-text ref="fieldText" :setting="setting" />
          </template>
          <!-- 多行文本 -->
          <template v-else-if="data.formtype === 'textarea'">
            <field-textarea ref="fieldTextarea" :setting="setting" />
          </template>
          <!-- 时间日期 -->
          <template v-else-if="data.formtype === 'datetime'">
            <field-date
              ref="fieldDate"
              :setting="setting"
              :formatOld="format"
              :tableField="table_field"
              :config="config"
              :dataOld="data" />
          </template>
          <!-- 单选框 下拉菜单 多选框 -->
          <template v-else-if="data.formtype === 'radio' || data.formtype=='checkbox' || data.formtype === 'combobox'">
            <field-select
              ref="fieldSelect"
              :setting="setting"
              :tableField="table_field"
              :dataOld="data"
              :config="config"
              :formtype="data.formtype"/>
          </template>
          <!-- 编辑框 -->
          <template v-else-if="data.formtype === 'editor'">
            <a-form-item label="编辑器高度" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number :min="1" v-decorator="['setting[attribute][height]',{initialValue: setting.attribute.height || 150, rules: [{ required: true, message: '请输入编辑器高度'}]}]"/> PX(像素)
            </a-form-item>
          </template>
          <!-- 自动完成 -->
          <template v-else-if="data.formtype === 'autocomplete'">
            <field-auto-complete
              ref="fieldAutoComplete"
              :setting="setting"
              :dataOld="data"
              :config="config"
              :tableField="table_field" />
          </template>
          <!-- 评分 -->
          <template v-else-if="data.formtype === 'score'">
            <field-rate
              ref="fieldRate"
              :setting="setting"
              :dataOld="data"
              :config="config"
              :tableField="table_field"/>
          </template>
          <!-- 图片 -->
          <template v-else-if="data.formtype === 'image'">
            <a-form-item label="允许上传数量" :labelCol="labelCol" :wrapperCol="wrapperCol" :validateStatus="imageStatus" :help="imgHelp">
              <a-input-number
                :min="0"
                :max="10"
                :precision="0"
                @change="(value) => { getImgNum(value, 'min') }"
                v-decorator="['setting[attribute][minFiles]',{initialValue: setting.attribute.minFiles || 0, rules: [{ required: true }]}]"/>
              <span style="margin: 0 5px;">~</span>
              <a-input-number
                :min="minImg > 0 ? minImg : 1"
                :max="10"
                :precision="0"
                @change="(value) => { getImgNum(value, 'max') }"
                v-decorator="['setting[attribute][maxFiles]', {initialValue: setting.attribute.maxFiles || 10, rules: [{ required: true }]}]"/>
            </a-form-item>
            <a-form-item label="单图片大小限制" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number
                :min="0"
                v-decorator="['setting[form][size]', { initialValue: setting.form.size || 10, rules: [{ required: true, message: '请输入单图片最大限制' }]}]" /> MB
            </a-form-item>
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-button size="small" style="border-radius: 5px;" :disabled="setting.form.defaultType === 'switch'" @click="handleDefaultLink">数据联动</a-button>
            </a-form-item>
            <a-form-item label="移动端配置" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-button size="small" @click="openImgSetting">
                <a-badge v-if="appSetFlag" status="success" text="设置" />
                <a-badge v-else status="default" text="设置" />
              </a-button>
            </a-form-item>
            <field-img-setting ref="fieldImgSetting" :config="config" :setting="setting" @ok="getAppSetting"/>
          </template>
          <!-- 附件 -->
          <template v-else-if="data.formtype === 'file'">
            <a-form-item label="允许上传数量" :labelCol="labelCol" :wrapperCol="wrapperCol" :validateStatus="imageStatus" :help="imgHelp">
              <a-input-number
                :min="0"
                :max="10"
                @change="(value) => { getImgNum(value, 'min') }"
                v-decorator="['setting[attribute][minFiles]',{initialValue: setting.attribute.minFiles || 0, rules: [{ required: true, message: '请输入最小附件数'}]}]"/>
              <span style="margin: 0 5px;">~</span>
              <a-input-number
                :min="minFiles > 0 ? minFiles : 1"
                :max="10"
                @change="(value) => { getImgNum(value, 'max') }"
                v-decorator="['setting[attribute][maxFiles]',{initialValue: setting.attribute.maxFiles || 10, rules: [{ required: true, message: '请输入最大附件数'}]}]"/>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">允许上传格式
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>允许上传的文件类型，以“,”(英文逗号)分隔，不填则可以上传任意类型文件</span>
                  </template>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-input v-decorator="['setting[form][format]', { initialValue: setting.form.format }]" />
            </a-form-item>
            <a-form-item label="单附件大小限制" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number
                :min="0"
                :max="fileMax"
                v-decorator="['setting[form][size]', { initialValue: setting.form.size || fileMax, rules: [{ required: true, message: '请输入单附件最大限制' }]}]" /> MB
            </a-form-item>
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-button size="small" style="border-radius: 5px;" :disabled="setting.form.defaultType === 'switch'" @click="handleDefaultLink">数据联动</a-button>
            </a-form-item>
          </template>
          <!-- 数字 -->
          <template v-else-if="data.formtype === 'number'">
            <field-number ref="fieldNumber" :setting="setting" :fieldtype="data.fieldtype" :precision="parseInt(data.fielddecimal)" />
          </template>
          <!-- 级联 -->
          <template v-else-if="data.formtype === 'cascader'">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">数据字典<a-tooltip title="只能选择树形字典"><a-icon type="question-circle"/></a-tooltip></span>
              <a-select
                v-decorator="['setting[form][src]', {initialValue: setting.form.src || undefined, rules: [{ required: true, message:'请选择数据字典' }]}]"
                placeholder="请选择数据字典"
                :showSearch="true"
                option-filter-prop="children"
                allowClear
                @change="getCascader"
              >
                <a-select-option v-for="value in src_path" :key="value.number" :value="value.number">
                  {{ value.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['setting[form][defaultValue]', {initialValue: setting.form.defaultValue || ''}]" v-show="false"/>
              <tabs-select
                :valueKey="cascaderValue"
                ref="tabsSelect"
                @send="getcascaderValue"
                :action="config.action"
                :defaultValue="setting.form.defaultValue"
                :writeBack="writeBack"
                fieldType="field"/>
            </a-form-item>
            <a-form-item label="是否必须选到叶子节点" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-switch
                un-checked-children="否"
                checked-children="是"
                v-decorator="['setting[attribute][select_model]', {initialValue: setting.attribute.select_model === 'end' ? true : false, valuePropName: 'checked'}]"
                @change="(e) => { $set(setting.attribute , 'select_model', e ? 'end' : 'any' )}"/>
            </a-form-item>
            <!-- 回写内容，下拉框且数据字典是会回写的 -->
            <a-form-item label="回写策略" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <div v-for="(value, index) in writeBack" :key="index">
                <a-row style="margin-left: 5px" :gutter="5">
                  <a-col :span="2">
                    <span>{{ index + 1 }}级名称</span>
                  </a-col>
                  <a-col :span="6">
                    <a-input v-model="value.tab"/>
                  </a-col>
                  <a-col :span="2" style="text-align: center">
                    <span>回写到</span>
                  </a-col>
                  <a-col :span="11">
                    <a-select :allowClear="true" v-model="value.value">
                      <a-select-option v-for="drop in dropDownField" :key="drop.alias" :value="drop.alias" @click="$set(value, 'value', drop.alias)">{{ drop.name }}</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="1">
                    <a-icon :style="{ fontSize: '24px', color: '#52c41a', 'padding-top': '3px' }" type="plus-square" theme="filled" @click="writeBack.push({ value: undefined , tab:writeBack.length + 1 + '级'})" />
                  </a-col>
                  <a-col :span="1">
                    <a-icon :style="{ fontSize: '24px', color: writeBack.length === 1 ? '#bfbfbf' : '#ff4d4f', 'padding-top': '3px'}" type="minus-square" theme="filled" @click="deletewriteBack(index)" />
                  </a-col>
                </a-row>
              </div>
            </a-form-item>
            <a-form-item label="后置图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-row>
                <a-col :span="8">
                  <a-radio-group @change="(e) =>{ latterIcon = e.target.value }" :defaultValue="setting.form.latterIcon || ''">
                    <a-radio value="">
                      无
                    </a-radio>
                    <a-radio value="string" @click="() =>{ if( setting.form.latterVal ){ setting.form.latterVal.type = '' } }">
                      文字
                    </a-radio>
                    <a-radio value="custom">
                      图标
                    </a-radio>
                  </a-radio-group>
                </a-col>
                <a-col :span="12">
                  <a-icon :type="latterVal.type" :theme="latterVal.theme" v-if="latterVal.type && latterIcon === 'custom'" />
                  <a-button style="margin-left: 10px" size="small" @click="handleMenuIcon" v-if="latterIcon === 'custom'">
                    设置
                  </a-button>
                  <menu-icon @ok="getIcon" ref="menuIcon" />
                  <a-form-item v-if="latterIcon === 'string'" style="width: 80px; margin: 0px">
                    <a-input v-decorator="['setting[form][latterVal][type]', { initialValue: setting.form.latterVal ? setting.form.latterVal.type : '' , rules: [{ max: 1, message:'字符长度不得大于1' }]}]"/>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', { initialValue: setting.form.quote_type || undefined, rules: [{ required: form.getFieldValue('setting[form][defaultValue]') ? true : false, message:'请选择默认值加载时机' }] }]">
                <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <!-- 开关 -->
          <template v-else-if="data.formtype === 'switch'">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <span slot="label">显示内容
                <a-tooltip placement="top">
                  <template slot="title">
                    开关字段显示内容一旦选择，无法修改；自定义文字时，不能超过2个字
                  </template>
                  <a-icon type="question-circle" />
                </a-tooltip>
              </span>
              <a-radio-group :defaultValue="setting.form.word.type ? setting.form.word.type : 'open'" @change="getSwitch" style="margin-top: 10px;" :disabled="config.action === 'edit'">
                <a-radio value="open">开/关</a-radio><br/>
                <a-radio value="yes">是/否</a-radio><br/>
                <a-radio value="enable">启用/禁用</a-radio><br/>
                <a-radio value="custom">自定义
                  <template>
                    "开"文字 <a-input
                      type="text"
                      style="width: 60px;"
                      v-model="openText"
                      @change="getSwitchText"
                      size="small"
                      :disabled="config.action === 'edit'" />
                    <a-divider type="vertical"></a-divider>
                    "关"文字 <a-input
                      type="text"
                      style="width: 60px;"
                      v-model="closeText"
                      @change="getSwitchText"
                      size="small"
                      :disabled="config.action === 'edit'" />
                  </template>
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success">
              <a-radio-group
                name="radioGroup"
                :defaultValue="setting.form.defaultType ? setting.form.defaultType : 'switch'"
                @change="getSwitchDef">
                <a-radio value="switch">
                  <a-switch
                    :disabled="setting.form.defaultType === 'linkData'"
                    :checked-children="onText || '开'"
                    :un-checked-children="offText || '关'"
                    :default-checked="setting.form.defaultValue === onText"
                    @change="(checked) => { setting.form.defaultValue = checked ? onText : offText }" />
                </a-radio>
                <a-radio value="linkData">
                  <a-button size="small" style="border-radius: 5px;" :disabled="setting.form.defaultType === 'switch'" @click="handleDefaultLink">数据联动</a-button>
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', { initialValue: setting.form.quote_type || undefined }]">
                <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <!-- 组织结构-->
          <template v-else-if="data.formtype === 'organization'">
            <a-form-item label="选择类型" :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-radio-group v-decorator="['setting[form][option_type]', {initialValue: setting.form.option_type || 'user'}]" @change="onChange">
                <a-radio value="user">用户</a-radio>
                <a-radio value="department">部门</a-radio>
                <a-radio value="role">角色</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="选择模式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group @change="(e) => { setting.attribute.mode = e.target.value }" v-decorator="['setting[attribute][mode]', {initialValue: setting.attribute.mode || 'default'}]">
                <a-radio value="default">单选</a-radio>
                <a-radio value="multiple">多选</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="可选范围" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select
                v-decorator="['setting[form][option_range]', {initialValue: setting.form.option_range || '3'}]"
                @change="handleOptionChange"
                style="width: 150px; margin-right: 10px;">
                <a-select-option value="3">不限制</a-select-option>
                <a-select-option value="0">自定义</a-select-option>
                <a-select-option value="1">数据联动</a-select-option>
                <a-select-option value="2">公式编辑</a-select-option>
              </a-select>
              <a-button v-if="optionValue === '0'" @click="handleSetting('optionCustom')">设置</a-button>
              <a-button v-else-if="optionValue === '1'" @click="handleDataLinkage">数据联动</a-button>
              <a-button v-else-if="optionValue === '2'" @click="handleFormulateEdit">公式编辑</a-button>
            </a-form-item>
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="optionValue !== '1'">
              <a-select
                v-decorator="['setting[form][defaultValue]', {initialValue: setting.form.defaultValue || '0'}]"
                @change="handleDefaultChange"
                style="width: 150px; margin-right: 10px;">
                <a-select-option value="0">自定义</a-select-option>
                <a-select-option value="1">数据联动</a-select-option>
                <a-select-option value="2">公式编辑</a-select-option>
              </a-select>
              <a-button v-if="defaultValue === '0'" @click="handleSetting('default')">设置</a-button>
              <a-button v-else-if="defaultValue === '1'" @click="handleDefaultDataLinkage">数据联动</a-button>
              <a-button v-else @click="handleDefaultFormulateEdit">公式编辑</a-button>
            </a-form-item>
            <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="optionValue !== '1'">
              <a-select :allowClear="true" v-decorator="['setting[form][default_load_time]', {initialValue: setting.form.default_load_time || ''}]">
                <a-select-option value="0">新建时加载</a-select-option>
                <a-select-option value="1">编辑时加载</a-select-option>
                <a-select-option value="2">总是加载</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <!-- 子表单 -->
          <template v-else-if="data.formtype === 'subform'">
            <a-form-item label="关联数据表" :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-cascader
                placeholder="请选择子表单对应的数据表"
                :allowClear="true"
                :show-search="true"
                option-filter-prop="children"
                :options="table_field"
                @change="handleTable"
                v-decorator="['setting[form][dataSheet]', { initialValue: setting.form.dataSheet || [], rules: [{ required: true, message: '请选择子表单对应的数据表' }] }]" />
            </a-form-item>
            <a-form-item
              label="关联字段"
              :validate-status="subformStatus"
              :help="subformHelp"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol" >
              <a-row>
                <a-col :span="2" style="margin-right: 9px;">
                  子表单的
                </a-col>
                <a-col :span="9" style="margin-right: 9px;">
                  <a-select
                    placeholder="请选择子表单字段"
                    :allowClear="true"
                    show-search
                    option-filter-prop="children"
                    @change="handleSonField"
                    v-decorator="['setting[form][son_field]', {initialValue: setting.form.son_field || undefined, rules: [{ required: true }]}]"
                  >
                    <a-select-option v-for="item in linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="3" style="margin-right: 9px;">
                  关联当前表的
                </a-col>
                <a-col :span="9">
                  <a-select
                    placeholder="请选择当前数据表字段"
                    :allowClear="true"
                    show-search
                    @change="handleCurrentField"
                    option-filter-prop="children"
                    v-decorator="['setting[form][current_field]', {initialValue: setting.form.current_field || undefined, rules: [{ required: true }]} ]"
                  >
                    <a-select-option v-for="item in currentFieldArr" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="关联数据窗口" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-row type="flex">
                <a-col flex="auto">
                  <a-select
                    :allowClear="true"
                    show-search
                    option-filter-prop="children"
                    placeholder="请选择对应的数据窗口"
                    @change="handleChangeDataForm"
                    v-decorator="['setting[form][dataView]', { initialValue: setting.form.dataView || undefined, rules: [{ required: true, message: '请选择对应的数据窗口' }] }]">
                    <a-select-option v-for="item in tpl" :key="item.uid" :value="item.uid">
                      {{ item.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col flex="100px">
                  <a-button-group style="margin-left: -1px">
                    <a-button :disabled="dataFormId" @click="handleDataForm('add')">添加</a-button>
                    <a-button :disabled="!dataFormId" @click="handleDataForm('edit')">编辑</a-button>
                  </a-button-group>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="关联数据表的key字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select
                placeholder="请选择关联数据表的key字段"
                mode="multiple"
                :allowClear="true"
                show-search
                option-filter-prop="children"
                v-decorator="['setting[form][son_field_key]', {initialValue: setting.form.son_field_key || undefined, rules: [{ required: true, message: '请选择关联数据表的key字段' }]}]"
              >
                <a-select-option v-for="item in linkFields" :key="item.fieldid" :value="item.alias">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <!-- 地址选择 -->
          <template v-else-if="data.formtype === 'address'">
            <field-address ref="fieldAddress" :setting="setting" :tableField="table_field" :config="config" />
          </template>
          <!-- 树选择 -->
          <template v-else-if="data.formtype==='treeselect'">
            <field-treeselect ref="fieldTreeselect" :setting="setting" :tableField="table_field" :config="config" />
          </template>
          <template v-else-if="data.formtype==='tag'">
            <a-form-item label="标签设置" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-button @click="$refs.fieldTagsSetting.show({title:'标签设置',tagSetting: setting.form.tagSetting})">
                <a-badge status="success" v-if="setting.form.tagSetting && setting.form.tagSetting.tagRule && setting.form.tagSetting.tagRule.length > 0"/>
                <a-badge status="default" v-else/>
                标签设置</a-button>
              <field-tags-setting ref="fieldTagsSetting" :tableid="config.tableid" @ok="(data)=> $set(setting.form,'tagSetting',data)"/>
            </a-form-item>
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol"></a-form-item>
            <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', {initialValue: setting.form.quote_type || ''}]">
                <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <!-- 关联数据 -->
          <template v-else-if="data.formtype === 'associated'">
            <LinkData ref="linkData" :setting="setting" :tableField="table_field" :config="config" />
          </template>
          <!-- 默认值 -->
          <template v-if="data.formtype === 'text' || data.formtype === 'textarea' || data.formtype === 'number' || data.formtype === 'autocomplete'" >
            <a-form-item label="默认值" :labelCol="labelCol" :wrapperCol="wrapperCol" validateStatus="success">
              <a-row :gutter="24">
                <a-col :span="8">
                  <a-select
                    :allowClear="true"
                    placeholder="请选择默认值模板"
                    v-decorator="['setting[form][defaultTemplate]', {initialValue: setting.form.defaultTemplate || ''}]"
                    @change="changeDefault">
                    <a-select-option v-for="default_template in defalut_templates" :key="default_template.value" :value="default_template.value">{{ default_template.text }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="12">
                  <a-input v-decorator="['setting[form][defaultValue]',{initialValue: setting.form.defaultValue || ''}]" v-if="defaultType === 'custom'"/>
                  <a-button v-else-if="defaultType === 'linkData'" @click="handleDefaultLink">数据联动</a-button>
                  <a-button v-else @click="handleDefaultEdit">
                    <a-badge v-if="defaultFlag" status="success" text="公式编辑" />
                    <a-badge v-else status="default" text="公式编辑" />
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item label="默认值加载时机" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select :allowClear="true" placeholder="请选择默认值加载时机" v-decorator="['setting[form][quote_type]', {initialValue: setting.form.quote_type || ''}]">
                <a-select-option v-for="quote_type in quote_types" :key="quote_type.value" :value="quote_type.value">{{ quote_type.text }}</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <!-- 链表查看 -->
          <template v-if="data.formtype == 'text' || data.formtype === 'associated'">
            <a-form-item label="链接查看" :labelCol="labelCol" :wrapperCol="wrapperCol" >
              <a-switch v-decorator="['setting[autofill][source_link_onoff]', {initialValue: setting.autofill.source_link_onoff == 1 ? true : false, valuePropName: 'checked'}]" @change="checked=>setting.autofill.source_link_onoff=checked"/>
            </a-form-item>
            <template v-if="setting.autofill.source_link_onoff">
              <a-form-item label="链接源数据表" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-cascader
                  :show-search="true"
                  optionFilterProp="children"
                  v-decorator="['setting[autofill][source]', {initialValue: setting.autofill.source || [], rules: [{ required: true, message: '链接源数据表不能为空'}] }]"
                  placeholder="请选择源数据表"
                  :options="table_field"
                  @change="sourceChange" />
              </a-form-item>
              <a-form-item label="链接关联条件" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-row :gutter="24">
                  <a-col :span="9">
                    <a-select
                      showSearch
                      optionFilterProp="children"
                      placeholder="请选择源数据表关联字段"
                      v-decorator="['setting[autofill][source_field]', {initialValue: setting.autofill.source_field || '', rules: [{ required: true, message: '链接关联条件不能为空'}]}]">
                      <a-select-option v-for="source_field in source_fields" :key="source_field.fieldid" :value="source_field.alias">{{ source_field.name }}</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="3" style="text-align: center">值等于</a-col>
                  <a-col :span="9">
                    <a-input style="width: 100%;" disabled :value="data.name" placeholder="当前字段的名称" />
                  </a-col>
                  <a-col :span="3">的值时</a-col>
                </a-row>
              </a-form-item>
              <a-form-item label="链接表单依赖的数据窗口" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-select placeholder="请选择链接查看表单依赖的数据窗口" v-decorator="['setting[autofill][source_linkview]', {initialValue: setting.autofill.source_linkview || '', rules: [{ required: true, message: '链接表单依赖的数据窗口不能为空'}]}]">
                  <a-select-option v-for="table in table_form_lists" :key="table.value" :value="table.value">{{ table.text }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="表单状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-radio-group v-decorator="['setting[autofill][source_status]', { initialValue: setting.autofill.source_status || 'inherit' }]">
                  <a-radio value="inherit">继承数据窗口设置</a-radio>
                  <a-radio value="readonly">只读</a-radio>
                </a-radio-group>
              </a-form-item>
            </template>
          </template>
          <!-- 流水号 -->
          <template v-else-if="data.formtype === 'serialnumber'">
            <field-serial ref="fieldSerial" :setting="setting" :config="config" />
          </template>
          <a-form-item label="附加属性" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-button size="small" @click="codeEditor">
              <a-badge v-if="attributeFlag" status="success" text="设置" />
              <a-badge v-else status="default" text="设置" />
            </a-button>
          </a-form-item>
        </template>
      </a-form>
      <code-editor ref="codeEditor" @func="getCode"/>
      <div class="bbar">
        <a-button type="primary" :hidden="config.record ? true : false" @click="handleSubmit(true)">保存并添加</a-button>
        <a-button type="primary" @click="handleSubmit(false)">保存</a-button>
        <a-button @click="visible = !visible">关闭</a-button>
      </div>
    </a-spin>
    <field-form-fillset ref="fieldFormFillset" :params="{ current_fields: this.current_fields, source_fields: this.source_fields, source_fillset: this.source_fillset}"/>
    <field-form-datalink ref="fieldFormDatalink" :tableField="table_field" :key="refreshKey" @ok="handleDataLink"/>
    <formula-edit ref="FormulaEdit" :params="formulaData" @ok="handleFormulate"/>
    <field-form-depart ref="fieldFormDepart" @ok="handleUser" :key="departKey" />
    <field-form-user ref="fieldFormUser" @ok="handleUser" :key="userKey" />
    <tplview-data-form ref="tplviewDataForm" @ok="getDataForm" />
    <DateLinkage ref="dataLinkage" @ok="getDateLinkage" :key="linkKey" />
  </a-drawer>
</template>
<script>
import debounce from 'lodash/debounce'
export default {
  components: {
    FieldFormFillset: () => import('./FieldFormFillset'),
    CodeEditor: () => import('@/views/admin/CodeEditor'),
    FieldFormDatalink: () => import('./FieldFormDatalink'),
    FormulaEdit: () => import('./FormulaEdit'),
    FieldFormDepart: () => import('./FieldFormDepart'),
    TplviewDataForm: () => import('../TplviewDataForm'),
    FieldFormUser: () => import('./FieldFormUser'),
    LinkData: () => import('./LinkData'),
    FieldText: () => import('./FieldText'),
    FieldTextarea: () => import('./FieldTextarea'),
    FieldNumber: () => import('./FieldNumber'),
    FieldDate: () => import('./FieldDate'),
    FieldSelect: () => import('./FieldSelect'),
    FieldAutoComplete: () => import('./FieldAutoComplete'),
    FieldRate: () => import('./FieldRate'),
    DateLinkage: () => import('./DataLinkage'),
    FieldSerial: () => import('./FieldSerial'),
    FieldAddress: () => import('./FieldAddress'),
    MenuIcon: () => import('../Menu/MenuIcon'),
    TabsSelect: () => import('./TabsSelect'),
    FieldTreeselect: () => import('./FieldTreeselect'),
    FieldTagsSetting: () => import('./FieldTagsSetting'),
    FieldImgSetting: () => import('./FieldImgSetting')
  },
  data () {
    this.checkName = debounce(this.checkName, 500)
    return {
      dataLink: {},
      defaultDataLink: {},
      refreshKey: 0,
      departKey: 2,
      userKey: 4,
      formulaData: {},
      typeValue: 'user',
      optionValue: '0',
      defaultValue: '0',
      config: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      visible: false,
      loading: false,
      aliasDisabled: false,
      data: {},
      form: this.$form.createForm(this),
      typeList: [],
      editable: false,
      table_field: [],
      setting: {
        form: {},
        attribute: {},
        autofill: {},
        virtual: {}
      },
      imageStatus: 'success',
      imgHelp: '',
      attributeFlag: false, // 设置
      defaultFlag: false, // 公式编辑
      codeType: 'setting', // 代码编辑器是由哪个打开
      formulateValue: [],
      source_fields: [],
      current_fields: [],
      table_form_lists: [],
      table_form_views: [],
      virtual_source_fields: [],
      virtual_current_fields: [],
      parent_number: [],
      cascaderValue: '',
      source_status: false,
      source_fillset: [],
      fieldlength: {
        text: 64,
        associated: 64,
        autocomplete: 64,
        combobox: 256,
        radio: 32,
        switch: 4,
        checkbox: 256,
        cascader: 32,
        address: 32,
        serialnumber: 32,
        organization: 256,
        treeselect: 256,
        tag: 256,
        location: 32
      },
      formtypes: {
        text: {
          value: 'text',
          text: '单行文本',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        textarea: {
          value: 'textarea',
          text: '多行文本',
          fieldtypes: [
            { value: 'TEXT', text: 'TEXT' },
            { value: 'MEDIUMTEXT', text: 'MEDIUMTEXT' },
            { value: 'LONGTEXT', text: 'LONGTEXT' }
          ]
        },
        datetime: {
          value: 'datetime',
          text: '日期时间',
          fieldtypes: [
            { value: 'DATETIME', text: 'DATETIME-日期时间' },
            { value: 'DATE', text: 'DATE-日期' },
            { value: 'TIME', text: 'TIME-时间' }
          ]
        },
        combobox: {
          value: 'combobox',
          text: '下拉框',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        radio: {
          value: 'radio',
          text: '单选框',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        checkbox: {
          value: 'checkbox',
          text: '复选框',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        editor: {
          value: 'editor',
          text: '编辑器',
          fieldtypes: [
            { value: 'TEXT', text: 'TEXT' },
            { value: 'MEDIUMTEXT', text: 'MEDIUMTEXT' },
            { value: 'LONGTEXT', text: 'LONGTEXT' }
          ]
        },
        image: {
          value: 'image',
          text: '图片',
          fieldtypes: [
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        file: {
          value: 'file',
          text: '附件',
          fieldtypes: [
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        number: {
          value: 'number',
          text: '数字',
          fieldtypes: [
            { value: 'INT', text: 'INT-整数' },
            { value: 'DECIMAL', text: 'DECIMAL-小数' }
          ]
        },
        cascader: {
          value: 'cascader',
          text: '级联选择',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        switch: {
          value: 'switch',
          text: '开关',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        score: {
          value: 'score',
          text: '评分',
          fieldtypes: [
            { value: 'TINYINT', text: 'TINYINT' }
          ]
        },
        serialnumber: {
          value: 'serialnumber',
          text: '流水号',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        organization: {
          value: 'organization',
          text: '组织结构',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        address: {
          value: 'address',
          text: '地址选择',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        treeselect: {
          value: 'treeselect',
          text: '树选择',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        subform: {
          value: 'subform',
          text: '子表单',
          fieldtypes: [ ]
        },
        associated: {
          value: 'associated',
          text: '关联数据',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        autocomplete: {
          value: 'autocomplete',
          text: '自动完成',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        },
        tag: {
          value: 'tag',
          text: '标签',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'TEXT', text: 'TEXT' }
          ]
        },
        location: {
          value: 'location',
          text: '地图选点',
          fieldtypes: [
            { value: 'VARCHAR', text: 'VARCHAR' }
          ]
        }
      },
      fieldtypes: [],
      fieldkeys: [
        { value: '', text: '无' },
        { value: 'unique_key', text: '唯一' },
        { value: 'key', text: '索引' }
      ],
      defalut_templates: [
        { value: '', text: '自定义' },
        { value: "{:date('Y-m-d H:i:s')}", text: '当前时刻' },
        { value: '{$Think.config.userinfo.username}', text: '当前登录用户名' },
        { value: '{$Think.config.userinfo.departmentname}', text: '登录用户所属部门名称' },
        { value: 'linkData', text: '数据联动' },
        { value: 'formula', text: '公式编辑' }
      ],
      defaultType: 'custom',
      quote_types: [
        { value: 'onlyinput', text: '前端页面加载-添加时' },
        { value: 'always', text: '前端页面加载-添加和编辑时' },
        { value: 'onlyinput_db', text: '后台系统加载-添加时' },
        { value: 'onlyupdate_db', text: '后台系统加载-编辑时' },
        { value: 'always_db', text: '后台系统加载-添加和编辑时' }
      ],
      regexs: [
        { value: '', text: '常用正则' },
        { value: '/^([+-]?)\\d*\\.?\\d+$/', text: '数字' },
        { value: '/^-?[1-9]\\d*$/', text: '整数' },
        { value: '/^[A-Za-z]+$/', text: '字母' },
        { value: '/^\\w+$/', text: '字母+数字' },
        { value: '/^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$/', text: 'E-mail' },
        { value: '/^[1-9]*[1-9][0-9]*$/', text: 'QQ' },
        { value: '/^http:///', text: '超级链接' },
        { value: '/^(1)[0-9]{10}$/', text: '手机号码' },
        { value: '/^[0-9-]{6,13}$/', text: '电话号码' },
        { value: '/^[0-9]{6}$/', text: '邮政编码' }
      ],
      limitLevelTypes: [
        { value: '>', text: '>' },
        { value: '>=', text: '>=' },
        { value: '==', text: '=' },
        { value: '<', text: '<' },
        { value: '<=', text: '<=' }
      ],
      count: 0,
      columns: [ {
        title: '当前表字段',
        dataIndex: 'current_field_name'
      }, {
        title: '源数据表字段',
        dataIndex: 'source_field_name'
      }, {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' }
      } ],
      optionCustom: [],
      custom: [],
      customObj: {},
      initMode: '', // 判断已保存数据与当前模式是否匹配
      defaultCustom: [],
      openText: '',
      closeText: '',
      onText: '',
      offText: '',
      customText: '',
      minFiles: 0, // 最小附件数
      minImg: 0, // 最小图片数
      maxImg: 10,
      fileMax: Infinity, // 图片附件最大存储限制
      switchValue: '', // 开关显示的值
      subformStatus: 'success',
      subformHelp: undefined,
      sonField: '1',
      currentField: '1',
      latterIcon: '',
      latterVal: {},
      src_path: [],
      currentFieldArr: [], // 当前表字段
      linkFields: [], // 关联数据表字段
      tpl: [], // 关联数据表窗口
      tableId: '',
      record: { id: '' },
      dropDownField: [], // 下拉字段
      writeBack: [{ value: undefined, tab: '1级' }, { value: undefined, tab: '2级' }], // 回写策略
      dataFormId: true,
      format: '', // 时间格式,
      linkKey: 'linkKey',
      appSetFlag: false
    }
  },
  methods: {
    show (config) {
      this.visible = true
      this.loading = true
      this.editable = false
      this.config = config
      this.aliasDisabled = config.action === 'edit'
      this.axios({
        url: this.config.url,
        data: Object.assign({ tableid: config.tableid ? config.tableid : 0, fieldid: config.record ? config.record.fieldid : 0 })
      }).then((res) => {
        this.form.resetFields()
        if (config.action === 'edit') {
          this.data = {}
          this.data = res.result.data
          this.data.setting = JSON.parse(this.data.setting)
        } else {
          this.data = {}
        }
        if (this.data.fieldtype === 'DECIMAL') {
          const fieldlength = this.data.fieldlength.split(',')
          this.data.fieldlength = fieldlength[0] || 0
          this.data.fielddecimal = fieldlength[1] || 0
        }
        this.fieldtypes = this.aliasDisabled ? this.formtypes[this.data.formtype].fieldtypes : []
        this.parent_number = res.result.parent_number
        this.setting = res.result.setting
        this.attributeFlag = !!this.setting.form.attribute
        // 子表单初始化
        if (this.setting.form.dataSheet && this.setting.form.dataSheet.length > 0) {
          const val = this.setting.form.dataSheet
          const tableField = val[val.length - 1]
          this.tableId = tableField
          this.axios({
            url: '/admin/tplview/fieldidTplidArr',
            params: { tableid: tableField, variable: 'table_subform_list' }
          }).then(res => {
            if (res.code === 0) {
              this.linkFields = res.result.field
              this.tpl = res.result.tpl
              this.tpl.forEach(item => {
                if (item.uid === this.setting.form.dataView) {
                  this.record.id = item.id
                  this.record.name = item.name
                }
              })
            } else {
              this.$message.error(res.msg)
            }
          })
        }
        // 默认值初始化
        if (this.setting.form.defaultTemplate !== 'linkData' && this.setting.form.defaultTemplate !== 'formula') {
          this.defaultType = 'custom'
        } else {
          this.defaultType = this.setting.form.defaultTemplate
          if (this.setting.form.defaultTemplate === 'formula') {
            this.defaultFlag = !!this.setting.form.defaultValue
          }
        }
        if (this.data.formtype === 'datetime') {
          if (config.action === 'add') {
            this.format = 'Y-m-d h:m:s'
          } else {
            this.format = this.setting.attribute.format
          }
        } else if (this.data.formtype === 'subform') {
          this.dataFormId = !!this.setting.form.dataView
          this.axios({
            url: '/admin/tplview/fieldidTplidArr',
            params: { tableid: this.config.tableid, variable: 'table_subform_list' }
          }).then(res => {
            if (res.code === 0) {
              this.currentFieldArr = res.result.field
            } else {
              this.$message.error(res.msg)
            }
          })
        } else if (this.data.formtype === 'organization') {
          // 创建或显示组织结构
          this.typeValue = this.setting.form.option_type || 'user'
          this.initMode = this.setting.form.option_type + '_' + this.setting.attribute.mode
          this.optionValue = this.setting.form.option_range || '3'
          this.defaultCustom = this.setting.form.defaultCustom
          this.custom = this.optionValue !== '3' ? this.setting.form.optionCustom : []
          this.customObj = {
            type: this.typeValue,
            value: this.custom,
            defaultCustom: this.defaultCustom
          }
          this.defaultValue = this.setting.form.defaultValue || '0'
          this.formulateValue = this.setting.form.formulateValue || '0'
          this.defaultFormulateValue = this.setting.form.defaultFormulateValue || '0'
          this.dataLink = this.setting.form.dataLink || {}
          this.defaultDataLink = this.setting.form.defaultDataLink || {}
        } else if (this.data.formtype === 'switch') {
          this.onText = this.setting.form.word.value.split('/')[0] || '开'
          this.offText = this.setting.form.word.value.split('/')[1] || '关'
          if (this.setting.form.word.type === 'custom') {
            this.openText = this.setting.form.word.value.split('/')[0]
            this.closeText = this.setting.form.word.value.split('/')[1]
          }
        } else if (this.data.formtype === 'image' || this.data.formtype === 'file') {
          this.minImg = parseInt(this.setting.attribute.minFiles)
          this.maxImg = parseInt(this.setting.attribute.maxFiles)
          this.appSetFlag = this.setting.form && !!this.setting.form.appSetting && this.setting.form.appSetting.length > 0
          this.axios({
            url: 'admin/field/getUploadMax'
          }).then(res => {
            this.fileMax = res.result.max
          })
        } else if (this.data.formtype === 'cascader') {
          this.writeBack = this.setting.form.writeBack && this.setting.form.writeBack.length > 0 ? this.setting.form.writeBack : [{ value: undefined, tab: '1级' }]
          this.writeBack.forEach(item => {
            if (!item.value) {
              item.value = undefined
            }
          })
          this.latterIcon = this.setting.form.latterIcon
          if (this.latterIcon === 'custom') {
            this.latterVal = this.setting.form.latterVal
          }
          this.axios({
            url: 'admin/dict/getDictList/',
            params: { 'category': '1' }
          }).then(res => {
            this.src_path = res.result
          })
          this.cascaderValue = this.setting.form.src
          this.axios({
            url: '/admin/field/getField/',
            params: { tableid: this.config.tableid, formtype: 'combobox' }
          }).then(res => {
            this.dropDownField = res.result.filter(item => item.setting.attribute.dataSource === 'src_path_back')
          })
        }
        this.table_field = res.result.table_field
        // 虚拟字段
        if (typeof (this.setting.virtual.source) !== 'undefined' && this.setting.virtual.source.length > 0) {
          this.axios({
            url: '/admin/field/getSourceOptions',
            params: Object.assign({ source_tableid: this.setting.virtual.source, current_tableid: this.config.tableid, virtual: 0 })
          }).then(res => {
            this.virtual_source_fields = res.result.source_fields
            this.virtual_current_fields = res.result.current_fields
          })
        }
        if (typeof (this.setting.autofill.source) !== 'undefined' && this.setting.autofill.source.length > 0) {
          this.axios({
            url: '/admin/field/getSourceOptions',
            params: Object.assign({ source_tableid: this.setting.autofill.source[1], current_tableid: this.config.tableid, virtual: 0 })
          }).then(res => {
            this.source_fields = res.result.source_fields
            this.current_fields = res.result.current_fields
            this.table_form_lists = res.result.table_form_lists
            this.table_form_views = res.result.table_form_views
            this.source_status = true
            if (typeof (this.setting.autofill.source_fillset) !== 'undefined') {
              this.source_fillset = JSON.parse(this.setting.autofill.source_fillset)
            }
          })
        }
        this.loading = false
      })
    },
    // 自动完成搜索
    onSearch (val) {
      val = val.trim()
      if (val) {
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.axios({
            url: 'admin/table/searchCategory/',
            params: {
              type: 'field',
              tableid: this.config.tableid,
              category: val
            }
          }).then(res => {
            this.typeList = res.result.data
          })
        }, 500)
      } else {
        clearTimeout(this.timeoutId)
        this.typeList = []
      }
    },
    deletewriteBack (index) {
      if (this.writeBack.length > 1) {
        this.writeBack.splice(index, 1)
      }
    },
    // 获取级联菜单数据
    getCascader (value) {
      this.cascaderValue = value
      this.$refs.tabsSelect.contents = ''
      this.$refs.tabsSelect.showData = [{ data: '', tab: '1级' }]
      this.$refs.tabsSelect.activeKey = 0
      this.form.setFieldsValue({
        'setting[form][defaultValue]': ''
      })
    },
    getcascaderValue (val) {
      this.form.setFieldsValue({
        'setting[form][defaultValue]': val
      })
    },
    // 根据显示名称赋值系统名称
    handleChangeName (e) {
      this.data.name = e.target.value
      if (this.aliasDisabled) {
        return false
      }
      const pinyin = require('js-pinyin')
      const reg = new RegExp(/^(?![0-9]|_)[a-z0-9_]+$/)
      const reg2 = new RegExp(/^[a-z0-9_]+$/)
      var val = pinyin.getCamelChars(e.target.value)
      val = val.toLowerCase()
      val = val.split('')
      this.getVal(val, reg)
      val = val.filter(item => {
        return reg2.test(item)
      })
      const { setFieldsValue } = this.form
      setFieldsValue({ 'info[alias]': val.join('') })
    },
    handleEdit () {
      const that = this
      this.$confirm({
        title: '您确认要修改系统名称吗？',
        content: '修改系统名称会造成系统未知错误，强烈建议不要修改',
        onOk () {
          that.aliasDisabled = false
        }
      })
    },
    // 递归判断是否首字不是数字
    getVal (val, reg) {
      if (!reg.test(val[0])) {
        val.shift()
        this.getVal(val, reg)
      }
    },
    sourceChange (value) {
      this.axios({
        url: '/admin/field/getSourceOptions',
        params: Object.assign({ source_tableid: value[1], current_tableid: this.config.tableid, virtual: 0 })
      }).then(res => {
        this.source_fields = res.result.source_fields
        this.current_fields = res.result.current_fields
        this.table_form_lists = res.result.table_form_lists
        this.table_form_views = res.result.table_form_views
        this.source_status = true
      })
    },
    // 获取图片最小数
    getImgNum (value, type) {
      if (type !== 'min') {
        this.maxImg = value
      } else {
        this.minImg = value
        if (this.minImg > this.maxImg) {
          this.form.setFieldsValue({
            'setting[attribute][maxFiles]': value
          })
          this.setting.attribute.maxFiles = this.minImg
          this.maxImg = this.minImg
        }
      }
      if (!this.minImg && this.minImg !== 0) {
        this.imageStatus = 'error'
        this.imgHelp = '请输入最小图片数'
      } else if (!this.maxImg && this.maxImg !== 0) {
        this.imageStatus = 'error'
        this.imgHelp = '请输入最大图片数'
      } else {
        this.imgHelp = ''
        this.imageStatus = 'success'
      }
    },
    // 获取附件最小数
    getMinFiles (e) {
      this.minFiles = e
    },
    // 获取图标
    getIcon (value) {
      this.latterVal = value
    },
    // 后置图标
    handleLatter (val) {
      this.latterIcon = val.target.value
    },
    // 打开图标库
    handleMenuIcon () {
      this.$refs.menuIcon.show()
    },
    // 打开设置附加属性
    codeEditor () {
      this.codeType = 'setting'
      this.$refs.codeEditor.show({
        value: this.setting.form.attribute || ''
      })
    },
    // 获取附加属性
    getCode (value) {
      if (this.codeType === 'setting') {
        this.setting.form.attribute = value
        this.attributeFlag = !!value
      } else {
        this.setting.form.defaultValue = value
        this.defaultFlag = !!value
      }
    },
    // 选择UI组件
    handleComponentChange (value) {
      this.data.formtype = value
      this.fieldtypes = this.formtypes[value].fieldtypes
      const fieldtype = value !== 'subform' ? this.formtypes[value].fieldtypes[0].value : []
      const { setFieldsValue } = this.form
      setFieldsValue({ 'info[fieldtype]': fieldtype, 'info[fieldkey]': '' })
      this.data.fieldtype = fieldtype
      switch (value) {
        case 'datetime':
          this.setting.attribute.format = 'Y-m-d H:i:s'
          this.format = 'Y-m-d H:i:s'
          break
        case 'switch':
          this.setting.form = this.setting.form || {}
          this.$set(this.setting.form, 'defaultType', 'switch')
          this.$set(this.setting.form, 'defaultValue', '关')
          this.setting.form.word = {
            type: 'open',
            value: '开/关'
          }
          this.onText = '开'
          this.offText = '关'
          break
        case 'organization':
          this.setting.attribute.required = '0'
          this.setting.form_type = '0'
          this.setting.attribute.mode = 'default'
          this.setting.form.option_range = '3'
          this.setting.form.defaultValue = ''
          this.setting.form.default_load_time = '0'
          this.setting.form.optionCustom = []
          this.setting.form.defaultOptionCustom = []
          this.setting.form.dataLink = {}
          this.setting.form.defaultDataLink = {}
          this.setting.form.formulateValue = {}
          this.setting.form.defaultFormulateValue = {}
          this.defaultValue = '0'
          this.optionValue = '3'
          break
        case 'subform':
          this.dataFormId = false
          this.linkFields = []
          this.tpl = []
          this.axios({
            url: '/admin/tplview/fieldidTplidArr',
            params: { tableid: this.config.tableid, variable: 'table_subform_list' }
          }).then(res => {
            if (res.code === 0) {
              this.currentFieldArr = res.result.field
            } else {
              this.$message.error(res.msg)
            }
          })
          break
        case 'image':
        case 'cascader':
          this.axios({
            url: '/admin/field/getField/',
            params: { tableid: this.config.tableid, formtype: 'combobox' }
          }).then(res => {
            this.dropDownField = res.result.filter(item => item.setting.attribute.dataSource === 'src_path_back')
          })
          this.axios({
            url: '/admin/dict/getDictList/',
            params: { category: '1' }
          }).then(res => {
            this.src_path = res.result
          })
          break
        case 'file':
          this.axios({
            url: 'admin/field/getUploadMax'
          }).then(res => {
            this.fileMax = res.result.max
          })
          break
        case 'serialnumber':
          this.setting.form = this.setting.form
          this.form.setFieldsValue({ 'info[fieldkey]': 'unique_key' })
          this.data.fieldkey = 'unique_key'
          break
        default:
          break
      }
    },
    // 选择字段类型
    changeFieldtype (value) {
      this.data.fieldtype = value
      if (this.data.formtype === 'number') {
        this.data.fielddecimal = this.data.fielddecimal || 2
        this.data.fieldlength = ''
      } else if (this.data.formtype === 'datetime') {
        switch (value) {
          case 'DATETIME':
            this.$set(this.setting.attribute, 'format', 'Y-m-d H:i:s')
            this.format = 'Y-m-d H:i:s'
            break
          case 'DATE':
            this.$set(this.setting.attribute, 'format', 'Y-m-d')
            this.format = 'Y-m-d'
            break
          case 'TIME':
            this.$set(this.setting.attribute, 'format', 'H:i:s')
            this.format = 'H:i:s'
            break
          default:
            break
        }
      }
    },
    // 选择默认值
    changeDefault (val) {
      this.setting.form.defaultTemplate = val
      if (val !== 'linkData' && val !== 'formula') {
        this.defaultType = 'custom'
        this.form.setFieldsValue({ 'setting[form][defaultValue]': val })
      } else {
        this.defaultType = val
      }
    },
    // 默认值数据联动
    handleDefaultLink () {
      this.linkKey = this.linkKey === 'linkKey' ? 'linkKey_1' : 'linkKey'
      this.$nextTick(() => {
        this.$refs.dataLinkage.show({
          data: this.data,
          setting: this.setting,
          table_field: this.table_field,
          tableid: this.config.tableid
        })
      })
    },
    // 获取数据联动值
    getDateLinkage (val) {
      this.setting.form.defaultValueLink = val
    },
    // 默认值公式编辑
    handleDefaultEdit () {
      this.codeType = 'defaultSetting'
      this.$refs.codeEditor.show({
        value: this.setting.form.defaultValueLink || ''
      })
    },

    // 图片移动端设置
    openImgSetting () {
      this.$refs.fieldImgSetting.show()
    },

    // 组织结构
    // 选择类型
    onChange (e) {
      this.typeValue = e.target.value
      if (this.typeValue !== this.customObj.type) {
        this.custom = []
        this.defaultCustom = []
      } else {
        this.custom = this.customObj.value
        this.defaultCustom = this.customObj.defaultCustom
      }
    },
    // 选择默认值
    handleDefaultChange (value) {
      this.defaultValue = value
    },
    handleDataLink (res) {
      if (res.dataType === 'dataLink') {
        this.datalink = res.data
        this.setting.form.dataLink = this.datalink
      } else {
        this.defaultDataLink = res.data
        this.setting.form.defaultDataLink = this.defaultDataLink
      }
    },
    // 进入选择页面
    handleSetting (dataType) {
      let optionType = ''
      let url = ''
      if (this.typeValue === 'user') {
        this.userKey = this.userKey === 4 ? 4 : 5
        optionType = 'user'
        this.$nextTick(() => {
          this.$refs.fieldFormUser.show({
            optionCustom: this.custom,
            defaultValue: this.defaultCustom,
            initMode: this.initMode,
            mode: dataType === 'optionCustom' ? 'multiple' : this.setting.attribute.mode,
            dataType: dataType,
            optionType
          })
        })
        return
      } else if (this.typeValue === 'department') {
        optionType = 'department'
        url = '/admin/Department/getDepartmentUser'
      } else if (this.typeValue === 'role') {
        optionType = 'role'
        url = '/admin/Role/getRoleData'
      }
      this.departKey = this.departKey === 2 ? 3 : 2
      this.$nextTick(() => {
        this.$refs.fieldFormDepart.show({
          optionCustom: this.custom,
          defaultValue: this.defaultCustom,
          mode: dataType === 'optionCustom' ? 'multiple' : this.setting.attribute.mode,
          initMode: this.initMode,
          dataType: dataType,
          optionType: optionType,
          url: url
        })
      })
    },
    // 获取选择的值
    handleUser (val, dataType, initMode, mode) {
      // 选择范围值
      this.initMode = initMode
      this.customObj.type = this.typeValue
      if (dataType === 'optionCustom') {
        this.custom = val
        this.customObj.value = val
      } else {
        // 默认值，值为用户真实姓名，其他为id组成的数组
        switch (this.typeValue) {
          case 'user':
            this.defaultCustom = mode === 'default' ? val : val.map(item => {
              return item.username
            })
            break
          case 'department':
            this.defaultCustom = mode === 'default' ? val : val.map(item => {
              return item.departmentid
            })
            break
          case 'role':
            this.defaultCustom = mode === 'default' ? val : val.map(item => {
              return item.roleid
            })
            break
          default:
            break
        }
        this.customObj.defaultCustom = this.defaultCustom
      }
    },
    // 虚拟字段
    virtualSourceChange (value) {
      return this.axios({
        url: '/admin/field/getSourceOptions',
        params: Object.assign({ source_tableid: value[1], current_tableid: this.config.tableid, virtual: 0 })
      }).then(res => {
        this.virtual_source_fields = res.result.source_fields
        this.virtual_current_fields = res.result.current_fields
      })
    },
    handleFormulateEdit () {
      this.setting.form.formulateValue = this.formulateValue
      this.formulaData = { tableid: this.config.tableid, data: this.setting.form.formulateValue || {} }
      this.$refs.FormulaEdit.show({ title: '公式编辑器', dataType: 'formulateValue' })
    },
    handleDefaultFormulateEdit () {
      this.setting.form.defaultFormulateValue = this.defaultFormulateValue
      this.formulaData = { tableid: this.config.tableid, data: this.setting.form.defaultFormulateValue || {} }
      this.$refs.FormulaEdit.show({ title: '公式编辑器', dataType: 'defaultFormulateValue' })
    },
    handleDataLinkage () {
      this.setting.form.datalink = this.datalink
      const { form: { getFieldValue } } = this
      const alias = getFieldValue('info[alias]')
      const name = getFieldValue('info[name]')
      if (this.refreshKey) {
        this.refreshKey = 0
      } else {
        this.refreshKey = 1
      }
      this.$nextTick(() => {
        this.$refs.fieldFormDatalink.show({
          tableid: this.config.tableid,
          data: this.setting.form.dataLink,
          name: name,
          alias: alias,
          dataType: 'dataLink'
        })
      })
    },
    handleDefaultDataLinkage () {
      this.setting.form.defaultDataLink = this.defaultDataLink
      const { form: { getFieldValue } } = this
      const alias = getFieldValue('info[alias]')
      const name = getFieldValue('info[name]')
      if (this.refreshKey) {
        this.refreshKey = 0
      } else {
        this.refreshKey = 1
      }
      this.$nextTick(() => {
        this.$refs.fieldFormDatalink.show({
          tableid: this.config.tableid,
          data: this.setting.form.defaultDataLink,
          name: name,
          alias: alias,
          dataType: 'defaultDataLink'
        })
      })
    },
    handleOptionChange (value) {
      this.optionValue = value
      if (value !== '1') {
        this.defaultValue = '0'
        this.setting.form.defaultValue = '0'
        this.custom = ''
      }
    },
    handleFormulate (res) {
      if (res.dataType === 'formulateValue') {
        this.formulateValue = res.data
      } else {
        this.defaultFormulateValue = res.data
      }
    },
    handleAdd () {
      this.$refs.fieldFormFillset.show({
        action: 'add',
        title: '添加填充设置',
        record: {
          id: (new Date()).valueOf()
        }
      })
    },
    handleDelete (record) {
      const dataSource = [...this.source_fillset]
      this.source_fillset = dataSource.filter(item => item.id !== record.id)
    },
    // 开光文字
    getSwitch (e) {
      const value = e.target.value
      this.setting.form.word.type = value
      const obj = {
        open: '开/关',
        yes: '是/否',
        enable: '启用/禁用',
        custom: this.openText + '/' + this.closeText
      }
      this.setting.form.word.value = obj[value]
      this.onText = obj[value].split('/')[0]
      this.offText = obj[value].split('/')[1]
    },
    getSwitchDef (e) {
      this.setting.form.defaultType = e.target.value
      this.setting.form.defaultValue = e.target.value === 'switch' ? '关' : {}
    },
    getSwitchText () {
      this.onText = this.openText = this.openText.slice(0, 2)
      this.offText = this.closeText = this.closeText.slice(0, 2)
      this.setting.form.word.value = this.openText + '/' + this.closeText
    },
    // 子表单-> 选择数据表
    handleTable (val) {
      const tableField = val[val.length - 1]
      this.tableId = tableField
      this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: { tableid: tableField, variable: 'table_subform_list' }
      }).then(res => {
        if (res.code === 0) {
          this.linkFields = res.result.field
          this.tpl = res.result.tpl
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 选择关联字段
    handleSonField (val) {
      this.sonField = val
      if (!this.sonField || !this.currentField) {
        this.subformHelp = '请选择关联字段'
        this.subformStatus = 'error'
      } else {
        this.subformHelp = ''
        this.subformStatus = 'success'
      }
    },
    handleCurrentField (val) {
      this.currentField = val
      if (!this.sonField || !this.currentField) {
        this.subformHelp = '请选择关联字段'
        this.subformStatus = 'error'
      } else {
        this.subformHelp = ''
        this.subformStatus = 'success'
      }
    },
    // 获取数据窗口id
    handleChangeDataForm (val) {
      this.dataFormId = !!val
      this.tpl.forEach(item => {
        if (item.uid === val) {
          this.tableId = item.value
          this.record.id = item.id
          this.record.name = item.name
        }
      })
    },
    // 显示名称验证是否重复
    checkName (rule, value, callback) {
      this.axios({
        url: 'admin/field/fieldNameUnique',
        data: {
          tableid: this.config.tableid,
          name: value,
          unique: 1,
          id: this.config.record ? this.config.record.id : '' }
      }).then(res => {
        if (res.code === 1) {
          callback(res.message)
        } else {
          callback()
        }
      })
    },
    // 打开数据窗口
    handleDataForm (action) {
      if (action === 'add') {
        this.$refs.tplviewDataForm.show({
          action: 'add',
          title: '添加: 子表视图',
          tableid: this.tableId,
          submitUrl: '/admin/tplview/addData',
          config: this.config,
          url: '/admin/tplview/editData',
          variable: 'table_subform_list'
        })
      } else {
        this.$refs.tplviewDataForm.show({
          action: 'edit',
          title: '编辑：' + this.record.name,
          url: '/admin/tplview/editData',
          tableid: this.tableId,
          config: this.config,
          record: this.record,
          variable: 'table_subform_list'
        })
      }
    },
    // 获取设置数据窗口
    getDataForm (value, uid) {
      this.axios({
        url: '/admin/tplview/fieldidTplidArr',
        params: { tableid: this.tableId, variable: 'table_subform_list' }
      }).then(res => {
        if (res.code === 0) {
          this.linkFields = res.result.field
          this.tpl = res.result.tpl
          this.setting.form.subDataForm = value
          if (uid) {
            const { setFieldsValue } = this.form
            setFieldsValue({ 'setting[form][dataView]': uid })
            this.dataFormId = true
            this.tpl.forEach(item => {
              if (item.uid === uid) {
                this.record.id = item.id
                this.record.name = item.name
              }
            })
          }
        } else {
          this.$message.error(res.message)
        }
      })
    },

    // 获取移动端图片设置
    getAppSetting (value) {
      this.appSetFlag = !(!value || value.length === 0)
      this.setting.form.appSetting = value
    },

    // 提交数据
    handleSubmit (visible = false) {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.info.category = values.info.category ? values.info.category.replace(/\s+/g, '') : ''
          values.setting.form = values.setting.form || {}
          values.setting.attribute = values.setting.attribute || {}
          // 是否必填值修改为'true'和'false'
          values.setting.attribute.required = values.setting.attribute.required ? 'true' : 'false'
          values.info.trace = values.info.trace ? '1' : '0'
          if (this.source_fillset.length > 0) {
            values.setting.autofill.source_fillset = JSON.stringify(this.source_fillset)
          }
          let val = {}
          switch (values.info.formtype) {
            case 'switch':
              values.setting.form = values.setting.form ? values.setting.form : {}
              values.setting.form.word = {}
              values.info.fieldlength = 4
              values.setting.form.defaultType = this.setting.form.defaultType
              values.setting.form.defaultValue = this.setting.form.defaultValue
              values.setting.form.word.type = this.setting.form.word.type
              values.setting.form.word.value = this.setting.form.word.value
              break
            case 'organization':
              let idName = ''
              switch (this.typeValue) {
                case 'user':
                  idName = 'username'
                  break
                case 'department':
                  idName = 'departmentid'
                  break
                case 'role':
                  idName = 'roleid'
                  break
                default:
                  break
              }
              // 组织结构单选默认值
              if (this.optionValue === '3') {
                this.custom = []
              }
              if (this.setting.attribute.mode === 'default') {
                if (idName === 'username') {
                  this.defaultCustom = this.custom.some(item => {
                    return item[idName] === this.defaultCustom
                  }) ? this.defaultCustom : undefined
                } else {
                  this.defaultCustom = this.custom.some(item => {
                    return item[idName] === this.defaultCustom[0]
                  }) ? this.defaultCustom : undefined
                }
              } else if (this.setting.attribute.mode === 'multiple') {
                // 多选默认值
                this.defaultCustom = this.defaultCustom && typeof (this.defaultCustom) !== 'string' ? this.defaultCustom.filter(item => {
                  return this.custom.some(item1 => {
                    return item1[idName] === item
                  })
                }) : undefined
              }
              values.setting.form.optionCustom = this.custom
              values.setting.form.defaultCustom = this.defaultCustom
              values.setting.form.dataLink = this.datalink
              values.setting.form.defaultDataLink = this.defaultDataLink
              values.setting.form.formulateValue = this.formulateValue
              values.setting.form.defaultFormulateValue = this.defaultFormulateValue
              values.setting.form.subDataForm = this.setting.form.subDataForm
              break
            case 'associated':
              this.loading = false
              val = this.$refs.linkData.handleSubmit()
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = false
              break
            case 'text':
              this.loading = false
              val = this.$refs.fieldText.handleSubmit()
              if (val.setting) {
                values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
                values.setting.form = Object.assign(values.setting.form, val.setting.form)
              } else {
                return false
              }
              this.loading = true
              break
            case 'textarea':
              this.loading = false
              val = this.$refs.fieldTextarea.handleSubmit()
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = true
              break
            case 'number':
              this.loading = false
              val = this.$refs.fieldNumber.handleSubmit()
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = true
              break
            case 'datetime':
              this.loading = false
              val = this.$refs.fieldDate.handleSubmit()
              if (Object.keys(val).length === 0) return
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = values.setting.form ? values.setting.form : {}
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = true
              break
            case 'combobox':
            case 'radio':
            case 'checkbox':
              this.loading = false
              val = this.$refs.fieldSelect.handleSubmit()
              if (Object.keys(val).length === 0) return
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = values.setting.form ? values.setting.form : {}
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = true
              break
            case 'file':
              let format = values.setting.form.format || ''
              format = format.trim()
              const arr = format.split(',')
              const arr1 = arr.map(item => item.trim())
              values.setting.form.format = arr1.join(',')
              break
            case 'autocomplete':
              this.loading = false
              val = this.$refs.fieldAutoComplete.handleSubmit()
              if (Object.keys(val).length === 0) return
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = values.setting.form ? values.setting.form : {}
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = true
              break
            case 'score':
              this.loading = false
              val = this.$refs.fieldRate.handleSubmit()
              if (Object.keys(val).length === 0) return
              values.setting.attribute = Object.assign(values.setting.attribute, val.setting.attribute)
              values.setting.form = values.setting.form ? values.setting.form : {}
              values.setting.form = Object.assign(values.setting.form, val.setting.form)
              this.loading = true
              break
            case 'cascader':
              values.setting.attribute.select_model = values.setting.attribute.select_model ? 'end' : 'any'
              values.setting.form.writeBack = this.writeBack.filter(item => item.value || item.tab)
              values.setting.form.writeBack.forEach(item => {
                item.value = item.value ? item.value : ''
              })
              values.setting.form.latterIcon = this.latterIcon
              if (this.latterIcon === 'custom') {
                values.setting.form.latterVal = this.latterVal
              }
              break
            case 'address':
              this.loading = false
              val = this.$refs.fieldAddress.handleSubmit()
              if (Object.keys(val).length === 0) return
              if (!values.setting.attribute) {
                values.setting.attribute = {
                  required: val.setting.attribute && val.setting.attribute.required ? 'true' : 'false'
                }
              } else {
                values.setting.attribute.required = val.setting.attribute && val.setting.attribute.required ? 'true' : 'false'
              }
              values.setting.form = val.setting.form
              this.loading = true
              break
            case 'treeselect':
              this.loading = false
              values.setting.attribute.inherit = values.setting.attribute.inherit ? '1' : '0'
              values.setting.attribute.multiple = values.setting.attribute.multiple ? '1' : '0'
              values.setting.attribute.select_model = values.setting.attribute.select_model ? 'end' : 'any'
              values.setting.form.latterIcon = this.$refs.fieldTreeselect.latterIcon
              values.setting.form.latterVal = this.$refs.fieldTreeselect.latterIcon !== 'string' ? this.$refs.fieldTreeselect.latterVal : values.setting.form.latterVal
              values.setting.form.writeBack = this.$refs.fieldTreeselect.writeBack
              this.loading = true
              break
            case 'serialnumber':
              this.loading = false
              val = this.$refs.fieldSerial.handleSubmit()
              values.setting.form.serialRule = val
              this.loading = true
              break
            case 'image':
              values.setting.form.appSetting = this.$refs.fieldImgSetting.dynamicData
              break
            case 'tag':
              values.setting.form.tagSetting = this.setting.form.tagSetting
              break
            default:
              break
          }
          values.setting.form.attribute = this.setting.form.attribute
          if ((values.setting.form.defaultTemplate === 'linkData' || values.setting.form.defaultTemplate === 'formula' || this.setting.form.defaultType === 'linkData') && values.info.formtype !== 'address') {
            values.setting.form.defaultValueLink = this.setting.form.defaultValueLink
          }
          // 虚拟字段&&子表单默认设置为单行文本，VARCHAR，1
          if (values.info.virtual || values.info.formtype === 'subform') {
            values.info.fieldtype = 'VARCHAR'
            values.info.fieldlength = 1
          }
          values.info.formtype = values.info.virtual ? 'text' : values.info.formtype
          this.axios({
            url: this.config.url,
            data: Object.assign(values, { action: 'submit', tableid: this.config.tableid, fieldid: this.config.record ? this.config.record.fieldid : 0 })
          }).then((res) => {
            this.visible = visible
            this.loading = false
            this.$emit('ok', values)
            if (res.message) {
              this.$message.warning(res.message)
            } else {
              this.$message.success('操作成功')
              this.openText = ''
              this.closeText = ''
              this.form.resetFields()
              if (visible) {
                this.show(this.config)
              }
            }
          })
        } else {
          if (errors.setting && errors.setting.form && (errors.setting.form.current_field || errors.setting.form.son_field)) {
            this.subformStatus = 'error'
            this.subformHelp = '请选择关联字段'
          }
        }
      })
    }
  }
}
</script>
