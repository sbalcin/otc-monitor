import type {Level} from "../types/types.ts";

// priceDecimals=2 → ['0.01', '0.1', '1'] BTC
// priceDecimals=8 → ['0.00000001', '0.0000001', '0.000001'] PEPE
export function makeGroupingSteps(priceDecimals: number): string[] {
    return [0, 1, 2].map((offset) => {
        const d = priceDecimals - offset
        if (d <= 0) return String(Math.pow(10, -d))
        return '0.' + '0'.repeat(d - 1) + '1'
    })
}

// for merged OB with scaling
// Step '1' or larger → 0 decimals (75,903 not 75,903.00)
// Step '0.1'         → 1 decimal
export function effectivePriceDecimals(_priceDecimals: number, groupingStep: string): number {
    const dot = groupingStep.indexOf('.')
    if (dot === -1) return 0
    return groupingStep.length - dot - 1
}

export function groupLevels(
    levels: Level[],
    groupingStep: string,
    side: 'bid' | 'ask',
    maxRows: number,
): (Level | null)[] {
    const g = parseFloat(groupingStep)

    let bucketed: Level[]

    if (!g || levels.length === 0) {
        bucketed = levels.slice(0, maxRows)
    } else {
        const buckets = new Map<number, number>()
        for (const { price, size } of levels) {
            const bp = side === 'bid' ? Math.floor(price / g) * g : Math.ceil(price / g) * g
            buckets.set(bp, (buckets.get(bp) ?? 0) + size)
        }
        bucketed = Array.from(buckets.entries())
            .map(([price, size]) => ({ price, size }))
            .sort((a, b) => side === 'bid' ? b.price - a.price : a.price - b.price)
            .slice(0, maxRows)
    }

    // Pad with nulls for layout
    const padded: (Level | null)[] = [...bucketed]
    while (padded.length < maxRows) padded.push(null)
    return padded
}