// A single controller serves the Astro slot in React and the standalone demo.
class Confirmation extends HTMLElement {
  private cleanup?: () => void;
  connectedCallback() {
    // Astro slots may connect before their children have been inserted.
    queueMicrotask(() => { if (this.isConnected) this.initialize(); });
  }
  disconnectedCallback() { this.cleanup?.(); }
  private initialize() {
    this.cleanup?.();
    const button = this.querySelector<HTMLButtonElement>('[data-confirm]')!;
    if (!button) return;
    const supported = typeof navigator.vibrate === 'function';
    let audio: AudioContext | undefined;
    let locked = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const prepare = () => {
      try {
        audio ??= new AudioContext();
        void audio.resume().catch(() => {});
      } catch { /* Optional output: never blocks submission. */ }
    };
    const play = (frequencies: number[], duration = .2) => {
      try {
        if (audio?.state === 'running') {
          const start = audio.currentTime;
          frequencies.forEach((frequency, index) => {
            const oscillator = audio!.createOscillator();
            const gain = audio!.createGain();
            const time = start + index * .14;
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(.075, time + .015);
            gain.gain.exponentialRampToValueAtTime(.001, time + duration - .01);
            oscillator.connect(gain); gain.connect(audio!.destination);
            oscillator.start(time); oscillator.stop(time + duration);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
          });
        }
      } catch { /* Visual success survives audio failure. */ }
    };
    const feedback = () => {
      play([660, 880]);
      try { if (supported) navigator.vibrate([60, 40, 60]); } catch { /* Optional output. */ }
    };
    const state = (value: string) => {
      if (value === 'processing' && locked) return;
      if (value === 'success' && this.dataset.state !== 'processing') return;
      this.dataset.state = value;
      locked = value === 'processing' || value === 'success';
      button.disabled = locked;
      button.setAttribute('aria-busy', String(value === 'processing'));
      const message = value === 'processing' ? 'Procesando solicitud...' : value === 'success' ? 'Solicitud confirmada correctamente' : value === 'error' ? 'No se pudo confirmar la solicitud. Inténtalo nuevamente' : '';
      this.querySelector('[data-label]')!.textContent = locked ? message : 'Confirmar solicitud';
      this.querySelector('[data-symbol]')!.textContent = value === 'processing' ? '' : value === 'error' ? '!' : '✓';
      this.querySelector('[data-status]')!.textContent = value === 'error' ? '' : message;
      this.querySelector('[data-error]')!.textContent = value === 'error' ? message : '';
      if (value === 'processing') {
        prepare();
        // A short press sound acknowledges activation; only the two-note
        // earcon below communicates that the server confirmed success.
        if (audio?.state === 'running') play([440], .08);
        else if (audio) void audio.resume().then(() => {
          if (this.isConnected && this.dataset.state === 'processing') play([440], .08);
        }).catch(() => {});
      }
      if (value === 'success') feedback();
    };
    const onState = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (['processing', 'success', 'error'].includes(value)) {
        state(value);
      }
    };
    const form = this.closest('form');
    const demo = this.dataset.demo === 'true';
    const onSubmit = (event: Event) => {
      if (!demo) return;
      event.preventDefault();
      if (locked) return;
      state('processing');
      timer = setTimeout(() => state(form?.querySelector<HTMLInputElement>('[data-demo-error]')?.checked ? 'error' : 'success'), 650);
    };
    const reset = () => {
      clearTimeout(timer);
      state('idle');
    };
    this.addEventListener('confirmation-state', onState);
    form?.addEventListener('submit', onSubmit);
    form?.addEventListener('reset', reset);
    this.cleanup = () => {
      clearTimeout(timer);
      this.removeEventListener('confirmation-state', onState);
      form?.removeEventListener('submit', onSubmit);
      form?.removeEventListener('reset', reset);
      if (audio) void audio.close().catch(() => {});
    };
  }
}
if (!customElements.get('hp-confirmation')) customElements.define('hp-confirmation', Confirmation);
