<template>
  <UIMenu 
    :collapse="isCollapse"
    :background-color="currentTheme.background2nd"
    :text-color="currentTheme.SideTextColor"
    :style="{ '--sub-menu-hover': activeBackgroundColor }"
  >
    <!-- 顶部菜单项 -->
      <UISubMenu
      :title="$t('mock.leftMenu.file')"
      :tooltip="$t('mock.leftMenu.file')"
      :icon-image="currentTheme.FileIcon"
      trigger="click"
      :level="1"
    >
      <template #title>
        <img :src="currentTheme.FileIcon" class="menu-icon-image" alt="file" />
        <span>{{ $t('mock.leftMenu.file') }}</span>
      </template>

      <UISubMenuItem :is-title="true" :disabled="true">
        <template #icon>
          <img :src="currentTheme.FileIcon" class="menu-title-icon" alt="file" />
        </template>
        {{ $t('mock.leftMenu.fileTooltip') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="DocumentAdd">
        {{ $t('mock.leftMenu.new') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="FolderOpened">
        {{ $t('mock.leftMenu.open') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="FolderChecked">
        {{ $t('mock.leftMenu.saveAll') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="FolderChecked">
        {{ $t('mock.leftMenu.save') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="FolderAdd">
        {{ $t('mock.leftMenu.saveAs') }}
      </UISubMenuItem>

      <UISubMenu :icon="FirstAidKit" :title="$t('mock.leftMenu.export')" trigger="hover" :level="2">
        <template #title>
          <span>{{ $t('mock.leftMenu.export') }}</span>
        </template>

        <UISubMenuItem :is-title="true" :disabled="true">
          <template #icon>
            <el-icon>
              <FirstAidKit />
            </el-icon>
          </template>
          {{ $t('mock.leftMenu.export') }}
        </UISubMenuItem>

        <UISubMenuItem>PDF</UISubMenuItem>
        <UISubMenuItem>Word</UISubMenuItem>
        <UISubMenuItem>HTML</UISubMenuItem>
      </UISubMenu>

      <UISubMenuItem :icon="CircleClose">
        {{ $t('mock.leftMenu.closeFile') }}
      </UISubMenuItem>
    </UISubMenu>

    <UISubMenu
      :title="$t('mock.leftMenu.aiAssistant')"
      :tooltip="$t('mock.leftMenu.aiAssistant')"
      :icon-image="currentTheme.AiLogo"
      trigger="click"
      :level="1"
    >
      <template #title>
        <img :src="currentTheme.AiLogo" alt="AI" class="ai-logo-icon" />
        <span>{{ $t('mock.leftMenu.aiAssistant') }}</span>
      </template>

      <UISubMenuItem :is-title="true" :disabled="true">
        <template #icon>
          <img :src="currentTheme.AiLogo" alt="AI" class="menu-title-icon" />
        </template>
        {{ $t('mock.leftMenu.aiToolTooltip') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="ChatDotRound">
        {{ $t('mock.leftMenu.chatWithAI') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="Reading">
        {{ $t('mock.leftMenu.handwritingFormulaRecognition') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="Picture">
        {{ $t('mock.leftMenu.smartDrawingAssistant') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="DataAnalysis">
        {{ $t('mock.leftMenu.dataAnalysis') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="View">
        {{ $t('mock.leftMenu.ocr') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="Paperclip">
        {{ $t('mock.leftMenu.attachment') }}
      </UISubMenuItem>
    </UISubMenu>

    <UIMenuItem
      :label="$t('mock.leftMenu.settings')"
      :tooltip="$t('mock.leftMenu.settings')"
      :icon-image="currentTheme.SettingIcon"
    />

    <UISubMenu
      :title="$t('mock.leftMenu.recentFiles')"
      :tooltip="$t('mock.leftMenu.recentFiles')"
      :icon-image="currentTheme.RecentIcon"
      trigger="click"
      :level="1"
      class="recent-files-menu"
    >
      <template #title>
        <el-icon class="recent-files-icon">
          <Clock />
        </el-icon>
        <span class="recent-files-text">{{ $t('mock.leftMenu.recentFiles') }}</span>
      </template>

      <UISubMenuItem :is-title="true" :disabled="true">
        <template #icon>
          <el-icon>
            <Clock />
          </el-icon>
        </template>
        {{ $t('mock.leftMenu.recentFilesTooltip') }}
      </UISubMenuItem>

      <UISubMenuItem
        v-for="item in mockRecentDocs"
        :key="item"
        :icon="Document"
      >
        {{ item }}
      </UISubMenuItem>
    </UISubMenu>

    <UISubMenu
      :title="$t('mock.leftMenu.langTooltip')"
      :tooltip="$t('mock.leftMenu.langTooltip')"
      :icon-image="currentTheme.LanguageIcon"
      trigger="click"
      :level="1"
    >
      <template #title>
        <img :src="currentTheme.LanguageIcon" class="menu-icon-image" alt="language" />
        <span>{{ $t('mock.leftMenu.langTooltip') }}</span>
      </template>

      <UISubMenuItem :is-title="true" :disabled="true">
        <template #icon>
          <img :src="currentTheme.LanguageIcon" class="menu-title-icon" alt="language" />
        </template>
        {{ $t('mock.leftMenu.langTooltip') }}
      </UISubMenuItem>

      <UISubMenuItem>中文（简体）</UISubMenuItem>
      <UISubMenuItem>English (US)</UISubMenuItem>
      <UISubMenuItem>日本語</UISubMenuItem>
      <UISubMenuItem>한국어</UISubMenuItem>
      <UISubMenuItem>Français</UISubMenuItem>
      <UISubMenuItem>Deutsch</UISubMenuItem>
    </UISubMenu>

    <UIMenuItem
      :label="$t('mock.leftMenu.knowledgeBase', '知识库')"
      :tooltip="$t('mock.leftMenu.knowledgeBase', '知识库')"
      :icon-image="currentTheme.KnowledgeIcon"
    />

    <UIMenuItem
      :label="$t('mock.leftMenu.workspaceExplorer', '工作目录')"
      :tooltip="$t('mock.leftMenu.workspaceExplorer', '工作目录')"
      :icon-image="currentTheme.FolderIcon"
    />

    <!-- 顶部和底部之间的分隔符 -->
    <div class="menu-spacer"></div>

    <!-- 底部菜单项 -->
    <UIMenuItem
      :label="$t('mock.leftMenu.home', '主页')"
      :tooltip="$t('mock.leftMenu.home', '主页')"
      :icon="House"
      class="bottom-menu"
    />

    <UISubMenu
      :title="$t('mock.leftMenu.exit')"
      :tooltip="$t('mock.leftMenu.exit')"
      :icon="SwitchButton"
      trigger="click"
      :level="1"
      class="bottom-menu"
    >
      <template #title>
        <el-icon>
          <SwitchButton />
        </el-icon>
        <span>{{ $t('mock.leftMenu.exit') }}</span>
      </template>

      <UISubMenuItem :is-title="true" :disabled="true">
        <template #icon>
          <el-icon>
            <SwitchButton />
          </el-icon>
        </template>
        {{ $t('mock.leftMenu.exitTooltip') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="SwitchButton">
        {{ $t('mock.leftMenu.saveAndExit') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="SwitchButton">
        {{ $t('mock.leftMenu.saveAllAndExit') }}
      </UISubMenuItem>

      <UISubMenuItem :icon="SwitchButton">
        {{ $t('mock.leftMenu.exitWithoutSaving') }}
      </UISubMenuItem>
    </UISubMenu>
  </UIMenu>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Document,
  FirstAidKit,
  Setting,
  ChatDotRound,
  DataAnalysis,
  DocumentAdd,
  FolderOpened,
  FolderChecked,
  FolderAdd,
  CircleClose,
  Clock,
  SwitchButton,
  Picture,
  Reading,
  View,
  Paperclip,
  House
} from '@element-plus/icons-vue'
import { useMockTheme, mixColors } from './utils/theme'
import UIMenu from './ui/UIMenu.vue'
import UIMenuItem from './ui/UIMenuItem.vue'
import UISubMenu from './ui/UISubMenu.vue'
import UISubMenuItem from './ui/UISubMenuItem.vue'

const { t } = useI18n()
const { currentTheme } = useMockTheme()

const isCollapse = ref(true)
const mockRecentDocs = ref(['example.md', 'document.tex', 'notes.txt'])

// 计算弹出菜单的背景色和悬停颜色（与 HeadMenu 保持一致）
const subMenuBackgroundColor = computed(() => currentTheme.value.background2nd)
// 使用与 HeadMenu 相同的 active 背景色作为 hover 和 active 颜色
const activeBackgroundColor = computed(() => mixColors(currentTheme.value.background2nd, currentTheme.value.textColor, 0.3))
const activeTextColor = computed(() => currentTheme.value.textColor)
const subMenuHoverColor = computed(() => activeBackgroundColor.value)

// 提供 collapse 状态给子组件
provide('menuCollapse', isCollapse)
</script>

<style scoped>
.bottom-menu {
  margin-top: auto;
}

.ai-logo-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-title-icon {
  width: 16px;
  height: 16px;
  margin: 0;
}

.menu-icon-image {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.menu-spacer {
  flex: 1;
  min-height: 0;
}

.recent-files-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.recent-files-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
}

/* 悬停效果 - 圆角背景框（与 HeadMenu 保持一致） */
.ui-menu :deep(.ui-menu-item:hover),
.ui-menu :deep(.ui-sub-menu__title:hover) {
  background-color: v-bind('activeBackgroundColor') !important;
  border-radius: 6px;
}

/* 激活状态（与 HeadMenu 保持一致） */
.ui-menu :deep(.ui-menu-item.is-active) {
  background-color: v-bind('activeBackgroundColor') !important;
  color: v-bind('activeTextColor') !important;
  border-radius: 6px;
}

/* 打开的 submenu 标题应该显示 active 颜色 */
.ui-menu :deep(.ui-sub-menu.is-opened > .ui-sub-menu__title) {
  background-color: v-bind('activeBackgroundColor') !important;
  color: v-bind('activeTextColor') !important;
  border-radius: 6px;
}
</style>

