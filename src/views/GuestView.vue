<script setup>
import { ref } from 'vue'
import { wedding } from '@/config/wedding'
import BannerHeader from '@/components/BannerHeader.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import PhotoUpload from '@/components/PhotoUpload.vue'
import MessageForm from '@/components/MessageForm.vue'

const tabs = [
  { key: 'photo', label: 'Fotoğraf Yükle', icon: '📸' },
  { key: 'message', label: 'Mesaj Bırak', icon: '💌' },
]
const activeTab = ref('photo')
</script>

<template>
  <main class="guest">
    <article class="card">
      <BannerHeader />

      <div class="card__body">
        <div class="welcome">
          <h2 class="welcome__title">{{ wedding.welcomeTitle }}</h2>
          <p class="welcome__text">{{ wedding.welcomeText }}</p>
        </div>

        <TabSwitcher v-model="activeTab" :tabs="tabs" />

        <Transition name="panel" mode="out-in">
          <PhotoUpload v-if="activeTab === 'photo'" key="photo" />
          <MessageForm v-else key="message" />
        </Transition>
      </div>

      <footer v-if="wedding.hashtag" class="card__footer">
        <span class="footer__heart" aria-hidden="true">♥</span>
        {{ wedding.hashtag }}
      </footer>
    </article>
  </main>
</template>

<style scoped>
.guest {
  display: flex;
  justify-content: center;
  padding: clamp(var(--space-2), 3vw, var(--space-5))
    clamp(var(--space-3), 4vw, var(--space-5))
    calc(env(safe-area-inset-bottom) + var(--space-4));
}

.card {
  width: 100%;
  max-width: var(--maxw);
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lift);
  overflow: hidden;
  animation: card-in 0.6s var(--ease) both;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5) var(--space-5);
}

.welcome {
  text-align: center;
}
.welcome__title {
  font-size: 1.2rem;
  margin-bottom: var(--space-1);
}
.welcome__text {
  font-size: 0.9rem;
  color: var(--c-ink-soft);
  line-height: 1.5;
}

.card__footer {
  padding: var(--space-3);
  text-align: center;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  color: var(--c-muted);
  border-top: 1px solid var(--c-line);
  background: var(--c-surface-2);
}
.footer__heart {
  color: var(--c-blush);
  margin-right: 0.35em;
}

/* Sekme paneli geçişi */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.28s var(--ease), transform 0.28s var(--ease);
}
.panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
  }
}
</style>
