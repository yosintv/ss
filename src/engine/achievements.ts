// Achievement definitions + a pure check function called after every win.

import type { Difficulty, GameStats } from '../types/game'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood',     name: 'First Blood',          description: 'Win your first game.',                  icon: '🩸' },
  { id: 'spider-king',     name: 'Spider King',          description: 'Win a 4-suit game.',                    icon: '👑' },
  { id: 'two-suit-victor', name: 'Two-Suit Victor',      description: 'Win a 2-suit game.',                    icon: '🥈' },
  { id: 'beginner',        name: 'Beginner Badge',       description: 'Win a 1-suit game.',                    icon: '🥉' },
  { id: 'speedrunner',     name: 'Speedrunner',          description: 'Win in under 5 minutes.',               icon: '⚡' },
  { id: 'flash',           name: 'Flash',                description: 'Win in under 2 minutes.',               icon: '⚡⚡' },
  { id: 'no-undo',         name: 'No Regrets',           description: 'Win without using undo.',               icon: '🚫' },
  { id: 'minimalist',      name: 'Minimalist',           description: 'Win in fewer than 150 moves.',          icon: '🪶' },
  { id: 'streak-3',        name: 'Hat Trick',            description: '3-win streak.',                         icon: '🎩' },
  { id: 'streak-10',       name: 'On Fire',              description: '10-win streak.',                        icon: '🔥' },
  { id: 'daily-1',         name: 'Daily Driver',         description: 'Win a daily challenge.',                icon: '📅' },
  { id: 'daily-7',         name: 'Week-Long Warrior',    description: 'Win 7 daily challenges.',               icon: '🗓️' },
  { id: 'daily-30',        name: 'Monthly Mastermind',   description: 'Win 30 daily challenges.',              icon: '📆' },
  { id: 'centurion',       name: 'Centurion',            description: 'Play 100 games.',                       icon: '💯' },
  { id: 'librarian',       name: 'Librarian',            description: 'Win 50 games.',                         icon: '📚' },
  { id: 'perfectionist',   name: 'Perfectionist',        description: 'Win with score above 600.',             icon: '✨' },
  { id: 'godless',         name: 'Mortal Mode',          description: 'Win 10 games without god mode.',        icon: '🛡️' },
  { id: 'comeback',        name: 'Comeback Kid',         description: 'Win after dealing all 5 stock rows.',   icon: '🔄' },
  { id: 'auto-completer',  name: 'Auto-Completer',       description: 'Trigger auto-complete to victory.',     icon: '🤖' },
  { id: 'collector',       name: 'Collector',            description: 'Unlock 8 themes / card backs.',          icon: '🎨' }
]

// Outcome facts used by the check function.
export interface AchievementContext {
  difficulty: Difficulty
  won: boolean
  elapsedSeconds: number
  moves: number
  score: number
  usedUndo: boolean
  usedGodMode: boolean
  dailyWon: boolean
  dailyWinsTotal: number
  stockDealt: number
  autoCompleted: boolean
  streak: number
  totalWinsNoGodMode: number
  totalUnlocks: number
  statsByDifficulty: Record<Difficulty, GameStats>
}

export function newlyUnlockedAchievements(
  alreadyUnlocked: string[],
  ctx: AchievementContext
): string[] {
  const have = new Set(alreadyUnlocked)
  const won = new Set<string>(alreadyUnlocked)

  const tryUnlock = (id: string, condition: boolean): void => {
    if (condition && !have.has(id)) won.add(id)
  }

  if (ctx.won) {
    tryUnlock('first-blood', true)
    if (ctx.difficulty === '1suit') tryUnlock('beginner', true)
    if (ctx.difficulty === '2suit') tryUnlock('two-suit-victor', true)
    if (ctx.difficulty === '4suit') tryUnlock('spider-king', true)
    tryUnlock('speedrunner', ctx.elapsedSeconds < 300)
    tryUnlock('flash', ctx.elapsedSeconds < 120)
    tryUnlock('no-undo', !ctx.usedUndo)
    tryUnlock('minimalist', ctx.moves < 150)
    tryUnlock('perfectionist', ctx.score > 600)
    tryUnlock('comeback', ctx.stockDealt >= 5)
    tryUnlock('auto-completer', ctx.autoCompleted)
    tryUnlock('streak-3', ctx.streak >= 3)
    tryUnlock('streak-10', ctx.streak >= 10)
    tryUnlock('daily-1', ctx.dailyWon)
    tryUnlock('daily-7', ctx.dailyWinsTotal >= 7)
    tryUnlock('daily-30', ctx.dailyWinsTotal >= 30)
    tryUnlock('godless', ctx.totalWinsNoGodMode >= 10)
  }

  const allPlayed = (Object.values(ctx.statsByDifficulty) as GameStats[]).reduce(
    (sum, s) => sum + s.gamesPlayed,
    0
  )
  const allWon = (Object.values(ctx.statsByDifficulty) as GameStats[]).reduce(
    (sum, s) => sum + s.gamesWon,
    0
  )
  tryUnlock('centurion', allPlayed >= 100)
  tryUnlock('librarian', allWon >= 50)
  tryUnlock('collector', ctx.totalUnlocks >= 8)

  // Return only the newly-added ones.
  return [...won].filter((id) => !have.has(id))
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
