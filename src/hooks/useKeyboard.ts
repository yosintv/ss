import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

interface KeyboardOptions {
  onNewGame: () => void
  onCloseOverlays: () => void
  onGodMode: () => void
  onAchievements: () => void
}

export function useKeyboard({
  onNewGame,
  onCloseOverlays,
  onGodMode,
  onAchievements
}: KeyboardOptions): void {
  const showHint = useGameStore((s) => s.showHint)
  const undo = useGameStore((s) => s.undo)
  const dealStock = useGameStore((s) => s.dealStock)
  const clearSelection = useGameStore((s) => s.clearSelection)
  const startAutoComplete = useGameStore((s) => s.startAutoComplete)
  const peek = useGameStore((s) => s.peek)
  const godMode = useGameStore((s) => s.godMode)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      const key = event.key.toLowerCase()
      if (key === 'h') showHint()
      else if (key === 'd') dealStock()
      else if (key === 'n') onNewGame()
      else if (key === 'a') startAutoComplete()
      else if (key === 'p') {
        if (godMode) peek()
      } else if (key === 'g') onGodMode()
      else if (key === 'l') onAchievements()
      else if (key === 'escape') {
        clearSelection()
        onCloseOverlays()
      } else if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    showHint,
    dealStock,
    onNewGame,
    clearSelection,
    onCloseOverlays,
    undo,
    startAutoComplete,
    peek,
    godMode,
    onGodMode,
    onAchievements
  ])
}
