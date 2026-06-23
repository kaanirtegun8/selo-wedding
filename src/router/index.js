import { createRouter, createWebHistory } from 'vue-router'
import GuestView from '@/views/GuestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'guest',
      component: GuestView,
    },
    {
      // Faz 3'te admin paneli buraya gelecek (galeri + mesajlar + indirme)
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
    },
  ],
})

export default router
