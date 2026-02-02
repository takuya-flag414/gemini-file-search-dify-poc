/**
 * MockFileSystem Service
 * Phase A: Mock implementation for file system operations
 * Simulates Gemini File Search API responses
 */

import type { FileSearchStore, StoredFile } from '../types';

// ============================================
// Initial Mock Data
// ============================================

const INITIAL_STORES: FileSearchStore[] = [
    {
        storeName: 'fileSearchStores/store-001',
        displayName: '製品ドキュメント',
        createdAt: '2026-01-15T09:00:00Z',
    },
    {
        storeName: 'fileSearchStores/store-002',
        displayName: '社内規定・マニュアル',
        createdAt: '2026-01-10T10:30:00Z',
    },
    {
        storeName: 'fileSearchStores/store-003',
        displayName: '議事録アーカイブ',
        createdAt: '2026-01-05T14:00:00Z',
    },
];

const INITIAL_FILES: Map<string, StoredFile[]> = new Map([
    ['fileSearchStores/store-001', [
        {
            documentId: 'doc-001-a',
            displayName: 'プロダクト仕様書_v2.0.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 2457600,
            createTime: '2026-01-18T11:30:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: '開発', metadata_filetype: '手引書' },
        },
        {
            documentId: 'doc-001-b',
            displayName: 'API設計書.md',
            mimeType: 'text/markdown',
            sizeBytes: 45320,
            createTime: '2026-01-17T09:15:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: '開発', metadata_filetype: '手引書' },
        },
        {
            documentId: 'doc-001-c',
            displayName: 'リリースノート_2026Q1.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            sizeBytes: 156780,
            createTime: '2026-01-19T16:45:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: 'マーケティング・広告', metadata_filetype: 'その他' },
        },
    ]],
    ['fileSearchStores/store-002', [
        {
            documentId: 'doc-002-a',
            displayName: '就業規則_2026年版.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 1234567,
            createTime: '2026-01-12T10:00:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: 'その他', metadata_filetype: '会社規定' },
        },
        {
            documentId: 'doc-002-b',
            displayName: 'セキュリティガイドライン.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 892340,
            createTime: '2026-01-08T14:30:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: '運用', metadata_filetype: '会社規定' },
        },
    ]],
    ['fileSearchStores/store-003', [
        {
            documentId: 'doc-003-a',
            displayName: '週次定例MTG_20260115.md',
            mimeType: 'text/markdown',
            sizeBytes: 12340,
            createTime: '2026-01-15T18:00:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: '開発', metadata_filetype: '議事録' },
        },
        {
            documentId: 'doc-003-b',
            displayName: 'プロジェクトキックオフ_20260110.md',
            mimeType: 'text/markdown',
            sizeBytes: 23456,
            createTime: '2026-01-10T17:30:00Z',
            state: 'ACTIVE',
            customMetadata: { metadata_company: 'アイフラッグ', metadata_department: '開発', metadata_filetype: '議事録' },
        },
    ]],
]);

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a random delay within range
 */
const randomDelay = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a unique ID
 */
const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15);
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'json': 'application/json',
        'xml': 'application/xml',
        'csv': 'text/csv',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

// ============================================
// MockFileSystem Class
// ============================================

export class MockFileSystem {
    private stores: Map<string, FileSearchStore>;
    private files: Map<string, StoredFile[]>;

    constructor() {
        // Initialize with mock data
        this.stores = new Map(INITIAL_STORES.map(s => [s.storeName, s]));
        this.files = new Map(INITIAL_FILES);
    }

    /**
     * List all stores
     * Latency: 500-800ms
     */
    async listStores(): Promise<FileSearchStore[]> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(500, 800)));
        return Array.from(this.stores.values());
    }

    /**
     * Get a specific store
     */
    async getStore(storeName: string): Promise<FileSearchStore | null> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(200, 400)));
        return this.stores.get(storeName) || null;
    }

    /**
     * Create a new store
     * Latency: 800-1200ms
     */
    async createStore(displayName: string): Promise<FileSearchStore> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(800, 1200)));

        const storeName = `fileSearchStores/${generateId()}`;
        const newStore: FileSearchStore = {
            storeName,
            displayName,
            createdAt: new Date().toISOString(),
        };

        this.stores.set(storeName, newStore);
        this.files.set(storeName, []);

        return newStore;
    }

    /**
     * Delete a store
     * Latency: 600-1000ms
     */
    async deleteStore(storeName: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(600, 1000)));

        if (!this.stores.has(storeName)) {
            return false;
        }

        this.stores.delete(storeName);
        this.files.delete(storeName);

        return true;
    }

    /**
     * List files in a store
     * Latency: 500-800ms
     */
    async listFiles(storeName: string): Promise<StoredFile[]> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(500, 800)));
        return this.files.get(storeName) || [];
    }

    /**
     * Get a specific file
     */
    async getFile(storeName: string, documentId: string): Promise<StoredFile | null> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(200, 400)));
        const storeFiles = this.files.get(storeName) || [];
        return storeFiles.find(f => f.documentId === documentId) || null;
    }

    /**
     * Upload a file to a store
     * Latency: 2000-4000ms (simulates processing)
     */
    async uploadFile(
        storeName: string,
        file: File,
        displayName: string,
        metadata: Record<string, string | number> = {}
    ): Promise<StoredFile> {
        // Simulate upload progress (faster for better UX)
        await new Promise(resolve => setTimeout(resolve, randomDelay(500, 1500)));

        if (!this.stores.has(storeName)) {
            throw new Error(`Store not found: ${storeName}`);
        }

        const storeFiles = this.files.get(storeName) || [];

        // Remove existing file with the same name to prevent duplicates
        const existingIndex = storeFiles.findIndex(f => f.displayName === displayName);
        if (existingIndex !== -1) {
            storeFiles.splice(existingIndex, 1);
        }

        const newFile: StoredFile = {
            documentId: `doc-${generateId()}`,
            displayName: displayName, // Use provided display name
            mimeType: getMimeType(file.name), // Use actual file name for MIME type (will show .txt for converted files)
            sizeBytes: file.size,
            createTime: new Date().toISOString(),
            state: 'ACTIVE',
            customMetadata: metadata,
        };

        storeFiles.push(newFile);
        this.files.set(storeName, storeFiles);

        return newFile;
    }

    /**
     * Delete a file from a store
     * Latency: 600-1000ms
     */
    async deleteFile(storeName: string, documentId: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, randomDelay(600, 1000)));

        const storeFiles = this.files.get(storeName);
        if (!storeFiles) {
            return false;
        }

        const index = storeFiles.findIndex(f => f.documentId === documentId);
        if (index === -1) {
            return false;
        }

        storeFiles.splice(index, 1);
        this.files.set(storeName, storeFiles);

        return true;
    }

    /**
     * Reset to initial state (for testing)
     */
    reset(): void {
        this.stores = new Map(INITIAL_STORES.map(s => [s.storeName, s]));
        this.files = new Map(INITIAL_FILES);
    }
}

// ============================================
// Singleton Instance
// ============================================

let mockFileSystemInstance: MockFileSystem | null = null;

export const getMockFileSystem = (): MockFileSystem => {
    if (!mockFileSystemInstance) {
        mockFileSystemInstance = new MockFileSystem();
    }
    return mockFileSystemInstance;
};

export const resetMockFileSystem = (): void => {
    mockFileSystemInstance = null;
};
