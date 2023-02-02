<template>
  <component :is="coms" :config="config" @ok="getValue" :ref="config.ref"/>
</template>
<script>
export default {
  data () {
    return {
      config: {},
      coms: ''
    }
  },
  methods: {
    show (config) {
      this.config = config
      this.coms = () => import('@/views/' + config.coms)
    },
    getValue (val) {
      this.$emit('ok', val)
    }
  }
}
</script>
