import type { Suit } from '../types/game'

interface Props {
  completed: number
  suits?: Suit[]
}

const symbol: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
}

const red = (s: Suit): boolean => s === 'hearts' || s === 'diamonds'

export function Foundation({ completed, suits = [] }: Props): JSX.Element {
  return (
    <div className="grid grid-cols-8 gap-3">
      {Array.from({ length: 8 }).map((_, i) => {
        const suit = suits[i]
        return (
          <div
            key={i}
            className="relative flex h-[var(--card-h)] w-[var(--card-w)] items-center justify-center rounded-[14px] border-2 border-cyan-100/35 bg-cyan-100/5 text-xl font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {suit ? (
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold shadow ${red(suit) ? 'text-red-600' : 'text-zinc-900'}`}
              >
                {symbol[suit]}
              </span>
            ) : i < completed ? (
              <span className="rounded-full bg-white/15 px-2 py-1 text-lg font-bold">✓</span>
            ) : (
              <span className="pointer-events-none absolute inset-0 rounded-[12px] border border-white/10" />
            )}
          </div>
        )
      })}
    </div>
  )
}
