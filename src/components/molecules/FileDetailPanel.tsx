/**
 * FileDetailPanel Component
 * Quick Look style modal for file details
 * DESIGN_RULE.md compliant with Spring animations
 */

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { StoredFile } from '../../types';
import { FileIcon } from '../atoms/FileIcon';

// ============================================
// Props
// ============================================

interface FileDetailPanelProps {
    file: StoredFile | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (file: StoredFile) => void;
}

// ============================================
// Utility Functions
// ============================================

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStateLabel = (state: StoredFile['state']) => {
    switch (state) {
        case 'ACTIVE':
            return { label: 'アクティブ', color: 'text-feedback-success', bg: 'bg-feedback-success/10' };
        case 'PROCESSING':
            return { label: '処理中', color: 'text-feedback-warning', bg: 'bg-feedback-warning/10' };
        case 'FAILED':
            return { label: 'エラー', color: 'text-feedback-danger', bg: 'bg-feedback-danger/10' };
    }
};

// ============================================
// Component
// ============================================

export function FileDetailPanel({
    file,
    isOpen,
    onClose,
    onDelete,
}: FileDetailPanelProps) {
    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleDelete = useCallback(() => {
        if (file && window.confirm(`「${file.displayName}」を削除しますか？`)) {
            onDelete(file);
            onClose();
        }
    }, [file, onDelete, onClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!file) return null;

    const stateInfo = getStateLabel(file.state);
    const metadata = file.customMetadata;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="
                        fixed inset-0 z-50
                        bg-black/40 backdrop-blur-sm
                        flex items-center justify-center
                        p-4
                    "
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 250,
                            damping: 25,
                        }}
                        className="
                            w-full max-w-md
                            rounded-2xl
                            overflow-hidden
                            glass-hud
                        "
                    >
                        {/* Header */}
                        <div className="
                            flex items-center justify-between
                            px-5 py-4
                        ">
                            <h2 className="text-headline text-sys-text-primary font-medium">
                                ファイル詳細
                            </h2>
                            <button
                                onClick={onClose}
                                className="
                                    w-7 h-7 rounded-full
                                    bg-sys-text-tertiary/10 hover:bg-sys-text-tertiary/20
                                    flex items-center justify-center
                                    transition-colors duration-150
                                    group
                                "
                            >
                                <X className="w-3.5 h-3.5 text-sys-text-tertiary group-hover:text-sys-text-secondary transition-colors" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5">
                            {/* File Icon & Name */}
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-20 h-20">
                                    <FileIcon mimeType={file.mimeType} />
                                </div>
                                <h3 className="text-title-2 text-sys-text-primary font-medium break-all">
                                    {file.displayName}
                                </h3>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-3 text-subheadline">
                                {/* Size */}
                                <div className="flex justify-between">
                                    <span className="text-sys-text-secondary">サイズ</span>
                                    <span className="text-sys-text-primary font-medium">
                                        {formatFileSize(file.sizeBytes)}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="flex justify-between">
                                    <span className="text-sys-text-secondary">作成日時</span>
                                    <span className="text-sys-text-primary">
                                        {formatDate(file.createTime)}
                                    </span>
                                </div>

                                {/* State */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sys-text-secondary">状態</span>
                                    <span className={`
                                        px-2 py-0.5 rounded-full text-caption-1 font-medium
                                        ${stateInfo.color} ${stateInfo.bg}
                                    `}>
                                        {stateInfo.label}
                                    </span>
                                </div>

                                {/* MIME Type */}
                                <div className="flex justify-between">
                                    <span className="text-sys-text-secondary">種類</span>
                                    <span className="text-sys-text-primary text-footnote">
                                        {file.mimeType}
                                    </span>
                                </div>
                            </div>

                            {/* Metadata Tags */}
                            {(metadata?.metadata_company || metadata?.metadata_department || metadata?.metadata_filetype) && (
                                <div className="space-y-2">
                                    <span className="text-caption-1 text-sys-text-tertiary uppercase">
                                        メタデータ
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {metadata.metadata_company && (
                                            <span className="
                                                px-2.5 py-1 rounded-full
                                                bg-sys-bg-alt text-footnote text-sys-text-secondary
                                                border border-sys-separator/50
                                            ">
                                                🏢 {String(metadata.metadata_company)}
                                            </span>
                                        )}
                                        {metadata.metadata_department && (
                                            <span className="
                                                px-2.5 py-1 rounded-full
                                                bg-sys-bg-alt text-footnote text-sys-text-secondary
                                                border border-sys-separator/50
                                            ">
                                                📂 {String(metadata.metadata_department)}
                                            </span>
                                        )}
                                        {metadata.metadata_filetype && (
                                            <span className="
                                                px-2.5 py-1 rounded-full
                                                bg-sys-bg-alt text-footnote text-sys-text-secondary
                                                border border-sys-separator/50
                                            ">
                                                📄 {String(metadata.metadata_filetype)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div
                            className="
                                flex items-center justify-end gap-3
                                px-5 py-3
                                border-t border-sys-separator/50
                                bg-black/[0.02] dark:bg-white/[0.02]
                            "
                        >
                            <button
                                onClick={onClose}
                                className="
                                    px-4 py-1.5 rounded-md
                                    text-footnote font-medium
                                    text-sys-text-secondary
                                    hover:bg-sys-text-tertiary/10
                                    active:bg-sys-text-tertiary/20
                                    transition-colors duration-150
                                "
                            >
                                閉じる
                            </button>
                            <button
                                onClick={handleDelete}
                                className="
                                    px-4 py-1.5 rounded-md
                                    text-footnote font-medium
                                    text-feedback-danger
                                    hover:bg-feedback-danger/10
                                    active:bg-feedback-danger/20
                                    transition-colors duration-150
                                "
                            >
                                🗑 削除
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default FileDetailPanel;
