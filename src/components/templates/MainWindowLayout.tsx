import type { ReactNode } from 'react';
import { PanelRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../organisms/Sidebar';
import { InspectorPanel } from '../organisms/InspectorPanel';
import type { LogEntry, HistoryEntry } from '../../types';

// ============================================
// Main Window Layout (3-Pane)
// ============================================

interface MainWindowLayoutProps {
    children: ReactNode;
    logs: LogEntry[];
    isProcessing?: boolean;
    onSelectHistory?: (entry: HistoryEntry) => void;
}

export function MainWindowLayout({
    children,
    logs,
    isProcessing = false,
    onSelectHistory
}: MainWindowLayoutProps) {
    const { isInspectorOpen, toggleInspector } = useApp();

    return (
        <div className="h-screen w-screen overflow-hidden" style={{ background: 'var(--immersive-bg)' }}>
            {/* Window Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                className="relative h-[calc(100%-24px)] w-[calc(100%-24px)] m-3 flex immersive-window"
            >
                {/* Sidebar */}
                <Sidebar onSelectHistory={onSelectHistory} />

                {/* Main Content */}
                <main className="flex-1 flex flex-col bg-sys-bg-base overflow-hidden">
                    {/* Toolbar */}
                    <Toolbar onToggleInspector={toggleInspector} isInspectorOpen={isInspectorOpen} />

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </main>

                {/* Inspector Panel */}
                {isInspectorOpen && (
                    <InspectorPanel logs={logs} isGlowing={isProcessing} />
                )}
            </motion.div>
        </div>
    );
}

// ============================================
// Toolbar
// ============================================

interface ToolbarProps {
    onToggleInspector: () => void;
    isInspectorOpen: boolean;
}

function Toolbar({ onToggleInspector, isInspectorOpen }: ToolbarProps) {
    return (
        <header className="h-toolbar flex items-center justify-between px-4 border-b border-sys-separator glass-header">
            <div className="flex items-center gap-3">
                <h1 className="text-headline text-sys-text-primary">
                    Gemini File Search PoC
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleInspector}
                    className={`
            p-2 rounded-button transition-colors
            ${isInspectorOpen
                            ? 'bg-action-primary text-white'
                            : 'hover:bg-sys-bg-alt text-sys-text-secondary'
                        }
          `}
                    title={isInspectorOpen ? 'Inspectorを閉じる' : 'Inspectorを開く'}
                >
                    <PanelRight className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
