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
              <p v-if="latestRelease.publishedAt" class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                {{ formatDate(latestRelease.publishedAt) }}
              </p>
            </div>
            <div
              class="flex flex-wrap gap-3 w-full sm:w-auto justify-center sm:justify-end"
              @mouseleave="hoveredPlatform = null"
            >
              <a
                v-if="platformUrl('windows')"
                :href="platformUrl('windows')"
                target="_blank"
                rel="noopener noreferrer"
                :class="[
                  'flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transform hover:scale-105 transition-all duration-200',
                  isHighlighted('windows')
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                ]"
                @mouseenter="hoveredPlatform = 'windows'"
              >
                <img
                  :src="isHighlighted('windows') ? windowsWhiteIcon : (isDark ? windowsWhiteIcon : windowsBlackIcon)"
                  alt="Windows"
                  :class="['w-5 h-5', !isHighlighted('windows') && !isDark && 'opacity-70']"
                />
                <span>{{ $t('download.windows') }}</span>
              </a>
              <a
                v-if="platformUrl('mac')"
                :href="platformUrl('mac')"
                target="_blank"
                rel="noopener noreferrer"
                :class="[
                  'flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transform hover:scale-105 transition-all duration-200',
                  isHighlighted('mac')
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                ]"
                @mouseenter="hoveredPlatform = 'mac'"
              >
                <img
                  :src="appleIcon"
                  alt="macOS"
                  :class="['w-5 h-5', !isHighlighted('mac') && !isDark && 'download-btn-muted-icon']"
                />
                <span>{{ $t('download.mac') }}</span>
              </a>
              <a
                v-if="platformUrl('linux')"
                :href="platformUrl('linux')"
                target="_blank"
                rel="noopener noreferrer"
                :class="[
                  'flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transform hover:scale-105 transition-all duration-200',
                  isHighlighted('linux')
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                ]"
                @mouseenter="hoveredPlatform = 'linux'"
              >
                <img
                  :src="linuxIcon"
                  alt="Linux"
                  :class="['w-5 h-5', !isHighlighted('linux') && !isDark && 'download-btn-muted-icon']"
                />
                <span>{{ $t('download.linux') }}</span>
              </a>
              <a
                v-if="!hasAnyPlatformUrl && latestRelease.downloadUrl"
                :href="latestRelease.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-2 px-4 sm:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span>{{ $t('download.download') }}</span>
              </a>
            </div>
          </div>
          
          <!-- 系统要求（Win / Mac / Linux）同一行等宽；查看详情另起一行 -->
          <div v-if="latestRelease" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span v-if="platformUrl('windows')" class="flex flex-1 min-w-0 items-center gap-1.5">
                <img :src="windowsIcon" alt="Windows" class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{{ $t('download.systemRequirementWindows') }}</span>
              </span>
              <span v-if="platformUrl('mac')" class="flex flex-1 min-w-0 items-center gap-1.5">
                <img :src="appleIcon" alt="macOS" class="w-4 h-4 flex-shrink-0 requirement-row-icon-apple" />
                <span class="truncate">{{ $t('download.systemRequirementMac') }}</span>
              </span>
              <span v-if="platformUrl('linux')" class="flex flex-1 min-w-0 items-center gap-1.5">
                <img :src="linuxIcon" alt="Linux" class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{{ $t('download.systemRequirementLinux') }}</span>
              </span>
            </div>
            <a
              v-if="latestRelease.htmlUrl"
              :href="latestRelease.htmlUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {{ $t('download.viewLatestDetails') }}
            </a>
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
import appleIcon from '@icons/apple.svg'
import linuxIcon from '@icons/linux.svg'
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

// 根据 UA 推断当前操作系统，默认高亮对应下载按钮
const detectedPlatform = ref(null)
// 鼠标悬停时高亮该按钮，取消默认高亮
const hoveredPlatform = ref(null)
function detectPlatform() {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent.toLowerCase()
  if (/mac|iphone|ipad/.test(ua)) return 'mac'
  if (/linux|android/.test(ua)) return 'linux'
  if (/win|windows/.test(ua)) return 'windows'
  return null
}
/** 当前应高亮的平台：有悬停则高亮悬停项，否则高亮用户环境 */
function isHighlighted(platform) {
  if (hoveredPlatform.value !== null) return hoveredPlatform.value === platform
  return detectedPlatform.value === platform
}

const githubIcon = computed(() => isDark.value ? githubWhite : githubBlack)
const steamIcon = computed(() => isDark.value ? steamWhite : steamBlack)
const windowsIcon = computed(() => isDark.value ? windowsWhite : windowsBlack)
const windowsWhiteIcon = computed(() => windowsWhite)
const windowsBlackIcon = computed(() => windowsBlack)

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

const downloadByPlatform = () => latestRelease.value?.downloadByPlatform || {}
const platformUrl = (platform) => downloadByPlatform()[platform] || null
const hasAnyPlatformUrl = () => {
  const p = downloadByPlatform()
  return !!(p.windows || p.mac || p.linux)
}

onMounted(async () => {
  detectedPlatform.value = detectPlatform()
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

<style scoped>
/* 非高亮下载按钮在浅色模式下使用深色图标，保证在浅灰背景上可见 */
.download-btn-muted-icon {
  filter: brightness(0);
  opacity: 0.75;
}
/* 系统要求行：Apple 图标为白色，浅色模式下转为深色以匹配文字 */
.requirement-row-icon-apple {
  filter: brightness(0);
  opacity: 0.8;
}
.dark .requirement-row-icon-apple {
  filter: none;
  opacity: 1;
}
</style>

