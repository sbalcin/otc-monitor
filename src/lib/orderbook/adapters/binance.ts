import {BaseAdapter} from './base'

export class BinanceAdapter extends BaseAdapter {
    protected buildUrl(pair: string): string {
        const symbol = pair.replace('-', '').toLowerCase()
        return `wss://stream.binance.com:9443/ws/${symbol}@depth10@100ms`
    }

    protected onOpen(_ws: WebSocket, _pair: string): void {

    }

}

export function createBinanceAdapter() { return new BinanceAdapter() }