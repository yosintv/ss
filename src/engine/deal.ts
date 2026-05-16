import type { Card, Column } from '../types/game'

export function dealCards(shuffled: Card[]): { tableau: Column[]; stock: Card[][] } {
  const tableau: Column[] = Array.from({ length: 10 }, () => ({ cards: [] }))
  const deck = [...shuffled]

  for (let col = 0; col < 10; col += 1) {
    const count = col < 4 ? 6 : 5
    const column = tableau[col]
    if (!column) continue
    for (let i = 0; i < count; i += 1) {
      const card = deck.shift()
      if (!card) throw new Error('Not enough cards to deal')
      column.cards.push({ ...card, faceUp: i === count - 1 })
    }
  }

  const stock: Card[][] = []
  for (let i = 0; i < 5; i += 1) {
    const group = deck.splice(0, 10)
    stock.push(group.map((card) => ({ ...card, faceUp: true })))
  }

  return { tableau, stock }
}

export function dealStockGroup(tableau: Column[], stockGroup: Card[]): Column[] {
  return tableau.map((column, index) => {
    const card = stockGroup[index]
    if (!card) return { cards: [...column.cards] }
    return { cards: [...column.cards, { ...card, faceUp: true }] }
  })
}
