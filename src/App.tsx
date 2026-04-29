import {Header} from "./components/Header.tsx";
import {Summary} from "./components/Summary.tsx";
import {OrderBook} from "./components/OrderBook.tsx";
import {Positions} from "./components/Positions.tsx";
import {Footer} from "./components/Footer.tsx";
import {DEFAULT_VENUES, VENUE_REGISTRY} from "./lib/orderbook/adapters/registry.ts";
import {MOCK_KPIS} from "./data/mock.ts";
import {useCallback, useRef, useState} from "react";
import type {ConnectionStatus, VenueStatusMap} from "./types/types.ts";

function App() {

    const [venueStatuses, setVenueStatuses] = useState<VenueStatusMap>({})
    const statusRef = useRef<VenueStatusMap>({})

    const handleStatusChange = useCallback((venueId: string, status: string) => {
        const current = statusRef.current[venueId]
        if (current === status) return
        statusRef.current = { ...statusRef.current, [venueId]: status as ConnectionStatus }
        setVenueStatuses({ ...statusRef.current })
    }, [])

    const headerStatuses = Object.entries(VENUE_REGISTRY).map(([id, config]) => ({
        venueId: id,
        label: config.label,
        status: venueStatuses[id] ?? 'connecting',
    }))

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-surface-0)]">

            <Header venueStatuses={headerStatuses}/>

            <Summary data={MOCK_KPIS}/>

            <main className="flex-1 p-4 flex flex-col gap-4">
                <section>
                    <div className="mb-2 flex items-center gap-2">
                        <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                            Live Order Books
                        </h2>
                        <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <OrderBook
                            defaultVenueId={DEFAULT_VENUES.panel1.venueId}
                            defaultPairId={DEFAULT_VENUES.panel1.pairId}
                            onStatusChange={handleStatusChange}
                        />
                        <OrderBook
                            defaultVenueId={DEFAULT_VENUES.panel2.venueId}
                            defaultPairId={DEFAULT_VENUES.panel2.pairId}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                </section>


                <Positions/>
            </main>

            <Footer/>
        </div>
    )
}

export default App
