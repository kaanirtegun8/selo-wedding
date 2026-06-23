<script setup>
import BaseButton from './BaseButton.vue'

defineProps({
  show: Boolean,
  title: { type: String, default: 'Teşekkürler!' },
  message: { type: String, default: '' },
  cta: { type: String, default: 'Harika!' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="show"
        class="toast-overlay"
        @click.self="emit('close')"
      >
        <div
          class="toast-card"
          role="alertdialog"
          aria-modal="true"
          aria-live="assertive"
        >
          <div class="toast-check">
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle class="toast-check__circle" cx="26" cy="26" r="24" />
              <path class="toast-check__mark" d="M15 27 l8 8 l15 -16" />
            </svg>
          </div>
          <h3 class="toast-title">{{ title }}</h3>
          <p v-if="message" class="toast-message">{{ message }}</p>
          <BaseButton block @click="emit('close')">{{ cta }}</BaseButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  background: rgba(42, 28, 16, 0.42);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.toast-card {
  width: 100%;
  max-width: 360px;
  padding: var(--space-6) var(--space-5) var(--space-5);
  text-align: center;
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lift);
}

.toast-check {
  width: 84px;
  height: 84px;
  margin: 0 auto var(--space-4);
}
.toast-check svg {
  width: 100%;
  height: 100%;
}
.toast-check__circle {
  fill: var(--c-gold-soft);
  stroke: var(--c-success);
  stroke-width: 2.5;
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: draw-circle 0.5s var(--ease) forwards;
}
.toast-check__mark {
  fill: none;
  stroke: var(--c-success);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: draw-mark 0.35s var(--ease) 0.4s forwards;
}

.toast-title {
  font-size: 1.5rem;
  margin-bottom: var(--space-2);
}
.toast-message {
  color: var(--c-ink-soft);
  margin-bottom: var(--space-5);
  font-size: 0.98rem;
}

@keyframes draw-circle {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes draw-mark {
  to {
    stroke-dashoffset: 0;
  }
}

/* Giriş / çıkış geçişi */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease;
}
.toast-enter-active .toast-card {
  transition: transform 0.4s var(--ease), opacity 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
.toast-enter-from .toast-card {
  transform: translateY(16px) scale(0.94);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .toast-check__circle,
  .toast-check__mark {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
