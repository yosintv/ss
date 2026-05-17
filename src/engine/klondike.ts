import type { Card, Suit, Rank } from '../types/game'
import { shuffleDeck } from './deck'

export interface KlondikeColumn { cards: Card[] }
export interface KlondikeFoundation { suit: Suit; topRank: number }
export type KlondikeSource =
  | { type: 'tableau'; col: number; idx: number }
  | { type: 'waste' }

export interface KlondikeState {
  tableau: KlondikeColumn[]
  foundations: KlondikeFoundation[]
  stock: Card[]
  waste: Card[]
  moves: number
  drawMode: 1 | 3
  status: 'playing' | 'won'
  startTime: number | null
  elapsedTime: number
  history: KlondikeHistoryEntry[]
  selected: KlondikeSource | null
}

export interface KlondikeHistoryEntry {
  tableau: KlondikeColumn[]
  foundations: KlondikeFoundation[]
  stock: Card[]
  waste: Card[]
  moves: number
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const isRed = (s: Suit) => s === 'hearts' || s === 'diamonds'

export function dealKlondike(seed: string, drawMode: 1 | 3 = 1): KlondikeState {
  const deck: Card[] = []
  for (const suit of SUITS)
    for (const rank of RANKS)
      deck.push({ id: `k-${suit}-${rank}`, suit, rank, faceUp: false })

  const shuffled = shuffleDeck(deck, seed)
  let idx = 0

  const tableau: KlondikeColumn[] = []
  for (let col = 0; col < 7; col++) {
    const cards: Card[] = []
    for (let row = 0; row <= col; row++) {
      const c = { ...shuffled[idx++]! }
      c.faceUp = row === col
      cards.push(c)
    }
    tableau.push({ cards })
  }

  const stock = shuffled.slice(idx).map(c => ({ ...c, faceUp: false }))
  const foundations: KlondikeFoundation[] = SUITS.map(suit => ({ suit, topRank: 0 }))

  return { tableau, foundations, stock, waste: [], moves: 0, drawMode, status: 'playing', startTime: Date.now(), elapsedTime: 0, history: [], selected: null }
}

export function canPlaceOnTableau(card: Card, targetTop: Card | null): boolean {
  if (!targetTop) return card.rank === 13
  return card.rank === targetTop.rank - 1 && isRed(card.suit) !== isRed(targetTop.suit)
}

export function canPlaceOnFoundation(card: Card, f: KlondikeFoundation): boolean {
  return card.suit === f.suit && card.rank === f.topRank + 1
}

export function getMovableGroup(col: KlondikeColumn, fromIdx: number): Card[] {
  const cards = col.cards.slice(fromIdx)
  if (!cards[0]?.faceUp) return []
  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1]!
    const curr = cards[i]!
    if (!curr.faceUp || !canPlaceOnTableau(curr, prev)) return []
  }
  return cards
}

export function checkWin(state: KlondikeState): boolean {
  return state.foundations.every(f => f.topRank === 13)
}

export function findHint(state: KlondikeState): KlondikeSource | null {
  // Try waste → foundation
  const wasteTop = state.waste.at(-1)
  if (wasteTop) {
    if (state.foundations.some(f => canPlaceOnFoundation(wasteTop, f)))
      return { type: 'waste' }
    for (let col = 0; col < 7; col++) {
      const top = state.tableau[col]?.cards.at(-1) ?? null
      if (canPlaceOnTableau(wasteTop, top)) return { type: 'waste' }
    }
  }
  // Try tableau → foundation or tableau → tableau
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col]!
    for (let idx = 0; idx < column.cards.length; idx++) {
      const card = column.cards[idx]!
      if (!card.faceUp) continue
      if (state.foundations.some(f => canPlaceOnFoundation(card, f)))
        return { type: 'tableau', col, idx }
      for (let toCol = 0; toCol < 7; toCol++) {
        if (toCol === col) continue
        const top = state.tableau[toCol]?.cards.at(-1) ?? null
        const group = getMovableGroup(column, idx)
        if (group.length > 0 && canPlaceOnTableau(card, top))
          return { type: 'tableau', col, idx }
      }
    }
  }
  return null
}

export function snapshot(state: KlondikeState): KlondikeHistoryEntry {
  return {
    tableau: state.tableau.map(c => ({ cards: [...c.cards] })),
    foundations: state.foundations.map(f => ({ ...f })),
    stock: [...state.stock],
    waste: [...state.waste],
    moves: state.moves,
  }
}
