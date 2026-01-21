import { History, Trash2 } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { HistoryItem } from './HistoryItem';
import type { HistoryEntry } from '../../../types';

interface HistorySectionProps {
    isOpen: boolean;
    onToggle: () => void;
    history: HistoryEntry[];
    onClearHistory: () => void;
    onSelectHistory?: (entry: HistoryEntry) => void;
}

export function HistorySection({
    isOpen,
    onToggle,
    history,
    onClearHistory,
    onSelectHistory,
}: HistorySectionProps) {
    return (
        <SidebarSection
            title="履歴"
            icon={<History className="w-4 h-4" />}
            isOpen={isOpen}
            onToggle={onToggle}
            action={
                history.length > 0 ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClearHistory(); }}
                        className="p-1 hover:bg-sys-bg-alt rounded transition-colors"
                        title="履歴をクリア"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-sys-text-tertiary" />
                    </button>
                ) : undefined
            }
        >
            {history.length === 0 ? (
                <p className="text-footnote text-sys-text-tertiary py-2">
                    実行履歴がありません
                </p>
            ) : (
                <div className="space-y-1">
                    {history.slice(0, 10).map((entry) => (
                        <HistoryItem
                            key={entry.id}
                            entry={entry}
                            onClick={() => onSelectHistory?.(entry)}
                        />
                    ))}
                </div>
            )}
        </SidebarSection>
    );
}
