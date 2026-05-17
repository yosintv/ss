import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  dealKlondike, canPlaceOnFoundation, canPlaceOnTableau,
  getMovableGroup, checkWin, findHint, snapshot,
  type KlondikeState, type KlondikeSource
} from '../engine/klondike'

interface KlondikeStore extends KlondikeState {
  newGame: (seed?: string, drawMode?: 1 | 3) => void
  drawStock: () => void
  selectSource: (src: KlondikeSource) => void
  moveToTableau: (toCol: number) => void
  moveToFoundation: () => void
  undo: () => void
  showHint: () => void
  tickTime: () => void
}

function randomSeed() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export const useKlondikeStore = create<KlondikeStore>()(
  immer((set, get) => ({
    ...dealKlondike(randomSeed()),

    newGame(seed, drawMode = 1) {
      const s = seed ?? randomSeed()
      set(() => dealKlondike(s, drawMode))
    },

    drawStock() {
      set(state => {
        if (state.status !== 'playing') return
        state.history.push(snapshot(state as KlondikeState))
        if (state.stock.length === 0) {
          // flip waste back to stock
          state.stock = state.waste.reverse().map(c => ({ ...c, faceUp: false }))
          state.waste = []
        } else {
          const n = state.drawMode
          const drawn = state.stock.splice(-n).reverse().map(c => ({ ...c, faceUp: true }))
          state.waste.push(...drawn)
        }
        state.selected = null
        state.moves += 1
      })
    },

    selectSource(src) {
      set(state => {
        const cur = state.selected
        // If same source clicked again, deselect
        if (cur && cur.type === src.type &&
            (cur.type === 'waste' || (cur.type === 'tableau' && src.type === 'tableau' && cur.col === src.col && cur.idx === src.idx))) {
          state.selected = null
          return
        }
        state.selected = src
      })
    },

    moveToTableau(toCol) {
      set(state => {
        const sel = state.selected
        if (!sel || state.status !== 'playing') return

        let cards: ReturnType<typeof getMovableGroup> = []
        let sourceCards: typeof state.waste | undefined

        if (sel.type === 'waste') {
          const top = state.waste.at(-1)
          if (!top) return
          const targetTop = state.tableau[toCol]?.cards.at(-1) ?? null
          if (!canPlaceOnTableau(top, targetTop)) return
          cards = [top]
          sourceCards = state.waste
        } else {
          const col = state.tableau[sel.col]!
          cards = getMovableGroup(col as typeof col, sel.idx)
          if (cards.length === 0) return
          const targetTop = state.tableau[toCol]?.cards.at(-1) ?? null
          if (!canPlaceOnTableau(cards[0]!, targetTop)) return
        }

        state.history.push(snapshot(state as KlondikeState))

        if (sel.type === 'waste') {
          state.waste.pop()
        } else {
          state.tableau[sel.col]!.cards.splice(sel.idx)
          // flip new top card
          const newTop = state.tableau[sel.col]!.cards.at(-1)
          if (newTop && !newTop.faceUp) newTop.faceUp = true
        }

        state.tableau[toCol]!.cards.push(...cards.map(c => ({ ...c, faceUp: true })))
        state.selected = null
        state.moves += 1

        if (checkWin(state as KlondikeState)) state.status = 'won'
      })
    },

    moveToFoundation() {
      set(state => {
        const sel = state.selected
        if (!sel || state.status !== 'playing') return

        let card = sel.type === 'waste'
          ? state.waste.at(-1)
          : state.tableau[sel.col]?.cards.at(-1)
        if (!card) return

        const fi = state.foundations.findIndex(f => canPlaceOnFoundation(card!, f as typeof f))
        if (fi === -1) return

        state.history.push(snapshot(state as KlondikeState))
        state.foundations[fi]!.topRank += 1

        if (sel.type === 'waste') {
          state.waste.pop()
        } else {
          state.tableau[sel.col]!.cards.pop()
          const newTop = state.tableau[sel.col]!.cards.at(-1)
          if (newTop && !newTop.faceUp) newTop.faceUp = true
        }

        state.selected = null
        state.moves += 1
        if (checkWin(state as KlondikeState)) state.status = 'won'
      })
    },

    undo() {
      set(state => {
        const last = state.history.pop()
        if (!last) return
        state.tableau = last.tableau
        state.foundations = last.foundations
        state.stock = last.stock
        state.waste = last.waste
        state.moves = last.moves
        state.selected = null
        state.status = 'playing'
      })
    },

    showHint() {
      set(state => {
        state.selected = findHint(state as KlondikeState)
      })
    },

    tickTime() {
      set(state => {
        if (state.status === 'playing' && state.startTime !== null)
          state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000)
      })
    },
  }))
)
