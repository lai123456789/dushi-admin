<template>
  <a-spin :spinning="loading">
    <div v-if="flowScope === 'proceed'">
      <a-card class="table-search">
        <a-form :form="formSearch" :class="advancedSearch ? 'advanced' : 'normal'" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <div class="head">
            <div class="title">过滤</div>
            <a-space style="margin-left: 8px">
              <a-dropdown-button htmlType="submit" @click="handleSearch({tag: true})" class="dropdown" >
                <span>搜索</span>
                <a-menu slot="overlay">
                  <a-menu-item :key="2" @click="showSearch">
                    高级搜索
                  </a-menu-item>
                  <template v-for="(item, index) in condiList">
                    <a-menu-item :key="index + 3" @click="handleHighSearchMenu(item)">
                      {{ item.name }}
                    </a-menu-item>
                  </template>
                </a-menu>
              </a-dropdown-button>
              <a-button @click="() => {queryParam = { flowCondition:'my_process' }, clearAddress(), formSearch.resetFields(), handleSearch({tag: false})}">重置</a-button>
              <a v-show="!advancedSearch" @click="changeAdvancedSearch">展开<a-icon type="down" style="fontSize: 12px;" /></a>
              <a v-show="advancedSearch" @click="changeAdvancedSearch">收起<a-icon type="up" style="fontSize: 12px;" /></a>
            </a-space>
          </div>
          <a-row :gutter="16">
            <a-col v-if="advancedSearch" span="24">
              <div class="divider"></div>
            </a-col>
            <!-- 下面是动态生成区域，要根据不同的组件进行相应展示 -->
            <a-col
              v-for="(item, index) in template"
              :key="index"
              v-bind="{ span: item.column }"
            >
              <a-form-item :label="item.change_title ? item.change_title : item.name" :validate-status="item.formtype === 'number' ? 'success' : ''" v-if="item.field && item.fieldrule!=='hidden'">
                <!-- 单行文本 多行文本 -->
                <a-input
                  v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  :placeholder="item.searchPattern === 'fuzzy' ? '模糊搜索':'精确搜索'"
                  v-if="item.formtype === 'text' || item.formtype === 'textarea' || item.formtype === 'associated'|| item.formtype === 'serialnumber'"
                ></a-input>
                <!-- 日期 -->
                <a-range-picker
                  :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                  v-decorator="[item.field.alias, {rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATETIME'"
                ></a-range-picker>
                <a-range-picker
                  showTime
                  v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  style="width: 100%;"
                  format="YYYY-MM-DD"
                  v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATE'"
                ></a-range-picker>
                <!-- 下拉框、单选框、复选框 -->
                <a-select
                  v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  mode="multiple"
                  v-else-if="item.field.formtype === 'combobox'"
                  placeholder="请选择"
                  :allowClear="true"
                  show-search
                  option-filter-prop="children"
                >
                  <a-select-option v-for="(myitem,myindex) in item.field.option" :key="myindex" :value="myitem.value">{{ myitem.label }}</a-select-option>
                </a-select>
                <!-- 数字 -->
                <a-input-group compact v-else-if="item.formtype === 'number'" style="margin-bottom: 0px">
                  <a-input-number
                    style="width: calc(50% - 15px);"
                    v-decorator="[item.field.alias + '.left']"
                    :disabled="item.fieldrule !== 'allow'"/>
                  <a-input placeholder="~" disabled style="width: 30px; pointer-events: none; backgroundColor: #fff;"/>
                  <a-input-number
                    v-decorator="[item.field.alias + '.right']"
                    style="width: calc(50% - 15px);"
                    :disabled="item.fieldrule !== 'allow'"/>
                </a-input-group>
                <!-- 级联选择 -->
                <div v-else-if="item.formtype === 'cascader'">
                  <a-input v-show="false" v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"/>
                  <tabs-select
                    :field="item.field"
                    :valueKey="item.field.setting.form.src || ''"
                    :defaultValue="item.field.value.value ? item.field.value.value : item.field.setting.form.defaultValue"
                    :alias="item.field.alias"
                    searchType="searchType"
                    :writeBack="item.field.setting.form.writeBack"
                    :fieldrule="item.fieldrule"
                    :ref="item.field.alias"
                    @send="getcascaderValue"
                  />
                </div>
                <!-- 地址组件 -->
                <div v-else-if="item.formtype === 'address'">
                  <a-input
                    v-show="false"
                    v-decorator="[item.field.alias, {
                      rules: [{ required: item.field.setting.attribute.required === 'true', message: item.field.name + '不能为空'}]
                    }]" />
                  <address-select :ref="item.field.alias" :series="item.field.setting.form.show_series" :field="item.field" :alias="item.field.alias" @send="getAddress"/>
                </div>
                <!-- 开关 -->
                <a-select
                  v-else-if="item.field.formtype === 'switch'"
                  v-decorator="[item.field.alias]"
                  placeholder="请选择"
                  :allowClear="true" >
                  <a-select-option :value="item.field.setting.form.word.value.split('/')[0]">{{ item.field.setting.form.word.value.split('/')[0] }}</a-select-option>
                  <a-select-option :value="item.field.setting.form.word.value.split('/')[1]">{{ item.field.setting.form.word.value.split('/')[1] }}</a-select-option>
                </a-select>
                <!-- 组织结构 -->
                <div v-else-if="item.field.formtype === 'organization'">
                  <a-row type="flex" align="middle">
                    <a-col flex="0 0 calc(100% - 27px)">
                      <a-select
                        v-decorator="[item.field.alias, {
                          rules: [{ required: item.fieldrule !== 'hidden' && item.field.setting.attribute.required === 'true', message: item.name + '不能为空'}]
                        }]"
                        show-search
                        allowClear
                        :default-active-first-option="false"
                        :not-found-content="null"
                        option-filter-prop="children"
                        :show-arrow="false"
                        :filter-option="false"
                        style="width: 100%;"
                        @change="(val) => { item.field.value = val }"
                        mode="multiple"
                        @search="(val) => { organizationSearch(item, val) }"
                        @blur="() => { item.field.selectList = [] }"
                      >
                        <template v-if="item.field.setting.form.option_type === 'user'" >
                          <a-select-option v-for="(item1, index1) in item.field.selectList" :key="index1" :value="item1.username">
                            {{ item1.text }}
                          </a-select-option>
                        </template>
                        <template v-else-if="item.field.setting.form.option_type === 'department'" >
                          <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.departmentid">
                            {{ item1.name }}
                          </a-select-option>
                        </template>
                        <template v-else >
                          <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.roleid">
                            {{ item1.rolename }}
                          </a-select-option>
                        </template>
                      </a-select>
                    </a-col>
                    <a-col flex="27px">
                      <a-button
                        icon="user"
                        v-if="item.field.setting.form.option_type === 'user'"
                        style="margin-left: -1px; padding-bottom: 2px;"
                        @click="handleSelectUserForm(item, index)">
                      </a-button>
                      <a-button
                        icon="apartment"
                        v-else-if="item.field.setting.form.option_type === 'department'"
                        style="margin-left: -1px; padding-bottom: 2px;"
                        @click="handleSelect(item, index)">
                      </a-button>
                      <a-button
                        icon="user"
                        v-else
                        style="margin-left: -1px; padding-bottom: 2px;"
                        @click="handleSelect(item, index)">
                      </a-button>
                    </a-col>
                  </a-row>
                </div>
              </a-form-item>
              <a-divider :orientation="item.dividerDirection" v-else-if="item.type === 'divider'">{{ item.dividerText }}</a-divider>
              <a-input v-else-if="item.type === 'place'" style="opacity: 0"></a-input>
              <component v-else-if="item.type === 'component'" :is="item.component" />
            </a-col>
          </a-row>
        </a-form>
      </a-card>
      <a-card>
        <!-- 操作按钮 -->
        <div class="table-operator">
          <a-radio-group button-style="solid" v-model="flowCondition" @change="(e)=>{ handleConditionChange(e) }" style="margin-right: 8px;" v-if="!searchStyle && proceed.length > 0">
            <a-tooltip v-for="item in proceed" :key="item.value" :title="item.help" v-show="item.priv === 'visit' && item.enable !== '0'">
              <a-radio-button :value="item.value">{{ item.customName ? item.customName : item.name }}</a-radio-button>
            </a-tooltip>
          </a-radio-group>
          <a-select v-model="flowCondition" @change="(e)=>{handleSelectChange(e)}" style="width: 300px; margin-right: 8px;" v-else-if="searchStyle && proceed && proceed.length > 0">
            <a-select-option v-for="item in proceed.filter(item => item.enable === '1' && item.priv === 'visit')" :key="item.value" :value="item.value">{{ item.customName ? item.customName : item.name }}</a-select-option>
          </a-select>
          <!-- 自定义列按钮 -->
          <a-icon type="setting" style="float: right; margin: 10px 10px 0 0; font-size: 18px" @click="customShow" v-if="customColumns == '1' ? true : false" />
          <!-- 下面是动态生成区域 -->
          <component v-for="(item, index) in tbar" :key="index" :is="item.component" />
        </div>
        <!-- 数据列表 -->
        <s-table
          ref="table"
          size="small"
          rowKey="id"
          :columns="columns"
          :data="loadDataTable"
          :rowSelection="rowSelection"
          :pageSize="pagesize"
          :pageMode="pageMode"
          :autoLoad="false"
          :scroll="scroll"
        >
        </s-table>
      </a-card>
    </div>
    <div v-else-if="flowScope === 'finish'">
      <a-card class="table-search">
        <a-form :form="formSearchOver" :class="advancedSearchOver ? 'advanced' : 'normal'" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <div class="head">
            <div class="title">过滤</div>
            <a-space style="margin-left: 8px">
              <a-dropdown-button htmlType="submit" @click="handleSearch({tag: true})" class="dropdown" >
                <span>搜索</span>
                <a-menu slot="overlay">
                  <a-menu-item :key="2" @click="showSearch">
                    高级搜索
                  </a-menu-item>
                  <template v-for="(item, index) in condiList">
                    <a-menu-item :key="index + 3" @click="handleHighSearchMenu(item)">
                      {{ item.name }}
                    </a-menu-item>
                  </template>
                </a-menu>
              </a-dropdown-button>
              <a-button @click="() => {queryParamOver = { flowCondition:'my_handle' }, params.endDate = this.moment().startOf('month').format('YYYY-MM'), endDate = this.moment().startOf('month'), clearAddress(), formSearchOver.resetFields(), handleSearch({tag: false})}">重置</a-button>
              <a v-show="!advancedSearchOver" @click="changeAdvancedSearch">展开<a-icon type="down" style="fontSize: 12px;" /></a>
              <a v-show="advancedSearchOver" @click="changeAdvancedSearch">收起<a-icon type="up" style="fontSize: 12px;" /></a>
            </a-space>
          </div>
          <a-row :gutter="16">
            <a-col v-if="advancedSearchOver" span="24">
              <div class="divider"></div>
            </a-col>
            <a-col v-bind="{ span: 6 }" v-if="timeRangeDisplay !== '0'">
              <a-form-item label="流程结束时间">
                <a-month-picker
                  :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                  format="YYYY-MM"
                  @change="getEndDateChange"
                  :allowClear="false"
                  v-model="endDate"
                  style="width: 100%;"
                ></a-month-picker>
              </a-form-item>
            </a-col>
            <!-- 下面是动态生成区域，要根据不同的组件进行相应展示 -->
            <a-col
              v-for="(item, index) in template"
              :key="index"
              v-bind="{ span: item.column }"
            >
              <a-form-item :label="item.change_title ? item.change_title : item.name" :validate-status="item.formtype === 'number' ? 'success' : ''" v-if="item.field && item.fieldrule!=='hidden'">
                <!-- 单行文本 多行文本 -->
                <a-input
                  v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  :placeholder="item.searchPattern === 'fuzzy' ? '模糊搜索':'精确搜索'"
                  v-if="item.formtype === 'text' || item.formtype === 'textarea' || item.formtype === 'associated'|| item.formtype === 'serialnumber'"
                ></a-input>
                <!-- 日期 -->
                <a-range-picker
                  :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                  v-decorator="[item.field.alias, {rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATETIME'"
                ></a-range-picker>
                <a-range-picker
                  showTime
                  v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  style="width: 100%;"
                  format="YYYY-MM-DD"
                  v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATE'"
                ></a-range-picker>
                <!-- 下拉框、单选框、复选框 -->
                <a-select
                  v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                  :disabled="item.fieldrule !== 'allow'"
                  mode="multiple"
                  v-else-if="item.field.formtype === 'combobox'"
                  placeholder="请选择"
                  :allowClear="true"
                  show-search
                  option-filter-prop="children"
                >
                  <a-select-option v-for="(myitem,myindex) in item.field.option" :key="myindex" :value="myitem.value">{{ myitem.label }}</a-select-option>
                </a-select>
                <!-- 数字 -->
                <a-input-group compact v-else-if="item.formtype === 'number'" style="margin-bottom: 0px">
                  <a-input-number
                    style="width: calc(50% - 15px);"
                    v-decorator="[item.field.alias + '.left']"
                    :disabled="item.fieldrule !== 'allow'"/>
                  <a-input placeholder="~" disabled style="width: 30px; pointer-events: none; backgroundColor: #fff;"/>
                  <a-input-number
                    v-decorator="[item.field.alias + '.right']"
                    style="width: calc(50% - 15px);"
                    :disabled="item.fieldrule !== 'allow'"/>
                </a-input-group>
                <!-- 级联选择 -->
                <div v-else-if="item.formtype === 'cascader'">
                  <a-input v-show="false" v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"/>
                  <tabs-select
                    :field="item.field"
                    :valueKey="item.field.setting.form.src || ''"
                    :defaultValue="item.field.value.value ? item.field.value.value : item.field.setting.form.defaultValue"
                    :alias="item.field.alias"
                    searchType="searchType"
                    :writeBack="item.field.setting.form.writeBack"
                    :fieldrule="item.fieldrule"
                    :ref="item.field.alias"
                    @send="getcascaderValue"
                  />
                </div>
                <!-- 地址组件 -->
                <div v-else-if="item.formtype === 'address'">
                  <a-input
                    v-show="false"
                    v-decorator="[item.field.alias, {
                      rules: [{ required: item.field.setting.attribute.required === 'true', message: item.field.name + '不能为空'}]
                    }]" />
                  <address-select :ref="item.field.alias" :series="item.field.setting.form.show_series" :field="item.field" :alias="item.field.alias" @send="getAddress"/>
                </div>
                <!-- 开关 -->
                <a-select
                  v-else-if="item.field.formtype === 'switch'"
                  v-decorator="[item.field.alias]"
                  placeholder="请选择"
                  :allowClear="true" >
                  <a-select-option :value="item.field.setting.form.word.value.split('/')[0]">{{ item.field.setting.form.word.value.split('/')[0] }}</a-select-option>
                  <a-select-option :value="item.field.setting.form.word.value.split('/')[1]">{{ item.field.setting.form.word.value.split('/')[1] }}</a-select-option>
                </a-select>
                <!-- 组织结构 -->
                <div v-else-if="item.field.formtype === 'organization'">
                  <a-row type="flex" align="middle">
                    <a-col flex="0 0 calc(100% - 27px)">
                      <a-select
                        v-decorator="[item.field.alias, {
                          rules: [{ required: item.fieldrule !== 'hidden' && item.field.setting.attribute.required === 'true', message: item.name + '不能为空'}]
                        }]"
                        show-search
                        allowClear
                        :default-active-first-option="false"
                        :not-found-content="null"
                        option-filter-prop="children"
                        :show-arrow="false"
                        :filter-option="false"
                        style="width: 100%;"
                        @change="(val) => { item.field.value = val }"
                        mode="multiple"
                        @search="(val) => { organizationSearch(item, val) }"
                        @blur="() => { item.field.selectList = [] }"
                      >
                        <template v-if="item.field.setting.form.option_type === 'user'" >
                          <a-select-option v-for="(item1, index1) in item.field.selectList" :key="index1" :value="item1.username">
                            {{ item1.text }}
                          </a-select-option>
                        </template>
                        <template v-else-if="item.field.setting.form.option_type === 'department'" >
                          <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.departmentid">
                            {{ item1.name }}
                          </a-select-option>
                        </template>
                        <template v-else >
                          <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.roleid">
                            {{ item1.rolename }}
                          </a-select-option>
                        </template>
                      </a-select>
                    </a-col>
                    <a-col flex="27px">
                      <a-button
                        icon="user"
                        v-if="item.field.setting.form.option_type === 'user'"
                        style="margin-left: -1px; padding-bottom: 2px;"
                        @click="handleSelectUserForm(item, index)">
                      </a-button>
                      <a-button
                        icon="apartment"
                        v-else-if="item.field.setting.form.option_type === 'department'"
                        style="margin-left: -1px; padding-bottom: 2px;"
                        @click="handleSelect(item, index)">
                      </a-button>
                      <a-button
                        icon="user"
                        v-else
                        style="margin-left: -1px; padding-bottom: 2px;"
                        @click="handleSelect(item, index)">
                      </a-button>
                    </a-col>
                  </a-row>
                </div>
              </a-form-item>
              <a-divider :orientation="item.dividerDirection" v-else-if="item.type === 'divider'">{{ item.dividerText }}</a-divider>
              <a-input v-else-if="item.type === 'place'" style="opacity: 0"></a-input>
              <component v-else-if="item.type === 'component'" :is="item.component" />
            </a-col>
          </a-row>
        </a-form>
      </a-card>
      <a-card>
        <!-- 操作按钮 -->
        <div class="table-operator">
          <a-radio-group button-style="solid" v-model="flowConditionOver" @change="(e)=>{ handleConditionChange(e) }" style="margin-right: 8px;" v-if="!searchStyle && finish.length > 0">
            <a-tooltip v-for="item in finish" :key="item.value" v-show="item.priv === 'visit' && item.enable !== '0'" :title="item.help">
              <a-radio-button :value="item.value">{{ item.customName ? item.customName : item.name }}</a-radio-button>
            </a-tooltip>
          </a-radio-group>
          <a-select v-model="flowConditionOver" @change="(e)=>{handleSelectChange(e)}" style="width: 300px; margin-right: 8px;" v-else-if="searchStyle && finish && finish.length > 0">
            <a-select-option v-for="item in finish.filter(item => item.enable === '1' && item.priv === 'visit')" :key="item.value" :value="item.value">{{ item.customName ? item.customName : item.name }}</a-select-option>
          </a-select>
          <!-- 下面是动态生成区域 -->
          <component v-for="(item, index) in tbar" :key="index" :is="item.component" v-show="item.bar_alias !== 'flow_create'"/>
          <!-- 自定义列按钮 -->
          <a-icon type="setting" style=" position:absolute; right: 18px; top: 18px; font-size: 18px" @click="customShow" v-if="customColumns == '1' ? true : false" />
        </div>
        <!-- 数据列表 -->
        <s-table
          ref="tableOver"
          size="small"
          rowKey="id"
          :columns="columnsOver"
          :data="loadDataTableOver"
          :rowSelection="rowSelection"
          :pageSize="pagesize"
          :pageMode="pageMode"
          :autoLoad="false"
          :scroll="scroll"
        >
        </s-table>
      </a-card>
    </div>
    <a-tabs style="background: #FFF" v-model="flowStatus" @change="tabChange" v-else>
      <a-tab-pane tab="进行中" key="proceed">
        <a-card class="table-search">
          <a-form :form="formSearch" :class="advancedSearch ? 'advanced' : 'normal'" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <div class="head">
              <div class="title">过滤</div>
              <a-space style="margin-left: 8px">
                <a-dropdown-button htmlType="submit" @click="handleSearch({tag: true})" class="dropdown" >
                  <span>搜索</span>
                  <a-menu slot="overlay">
                    <a-menu-item :key="2" @click="showSearch">
                      高级搜索
                    </a-menu-item>
                    <template v-for="(item, index) in condiList">
                      <a-menu-item :key="index + 3" @click="handleHighSearchMenu(item)">
                        {{ item.name }}
                      </a-menu-item>
                    </template>
                  </a-menu>
                </a-dropdown-button>
                <a-button @click="() => {queryParam = { flowCondition:'my_process' }, clearAddress(), formSearch.resetFields(), handleSearch({tag: false})}">重置</a-button>
                <a v-show="!advancedSearch" @click="changeAdvancedSearch">展开<a-icon type="down" style="fontSize: 12px;" /></a>
                <a v-show="advancedSearch" @click="changeAdvancedSearch">收起<a-icon type="up" style="fontSize: 12px;" /></a>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col v-if="advancedSearch" span="24">
                <div class="divider"></div>
              </a-col>
              <!-- 下面是动态生成区域，要根据不同的组件进行相应展示 -->
              <a-col
                v-for="(item, index) in template"
                :key="index"
                v-bind="{ span: item.column }"
              >
                <a-form-item :label="item.change_title ? item.change_title : item.name" :validate-status="item.formtype === 'number' ? 'success' : ''" v-if="item.field && item.fieldrule!=='hidden'">
                  <!-- 单行文本 多行文本 -->
                  <a-input
                    v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    :placeholder="item.searchPattern === 'fuzzy' ? '模糊搜索':'精确搜索'"
                    v-if="item.formtype === 'text' || item.formtype === 'textarea' || item.formtype === 'associated'|| item.formtype === 'serialnumber'"
                  ></a-input>
                  <!-- 日期 -->
                  <a-range-picker
                    :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                    v-decorator="[item.field.alias, {rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    style="width: 100%;"
                    format="YYYY-MM-DD HH:mm:ss"
                    v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATETIME'"
                  ></a-range-picker>
                  <a-range-picker
                    showTime
                    v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    style="width: 100%;"
                    format="YYYY-MM-DD"
                    v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATE'"
                  ></a-range-picker>
                  <!-- 下拉框、单选框、复选框 -->
                  <a-select
                    v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    mode="multiple"
                    v-else-if="item.field.formtype === 'combobox'"
                    placeholder="请选择"
                    :allowClear="true"
                    show-search
                    option-filter-prop="children"
                  >
                    <a-select-option v-for="(myitem,myindex) in item.field.option" :key="myindex" :value="myitem.value">{{ myitem.label }}</a-select-option>
                  </a-select>
                  <!-- 数字 -->
                  <a-input-group compact v-else-if="item.formtype === 'number'" style="margin-bottom: 0px">
                    <a-input-number
                      style="width: calc(50% - 15px);"
                      v-decorator="[item.field.alias + '.left']"
                      :disabled="item.fieldrule !== 'allow'"/>
                    <a-input placeholder="~" disabled style="width: 30px; pointer-events: none; backgroundColor: #fff;"/>
                    <a-input-number
                      v-decorator="[item.field.alias + '.right']"
                      style="width: calc(50% - 15px);"
                      :disabled="item.fieldrule !== 'allow'"/>
                  </a-input-group>
                  <!-- 级联选择 -->
                  <div v-else-if="item.formtype === 'cascader'">
                    <a-input v-show="false" v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"/>
                    <tabs-select
                      :field="item.field"
                      :valueKey="item.field.setting.form.src || ''"
                      :defaultValue="item.field.value.value ? item.field.value.value : item.field.setting.form.defaultValue"
                      :alias="item.field.alias"
                      searchType="searchType"
                      :writeBack="item.field.setting.form.writeBack"
                      :fieldrule="item.fieldrule"
                      :ref="item.field.alias"
                      @send="getcascaderValue"
                    />
                  </div>
                  <!-- 地址组件 -->
                  <div v-else-if="item.formtype === 'address'">
                    <a-input
                      v-show="false"
                      v-decorator="[item.field.alias, {
                        rules: [{ required: item.field.setting.attribute.required === 'true', message: item.field.name + '不能为空'}]
                      }]" />
                    <address-select :ref="item.field.alias" :series="item.field.setting.form.show_series" :field="item.field" :alias="item.field.alias" @send="getAddress"/>
                  </div>
                  <!-- 开关 -->
                  <a-select
                    v-else-if="item.field.formtype === 'switch'"
                    v-decorator="[item.field.alias]"
                    placeholder="请选择"
                    :allowClear="true" >
                    <a-select-option :value="item.field.setting.form.word.value.split('/')[0]">{{ item.field.setting.form.word.value.split('/')[0] }}</a-select-option>
                    <a-select-option :value="item.field.setting.form.word.value.split('/')[1]">{{ item.field.setting.form.word.value.split('/')[1] }}</a-select-option>
                  </a-select>
                  <!-- 组织结构 -->
                  <div v-else-if="item.field.formtype === 'organization'">
                    <a-row type="flex" align="middle">
                      <a-col flex="0 0 calc(100% - 27px)">
                        <a-select
                          v-decorator="[item.field.alias, {
                            rules: [{ required: item.fieldrule !== 'hidden' && item.field.setting.attribute.required === 'true', message: item.name + '不能为空'}]
                          }]"
                          show-search
                          allowClear
                          :default-active-first-option="false"
                          :not-found-content="null"
                          option-filter-prop="children"
                          :show-arrow="false"
                          :filter-option="false"
                          style="width: 100%;"
                          @change="(val) => { item.field.value = val }"
                          mode="multiple"
                          @search="(val) => { organizationSearch(item, val) }"
                          @blur="() => { item.field.selectList = [] }"
                        >
                          <template v-if="item.field.setting.form.option_type === 'user'" >
                            <a-select-option v-for="(item1, index1) in item.field.selectList" :key="index1" :value="item1.username">
                              {{ item1.text }}
                            </a-select-option>
                          </template>
                          <template v-else-if="item.field.setting.form.option_type === 'department'" >
                            <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.departmentid">
                              {{ item1.name }}
                            </a-select-option>
                          </template>
                          <template v-else >
                            <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.roleid">
                              {{ item1.rolename }}
                            </a-select-option>
                          </template>
                        </a-select>
                      </a-col>
                      <a-col flex="27px">
                        <a-button
                          icon="user"
                          v-if="item.field.setting.form.option_type === 'user'"
                          style="margin-left: -1px; padding-bottom: 2px;"
                          @click="handleSelectUserForm(item, index)">
                        </a-button>
                        <a-button
                          icon="apartment"
                          v-else-if="item.field.setting.form.option_type === 'department'"
                          style="margin-left: -1px; padding-bottom: 2px;"
                          @click="handleSelect(item, index)">
                        </a-button>
                        <a-button
                          icon="user"
                          v-else
                          style="margin-left: -1px; padding-bottom: 2px;"
                          @click="handleSelect(item, index)">
                        </a-button>
                      </a-col>
                    </a-row>
                  </div>
                </a-form-item>

                <a-divider :orientation="item.dividerDirection" v-else-if="item.type === 'divider'">{{ item.dividerText }}</a-divider>
                <a-input v-else-if="item.type === 'place'" style="opacity: 0"></a-input>
                <component v-else-if="item.type === 'component'" :is="item.component" />
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <a-card>
          <!-- 操作按钮 -->
          <div class="table-operator">
            <a-radio-group button-style="solid" v-model="flowCondition" @change="(e)=>{ handleConditionChange(e) }" style="margin-right: 8px;" v-if="!searchStyle && proceed.length > 0">
              <a-tooltip v-for="item in proceed" :key="item.value" :title="item.help" v-show="item.priv === 'visit'&& item.enable !== '0'">
                <a-radio-button :value="item.value">{{ item.customName ? item.customName : item.name }}</a-radio-button>
              </a-tooltip>
            </a-radio-group>
            <a-select v-model="flowCondition" @change="(e)=>{handleSelectChange(e)}" style="width: 300px; margin-right: 8px;" v-else-if="searchStyle && proceed && proceed.length > 0">
              <a-select-option v-for="item in proceed.filter(item => item.enable === '1' && item.priv === 'visit')" :key="item.value" :value="item.value">{{ item.customName ? item.customName : item.name }}</a-select-option>
            </a-select>
            <!-- 自定义列按钮 -->
            <a-icon type="setting" style="float: right; margin: 10px 10px 0 0; font-size: 18px" @click="customShow" v-if="customColumns == '1' ? true : false" />
            <!-- 下面是动态生成区域 -->
            <component v-for="(item, index) in tbar" :key="index" :is="item.component" />
          </div>
          <!-- 数据列表 -->
          <s-table
            ref="table"
            size="small"
            rowKey="id"
            :columns="columns"
            :data="loadDataTable"
            :rowSelection="rowSelection"
            :pageSize="pagesize"
            :pageMode="pageMode"
            :autoLoad="false"
            :scroll="scroll"
          >
          </s-table>
        </a-card>
      </a-tab-pane>
      <a-tab-pane tab="已结束" key="finish">
        <a-card class="table-search">
          <a-form :form="formSearchOver" :class="advancedSearchOver ? 'advanced' : 'normal'" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <div class="head">
              <div class="title">过滤</div>
              <a-space style="margin-left: 8px">
                <a-dropdown-button htmlType="submit" @click="handleSearch({tag: true})" class="dropdown" >
                  <span>搜索</span>
                  <a-menu slot="overlay">
                    <a-menu-item :key="2" @click="showSearch">
                      高级搜索
                    </a-menu-item>
                    <template v-for="(item, index) in condiList">
                      <a-menu-item :key="index + 3" @click="handleHighSearchMenu(item)">
                        {{ item.name }}
                      </a-menu-item>
                    </template>
                  </a-menu>
                </a-dropdown-button>
                <a-button @click="() => {queryParamOver = { flowCondition:'my_handle' }, params.end_date = this.moment().startOf('month').format('YYYY-MM'), endDate = this.moment().startOf('month'), clearAddress(), formSearchOver.resetFields(), handleSearch({tag: false})}">重置</a-button>
                <a v-show="!advancedSearchOver" @click="changeAdvancedSearch">展开<a-icon type="down" style="fontSize: 12px;" /></a>
                <a v-show="advancedSearchOver" @click="changeAdvancedSearch">收起<a-icon type="up" style="fontSize: 12px;" /></a>
              </a-space>
            </div>
            <a-row :gutter="16">
              <a-col v-if="advancedSearchOver" span="24">
                <div class="divider"></div>
              </a-col>
              <a-col v-bind="{ span: 6 }" v-if="timeRangeDisplay !== '0'">
                <a-form-item label="流程结束时间">
                  <a-month-picker
                    :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                    format="YYYY-MM"
                    @change="getEndDateChange"
                    :allowClear="false"
                    v-model="endDate"
                    style="width: 100%;"
                  ></a-month-picker>
                </a-form-item>
              </a-col>
              <!-- 下面是动态生成区域，要根据不同的组件进行相应展示 -->
              <a-col
                v-for="(item, index) in template"
                :key="index"
                v-bind="{ span: item.column }"
              >
                <a-form-item :label="item.change_title ? item.change_title : item.name" :validate-status="item.formtype === 'number' ? 'success' : ''" v-if="item.field && item.fieldrule!=='hidden'">
                  <!-- 单行文本 多行文本 -->
                  <a-input
                    v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    :placeholder="item.searchPattern === 'fuzzy' ? '模糊搜索':'精确搜索'"
                    v-if="item.formtype === 'text' || item.formtype === 'textarea' || item.formtype === 'associated'|| item.formtype === 'serialnumber'"
                  ></a-input>
                  <!-- 日期 -->
                  <a-range-picker
                    :showTime="{ defaultValue: [moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')] }"
                    v-decorator="[item.field.alias, {rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    style="width: 100%;"
                    format="YYYY-MM-DD HH:mm:ss"
                    v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATETIME'"
                  ></a-range-picker>
                  <a-range-picker
                    showTime
                    v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    style="width: 100%;"
                    format="YYYY-MM-DD"
                    v-else-if="item.formtype === 'datetime' && item.field.fieldtype == 'DATE'"
                  ></a-range-picker>
                  <!-- 下拉框、单选框、复选框 -->
                  <a-select
                    v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"
                    :disabled="item.fieldrule !== 'allow'"
                    mode="multiple"
                    v-else-if="item.field.formtype === 'combobox'"
                    placeholder="请选择"
                    :allowClear="true"
                    show-search
                    option-filter-prop="children"
                  >
                    <a-select-option v-for="(myitem,myindex) in item.field.option" :key="myindex" :value="myitem.value">{{ myitem.label }}</a-select-option>
                  </a-select>
                  <!-- 数字 -->
                  <a-input-group compact v-else-if="item.formtype === 'number'" style="margin-bottom: 0px">
                    <a-input-number
                      style="width: calc(50% - 15px);"
                      v-decorator="[item.field.alias + '.left']"
                      :disabled="item.fieldrule !== 'allow'"/>
                    <a-input placeholder="~" disabled style="width: 30px; pointer-events: none; backgroundColor: #fff;"/>
                    <a-input-number
                      v-decorator="[item.field.alias + '.right']"
                      style="width: calc(50% - 15px);"
                      :disabled="item.fieldrule !== 'allow'"/>
                  </a-input-group>
                  <!-- 级联选择 -->
                  <div v-else-if="item.formtype === 'cascader'">
                    <a-input v-show="false" v-decorator="[item.field.alias, { rules: [{ required: item.field.setting.attribute.required==='true', message: item.name + '不能为空'}]}]"/>
                    <tabs-select
                      :field="item.field"
                      :valueKey="item.field.setting.form.src || ''"
                      :defaultValue="item.field.value.value ? item.field.value.value : item.field.setting.form.defaultValue"
                      :alias="item.field.alias"
                      searchType="searchType"
                      :writeBack="item.field.setting.form.writeBack"
                      :fieldrule="item.fieldrule"
                      :ref="item.field.alias"
                      @send="getcascaderValue"
                    />
                  </div>
                  <!-- 地址组件 -->
                  <div v-else-if="item.formtype === 'address'">
                    <a-input
                      v-show="false"
                      v-decorator="[item.field.alias, {
                        rules: [{ required: item.field.setting.attribute.required === 'true', message: item.field.name + '不能为空'}]
                      }]" />
                    <address-select :ref="item.field.alias" :series="item.field.setting.form.show_series" :field="item.field" :alias="item.field.alias" @send="getAddress"/>
                  </div>
                  <!-- 开关 -->
                  <a-select
                    v-else-if="item.field.formtype === 'switch'"
                    v-decorator="[item.field.alias]"
                    placeholder="请选择"
                    :allowClear="true" >
                    <a-select-option :value="item.field.setting.form.word.value.split('/')[0]">{{ item.field.setting.form.word.value.split('/')[0] }}</a-select-option>
                    <a-select-option :value="item.field.setting.form.word.value.split('/')[1]">{{ item.field.setting.form.word.value.split('/')[1] }}</a-select-option>
                  </a-select>
                  <!-- 组织结构 -->
                  <div v-else-if="item.field.formtype === 'organization'">
                    <a-row type="flex" align="middle">
                      <a-col flex="0 0 calc(100% - 27px)">
                        <a-select
                          v-decorator="[item.field.alias, {
                            rules: [{ required: item.fieldrule !== 'hidden' && item.field.setting.attribute.required === 'true', message: item.name + '不能为空'}]
                          }]"
                          show-search
                          allowClear
                          :default-active-first-option="false"
                          :not-found-content="null"
                          option-filter-prop="children"
                          :show-arrow="false"
                          :filter-option="false"
                          style="width: 100%;"
                          @change="(val) => { item.field.value = val }"
                          mode="multiple"
                          @search="(val) => { organizationSearch(item, val) }"
                          @blur="() => { item.field.selectList = [] }"
                        >
                          <template v-if="item.field.setting.form.option_type === 'user'" >
                            <a-select-option v-for="(item1, index1) in item.field.selectList" :key="index1" :value="item1.username">
                              {{ item1.text }}
                            </a-select-option>
                          </template>
                          <template v-else-if="item.field.setting.form.option_type === 'department'" >
                            <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.departmentid">
                              {{ item1.name }}
                            </a-select-option>
                          </template>
                          <template v-else >
                            <a-select-option v-for="(item1, index1) in item.field.setting.form.optionCustom" :key="index1" :value="item1.roleid">
                              {{ item1.rolename }}
                            </a-select-option>
                          </template>
                        </a-select>
                      </a-col>
                      <a-col flex="27px">
                        <a-button
                          icon="user"
                          v-if="item.field.setting.form.option_type === 'user'"
                          style="margin-left: -1px; padding-bottom: 2px;"
                          @click="handleSelectUserForm(item, index)">
                        </a-button>
                        <a-button
                          icon="apartment"
                          v-else-if="item.field.setting.form.option_type === 'department'"
                          style="margin-left: -1px; padding-bottom: 2px;"
                          @click="handleSelect(item, index)">
                        </a-button>
                        <a-button
                          icon="user"
                          v-else
                          style="margin-left: -1px; padding-bottom: 2px;"
                          @click="handleSelect(item, index)">
                        </a-button>
                      </a-col>
                    </a-row>
                  </div>
                </a-form-item>
                <a-divider :orientation="item.dividerDirection" v-else-if="item.type === 'divider'">{{ item.dividerText }}</a-divider>
                <a-input v-else-if="item.type === 'place'" style="opacity: 0"></a-input>
                <component v-else-if="item.type === 'component'" :is="item.component" />
              </a-col>
            </a-row>
          </a-form>
        </a-card>
        <a-card>
          <!-- 操作按钮 -->
          <div class="table-operator">
            <a-radio-group button-style="solid" v-model="flowConditionOver" @change="(e)=>{ handleConditionChange(e) }" style="margin-right: 8px;" v-if="!searchStyle && finish.length > 0">
              <a-tooltip v-for="item in finish" :key="item.value" v-show="item.priv === 'visit' && item.enable !== '0'" :title="item.help">
                <a-radio-button :value="item.value">{{ item.customName ? item.customName : item.name }}</a-radio-button>
              </a-tooltip>
            </a-radio-group>
            <a-select v-model="flowConditionOver" @change="(e)=>{handleSelectChange(e)}" style="width: 300px; margin-right: 8px;" v-else-if="searchStyle && finish && finish.length > 0">
              <a-select-option v-for="item in finish.filter(item => item.enable === '1' && item.priv === 'visit')" :key="item.value" :value="item.value">{{ item.customName ? item.customName : item.name }}</a-select-option>
            </a-select>
            <!-- 下面是动态生成区域 -->
            <component v-for="(item, index) in tbar" :key="index" :is="item.component" v-show="item.bar_alias !== 'flow_create'"/>
            <!-- 自定义列按钮 -->
            <a-icon type="setting" style=" position:absolute; right: 18px; top: 18px; font-size: 18px" @click="customShow" v-if="customColumns == '1' ? true : false" />
          </div>
          <!-- 数据列表 -->
          <s-table
            ref="tableOver"
            size="small"
            rowKey="id"
            :columns="columnsOver"
            :data="loadDataTableOver"
            :rowSelection="rowSelection"
            :pageSize="pagesize"
            :pageMode="pageMode"
            :autoLoad="false"
            :scroll="scroll"
          >
          </s-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>
    <!-- 搜索区域 -->
    <!-- 数据表单 -->
    <workflow-handle-form ref="workflowHandleForm" @ok="refresh('noRefresh')" :key="indexKey"></workflow-handle-form>
    <!-- 导出表单 -->
    <user-table-export ref="userTableExport" @ok="refresh" :key="exportKey"></user-table-export>
    <user-table-components ref="userTableComponents" />
    <!-- 用户自定义列 -->
    <user-table-column-custom ref="userTableColumnCustom" @ok="getData"></user-table-column-custom>
    <!-- 高级搜索 -->
    <user-table-search ref="userTableSearch" :key="searchKey" @ok="handleHighSearch" @change="handleChange" />
    <select-user-form ref="selectUserForm" @ok="handleSelectUserData" :key="userKey" />
    <select-department ref="selectDepartment" @ok="handleSelectUserData" :key="departmentKey" />
    <!-- 添加办理备注 -->
    <user-table-workflow-remarks ref="userTableWorkflowRemarks" :key="remarkKey" @ok="refresh('noRefresh')" />
    <!-- 流转 -->
    <user-table-workflow-jump ref="userTableWorkflowJump" :key="jumpKey" @ok="refresh('noRefresh')" />
    <!-- 转办 -->
    <user-table-workflow-complaint ref="userTableWorkflowComplaint" :key="complaintKey" @ok="refresh('noRefresh')"/>
    <!-- 撤销 -->
    <user-table-workflow-repeal ref="userTableWorkflowRepeal" :key="repealKey" @ok="refresh('noRefresh')" />
    <!-- 催办 -->
    <user-table-workflow-urge ref="userTableWorkflowUrge" :key="urgeKey" @ok="urgeOk" />
    <!-- 配件申请单、配件核销单 导入办单 -->
    <ImportTable ref="ImportTable" @ok="refresh"/>
    <!-- 中台、维权 客服  待分配 -->
    <AllotmentTable ref="AllotmentTable" @ok="refresh('noRefresh')" :selectKeys="selectedRowKeys"/>
  </a-spin>
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import WorkflowHandleForm from '../WorkflowHandleForm'
import { Rate } from 'ant-design-vue'
import debounce from 'lodash/debounce'
Vue.use(Rate)
Vue.component('WorkflowHandleForm', WorkflowHandleForm)
export default {
  components: {
    UserTableComponents: () => import('./UserTableComponents'),
    UserTableExport: () => import('./UserTableExport'),
    UserTableSearch: () => import('./UserTableSearch'),
    SelectUserForm: () => import('./SelectUserForm'),
    SelectDepartment: () => import('./SelectDepartment'),
    UserTableWorkflowRemarks: () => import('./UserTableWorkflowRemarks'),
    UserTableWorkflowJump: () => import('./UserTableWorkflowJump'),
    UserTableWorkflowComplaint: () => import('./UserTableWorkflowComplaint'),
    UserTableWorkflowRepeal: () => import('./UserTableWorkflowRepeal'),
    UserTableWorkflowUrge: () => import('./UserTableWorkflowUrge'),
    TabsSelect: () => import('../Field/TabsSelect'),
    AddressSelect: () => import('../Field/AddressSelect'),
    UserTableColumnCustom: () => import('./UserTableColumnCustom'),
    ImportTable: () => import('@/views/crm/ImportTable'),
    AllotmentTable: () => import('@/views/crm/AllotmentTable')
  },
  props: {
    params: {
      type: Object,
      default () {
        return {
          tplviewid: ''
        }
      },
      required: true
    }
  },
  watch: {
    params (newValue) {
      if (newValue.relation) {
        // 查看不同的数据时刷新子表
        this.refresh()
      }
    }
  },
  // 祖先级组件数据传递，以及被子孙级组件动态修改
  provide () {
    this.theme = Vue.observable({
      data: this
    })
    return {
      theme: this.theme
    }
  },
  data () {
    this.handleSearch = debounce(this.handleSearch, 500)
    return {

      // 以上新增
      indexKey: 0, // 用于表单刷新数据
      exportKey: 2,
      searchKey: 4,
      customColumns: 0,
      lockLeft: 0,
      lockRight: 0,
      pagesize: 20,
      pageMode: 'default', // 分页器模式
      sendData: false,
      loading: false,
      userKey: 'user',
      departmentKey: 'department',
      remarkKey: 'remark',
      jumpKey: 'jump',
      complaintKey: 'complaint',
      repealKey: 'repeal',
      urgeKey: 'urge',
      role: '',
      labelCol: { style: 'width: 104px; display: inline-block' },
      wrapperCol: { style: 'width: calc(100% - 104px); display: inline-block' },
      finish: [],
      proceed: [],
      username: '',
      department: '',
      tableid: '',
      workflow_name: '',
      tplviewid: '',
      workflow_id: '',
      searchStyle: '',
      // 搜索参数
      queryParam: {},
      queryParamOver: {},
      flowCondition: 'my_process',
      flowConditionOver: 'my_handle',
      where_queryParam: '',
      // 高级搜索展开/折叠标识
      advancedSearch: true,
      advancedSearchOver: true,
      flowStatus: 'proceed',
      // 搜索表单
      formSearch: this.$form.createForm(this),
      formSearchOver: this.$form.createForm(this),
      // 搜索表单
      template: [],
      // 表头
      columns: [],
      columnsOver: [],
      columnsExport: [],
      // 工具栏菜单
      tbar: [],
      selectedRowKeys: [],
      rowSelection: null,
      searchPriv: [],
      // colLayout: {},
      // colLayoutOver: {},
      scroll: { x: 0 },
      sorter: {},
      comsShowFlag: false,
      searchCount: 0,
      actions: new Map([[
        '', function (value, inputValue) {
          return true
        } ], [
        'contain', function (value, inputValue) {
          if (inputValue.indexOf(value) === -1) {
            return false
          } else {
            return true
          }
        } ], [
        'equal', function (value, inputValue) {
          if (inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'great', function (value, inputValue) {
          if (inputValue > value) {
            return true
          } else {
            return false
          }
        } ], [
        'nc', function (value, inputValue) {
          if (inputValue.indexOf(value) === -1) {
            return true
          } else {
            return false
          }
        } ], [
        'ne', function (value, inputValue) {
          if (inputValue !== value) {
            return true
          } else {
            return false
          }
        } ], [
        'lt', function (value, inputValue) {
          if (inputValue < value) {
            return true
          } else {
            return false
          }
        } ], [
        'ge', function (value, inputValue) {
          if (inputValue > value || inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'le', function (value, inputValue) {
          if (inputValue < value || inputValue === value) {
            return true
          } else {
            return false
          }
        } ], [
        'bw', function (value, inputValue) {
          if (inputValue.indexOf(value) === 0) {
            return true
          } else {
            return false
          }
        } ], [
        'ew', function (value, inputValue) {
          const len = value.length
          if (inputValue.slice(-len) === value) {
            return true
          } else {
            return false
          }
        } ] ]),
      data: [], // 视图规则
      customSearch: [], // 高级搜索数据
      endDate: this.moment().startOf('month'),
      timeRangeDisplay: '',
      flowScope: undefined,
      condiList: [],
      searchFlag: true,
      searchData: {}
    }
  },
  computed: {
    ...mapGetters(['setting', 'userInfo'])
  },
  created () {
    this.role = this.userInfo.roleid
    this.username = this.userInfo.username
    this.department = this.userInfo.departmentid
    this.changeAdvancedSearch()
    let finishArray = []
    let proceedArray = []
    this.loading = true
    const p = new Promise((resolve) => {
      this.axios({
        url: 'admin/Workflow/flowSetting'
      }).then(option => {
        if (option.result.data && option.result.data.searchPriv) {
          finishArray = option.result.data.searchPriv.finish
          proceedArray = option.result.data.searchPriv.proceed
        }
        resolve()
      })
    })
    p.then(() => {
      this.axios({
        url: '/admin/UserTable/init',
        data: this.params
      }).then(res => {
        this.flowScope = res.result.flowScope
        if (this.flowScope === 'finish') {
          this.flowStatus = 'finish'
        }
        this.searchStyle = res.result.searchStyle
        this.tableid = res.result.tableid
        this.sorter = res.result.sorter
        if (res.result.searchPriv && res.result.searchPriv.proceed) {
          this.proceed = res.result.searchPriv.proceed
          this.proceed = this.proceed.map(item => {
            const obj = proceedArray.find(proItem => proItem.value === item.value)
            if (obj) {
              item.customName = obj.customName
              item.help = obj.help
              item.remark = obj.remark
            }
            return item
          })
        } else {
          this.proceed = proceedArray
          this.proceed.forEach(item => { item.priv = 'visit' })
        }
        if (res.result.searchPriv && res.result.searchPriv.finish) {
          this.finish = res.result.searchPriv.finish
          this.finish = this.finish.map(item => {
            const obj = finishArray.find(proItem => proItem.value === item.value)
            if (obj) {
              item.customName = obj.customName
              item.help = obj.help
              item.remark = obj.remark
            }
            return item
          })
        } else {
          this.finish = finishArray
          this.finish.forEach(item => { item.priv = 'visit' })
        }
        if (this.finish && this.finish.filter(item => item.enable === '1' && item.priv === 'visit')[0]) { this.flowConditionOver = this.finish.filter(item => item.enable === '1' && item.priv === 'visit')[0].value }
        if (this.proceed && this.proceed.filter(item => item.enable === '1' && item.priv === 'visit')[0]) { this.flowCondition = this.proceed.filter(item => item.enable === '1' && item.priv === 'visit')[0].value }
        this.advancedSearch = res.result.advanced_search === '1'
        this.advancedSearchOver = res.result.advanced_search === '1'
        this.columns = res.result.columns.filter(item => item.display === 'v')
        this.columnsExport = res.result.columns
        this.pagesize = Number(res.result.pagesize)
        this.pageMode = res.result.pageMode
        this.lockLeft = res.result.lock_left
        this.lockRight = res.result.lock_right
        this.timeRangeDisplay = res.result.timeRangeDisplay
        this.template = res.result.search.template
        this.customSearch = res.result.customSearch
        this.customColumns = res.result.customColumns
        const columnsList = []
        this.columns.forEach(item => {
          if (['textarea', 'image', 'file', 'editor'].includes(item.type)) {
            item.sorter = false
          } else {
            if ((item.sorter === '1' || !item.sorter) && item.dataIndex !== 'action') {
              item.sorter = true
            } else {
              item.sorter = false
            }
          }
        })
        if (res.result.customColumnsData && res.result.customColumnsData.id) {
          this.sendData = true
          this.customColumnsData = JSON.parse(res.result.customColumnsData.setting).data
          if (this.customColumnsData) {
            for (const i in res.result.columns) {
              for (const j in this.customColumnsData) {
                if (this.customColumnsData[j].dataIndex === res.result.columns[i].dataIndex) {
                  this.customColumnsData[j] = res.result.columns[i]
                }
              }
            }
            this.customColumnsData.forEach(item => {
              if (res.result.columns.indexOf(item) !== -1) {
                columnsList.push(item)
              }
            })
            this.customColumnsData = columnsList
            this.customColumnsData = this.customColumnsData.filter(item => item.display === 'v')
          }
          this.lockLeft = JSON.parse(res.result.customColumnsData.setting).lockLeft
          this.lockRight = JSON.parse(res.result.customColumnsData.setting).lockRight
          this.pagesize = Number(JSON.parse(res.result.customColumnsData.setting).pageSize)
        }
        this.columns.forEach(item => {
          if (item.custom_title) {
            item.title = item.custom_title
          }
        })
        this.condiList = this.customSearch.length > 0 ? this.customSearch.map(item => {
          const obj = JSON.parse(item.setting)
          obj.id = item.id
          return obj
        }) : []
        this.tplviewid = res.result.tplviewid
        this.data = res.result.formview
        this.searchPriv = res.result.searchPriv
        this.workflow_id = res.result.workflow.workflow_id
        this.workflow_name = res.result.workflow.workflow_name
        this.template.forEach(item => {
          if (item.type === 'component') {
            item.component = {
              template: `<span>${item.attribute}</span>`,
              data: () => {
                return {
                  parent: this
                }
              }
            }
          }
        })
        this.tbar = res.result.tbar
        this.tbar.forEach(item => {
          item.component = {
            template: `<span>${item.attribute}</span>`,
            data: () => {
              return {
                parent: this
              }
            }
          }
        })
        // 表格是否出现行选择功能
        this.multiSelect = res.result.multiSelect
        this.rowSelection = res.result.multiSelect ? {
          onChange: (selectedRowKeys, selectedRows) => {
            this.selectedRowKeys = selectedRowKeys
            this.selectedRows = selectedRows
          }
        } : null
        if (this.customColumnsData && this.customColumnsData.length > 0) {
          this.columns = this.customColumnsData
        }
        // 循环处理表格的列
        for (let i = 0; i < this.lockLeft; i++) {
          this.columns[i]['fixed'] = 'left'
          this.scroll.x -= Number(this.columns[i].width)
        }
        let keyLength = this.columns.length - 1
        for (let i = 0; i < this.lockRight; i++) {
          this.columns[keyLength]['fixed'] = 'right'
          this.scroll.x -= Number(this.columns[keyLength].width)
          keyLength--
        }
        this.columns.map((item) => {
          let style = {}
          if (item.style) {
            style = {
              'background-color': item.style.bgcolor,
              'color': item.style.color,
              'font-size': item.style.fontsize
            }
          }
          if (item.attribute && !item.attribute.includes('<')) {
            item.attribute = JSON.parse(item.attribute)
          }
          item.ellipsis = true
          item.width = Number(item.width)
          if (item.width === 0) {
            delete item.width
            this.scroll.x = null
          } else {
            if (this.scroll.x !== null) {
              this.scroll.x += item.width
            }
          }
          item.customRender = (text, record, index) => {
            if (item.attribute) {
            // 获取属性key
              const key = record[item.attribute.key]
              style = item.attribute.value ? item.attribute.value[key] : ''
            }
            if (item.attribute && item.attribute.includes('<')) {
              let data = ''
              const MyComponent = Vue.component('my-component', {
                data: function () {
                  return { text: text, record: record }
                },
                template: item.attribute
              })
              data = (<MyComponent></MyComponent>)
              return data
            } else {
              switch (item.type) {
                case 'action':
                  item.width = 150
                  const menuArr = []
                  item.rowAction.forEach(rowItem => {
                    const Menu = {
                      template: `<span>${rowItem.attribute}</span>`,
                      data: () => {
                        return {
                          parent: this,
                          record: record
                        }
                      }
                    }
                    switch (rowItem.bar_alias) {
                      case 'flow_process':
                        if (['only_process', 'all_process', 'my_follow'].indexOf(this.flowCondition) > -1 || (this.flowCondition === 'my_process' && this.userInfo.username === record.__transition_user__)) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_takeprocess':
                        if (['public_process'].indexOf(this.flowCondition) > -1 || (this.flowCondition === 'my_process' && this.userInfo.username !== record.__transition_user__)) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_take':
                        if ((['public_process'].indexOf(this.flowCondition) > -1 || (this.flowCondition === 'my_process' && this.userInfo.username !== record.__transition_user__)) && ['op'].indexOf(record.__case_status__) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_remarks':
                        if (['op'].indexOf(record.__case_status__) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_urge':
                        if (['op'].indexOf(record.__case_status__) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_repeal':
                        if (['op'].indexOf(record.__case_status__) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_delete':
                        if (['my_create', 'all_flow'].indexOf(this.flowCondition) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_jump':
                        if (['op'].indexOf(record.__case_status__) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      case 'flow_transfer':
                        if (['my_process', 'public_process', 'only_process', 'all_process'].indexOf(this.flowCondition) > -1 && ['op'].indexOf(record.__case_status__) > -1) {
                          menuArr.push(Menu)
                        }
                        break
                      default:
                        menuArr.push(Menu)
                        break
                    }
                  })
                  if (menuArr.length < 4) {
                    return (
                      <div>
                        {
                          menuArr.map((menuItem, menuIndex) => {
                            if (menuIndex === menuArr.length - 1) {
                              return (
                                <span>
                                  <menuItem />
                                </span>
                              )
                            } else {
                              return (
                                <span>
                                  <menuItem/>
                                  <a-divider type="vertical" />
                                </span>
                              )
                            }
                          })
                        }
                      </div>
                    )
                  } else {
                    return (
                      <span>
                        <span>
                          {
                            menuArr.map((menuItem, menuIndex) => {
                              if (menuIndex < 2) {
                                return (
                                  <span>
                                    <menuItem />
                                    <a-divider type="vertical" />
                                  </span>
                                )
                              }
                            })
                          }
                        </span>
                        <a-dropdown>
                          <a>更多 <a-icon type="down" /></a>
                          <a-menu slot="overlay">
                            {
                              menuArr.map((menuItem, menuIndex) => {
                                if (menuIndex > 1) {
                                  return (
                                    <a-menu-item>
                                      <menuItem />
                                    </a-menu-item>
                                  )
                                }
                              })
                            }
                          </a-menu>
                        </a-dropdown>
                      </span>
                    )
                  }
                case 'datetime':
                  return (
                    <div style={style}>
                      {(text === null || text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00') ? '--' : text}
                    </div>
                  )
                case 'image':
                  if (text.length > 0) {
                    return (
                      <viewer>
                        {text.map((val) => {
                          return (
                            <img src={this.setting.rootUrl + val.filePath} style={style} style="width: 64px; height: 64px; cursor: pointer; margin-right: 2px;" />
                          )
                        })}
                      </viewer>
                    )
                  } else {
                    return '--'
                  }
                case 'file':
                  if (text.length > 0) {
                    return (
                      <div>
                        {text.map((val) => {
                          return (
                            <a href={this.setting.rootUrl + val.filePath} target="_blank" style={style} style="display: block;">{ val.fileName }</a>
                          )
                        })}
                      </div>
                    )
                  } else {
                    return '--'
                  }
                case 'score':
                  return (
                    <a-rate value={parseInt(text)} disabled />
                  )
                case 'tag':
                  if (record['_' + item.dataIndex + '_']) {
                    return (
                      <div>
                        {record['_' + item.dataIndex + '_'].split(',').map((val) => {
                          return (
                            <a-tag color={text.find(item => item.name === val) && text.find(item => item.name === val).tag_type === '1' ? 'green' : 'blue'}>{val}</a-tag>
                          )
                        })}
                      </div>
                    )
                  } else {
                    return '--'
                  }
                default:
                  return (
                    <div style={style} domPropsInnerHTML={text || '--'}>
                    </div>
                  )
              }
            }
          }
        })
        this.$nextTick(() => {
          this.columnsOver = JSON.parse(JSON.stringify(this.columns))
          this.columnsOver.forEach(item => {
            if (item.dataIndex === 'action') {
              item.rowAction = item.rowAction.filter(rowItem => rowItem.bar_alias && rowItem.bar_alias === 'flow_view')
            }
          })
          this.columnsOver.forEach((item) => {
            let style = {}
            if (item.style) {
              style = {
                'background-color': item.style.bgcolor,
                'color': item.style.color,
                'font-size': item.style.fontsize
              }
            }
            item.customRender = (text, record, index) => {
              if (item.attribute && item.attribute.includes('<')) {
                let data = ''
                const MyComponent = Vue.component('my-component', {
                  data: function () {
                    return { text: text, record: record }
                  },
                  template: item.attribute
                })
                data = (<MyComponent></MyComponent>)
                return data
              } else {
                switch (item.type) {
                  case 'action':
                    item.width = 150
                    const menuArr = []
                    item.rowAction.forEach(rowItem => {
                      const Menu = {
                        template: `<span>${rowItem.attribute}</span>`,
                        data: () => {
                          return {
                            parent: this,
                            record: record
                          }
                        }
                      }
                      if (rowItem.bar_alias === 'flow_view') {
                        menuArr.push(Menu)
                      }
                    })
                    return (
                      <div>
                        {
                          menuArr.map((menuItem, menuIndex) => {
                            return (
                              <span>
                                <menuItem />
                              </span>
                            )
                          })
                        }
                      </div>
                    )
                  case 'datetime':
                    return (
                      <div style={style}>
                        {(text === null || text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00') ? '--' : text}
                      </div>
                    )
                  case 'image':
                    if (text.length > 0) {
                      return (
                        <viewer>
                          {text.map((val) => {
                            return (
                              <img src={this.setting.rootUrl + val.filePath} style={style} style="width: 64px; height: 64px; cursor: pointer; margin-right: 2px;" />
                            )
                          })}
                        </viewer>
                      )
                    } else {
                      return '--'
                    }
                  case 'file':
                    if (text.length > 0) {
                      return (
                        <div>
                          {text.map((val) => {
                            return (
                              <a href={this.setting.rootUrl + val.filePath} target="_blank" style={style} style="display: block;">{ val.fileName }</a>
                            )
                          })}
                        </div>
                      )
                    } else {
                      return '--'
                    }
                  case 'score':
                    return (
                      <a-rate value={parseInt(text)} disabled />
                    )
                  case 'tag':
                    if (record['_' + item.dataIndex + '_']) {
                      return (
                        <div>
                          {record['_' + item.dataIndex + '_'].split(',').map((val) => {
                            return (
                              <a-tag color={text.find(item => item.name === val) && text.find(item => item.name === val).tag_type === '1' ? 'green' : 'blue'}>{val}</a-tag>
                            )
                          })}
                        </div>
                      )
                    } else {
                      return '--'
                    }
                  default:
                    return (
                      <div style={style} domPropsInnerHTML={text || '--'}>
                      </div>
                    )
                }
              }
            }
          })
        })
        this.loading = false
        this.refresh()
      })
    })
  },
  methods: {
    // 配件申请单  批量导入办单
    import (param) {
      this.$refs.ImportTable.show(param)
    },
    getEndDateChange (date, dateString) {
      this.endDate = date
      this.params.end_date = date ? date.format('YYYY-MM') : dateString
    },
    tabChange (e) {
      if (!this.searchCount) {
        this.refresh()
        this.searchCount++
      }
    },
    // 打开高级搜索
    showSearch () {
      this.searchKey = this.searchKey === 4 ? 5 : 4
      this.$nextTick(() => {
        this.$refs.userTableSearch.show({
          tableid: this.tableid,
          customSearch: this.customSearch,
          tplviewid: this.tplviewid,
          newFlag: this.searchFlag,
          data: this.searchData
        })
      })
    },
    // 获取搜索栏级联选择数据
    getcascaderValue (val, alias) {
      const obj = {}
      obj[alias] = val
      if (this.flowStatus === 'proceed') {
        this.formSearch.setFieldsValue(obj)
      } else {
        this.formSearchOver.setFieldsValue(obj)
      }
    },
    // 获取地址
    getAddress (name, number, alias) {
      const obj = {}
      obj[alias] = number
      if (this.flowStatus === 'proceed') {
        this.formSearch.setFieldsValue(obj)
      } else {
        this.formSearchOver.setFieldsValue(obj)
      }
    },
    clearAddress () {
      this.template.forEach(item => {
        if (['address', 'cascader'].includes(item.formtype) && this.$refs[item.value]) {
          this.$refs[item.value][0].resetClear()
        }
      })
    },
    // 获取自定义列点击显示时数据
    getData (data) {
      this.sendData = true
      this.pagesize = Number(data.pageSize)
      let columnsArray = []
      let actionData = []
      if (this.flowScope) {
        actionData = this.flowScope === 'finish' ? this.columnsOver.filter(item => item.dataIndex === 'action') : this.columns.filter(item => item.dataIndex === 'action')
      } else {
        actionData = this.flowStatus === 'finish' ? this.columnsOver.filter(item => item.dataIndex === 'action') : this.columns.filter(item => item.dataIndex === 'action')
      }
      columnsArray = actionData
      columnsArray[0].fixed = false
      for (const i in data.data) {
        data.data[i]['ellipsis'] = true
        columnsArray.push(data.data[i])
      }
      columnsArray = columnsArray.filter(item => item.display !== 'd')
      this.scroll.x = null
      columnsArray.map((item) => {
        let style = {}
        if (item.style) {
          style = {
            'background-color': item.style.bgcolor,
            'color': item.style.color,
            'font-size': item.style.fontsize
          }
        }
        if (item.attribute && !item.attribute.includes('<')) {
          item.attribute = JSON.parse(item.attribute)
        }
        item.ellipsis = true
        item.width = Number(item.width)
        if (item.width === 0) {
          delete item.width
          this.scroll.x = null
        } else {
          if (this.scroll.x !== null) {
            this.scroll.x += item.width
          }
        }
        item.customRender = (text, record, index) => {
          if (item.attribute) {
            // 获取属性key
            const key = record[item.attribute.key]
            style = item.attribute.value ? item.attribute.value[key] : ''
          }
          if (item.attribute && item.attribute.includes('<')) {
            let data = ''
            const MyComponent = Vue.component('my-component', {
              data: function () {
                return { text: text, record: record }
              },
              template: item.attribute
            })
            data = (<MyComponent></MyComponent>)
            return data
          } else {
            switch (item.type) {
              case 'action':
                item.width = 150
                const menuArr = []
                item.rowAction.forEach(rowItem => {
                  const Menu = {
                    template: `<span>${rowItem.attribute}</span>`,
                    data: () => {
                      return {
                        parent: this,
                        record: record
                      }
                    }
                  }
                  switch (rowItem.bar_alias) {
                    case 'flow_process':
                      if (['only_process', 'all_process', 'my_follow'].indexOf(this.flowCondition) > -1 || (this.flowCondition === 'my_process' && this.userInfo.username === record.__transition_user__)) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_takeprocess':
                      if (['public_process'].indexOf(this.flowCondition) > -1 || (this.flowCondition === 'my_process' && this.userInfo.username !== record.__transition_user__)) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_take':
                      if ((['public_process'].indexOf(this.flowCondition) > -1 || (this.flowCondition === 'my_process' && this.userInfo.username !== record.__transition_user__)) && ['op'].indexOf(record.__case_status__) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_remarks':
                      if (['op'].indexOf(record.__case_status__) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_urge':
                      if (['op'].indexOf(record.__case_status__) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_repeal':
                      if (['op'].indexOf(record.__case_status__) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_delete':
                      if (['my_create', 'all_flow'].indexOf(this.flowCondition) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_jump':
                      if (['op'].indexOf(record.__case_status__) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    case 'flow_transfer':
                      if (['my_process', 'public_process', 'only_process', 'all_process'].indexOf(this.flowCondition) > -1 && ['op'].indexOf(record.__case_status__) > -1) {
                        menuArr.push(Menu)
                      }
                      break
                    default:
                      menuArr.push(Menu)
                      break
                  }
                })
                if (menuArr.length < 4) {
                  return (
                    <div>
                      {
                        menuArr.map((menuItem, menuIndex) => {
                          if (menuIndex === menuArr.length - 1) {
                            return (
                              <span>
                                <menuItem />
                              </span>
                            )
                          } else {
                            return (
                              <span>
                                <menuItem/>
                                <a-divider type="vertical" />
                              </span>
                            )
                          }
                        })
                      }
                    </div>
                  )
                } else {
                  return (
                    <span>
                      <span>
                        {
                          menuArr.map((menuItem, menuIndex) => {
                            if (menuIndex < 2) {
                              return (
                                <span>
                                  <menuItem />
                                  <a-divider type="vertical" />
                                </span>
                              )
                            }
                          })
                        }
                      </span>
                      <a-dropdown>
                        <a>更多 <a-icon type="down" /></a>
                        <a-menu slot="overlay">
                          {
                            menuArr.map((menuItem, menuIndex) => {
                              if (menuIndex > 1) {
                                return (
                                  <a-menu-item>
                                    <menuItem />
                                  </a-menu-item>
                                )
                              }
                            })
                          }
                        </a-menu>
                      </a-dropdown>
                    </span>
                  )
                }
              case 'datetime':
                return (
                  <div style={style}>
                    {(text === null || text === '' || text === '0000-00-00 00:00:00' || text === '0000-00-00') ? '--' : text}
                  </div>
                )
              case 'image':
                if (text.length > 0) {
                  return (
                    <viewer>
                      {text.map((val) => {
                        return (
                          <img src={this.setting.rootUrl + val.filePath} style={style} style="width: 64px; height: 64px; cursor: pointer; margin-right: 2px;" />
                        )
                      })}
                    </viewer>
                  )
                } else {
                  return '--'
                }
              case 'file':
                if (text.length > 0) {
                  return (
                    <div>
                      {text.map((val) => {
                        return (
                          <a href={this.setting.rootUrl + val.filePath} target="_blank" style={style} style="display: block;">{ val.fileName }</a>
                        )
                      })}
                    </div>
                  )
                } else {
                  return '--'
                }
              case 'score':
                return (
                  <a-rate value={parseInt(text)} disabled />
                )
              case 'tag':
                if (record['_' + item.dataIndex + '_']) {
                  return (
                    <div>
                      {record['_' + item.dataIndex + '_'].split(',').map((val) => {
                        return (
                          <a-tag color={text.find(item => item.name === val) && text.find(item => item.name === val).tag_type === '1' ? 'green' : 'blue'}>{val}</a-tag>
                        )
                      })}
                    </div>
                  )
                } else {
                  return '--'
                }
              default:
                return (
                  <div style={style}>
                    {text === '' ? '--' : text}
                  </div>
                )
            }
          }
        }
      })
      this.lockLeft = data.lockLeft
      this.lockRight = data.lockRight
      for (let i = 0; i < this.lockLeft; i++) {
        columnsArray[i]['fixed'] = 'left'
        this.scroll.x -= Number(columnsArray[i].width)
      }
      let keyLength = columnsArray.length - 1
      for (let i = 0; i < this.lockRight; i++) {
        columnsArray[keyLength]['fixed'] = 'right'
        this.scroll.x -= Number(columnsArray[keyLength].width)
        keyLength--
      }
      columnsArray.forEach(item => {
        if (['textarea', 'image', 'file', 'editor'].includes(item.type)) {
          item.sorter = false
        } else {
          if ((item.sorter === '1' || !item.sorter) && item.dataIndex !== 'action') {
            item.sorter = true
          } else {
            item.sorter = false
          }
        }
      })
      if (this.flowScope === 'proceed') {
        this.columns = columnsArray
      } else if (this.flowScope === 'finish') {
        this.columnsOver = columnsArray
      } else {
        if (this.flowStatus === 'proceed') {
          this.columns = columnsArray
        } else {
          this.columnsOver = columnsArray
        }
      }
      this.refresh()
    },
    // 获取高级搜索数据
    handleHighSearch (val, flag) {
      this.searchFlag = flag
      this.searchData = JSON.parse(JSON.stringify(val))
      // 不保存这些参数
      val.conditions.forEach(item => {
        item.fieldtype = item.formtype = item.optionValue = item.condiArr = undefined
      })
      if (this.flowStatus === 'proceed') {
        this.queryParam = Object.assign(this.queryParam, {
          advanceSearch: val
        })
      } else {
        this.queryParamOver = Object.assign(this.queryParamOver, {
          advanceSearch: val
        })
      }
      this.refresh()
    },
    handleHighSearchMenu (val) {
      if (this.flowStatus === 'proceed') {
        this.queryParam = Object.assign(this.queryParam, {
          advanceSearch: val
        })
      } else {
        this.queryParamOver = Object.assign(this.queryParamOver, {
          advanceSearch: val
        })
      }
      this.refresh()
    },
    // 高级搜索改变列表值
    handleChange (action, data, index) {
      const obj = {}
      obj.id = data.id
      obj.setting = JSON.stringify(data)
      if (action === 'add') {
        this.customSearch.push(obj)
      } else if (action === 'edit') {
        this.customSearch.splice(index, 1, obj)
      } else {
        this.customSearch.splice(index, 1)
      }
      this.condiList = this.customSearch.length > 0 ? this.customSearch.map(item => {
        const obj = JSON.parse(item.setting)
        obj.id = item.id
        return obj
      }) : []
    },
    // 加载表格数据
    loadDataTable (parameter) {
      return this.axios({
        url: '/admin/Centerflow/worklist',
        params: Object.assign(this.sorter, parameter, this.params, { flowStatus: this.flowStatus, flowCondition: this.flowCondition }),
        data: this.queryParam
      }).then(res => {
        this.where_queryParam = res.result.where
        return res.result
      })
    },
    loadDataTableOver (parameter) {
      if (!this.params.end_date && this.timeRangeDisplay !== '0') {
        this.params.end_date = ''
        const endDate = this.endDate.format('YYYY-MM')
        this.params.end_date = endDate || this.moment().startOf('month').format('YYYY-MM')
      }
      return this.axios({
        url: '/admin/Centerflow/worklist',
        params: Object.assign(this.sorter, parameter, this.params, { flowStatus: this.flowStatus, flowCondition: this.flowConditionOver }),
        data: this.queryParamOver
      }).then(res => {
        this.where_queryParam = res.result.where
        return res.result
      })
    },
    // 刷新表格
    refresh (type) {
      if (this.flowScope === 'proceed') {
        this.$nextTick(() => {
          this.$refs.table.refresh(!type)
        })
      } else if (this.flowScope === 'finish') {
        this.$nextTick(() => {
          this.$refs.tableOver.refresh(!type)
        })
      } else if (!this.flowScope) {
        if (this.flowStatus === 'proceed') {
          this.$refs.table.refresh(!type)
        } else {
          if (!this.$refs.tableOver) {
            this.$nextTick(() => {
              this.$refs.tableOver.refresh(!type)
            })
          } else {
            this.$refs.tableOver.refresh(!type)
          }
        }
      }
    },
    // 判断当前用户，用户所在部门，所属于角色
    handleUserSimple (current, conditionValue) {
      if (conditionValue.indexOf(current) !== -1) {
        return true
      } else {
        return false
      }
    },
    // 规则函数
    handleSimple (include, value, inputValue) {
      const action = this.actions.get(`${include}`)
      return action(value, inputValue)
    },
    // 加载级联菜单数据
    loadDataCascader (parameter) {
      const { selectedOptions } = parameter
      const targetOption = selectedOptions[selectedOptions.length - 1]
      const index = parameter.index
      const that = this
      targetOption.loading = true
      this.axios({
        url: '/admin/dict/getCascaderData',
        params: { parentNumber: targetOption.value }
      }).then(res => {
        targetOption.loading = false
        targetOption.children = res.result
        that.template[index].field.option = [...that.template[index].field.option]
      })
    },
    // 数据处理，主要用于发送一个请求到后面，后端进行简单的逻辑处理，如删除数据，标记数据状态等
    onRequest (parameter) {
      const me = this
      if (parameter.confirm) {
        this.$confirm({
          title: parameter.confirm.title || '您确认要处理该记录吗?',
          okText: parameter.confirm.okText || '确定',
          okType: parameter.confirm.okType || 'primary',
          cancelText: parameter.confirm.cancelText || '取消',
          onOk () {
            me.axios({
              url: parameter.url,
              data: Object.assign(parameter, me.params)
            }).then(res => {
              if (res.code === 0) {
                me.$message.info(res.message)
              } else {
                me.$message.warning(res.message)
              }
              me.refresh()
            })
          }
        })
      } else {
        me.axios({
          url: parameter.url,
          data: Object.assign(parameter, me.params)
        }).then(res => {
          if (res.code === 0) {
            me.$message.info(res.message)
          } else {
            me.refresh()
          }
          me.$message.warning(res.message)
        })
      }
    },
    handleSearch (parameter) {
      if (parameter.tag) {
        if (this.flowStatus === 'proceed') {
          this.queryParam = {
            searchString: this.formSearch.getFieldsValue()
          }
        } else {
          this.queryParamOver = {
            searchString: this.formSearchOver.getFieldsValue()
          }
        }
      } else {
        if (this.flowStatus === 'proceed') {
          this.queryParam = {
            searchString: this.formSearch.getFieldsValue()
          }
        } else {
          this.queryParamOver = {
            searchString: this.formSearchOver.getFieldsValue()
          }
        }
      }
      this.refresh()
    },
    changeAdvancedSearch () {
      if (this.flowStatus === 'proceed') {
        this.advancedSearch = !this.advancedSearch
      } else {
        this.advancedSearchOver = !this.advancedSearchOver
      }
    },
    // 创建流程
    handleCrate (parameter) {
      this.indexKey = this.indexKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '创建流程: ' + this.workflow_name,
            width: 1200,
            tplviewUrl: parameter ? parameter.tplviewUrl : '/admin/wcase/add/?action=getview',
            url: parameter ? parameter.url : '/admin/wcase/add?action=submit',
            workflow_id: parameter ? parameter.workflow_id : this.workflow_id,
            parameter: parameter ? parameter.data : '',
            viewType: 'create'
          }
        })
      })
    },
    handleConditionChange (e) {
      if (this.flowStatus === 'proceed') {
        this.flowCondition = e.target.value
      } else {
        this.flowConditionOver = e.target.value
      }
      this.refresh()
    },
    handleSelectChange (e) {
      if (this.flowStatus === 'proceed') {
        this.flowCondition = e
      } else {
        this.flowConditionOver = e
      }
      this.refresh()
    },
    handleView (record, config) {
      this.indexKey = this.indexKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '查看流程',
            width: config && config.width ? config.width : 1200,
            tplviewUrl: '/admin/centerflow/viewOrder',
            case_id: record.__case_id__,
            viewType: 'view',
            flowStatus: this.flowStatus,
            flowCondition: this.flowCondition
          },
          record: record
        })
      })
    },
    handleProcess (record, config) {
      this.indexKey = this.indexKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '办理流程',
            width: config && config.width ? config.width : 1200,
            tplviewUrl: '/admin/centerflow/handleOrder',
            url: '/admin/workitem/processing',
            case_id: record.__case_id__,
            viewType: 'handle',
            flowStatus: this.flowStatus,
            flowCondition: this.flowCondition
          },
          record: record
        })
      })
    },
    handleTakeProcess (record) {
      this.indexKey = this.indexKey ? 0 : 1
      this.$nextTick(() => {
        this.$refs.workflowHandleForm.show({
          config: {
            title: '办理流程',
            width: 1200,
            tplviewUrl: '/admin/centerflow/handleOrder',
            url: '/admin/workitem/processing',
            case_id: record.__case_id__,
            viewType: 'handle',
            flowStatus: this.flowStatus,
            flowCondition: this.flowCondition,
            takeFlow: 1
          },
          record: record
        })
      })
    },
    handleDelete (record) {
      const me = this
      this.$confirm({
        title: '您确认要删除该流程吗？',
        onOk () {
          me.axios({
            url: '/admin/Wcase/delete',
            data: { case_id: record.__case_id__ }
          }).then(res => {
            me.refresh()
          })
        }
      })
    },
    // 自定义列打开
    customShow () {
      let data = []
      if (this.flowScope) {
        data = this.flowScope === 'finish' ? this.columnsOver : this.columns
      } else {
        data = this.flowStatus === 'finish' ? this.columnsOver : this.columns
      }
      this.$refs.userTableColumnCustom.show({
        title: '用户自定义列',
        data: data,
        tplviewid: this.tplviewid,
        tableid: this.tableid
      })
    },
    handleTakeFlow (record) {
      const that = this
      this.$confirm({
        title: '您确认要领取该数据吗？',
        onOk () {
          that.loading = true
          that.axios({
            url: '/admin/Centerflow/takeFlow',
            data: {
              handleWay: '领取',
              operation: 'take_flow',
              case_id: record.__case_id__
            }
          }).then(res => {
            that.loading = false
            if (res.code === 0) {
              that.$message.success('领取成功')
            } else {
              that.$message.error(res.message)
            }
            that.refresh()
          })
        }
      })
    },
    // 导出
    onExport (parameter) {
      this.exportKey = this.exportKey === 2 ? 3 : 2
      this.$nextTick(() => {
        this.$refs.userTableExport.show(Object.assign({
          title: '导出',
          url: '/admin/UserTable/export',
          tplviewid: this.params.tplviewid,
          tableid: this.tableid,
          flowCondition: (this.flowScope === 'finish' || !this.flowScope && this.flowStatus === 'finish') ? this.flowConditionOver : this.flowCondition,
          flowStatus: this.flowStatus,
          queryParam: this.queryParam,
          params: this.params,
          where_queryParam: this.where_queryParam,
          columns: this.columnsExport
        }, parameter))
      })
    },
    // 办理备注
    handleRemarks (record) {
      this.remarkKey = this.remarkKey === 'remark' ? 'remark_1' : 'remark'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowRemarks.show({
          case_id: record.__case_id__
        })
      })
    },
    // 流转
    handleJump (record) {
      this.jumpKey = this.jumpKey === 'jump' ? 'jump_1' : 'jump'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowJump.show({
          case_id: record.__case_id__
        })
      })
    },
    // 转办
    handleTransfer (record) {
      this.complaintKey = this.complaintKey === 'complaint' ? 'complaint_1' : 'complaint'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowComplaint.show({
          case_id: record.__case_id__
        })
      })
    },
    // 撤销
    handleRepeal (record, type) {
      if (record.gdbh && record.gdbh.includes('WX') && !type) {
        type = 'WX'
      }
      this.repealKey = this.repealKey === 'repeal' ? 'repeal_1' : 'repeal'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowRepeal.show({
          case_id: record.__case_id__,
          record: record,
          type: type,
          tplviewid: this.tplviewid
        })
      })
    },
    // 催办
    handleUrge (record) {
      this.urgeKey = this.urgeKey === 'urge' ? 'urge_1' : 'urge'
      this.$nextTick(() => {
        this.$refs.userTableWorkflowUrge.show({
          case_id: record.__case_id__,
          record
        })
      })
    },
    // 催办成功，2次及以上催办生成弹窗
    urgeOk (record) {
      this.refresh('noRefresh')
      const that = this
      const { arcUrge, complainNum, khdh1 } = record
      const { gdbh, wdbh, wdmc, wdlx, sfxm, sfdh, sfyhm } = record
      const urlObj = {
        gdlx: 'ts2',
        Callerid: khdh1,
        gdbh,
        wdbh,
        wdmc,
        wdlx,
        sfxm,
        sfdh,
        sfyhm
      }
      let url = `${process.env.VUE_APP_BASE_URL}CustomPage/?view=crm/Popscreen&Uniqueid=${that.uuid()}`
      for (const key in urlObj) {
        if (urlObj[key]) {
          url = `${url}&${key}=${urlObj[key]}`
        }
      }
      url = url.substr(0, url.length)
      if (arcUrge > 1) {
        const content = arcUrge === 2 ? '催办成功，是否生成投诉单？' : `催办成功，此前已生成${complainNum}个投诉单，是否新增投诉单`
        this.$confirm({
          title: '提示',
          content,
          okText: '确定',
          cancelText: '无需',
          onOk () {
            return new Promise((resolve, reject) => {
              window.open(url)
              resolve()
            }).catch()
          },
          onCancel () {}
        })
      }
    },
    // 生成唯一ID
    uuid (n) {
      n = 1 // 生成一个唯一id，包含数字和字母
      var random = function () {
        // 生成10-12位不等的字符串
        return Number(
          Math.random()
            .toString()
            .substr(2)
        ).toString(36) // 转换成十六进制
      }
      var arr = []
      function createId () {
        var num = random()
        var _bool = false
        arr.forEach(v => {
          if (v === num) _bool = true
        })
        if (_bool) {
          createId()
        } else {
          arr.push(num)
        }
      }
      var i = 0
      while (i < n) {
        createId()
        i++
      }
      return arr[0] // 将生成的转为我们需要的字符串并赋值
    },
    // 组织结构
    organizationSearch (item, value) {
      clearTimeout(this.timeout)
      const optionType = item.field.setting.form.option_type
      const optionName = optionType === 'user' ? 'text' : (optionType === 'department' ? 'name' : 'rolename')
      if (!value) {
        item.field.selectList = []
        return
      }
      this.timeout = setTimeout(() => {
        item.field.selectList = []
        const optionCustom = item.field.setting.form.optionCustom
        item.field.selectList = optionCustom.filter(item1 => {
          return item1[optionName].indexOf(value) > -1
        })
        this.template = JSON.parse(JSON.stringify(this.template))
      }, 300)
    },
    // 打开选择用户界面
    handleSelectUserForm (item, index) {
      let value
      if (this.flowStatus === 'proceed') {
        value = this.formSearch.getFieldValue(item.field.alias)
      } else {
        value = this.formSearchOver.getFieldValue(item.field.alias)
      }
      this.userKey = this.userKey === 'user' ? 'user_1' : 'user'
      this.$nextTick(() => {
        this.$refs.selectUserForm.show({
          fieldid: item.field.fieldid,
          selectValue: value,
          mode: 'multiple',
          index: index
        })
      })
    },
    // 打开选择部门，角色窗口
    handleSelect (item, index) {
      let value
      if (this.flowStatus === 'proceed') {
        value = this.formSearch.getFieldValue(item.field.alias)
      } else {
        value = this.formSearchOver.getFieldValue(item.field.alias)
      }
      this.departmentKey = this.departmentKey ? 'department' : 'department_1'
      this.$nextTick(() => {
        this.$refs.selectDepartment.show({
          optionCustom: item.field.setting.form.optionCustom,
          optionType: item.field.setting.form.option_type,
          selectValue: value,
          mode: 'multiple',
          index: index,
          url: item.field.setting.form.option_type === 'department' ? '/admin/Department/getDepartmentData' : '/admin/Role/getRoleData'
        })
      })
    },
    // 选择部门，角色
    handleSelectUserData (selectValue, index) {
      const name = this.template[index].field.alias
      const obj = {}
      obj[name] = selectValue
      if (this.flowStatus === 'proceed') {
        this.formSearch.setFieldsValue(obj)
      } else {
        this.formSearchOver.setFieldsValue(obj)
      }
    }

  }
}
</script>
<style lang="less">
// 使用scoped无法修改到css属性
.dropdown {
  button {
    margin-right: 0;
  }
}
</style>
