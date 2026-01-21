/**
 * Mock API Client
 * Provides the same interface as DifyApiClient but returns mock SSE events
 * This allows testing UI/UX without consuming API quota
 */

import type { WorkflowInputs, DifyStreamEvent, UploadedFile } from '../types';
import {
    delay,
    getMockResponseForOperation,
    getMockNodesForOperation,
    getMockCitationsIfApplicable,
    splitIntoChunks,
    generateMockWorkflowRunId,
    generateMockUploadResponse,
} from './mockResponses';

// ============================================
// Mock API Client Class
// ============================================

export class MockApiClient {
    // These fields are kept for interface compatibility with DifyApiClient
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _baseUrl: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _apiKey: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _userId: string;

    constructor(baseUrl: string, apiKey: string, userId: string = 'mock-user') {
        this._baseUrl = baseUrl;
        this._apiKey = apiKey;
        this._userId = userId;
    }

    // ============================================
    // File Upload (Mock)
    // ============================================

    async uploadFile(file: File): Promise<UploadedFile> {
        // Simulate upload delay
        await delay(500);

        // Return mock upload response
        return generateMockUploadResponse(file);
    }

    // ============================================
    // Chat Messages (Mock Streaming)
    // ============================================

    async *sendChatMessage(
        inputs: WorkflowInputs,
        query: string,
        _conversationId?: string
    ): AsyncGenerator<DifyStreamEvent, void, unknown> {
        const workflowRunId = generateMockWorkflowRunId();
        const mockTaskId = `mock-task-${Date.now()}`;
        const mockMessageId = `mock-msg-${Date.now()}`;
        const mockConversationId = `mock-conv-${Date.now()}`;
        const createdAt = Math.floor(Date.now() / 1000);

        // ============================================
        // 1. Workflow Started
        // ============================================
        yield {
            event: 'workflow_started',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: workflowRunId,
                workflow_id: 'mock-workflow-id',
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(300);

        // ============================================
        // 2. Start Node (User Input)
        // ============================================
        yield {
            event: 'node_started',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: 'node-start',
                node_id: '1766725010321',
                node_type: 'start',
                title: 'ユーザー入力',
                index: 0,
                inputs: inputs as unknown as Record<string, unknown>,
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(200);

        yield {
            event: 'node_finished',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: 'node-start',
                node_id: '1766725010321',
                node_type: 'start',
                title: 'ユーザー入力',
                index: 0,
                outputs: inputs as unknown as Record<string, unknown>,
                status: 'succeeded',
                elapsed_time: 0.1,
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(150);

        // ============================================
        // 3. IF-ELSE Branch Node
        // ============================================
        yield {
            event: 'node_started',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: 'node-ifelse',
                node_id: '1766728333106',
                node_type: 'if-else',
                title: 'create or delete or lookup',
                index: 1,
                inputs: { option: inputs.option },
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(200);

        yield {
            event: 'node_finished',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: 'node-ifelse',
                node_id: '1766728333106',
                node_type: 'if-else',
                title: 'create or delete or lookup',
                index: 1,
                outputs: { result: inputs.option },
                status: 'succeeded',
                elapsed_time: 0.05,
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(150);

        // ============================================
        // 4. Operation-specific Nodes
        // ============================================
        const mockNodes = getMockNodesForOperation(inputs.option);
        for (let i = 0; i < mockNodes.length; i++) {
            const node = mockNodes[i];

            yield {
                event: 'node_started',
                task_id: mockTaskId,
                workflow_run_id: workflowRunId,
                data: {
                    id: node.id,
                    node_id: node.node_id,
                    node_type: node.node_type,
                    title: node.title,
                    index: node.index,
                    created_at: createdAt,
                },
            } as DifyStreamEvent;
            await delay(300 + Math.random() * 200);

            yield {
                event: 'node_finished',
                task_id: mockTaskId,
                workflow_run_id: workflowRunId,
                data: {
                    id: node.id,
                    node_id: node.node_id,
                    node_type: node.node_type,
                    title: node.title,
                    index: node.index,
                    status: 'succeeded',
                    elapsed_time: 0.5 + Math.random() * 0.5,
                    created_at: createdAt,
                },
            } as DifyStreamEvent;
            await delay(150);
        }

        // ============================================
        // 5. Answer Node Started
        // ============================================
        yield {
            event: 'node_started',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: 'node-answer',
                node_id: 'answer',
                node_type: 'answer',
                title: '回答',
                index: mockNodes.length + 2,
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(100);

        // ============================================
        // 6. Message Events (Streaming)
        // ============================================
        const fullResponse = getMockResponseForOperation(inputs.option, {
            storeName: inputs.file_search_store_name,
            displayName: inputs.display_name,
            documentId: inputs.document_id,
            query: query,
        });

        const chunks = splitIntoChunks(fullResponse, 15);
        for (const chunk of chunks) {
            yield {
                event: 'message',
                task_id: mockTaskId,
                message_id: mockMessageId,
                conversation_id: mockConversationId,
                answer: chunk,
                created_at: createdAt,
            } as DifyStreamEvent;
            await delay(30 + Math.random() * 20);
        }

        // ============================================
        // 7. Answer Node Finished
        // ============================================
        yield {
            event: 'node_finished',
            task_id: mockTaskId,
            workflow_run_id: workflowRunId,
            data: {
                id: 'node-answer',
                node_id: 'answer',
                node_type: 'answer',
                title: '回答',
                index: mockNodes.length + 2,
                outputs: { answer: fullResponse },
                status: 'succeeded',
                elapsed_time: chunks.length * 0.03,
                created_at: createdAt,
            },
        } as DifyStreamEvent;
        await delay(100);

        // ============================================
        // 8. Message End
        // ============================================
        const citations = getMockCitationsIfApplicable(inputs.option);
        yield {
            event: 'message_end',
            task_id: mockTaskId,
            message_id: mockMessageId,
            conversation_id: mockConversationId,
            metadata: {
                usage: {
                    prompt_tokens: 500 + Math.floor(Math.random() * 500),
                    completion_tokens: fullResponse.length,
                    total_tokens: 500 + fullResponse.length,
                    total_price: '0.0012',
                    currency: 'USD',
                    latency: 1.5 + Math.random(),
                },
                retriever_resources: citations,
            },
        } as DifyStreamEvent;
    }

    // ============================================
    // Stop Generation (Mock - No-op)
    // ============================================

    async stopGeneration(_taskId: string): Promise<void> {
        // No-op for mock mode
        console.log('[MockApiClient] stopGeneration called (no-op)');
    }
}

// ============================================
// Factory Function
// ============================================

export function createMockClient(
    baseUrl: string = '',
    apiKey: string = '',
    userId?: string
): MockApiClient {
    return new MockApiClient(baseUrl, apiKey, userId);
}
