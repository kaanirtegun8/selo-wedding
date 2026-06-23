<script setup>
import { wedding } from '@/config/wedding'
</script>

<template>
  <header class="banner">
    <img
      class="banner__img"
      :src="wedding.bannerImage"
      :alt="`${wedding.coupleNames} düğün fotoğrafı`"
      decoding="async"
    />
    <div class="banner__scrim"></div>

    <div class="banner__content">
      <p class="banner__kicker">{{ wedding.kicker }}</p>
      <h1 class="banner__names">{{ wedding.coupleNames }}</h1>
      <p v-if="wedding.dateLabel" class="banner__date">
        <span class="banner__rule"></span>
        <span>{{ wedding.dateLabel }}</span>
        <span class="banner__rule"></span>
      </p>
    </div>
  </header>
</template>

<style scoped>
.banner {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  overflow: hidden;
  background: var(--c-bg-2);
}

.banner__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: banner-zoom 14s ease-out both;
}

.banner__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(33, 21, 11, 0.92) 0%,
    rgba(33, 21, 11, 0.8) 24%,
    rgba(33, 21, 11, 0.5) 44%,
    rgba(33, 21, 11, 0.16) 62%,
    rgba(33, 21, 11, 0) 78%
  );
}

.banner__content {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: var(--space-6) var(--space-5) var(--space-5);
  text-align: center;
  color: #fff;
}

.banner__kicker {
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #ffe9c4;
  margin-bottom: var(--space-2);
  opacity: 0;
  animation: rise 0.7s var(--ease) 0.15s forwards;
}

.banner__names {
  color: bisque;
  font-size: clamp(2rem, 9vw, 2.6rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 0, 0, 0.7),
    0 0 26px rgba(0, 0, 0, 0.55);
  opacity: 1;
  animation: rise 0.7s var(--ease) 0.28s forwards;
}

.banner__date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
  font-size: 0.84rem;
  letter-spacing: 0.14em;
  color: #fbe6c8;
  opacity: 0;
  animation: rise 0.7s var(--ease) 0.42s forwards;
}
.banner__rule {
  display: block;
  width: 28px;
  height: 1px;
  background: rgba(255, 233, 196, 0.7);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes banner-zoom {
  from {
    transform: scale(1.08);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .banner__img,
  .banner__kicker,
  .banner__names,
  .banner__date {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
