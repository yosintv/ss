import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { Card } from './Card'
import type { Column as ColumnType, Difficulty } from '../types/game'

interface Props {
  column: ColumnType
  columnIndex: number
  difficulty: Difficulty
  selectedCardId: string | null
  hintedFrom: number | null
  hintedIndex: number | null
  peekActive: boolean
  godMode: boolean
  onCardClick: (column: number, index: number) => void
  onCardDoubleClick: (column: number, index: number) => void
  onShuffleColumn: (column: number) => void
}

export function Column({
  column,
  columnIndex,
  selectedCardId,
  hintedFrom,
  hintedIndex,
  peekActive,
  godMode,
  onCardClick,
  onCardDoubleClick,
  onShuffleColumn
}: Props): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnIndex}`, data: { columnIndex } })

  const lastTap = useRef<{ idx: number; t: number } | null>(null)

  const calcTop = (idx: number): number => {
    const root = getComputedStyle(document.documentElement)
    const faceUpOffset = Number.parseInt(root.getPropertyValue('--card-overlap-down'), 10) || 34
    const faceDownOffset = Number.parseInt(root.getPropertyValue('--card-overlap-hidden'), 10) || 20
    let y = 0
    for (let i = 0; i < idx; i += 1) {
      const c = column.cards[i]
      if (!c) continue
      y += c.faceUp ? faceUpOffset : faceDownOffset
    }
    return y
  }

  const handleClick = (idx: number): void => {
    const now = Date.now()
    if (lastTap.current && lastTap.current.idx === idx && now - lastTap.current.t < 350) {
      lastTap.current = null
      onCardDoubleClick(columnIndex, idx)
      return
    }
    lastTap.current = { idx, t: now }
    onCardClick(columnIndex, idx)
  }

  return (
    <div className="min-w-[var(--card-w)]">
      <div className="mb-1 flex items-center justify-center gap-2 text-xs text-white/60">
        <span>{columnIndex + 1}</span>
        {godMode && column.cards.some((c) => c.faceUp) && (
          <button
            onClick={() => onShuffleColumn(columnIndex)}
            className="rounded-full bg-fuchsia-500/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow hover:bg-fuchsia-400"
            title="God mode: shuffle face-up cards in this column"
          >
            🔀
          </button>
        )}
      </div>
      <motion.div
        ref={setNodeRef}
        layout="size"
        transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.8 }}
        className={`relative min-h-[calc(var(--card-h)+220px)] rounded-md ${isOver ? 'bg-white/10' : ''}`}
      >
        {column.cards.length === 0 && (
          <button
            aria-label={`Empty column ${columnIndex + 1}`}
            className="h-[var(--card-h)] w-[var(--card-w)] rounded-lg border border-dashed border-white/30"
          />
        )}
        {column.cards.map((card, idx) => (
          <div
            key={card.id}
            className="absolute left-0"
            style={{ top: calcTop(idx), zIndex: idx + 1 }}
            onClick={() => handleClick(idx)}
            onDoubleClick={(e) => {
              e.preventDefault()
              onCardDoubleClick(columnIndex, idx)
            }}
          >
            <Card
              card={card}
              columnIndex={columnIndex}
              cardIndex={idx}
              isSelected={selectedCardId === card.id}
              isDragging={false}
              isHinted={hintedFrom === columnIndex && hintedIndex === idx}
              isPeeked={peekActive}
              dealIndex={idx * 10 + columnIndex}
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
