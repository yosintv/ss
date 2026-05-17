export type SoundName =
  | 'autoplay'
  | 'bubbles'
  | 'card_drop'
  | 'card_flip'
  | 'deal_animation'
  | 'game_won'
  | 'glass'
  | 'light'
  | 'redeal'
  | 'redo'
  | 'stock_flip'
  | 'undo'

const audioCache: Partial<Record<SoundName, HTMLAudioElement>> = {}

export function playSound(enabled: boolean, name: SoundName, volume = 0.5): void {
  if (!enabled || typeof window === 'undefined') return
  try {
    if (!audioCache[name]) audioCache[name] = new Audio(`/sounds/${name}.mp3`)
    const audio = audioCache[name]
    if (!audio) return
    audio.currentTime = 0
    audio.volume = volume
    void audio.play()
  } catch {
    // no-op: browsers may block autoplay until user gesture
  }
}

