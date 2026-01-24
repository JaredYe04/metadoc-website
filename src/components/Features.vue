<template>
  <section id="features" class="relative py-20 overflow-visible panel-blur-edge panel-blur-edge-gray-to-white">
    <ParticleNetworkAnimation />
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gradient">
          {{ $t('features.title') }}
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          {{ $t('features.subtitle') }}
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
        >
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <component :is="feature.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {{ $t(`features.${feature.key}.title`) }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t(`features.${feature.key}.desc`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineComponent, h } from 'vue'
import ParticleNetworkAnimation from './animations/ParticleNetworkAnimation.vue'

const DocumentIcon = defineComponent({
  render: () => h('svg', {
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    })
  ])
})

const SparklesIcon = defineComponent({
  render: () => h('svg', {
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    })
  ])
})

const DownloadIcon = defineComponent({
  render: () => h('svg', {
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
    })
  ])
})

const ChartIcon = defineComponent({
  render: () => h('svg', {
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    })
  ])
})

const features = [
  { key: 'docEdit', icon: DocumentIcon },
  { key: 'ai', icon: SparklesIcon },
  { key: 'export', icon: DownloadIcon },
  { key: 'visualization', icon: ChartIcon }
]
</script>

