import {formatCurrency, formatDelta, formatPnl} from '../utils/format'
import type {KPIData} from "../types/types.ts";

interface Props {
    data: KPIData
}

interface KPICard {
    label: string
    value: string
    semantic: 'positive' | 'negative' | 'neutral'
    subLabel?: string
}

function buildCards(data: KPIData): KPICard[] {
    return [
        {
            label: 'Portfolio Value',
            value: formatCurrency(data.portfolioValue),
            semantic: 'neutral',
            subLabel: 'AUM',
        },
        {
            label: 'Unrealised P&L',
            value: formatPnl(data.unrealisedPnl),
            semantic: data.unrealisedPnl >= 0 ? 'positive' : 'negative',
            subLabel: 'Today',
        },
        {
            label: 'Net Delta',
            value: formatDelta(data.netDelta),
            semantic: data.netDelta > 0 ? 'positive' : data.netDelta < 0 ? 'negative' : 'neutral',
            subLabel: 'Portfolio Δ',
        },
        {
            label: 'Open Positions',
            value: String(data.openPositions),
            semantic: 'neutral',
            subLabel: 'Active',
        },
    ]
}

const SEMANTIC_STYLES: Record<KPICard['semantic'], string> = {
    positive: 'text-[var(--color-positive)]',
    negative: 'text-[var(--color-negative)]',
    neutral: 'text-[var(--color-text-primary)]',
}

export function Summary({data}: Props) {
    const cards = buildCards(data)

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-border-subtle)]">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="bg-[var(--color-surface-1)] px-4 py-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span
                            className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
                          {card.label}
                        </span>
                        {card.subLabel && (
                            <span
                                className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-3)] px-1.5 py-0.5 rounded">
                                    {card.subLabel}
                                </span>
                        )}
                    </div>
                    <span className={`num text-xl font-medium leading-none ${SEMANTIC_STYLES[card.semantic]}`}>
                            {card.value}
                        </span>
                </div>
            ))}
        </div>
    )
}