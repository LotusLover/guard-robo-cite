<template>
  <div class="control-panel">
    <div class="panel-header">
      <h2>🎮 テストコントロールパネル</h2>
      <button 
        class="toggle-button"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? '▼ 閉じる' : '▶ 開く' }}
      </button>
    </div>

    <div v-show="isExpanded" class="panel-content">
      <!-- ダミーアラート送信 -->
      <section class="control-section">
        <h3>⚠️ ダミーアラート送信</h3>
        
        <div class="form-group">
          <label>アラート種類:</label>
          <select v-model="newAlert.type">
            <option value="motion">👁️ 動体検知</option>
            <option value="sound">🔊 音声検知</option>
            <option value="breach">🚨 侵入検知</option>
            <option value="system">⚙️ システム</option>
          </select>
        </div>

        <div class="form-group">
          <label>重要度:</label>
          <select v-model="newAlert.severity">
            <option value="low">🟢 低</option>
            <option value="medium">🟡 中</option>
            <option value="high">🟠 高</option>
            <option value="critical">🔴 緊急</option>
          </select>
        </div>

        <div class="form-group">
          <label>場所:</label>
          <input 
            v-model="newAlert.location" 
            type="text" 
            placeholder="例: 1階エントランス"
          />
        </div>

        <div class="form-group">
          <label>説明:</label>
          <textarea 
            v-model="newAlert.description" 
            rows="3"
            placeholder="例: 通常時間外の人の動きを検知しました"
          ></textarea>
        </div>

        <button 
          class="send-button alert-button"
          @click="sendDummyAlert"
          :disabled="isSending"
        >
          {{ isSending ? '送信中...' : '📤 アラートを送信' }}
        </button>
      </section>

      <!-- ダミーロボット状態更新 -->
      <section class="control-section">
        <h3>🤖 ロボット状態更新</h3>
        
        <div class="form-group">
          <label>ロボットID:</label>
          <select v-model="selectedRobotId">
            <option value="robot-001">ガード01</option>
            <option value="robot-002">ガード02</option>
            <option value="robot-003">ガード03</option>
            <option value="new">➕ 新しいロボット</option>
          </select>
        </div>

        <div v-if="selectedRobotId === 'new'" class="form-group">
          <label>新しいロボット名:</label>
          <input 
            v-model="newRobot.name" 
            type="text" 
            placeholder="例: ガード04"
          />
        </div>

        <div class="form-group">
          <label>場所:</label>
          <input 
            v-model="newRobot.location" 
            type="text" 
            placeholder="例: 3階会議室"
          />
        </div>

        <div class="form-group">
          <label>オンライン状態:</label>
          <label class="switch">
            <input type="checkbox" v-model="newRobot.isOnline">
            <span class="slider"></span>
          </label>
          <span class="status-text">{{ newRobot.isOnline ? 'オンライン' : 'オフライン' }}</span>
        </div>

        <div class="form-group">
          <label>バッテリーレベル: {{ newRobot.batteryLevel }}%</label>
          <input 
            v-model="newRobot.batteryLevel" 
            type="range" 
            min="0" 
            max="100"
            class="battery-slider"
          />
        </div>

        <button 
          class="send-button robot-button"
          @click="sendRobotStatus"
          :disabled="isSending"
        >
          {{ isSending ? '送信中...' : '📤 ロボット状態を更新' }}
        </button>
      </section>

      <!-- クイックアクション -->
      <section class="control-section">
        <h3>⚡ クイックアクション</h3>
        
        <div class="quick-actions">
          <button 
            class="quick-button"
            @click="sendRandomAlert"
            :disabled="isSending"
          >
            🎲 ランダムアラート
          </button>
          
          <button 
            class="quick-button"
            @click="sendCriticalAlert"
            :disabled="isSending"
          >
            🚨 緊急アラート
          </button>
          
          <button 
            class="quick-button"
            @click="sendSystemAlert"
            :disabled="isSending"
          >
            ⚙️ システム通知
          </button>
          
          <button 
            class="quick-button"
            @click="updateAllRobotsBattery"
            :disabled="isSending"
          >
            🔋 全ロボット充電
          </button>
        </div>
      </section>

      <!-- ステータス表示 -->
      <section class="control-section status-section">
        <h3>📊 送信ステータス</h3>
        <div class="status-log">
          <div 
            v-for="(log, index) in statusLogs" 
            :key="index"
            class="log-entry"
            :class="log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="statusLogs.length === 0" class="no-logs">
            ログがありません
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GuardRobotAlert, GuardRobotStatus } from '../types/guard-robot'
import { guardRobotService } from '../services/guard-robot-service'

// 状態管理
const isExpanded = ref(false)
const isSending = ref(false)
const statusLogs = ref<Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>>([])

// 新規アラートフォーム
const newAlert = ref({
  type: 'motion' as GuardRobotAlert['type'],
  severity: 'medium' as GuardRobotAlert['severity'],
  location: '1階エントランス',
  description: '通常時間外の人の動きを検知しました',
  status: 'active' as GuardRobotAlert['status']
})

// ロボット状態フォーム
const selectedRobotId = ref('robot-001')
const newRobot = ref({
  name: '',
  location: '1階エントランス',
  isOnline: true,
  batteryLevel: 85
})

// ログ追加
const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const now = new Date()
  const time = now.toLocaleTimeString('ja-JP')
  
  statusLogs.value.unshift({ time, message, type })
  
  // 最新10件のみ保持
  if (statusLogs.value.length > 10) {
    statusLogs.value = statusLogs.value.slice(0, 10)
  }
}

// ダミーアラート送信
const sendDummyAlert = async () => {
  isSending.value = true
  
  try {
    const alert: Omit<GuardRobotAlert, 'id'> = {
      timestamp: Date.now(),
      type: newAlert.value.type,
      severity: newAlert.value.severity,
      location: newAlert.value.location,
      description: newAlert.value.description,
      status: newAlert.value.status
    }
    
    await guardRobotService.addAlert(alert)
    
    addLog(`✅ アラートを送信しました: ${alert.description}`, 'success')
  } catch (error) {
    console.error('アラート送信エラー:', error)
    addLog(`❌ アラート送信に失敗しました: ${error}`, 'error')
  } finally {
    isSending.value = false
  }
}

// ロボット状態送信
const sendRobotStatus = async () => {
  isSending.value = true
  
  try {
    const robotId = selectedRobotId.value === 'new' 
      ? `robot-${String(Date.now()).slice(-3)}`
      : selectedRobotId.value
    
    const robotName = selectedRobotId.value === 'new'
      ? newRobot.value.name || 'ガード04'
      : selectedRobotId.value === 'robot-001' ? 'ガード01'
      : selectedRobotId.value === 'robot-002' ? 'ガード02'
      : 'ガード03'
    
    const robot: GuardRobotStatus = {
      id: robotId,
      name: robotName,
      location: newRobot.value.location,
      isOnline: newRobot.value.isOnline,
      batteryLevel: newRobot.value.batteryLevel,
      lastHeartbeat: Date.now()
    }
    
    await guardRobotService.updateRobotStatus(robot)
    
    addLog(`✅ ロボット状態を更新しました: ${robot.name}`, 'success')
  } catch (error) {
    console.error('ロボット状態送信エラー:', error)
    addLog(`❌ ロボット状態送信に失敗しました: ${error}`, 'error')
  } finally {
    isSending.value = false
  }
}

// ランダムアラート
const sendRandomAlert = async () => {
  const types: GuardRobotAlert['type'][] = ['motion', 'sound', 'breach', 'system']
  const severities: GuardRobotAlert['severity'][] = ['low', 'medium', 'high', 'critical']
  const locations = ['1階エントランス', '2階廊下', '駐車場', '裏口', '屋上', '3階会議室']
  const descriptions = [
    '通常時間外の人の動きを検知しました',
    '異常音を検知しました',
    '不正侵入の可能性があります',
    'システム異常を検知しました',
    '扉が開いています',
    '煙を検知しました'
  ]
  
  newAlert.value = {
    type: types[Math.floor(Math.random() * types.length)] as GuardRobotAlert['type'],
    severity: severities[Math.floor(Math.random() * severities.length)] as GuardRobotAlert['severity'],
    location: locations[Math.floor(Math.random() * locations.length)] as string,
    description: descriptions[Math.floor(Math.random() * descriptions.length)] as string,
    status: 'active'
  }
  
  await sendDummyAlert()
}

// 緊急アラート
const sendCriticalAlert = async () => {
  newAlert.value = {
    type: 'breach',
    severity: 'critical',
    location: '裏口',
    description: '🚨 緊急！不正侵入を検知しました',
    status: 'active'
  }
  
  await sendDummyAlert()
}

// システム通知
const sendSystemAlert = async () => {
  newAlert.value = {
    type: 'system',
    severity: 'low',
    location: 'システム',
    description: 'テストメッセージ: システムは正常に動作しています',
    status: 'active'
  }
  
  await sendDummyAlert()
}

// 全ロボットのバッテリーを100%に
const updateAllRobotsBattery = async () => {
  isSending.value = true
  
  try {
    const robotIds = ['robot-001', 'robot-002', 'robot-003']
    const robotNames = ['ガード01', 'ガード02', 'ガード03']
    const locations = ['1階エントランス', '2階廊下', '駐車場']
    
    for (let i = 0; i < robotIds.length; i++) {
      const robot: GuardRobotStatus = {
        id: robotIds[i] as string,
        name: robotNames[i] as string,
        location: locations[i] as string,
        isOnline: true,
        batteryLevel: 100,
        lastHeartbeat: Date.now()
      }
      
      await guardRobotService.updateRobotStatus(robot)
    }
    
    addLog('✅ 全ロボットのバッテリーを100%に更新しました', 'success')
  } catch (error) {
    console.error('バッテリー更新エラー:', error)
    addLog(`❌ バッテリー更新に失敗しました: ${error}`, 'error')
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.control-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.toggle-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-content {
  padding: 1.5rem;
}

.control-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.control-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #4fc3f7;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.battery-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
}

.battery-slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4fc3f7;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4caf50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.status-text {
  vertical-align: middle;
}

.send-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.alert-button {
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: white;
}

.alert-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.robot-button {
  background: linear-gradient(135deg, #4caf50, #2196f3);
  color: white;
}

.robot-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.quick-button {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-log {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.log-entry {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.log-entry.success {
  background: rgba(76, 175, 80, 0.2);
  border-left: 3px solid #4caf50;
}

.log-entry.error {
  background: rgba(244, 67, 54, 0.2);
  border-left: 3px solid #f44336;
}

.log-entry.info {
  background: rgba(33, 150, 243, 0.2);
  border-left: 3px solid #2196f3;
}

.log-time {
  opacity: 0.7;
  margin-right: 0.5rem;
}

.no-logs {
  text-align: center;
  opacity: 0.5;
  padding: 1rem;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .panel-header h2 {
    font-size: 1.1rem;
  }
}
</style>