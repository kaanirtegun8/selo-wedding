import { ref } from 'vue'

/**
 * Basit yatay swipe/drag yardımcısı (pointer events — dokunmatik + fare).
 * onLeft = sola kaydır (sonraki), onRight = sağa kaydır (önceki).
 * `dx` görsel sürükleme geri bildirimi için (px).
 */
export function useSwipe({ onLeft, onRight, threshold = 55 } = {}) {
  const dragging = ref(false)
  const dx = ref(0)
  let startX = 0
  let active = false

  function down(e) {
    active = true
    dragging.value = true
    startX = e.clientX
    dx.value = 0
  }
  function move(e) {
    if (!active) return
    dx.value = e.clientX - startX
  }
  function finish(commit) {
    if (!active) return
    active = false
    dragging.value = false
    const d = dx.value
    dx.value = 0
    if (commit && Math.abs(d) > threshold) {
      if (d < 0) onLeft?.()
      else onRight?.()
    }
  }

  const handlers = {
    onPointerdown: down,
    onPointermove: move,
    onPointerup: () => finish(true),
    onPointercancel: () => finish(false),
    onPointerleave: () => finish(false),
  }

  return { dragging, dx, handlers }
}
