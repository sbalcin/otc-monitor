import {Header} from "./components/Header.tsx";
import {KPISummary} from "./components/KPISummary.tsx";
import {OrderBook} from "./components/OrderBook.tsx";
import {Positions} from "./components/Positions.tsx";
import {Footer} from "./components/Footer.tsx";
import {VENUE_REGISTRY} from "./lib/orderbook/adapters/registry.ts";

function App() {

    const headerStatuses = Object.entries(VENUE_REGISTRY).map(([id, config]) => ({
        venueId: id,
        label: config.label,
        status: 'connecting',
    }))

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-surface-0)]">

            <Header venueStatuses={headerStatuses} />

            <KPISummary/>

            <main className="flex-1 p-4 flex flex-col gap-4">
                <OrderBook/>

                <Positions/>
            </main>

            <Footer/>
        </div>
    )
}

export default App
