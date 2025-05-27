<template>
  <div id="app">
    <DashboardHeader :stats="stats" />

    <main class="main">
      <div class="container">
        <div class="controls">
          <button @click="refreshData" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Refreshing...' : '🔄 Refresh' }}
          </button>
          <div class="info">
            <span class="update-info">Updates every 45 seconds</span>
          </div>
        </div>

        <div class="responders-section">
          <h2>Registered Endpoints ({{ pagination.total || responders.length }})</h2>

          <div v-if="loading && responders.length === 0" class="loading">
            Loading responders...
          </div>

          <div v-else-if="responders.length === 0" class="empty">
            No responders registered yet.
          </div>

          <div v-else>
            <div v-if="pagination.total > pagination.limit" class="pagination-controls">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1 || loading"
                class="btn btn-secondary"
              >
                ← Previous
              </button>

              <span class="page-info">
                Page {{ pagination.page }} of {{ Math.ceil(pagination.total / pagination.limit) }}
                ({{ pagination.total }} total)
              </span>

              <button
                @click="changePage(pagination.page + 1)"
                :disabled="!pagination.hasMore || loading"
                class="btn btn-secondary"
              >
                Next →
              </button>
            </div>

            <div class="responders-grid">
              <ResponderCard
                v-for="responder in responders"
                :key="responder.id"
                :responder="responder"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="message" class="notification" :class="message.type">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import DashboardHeader from './components/DashboardHeader.vue'
import ResponderCard from './components/ResponderCard.vue'

export default {
  name: 'App',
  components: {
    DashboardHeader,
    ResponderCard
  },
  setup() {
    const responders = ref([])
    const stats = ref({
      totalResponders: 0,
      healthyCount: 0,
      offlineCount: 0
    })
    const loading = ref(false)
    const message = ref(null)
    const pagination = ref({
      page: 1,
      limit: 50,
      total: 0,
      hasMore: false
    })

    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

    let refreshInterval = null

    const showMessage = (text, type = 'info') => {
      message.value = { text, type }
      setTimeout(() => {
        message.value = null
      }, 3000)
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/admin/stats`)
        stats.value.totalResponders = response.data.totalResponders
        stats.value.healthyCount = response.data.healthyResponders
        stats.value.offlineCount = response.data.offlineResponders
      } catch (error) {
        console.warn('Failed to fetch admin stats, using local calculation:', error)
        calculateStatsLocally()
      }
    }

    const calculateStatsLocally = (respondersData) => {
      const data = respondersData || responders.value
      stats.value.totalResponders = pagination.value.total || data.length
      stats.value.healthyCount = data.filter(responder => responder.status === 'healthy').length
      stats.value.offlineCount = data.filter(responder => responder.status === 'offline').length
    }

    const fetchResponders = async (usePagination = false) => {
      try {
        loading.value = true

        let url = `${API_BASE}/api/responders`
        if (usePagination) {
          url += `?page=${pagination.value.page}&limit=${pagination.value.limit}`
        }

        const response = await axios.get(url)

        if (response.data.responders) {
          responders.value = response.data.responders
          pagination.value.total = response.data.total
          pagination.value.hasMore = response.data.hasMore
        } else {
          responders.value = response.data
          pagination.value.total = response.data.length
          calculateStatsLocally(response.data)
        }
      } catch (error) {
        if (error.response?.status === 429) {
          showMessage('Rate limited - please wait before refreshing', 'error')
        } else {
          showMessage('Failed to fetch responders', 'error')
        }
      } finally {
        loading.value = false
      }
    }

    const changePage = (newPage) => {
      if (newPage >= 1 && (pagination.value.hasMore || newPage < pagination.value.page)) {
        pagination.value.page = newPage
        fetchResponders(true)
      }
    }

    const refreshData = () => {
      const usePagination = pagination.value.total > pagination.value.limit
      fetchResponders(usePagination)
      fetchStats()
    }

    const formatLastSeen = (timestamp) => {
      const now = new Date()
      const lastSeen = new Date(timestamp)
      const diffMs = now - lastSeen
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)

      if (diffSeconds < 60) {
        return `${diffSeconds}s ago`
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`
      } else {
        return lastSeen.toLocaleString()
      }
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    onMounted(() => {
      fetchResponders(true)
      fetchStats()
      refreshInterval = setInterval(() => {
        refreshData()
      }, 45000)
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      responders,
      stats,
      loading,
      message,
      pagination,
      refreshData,
      changePage,
      formatLastSeen,
      formatDate
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}


.main {
  padding: 30px 0;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
}

.info {
  margin-left: auto;
}

.update-info {
  color: #7f8c8d;
  font-size: 14px;
  font-style: italic;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.page-info {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}


.responders-section h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.responders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .responders-grid {
    grid-template-columns: 1fr;
  }
}
</style>
