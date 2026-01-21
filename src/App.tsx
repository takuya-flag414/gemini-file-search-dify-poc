import { useState, useCallback, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { WorkflowLogProvider, useWorkflowLog } from './context/WorkflowLogContext';
import { MainWindowLayout } from './components/templates/MainWindowLayout';
import { KnowledgeFinder } from './components/organisms/KnowledgeFinder';
import { useDifyStream, useGeminiFileSystem } from './hooks';
import type { WorkflowInputs, HistoryEntry, AppViewMode, StoredFile } from './types';

// ============================================
// Main App Content
// ============================================

function AppContent() {
  const { isConfigured } = useApp();
  const { logs: workflowLogs } = useWorkflowLog();
  const {
    messages,
    logs: streamLogs,
    thinkingSteps,
    isProcessing,
    error,
    sendMessage,
    uploadFile,
  } = useDifyStream();

  // Combine workflow logs with stream logs (workflow logs first, sorted by timestamp)
  const logs = [...workflowLogs, ...streamLogs].sort((a, b) => b.timestamp - a.timestamp);

  // Phase A: File System Hook
  const {
    stores,
    currentStore,
    files,
    isLoadingStores,
    isLoadingFiles,
    isUploading,
    error: fsError,
    selectStore,
    createStore,
    uploadFile: uploadToStore,
    deleteFile: deleteFromStore,
  } = useGeminiFileSystem();

  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<AppViewMode>('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload (for workflow)
  const handleFileUpload = useCallback(async (file: File): Promise<string | null> => {
    const fileId = await uploadFile(file);
    if (fileId) {
      setUploadedFileId(fileId);
    }
    return fileId;
  }, [uploadFile]);

  // Handle workflow submit
  const handleSubmit = useCallback(async (inputs: WorkflowInputs, query: string) => {
    await sendMessage(inputs, query);
    setUploadedFileId(undefined); // Reset after submission
  }, [sendMessage]);

  // Handle history selection
  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    // Could restore conversation from history
    console.log('Selected history entry:', entry);
  }, []);

  // Handle store selection -> switch to Finder mode
  const handleStoreSelect = useCallback((storeName: string) => {
    selectStore(storeName);
    setViewMode('finder');
  }, [selectStore]);

  // Handle back from Finder -> switch to Chat mode
  const handleBackToChat = useCallback(() => {
    setViewMode('chat');
  }, []);

  // Handle create store
  const handleCreateStore = useCallback(async (displayName: string) => {
    await createStore(displayName);
  }, [createStore]);

  // Handle file delete in Finder
  const handleDeleteFile = useCallback(async (file: StoredFile) => {
    await deleteFromStore(file.documentId);
  }, [deleteFromStore]);

  // Handle search from ChatPanel (Context Injection)
  const handleSearchSubmit = useCallback(async (query: string, storeId: string) => {
    // Mock mode: log to console
    console.log('[Mock] Searching in Store:', storeId);
    console.log('[Mock] Query:', query);

    // Execute search via workflow inputs
    const inputs: WorkflowInputs = {
      option: 'ファイル内を検索する',
      file_search_store_name: storeId,
    };
    await sendMessage(inputs, query);
  }, [sendMessage]);

  // Handle upload click in Finder
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadToStore(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadToStore]);

  // Handle upload with metadata (from Wizard)
  const handleUploadWithMetadata = useCallback(async (file: File, metadata: Record<string, string>) => {
    await uploadToStore(file, metadata);
  }, [uploadToStore]);

  return (
    <>
      <MainWindowLayout
        logs={logs}
        isProcessing={isProcessing}
        onSelectHistory={handleSelectHistory}
        onSubmit={handleSubmit}
        uploadedFileId={uploadedFileId}
        onFileUpload={handleFileUpload}
        // Phase A: Knowledge Stores props
        stores={stores}
        currentStore={currentStore}
        onStoreSelect={handleStoreSelect}
        onCreateStore={handleCreateStore}
        isLoadingStores={isLoadingStores}
        // Chat Panel props
        messages={messages}
        thinkingSteps={thinkingSteps}
        onSearchSubmit={handleSearchSubmit}
      >
        <div className="flex flex-col h-full">
          {/* Configuration Warning */}
          {!isConfigured && viewMode === 'chat' && (
            <div className="p-4 bg-feedback-warning/10 border-b border-feedback-warning/20">
              <p className="text-footnote text-feedback-warning text-center">
                ⚠️ API Key を設定してください（左サイドバーの「設定」から入力）
              </p>
            </div>
          )}

          {/* Error Message */}
          {(error || fsError) && (
            <div className="p-4 bg-feedback-danger/10 border-b border-feedback-danger/20">
              <p className="text-footnote text-feedback-danger text-center">
                ❌ {error || fsError}
              </p>
            </div>
          )}

          {/* Main Content Area */}
          {viewMode === 'finder' && currentStore ? (
            /* Knowledge Finder Mode */
            <KnowledgeFinder
              store={currentStore}
              files={files}
              isLoading={isLoadingFiles}
              isUploading={isUploading}
              onBack={handleBackToChat}
              onDeleteFile={handleDeleteFile}
              onUploadClick={handleUploadClick}
              onUploadWithMetadata={handleUploadWithMetadata}
            />
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-sys-text-tertiary space-y-4">
                <p className="text-title-2">👋 ようこそ</p>
                <p className="text-body">
                  左サイドバーの「Knowledge Stores」からストアを選択するか、<br />
                  「ワークフロー」から操作を開始してください
                </p>
              </div>
            </div>
          )}
        </div>
      </MainWindowLayout>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.xml"
      />
    </>
  );
}

// ============================================
// App with Provider
// ============================================

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <WorkflowLogProvider>
          <AppContent />
        </WorkflowLogProvider>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;

