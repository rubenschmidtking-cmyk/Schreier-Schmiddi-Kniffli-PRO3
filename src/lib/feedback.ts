let audio: HTMLAudioElement | null = null

export function playRollSound(enabled: boolean) {
  if (!enabled) return
  try {
    audio ??= new Audio('/dice_roll.wav')
    audio.currentTime = 0
    void audio.play()
  } catch {}
}

export function softVibrate(pattern: number | number[] = 15) {
  try { navigator.vibrate?.(pattern) } catch {}
}

export function playScoreTone(enabled: boolean, special = false) {
  if (!enabled) return
  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return
    const ctx = new AudioContextCtor()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = special ? 660 : 440
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch {}
}
