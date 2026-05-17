// Deterministic daily seed — the same date produces the same seed everywhere.

import type { Difficulty } from '../types/game'

const ANIMALS = [
  'HAWK', 'LYNX', 'FOX', 'WOLF', 'EAGLE', 'OTTER', 'RAVEN', 'COBRA',
  'TIGER', 'BISON', 'ORCA', 'PUMA', 'STAG', 'CRANE', 'IBIS', 'SABLE'
]

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Simple, deterministic hash so the same day key always maps to the same seed.
function hashString(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

export function dailySeed(difficulty: Difficulty, date: Date = new Date()): string {
  const key = `${todayKey(date)}-${difficulty}`
  const h = hashString(key)
  const animal = ANIMALS[h % ANIMALS.length] ?? 'SPIDER'
  const num = 1000 + (h % 9000)
  return `DAILY-${animal}-${num}`
}

export function isDailySeed(seed: string): boolean {
  return seed.startsWith('DAILY-')
}
