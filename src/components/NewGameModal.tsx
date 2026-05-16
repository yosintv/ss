import { useState } from 'react'
import { generateSeed } from '../store/gameStore'
import { dailySeed, todayKey } from '../engine/dailySeed'
import type { Difficulty } from '../types/game'

type Mode = Difficulty | 'scorpio'

interface Props {
  open: boolean
  onClose: () => void
  onStart: (mode: Mode, seed: string, options?: { daily?: boolean }) => void
}

export function NewGameModal({ open, onClose, onStart }: Props): JSX.Element | null {
  const [mode, setMode] = useState<Mode>('1suit')
  const [seed, setSeed] = useState(generateSeed())
  if (!open) return null

  const selectedDesc =
    mode === '1suit'
      ? 'All spades. Great for beginners.'
      : mode === '2suit'
        ? 'Spades and hearts. A balanced challenge.'
        : mode === '4suit'
          ? 'Classic advanced mode. Pure strategy.'
          : 'Scorpio mode enabled. Uses advanced shuffle/deal ruleset.'

  const dailyMode: Difficulty = mode === 'scorpio' ? '4suit' : mode
  const dailySeedString = dailySeed(dailyMode)

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-3 sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-2xl font-bold text-zinc-900 sm:text-3xl">New Game</h2>
        <p className="mb-4 text-sm text-zinc-500 sm:text-base">
          Choose a mode and start fresh, or jump straight into today&rsquo;s daily challenge.
        </p>

        <button
          onClick={() => onStart(mode, dailySeedString, { daily: true })}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-3 text-left shadow-sm transition hover:shadow-md"
        >
          <span className="text-3xl">📅</span>
          <span>
            <div className="text-base font-bold">Play Today&rsquo;s Daily Challenge</div>
            <div className="text-xs text-zinc-600">
              {todayKey()} · seed {dailySeedString.slice(0, 24)}…
            </div>
          </span>
        </button>

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { key: '1suit', label: '1 Suit ★' },
            { key: '2suit', label: '2 Suits ★★' },
            { key: '4suit', label: '4 Suits ★★★' },
            { key: 'scorpio', label: 'Scorpio Mode 🦂' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setMode(item.key as Mode)}
              className={`rounded-xl border px-4 py-3 text-base font-semibold transition sm:py-4 sm:text-lg ${
                mode === item.key
                  ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
                  : 'border-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 sm:text-base">
          {selectedDesc}
        </div>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Seed</label>
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 p-3 text-xl font-semibold tracking-wide text-zinc-900 shadow-sm sm:text-2xl"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
        <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <button className="rounded-lg bg-zinc-700 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 sm:py-2.5" onClick={() => setSeed(generateSeed())}>
            🎲 Shuffle New Seed
          </button>
          <button className="rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 sm:py-2.5" onClick={() => onStart(mode, seed)}>
            ▶ Start Game
          </button>
          <button className="rounded-lg border border-zinc-400 px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 sm:py-2.5" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
