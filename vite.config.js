import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@icons': path.resolve(__dirname, './src/assets/icons')
      }
    },
    base: isProduction ? '/metadoc-website/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    }
  }
})

