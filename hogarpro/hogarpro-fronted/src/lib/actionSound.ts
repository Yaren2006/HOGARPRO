let context: AudioContext | undefined;

/** Call from the user action first so asynchronous completion can reuse audio. */
export function playActionSound(success = false) {
  try {
    context ??= new AudioContext();
    const audio = context;
    const play = () => {
      if (audio.state !== 'running') return;
      const duration = success ? .2 : .08;
      (success ? [660, 880] : [440]).forEach((frequency, index) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const start = audio.currentTime + index * .14;
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.075, start + .015);
        gain.gain.exponentialRampToValueAtTime(.001, start + duration - .01);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(start);
        oscillator.stop(start + duration);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    };
    if (audio.state === 'running') play();
    else void audio.resume().then(play).catch(() => {});
  } catch { /* Audio is optional and must not interrupt cancellation. */ }
}
