<template>
  <user-table-list :params="{tplviewid: $route.query.tplviewid}"></user-table-list>
</template>
<script>
import UserTableList from './UserTableList'
import Vue from 'vue'
Vue.component('UserTableList', UserTableList)
export default {
}
</script>
