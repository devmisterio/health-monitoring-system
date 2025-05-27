<template>
  <header class="header">
    <div class="container">
      <h1>AIR Server Dashboard</h1>
      <div class="stats">
        <div class="stat">
          <span class="label">Total Responders:</span>
          <span class="value">{{ stats.totalResponders }}</span>
        </div>
        <div class="stat">
          <span class="label">Healthy:</span>
          <span class="value healthy">{{ stats.healthyCount }}</span>
        </div>
        <div class="stat">
          <span class="label">Offline:</span>
          <span class="value offline">{{ stats.offlineCount }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    stats: {
      type: Object,
      required: true
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

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header h1 {
  margin-bottom: 15px;
  font-size: 2rem;
}

.stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat .label {
  font-weight: 500;
  opacity: 0.9;
}

.stat .value {
  font-weight: 700;
  font-size: 1.1rem;
}

.value.healthy {
  color: #27ae60;
}

.value.offline {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .stats {
    justify-content: center;
  }
}
</style>