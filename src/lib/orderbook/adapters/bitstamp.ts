import {BaseAdapter} from './base'
import type {Level, OrderBookSnapshot} from "../../../types/types.ts";

interface BitstampEvent {
    event: string
    channel: string
    data: { bids: [string, string][]; asks: [string, string][]; microtimestamp: string } | Record<string, never>
}

function parseLevel([price, size]: [string, string]): Level {
    return { price: parseFloat(price), size: parseFloat(size) }
}

export class BitstampAdapter extends BaseAdapter {
    protected buildUrl(_pair: string): string {
        return 'wss://ws.bitstamp.net'
    }

    protected onOpen(ws: WebSocket, pair: string): void {
        const channel = `order_book_${pair.replace('-', '').toLowerCase()}`
        ws.send(JSON.stringify({ event: 'bts:subscribe', data: { channel } }))
    }

    protected parseMessage(raw: string): OrderBookSnapshot | null {
        const msg: BitstampEvent = JSON.parse(raw)

        if (msg.event !== 'data') return null

        const d = msg.data as { bids: [string, string][]; asks: [string, string][]; microtimestamp: string }
        return {
            venue: 'bitstamp',
            pair: this.currentPair,
            bids: d.bids.map(parseLevel),
            asks: d.asks.map(parseLevel),
            timestamp: Math.floor(parseFloat(d.microtimestamp) / 1000),
        }
    }
}

export function createBitstampAdapter() { return new BitstampAdapter() }