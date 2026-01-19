import { useState } from 'react';
import { Settings, History, Moon, Sun, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Input } from '../atoms';
import type { HistoryEntry } from '../../types';

// ============================================
// Sidebar Component
// ============================================

interface SidebarProps {
    onSelectHistory?: (entry: HistoryEntry) => void;
}

export function Sidebar({ onSelectHistory }: SidebarProps) {
    const {
        config,
        updateConfig,
        history,
        clearHistory,
        isDarkMode,
        toggleDarkMode
    } = useApp();

    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);

    return (
        <aside className="w-sidebar h-full flex flex-col glass-sidebar border-r border-sys-separator">
            {/* Traffic Lights */}
            <TrafficLights />

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
                {/* Settings Section */}
                <SidebarSection
                    title="設定"
                    icon={<Settings className="w-4 h-4" />}
                    isOpen={isSettingsOpen}
                    onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                    <div className="space-y-3">
                        <Input
                            label="API Key"
                            type="password"
                            placeholder="app-xxxxxxxx"
                            value={config.apiKey}
                            onChange={(e) => updateConfig({ apiKey: e.target.value })}
                            hint={config.apiKey.startsWith('app-') ? '✓ 有効な形式' : 'app-で始まるAPIキーを入力'}
                        />
                        <Input
                            label="Base URL"
                            type="url"
                            placeholder="https://api.dify.ai/v1"
                            value={config.baseUrl}
                            onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                        />
                    </div>
                </SidebarSection>

                {/* History Section */}
                <SidebarSection
                    title="履歴"
                    icon={<History className="w-4 h-4" />}
                    isOpen={isHistoryOpen}
                    onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
                    action={
                        history.length > 0 ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); clearHistory(); }}
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
            </div>

            {/* Dark Mode Toggle */}
            <div className="p-4 border-t border-sys-separator">
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-button hover:bg-sys-bg-alt transition-colors"
                >
                    {isDarkMode ? (
                        <Sun className="w-4 h-4 text-sys-text-secondary" />
                    ) : (
                        <Moon className="w-4 h-4 text-sys-text-secondary" />
                    )}
                    <span className="text-subheadline text-sys-text-primary">
                        {isDarkMode ? 'ライトモード' : 'ダークモード'}
                    </span>
                </button>
            </div>
        </aside>
    );
}

// ============================================
// Traffic Lights (Decorative)
// ============================================

function TrafficLights() {
    return (
        <div className="flex items-center gap-2 px-5 py-4 h-toolbar">
            <div className="w-3 h-3 rounded-full bg-[var(--traffic-close)] border border-black/10" />
            <div className="w-3 h-3 rounded-full bg-[var(--traffic-minimize)] border border-black/10" />
            <div className="w-3 h-3 rounded-full bg-[var(--traffic-maximize)] border border-black/10" />
        </div>
    );
}

// ============================================
// Sidebar Section
// ============================================

interface SidebarSectionProps {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    action?: React.ReactNode;
    children: React.ReactNode;
}

function SidebarSection({ title, icon, isOpen, onToggle, action, children }: SidebarSectionProps) {
    return (
        <div className="mb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2 py-2 text-left group"
            >
                {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-sys-text-tertiary" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-sys-text-tertiary" />
                )}
                {icon}
                <span className="flex-1 text-footnote font-medium text-sys-text-secondary uppercase tracking-wide">
                    {title}
                </span>
                {action}
            </button>
            {isOpen && (
                <div className="pl-5 mt-1">
                    {children}
                </div>
            )}
        </div>
    );
}

// ============================================
// History Item
// ============================================

interface HistoryItemProps {
    entry: HistoryEntry;
    onClick: () => void;
}

function HistoryItem({ entry, onClick }: HistoryItemProps) {
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
