// Audio Engine using Web Audio API
// - Cinematic clock tick loops as ambient background
// - Real coin drop MP3 fires on each cent increment

let audioCtx: AudioContext | null = null;

// Pre-decoded audio buffers (loaded once at init)
let tickLoopBuffer: AudioBuffer | null = null;
let coinFreeBuffer: AudioBuffer | null = null;
let coinHookedBuffer: AudioBuffer | null = null;

// Loop management
let loopActive = false;
let loopTimerId: ReturnType<typeof setTimeout> | null = null;
let activeLoopSources: AudioBufferSourceNode[] = [];
let loopMasterGain: GainNode | null = null;

let initializedEventListeners = false;

// Trim MP3 encoder padding from decoded buffer for gapless looping
const trimBuffer = (ctx: AudioContext, buffer: AudioBuffer): AudioBuffer => {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  // MP3 encoders add ~1152 samples of silence at start and end
  const trimSamples = 1152;
  const newLength = Math.max(1, buffer.length - trimSamples * 2);
  const trimmed = ctx.createBuffer(channels, newLength, sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = trimmed.getChannelData(ch);
    dst.set(src.subarray(trimSamples, trimSamples + newLength));
  }
  return trimmed;
};

const loadBuffer = async (url: string): Promise<AudioBuffer | null> => {
  if (!audioCtx) return null;
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error('Failed to load audio:', url, e);
    return null;
  }
};

export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Unlock audio on first user gesture (browser autoplay policy)
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

    // Pre-load all audio buffers (trim tick for gapless looping)
    loadBuffer('/cinematic_tick.mp3').then(b => {
      if (b && audioCtx) {
        tickLoopBuffer = trimBuffer(audioCtx, b);
      }
    });
    loadBuffer('/coin_free.mp3').then(b => { coinFreeBuffer = b; });
    loadBuffer('/coin_hooked.mp3').then(b => { coinHookedBuffer = b; });

  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const ensureAudioContext = () => {
  if (!audioCtx) initAudio();
  return audioCtx;
};

// Schedule one iteration of the tick loop with crossfade overlap
const scheduleNextLoop = () => {
  if (!loopActive || !audioCtx || !tickLoopBuffer || !loopMasterGain) return;

  const ctx = audioCtx;
  const duration = tickLoopBuffer.duration;
  const crossfade = 0.15; // 150ms crossfade overlap

  const source = ctx.createBufferSource();
  source.buffer = tickLoopBuffer;

  const fadeGain = ctx.createGain();
  fadeGain.connect(loopMasterGain);
  source.connect(fadeGain);

  // Fade in at the start
  fadeGain.gain.setValueAtTime(0, ctx.currentTime);
  fadeGain.gain.linearRampToValueAtTime(1, ctx.currentTime + crossfade);

  // Fade out at the end
  fadeGain.gain.setValueAtTime(1, ctx.currentTime + duration - crossfade);
  fadeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + duration);

  activeLoopSources.push(source);
  source.onended = () => {
    activeLoopSources = activeLoopSources.filter(s => s !== source);
  };

  // Schedule the NEXT iteration to start crossfade-ms before this one ends
  const nextIn = (duration - crossfade) * 1000;
  loopTimerId = setTimeout(scheduleNextLoop, nextIn);
};

// Start the cinematic clock tick looping in the background
export const startTickLoop = () => {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  if (!tickLoopBuffer) return;
  if (loopActive) return; // Already playing

  loopActive = true;

  loopMasterGain = ctx.createGain();
  loopMasterGain.gain.value = 0.35; // Subtle background volume
  loopMasterGain.connect(ctx.destination);

  scheduleNextLoop();
};

// Stop the looping clock tick
export const stopTickLoop = () => {
  loopActive = false;
  if (loopTimerId) {
    clearTimeout(loopTimerId);
    loopTimerId = null;
  }
  activeLoopSources.forEach(s => {
    try { s.stop(); } catch (_) {}
    s.disconnect();
  });
  activeLoopSources = [];
  if (loopMasterGain) {
    loopMasterGain.disconnect();
    loopMasterGain = null;
  }
};

// Play a coin drop sound on each cent increment
export const playCentDrop = (isFree: boolean) => {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  // Swapped: use Hooked audio for Free (Green) and Free audio for Hooked (Red)
  const buffer = isFree ? coinHookedBuffer : coinFreeBuffer;
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  source.connect(gainNode);

  gainNode.gain.value = isFree ? 0.4 : 0.6;

  // Slight pitch variation to avoid machine-gun effect
  source.playbackRate.value = 0.95 + (Math.random() * 0.1);

  source.start(ctx.currentTime);
};
