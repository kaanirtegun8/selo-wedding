<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <transition name="route-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  width: 100%;
}

.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.35s ease;
}
.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .route-fade-enter-active,
  .route-fade-leave-active {
    transition: none;
  }
}
</style>
