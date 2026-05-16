import { checkAndRemoveCompletedSequences, isGameLost, isGameWon } from './sequences'
import type { Card, Column, Difficulty, GameState, HistoryEntry } from '../types/game'

const cloneTableau = (tableau: Column[]): Column[] =>
  tableau.map((c) => ({ cards: c.cards.map((card) => ({ ...card })) }))

export function canMoveCards(cards: Card[], difficulty: Difficulty): boolean {
  if (cards.length === 0 || cards.some((c) => !c.faceUp)) return false
  for (let i = 0; i < cards.length - 1; i += 1) {
    const cur = cards[i]
    const nxt = cards[i + 1]
    if (!cur || !nxt) return false
    if (cur.rank !== nxt.rank + 1) return false
    if (difficulty !== '1suit' && cur.suit !== nxt.suit) return false
  }
  return true
}

export function canDropOnColumn(moving: Card[], target: Column, _difficulty: Difficulty): boolean {
  const movingTop = moving[0]
  if (!movingTop) return false
  const top = target.cards[target.cards.length - 1]
  if (!top) return true
  return top.rank === movingTop.rank + 1
}

export function getMovableCards(column: Column, fromIndex: number, difficulty: Difficulty): Card[] | null {
  const cards = column.cards.slice(fromIndex)
  const first = cards[0]
  if (!first?.faceUp) return null
  return canMoveCards(cards, difficulty) ? cards : null
}

export function applyMove(state: GameState, fromCol: number, fromIdx: number, toCol: number): GameState {
  if (fromCol === toCol) return state
  const fromColumn = state.tableau[fromCol]
  const toColumn = state.tableau[toCol]
  if (!fromColumn || !toColumn) return state

  const movable = getMovableCards(fromColumn, fromIdx, state.difficulty)
  if (!movable) return state
  if (!canDropOnColumn(movable, toColumn, state.difficulty)) return state

  const historyEntry: HistoryEntry = {
    tableau: cloneTableau(state.tableau),
    stock: state.stock.map((s) => s.map((c) => ({ ...c }))),
    stockDealt: state.stockDealt,
    foundations: [...state.foundations],
    moves: state.moves,
    score: state.score
  }

  const tableau = cloneTableau(state.tableau)
  const fromColObj = tableau[fromCol]
  const toColObj = tableau[toCol]
  if (!fromColObj || !toColObj) return state
  fromColObj.cards = fromColObj.cards.slice(0, fromIdx)
  toColObj.cards = [...toColObj.cards, ...movable.map((c) => ({ ...c }))]

  const fromTop = fromColObj.cards[fromColObj.cards.length - 1]
  if (fromTop && !fromTop.faceUp) fromTop.faceUp = true

  const checked = checkAndRemoveCompletedSequences(tableau, state.foundations)
  const score = Math.max(0, state.score - 1 + checked.completed.length * 100)

  const next: GameState = {
    ...state,
    tableau: checked.tableau,
    foundations: checked.foundations,
    moves: state.moves + 1,
    score,
    history: [...state.history, historyEntry],
    selectedCard: null,
    status: state.startTime ? state.status : 'playing',
    startTime: state.startTime ?? Date.now()
  }

  if (isGameWon(next.foundations)) next.status = 'won'
  else if (isGameLost(next)) next.status = 'lost'

  return next
}
