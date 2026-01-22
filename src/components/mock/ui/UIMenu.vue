<template>
  <div 
    class="ui-menu" 
    :class="{ 'is-collapsed': collapse }"
    :style="menuStyle"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  collapse: {
    type: Boolean,
    default: true
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: ''
  }
})

const menuStyle = computed(() => ({
  '--menu-bg': props.backgroundColor || '#f5f5f5',
  '--menu-text': props.textColor || '#333333',
  backgroundColor: props.backgroundColor || '#f5f5f5',
  color: props.textColor || '#333333'
}))
</script>

<style scoped>
.ui-menu {
  width: 64px;
  height: 100%;
  transition: width 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  overflow: hidden;
  border-right: none;
  display: flex;
  flex-direction: column;
}

.ui-menu:not(.is-collapsed) {
  width: 180px;
  min-height: 400px;
}

@media (max-width: 768px) {
  .ui-menu:not(.is-collapsed) {
    width: 160px;
  }
}
</style>

