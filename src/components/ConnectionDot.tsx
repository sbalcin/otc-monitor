import type {ConnectionStatus} from "../types/types.ts";

interface Props {
    status: ConnectionStatus | string
    label: string
}

const STATUS_CONFIG: Record<ConnectionStatus, { color: string; pulse: boolean; title: string }> = {
    live: {color: 'bg-[var(--color-status-live)]', pulse: true, title: 'Live'},
    connecting: {color: 'bg-[var(--color-status-connecting)]', pulse: true, title: 'Connecting…'},
    stale: {color: 'bg-[var(--color-status-stale)]', pulse: false, title: 'Stale'},
    error: {color: 'bg-[var(--color-status-dead)]', pulse: false, title: 'Error'},
    closed: {color: 'bg-[var(--color-status-dead)]', pulse: false, title: 'Disconnected'},
}

export function ConnectionDot({status, label}: Props) {
    const cfg = STATUS_CONFIG[status]

    return (
        <div className="flex items-center gap-1.5" title={`${label}: ${cfg.title}`}>
          <span className="relative flex h-2 w-2">
            {cfg.pulse && (
                <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${cfg.color}`}
                />
            )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.color}`}/>
          </span>
            <span className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
            {label}
          </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">
            {cfg.title}
          </span>
        </div>
    )
}