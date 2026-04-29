import {Header} from "./components/Header.tsx";
import {Summary} from "./components/Summary.tsx";
import {OrderBook} from "./components/OrderBook.tsx";
import {Positions} from "./components/Positions.tsx";
import {Footer} from "./components/Footer.tsx";
import {VENUE_REGISTRY} from "./lib/orderbook/adapters/registry.ts";
import {MOCK_KPIS} from "./data/mock.ts";

function App() {

    const headerStatuses = Object.entries(VENUE_REGISTRY).map(([id, config]) => ({
        venueId: id,
        label: config.label,
        status: 'connecting',
    }))

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-surface-0)]">

            <Header venueStatuses={headerStatuses}/>

            <Summary data={MOCK_KPIS}/>

            <main className="flex-1 p-4 flex flex-col gap-4">
                <OrderBook/>

                <Positions/>
            </main>

            <Footer/>
        </div>
    )
}

export default App
