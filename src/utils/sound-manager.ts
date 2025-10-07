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
  playLowAlert() {
    this.playBeep(500, 0.3, 0.35)
    setTimeout(() => this.playBeep(500, 0.2, 0.25), 400)
  }

  /**
   * 通常アラート音（中）
   */
  playMediumAlert() {
    this.playBeep(700, 0.25, 0.4)
    setTimeout(() => this.playBeep(700, 0.25, 0.4), 300)
    setTimeout(() => this.playBeep(850, 0.3, 0.35), 650)
  }

  /**
   * 警告アラート音（高）
   */
  playHighAlert() {
    // 上昇パターンで緊迫感（sawtooth波でより目立つ）
    this.playBeep(800, 0.2, 0.4, 'sawtooth')
    setTimeout(() => this.playBeep(900, 0.2, 0.4, 'sawtooth'), 250)
    setTimeout(() => this.playBeep(1000, 0.2, 0.4, 'sawtooth'), 500)
    setTimeout(() => this.playBeep(1100, 0.3, 0.45, 'sawtooth'), 750)
  }

  /**
   * 緊急アラート音（緊急）
   */
  playCriticalAlert() {
    // 強力なサイレン風の音（より長く、より目立つ）
    // square波でより鋭く目立つ音に
    this.playBeep(1200, 0.35, 0.5, 'square')
    setTimeout(() => this.playBeep(800, 0.35, 0.5, 'square'), 400)
    setTimeout(() => this.playBeep(1200, 0.35, 0.5, 'square'), 800)
    setTimeout(() => this.playBeep(800, 0.35, 0.5, 'square'), 1200)
    setTimeout(() => this.playBeep(1200, 0.4, 0.55, 'square'), 1600)
    setTimeout(() => this.playBeep(800, 0.4, 0.55, 'square'), 2050)
  }

  /**
   * 成功音
   */
  playSuccess() {
    // より華やかな成功音
    this.playBeep(523.25, 0.12, 0.35) // C5
    setTimeout(() => this.playBeep(659.25, 0.12, 0.35), 120) // E5
    setTimeout(() => this.playBeep(783.99, 0.15, 0.4), 240) // G5
    setTimeout(() => this.playBeep(1046.50, 0.25, 0.4), 400) // C6（高いド）
  }

  /**
   * エラー音
   */
  playError() {
    // より目立つエラー音
    this.playBeep(350, 0.25, 0.4)
    setTimeout(() => this.playBeep(300, 0.25, 0.4), 280)
    setTimeout(() => this.playBeep(250, 0.35, 0.45), 560)
  }

  /**
   * 情報音（軽い通知）
   */
  playInfo() {
    this.playBeep(900, 0.15, 0.25)
    setTimeout(() => this.playBeep(1000, 0.12, 0.2), 180)
  }

  /**
   * システム起動音
   */
  playSystemStart() {
    // より壮大な起動音
    this.playBeep(440, 0.15, 0.3) // A4
    setTimeout(() => this.playBeep(554.37, 0.15, 0.3), 150) // C#5
    setTimeout(() => this.playBeep(659.25, 0.15, 0.35), 300) // E5
    setTimeout(() => this.playBeep(880, 0.2, 0.4), 450) // A5
    setTimeout(() => this.playBeep(1046.50, 0.3, 0.45), 650) // C6（フィニッシュ）
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
