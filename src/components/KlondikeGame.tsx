import { useEffect } from 'react'
import { useKlondikeStore } from '../store/klondikeStore'
import { canPlaceOnFoundation, canPlaceOnTableau } from '../engine/klondike'
import type { Card } from '../types/game'
import type { KlondikeSource } from '../engine/klondike'
import { cn } from '../utils/cn'

const SYM: Record<Card['suit'], string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }
const RL = (r: number) => ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[r] ?? String(r))
const isRed = (s: Card['suit']) => s === 'hearts' || s === 'diamonds'

// Card face/back display (no dnd, just clicks)
function KCard({ card, selected, onClick }: { card: Card; selected: boolean; onClick: () => void }) {
  const red = isRed(card.suit)
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-none rounded-[6px] border bg-white shadow-sm transition-all select-none cursor-pointer',
        'w-[54px] h-[76px] sm:w-[62px] sm:h-[88px]',
        selected ? 'ring-2 ring-blue-400 border-blue-300 -translate-y-1' : 'border-zinc-300 hover:border-zinc-400'
      )}
    >
      {card.faceUp ? (
        <>
          <span className={cn('absolute left-1 top-0.5 text-[10px] font-bold leading-tight', red ? 'text-red-600' : 'text-zinc-900')}>
            {RL(card.rank)}<br />{SYM[card.suit]}
          </span>
          <span className={cn('absolute inset-0 flex items-center justify-center text-xl', red ? 'text-red-500' : 'text-zinc-800')}>
            {SYM[card.suit]}
          </span>
          <span className={cn('absolute bottom-0.5 right-1 rotate-180 text-[10px] font-bold leading-tight', red ? 'text-red-600' : 'text-zinc-900')}>
            {RL(card.rank)}<br />{SYM[card.suit]}
          </span>
        </>
      ) : (
        <span className="card-back absolute inset-0 rounded-[5px]" />
      )}
    </button>
  )
}

function Slot({ label, onClick, glow }: { label: string; onClick?: () => void; glow?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-[54px] h-[76px] sm:w-[62px] sm:h-[88px] rounded-[6px] border-2 border-dashed flex items-center justify-center text-sm font-bold transition',
        glow ? 'border-blue-400 text-blue-300 bg-blue-400/10' : 'border-white/25 text-white/30 hover:border-white/40'
      )}
    >
      {label}
    </button>
  )
}

export function KlondikeGame() {
  const tableau     = useKlondikeStore(s => s.tableau)
  const foundations = useKlondikeStore(s => s.foundations)
  const stock       = useKlondikeStore(s => s.stock)
  const waste       = useKlondikeStore(s => s.waste)
  const selected    = useKlondikeStore(s => s.selected)
  const status      = useKlondikeStore(s => s.status)
  const drawStock       = useKlondikeStore(s => s.drawStock)
  const selectSource    = useKlondikeStore(s => s.selectSource)
  const moveToTableau   = useKlondikeStore(s => s.moveToTableau)
  const moveToFoundation = useKlondikeStore(s => s.moveToFoundation)
  const tickTime        = useKlondikeStore(s => s.tickTime)

  useEffect(() => {
    const id = setInterval(tickTime, 1000)
    return () => clearInterval(id)
  }, [tickTime])

  if (status === 'won') return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="text-6xl">🏆</div>
      <h2 className="text-3xl font-extrabold text-white">You Won!</h2>
      <p className="text-white/70">Klondike Solitaire complete!</p>
    </div>
  )

  const wasteTop = waste.at(-1) ?? null

  const isSel = (src: KlondikeSource) => {
    if (!selected) return false
    if (selected.type !== src.type) return false
    if (src.type === 'waste') return true
    return src.type === 'tableau' && selected.type === 'tableau'
      && selected.col === src.col && selected.idx === src.idx
  }

  // Get the card the user has selected (for drop checking)
  const selCard = !selected ? null
    : selected.type === 'waste' ? wasteTop
    : tableau[selected.col]?.cards[selected.idx] ?? null

  const handleColClick = (col: number, idx: number) => {
    const card = tableau[col]?.cards[idx]
    if (!card?.faceUp) return
    if (selected) { moveToTableau(col); return }
    selectSource({ type: 'tableau', col, idx })
  }

  return (
    <div className="overflow-x-auto px-2 pb-10 sm:px-4">
      <div className="mx-auto" style={{ maxWidth: 480 }}>

        {/* ── Top row ── */}
        <div className="flex items-end gap-2 pb-3 pt-2 sm:gap-3">
          {/* Stock pile */}
          {stock.length > 0 ? (
            <button
              onClick={drawStock}
              className="relative w-[54px] h-[76px] sm:w-[62px] sm:h-[88px] rounded-[6px] border-2 border-white/30 hover:border-white/50 transition overflow-hidden flex items-center justify-center"
            >
              <span className="card-back absolute inset-0" />
              <span className="relative text-white text-lg z-10">↺</span>
            </button>
          ) : (
            <Slot label="↺" onClick={drawStock} />
          )}

          {/* Waste */}
          {wasteTop ? (
            <KCard
              card={wasteTop}
              selected={isSel({ type: 'waste' })}
              onClick={() => selectSource({ type: 'waste' })}
            />
          ) : (
            <Slot label="" />
          )}

          <div className="flex-1" />

          {/* Foundations */}
          {foundations.map((f, fi) => {
            const canDrop = !!selCard && canPlaceOnFoundation(selCard, f)
            if (f.topRank === 0) return (
              <Slot key={f.suit} label={SYM[f.suit]} onClick={moveToFoundation} glow={canDrop} />
            )
            const topCard: Card = { id: `fd-${f.suit}`, suit: f.suit, rank: f.topRank as Card['rank'], faceUp: true }
            return (
              <div key={f.suit} className={cn('rounded-[6px] transition', canDrop && 'ring-2 ring-blue-400')}>
                <KCard card={topCard} selected={false} onClick={moveToFoundation} />
              </div>
            )
          })}
        </div>

        {/* ── Tableau ── */}
        <div className="flex gap-2 sm:gap-3">
          {tableau.map((col, colIdx) => {
            const topCard = col.cards.at(-1) ?? null
            const canDrop = !!selCard && canPlaceOnTableau(selCard, topCard)
            const isEmpty = col.cards.length === 0

            return (
              <div key={colIdx} className="flex flex-col" style={{ width: 54, minHeight: 76 }}>
                {isEmpty ? (
                  <Slot
                    label={canDrop ? '↓' : 'K'}
                    onClick={() => selected && moveToTableau(colIdx)}
                    glow={canDrop}
                  />
                ) : (
                  col.cards.map((card, idx) => {
                    const isFirst = idx === 0
                    const prevFaceUp = col.cards[idx - 1]?.faceUp ?? false
                    // Overlap: face-down cards peek 8px, face-up cards peek 20px
                    const mt = isFirst ? 0 : prevFaceUp ? -56 : -68

                    return (
                      <div key={card.id} style={{ marginTop: mt }}>
                        <KCard
                          card={card}
                          selected={isSel({ type: 'tableau', col: colIdx, idx })}
                          onClick={() => handleColClick(colIdx, idx)}
                        />
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
