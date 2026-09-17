// Web Audio API Synthesizer for Focus & Pomodoro Timers
// 100% offline, zero latency, no external audio files required.

let audioCtx = null;

export const initAudio = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (err) {
    console.warn("AudioContext init error:", err);
  }
};

/**
 * Plays a gentle, harmonic Zen meditation chime (Tibetan singing bowl style).
 * Soft attack with exponential decay to preserve deep focus and flow.
 */
export const playZenChime = (volume = 0.6) => {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(audioCtx.destination);

  // Harmonic overtone chord (D5 with overtone series)
  const partials = [
    { freq: 587.33, gain: 0.6, decay: 2.8 },   // D5 (Fundamental)
    { freq: 880.00, gain: 0.35, decay: 2.2 },  // A5 (Fifth)
    { freq: 1174.66, gain: 0.2, decay: 1.6 }, // D6 (Octave)
    { freq: 1760.00, gain: 0.1, decay: 1.1 }  // A6
  ];

  partials.forEach(({ freq, gain, decay }) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Envelope: 20ms attack, exponential release
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(g);
    g.connect(masterGain);

    osc.start(now);
    osc.stop(now + decay);
  });

  // Phone haptic vibration alert
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {}
  }
};

/**
 * Plays a crisp, melodic digital chime (ascending triad C5 -> E5 -> G5).
 */
export const playDigitalChime = (volume = 0.6) => {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [
    { freq: 523.25, time: 0, duration: 0.4 },     // C5
    { freq: 659.25, time: 0.14, duration: 0.4 },  // E5
    { freq: 783.99, time: 0.28, duration: 0.8 }   // G5
  ];

  notes.forEach(({ freq, time, duration }) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    g.gain.setValueAtTime(0.0001, now + time);
    g.gain.linearRampToValueAtTime(volume * 0.45, now + time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

    osc.connect(g);
    g.connect(audioCtx.destination);

    osc.start(now + time);
    osc.stop(now + time + duration);
  });

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([150, 80, 250]);
    } catch {}
  }
};

/**
 * Deep resonating Gong (warm low-frequency bell).
 */
export const playMeditationGong = (volume = 0.6) => {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now); // A3
  osc.frequency.exponentialRampToValueAtTime(212, now + 3.0);

  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(volume * 0.7, now + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

  osc.connect(g);
  g.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 3.0);

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([400, 150, 400]);
    } catch {}
  }
};

export const SOUND_PRESETS = [
  { id: 'zen', name: 'Cloche Zen (Bol Tibétain)', play: playZenChime, icon: '🧘', desc: 'Doux, apaisant et sans sursaut' },
  { id: 'digital', name: 'Carillon Moderne', play: playDigitalChime, icon: '✨', desc: 'Triade mélodique ascendante' },
  { id: 'gong', name: 'Gong Résonnant', play: playMeditationGong, icon: '🔔', desc: 'Fréquence basse profonde' }
];

export const playTimerAlarm = (soundId = 'zen', volume = 0.6) => {
  const preset = SOUND_PRESETS.find(p => p.id === soundId) || SOUND_PRESETS[0];
  preset.play(volume);
};
