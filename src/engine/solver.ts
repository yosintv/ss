import { applyMove } from './moves'
import { findHint } from './hints'
import type { GameState } from '../types/game'

export function canAutoComplete(state: GameState): boolean {
  return state.tableau.every((col) => col.cards.every((c) => c.faceUp)) && state.status === 'playing'
}

export function getAutoCompleteMoves(
  state: GameState
): Array<{ fromCol: number; fromIdx: number; toCol: number }> {
  if (!canAutoComplete(state)) return []

  const working = structuredClone(state) as GameState
  const moves: Array<{ fromCol: number; fromIdx: number; toCol: number }> = []

  for (let step = 0; step < 500; step += 1) {
    const hint = findHint(working)
    if (!hint) break
    moves.push({ fromCol: hint.fromColumn, fromIdx: hint.fromIndex, toCol: hint.toColumn })
    const next = applyMove(working, hint.fromColumn, hint.fromIndex, hint.toColumn)
    if (next.moves === working.moves) break
    Object.assign(working, next)
    if (working.status === 'won') break
  }

  return moves
}
