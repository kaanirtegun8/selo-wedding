<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | ghost
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
    <span class="btn__label"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  --btn-h: 54px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  min-height: var(--btn-h);
  padding: 0 var(--space-6);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition: transform 0.18s var(--ease), box-shadow 0.25s var(--ease),
    filter 0.2s ease, opacity 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn--block {
  display: flex;
  width: 100%;
}

/* Birincil — altın gradyan */
.btn--primary {
  color: #fff;
  background-image: linear-gradient(135deg, #d8b873 0%, var(--c-gold) 45%, #b58e49 100%);
  box-shadow: 0 12px 26px -12px rgba(172, 135, 67, 0.75),
    var(--shadow-inset);
}
.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -14px rgba(172, 135, 67, 0.85), var(--shadow-inset);
}
.btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

/* İkincil — çizgili, şeffaf */
.btn--ghost {
  color: var(--c-gold-deep);
  background: transparent;
  border: 1.5px solid var(--c-gold-line);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--c-gold-soft);
}

.btn:disabled {
  cursor: default;
  opacity: 0.55;
}
.btn.is-loading {
  cursor: progress;
  opacity: 0.85;
}

.btn__spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-spin 0.7s linear infinite;
}
.btn--ghost .btn__spinner {
  border-color: var(--c-gold-soft);
  border-top-color: var(--c-gold-deep);
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
