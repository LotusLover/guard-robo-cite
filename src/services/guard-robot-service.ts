import { ref as dbRef, push, set, onValue, off, goOffline, goOnline, DataSnapshot, DatabaseError } from 'firebase/database'
import { database, monitorNetworkStatus } from '../firebase'
import type { GuardRobotAlert, GuardRobotStatus } from '../types/guard-robot'

export class GuardRobotService {
  private alertsRef = dbRef(database, 'alerts')
  private robotsRef = dbRef(database, 'robots')
  private alertsCallbacks = new Set<(alerts: GuardRobotAlert[]) => void>()
  private robotsCallbacks = new Set<(robots: GuardRobotStatus[]) => void>()
  private isOnline = navigator.onLine
  private retryTimeout: number | null = null

  constructor() {
    this.setupRealtimeListeners()
    this.setupNetworkMonitoring()
    monitorNetworkStatus()
  }

  /**
   * ネットワーク状態の監視をセットアップ
   */
  private setupNetworkMonitoring() {
    // オンライン状態の監視
    window.addEventListener('online', () => {
      console.log('🌐 ネットワークが復旧しました - Firebase再接続中...')
      this.isOnline = true
      goOnline(database)
      this.retryFirebaseConnection()
    })

    // オフライン状態の監視
    window.addEventListener('offline', () => {
      console.log('📡 ネットワークが切断されました - オフラインモードに切り替え')
      this.isOnline = false
      goOffline(database)
    })
  }

  /**
   * Firebase接続の再試行
   */
  private retryFirebaseConnection() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }

    this.retryTimeout = window.setTimeout(() => {
      if (this.isOnline) {
        console.log('🔄 Firebase接続を再試行中...')
        // 接続状態をテスト
        this.testFirebaseConnection()
      }
    }, 2000)
  }

  /**
   * Firebase接続状態をテスト
   */
  private async testFirebaseConnection(): Promise<boolean> {
    try {
      // 接続テスト用の軽量なデータ読み取り
      const testRef = dbRef(database, '.info/connected')
      return new Promise((resolve) => {
        const unsubscribe = onValue(testRef, (snapshot: DataSnapshot) => {
          const connected = snapshot.val()
          console.log(connected ? '✅ Firebase接続成功' : '❌ Firebase接続失敗')
          unsubscribe()
          resolve(connected)
        }, (error: DatabaseError) => {
          console.error('❌ Firebase接続テストエラー:', error)
          unsubscribe()
          resolve(false)
        })
      })
    } catch (error) {
      console.error('❌ Firebase接続テストでエラー:', error)
      return false
    }
  }

  /**
   * リアルタイムリスナーを設定
   */
  private setupRealtimeListeners() {
    try {
      // アラートの変更を監視
      onValue(this.alertsRef, 
        (snapshot: DataSnapshot) => {
          const data = snapshot.val()
          const alerts: GuardRobotAlert[] = data ? Object.values(data) : []
          console.log(`📡 アラートデータを受信: ${alerts.length}件`)
          this.alertsCallbacks.forEach(callback => callback(alerts))
        },
        (error: DatabaseError) => {
          console.error('❌ アラートリスナーエラー:', error)
          if (!this.isOnline) {
            console.log('📱 オフラインモード: ローカルキャッシュを使用')
          }
          // エラー時はダミーデータを使用
          this.useFallbackData()
        }
      )

      // ロボット状態の変更を監視
      onValue(this.robotsRef, 
        (snapshot: DataSnapshot) => {
          const data = snapshot.val()
          const robots: GuardRobotStatus[] = data ? Object.values(data) : []
          console.log(`🤖 ロボットデータを受信: ${robots.length}台`)
          this.robotsCallbacks.forEach(callback => callback(robots))
        },
        (error: DatabaseError) => {
          console.error('❌ ロボットリスナーエラー:', error)
          if (!this.isOnline) {
            console.log('📱 オフラインモード: ローカルキャッシュを使用')
          }
          // エラー時はダミーデータを使用
          this.useFallbackData()
        }
      )

      // Firebase接続状態の監視
      const connectedRef = dbRef(database, '.info/connected')
      onValue(connectedRef, (snapshot: DataSnapshot) => {
        const connected = snapshot.val()
        if (connected) {
          console.log('🔗 Firebase Realtime Database に接続されました')
        } else {
          console.log('🔌 Firebase Realtime Database から切断されました')
        }
      })

    } catch (error) {
      console.error('❌ リアルタイムリスナーの設定エラー:', error)
      this.useFallbackData()
    }
  }

  /**
   * ネットワークエラー時のフォールバックデータを使用
   */
  private useFallbackData() {
    console.log('🔄 フォールバックデータを使用します')
    
    // ダミーデータを生成
    const fallbackAlerts = this.generateFallbackAlerts()
    const fallbackRobots = this.generateFallbackRobots()
    
    // コールバックに通知
    this.alertsCallbacks.forEach(callback => callback(fallbackAlerts))
    this.robotsCallbacks.forEach(callback => callback(fallbackRobots))
  }

  /**
   * フォールバック用のアラートデータを生成
   */
  private generateFallbackAlerts(): GuardRobotAlert[] {
    return [
      {
        id: 'fallback-alert-001',
        timestamp: Date.now() - 180000,
        type: 'system',
        severity: 'medium',
        location: 'システム',
        description: 'ネットワーク接続の問題によりオフラインモードで動作中',
        status: 'active'
      }
    ]
  }

  /**
   * フォールバック用のロボットデータを生成
   */
  private generateFallbackRobots(): GuardRobotStatus[] {
    return [
      {
        id: 'fallback-robot-001',
        name: 'オフラインモード',
        location: '接続待機中',
        isOnline: false,
        batteryLevel: 0,
        lastHeartbeat: Date.now() - 300000
      }
    ]
  }

  /**
   * アラートの変更を監視するコールバックを登録
   */
  onAlertsChange(callback: (alerts: GuardRobotAlert[]) => void) {
    this.alertsCallbacks.add(callback)
    return () => this.alertsCallbacks.delete(callback)
  }

  /**
   * ロボット状態の変更を監視するコールバックを登録
   */
  onRobotsChange(callback: (robots: GuardRobotStatus[]) => void) {
    this.robotsCallbacks.add(callback)
    return () => this.robotsCallbacks.delete(callback)
  }

  /**
   * 新しいアラートを追加
   */
  async addAlert(alert: Omit<GuardRobotAlert, 'id'>): Promise<void> {
    if (!this.isOnline) {
      console.warn('⚠️ オフライン状態のため、アラート追加をスキップします')
      return
    }

    try {
      const newAlertRef = push(this.alertsRef)
      const alertWithId: GuardRobotAlert = {
        ...alert,
        id: newAlertRef.key!
      }
      
      await set(newAlertRef, alertWithId)
      console.log('✅ アラートを追加しました:', alertWithId.description)
    } catch (error) {
      console.error('❌ アラート追加エラー:', error)
      throw error
    }
  }

  /**
   * ロボット状態を更新
   */
  async updateRobotStatus(robot: GuardRobotStatus): Promise<void> {
    if (!this.isOnline) {
      console.warn('⚠️ オフライン状態のため、ロボット状態更新をスキップします')
      return
    }

    try {
      const robotRef = dbRef(database, `robots/${robot.id}`)
      await set(robotRef, robot)
      console.log('✅ ロボット状態を更新しました:', robot.name)
    } catch (error) {
      console.error('❌ ロボット状態更新エラー:', error)
      throw error
    }
  }

  /**
   * ネットワーク状態を取得
   */
  getNetworkStatus(): { isOnline: boolean; lastUpdated: number } {
    return {
      isOnline: this.isOnline,
      lastUpdated: Date.now()
    }
  }

  /**
   * Firebase接続状態を強制的にテスト
   */
  async testConnection(): Promise<boolean> {
    return await this.testFirebaseConnection()
  }

  /**
   * ダミーデータを初期化（テスト用）
   * 
   * セキュリティ注意:
   * - 本番環境では書き込み権限を制限してください
   * - database.rules.public.json: 書き込み完全禁止（推奨）
   * - database.rules.json: 認証済みユーザーのみ書き込み可能
   */
  async initializeDummyData(): Promise<void> {
    console.log('🔄 Firebase接続とダミーデータの初期化を開始...')

    // まずFirebase接続をテスト
    const isConnected = await this.testFirebaseConnection()
    
    if (!isConnected) {
      console.warn('⚠️ Firebaseに接続できません。フォールバックデータを使用します。')
      this.useFallbackData()
      return
    }

    // ダミーロボットデータ
    const dummyRobots: GuardRobotStatus[] = [
      {
        id: 'robot-001',
        name: 'ガード01',
        location: '1階エントランス',
        isOnline: true,
        batteryLevel: 85,
        lastHeartbeat: Date.now() - 30000
      },
      {
        id: 'robot-002',
        name: 'ガード02',
        location: '2階廊下',
        isOnline: true,
        batteryLevel: 92,
        lastHeartbeat: Date.now() - 15000
      },
      {
        id: 'robot-003',
        name: 'ガード03',
        location: '駐車場',
        isOnline: false,
        batteryLevel: 23,
        lastHeartbeat: Date.now() - 300000
      }
    ]

    // ダミーアラートデータ
    const dummyAlerts: GuardRobotAlert[] = [
      {
        id: 'alert-001',
        timestamp: Date.now() - 180000,
        type: 'motion',
        severity: 'medium',
        location: '1階エントランス',
        description: '通常時間外の人の動きを検知しました',
        status: 'active'
      },
      {
        id: 'alert-002',
        timestamp: Date.now() - 900000,
        type: 'sound',
        severity: 'low',
        location: '2階廊下',
        description: '異常音を検知しました',
        status: 'acknowledged'
      },
      {
        id: 'alert-003',
        timestamp: Date.now() - 1800000,
        type: 'system',
        severity: 'high',
        location: '駐車場',
        description: 'ロボット03の通信が切断されました',
        status: 'active'
      },
      {
        id: 'alert-004',
        timestamp: Date.now() - 3600000,
        type: 'breach',
        severity: 'critical',
        location: '裏口',
        description: '不正侵入の可能性があります',
        status: 'resolved'
      }
    ]

    try {
      console.log('📡 Firebase Realtime Databaseにデータを送信中...')
      
      // ロボットデータを設定
      for (const robot of dummyRobots) {
        await this.updateRobotStatus(robot)
      }

      // アラートデータを設定
      for (const alert of dummyAlerts) {
        const alertRef = dbRef(database, `alerts/${alert.id}`)
        await set(alertRef, alert)
      }

      console.log('✅ ダミーデータの初期化が完了しました')
      
      // システム状態のアラートを追加
      await this.addAlert({
        timestamp: Date.now(),
        type: 'system',
        severity: 'low',
        location: 'システム',
        description: 'Firebase Realtime Databaseに正常に接続しました',
        status: 'active'
      })

    } catch (error) {
      console.error('❌ Firebase書き込みエラー（セキュリティルール制限の可能性）:', error)
      console.log('📚 書き込み権限が制限されています。これは正常な動作です。')
      console.log('💡 データはFirebaseコンソールから手動で追加してください。')
      
      // 読み取り専用モードでフォールバックデータを使用
      this.useFallbackData()
    }
  }

  /**
   * ダミーのリアルタイム更新をシミュレート（テスト用）
   */
  startDummyUpdates(): void {
    setInterval(() => {
      // ランダムなアラートを生成
      if (Math.random() < 0.1) { // 10%の確率で新しいアラート
        const alertTypes: GuardRobotAlert['type'][] = ['motion', 'sound', 'breach', 'system']
        const severities: GuardRobotAlert['severity'][] = ['low', 'medium', 'high', 'critical']
        const locations = ['1階エントランス', '2階廊下', '駐車場', '裏口', '屋上']
        
        const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)] as GuardRobotAlert['type']
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)] as GuardRobotAlert['severity']
        const randomLocation = locations[Math.floor(Math.random() * locations.length)] as string
        
        const newAlert: Omit<GuardRobotAlert, 'id'> = {
          timestamp: Date.now(),
          type: randomType,
          severity: randomSeverity,
          location: randomLocation,
          description: 'ランダムに生成されたテストアラートです',
          status: 'active'
        }

        this.addAlert(newAlert).catch(console.error)
      }
    }, 30000) // 30秒ごと
  }

  /**
   * リソースをクリーンアップ
   */
  cleanup(): void {
    console.log('🧹 GuardRobotService のクリーンアップを実行中...')
    
    // Firebaseリスナーのクリーンアップ
    off(this.alertsRef)
    off(this.robotsRef)
    
    // コールバックのクリーンアップ
    this.alertsCallbacks.clear()
    this.robotsCallbacks.clear()
    
    // ネットワーク監視のクリーンアップ
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.retryFirebaseConnection)
      window.removeEventListener('offline', () => {})
    }
    
    // タイマーのクリーンアップ
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }
    
    console.log('✅ クリーンアップが完了しました')
  }
}

// シングルトンインスタンス
export const guardRobotService = new GuardRobotService()