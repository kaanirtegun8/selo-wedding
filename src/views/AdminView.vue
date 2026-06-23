<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { wedding } from '@/config/wedding'
import { fetchMessages, fetchMedia } from '@/services/firebase'
import TabSwitcher from '@/components/TabSwitcher.vue'
import BaseButton from '@/components/BaseButton.vue'
import PhotoCarousel from '@/components/admin/PhotoCarousel.vue'
import MessageCarousel from '@/components/admin/MessageCarousel.vue'

const STORAGE_KEY = 'wedding_admin'

const authed = ref(sessionStorage.getItem(STORAGE_KEY) === '1')
const passwordInput = ref('')
const wrong = ref(false)

const loading = ref(false)
const loadError = ref('')
const messages = ref([])
const media = ref([])
const activeTab = ref('media')

const tabs = computed(() => [
  { key: 'media', label: `Anılar (${media.value.length})`, icon: '📸' },
  { key: 'messages', label: `Mesajlar (${messages.value.length})`, icon: '💌' },
])

function login() {
  if (passwordInput.value === wedding.adminPassword) {
    authed.value = true
    sessionStorage.setItem(STORAGE_KEY, '1')
    passwordInput.value = ''
    load()
  } else {
    wrong.value = true
    setTimeout(() => (wrong.value = false), 600)
  }
}

function logout() {
  authed.value = false
  sessionStorage.removeItem(STORAGE_KEY)
  messages.value = []
  media.value = []
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const [msgs, med] = await Promise.all([fetchMessages(), fetchMedia()])
    messages.value = msgs
    media.value = med
  } catch (e) {
    loadError.value = 'Veriler yüklenemedi. Kuralları/bağlantıyı kontrol et.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authed.value) load()
})
</script>

<template>
  <main class="admin">
    <!-- ŞİFRE KAPISI -->
    <section v-if="!authed" class="gate">
      <div class="gate__card" :class="{ shake: wrong }">
        <span class="gate__lock" aria-hidden="true">🔒</span>
        <h1 class="gate__title">{{ wedding.coupleNames }}</h1>
        <p class="gate__sub">Yönetim paneli — devam etmek için şifre gir</p>
        <form class="gate__form" @submit.prevent="login">
          <input
            v-model="passwordInput"
            class="gate__input"
            :class="{ 'is-wrong': wrong }"
            type="password"
            placeholder="Şifre"
            autocomplete="current-password"
            aria-label="Şifre"
          />
          <BaseButton type="submit" block>Giriş Yap</BaseButton>
        </form>
        <p v-if="wrong" class="gate__err">Şifre yanlış 🙈</p>
        <RouterLink class="gate__back" to="/">← Misafir sayfasına dön</RouterLink>
      </div>
    </section>

    <!-- PANEL -->
    <section v-else class="panel">
      <header class="panel__head">
        <div>
          <p class="panel__kicker">Yönetim Paneli</p>
          <h1 class="panel__title">{{ wedding.coupleNames }}</h1>
        </div>
        <button class="logout" type="button" @click="logout">Çıkış</button>
      </header>

      <div v-if="loading" class="state">
        <span class="spinner" aria-hidden="true"></span>
        <p>Anılar yükleniyor…</p>
      </div>

      <div v-else-if="loadError" class="state">
        <p class="state__err">{{ loadError }}</p>
        <BaseButton variant="ghost" @click="load">Tekrar dene</BaseButton>
      </div>

      <template v-else>
        <TabSwitcher v-model="activeTab" :tabs="tabs" />

        <div class="panel__body">
          <Transition name="panel-fade" mode="out-in">
            <!-- ANILAR -->
            <div v-if="activeTab === 'media'" key="media" class="tabpane">
              <PhotoCarousel v-if="media.length" :items="media" />
              <p v-else class="empty">Henüz fotoğraf/video yüklenmemiş.</p>
            </div>
            <!-- MESAJLAR -->
            <div v-else key="messages" class="tabpane">
              <MessageCarousel v-if="messages.length" :items="messages" />
              <p v-else class="empty">Henüz mesaj bırakılmamış.</p>
            </div>
          </Transition>
        </div>

        <button class="refresh" type="button" @click="load">↻ Yenile</button>
      </template>
    </section>
  </main>
</template>

<style scoped>
.admin {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100dvh;
  padding: clamp(var(--space-2), 3vw, var(--space-5));
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--space-3));
}

/* ŞİFRE KAPISI */
.gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80dvh;
  width: 100%;
}
.gate__card {
  width: 100%;
  max-width: 360px;
  padding: var(--space-7) var(--space-5) var(--space-6);
  text-align: center;
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lift);
}
.gate__lock {
  font-size: 2.2rem;
}
.gate__title {
  font-size: 1.6rem;
  margin: var(--space-3) 0 var(--space-1);
}
.gate__sub {
  font-size: 0.9rem;
  color: var(--c-ink-soft);
  margin-bottom: var(--space-5);
}
.gate__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.gate__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  text-align: center;
  letter-spacing: 0.1em;
  background: var(--c-surface-2);
  border: 1.5px solid var(--c-line);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.gate__input:focus {
  outline: none;
  border-color: var(--c-gold-line);
  box-shadow: 0 0 0 4px var(--c-gold-soft);
}
.gate__input.is-wrong {
  border-color: var(--c-danger);
}
.gate__err {
  margin-top: var(--space-3);
  color: var(--c-danger);
  font-size: 0.88rem;
}
.gate__back {
  display: inline-block;
  margin-top: var(--space-5);
  font-size: 0.85rem;
  font-weight: 700;
}
.shake {
  animation: shake 0.5s;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

/* PANEL */
.panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  max-height: calc(100dvh - 2 * clamp(var(--space-2), 3vw, var(--space-5)));
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lift);
  overflow: hidden;
}
.panel__head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-5) var(--space-4);
}
.panel :deep(.tabs) {
  flex: none;
}
.panel__kicker {
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-muted);
}
.panel__title {
  font-size: 1.4rem;
}
.logout {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--c-ink-soft);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  transition: background 0.2s ease;
}
.logout:hover {
  background: var(--c-surface-2);
}

.panel__body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  padding: var(--space-4) var(--space-5);
}
.tabpane {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.empty {
  margin: auto;
  text-align: center;
  color: var(--c-muted);
  padding: var(--space-7) var(--space-4);
}

.state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--c-ink-soft);
}
.state__err {
  color: var(--c-danger);
}
.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid var(--c-gold-soft);
  border-top-color: var(--c-gold-deep);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.refresh {
  flex: none;
  display: block;
  width: 100%;
  padding: var(--space-4);
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--c-gold-deep);
  border-top: 1px solid var(--c-line);
  background: var(--c-surface-2);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .shake,
  .spinner {
    animation: none;
  }
}
</style>
