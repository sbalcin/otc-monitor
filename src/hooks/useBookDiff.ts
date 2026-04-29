import {useMemo, useState} from "react";
import type {Level, LevelDirection} from "../types/types.ts";

export type DirectionMap = Map<number, LevelDirection>
export type FlashSet = Set<number>

export interface BookDiff {
    bidDir:   DirectionMap
    askDir:   DirectionMap
    bidFlash: FlashSet
    askFlash: FlashSet
}

interface DiffState {
    prevBids: Level[]
    prevAsks: Level[]
    bidDir:   DirectionMap
    askDir:   DirectionMap
    resetKey: unknown
    bidFlash: FlashSet
    askFlash: FlashSet
}

function diffSide(
    prev: Level[],
    next: Level[],
    existing: DirectionMap,
): { dir: DirectionMap; flash: FlashSet } {
    const prevMap = new Map(prev.map((l) => [l.price, l.size]))
    const dir     = new Map(existing)
    const flash   = new Set<number>()

    for (const {price, size} of next) {
        const prevSize = prevMap.get(price)
        if (prevSize === undefined || size > prevSize) {
            dir.set(price, 'up')
            flash.add(price)
        } else if (size < prevSize) {
            dir.set(price, 'down')
            flash.add(price)
        }
    }

    const nextSet = new Set(next.map((l) => l.price))
    for (const price of dir.keys()) {
        if (!nextSet.has(price)) dir.delete(price)
    }

    return {dir, flash}
}

const EMPTY_FLASH: FlashSet = new Set()

export function useBookDiff(bids: Level[], asks: Level[], resetKey?: unknown): BookDiff {
    const [state, setState] = useState<DiffState>(() => ({
        prevBids: [],
        prevAsks: [],
        bidDir:   new Map(),
        askDir:   new Map(),
        resetKey,
        bidFlash: EMPTY_FLASH,
        askFlash: EMPTY_FLASH,
    }))

    // React-documented pattern: update state derived from props by calling
    // setState during render. React re-renders immediately with the new state
    // without painting the intermediate state to the screen.
    // https://react.dev/reference/react/useState#storing-information-from-previous-renders
    const resetKeyChanged = resetKey !== state.resetKey
    const bidsChanged     = bids !== state.prevBids
    const asksChanged     = asks !== state.prevAsks

    if (resetKeyChanged || bidsChanged || asksChanged) {
        const base = resetKeyChanged
            ? {prevBids: [] as Level[], prevAsks: [] as Level[], bidDir: new Map() as DirectionMap, askDir: new Map() as DirectionMap}
            : {prevBids: state.prevBids, prevAsks: state.prevAsks, bidDir: state.bidDir, askDir: state.askDir}

        let bidFlash: FlashSet = EMPTY_FLASH
        let askFlash: FlashSet = EMPTY_FLASH
        let {bidDir, askDir}   = base

        if (resetKeyChanged || bidsChanged) {
            const r = diffSide(base.prevBids, bids, bidDir)
            bidDir   = r.dir
            bidFlash = r.flash
        }

        if (resetKeyChanged || asksChanged) {
            const r = diffSide(base.prevAsks, asks, askDir)
            askDir   = r.dir
            askFlash = r.flash
        }

        setState({
            prevBids: bids,
            prevAsks: asks,
            bidDir,
            askDir,
            resetKey,
            bidFlash,
            askFlash,
        })
    }

    return useMemo(() => ({
        bidDir:   state.bidDir,
        askDir:   state.askDir,
        bidFlash: state.bidFlash,
        askFlash: state.askFlash,
    }), [state])
}