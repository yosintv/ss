import { CSS } from '@dnd-kit/utilities'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { Card as CardType } from '../types/game'
import { cn } from '../utils/cn'

interface Props {
  card: CardType
  columnIndex: number
  cardIndex: number
  isSelected: boolean
  isDragging: boolean
  isHinted: boolean
  isPeeked?: boolean
  dealIndex?: number   // position in deal order → drives stagger delay
}

const symbols: Record<CardType['suit'], string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
}

const rankLabel = (rank: number): string =>
  ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[rank] ?? String(rank))

export function Card({
  card,
  columnIndex,
  cardIndex,
  isSelected,
  isDragging,
  isHinted,
  isPeeked = false,
  dealIndex = 0,
}: Props): JSX.Element {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: { cardId: card.id, columnIndex, cardIndex },
    disabled: !card.faceUp
  })

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const showFront = card.faceUp || isPeeked

  // Row-by-row stagger: 8 ms per card → 54 cards deal in ≈ 0.6 s total
  const dealDelay = dealIndex * 0.008

  // easeOutExpo — snappy start, buttery landing
  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

  return (
    <motion.button
      layoutId={card.id}
      ref={setNodeRef}
      initial={{ opacity: 0, y: -24, x: -8, rotateZ: -4, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,   x: 0,  rotateZ:  0, scale: 1   }}
      transition={{
        layout:  { type: 'spring', stiffness: 500, damping: 36, mass: 0.8 },
        default: { delay: dealDelay, duration: 0.18, ease: easeOutExpo },
        opacity: { delay: dealDelay, duration: 0.10, ease: 'easeOut'   },
      }}
      style={{
        transform: CSS.Translate.toString(transform),
        width: 'var(--card-w)',
        height: 'var(--card-h)'
      }}
      className={cn(
        'relative rounded-lg border bg-[var(--card-bg)] shadow-card transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        showFront ? 'border-[var(--card-border)] hover:-translate-y-1 hover:shadow-xl' : 'border-transparent',
        isSelected && 'ring-2 ring-blue-400 ring-offset-1 -translate-y-1 shadow-[0_0_12px_2px_rgba(96,165,250,0.5)]',
        isHinted && 'ring-2 ring-amber-400 animate-pulse shadow-[0_0_10px_2px_rgba(251,191,36,0.4)]',
        isDragging && 'scale-105 shadow-2xl',
        isPeeked && !card.faceUp && 'ring-2 ring-fuchsia-400 opacity-90'
      )}
      aria-label={`${rankLabel(card.rank)} of ${card.suit}, ${card.faceUp ? 'face up' : 'face down'}`}
      {...listeners}
      {...attributes}
    >
      {showFront ? (
        <>
          <div className={cn('absolute left-1 top-1 text-xs font-bold leading-none', red ? 'text-red-600' : 'text-zinc-900')}>
            <div>{rankLabel(card.rank)}</div>
            <div>{symbols[card.suit]}</div>
          </div>
          <div className={cn('flex h-full w-full items-center justify-center text-3xl', red ? 'text-red-600' : 'text-zinc-900')}>
            {symbols[card.suit]}
          </div>
          <div
            className={cn(
              'absolute bottom-1 right-1 rotate-180 text-xs font-bold leading-none',
              red ? 'text-red-600' : 'text-zinc-900'
            )}
          >
            <div>{rankLabel(card.rank)}</div>
            <div>{symbols[card.suit]}</div>
          </div>
        </>
      ) : (
        <div className="card-back absolute inset-0 rounded-md" />
      )}
    </motion.button>
  )
}
