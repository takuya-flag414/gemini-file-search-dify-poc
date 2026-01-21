/**
 * FileCard Component
 * Phase A: Grid view file card for Knowledge Finder
 * macOS Finder-style file representation
 */

import { motion } from 'framer-motion';
import type { StoredFile } from '../../types';
import { FileIcon } from './FileIcon';

// ============================================
// File Icon Mapping
// ============================================

// getFileIcon removed in favor of FileIcon component

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ============================================
// Props & Types
// ============================================

interface FileCardProps {
    file: StoredFile;
    onSelect?: (file: StoredFile) => void;
    onDelete?: (file: StoredFile) => void;
    isSelected?: boolean;
}

// ============================================
// Component
// ============================================

export function FileCard({ file, onSelect, onDelete, isSelected = false }: FileCardProps) {
    const handleClick = () => {
        onSelect?.(file);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(file);
    };

    return (
        <motion.div
            layout
            layoutId={`file-card-${file.documentId}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
                type: 'spring',
                stiffness: 250,
                damping: 25,
            }}
            className={`
                p-4 pt-6 pb-4 cursor-pointer
                flex flex-col items-center justify-start
                min-h-[180px] relative group
                rounded-card border transition-all duration-200
                bg-[var(--finder-card-bg)] border-[var(--finder-card-border)]
                hover:bg-[var(--finder-card-hover)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]
                ${isSelected ? 'ring-2 ring-action-primary' : ''}
            `}
            onClick={handleClick}
        >
            {/* Delete Button (on hover) */}
            <button
                onClick={handleDelete}
                className="
                    absolute top-2 right-2 z-10
                    w-6 h-6 rounded-full
                    bg-feedback-danger/80 text-white
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-150
                    text-xs font-bold
                    hover:bg-feedback-danger
                "
                title="ファイルを削除"
            >
                ×
            </button>

            {/* File Icon */}
            <div className="w-12 h-12 mb-3 pointer-events-none select-none flex-shrink-0">
                <FileIcon mimeType={file.mimeType} />
            </div>

            {/* File Name */}
            <p
                className="
                    text-footnote text-sys-text-primary text-center
                    line-clamp-2 w-full px-1 pointer-events-none select-none
                    h-[3em] leading-normal flex items-start justify-center overflow-hidden
                "
                title={file.displayName}
            >
                {file.displayName}
            </p>

            <p className="text-caption-2 text-sys-text-tertiary mt-1 pointer-events-none select-none">
                {formatFileSize(file.sizeBytes)}
            </p>

            {/* Metadata Tags */}
            {(file.customMetadata?.metadata_company || file.customMetadata?.metadata_department || file.customMetadata?.metadata_filetype) && (
                <div className="mt-2 flex flex-wrap gap-1 justify-center px-1 w-full pointer-events-none select-none">
                    {[
                        file.customMetadata?.metadata_company,
                        file.customMetadata?.metadata_department,
                        file.customMetadata?.metadata_filetype
                    ].filter(Boolean).map((meta, i) => (
                        <span
                            key={i}
                            className="
                                text-[10px] leading-3 px-1.5 py-0.5
                                bg-sys-bg-alt/80 rounded-[4px]
                                text-sys-text-secondary
                                border border-sys-separator/50
                                tabular-nums truncate max-w-full
                            "
                        >
                            {meta}
                        </span>
                    ))}
                </div>
            )}

            {/* State Badge (for PROCESSING or FAILED) */}
            {file.state !== 'ACTIVE' && (
                <div
                    className={`
                        absolute bottom-2 left-2
                        px-2 py-0.5 rounded-full text-caption-2
                        ${file.state === 'PROCESSING'
                            ? 'bg-feedback-warning/20 text-feedback-warning'
                            : 'bg-feedback-danger/20 text-feedback-danger'
                        }
                    `}
                >
                    {file.state === 'PROCESSING' ? '処理中...' : 'エラー'}
                </div>
            )}
        </motion.div>
    );
}

export default FileCard;
