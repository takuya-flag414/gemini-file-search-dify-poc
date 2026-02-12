import { useCallback, useState } from 'react';
import { Upload, File as FileIcon, Loader2 } from 'lucide-react';

// ============================================
// File Drop Zone Component
// 複数ファイル対応版
// ============================================

interface FileDropZoneProps {
    /** 単一ファイル用コールバック (後方互換) */
    onFileDrop?: (file: File) => void;
    /** 複数ファイル用コールバック */
    onFilesDrop?: (files: File[]) => void;
    isUploading: boolean;
    uploadedFileName?: string | null;
    /** 複数ファイルアップロードモード */
    multiple?: boolean;
    accept?: string;
    /** コンパクトモード (Gallery内埋め込み用) */
    compact?: boolean;
}

export function FileDropZone({
    onFileDrop,
    onFilesDrop,
    isUploading,
    uploadedFileName,
    multiple = false,
    accept = '.txt,.md,.pdf,.docx,.doc,.csv,.xlsx,.xls',
    compact = false,
}: FileDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = useCallback((fileList: FileList) => {
        const filesArray = Array.from(fileList);
        if (filesArray.length === 0) return;

        if (onFilesDrop) {
            onFilesDrop(filesArray);
        } else if (onFileDrop) {
            // 後方互換: 最初のファイルだけ渡す
            onFileDrop(filesArray[0]);
        }
    }, [onFileDrop, onFilesDrop]);

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
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    }, [handleFiles]);

    if (uploadedFileName && !multiple) {
        return (
            <div className="flex items-center gap-3 p-4 bg-feedback-success/10 rounded-card border border-feedback-success/20">
                <FileIcon className="w-5 h-5 text-feedback-success flex-shrink-0" />
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
                ${compact ? 'p-4' : 'p-8'} rounded-card border-2 border-dashed
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
                multiple={multiple}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />

            {isUploading ? (
                <>
                    <Loader2 className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-action-primary animate-spin ${compact ? 'mb-1' : 'mb-3'}`} />
                    <p className={`${compact ? 'text-caption-1' : 'text-subheadline'} text-sys-text-secondary`}>
                        アップロード中...
                    </p>
                </>
            ) : (
                <>
                    <Upload className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-sys-text-tertiary ${compact ? 'mb-1' : 'mb-3'}`} />
                    <p className={`${compact ? 'text-caption-1' : 'text-subheadline'} text-sys-text-primary text-center`}>
                        {multiple ? 'ファイルをドラッグ＆ドロップ（複数可）' : 'ファイルをドラッグ＆ドロップ'}
                    </p>
                    {!compact && (
                        <>
                            <p className="text-footnote text-sys-text-tertiary mt-1">
                                またはクリックして選択
                            </p>
                            <p className="text-caption-1 text-sys-text-tertiary mt-3">
                                対応形式: TXT, MD, PDF, DOCX, CSV, XLSX
                            </p>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
