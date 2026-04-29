
export type ConnectionStatus =
    | 'connecting'
    | 'live'
    | 'stale'
    | 'error'
    | 'closed'

export interface VenueStatusEntry {
    venueId: string
    label: string
    status: ConnectionStatus | string
}

export interface VenueAdapter {

    connect(pair: string): void

    disconnect(): void
}

export interface VenueConfig {
    id: string
    label: string
    createAdapter: () => VenueAdapter
    supportedPairs: string[]
}

export interface KPIData {
    portfolioValue: number
    unrealisedPnl: number
    netDelta: number
    openPositions: number
}

export type PositionType = 'Spot' | 'Option' | 'Perpetual'

export interface Position {
    id: string
    asset: string
    type: PositionType
    notional: number
    pnl: number
    delta: number
    expiry: string | null
}