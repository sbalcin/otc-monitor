import type {VenueConfig} from "../../../types/types.ts";
import {createBinanceAdapter} from './binance'
import {createBitstampAdapter} from './bitstamp'

export const VENUE_REGISTRY: Record<string, VenueConfig> = {
    binance: {
        id: 'binance',
        label: 'Binance Spot',
        createAdapter: createBinanceAdapter,
        supportedPairs: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'BNB-USDT', 'PEPE-USDT'],
    },
    bitstamp: {
        id: 'bitstamp',
        label: 'Bitstamp',
        createAdapter: createBitstampAdapter,
        supportedPairs: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
    },
}