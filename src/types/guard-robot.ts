// 警備ロボットの反応データの型定義

export interface GuardRobotAlert {
  id: string
  timestamp: number
  type: 'motion' | 'sound' | 'breach' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  status: 'active' | 'acknowledged' | 'resolved'
}

export interface GuardRobotStatus {
  id: string
  name: string
  location: string
  isOnline: boolean
  batteryLevel: number
  lastHeartbeat: number
}