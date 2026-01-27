<template>
  <div class="sound-settings-panel" :class="{ 'is-open': isOpen }">
    <!-- トグルボタン -->
    <button 
      class="settings-toggle-btn"
      @click="togglePanel"
      :title="isOpen ? '設定を閉じる' : '音声設定を開く'"
    >
      {{ isOpen ? '✕' : '🎵' }}
    </button>

    <!-- 設定パネル -->
    <transition name="slide">
      <div v-if="isOpen" class="settings-content">
        <h3>🎵 音声設定</h3>
        
        <!-- マスター音量 -->
        <div class="setting-group">
          <label class="setting-label">
            <span>🔊 マスター音量</span>
            <span class="volume-value">{{ Math.round(masterVolume * 100) }}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="masterVolume"
            @input="updateMasterVolume"
            class="volume-slider"
          />
        </div>

        <!-- ミュートトグル -->
        <div class="setting-group">
          <button 
            class="mute-toggle-btn"
            @click="toggleMute"
            :class="{ muted: isMuted }"
          >
            {{ isMuted ? '🔇 ミュート中' : '🔊 音声オン' }}
          </button>
        </div>

        <!-- 個別音声設定 -->
        <div class="individual-sounds">
          <h4>個別音声設定</h4>
          <div 
            v-for="(config, soundName) in SOUND_FILES" 
            :key="soundName"
            class="sound-item"
          >
            <div class="sound-header">
              <span class="sound-name">{{ config.displayName }}</span>
              <button 
                class="test-btn"
                @click="testSound(soundName)"
                :disabled="isMuted"
                :title="isMuted ? 'ミュート中' : '音声をテスト'"
              >
                ▶
              </button>
            </div>
            <div class="sound-volume-control">
              <span class="volume-value-small">{{ Math.round(getSoundVolume(soundName) * 100) }}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="getSoundVolume(soundName)"
                @input="(e) => updateSoundVolume(soundName, parseFloat((e.target as HTMLInputElement).value))"
                class="volume-slider-small"
                :disabled="isMuted"
              />
            </div>
          </div>
        </div>

        <!-- リセットボタン -->
        <div class="setting-group">
          <button 
            class="reset-btn"
            @click="resetSettings"
            title="デフォルト設定に戻す"
          >
            🔄 デフォルトに戻す
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { soundManager } from '../utils/sound-manager'
import { SOUND_FILES, type SoundFileName } from '../config/sound-config'

const isOpen = ref(false)
const masterVolume = ref(0.5)
const isMuted = ref(false)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const updateMasterVolume = () => {
  soundManager.setMasterVolume(masterVolume.value)
}

const toggleMute = () => {
  isMuted.value = soundManager.toggleMute()
}

const getSoundVolume = (soundName: SoundFileName): number => {
  return soundManager.getSoundVolume(soundName)
}

const updateSoundVolume = (soundName: SoundFileName, volume: number) => {
  soundManager.setSoundVolume(soundName, volume)
}

const testSound = async (soundName: SoundFileName) => {
  // 音声名に応じて適切なメソッドを呼び出す
  switch (soundName) {
    case 'alert-low':
      await soundManager.playLowAlert()
      break
    case 'alert-medium':
      await soundManager.playMediumAlert()
      break
    case 'alert-high':
      await soundManager.playHighAlert()
      break
    case 'alert-critical':
      await soundManager.playCriticalAlert()
      break
    case 'success':
      await soundManager.playSuccess()
      break
    case 'error':
      await soundManager.playError()
      break
    case 'info':
      await soundManager.playInfo()
      break
    case 'system-start':
      await soundManager.playSystemStart()
      break
  }
}

const resetSettings = () => {
  masterVolume.value = 0.5
  soundManager.setMasterVolume(0.5)
  
  // 個別音量をクリア（デフォルトに戻る）
  Object.keys(SOUND_FILES).forEach((soundName) => {
    soundManager.setSoundVolume(soundName as SoundFileName, SOUND_FILES[soundName as SoundFileName].volume)
  })
  
  soundManager.playInfo()
}

onMounted(() => {
  // 初期値を読み込み
  const settings = soundManager.getSettings()
  masterVolume.value = settings.masterVolume
  isMuted.value = settings.isMuted
})
</script>

<style scoped>
.sound-settings-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.settings-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.settings-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.settings-toggle-btn:active {
  transform: scale(0.95);
}

.settings-content {
  position: absolute;
  top: 70px;
  right: 0;
  width: 320px;
  max-height: 70vh;
  overflow-y: auto;
  background: rgba(30, 60, 114, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
}

.settings-content h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  text-align: center;
  color: #fff;
}

.settings-content h4 {
  margin: 1.5rem 0 1rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.volume-value {
  font-weight: bold;
  color: #4caf50;
}

.volume-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  background: #66bb6a;
  transform: scale(1.2);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  background: #66bb6a;
  transform: scale(1.2);
}

.mute-toggle-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(76, 175, 80, 0.3);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mute-toggle-btn:hover {
  background: rgba(76, 175, 80, 0.5);
  transform: translateY(-2px);
}

.mute-toggle-btn.muted {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
}

.mute-toggle-btn.muted:hover {
  background: rgba(244, 67, 54, 0.5);
}

.individual-sounds {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
}

.sound-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.sound-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sound-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.test-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.5);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.test-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.5);
  transform: scale(1.1);
}

.test-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.sound-volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-value-small {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  min-width: 40px;
}

.volume-slider-small {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.volume-slider-small::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
}

.volume-slider-small::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
  border: none;
}

.volume-slider-small:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reset-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 152, 0, 0.3);
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 152, 0, 0.5);
  transform: translateY(-2px);
}

/* スライドアニメーション */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* スクロールバーのスタイリング */
.settings-content::-webkit-scrollbar {
  width: 8px;
}

.settings-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .sound-settings-panel {
    top: 10px;
    right: 10px;
  }
  
  .settings-content {
    width: 280px;
    max-height: 60vh;
  }
}
</style>
