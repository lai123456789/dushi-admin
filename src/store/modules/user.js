import storage from 'store'
import request from '@/utils/request'
import { ACCESS_TOKEN } from '@/store/mutation-types'
const user = {
  state: {
    token: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        request({
          url: '/admin/index/login',
          data: userInfo
        }).then(response => {
          const result = response.result
          storage.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', result.token)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        request({
          url: '/admin/index/init'
        }).then(response => {
          const result = response.result.userinfo

          if (result && result.role) {
            const role = result.role
            role.permissions = result.role.permissions
            role.permissions.map(per => {
              if (per.actionEntitySet != null && per.actionEntitySet.length > 0) {
                const action = per.actionEntitySet.map(action => { return action.action })
                per.actionList = action
              }
            })
            role.permissionList = role.permissions.map(permission => { return permission.permissionId })
            commit('SET_ROLES', result.role)
            commit('SET_INFO', result)
          } else {
            reject(response.message)
          }

          commit('SET_SETTING', response.result.setting)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        request({
          url: '/admin/index/logout'
        }).then((res) => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
          resolve(res)
        }).catch((res) => {
          resolve(res)
        }).finally((res) => {
          // commit('SET_TOKEN', '')
          // commit('SET_ROLES', [])
          // storage.remove(ACCESS_TOKEN)
        })
      })
    },

    // 编辑个人信息
    UserInfo ({ commit }, data) {
      return new Promise((resolve, reject) => {
        request({
          url: '/admin/user/info',
          data: data
        }).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    }

  }
}

export default user
