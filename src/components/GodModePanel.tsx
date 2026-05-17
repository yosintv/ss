import { useGameStore } from '../store/gameStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function GodModePanel({ open, onClose }: Props): JSX.Element | null {
  const godMode = useGameStore((s) => s.godMode)
  const toggleGodMode = useGameStore((s) => s.toggleGodMode)
  const peek = useGameStore((s) => s.peek)
  const godMagicDeal = useGameStore((s) => s.godMagicDeal)
  const godRevealOne = useGameStore((s) => s.godRevealOne)
  const godUndoAll = useGameStore((s) => s.godUndoAll)
  const applyHint = useGameStore((s) => s.applyHint)
  const stockSize = useGameStore((s) => s.stock.length)
  const historySize = useGameStore((s) => s.history.length)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-t-2xl sm:rounded-3xl border border-fuchsia-300/30 bg-gradient-to-b from-zinc-900 to-zinc-800 p-5 text-white shadow-2xl sm:p-7 animate-[slideUp_0.22s_ease-out] sm:animate-[modalIn_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <span>🪄</span> God Mode
          </h2>
          <button
            className="rounded-lg border border-white/30 px-3 py-1.5 text-sm font-medium hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <p className="mb-4 text-sm text-white/80">
          Have some fun. Toggle god mode and use power-ups when you want a relaxed session.
          <span className="ml-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300">
            Stats &amp; achievements are disabled when god mode is used in a game.
          </span>
        </p>

        <button
          onClick={toggleGodMode}
          className={`mb-5 w-full rounded-xl py-3 text-base font-bold transition ${
            godMode
              ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/40 hover:bg-fuchsia-400'
              : 'bg-white/15 text-white hover:bg-white/25'
          }`}
        >
          {godMode ? 'God Mode is ON — click to turn OFF' : 'Turn God Mode ON'}
        </button>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PowerButton
            disabled={!godMode}
            icon="👁"
            title="Peek"
            desc="Flash all face-down cards for 1.5s"
            onClick={() => peek(1500)}
          />
          <PowerButton
            disabled={!godMode || stockSize === 0}
            icon="🎴"
            title="Magic Deal"
            desc="Deal stock even if columns are empty"
            onClick={godMagicDeal}
          />
          <PowerButton
            disabled={!godMode}
            icon="🔍"
            title="Reveal One"
            desc="Flip a single face-down card"
            onClick={godRevealOne}
          />
          <PowerButton
            disabled={!godMode}
            icon="✨"
            title="Hint+"
            desc="Auto-apply the suggested move"
            onClick={applyHint}
          />
          <PowerButton
            disabled={!godMode || historySize === 0}
            icon="⏮"
            title="Undo All"
            desc={`Roll back the whole game (${historySize} moves)`}
            onClick={() => {
              if (window.confirm('Undo every move you have made?')) godUndoAll()
            }}
          />
          <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white/70">
            <div className="mb-1 font-semibold text-white/85">Tips</div>
            <div>Peek again to flash the board if it auto-hides too fast.</div>
            <div>Use Hint+ when you&rsquo;re stuck and want the game to play itself a turn.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PowerProps {
  icon: string
  title: string
  desc: string
  disabled: boolean
  onClick: () => void
}

function PowerButton({ icon, title, desc, disabled, onClick }: PowerProps): JSX.Element {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-3 text-left transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5"
    >
      <span className="text-2xl">{icon}</span>
      <span className="flex-1">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs text-white/70">{desc}</div>
      </span>
    </button>
  )
}
