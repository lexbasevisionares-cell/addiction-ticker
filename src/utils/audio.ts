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

  // A high-pass filter removes the low "thud", leaving only the sharp mechanical needle click
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Sharp, high-pitched mechanical tick
  osc.type = 'square';
  
  // The classic "quartz" click: very high frequency dropping instantly to create a sharp transient
  if (isFree) {
    osc.frequency.setValueAtTime(6000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.015);
  } else {
    osc.frequency.setValueAtTime(4000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.015);
  }

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.001); // Instant attack (1ms)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02); // Extremely fast decay (20ms)

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
};

export const playCentDrop = (isFree: boolean) => {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const buffer = isFree ? coinFreeBuffer : coinHookedBuffer;
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
