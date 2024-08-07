import { createStore } from 'vuex'
import axios from 'axios'

const API_URL = 'https://66b2011c1ca8ad33d4f6173f.mockapi.io'
const DEFAULT_TIMEOUT = parseInt(import.meta.env.VITE_APP_DEFAULT_TIMEOUT || '') * 60000 || 360000 // 60 minutes in milliseconds

export default createStore({
  state: {
    timers: [],
    currentTimers: [],
    defaultTimeout: DEFAULT_TIMEOUT
  },
  mutations: {
    ADD_TIMER(state, timer) {
      state.timers.push(timer)
    },
    UPDATE_TIMER(state, timer) {
      const index = state.timers.findIndex((t) => t.start === timer.start)
      if (index !== -1) state.timers.splice(index, 1, timer)
    },
    ADD_CURRENT_TIMER(state, { timer }) {
      state.currentTimers.push(timer)
    },
    UPDATE_CURRENT_TIMER(state, { timer }) {
      const index = state.currentTimers.findIndex((t) => t.id === timer.id)
      if (index !== -1) state.currentTimers.splice(index, 1, timer)
    },
    REMOVE_CURRENT_TIMER(state, id) {
      state.currentTimers = state.currentTimers.filter((t) => t.id !== id)
    },
    SET_TIMEOUT(state, timeout) {
      state.timeout = timeout
    },
    SET_TIMERS(state, timers) {
      state.timers = timers
    },
    SET_CURRENT_TIMERS(state, timers) {
      state.currentTimers = timers
    }
  },
  actions: {
    async fetchTimers({ commit }) {
      const response = await axios.get(`${API_URL}/timers`)
      commit('SET_TIMERS', response.data)
    },
    async fetchCurrentTimers({ commit }) {
      const response = await axios.get(`${API_URL}/currentTimers`)
      commit('SET_CURRENT_TIMERS', response.data)
    },
    async addTimer({ commit }, timer) {
      await axios.post(`${API_URL}/timers`, timer)
      commit('ADD_TIMER', timer)
    },
    async addCurrentTimer({ commit }, timer) {
      const response = await axios.post(`${API_URL}/currentTimers`, timer)
      commit('ADD_CURRENT_TIMER', { id: timer.id, timer: response.data })
    },
    async removeCurrentTimer({ commit }, id) {
      await axios.delete(`${API_URL}/currentTimers/${id}`)
      commit('REMOVE_CURRENT_TIMER', id)
    },
    updateCurrentTimer({ commit }, timer) {
      commit('UPDATE_CURRENT_TIMER', { timer })
    },
    async persistCurrentTimer({ state }, timerId) {
      try {
        const updatedTimer = state.currentTimers.find((t) => t.id === timerId)
        if (updatedTimer) {
          await axios.put(`${API_URL}/currentTimers/${timerId}`, updatedTimer)
        }
      } catch (error) {
        console.error('Failed to persist timers', error)
      }
    }
  }
})
