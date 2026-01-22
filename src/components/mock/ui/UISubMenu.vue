<template>
  <div class="ui-sub-menu" ref="subMenuRef">
    <el-tooltip 
      v-if="tooltip && collapse && trigger === 'click'" 
      :content="tooltip" 
      placement="right"
    >
      <div
        class="ui-sub-menu__title"
        :class="{ 
          'is-collapsed': collapse && props.level === 1, 
          'is-open': isOpen,
          'is-nested': props.level > 1
        }"
      >
        <div class="ui-sub-menu__title-content">
          <slot name="icon">
            <el-icon v-if="icon" class="ui-sub-menu__icon">
              <component :is="icon" />
            </el-icon>
            <img v-else-if="iconImage" :src="iconImage" class="ui-sub-menu__icon-image" />
          </slot>
          <template v-if="shouldShowTitle">
            <slot name="title">
              <span class="ui-sub-menu__label">{{ title }}</span>
            </slot>
            <el-icon class="ui-sub-menu__arrow">
              <ArrowRight />
            </el-icon>
          </template>
        </div>
      </div>
    </el-tooltip>
    <div
      v-else
      class="ui-sub-menu__title"
      :class="{ 
        'is-collapsed': collapse && props.level === 1, 
        'is-open': isOpen,
        'is-nested': props.level > 1
      }"
    >
      <div class="ui-sub-menu__title-content">
        <slot name="icon">
          <el-icon v-if="icon" class="ui-sub-menu__icon">
            <component :is="icon" />
          </el-icon>
          <img v-else-if="iconImage" :src="iconImage" class="ui-sub-menu__icon-image" />
        </slot>
        <template v-if="shouldShowTitle">
          <slot name="title">
            <span class="ui-sub-menu__label">{{ title }}</span>
          </slot>
          <el-icon class="ui-sub-menu__arrow">
            <ArrowRight />
          </el-icon>
        </template>
      </div>
    </div>

    <!-- 子菜单弹出层 - Mock 版本始终显示，用于演示 -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popupRef"
        class="ui-sub-menu__popup"
        :style="popupStyle"
      >
        <div class="ui-sub-menu__popup-content">
          <slot />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { useMockTheme, mixColors } from '../utils/theme'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  tooltip: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    default: null
  },
  iconImage: {
    type: String,
    default: ''
  },
  trigger: {
    type: String,
    default: 'click'
  },
  level: {
    type: Number,
    default: 1
  }
})

const collapse = inject('menuCollapse', false)
const { currentTheme } = useMockTheme()

const activeBackgroundColor = computed(() => mixColors(currentTheme.value.background2nd, currentTheme.value.textColor, 0.3))
const activeTextColor = computed(() => currentTheme.value.textColor)

const shouldShowTitle = computed(() => {
  if (props.level > 1) {
    return true
  }
  return !collapse
})

const subMenuRef = ref(null)
const popupRef = ref(null)
// Mock 版本：默认不打开，但可以通过 hover 打开（仅用于演示）
const isOpen = ref(false)

const popupStyle = computed(() => {
  const baseBg = currentTheme.value.background2nd
  const hoverColor = activeBackgroundColor.value
  return {
    '--sub-menu-bg': baseBg,
    '--sub-menu-hover': hoverColor,
    backgroundColor: baseBg,
    zIndex: 2000 + props.level
  }
})
</script>

<style scoped>
.ui-sub-menu {
  position: relative;
}

.ui-sub-menu__title {
  height: 40px;
  line-height: 40px;
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  padding-left: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: pointer;
}

.ui-sub-menu__title:hover {
  background-color: v-bind('activeBackgroundColor');
  border-radius: 6px;
}

.ui-sub-menu__title.is-open {
  background-color: v-bind('activeBackgroundColor');
  color: v-bind('activeTextColor');
  border-radius: 6px;
}

.ui-sub-menu__title.is-collapsed {
  padding: 0;
  justify-content: center;
}

.ui-sub-menu__title-content {
  display: flex;
  font-size: 13px;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
}

.ui-sub-menu__title.is-collapsed .ui-sub-menu__title-content {
  justify-content: center;
}

.ui-sub-menu__icon {
  margin-right: 8px;
  font-size: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
}

.ui-sub-menu__icon-image {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
}

.ui-sub-menu__title.is-nested .ui-sub-menu__icon {
  font-size: 16px;
  width: 16px;
}

.ui-sub-menu__title.is-nested .ui-sub-menu__icon-image {
  width: 16px;
  height: 16px;
}

.ui-sub-menu__title.is-collapsed .ui-sub-menu__icon,
.ui-sub-menu__title.is-collapsed .ui-sub-menu__icon-image {
  margin: 0 auto;
}

.ui-sub-menu__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: inherit;
}

.ui-sub-menu__title.is-nested .ui-sub-menu__label {
  font-size: 13px;
}

.ui-sub-menu__title.is-nested {
  height: 34px;
  line-height: 34px;
  margin: 1px 4px;
  padding: 0 12px;
}

.ui-sub-menu__arrow {
  font-size: 12px;
  margin-left: auto;
  transition: transform 0.2s;
}

.ui-sub-menu__title.is-open .ui-sub-menu__arrow {
  transform: rotate(90deg);
}

.ui-sub-menu__popup {
  position: fixed;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: visible;
  padding: 0;
  min-width: 180px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  display: none; /* Mock 版本默认不显示弹出层 */
}

.ui-sub-menu__popup-content {
  border-radius: 10px;
  background-color: var(--sub-menu-bg);
  border: none;
  padding: 4px;
  overflow: visible;
}
</style>

