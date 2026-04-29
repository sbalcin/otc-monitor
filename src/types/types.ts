
export type ConnectionStatus =
    | 'connecting'
    | 'live'
    | 'stale'
    | 'error'
    | 'closed'

export type VenueStatusMap = Record<string, ConnectionStatus>

export interface VenueStatusEntry {
    venueId: string
    label: string
    status: ConnectionStatus
}

export interface VenueAdapter {
    connect(pair: string): void
    disconnect(): void
    onSnapshot(cb: (snap: OrderBookSnapshot) => void): void
    onStatusChange(cb: (status: ConnectionStatus) => void): void
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

export interface Level {
    price: number
    size: number
}

export type LevelDirection = 'up' | 'down'

export interface OrderBookSnapshot {
    venue: string
    pair: string
    bids: Level[]
    asks: Level[]
    timestamp: number
    sequenceId?: number
}