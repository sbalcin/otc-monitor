import {useMemo, useState} from 'react'

export type SortDir = 'asc' | 'desc'

export interface SortState<K extends string> {
    key: K
    dir: SortDir
}

export function useSort<T, K extends keyof T & string>(
    data: T[],
    defaultKey: K,
    defaultDir: SortDir = 'desc',
) {
    const [sort, setSort] = useState<SortState<K>>({ key: defaultKey, dir: defaultDir })

    const sorted = useMemo(() => {
        return [...data].sort((a, b) => {
            const av = a[sort.key]
            const bv = b[sort.key]
            const cmp =
                typeof av === 'number' && typeof bv === 'number'
                    ? av - bv
                    : String(av).localeCompare(String(bv))
            return sort.dir === 'asc' ? cmp : -cmp
        })
    }, [data, sort])

    function toggle(key: K) {
        setSort((prev) =>
            prev.key === key
                ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                : { key, dir: 'desc' },
        )
    }

    return { sorted, sort, toggle }
}