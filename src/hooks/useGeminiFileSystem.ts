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
    uploadFile(storeName: string, file: File, metadata?: Record<string, string | number>): Promise<StoredFile>;
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

    // Get client based on mockMode
    const client = useMemo<FileSystemClient>(() => {
        if (config.mockMode) {
            console.log('[useGeminiFileSystem] Using Mock client');
            return getMockFileSystem();
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
    }, [config.mockMode, config.baseUrl, config.workflowApiKey, config.userName]);

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
            const newFile = await client.uploadFile(currentStore.storeName, file, metadata);
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
    useEffect(() => {
        fetchStores();
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
