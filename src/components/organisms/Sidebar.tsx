import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
    KnowledgeStoresSection,
    // WorkflowSection, // Hidden for new layout - to be moved to right panel later
    SettingsSection,
    HistorySection,
    SidebarFooter,
    TrafficLights,
} from '../molecules/sidebar';
import type { HistoryEntry, WorkflowInputs, FileSearchStore } from '../../types';

// ============================================
// Sidebar Component (3-Layer Structure)
// ============================================
// Level 1: SOURCES (Top) - Knowledge Stores list
// Level 2: VERIFICATION (Middle) - History logs
// Level 3: SYSTEM (Bottom) - Settings

interface SidebarProps {
    onSelectHistory?: (entry: HistoryEntry) => void;
    // Workflow props (hidden but kept for future use)
    onSubmit?: (inputs: WorkflowInputs, query: string) => void;
    isProcessing?: boolean;
    uploadedFileId?: string;
    onFileUpload?: (file: File) => Promise<string | null>;
    // Knowledge Stores props (Phase A)
    stores?: FileSearchStore[];
    currentStore?: FileSearchStore | null;
    onStoreSelect?: (storeName: string) => void;
    onCreateStore?: (displayName: string) => Promise<void>;
    onDeleteStore?: (storeName: string) => Promise<void>;
    isLoadingStores?: boolean;
}

export function Sidebar({
    onSelectHistory,
    // Workflow props - kept but unused in current layout
    // onSubmit,
    // isProcessing = false,
    // uploadedFileId,
    // onFileUpload,
    // Knowledge Stores (Phase A)
    stores = [],
    currentStore,
    onStoreSelect,
    onCreateStore,
    onDeleteStore,
    isLoadingStores = false,
}: SidebarProps) {
    const {
        config,
        updateConfig,
        history,
        clearHistory,
        isDarkMode,
        toggleDarkMode
    } = useApp();

    // KnowledgeStores is always open in the new layout (Finder-style)
    const [isKnowledgeStoresOpen, setIsKnowledgeStoresOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    return (
        <div className="h-full flex flex-col text-sm text-sys-text-primary">
            {/* Window Controls Area (Traffic Lights) */}
            <div className="p-4 pb-2">
                <TrafficLights />
            </div>

            {/* Level 1: SOURCES (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
                <div className="mb-2 px-2 text-xs font-semibold text-sys-text-tertiary uppercase tracking-wider">
                    Sources
                </div>
                <KnowledgeStoresSection
                    isOpen={isKnowledgeStoresOpen}
                    onToggle={() => setIsKnowledgeStoresOpen(!isKnowledgeStoresOpen)}
                    stores={stores}
                    currentStore={currentStore}
                    onStoreSelect={onStoreSelect}
                    onCreateStore={onCreateStore}
                    onDeleteStore={onDeleteStore}
                    isLoadingStores={isLoadingStores}
                />

                {/* Level 2: VERIFICATION */}
                <div className="mt-6 mb-2 px-2 text-xs font-semibold text-sys-text-tertiary uppercase tracking-wider">
                    Verification
                </div>
                <HistorySection
                    isOpen={isHistoryOpen}
                    onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
                    history={history}
                    onClearHistory={clearHistory}
                    onSelectHistory={onSelectHistory}
                />
            </div>

            {/* Level 3: SYSTEM (Fixed Bottom) */}
            <div className="mt-auto border-t border-sys-separator bg-black/5 dark:bg-white/5 px-2 py-3 backdrop-blur-md">
                <div className="px-2 text-xs font-semibold text-sys-text-tertiary uppercase tracking-wider mb-1">
                    System
                </div>
                <SettingsSection
                    isOpen={isSettingsOpen}
                    onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
                    apiKey={config.apiKey}
                    workflowApiKey={config.workflowApiKey}
                    baseUrl={config.baseUrl}
                    onApiKeyChange={(value) => updateConfig({ apiKey: value })}
                    onWorkflowApiKeyChange={(value) => updateConfig({ workflowApiKey: value })}
                    onBaseUrlChange={(value) => updateConfig({ baseUrl: value })}
                />

                {/* Dark Mode Toggle */}
                <SidebarFooter
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={toggleDarkMode}
                />
            </div>

            {/* WorkflowSection is hidden in the new layout
             * It will be moved to the right panel's "Workflow Info" tab in a future update
             * Props are still available: onSubmit, isProcessing, uploadedFileId, onFileUpload
             */}
        </div>
    );
}
