import type {KPIData, Position} from "../types/types.ts";

export const MOCK_POSITIONS: Position[] = [
    {
        id: 'p1',
        asset: 'BTC',
        type: 'Option',
        notional: 4_200_000,
        pnl: 182_400,
        delta: 0.62,
        expiry: '2025-06-27',
    },
    {
        id: 'p2',
        asset: 'ETH',
        type: 'Perpetual',
        notional: 2_750_000,
        pnl: -94_300,
        delta: -0.88,
        expiry: null,
    },
    {
        id: 'p3',
        asset: 'BTC',
        type: 'Spot',
        notional: 8_100_000,
        pnl: 341_200,
        delta: 1.00,
        expiry: null,
    },
]

function deriveKPIs(positions: Position[]): KPIData {
    const unrealisedPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
    const portfolioValue = positions.reduce((sum, p) => sum + p.notional, 0)
    const netDelta = positions.reduce((sum, p) => sum + p.delta * p.notional, 0) / portfolioValue

    return {
        portfolioValue,
        unrealisedPnl,
        netDelta: parseFloat(netDelta.toFixed(2)),
        openPositions: positions.length,
    }
}

export const MOCK_KPIS: KPIData = deriveKPIs(MOCK_POSITIONS)