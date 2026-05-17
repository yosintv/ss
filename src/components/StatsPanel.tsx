import type { Difficulty } from '../types/game'
import { formatPercent, formatTime } from '../utils/format'
import type { GameStore } from '../store/gameStore'

interface Props {
  open: boolean
  difficulty: Difficulty
  statsByDifficulty: GameStore['statsByDifficulty']
  onClose: () => void
  onReset: () => void
  onSwitch: (d: Difficulty) => void
}

export function StatsPanel({ open, difficulty, statsByDifficulty, onClose, onReset, onSwitch }: Props): JSX.Element | null {
  if (!open) return null
  const s = statsByDifficulty[difficulty]
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl sm:p-6 animate-[slideUp_0.22s_ease-out] sm:animate-[modalIn_0.18s_ease-out]" onClick={e => e.stopPropagation()}>
        <h2 className="mb-1 text-2xl font-bold">Statistics</h2>
        <p className="mb-4 text-sm text-zinc-500">Track your Spider Solitaire progress and win rate.</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['1suit', '2suit', '4suit'] as const).map((d) => (
            <button
              key={d}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                difficulty === d
                  ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
                  : 'border-zinc-300 bg-zinc-50 text-zinc-900'
              }`}
              onClick={() => onSwitch(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-3">Games Played: <strong>{s.gamesPlayed}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Win Rate: <strong>{formatPercent(s.gamesWon, s.gamesPlayed)}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Current Streak: <strong>{s.currentStreak}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Best Streak: <strong>{s.bestStreak}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Best Time: <strong>{s.bestTime === null ? '—' : formatTime(s.bestTime)}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Best Score: <strong>{s.bestScore ?? '—'}</strong></div>
        </div>
        <div className="mt-5 flex gap-2">
          <button className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700" onClick={onReset}>Reset Stats</button>
          <button className="rounded-lg border border-zinc-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
