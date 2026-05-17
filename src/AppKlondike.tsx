import { useEffect } from 'react'
import { useKlondikeStore } from './store/klondikeStore'
import { KlondikeGame } from './components/KlondikeGame'
import { formatTime } from './utils/format'

export default function AppKlondike() {
  const moves       = useKlondikeStore(s => s.moves)
  const elapsedTime = useKlondikeStore(s => s.elapsedTime)
  const drawMode    = useKlondikeStore(s => s.drawMode)
  const status      = useKlondikeStore(s => s.status)
  const undo        = useKlondikeStore(s => s.undo)
  const showHint    = useKlondikeStore(s => s.showHint)
  const newGame     = useKlondikeStore(s => s.newGame)

  useEffect(() => {
    // honour ?draw=3 query param
    const draw = new URLSearchParams(window.location.search).get('draw')
    const seed = new URLSearchParams(window.location.search).get('seed') ?? undefined
    const mode = draw === '3' ? 3 : 1
    newGame(seed, mode as 1 | 3)
  }, [newGame])

  useEffect(() => {
    document.documentElement.dataset.theme = 'green'
  }, [])

  return (
    <div className="min-h-screen bg-[var(--table-bg)] text-white" style={{ backgroundImage: 'var(--table-texture)' }}>
      {/* Header */}
      <header className="fixed left-0 top-0 z-20 w-full bg-[var(--toolbar-bg)] text-[var(--toolbar-text)] backdrop-blur"
        style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
          <h1 className="flex items-center gap-2 text-sm font-bold sm:text-lg">
            <img src="/logo.png" alt="" className="h-6 w-6 rounded-full object-cover" />
            <a href="/" className="truncate hover:underline">Spider Solitaire</a>
            <span className="shrink-0 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">KLONDIKE</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] sm:text-sm">
            <span>Moves <strong>{moves}</strong></span>
            <span>⏱ <strong>{formatTime(elapsedTime)}</strong></span>
            <span className="text-white/50">Draw {drawMode}</span>
          </div>
        </div>
        <nav className="flex gap-1.5 px-3 pb-2 text-xs overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: '💡 Hint',    action: showHint },
            { label: '↶ Undo',    action: undo },
            { label: '＋ New',    action: () => newGame(undefined, drawMode) },
            { label: '🏠 Home',   action: () => { window.location.href = '/' } },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className="shrink-0 rounded-md bg-white/20 px-2.5 py-1.5 font-semibold hover:bg-white/30 transition"
              style={{ touchAction: 'manipulation' }}
            >
              {btn.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Game */}
      <div className="pt-[110px] sm:pt-[90px]">
        <KlondikeGame />
      </div>

      {/* How to Play section */}
      <section className="mx-auto max-w-5xl px-3 pb-10 text-white/95 sm:px-4">
        <h2 className="mb-3 text-lg font-semibold sm:text-xl">How to Play Klondike Solitaire</h2>
        <div className="space-y-2 text-[13px] leading-6 sm:text-base">
          <p>Klondike Solitaire uses one 52-card deck dealt into 7 tableau columns (1–7 cards each, only the bottom card face-up), a draw stock, a waste pile, and 4 foundation slots — one per suit.</p>
          <p>Move face-up cards onto another column if the destination card is exactly one rank higher and opposite in color. Red goes on black, black goes on red. Example: place a red 6 on a black 7.</p>
          <p>You can move a group of face-up cards together if they already form a valid alternating-color descending sequence. When the last face-up card in a column is moved, the card beneath it flips face-up automatically.</p>
          <p>Only a King (or a King-led sequence) may be placed in an empty column. Use empty columns strategically — they are your most powerful resource.</p>
          <p>Click the stock to draw one card to the waste pile. The top waste card is always available to play. When the stock runs out, click it again to recycle the waste pile back into a new stock.</p>
          <p>Build each foundation from Ace up to King in the same suit. Move Aces and 2s to the foundation immediately — they have no tableau use. Win by completing all four foundations (A → K in every suit).</p>
          <p>
            Want the full rules and strategy?{' '}
            <a className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white transition hover:bg-white/20" href="/blog/how-to-play-klondike-solitaire.html">How to Play Klondike</a>
            {' '}·{' '}
            <a className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white transition hover:bg-white/20" href="/blog/klondike-solitaire-rules.html">Rules Reference</a>
            {' '}·{' '}
            <a className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white transition hover:bg-white/20" href="/blog/klondike-solitaire-strategy.html">Strategy Guide</a>
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <a href="/blog/how-to-play-klondike-solitaire.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>How to Play Klondike Solitaire</strong><br />
            <span className="text-white/80">Complete beginner&rsquo;s guide.</span>
          </a>
          <a href="/blog/klondike-solitaire-rules.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>Klondike Solitaire Rules</strong><br />
            <span className="text-white/80">The definitive rules reference.</span>
          </a>
          <a href="/blog/klondike-solitaire-strategy.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>Klondike Strategy Guide</strong><br />
            <span className="text-white/80">Win more games with proven tactics.</span>
          </a>
          <a href="/blog/spider-solitaire-vs-klondike.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>Spider vs Klondike</strong><br />
            <span className="text-white/80">Which solitaire should you play?</span>
          </a>
        </div>
      </section>

      <footer className="border-t border-white/20 px-4 pb-8 pt-4 text-center text-sm text-white/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4">
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/">Spider Solitaire</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/blog.html">Blog</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/faq.html">FAQ</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/about.html">About</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/privacy-policy.html">Privacy Policy</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/terms.html">Terms</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/contact.html">Contact</a>
        </div>
      </footer>

      {/* Sticky New Game FAB */}
      {status === 'won' && (
        <button
          onClick={() => newGame(undefined, drawMode)}
          className="fixed z-20 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-xl ring-2 ring-emerald-300/40 transition hover:bg-emerald-400 active:scale-95"
          style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          ＋ Play Again
        </button>
      )}
    </div>
  )
}
