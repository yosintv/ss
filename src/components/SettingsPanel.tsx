import type { GameStore } from '../store/gameStore'
import { UNLOCKS } from '../engine/progression'

interface Props {
  open: boolean
  theme: GameStore['theme']
  cardBack: GameStore['cardBack']
  animationsEnabled: boolean
  soundEnabled: boolean
  unlockedCosmetics: string[]
  onClose: () => void
  setTheme: GameStore['setTheme']
  setCardBack: GameStore['setCardBack']
  toggleAnimations: GameStore['toggleAnimations']
  toggleSound: GameStore['toggleSound']
  openStats: () => void
}

type Theme = GameStore['theme']
type CardBack = GameStore['cardBack']

const ALL_THEMES: Theme[] = ['green', 'blue', 'dark', 'wood', 'ruby', 'noir']
const ALL_BACKS: CardBack[] = ['classic', 'modern', 'minimal', 'web', 'neon', 'gold']

const findUnlockLevel = (id: string): number =>
  UNLOCKS.find((u) => u.id === id)?.level ?? 1

export function SettingsPanel(props: Props): JSX.Element | null {
  if (!props.open) return null

  const isThemeUnlocked = (t: Theme): boolean =>
    t === 'green' || props.unlockedCosmetics.includes(`theme:${t}`)
  const isBackUnlocked = (b: CardBack): boolean =>
    b === 'classic' || b === 'modern' || props.unlockedCosmetics.includes(`cardBack:${b}`)

  return (
    <div className="fixed inset-0 z-30 bg-black/40" onClick={props.onClose}>
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-gradient-to-b from-zinc-50 to-white p-4 text-zinc-900 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h2>
          <button
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            onClick={props.onClose}
          >
            Close
          </button>
        </div>

        <section className="mb-5 rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Table Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            {ALL_THEMES.map((t) => {
              const unlocked = isThemeUnlocked(t)
              return (
                <button
                  key={t}
                  disabled={!unlocked}
                  onClick={() => props.setTheme(t)}
                  className={`relative rounded-lg border px-3 py-2 text-left text-sm font-semibold capitalize transition ${
                    props.theme === t
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                      : 'border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                  } ${!unlocked ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {t}
                  {!unlocked && (
                    <span className="ml-1 text-xs font-normal text-zinc-500">
                      🔒 Lv {findUnlockLevel(`theme:${t}`)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-5 rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Card Back Style</h3>
          <div className="grid grid-cols-3 gap-2">
            {ALL_BACKS.map((b) => {
              const unlocked = isBackUnlocked(b)
              return (
                <button
                  key={b}
                  disabled={!unlocked}
                  onClick={() => props.setCardBack(b)}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold capitalize transition ${
                    props.cardBack === b
                      ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-200'
                      : 'border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                  } ${!unlocked ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className={`mb-2 h-10 w-full rounded-md border border-white/80 card-back-swatch back-${b}`} />
                  {b}
                  {!unlocked && (
                    <div className="mt-0.5 text-[10px] font-normal text-zinc-500">
                      🔒 Lv {findUnlockLevel(`cardBack:${b}`)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Gameplay</h3>
          <div className="space-y-2">
            <button
              onClick={props.toggleAnimations}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              <span>Animations</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  props.animationsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {props.animationsEnabled ? 'On' : 'Off'}
              </span>
            </button>
            <button
              onClick={props.toggleSound}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              <span>Sound Effects</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  props.soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {props.soundEnabled ? 'On' : 'Off'}
              </span>
            </button>
          </div>
        </section>

        <div className="mt-5">
          <button
            className="w-full rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={props.openStats}
          >
            View Statistics
          </button>
        </div>
      </aside>
    </div>
  )
}
