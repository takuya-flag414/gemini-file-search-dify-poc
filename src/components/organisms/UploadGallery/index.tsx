/**
 * UploadGallery Component
 * 複数ファイルアップロードのメインモーダルコンテナ
 * Finderライクな「一覧性」と「詳細設定」を両立するUI
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FolderUp } from 'lucide-react';
import { Button } from '../../atoms';
import { FileDeck } from './FileDeck';
import { InspectorPane } from './InspectorPane';
import { UploadProgress } from './UploadProgress';
import { useUploadGallery } from '../../../hooks/useUploadGallery';
import type { UseGeminiFileSystemReturn } from '../../../hooks/useGeminiFileSystem';

// ============================================
// Types
// ============================================

interface UploadGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    fileSystem: UseGeminiFileSystemReturn;
    onUploadComplete?: () => void;
}

// ============================================
// Animation Variants
// ============================================

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const panelVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        y: 40,
        scale: 0.97,
        transition: { duration: 0.2 },
    },
};

// ============================================
// Component
// ============================================

export function UploadGallery({
    isOpen,
    onClose,
    fileSystem,
    onUploadComplete,
}: UploadGalleryProps) {
    const gallery = useUploadGallery(fileSystem);

    // ESC キーでクローズ
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !gallery.isUploading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, gallery.isUploading]);

    // アップロード実行
    const handleUpload = useCallback(async () => {
        const result = await gallery.startUpload();
        onUploadComplete?.();

        // 全て成功した場合、少し待ってから自動クローズ
        if (result && result.successCount === result.totalCount) {
            setTimeout(() => {
                gallery.clearFiles();
                gallery.clearSelection();
                onClose();
            }, 800);
        }
    }, [gallery, onUploadComplete, onClose]);

    // クローズ時のクリーンアップ
    const handleClose = useCallback(() => {
        if (gallery.isUploading) return; // アップロード中は閉じない
        gallery.clearFiles();
        gallery.clearSelection();
        onClose();
    }, [gallery, onClose]);

    const canUpload = gallery.items.length > 0
        && gallery.globalMetadata.storeName !== ''
        && !gallery.isUploading;

    const hasCompleted = gallery.items.some(
        i => i.status === 'success' || i.status === 'error'
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="upload-gallery-backdrop"
                    className="fixed inset-0 z-50 flex items-center justify-center p-6"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="relative w-full max-w-4xl h-[70vh] max-h-[680px]
                            glass-hud rounded-2xl
                            flex flex-col overflow-hidden"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-sys-separator">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-action-primary/10">
                                    <FolderUp className="w-5 h-5 text-action-primary" />
                                </div>
                                <div>
                                    <h2 className="text-title-3 font-semibold text-sys-text-primary">
                                        ファイルアップロード
                                    </h2>
                                    <p className="text-caption-1 text-sys-text-tertiary">
                                        {gallery.items.length > 0
                                            ? `${gallery.items.length}件のファイル`
                                            : 'ファイルをドラッグ&ドロップで追加'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={gallery.isUploading}
                                className="p-1.5 rounded-lg
                                    text-sys-text-tertiary hover:text-sys-text-primary
                                    hover:bg-sys-bg-alt transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body: Two-Column Layout */}
                        <div className="flex-1 flex min-h-0">
                            {/* Left: File Deck */}
                            <div className="flex-1 min-w-0 border-r border-sys-separator">
                                <FileDeck
                                    items={gallery.items}
                                    selectedIds={gallery.selectedIds}
                                    isUploading={gallery.isUploading}
                                    onSelect={gallery.selectItem}
                                    onToggle={gallery.toggleSelection}
                                    onClearSelection={gallery.clearSelection}
                                    onRemove={gallery.removeFile}
                                    onAddFiles={gallery.addFiles}
                                />
                            </div>

                            {/* Right: Inspector */}
                            <div className="w-72 flex-shrink-0">
                                <InspectorPane
                                    items={gallery.items}
                                    selectedIds={gallery.selectedIds}
                                    globalMetadata={gallery.globalMetadata}
                                    stores={fileSystem.stores}
                                    isUploading={gallery.isUploading}
                                    onGlobalMetadataChange={gallery.setGlobalMetadata}
                                    onItemMetadataChange={gallery.setItemMetadata}
                                    onBulkMetadataChange={gallery.setBulkItemMetadata}
                                />
                            </div>
                        </div>

                        {/* Upload Progress */}
                        <UploadProgress
                            items={gallery.items}
                            isUploading={gallery.isUploading}
                        />

                        {/* Footer */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-t border-sys-separator">
                            <div className="text-caption-1 text-sys-text-tertiary">
                                {!gallery.globalMetadata.storeName && gallery.items.length > 0 && (
                                    <span className="text-feedback-warning">
                                        ⚠ アップロード先ストアを選択してください
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {hasCompleted && !gallery.isUploading && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleClose}
                                    >
                                        閉じる
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={!canUpload}
                                    isLoading={gallery.isUploading}
                                    glowing={canUpload}
                                    onClick={handleUpload}
                                >
                                    <Upload className="w-4 h-4" />
                                    {gallery.isUploading
                                        ? 'アップロード中...'
                                        : `${gallery.items.length}件をアップロード`
                                    }
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default UploadGallery;
