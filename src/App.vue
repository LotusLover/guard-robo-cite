<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import GuardRobotMonitor from './components/GuardRobotMonitor.vue'
import TestControlPanel from './components/TestControlPanel.vue'
import { guardRobotService } from './services/guard-robot-service'

onMounted(async () => {
  // ダミーデータを初期化
  await guardRobotService.initializeDummyData()
  // ダミーのリアルタイム更新を開始
  guardRobotService.startDummyUpdates()
})

onUnmounted(() => {
  // リソースをクリーンアップ
  guardRobotService.cleanup()
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🛡️ 警備ロボット監視システム</h1>
      <p class="subtitle">Guard Robot Monitoring System</p>
    </header>
    
    <main class="app-main">
      <!-- テストコントロールパネル -->
      <TestControlPanel />
      
      <!-- 監視モニター -->
      <GuardRobotMonitor />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2025 Guard Robot Monitoring System</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 2rem;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.app-header .subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 300;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 1rem;
  text-align: center;
  color: white;
  opacity: 0.8;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.8rem;
  }
  
  .app-main {
    padding: 1rem;
  }
}
</style>
