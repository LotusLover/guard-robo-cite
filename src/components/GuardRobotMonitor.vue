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
        <button 
          class="sound-toggle-btn"
          @click="toggleSound"
          :title="isSoundMuted ? '通知音をオンにする' : '通知音をオフにする'"
        >
          {{ isSoundMuted ? '🔇' : '🔊' }}
        </button>
      </div>
    </header>

    <!-- タブナビゲーション -->
    <nav class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id, 'has-badge': tab.badge > 0 }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.badge > 0" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </nav>

    <main class="monitor-content">
      <!-- アクティブアラートタブ -->
      <section v-show="activeTab === 'active-alerts'" class="tab-panel">
        <h2>🔴 アクティブアラート</h2>
        
        <!-- フィルター機能 -->
        <div class="alert-filters">
          <select v-model="severityFilter" class="filter-select">
            <option value="">すべての緊急度</option>
            <option value="critical">緊急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select v-model="typeFilter" class="filter-select">
            <option value="">すべてのタイプ</option>
            <option value="motion">動体検知</option>
            <option value="sound">音声検知</option>
            <option value="breach">侵入検知</option>
            <option value="system">システム</option>
          </select>
          <button @click="clearFilters" class="clear-filter-btn">フィルタークリア</button>
        </div>
        
        <div v-if="filteredActiveAlerts.length === 0" class="empty-state">
          <p>{{ severityFilter || typeFilter ? 'フィルター条件に一致するアラートはありません' : 'アクティブなアラートはありません' }}</p>
        </div>
        <div v-else class="alerts-list">
          <div 
            v-for="alert in filteredActiveAlerts" 
            :key="alert.id"
            class="alert-card active-alert"
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
              <div class="alert-info">
                <span class="alert-severity">{{ getSeverityText(alert.severity) }}</span>
                <span class="alert-status">{{ getStatusText(alert.status) }}</span>
              </div>
              <div class="alert-actions">
                <button 
                  v-if="alert.status === 'active'"
                  class="action-btn acknowledge-btn"
                  @click="acknowledgeAlert(alert.id)"
                  title="確認済みにする"
                >
                  ✓ 確認
                </button>
                <button 
                  class="action-btn resolve-btn"
                  @click="resolveAlert(alert.id)"
                  :title="alert.status === 'active' ? '解決済みにする' : 'アーカイブに移動'"
                >
                  {{ alert.status === 'active' ? '✔ 解決' : '📁 アーカイブ' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- アーカイブタブ -->
      <section v-show="activeTab === 'archive'" class="tab-panel">
        <h2>📋 アラート履歴</h2>
        
        <div class="archive-controls">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="場所や説明で検索..." 
            class="search-input"
            @input="currentPage = 1"
          >
          <select v-model="archiveSortOrder" class="filter-select">
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="severity">緊急度順</option>
          </select>
        </div>
        
        <div v-if="paginatedHistoryAlerts.length === 0" class="empty-state">
          <p>{{ searchQuery ? '検索結果が見つかりません' : '解決済みのアラートはありません' }}</p>
        </div>
        <div v-else class="alerts-list">
          <div 
            v-for="alert in paginatedHistoryAlerts" 
            :key="alert.id"
            class="alert-card history-alert"
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
        
        <!-- ページネーション -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ← 前へ
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            次へ →
          </button>
        </div>
      </section>

      <!-- ロボット状態タブ -->
      <section v-show="activeTab === 'robots'" class="tab-panel">
        <h2>🛡️ ロボット状態</h2>
        
        <!-- 地図ビュー -->
        <MapView :alerts="alerts" :robots="robots" />
        
        <!-- ローディング中のスケルトン -->
        <div v-if="isLoading" class="robots-grid">
          <div v-for="i in SKELETON.ROBOT_CARDS_COUNT" :key="`skeleton-robot-${i}`" class="robot-card skeleton">
            <div class="skeleton-header">
              <div class="skeleton-text skeleton-title"></div>
              <div class="skeleton-badge"></div>
            </div>
            <div class="skeleton-details">
              <div class="skeleton-text"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text"></div>
            </div>
          </div>
        </div>
        <!-- データ読み込み後 -->
        <div v-else class="robots-grid">
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

      <!-- 統計ダッシュボードタブ -->
      <section v-show="activeTab === 'dashboard'" class="tab-panel">
        <h2>📊 統計ダッシュボード</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ totalAlertsToday }}</div>
            <div class="stat-label">今日のアラート</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ averageResponseTime }}</div>
            <div class="stat-label">平均対応時間</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ onlineRobots }}/{{ totalRobots }}</div>
            <div class="stat-label">稼働中ロボット</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ criticalAlertsCount }}</div>
            <div class="stat-label">緊急アラート</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { GuardRobotAlert, GuardRobotStatus } from '../types/guard-robot'
import { guardRobotService } from '../services/guard-robot-service'
import { soundManager } from '../utils/sound-manager'
import { hasSignificantChange } from '../utils/diff-detector'
import { TIMING, BATTERY, HEARTBEAT, SKELETON, PAGINATION, TABS } from '../config/constants'
import MapView from './MapView.vue'

// タブ管理
const activeTab = ref<'active-alerts' | 'archive' | 'robots' | 'dashboard'>(TABS.DEFAULT_TAB)

// リアクティブデータ
const robots = ref<GuardRobotStatus[]>([])
const alerts = ref<GuardRobotAlert[]>([])
const networkStatus = ref({ isOnline: true, lastUpdated: Date.now() })
const isSoundMuted = ref(false)
const previousAlertCount = ref(0)
const isLoading = ref(true)
const isInitialLoad = ref(true)
const previousRobotStates = ref<Map<string, GuardRobotStatus>>(new Map())
const previousAlertIds = ref<Set<string>>(new Set())

// フィルター・検索
const severityFilter = ref<string>('')
const typeFilter = ref<string>('')
const searchQuery = ref<string>('')
const archiveSortOrder = ref<'newest' | 'oldest' | 'severity'>('newest')

// ページネーション
const currentPage = ref(1)
const itemsPerPage = PAGINATION.ITEMS_PER_PAGE

// 計算プロパティ
const totalRobots = computed(() => robots.value.length)
const onlineRobots = computed(() => robots.value.filter(r => r.isOnline).length)
const activeAlerts = computed(() => alerts.value.filter(a => a.status === 'active' || a.status === 'acknowledged').length)

// タブ設定
const tabs = computed(() => [
  { 
    id: 'active-alerts', 
    label: 'アクティブ', 
    icon: '🔴', 
    badge: activeAlerts.value 
  },
  { 
    id: 'archive', 
    label: 'アーカイブ', 
    icon: '📋', 
    badge: 0 
  },
  { 
    id: 'robots', 
    label: 'ロボット', 
    icon: '🤖', 
    badge: totalRobots.value - onlineRobots.value 
  },
  { 
    id: 'dashboard', 
    label: '統計', 
    icon: '📊', 
    badge: 0 
  },
])

// フィルター済みアクティブアラート
const filteredActiveAlerts = computed(() => {
  let filtered = activeAlertsList.value
  
  if (severityFilter.value) {
    filtered = filtered.filter(a => a.severity === severityFilter.value)
  }
  
  if (typeFilter.value) {
    filtered = filtered.filter(a => a.type === typeFilter.value)
  }
  
  return filtered
})

// ソート済み履歴
const sortedHistoryAlerts = computed(() => {
  let sorted = [...historyAlertsList.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    sorted = sorted.filter(a => 
      a.description.toLowerCase().includes(query) ||
      a.location.toLowerCase().includes(query)
    )
  }
  
  if (archiveSortOrder.value === 'newest') {
    sorted.sort((a, b) => b.timestamp - a.timestamp)
  } else if (archiveSortOrder.value === 'oldest') {
    sorted.sort((a, b) => a.timestamp - b.timestamp)
  } else if (archiveSortOrder.value === 'severity') {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    sorted.sort((a, b) => 
      (severityOrder[a.severity as keyof typeof severityOrder] || 999) - 
      (severityOrder[b.severity as keyof typeof severityOrder] || 999)
    )
  }
  
  return sorted
})

// ページネーション済み履歴
const paginatedHistoryAlerts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedHistoryAlerts.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(sortedHistoryAlerts.value.length / itemsPerPage)
)

// 統計データ
const totalAlertsToday = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0)
  return alerts.value.filter(a => a.timestamp >= today).length
})

const criticalAlertsCount = computed(() => 
  alerts.value.filter(a => a.severity === 'critical' && a.status !== 'resolved').length
)

const averageResponseTime = computed(() => {
  return '15分' // プレースホルダー
})
const activeAlertsList = computed(() => 
  [...alerts.value]
    .filter(a => a.status === 'active' || a.status === 'acknowledged')
    .sort((a, b) => {
      // 緊急度順でソート（critical -> high -> medium -> low）
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 999) - 
                          (severityOrder[b.severity as keyof typeof severityOrder] || 999)
      if (severityDiff !== 0) return severityDiff
      // 同じ緊急度の場合は新しい順
      return b.timestamp - a.timestamp
    })
)
const historyAlertsList = computed(() => 
  [...alerts.value]
    .filter(a => a.status === 'resolved')
    .sort((a, b) => b.timestamp - a.timestamp)
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

// フィルタークリア
const clearFilters = () => {
  severityFilter.value = ''
  typeFilter.value = ''
}

// 音声ミュート切り替え
const toggleSound = () => {
  isSoundMuted.value = soundManager.toggleMute()
}

// アラート状態を更新（確認済みに）
const acknowledgeAlert = async (alertId: string) => {
  try {
    await guardRobotService.acknowledgeAlert(alertId)
    console.log(`✅ アラートを確認済みにしました: ${alertId}`)
    soundManager.playOperationSuccess()
  } catch (error) {
    console.error('❌ アラート確認処理エラー:', error)
    soundManager.playOperationError()
  }
}

// アラート状態を更新（解決済み/アーカイブに）
const resolveAlert = async (alertId: string) => {
  try {
    await guardRobotService.resolveAlert(alertId)
    console.log(`✅ アラートを解決済みにしました: ${alertId}`)
    soundManager.playOperationSuccess()
  } catch (error) {
    console.error('❌ アラート解決処理エラー:', error)
    soundManager.playOperationError()
  }
}

// アラートの変化を監視して通知音を再生（改善版：IDベース）
watch(() => alerts.value, (newAlerts) => {
  const newIds = new Set(newAlerts.map(a => a.id))
  
  // 新規追加されたアラートを検出
  newAlerts.forEach(alert => {
    if (!previousAlertIds.value.has(alert.id) && alert.status === 'active') {
      console.log(`🔔 新しいアラート検知: ${alert.description}`)
      if (!isSoundMuted.value) {
        soundManager.playAlertSound(alert.severity)
      }
    }
  })
  
  previousAlertIds.value = newIds
}, { deep: true })

// ライフサイクル
onMounted(async () => {
  console.log('🚀 GuardRobotMonitor コンポーネントを初期化中...')
  isLoading.value = true
  
  try {
    // サービスからのリアルタイム更新を監視
    unsubscribeAlerts = guardRobotService.onAlertsChange((newAlerts) => {
      alerts.value = newAlerts
      console.log(`📡 アラート更新: ${newAlerts.length}件`)
      
      // 初回データ取得完了
      if (isInitialLoad.value && newAlerts.length > 0) {
        isInitialLoad.value = false
        isLoading.value = false
      }
    })
    
    unsubscribeRobots = guardRobotService.onRobotsChange((newRobots) => {
      robots.value = newRobots
      console.log(`🤖 ロボット更新: ${newRobots.length}台`)
      
      // 初回データ取得完了
      if (isInitialLoad.value && newRobots.length > 0) {
        isInitialLoad.value = false
        isLoading.value = false
      }
    })
    
    // タイムアウト保護（データが取得できない場合）
    setTimeout(() => {
      if (isLoading.value) {
        console.warn('⚠️ データ取得タイムアウト')
        isLoading.value = false
      }
    }, TIMING.DATA_LOADING_TIMEOUT)
    
    // システム起動音を再生
    setTimeout(() => {
      if (!isSoundMuted.value) {
        soundManager.playSystemStart()
      }
    }, TIMING.SYSTEM_START_SOUND_DELAY)
    
  } catch (error) {
    console.error('❌ 初期化エラー:', error)
    isLoading.value = false
  }

  // ネットワーク状態の定期チェック
  const networkCheckInterval = setInterval(() => {
    networkStatus.value = guardRobotService.getNetworkStatus()
  }, TIMING.NETWORK_STATUS_CHECK_INTERVAL)

  // 定期的にロボットの状態を更新（差分のみ）
  const updateInterval = setInterval(() => {
    robots.value.forEach(robot => {
      if (robot.isOnline && networkStatus.value.isOnline) {
        // 新しい値を計算
        const newBatteryLevel = Math.max(
          BATTERY.MIN_LEVEL,
          robot.batteryLevel - Math.random() * BATTERY.MAX_DECREASE_RATE
        )
        const newHeartbeat = Date.now() - Math.random() * HEARTBEAT.RANDOM_RANGE
        
        // 前回の状態と比較
        const previousState = previousRobotStates.value.get(robot.id)
        
        // 差分があるフィールドのみ更新
        const fieldsToUpdate: Partial<Omit<GuardRobotStatus, 'id'>> = {}
        
        // バッテリーレベルの変化が閾値以上の場合のみ更新
        if (!previousState || hasSignificantChange(
          previousState.batteryLevel, 
          newBatteryLevel, 
          BATTERY.SIGNIFICANT_CHANGE_THRESHOLD
        )) {
          fieldsToUpdate.batteryLevel = newBatteryLevel
        }
        
        // ハートビートは一定間隔で更新
        if (!previousState || newHeartbeat - previousState.lastHeartbeat > HEARTBEAT.MIN_UPDATE_INTERVAL) {
          fieldsToUpdate.lastHeartbeat = newHeartbeat
        }
        
        // 更新対象がある場合のみFirebaseに書き込み
        if (Object.keys(fieldsToUpdate).length > 0) {
          guardRobotService.updateRobotFields(robot.id, fieldsToUpdate)
            .then(() => {
              // 成功したら前回状態を更新
              previousRobotStates.value.set(robot.id, {
                ...robot,
                ...fieldsToUpdate
              })
            })
            .catch((error) => {
              console.warn(`⚠️ ロボット${robot.id}の状態更新エラー:`, error)
            })
        } else {
          console.log(`⏭️ ロボット${robot.id}: 更新なし（差分なし）`)
        }
      }
    })
  }, TIMING.ROBOT_STATUS_UPDATE_INTERVAL)

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
  align-items: center;
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

.sound-toggle-btn {
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sound-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.sound-toggle-btn:active {
  transform: scale(0.95);
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

/* アクティブアラートセクション */
.active-alerts-section {
  background: rgba(244, 67, 54, 0.08);
  border: 2px solid rgba(244, 67, 54, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.active-alerts-section h2 {
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
}

/* 履歴アラートセクション */
.history-alerts-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.history-alerts-section h2 {
  color: rgba(255, 255, 255, 0.7);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
  font-size: 1.1rem;
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

/* スケルトンスクリーン */
.robot-card.skeleton {
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.skeleton-text {
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  width: 60%;
  height: 20px;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.skeleton-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-details .skeleton-text {
  width: 100%;
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
  transition: all 0.3s ease;
}

/* アクティブアラートのスタイル */
.alert-card.active-alert {
  border-width: 2px;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
  animation: pulse-alert 2s infinite;
}

@keyframes pulse-alert {
  0%, 100% {
    box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(244, 67, 54, 0.4);
  }
}

/* 履歴アラートのスタイル */
.alert-card.history-alert {
  opacity: 0.7;
}

.alert-card.history-alert:hover {
  opacity: 0.9;
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
  gap: 1rem;
  flex-wrap: wrap;
}

.alert-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

/* アクションボタンのスタイル */
.alert-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.acknowledge-btn {
  background: rgba(76, 175, 80, 0.3);
  color: #81c784;
}

.acknowledge-btn:hover {
  background: rgba(76, 175, 80, 0.5);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.acknowledge-btn:active {
  transform: translateY(0);
}

.resolve-btn {
  background: rgba(244, 67, 54, 0.3);
  color: #ef5350;
}

.resolve-btn:hover {
  background: rgba(244, 67, 54, 0.5);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.resolve-btn:active {
  transform: translateY(0);
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
  
  .alert-info {
    width: 100%;
  }
  
  .alert-actions {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
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
  
  .action-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}

/* タブナビゲーション */
.tab-navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.tab-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: translateY(-2px);
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #764ba2;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.tab-button.has-badge.active {
  animation: tab-pulse 2s infinite;
}

@keyframes tab-pulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 4px 25px rgba(244, 67, 54, 0.6);
  }
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f44336;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.5);
  animation: badge-bounce 0.5s ease;
}

@keyframes badge-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* タブパネル */
.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* フィルター */
.alert-filters, .archive-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-select, .search-input {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.filter-select:focus, .search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
}

.filter-select option {
  background: #2a5298;
  color: white;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-filter-btn {
  padding: 0.6rem 1rem;
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filter-btn:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: translateY(-2px);
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.page-info {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

/* 統計ダッシュボード */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* レスポンシブ対応（タブ） */
@media (max-width: 768px) {
  .tab-navigation {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
  
  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .tab-label {
    display: none; /* モバイルではアイコンのみ */
  }
  
  .alert-filters, .archive-controls {
    flex-direction: column;
  }
  
  .filter-select, .search-input {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>