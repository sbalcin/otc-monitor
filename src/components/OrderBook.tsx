import {useMemo, useState} from 'react'
import {useOrderBook} from '../hooks/useOrderBook'
import {VENUE_REGISTRY} from '../lib/orderbook/adapters/registry'
import {PAIRS} from '../lib/orderbook/pairs'
import type {Level, LevelDirection} from "../types/types.ts";
import {calcMid, formatPrice, formatSize, formatSpread, formatStaleness, formatTotal} from "../utils/format.ts";
import {effectivePriceDecimals, groupLevels, makeGroupingSteps} from "../utils/groupLevels.ts";
import {useBookDiff} from '../hooks/useBookDiff'
import {AnimatedPrice} from "./AnimatedPrice.tsx";

interface Props {
    defaultVenueId: string
    defaultPairId: string
    onStatusChange?: (venueId: string, status: string) => void
}

const ROWS = 10
const GRID = 'grid grid-cols-[40%_35%_25%]'
const SELECT_CLS = 'bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded px-2 py-1 text-[11px] text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer'

function DepthBar({pct, side}: { pct: number; side: 'bid' | 'ask' }) {
    return (
        <span
            className={`absolute inset-0 ${side === 'bid' ? 'bg-[var(--color-bid-bg)]' : 'bg-[var(--color-ask-bg)]'}`}
            style={{width: `${pct}%`, transition: 'width 80ms linear'}}
        />
    )
}

function LevelRow({level, cumTotal, maxCumTotal, side, priceDecimals, sizeDecimals, direction, flashing}: {
    level: Level | null
    cumTotal: number
    maxCumTotal: number
    side: 'bid' | 'ask'
    priceDecimals: number
    sizeDecimals: number
    direction?: LevelDirection
    flashing?: boolean
}) {
    if (!level) return <div className="h-[26px]"/>

    const total = level.price * level.size
    const pct = maxCumTotal > 0 ? (cumTotal / maxCumTotal) * 100 : 0

    const priceColor = side === 'bid' ? 'text-[var(--color-bid)]' : 'text-[var(--color-ask)]'
    const sizeColor =
        direction === 'up' ? 'text-[var(--color-positive)]'
            : direction === 'down' ? 'text-[var(--color-negative)]'
                : 'text-[var(--color-text-secondary)]'
    const flashClass = flashing ? (direction === 'down' ? 'animate-flash-down' : 'animate-flash-up') : ''

    return (
        <div className={`${GRID} items-center h-[26px] px-3 ${flashClass}`}>
          <span className={`num text-[12px] font-medium ${priceColor}`}>
            {formatPrice(level.price, priceDecimals)}
          </span>
            <span className={`num text-[11px] text-right ${sizeColor}`}>
                {formatSize(level.size, sizeDecimals)}
            </span>
            <div className="relative overflow-hidden text-right h-full flex items-center justify-end">
                <DepthBar pct={pct} side={side}/>
                <span className="relative z-10 num text-[11px] text-[var(--color-text-muted)]">
                  {formatTotal(total)}
                </span>
            </div>
        </div>
    )
}

function StaleOverlay({staleness, status}: { staleness: number; status: string }) {
    const isConnecting = status === 'connecting'
    const isError = status === 'error' || status === 'closed'
    const isStale = status === 'stale' || (staleness > 5000 && status === 'live')
    if (!isConnecting && !isError && !isStale) return null

    const message = isConnecting ? 'Connecting…' : isError ? 'Reconnecting…' : `Stale · ${formatStaleness(staleness)}`
    const dotColor = isConnecting ? 'bg-[var(--color-status-connecting)]' : isError ? 'bg-[var(--color-status-dead)]' : 'bg-[var(--color-status-stale)]'
    const txtColor = isConnecting ? 'text-[var(--color-status-connecting)]' : isError ? 'text-[var(--color-status-dead)]' : 'text-[var(--color-status-stale)]'

    return (
        <div
            className="absolute inset-0 bg-[var(--color-surface-2)]/80 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-b">
            <div className="flex flex-col items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${dotColor}`}/>
                <span className={`text-xs font-medium ${txtColor}`}>{message}</span>
            </div>
        </div>
    )
}

function LatencyBadge({staleness, status}: { staleness: number; status: string }) {
    if (status !== 'live' && status !== 'stale') return null
    const label =
        staleness < 1000 ? `${staleness}ms`
            : staleness < 60_000 ? `${(staleness / 1000).toFixed(1)}s`
                : formatStaleness(staleness)
    const cls =
        staleness < 500 ? 'text-[var(--color-text-muted)]'
            : staleness < 2000 ? 'text-[var(--color-status-stale)]'
                : 'text-[var(--color-status-dead)]'
    return <span className={`num text-[10px] tabular-nums ${cls}`}>{label}</span>
}

function cumulativeDepth(levels: (Level | null)[]): number[] {
    let cum = 0
    return levels.map((l) => {
        if (l) cum += l.price * l.size
        return cum
    })
}

export function OrderBook({defaultVenueId, defaultPairId, onStatusChange}: Props) {
    const [venueId, setVenueId] = useState(defaultVenueId)
    const [pairId, setPairId] = useState(defaultPairId)
    const [groupingIdx, setGroupingIdx] = useState(0)

    const {snapshot, status, staleness} = useOrderBook(venueId, pairId)
    onStatusChange?.(venueId, status)

    const pairConfig = PAIRS[pairId]
    const priceDecimals = pairConfig?.priceDecimals ?? 2
    const sizeDecimals = pairConfig?.sizeDecimals ?? 4

    const groupingSteps = useMemo(() => makeGroupingSteps(priceDecimals), [priceDecimals])
    const safeIdx = Math.min(groupingIdx, groupingSteps.length - 1)
    const groupingStep = groupingSteps[safeIdx]
    const effectiveDecimals = effectivePriceDecimals(priceDecimals, groupingStep)

    const bids = useMemo(() => groupLevels(snapshot?.bids ?? [], groupingStep, 'bid', ROWS),
        [snapshot?.bids, groupingStep])
    const asks = useMemo(() => groupLevels(snapshot?.asks ?? [], groupingStep, 'ask', ROWS),
        [snapshot?.asks, groupingStep])

    const realBids = useMemo(() => bids.filter((l): l is Level => l !== null), [bids])
    const realAsks = useMemo(() => asks.filter((l): l is Level => l !== null), [asks])

    const {bidDir, askDir, bidFlash, askFlash} = useBookDiff(realBids, realAsks, groupingStep)

    const bidCum = useMemo(() => cumulativeDepth(bids), [bids])
    const askCumBestFirst = useMemo(() => cumulativeDepth(asks), [asks])
    const asksDisplay = useMemo(() => [...asks].reverse(), [asks])
    const askCumDisplay = useMemo(() => [...askCumBestFirst].reverse(), [askCumBestFirst])

    const maxBidCum = bidCum[bidCum.length - 1] ?? 0
    const maxAskCum = askCumBestFirst[askCumBestFirst.length - 1] ?? 0

    const bestBid = snapshot?.bids[0]?.price ?? 0
    const bestAsk = snapshot?.asks[0]?.price ?? 0
    const hasPrices = bestBid > 0 && bestAsk > 0
    const mid = hasPrices ? calcMid(bestBid, bestAsk) : null
    const spreadStr = hasPrices ? formatSpread(bestBid, bestAsk, priceDecimals) : null

    function handleVenueChange(newVenueId: string) {
        const cfg = VENUE_REGISTRY[newVenueId]
        if (!cfg) return
        const pair = cfg.supportedPairs.includes(pairId) ? pairId : cfg.supportedPairs[0]
        setVenueId(newVenueId)
        setPairId(pair)
        setGroupingIdx(0)
    }

    const venueConfig = VENUE_REGISTRY[venueId]

    return (
        <div className="flex flex-col bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded">

            <div
                className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={venueId} onChange={(e) => handleVenueChange(e.target.value)} className={SELECT_CLS}>
                        {Object.values(VENUE_REGISTRY).map((v) => (
                            <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                    </select>
                    <select value={pairId} onChange={(e) => {
                        setPairId(e.target.value);
                        setGroupingIdx(0)
                    }} className={SELECT_CLS}>
                        {(venueConfig?.supportedPairs ?? []).map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--color-text-muted)]">Group</span>
                        <select value={safeIdx} onChange={(e) => setGroupingIdx(Number(e.target.value))}
                                className={SELECT_CLS}>
                            {groupingSteps.map((step, idx) => (
                                <option key={step} value={idx}>{step}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <LatencyBadge staleness={staleness} status={status}/>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                            status === 'live' ? 'bg-[var(--color-status-live)] animate-pulse'
                                : status === 'connecting' ? 'bg-[var(--color-status-connecting)] animate-ping'
                                    : status === 'stale' ? 'bg-[var(--color-status-stale)]'
                                        : 'bg-[var(--color-status-dead)]'
                        }`}/>
                        <span
                            className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{status}</span>
                    </div>
                </div>
            </div>

            <div
                className={`${GRID} px-3 py-1 bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)]`}>
                <span
                    className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Price ({pairConfig?.quoteAsset ?? '—'})</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] text-right">Amount ({pairConfig?.baseAsset ?? '—'})</span>
                <span
                    className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] text-right">Total</span>
            </div>

            <div className="relative">
                <StaleOverlay staleness={staleness} status={status}/>

                {asksDisplay.map((level, i) => (
                    <LevelRow key={i}
                              level={level} cumTotal={askCumDisplay[i] ?? 0} maxCumTotal={maxAskCum}
                              side="ask" priceDecimals={effectiveDecimals} sizeDecimals={sizeDecimals}
                              direction={level ? askDir.get(level.price) : undefined}
                              flashing={level ? askFlash.has(level.price) : false}/>
                ))}

                <div
                    className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-surface-3)] border-y border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Mid</span>
                        <AnimatedPrice value={mid} decimals={priceDecimals} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                                <span
                                    className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Spread</span>
                            <span
                                className="num text-[11px] text-[var(--color-text-secondary)]">{spreadStr ?? '—'}</span>
                        </div>
                    </div>
                </div>

                {bids.map((level, i) => (
                    <LevelRow key={i}
                              level={level} cumTotal={bidCum[i] ?? 0} maxCumTotal={maxBidCum}
                              side="bid" priceDecimals={effectiveDecimals} sizeDecimals={sizeDecimals}
                              direction={level ? bidDir.get(level.price) : undefined}
                              flashing={level ? bidFlash.has(level.price) : false}/>
                ))}
            </div>
        </div>
    )
}