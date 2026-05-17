import { useEffect } from 'react'
import { formatTime } from '../utils/format'
import { ACHIEVEMENTS } from '../engine/achievements'
import { UNLOCKS } from '../engine/progression'
import type { WinReport } from '../types/game'
import { celebrateWin } from '../utils/confetti'

interface Props {
  open: boolean
  score: number
  moves: number
  elapsed: number
  difficulty: string
  seed: string
  isDaily: boolean
  report: WinReport | null
  onPlayAgain: () => void
  onViewStats: () => void
  onClose: () => void
}

export function WinScreen({
  open,
  score,
  moves,
  elapsed,
  difficulty,
  seed,
  isDaily,
  report,
  onPlayAgain,
  onViewStats,
  onClose
}: Props): JSX.Element | null {
  useEffect(() => {
    if (open) celebrateWin()
  }, [open])

  if (!open) return null

  const leveledUp = report && report.levelAfter > report.levelBefore
  const achievementObjects = (report?.achievementsUnlocked ?? []).map((id) =>
    ACHIEVEMENTS.find((a) => a.id === id)
  ).filter(Boolean) as { id: string; name: string; icon: string; description: string }[]
  const cosmeticObjects = (report?.cosmeticsUnlocked ?? []).map((id) =>
    UNLOCKS.find((u) => u.id === id)
  ).filter(Boolean) as { id: string; name: string; level: number }[]

  const share = async (): Promise<void> => {
    const tag = isDaily ? 'Daily ' : ''
    const text = `I won the ${tag}Spider Solitaire (${difficulty}) in ${formatTime(elapsed)} with ${moves} moves! Seed: ${seed} | Score: ${score} | spidersolitaire.xyz`
    if (navigator.share) {
      try { await navigator.share({ text }); return } catch { /* user cancelled */ }
    }
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-3xl border border-amber-200 bg-gradient-to-b from-white to-amber-50 p-5 text-center text-zinc-900 shadow-2xl sm:p-7 animate-[slideUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)] sm:animate-[modalIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-5xl">🏆</div>
        <h2 className="text-3xl font-extrabold">You Won!</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {isDaily ? 'Daily challenge completed' : `${difficulty.toUpperCase()} mode`}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <div className="rounded-lg bg-white p-2 shadow-sm"><strong>{score}</strong><br />Score</div>
          <div className="rounded-lg bg-white p-2 shadow-sm"><strong>{moves}</strong><br />Moves</div>
          <div className="rounded-lg bg-white p-2 shadow-sm"><strong>{formatTime(elapsed)}</strong><br />Time</div>
        </div>

        {report && report.totalGained > 0 && (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-700">XP gained</h3>
              <div className="text-xl font-extrabold text-amber-700">+{report.totalGained}</div>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {report.awards.map((a, i) => (
                <li key={i} className="flex items-center justify-between text-zinc-700">
                  <span>{a.reason}</span>
                  <span className="font-semibold">+{a.amount}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {leveledUp && (
          <section className="mt-4 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 p-4 text-white shadow-lg">
            <div className="text-xs font-bold uppercase tracking-widest">Level Up!</div>
            <div className="text-2xl font-extrabold">
              Lv {report.levelBefore} → Lv {report.levelAfter}
            </div>
          </section>
        )}

        {achievementObjects.length > 0 && (
          <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left">
            <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-700">
              {achievementObjects.length} new achievement{achievementObjects.length === 1 ? '' : 's'}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {achievementObjects.map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <span className="text-xl">{a.icon}</span>
                  <span>
                    <span className="font-bold">{a.name}</span> — <span className="text-zinc-600">{a.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {cosmeticObjects.length > 0 && (
          <section className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left">
            <h3 className="text-sm font-bold uppercase tracking-wide text-blue-700">Unlocked</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {cosmeticObjects.map((c) => (
                <li key={c.id} className="text-zinc-700">🎁 {c.name}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center">
          <button className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700" onClick={onPlayAgain}>Play Again</button>
          <button className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900" onClick={() => void share()}>Share Result</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" onClick={onViewStats}>View Stats</button>
        </div>
      </div>
    </div>
  )
}
