import type { ReactNode } from 'react';
import { PanelRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../organisms/Sidebar';
import { RightPanelContent } from '../organisms/RightPanelContent';
import type { LogEntry, HistoryEntry, WorkflowInputs, FileSearchStore, ChatMessage } from '../../types';

// ============================================
// Main Window Layout (3-Column Triptych)
// ============================================

// Spring animation config for panels
const panelSpring = {
    type: 'spring' as const,
    stiffness: 250,
    damping: 25,
};

interface MainWindowLayoutProps {
    children: ReactNode;
    logs: LogEntry[];
    isProcessing?: boolean;
    onSelectHistory?: (entry: HistoryEntry) => void;
    // Workflow props for Sidebar
    onSubmit?: (inputs: WorkflowInputs, query: string) => void;
    uploadedFileId?: string;
    onFileUpload?: (file: File) => Promise<string | null>;
    // Knowledge Stores props (Phase A)
    stores?: FileSearchStore[];
    currentStore?: FileSearchStore | null;
    onStoreSelect?: (storeName: string) => void;
    onCreateStore?: (displayName: string) => Promise<void>;
    onDeleteStore?: (storeName: string) => Promise<void>;
    isLoadingStores?: boolean;
    // Chat Panel props
    messages?: ChatMessage[];
    thinkingSteps?: string[];
    onSearchSubmit?: (query: string, storeId: string) => void;
}

export function MainWindowLayout({
    children,
    logs,
    isProcessing = false,
    onSelectHistory,
    onSubmit,
    uploadedFileId,
    onFileUpload,
    // Knowledge Stores (Phase A)
    stores,
    currentStore,
    onStoreSelect,
    onCreateStore,
    onDeleteStore,
    isLoadingStores,
    // Chat Panel
    messages = [],
    thinkingSteps = [],
    onSearchSubmit,
}: MainWindowLayoutProps) {
    const { isRightPanelOpen, toggleRightPanel, isRightPanelExpanded } = useApp();

    return (
        // Background container with wallpaper
        <div
            className="h-screen w-screen overflow-hidden"
            style={{ background: 'var(--immersive-bg)' }}
        >
            {/* 3-Column Triptych Layout Container */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex gap-4 p-4"
            >
                {/* 1. Left: Navigation (Sidebar) */}
                <motion.aside
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={panelSpring}
                    className="w-[260px] flex-shrink-0 rounded-2xl glass-sidebar border border-white/20 shadow-xl overflow-hidden flex flex-col"
                >
                    <Sidebar
                        onSelectHistory={onSelectHistory}
                        onSubmit={onSubmit}
                        isProcessing={isProcessing}
                        uploadedFileId={uploadedFileId}
                        onFileUpload={onFileUpload}
                        // Knowledge Stores (Phase A)
                        stores={stores}
                        currentStore={currentStore}
                        onStoreSelect={onStoreSelect}
                        onCreateStore={onCreateStore}
                        onDeleteStore={onDeleteStore}
                        isLoadingStores={isLoadingStores}
                    />
                </motion.aside>

                {/* 2. Center: Knowledge Canvas (Main) - Hidden when chat is expanded */}
                {!isRightPanelExpanded && (
                    <motion.main
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={panelSpring}
                        className="flex-1 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden relative flex flex-col"
                    >
                        {/* Toolbar */}
                        <Toolbar
                            onToggleRightPanel={toggleRightPanel}
                            isRightPanelOpen={isRightPanelOpen}
                        />

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </motion.main>
                )}

                {/* 3. Right: Inspector & Chat (with Tab Switching) */}
                {isRightPanelOpen && (
                    <motion.aside
                        initial={{ opacity: 0, scale: 0.95, width: 0 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            width: isRightPanelExpanded ? 'auto' : 320,
                            flex: isRightPanelExpanded ? 1 : 'none'
                        }}
                        exit={{ opacity: 0, scale: 0.95, width: 0 }}
                        transition={panelSpring}
                        className="flex-shrink-0 rounded-2xl glass-hud border border-white/20 shadow-xl overflow-hidden flex flex-col"
                        style={{ minWidth: isRightPanelExpanded ? 0 : 320 }}
                    >
                        <RightPanelContent
                            messages={messages}
                            thinkingSteps={thinkingSteps}
                            isProcessing={isProcessing}
                            onSearchSubmit={onSearchSubmit}
                            logs={logs}
                        />
                    </motion.aside>
                )}
            </motion.div>
        </div>
    );
}

// ============================================
// Toolbar
// ============================================

interface ToolbarProps {
    onToggleRightPanel: () => void;
    isRightPanelOpen: boolean;
}

function Toolbar({ onToggleRightPanel, isRightPanelOpen }: ToolbarProps) {
    const { selectedStoreName } = useApp();

    return (
        <header className="h-toolbar flex items-center justify-between px-4 border-b border-sys-separator glass-header">
            <div className="flex items-center gap-3">

            </div>

            <div className="flex items-center gap-2">
                {/* Right Panel Toggle */}
                <button
                    onClick={onToggleRightPanel}
                    className={`
                        rounded-button transition-all duration-200 flex items-center
                        ${selectedStoreName && !isRightPanelOpen
                            ? 'min-h-[32px] px-3 gap-2 bg-action-primary text-white shadow-md hover:scale-105'
                            : `p-2 ${isRightPanelOpen ? 'bg-action-primary text-white' : 'hover:bg-sys-bg-alt text-sys-text-secondary'}`
                        }
                    `}
                    title={isRightPanelOpen ? 'パネルを閉じる' : 'パネルを開く'}
                >
                    <PanelRight className="w-4 h-4" />
                    {selectedStoreName && !isRightPanelOpen && (
                        <span className="text-footnote font-medium pt-0.5">
                            ② {selectedStoreName} でチャットを開始
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
