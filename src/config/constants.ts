/**
 * アプリケーション全体の定数定義
 */

// ==================== タイミング設定 ====================

/** ネットワーク・接続関連 (ミリ秒) */
export const TIMING = {
  // Firebase接続
  FIREBASE_RETRY_DELAY: 2000,              // Firebase再接続リトライ待機時間
  DATA_LOADING_TIMEOUT: 5000,              // データ取得タイムアウト
  
  // UI更新間隔
  NETWORK_STATUS_CHECK_INTERVAL: 5000,     // ネットワーク状態チェック間隔
  ROBOT_STATUS_UPDATE_INTERVAL: 10000,     // ロボット状態更新間隔
  DUMMY_ALERT_GENERATION_INTERVAL: 30000,  // ダミーアラート生成間隔
  
  // サウンド
  SYSTEM_START_SOUND_DELAY: 500,           // システム起動音の遅延
  
  // タイムスタンプ参照用
  ONE_MINUTE: 60000,
  THREE_MINUTES: 180000,
  FIVE_MINUTES: 300000,
  FIFTEEN_MINUTES: 900000,
  THIRTY_MINUTES: 1800000,
  ONE_HOUR: 3600000,
} as const

// ==================== 音声設定 ====================

/** 音量レベル (0.0 - 1.0) */
export const VOLUME = {
  // デフォルト
  DEFAULT: 0.5,
  BEEP_DEFAULT: 0.3,
  FADE_OUT_MIN: 0.01,
  
  // アラート種別
  ALERT_LOW: 0.6,
  ALERT_MEDIUM: 0.7,
  ALERT_HIGH: 0.8,
  ALERT_CRITICAL: 0.9,
  
  // システム音
  SUCCESS: 0.6,
  ERROR: 0.7,
  INFO: 0.5,
  SYSTEM_START: 0.7,
} as const

/** ビープ音設定 */
export const BEEP = {
  FREQUENCY: 800,                          // Hz
  DURATION: 0.2,                           // 秒
  WAVE_TYPE: 'triangle' as OscillatorType,
} as const

// ==================== ロボット・センサー設定 ====================

/** バッテリーレベル */
export const BATTERY = {
  MIN_LEVEL: 20,                           // 最小バッテリーレベル
  MAX_DECREASE_RATE: 2,                    // 1回の更新での最大減少量
  SIGNIFICANT_CHANGE_THRESHOLD: 1,         // 更新を行う最小変化量（%）
  
  // 初期値（ダミーデータ用）
  INITIAL_ROBOT_01: 85,
  INITIAL_ROBOT_02: 92,
  INITIAL_ROBOT_03: 23,
} as const

/** ハートビート設定 */
export const HEARTBEAT = {
  ONLINE_MAX_DELAY: 30000,                 // オンラインロボットの最大遅延
  OFFLINE_DELAY: 300000,                   // オフラインロボットの遅延
  RANDOM_RANGE: 60000,                     // ランダムな遅延範囲
  MIN_UPDATE_INTERVAL: 5000,               // 最小更新間隔（ms）
} as const

// ==================== 確率設定 ====================

/** ダミーデータ生成の確率 */
export const PROBABILITY = {
  DUMMY_ALERT_GENERATION: 0.1,             // 10%の確率で新規アラート生成
} as const

// ==================== UI設定 ====================

/** スケルトンスクリーン設定 */
export const SKELETON = {
  ROBOT_CARDS_COUNT: 3,                    // スケルトン表示するロボットカード数
  ALERT_CARDS_COUNT: 2,                    // スケルトン表示するアラートカード数
} as const

/** ページネーション設定 */
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,                      // 1ページあたりのアイテム数
  MAX_PAGES_DISPLAY: 5,                    // ページャーに表示する最大ページ数
} as const

/** タブ設定 */
export const TABS = {
  DEFAULT_TAB: 'active-alerts' as const,   // デフォルトで表示するタブ
  ANIMATION_DURATION: 300,                 // タブ切り替えアニメーション時間（ms）
} as const

// ==================== localStorage キー ====================

export const STORAGE_KEYS = {
  SOUND_SETTINGS: 'guard-robot-sound-settings',
  USER_PREFERENCES: 'guard-robot-user-preferences',
} as const
