<template>
  <section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <ThreeScene ref="threeSceneRef" />
    
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="flex flex-col items-center mb-8">
        <div 
          class="logo-container animate-float"
          :class="{ 'shake': isShaking }"
          @click="handleLogoClick"
        >
          <div class="logo-animation-wrapper">
            <img src="/logo.svg" alt="MetaDoc Logo" class="logo-image h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32" />
          </div>
        </div>
      </div>
      
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 hero-title px-4">
        {{ $t('hero.title') }}
      </h1>
      
      <p class="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 px-4">
        {{ $t('hero.subtitle') }}
      </p>
      
      <p class="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-5xl mx-auto px-4">
        {{ $t('hero.description') }}
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="#download"
          class="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {{ $t('hero.download') }}
        </a>
        <a
          href="#features"
          class="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold text-lg border-2 border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {{ $t('hero.learnMore') }}
        </a>
      </div>
    </div>
    
    <div 
      class="scroll-down-button absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
      @click="scrollToPreview"
    >
      <div class="scroll-down-wrapper">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import ThreeScene from './ThreeScene.vue'

const isShaking = ref(false)
const threeSceneRef = ref(null)

const handleLogoClick = () => {
  isShaking.value = true
  // 触发粒子聚拢效果
  if (threeSceneRef.value) {
    threeSceneRef.value.triggerParticleEffect()
  }
  setTimeout(() => {
    isShaking.value = false
  }, 1500) // 动画持续时间
}

const scrollToPreview = () => {
  const element = document.getElementById('mock-showcase')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.logo-container {
  display: inline-block;
  transition: transform 0.3s ease;
  cursor: pointer;
  margin: 0 auto;
}

.logo-container:hover {
  transform: scale(1.2);
}

.logo-container.shake {
  transform: scale(1.2);
}

.logo-container.shake:hover {
  transform: scale(1.2);
}

.logo-animation-wrapper {
  display: inline-block;
}

.logo-image {
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  transition: filter 0.3s ease;
}

.logo-container:hover .logo-image {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
}

/* 摇晃动画 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px) rotate(-5deg);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px) rotate(5deg);
  }
}

.logo-container.shake .logo-animation-wrapper {
  animation: shake 1.5s ease-in-out;
}

/* 向下滚动按钮样式 */
.scroll-down-button {
  z-index: 10;
}

.scroll-down-wrapper {
  padding: 10px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .scroll-down-wrapper {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.scroll-down-button:hover .scroll-down-wrapper {
  background-color: rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.dark .scroll-down-button:hover .scroll-down-wrapper {
  background-color: rgba(0, 0, 0, 0.35);
}

.scroll-down-button:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.dark .scroll-down-button:hover svg {
  color: rgba(255, 255, 255, 0.9);
}
</style>

