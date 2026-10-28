// Reads text aloud with the browser's built-in speech (no downloads, works offline once loaded).
// Pre-readers in KG to Grade 2 can tap a speaker button to hear instructions and words.

export const canReadAloud = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const pickVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === 'en-IN') ??
    voices.find((voice) => voice.lang === 'en-GB') ??
    voices.find((voice) => voice.lang.startsWith('en'))
  );
};

export const readAloud = (text: string) => {
  if (!canReadAloud() || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'en-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech is a help, never a requirement.
  }
};

export const stopReading = () => {
  if (canReadAloud()) window.speechSynthesis.cancel();
};
