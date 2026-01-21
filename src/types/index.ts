/**
 * Type definitions for Gemini File Search PoC
 */

// ============================================
// App Configuration Types
// ============================================

export interface AppConfig {
    apiKey: string;
    workflowApiKey: string;  // Backend B (Workflow) API Key
    baseUrl: string;
    userName: string;
    mockMode: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
    apiKey: '',
    workflowApiKey: '',
    baseUrl: 'https://api.dify.ai/v1',
    userName: 'poc-verifier',
    mockMode: false,
};

// ============================================
// Workflow Input Types
// ============================================

export type OperationMode =
    | 'ファイル内を検索する'
    | 'ファイルをアップロードする？'
    | 'ファイル検索ストアを作成する？'
    | 'ファイルを削除する？'
    | 'ファイル検索ストアを削除する？'
    | 'ファイル検索ストアの一覧を表示する？'
    | 'ストア内のファイルの一覧を表示する？';

export const OPERATION_MODES: { value: OperationMode; label: string; requiresStoreName: boolean; requiresFile: boolean; isDangerous: boolean }[] = [
    { value: 'ファイル内を検索する', label: 'ファイル内を検索する', requiresStoreName: true, requiresFile: false, isDangerous: false },
    { value: 'ファイルをアップロードする？', label: 'ファイルをアップロードする', requiresStoreName: true, requiresFile: true, isDangerous: false },
    { value: 'ファイル検索ストアを作成する？', label: 'ファイル検索ストアを作成する', requiresStoreName: false, requiresFile: false, isDangerous: false },
    { value: 'ファイルを削除する？', label: 'ファイルを削除する', requiresStoreName: true, requiresFile: false, isDangerous: true },
    { value: 'ファイル検索ストアを削除する？', label: 'ファイル検索ストアを削除する', requiresStoreName: true, requiresFile: false, isDangerous: true },
    { value: 'ファイル検索ストアの一覧を表示する？', label: 'ファイル検索ストアの一覧を表示', requiresStoreName: false, requiresFile: false, isDangerous: false },
    { value: 'ストア内のファイルの一覧を表示する？', label: 'ストア内のファイル一覧を表示', requiresStoreName: true, requiresFile: false, isDangerous: false },
];

export interface FileInput {
    type: 'document';
    transfer_method: 'local_file' | 'remote_url';
    upload_file_id?: string;
    url?: string;
}

export interface WorkflowInputs {
    option: OperationMode;
    file_search_store_name?: string;
    display_name?: string;
    document_id?: string;
    file?: FileInput;
    metadata_company?: string;
    metadata_department?: string;
    metadata_filetype?: string;
}

// Metadata options from workflow
export const METADATA_OPTIONS = {
    company: ['アイフラッグ', 'EPARKリラク＆エステ', 'EPARKペットライフ'],
    department: ['営業', 'マーケティング・広告', '開発', '運用', 'コンタクトセンター', 'その他'],
    filetype: ['会社規定', '議事録', '手引書', 'その他'],
};

// ============================================
// Chat Message Types
// ============================================

export interface Citation {
    position: number;
    dataset_id: string;
    dataset_name: string;
    document_id: string;
    document_name: string;
    segment_id: string;
    score: number;
    content: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    timestamp: number;
    isStreaming?: boolean;
    thinkingSteps?: string[];
}

// ============================================
// Log Entry Types
// ============================================

export type LogEntryType = 'request' | 'response' | 'system' | 'error' | 'node';

export interface LogEntry {
    id: string;
    timestamp: number;
    type: LogEntryType;
    title: string;
    data: unknown;
}

// ============================================
// Dify API Event Types
// ============================================

export interface DifyBaseEvent {
    event: string;
    task_id?: string;
    message_id?: string;
    conversation_id?: string;
}

export interface DifyMessageEvent extends DifyBaseEvent {
    event: 'message';
    answer: string;
    created_at: number;
}

export interface DifyMessageEndEvent extends DifyBaseEvent {
    event: 'message_end';
    metadata?: {
        usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
            total_price: string;
            currency: string;
            latency: number;
        };
        retriever_resources?: Citation[];
    };
}

export interface DifyWorkflowStartedEvent extends DifyBaseEvent {
    event: 'workflow_started';
    workflow_run_id: string;
    data: {
        id: string;
        workflow_id: string;
        created_at: number;
    };
}

export interface DifyNodeStartedEvent extends DifyBaseEvent {
    event: 'node_started';
    workflow_run_id: string;
    data: {
        id: string;
        node_id: string;
        node_type: string;
        title: string;
        index: number;
        predecessor_node_id?: string;
        inputs?: Record<string, unknown>;
        created_at: number;
    };
}

export interface DifyNodeFinishedEvent extends DifyBaseEvent {
    event: 'node_finished';
    workflow_run_id: string;
    data: {
        id: string;
        node_id: string;
        node_type: string;
        title: string;
        index: number;
        predecessor_node_id?: string;
        inputs?: Record<string, unknown>;
        outputs?: Record<string, unknown>;
        status: 'running' | 'succeeded' | 'failed' | 'stopped';
        error?: string;
        elapsed_time?: number;
        execution_metadata?: {
            total_tokens?: number;
            total_price?: string;
            currency?: string;
        };
        created_at: number;
    };
}

export interface DifyErrorEvent extends DifyBaseEvent {
    event: 'error';
    status: number;
    code: string;
    message: string;
}

export type DifyStreamEvent =
    | DifyMessageEvent
    | DifyMessageEndEvent
    | DifyWorkflowStartedEvent
    | DifyNodeStartedEvent
    | DifyNodeFinishedEvent
    | DifyErrorEvent
    | { event: 'ping' };

// ============================================
// File Upload Types
// ============================================

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    extension: string;
    mime_type: string;
    created_at: number;
}

// ============================================
// History Types
// ============================================

export interface HistoryEntry {
    id: string;
    timestamp: number;
    inputs: WorkflowInputs;
    query?: string;
    response: string;
    logs: LogEntry[];
    conversationId?: string;
}

// ============================================
// App State
// ============================================

export interface AppState {
    config: AppConfig;
    history: HistoryEntry[];
}

// ============================================
// Phase A: File System Types (Dual Backend)
// ============================================

/**
 * Represents a Gemini File Search Store
 * Used in Phase A (Mock) and Phase B (Real API)
 */
export type FileSearchStore = {
    storeName: string;      // e.g. "fileSearchStores/abc12345"
    displayName: string;    // e.g. "Product Specs 2024"
    createdAt: string;
};

/**
 * Represents a file stored in a FileSearchStore
 */
export type StoredFile = {
    documentId: string;     // Internal ID or resource name
    displayName: string;
    mimeType: string;
    sizeBytes: number;
    createTime: string;
    state: 'ACTIVE' | 'PROCESSING' | 'FAILED';
    customMetadata: Record<string, string | number>;
};

/**
 * Workflow Execution Response from Backend B
 */
export type WorkflowResponse<T> = {
    status: 'succeeded' | 'failed';
    data: {
        result: T;
    };
};

/**
 * View mode for Knowledge Finder
 */
export type FinderViewMode = 'grid' | 'list';

/**
 * App view mode - Chat or Finder
 */
export type AppViewMode = 'chat' | 'finder';

// ============================================
// Backend B Workflow Types
// ============================================

/**
 * Workflow action types for Backend B
 */
export type WorkflowAction =
    | 'list_stores'
    | 'list_files'
    | 'upload_file'
    | 'delete_file'
    | 'create_store'
    | 'delete_store';

/**
 * Payload structure for workflow actions
 */
export interface WorkflowPayload {
    storeName?: string;
    displayName?: string;
    documentId?: string;
    pageToken?: string;
    customMetadata?: Array<{ key: string; string_value: string }>;
}

/**
 * Workflow run request body
 */
export interface WorkflowRunRequest {
    inputs: {
        action: WorkflowAction;
        payload: string; // JSON string
    };
    response_mode: 'blocking' | 'streaming';
    user: string;
    files?: Array<{
        type: 'document';
        transfer_method: 'local_file';
        upload_file_id: string;
    }>;
}

/**
 * Workflow run response (blocking mode)
 */
export interface WorkflowRunResponse {
    workflow_run_id: string;
    task_id: string;
    data: {
        id: string;
        workflow_id: string;
        status: 'running' | 'succeeded' | 'failed' | 'stopped';
        outputs?: {
            result: string | unknown; // Can be JSON string or already-parsed object/array
        };
        error?: string;
        elapsed_time?: number;
        total_tokens?: number;
        created_at: number;
        finished_at: number;
    };
}
