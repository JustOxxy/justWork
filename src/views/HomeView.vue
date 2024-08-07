<template>
  <div class="app-wrapper">
    <TimerControl />
    <TimerList />
  </div>
</template>

<script>
import TimerControl from '../components/TimerControl.vue'
import TimerList from '../components/TimerList.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    TimerControl,
    TimerList
  },
  methods: {
    ...mapActions(['fetchTimers', 'fetchCurrentTimers'])
  },
  created() {
    this.fetchTimers()
    this.fetchCurrentTimers()
  }
}
</script>

<style lang="css">
.app-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}
</style>
