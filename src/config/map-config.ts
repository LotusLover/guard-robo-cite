/**
 * 地図ピン座標とロケーション設定
 * 座標は%単位で指定（画像のどこに配置するか）
 */

export interface MapPinConfig {
  x: number  // X座標（%）
  y: number  // Y座標（%）
  label?: string  // 表示ラベル（省略可）
}

// 既存のlocation名と座標のマッピング
export const MAP_PINS: Record<string, MapPinConfig> = {
  // 教室棟・管理棟
  'A棟': { x: 49, y: 32, label: 'A棟' },
  'B棟': { x: 28, y: 28, label: 'B棟' },
  'C棟': { x: 41, y: 41, label: 'C棟' },
  'D棟': { x: 40, y: 47, label: 'D棟' },
  
  // 専門施設
  'オープン・イノベーション棟': { x: 63, y: 41, label: 'OI棟' },
  'OI棟': { x: 63, y: 41, label: 'OI棟' },
  '情報教育センター': { x: 51, y: 46, label: '情報C' },
  '情報C': { x: 51, y: 46, label: '情報C' },
  '技術教育センター 第一工場': { x: 56, y: 41, label: '第一工場' },
  '第一工場': { x: 56, y: 41, label: '第一工場' },
  '技術教育センター 第二工場': { x: 60, y: 46, label: '第二工場' },
  '第二工場': { x: 60, y: 46, label: '第二工場' },
  '地域実テクノセンター': { x: 52, y: 37, label: 'テクノC' },
  'テクノC': { x: 52, y: 37, label: 'テクノC' },
  '図書館': { x: 53, y: 19, label: '図書館' },
  '福利施設': { x: 61, y: 19, label: '食堂' },
  '食堂': { x: 61, y: 19, label: '食堂' },
  // '実験施設': { x: 48, y: 32, label: '実験施設' },
  
  // 体育施設（座標未確認）
  // '第一体育館': { x: 36, y: 70, label: '第一体育館' },
  // '第二体育館': { x: 42, y: 74, label: '第二体育館' },
  // '武道館': { x: 32, y: 72, label: '武道館' },
  // '記念講堂': { x: 28, y: 68, label: '記念講堂' },
  
  // 学生寮（座標未確認）
  // '学生寮1号館': { x: 70, y: 40, label: '寮1号館' },
  // '学生寮2号館': { x: 72, y: 44, label: '寮2号館' },
  // '学生寮3号館': { x: 74, y: 48, label: '寮3号館' },
  // '学生寮4号館': { x: 76, y: 52, label: '寮4号館' },
  // '学生寮5号館': { x: 78, y: 56, label: '寮5号館' },
  // '学生寮6号館': { x: 80, y: 60, label: '寮6号館' },
  // '学生寮7号館': { x: 82, y: 64, label: '寮7号館' },
  // '学生寮8号館': { x: 84, y: 68, label: '寮8号館' },
  // '学生寮9号館': { x: 86, y: 72, label: '寮9号館' },
  // '学生寮10号館': { x: 88, y: 76, label: '寮10号館' },
  
  // その他施設
  '駐車場': { x: 26, y: 25, label: '駐車場' },
}

// 地図画像の設定
export const MAP_CONFIG = {
  // 画像パス（public/Assets/map.pngを使用）
  IMAGE_PATH: '/guard-robo-cite/Assets/map.png',
  
  // 画像がない場合のフォールバック設定
  FALLBACK_ENABLED: true,
  
  // SVGフォールバックの建物サイズ
  BUILDING_WIDTH: 600,
  BUILDING_HEIGHT: 400,
  
  // ピンのアニメーション設定
  ANIMATION: {
    PULSE_DURATION: '1.5s',      // 点滅周期
    PING_DURATION: '2s',         // 波紋効果の周期
    SCALE_MAX: 1.3,              // 最大拡大率
  },
} as const

// 重要度別のピンカラー
export const SEVERITY_COLORS = {
  low: '#4ade80',      // 緑
  medium: '#fbbf24',   // 黄
  high: '#fb923c',     // オレンジ
  critical: '#ef4444', // 赤
  default: '#6b7280',  // グレー（通常時）
} as const

// SVGフォールバック用の建物構造
export const BUILDING_ROOMS = [
  { name: '屋上', x: 100, y: 50, width: 400, height: 100 },
  { name: '2F 廊下', x: 100, y: 150, width: 400, height: 100 },
  { name: '1F 入口', x: 150, y: 250, width: 200, height: 100 },
  { name: '駐車場', x: 350, y: 250, width: 150, height: 100 },
  { name: '裏口', x: 0, y: 200, width: 100, height: 150 },
]
