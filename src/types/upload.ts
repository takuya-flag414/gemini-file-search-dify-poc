/**
 * Multi-File Upload Gallery Type Definitions
 * ファイルアップロードギャラリー専用の型定義
 */

// ============================================
// File Upload Item
// ============================================

/**
 * 個々のファイルの状態を表す
 */
export interface FileUploadItem {
    id: string;                    // UUID (Framer Motion layoutId に使用)
    file: File;                    // 原本
    previewUrl?: string;           // 画像サムネイル用
    status: 'waiting' | 'uploading' | 'success' | 'error';
    progress: number;              // 0-100
    errorMessage?: string;         // エラー時のメッセージ
    difyFileId?: string;           // Dify一時ストレージのID (uploadFileToDify後に設定)

    // メタデータ (個別設定用)
    // undefined の場合は Global 設定を継承
    metadata: FileItemMetadata;
}

/**
 * ファイル個別のメタデータ
 * undefined のフィールドは globalMetadata から継承
 */
export interface FileItemMetadata {
    displayName?: string;          // 表示名 (未指定時は file.name)
    storeName?: string;            // 個別ストア指定
    company?: string;              // 会社
    department?: string;           // 部署
    filetype?: string;             // ファイル種別
}

// ============================================
// Gallery State
// ============================================

/**
 * ギャラリー全体の状態
 */
export interface GalleryState {
    items: FileUploadItem[];
    selectedIds: string[];         // 選択中のファイルID配列 (空配列 = 全選択モード)

    // 一括設定用 (Global Fallback)
    globalMetadata: GlobalMetadata;

    isUploading: boolean;
}

/**
 * 一括設定用のグローバルメタデータ
 */
export interface GlobalMetadata {
    storeName: string;
    company: string;
    department: string;
    filetype: string;
}

// ============================================
// Resolved Metadata
// ============================================

/**
 * 解決済みメタデータ (item.metadata ?? globalMetadata)
 * UI表示やAPI送信時に使用
 */
export interface ResolvedMetadata {
    displayName: string;
    storeName: string;
    company: string;
    department: string;
    filetype: string;
}

// ============================================
// Upload Progress
// ============================================

/**
 * アップロード進捗通知用
 */
export interface UploadProgressEvent {
    itemId: string;
    status: 'uploading' | 'success' | 'error';
    progress: number;
    errorMessage?: string;
}

/**
 * アップロード結果サマリー
 */
export interface UploadResult {
    totalCount: number;
    successCount: number;
    errorCount: number;
}

// ============================================
// Gallery Actions (useUploadGallery の返り値)
// ============================================

export interface UseUploadGalleryReturn {
    // State
    state: GalleryState;
    items: FileUploadItem[];
    selectedIds: string[];
    globalMetadata: GlobalMetadata;
    isUploading: boolean;
    selectedItems: FileUploadItem[];

    // File Management
    addFiles: (files: File[]) => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;

    // Selection
    selectItem: (id: string) => void;
    toggleSelection: (id: string) => void;
    clearSelection: () => void;

    // Metadata
    setGlobalMetadata: (metadata: Partial<GlobalMetadata>) => void;
    setItemMetadata: (id: string, metadata: Partial<FileItemMetadata>) => void;
    setBulkItemMetadata: (ids: string[], metadata: Partial<FileItemMetadata>) => void;
    resolveMetadata: (item: FileUploadItem) => ResolvedMetadata;

    // Upload
    startUpload: () => Promise<UploadResult>;
    resetUploadState: () => void;
}
