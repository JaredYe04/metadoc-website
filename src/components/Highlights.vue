<template>
  <section class="relative py-20 bg-white dark:bg-gray-900 overflow-hidden">
    <GradientFlowAnimation />
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gradient">
          {{ $t('highlights.title') }}
        </h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(highlight, index) in highlights"
          :key="index"
          class="group relative p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary-200 dark:bg-primary-800 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div class="relative">
            <h3 class="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300">
              {{ $t(`highlights.${highlight.key}.title`) }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ $t(`highlights.${highlight.key}.desc`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import GradientFlowAnimation from './animations/GradientFlowAnimation.vue'

const highlights = [
  { key: 'intelligent' },
  { key: 'efficient' },
  { key: 'professional' },
  { key: 'compatible' }
]
</script>

