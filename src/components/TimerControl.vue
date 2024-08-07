<template>
  <div class="time-control-wrapper">
    <div>
      <h3 class="header">Timer Control</h3>
      <div class="control-wrapper">
        <input v-model="description" placeholder="Description" />
        <button @click="startTimer">Start</button>
        <input
          type="number"
          v-model="timeout"
          placeholder="Timeout in minutes"
          @change="updateTimeout"
        />
      </div>
    </div>

    <!-- List of timers grouped by day -->
    <div v-if="Object.keys(groupedTimers).length">
      <h3 class="header">Active Timers</h3>
      <div v-for="(timers, date) in groupedTimers" :key="date" class="group-wrapper">
        <h4 class="group-title">{{ formatDate(date) }}</h4>
        <ol class="timer-group">
          <li v-for="timer in timers" :key="timer.id" class="timer">
            <div>
              <span v-if="timer.description">{{ timer.description }} - </span>
              <span>{{ formatTime(timer) }}</span>
            </div>
            <div class="timer-controls-wrapper">
              <button @click="pauseTimer(timer.id)" v-if="timer.running">Pause</button>
              <button @click="resumeTimer(timer.id)" v-if="!timer.running">Resume</button>
              <button @click="stopTimer(timer.id)">Stop</button>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      description: '',
      intervalIds: {},
      timeout: this.defaultTimeout / 60000,
      selectedTimerId: null
    }
  },
  computed: {
    ...mapState(['currentTimers', 'defaultTimeout']),
    groupedTimers() {
      const groups = {}

      this.currentTimers.forEach((timer) => {
        const date = new Date(timer.start).toISOString().split('T')[0] // Формат YYYY-MM-DD
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(timer)
      })

      return groups
    }
  },
  methods: {
    ...mapActions([
      'addCurrentTimer',
      'updateCurrentTimer',
      'removeCurrentTimer',
      'addTimer',
      'persistCurrentTimer'
    ]),

    async startTimer() {
      const start = Date.now()
      const timer = {
        id: Date.now().toString(),
        start,
        description: this.description,
        running: true,
        duration: 0,
        end: 0,
        timeout: this.timeout
      }

      await this.addCurrentTimer(timer)

      if (this.intervalIds[timer.id]) {
        return
      }

      // Set an interval for this timer
      this.intervalIds[timer.id] = setInterval(() => {
        const updatedTimer = this.currentTimers.find((t) => t.start === timer.start)
        if (updatedTimer && updatedTimer.running) {
          const updatedDuration = Date.now() - updatedTimer.start
          this.updateCurrentTimer({ ...updatedTimer, duration: updatedDuration })

          if (updatedDuration >= updatedTimer.timeout * 60000) {
            this.stopTimer(updatedTimer.id)
          }
        }
      }, 1000)
    },
    pauseTimer(timerId) {
      if (this.intervalIds[timerId]) {
        clearInterval(this.intervalIds[timerId])
        delete this.intervalIds[timerId]
      }
      // Update the timer state to paused
      const timer = this.currentTimers.find((t) => t.id === timerId)
      if (timer) {
        this.updateCurrentTimer({ ...timer, running: false, end: Date.now() })
        this.persistCurrentTimer(timerId)
      }
    },
    async resumeTimer(timerId) {
      const timer = this.currentTimers.find((t) => t.id === timerId)
      if (timer) {
        const pausedDuration = timer.end - timer.start

        const now = Date.now()

        this.updateCurrentTimer({
          ...timer,
          running: true,
          start: now - pausedDuration,
          end: 0
        })

        await this.persistCurrentTimer(timerId)

        if (this.intervalIds[timerId]) {
          clearInterval(this.intervalIds[timerId])
        }

        this.intervalIds[timerId] = setInterval(() => {
          const updatedTimer = this.currentTimers.find((t) => t.id === timerId)
          if (updatedTimer && updatedTimer.running) {
            const updatedDuration = Date.now() - updatedTimer.start
            this.updateCurrentTimer({
              ...updatedTimer,
              duration: updatedDuration,
              start: updatedTimer.start
            })
            if (updatedDuration >= updatedTimer.timeout * 60000) {
              this.stopTimer(updatedTimer.id)
            }
          }
        }, 1000)
      }
    },
    async stopTimer(timerId) {
      if (this.intervalIds[timerId]) {
        clearInterval(this.intervalIds[timerId])
        delete this.intervalIds[timerId]
      }

      const timer = this.currentTimers.find((t) => t.id === timerId)
      if (timer) {
        const updatedTimer = { ...timer, running: false, end: Date.now() }
        this.updateCurrentTimer(updatedTimer)
        this.removeCurrentTimer(timerId)
        this.addTimer(updatedTimer)
      }
    },
    updateTimeout() {
      this.$store.commit('SET_TIMEOUT', this.timeout * 60000)
    },
    formatTime(timer) {
      let elapsed = timer.running ? Date.now() - timer.start : timer.duration

      const seconds = Math.floor(elapsed / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    },

    formatDate(date) {
      const [year, month, day] = date.split('-')
      return `${day}/${month}/${year}`
    }
  },
  async created() {
    await this.$store.dispatch('fetchCurrentTimers')
    this.timeout = this.defaultTimeout / 60000

    this.currentTimers.forEach((timer) => {
      if (!timer.running) return

      this.intervalIds[timer.id] = setInterval(() => {
        const updatedTimer = this.currentTimers.find((t) => t.start === timer.start)
        if (updatedTimer) {
          const updatedDuration = Date.now() - updatedTimer.start
          this.updateCurrentTimer({ ...updatedTimer, duration: updatedDuration })
          if (updatedDuration >= this.timeout * 60000) {
            this.stopTimer(updatedTimer.id)
          }
        }
      }, 1000)
    })
  }
}
</script>

<style lang="css">
.header {
  font-size: 24px;
  font-weight: 500;
}

.control-wrapper {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.time-control-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timer-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timer {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
}

.timer-controls-wrapper {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
}

.group-wrapper {
  margin-bottom: 16px;
}

.group-wrapper:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 18px;
  font-weight: 500;
}
</style>
