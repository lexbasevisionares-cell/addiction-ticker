// Simple Audio Engine using Web Audio API for synthetic digital luxury sounds

let audioCtx: AudioContext | null = null;
let coinFreeBuffer: AudioBuffer | null = null;
let coinHookedBuffer: AudioBuffer | null = null;

// Initialize on first user interaction to bypass autoplay policies
export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      
      // Attempt to resume immediately if suspended
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
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

  // Digital luxury tick: very low, soft, short impact
  osc.type = 'sine';
  
  if (isFree) {
    // Subtle, deep heartbeat thud
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
  } else {
    // Slightly more urgent, higher digital click
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
  }

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); // Quick decay

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
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
