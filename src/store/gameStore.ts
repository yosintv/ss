import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createDeck } from '../engine/deck'
import { dealCards, dealStockGroup } from '../engine/deal'
import { findHint } from '../engine/hints'
import { applyMove } from '../engine/moves'
import { canAutoComplete, getAutoCompleteMoves } from '../engine/solver'
import { checkAndRemoveCompletedSequences, isGameLost, isGameWon } from '../engine/sequences'
import { findAutoMove } from '../engine/autoMove'
import { flipAllFaceUp, magicDeal, revealOneFaceDown, shuffleColumnFaceUp } from '../engine/powerups'
import { computeWinXp, levelFromXp, totalXp as sumXp, UNLOCKS } from '../engine/progression'
import { newlyUnlockedAchievements } from '../engine/achievements'
import { celebrateWin, screenShake } from '../utils/confetti'
import { dailySeed, isDailySeed, todayKey } from '../engine/dailySeed'
import { playSound } from '../utils/sound'
import type {
  Difficulty,
  GameState,
  GameStats,
  HintResult,
  HistoryEntry,
  ProgressionState,
  SelectedCard,
  Suit,
  WinReport
} from '../types/game'
import type { Lang } from '../i18n'

type Theme = 'green' | 'blue' | 'dark' | 'wood' | 'ruby' | 'noir'
type CardBack = 'classic' | 'modern' | 'minimal' | 'web' | 'neon' | 'gold'

const GAME_KEY = 'spider-game-v2'
const STATS_KEY = 'spider-stats-v1'
const PREFS_KEY = 'spider-prefs-v2'
const PROGRESS_KEY = 'spider-progress-v1'

interface PrefState {
  theme: Theme
  cardBack: CardBack
  soundEnabled: boolean
  animationsEnabled: boolean
  language: Lang
}

export interface GameStore extends GameState, PrefState {
  statsByDifficulty: Record<Difficulty, GameStats>
  stats: GameStats
  hintHighlight: HintResult | null
  isAutoCompleting: boolean
  progression: ProgressionState
  lastWinReport: WinReport | null
  newGame: (difficulty: Difficulty, seed?: string, options?: { daily?: boolean }) => void
  startDailyChallenge: (difficulty?: Difficulty) => void
  selectCard: (columnIndex: number, cardIndex: number) => void
  moveCards: (fromCol: number, fromIdx: number, toCol: number) => void
  dealStock: () => void
  undo: () => void
  showHint: () => void
  applyHint: () => void
  startAutoComplete: () => void
  doubleClickAutoMove: (fromCol: number, fromIdx: number) => boolean
  tick: () => void
  resetStats: () => void
  resetProgression: () => void
  setTheme: (theme: Theme) => void
  setCardBack: (back: CardBack) => void
  toggleSound: () => void
  toggleAnimations: () => void
  setLanguage: (lang: Lang) => void
  clearSelection: () => void
  toggleGodMode: () => void
  peek: (durationMs?: number) => void
  godMagicDeal: () => void
  godShuffleColumn: (columnIndex: number) => void
  godRevealOne: () => void
  godUndoAll: () => void
  dismissWinReport: () => void
  isUnlockedCosmetic: (id: string) => boolean
}

const defaultStats = (): GameStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestTime: null,
  bestScore: null,
  totalMoves: 0
})

const defaultProgression = (): ProgressionState => ({
  totalXp: 0,
  unlockedAchievements: [],
  unlockedCosmetics: ['theme:green', 'cardBack:classic', 'cardBack:modern'],
  dailyWins: 0,
  dailyStreak: 0,
  dailyLastWon: null,
  totalWinsNoGodMode: 0,
  totalGodModeGames: 0
})

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const scoreFor = (moves: number, elapsedTime: number, foundations: Suit[], won: boolean): number => {
  const base = 500 - moves - Math.floor(elapsedTime / 2) + foundations.length * 100 + (won ? 50 : 0)
  return Math.max(0, base)
}

const loadJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const saveJson = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage may be unavailable (private mode etc.) — silently ignore.
  }
}

const animals = [
  'HAWK', 'LYNX', 'FOX', 'WOLF', 'EAGLE', 'OTTER', 'RAVEN', 'COBRA', 'TIGER', 'BISON'
]

export function generateSeed(): string {
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${animal}-${num}`
}

const makeInitialGame = (
  difficulty: Difficulty,
  seed: string,
  options: { daily?: boolean } = {}
): GameState => {
  const deck = createDeck(difficulty, seed)
  const { tableau, stock } = dealCards(deck)
  return {
    tableau,
    stock,
    stockDealt: 0,
    foundations: [],
    difficulty,
    seed,
    status: 'playing',
    moves: 0,
    startTime: null,
    elapsedTime: 0,
    score: 500,
    history: [],
    selectedCard: null,
    isDaily: options.daily === true || isDailySeed(seed),
    godMode: false,
    godModeUsedThisGame: false,
    undoUsedThisGame: false,
    autoCompletedThisGame: false,
    peekActive: false
  }
}

const persistedStats = loadJson<Record<Difficulty, GameStats>>(STATS_KEY) ?? {
  '1suit': defaultStats(),
  '2suit': defaultStats(),
  '4suit': defaultStats()
}

const persistedPrefs = loadJson<PrefState>(PREFS_KEY) ?? {
  theme: 'green',
  cardBack: 'classic',
  soundEnabled: true,
  animationsEnabled: true,
  language: 'en'
}

const persistedProgression: ProgressionState = {
  ...defaultProgression(),
  ...(loadJson<ProgressionState>(PROGRESS_KEY) ?? {})
}

const persistedGame = loadJson<GameState>(GAME_KEY)
const baseGame =
  persistedGame && persistedGame.status === 'playing'
    ? { ...makeInitialGame(persistedGame.difficulty, persistedGame.seed), ...persistedGame }
    : makeInitialGame('1suit', generateSeed())

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...baseGame,
    ...persistedPrefs,
    statsByDifficulty: persistedStats,
    stats: persistedStats[baseGame.difficulty],
    hintHighlight: null,
    isAutoCompleting: false,
    progression: persistedProgression,
    lastWinReport: null,

    newGame: (difficulty, seed = generateSeed(), options = {}) => {
      const enabled = get().soundEnabled
      set((state) => {
        const currentStats = state.statsByDifficulty[difficulty]
        currentStats.gamesPlayed += 1

        const next = makeInitialGame(difficulty, seed, options)
        Object.assign(state, next)
        state.stats = state.statsByDifficulty[difficulty]
        state.lastWinReport = null
      })
      saveJson(STATS_KEY, get().statsByDifficulty)
      saveJson(GAME_KEY, getGameSnapshot(get()))
      playSound(enabled, 'redeal', 0.45)
    },

    startDailyChallenge: (difficulty) => {
      const diff = difficulty ?? get().difficulty
      const seed = dailySeed(diff)
      get().newGame(diff, seed, { daily: true })
    },

    selectCard: (columnIndex, cardIndex) => {
      const enabled = get().soundEnabled
      set((state) => {
        const card = state.tableau[columnIndex]?.cards[cardIndex]
        if (!card?.faceUp) return
        const sel: SelectedCard = { cardId: card.id, columnIndex, cardIndex }
        state.selectedCard = state.selectedCard?.cardId === card.id ? null : sel
      })
      playSound(enabled, 'card_flip', 0.35)
    },

    clearSelection: () => set({ selectedCard: null, hintHighlight: null }),

    moveCards: (fromCol, fromIdx, toCol) => {
      const before = get()
      const enabled = before.soundEnabled
      const animEnabled = before.animationsEnabled
      const next = applyMove(before, fromCol, fromIdx, toCol)
      if (next === before) return

      set((state) => {
        Object.assign(state, next)
        state.score = scoreFor(state.moves, state.elapsedTime, state.foundations, state.status === 'won')
      })

      const after = get()
      playSound(enabled, 'card_drop', 0.45)

      if (after.foundations.length > before.foundations.length) {
        playSound(enabled, 'light', 0.5)
        if (animEnabled) {
          import('../utils/confetti').then(({ burstConfetti }) => {
            burstConfetti({ count: 60, power: 0.9 })
          })
        }
      }

      if (after.status === 'won') {
        handleWin()
      }

      saveJson(GAME_KEY, getGameSnapshot(get()))
    },

    dealStock: () => {
      const s = get()
      const enabled = s.soundEnabled
      if (s.stock.length === 0) return
      if (!s.godMode && s.tableau.some((c) => c.cards.length === 0)) return

      set((state) => {
        const group = state.stock.shift()
        if (!group) return

        const historyEntry: HistoryEntry = {
          tableau: clone(state.tableau),
          stock: clone(state.stock),
          stockDealt: state.stockDealt,
          foundations: [...state.foundations],
          moves: state.moves,
          score: state.score
        }

        state.history.push(historyEntry)
        state.tableau = dealStockGroup(state.tableau, group)
        const checked = checkAndRemoveCompletedSequences(state.tableau, state.foundations)
        state.tableau = checked.tableau
        state.foundations = checked.foundations
        state.stockDealt += 1
        state.moves += 1
        state.startTime = state.startTime ?? Date.now()
        state.status = isGameWon(state.foundations)
          ? 'won'
          : isGameLost(state)
            ? 'lost'
            : 'playing'
        state.score = scoreFor(state.moves, state.elapsedTime, state.foundations, state.status === 'won')
      })

      if (get().status === 'won') handleWin()
      saveJson(GAME_KEY, getGameSnapshot(get()))
      playSound(enabled, 'deal_animation', 0.45)
    },

    undo: () => {
      const enabled = get().soundEnabled
      set((state) => {
        const prev = state.history.pop()
        if (!prev) return
        state.tableau = prev.tableau
        state.stock = prev.stock
        state.stockDealt = prev.stockDealt
        state.foundations = prev.foundations
        state.moves = prev.moves
        state.score = prev.score
        state.selectedCard = null
        state.status = 'playing'
        state.undoUsedThisGame = true
      })
      saveJson(GAME_KEY, getGameSnapshot(get()))
      playSound(enabled, 'undo', 0.45)
    },

    showHint: () => {
      const enabled = get().soundEnabled
      const hint = findHint(get())
      set({ hintHighlight: hint })
      if (hint) playSound(enabled, 'glass', 0.35)
      if (hint) {
        window.setTimeout(() => {
          if (get().hintHighlight === hint) set({ hintHighlight: null })
        }, 2000)
      }
    },

    // Hint+ — apply the recommended move directly (god-mode power-up).
    applyHint: () => {
      const state = get()
      if (!state.godMode) return
      const hint = findHint(state)
      if (!hint) return
      set((s) => { s.godModeUsedThisGame = true })
      get().moveCards(hint.fromColumn, hint.fromIndex, hint.toColumn)
    },

    doubleClickAutoMove: (fromCol, fromIdx) => {
      const state = get()
      const target = findAutoMove(state, fromCol, fromIdx)
      if (!target) return false
      get().moveCards(target.fromCol, target.fromIdx, target.toCol)
      return true
    },

    startAutoComplete: () => {
      const state = get()
      const enabled = state.soundEnabled
      if (!canAutoComplete(state) || state.isAutoCompleting) return
      const moves = getAutoCompleteMoves(state)
      if (moves.length === 0) return
      set({ isAutoCompleting: true, autoCompletedThisGame: true })
      playSound(enabled, 'autoplay', 0.4)

      let idx = 0
      const step = (): void => {
        const current = get()
        if (idx >= moves.length || current.status === 'won') {
          set({ isAutoCompleting: false })
          return
        }
        const m = moves[idx]
        idx += 1
        if (!m) { set({ isAutoCompleting: false }); return }
        current.moveCards(m.fromCol, m.fromIdx, m.toCol)
        const speed = current.animationsEnabled ? 160 : 0
        window.setTimeout(step, speed)
      }

      step()
    },

    tick: () => {
      set((state) => {
        if (state.status !== 'playing' || state.startTime === null) return
        state.elapsedTime += 1
        state.score = scoreFor(state.moves, state.elapsedTime, state.foundations, false)
      })
    },

    resetStats: () => {
      set((state) => {
        state.statsByDifficulty = {
          '1suit': defaultStats(),
          '2suit': defaultStats(),
          '4suit': defaultStats()
        }
        state.stats = state.statsByDifficulty[state.difficulty]
      })
      saveJson(STATS_KEY, get().statsByDifficulty)
    },

    resetProgression: () => {
      set({ progression: defaultProgression() })
      saveJson(PROGRESS_KEY, get().progression)
    },

    setTheme: (theme) => {
      set({ theme })
      saveJson(PREFS_KEY, getPrefSnapshot(get()))
    },

    setCardBack: (cardBack) => {
      set({ cardBack })
      saveJson(PREFS_KEY, getPrefSnapshot(get()))
    },

    toggleSound: () => {
      set((s) => { s.soundEnabled = !s.soundEnabled })
      saveJson(PREFS_KEY, getPrefSnapshot(get()))
    },

    toggleAnimations: () => {
      set((s) => { s.animationsEnabled = !s.animationsEnabled })
      saveJson(PREFS_KEY, getPrefSnapshot(get()))
    },

    setLanguage: (language) => {
      set({ language })
      saveJson(PREFS_KEY, getPrefSnapshot(get()))
    },

    toggleGodMode: () => {
      set((s) => {
        s.godMode = !s.godMode
        if (s.godMode) s.godModeUsedThisGame = true
      })
      if (get().godMode) {
        playSound(get().soundEnabled, 'bubbles', 0.6)
      }
    },

    peek: (durationMs = 1500) => {
      const enabled = get().soundEnabled
      // Remember which card IDs were originally face-up so we can restore the
      // face-down state for cards that haven't moved, while preserving any
      // moves the player made during the peek window.
      const originallyFaceUp = new Set<string>()
      for (const col of get().tableau) {
        for (const c of col.cards) {
          if (c.faceUp) originallyFaceUp.add(c.id)
        }
      }
      set((s) => {
        s.peekActive = true
        s.tableau = flipAllFaceUp(s.tableau)
        s.godModeUsedThisGame = true
      })
      playSound(enabled, 'glass', 0.5)
      window.setTimeout(() => {
        set((s) => {
          for (const col of s.tableau) {
            // Bottom-most card of each column is always face-up — top of stack rule.
            const lastIdx = col.cards.length - 1
            for (let i = 0; i < col.cards.length; i += 1) {
              const c = col.cards[i]
              if (!c) continue
              if (i === lastIdx) {
                c.faceUp = true
              } else if (!originallyFaceUp.has(c.id)) {
                c.faceUp = false
              }
            }
          }
          s.peekActive = false
        })
      }, durationMs)
    },

    godMagicDeal: () => {
      const state = get()
      if (!state.godMode) return
      const next = magicDeal(state)
      if (!next) return
      set((s) => {
        Object.assign(s, next)
        s.godModeUsedThisGame = true
        s.status = isGameWon(s.foundations)
          ? 'won'
          : isGameLost(s)
            ? 'lost'
            : 'playing'
      })
      playSound(state.soundEnabled, 'deal_animation', 0.5)
      saveJson(GAME_KEY, getGameSnapshot(get()))
      if (get().status === 'won') handleWin()
    },

    godShuffleColumn: (columnIndex) => {
      const state = get()
      if (!state.godMode) return
      const seed = `${state.seed}-shuffle-${Date.now()}`
      set((s) => {
        s.tableau = shuffleColumnFaceUp(s.tableau, columnIndex, seed)
        s.godModeUsedThisGame = true
      })
      playSound(state.soundEnabled, 'card_flip', 0.5)
    },

    godRevealOne: () => {
      const state = get()
      if (!state.godMode) return
      set((s) => {
        s.tableau = revealOneFaceDown(s.tableau)
        s.godModeUsedThisGame = true
      })
      playSound(state.soundEnabled, 'card_flip', 0.4)
    },

    godUndoAll: () => {
      const state = get()
      if (!state.godMode) return
      const first = state.history[0]
      if (!first) return
      set((s) => {
        s.tableau = first.tableau
        s.stock = first.stock
        s.stockDealt = first.stockDealt
        s.foundations = first.foundations
        s.moves = first.moves
        s.score = first.score
        s.history = []
        s.status = 'playing'
        s.selectedCard = null
        s.godModeUsedThisGame = true
      })
      playSound(state.soundEnabled, 'undo', 0.5)
      saveJson(GAME_KEY, getGameSnapshot(get()))
    },

    dismissWinReport: () => set({ lastWinReport: null }),

    isUnlockedCosmetic: (id) => get().progression.unlockedCosmetics.includes(id)
  }))
)

function handleWin(): void {
  const state = useGameStore.getState()
  const enabled = state.soundEnabled
  const animEnabled = state.animationsEnabled

  playSound(enabled, 'game_won', 0.7)

  // Update per-difficulty stats (skip if god mode used so leaderboards stay honest).
  if (!state.godModeUsedThisGame) {
    useGameStore.setState((s) => {
      const stats = s.statsByDifficulty[s.difficulty]
      stats.gamesWon += 1
      stats.currentStreak += 1
      stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak)
      stats.bestTime =
        stats.bestTime === null ? s.elapsedTime : Math.min(stats.bestTime, s.elapsedTime)
      stats.bestScore =
        stats.bestScore === null ? s.score : Math.max(stats.bestScore, s.score)
      stats.totalMoves += s.moves
      s.stats = stats
    })
  }

  // XP + progression + achievements
  const after = useGameStore.getState()
  const levelBefore = levelFromXp(after.progression.totalXp).level

  const awards = computeWinXp({
    difficulty: after.difficulty,
    moves: after.moves,
    elapsedSeconds: after.elapsedTime,
    usedUndo: after.undoUsedThisGame,
    usedGodMode: after.godModeUsedThisGame,
    foundations: after.foundations.length,
    daily: after.isDaily
  })
  const totalGained = sumXp(awards)

  useGameStore.setState((s) => {
    s.progression.totalXp += totalGained
    if (after.godModeUsedThisGame) {
      s.progression.totalGodModeGames += 1
    } else {
      s.progression.totalWinsNoGodMode += 1
    }
    if (after.isDaily && !after.godModeUsedThisGame) {
      const today = todayKey()
      if (s.progression.dailyLastWon !== today) {
        s.progression.dailyWins += 1
        const last = s.progression.dailyLastWon
        if (last) {
          const lastDate = new Date(`${last}T00:00:00`)
          const todayDate = new Date()
          const diffDays = Math.round(
            (todayDate.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0)) /
              (1000 * 60 * 60 * 24)
          )
          s.progression.dailyStreak = diffDays === 1 ? s.progression.dailyStreak + 1 : 1
        } else {
          s.progression.dailyStreak = 1
        }
        s.progression.dailyLastWon = today
      }
    }
  })

  const post = useGameStore.getState()
  const levelAfter = levelFromXp(post.progression.totalXp).level

  // Auto-unlock cosmetics gated by the new level.
  const newCosmetics: string[] = []
  for (const u of UNLOCKS) {
    if (u.level <= levelAfter && !post.progression.unlockedCosmetics.includes(u.id)) {
      newCosmetics.push(u.id)
    }
  }
  if (newCosmetics.length) {
    useGameStore.setState((s) => {
      s.progression.unlockedCosmetics = [...s.progression.unlockedCosmetics, ...newCosmetics]
    })
  }

  // Achievements
  const ctx = {
    difficulty: post.difficulty,
    won: true,
    elapsedSeconds: post.elapsedTime,
    moves: post.moves,
    score: post.score,
    usedUndo: post.undoUsedThisGame,
    usedGodMode: post.godModeUsedThisGame,
    dailyWon: post.isDaily,
    dailyWinsTotal: post.progression.dailyWins,
    stockDealt: post.stockDealt,
    autoCompleted: post.autoCompletedThisGame,
    streak: post.statsByDifficulty[post.difficulty].currentStreak,
    totalWinsNoGodMode: post.progression.totalWinsNoGodMode,
    totalUnlocks: post.progression.unlockedCosmetics.length,
    statsByDifficulty: post.statsByDifficulty
  }
  const newAch = newlyUnlockedAchievements(post.progression.unlockedAchievements, ctx)
  if (newAch.length) {
    useGameStore.setState((s) => {
      s.progression.unlockedAchievements = [...s.progression.unlockedAchievements, ...newAch]
    })
  }

  // Build the WinReport so the WinScreen can show it.
  const report: WinReport = {
    awards,
    totalGained,
    levelBefore,
    levelAfter,
    achievementsUnlocked: newAch,
    cosmeticsUnlocked: newCosmetics
  }
  useGameStore.setState({ lastWinReport: report })

  saveJson(STATS_KEY, useGameStore.getState().statsByDifficulty)
  saveJson(PROGRESS_KEY, useGameStore.getState().progression)

  if (animEnabled) {
    celebrateWin()
    screenShake(500)
  }
}

function getGameSnapshot(state: GameStore): GameState {
  return {
    tableau: state.tableau,
    stock: state.stock,
    stockDealt: state.stockDealt,
    foundations: state.foundations,
    difficulty: state.difficulty,
    seed: state.seed,
    status: state.status,
    moves: state.moves,
    startTime: state.startTime,
    elapsedTime: state.elapsedTime,
    score: state.score,
    history: state.history,
    selectedCard: state.selectedCard,
    isDaily: state.isDaily,
    godMode: state.godMode,
    godModeUsedThisGame: state.godModeUsedThisGame,
    undoUsedThisGame: state.undoUsedThisGame,
    autoCompletedThisGame: state.autoCompletedThisGame,
    peekActive: state.peekActive
  }
}

function getPrefSnapshot(state: GameStore): PrefState {
  return {
    theme: state.theme,
    cardBack: state.cardBack,
    soundEnabled: state.soundEnabled,
    animationsEnabled: state.animationsEnabled,
    language: state.language
  }
}
