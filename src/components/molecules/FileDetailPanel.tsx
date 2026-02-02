/**
 * FileDetailPanel Component
 * macOS "Get Info" style modal
 */

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
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
        }
    }, [file, onDelete]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!file) return null;

    const metadata = file.customMetadata;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        className="
                            relative w-full max-w-[380px]
                            bg-white/95 dark:bg-[#1e1e1e]/90 backdrop-blur-xl
                            rounded-2xl
                            shadow-2xl ring-1 ring-black/10 dark:ring-white/10
                            overflow-hidden
                            flex flex-col
                        "
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                            mass: 1
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        {/* Title Bar (Mac Style) */}
                        <div className="h-10 flex items-center px-4 bg-sys-bg-alt/30 border-b border-sys-separator/50 select-none">
                            {/* Window Controls (Traffic Lights) */}
                            <div className="flex gap-2 group">
                                <button
                                    onClick={onClose}
                                    className="
                                        w-3 h-3 rounded-full bg-[#FF5F57] border border-black/10
                                        flex items-center justify-center
                                        text-black/50 hover:text-black/80
                                        transition-colors
                                    "
                                    aria-label="Close"
                                >
                                    <X size={8} className="opacity-0 group-hover:opacity-100 stroke-[3]" />
                                </button>
                                <div className="w-3 h-3 rounded-full bg-sys-separator/50 border border-black/10 opacity-50 cursor-default" />
                                <div className="w-3 h-3 rounded-full bg-sys-separator/50 border border-black/10 opacity-50 cursor-default" />
                            </div>

                            {/* Title */}
                            <div className="flex-1 text-center">
                                <span className="text-footnote font-semibold text-sys-text-secondary opacity-80">
                                    情報
                                </span>
                            </div>

                            {/* Spacer to balance traffic lights */}
                            <div className="w-[52px]" />
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            {/* Top Preview Area */}
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    className="w-24 h-24 drop-shadow-xl"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, type: "spring" }}
                                >
                                    <FileIcon mimeType={file.mimeType} />
                                </motion.div>
                                <div className="text-center w-full">
                                    <h3 className="text-title-3 font-semibold text-sys-text-primary break-all leading-tight">
                                        {file.displayName}
                                    </h3>
                                    <p className="text-caption-1 text-sys-text-secondary mt-1 font-medium">
                                        {formatFileSize(file.sizeBytes)}
                                    </p>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-sys-separator/50 w-full" />

                            {/* General Information Grid */}
                            <div className="space-y-3">
                                <h4 className="text-caption-2 font-semibold text-sys-text-tertiary uppercase tracking-wider mb-2">
                                    一般情報
                                </h4>
                                <div className="grid grid-cols-[80px_1fr] gap-y-2 gap-x-3 text-footnote leading-relaxed">
                                    <span className="text-right text-sys-text-secondary font-medium">種類:</span>
                                    <span className="text-sys-text-primary break-all">{file.mimeType}</span>

                                    <span className="text-right text-sys-text-secondary font-medium">作成日:</span>
                                    <span className="text-sys-text-primary tabular-nums tracking-tight">
                                        {formatDate(file.createTime)}
                                    </span>

                                    <span className="text-right text-sys-text-secondary font-medium">状態:</span>
                                    <div>
                                        {file.state === 'ACTIVE' && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sys-color-success/10 text-sys-color-success text-[11px] font-medium border border-sys-color-success/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sys-color-success" />
                                                Active
                                            </span>
                                        )}
                                        {file.state === 'PROCESSING' && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sys-color-warning/10 text-sys-color-warning text-[11px] font-medium border border-sys-color-warning/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sys-color-warning animate-pulse" />
                                                Processing
                                            </span>
                                        )}
                                        {file.state === 'FAILED' && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sys-color-danger/10 text-sys-color-danger text-[11px] font-medium border border-sys-color-danger/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sys-color-danger" />
                                                Error
                                            </span>
                                        )}
                                    </div>

                                    {file.mimeType === 'text/plain' && file.displayName.toLowerCase().endsWith('.md') && (
                                        <>
                                            <span className="text-right text-sys-text-secondary font-medium">Note:</span>
                                            <div className="flex items-start gap-1.5 text-sys-text-tertiary">
                                                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                <span className="text-caption-2 leading-tight">
                                                    Markdownファイルはテキストとして扱われます
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Section */}
                            {(metadata?.metadata_company || metadata?.metadata_department || metadata?.metadata_filetype) && (
                                <>
                                    <div className="h-px bg-sys-separator/50 w-full" />
                                    <div className="space-y-2">
                                        <h4 className="text-caption-2 font-semibold text-sys-text-tertiary uppercase tracking-wider mb-2">
                                            メタデータ
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {metadata.metadata_company && (
                                                <span className="
                                                    px-2.5 py-1 rounded-md
                                                    bg-sys-color-primary/10 text-sys-color-primary
                                                    border border-sys-color-primary/20
                                                    text-caption-1 font-medium
                                                    flex items-center gap-1.5
                                                ">
                                                    🏢 {String(metadata.metadata_company)}
                                                </span>
                                            )}
                                            {metadata.metadata_department && (
                                                <span className="
                                                    px-2.5 py-1 rounded-md
                                                    bg-sys-bg-alt text-sys-text-primary
                                                    border border-sys-separator
                                                    text-caption-1 font-medium
                                                    flex items-center gap-1.5
                                                ">
                                                    📂 {String(metadata.metadata_department)}
                                                </span>
                                            )}
                                            {metadata.metadata_filetype && (
                                                <span className="
                                                    px-2.5 py-1 rounded-md
                                                    bg-sys-bg-alt text-sys-text-primary
                                                    border border-sys-separator
                                                    text-caption-1 font-medium
                                                    flex items-center gap-1.5
                                                ">
                                                    📄 {String(metadata.metadata_filetype)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="px-4 py-3 bg-sys-bg-alt/30 border-t border-sys-separator/50 flex justify-between items-center">
                            <span className="text-caption-2 text-sys-text-tertiary">
                                Read Only
                            </span>
                            <button
                                onClick={handleDelete}
                                className="
                                    px-3 py-1 rounded-md
                                    text-footnote font-medium
                                    text-sys-text-secondary
                                    hover:bg-feedback-danger/10 hover:text-feedback-danger
                                    active:bg-feedback-danger/20
                                    transition-all duration-200
                                "
                            >
                                削除...
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default FileDetailPanel;
