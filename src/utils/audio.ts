// Simple Audio Engine using Web Audio API for synthetic digital luxury sounds

let audioCtx: AudioContext | null = null;
let coinFreeBuffer: AudioBuffer | null = null;
let coinHookedBuffer: AudioBuffer | null = null;

// Initialize on first user interaction to bypass autoplay policies
let initializedEventListeners = false;

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      
      // Attempt to resume immediately if suspended
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      // Fallback: If it's still suspended (likely due to no user gesture),
      // we attach a global interaction listener to resume it on the first tap/click.
      if (!initializedEventListeners) {
        const unlock = () => {
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          document.removeEventListener('click', unlock);
          document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
        initializedEventListeners = true;
      }
      
      // Pre-fetch the real MP3 coin drop sounds
      const loadAudio = async (url: string) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          return await audioCtx!.decodeAudioData(arrayBuffer);
        } catch (e) {
          console.error("Failed to load audio:", url, e);
          return null;
        }
      };
      
      loadAudio('/coin_free.mp3').then(b => coinFreeBuffer = b);
      loadAudio('/coin_hooked.mp3').then(b => coinHookedBuffer = b);
    }
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const ensureAudioContext = () => {
    // Failsafe initialization
    if (!audioCtx) {
        initAudio();
    }
    return audioCtx;
}

export const playTick = (isFree: boolean) => {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Use a pure sine wave for a delicate, narrow sound (no "woody" harmonics)
  osc.type = 'sine';
  
  if (isFree) {
    // Ultra-delicate, bright watch tick
    // Drops from very high (8000Hz) to high (2000Hz) to create a microscopic "snap"
    osc.frequency.setValueAtTime(8000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.010);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.001); // Very quiet (0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.010); // Gone in 10ms
  } else {
    // Slightly duller, sadder tick
    osc.frequency.setValueAtTime(5000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.015);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
  }

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.02);
};

export const playCentDrop = (isFree: boolean) => {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  // Swapped: use Hooked audio for Free (Green) and Free audio for Hooked (Red)
  const buffer = isFree ? coinHookedBuffer : coinFreeBuffer;
  if (!buffer) return; // If not loaded yet, silently skip

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  source.connect(gainNode);

  // Subtle volume scaling
  gainNode.gain.value = isFree ? 0.4 : 0.6;
  
  // Very slight pitch variation (0.95 to 1.05) to prevent machine-gun effect
  source.playbackRate.value = 0.95 + (Math.random() * 0.1);

  source.start(ctx.currentTime);
};
