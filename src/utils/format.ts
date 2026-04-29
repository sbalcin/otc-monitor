
export function formatTimestamp(ms: number): string {
    return new Date(ms).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })
}

export function formatExpiry(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: '2-digit',
    })
}

export function formatCurrency(value: number, compact = true): string {
    if (compact) {
        const abs = Math.abs(value)
        const sign = value < 0 ? '-' : ''
        if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
        if (abs >= 1_000_000)     return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
        if (abs >= 1_000)         return `${sign}$${(abs / 1_000).toFixed(1)}K`
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(value)
}

export function formatPnl(value: number): string {
    return `${value >= 0 ? '+' : ''}${formatCurrency(value, true)}`
}

export function formatDelta(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
}

export function formatNotional(value: number): string {
    return formatCurrency(value, true)
}


