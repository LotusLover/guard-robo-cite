/**
 * サウンドマネージャー
 * アラート受信時の通知音を管理
 */

export class SoundManager {
  private audioContext: AudioContext | null = null
  private isMuted = false
  private soundCache: Map<string, AudioBuffer> = new Map()

  constructor() {
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
  private async playSoundFile(url: string, volume: number = 0.5): Promise<boolean> {
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
  private async playByBaseName(base: string, volume: number = 0.5) {
    const candidates = [`/sounds/${base}.mp3`, `/sounds/${base}.wav`]
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
    this.playBeep(800, 0.2, Math.min(0.5, volume), 'triangle')
  }

  /**
   * HTML5 Audioで音声ファイルを再生（フォールバック）
   */
  private playAudioElement(url: string, volume: number = 0.5): void {
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
  private playBeep(frequency: number, duration: number, volume: number = 0.3, type: OscillatorType = 'sine') {
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
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

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
    await this.playByBaseName('alert-low', 0.6)
  }

  /**
   * 通常アラート音（中）
   */
  async playMediumAlert() {
    await this.playByBaseName('alert-medium', 0.7)
  }

  /**
   * 警告アラート音（高）
   */
  async playHighAlert() {
    await this.playByBaseName('alert-high', 0.8)
  }

  /**
   * 緊急アラート音（緊急）
   */
  async playCriticalAlert() {
    await this.playByBaseName('alert-critical', 0.9)
  }

  /**
   * 成功音
   */
  async playSuccess() {
    await this.playByBaseName('success', 0.6)
  }

  /**
   * エラー音
   */
  async playError() {
    await this.playByBaseName('error', 0.7)
  }

  /**
   * 情報音（軽い通知）
   */
  async playInfo() {
    await this.playByBaseName('info', 0.5)
  }

  /**
   * システム起動音
   */
  async playSystemStart() {
    await this.playByBaseName('system-start', 0.7)
  }

  /**
   * アラート重要度に応じて適切な音を再生
   */
  playAlertSound(severity: 'low' | 'medium' | 'high' | 'critical') {
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
    }
  }

  /**
   * ミュート状態を切り替え
   */
  toggleMute() {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  /**
   * ミュート状態を設定
   */
  setMuted(muted: boolean) {
    this.isMuted = muted
  }

  /**
   * ミュート状態を取得
   */
  isSoundMuted(): boolean {
    return this.isMuted
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager()
