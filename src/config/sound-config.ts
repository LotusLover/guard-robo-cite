/**
 * 音声ファイルの設定と定義
 */

import { VOLUME, STORAGE_KEYS } from './constants'

/** 音声ファイルの定義 */
export const SOUND_FILES = {
  'alert-low': { 
    path: 'alert-low.mp3', 
    volume: VOLUME.ALERT_LOW,
    displayName: '低重要度アラート'
  },
  'alert-medium': { 
    path: 'alert-medium.mp3', 
    volume: VOLUME.ALERT_MEDIUM,
    displayName: '中重要度アラート'
  },
  'alert-high': { 
    path: 'alert-high.mp3', 
    volume: VOLUME.ALERT_HIGH,
    displayName: '高重要度アラート'
  },
  'alert-critical': { 
    path: 'alert-critical.mp3', 
    volume: VOLUME.ALERT_CRITICAL,
    displayName: '緊急アラート'
  },
  'success': { 
    path: 'success.mp3', 
    volume: VOLUME.SUCCESS,
    displayName: '成功'
  },
  'error': { 
    path: 'error.mp3', 
    volume: VOLUME.ERROR,
    displayName: 'エラー'
  },
  'info': { 
    path: 'info.mp3', 
    volume: VOLUME.INFO,
    displayName: '情報'
  },
  'system-start': { 
    path: 'system-start.mp3', 
    volume: VOLUME.SYSTEM_START,
    displayName: 'システム起動'
  }
} as const

export type SoundFileName = keyof typeof SOUND_FILES

/** 音声設定のインターフェース */
export interface SoundSettings {
  isMuted: boolean
  masterVolume: number
  soundVolumes: Partial<Record<SoundFileName, number>>
}

/** デフォルトの音声設定 */
export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  isMuted: false,
  masterVolume: VOLUME.DEFAULT,
  soundVolumes: {}
}

/**
 * localStorageから音声設定を読み込む
 */
export function loadSoundSettings(): SoundSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_SETTINGS)
    if (saved) {
      return { ...DEFAULT_SOUND_SETTINGS, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.warn('⚠️ 音声設定の読み込みに失敗しました:', error)
  }
  return DEFAULT_SOUND_SETTINGS
}

/**
 * localStorageに音声設定を保存する
 */
export function saveSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.error('❌ 音声設定の保存に失敗しました:', error)
  }
}
