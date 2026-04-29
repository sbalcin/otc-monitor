export interface PairConfig {
    label: string
    baseAsset: string
    quoteAsset: string
    priceDecimals: number
    sizeDecimals: number
    assetColor: string
}

export const PAIRS: Record<string, PairConfig> = {
    'BTC-USDT': {
        label: 'BTC-USDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        priceDecimals: 2,
        sizeDecimals: 5,
        assetColor: '#f7931a',
    },
    'ETH-USDT': {
        label: 'ETH-USDT',
        baseAsset: 'ETH',
        quoteAsset: 'USDT',
        priceDecimals: 2,
        sizeDecimals: 4,
        assetColor: '#627eea',
    },
    'SOL-USDT': {
        label: 'SOL-USDT',
        baseAsset: 'SOL',
        quoteAsset: 'USDT',
        priceDecimals: 3,
        sizeDecimals: 2,
        assetColor: '#9945ff',
    },
    'BNB-USDT': {
        label: 'BNB-USDT',
        baseAsset: 'BNB',
        quoteAsset: 'USDT',
        priceDecimals: 2,
        sizeDecimals: 3,
        assetColor: '#f3ba2f',
    },
    'PEPE-USDT': {
        label: 'PEPE-USDT',
        baseAsset: 'PEPE',
        quoteAsset: 'USDT',
        priceDecimals: 8,
        sizeDecimals: 0,
        assetColor: '#4ade80',
    },
    'BTC-USD': {
        label: 'BTC-USD',
        baseAsset: 'BTC',
        quoteAsset: 'USD',
        priceDecimals: 2,
        sizeDecimals: 5,
        assetColor: '#f7931a',
    },
    'ETH-USD': {
        label: 'ETH-USD',
        baseAsset: 'ETH',
        quoteAsset: 'USD',
        priceDecimals: 2,
        sizeDecimals: 4,
        assetColor: '#627eea',
    },
    'SOL-USD': {
        label: 'SOL-USD',
        baseAsset: 'SOL',
        quoteAsset: 'USD',
        priceDecimals: 3,
        sizeDecimals: 2,
        assetColor: '#9945ff',
    },
}