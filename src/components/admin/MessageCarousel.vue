<script setup>
import { ref, computed } from 'vue'
import { useSwipe } from '@/composables/useSwipe'

const props = defineProps({
  items: { type: Array, required: true }, // {id,name,text,createdAt}
})

const index = ref(0)
const hearts = ref([])
let heartId = 0

const EMOJIS = ['💛', '💖', '🤍', '✨', '💕']

function spawnHearts() {
  for (let i = 0; i < 9; i++) {
    const id = heartId++
    hearts.value.push({
      id,
      left: 8 + Math.random() * 84, // %
      size: 16 + Math.random() * 18, // px
      dur: 1100 + Math.random() * 900, // ms
      delay: Math.random() * 220, // ms
      drift: (Math.random() - 0.5) * 60, // px
      emoji: EMOJIS[(Math.random() * EMOJIS.length) | 0],
    })
    setTimeout(
      () => {
        hearts.value = hearts.value.filter((h) => h.id !== id)
      },
      1400 + 900 + 250,
    )
  }
}

function go(i) {
  const clamped = Math.max(0, Math.min(props.items.length - 1, i))
  if (clamped !== index.value) {
    index.value = clamped
    spawnHearts()
  }
}
function prev() {
  go(index.value - 1)
}
function next() {
  go(index.value + 1)
}

const { dx, dragging, handlers } = useSwipe({ onLeft: next, onRight: prev })

const trackStyle = computed(() => ({
  transform: `translateX(calc(${-index.value * 100}% + ${dx.value}px))`,
  transition: dragging.value ? 'none' : 'transform 0.45s var(--ease)',
}))

function formatDate(ms) {
  if (!ms) return ''
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ms))
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="msgc">
    <div class="stage" v-bind="handlers">
      <div class="track" :style="trackStyle">
        <div v-for="m in items" :key="m.id" class="cardwrap">
          <article class="note">
            <span class="note__quote" aria-hidden="true">“</span>
            <p class="note__text">{{ m.text }}</p>
            <footer class="note__foot">
              <span class="note__name">{{ m.name || 'İsimsiz misafir' }}</span>
              <span v-if="m.createdAt" class="note__date">{{
                formatDate(m.createdAt)
              }}</span>
            </footer>
            <span class="note__heart" aria-hidden="true">♥</span>
          </article>
        </div>
      </div>

      <!-- Uçuşan kalpler -->
      <div class="hearts" aria-hidden="true">
        <span
          v-for="h in hearts"
          :key="h.id"
          class="heart"
          :style="{
            left: h.left + '%',
            fontSize: h.size + 'px',
            '--dur': h.dur + 'ms',
            '--delay': h.delay + 'ms',
            '--drift': h.drift + 'px',
          }"
          >{{ h.emoji }}</span
        >
      </div>
    </div>

    <div class="controls">
      <button
        class="round"
        type="button"
        aria-label="Önceki"
        :disabled="index === 0"
        @click="prev"
      >
        ‹
      </button>
      <span class="dots">
        <span
          v-for="(m, i) in items"
          :key="m.id"
          class="dot"
          :class="{ 'is-active': i === index }"
        ></span>
      </span>
      <button
        class="round"
        type="button"
        aria-label="Sonraki"
        :disabled="index === items.length - 1"
        @click="next"
      >
        ›
      </button>
    </div>
    <p class="count">{{ index + 1 }} / {{ items.length }} mesaj</p>
  </div>
</template>

<style scoped>
.msgc {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
  min-height: 0;
}

.stage {
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
  flex: 1;
  min-height: 0;
}
.track {
  display: flex;
  height: 100%;
}
.cardwrap {
  flex: 0 0 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  padding: var(--space-2) var(--space-2) var(--space-2);
}

/* Tatlı mesaj kartı */
.note {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-5) var(--space-5);
  background: linear-gradient(160deg, #fffdf8, var(--c-surface-2));
  border: 1px solid var(--c-gold-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.note::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid var(--c-gold-soft);
  border-radius: calc(var(--radius-lg) - 6px);
  pointer-events: none;
}
.note__quote {
  font-family: var(--font-display);
  font-size: 3.4rem;
  line-height: 0.6;
  color: var(--c-gold);
  opacity: 0.5;
  height: 24px;
}
.note__text {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: safe center;
  text-align: center;
  font-size: 1.18rem;
  line-height: 1.6;
  color: var(--c-ink);
  font-style: italic;
  overflow-wrap: anywhere;
  word-break: break-word;
  -webkit-overflow-scrolling: touch;
}
.note__text::-webkit-scrollbar {
  width: 5px;
}
.note__text::-webkit-scrollbar-thumb {
  background: var(--c-gold-line);
  border-radius: 4px;
}
.note__foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.note__name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--c-gold-deep);
}
.note__date {
  font-size: 0.76rem;
  color: var(--c-muted);
}
.note__heart {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  color: var(--c-blush);
  font-size: 1.1rem;
  animation: beat 1.6s ease-in-out infinite;
}

/* Uçuşan kalpler */
.hearts {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.heart {
  position: absolute;
  bottom: 18%;
  animation: floatUp var(--dur) ease-out var(--delay) forwards;
  opacity: 0;
  will-change: transform, opacity;
}

@keyframes floatUp {
  0% {
    transform: translate(0, 0) scale(0.6);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift), -220px) scale(1.1);
    opacity: 0;
  }
}
@keyframes beat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}

/* Kontroller */
.controls {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}
.round {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  font-size: 24px;
  color: var(--c-gold-deep);
  background: var(--c-surface);
  border: 1px solid var(--c-gold-line);
  border-radius: 50%;
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s ease, background 0.2s ease, opacity 0.2s ease;
}
.round:hover:not(:disabled) {
  background: var(--c-gold-soft);
}
.round:active:not(:disabled) {
  transform: scale(0.92);
}
.round:disabled {
  opacity: 0.4;
}
.dots {
  display: flex;
  gap: 6px;
  max-width: 60%;
  flex-wrap: wrap;
  justify-content: center;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-gold-line);
  transition: background 0.2s ease, transform 0.2s ease;
}
.dot.is-active {
  background: var(--c-gold-deep);
  transform: scale(1.35);
}
.count {
  text-align: center;
  font-size: 0.82rem;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .heart,
  .note__heart {
    animation: none;
  }
}
</style>
