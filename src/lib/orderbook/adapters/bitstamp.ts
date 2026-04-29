import {BaseAdapter} from './base'


export class BitstampAdapter extends BaseAdapter {
    protected buildUrl(_pair: string): string {
        return 'wss://ws.bitstamp.net'
    }

    protected onOpen(ws: WebSocket, pair: string): void {
        const channel = `order_book_${pair.replace('-', '').toLowerCase()}`
        ws.send(JSON.stringify({ event: 'bts:subscribe', data: { channel } }))
    }
}

export function createBitstampAdapter() { return new BitstampAdapter() }