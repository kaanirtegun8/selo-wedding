<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }, // [{ key, label, icon }]
})
const emit = defineEmits(['update:modelValue'])

const activeIndex = computed(() =>
  props.tabs.findIndex((t) => t.key === props.modelValue),
)
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tabs__btn"
      :class="{ 'is-active': tab.key === modelValue }"
      role="tab"
      type="button"
      :aria-selected="tab.key === modelValue"
      @click="emit('update:modelValue', tab.key)"
    >
      <span class="tabs__icon" aria-hidden="true">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>

    <span
      class="tabs__indicator"
      :style="{
        width: `${100 / tabs.length}%`,
        transform: `translateX(${activeIndex * 100}%)`,
      }"
    ></span>
  </div>
</template>

<style scoped>
.tabs {
  position: relative;
  display: flex;
  border-bottom: 1px solid var(--c-line);
}

.tabs__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  padding: var(--space-4) var(--space-2);
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-muted);
  transition: color 0.25s ease;
  -webkit-tap-highlight-color: transparent;
}
.tabs__btn.is-active {
  color: var(--c-gold-deep);
}

.tabs__icon {
  font-size: 1.15em;
  line-height: 1;
}

.tabs__indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2.5px;
  border-radius: 3px;
  background: linear-gradient(90deg, #d8b873, var(--c-gold-deep));
  transition: transform 0.34s var(--ease);
}

@media (prefers-reduced-motion: reduce) {
  .tabs__indicator {
    transition: none;
  }
}
</style>
