// God-mode operations on tableau / stock. All pure, no React.

import seedrandom from 'seedrandom'
import { checkAndRemoveCompletedSequences } from './sequences'
import type { Card, Column, GameState, Suit } from '../types/game'

const cloneTableau = (tableau: Column[]): Column[] =>
  tableau.map((c) => ({ cards: c.cards.map((card) => ({ ...card })) }))

// Flip every card face-up for `peekMs` milliseconds (the UI handles the timer);
// here we just return the tableau with all cards face-up so the caller can flip back.
export function flipAllFaceUp(tableau: Column[]): Column[] {
  return tableau.map((col) => ({
    cards: col.cards.map((c) => ({ ...c, faceUp: true }))
  }))
}

// Shuffle the FACE-UP suffix of a single column. Face-down cards (hidden core)
// stay put — only the visible run is reshuffled.
export function shuffleColumnFaceUp(tableau: Column[], columnIndex: number, seed: string): Column[] {
  const next = cloneTableau(tableau)
  const col = next[columnIndex]
  if (!col) return tableau

  const firstFaceUp = col.cards.findIndex((c) => c.faceUp)
  if (firstFaceUp === -1) return tableau

  const hidden = col.cards.slice(0, firstFaceUp)
  const visible = col.cards.slice(firstFaceUp)
  const rng = seedrandom(seed)
  for (let i = visible.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const a = visible[i]
    const b = visible[j]
    if (!a || !b) continue
    visible[i] = b
    visible[j] = a
  }
  col.cards = [...hidden, ...visible]
  return next
}

// Magic-deal — deal the next stock row even if some columns are empty.
// Returns { tableau, stock, foundations, dealt }.
export function magicDeal(state: GameState): GameState | null {
  if (state.stock.length === 0) return null
  const newStock = [...state.stock]
  const group = newStock.shift()
  if (!group) return null

  const nextTableau = cloneTableau(state.tableau)
  group.forEach((card, idx) => {
    const target = nextTableau[idx]
    if (!target) return
    target.cards.push({ ...card, faceUp: true })
  })

  const checked = checkAndRemoveCompletedSequences(nextTableau, state.foundations)
  return {
    ...state,
    tableau: checked.tableau,
    foundations: checked.foundations,
    stock: newStock,
    stockDealt: state.stockDealt + 1,
    moves: state.moves + 1
  }
}

// Reveal a single face-down card at the bottom of a column without redealing.
// Useful for a "lucky tap" mini-power-up.
export function revealOneFaceDown(tableau: Column[]): Column[] {
  const next = cloneTableau(tableau)
  for (const col of next) {
    const bottomHidden = [...col.cards].reverse().find((c) => !c.faceUp)
    if (bottomHidden) {
      bottomHidden.faceUp = true
      break
    }
  }
  return next
}

// Optionally surface the suit count for debug / cheat HUD.
export function countSuits(tableau: Column[], foundations: Suit[]): Record<Suit, number> {
  const counts: Record<Suit, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 }
  for (const suit of foundations) counts[suit] += 13
  for (const col of tableau) {
    for (const card of col.cards) counts[card.suit] += 1
  }
  return counts
}

// Returns the cards (face-down or face-up) on the bottom of each column so the
// god-mode HUD can tell the player "the next reveal is the 7♠ in column 3".
export function peekNextReveals(tableau: Column[]): Array<Card | null> {
  return tableau.map((col) => {
    for (let i = col.cards.length - 1; i >= 0; i -= 1) {
      const card = col.cards[i]
      if (!card) continue
      if (!card.faceUp) return card
    }
    return null
  })
}
