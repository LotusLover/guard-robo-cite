<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import GuardRobotMonitor from './components/GuardRobotMonitor.vue'
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
  <GuardRobotMonitor />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
