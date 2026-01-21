/**
 * FileListItem Component
 * Phase A: List view file item for Knowledge Finder
 * Detailed view with metadata
 */

import { motion } from 'framer-motion';
import type { StoredFile } from '../../types';
import { FileIcon } from './FileIcon';

// ============================================
// Utility Functions
// ============================================

// getFileIcon removed in favor of FileIcon component

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

// ============================================
// Props & Types
// ============================================

interface FileListItemProps {
    file: StoredFile;
    onSelect?: (file: StoredFile) => void;
    onDelete?: (file: StoredFile) => void;
    isSelected?: boolean;
}

// ============================================
// Component
// ============================================

export function FileListItem({ file, onSelect, onDelete, isSelected = false }: FileListItemProps) {
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
            layoutId={`file-list-${file.documentId}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
                type: 'spring',
                stiffness: 250,
                damping: 25,
            }}
            className={`
                finder-list-item px-4 py-3 cursor-pointer
                flex items-center gap-4 group
                ${isSelected ? 'bg-action-primary/10' : ''}
            `}
            onClick={handleClick}
        >
            {/* File Icon */}
            <div className="w-8 h-8 flex-shrink-0">
                <FileIcon mimeType={file.mimeType} />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p
                    className="text-subheadline text-sys-text-primary truncate"
                    title={file.displayName}
                >
                    {file.displayName}
                </p>

                {/* Metadata Tags */}
                {Object.keys(file.customMetadata).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {Object.entries(file.customMetadata).slice(0, 3).map(([key, value]) => (
                            <span
                                key={key}
                                className="
                                    px-1.5 py-0.5 rounded 
                                    bg-sys-bg-alt text-caption-2 text-sys-text-secondary
                                "
                            >
                                {String(value)}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* File Size */}
            <div className="text-footnote text-sys-text-secondary w-20 text-right flex-shrink-0">
                {formatFileSize(file.sizeBytes)}
            </div>

            {/* Date */}
            <div className="text-footnote text-sys-text-secondary w-24 text-right flex-shrink-0">
                {formatDate(file.createTime)}
            </div>

            {/* State Indicator */}
            <div className="w-16 flex-shrink-0 text-right">
                {file.state === 'ACTIVE' ? (
                    <span className="text-caption-2 text-feedback-success">●</span>
                ) : file.state === 'PROCESSING' ? (
                    <span className="text-caption-2 text-feedback-warning animate-pulse">処理中</span>
                ) : (
                    <span className="text-caption-2 text-feedback-danger">エラー</span>
                )}
            </div>

            {/* Delete Button (on hover) */}
            <button
                onClick={handleDelete}
                className="
                    w-7 h-7 rounded-md
                    bg-feedback-danger/10 text-feedback-danger
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-150
                    text-sm flex-shrink-0
                    hover:bg-feedback-danger/20
                "
                title="ファイルを削除"
            >
                🗑️
            </button>
        </motion.div>
    );
}

export default FileListItem;
