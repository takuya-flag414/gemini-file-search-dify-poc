import type { HistoryEntry } from '../../../types';

interface HistoryItemProps {
    entry: HistoryEntry;
    onClick: () => void;
}

export function HistoryItem({ entry, onClick }: HistoryItemProps) {
    const date = new Date(entry.timestamp);
    const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

    // Get a short label for the operation mode
    const modeLabel = entry.inputs.option.replace('？', '').substring(0, 10);

    return (
        <button
            onClick={onClick}
            className="w-full text-left px-3 py-2 rounded-button hover:bg-sys-bg-alt transition-colors group"
        >
            <p className="text-footnote text-sys-text-primary truncate">
                {modeLabel}...
            </p>
            <p className="text-caption-2 text-sys-text-tertiary">
                {timeStr}
            </p>
        </button>
    );
}
