/**
 * Dify Workflow Client
 * Backend B API Client for file system operations
 * Uses POST /workflows/run endpoint with blocking mode
 */

import type {
    WorkflowAction,
    WorkflowPayload,
    WorkflowRunResponse,
    FileSearchStore,
    StoredFile,
    UploadedFile,
} from '../types';

// ============================================
// Client Class
// ============================================

export class DifyWorkflowClient {
    private baseUrl: string;
    private apiKey: string;
    private userId: string;

    constructor(baseUrl: string, apiKey: string, userId: string = 'poc-verifier') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = apiKey;
        this.userId = userId;
    }

    // ============================================
    // File Upload (Dify Temporary File)
    // ============================================

    /**
     * Upload a file to Dify's temporary storage
     * Required before using files in workflow
     */
    async uploadFileToDify(file: File): Promise<UploadedFile> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', this.userId);

        const response = await fetch(`${this.baseUrl}/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || `Upload failed: ${response.status}`);
        }

        return response.json();
    }

    // ============================================
    // Workflow Execution
    // ============================================

    /**
     * Log callback type for debugging
     */
    private logCallback?: (type: 'request' | 'response' | 'error', title: string, data: unknown) => void;

    /**
     * Set log callback for debugging
     */
    setLogCallback(callback: (type: 'request' | 'response' | 'error', title: string, data: unknown) => void) {
        this.logCallback = callback;
    }

    /**
     * Internal log helper
     */
    private log(type: 'request' | 'response' | 'error', title: string, data: unknown) {
        if (this.logCallback) {
            this.logCallback(type, title, data);
        }
        // Always console.log for developer tools
        console.log(`[DifyWorkflowClient] ${type.toUpperCase()}: ${title}`, data);
    }

    /**
     * Run workflow with given action and payload
     */
    async runWorkflow(
        action: WorkflowAction,
        payload: WorkflowPayload,
        files?: Array<{ type: 'document'; transfer_method: 'local_file'; upload_file_id: string }>
    ): Promise<WorkflowRunResponse> {
        const body = {
            inputs: {
                action,
                payload: JSON.stringify(payload),
                // Files must be inside inputs.file, not at top level
                ...(files && { file: files }),
            },
            response_mode: 'blocking',
            user: this.userId,
        };

        // Log request
        this.log('request', `Workflow: ${action}`, {
            action,
            payload,
            files: files?.length || 0,
            url: `${this.baseUrl}/workflows/run`,
        });

        try {
            const response = await fetch(`${this.baseUrl}/workflows/run`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Workflow execution failed' }));
                this.log('error', `Workflow Failed: ${action}`, {
                    status: response.status,
                    statusText: response.statusText,
                    error,
                });
                throw new Error(error.message || `Workflow failed: ${response.status}`);
            }

            const result: WorkflowRunResponse = await response.json();

            // Log full response
            this.log('response', `Workflow Response: ${action}`, {
                status: result.data?.status,
                workflow_run_id: result.workflow_run_id,
                outputs: result.data?.outputs,
                error: result.data?.error,
                elapsed_time: result.data?.elapsed_time,
            });

            return result;
        } catch (err) {
            this.log('error', `Workflow Exception: ${action}`, {
                message: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
            });
            throw err;
        }
    }

    /**
     * Normalize file state from Backend B format to frontend format
     * STATE_ACTIVE → ACTIVE, STATE_PROCESSING → PROCESSING, STATE_FAILED → FAILED
     */
    private normalizeFileState(state: string): 'ACTIVE' | 'PROCESSING' | 'FAILED' {
        if (state === 'STATE_ACTIVE') return 'ACTIVE';
        if (state === 'STATE_PROCESSING') return 'PROCESSING';
        if (state === 'STATE_FAILED') return 'FAILED';
        // Fallback: already normalized or unknown
        return state as 'ACTIVE' | 'PROCESSING' | 'FAILED';
    }

    /**
     * Normalize a single StoredFile from Backend B response
     */
    private normalizeStoredFile(file: StoredFile): StoredFile {
        return {
            ...file,
            state: this.normalizeFileState(file.state as string),
        };
    }

    /**
     * Parse workflow result
     * Handles both JSON string and already-parsed object responses
     */
    private parseResult<T>(response: WorkflowRunResponse): T {
        if (response.data.status !== 'succeeded') {
            throw new Error(response.data.error || 'Workflow execution failed');
        }

        const output = response.data.outputs?.result;
        if (output === undefined || output === null) {
            throw new Error('No result in workflow output');
        }

        // If result is already an object/array, return it directly
        if (typeof output !== 'string') {
            console.log('[DifyWorkflowClient] Result is already parsed:', typeof output);
            return output as T;
        }

        // If result is a string, try to parse it as JSON
        try {
            return JSON.parse(output) as T;
        } catch {
            throw new Error('Failed to parse workflow result JSON');
        }
    }

    // ============================================
    // Convenience Methods (Same interface as MockFileSystem)
    // ============================================

    /**
     * List all file search stores
     */
    async listStores(): Promise<FileSearchStore[]> {
        const response = await this.runWorkflow('list_stores', {});
        // Backend Bのレスポンスでは outputs.result が直接 FileSearchStore[] 配列
        const result = this.parseResult<FileSearchStore[]>(response);
        return result || [];
    }

    /**
     * List files in a store
     */
    async listFiles(storeName: string, pageToken?: string): Promise<StoredFile[]> {
        const response = await this.runWorkflow('list_files', { storeName, pageToken });
        // Backend Bのレスポンスでは outputs.result が直接 StoredFile[] 配列
        const result = this.parseResult<StoredFile[]>(response);
        // state値を正規化 (STATE_ACTIVE → ACTIVE)
        return (result || []).map(file => this.normalizeStoredFile(file));
    }

    /**
     * Upload a file to a store
     */
    async uploadFile(
        storeName: string,
        file: File,
        displayName: string,
        metadata: Record<string, string | number> = {}
    ): Promise<StoredFile> {
        // Step 1: Upload file to Dify temporary storage
        const uploadedFile = await this.uploadFileToDify(file);

        // Step 2: Convert metadata to API format
        const metadataItems = Object.entries(metadata).map(([key, value]) => ({
            key,
            string_value: String(value),
        }));

        // Step 3: Build filesMetadata (filename-keyed dictionary)
        const filesMetadata: Record<string, Array<{ key: string; string_value: string }>> = {};
        if (metadataItems.length > 0) {
            filesMetadata[file.name] = metadataItems;
        }

        // Step 4: Run upload workflow
        const response = await this.runWorkflow(
            'upload_file',
            {
                storeName,
                displayName: displayName, // Use separate display name
                filesMetadata,
            },
            [{
                type: 'document',
                transfer_method: 'local_file',
                upload_file_id: uploadedFile.id,
            }]
        );

        // Backend B returns outputs.result as a flat StoredFile array
        // Note: Backend B may return an empty array on success (upload_file doesn't always return file info)
        const result = this.parseResult<StoredFile[]>(response);

        // Return first file if available, otherwise construct a placeholder
        if (result && result.length > 0) {
            return this.normalizeStoredFile(result[0]);
        }

        // Backend B upload succeeded but returned empty result
        // Construct a minimal placeholder — real data will be fetched by list_files
        console.log('[DifyWorkflowClient] Upload succeeded with empty result, constructing placeholder');
        return {
            documentId: `pending-${Date.now()}`,
            displayName,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            createTime: new Date().toISOString(),
            state: 'PROCESSING' as const,
            customMetadata: metadata,
        } as StoredFile;
    }

    /**
     * Delete a file from a store
     */
    async deleteFile(storeName: string, documentId: string): Promise<boolean> {
        const response = await this.runWorkflow('delete_file', { storeName, documentId });
        // Backend B returns outputs.result as [{ success: boolean }]
        const result = this.parseResult<Array<{ success: boolean }>>(response);
        return result[0]?.success ?? false;
    }

    /**
     * Delete a store
     */
    async deleteStore(storeName: string): Promise<boolean> {
        const response = await this.runWorkflow('delete_store', { storeName });
        // Backend B returns outputs.result as [{ success: boolean }]
        const result = this.parseResult<Array<{ success: boolean }>>(response);
        return result[0]?.success ?? false;
    }

    /**
     * Get a specific store (filter from list)
     */
    async getStore(storeName: string): Promise<FileSearchStore | null> {
        const stores = await this.listStores();
        return stores.find(s => s.storeName === storeName) || null;
    }

    /**
     * Create a new store
     * Note: This action is not defined in Backend B YAML, 
     * would need to be added if required
     */
    async createStore(displayName: string): Promise<FileSearchStore> {
        const response = await this.runWorkflow('create_store', { displayName });
        // Backend B returns outputs.result as a flat FileSearchStore object (or array)
        // Adjust based on actual response if needed, but assuming similar pattern to upload
        const result = this.parseResult<FileSearchStore[]>(response);

        if (!result || result.length === 0) {
            throw new Error('Store creation succeeded but no store returned');
        }
        return result[0];
    }

    /**
     * Get a specific file (filter from list)
     * Note: listFiles already normalizes the state values
     */
    async getFile(storeName: string, documentId: string): Promise<StoredFile | null> {
        const files = await this.listFiles(storeName);
        return files.find(f => f.documentId === documentId) || null;
    }
}

// ============================================
// Factory Function
// ============================================

export function createWorkflowClient(
    baseUrl: string,
    apiKey: string,
    userId?: string
): DifyWorkflowClient {
    return new DifyWorkflowClient(baseUrl, apiKey, userId);
}
