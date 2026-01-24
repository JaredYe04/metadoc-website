<template>
  <section id="about" class="relative py-20 overflow-visible panel-blur-edge panel-blur-edge-white-last">
    <GeometricFlowAnimation />
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="about-header mb-8">
        <div class="logo-container">
          <img src="/logo.svg" alt="MetaDoc Logo" class="app-logo" />
        </div>
        <div class="app-info">
          <h2 class="app-name">{{ $t('about.appName') }}</h2>
          <div class="version-info">
            <span class="version-label">{{ $t('about.version') }}:</span>
            <span class="version-value">{{ version }}</span>
          </div>
          <div v-if="releaseDate" class="release-date">
            <span class="date-label">{{ $t('about.releaseDate') }}:</span>
            <span class="date-value">{{ formatDate(releaseDate) }}</span>
          </div>
          <div class="build-environment">
            <span class="env-label">{{ $t('about.buildEnvironment') }}:</span>
            <span class="env-value">{{ buildEnvironment }}</span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 pt-8"></div>

      <!-- 标签页 -->
      <div class="mt-8">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              @click="activeTab = tab.name"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.name
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- 标签页内容 -->
        <div class="mt-8">
          <!-- 开源许可证 -->
          <div v-if="activeTab === 'licenses'" class="licenses-section">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre class="license-content whitespace-pre-wrap text-sm font-mono text-gray-700 dark:text-gray-300">{{ openSourceLicenses }}</pre>
            </div>
          </div>

          <!-- 第三方资产 -->
          <div v-if="activeTab === 'assets'" class="assets-section">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre class="assets-content whitespace-pre-wrap text-sm font-mono text-gray-700 dark:text-gray-300">{{ thirdPartyAssets }}</pre>
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
import { getLatestRelease } from '../services/github'
import { i18n } from '../i18n'
import openSourceLicensesText from '../assets/open-source-licenses.txt?raw'
import thirdPartyAssetsText from '../assets/third-party-assets.txt?raw'
import GeometricFlowAnimation from './animations/GeometricFlowAnimation.vue'

const { t } = useI18n()

const version = ref('1.0.0')
const releaseDate = ref(null)
const buildEnvironment = ref('Release')
const activeTab = ref('licenses')
const openSourceLicenses = ref('Loading...')
const thirdPartyAssets = ref('Loading...')

const tabs = computed(() => [
  { name: 'licenses', label: t('about.openSourceLicenses') },
  { name: 'assets', label: t('about.thirdPartyAssets') }
])

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const locale = i18n.global.locale.value
    return date.toLocaleDateString(locale === 'zh_CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

onMounted(async () => {
  try {
    const release = await getLatestRelease()
    if (release && release.version !== 'v0.0.0') {
      version.value = release.version
      releaseDate.value = release.publishedAt
    }
  } catch (error) {
    console.error('Failed to load version info:', error)
  }

  // 加载许可证和资产信息
  try {
    openSourceLicenses.value = openSourceLicensesText
    thirdPartyAssets.value = thirdPartyAssetsText
  } catch (error) {
    console.error('Failed to load license and assets files:', error)
    openSourceLicenses.value = 'Failed to load licenses.'
    thirdPartyAssets.value = 'Failed to load assets.'
  }
})
</script>

<style scoped>
.about-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

@media (min-width: 640px) {
  .about-header {
    flex-direction: row;
    gap: 32px;
  }
}

.logo-container {
  flex-shrink: 0;
}

.app-logo {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .app-logo {
    width: 128px;
    height: 128px;
    border-radius: 16px;
  }
}

.app-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-primary, #1f2937);
}

@media (min-width: 640px) {
  .app-name {
    font-size: 28px;
  }
}

.dark .app-name {
  color: #f9fafb;
}

.version-info,
.release-date,
.build-environment {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color-regular, #6b7280);
}

.dark .version-info,
.dark .release-date,
.dark .build-environment {
  color: #9ca3af;
}

.version-label,
.date-label,
.env-label {
  font-weight: 500;
}

.version-value,
.date-value,
.env-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: var(--text-color-primary, #1f2937);
}

.dark .version-value,
.dark .date-value,
.dark .env-value {
  color: #f9fafb;
}

.license-content,
.assets-content {
  margin: 0;
  line-height: 1.6;
  user-select: text;
}
</style>

