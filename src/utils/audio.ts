// Simple Audio Engine using Web Audio API for synthetic digital luxury sounds

let audioCtx: AudioContext | null = null;

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

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  
  // Overall low volume for background subtlety
  masterGain.gain.value = 0.6;

  const pTime = ctx.currentTime;

  // 1. IMPACT: White noise burst for the clink
  const bufferSize = ctx.sampleRate * 0.05; // 50ms of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  
  // Use a bandpass filter to make the noise thin and metallic
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 5000;
  noiseFilter.Q.value = 1;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(1, pTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, pTime + 0.03); // extreme short snap

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  
  noiseSource.start(pTime);

  // 2. RINGING: Additive synthesis using multiple high oscillators
  // Metallic sounds have inharmonic partials
  const freqs = isFree 
    ? [2000, 3105, 4510] // Bright, thin coin (silver)
    : [1500, 2400, 3200]; // Darker, heavier coin (bronze/hollow)

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; // Sines are best for additive synthesis ringing
    
    // Each partial drops slightly in pitch over its lifecycle (Doppler/metal effect)
    osc.frequency.setValueAtTime(freq, pTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, pTime + 0.3);

    const oscGain = ctx.createGain();
    
    // Higher partials decay faster for realism
    const decayTime = isFree ? 0.4 - (i * 0.1) : 0.3 - (i * 0.05);
    
    oscGain.gain.setValueAtTime(0, pTime);
    oscGain.gain.linearRampToValueAtTime(0.2, pTime + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, pTime + decayTime);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(pTime);
    osc.stop(pTime + decayTime);
  });
};
