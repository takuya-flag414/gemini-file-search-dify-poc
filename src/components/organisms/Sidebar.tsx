import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
    SidebarHeader,
    KnowledgeStoresSection,
    WorkflowSection,
    SettingsSection,
    HistorySection,
    SidebarFooter,
} from '../molecules/sidebar';
import type { HistoryEntry, WorkflowInputs, FileSearchStore } from '../../types';

// ============================================
// Sidebar Component
// ============================================

interface SidebarProps {
    onSelectHistory?: (entry: HistoryEntry) => void;
    // Workflow props
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
    onSubmit,
    isProcessing = false,
    uploadedFileId,
    onFileUpload,
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

    const [isKnowledgeStoresOpen, setIsKnowledgeStoresOpen] = useState(true);
    const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    return (
        <aside className="w-sidebar h-full flex flex-col glass-sidebar border-r border-sys-separator">
            {/* App Title */}
            <SidebarHeader />

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
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

                {/* Workflow Section */}
                {onSubmit && (
                    <WorkflowSection
                        isOpen={isWorkflowOpen}
                        onToggle={() => setIsWorkflowOpen(!isWorkflowOpen)}
                        onSubmit={onSubmit}
                        isProcessing={isProcessing}
                        uploadedFileId={uploadedFileId}
                        onFileUpload={onFileUpload}
                    />
                )}

                {/* Settings Section */}
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

                {/* History Section */}
                <HistorySection
                    isOpen={isHistoryOpen}
                    onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
                    history={history}
                    onClearHistory={clearHistory}
                    onSelectHistory={onSelectHistory}
                />
            </div>

            {/* Mock Mode & Dark Mode Toggles */}
            <SidebarFooter
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
            />
        </aside>
    );
}
