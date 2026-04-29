import {MOCK_POSITIONS} from '../data/mock'
import {PAIRS} from '../lib/orderbook/pairs'
import {formatDelta, formatExpiry, formatNotional, formatPnl,} from '../utils/format'
import type {Position} from "../types/types.ts";
import {useSort} from "../hooks/useSort.ts";

function getAssetColor(asset: string): string {
    const match = Object.values(PAIRS).find((p) => p.baseAsset === asset)
    return match?.assetColor ?? 'var(--color-text-primary)'
}

type SortKey = keyof Pick<Position, 'asset' | 'type' | 'notional' | 'pnl' | 'delta' | 'expiry'>

const COLUMNS: { key: SortKey; label: string; hideOnTablet?: boolean; align?: string }[] = [
    {key: 'asset', label: 'Asset', align: 'left'},
    {key: 'type', label: 'Type', align: 'left'},
    {key: 'notional', label: 'Notional', align: 'right'},
    {key: 'pnl', label: 'P&L', align: 'right'},
    {key: 'delta', label: 'Delta', align: 'right', hideOnTablet: true},
    {key: 'expiry', label: 'Expiry', align: 'right', hideOnTablet: true},
]

function SortIcon({active, dir}: { active: boolean; dir: 'asc' | 'desc' }) {
    if (!active) return <span className="text-[var(--color-text-muted)] ml-1">↕</span>
    return <span className="text-[var(--color-accent)] ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

const TYPE_BADGE: Record<Position['type'], string> = {
    Spot: 'bg-[var(--color-surface-4)] text-[var(--color-text-secondary)]',
    Option: 'bg-blue-900/40 text-blue-400',
    Perpetual: 'bg-purple-900/40 text-purple-400',
}

export function Positions() {
    const {sorted, sort, toggle} = useSort<Position, SortKey>(
        MOCK_POSITIONS,
        'pnl',
        'desc',
    )

    return (
        <div className="flex flex-col bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded">
            <div className="px-4 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="text-[11px] uppercase font-semibold text-[var(--color-text-muted)]">
                    Open Positions
                </h2>
                <span
                    className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-3)] px-1.5 py-0.5 rounded">
                    {MOCK_POSITIONS.length} positions
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="border-b border-[var(--color-border-subtle)]">
                        {COLUMNS.map((col) => (
                            <th
                                key={col.key}
                                onClick={() => toggle(col.key)}
                                className={[
                                    'px-4 py-2 text-[10px] uppercase font-medium cursor-pointer select-none',
                                    'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors',
                                    col.align === 'right' ? 'text-right' : 'text-left',
                                    col.hideOnTablet ? 'hidden md:table-cell' : '',
                                ].join(' ')}
                            >
                                {col.label}
                                <SortIcon active={sort.key === col.key} dir={sort.dir}/>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.map((pos, idx) => {
                        const pnlPositive = pos.pnl >= 0
                        const deltaPositive = pos.delta >= 0

                        return (
                            <tr
                                key={pos.id}
                                className={[
                                    'border-b border-[var(--color-border-subtle)] transition-colors',
                                    'hover:bg-[var(--color-surface-2)]',
                                    idx % 2 === 0 ? '' : 'bg-[var(--color-surface-1)]/50',
                                ].join(' ')}>
                                <td className="px-4 py-2">
                                    <span className="num text-xs font-semibold"
                                          style={{color: getAssetColor(pos.asset)}}>
                                      {pos.asset}
                                    </span>
                                </td>

                                <td className="px-4 py-2">
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_BADGE[pos.type]}`}>
                                      {pos.type}
                                    </span>
                                </td>

                                <td className="px-4 py-2 text-right">
                                    <span className="num text-xs text-[var(--color-text-secondary)]">
                                      {formatNotional(pos.notional)}
                                    </span>
                                </td>

                                <td className="px-4 py-2 text-right">
                                    <span
                                        className={`num text-xs font-medium ${pnlPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
                                      {formatPnl(pos.pnl)}
                                    </span>
                                </td>

                                <td className="px-4 py-2 text-right hidden md:table-cell">
                                    <span
                                        className={`num text-xs ${deltaPositive ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-negative)]'}`}>
                                      {formatDelta(pos.delta)}
                                    </span>
                                </td>

                                <td className="px-4 py-2 text-right hidden md:table-cell">
                                    <span className="num text-[11px] text-[var(--color-text-muted)]">
                                      {formatExpiry(pos.expiry)}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}