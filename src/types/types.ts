
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