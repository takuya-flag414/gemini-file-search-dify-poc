/**
 * useGeminiFileSystem Hook
 * Phase A/B: React hook for file system operations
 * Provides state management and actions for Knowledge Stores
 * Switches between Mock and Real API based on mockMode
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FileSearchStore, StoredFile } from '../types';
import { getMockFileSystem } from '../services/MockFileSystem';
import { DifyWorkflowClient } from '../services/DifyWorkflowClient';
import { useApp } from '../context/AppContext';
import { convertMdToTxt } from '../utils/fileConversion';

// ============================================
// Hook Types
// ============================================

export interface UseGeminiFileSystemReturn {
    // State
    stores: FileSearchStore[];
    currentStore: FileSearchStore | null;
    files: StoredFile[];
    isLoading: boolean;
    isLoadingStores: boolean;
    isLoadingFiles: boolean;
    isUploading: boolean;
    error: string | null;

    // Store Actions
    fetchStores: () => Promise<void>;
    selectStore: (storeName: string | null) => void;
    createStore: (displayName: string) => Promise<FileSearchStore | null>;
    deleteStore: (storeName: string) => Promise<boolean>;

    // File Actions
    fetchFiles: (storeName: string) => Promise<void>;
    uploadFile: (file: File, metadata?: Record<string, string | number>) => Promise<StoredFile | null>;
    deleteFile: (documentId: string) => Promise<boolean>;

    // Utility
    clearError: () => void;
}

// ============================================
// Common Interface for Mock and Real Client
// ============================================

interface FileSystemClient {
    listStores(): Promise<FileSearchStore[]>;
    listFiles(storeName: string): Promise<StoredFile[]>;
    uploadFile(storeName: string, file: File, displayName: string, metadata?: Record<string, string | number>): Promise<StoredFile>;
    deleteFile(storeName: string, documentId: string): Promise<boolean>;
    createStore(displayName: string): Promise<FileSearchStore>;
    deleteStore(storeName: string): Promise<boolean>;
}

// ============================================
// Hook Implementation
// ============================================

export function useGeminiFileSystem(): UseGeminiFileSystemReturn {
    const { config } = useApp();

    const [stores, setStores] = useState<FileSearchStore[]>([]);
    const [currentStore, setCurrentStore] = useState<FileSearchStore | null>(null);
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [isLoadingStores, setIsLoadingStores] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper to dispatch log events (for Backend B logging)
    const dispatchLog = useCallback((type: 'request' | 'response' | 'error', title: string, data: unknown) => {
        window.dispatchEvent(new CustomEvent('workflow-log', {
            detail: { type, title, data }
        }));
    }, []);

    // Get client based on mockMode
    const client = useMemo<FileSystemClient>(() => {
        if (config.mockMode) {
            console.log('[useGeminiFileSystem] Using Mock client');
            const mockFs = getMockFileSystem();

            // Create a logging wrapper around mock client
            return {
                async listStores(): Promise<FileSearchStore[]> {
                    dispatchLog('request', '[Mock] ストア一覧取得', { action: 'list_stores' });
                    const result = await mockFs.listStores();
                    dispatchLog('response', '[Mock] ストア一覧', { count: result.length, stores: result.map(s => s.displayName) });
                    return result;
                },
                async listFiles(storeName: string): Promise<StoredFile[]> {
                    dispatchLog('request', '[Mock] ファイル一覧取得', { action: 'list_files', storeName });
                    const result = await mockFs.listFiles(storeName);
                    dispatchLog('response', '[Mock] ファイル一覧', { count: result.length, files: result.map(f => f.displayName) });
                    return result;
                },
                async uploadFile(storeName: string, file: File, displayName: string, metadata?: Record<string, string | number>): Promise<StoredFile> {
                    dispatchLog('request', '[Mock] ファイルアップロード', { action: 'upload_file', storeName, fileName: file.name, displayName, size: file.size, metadata });
                    const result = await mockFs.uploadFile(storeName, file, displayName, metadata);
                    dispatchLog('response', '[Mock] アップロード完了', { documentId: result.documentId, displayName: result.displayName });
                    return result;
                },
                async deleteFile(storeName: string, documentId: string): Promise<boolean> {
                    dispatchLog('request', '[Mock] ファイル削除', { action: 'delete_file', storeName, documentId });
                    const result = await mockFs.deleteFile(storeName, documentId);
                    dispatchLog('response', '[Mock] 削除完了', { success: result });
                    return result;
                },
                async createStore(displayName: string): Promise<FileSearchStore> {
                    dispatchLog('request', '[Mock] ストア作成', { action: 'create_store', displayName });
                    const result = await mockFs.createStore(displayName);
                    dispatchLog('response', '[Mock] ストア作成完了', { storeName: result.storeName, displayName: result.displayName });
                    return result;
                },
                async deleteStore(storeName: string): Promise<boolean> {
                    dispatchLog('request', '[Mock] ストア削除', { action: 'delete_store', storeName });
                    const result = await mockFs.deleteStore(storeName);
                    dispatchLog('response', '[Mock] ストア削除完了', { success: result });
                    return result;
                },
            };
        }
        console.log('[useGeminiFileSystem] Using Real API client');
        const workflowClient = new DifyWorkflowClient(
            config.baseUrl,
            config.workflowApiKey,
            config.userName
        );

        // Set up debug logging - logs go to console and can be picked up by WorkflowLogContext
        workflowClient.setLogCallback((type, title, data) => {
            // Emit custom event for WorkflowLogContext to pick up
            window.dispatchEvent(new CustomEvent('workflow-log', {
                detail: { type, title, data }
            }));
        });

        return workflowClient;
    }, [config.mockMode, config.baseUrl, config.workflowApiKey, config.userName, dispatchLog]);

    // Reset state when switching between mock and real
    useEffect(() => {
        setStores([]);
        setFiles([]);
        setCurrentStore(null);
        setError(null);
    }, [config.mockMode]);

    // ============================================
    // Store Actions
    // ============================================

    /**
     * Fetch all stores
     */
    const fetchStores = useCallback(async () => {
        setIsLoadingStores(true);
        setError(null);

        try {
            const storeList = await client.listStores();
            setStores(storeList);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ストア一覧の取得に失敗しました';
            setError(message);
            console.error('[useGeminiFileSystem] fetchStores error:', err);
        } finally {
            setIsLoadingStores(false);
        }
    }, [client]);

    /**
     * Select a store and fetch its files
     */
    const selectStore = useCallback((storeName: string | null) => {
        if (!storeName) {
            setCurrentStore(null);
            setFiles([]);
            return;
        }

        const store = stores.find(s => s.storeName === storeName);
        if (store) {
            setCurrentStore(store);
        }
    }, [stores]);

    /**
     * Create a new store
     */
    const createStore = useCallback(async (displayName: string): Promise<FileSearchStore | null> => {
        setIsLoadingStores(true);
        setError(null);

        try {
            const newStore = await client.createStore(displayName);
            setStores(prev => [...prev, newStore]);
            return newStore;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ストアの作成に失敗しました';
            setError(message);
            console.error('[useGeminiFileSystem] createStore error:', err);
            return null;
        } finally {
            setIsLoadingStores(false);
        }
    }, [client]);

    /**
     * Delete a store
     */
    const deleteStore = useCallback(async (storeName: string): Promise<boolean> => {
        setIsLoadingStores(true);
        setError(null);

        try {
            const success = await client.deleteStore(storeName);
            if (success) {
                setStores(prev => prev.filter(s => s.storeName !== storeName));
                if (currentStore?.storeName === storeName) {
                    setCurrentStore(null);
                    setFiles([]);
                }
            }
            return success;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ストアの削除に失敗しました';
            setError(message);
            console.error('[useGeminiFileSystem] deleteStore error:', err);
            return false;
        } finally {
            setIsLoadingStores(false);
        }
    }, [client, currentStore]);

    // ============================================
    // File Actions
    // ============================================

    /**
     * Fetch files in a store
     */
    const fetchFiles = useCallback(async (storeName: string) => {
        setIsLoadingFiles(true);
        setError(null);

        try {
            const fileList = await client.listFiles(storeName);
            setFiles(fileList);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ファイル一覧の取得に失敗しました';
            setError(message);
            console.error('[useGeminiFileSystem] fetchFiles error:', err);
        } finally {
            setIsLoadingFiles(false);
        }
    }, [client]);

    /**
     * Upload a file to the current store
     */
    const uploadFile = useCallback(async (
        file: File,
        metadata: Record<string, string | number> = {}
    ): Promise<StoredFile | null> => {
        if (!currentStore) {
            setError('ストアが選択されていません');
            return null;
        }

        setIsUploading(true);
        setError(null);

        try {
            // Display Name is always the original name
            const displayName = file.name;

            // Convert MD to TXT if necessary
            const fileToUpload = await convertMdToTxt(file);

            const newFile = await client.uploadFile(currentStore.storeName, fileToUpload, displayName, metadata);
            // Re-fetch files to ensure consistency (avoid duplicate entries from optimistic update)
            await fetchFiles(currentStore.storeName);
            return newFile;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ファイルのアップロードに失敗しました';
            setError(message);
            console.error('[useGeminiFileSystem] uploadFile error:', err);
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [client, currentStore, fetchFiles]);

    /**
     * Delete a file from the current store
     */
    const deleteFile = useCallback(async (documentId: string): Promise<boolean> => {
        if (!currentStore) {
            setError('ストアが選択されていません');
            return false;
        }

        setIsLoadingFiles(true);
        setError(null);

        try {
            const success = await client.deleteFile(currentStore.storeName, documentId);
            if (success) {
                setFiles(prev => prev.filter(f => f.documentId !== documentId));
            }
            return success;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'ファイルの削除に失敗しました';
            setError(message);
            console.error('[useGeminiFileSystem] deleteFile error:', err);
            return false;
        } finally {
            setIsLoadingFiles(false);
        }
    }, [client, currentStore]);

    // ============================================
    // Utility
    // ============================================

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============================================
    // Effects
    // ============================================

    // Fetch files when store changes
    useEffect(() => {
        if (currentStore) {
            fetchFiles(currentStore.storeName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStore?.storeName]);

    // Initial fetch of stores
    // Delay slightly to ensure WorkflowLogContext event listener is set up
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchStores();
        }, 50); // Small delay to ensure event listener is registered

        return () => clearTimeout(timeoutId);
    }, [fetchStores]);

    return {
        // State
        stores,
        currentStore,
        files,
        isLoading: isLoadingStores || isLoadingFiles, // Backward compatibility for now, but better to use specific ones
        isLoadingStores,
        isLoadingFiles,
        isUploading,
        error,

        // Store Actions
        fetchStores,
        selectStore,
        createStore,
        deleteStore,

        // File Actions
        fetchFiles,
        uploadFile,
        deleteFile,

        // Utility
        clearError,
    };
}

export default useGeminiFileSystem;
