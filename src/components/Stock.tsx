interface Props {
  remaining: number
  disabled: boolean
  onDeal: () => void
}

export function Stock({ remaining, disabled, onDeal }: Props): JSX.Element {
  const layers = Math.max(0, Math.min(5, remaining))

  return (
    <button
      onClick={onDeal}
      disabled={disabled}
      className="relative h-[calc(var(--card-h)+24px)] w-[calc(var(--card-w)+24px)] text-white disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Deal cards from stock"
    >
      {Array.from({ length: layers }).map((_, i) => {
        const offset = (layers - 1 - i) * 5
        return (
          <div
            key={i}
            className="absolute rounded-xl border border-white/70 card-back shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            style={{
              width: 'var(--card-w)',
              height: 'var(--card-h)',
              left: `${offset}px`,
              top: `${offset}px`
            }}
          />
        )
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-full bg-black/45 px-3 py-1 text-sm font-bold">{remaining}</span>
      </div>
    </button>
  )
}
