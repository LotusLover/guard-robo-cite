<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GuardRobotAlert, GuardRobotStatus } from '../types/guard-robot'
import { MAP_PINS, MAP_CONFIG, SEVERITY_COLORS, BUILDING_ROOMS } from '../config/map-config'

// Props
interface Props {
  alerts: GuardRobotAlert[]
  robots: GuardRobotStatus[]
}
const props = defineProps<Props>()

// State
const imageLoaded = ref(false)
const imageError = ref(false)
const selectedLocation = ref<string | null>(null)
const mouseCoords = ref<{ x: number; y: number } | null>(null)
const showCoords = ref(false)

// 画像読み込み処理
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
  console.log('✅ 地図画像の読み込み成功')
}

const handleImageError = () => {
  imageLoaded.value = false
  imageError.value = true
  console.log('⚠️ 地図画像が見つかりません - SVGフォールバックを使用')
}

// アクティブアラートのロケーション一覧
const activeAlertLocations = computed(() => {
  const locations = new Map<string, { severity: string; count: number }>()
  
  props.alerts
    .filter(alert => alert.status === 'active')
    .forEach(alert => {
      const existing = locations.get(alert.location)
      if (existing) {
        // より高い重要度を採用
        const severities = ['low', 'medium', 'high', 'critical']
        const currentIndex = severities.indexOf(existing.severity)
        const newIndex = severities.indexOf(alert.severity)
        if (newIndex > currentIndex) {
          existing.severity = alert.severity
        }
        existing.count++
      } else {
        locations.set(alert.location, { severity: alert.severity, count: 1 })
      }
    })
  
  return locations
})

// ロボットの現在位置
const robotLocations = computed(() => {
  const locations = new Map<string, number>()
  props.robots
    .filter(robot => robot.isOnline)
    .forEach(robot => {
      const count = locations.get(robot.location) || 0
      locations.set(robot.location, count + 1)
    })
  return locations
})

// ピンをクリックした時の処理
const handlePinClick = (location: string) => {
  selectedLocation.value = selectedLocation.value === location ? null : location
  console.log('📍 選択されたロケーション:', location)
}

// ピンの色を取得
const getPinColor = (location: string): string => {
  const alert = activeAlertLocations.value.get(location)
  return alert ? SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] : SEVERITY_COLORS.default
}

// ピンがアクティブか判定
const isPinActive = (location: string): boolean => {
  return activeAlertLocations.value.has(location)
}

// アラート件数を取得
const getAlertCount = (location: string): number => {
  return activeAlertLocations.value.get(location)?.count || 0
}

// ロボット台数を取得
const getRobotCount = (location: string): number => {
  return robotLocations.value.get(location) || 0
}

// マウス座標の追跡（開発用）
const handleMouseMove = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  mouseCoords.value = { x: Math.round(x), y: Math.round(y) }
}

const handleMouseEnter = () => {
  showCoords.value = true
}

const handleMouseLeave = () => {
  showCoords.value = false
  mouseCoords.value = null
}
</script>

<template>
  <div class="map-view">
    <div class="map-header">
      <h3>🗺️ フロアマップ</h3>
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: #6b7280"></span>
          <span>通常</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #4ade80"></span>
          <span>低</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #fbbf24"></span>
          <span>中</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #fb923c"></span>
          <span>高</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot pulse" style="background: #ef4444"></span>
          <span>緊急</span>
        </div>
      </div>
    </div>

    <div class="map-container">
      <!-- 画像ベースのマップ -->
      <div 
        v-if="!imageError && MAP_CONFIG.FALLBACK_ENABLED" 
        class="map-image-wrapper"
        @mousemove="handleMouseMove"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <img 
          :src="MAP_CONFIG.IMAGE_PATH" 
          alt="フロアマップ"
          class="map-image"
          @load="handleImageLoad"
          @error="handleImageError"
          :style="{ opacity: imageLoaded ? 1 : 0 }"
        />
        
        <!-- マウス座標表示（開発用） -->
        <div 
          v-if="showCoords && mouseCoords && imageLoaded" 
          class="coords-tooltip"
          :style="{
            left: `${mouseCoords.x}%`,
            top: `${mouseCoords.y}%`
          }"
        >
          x: {{ mouseCoords.x }}, y: {{ mouseCoords.y }}
        </div>
        
        <!-- 画像上にピンを配置 -->
        <div v-if="imageLoaded" class="pins-overlay">
          <div
            v-for="(config, location) in MAP_PINS"
            :key="location"
            class="map-pin"
            :class="{ 
              active: isPinActive(location),
              selected: selectedLocation === location 
            }"
            :style="{
              left: `${config.x}%`,
              top: `${config.y}%`,
              '--pin-color': getPinColor(location),
            }"
            @click="handlePinClick(location)"
          >
            <!-- ピン本体 -->
            <div class="pin-marker">
              <div class="pin-dot"></div>
              <!-- アクティブ時の波紋エフェクト -->
              <div v-if="isPinActive(location)" class="pin-ping"></div>
            </div>
            
            <!-- ラベル -->
            <div class="pin-label">
              {{ config.label || location }}
              <span v-if="getAlertCount(location) > 0" class="alert-badge">
                {{ getAlertCount(location) }}
              </span>
            </div>
            
            <!-- ツールチップ -->
            <div class="pin-tooltip">
              <div class="tooltip-title">{{ config.label || location }}</div>
              <div v-if="getAlertCount(location) > 0" class="tooltip-row alert-row">
                🚨 アラート: {{ getAlertCount(location) }}件
              </div>
              <div v-if="getRobotCount(location) > 0" class="tooltip-row">
                🤖 ロボット: {{ getRobotCount(location) }}台
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SVGフォールバック（画像がない場合） -->
      <div v-if="imageError || !imageLoaded" class="map-svg-wrapper">
        <svg 
          :width="MAP_CONFIG.BUILDING_WIDTH" 
          :height="MAP_CONFIG.BUILDING_HEIGHT"
          class="map-svg"
          viewBox="0 0 600 400"
        >
          <!-- 建物の部屋 -->
          <g v-for="room in BUILDING_ROOMS" :key="room.name">
            <rect
              :x="room.x"
              :y="room.y"
              :width="room.width"
              :height="room.height"
              fill="rgba(255, 255, 255, 0.1)"
              stroke="rgba(255, 255, 255, 0.3)"
              stroke-width="2"
            />
            <text
              :x="room.x + room.width / 2"
              :y="room.y + room.height / 2"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="14"
              fill="white"
            >
              {{ room.name }}
            </text>
          </g>
          
          <!-- ピン -->
          <g v-for="(config, location) in MAP_PINS" :key="location">
            <circle
              :cx="config.x * MAP_CONFIG.BUILDING_WIDTH / 100"
              :cy="config.y * MAP_CONFIG.BUILDING_HEIGHT / 100"
              r="8"
              :fill="getPinColor(location)"
              :class="{ 'svg-pin-active': isPinActive(location) }"
              @click="handlePinClick(location)"
              style="cursor: pointer;"
            />
            <text
              v-if="getAlertCount(location) > 0"
              :x="config.x * MAP_CONFIG.BUILDING_WIDTH / 100"
              :y="config.y * MAP_CONFIG.BUILDING_HEIGHT / 100 - 15"
              text-anchor="middle"
              font-size="12"
              font-weight="bold"
              :fill="getPinColor(location)"
            >
              {{ getAlertCount(location) }}
            </text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-view {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.map-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: white;
}

.map-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.map-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

/* 画像ベースマップ */
.map-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-image {
  width: 100%;
  height: auto;
  display: block;
  transition: opacity 0.3s;
}

/* ピンオーバーレイ */
.pins-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* マップピン */
.map-pin {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: all;
  cursor: pointer;
  z-index: 10;
  transition: z-index 0s 0.3s;
}

.map-pin:hover,
.map-pin.selected {
  z-index: 100;
  transition: z-index 0s 0s;
}

.pin-marker {
  position: relative;
  width: 24px;
  height: 24px;
}

.pin-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: var(--pin-color, #6b7280);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.map-pin.active .pin-dot {
  animation: pulse 1.5s ease-in-out infinite;
}

.map-pin:hover .pin-dot,
.map-pin.selected .pin-dot {
  transform: translate(-50%, -50%) scale(1.3);
}

/* 波紋エフェクト */
.pin-ping {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: var(--pin-color, #6b7280);
  border-radius: 50%;
  opacity: 0.75;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* ラベル */
.pin-label {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.map-pin:hover .pin-label,
.map-pin.selected .pin-label {
  opacity: 1;
}

.alert-badge {
  background: #ef4444;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: bold;
}

/* ツールチップ */
.pin-tooltip {
  position: absolute;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30, 60, 114, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  min-width: 150px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.map-pin:hover .pin-tooltip,
.map-pin.selected .pin-tooltip {
  opacity: 1;
}

.tooltip-title {
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.tooltip-row {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0;
}

.tooltip-row.alert-row {
  color: #ff6b6b;
  font-weight: 600;
}

/* SVGマップ */
.map-svg-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.map-svg {
  max-width: 100%;
  height: auto;
}

.svg-pin-active {
  animation: pulse 1.5s ease-in-out infinite;
}

/* アニメーション */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes ping {
  75%, 100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* マウス座標ツールチップ（開発用） */
.coords-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  pointer-events: none;
  white-space: nowrap;
  transform: translate(-50%, 20%);
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .map-legend {
    gap: 0.5rem;
  }
  
  .map-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .legend-item {
    font-size: 0.75rem;
  }
}
</style>
