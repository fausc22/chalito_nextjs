/**
 * Helper para reproducir sonido de alerta de nuevo pedido web.
 * Prioridad: /sounds/new-order.mp3 si existe. Si falla, beep Web Audio.
 * Para usar archivo personalizado: colocar public/sounds/new-order.mp3 (chime 0.3-1.0s)
 */

let cachedAudio = null;

function getAudioUrl() {
  if (typeof window === 'undefined') return '/sounds/new-order.mp3';
  return `${window.location.origin}/sounds/new-order.mp3`;
}

/**
 * Obtiene o crea instancia de Audio cacheada para new-order.mp3
 */
function getCachedAudio() {
  if (typeof window === 'undefined') return null;
  if (!cachedAudio) {
    cachedAudio = new Audio(getAudioUrl());
    cachedAudio.volume = 1.0;
    cachedAudio.addEventListener('error', () => {
      cachedAudio = null;
    });
  }
  return cachedAudio;
}

/**
 * Reproduce sonido corto tipo POS para nuevo pedido.
 * 1) Intenta /sounds/new-order.mp3 (volume 1.0, cache, currentTime=0)
 * 2) Si falla (archivo no existe o autoplay bloqueado): fallback beep Web Audio
 * @param {boolean} soundEnabled - Si el usuario tiene activado el sonido
 */
export function playNewOrderSound(soundEnabled = false) {
  if (!soundEnabled || typeof window === 'undefined') return;

  const audio = getCachedAudio();
  if (audio) {
    audio.currentTime = 0;
    audio.volume = 1.0;
    audio.play().catch((err) => {
      cachedAudio = null;
      playBeepFallback();
    });
  } else {
    playBeepFallback();
  }
}

/**
 * Beep corto usando Web Audio API (fallback cuando mp3 no existe o falla)
 * Duración ~0.3s
 */
function playBeepFallback() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn('[newOrderSound] No se pudo reproducir sonido:', e);
  }
}
