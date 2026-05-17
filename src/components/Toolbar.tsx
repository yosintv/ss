import { levelFromXp } from '../engine/progression'

interface Props {
  score: number
  moves: number
  time: string
  totalXp: number
  godMode: boolean
  isDaily: boolean
  canAutoComplete: boolean
  onHint: () => void
  onUndo: () => void
  onNewGame: () => void
  onSettings: () => void
  onStats: () => void
  onAchievements: () => void
  onGodMode: () => void
  onAutoComplete: () => void
  onDaily: () => void
}

export function Toolbar({
  score,
  moves,
  time,
  totalXp,
  godMode,
  isDaily,
  canAutoComplete,
  onHint,
  onUndo,
  onNewGame,
  onSettings,
  onStats,
  onAchievements,
  onGodMode,
  onAutoComplete,
  onDaily
}: Props): JSX.Element {
  const lvl = levelFromXp(totalXp)
  const pct = Math.round((lvl.xpInLevel / Math.max(1, lvl.xpForNext)) * 100)

  return (
    <header
      className="fixed left-0 top-0 z-20 w-full bg-[var(--toolbar-bg)] text-[var(--toolbar-text)] backdrop-blur"
      style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <h1 className="flex min-w-0 items-center gap-1.5 text-sm font-bold sm:text-base">
          <img src="/logo.png" alt="Spider Solitaire logo" className="h-6 w-6 shrink-0 rounded-full bg-white/10 object-cover" />
          <span className="hidden truncate sm:inline">Spider Solitaire</span>
          {isDaily && <span className="shrink-0 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-bold leading-none text-zinc-900">DAILY</span>}
          {godMode && <span className="shrink-0 rounded-full bg-fuchsia-500/90 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">GOD</span>}
        </h1>
        {/* Stats — all inline, visible at all sizes */}
        <div className="flex shrink-0 items-center gap-2 text-[11px] sm:text-xs">
          <span className="text-white/70">Score <strong className="text-white">{score}</strong></span>
          <span className="text-white/30">·</span>
          <span className="text-white/70">Moves <strong className="text-white">{moves}</strong></span>
          <span className="text-white/30">·</span>
          <span className="whitespace-nowrap text-white/70">⏱ <strong className="text-white">{time}</strong></span>
          <button
            onClick={onAchievements}
            title={`Level ${lvl.level} · ${lvl.xpInLevel}/${lvl.xpForNext} XP`}
            className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] hover:bg-white/25 transition"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="font-bold">Lv {lvl.level}</span>
            <span className="relative h-1.5 w-8 overflow-hidden rounded-full bg-black/30 sm:w-12">
              <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-pink-500" style={{ width: `${pct}%` }} />
            </span>
          </button>
        </div>
      </div>
      {/* Action buttons: one horizontally scrollable row */}
      <nav
        aria-label="Game actions"
        className="flex gap-1.5 overflow-x-auto px-3 pb-2 text-xs scrollbar-hide sm:flex-wrap sm:overflow-visible"
        style={{ scrollbarWidth: 'none' }}
      >
        <TbBtn onClick={onHint} title="H — Hint">💡<span className="ml-1 hidden sm:inline">Hint</span></TbBtn>
        <TbBtn onClick={onUndo} title="Ctrl/Cmd+Z — Undo">↶<span className="ml-1 hidden sm:inline">Undo</span></TbBtn>
        <TbBtn onClick={onNewGame} title="N — New game">＋<span className="ml-1 hidden sm:inline">New</span></TbBtn>
        <TbBtn
          onClick={onAutoComplete}
          disabled={!canAutoComplete}
          title="A — Auto-complete (all face-up)"
          variant="primary"
        >
          🤖<span className="ml-1 hidden sm:inline">Auto</span>
        </TbBtn>
        <TbBtn onClick={onDaily} title="Today's daily challenge" variant="amber">
          📅<span className="ml-1 hidden sm:inline">Daily</span>
        </TbBtn>
        <TbBtn onClick={onGodMode} title="G — God mode" variant={godMode ? 'fuchsia' : 'default'}>
          🪄<span className="ml-1 hidden sm:inline">God</span>
        </TbBtn>
        <TbBtn onClick={onSettings} title="Settings">⚙<span className="ml-1 hidden sm:inline">Settings</span></TbBtn>
        <TbBtn onClick={onStats} title="Stats">📊<span className="ml-1 hidden sm:inline">Stats</span></TbBtn>
      </nav>
    </header>
  )
}

interface BtnProps {
  onClick: () => void
  title: string
  disabled?: boolean
  variant?: 'default' | 'primary' | 'amber' | 'fuchsia'
  children: React.ReactNode
}

function TbBtn({ onClick, title, disabled = false, variant = 'default', children }: BtnProps): JSX.Element {
  const base =
    'shrink-0 rounded-md px-2.5 py-1.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'
  const styles =
    variant === 'primary'
      ? 'bg-emerald-500/85 text-white hover:bg-emerald-500'
      : variant === 'amber'
        ? 'bg-amber-400/85 text-zinc-900 hover:bg-amber-300'
        : variant === 'fuchsia'
          ? 'bg-fuchsia-500/85 text-white hover:bg-fuchsia-400'
          : 'bg-white/20 text-white hover:bg-white/30'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`${base} ${styles}`}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </button>
  )
}
