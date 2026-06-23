<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSwipe } from '@/composables/useSwipe'
import BaseButton from '@/components/BaseButton.vue'

const props = defineProps({
  items: { type: Array, required: true }, // {id,url,name,type,isVideo}
})

const index = ref(0)
const zipping = ref(false)
const zipMsg = ref('')

const current = computed(() => props.items[index.value] || null)

function go(i) {
  index.value = Math.max(0, Math.min(props.items.length - 1, i))
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
  transition: dragging.value ? 'none' : 'transform 0.4s var(--ease)',
}))

const saveMsg = ref('')
const fileCache = new Map() // id -> File

async function ensureFile(item) {
  if (fileCache.has(item.id)) return fileCache.get(item.id)
  const res = await fetch(item.url)
  const blob = await res.blob()
  const file = new File([blob], item.name || 'dosya', {
    type: blob.type || item.type || 'application/octet-stream',
  })
  fileCache.set(item.id, file)
  return file
}

// Aktif öğeyi önceden indir ki "Kaydet" dokunuşu anında paylaşıma gitsin (iOS aktivasyonu korunur)
function prefetchCurrent() {
  const item = current.value
  if (item?.url) ensureFile(item).catch(() => {})
}

function blobDownload(file, item) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = item.name || 'dosya'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}

// Mobilde native "Resmi Kaydet / Galeriye kaydet" sayfasını açar; masaüstünde dosyayı indirir.
async function saveCurrent() {
  const item = current.value
  if (!item) return
  saveMsg.value = ''
  const cached = fileCache.get(item.id)
  if (cached && navigator.canShare && navigator.canShare({ files: [cached] })) {
    try {
      await navigator.share({ files: [cached] })
    } catch (e) {
      if (e?.name !== 'AbortError') blobDownload(cached, item)
    }
    return
  }
  try {
    const file = await ensureFile(item)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] })
    } else {
      blobDownload(file, item)
    }
  } catch (e) {
    if (e?.name === 'AbortError') return
    saveMsg.value = 'Kaydedilemedi — resme uzun basıp “Resmi Kaydet” deneyebilirsin.'
    window.open(item.url, '_blank')
  }
}

watch(current, prefetchCurrent)
onMounted(prefetchCurrent)

async function downloadAll() {
  if (zipping.value || !props.items.length) return
  zipping.value = true
  zipMsg.value = 'Hazırlanıyor…'
  try {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    let done = 0
    for (const item of props.items) {
      if (!item.url) continue
      const res = await fetch(item.url)
      zip.file(item.name || item.id, await res.blob())
      done++
      zipMsg.value = `Hazırlanıyor… ${done}/${props.items.length}`
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'dugun-anilari.zip'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
    zipMsg.value = ''
  } catch {
    zipMsg.value = 'İndirme engellendi (tek tek indirmeyi dene)'
  } finally {
    zipping.value = false
  }
}
</script>

<template>
  <div class="carousel">
    <div class="stage" v-bind="handlers">
      <div class="track" :style="trackStyle">
        <div v-for="item in items" :key="item.id" class="slide">
          <video
            v-if="item.isVideo"
            :src="item.url"
            class="media"
            controls
            playsinline
            preload="metadata"
          ></video>
          <img
            v-else
            :src="item.url"
            :alt="item.name"
            class="media"
            draggable="false"
          />
        </div>
      </div>

      <button
        v-if="index > 0"
        class="nav nav--prev"
        type="button"
        aria-label="Önceki"
        @click="prev"
      >
        ‹
      </button>
      <button
        v-if="index < items.length - 1"
        class="nav nav--next"
        type="button"
        aria-label="Sonraki"
        @click="next"
      >
        ›
      </button>

      <span class="counter">{{ index + 1 }} / {{ items.length }}</span>
    </div>

    <!-- Küçük resim şeridi -->
    <div class="strip">
      <button
        v-for="(item, i) in items"
        :key="item.id"
        class="strip__item"
        :class="{ 'is-active': i === index }"
        type="button"
        @click="go(i)"
      >
        <video v-if="item.isVideo" :src="item.url" muted preload="metadata"></video>
        <img v-else :src="item.url" :alt="item.name" loading="lazy" />
        <span v-if="item.isVideo" class="strip__play">▶</span>
      </button>
    </div>

    <div class="actions">
      <BaseButton variant="ghost" @click="saveCurrent">
        {{ current && current.isVideo ? '⬇ Videoyu kaydet' : '⬇ Kaydet' }}
      </BaseButton>
      <BaseButton :loading="zipping" @click="downloadAll">
        {{ zipping ? zipMsg || 'Hazırlanıyor…' : '⬇ Tümünü indir (.zip)' }}
      </BaseButton>
    </div>
    <p v-if="saveMsg" class="hint">{{ saveMsg }}</p>
    <p v-else-if="zipMsg && !zipping" class="hint">{{ zipMsg }}</p>
  </div>
</template>

<style scoped>
.carousel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
  min-height: 0;
}

.stage {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 140px;
  overflow: hidden;
  border-radius: var(--radius);
  background: #211710;
  box-shadow: var(--shadow-soft);
  touch-action: pan-y;
  user-select: none;
}
.track {
  display: flex;
  height: 100%;
}
.slide {
  flex: 0 0 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.media {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  font-size: 24px;
  line-height: 1;
  color: var(--c-ink);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(3px);
  transition: background 0.2s ease, transform 0.15s ease;
}
.nav:hover {
  background: #fff;
}
.nav:active {
  transform: translateY(-50%) scale(0.92);
}
.nav--prev {
  left: 10px;
}
.nav--next {
  right: 10px;
}
.counter {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  background: rgba(42, 28, 16, 0.6);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(2px);
}

/* Şerit */
.strip {
  flex: none;
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.strip__item {
  position: relative;
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  opacity: 0.55;
  outline: 2px solid transparent;
  transition: opacity 0.2s ease, outline-color 0.2s ease;
}
.strip__item.is-active {
  opacity: 1;
  outline-color: var(--c-gold);
}
.strip__item img,
.strip__item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.strip__play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.25);
}

.actions {
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.hint {
  text-align: center;
  font-size: 0.82rem;
  color: var(--c-muted);
}
</style>
