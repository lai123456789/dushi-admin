<template>
  <user-table-workflow-list :params="{tplviewid: $route.query.tplviewid}"></user-table-workflow-list>
</template>
<script>
import UserTableWorkflowList from './UserTableWorkflowList'
import Vue from 'vue'
Vue.component('UserTableWorkflowList', UserTableWorkflowList)
export default {
}
</script>
