import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import { useMemo, useState } from 'react'
import { Column } from './Column'
import { Foundation } from './Foundation'
import { Stock } from './Stock'
import { useGameStore } from '../store/gameStore'
import { Card } from './Card'
import { canDropOnColumn, getMovableCards } from '../engine/moves'

export function Game(): JSX.Element {
  const tableau = useGameStore((s) => s.tableau)
  const difficulty = useGameStore((s) => s.difficulty)
  const selected = useGameStore((s) => s.selectedCard)
  const hint = useGameStore((s) => s.hintHighlight)
  const peekActive = useGameStore((s) => s.peekActive)
  const godMode = useGameStore((s) => s.godMode)
  const moveCards = useGameStore((s) => s.moveCards)
  const selectCard = useGameStore((s) => s.selectCard)
  const dealStock = useGameStore((s) => s.dealStock)
  const stock = useGameStore((s) => s.stock)
  const foundations = useGameStore((s) => s.foundations)
  const godShuffleColumn = useGameStore((s) => s.godShuffleColumn)
  const doubleClickAutoMove = useGameStore((s) => s.doubleClickAutoMove)

  const [dragCardId, setDragCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  )

  const onDragEnd = (event: DragEndEvent): void => {
    setDragCardId(null)
    const from = event.active.data.current
    const over = event.over?.data.current
    if (!from || !over) return

    const fromCol = Number(from.columnIndex)
    const fromIdx = Number(from.cardIndex)
    const toCol = Number(over.columnIndex)
    const fromColumn = tableau[fromCol]
    const toColumn = tableau[toCol]
    if (!fromColumn || !toColumn) return
    const moving = getMovableCards(fromColumn, fromIdx, difficulty)
    if (!moving) return
    if (!canDropOnColumn(moving, toColumn, difficulty)) return
    moveCards(fromCol, fromIdx, toCol)
  }

  const dragCard = useMemo(() => {
    if (!dragCardId) return null
    for (const col of tableau) {
      const found = col.cards.find((card) => card.id === dragCardId)
      if (found) return found
    }
    return null
  }, [dragCardId, tableau])

  const handleCardClick = (columnIndex: number, cardIndex: number): void => {
    const current = selected
    if (!current) {
      selectCard(columnIndex, cardIndex)
      return
    }
    if (current.columnIndex === columnIndex && current.cardIndex === cardIndex) {
      selectCard(columnIndex, cardIndex)
      return
    }
    moveCards(current.columnIndex, current.cardIndex, columnIndex)
  }

  const handleCardDoubleClick = (columnIndex: number, cardIndex: number): void => {
    doubleClickAutoMove(columnIndex, cardIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setDragCardId(String(e.active.id))}
      onDragEnd={onDragEnd}
    >
      <div className="mx-auto flex w-full max-w-[1300px] flex-row items-start justify-start gap-3 overflow-x-auto px-3 pb-3 pt-[150px] sm:justify-center sm:gap-4 sm:px-4 sm:pt-[128px] md:gap-8 md:pt-[110px]">
        <div className="shrink-0">
          <Stock
            remaining={stock.length}
            disabled={stock.length === 0 || (!godMode && tableau.some((c) => c.cards.length === 0))}
            onDeal={dealStock}
          />
        </div>
        <div className="shrink-0 pt-[2px]">
          <Foundation completed={foundations.length} suits={foundations} />
        </div>
      </div>
      <main className="overflow-x-auto px-2 pb-8 sm:px-3">
        <p className="mx-auto mb-2 block w-fit rounded-full bg-black/35 px-3 py-1 text-center text-[11px] font-medium text-white/90 backdrop-blur-sm sm:text-xs md:hidden">
          Swipe to scroll columns · double-tap a card to auto-move
        </p>
        <div className="mx-auto flex min-w-max max-w-[1300px] justify-center gap-3">
          {tableau.map((column, columnIndex) => (
            <Column
              key={columnIndex}
              column={column}
              columnIndex={columnIndex}
              difficulty={difficulty}
              selectedCardId={selected?.cardId ?? null}
              hintedFrom={hint?.fromColumn ?? null}
              hintedIndex={hint?.fromIndex ?? null}
              peekActive={peekActive}
              godMode={godMode}
              onCardClick={handleCardClick}
              onCardDoubleClick={handleCardDoubleClick}
              onShuffleColumn={godShuffleColumn}
            />
          ))}
        </div>
      </main>
      <DragOverlay>
        {dragCard ? (
          <Card
            card={dragCard}
            columnIndex={0}
            cardIndex={0}
            isSelected={false}
            isDragging
            isHinted={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
