import {useEffect, useRef, useState} from 'react'
import type {ConnectionStatus, OrderBookSnapshot, VenueAdapter} from "../types/types.ts";
import {VENUE_REGISTRY} from '../lib/orderbook/adapters/registry'
import {pushSnapshot, registerPanel} from '../lib/orderbook/scheduler'

export interface OrderBookState {
    snapshot: OrderBookSnapshot | null
    status: ConnectionStatus
    staleness: number
}

let nextPanelId = 0

export function useOrderBook(venueId: string, pairId: string): OrderBookState {
    const resetKey = `${venueId}:${pairId}`
    const resetKeyRef = useRef(resetKey)

    const [snapshot, setSnapshot] = useState<OrderBookSnapshot | null>(null)
    const [status, setStatus] = useState<ConnectionStatus>('connecting')
    const [staleness, setStaleness] = useState(0)

    const adapterRef = useRef<VenueAdapter | null>(null)
    const stalenessRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const lastUpdateMsRef = useRef<number | null>(null)
    const panelIdRef = useRef<string>(`panel-${nextPanelId++}`)

    useEffect(() => {
        stalenessRef.current = setInterval(() => {
            if (lastUpdateMsRef.current !== null) {
                setStaleness(Date.now() - lastUpdateMsRef.current)
            }
        }, 1000)
        return () => {
            if (stalenessRef.current !== null) {
                clearInterval(stalenessRef.current)
                stalenessRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        const venueConfig = VENUE_REGISTRY[venueId]
        if (!venueConfig || !venueConfig.supportedPairs.includes(pairId)) return

        const panelId = panelIdRef.current
        const currentKey = resetKey
        resetKeyRef.current = currentKey
        lastUpdateMsRef.current = null

        const unregister = registerPanel(panelId, (snap) => {
            if (resetKeyRef.current !== currentKey) return
            setSnapshot(snap)
            lastUpdateMsRef.current = snap.timestamp
            setStaleness(0)
        })

        const adapter = venueConfig.createAdapter()
        adapterRef.current = adapter

        adapter.onSnapshot((snap) => pushSnapshot(panelId, snap))
        adapter.onStatusChange((s) => {
            if (resetKeyRef.current !== currentKey) return
            setStatus(s)
        })
        adapter.connect(pairId)

        return () => {
            adapter.disconnect()
            adapterRef.current = null
            unregister()
            setSnapshot(null)
            setStatus('connecting')
            setStaleness(0)
            lastUpdateMsRef.current = null
        }
    }, [venueId, pairId, resetKey])

    return {snapshot, status, staleness}
}