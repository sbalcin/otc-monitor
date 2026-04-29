# OTC Monitor — OTC Live Markets Widget

React 18 · TypeScript 5 · Vite · Tailwind CSS

---

## Running locally

```bash
  npm install
  npm run dev
```

No env variables needed

---

## Architecture

### Venue adapter abstraction

**VenueAdapter** - every venue implements that interface.

**BasAdapter** - Abstract base class for every venue sharing common logic with resilient socket connection , supported with exponential backoff reconnect, stale detection, heartbeat and event listeners.

**OrderBook** - is aware of OrderBookSnapshot, not directly tied with venues.

**Pairs** -  config based supported pairs with token specific properties like price/size formatting and colors.

**Schedular** - Shared batching logic for multiple orderbooks to smooth socket updates

**Orderbook grouping** - Grouping order prices along with other features like depth bars, change highlights price animation

**Responsive design** - Hidden position table columns below 768px. 

## What I would add with more time
**Persisted state** - Zustand could be appropriate to save user's selected pair, group index etc.

**E2E tests** - on the reconnection logic with local mock server to simulate those states.

**Depth chart** - displaying bid/ask depth curves


## 📱 Demo

<p align="center">
  <img src="./src/assets/01.gif" width="400" alt="demo" />
</p>

