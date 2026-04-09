// Audio Engine using Web Audio API
// - Cinematic clock tick loops as ambient background
// - Real coin drop MP3 fires on each cent increment

let audioCtx: AudioContext | null = null;

// Pre-decoded audio buffers (loaded once at init)
let tickLoopBuffer: AudioBuffer | null = null;
let coinFreeBuffer: AudioBuffer | null = null;
let coinHookedBuffer: AudioBuffer | null = null;

// The currently playing loop source (so we can stop it)
let loopSource: AudioBufferSourceNode | null = null;
let loopGainNode: GainNode | null = null;

let initializedEventListeners = false;

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

    // Pre-load all audio buffers
    loadBuffer('/cinematic_tick.mp3').then(b => { tickLoopBuffer = b; });
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

// Start the cinematic clock tick looping in the background
export const startTickLoop = () => {
  const ctx = ensureAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  if (!tickLoopBuffer) return;
  if (loopSource) return; // Already playing

  loopGainNode = ctx.createGain();
  loopGainNode.gain.value = 0.35; // Subtle background volume
  loopGainNode.connect(ctx.destination);

  loopSource = ctx.createBufferSource();
  loopSource.buffer = tickLoopBuffer;
  loopSource.loop = true; // Seamless infinite loop
  loopSource.connect(loopGainNode);
  loopSource.start(ctx.currentTime);
};

// Stop the looping clock tick
export const stopTickLoop = () => {
  if (loopSource) {
    try { loopSource.stop(); } catch (_) {}
    loopSource.disconnect();
    loopSource = null;
  }
  if (loopGainNode) {
    loopGainNode.disconnect();
    loopGainNode = null;
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
