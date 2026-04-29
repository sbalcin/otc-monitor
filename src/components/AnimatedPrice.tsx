import {useEffect, useRef, useState} from 'react'

interface Props {
    value: number | null
    decimals: number
    className?: string
}

const ANIMATION_DURATION_MS = 400

function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3)
}

export function AnimatedPrice({value, decimals, className = ''}: Props) {
    const [displayValue, setDisplayValue] = useState<number | null>(value)
    const [direction, setDirection] = useState<'up' | 'down' | null>(null)

    const prevValueRef = useRef<number | null>(value)
    const rafRef       = useRef<number | null>(null)
    const startRef     = useRef<number | null>(null)
    const fromRef      = useRef<number>(value ?? 0)

    useEffect(() => {
        if (value === null) return

        const prev = prevValueRef.current
        prevValueRef.current = value

        if (prev !== null && value !== prev) {
            setDirection(value > prev ? 'up' : 'down')
        }

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

        fromRef.current  = displayValue ?? value
        startRef.current = null

        function tick(timestamp: number) {
            if (startRef.current === null) startRef.current = timestamp
            const progress = Math.min((timestamp - startRef.current) / ANIMATION_DURATION_MS, 1)
            setDisplayValue(fromRef.current + (value! - fromRef.current) * easeOut(progress))
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                rafRef.current = null
            }
        }

        rafRef.current = requestAnimationFrame(tick)

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        }
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }, [])

    const colorClass = direction === 'up'
        ? 'text-[var(--color-positive)]'
        : direction === 'down'
            ? 'text-[var(--color-negative)]'
            : 'text-[var(--color-text-primary)]'

    return (
        <span
            className={`num tabular-nums ${colorClass} ${className}`}
        >
            {displayValue !== null
                ? displayValue.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                })
                : '—'}
        </span>
    )
}