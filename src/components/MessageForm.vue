<script setup>
import { ref, computed } from 'vue'
import { wedding } from '@/config/wedding'
import { sendMessage } from '@/services/firebase'
import BaseButton from './BaseButton.vue'
import SuccessToast from './SuccessToast.vue'

const name = ref('')
const text = ref('')
const sending = ref(false)
const error = ref('')
const showSuccess = ref(false)

const remaining = computed(() => wedding.messageMaxLength - text.value.length)

async function submit() {
  if (!text.value.trim()) {
    error.value = 'Lütfen birkaç güzel kelime yaz 💛'
    return
  }
  sending.value = true
  error.value = ''
  try {
    await sendMessage({ name: name.value.trim(), text: text.value.trim() })
    name.value = ''
    text.value = ''
    showSuccess.value = true
  } catch {
    error.value = 'Mesaj gönderilemedi, tekrar dener misin?'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="message" @submit.prevent="submit">
    <div class="field">
      <label class="field__label" for="msg-name">Adın (isteğe bağlı)</label>
      <input
        id="msg-name"
        v-model="name"
        class="field__input"
        type="text"
        placeholder="Örn. Zeynep & Ali"
        maxlength="60"
        :disabled="sending"
      />
    </div>

    <div class="field">
      <label class="field__label" for="msg-text">Mesajın</label>
      <textarea
        id="msg-text"
        v-model="text"
        class="field__input field__textarea"
        rows="5"
        placeholder="Çifte en güzel dileklerini bırak…"
        :maxlength="wedding.messageMaxLength"
        :disabled="sending"
        @input="error = ''"
      ></textarea>
      <span class="field__count" :class="{ 'is-low': remaining < 40 }">
        {{ remaining }}
      </span>
    </div>

    <Transition name="fade">
      <p v-if="error" class="notice" role="alert">{{ error }}</p>
    </Transition>

    <BaseButton type="submit" block :loading="sending">
      {{ sending ? 'Gönderiliyor…' : 'Mesajı Gönder' }}
    </BaseButton>

    <SuccessToast
      :show="showSuccess"
      title="Mesajın iletildi! 💌"
      message="Güzel dileklerin için teşekkür ederiz. Çift bunu görünce çok mutlu olacak."
      cta="Devam et"
      @close="showSuccess = false"
    />
  </form>
</template>

<style scoped>
.message {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.field__label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--c-ink-soft);
  letter-spacing: 0.01em;
}
.field__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--c-surface-2);
  border: 1.5px solid var(--c-line);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    background 0.2s ease;
}
.field__input::placeholder {
  color: var(--c-muted);
}
.field__input:focus {
  outline: none;
  border-color: var(--c-gold-line);
  background: var(--c-surface);
  box-shadow: 0 0 0 4px var(--c-gold-soft);
}
.field__textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.55;
}
.field__count {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  font-size: 0.74rem;
  color: var(--c-muted);
  background: var(--c-surface);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  pointer-events: none;
}
.field__count.is-low {
  color: var(--c-danger);
}

.notice {
  padding: var(--space-3) var(--space-4);
  font-size: 0.86rem;
  color: var(--c-danger);
  background: rgba(192, 99, 92, 0.08);
  border: 1px solid rgba(192, 99, 92, 0.22);
  border-radius: var(--radius-sm);
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
