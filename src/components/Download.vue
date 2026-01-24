<template>
  <section id="download" class="relative py-20 overflow-visible panel-blur-edge panel-blur-edge-gray-between-white">
    <PulseWaveAnimation />
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gradient">
          {{ $t('download.title') }}
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          {{ $t('download.subtitle') }}
        </p>
      </div>
      
      <div class="max-w-4xl mx-auto">
        <!-- 最新版本卡片 -->
        <div v-if="loading" class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('download.loading') }}</p>
        </div>
        
        <div v-else-if="error" class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
          <p class="text-red-600 dark:text-red-400">{{ $t('download.error') }}</p>
        </div>
        
        <div v-else-if="latestRelease" class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-8 border-2 border-primary-200 dark:border-primary-700">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <span class="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-2">
                {{ $t('download.latest') }}
              </span>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {{ latestRelease.version }}
              </h3>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                {{ formatDate(latestRelease.publishedAt) }}
              </p>
            </div>
            <a
              v-if="latestRelease.downloadUrl"
              :href="latestRelease.downloadUrl"
              target="_blank"
              class="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <img :src="windowsWhiteIcon" alt="Windows" class="w-5 h-5" />
              <span>{{ $t('download.download') }}</span>
            </a>
          </div>
          
          <!-- 系统要求 -->
          <div v-if="latestRelease" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
              <img :src="windowsIcon" alt="Windows" class="w-4 h-4" />
              <span>{{ $t('download.systemRequirement') }}</span>
            </p>
          </div>
        </div>
        
        <!-- 平台链接 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="https://github.com/JaredYe04/MetaDoc-Releases"
            target="_blank"
            class="group bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transform hover:scale-105 transition-all duration-200"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                <img :src="githubIcon" alt="GitHub" class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ $t('download.github') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  GitHub Repository
                </p>
              </div>
            </div>
          </a>
          
          <div
            class="group bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 opacity-75 cursor-not-allowed"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <img :src="steamIcon" alt="Steam" class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ $t('download.steam') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('download.comingSoon') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'
import { getLatestRelease } from '../services/github'
import { i18n } from '../i18n'
import githubBlack from '@icons/github-black.svg'
import githubWhite from '@icons/github-white.svg'
import steamBlack from '@icons/steam-black.svg'
import steamWhite from '@icons/steam-white.svg'
import windowsBlack from '@icons/windows-black.svg'
import windowsWhite from '@icons/windows-white.svg'
import PulseWaveAnimation from './animations/PulseWaveAnimation.vue'

const { t } = useI18n()
const isDark = useDark({ 
  storageKey: 'theme', 
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})
const loading = ref(true)
const error = ref(false)
const latestRelease = ref(null)

const githubIcon = computed(() => isDark.value ? githubWhite : githubBlack)
const steamIcon = computed(() => isDark.value ? steamWhite : steamBlack)
const windowsIcon = computed(() => isDark.value ? windowsWhite : windowsBlack)
const windowsWhiteIcon = computed(() => windowsWhite)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const locale = i18n.global.locale.value
  return date.toLocaleDateString(locale === 'zh_CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    latestRelease.value = await getLatestRelease()
    // 如果版本是默认值，显示错误状态
    if (latestRelease.value?.version === 'v0.0.0') {
      error.value = true
    }
  } catch (e) {
    error.value = true
    console.error('Failed to fetch latest release:', e)
  } finally {
    loading.value = false
  }
})
</script>

