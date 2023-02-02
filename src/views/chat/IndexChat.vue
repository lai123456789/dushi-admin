<template>
  <div style="background-color: #fff;">
    <a-row
      type="flex"
      style="align-items: stretch; height: 750px;"
    >
      <a-col
        :span="6"
        style="border: 1px solid #d9d9d9;"
      >
        <a-tabs default-active-key="1">
          <a-tab-pane
            key="1"
            style=""
          >
            <span slot="tab">当前对话(<span style="color: red;">{{ groupTotal }}</span>)</span>
            <a-input
              placeholder="请输入访客名称搜索"
              v-model="visiterName"
              style="width: 165px; margin-left: 30px;"
            />
            <span>
              <a-button
                style="margin: 10px;"
                @click="eventGetChatList"
              >搜索</a-button>
              <a-button
                @click="()=>{visiterName=''; eventGetChatList();}"
              >重置</a-button>
            </span>
            <a-list
              item-layout="horizontal"
              :dataSource="groupData"
              :loading="groupLoading"
              style="width: 350px; font-size: 10px; margin:0 auto;"
            >
              <a-list-item slot="renderItem" slot-scope="item">
                <a-list-item-meta>
                  <div slot="title">
                    <span>{{ item.visiter_name }}</span>
                    <span style="float: right; font-size: 12px; font-weight: normal;">{{ item.lasttime }}</span>
                  </div>
                  <div slot="description">
                    <div v-if="item.direction == 'to_visiter'">客服：{{ item.content }}</div>
                    <div v-else-if="item.direction == 'to_service'">访客：{{ item.content }}</div>
                    <div>
                      <span>来源：{{ item.from_nick_name }}</span>
                      <a style="float: right;" @click="eventClose(item.visiter_id)">[结束]</a>
                    </div>
                  </div>
                  <a-avatar
                    slot="avatar"
                    style="width: 68px; height: 68px"
                    :src="baseUrl + item.avatar"
                  />
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-tab-pane>
          <a-tab-pane key="2">
            <span slot="tab">当前排队(<span style="color: red;">{{ waitTotal }}</span>)</span>
            <a-input
              placeholder="请输入访客名称搜索"
              v-model="visiter"
              style="width: 162px; margin-left: 28px;"
            />
            <span>
              <a-button
                style="margin: 10px;"
                @click="eventGetQueueList"
              >搜索</a-button>
              <a-button
                @click="()=>{visiter=''; eventGetQueueList();}"
              >重置</a-button>
            </span>
            <a-list
              :loading="waitLoading"
              :dataSource="waitData"
              item-layout="horizontal"
              style="width: 350px; font-size: 10px; margin:0 auto;"
            >
              <a-list-item slot="renderItem" slot-scope="item">
                <a-list-item-meta>
                  <div slot="title">
                    <span>{{ item.visiter_name }}</span>
                    <span style="float: right; font-size: 12px; font-weight: normal;">{{ item.timestamp }}</span>
                  </div>
                  <div slot="description">
                    <div>--</div>
                    <div>
                      <span>来源：{{ item.from_nick_name }}</span>
                      <a style="float: right;" @click="eventClaim(item.visiter_id)">[抓取]</a>
                    </div>
                  </div>
                  <a-avatar
                    slot="avatar"
                    style="width: 68px; height: 68px"
                    :src="baseUrl + item.avatar"
                  />
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col
        :span="10"
        style="border-top: 1px solid #d9d9d9; border-bottom: 1px solid #d9d9d9;"
      >
        <div style="background:#F5F5F6; height: 45px; line-height: 45px;">
          <span style="color: green; margin-left: 25px;">当前访客: </span>
          <span style="margin-left: 450px; color: green;">客服状态: 空闲</span>
        </div>
        <div
          style="height: 400px; overflow:auto;"
          ref="chat"
        >
          <p style="text-align: center;">没有数据</p>
          <p style="text-align: center;">2020-05-20 16:34:6 您好，当前正在排队，您可以先简单描述您的问题-ok1</p>
          <div
            v-for="item in chatData"
            :key="item.cid"
          >
            <div
              v-if="(item.name !=='admin1')&&(item.name !=='系统')"
              style="display: flex; flex-direction: column;"
            >
              <div style="height: 40px; margin-left: 10px;">
                <img
                  style="width: 40px; height: 100%; margin-top: 15px; border-radius: 5px;"
                  :src="item.avatar"
                >
                <span style="padding: 2px 5px 0 10px;">{{ item.name }} {{ item.datetime }}</span>
              </div>
              <div style="width: 500px; margin-left: 60px; margin-top: 10px;">
                <span
                  v-html="item.content"
                  style="background: #EBEBEB;display: inline-block;"
                ></span>
              </div>
            </div>
            <div
              v-else-if="item.name !=='系统'"
              style="display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 10px;"
            >
              <div style="height: 40px; display: flex; flex-direction: row-reverse; justify-content: center">
                <img
                  style="width: 40px; height: 100%; margin-right: 10px; border-radius: 5px;"
                  :src="item.avatar"
                >
                <span style="padding: 2px 10px 0 0;">{{ item.datetime }} {{ item.name }} </span>
              </div>
              <div style="width: 500px; overflow: hidden; margin-right: 60px;text-align: right;">
                <span
                  v-html="item.content"
                  style="background: #EBEBEB; display: inline-block"
                ></span>
              </div>
            </div>
            <div
              v-else-if="item.name =='系统'"
              style="display: flex; flex-direction: column; align-items: flex-end; padding-bottom: 10px;"
            >
              <div style="height: 40px; display: flex; flex-direction: row-reverse; justify-content: center">
                <img
                  style="width: 40px; height: 100%; margin-right: 10px; border-radius: 5px;"
                  :src="item.avatar"
                >
                <span style="padding: 2px 10px 0 0;">{{ item.datetime }} {{ item.name }} </span>
              </div>
              <div style="width: 500px; overflow: hidden; margin-right: 60px;text-align: right;">
                <span
                  v-html="item.content"
                  style="background: #EBEBEB; display: inline-block;"
                ></span>
              </div>
            </div>

          </div>
        </div>
        <a-divider style="margin-bottom: 5px;" />
        <div style="padding-left: 5px;">
          <a-popover
            v-model="visible"
            trigger="click"
            style="margin-right: 5px;"
          >
            <a
              slot="content"
              @click="hide"
              style="width: 100px;"
            >
              <div style="width: 240px; height: 240px;">
                <span
                  v-for="item in list"
                  :key="item.id"
                  style="width: 24px; display: inline-block"
                >
                  <span
                    v-html="item.url"
                    @click="emoji(item.word)"
                  ></span>
                </span>
              </div>
            </a>
            <a-button icon="smile">表情</a-button>
          </a-popover>
          <a-button
            icon="file-jpg"
            style="margin-right: 5px;"
            @click="photo()"
          >图片</a-button>
          <a-button
            icon="video-camera"
            style="margin-right: 5px;"
            @click="video()"
          >视频</a-button>
          <a-button
            icon="swap"
            style="margin-right: 5px;"
            @click="transfer()"
          >转接</a-button>
          <a-button
            icon="user-delete"
            style="margin-right: 5px;"
            @click="blacklist()"
          >黑名单</a-button>
          <a-button
            icon="star"
            @click="showConfirm"
          >
            评价
          </a-button>
        </div>
        <a-textarea
          style="margin-top: 10px; outline: none; border: none; resize: none;  height: 200px;"
          v-model="content"
        ></a-textarea>
        <div style="text-align: right;">
          <a-button
            type="primary"
            style="margin-right: 5px; margin-top: 5px;"
            @click="send()"
          >发送消息</a-button>
        </div>
      </a-col>
      <a-col
        :span="8"
        style="border: 1px solid #d9d9d9;"
      >
        <a-tabs default-active-key="1">
          <a-tab-pane key="1">
            <span slot="tab">
              快捷回复
            </span>
            <div style="margin-bottom: 10px;">
              <a-radio-group
                :value="size"
                @change="handleSizeChange"
                style="margin-left: 5px;"
              >
                <a-radio-button
                  value="a"
                  @click="() => {queryParam = {service_id:'0',};$refs.table.refresh(true)}"
                >
                  公共库
                </a-radio-button>
                <a-radio-button
                  value="b"
                  @click="() => {queryParam = {service_id:'1',};$refs.table.refresh(true)}"
                >
                  个人库
                </a-radio-button>
              </a-radio-group>
              <a-select
                v-model="all"
                style="width: 100px; margin-left: 10px;"
              >
                <a-select-option
                  value="0"
                  @click="() => {queryParam = {action:'category',tag:'init',type:'combobox'};$refs.table.refresh(true)}"
                >
                  所有分类
                </a-select-option>
              </a-select>
              <a-input
                placeholder="输入内容搜索快捷回复"
                type="text"
                style="width:200px; margin-left: 10px;"
                v-model="queryParam.searchString"
              />
              <a-button
                style="margin-left: 10px;"
                @click="$refs.table.refresh(true)"
              />
            </div>
            <s-table
              ref="table"
              size="small"
              rowKey="service_id"
              :columns="columns"
              :data="loadDataTable"
              :sorter="sorter"
            >
            </s-table>
          </a-tab-pane>
          <a-tab-pane key="2">
            <span slot="tab">客户信息</span>
            <a-form :form="form">
              <a-form-item
                label="客户姓名"
                v-bind="formItemLayout"
              >
                <a-input />
              </a-form-item>
              <a-form-item
                label="客户电话"
                v-bind="formItemLayout"
              >
                <a-input />
              </a-form-item>
              <a-form-item
                label="备注"
                v-bind="formItemLayout"
              >
                <a-textarea />
              </a-form-item>
              <div style="margin-left: 240px; margin-top: 500px;">

                <a-button
                  type="primary"
                  style="margin-right: 15px;"
                >保存</a-button>
                <a-button>关闭</a-button>
              </div>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
    <a-modal
      :title="title"
      :width="width"
      :visible="myvisible"
      @ok="myvisible=!myvisible"
      @cancel="myvisible=!myvisible"
    >
      <div v-if="modal==='photo'">
        <a-upload
          name="file"
          :multiple="true"
          :headers="headers"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          @change="handleChange"
        >
          <a-button>
            <a-icon type="upload" /> Click to Upload </a-button>
        </a-upload>
      </div>
      <div v-else-if="modal==='video'">
        <a-upload
          list-type="picture"
          action="//jsonplaceholder.typicode.com/posts/"
          :preview-file="previewFile"
        >
          <a-button>
            <a-icon type="upload" /> Upload </a-button>
        </a-upload>
      </div>
      <div v-else-if="modal==='transfer'">
        <div>
          <a-input
            type="text"
            style="width: 200px; margin-right: 18px;"
            placeholder="请输入客服名称搜索"
          />
          <a-button icon="reload"></a-button>
        </div>
        <div style="overflow: hidden; margin-top: 15px; height:100px;">
          <div style="float:left">
            <img
              style="width: 40px; height: 40px; border-radius: 50%;"
              src="http://demo.doscs.com/doscss_trunk/public/static/images/moren.gif"
              alt=""
            >
            <span style="margin-left:15px;">啊啊啊</span>
          </div>
          <div
            style="float:right; color:blue; margin-top: 18px; cursor: pointer"
            @click="eventGetswitch()"
          >转接</div>
        </div>
      </div>
      <div v-else-if="modal==='blacklist'">
        <div>
          <a-textarea
            placeholder="请输入加入黑名单的理由，提交后立即结束当前对话。"
            style="margin-top: 10px; resize: none; width: 400px; height:100px;"
            v-model="content"
          ></a-textarea>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      headers: {
        authorization: 'authorization-text'
      },
      baseUrl: process.env.VUE_APP_BASE_URL,
      title: '',
      width: '',
      list: [{
        id: '1',
        word: '[微笑]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/001.gif">'
      }, {
        id: '2',
        word: '[撇嘴]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/002.gif">'
      }, {
        id: '3',
        word: '[色]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/003.gif">'
      }, {
        id: '4',
        word: '[发呆]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/004.gif">'
      }, {
        id: '5',
        word: '[得意]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/005.gif">'
      }, {
        id: '6',
        word: '[流泪]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/006.gif">'
      }, {
        id: '7',
        word: '[害羞]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/007.gif">'
      }, {
        id: '8',
        word: '[闭嘴]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/008.gif">'
      }, {
        id: '9',
        word: '[睡]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/009.gif">'
      }, {
        id: '10',
        word: '[大哭]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/010.gif">'
      }, {
        id: '11',
        word: '[尴尬]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/011.gif">'
      }, {
        id: '12',
        word: '[发怒]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/012.gif">'
      }, {
        id: '13',
        word: '[调皮]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/013.gif">'
      }, {
        id: '14',
        word: '[龇牙]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/014.gif">'
      }, {
        id: '15',
        word: '[惊讶]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/015.gif">'
      }, {
        id: '16',
        word: '[难过]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/016.gif">'
      }, {
        id: '17',
        word: '[囧]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/017.gif">'
      }, {
        id: '18',
        word: '[抓狂]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/018.gif">'
      }, {
        id: '19',
        word: '[吐]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/019.gif">'
      }, {
        id: '20',
        word: '[偷笑]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/020.gif">'
      }, {
        id: '21',
        word: '[愉快]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/021.gif">'
      }, {
        id: '22',
        word: '[白眼]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/022.gif">'
      }, {
        id: '23',
        word: '[傲慢]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/023.gif">'
      }, {
        id: '24',
        word: '[困]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/024.gif">'
      }, {
        id: '25',
        word: '[惊恐]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/025.gif">'
      }, {
        id: '26',
        word: '[流汗]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/026.gif">'
      }, {
        id: '27',
        word: '[憨笑]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/027.gif">'
      }, {
        id: '28',
        word: '[悠闲]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/028.gif">'
      }, {
        id: '29',
        word: '[奋斗]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/029.gif">'
      }, {
        id: '30',
        word: '[咒骂]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/030.gif">'
      }, {
        id: '31',
        word: '[疑问]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/031.gif">'
      }, {
        id: '32',
        word: '[嘘]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/032.gif">'
      }, {
        id: '33',
        word: '[晕]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/033.gif">'
      }, {
        id: '34',
        word: '[衰]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/034.gif">'
      }, {
        id: '35',
        word: '[骷髅]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/035.gif">'
      }, {
        id: '36',
        word: '[敲打]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/036.gif">'
      }, {
        id: '37',
        word: '[再见]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/037.gif">'
      }, {
        id: '38',
        word: '[擦汗]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/038.gif">'
      }, {
        id: '39',
        word: '[抠鼻]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/039.gif">'
      }, {
        id: '40',
        word: '[鼓掌]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/040.gif">'
      }, {
        id: '41',
        word: '[坏笑]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/041.gif">'
      }, {
        id: '42',
        word: '[左哼哼]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/042.gif">'
      }, {
        id: '43',
        word: '[右哼哼]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/043.gif">'
      }, {
        id: '44',
        word: '[哈欠]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/044.gif">'
      }, {
        id: '45',
        word: '[鄙视]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/045.gif">'
      }, {
        id: '46',
        word: '[委屈]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/046.gif">'
      }, {
        id: '47',
        word: '[快哭了]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/047.gif">'
      }, {
        id: '48',
        word: '[阴险]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/048.gif">'
      }, {
        id: '49',
        word: '[亲亲]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/049.gif">'
      }, {
        id: '50',
        word: '[可怜]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/050.gif">'
      }, {
        id: '51',
        word: '[菜刀]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/051.gif">'
      }, {
        id: '52',
        word: '[西瓜]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/052.gif">'
      }, {
        id: '53',
        word: '[啤酒]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/053.gif">'
      }, {
        id: '54',
        word: '[咖啡]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/054.gif">'
      }, {
        id: '55',
        word: '[猪头]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/055.gif">'
      }, {
        id: '56',
        word: '[玫瑰]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/056.gif">'
      }, {
        id: '57',
        word: '[凋谢]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/057.gif">'
      }, {
        id: '58',
        word: '[嘴唇]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/058.gif">'
      }, {
        id: '59',
        word: '[爱心]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/059.gif">'
      }, {
        id: '60',
        word: '[心碎]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/060.gif">'
      }, {
        id: '61',
        word: '[蛋糕]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/061.gif">'
      }, {
        id: '62',
        word: '[炸弹]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/062.gif">'
      }, {
        id: '63',
        word: '[便便]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/063.gif">'
      }, {
        id: '64',
        word: '[月亮]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/064.gif">'
      }, {
        id: '65',
        word: '[太阳]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/065.gif">'
      }, {
        id: '66',
        word: '[拥抱]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/066.gif">'
      }, {
        id: '67',
        word: '[强]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/067.gif">'
      }, {
        id: '68',
        word: '[弱]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/068.gif">'
      }, {
        id: '69',
        word: '[握手]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/069.gif">'
      }, {
        id: '70',
        word: '[胜利]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/070.gif">'
      }, {
        id: '71',
        word: '[抱拳]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/071.gif">'
      }, {
        id: '72',
        word: '[勾引]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/072.gif">'
      }, {
        id: '73',
        word: '[拳头]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/073.gif">'
      }, {
        id: '74',
        word: '[OK]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/074.gif">'
      }, {
        id: '75',
        word: '[跳跳]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/075.gif">'
      }, {
        id: '76',
        word: '[发抖]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/076.gif">'
      }, {
        id: '77',
        word: '[怄火]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/077.gif">'
      }, {
        id: '78',
        word: '[转圈]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/078.gif">'
      }, {
        id: '79',
        word: '[笑脸]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/079.gif">'
      }, {
        id: '80',
        word: '[生病]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/080.gif">'
      }, {
        id: '81',
        word: '[破涕为笑]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/081.gif">'
      }, {
        id: '82',
        word: '[吐舌]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/082.gif">'
      }, {
        id: '83',
        word: '[脸红]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/083.gif">'
      }, {
        id: '84',
        word: '[恐惧]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/084.gif">'
      }, {
        id: '85',
        word: '[失望]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/085.gif">'
      }, {
        id: '86',
        word: '[无语]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/086.gif">'
      }, {
        id: '87',
        word: '[嘿哈]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/087.gif">'
      }, {
        id: '88',
        word: '[捂脸]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/088.gif">'
      }, {
        id: '89',
        word: '[奸笑]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/089.gif">'
      }, {
        id: '90',
        word: '[机智]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/090.gif">'
      }, {
        id: '91',
        word: '[皱眉]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/091.gif">'
      }, {
        id: '92',
        word: '[耶]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/092.gif">'
      }, {
        id: '93',
        word: '[鬼魂]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/093.gif">'
      }, {
        id: '94',
        word: '[合十]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/094.gif">'
      }, {
        id: '95',
        word: '[强壮]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/095.gif">'
      }, {
        id: '96',
        word: '[庆祝]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/096.gif">'
      }, {
        id: '97',
        word: '[礼物]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/097.gif">'
      }, {
        id: '98',
        word: '[红包]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/098.gif">'
      }, {
        id: '99',
        word: '[發]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/099.gif">'
      }, {
        id: '100',
        word: '[福]',
        url: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/100.gif">'
      }],
      all: '所有分类',
      size: 'a',
      queryParam: { },
      formItemLayout: {
        labelCol: {
          span: 6
        },
        wrapperCol: {
          span: 18
        }
      },
      form: this.$form.createForm(this),
      serviceList: [],
      visible: false,
      myvisible: false,
      modal: '',
      myimg: '<img class="s-news-img" src="http://demo.doscs.com/doscss_trunk/public/upload/2020/0512/202005120442226145.jpg">',
      visiter: '',
      visiterName: '',
      waitData: [], // 当前等待访客
      waitTotal: 0, // 当前等待访客数量
      waitLoading: false, // 当前等待访客loading
      groupData: [], // 当前对话访客
      groupTotal: 0, // 当前对话访客数量
      groupLoading: false, // 当前对话访客loading
      data: {
        avatar: '',
        visiter_name: '',
        visiter_id: '',
        timestamp: '',
        from: '',
        first_time: ''
      },
      pagination: false,
      actions: [
        { type: 'star-o', text: '156' },
        { type: 'like-o', text: '156' },
        { type: 'message', text: '2' }
      ],
      columns: [{
        title: '快捷词',
        dataIndex: 'id',
        sorter: true
      }, {
        title: '回复内容',
        dataIndex: 'name',
        sorter: true
      }],
      sorter: { field: 'id', order: 'descend' },
      evaluation: false,
      black: false,
      transition: false,
      uploadVideo: false,
      uploadPhoto: false,
      face: false,
      content: '',
      chatData: []
    }
  },
  created () {
    this.eventGetChatList()
    this.eventGetQueueList()
    // this.indexServiceList()
  },
  computed: {
    ...mapGetters(['setting'])
  },
  methods: {
    loadDataTable (parameter) {
      this.queryParam.action = 'category'
      this.queryParam.service_id = '26'
      const params = Object.assign(parameter, this.queryParam)
      return this.axios({
        url: '/chat/reply/init',
        params: params
      }).then(res => {
        return res.result
      })
    },

    refresh () {
      this.$refs.table.refresh()
    },
    hide () {
      this.visible = false
    },
    handleSizeChange (e) {
      this.size = e.target.value
    },
    eventClose (visiterId) {
      const that = this
      this.$confirm({
        title: '您确认要结束该用户的对话吗？',
        onOk () {
          this.groupLoading = true
          that.axios({
            url: '/chat/event/close',
            params: { visiter_id: visiterId }
          }).then(res => {
            this.eventGetChatList()
          })
        }
      })
    },
    eventClaim (visiterId) {
      this.waitLoading = true
      return this.axios({
        url: '/chat/event/claim',
        params: { visiter_id: visiterId }
      }).then(res => {
        this.eventGetQueueList()
      })
    },
    // 转接在线客服列表
    indexServiceList () {
      return this.axios({
        url: '/chat/index/serviceList'
      }).then(res => {
        this.serviceList = res.result.data
      })
    },
    // 转接按钮
    eventGetswitch () {
      return this.axios({
        url: '/chat/event/getswitch'
      }).then(res => {
        this.switchData = res.result.data
      })
    },
    //  获取当前对话列表数据
    eventGetChatList (pageNo = 1) {
      this.groupLoading = true
      return this.axios({
        url: '/chat/event/getChatList',
        params: { visiter_name: this.visiterName, pageNo: pageNo }
      }).then(res => {
        this.groupData = res.result.data
        this.groupTotal = res.result.totalCount
        this.groupLoading = false
      })
    },
    // 获取当前排队列表数据
    eventGetQueueList (pageNo = 1) {
      this.waitLoading = true
      return this.axios({
        url: '/chat/event/getQueueList',
        params: { visiter_name: this.visiter, pageNo: pageNo }
      }).then(res => {
        this.waitData = res.result.data
        this.waitTotal = res.result.totalCount
        this.waitLoading = false
      })
    },
    // 获取会话记录
    eventMychatdata () {
      return this.axios({
        url: '/chat/event/mychatdata',
        params: { start_time: '1', end_time: '1' }
      }).then(res => {
        this.chatData = res.result.data
      })
    },
    emoji (word) {
      this.content = word
    },
    send () {
      const emotion = []
      for (let i = 0; i < this.list.length; i++) {
        emotion.push(this.list[i])
      }
      for (let i = 0; i < emotion.length; i++) {
        if (this.content === emotion[i].word) {
          this.content = emotion[i].url
        }
      }
      this.chatData.push({
        cid: Math.random(0, 1) * 200,
        avatar: 'modules/chat/statics/images/system.png',
        name: 'admin1',
        datetime: '2020-05-1s2 16:42:23',
        content: this.content,
        text00000: '<img class="pointer" src="http://demo.doscs.com/doscss_trunk//public/upload/2020/0522/202005222105462279.jpg" onclick="getbig(this)">'
      })
      if (this.content === '微笑') {
        this.text00000 = '<img src=" http://demo.doscs.com/doscss_trunk/modules/chat/statics/images/emoji/001.gif">'
      }
      this.content = ''
      this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight - 1000
    },
    handleChange (info) {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        this.content = `${info.file.name}`
      } else if (info.file.status === 'error') {

      }
    },
    photo () {
      this.width = '400px'
      this.title = <span><a-icon type="picture" />  上传图片</span>
      this.modal = 'photo'
      this.myvisible = true
    },
    previewFile (file) {
      return fetch('https://next.json-generator.com/api/json/get/4ytyBoLK8', {
        body: file
      })
        .then(res => res.json())
        .then(({ thumbnail }) => thumbnail)
    },
    video () {
      this.width = '400px'
      this.title = <span><a-icon type="video-camera" />  上传视频</span>
      this.modal = 'video'
      this.myvisible = true
    },
    transfer () {
      this.width = '300px'
      this.title = <span><a-icon type="wechat" />  客服列表</span>
      this.modal = 'transfer'
      this.myvisible = true
    },
    blacklist () {
      this.title = <span><a-icon type="user-delete" />  加入黑名单</span>
      this.modal = 'blacklist'
      this.myvisible = true
    },
    showConfirm () {
      this.$confirm({
        title: '邀请用户满意度评价并结束当前会话?',
        onOk () {
          console.log('OK')
        },
        onCancel () {
          console.log('Cancel')
        },
        class: 'test'
      })
    }

  }
}
</script>
