/**
 * UploadProgress Component
 * アップロード中のオーバーレイ / サマリー表示
 */

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';
import type { FileUploadItem } from '../../../types/upload';

// ============================================
// Types
// ============================================

interface UploadProgressProps {
    items: FileUploadItem[];
    isUploading: boolean;
}

// ============================================
// Component
// ============================================

export function UploadProgress({ items, isUploading }: UploadProgressProps) {
    const total = items.length;
    const uploading = items.filter(i => i.status === 'uploading').length;
    const success = items.filter(i => i.status === 'success').length;
    const error = items.filter(i => i.status === 'error').length;
    const waiting = items.filter(i => i.status === 'waiting').length;
    const done = success + error;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    if (!isUploading && success === 0 && error === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-3 p-3 finder-card"
        >
            {/* Progress Bar */}
            {isUploading && (
                <div className="mb-2 h-1.5 bg-sys-separator rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-action-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}

            {/* Status Summary */}
            <div className="flex items-center gap-3">
                {isUploading ? (
                    <Loader2 className="w-4 h-4 text-action-primary animate-spin flex-shrink-0" />
                ) : error > 0 ? (
                    <AlertCircle className="w-4 h-4 text-feedback-danger flex-shrink-0" />
                ) : (
                    <CheckCircle className="w-4 h-4 text-feedback-success flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                    {isUploading ? (
                        <p className="text-caption-1 text-sys-text-primary">
                            アップロード中... ({done}/{total})
                        </p>
                    ) : (
                        <p className="text-caption-1 text-sys-text-primary">
                            {error > 0
                                ? `${success}件成功、${error}件失敗`
                                : `${success}件のアップロードが完了しました`
                            }
                        </p>
                    )}
                </div>

                {/* Detail Badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {waiting > 0 && (
                        <span className="text-caption-1 text-sys-text-tertiary flex items-center gap-0.5">
                            <Upload className="w-3 h-3" /> {waiting}
                        </span>
                    )}
                    {uploading > 0 && (
                        <span className="text-caption-1 text-action-primary flex items-center gap-0.5">
                            <Loader2 className="w-3 h-3 animate-spin" /> {uploading}
                        </span>
                    )}
                    {success > 0 && (
                        <span className="text-caption-1 text-feedback-success flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> {success}
                        </span>
                    )}
                    {error > 0 && (
                        <span className="text-caption-1 text-feedback-danger flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default UploadProgress;
