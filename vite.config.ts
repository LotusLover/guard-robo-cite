import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/guard-robo-cite/', // GitHub Pagesのリポジトリ名に合わせて調整
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          firebase: ['firebase/app', 'firebase/database']
        }
      }
    }
  }
})
