<template>
  <div class="guard-robot-monitor">
    <header class="monitor-header">
      <h1>🤖 警備ロボット監視システム</h1>
      <div class="status-summary">
        <div class="status-item">
          <span class="status-label">オンライン:</span>
          <span class="status-value">{{ onlineRobots }}/{{ totalRobots }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">アクティブアラート:</span>
          <span class="status-value alert-count">{{ activeAlerts }}</span>
        </div>
        <div class="status-item" :class="{ offline: !networkStatus.isOnline }">
          <span class="status-label">接続状態:</span>
          <span class="status-value">{{ networkStatus.isOnline ? 'オンライン' : 'オフライン' }}</span>
        </div>
      </div>
    </header>

    <main class="monitor-content">
      <!-- ロボット状態一覧 -->
      <section class="robots-section">
        <h2>🛡️ ロボット状態</h2>
        <div class="robots-grid">
          <div 
            v-for="robot in robots" 
            :key="robot.id"
            class="robot-card"
            :class="{ offline: !robot.isOnline }"
          >
            <div class="robot-header">
              <h3>{{ robot.name }}</h3>
              <span class="robot-status" :class="robot.isOnline ? 'online' : 'offline'">
                {{ robot.isOnline ? 'オンライン' : 'オフライン' }}
              </span>
            </div>
            <div class="robot-details">
              <div class="detail-item">
                <span>📍 場所:</span>
                <span>{{ robot.location }}</span>
              </div>
              <div class="detail-item">
                <span>🔋 バッテリー:</span>
                <span>{{ robot.batteryLevel }}%</span>
              </div>
              <div class="detail-item">
                <span>⏰ 最終通信:</span>
                <span>{{ formatTime(robot.lastHeartbeat) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- アラート一覧 -->
      <section class="alerts-section">
        <h2>⚠️ アラート履歴</h2>
        <div class="alerts-list">
          <div 
            v-for="alert in sortedAlerts" 
            :key="alert.id"
            class="alert-card"
            :class="[`severity-${alert.severity}`, `status-${alert.status}`]"
          >
            <div class="alert-header">
              <div class="alert-type">
                {{ getAlertIcon(alert.type) }} {{ getAlertTypeText(alert.type) }}
              </div>
              <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
            </div>
            <div class="alert-body">
              <div class="alert-location">📍 {{ alert.location }}</div>
              <div class="alert-description">{{ alert.description }}</div>
            </div>
            <div class="alert-footer">
              <span class="alert-severity">{{ getSeverityText(alert.severity) }}</span>
              <span class="alert-status">{{ getStatusText(alert.status) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { GuardRobotAlert, GuardRobotStatus } from '../types/guard-robot'
import { guardRobotService } from '../services/guard-robot-service'

// リアクティブデータ
const robots = ref<GuardRobotStatus[]>([])
const alerts = ref<GuardRobotAlert[]>([])
const networkStatus = ref({ isOnline: true, lastUpdated: Date.now() })

// 計算プロパティ
const totalRobots = computed(() => robots.value.length)
const onlineRobots = computed(() => robots.value.filter(r => r.isOnline).length)
const activeAlerts = computed(() => alerts.value.filter(a => a.status === 'active').length)
const sortedAlerts = computed(() => 
  [...alerts.value].sort((a, b) => b.timestamp - a.timestamp)
)

// サービスからのデータ更新を監視する変数
let unsubscribeAlerts: (() => void) | null = null
let unsubscribeRobots: (() => void) | null = null

// ヘルパー関数
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getAlertIcon = (type: string): string => {
  const icons = {
    motion: '👁️',
    sound: '🔊',
    breach: '🚨',
    system: '⚙️'
  }
  return icons[type as keyof typeof icons] || '❓'
}

const getAlertTypeText = (type: string): string => {
  const texts = {
    motion: '動体検知',
    sound: '音声検知',
    breach: '侵入検知',
    system: 'システム'
  }
  return texts[type as keyof typeof texts] || '不明'
}

const getSeverityText = (severity: string): string => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '緊急'
  }
  return texts[severity as keyof typeof texts] || '不明'
}

const getStatusText = (status: string): string => {
  const texts = {
    active: 'アクティブ',
    acknowledged: '確認済み',
    resolved: '解決済み'
  }
  return texts[status as keyof typeof texts] || '不明'
}

// ライフサイクル
onMounted(() => {
  console.log('🚀 GuardRobotMonitor コンポーネントを初期化中...')
  
  // サービスからのリアルタイム更新を監視
  unsubscribeAlerts = guardRobotService.onAlertsChange((newAlerts) => {
    alerts.value = newAlerts
    console.log(`📡 アラート更新: ${newAlerts.length}件`)
  })
  
  unsubscribeRobots = guardRobotService.onRobotsChange((newRobots) => {
    robots.value = newRobots
    console.log(`🤖 ロボット更新: ${newRobots.length}台`)
  })

  // ネットワーク状態の定期チェック
  const networkCheckInterval = setInterval(() => {
    networkStatus.value = guardRobotService.getNetworkStatus()
  }, 5000)

  // 定期的にロボットの状態を更新（リアルタイム感を演出）
  const updateInterval = setInterval(() => {
    robots.value.forEach(robot => {
      if (robot.isOnline && networkStatus.value.isOnline) {
        const updatedRobot = {
          ...robot,
          batteryLevel: Math.max(20, robot.batteryLevel - Math.random() * 2),
          lastHeartbeat: Date.now() - Math.random() * 60000
        }
        guardRobotService.updateRobotStatus(updatedRobot).catch((error) => {
          console.warn('⚠️ ロボット状態更新エラー:', error)
        })
      }
    })
  }, 10000)

  // 接続テストボタンの追加（開発用）
  if (import.meta.env.DEV) {
    console.log('🔧 開発モード: Firebase接続テストが利用可能です')
  }

  // クリーンアップ用に保存
  onUnmounted(() => {
    clearInterval(updateInterval)
    clearInterval(networkCheckInterval)
  })
})

onUnmounted(() => {
  // リスナーのクリーンアップ
  if (unsubscribeAlerts) unsubscribeAlerts()
  if (unsubscribeRobots) unsubscribeRobots()
})
</script>

<style scoped>
.guard-robot-monitor {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.monitor-header {
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.monitor-header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  text-align: center;
}

.status-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 120px;
}

.status-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-value {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0.25rem;
}

.alert-count {
  color: #ffeb3b;
}

.status-item.offline {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-item.offline .status-value {
  color: #f44336;
  font-weight: bold;
}

.monitor-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.robots-section, .alerts-section {
  margin-bottom: 3rem;
}

.robots-section h2, .alerts-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.robots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.robot-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;
}

.robot-card:hover {
  transform: translateY(-2px);
}

.robot-card.offline {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.3);
}

.robot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.robot-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.robot-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.robot-status.online {
  background: #4caf50;
}

.robot-status.offline {
  background: #f44336;
}

.robot-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.alert-card.severity-critical {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.alert-card.severity-high {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.alert-card.severity-medium {
  border-color: #ffeb3b;
  background: rgba(255, 235, 59, 0.1);
}

.alert-card.severity-low {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.alert-type {
  font-weight: bold;
  font-size: 1.1rem;
}

.alert-time {
  font-size: 0.9rem;
  opacity: 0.8;
}

.alert-body {
  margin-bottom: 1rem;
}

.alert-location {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.alert-description {
  font-size: 1rem;
}

.alert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.alert-severity {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.alert-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .monitor-header {
    padding: 1rem;
  }
  
  .monitor-header h1 {
    font-size: 1.5rem;
  }
  
  .status-summary {
    gap: 1rem;
  }
  
  .status-item {
    min-width: 100px;
    padding: 0.5rem;
  }
  
  .monitor-content {
    padding: 1rem;
  }
  
  .robots-grid {
    grid-template-columns: 1fr;
  }
  
  .alert-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .alert-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .robot-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>