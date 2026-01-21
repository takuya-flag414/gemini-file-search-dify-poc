import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Upload, AlertTriangle } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { Input, Button, Select } from '../../atoms';
import { FileDropZone } from '../FileDropZone';
import { useApp } from '../../../context/AppContext';
import type { WorkflowInputs, OperationMode } from '../../../types';
import { OPERATION_MODES, METADATA_OPTIONS } from '../../../types';

interface WorkflowSectionProps {
    isOpen: boolean;
    onToggle: () => void;
    onSubmit: (inputs: WorkflowInputs, query: string) => void;
    isProcessing?: boolean;
    uploadedFileId?: string;
    onFileUpload?: (file: File) => Promise<string | null>;
}

export function WorkflowSection({
    isOpen,
    onToggle,
    onSubmit,
    isProcessing = false,
    uploadedFileId,
    onFileUpload,
}: WorkflowSectionProps) {
    // Workflow state
    const [selectedMode, setSelectedMode] = useState<OperationMode>('ファイル内を検索する');
    const [storeName, setStoreName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [documentId, setDocumentId] = useState('');
    const [query, setQuery] = useState('');
    const [metadataCompany, setMetadataCompany] = useState('');
    const [metadataDepartment, setMetadataDepartment] = useState('');
    const [metadataFiletype, setMetadataFiletype] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [currentFileId, setCurrentFileId] = useState<string | null>(uploadedFileId || null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    // Get current mode config
    const modeConfig = useMemo(() =>
        OPERATION_MODES.find(m => m.value === selectedMode)!,
        [selectedMode]
    );

    // Check if form is ready
    const isReady = useMemo(() => {
        if (selectedMode === 'ファイル内を検索する') {
            return storeName.trim() && query.trim();
        }
        if (selectedMode === 'ファイルをアップロードする？') {
            return (
                storeName.trim() &&
                currentFileId &&
                metadataCompany &&
                metadataDepartment &&
                metadataFiletype
            );
        }
        if (selectedMode === 'ファイル検索ストアを作成する？') {
            return displayName.trim();
        }
        if (selectedMode === 'ファイルを削除する？') {
            return storeName.trim() && documentId.trim();
        }
        if (selectedMode === 'ファイル検索ストアを削除する？') {
            return storeName.trim();
        }
        if (selectedMode === 'ファイル検索ストアの一覧を表示する？') {
            return true;
        }
        if (selectedMode === 'ストア内のファイルの一覧を表示する？') {
            return storeName.trim();
        }
        return false;
    }, [selectedMode, storeName, query, displayName, documentId, currentFileId]);

    // Handle file drop
    const handleFileDrop = useCallback(async (file: File) => {
        if (!onFileUpload) return;
        setIsUploading(true);
        try {
            const fileId = await onFileUpload(file);
            if (fileId) {
                setCurrentFileId(fileId);
                setUploadedFileName(file.name);
            }
        } finally {
            setIsUploading(false);
        }
    }, [onFileUpload]);

    // Get openChatPanel from context
    const { openChatPanel } = useApp();

    // Handle submit
    const handleSubmit = () => {
        const inputs: WorkflowInputs = {
            option: selectedMode,
        };

        if (modeConfig.requiresStoreName) {
            inputs.file_search_store_name = storeName;
        }

        if (selectedMode === 'ファイル検索ストアを作成する？') {
            inputs.display_name = displayName;
        }

        if (selectedMode === 'ファイルを削除する？') {
            inputs.document_id = documentId;
        }

        if (selectedMode === 'ファイルをアップロードする？' && currentFileId) {
            inputs.file = {
                type: 'document',
                transfer_method: 'local_file',
                upload_file_id: currentFileId,
            };
            inputs.display_name = uploadedFileName || 'uploaded_file';
            if (metadataCompany) inputs.metadata_company = metadataCompany;
            if (metadataDepartment) inputs.metadata_department = metadataDepartment;
            if (metadataFiletype) inputs.metadata_filetype = metadataFiletype;
        }

        // Open chat panel automatically on workflow execution
        openChatPanel();
        onSubmit(inputs, query || '実行');
    };

    // Animation variants
    const fieldVariants = {
        hidden: { opacity: 0, height: 0, marginTop: 0 },
        visible: { opacity: 1, height: 'auto', marginTop: 12 },
    };

    return (
        <SidebarSection
            title="ワークフロー（上級者向け）"
            icon={<Sparkles className="w-4 h-4 text-action-primary" />}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-4">
                {/* Step 1: Mode Selection */}
                <Select
                    label="① 操作モード"
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as OperationMode)}
                    options={OPERATION_MODES.map(m => ({ value: m.value, label: m.label }))}
                />

                {/* Step 2: Dynamic Fields */}
                <AnimatePresence mode="wait">
                    {(modeConfig.requiresStoreName || selectedMode === 'ファイル検索ストアを作成する？' || selectedMode === 'ファイルを削除する？' || selectedMode === 'ファイル内を検索する' || (modeConfig.requiresFile && onFileUpload)) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <div className="text-caption-1 font-medium text-sys-text-secondary border-b border-sys-separator pb-1 mb-2">
                                ② 設定
                            </div>

                            {/* Store Name Field */}
                            {modeConfig.requiresStoreName && (
                                <Input
                                    label="ストア名"
                                    placeholder="fileSearchStores/xxx"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    hint="ストアのリソース名"
                                />
                            )}

                            {/* Display Name (for create store) */}
                            {selectedMode === 'ファイル検索ストアを作成する？' && (
                                <Input
                                    label="表示名"
                                    placeholder="新しいストアの名前"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            )}

                            {/* Document ID (for delete file) */}
                            {selectedMode === 'ファイルを削除する？' && (
                                <Input
                                    label="ドキュメントID"
                                    placeholder="documents/xxx"
                                    value={documentId}
                                    onChange={(e) => setDocumentId(e.target.value)}
                                />
                            )}

                            {/* Query (for search) */}
                            {selectedMode === 'ファイル内を検索する' && (
                                <Input
                                    label="検索クエリ"
                                    placeholder="検索したい内容..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            )}

                            {/* File Upload (for upload mode) */}
                            {modeConfig.requiresFile && onFileUpload && (
                                <motion.div
                                    key="file-upload"
                                    variants={fieldVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <FileDropZone
                                        onFileDrop={handleFileDrop}
                                        isUploading={isUploading}
                                        uploadedFileName={uploadedFileName}
                                    />

                                    {/* Metadata Fields */}
                                    {currentFileId && (
                                        <div className="mt-3 space-y-2">
                                            <Select
                                                label="会社"
                                                value={metadataCompany}
                                                onChange={(e) => setMetadataCompany(e.target.value)}
                                                options={[
                                                    { value: '', label: '選択...' },
                                                    ...METADATA_OPTIONS.company.map(v => ({ value: v, label: v }))
                                                ]}
                                            />
                                            <Select
                                                label="部署"
                                                value={metadataDepartment}
                                                onChange={(e) => setMetadataDepartment(e.target.value)}
                                                options={[
                                                    { value: '', label: '選択...' },
                                                    ...METADATA_OPTIONS.department.map(v => ({ value: v, label: v }))
                                                ]}
                                            />
                                            <Select
                                                label="ファイル種別"
                                                value={metadataFiletype}
                                                onChange={(e) => setMetadataFiletype(e.target.value)}
                                                options={[
                                                    { value: '', label: '選択...' },
                                                    ...METADATA_OPTIONS.filetype.map(v => ({ value: v, label: v }))
                                                ]}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Danger Warning */}
                {modeConfig.isDangerous && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 p-2 bg-feedback-danger/10 rounded-card text-footnote"
                    >
                        <AlertTriangle className="w-3.5 h-3.5 text-feedback-danger flex-shrink-0" />
                        <span className="text-feedback-danger">この操作は元に戻せません</span>
                    </motion.div>
                )}

                {/* Step 3: Submit Button */}
                <Button
                    variant={modeConfig.isDangerous ? 'danger' : 'primary'}
                    size="md"
                    className="w-full"
                    disabled={!isReady || isProcessing}
                    isLoading={isProcessing}
                    glowing={Boolean(isReady) && !isProcessing}
                    onClick={handleSubmit}
                >
                    {modeConfig.isDangerous ? (
                        <>
                            <AlertTriangle className="w-4 h-4" />
                            ③ 実行する
                        </>
                    ) : selectedMode === 'ファイルをアップロードする？' ? (
                        <>
                            <Upload className="w-4 h-4" />
                            ③ アップロード
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            ③ 実行する
                        </>
                    )}
                </Button>
            </div>
        </SidebarSection>
    );
}
