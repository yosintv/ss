import { useState } from 'react'
import { generateSeed } from '../store/gameStore'
import { dailySeed, todayKey } from '../engine/dailySeed'
import type { Difficulty } from '../types/game'

type Mode = Difficulty | 'scorpio' | 'klondike'

interface Props {
  open: boolean
  onClose: () => void
  onStart: (mode: Mode, seed: string, options?: { daily?: boolean; drawMode?: 1 | 3 }) => void
}

const MODES: { key: Mode; label: string; icon: string; desc: string }[] = [
  { key: '1suit',    label: '1 Suit',   icon: '♠',    desc: 'Beginner' },
  { key: '2suit',    label: '2 Suits',  icon: '♠♥',   desc: 'Medium'   },
  { key: '4suit',    label: '4 Suits',  icon: '♠♥♦♣', desc: 'Expert'   },
  { key: 'scorpio',  label: 'Scorpio',  icon: '🦂',   desc: 'Special'  },
  { key: 'klondike', label: 'Klondike', icon: '🃏',   desc: 'Classic'  },
]

function savedMode(): Mode {
  try { return (localStorage.getItem('lastMode') as Mode) ?? '1suit' } catch { return '1suit' }
}

export function NewGameModal({ open, onClose, onStart }: Props): JSX.Element | null {
  const [mode, setMode] = useState<Mode>(savedMode)
  const [drawMode, setDrawMode] = useState<1 | 3>(1)
  const [seed, setSeed] = useState(generateSeed())
  const [showSeed, setShowSeed] = useState(false)

  if (!open) return null

  const dailyMode: Difficulty = mode === 'scorpio' || mode === 'klondike' ? '4suit' : mode
  const dailySeedString = dailySeed(dailyMode)

  const handleSetMode = (m: Mode) => {
    setMode(m)
    try { localStorage.setItem('lastMode', m) } catch { /* ignore */ }
  }

  const handleStart = (opts?: { daily?: boolean }) => {
    onStart(mode, seed, { ...opts, drawMode })
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white text-zinc-900 shadow-2xl overflow-hidden animate-[modalIn_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">New Game</h2>
          <button
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-4 pt-3 pb-4 space-y-3">
          {/* Daily Challenge */}
          {mode !== 'klondike' && (
            <button
              onClick={() => handleStart({ daily: true })}
              className="w-full flex items-center gap-3 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2.5 text-left hover:from-amber-100 hover:to-yellow-100 active:scale-[0.98] transition-all"
            >
              <span className="text-2xl">📅</span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-zinc-900 leading-tight">Today&rsquo;s Daily Challenge</div>
                <div className="text-xs text-zinc-500 truncate">{todayKey()}</div>
              </div>
            </button>
          )}

          {/* Mode selector */}
          <div className="grid grid-cols-5 gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => handleSetMode(m.key)}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 px-1 text-center transition-all border-2 active:scale-95 ${
                  mode === m.key
                    ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-200'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                }`}
              >
                <span className="text-base leading-none">{m.icon}</span>
                <span className="text-[10px] font-bold leading-tight mt-0.5">{m.label}</span>
                <span className={`text-[9px] leading-none ${mode === m.key ? 'text-blue-500' : 'text-zinc-400'}`}>{m.desc}</span>
              </button>
            ))}
          </div>

          {/* Klondike draw mode toggle */}
          {mode === 'klondike' && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2">
              <span className="text-xs font-semibold text-zinc-500 mr-1">Draw</span>
              {([1, 3] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDrawMode(d)}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-bold transition-all ${
                    drawMode === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {d} card{d === 3 ? 's' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Seed toggle */}
          <button
            onClick={() => setShowSeed((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition"
          >
            <span className={`transition-transform duration-150 ${showSeed ? 'rotate-90' : ''}`}>▶</span>
            Custom seed
          </button>

          {showSeed && (
            <div className="flex gap-2">
              <input
                className="flex-1 min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <button
                className="shrink-0 rounded-lg bg-zinc-100 px-3 py-2 text-base hover:bg-zinc-200 transition active:scale-95"
                onClick={() => setSeed(generateSeed())}
                title="Random seed"
              >
                🎲
              </button>
            </div>
          )}

          {/* Start button */}
          <button
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-900/20"
            onClick={() => handleStart()}
          >
            ▶&nbsp; Start Game
          </button>
        </div>
      </div>
    </div>
  )
}
