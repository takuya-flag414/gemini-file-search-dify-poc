/**
 * Dify API Client
 * Handles communication with Dify Cloud API
 */

import type { WorkflowInputs, DifyStreamEvent, UploadedFile } from '../types';

// ============================================
// API Client Class
// ============================================

export class DifyApiClient {
    private baseUrl: string;
    private apiKey: string;
    private userId: string;

    constructor(baseUrl: string, apiKey: string, userId: string = 'poc-verifier') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = apiKey;
        this.userId = userId;
    }

    // ============================================
    // File Upload
    // ============================================

    async uploadFile(file: File): Promise<UploadedFile> {
        // Apply transparent file mutation for .md files
        const processedFile = await this.mutateFileIfNeeded(file);

        const formData = new FormData();
        formData.append('file', processedFile);
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
    // Transparent File Mutation
    // ============================================

    private async mutateFileIfNeeded(file: File): Promise<File> {
        // Check if file is .md (Markdown)
        if (/\.md$/i.test(file.name)) {
            // Read file content
            const content = await file.text();

            // Create new blob with text/plain MIME type
            const blob = new Blob([content], { type: 'text/plain' });

            // Create new file with .txt extension
            const newFileName = file.name.replace(/\.md$/i, '.txt');

            return new File([blob], newFileName, {
                type: 'text/plain',
                lastModified: file.lastModified,
            });
        }

        return file;
    }

    // ============================================
    // Chat Messages (Streaming)
    // ============================================

    async *sendChatMessage(
        inputs: WorkflowInputs,
        query: string,
        conversationId?: string
    ): AsyncGenerator<DifyStreamEvent, void, unknown> {
        const body = {
            inputs,
            query,
            response_mode: 'streaming',
            user: this.userId,
            conversation_id: conversationId || '',
        };

        const response = await fetch(`${this.baseUrl}/chat-messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `Request failed: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events from buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data) {
                            try {
                                const event = JSON.parse(data) as DifyStreamEvent;
                                yield event;
                            } catch (e) {
                                console.warn('Failed to parse SSE event:', data);
                            }
                        }
                    }
                }
            }

            // Process remaining buffer
            if (buffer.startsWith('data: ')) {
                const data = buffer.slice(6).trim();
                if (data) {
                    try {
                        const event = JSON.parse(data) as DifyStreamEvent;
                        yield event;
                    } catch (e) {
                        console.warn('Failed to parse final SSE event:', data);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // ============================================
    // Stop Generation
    // ============================================

    async stopGeneration(taskId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/chat-messages/${taskId}/stop`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: this.userId }),
        });

        if (!response.ok) {
            console.warn('Failed to stop generation');
        }
    }
}

// ============================================
// Factory Function
// ============================================

export function createDifyClient(baseUrl: string, apiKey: string, userId?: string): DifyApiClient {
    return new DifyApiClient(baseUrl, apiKey, userId);
}
