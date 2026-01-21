import type { ReactNode } from 'react';
import { PanelRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../organisms/Sidebar';
import { InspectorPanel } from '../organisms/InspectorPanel';
import { ChatPanel } from '../organisms/ChatPanel';
import type { LogEntry, HistoryEntry, WorkflowInputs, FileSearchStore, ChatMessage } from '../../types';

// ============================================
// Main Window Layout (3-Pane)
// ============================================

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
    const { isInspectorOpen, toggleInspector, isChatPanelOpen, toggleChatPanel, isChatExpanded } = useApp();

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

                {/* Main Content - Hidden when chat is expanded */}
                {!isChatExpanded && (
                    <main className="flex-1 flex flex-col bg-sys-bg-base overflow-hidden">
                        {/* Toolbar */}
                        <Toolbar
                            onToggleChatPanel={toggleChatPanel}
                            isChatPanelOpen={isChatPanelOpen}
                            onToggleInspector={toggleInspector}
                            isInspectorOpen={isInspectorOpen}
                        />

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </main>
                )}

                {/* Chat Panel (3rd column) */}
                {isChatPanelOpen && (
                    <ChatPanel
                        messages={messages}
                        thinkingSteps={thinkingSteps}
                        isProcessing={isProcessing}
                        onSearchSubmit={onSearchSubmit}
                    />
                )}

                {/* Inspector Panel (4th column) */}
                {isInspectorOpen && (
                    <InspectorPanel logs={logs} />
                )}
            </motion.div>
        </div>
    );
}

// ============================================
// Toolbar
// ============================================

interface ToolbarProps {
    onToggleChatPanel: () => void;
    isChatPanelOpen: boolean;
    onToggleInspector: () => void;
    isInspectorOpen: boolean;
}

function Toolbar({ onToggleChatPanel, isChatPanelOpen, onToggleInspector, isInspectorOpen }: ToolbarProps) {
    const { selectedStoreName } = useApp();

    return (
        <header className="h-toolbar flex items-center justify-between px-4 border-b border-sys-separator glass-header">
            <div className="flex items-center gap-3">
                <h1 className="text-headline text-sys-text-primary">
                    Gemini File Search PoC
                </h1>
            </div>

            <div className="flex items-center gap-2">
                {/* Chat Panel Toggle */}
                <button
                    onClick={onToggleChatPanel}
                    className={`
                        rounded-button transition-all duration-200 flex items-center
                        ${selectedStoreName && !isChatPanelOpen
                            ? 'min-h-[32px] px-3 gap-2 bg-action-primary text-white shadow-md hover:scale-105'
                            : `p-2 ${isChatPanelOpen ? 'bg-action-primary text-white' : 'hover:bg-sys-bg-alt text-sys-text-secondary'}`
                        }
                    `}
                    title={isChatPanelOpen ? 'Chatを閉じる' : 'Chatを開く'}
                >
                    <MessageSquare className="w-4 h-4" />
                    {selectedStoreName && !isChatPanelOpen && (
                        <span className="text-footnote font-medium pt-0.5">
                            ② {selectedStoreName} でチャットを開始
                        </span>
                    )}
                </button>

                {/* Inspector Toggle */}
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
