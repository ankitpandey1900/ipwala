// subtle keyboard sounds using Web Audio API
// no external audio files — generates clicks programmatically
// sounds are intentionally quiet and satisfying, not annoying

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      // audio not supported, fail silently
      return null;
    }
  }
  return audioCtx;
}

// soft mechanical key click — short burst of filtered noise
export function playKeyClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  const duration = 0.04; // 40ms — short and snappy

  // white noise burst shaped like a key click
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // noise with quick decay envelope
    const envelope = Math.exp(-i / (bufferSize * 0.15));
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // bandpass filter gives it a mechanical feel, not white noise
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000 + Math.random() * 1500; // slight variation per keystroke
  filter.Q.value = 1.5;

  // keep it quiet
  const gain = ctx.createGain();
  gain.gain.value = 0.06;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration);
}

// slightly different sound for enter/submit — deeper thunk
export function playSubmitSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  const duration = 0.06;

  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.exp(-i / (bufferSize * 0.2));
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200; // deeper than regular keys
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.value = 0.1;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration);
}
