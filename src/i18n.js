import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh_CN.json'
import enUS from './locales/en_US.json'

const savedLang = localStorage.getItem('lang') || 'zh_CN'

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'zh_CN',
  messages: {
    zh_CN: zhCN,
    en_US: enUS
  }
})

export const setLocale = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('lang', locale)
}

