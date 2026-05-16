// Double-click auto-move: find the best legal destination for a card / run.

import { canDropOnColumn, getMovableCards } from './moves'
import type { GameState } from '../types/game'

export interface AutoMoveTarget {
  fromCol: number
  fromIdx: number
  toCol: number
  score: number
}

export function findAutoMove(state: GameState, fromCol: number, fromIdx: number): AutoMoveTarget | null {
  const from = state.tableau[fromCol]
  if (!from) return null
  const moving = getMovableCards(from, fromIdx, state.difficulty)
  if (!moving) return null

  const movingTop = moving[0]
  if (!movingTop) return null

  let best: AutoMoveTarget | null = null

  for (const [toCol, target] of state.tableau.entries()) {
    if (toCol === fromCol) continue
    if (!canDropOnColumn(moving, target, state.difficulty)) continue

    let score = 1
    const top = target.cards[target.cards.length - 1]

    // Strongly prefer same-suit landings — they keep runs intact.
    if (top && top.suit === movingTop.suit) score += 25

    // Prefer landings that expose face-down cards in the source column.
    const below = from.cards[fromIdx - 1]
    if (below && !below.faceUp) score += 12

    // Prefer landing on a non-empty column if we have an alternative —
    // empty columns are valuable, don't burn them on small moves.
    if (target.cards.length === 0) score -= 3

    // Prefer longer runs over single cards (you're consolidating, not splitting).
    if (moving.length > 1) score += moving.length

    if (!best || score > best.score) {
      best = { fromCol, fromIdx, toCol, score }
    }
  }

  return best
}
