import { useEffect, useState } from 'react'
import { Game } from './components/Game'
import { NewGameModal } from './components/NewGameModal'
import { SettingsPanel } from './components/SettingsPanel'
import { StatsPanel } from './components/StatsPanel'
import { Toolbar } from './components/Toolbar'
import { WinScreen } from './components/WinScreen'
import { GodModePanel } from './components/GodModePanel'
import { AchievementsPanel } from './components/AchievementsPanel'
import { useKeyboard } from './hooks/useKeyboard'
import { useTimer } from './hooks/useTimer'
import { useGameStore } from './store/gameStore'
import type { Difficulty } from './types/game'

type Mode = Difficulty | 'scorpio' | 'klondike'
const modeToPath: Record<Mode, string> = {
  '1suit':    '/1-suit.html',
  '2suit':    '/2-suits.html',
  '4suit':    '/3-suits.html',
  scorpio:    '/scorpio-mode.html',
  klondike:   '/klondike.html',
}

const pathToMode = (pathname: string): Mode | null => {
  if (pathname.endsWith('/1-suit.html')) return '1suit'
  if (pathname.endsWith('/2-suits.html')) return '2suit'
  if (pathname.endsWith('/3-suits.html')) return '4suit'
  if (pathname.endsWith('/scorpio-mode.html')) return 'scorpio'
  return null
}

export default function App(): JSX.Element {
  const [showNewGame, setShowNewGame] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showGodMode, setShowGodMode] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  const score = useGameStore((s) => s.score)
  const moves = useGameStore((s) => s.moves)
  const status = useGameStore((s) => s.status)
  const difficulty = useGameStore((s) => s.difficulty)
  const seed = useGameStore((s) => s.seed)
  const elapsedTime = useGameStore((s) => s.elapsedTime)
  const statsByDifficulty = useGameStore((s) => s.statsByDifficulty)
  const isDaily = useGameStore((s) => s.isDaily)
  const godMode = useGameStore((s) => s.godMode)
  const totalXp = useGameStore((s) => s.progression.totalXp)
  const unlockedCosmetics = useGameStore((s) => s.progression.unlockedCosmetics)
  const lastWinReport = useGameStore((s) => s.lastWinReport)
  const dismissWinReport = useGameStore((s) => s.dismissWinReport)
  const tableau = useGameStore((s) => s.tableau)

  const showHint = useGameStore((s) => s.showHint)
  const undo = useGameStore((s) => s.undo)
  const newGame = useGameStore((s) => s.newGame)
  const startAutoComplete = useGameStore((s) => s.startAutoComplete)
  const resetStats = useGameStore((s) => s.resetStats)
  const startDailyChallenge = useGameStore((s) => s.startDailyChallenge)

  const theme = useGameStore((s) => s.theme)
  const cardBack = useGameStore((s) => s.cardBack)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const animationsEnabled = useGameStore((s) => s.animationsEnabled)
  const setTheme = useGameStore((s) => s.setTheme)
  const setCardBack = useGameStore((s) => s.setCardBack)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const toggleAnimations = useGameStore((s) => s.toggleAnimations)

  const { formattedTime } = useTimer()

  useKeyboard({
    onNewGame: () => setShowNewGame(true),
    onGodMode: () => setShowGodMode(true),
    onAchievements: () => setShowAchievements(true),
    onCloseOverlays: () => {
      setShowNewGame(false)
      setShowSettings(false)
      setShowStats(false)
      setShowGodMode(false)
      setShowAchievements(false)
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.cardBack = cardBack
  }, [theme, cardBack])

  useEffect(() => {
    // If the URL points to a specific difficulty page (e.g. /1-suit.html), honour it
    // by starting that game. Otherwise leave the existing persisted game in place —
    // the store already restored or seeded one on boot, so no modal is needed.
    const pageMode = pathToMode(window.location.pathname)
    if (!pageMode || pageMode === 'klondike') return
    const mappedDifficulty: Difficulty = pageMode === 'scorpio' ? '4suit' : pageMode
    const seedParam = new URLSearchParams(window.location.search).get('seed') ?? undefined
    newGame(mappedDifficulty, seedParam)
    setShowNewGame(false)
  }, [newGame])

  // Auto-complete becomes available once every column is fully face-up and the game is still in play.
  const canAutoCompleteNow =
    status === 'playing' &&
    tableau.some((c) => c.cards.length > 0) &&
    tableau.every((c) => c.cards.every((card) => card.faceUp))

  return (
    <div className="min-h-screen bg-[var(--table-bg)] text-white" style={{ backgroundImage: 'var(--table-texture)' }}>
      <Toolbar
        score={score}
        moves={moves}
        time={formattedTime}
        totalXp={totalXp}
        godMode={godMode}
        isDaily={isDaily}
        canAutoComplete={canAutoCompleteNow}
        onHint={showHint}
        onUndo={undo}
        onNewGame={() => setShowNewGame(true)}
        onSettings={() => setShowSettings(true)}
        onStats={() => setShowStats(true)}
        onAchievements={() => setShowAchievements(true)}
        onGodMode={() => setShowGodMode(true)}
        onAutoComplete={startAutoComplete}
        onDaily={() => startDailyChallenge(difficulty)}
      />
      <Game />
      <section className="mx-auto max-w-5xl px-3 pb-10 text-white/95 sm:px-4">
        <h2 className="mb-3 text-lg font-semibold sm:text-xl">How to Play Spider Solitaire</h2>
        <div className="space-y-2 text-[13px] leading-6 sm:text-base">
          <p>Spider Solitaire uses 104 cards arranged across 10 columns. Your goal is to build complete suit sequences from King down to Ace.</p>
          <p>Move any face-up card to another column if the destination top card is exactly one rank higher. Example: place a 7 on an 8. <strong>Double-click any card to auto-move it</strong> to the best legal target.</p>
          <p>You can move grouped cards only when they form a valid descending run. In 1 Suit mode any descending run works; in 2 Suits and 4 Suits modes, runs should stay same-suit for efficient play.</p>
          <p>Empty columns are powerful. Any face-up card or valid run can be moved into an empty column to create space and reveal hidden cards.</p>
          <p>When stuck, click the stock to deal one new face-up card to each column. You cannot deal from stock if any column is empty (unless God Mode is on).</p>
          <p>Complete a full same-suit sequence (K-Q-J-10-9-8-7-6-5-4-3-2-A) to clear it to foundation. Clear all 8 foundation stacks to win.</p>
          <p>Scoring starts at 500; each move and elapsed second reduces score, and each completed suit gives a 100-point bonus. Win bonuses give big XP rewards.</p>
          <p>
            Daily Challenge: tap <strong>📅 Daily</strong> to play today&rsquo;s seeded board. Win to grow your daily streak.
            God Mode: tap <strong>🪄 God</strong> for opt-in power-ups (peek, magic deal, shuffle, undo-all, hint+). Stats and achievements are disabled in god-mode games.
          </p>
          <p>Quick controls: <strong>H</strong> hint · <strong>D</strong> deal · <strong>N</strong> new · <strong>A</strong> auto-complete · <strong>G</strong> god panel · <strong>P</strong> peek · <strong>L</strong> achievements · <strong>Ctrl/Cmd + Z</strong> undo.</p>
          <p>
            Want a full Spider Solitaire rules and FAQ guide? Visit the{' '}
            <a className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white transition hover:bg-white/20" href="/faq.html">
              Spider Solitaire FAQ page
            </a>{' '}
            or browse the{' '}
            <a className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white transition hover:bg-white/20" href="/blog.html">
              Spider Solitaire blog
            </a>{' '}
            for strategy, history, and tips.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <a href="/blog/how-to-play-spider-solitaire.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>How to Play Spider Solitaire</strong><br />
            <span className="text-white/80">Complete beginner&rsquo;s guide.</span>
          </a>
          <a href="/blog/spider-solitaire-rules.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>Spider Solitaire Rules</strong><br />
            <span className="text-white/80">The definitive rules reference.</span>
          </a>
          <a href="/blog/spider-solitaire-tips-tricks.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>10 Tips &amp; Tricks</strong><br />
            <span className="text-white/80">Win more Spider Solitaire games.</span>
          </a>
          <a href="/blog/spider-solitaire-strategy.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>Advanced Strategy</strong><br />
            <span className="text-white/80">Expert-level Spider Solitaire tactics.</span>
          </a>
          <a href="/blog/daily-spider-solitaire-challenge.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>Daily Challenge</strong><br />
            <span className="text-white/80">Why daily Spider Solitaire matters.</span>
          </a>
          <a href="/blog/spider-solitaire-history.html" className="rounded-lg bg-white/10 p-3 transition hover:bg-white/20">
            <strong>History of Spider Solitaire</strong><br />
            <span className="text-white/80">From 1949 to Windows to the web.</span>
          </a>
        </div>
      </section>
      <footer className="border-t border-white/20 px-4 pb-8 pt-4 text-center text-sm text-white/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4">
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/blog.html">Blog</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/faq.html">FAQ</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/about.html">About</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/privacy-policy.html">Privacy Policy</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/terms.html">Terms</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/contact.html">Contact</a>
          <a className="rounded-md px-2 py-1 transition hover:bg-white/10" href="/disclaimer.html">Disclaimer</a>
        </div>
      </footer>

      <NewGameModal
        open={showNewGame}
        onClose={() => setShowNewGame(false)}
        onStart={(mode, seedValue, options) => {
          if (options?.daily) {
            const mapped: Difficulty = mode === 'scorpio' ? '4suit' : (mode as Difficulty)
            newGame(mapped, seedValue, { daily: true })
            setShowNewGame(false)
            return
          }
          const target = modeToPath[mode]
          let url = `${target}?seed=${encodeURIComponent(seedValue)}`
          if (mode === 'klondike' && options?.drawMode === 3) url += '&draw=3'
          window.location.href = url
        }}
      />

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        cardBack={cardBack}
        soundEnabled={soundEnabled}
        animationsEnabled={animationsEnabled}
        unlockedCosmetics={unlockedCosmetics}
        setTheme={setTheme}
        setCardBack={setCardBack}
        toggleSound={toggleSound}
        toggleAnimations={toggleAnimations}
        openStats={() => {
          setShowSettings(false)
          setShowStats(true)
        }}
      />

      <StatsPanel
        open={showStats}
        onClose={() => setShowStats(false)}
        difficulty={difficulty}
        statsByDifficulty={statsByDifficulty}
        onSwitch={(d) => newGame(d, seed)}
        onReset={() => {
          if (window.confirm('Reset all statistics?')) resetStats()
        }}
      />

      <GodModePanel open={showGodMode} onClose={() => setShowGodMode(false)} />

      <AchievementsPanel open={showAchievements} onClose={() => setShowAchievements(false)} />

      {/* Sticky floating action button — opens the New Game modal on demand. */}
      <button
        onClick={() => setShowNewGame(true)}
        aria-label="Start a new Spider Solitaire game"
        title="New game"
        className="fixed z-20 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-900/40 ring-2 ring-emerald-300/40 transition hover:bg-emerald-400 active:scale-95 sm:text-base"
        style={{
          right: 'max(1rem, env(safe-area-inset-right))',
          bottom: 'max(1rem, env(safe-area-inset-bottom))',
          touchAction: 'manipulation'
        }}
      >
        <span className="text-lg">＋</span>
        <span>New Game</span>
      </button>

      <WinScreen
        open={status === 'won' && lastWinReport !== null}
        score={score}
        moves={moves}
        elapsed={elapsedTime}
        difficulty={difficulty}
        seed={seed}
        isDaily={isDaily}
        report={lastWinReport}
        onPlayAgain={() => {
          dismissWinReport()
        }}
        onClose={dismissWinReport}
        onViewStats={() => setShowStats(true)}
      />
    </div>
  )
}
