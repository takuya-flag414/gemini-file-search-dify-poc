/**
 * FileCard Component
 * 個々のファイルを表示するカード
 * UploadGallery の FileDeck 内で使用
 */

import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FileIcon } from '../../atoms/FileIcon';
import type { FileUploadItem } from '../../../types/upload';

// ============================================
// Types
// ============================================

interface FileCardProps {
    item: FileUploadItem;
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    onRemove: () => void;
}

// ============================================
// Helper
// ============================================

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        txt: 'text/plain',
        md: 'text/markdown',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
    };
    return mimeMap[ext] || 'application/octet-stream';
}

// ============================================
// Component
// ============================================

export function FileCard({ item, isSelected, onClick, onRemove }: FileCardProps) {
    const mimeType = item.file.type || getMimeFromExtension(item.file.name);
    const isUploading = item.status === 'uploading';
    const isSuccess = item.status === 'success';
    const isError = item.status === 'error';

    return (
        <motion.div
            layout
            layoutId={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={onClick}
            className={`
                relative group cursor-pointer
                finder-card p-3
                transition-all duration-200
                ${isSelected ? 'ring-2 ring-action-primary' : ''}
                ${isUploading ? 'pointer-events-none' : ''}
            `}
            style={isSelected ? { background: 'color-mix(in srgb, var(--action-primary) 10%, transparent)' } : undefined}
        >
            {/* Remove Button */}
            {!isUploading && !isSuccess && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute -top-1.5 -right-1.5 z-10
                        w-5 h-5 rounded-full
                        bg-sys-bg-alt border border-sys-separator
                        flex items-center justify-center
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-150
                        hover:bg-feedback-danger hover:border-feedback-danger hover:text-white
                        text-sys-text-tertiary"
                >
                    <X className="w-3 h-3" />
                </button>
            )}

            {/* File Icon & Info */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex-shrink-0">
                    <FileIcon mimeType={mimeType} className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-footnote font-medium text-sys-text-primary truncate">
                        {item.metadata.displayName || item.file.name}
                    </p>
                    <p className="text-caption-1 text-sys-text-tertiary">
                        {formatFileSize(item.file.size)}
                    </p>
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                    {isUploading && (
                        <Loader2 className="w-4 h-4 text-action-primary animate-spin" />
                    )}
                    {isSuccess && (
                        <CheckCircle className="w-4 h-4 text-feedback-success" />
                    )}
                    {isError && (
                        <AlertCircle className="w-4 h-4 text-feedback-danger" />
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
                <div className="mt-2 h-1 bg-sys-separator rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-action-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}

            {/* Error Message */}
            {isError && item.errorMessage && (
                <p className="mt-1.5 text-caption-1 text-feedback-danger truncate">
                    {item.errorMessage}
                </p>
            )}
        </motion.div>
    );
}

export default FileCard;
