<template>
  <div class="bg">
    <a-spin :spinning="loading" tip="加载中,请稍等...">
      <div class="body">
        <div class="firstRow">
          <div class="bigDiv">
            <div class="left">
              <div class="left-one">
                <div>
                  <img src="../assets/image/lujing.png" alt="">
                  <div>{{ dataApi.type }}</div>
                </div>
              </div>
              <div class="left-two">
                <div class="left-first">{{ dataApi.type }}</div>
                <div class="left-second">
                  <div class="left-two-1">
                    <img src="../assets/image/address2.png" alt="">
                    <span>{{ dataApi.address }}</span>
                  </div>
                  <div class="left-two-2">
                    <span>{{ dataApi.order_type }}</span>
                    <a-divider type="vertical" />
                    <span>{{ dataApi.product_big_type }} ></span>
                    <span> {{ dataApi.product_type }} ></span>
                    <span> {{ dataApi.product_xh }} ></span>
                    <span> {{ dataApi.work_type }}</span>
                  </div>
                  <div class="left-two-3">
                    <div class="leftOne">
                      <div>{{ dataApi.all_time }}</div>
                      <div style="display: flex; align-items: center">
                        <div class="one" style="background: #FF808B;"></div>
                        <div class="two">整体用时</div>
                      </div>
                    </div>
                    <div class="leftTwo"></div>
                    <div class="leftOne">
                      <div>{{ dataApi.over_time }}</div>
                      <div style="display: flex; align-items: center">
                        <div class="one" style="background: #24C2CA;"></div>
                        <div class="two">较计划超时</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
            <div class="right">
              <img src="../assets/image/noIcon.png" alt="">
              <div class="right-first">工单标签</div>
              <div class="right-tag-all">
                <div v-for="(value,key) in dataApi.order_tag" :key="key">
                  <a-tag :class="value.is?'orange':'green'" class="tag">
                    {{ value.name }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>

        </div>
        <a-row class="secondRow" :gutter="16">
          <a-col :span="8" v-for="(value,key) in dataApi.order_List" :key="key">
            <div class="second-item">
              <div class="s1">
                <img src="../assets/image/ic_business_center2.png" alt="">
                <span>{{ value.name }}</span>
              </div>
              <div class="s2">
                <a-button :class="value.status===2?'completed':value.status===1?'underway':value.status===0?'nobegin':''">
                  {{ value.status===2?'已完成':value.status===1?'进行中':value.status===0?'未开始':'' }}
                </a-button>
                <a-button class="over" v-if="value.over_time">
                  {{ value.over_time }}
                </a-button>
              </div>
              <div class="s3">
                <div class="s3-index">
                  <div v-if="value.use_time" class="s3-index-one">
                    <div class="s3-index-text">{{ value.use_time }}</div>
                    <div style="display: flex; align-items: center">
                      <div style="width: 12px; height: 12px; margin-right: 5px; border-radius: 50%; background: #FF808B"></div>
                      <div style="font-size: 16px;">用时完成</div>
                    </div>
                  </div>
                  <div v-if="value.use_time" style="margin: 0 64px; width: 1px; height: 37px; border: 1px solid #CCCCCC"></div>
                  <div class="s3-index-one">
                    <div class="s3-index-text">{{ value.standard_time }}</div>
                    <div style="display: flex; align-items: center">
                      <div style="width: 12px; height: 12px; margin-right: 5px; border-radius: 50%; background: #24C2CA"></div>
                      <div style="font-size: 16px;">标准时效</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>
<script>
export default {
  data () {
    return {
      loading: false,
      dataApi: {},
      closeRate: '',
      complaintRate: '',
      myChart: {}
    }
  },
  created () {
  },
  mounted () {
    this.getInfo() // 调用接口获取信息
  },
  methods: {
    search () {
      this.loading = true
    },
    reset () {
      this.loading = true
      this.queryParam = {}
    },
    getInfo () {
      this.axios({
        url: '/oa/index/portrayal'
      }).then(res => {
        this.dataApi = res.result.data
      })
    }
  }
}
</script>

<style scoped lang="scss">
.bg{
  width: 100vw;
  overflow: hidden;
  background: #F5F6FA;
}
  /*首行*/
.firstRow{
  background:#FFF;
  box-shadow: 6px 6px 54px rgba(0, 0, 0, 0.05);
  opacity: 1;
  padding: 70px 100px 30px 100px;
  height: 310px;
  .bigDiv{
    height: 100%;
    display: flex;
    justify-content: space-between;
    .left{
      display: flex;
      .left-one{
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background-color: #24C2CA;
        margin-right: 46px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
          width: 42px;
          height: 30px;
        }
        div{
          font-size: 42px;
          color: #FFF;
          line-height: 50px;
          font-weight: bold;
        }
      }
      .left-two{
        .left-first{
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          margin-bottom: 5px;
        }
        .left-second{
          .left-two-1{
            img{
            width: 13px;
            height: 16px;
            margin-right: 5px;
            }
            span{
              font-size: 16px;
              color: #999999;
            }
          }
          .left-two-2{
            span{
              font-size: 16px;
              color: #999999;
            }
          }
          .left-two-3{
            display: flex;
            align-items: center;
            .leftOne{
              div:nth-child(1){
                font-size: 28px;
                font-weight: bold;
                color: #202224;
                line-height: 60px;
              }
              div:nth-child(2){
                .one{
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  margin-right: 10px;
                }
                .two{
                  color: #282D32;
                  font-size: 16px;
                }
              }
            }
            .leftTwo{
              background: #CCCCCC;
              height: 37px;
              width: 1px;
              margin: 0 50px;
            }
          }

        }
      }
    }
    .right{
      width: 660px;
      position: relative;
      z-index: 1;
      margin-right: 50px;
      img{
        width: 145px;
        height: 127px;
        position: absolute;
        right: -80px;
        top: -50px;
        z-index: -1;
        opacity: .6;
      }
      .right-first{
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        margin-bottom: 5px;
      }
      .right-tag-all{
        display: flex;
        flex-flow: row wrap;
        .tag{
          border-radius: 5px;
          margin: 0 20px 10px 0;
          width: 140px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
        }
        .green{
          background: #E2FEFF;
          color: #129AA2;
          border: 1px solid  #129AA2;
        }
        .orange{
          background: #FFF8ED;
          color: #F56A1B;
          border: 1px solid  #F56A1B;
        }
      }
    }
  }
}
.secondRow{
  padding: 35px 50px;
  border-radius: 10px;
  margin-bottom:35px;
}
.second-item{
  margin-right: 30px;
  margin-bottom: 30px;
  background: #FFF;
  border-radius: 10px;
  height: 302px;
  padding-left: 20px;
}
.s1{
  padding:20px 0 0 0;
  display: flex;
  align-items: center;
  img{
  width: 30px;
  height: 30px;
  margin-right: 5px;
  }
  span{
  font-size: 22px;
  font-weight: bold;
  line-height: 40px;
  }
}
.s2{
  margin: 60px 0 45px 10px;
  button{
    background: transparent;
    border-radius: 5px;
    width: 120px;
    height: 42px;
    font-size: 18px;
    font-weight: bold;
  }
  .completed{
    background: #24C2CA;
    color: #FFF;
  }
  .underway{
    color: #129AA2;
    border: 1px solid #129AA2;
  }
  .nobegin{
    color: #129AA2;
    border: 1px solid #129AA2;
  }
  .over{
    color: #FF6D1A;
    border: 1px solid #FF6D1A;
    margin-left: 15px;
  }
}
.s3{
  text-align: center;
  .s3-index{
    display: flex;
    justify-content: center;
    align-items: center;
    .s3-index-one{
      .s3-index-text{
        color: #202224;
        font-size: 28px;
        font-weight: bold;
        line-height: 48px;
      }
    }
  }
}

</style>
