<template>
  <div>
    <a-select
      showSearch
      :value="undefined"
      placeholder="请输入部门关键字进行搜素"
      allowClear
      :filter-option="false"
      :mode="data.mode"
      :not-found-content="fetching ? undefined : null"
      @search="getDepartment"
      @popupScroll="popupScroll"
      @change="(e)=>{if(!e){department = []}}"
    >
      <a-spin v-if="fetching" slot="notFoundContent" size="small" />
      <a-select-option :value="dep.departmentid" v-for="dep in department" :key="dep.departmentid" @click="(e)=>{$emit('ok', dep.departmentid, dep)}">{{ dep.full_name }}</a-select-option>
    </a-select>
  </div>
</template>
<script>
import debounce from 'lodash/debounce'
export default {
  props: {
    data: {
      type: Object,
      default () {
        return {}
      },
      required: false
    }
  },
  data () {
    this.getDepartment = debounce(this.getDepartment, 800)
    return {
      lastFetchId: 0,
      department: [],
      fetching: false,
      scrollStats: true,
      page: {
        pageNo: 1,
        pageSize: 20,
        sortField: 'id',
        sortOrder: 'descend'
      },
      searchData: ''
    }
  },
  methods: {
    getDepartment (e) {
      this.searchData = e
      this.page.pageNo = 1
      this.scrollStats = true
      if (e) {
        this.lastFetchId += 1
        const fetchId = this.lastFetchId
        this.fetching = true
        this.axios({
          url: 'admin/Api/departmentSearch',
          params: Object.assign(this.page, { name: e })
        }).then(res => {
          if (fetchId !== this.lastFetchId) {
            return
          }
          this.department = res.result.data
          this.fetching = false
        })
      } else {
        this.department = []
      }
    },
    getDepartmentScroll () {
      this.axios({
        url: 'admin/Api/departmentSearch',
        params: Object.assign(this.page, { name: this.searchData })
      }).then(res => {
        if (!res.result.data.length) {
          this.scrollStats = false
        }
        this.department = [...this.department, ...res.result.data]
      })
    },
    popupScroll (e) {
      const scrollTop = e.target.scrollTop
      const scrollHeight = e.target.scrollHeight
      const clientHeight = e.target.clientHeight
      const scrollBottom = scrollHeight - clientHeight - scrollTop
      if (scrollBottom < 1 && this.scrollStats && this.searchData) {
        this.page.pageNo++
        this.getDepartmentScroll()
      }
    }
  }
}
</script>
