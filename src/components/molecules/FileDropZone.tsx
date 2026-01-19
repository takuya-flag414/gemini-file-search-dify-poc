import { useCallback, useState } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';

// ============================================
// File Drop Zone Component
// ============================================

interface FileDropZoneProps {
    onFileDrop: (file: File) => void;
    isUploading: boolean;
    uploadedFileName: string | null;
    accept?: string;
}

export function FileDropZone({
    onFileDrop,
    isUploading,
    uploadedFileName,
    accept = '.txt,.md,.pdf,.docx,.doc,.csv,.xlsx,.xls'
}: FileDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            onFileDrop(file);
        }
    }, [onFileDrop]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileDrop(file);
        }
    }, [onFileDrop]);

    if (uploadedFileName) {
        return (
            <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-card border border-feedback-success/20">
                <File className="w-5 h-5 text-feedback-success flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-subheadline text-sys-text-primary truncate">
                        {uploadedFileName}
                    </p>
                    <p className="text-caption-1 text-feedback-success">
                        アップロード完了
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative flex flex-col items-center justify-center
        p-8 rounded-card border-2 border-dashed
        transition-colors cursor-pointer
        ${isDragOver
                    ? 'border-action-primary bg-action-primary/5'
                    : 'border-sys-separator hover:border-action-primary/50 hover:bg-sys-bg-alt/50'
                }
        ${isUploading ? 'pointer-events-none opacity-60' : ''}
      `}
        >
            <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />

            {isUploading ? (
                <>
                    <Loader2 className="w-8 h-8 text-action-primary animate-spin mb-3" />
                    <p className="text-subheadline text-sys-text-secondary">
                        アップロード中...
                    </p>
                </>
            ) : (
                <>
                    <Upload className="w-8 h-8 text-sys-text-tertiary mb-3" />
                    <p className="text-subheadline text-sys-text-primary text-center">
                        ファイルをドラッグ＆ドロップ
                    </p>
                    <p className="text-footnote text-sys-text-tertiary mt-1">
                        またはクリックして選択
                    </p>
                    <p className="text-caption-1 text-sys-text-tertiary mt-3">
                        対応形式: TXT, MD, PDF, DOCX, CSV, XLSX
                    </p>
                </>
            )}
        </div>
    );
}
