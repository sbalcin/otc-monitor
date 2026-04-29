import {useEffect, useState} from "react";
import {formatTimestamp} from "../utils/format.ts";

import {ConnectionDot} from "./ConnectionDot.tsx";
import type {VenueStatusEntry} from "../types/types.ts";

interface Props {
    venueStatuses: VenueStatusEntry[]
}

export function Header({venueStatuses}: Props) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(t)
    }, [])

    return (
        <header
            className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[var(--color-accent)] flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold tracking-tight">STS</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-[var(--color-text-primary)] leading-none">
                            OTC Live Markets
                        </h1>
                    </div>
                </div>
            </div>


            <div className="hidden sm:flex items-center gap-4">
                {venueStatuses.map((v) => (
                    <ConnectionDot key={v.venueId} status={v.status} label={v.label}/>
                ))}
            </div>

            <div className="flex flex-col items-end">
            <span className="num text-xs text-[var(--color-text-primary)]">
              {formatTimestamp(now)}
            </span>

            </div>
        </header>
    )
}