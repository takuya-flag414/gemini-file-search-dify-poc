import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, AlertTriangle, Sparkles } from 'lucide-react';
import { Button, Input, Select } from '../atoms';
import { FileDropZone } from '../molecules/FileDropZone';
import type {
    WorkflowInputs,
    OperationMode,
} from '../../types';
import { OPERATION_MODES, METADATA_OPTIONS } from '../../types';

// ============================================
// Wizard Card Component
// ============================================

interface WizardCardProps {
    onSubmit: (inputs: WorkflowInputs, query: string) => void;
    isProcessing: boolean;
    uploadedFileId?: string;
    onFileUpload: (file: File) => Promise<string | null>;
}

export function WizardCard({
    onSubmit,
    isProcessing,
    uploadedFileId,
    onFileUpload
}: WizardCardProps) {
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
            return storeName.trim() && currentFileId;
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
            // display_name is required for file upload
            inputs.display_name = uploadedFileName || 'uploaded_file';
            if (metadataCompany) inputs.metadata_company = metadataCompany;
            if (metadataDepartment) inputs.metadata_department = metadataDepartment;
            if (metadataFiletype) inputs.metadata_filetype = metadataFiletype;
        }

        onSubmit(inputs, query || '実行');
    };

    // Animation variants
    const fieldVariants = {
        hidden: { opacity: 0, height: 0, marginTop: 0 },
        visible: { opacity: 1, height: 'auto', marginTop: 16 },
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <motion.div
                layout
                className="bg-sys-bg-base rounded-panel shadow-panel border border-sys-separator p-6"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-card bg-action-primary/10">
                        <Sparkles className="w-5 h-5 text-action-primary" />
                    </div>
                    <div>
                        <h2 className="text-title-2 text-sys-text-primary">ワークフロー実行</h2>
                        <p className="text-footnote text-sys-text-secondary">操作モードを選択してパラメータを入力してください</p>
                    </div>
                </div>

                {/* Mode Selection */}
                <Select
                    label="操作モード"
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as OperationMode)}
                    options={OPERATION_MODES.map(m => ({ value: m.value, label: m.label }))}
                />

                {/* Dynamic Fields */}
                <AnimatePresence mode="wait">
                    {/* Store Name Field */}
                    {modeConfig.requiresStoreName && (
                        <motion.div
                            key="store-name"
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <Input
                                label="ストア名"
                                placeholder="fileSearchStores/xxxxxxxx"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                hint="Gemini File Search ストアのリソース名"
                            />
                        </motion.div>
                    )}

                    {/* Display Name (for create store) */}
                    {selectedMode === 'ファイル検索ストアを作成する？' && (
                        <motion.div
                            key="display-name"
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <Input
                                label="表示名"
                                placeholder="新しいストアの名前"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </motion.div>
                    )}

                    {/* Document ID (for delete file) */}
                    {selectedMode === 'ファイルを削除する？' && (
                        <motion.div
                            key="document-id"
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <Input
                                label="ドキュメントID"
                                placeholder="documents/xxxxxxxx"
                                value={documentId}
                                onChange={(e) => setDocumentId(e.target.value)}
                            />
                        </motion.div>
                    )}

                    {/* Query (for search) */}
                    {selectedMode === 'ファイル内を検索する' && (
                        <motion.div
                            key="query"
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <Input
                                label="検索クエリ"
                                placeholder="検索したい内容を入力..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </motion.div>
                    )}

                    {/* File Upload (for upload mode) */}
                    {modeConfig.requiresFile && (
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
                                <div className="mt-4 grid grid-cols-3 gap-3">
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
                </AnimatePresence>

                {/* Danger Warning */}
                {modeConfig.isDangerous && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 flex items-center gap-2 p-3 bg-feedback-danger/10 rounded-card"
                    >
                        <AlertTriangle className="w-4 h-4 text-feedback-danger flex-shrink-0" />
                        <p className="text-footnote text-feedback-danger">
                            この操作は元に戻せません。実行前に内容を確認してください。
                        </p>
                    </motion.div>
                )}

                {/* Submit Button */}
                <div className="mt-6">
                    <Button
                        variant={modeConfig.isDangerous ? 'danger' : 'primary'}
                        size="lg"
                        className="w-full"
                        disabled={!isReady || isProcessing}
                        isLoading={isProcessing}
                        glowing={Boolean(isReady) && !isProcessing}
                        onClick={handleSubmit}
                    >
                        {modeConfig.isDangerous ? (
                            <>
                                <AlertTriangle className="w-4 h-4" />
                                実行する
                            </>
                        ) : selectedMode === 'ファイルをアップロードする？' ? (
                            <>
                                <Upload className="w-4 h-4" />
                                アップロードして実行
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                実行する
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
