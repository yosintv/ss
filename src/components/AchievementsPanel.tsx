import { ACHIEVEMENTS } from '../engine/achievements'
import { UNLOCKS, levelFromXp } from '../engine/progression'
import { useGameStore } from '../store/gameStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function AchievementsPanel({ open, onClose }: Props): JSX.Element | null {
  const progression = useGameStore((s) => s.progression)
  if (!open) return null

  const lvl = levelFromXp(progression.totalXp)
  const pct = Math.round((lvl.xpInLevel / Math.max(1, lvl.xpForNext)) * 100)

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Progress &amp; Achievements</h2>
          <button
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <section className="mb-5 rounded-2xl bg-gradient-to-br from-amber-200 to-pink-200 p-4 text-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-700">Level</div>
              <div className="text-3xl font-extrabold">Lv {lvl.level}</div>
            </div>
            <div className="text-right text-sm font-semibold">
              {lvl.xpInLevel} / {lvl.xpForNext} XP
              <div className="text-xs font-normal text-zinc-700">Total {progression.totalXp} XP</div>
            </div>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-pink-600"
              style={{ width: `${pct}%` }}
            />
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-50 p-3">Daily Wins: <strong>{progression.dailyWins}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Daily Streak: <strong>{progression.dailyStreak}</strong></div>
          <div className="rounded-lg bg-zinc-50 p-3">Honour Wins: <strong>{progression.totalWinsNoGodMode}</strong></div>
        </section>

        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Achievements</h3>
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const earned = progression.unlockedAchievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                  earned
                    ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                    : 'border-zinc-200 bg-zinc-50 opacity-60'
                }`}
              >
                <span className="text-2xl">{earned ? a.icon : '🔒'}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{a.name}</div>
                  <div className="text-xs text-zinc-600">{a.description}</div>
                </div>
              </div>
            )
          })}
        </div>

        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Unlockables</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {UNLOCKS.map((u) => {
            const unlocked = progression.unlockedCosmetics.includes(u.id)
            return (
              <div
                key={u.id}
                className={`rounded-xl border p-3 text-sm transition ${
                  unlocked ? 'border-blue-300 bg-blue-50' : 'border-zinc-200 bg-zinc-50 opacity-60'
                }`}
              >
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-zinc-600">
                  {unlocked ? `✓ Unlocked` : `Reach Lv ${u.level}`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
