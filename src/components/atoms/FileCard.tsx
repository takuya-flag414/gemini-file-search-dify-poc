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

    // Check for reduced motion preference (accessibility)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Animation configuration based on user preferences
    const animationVariants = prefersReducedMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        }
        : {
            initial: { opacity: 0, y: 8, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -8, scale: 0.98 },
        };

    const transitionConfig = prefersReducedMotion
        ? { duration: 0.2 }
        : {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30,
        };

    // Layout shift animation (for filtering/reordering)
    const layoutTransition = prefersReducedMotion
        ? { duration: 0.15 }
        : {
            type: 'tween' as const,
            ease: [0.4, 0.0, 0.2, 1.0] as const, // easeOut curve
            duration: 0.3,
        };

    return (
        <motion.div
            layout
            layoutId={`file-card-${file.documentId}`}
            {...animationVariants}
            transition={{
                ...transitionConfig,
                layout: layoutTransition,
            }}
            className={`
                p-4 pt-6 pb-4 cursor-pointer
                flex flex-col items-center justify-start
                h-[260px] relative group
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

            {/* File Icon Container - Fixed Height */}
            <div className="h-14 w-full flex items-center justify-center mb-2 pointer-events-none select-none flex-shrink-0">
                <div className="w-12 h-12">
                    <FileIcon mimeType={file.mimeType} />
                </div>
            </div>

            {/* File Name - Fixed Height (2 lines max) */}
            <div className="h-[3em] w-full flex items-start justify-center overflow-hidden mb-1">
                <p
                    className="
                        text-footnote text-sys-text-primary text-center
                        line-clamp-2 w-full px-1 pointer-events-none select-none
                        leading-normal
                    "
                    title={file.displayName}
                >
                    {file.displayName}
                </p>
            </div>

            {/* File Size - Fixed Height */}
            <div className="h-5 w-full flex items-center justify-center mb-2">
                <p className="text-caption-2 text-sys-text-tertiary pointer-events-none select-none">
                    {formatFileSize(file.sizeBytes)}
                </p>
            </div>

            {/* Metadata Tags - Fixed Height Container */}
            <div className="h-[60px] w-full overflow-hidden px-1 pointer-events-none select-none">
                {(file.customMetadata?.metadata_company || file.customMetadata?.metadata_department || file.customMetadata?.metadata_filetype) && (
                    <div className="flex flex-wrap gap-1 justify-center w-full">
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
            </div>

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
