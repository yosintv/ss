import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatTime } from '../utils/format'

export function useTimer(): { formattedTime: string } {
  const elapsedTime = useGameStore((s) => s.elapsedTime)
  const status = useGameStore((s) => s.status)
  const tick = useGameStore((s) => s.tick)

  useEffect(() => {
    if (status !== 'playing') return
    let id: number | null = null

    const start = () => {
      if (document.visibilityState === 'visible') {
        id = window.setInterval(() => tick(), 1000)
      }
    }

    const stop = () => {
      if (id) window.clearInterval(id)
      id = null
    }

    const onVisibility = () => {
      stop()
      start()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [status, tick])

  return { formattedTime: formatTime(elapsedTime) }
}
