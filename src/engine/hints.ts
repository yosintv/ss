import { canDropOnColumn, getMovableCards } from './moves'
import type { GameState, HintResult } from '../types/game'

type ScoredHint = HintResult & { score: number }

export function findHint(state: GameState): HintResult | null {
  const hints: ScoredHint[] = []

  for (const [fromCol, col] of state.tableau.entries()) {
    for (let fromIndex = 0; fromIndex < col.cards.length; fromIndex += 1) {
      const moving = getMovableCards(col, fromIndex, state.difficulty)
      if (!moving) continue

      for (const [toCol, target] of state.tableau.entries()) {
        if (fromCol === toCol) continue
        if (!canDropOnColumn(moving, target, state.difficulty)) continue

        let score = 1
        const targetTop = target.cards[target.cards.length - 1]
        const movingTop = moving[0]
        if (targetTop && movingTop && targetTop.suit === movingTop.suit) score += 10
        const below = col.cards[fromIndex - 1]
        if (below && !below.faceUp) score += 6
        if (moving.length > 1) score += 2

        hints.push({ fromColumn: fromCol, fromIndex, toColumn: toCol, score })
      }
    }
  }

  hints.sort((a, b) => b.score - a.score)
  const best = hints[0]
  return best ? { fromColumn: best.fromColumn, fromIndex: best.fromIndex, toColumn: best.toColumn } : null
}
