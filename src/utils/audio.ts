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

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Glass-like ping for cent increments
  osc.type = 'sine';
  
  if (isFree) {
    // Pleasant, bell-like, high pitch (C6)
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime); 
  } else {
    // Hollow, dropping pitch
    osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);
  }

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02); // Soft attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); // Long release

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.0);
};
