<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { wedding } from '@/config/wedding'
import { uploadPhotos } from '@/services/firebase'
import BaseButton from './BaseButton.vue'
import SuccessToast from './SuccessToast.vue'

const photoBytes = wedding.maxPhotoSizeMB * 1024 * 1024
const videoBytes = wedding.maxVideoSizeMB * 1024 * 1024

const items = ref([]) // { id, file, url, isVideo }
const error = ref('')
const isDragging = ref(false)
const uploading = ref(false)
const progress = ref(0)
const showSuccess = ref(false)
const fileInput = ref(null)

const count = computed(() => items.value.length)
const isFull = computed(() => count.value >= wedding.maxPhotos)

function openPicker() {
  if (uploading.value) return
  fileInput.value?.click()
}

function onFilesSelected(event) {
  addFiles(event.target.files)
  event.target.value = '' // aynı dosya tekrar seçilebilsin
}

function addFiles(fileList) {
  error.value = ''
  const incoming = Array.from(fileList || [])
  const accepted = []
  let rejectedType = 0
  let rejectedSize = 0

  for (const file of incoming) {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      rejectedType++
      continue
    }
    const limit = isVideo ? videoBytes : photoBytes
    if (file.size > limit) {
      rejectedSize++
      continue
    }
    accepted.push({ file, isVideo })
  }

  const free = wedding.maxPhotos - items.value.length
  const toAdd = accepted.slice(0, Math.max(0, free))
  const overflow = accepted.length - toAdd.length

  for (const { file, isVideo } of toAdd) {
    items.value.push({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      file,
      isVideo,
      url: URL.createObjectURL(file),
    })
  }

  const messages = []
  if (rejectedType)
    messages.push(`${rejectedType} dosya foto/video olmadığı için atlandı`)
  if (rejectedSize)
    messages.push(
      `${rejectedSize} dosya boyut sınırını aştı (foto ${wedding.maxPhotoSizeMB}MB · video ${wedding.maxVideoSizeMB}MB)`,
    )
  if (overflow)
    messages.push(
      `En fazla ${wedding.maxPhotos} dosya — ${overflow} tanesi alınmadı`,
    )
  error.value = messages.join(' · ')
}

function removeItem(id) {
  const idx = items.value.findIndex((i) => i.id === id)
  if (idx === -1) return
  URL.revokeObjectURL(items.value[idx].url)
  items.value.splice(idx, 1)
  error.value = ''
}

function clearAll() {
  items.value.forEach((i) => URL.revokeObjectURL(i.url))
  items.value = []
}

async function startUpload() {
  if (!count.value || uploading.value) return
  uploading.value = true
  progress.value = 0
  error.value = ''
  try {
    await uploadPhotos(
      items.value.map((i) => i.file),
      (p) => (progress.value = p),
    )
    clearAll()
    showSuccess.value = true
  } catch {
    error.value = 'Yükleme sırasında bir sorun oldu, tekrar dener misin?'
  } finally {
    uploading.value = false
  }
}

// Sürükle-bırak
function onDragOver() {
  if (!uploading.value) isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}
function onDrop(event) {
  isDragging.value = false
  if (uploading.value) return
  addFiles(event.dataTransfer?.files)
}

onBeforeUnmount(clearAll)
</script>

<template>
  <section class="upload" aria-label="Fotoğraf ve video yükleme">
    <!-- Bırakma / seçme alanı -->
    <button
      type="button"
      class="dropzone"
      :class="{ 'is-dragging': isDragging, 'is-disabled': isFull }"
      @click="openPicker"
      @dragover.prevent="onDragOver"
      @dragenter.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <span class="dropzone__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16V4m0 0L8 8m4-4l4 4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 14v3a3 3 0 003 3h10a3 3 0 003-3v-3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <span class="dropzone__title">
        {{ isFull ? 'Üst sınıra ulaştın' : 'Fotoğraf / video seçmek için dokun' }}
      </span>
      <span class="dropzone__hint">
        {{
          isFull
            ? `En fazla ${wedding.maxPhotos} dosya`
            : `veya buraya sürükle · en fazla ${wedding.maxPhotos} dosya`
        }}
      </span>
    </button>

    <input
      ref="fileInput"
      class="visually-hidden"
      type="file"
      accept="image/*,video/*"
      multiple
      @change="onFilesSelected"
    />

    <!-- Sayaç -->
    <p class="counter">
      <template v-if="count">
        <strong>{{ count }}</strong> / {{ wedding.maxPhotos }} dosya seçildi
      </template>
      <template v-else>Henüz dosya seçilmedi</template>
    </p>

    <!-- Önizleme ızgarası -->
    <TransitionGroup tag="div" name="thumb" class="grid" v-show="count">
      <div v-for="item in items" :key="item.id" class="thumb">
        <video
          v-if="item.isVideo"
          :src="item.url"
          class="thumb__media"
          muted
          playsinline
          preload="metadata"
        ></video>
        <img
          v-else
          :src="item.url"
          :alt="item.file.name"
          class="thumb__media"
          loading="lazy"
        />
        <span v-if="item.isVideo" class="thumb__play" aria-hidden="true">▶</span>
        <button
          type="button"
          class="thumb__remove"
          :aria-label="`${item.file.name} kaldır`"
          :disabled="uploading"
          @click="removeItem(item.id)"
        >
          ×
        </button>
      </div>
    </TransitionGroup>

    <!-- Uyarı -->
    <Transition name="fade">
      <p v-if="error" class="notice" role="alert">{{ error }}</p>
    </Transition>

    <!-- İlerleme -->
    <div v-if="uploading" class="progress" aria-hidden="true">
      <div class="progress__bar" :style="{ width: `${progress}%` }"></div>
      <span class="progress__label">{{ progress }}%</span>
    </div>

    <BaseButton
      block
      :loading="uploading"
      :disabled="!count"
      @click="startUpload"
    >
      {{ uploading ? 'Yükleniyor…' : 'Yüklemeye Başla' }}
    </BaseButton>

    <SuccessToast
      :show="showSuccess"
      title="Anıların bizde! 🎉"
      message="Paylaştığın fotoğraf ve videolar için çok teşekkürler. Dilersen daha fazlasını da ekleyebilirsin."
      cta="Devam et"
      @close="showSuccess = false"
    />
  </section>
</template>

<style scoped>
.upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Dropzone */
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-5) var(--space-4);
  text-align: center;
  background: var(--c-surface-2);
  border: 1.5px dashed var(--c-gold-line);
  border-radius: var(--radius);
  color: var(--c-gold-deep);
  transition: background 0.2s ease, border-color 0.2s ease,
    transform 0.18s var(--ease);
}
.dropzone:hover:not(.is-disabled) {
  background: var(--c-gold-soft);
}
.dropzone.is-dragging {
  background: var(--c-gold-soft);
  border-color: var(--c-gold-deep);
  border-style: solid;
  transform: scale(1.01);
}
.dropzone.is-disabled {
  color: var(--c-muted);
  border-color: var(--c-line);
  cursor: default;
}

.dropzone__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--c-surface);
  box-shadow: var(--shadow-soft);
}
.dropzone__icon svg {
  width: 24px;
  height: 24px;
}
.dropzone__title {
  font-size: 1.05rem;
  font-weight: 700;
}
.dropzone__hint {
  font-size: 0.85rem;
  color: var(--c-muted);
}

/* Sayaç */
.counter {
  text-align: center;
  font-size: 0.9rem;
  color: var(--c-ink-soft);
}
.counter strong {
  color: var(--c-gold-deep);
}

/* Izgara */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  background: var(--c-bg-2);
}
.thumb__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb__play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  font-size: 13px;
  color: #fff;
  background: rgba(42, 28, 16, 0.55);
  border-radius: 50%;
  padding-left: 2px;
  backdrop-filter: blur(2px);
}
.thumb__remove {
  position: absolute;
  top: 5px;
  right: 5px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  font-size: 18px;
  line-height: 1;
  color: #fff;
  background: rgba(42, 28, 16, 0.62);
  border-radius: 50%;
  backdrop-filter: blur(2px);
  transition: background 0.2s ease, transform 0.15s ease;
}
.thumb__remove:hover:not(:disabled) {
  background: var(--c-danger);
  transform: scale(1.08);
}

/* Uyarı */
.notice {
  padding: var(--space-3) var(--space-4);
  font-size: 0.86rem;
  color: var(--c-danger);
  background: rgba(192, 99, 92, 0.08);
  border: 1px solid rgba(192, 99, 92, 0.22);
  border-radius: var(--radius-sm);
}

/* İlerleme */
.progress {
  position: relative;
  height: 26px;
  border-radius: var(--radius-pill);
  background: var(--c-gold-soft);
  overflow: hidden;
}
.progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #d8b873, var(--c-gold-deep));
  transition: width 0.2s linear;
}
.progress__label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--c-ink);
}

/* Geçişler */
.thumb-enter-active,
.thumb-leave-active {
  transition: opacity 0.3s var(--ease), transform 0.3s var(--ease);
}
.thumb-enter-from {
  opacity: 0;
  transform: scale(0.7);
}
.thumb-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
.thumb-leave-active {
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
