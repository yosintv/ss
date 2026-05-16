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
  isPeeked = false
}: Props): JSX.Element {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: { cardId: card.id, columnIndex, cardIndex },
    disabled: !card.faceUp
  })

  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  const showFront = card.faceUp || isPeeked

  return (
    <motion.button
      layoutId={card.id}
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        width: 'var(--card-w)',
        height: 'var(--card-h)'
      }}
      className={cn(
        'relative rounded-lg border bg-[var(--card-bg)] shadow-card transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        showFront ? 'border-[var(--card-border)]' : 'border-transparent',
        isSelected && 'ring-2 ring-blue-400',
        isHinted && 'ring-2 ring-amber-400 animate-pulse',
        isDragging && 'scale-105',
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
