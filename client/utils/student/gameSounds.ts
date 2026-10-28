// Short synthesized sounds for games (no audio files to download). Muting is remembered per device.
export type GameSound = 'tap' | 'correct' | 'wrong' | 'celebrate';

const STORAGE_KEY = 'logos-game-sound';
const NOTES: Record<GameSound, [number, number][]> = {
  tap: [[660, 0.05]],
  correct: [[660, 0.09], [880, 0.14]],
  wrong: [[220, 0.18]],
  celebrate: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.22]],
};

let context: AudioContext | null = null;

export const isGameSoundOn = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
};

export const setGameSoundOn = (on: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // Storage can be unavailable (private mode); sound still follows the in-memory toggle.
  }
};

export const playGameSound = (sound: GameSound, enabled: boolean) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    context ??= new AudioCtx();
    let start = context.currentTime;
    for (const [frequency, duration] of NOTES[sound]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = sound === 'wrong' ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
      start += duration;
    }
  } catch {
    // Audio is optional; never break a game over it.
  }
};
