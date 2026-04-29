import type {OrderBookSnapshot} from "../../types/types.ts";

const FLUSH_INTERVAL_MS = 200

type CommitFn = (snap: OrderBookSnapshot) => void

interface PanelEntry {
    pending: OrderBookSnapshot | null
    commit: CommitFn
    lastCommit: number
    fallbackTimer: ReturnType<typeof setTimeout> | null
}

const panels = new Map<string, PanelEntry>()
let rafHandle: number | null = null

function flush() {
    rafHandle = null
    const now = Date.now()
    let anyDirty = false

    for (const [, entry] of panels) {
        if (!entry.pending) continue
        if (now - entry.lastCommit < FLUSH_INTERVAL_MS) {
            // Not ready use next RAF
            anyDirty = true
            continue
        }

        const snap = entry.pending
        entry.pending = null
        entry.lastCommit = now

        if (entry.fallbackTimer !== null) {
            clearTimeout(entry.fallbackTimer)
            entry.fallbackTimer = null
        }

        // sync within 1 RAF
        entry.commit(snap)
    }

    if (anyDirty) scheduleFlush()
}

function scheduleFlush() {
    if (rafHandle !== null) return
    rafHandle = requestAnimationFrame(flush)
}

export function registerPanel(id: string, commit: CommitFn): () => void {
    panels.set(id, {pending: null, commit, lastCommit: 0, fallbackTimer: null})

    return () => {
        const entry = panels.get(id)
        if (entry?.fallbackTimer !== null) {
            clearTimeout(entry!.fallbackTimer)
        }
        panels.delete(id)
    }
}

export function pushSnapshot(id: string, snap: OrderBookSnapshot) {
    const entry = panels.get(id)
    if (!entry) return

    entry.pending = snap   // take latest

    scheduleFlush()

    if (entry.fallbackTimer !== null) clearTimeout(entry.fallbackTimer)
    entry.fallbackTimer = setTimeout(() => {
        entry.fallbackTimer = null
        const e = panels.get(id)
        if (!e?.pending) return
        const s = e.pending
        e.pending = null
        e.lastCommit = Date.now()
        e.commit(s)
    }, FLUSH_INTERVAL_MS + 16)
}