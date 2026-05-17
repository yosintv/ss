export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
export type Difficulty = '1suit' | '2suit' | '4suit'

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  faceUp: boolean
}

export interface Column {
  cards: Card[]
}

export interface GameState {
  tableau: Column[]
  stock: Card[][]
  stockDealt: number
  foundations: Suit[]
  difficulty: Difficulty
  seed: string
  status: 'idle' | 'playing' | 'won' | 'lost'
  moves: number
  startTime: number | null
  elapsedTime: number
  score: number
  history: HistoryEntry[]
  selectedCard: SelectedCard | null
  // Engagement / mode flags
  isDaily: boolean
  godMode: boolean
  godModeUsedThisGame: boolean
  undoUsedThisGame: boolean
  autoCompletedThisGame: boolean
  peekActive: boolean
}

export interface SelectedCard {
  cardId: string
  columnIndex: number
  cardIndex: number
}

export interface HistoryEntry {
  tableau: Column[]
  stock: Card[][]
  stockDealt: number
  foundations: Suit[]
  moves: number
  score: number
}

export interface MoveResult {
  valid: boolean
  reason?: string
}

export interface HintResult {
  fromColumn: number
  fromIndex: number
  toColumn: number
}

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
  bestTime: number | null
  bestScore: number | null
  totalMoves: number
}

export interface ProgressionState {
  totalXp: number
  unlockedAchievements: string[]
  unlockedCosmetics: string[]
  dailyWins: number
  dailyStreak: number
  dailyLastWon: string | null         // YYYY-MM-DD
  totalWinsNoGodMode: number
  totalGodModeGames: number
}

export interface XpAwardSummary {
  amount: number
  reason: string
}

export interface WinReport {
  awards: XpAwardSummary[]
  totalGained: number
  levelBefore: number
  levelAfter: number
  achievementsUnlocked: string[]
  cosmeticsUnlocked: string[]
}
