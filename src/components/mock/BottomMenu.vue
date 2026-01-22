<template>
  <div
    class="bottom-menu"
    :style="{
      background: currentTheme.background,
      color: currentTheme.textColor
    }"
  >
    <div class="status-group">
      <el-tooltip :content="$t('mock.bottomMenu.versionTooltip')" placement="top">
        <span class="status-item status-version">
          v1.0.0
        </span>
      </el-tooltip>
      <span class="status-divider">|</span>
      <el-tooltip :content="$t('mock.bottomMenu.wordCount')" placement="top">
        <span class="status-item status-word-count">
          {{ $t('mock.bottomMenu.wordCount') }} 1234
        </span>
      </el-tooltip>
      <span class="status-divider">|</span>
      <span class="status-item status-file">
        {{ $t('mock.bottomMenu.currentFile') }}example.md
      </span>
    </div>
    <div class="actions-group">
      <el-tooltip :content="$t('mock.bottomMenu.logConsoleTooltip')" placement="top">
        <span class="status-item status-logger">
          <el-icon class="status-icon" size="14">
            <Document />
          </el-icon>
          <span class="status-text">{{ $t('mock.bottomMenu.logConsoleLabel') }}</span>
        </span>
      </el-tooltip>
      <span class="status-divider">|</span>
      <el-tooltip :content="$t('mock.bottomMenu.notificationTooltip')" placement="top">
        <span class="status-item status-notification">
          <el-icon class="status-icon" size="14">
            <BellFilled />
          </el-icon>
          <span class="status-text">{{ $t('mock.bottomMenu.notificationEmpty') }}</span>
        </span>
      </el-tooltip>
      <span class="status-divider">|</span>
      <el-tooltip :content="$t('mock.bottomMenu.aiTaskQueueTooltip')" placement="top">
        <span class="ai-task-menu">
          <img 
            :src="currentTheme.AiLogo" 
            alt="AI" 
          />
          <span class="ai-task-label">{{ $t('mock.bottomMenu.aiTaskQueueLabel') }}</span>
          <span class="ai-task-count">0</span>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { BellFilled, Document } from '@element-plus/icons-vue'
import { useMockTheme } from './utils/theme'

const { t } = useI18n()
const { currentTheme } = useMockTheme()
</script>

<style scoped>
.bottom-menu {
  height: 30px;
  width: 100%;
  border: 1px solid #cccccc44;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  font-size: 12px;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

@media (max-width: 767px) {
  .bottom-menu {
    padding: 0 8px;
    font-size: 10px;
  }
  
  .status-group {
    gap: 6px;
  }
  
  .status-divider {
    display: none;
  }
  
  .status-item {
    gap: 4px;
  }
  
  .status-file {
    max-width: 30vw;
  }
  
  .actions-group {
    gap: 6px;
    margin-left: 6px;
  }
  
  .status-text {
    display: none;
  }
  
  .ai-task-label {
    display: none;
  }
}

.status-group {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  flex: 1 1 auto;
  min-width: 0;
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: default;
  pointer-events: none;
}

.status-file {
  max-width: 40vw;
}

.status-divider {
  opacity: 0.4;
  user-select: none;
}

.status-notification,
.status-logger,
.status-word-count {
  padding: 4px 6px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.status-icon {
  display: flex;
}

.status-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  margin-left: 12px;
  flex-shrink: 0;
}

.ai-task-menu {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: default;
  user-select: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  pointer-events: none;
}

.ai-task-menu img {
  width: 18px;
  height: 18px;
}

.ai-task-label {
  font-weight: 500;
}

.ai-task-count {
  font-weight: bold;
}
</style>

