import type {ConnectionStatus, OrderBookSnapshot, VenueAdapter} from "../../../types/types.ts";

const STALE_THRESHOLD_MS    = 4_000
const HEARTBEAT_TIMEOUT_MS  = 10_000
const BASE_BACKOFF_MS       = 1_000
const MAX_BACKOFF_MS        = 30_000

export abstract class BaseAdapter implements VenueAdapter {
    protected currentPair  = ''
    private statusCb:   ((status: ConnectionStatus) => void) | null = null
    private snapshotCb: ((snap: OrderBookSnapshot) => void) | null = null

    private ws:               WebSocket | null = null
    private destroyed         = false
    private reconnectAttempt  = 0
    private reconnectTimer:   ReturnType<typeof setTimeout> | null = null
    private staleTimer:       ReturnType<typeof setTimeout> | null = null
    private heartbeatTimer:   ReturnType<typeof setTimeout> | null = null

    protected abstract buildUrl(pair: string): string
    protected abstract onOpen(ws: WebSocket, pair: string): void
    protected abstract parseMessage(raw: string): OrderBookSnapshot | null

    onSnapshot(cb: (snap: OrderBookSnapshot) => void)  { this.snapshotCb = cb }
    onStatusChange(cb: (status: ConnectionStatus) => void) { this.statusCb = cb }

    connect(pair: string) {
        if (this.destroyed) return
        this.currentPair = pair
        this.openSocket()
        this.attachPageListeners()
    }

    disconnect() {
        this.destroyed = true
        this.detachPageListeners()
        this.clearTimers()
        this.closeSocket()
    }

    private openSocket() {
        if (this.destroyed) return
        this.clearSocketTimers()

        this.emitStatus('connecting')
        const url = this.buildUrl(this.currentPair)
        const ws = new WebSocket(url)
        this.ws = ws

        ws.onopen = () => {
            if (this.ws !== ws) return
            this.reconnectAttempt = 0
            this.onOpen(ws, this.currentPair)
            this.resetHeartbeat()
        }

        ws.onmessage = (event: MessageEvent) => {
            if (this.ws !== ws) return
            this.resetHeartbeat()
            try {
                const snap = this.parseMessage(event.data as string)
                if (snap) {
                    this.snapshotCb?.(snap)
                    this.resetStale()
                    this.emitStatus('live')
                }
            } catch {
                // skip
            }
        }

        ws.onerror = () => {
            if (this.ws !== ws) return
            this.emitStatus('error')
        }

        ws.onclose = () => {
            if (this.ws !== ws) return
            this.ws = null
            if (!this.destroyed) {
                this.emitStatus('closed')
                this.scheduleReconnect()
            }
        }
    }

    private closeSocket() {
        const ws = this.ws
        this.ws = null
        if (ws && ws.readyState < WebSocket.CLOSING) {
            ws.close()
        }
    }

    private scheduleReconnect() {
        if (this.destroyed) return
        const delay = Math.min(BASE_BACKOFF_MS * 2 ** this.reconnectAttempt, MAX_BACKOFF_MS)
        this.reconnectAttempt++
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            if (!this.destroyed) this.openSocket()
        }, delay)
    }


    private resetStale() {
        if (this.staleTimer) clearTimeout(this.staleTimer)
        this.staleTimer = setTimeout(() => {
            if (!this.destroyed) this.emitStatus('stale')
        }, STALE_THRESHOLD_MS)
    }

    private resetHeartbeat() {
        if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer)
        this.heartbeatTimer = setTimeout(() => {
            if (this.destroyed) return
            this.closeSocket()
            this.emitStatus('error')
            this.scheduleReconnect()
        }, HEARTBEAT_TIMEOUT_MS)
    }

    private clearSocketTimers() {
        if (this.staleTimer)    { clearTimeout(this.staleTimer);    this.staleTimer    = null }
        if (this.heartbeatTimer){ clearTimeout(this.heartbeatTimer); this.heartbeatTimer = null }
        if (this.reconnectTimer){ clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
    }

    private clearTimers() {
        this.clearSocketTimers()
    }


    private emitStatus(status: ConnectionStatus) {
        this.statusCb?.(status)
    }

    private handleVisibilityChange = () => {
        if (document.visibilityState !== 'visible') return
        if (this.destroyed) return
        const state = this.ws?.readyState
        if (state === WebSocket.CLOSED || state === undefined || this.ws === null) {
            this.clearSocketTimers()
            this.reconnectAttempt = 0
            this.openSocket()
        }
    }

    private handleOnline = () => {
        if (this.destroyed) return
        this.clearSocketTimers()
        this.closeSocket()
        this.reconnectAttempt = 0
        this.openSocket()
    }

    private attachPageListeners() {
        document.addEventListener('visibilitychange', this.handleVisibilityChange)
        window.addEventListener('online', this.handleOnline)
    }

    private detachPageListeners() {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange)
        window.removeEventListener('online', this.handleOnline)
    }

}