// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdQJqWZ8S5FLW9R5QW3VABgU86O89Eggk",
  authDomain: "guard-robo-back.firebaseapp.com",
  databaseURL: "https://guard-robo-back-default-rtdb.firebaseio.com",
  projectId: "guard-robo-back",
  storageBucket: "guard-robo-back.firebasestorage.app",
  messagingSenderId: "726817099397",
  appId: "1:726817099397:web:dbc2d7eac590a9a7e1e3ec"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Realtime Databaseのインスタンスを取得
export const database = getDatabase(app)

// 開発環境でエミュレーターを使用する場合（オプション）
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectDatabaseEmulator(database, 'localhost', 9000)
    console.log('🔥 Firebase Database Emulator に接続しました')
  } catch (error) {
    console.warn('Database Emulator接続に失敗:', error)
  }
}

// ネットワーク状態の監視
export const monitorNetworkStatus = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('🌐 ネットワークが復旧しました')
    })
    
    window.addEventListener('offline', () => {
      console.log('📡 ネットワークが切断されました')
    })
  }
}

export default app