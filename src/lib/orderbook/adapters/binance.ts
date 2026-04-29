import {BaseAdapter} from './base'
import type {Level, OrderBookSnapshot} from "../../../types/types.ts";

interface BinanceDepth {
    lastUpdateId: number
    bids: [string, string][]
    asks: [string, string][]
}

function parseLevel([price, size]: [string, string]): Level {
    return {price: parseFloat(price), size: parseFloat(size)}
}

export class BinanceAdapter extends BaseAdapter {
    protected buildUrl(pair: string): string {
        const symbol = pair.replace('-', '').toLowerCase()
        return `wss://stream.binance.com:9443/ws/${symbol}@depth20@100ms`
    }

    protected onOpen(_ws: WebSocket, _pair: string): void {
        //already push on connect
    }

    protected parseMessage(raw: string): OrderBookSnapshot | null {
        const data: BinanceDepth = JSON.parse(raw)
        //console.log('data ', data.bids.length, data.bids.length)
        return {
            venue: 'binance',
            pair: this.currentPair,
            bids: data.bids.map(parseLevel),
            asks: data.asks.map(parseLevel),
            timestamp: Date.now(),
            sequenceId: data.lastUpdateId,
        }
    }

}

export function createBinanceAdapter() {
    return new BinanceAdapter()
}