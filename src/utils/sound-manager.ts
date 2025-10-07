/**
 * サウンドマネージャー
 * アラート受信時の通知音を管理
 */

export class SoundManager {
  private audioContext: AudioContext | null = null
  private isMuted = false

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
   * ビープ音を生成して再生
   */
  private playBeep(frequency: number, duration: number, volume: number = 0.3) {
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
      oscillator.type = 'sine'

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
  playLowAlert() {
    this.playBeep(400, 0.2)
  }

  /**
   * 通常アラート音（中）
   */
  playMediumAlert() {
    this.playBeep(600, 0.15)
    setTimeout(() => this.playBeep(600, 0.15), 150)
  }

  /**
   * 警告アラート音（高）
   */
  playHighAlert() {
    this.playBeep(800, 0.12)
    setTimeout(() => this.playBeep(800, 0.12), 120)
    setTimeout(() => this.playBeep(800, 0.12), 240)
  }

  /**
   * 緊急アラート音（緊急）
   */
  playCriticalAlert() {
    // サイレン風の音
    this.playBeep(1000, 0.3, 0.4)
    setTimeout(() => this.playBeep(800, 0.3, 0.4), 300)
    setTimeout(() => this.playBeep(1000, 0.3, 0.4), 600)
  }

  /**
   * 成功音
   */
  playSuccess() {
    this.playBeep(523.25, 0.1) // C5
    setTimeout(() => this.playBeep(659.25, 0.1), 100) // E5
    setTimeout(() => this.playBeep(783.99, 0.15), 200) // G5
  }

  /**
   * エラー音
   */
  playError() {
    this.playBeep(300, 0.3, 0.3)
    setTimeout(() => this.playBeep(250, 0.3, 0.3), 300)
  }

  /**
   * 情報音（軽い通知）
   */
  playInfo() {
    this.playBeep(800, 0.1, 0.2)
  }

  /**
   * システム起動音
   */
  playSystemStart() {
    this.playBeep(440, 0.1) // A4
    setTimeout(() => this.playBeep(554.37, 0.1), 100) // C#5
    setTimeout(() => this.playBeep(659.25, 0.1), 200) // E5
    setTimeout(() => this.playBeep(880, 0.2), 300) // A5
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
