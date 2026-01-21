/**
 * KnowledgeFinder Component
 * Phase A: macOS Finder-style file browser for Knowledge Stores
 * Supports Grid and List view modes with Metadata Wizard for uploads
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FileSearchStore, StoredFile, FinderViewMode } from '../../types';
import { FileCard } from '../atoms/FileCard';
import { FileListItem } from '../atoms/FileListItem';
import { MetadataWizard, type FileMetadata } from '../molecules/upload';

// ============================================
// Props
// ============================================

interface KnowledgeFinderProps {
    store: FileSearchStore;
    files: StoredFile[];
    isLoading: boolean;
    isUploading: boolean;
    onBack: () => void;
    onDeleteFile: (file: StoredFile) => Promise<void>;
    onUploadClick: () => void;
    /** New: Upload with metadata support */
    onUploadWithMetadata?: (file: File, metadata: Record<string, string>) => Promise<void>;
}

// ============================================
// View Toggle Button
// ============================================

interface ViewToggleProps {
    mode: FinderViewMode;
    onChange: (mode: FinderViewMode) => void;
}

function ViewToggle({ mode, onChange }: ViewToggleProps) {
    return (
        <div className="flex bg-sys-bg-alt rounded-lg p-1 gap-1">
            <button
                onClick={() => onChange('grid')}
                className={`
                    px-3 py-1.5 rounded-md text-footnote transition-all
                    ${mode === 'grid'
                        ? 'bg-sys-bg-base text-sys-text-primary shadow-sm'
                        : 'text-sys-text-secondary hover:text-sys-text-primary'
                    }
                `}
            >
                ⊞ Grid
            </button>
            <button
                onClick={() => onChange('list')}
                className={`
                    px-3 py-1.5 rounded-md text-footnote transition-all
                    ${mode === 'list'
                        ? 'bg-sys-bg-base text-sys-text-primary shadow-sm'
                        : 'text-sys-text-secondary hover:text-sys-text-primary'
                    }
                `}
            >
                ☰ List
            </button>
        </div>
    );
}

// ============================================
// Empty State
// ============================================

function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-16"
        >
            <div className="text-6xl opacity-50">📂</div>
            <h3 className="text-headline text-sys-text-secondary">
                ファイルがありません
            </h3>
            <p className="text-footnote text-sys-text-tertiary text-center max-w-xs">
                ① 右上のボタンからファイルをアップロードしてください
            </p>
        </motion.div>
    );
}

// ============================================
// Loading Skeleton
// ============================================

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="finder-card p-4 min-h-[140px] animate-pulse"
                >
                    <div className="w-12 h-12 bg-sys-bg-alt rounded-lg mx-auto mb-3" />
                    <div className="h-4 bg-sys-bg-alt rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-sys-bg-alt rounded w-1/2 mx-auto" />
                </div>
            ))}
        </div>
    );
}

// ============================================
// Component
// ============================================

export function KnowledgeFinder({
    store,
    files,
    isLoading,
    isUploading,
    onDeleteFile,
    onUploadClick,
    onUploadWithMetadata,
}: KnowledgeFinderProps) {
    const [viewMode, setViewMode] = useState<FinderViewMode>('grid');
    const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    // Open wizard for upload with metadata
    const handleUploadButtonClick = useCallback(() => {
        if (onUploadWithMetadata) {
            setIsWizardOpen(true);
        } else {
            // Fallback to original behavior
            onUploadClick();
        }
    }, [onUploadWithMetadata, onUploadClick]);

    // Handle upload with metadata from wizard
    const handleUploadWithMetadata = useCallback(async (file: File, metadata: FileMetadata) => {
        if (onUploadWithMetadata) {
            const metadataRecord: Record<string, string> = {};
            if (metadata.company) metadataRecord.metadata_company = metadata.company;
            if (metadata.department) metadataRecord.metadata_department = metadata.department;
            if (metadata.filetype) metadataRecord.metadata_filetype = metadata.filetype;
            await onUploadWithMetadata(file, metadataRecord);
        }
    }, [onUploadWithMetadata]);

    const handleSelectFile = useCallback((file: StoredFile) => {
        setSelectedFile(prev => prev?.documentId === file.documentId ? null : file);
    }, []);

    const handleDeleteFile = useCallback(async (file: StoredFile) => {
        if (window.confirm(`「${file.displayName}」を削除しますか？`)) {
            await onDeleteFile(file);
            if (selectedFile?.documentId === file.documentId) {
                setSelectedFile(null);
            }
        }
    }, [onDeleteFile, selectedFile]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full bg-sys-bg-base"
        >
            {/* Header / Toolbar */}
            <div className="
                flex items-center justify-between gap-4
                px-6 py-4 border-b border-sys-separator
                glass-header
            ">
                {/* Left: Back button + Breadcrumb */}
                <div className="flex items-center gap-3">

                    <div className="flex items-center gap-2 text-subheadline">

                        <span className="text-sys-text-primary font-medium">
                            {store.displayName}
                        </span>
                    </div>
                </div>



                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <ViewToggle mode={viewMode} onChange={setViewMode} />

                    <button
                        onClick={handleUploadButtonClick}
                        disabled={isUploading}
                        className="
                            px-4 py-2 rounded-lg
                            bg-action-primary text-white
                            text-footnote font-medium
                            hover:bg-action-hover transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center gap-2
                        "
                    >
                        {isUploading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                アップロード中...
                            </>
                        ) : (
                            <>
                                <span>+</span>
                                アップロード
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : files.length === 0 ? (
                    <EmptyState />
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                        <AnimatePresence mode="popLayout">
                            {files.map(file => (
                                <FileCard
                                    key={file.documentId}
                                    file={file}
                                    isSelected={selectedFile?.documentId === file.documentId}
                                    onSelect={handleSelectFile}
                                    onDelete={handleDeleteFile}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* List View */
                    <div className="flex flex-col">
                        {/* List Header */}
                        <div className="
                            flex items-center gap-4 px-4 py-2
                            border-b border-sys-separator
                            text-caption-1 text-sys-text-tertiary uppercase
                        ">
                            <div className="w-8" /> {/* Icon spacer */}
                            <div className="flex-1">名前</div>
                            <div className="w-20 text-right">サイズ</div>
                            <div className="w-24 text-right">日付</div>
                            <div className="w-16 text-right">状態</div>
                            <div className="w-7" /> {/* Delete button spacer */}
                        </div>

                        {/* List Items */}
                        <AnimatePresence mode="popLayout">
                            {files.map(file => (
                                <FileListItem
                                    key={file.documentId}
                                    file={file}
                                    isSelected={selectedFile?.documentId === file.documentId}
                                    onSelect={handleSelectFile}
                                    onDelete={handleDeleteFile}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>



            {/* Metadata Wizard Modal */}
            <MetadataWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onUpload={handleUploadWithMetadata}
                isUploading={isUploading}
            />
        </motion.div>
    );
}

export default KnowledgeFinder;
