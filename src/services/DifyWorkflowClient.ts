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
            },
            response_mode: 'blocking',
            user: this.userId,
            ...(files && { files }),
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
        const result = this.parseResult<{ result: FileSearchStore[] }>(response);
        return result.result || [];
    }

    /**
     * List files in a store
     */
    async listFiles(storeName: string, pageToken?: string): Promise<StoredFile[]> {
        const response = await this.runWorkflow('list_files', { storeName, pageToken });
        const result = this.parseResult<{ result: StoredFile[] }>(response);
        return result.result || [];
    }

    /**
     * Upload a file to a store
     */
    async uploadFile(
        storeName: string,
        file: File,
        metadata: Record<string, string | number> = {}
    ): Promise<StoredFile> {
        // Step 1: Upload file to Dify temporary storage
        const uploadedFile = await this.uploadFileToDify(file);

        // Step 2: Convert metadata to API format
        const customMetadata = Object.entries(metadata).map(([key, value]) => ({
            key,
            string_value: String(value),
        }));

        // Step 3: Run upload workflow
        const response = await this.runWorkflow(
            'upload_file',
            {
                storeName,
                displayName: file.name,
                customMetadata,
            },
            [{
                type: 'document',
                transfer_method: 'local_file',
                upload_file_id: uploadedFile.id,
            }]
        );

        const result = this.parseResult<{ result: StoredFile[] }>(response);

        // Return first file (upload returns array with single item)
        if (!result.result || result.result.length === 0) {
            throw new Error('Upload succeeded but no file returned');
        }

        return result.result[0];
    }

    /**
     * Delete a file from a store
     */
    async deleteFile(storeName: string, documentId: string): Promise<boolean> {
        const response = await this.runWorkflow('delete_file', { storeName, documentId });
        const result = this.parseResult<{ result: { success: boolean } }>(response);
        return result.result?.success ?? false;
    }

    /**
     * Delete a store
     */
    async deleteStore(storeName: string): Promise<boolean> {
        const response = await this.runWorkflow('delete_store', { storeName });
        const result = this.parseResult<{ result: { success: boolean } }>(response);
        return result.result?.success ?? false;
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
    async createStore(_displayName: string): Promise<FileSearchStore> {
        throw new Error('createStore not implemented in Backend B workflow');
    }

    /**
     * Get a specific file (filter from list)
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
