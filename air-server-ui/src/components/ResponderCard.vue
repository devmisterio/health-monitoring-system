<template>
  <div
    class="responder-card"
    :class="{ 'healthy': responder.status === 'healthy', 'offline': responder.status === 'offline' }"
  >
    <div class="responder-header">
      <div class="responder-id">{{ responder.id.substring(0, 8) }}...</div>
      <div class="status-badge" :class="responder.status">
        {{ responder.status === 'healthy' ? '🟢' : '🔴' }} {{ responder.status.toUpperCase() }}
      </div>
    </div>

    <div class="responder-details">
      <div class="detail">
        <strong>IP Address:</strong> {{ responder.ipAddress }}
      </div>
      <div class="detail">
        <strong>OS:</strong> {{ responder.os }}
      </div>
      <div class="detail">
        <strong>Last Seen:</strong> {{ formatLastSeen(responder.lastSeen) }}
      </div>
      <div class="detail">
        <strong>Registered:</strong> {{ formatDate(responder.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponderCard',
  props: {
    responder: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatLastSeen(timestamp) {
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
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString()
    }
  }
}
</script>

<style scoped>
.responder-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-left: 4px solid #e1e8ed;
  transition: transform 0.2s, box-shadow 0.2s;
}

.responder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.responder-card.healthy {
  border-left-color: #27ae60;
}

.responder-card.offline {
  border-left-color: #e74c3c;
}

.responder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.responder-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.healthy {
  background: #d5f4e6;
  color: #27ae60;
}

.status-badge.offline {
  background: #ffeaa7;
  color: #e17055;
}

.responder-details {
  margin-bottom: 15px;
}

.detail {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.detail strong {
  color: #2c3e50;
  min-width: 100px;
  display: inline-block;
}
</style>