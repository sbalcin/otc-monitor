
export function formatTimestamp(ms: number): string {
    return new Date(ms).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })
}

