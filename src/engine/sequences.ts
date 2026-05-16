import { canDropOnColumn, getMovableCards } from './moves'
import type { Column, GameState, Suit } from '../types/game'

export function checkAndRemoveCompletedSequences(
  tableau: Column[],
  foundations: Suit[]
): { tableau: Column[]; foundations: Suit[]; completed: Suit[] } {
  const nextTableau = tableau.map((col) => ({ cards: [...col.cards] }))
  const nextFoundations = [...foundations]
  const completed: Suit[] = []

  for (const column of nextTableau) {
    let changed = true
    while (changed) {
      changed = false
      if (column.cards.length < 13) continue
      const tail = column.cards.slice(-13)
      const first = tail[0]
      if (!first) continue
      const suit = first.suit
      const valid = tail.every((card, i) => card.faceUp && card.suit === suit && card.rank === 13 - i)
      if (valid) {
        column.cards.splice(-13, 13)
        nextFoundations.push(suit)
        completed.push(suit)
        const top = column.cards[column.cards.length - 1]
        if (top && !top.faceUp) top.faceUp = true
        changed = true
      }
    }
  }

  return { tableau: nextTableau, foundations: nextFoundations, completed }
}

export function isGameWon(foundations: Suit[]): boolean {
  return foundations.length === 8
}

export function isGameLost(state: GameState): boolean {
  if (state.stock.length > 0) return false
  for (const [from, col] of state.tableau.entries()) {
    for (let i = 0; i < col.cards.length; i += 1) {
      const movable = getMovableCards(col, i, state.difficulty)
      if (!movable) continue
      for (const [to, target] of state.tableau.entries()) {
        if (from === to) continue
        if (canDropOnColumn(movable, target, state.difficulty)) return false
      }
    }
  }
  return true
}
