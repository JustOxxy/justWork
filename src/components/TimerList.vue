<template>
  <div>
    <h3 class="header">Timer List</h3>
    <ol>
      <li v-for="timer in timers" :key="timer.id">
        {{ timer.description }} - {{ new Date(timer.start).toLocaleString() }} -
        {{ timer.end ? new Date(timer.end).toLocaleString() : '' }} -
        {{ formatTime(timer.end ? timer.end - timer.start : Date.now() - timer.start) }}
      </li>
    </ol>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['timers'])
  },
  methods: {
    ...mapActions(['fetchTimers']),

    formatTime(ms) {
      const seconds = Math.floor((ms / 1000) % 60)
      const minutes = Math.floor((ms / 60000) % 60)
      const hours = Math.floor((ms / 3600000) % 24)
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  },
  created() {
    this.fetchTimers()
  }
}
</script>

<style lang="css">
.header {
  font-size: 24px;
  font-weight: 500;
}
</style>
