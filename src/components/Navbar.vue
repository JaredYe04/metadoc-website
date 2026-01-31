<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200 dark:border-gray-800 select-none"
  style="z-index: 1000000;"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <div 
            class="navbar-logo-container flex items-center"
            :class="{ 'shake': isLogoShaking }"
            @click="handleLogoClick"
          >
            <div class="navbar-logo-wrapper">
              <img src="/logo.svg" alt="MetaDoc" class="h-6 w-6" />
            </div>
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white flex items-center">MetaDoc</span>
        </div>
        
        <!-- 桌面端导航 -->
        <div class="hidden md:flex items-center space-x-8">
          <a 
            v-for="item in navItems" 
            :key="item.name"
            :href="item.href"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t(`nav.${item.key}`) }}
          </a>
        </div>
        
        <!-- 移动端汉堡菜单按钮 -->
        <button
          @click="showMobileMenu = !showMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :aria-label="showMobileMenu ? 'Close menu' : 'Open menu'"
        >
          <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="flex items-center space-x-4">
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <!-- 语言选择下拉菜单 -->
          <div class="relative" ref="languageMenuRef">
            <button
              ref="languageButtonRef"
              @click="showLanguageMenu = !showLanguageMenu"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :aria-label="$t('nav.language')"
            >
              <img :src="languageIcon" alt="Language" class="w-5 h-5" />
            </button>
            
            <!-- 下拉菜单 -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
              >
              <button
                v-for="lang in languages"
                :key="lang.value"
                @click="selectLanguage(lang.value)"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': currentLocale === lang.value }"
              >
                <span>{{ lang.label }}</span>
                <svg v-if="currentLocale === lang.value" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              </div>
            </Transition>
          </div>
          <!-- 用户反馈（语言切换右侧） -->
          <el-tooltip :content="$t('nav.feedback')" placement="bottom">
            <button
              @click="openFeedbackDialog?.()"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :aria-label="$t('nav.feedback')"
            >
              <img :src="feedbackIcon" alt="Feedback" class="w-5 h-5" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 transform -translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-2"
    >
      <div
        v-if="showMobileMenu"
        class="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg"
      >
        <div class="px-4 py-3 space-y-2">
          <a 
            v-for="item in navItems" 
            :key="item.name"
            :href="item.href"
            @click="showMobileMenu = false"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {{ $t(`nav.${item.key}`) }}
          </a>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'
import { setLocale } from '../i18n'
import languageBlack from '@icons/language-black.svg'
import languageWhite from '@icons/language-white.svg'
import feedbackBlack from '@icons/feedback-black.svg'
import feedbackWhite from '@icons/feedback-white.svg'

const openFeedbackDialog = inject('openFeedbackDialog', null)

const { t, locale } = useI18n()
const isDark = useDark({ 
  storageKey: 'theme', 
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})

const toggleTheme = () => {
  // useDark 会自动处理 DOM 更新和 localStorage
  isDark.value = !isDark.value
}

const showLanguageMenu = ref(false)
const showMobileMenu = ref(false)
const languageMenuRef = ref(null)
const languageButtonRef = ref(null)
const currentLocale = ref(locale.value)
const isLogoShaking = ref(false)

const languageIcon = computed(() => isDark.value ? languageWhite : languageBlack)
const feedbackIcon = computed(() => isDark.value ? feedbackWhite : feedbackBlack)

const languages = [
  { value: 'zh_CN', label: '中文' },
  { value: 'en_US', label: 'English' }
]

const navItems = [
  { name: 'Home', key: 'home', href: '#home' },
  { name: 'Mock', key: 'mock', href: '#mock-showcase' },
  { name: 'Features', key: 'features', href: '#features' },
  { name: 'Download', key: 'download', href: '#download' },
  { name: 'About', key: 'about', href: '#about' }
]

const selectLanguage = (lang) => {
  currentLocale.value = lang
  setLocale(lang)
  locale.value = lang
  showLanguageMenu.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (
    languageMenuRef.value &&
    languageButtonRef.value &&
    !languageMenuRef.value.contains(event.target) &&
    !languageButtonRef.value.contains(event.target)
  ) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogoClick = () => {
  isLogoShaking.value = true
  setTimeout(() => {
    isLogoShaking.value = false
  }, 1500)
}
</script>

<style scoped>
.navbar-logo-container {
  display: inline-block;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.navbar-logo-container:hover {
  transform: scale(1.2);
}

.navbar-logo-container.shake {
  transform: scale(1.2);
}

.navbar-logo-wrapper {
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 2px;
  transition: border-color 0.3s ease;
}

.dark .navbar-logo-wrapper {
  border-color: rgba(255, 255, 255, 0.1);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px) rotate(-3deg);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px) rotate(3deg);
  }
}

.navbar-logo-container.shake .navbar-logo-wrapper {
  animation: shake 1.5s ease-in-out;
}
</style>

