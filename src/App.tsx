import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainWindowLayout } from './components/templates/MainWindowLayout';
import { WizardCard } from './components/organisms/WizardCard';
import { ChatTimeline } from './components/organisms/ChatTimeline';
import { useDifyStream } from './hooks';
import type { WorkflowInputs, HistoryEntry } from './types';

// ============================================
// Main App Content
// ============================================

function AppContent() {
  const { isConfigured } = useApp();
  const {
    messages,
    logs,
    thinkingSteps,
    isProcessing,
    error,
    sendMessage,
    uploadFile,
  } = useDifyStream();

  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();

  // Handle file upload
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

  return (
    <MainWindowLayout
      logs={logs}
      isProcessing={isProcessing}
      onSelectHistory={handleSelectHistory}
    >
      <div className="flex flex-col h-full">
        {/* Configuration Warning */}
        {!isConfigured && (
          <div className="p-4 bg-feedback-warning/10 border-b border-feedback-warning/20">
            <p className="text-footnote text-feedback-warning text-center">
              ⚠️ API Key を設定してください（左サイドバーの「設定」から入力）
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-feedback-danger/10 border-b border-feedback-danger/20">
            <p className="text-footnote text-feedback-danger text-center">
              ❌ {error}
            </p>
          </div>
        )}

        {/* Wizard Card */}
        <WizardCard
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          uploadedFileId={uploadedFileId}
          onFileUpload={handleFileUpload}
        />

        {/* Chat Timeline */}
        {(messages.length > 0 || thinkingSteps.length > 0) && (
          <div className="flex-1 border-t border-sys-separator">
            <ChatTimeline
              messages={messages}
              thinkingSteps={thinkingSteps}
            />
          </div>
        )}
      </div>
    </MainWindowLayout>
  );
}

// ============================================
// App with Provider
// ============================================

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
