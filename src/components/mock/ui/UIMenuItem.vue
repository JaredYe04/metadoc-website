<template>
  <el-tooltip 
    v-if="tooltip && collapse" 
    :content="tooltip" 
    placement="right"
  >
    <div
      class="ui-menu-item"
      :class="{ 'is-collapsed': collapse, 'is-disabled': disabled }"
    >
      <div class="ui-menu-item__content">
        <slot name="icon">
          <el-icon v-if="icon" class="ui-menu-item__icon">
            <component :is="icon" />
          </el-icon>
          <img v-else-if="iconImage" :src="iconImage" class="ui-menu-item__icon-image" />
        </slot>
        <span v-if="!collapse" class="ui-menu-item__label">
          <slot>{{ label }}</slot>
        </span>
      </div>
    </div>
  </el-tooltip>
  <div
    v-else
    class="ui-menu-item"
    :class="{ 'is-collapsed': collapse, 'is-disabled': disabled }"
  >
    <div class="ui-menu-item__content">
      <slot name="icon">
        <el-icon v-if="icon" class="ui-menu-item__icon">
          <component :is="icon" />
        </el-icon>
        <img v-else-if="iconImage" :src="iconImage" class="ui-menu-item__icon-image" />
      </slot>
      <span v-if="!collapse" class="ui-menu-item__label">
        <slot>{{ label }}</slot>
      </span>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { useMockTheme, mixColors } from '../utils/theme'

const props = defineProps({
  label: {
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
  disabled: {
    type: Boolean,
    default: false
  }
})

const collapse = inject('menuCollapse', false)
const { currentTheme } = useMockTheme()

const activeBackgroundColor = computed(() => mixColors(currentTheme.value.background2nd, currentTheme.value.textColor, 0.3))
</script>

<style scoped>
.ui-menu-item {
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

.ui-menu-item:hover:not(.is-disabled) {
  background-color: v-bind('activeBackgroundColor');
  border-radius: 6px;
}

.ui-menu-item.is-disabled {
  cursor: default;
  opacity: 0.6;
}

.ui-menu-item.is-collapsed {
  padding: 0;
  justify-content: center;
}

.ui-menu-item__content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.ui-menu-item.is-collapsed .ui-menu-item__content {
  justify-content: center;
}

.ui-menu-item__icon {
  margin-right: 8px;
  font-size: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-menu-item__icon-image {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-menu-item.is-collapsed .ui-menu-item__icon,
.ui-menu-item.is-collapsed .ui-menu-item__icon-image {
  margin: 0 auto;
}

.ui-menu-item__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

