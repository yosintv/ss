// XP / level progression. Pure, no React, no DOM.

import type { Difficulty } from '../types/game'

export interface XpAward {
  amount: number
  reason: string
}

export interface LevelInfo {
  level: number          // 1-based
  xpInLevel: number      // xp earned toward current level
  xpForNext: number      // xp required to reach next level
  totalXp: number
}

// Smooth curve: each level needs more xp than the last.
//   level 1 -> 0 xp
//   level 2 -> 100 xp
//   level 3 -> 250 xp
//   level n -> 50 * n * (n - 1)
export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0
  return 50 * level * (level - 1)
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1
  while (xpToReachLevel(level + 1) <= totalXp) level += 1
  const xpInLevel = totalXp - xpToReachLevel(level)
  const xpForNext = xpToReachLevel(level + 1) - xpToReachLevel(level)
  return { level, xpInLevel, xpForNext, totalXp }
}

const DIFFICULTY_MULT: Record<Difficulty, number> = {
  '1suit': 1,
  '2suit': 1.5,
  '4suit': 2.5
}

interface WinXpInput {
  difficulty: Difficulty
  moves: number
  elapsedSeconds: number
  usedUndo: boolean
  usedGodMode: boolean
  foundations: number   // should be 8 for a win
  daily: boolean
}

export function computeWinXp(input: WinXpInput): XpAward[] {
  if (input.usedGodMode) return [{ amount: 0, reason: 'God mode active — no XP this game' }]
  const mult = DIFFICULTY_MULT[input.difficulty]
  const awards: XpAward[] = []

  awards.push({ amount: Math.round(100 * mult), reason: 'Win' })
  awards.push({ amount: input.foundations * Math.round(15 * mult), reason: 'Completed suits' })

  if (input.elapsedSeconds < 300) awards.push({ amount: Math.round(60 * mult), reason: 'Speedrun (< 5 min)' })
  else if (input.elapsedSeconds < 600) awards.push({ amount: Math.round(30 * mult), reason: 'Brisk (< 10 min)' })

  if (!input.usedUndo) awards.push({ amount: Math.round(50 * mult), reason: 'No-undo run' })
  if (input.moves < 200) awards.push({ amount: Math.round(30 * mult), reason: 'Efficient (< 200 moves)' })
  if (input.daily) awards.push({ amount: Math.round(80 * mult), reason: 'Daily challenge bonus' })

  return awards
}

export function totalXp(awards: XpAward[]): number {
  return awards.reduce((sum, a) => sum + a.amount, 0)
}

// Unlocks are gated on level.
export interface Unlock {
  id: string
  name: string
  level: number
  kind: 'theme' | 'cardBack'
}

export const UNLOCKS: Unlock[] = [
  { id: 'theme:green', name: 'Emerald table', level: 1, kind: 'theme' },
  { id: 'cardBack:classic', name: 'Classic card back', level: 1, kind: 'cardBack' },
  { id: 'cardBack:modern', name: 'Modern card back', level: 1, kind: 'cardBack' },
  { id: 'cardBack:minimal', name: 'Minimal card back', level: 2, kind: 'cardBack' },
  { id: 'theme:blue', name: 'Sapphire table', level: 3, kind: 'theme' },
  { id: 'theme:dark', name: 'Midnight table', level: 5, kind: 'theme' },
  { id: 'theme:wood', name: 'Walnut table', level: 7, kind: 'theme' },
  { id: 'cardBack:web', name: 'Spider-web card back', level: 4, kind: 'cardBack' },
  { id: 'cardBack:neon', name: 'Neon card back', level: 8, kind: 'cardBack' },
  { id: 'cardBack:gold', name: 'Gold-leaf card back', level: 12, kind: 'cardBack' },
  { id: 'theme:ruby', name: 'Ruby table', level: 10, kind: 'theme' },
  { id: 'theme:noir', name: 'Noir table', level: 15, kind: 'theme' }
]

export function isUnlocked(unlock: Unlock, level: number): boolean {
  return level >= unlock.level
}
