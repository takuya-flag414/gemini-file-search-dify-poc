/**
 * useUploadGallery Hook
 * 複数ファイルアップロードギャラリーの状態管理とロジック
 * View と Logic を分離するための専用フック
 */

import { useState, useCallback, useMemo } from 'react';
import type {
    FileUploadItem,
    GalleryState,
    GlobalMetadata,
    FileItemMetadata,
    ResolvedMetadata,
    UseUploadGalleryReturn,
    UploadResult,
} from '../types/upload';
import type { UseGeminiFileSystemReturn } from './useGeminiFileSystem';

// ============================================
// UUID Generator
// ============================================

function generateId(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================
// Initial State
// ============================================

const initialGlobalMetadata: GlobalMetadata = {
    storeName: '',
    company: '',
    department: '',
    filetype: '',
};

const initialState: GalleryState = {
    items: [],
    selectedIds: [],
    globalMetadata: initialGlobalMetadata,
    isUploading: false,
};

// ============================================
// Hook Implementation
// ============================================

export function useUploadGallery(
    fileSystem: UseGeminiFileSystemReturn
): UseUploadGalleryReturn {
    const [state, setState] = useState<GalleryState>(initialState);

    // ============================================
    // Derived State
    // ============================================

    const items = state.items;
    const selectedIds = state.selectedIds;
    const globalMetadata = state.globalMetadata;
    const isUploading = state.isUploading;

    const selectedItems = useMemo(() => {
        if (selectedIds.length === 0) return items; // 空 = 全選択モード
        return items.filter(item => selectedIds.includes(item.id));
    }, [items, selectedIds]);

    // ============================================
    // File Management
    // ============================================

    /**
     * ファイルを追加する
     */
    const addFiles = useCallback((files: File[]) => {
        const newItems: FileUploadItem[] = files.map(file => ({
            id: generateId(),
            file,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            status: 'waiting' as const,
            progress: 0,
            metadata: {
                displayName: file.name,
            },
        }));

        setState(prev => ({
            ...prev,
            items: [...prev.items, ...newItems],
        }));
    }, []);

    /**
     * ファイルを削除する
     */
    const removeFile = useCallback((id: string) => {
        setState(prev => {
            // プレビューURLを解放
            const item = prev.items.find(i => i.id === id);
            if (item?.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }

            return {
                ...prev,
                items: prev.items.filter(i => i.id !== id),
                selectedIds: prev.selectedIds.filter(sid => sid !== id),
            };
        });
    }, []);

    /**
     * 全ファイルをクリアする
     */
    const clearFiles = useCallback(() => {
        setState(prev => {
            // プレビューURLを全て解放
            prev.items.forEach(item => {
                if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
            });
            return { ...prev, items: [], selectedIds: [] };
        });
    }, []);

    // ============================================
    // Selection Logic
    // ============================================

    /**
     * 単一選択 (Click)
     */
    const selectItem = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            selectedIds: [id],
        }));
    }, []);

    /**
     * トグル選択 (Ctrl/Cmd + Click)
     */
    const toggleSelection = useCallback((id: string) => {
        setState(prev => {
            const isSelected = prev.selectedIds.includes(id);
            return {
                ...prev,
                selectedIds: isSelected
                    ? prev.selectedIds.filter(sid => sid !== id)
                    : [...prev.selectedIds, id],
            };
        });
    }, []);

    /**
     * 全選択解除 (Background Click)
     * selectedIds が空 = 全選択モード
     */
    const clearSelection = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedIds: [],
        }));
    }, []);

    // ============================================
    // Metadata Management
    // ============================================

    /**
     * グローバルメタデータの更新
     */
    const setGlobalMetadata = useCallback((metadata: Partial<GlobalMetadata>) => {
        setState(prev => ({
            ...prev,
            globalMetadata: { ...prev.globalMetadata, ...metadata },
        }));
    }, []);

    /**
     * 個別アイテムのメタデータ更新
     */
    const setItemMetadata = useCallback((id: string, metadata: Partial<FileItemMetadata>) => {
        setState(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id
                    ? { ...item, metadata: { ...item.metadata, ...metadata } }
                    : item
            ),
        }));
    }, []);

    /**
     * 複数アイテムのメタデータ一括更新
     */
    const setBulkItemMetadata = useCallback((ids: string[], metadata: Partial<FileItemMetadata>) => {
        setState(prev => ({
            ...prev,
            items: prev.items.map(item =>
                ids.includes(item.id)
                    ? { ...item, metadata: { ...item.metadata, ...metadata } }
                    : item
            ),
        }));
    }, []);

    /**
     * メタデータ解決: item.metadata ?? globalMetadata
     */
    const resolveMetadata = useCallback((item: FileUploadItem): ResolvedMetadata => {
        return {
            displayName: item.metadata.displayName || item.file.name,
            storeName: item.metadata.storeName || state.globalMetadata.storeName,
            company: item.metadata.company || state.globalMetadata.company,
            department: item.metadata.department || state.globalMetadata.department,
            filetype: item.metadata.filetype || state.globalMetadata.filetype,
        };
    }, [state.globalMetadata]);

    // ============================================
    // Upload Logic
    // ============================================

    /**
     * 全ファイルのアップロードを開始
     */
    const startUpload = useCallback(async (): Promise<UploadResult> => {
        const storeName = state.globalMetadata.storeName;
        if (!storeName) {
            console.error('[useUploadGallery] storeName is required');
            return { totalCount: 0, successCount: 0, errorCount: 0 };
        }

        if (state.items.length === 0) {
            console.error('[useUploadGallery] No files to upload');
            return { totalCount: 0, successCount: 0, errorCount: 0 };
        }

        setState(prev => ({ ...prev, isUploading: true }));

        // ストアを選択
        fileSystem.selectStore(storeName);

        let successCount = 0;
        let errorCount = 0;
        const totalCount = state.items.length;

        // 各ファイルを順次アップロード
        for (const item of state.items) {
            // ステータスを uploading に更新
            setState(prev => ({
                ...prev,
                items: prev.items.map(i =>
                    i.id === item.id ? { ...i, status: 'uploading' as const, progress: 50 } : i
                ),
            }));

            try {
                const resolved = resolveMetadata(item);
                const metadata: Record<string, string | number> = {};
                if (resolved.company) metadata.company = resolved.company;
                if (resolved.department) metadata.department = resolved.department;
                if (resolved.filetype) metadata.filetype = resolved.filetype;

                const result = await fileSystem.uploadFile(item.file, metadata);

                // 成功
                const isSuccess = result !== null;
                if (isSuccess) successCount++; else errorCount++;

                setState(prev => ({
                    ...prev,
                    items: prev.items.map(i =>
                        i.id === item.id
                            ? { ...i, status: isSuccess ? 'success' as const : 'error' as const, progress: 100 }
                            : i
                    ),
                }));
            } catch (err) {
                // エラー
                errorCount++;
                const errorMessage = err instanceof Error ? err.message : 'アップロードに失敗しました';
                setState(prev => ({
                    ...prev,
                    items: prev.items.map(i =>
                        i.id === item.id
                            ? { ...i, status: 'error' as const, progress: 0, errorMessage }
                            : i
                    ),
                }));
            }
        }

        setState(prev => ({ ...prev, isUploading: false }));
        return { totalCount, successCount, errorCount };
    }, [state.globalMetadata.storeName, state.items, fileSystem, resolveMetadata]);

    /**
     * アップロード状態をリセット
     */
    const resetUploadState = useCallback(() => {
        setState(prev => ({
            ...prev,
            isUploading: false,
            items: prev.items.map(item => ({
                ...item,
                status: 'waiting' as const,
                progress: 0,
                errorMessage: undefined,
            })),
        }));
    }, []);

    // ============================================
    // Return
    // ============================================

    return {
        // State
        state,
        items,
        selectedIds,
        globalMetadata,
        isUploading,
        selectedItems,

        // File Management
        addFiles,
        removeFile,
        clearFiles,

        // Selection
        selectItem,
        toggleSelection,
        clearSelection,

        // Metadata
        setGlobalMetadata,
        setItemMetadata,
        setBulkItemMetadata,
        resolveMetadata,

        // Upload
        startUpload,
        resetUploadState,
    };
}

export default useUploadGallery;
