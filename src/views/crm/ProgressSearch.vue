<template>
  <div>
    <div
      class="container">
      <div>
        <a-space style="padding: 16px">
          <h2 style="margin: 0; color: white">{{ transitionName }}流程图</h2>
          <h2 style="margin: 0 16px; color: white">{{ date }} / {{ weekDay }}</h2>
          <h2 style="margin: 0; color: white">正在进行中任务：{{ currentName }}</h2>
        </a-space>
      </div>
      <div class="two">
        <div class="guidao">
          <div class="wai">
            <div class="nei"></div>
            <div class="topColumn">
              <div class="textImg" v-for="(item, index) in topColumnList" :key="index">
                <div :title="item.transition_name" :style="{ color: item.transition_id === 'start' ? '#37CBCB' : item.check && item.check === 1 ? 'red' : index < currentIndex ? 'green' : 'gray' }">
                  {{ item.transition_name }}
                </div>
                <template v-if="isCurrentTop">
                  <img src="../../assets/icons/bluegreen.png" alt="" style="border: 1px solid #37CBCB; border-radius: 50%" v-if="item.transition_id === 'start'">
                  <img src="../../assets/icons/green.png" alt="" class="blingbling" style="border: 1px solid green;" v-else-if="index < currentIndex">
                  <img src="../../assets/icons/red.png" alt="" class="blingbling" style="border: 1px solid red;" v-else-if="index === currentIndex">
                  <img src="../../assets/icons/gray.png" alt="" class="blingbling" style="border: 1px solid gray;" v-else-if="index > currentIndex">
                </template>
                <template v-else>
                  <img src="../../assets/icons/bluegreen.png" alt="" style="border: 1px solid #37CBCB; border-radius: 50%" v-if="item.transition_id === 'start'">
                  <img src="../../assets/icons/green.png" alt="" class="blingbling" style="border: 1px solid green;" v-else-if="index < currentIndex">
                </template>
              </div>
            </div>
            <div class="bottomColumn">
              <div class="textImg" v-for="(item, index) in bottomColumnList" :key="index">
                <template v-if="isCurrentBottom">
                  <img src="../../assets/icons/black.png" alt="" style="border: 1px solid #3F3F3F; border-radius: 50%" v-if="item.transition_id === 'end'">
                  <img src="../../assets/icons/green.png" alt="" class="blingbling" style="border: 1px solid green;" v-else-if="index > currentBottmIndex">
                  <img src="../../assets/icons/red.png" alt="" class="blingbling" style="border: 1px solid red;" v-else-if="index === currentBottmIndex">
                  <img src="../../assets/icons/gray.png" alt="" class="blingbling" style="border: 1px solid gray;" v-else-if="index < currentBottmIndex">
                </template>
                <template v-else>
                  <img src="../../assets/icons/black.png" alt="" style="border: 1px solid #3F3F3F; border-radius: 50%" v-if="item.transition_id === 'end'">
                  <img src="../../assets/icons/gray.png" alt="" class="blingbling" style="border: 1px solid gray;" v-else>
                </template>
                <div
                  :title="item.transition_name"
                  :style="{ color: item.transition_id === 'end' ? 'black' : !currentBottmIndex ? 'gray' : item.check && item.check === 1 ? 'red' : index > currentBottmIndex ? 'green' : '' }">
                  {{ item.transition_name }}
                </div>
              </div>
            </div>
          </div>
          <div class="BottomMenu">
            <a-space>
              <div class="bottomImgText">
                <img src="../../assets/icons/bluegreen.png" class="blingbling" alt="" style="border: 1px solid #37CBCB;">
                <span style="margin-left: 8px">已开始</span>
              </div>
              <div class="bottomImgText">
                <img src="../../assets/icons/green.png" alt="" class="blingbling" style="border: 1px solid green;">
                <span style="margin-left: 8px">已完成</span>
              </div>
              <div class="bottomImgText">
                <img src="../../assets/icons/red.png" alt="" class="blingbling" style="border: 1px solid red;">
                <span style="margin-left: 8px">正在进行中</span>
              </div>
              <div class="bottomImgText">
                <img src="../../assets/icons/gray.png" alt="" class="blingbling" style="border: 1px solid gray;">
                <span style="margin-left: 8px">待进行</span>
              </div>
              <div class="bottomImgText">
                <img src="../../assets/icons/black.png" alt="" class="blingbling" style="border: 1px solid black;">
                <span style="margin-left: 8px">结束</span>
              </div>
            </a-space>
          </div>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      date: this.moment().format('YYYY-MM-DD'),
      weekDay: '',
      topColumnList: [],
      bottomColumnList: [],
      currentIndex: '',
      currentBottmIndex: '',
      currentName: '',
      isCurrentTop: '',
      isCurrentBottom: '',
      transitionName: ''
    }
  },
  created () {
    var dateArray = this.moment().format('YYYY-MM-DD').split('-')
    const date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2])
    this.weekDay = '星期' + '日一二三四五六'.charAt(date.getDay())
    this.getData()
    const number = this.$route.query.order_number
    if (number.includes('WH')) {
      this.transitionName = '维护保养'
    } else if (number.includes('AZ')) {
      this.transitionName = '新机安装'
    } else if (number.includes('GZ')) {
      this.transitionName = '故障处理'
    } else if (number.includes('DX')) {
      this.transitionName = '大修改造'
    }
  },
  methods: {
    getData () {
      this.axios({
        url: '/crm/Order/orderFlow',
        data: {
          order_number: this.$route.query.order_number
        }
      }).then((res) => {
        const data = res.result.data
        data.forEach((item, index) => {
          if (item.check === 1) {
            this.currentIndex = index
            this.currentName = item.transition_name
          }
        })
        const length = data.length / 2
        const topColumnList = data.slice(0, length)
        this.isCurrentTop = topColumnList.some(item => item.check && item.check === 1)
        this.topColumnList = topColumnList

        const bottomData = data.slice(length)
        this.bottomColumnList = bottomData.reverse()
        this.bottomColumnList.forEach((item, index) => {
          if (item.check === 1) {
            this.currentBottmIndex = index
          }
        })
        this.isCurrentBottom = bottomData.some(item => item.check && item.check === 1)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.container{
  background: linear-gradient(to right, #099DF2, #1275ED, #3A36E3, #5814DB);
  .two{
    background: #FFF;
    border-top-right-radius: 18%;
    .guidao{
      padding: 200px 20px;
      .wai{
        position: relative;
        width: 100%;
        height: 200px;
        border-radius: 100px;
        padding: 16px;
        border: 2px solid gray;
        .nei{
          width: 100%;
          height: 165px;
          border-radius: 100px;
          border: 2px solid gray;
        }
        .topColumn,.bottomColumn{
          position: absolute;
          width: 95%;
          display: flex;
          padding-left: 50px;
          justify-content: space-around;
          .textImg{
            line-height: 22px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            div{
              flex: 1;
              width: 70px;

              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            img{
              width: 16px;
              height: 16px;
              margin: 0 auto;
            }
          }
        }
        .topColumn{
          top: -44px;
        }
        .bottomColumn{
          bottom: -44px;
        }
      }
      .blingbling{
              border-radius: 50%;
              -webkit-animation: scaleout 1.5s infinite ease-in-out;
              animation: scaleout 1.5s infinite ease-in-out;
              animation-direction: alternate;
            }
            // @-webkit-keyframes scaleout {
            //   0% { -webkit-transform: scale(1.0) }
            //   100% {
            //     -webkit-transform: scale(1.1);
            //     opacity: 0;
            //   }
            // }
            @keyframes scaleout {
              0% {
                transform: scale(1.0);
                -webkit-transform: scale(1.0);
                opacity: 1;
              }
              50% {
                transform: scale(1.0);
                -webkit-transform: scale(1.0);
                opacity: 0.7;
              }
              100% {
                  transform: scale(1.3);
                  -webkit-transform: scale(1.3);
                  opacity: 1;
                }
            }
      .BottomMenu{
        text-align: right;
        margin-top: 100px;
        margin-right: 100px;
        .bottomImgText{
          margin-right: 16px;
          img{
            width: 16px;
            height: 16px;
            border-radius: 50%;
          }
        }
      }
    }
  }
}
</style>
