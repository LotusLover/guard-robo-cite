/**
 * サウンドマネージャー
 * アラート受信時の通知音を管理
 */

import { VOLUME, BEEP } from '../config/constants'
import { 
  SOUND_FILES, 
  type SoundSettings,
  loadSoundSettings, 
  saveSoundSettings,
  type SoundFileName 
} from '../config/sound-config'

export class SoundManager {
  private audioContext: AudioContext | null = null
  private isMuted = false
  private soundCache: Map<string, AudioBuffer> = new Map()
  private settings: SoundSettings

  constructor() {
    // 設定を読み込み
    this.settings = loadSoundSettings()
    this.isMuted = this.settings.isMuted
    // ユーザー操作後にAudioContextを初期化
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.initAudioContext(), { once: true })
    }
  }

  /**
   * AudioContextを初期化
   */
  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * マスター音量と個別音量を考慮した最終音量を計算
   */
  private calculateVolume(soundName: SoundFileName, baseVolume: number): number {
    const individualVolume = this.settings.soundVolumes[soundName] ?? baseVolume
    return individualVolume * this.settings.masterVolume
  }

  /**
   * 全音声ファイルをプリロード
   */
  async preloadAllSounds(): Promise<void> {
    console.log('🎵 音声ファイルのプリロードを開始...')
    const baseUrl = (import.meta as any).env?.BASE_URL || '/'
    const prefix = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
    
    const promises = Object.entries(SOUND_FILES).map(async ([name, config]) => {
      const urlMp3 = `${prefix}sounds/${config.path}`
      const urlWav = urlMp3.replace('.mp3', '.wav')
      
      // mp3を試す
      let loaded = await this.loadSound(urlMp3)
      if (!loaded) {
        // wavを試す
        loaded = await this.loadSound(urlWav)
      }
      
      if (loaded) {
        console.log(`✅ プリロード完了: ${name}`)
      } else {
        console.warn(`⚠️ プリロード失敗: ${name}`)
      }
    })
    
    await Promise.allSettled(promises)
    console.log('🎵 全音声ファイルのプリロードが完了しました')
  }

  /**
   * 音声ファイルを読み込む
   */
  private async loadSound(url: string): Promise<AudioBuffer | null> {
    // キャッシュチェック
    if (this.soundCache.has(url)) {
      return this.soundCache.get(url)!
    }

    this.initAudioContext()
    
    if (!this.audioContext) {
      console.warn('AudioContext が利用できません')
      return null
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.error(`❌ 音声ファイルにアクセスできません (${response.status} ${response.statusText}): ${url}`)
        return null
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType && !contentType.includes('audio')) {
        console.warn(`⚠ 非音声のContent-Typeを検出: ${contentType} (${url})`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      // キャッシュに保存
      this.soundCache.set(url, audioBuffer)

      console.log(`✅ 音声ファイル読み込み成功: ${url}`)
      return audioBuffer
    } catch (error) {
      console.error(`❌ 音声ファイル読み込みエラー (${url}):`, error)
      return null
    }
  }

  /**
   * 音声ファイルを再生
   */
  private async playSoundFile(url: string, volume: number = VOLUME.DEFAULT): Promise<boolean> {
    if (this.isMuted) return false

    this.initAudioContext()
    
    if (!this.audioContext) {
      console.warn('AudioContext が利用できません')
      return false
    }

    try {
      const audioBuffer = await this.loadSound(url)
      
      if (!audioBuffer) {
        console.warn(`音声ファイルの読み込みに失敗: ${url}`)
        return false
      }

      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = audioBuffer
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.value = volume

      source.start(0)
      console.log(`🔊 音声再生: ${url}`)
      return true
    } catch (error) {
      console.error('音声再生エラー:', error)
      return false
    }
  }

  /**
   * ベース名から拡張子違いを順に試して再生（.mp3 → .wav）
   */
  private async playByBaseName(base: string, volume: number = VOLUME.DEFAULT) {
    const baseUrl = (import.meta as any).env?.BASE_URL || '/'
    const prefix = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
    const candidates = [`${prefix}sounds/${base}.mp3`, `${prefix}sounds/${base}.wav`]
    for (const url of candidates) {
      const ok = await this.playSoundFile(url, volume)
      if (ok) return
      // WebAudioで失敗した場合はAudio要素でも試す
      try {
        this.playAudioElement(url, volume)
        return
      } catch (_) {
        // 次の候補へ
      }
    }
    // どちらも失敗した場合は簡易ビープでフォールバック
    this.playBeep(BEEP.FREQUENCY, BEEP.DURATION, Math.min(VOLUME.DEFAULT, volume), BEEP.WAVE_TYPE)
  }

  /**
   * HTML5 Audioで音声ファイルを再生（フォールバック）
   */
  private playAudioElement(url: string, volume: number = VOLUME.DEFAULT): void {
    if (this.isMuted) return

    try {
      const audio = new Audio(url)
      audio.volume = volume
      audio.play().catch(error => {
        console.error('Audio要素での再生エラー:', error)
      })
      console.log(`🔊 Audio要素で再生: ${url}`)
    } catch (error) {
      console.error('Audio要素作成エラー:', error)
    }
  }

  /**
   * ビープ音を生成して再生
   */
  private playBeep(frequency: number, duration: number, volume: number = VOLUME.BEEP_DEFAULT, type: OscillatorType = 'sine') {
    if (this.isMuted) return

    this.initAudioContext()
    
    if (!this.audioContext) {
      console.warn('AudioContext が利用できません')
      return
    }

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type // 'sine', 'square', 'sawtooth', 'triangle'

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(VOLUME.FADE_OUT_MIN, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.error('音声再生エラー:', error)
    }
  }

  /**
   * 通常アラート音（低）
   */
  async playLowAlert() {
    console.log('🔊 playLowAlert呼び出し')
    const volume = this.calculateVolume('alert-low', VOLUME.ALERT_LOW)
    await this.playByBaseName('alert-low', volume)
  }

  /**
   * 通常アラート音（中）
   */
  async playMediumAlert() {
    console.log('🔊 playMediumAlert呼び出し')
    const volume = this.calculateVolume('alert-medium', VOLUME.ALERT_MEDIUM)
    await this.playByBaseName('alert-medium', volume)
  }

  /**
   * 警告アラート音（高）
   */
  async playHighAlert() {
    console.log('🔊 playHighAlert呼び出し')
    const volume = this.calculateVolume('alert-high', VOLUME.ALERT_HIGH)
    await this.playByBaseName('alert-high', volume)
  }

  /**
   * 緊急アラート音（緊急）
   */
  async playCriticalAlert() {
    console.log('🔊 playCriticalAlert呼び出し')
    const volume = this.calculateVolume('alert-critical', VOLUME.ALERT_CRITICAL)
    await this.playByBaseName('alert-critical', volume)
  }

  /**
   * 成功音
   */
  async playSuccess() {
    const volume = this.calculateVolume('success', VOLUME.SUCCESS)
    await this.playByBaseName('success', volume)
  }

  /**
   * 操作成功音（フィードバック用）
   */
  async playOperationSuccess() {
    await this.playSuccess()
  }

  /**
   * エラー音
   */
  async playError() {
    const volume = this.calculateVolume('error', VOLUME.ERROR)
    await this.playByBaseName('error', volume)
  }

  /**
   * 操作エラー音（フィードバック用）
   */
  async playOperationError() {
    await this.playError()
  }

  /**
   * 情報音（軽い通知）
   */
  async playInfo() {
    const volume = this.calculateVolume('info', VOLUME.INFO)
    await this.playByBaseName('info', volume)
  }

  /**
   * システム起動音
   */
  async playSystemStart() {
    const volume = this.calculateVolume('system-start', VOLUME.SYSTEM_START)
    await this.playByBaseName('system-start', volume)
  }

  /**
   * アラート重要度に応じて適切な音を再生
   */
  playAlertSound(severity: 'low' | 'medium' | 'high' | 'critical') {
    console.log(`🔔 playAlertSound呼び出し - severity: ${severity}`)
    switch (severity) {
      case 'low':
        this.playLowAlert()
        break
      case 'medium':
        this.playMediumAlert()
        break
      case 'high':
        this.playHighAlert()
        break
      case 'critical':
        this.playCriticalAlert()
        break
      default:
        console.warn(`⚠️ 未知のseverity: ${severity}`)
    }
  }

  /**
   * ミュート状態を切り替え
   */
  toggleMute() {
    this.isMuted = !this.isMuted
    this.settings.isMuted = this.isMuted
    this.saveSettings()
    return this.isMuted
  }

  /**
   * ミュート状態を設定
   */
  setMuted(muted: boolean) {
    this.isMuted = muted
    this.settings.isMuted = muted
    this.saveSettings()
  }

  /**
   * ミュート状態を取得
   */
  isSoundMuted(): boolean {
    return this.isMuted
  }

  /**
   * マスター音量を設定
   */
  setMasterVolume(volume: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * マスター音量を取得
   */
  getMasterVolume(): number {
    return this.settings.masterVolume
  }

  /**
   * 個別音声の音量を設定
   */
  setSoundVolume(soundName: SoundFileName, volume: number) {
    this.settings.soundVolumes[soundName] = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * 個別音声の音量を取得
   */
  getSoundVolume(soundName: SoundFileName): number {
    return this.settings.soundVolumes[soundName] ?? SOUND_FILES[soundName].volume
  }

  /**
   * 全設定を取得
   */
  getSettings(): SoundSettings {
    return { ...this.settings }
  }

  /**
   * 設定を保存
   */
  private saveSettings() {
    saveSoundSettings(this.settings)
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager()
