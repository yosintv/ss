import seedrandom from 'seedrandom'
import type { Card, Difficulty, Rank, Suit } from '../types/game'

const ALL_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

export function createDeck(difficulty: Difficulty, seed: string): Card[] {
  const deck: Card[] = []
  let cardIndex = 0

  if (difficulty === '1suit') {
    for (let deckIndex = 0; deckIndex < 8; deckIndex += 1) {
      for (const rank of RANKS) {
        deck.push({ id: `spades-${rank}-${deckIndex}-${cardIndex}`, suit: 'spades', rank, faceUp: false })
        cardIndex += 1
      }
    }
  } else if (difficulty === '2suit') {
    const suits: Suit[] = ['spades', 'hearts']
    for (let deckIndex = 0; deckIndex < 4; deckIndex += 1) {
      for (const suit of suits) {
        for (const rank of RANKS) {
          deck.push({ id: `${suit}-${rank}-${deckIndex}-${cardIndex}`, suit, rank, faceUp: false })
          cardIndex += 1
        }
      }
    }
  } else {
    for (let deckIndex = 0; deckIndex < 2; deckIndex += 1) {
      for (const suit of ALL_SUITS) {
        for (const rank of RANKS) {
          deck.push({ id: `${suit}-${rank}-${deckIndex}-${cardIndex}`, suit, rank, faceUp: false })
          cardIndex += 1
        }
      }
    }
  }

  return shuffleDeck(deck, seed)
}

export function shuffleDeck(deck: Card[], seed: string): Card[] {
  const rng = seedrandom(seed)
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const ai = arr[i]
    const aj = arr[j]
    if (!ai || !aj) continue
    arr[i] = aj
    arr[j] = ai
  }
  return arr
}
