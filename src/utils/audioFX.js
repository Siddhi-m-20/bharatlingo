// Web Audio API Synthesizer for high-fidelity, zero-dependency sound effects

class SoundFX {
  constructor() {
    this.ctx = null
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Pleasant Duolingo-style positive chime (C5 -> E5 -> G5)
  playCorrect() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.08)

        gain.gain.setValueAtTime(0, now + i * 0.08)
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.3)
      })
    } catch (e) {
      console.warn('Audio FX error:', e)
    }
  }

  // Soft gentle negative haptic tone (G#3 -> E3)
  playWrong() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, now) // A3
      osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.25) // D3

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.32)
    } catch (e) {
      console.warn('Audio FX error:', e)
    }
  }

  // Victory fanfare for lesson completion
  playVictory() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const notes = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.35 }, // C6
      ]

      let timeOffset = 0
      notes.forEach((n) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(n.f, now + timeOffset)

        gain.gain.setValueAtTime(0, now + timeOffset)
        gain.gain.linearRampToValueAtTime(0.25, now + timeOffset + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + n.d)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + timeOffset)
        osc.stop(now + timeOffset + n.d + 0.05)
        timeOffset += n.d * 0.8
      })
    } catch (e) {
      console.warn('Audio FX error:', e)
    }
  }

  // Milestone Chest Unlocked sound
  playChestOpen() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.45)
    } catch (e) {
      console.warn('Audio FX error:', e)
    }
  }
}

export const audioFX = new SoundFX()
