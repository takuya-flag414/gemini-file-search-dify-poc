import { useState, useCallback, useRef } from 'react';
import { createDifyClient } from '../services/DifyApiClient';
import { useApp } from '../context/AppContext';
import type {
    WorkflowInputs,
    ChatMessage,
    LogEntry,
    HistoryEntry,
    DifyMessageEvent,
    DifyMessageEndEvent,
    DifyNodeStartedEvent,
    DifyNodeFinishedEvent,
} from '../types';

// ============================================
// Hook Return Type
// ============================================

interface UseDifyStreamReturn {
    messages: ChatMessage[];
    logs: LogEntry[];
    thinkingSteps: string[];
    isProcessing: boolean;
    error: string | null;
    sendMessage: (inputs: WorkflowInputs, query: string) => Promise<void>;
    uploadFile: (file: File) => Promise<string | null>;
    clearMessages: () => void;
}

// ============================================
// Generate ID Helper
// ============================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Hook Implementation
// ============================================

export function useDifyStream(): UseDifyStreamReturn {
    const { config, addHistoryEntry, sessionConversationId, setSessionConversationId } = useApp();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentMessageIdRef = useRef<string | null>(null);

    // Add log entry
    const addLog = useCallback((type: LogEntry['type'], title: string, data: unknown) => {
        const entry: LogEntry = {
            id: generateId(),
            timestamp: Date.now(),
            type,
            title,
            data,
        };
        setLogs(prev => [...prev, entry]);
        return entry;
    }, []);

    // Upload file
    const uploadFile = useCallback(async (file: File): Promise<string | null> => {
        // Skip API key check if mock mode is enabled
        if (!config.mockMode && !config.apiKey) {
            setError('API Key が設定されていません');
            return null;
        }

        try {
            const client = createDifyClient(config.baseUrl, config.apiKey, undefined, config.mockMode);
            addLog('request', `ファイルアップロード: ${file.name}${config.mockMode ? ' [Mock]' : ''}`, {
                name: file.name,
                size: file.size,
                type: file.type,
                mockMode: config.mockMode,
            });

            const result = await client.uploadFile(file);

            addLog('response', 'アップロード完了', result);
            return result.id;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'アップロードに失敗しました';
            addLog('error', 'アップロードエラー', { error: message });
            setError(message);
            return null;
        }
    }, [config, addLog]);

    // Send message
    const sendMessage = useCallback(async (inputs: WorkflowInputs, query: string) => {
        // Skip API key check if mock mode is enabled
        if (!config.mockMode && !config.apiKey) {
            setError('API Key が設定されていません');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setThinkingSteps([]);

        // Add user message
        const userMessageId = generateId();
        const userMessage: ChatMessage = {
            id: userMessageId,
            role: 'user',
            content: `モード: ${inputs.option}\n${query}`,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Log request
        addLog('request', `ワークフロー実行: ${inputs.option}`, { inputs, query });

        // Create assistant message placeholder
        const assistantMessageId = generateId();
        currentMessageIdRef.current = assistantMessageId;

        const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isStreaming: true,
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            const client = createDifyClient(config.baseUrl, config.apiKey, undefined, config.mockMode);
            let fullContent = '';
            let citations: ChatMessage['citations'] = [];
            let conversationId: string | undefined;

            for await (const event of client.sendChatMessage(inputs, query, sessionConversationId || undefined)) {
                // Handle different event types
                switch (event.event) {
                    case 'message': {
                        const msgEvent = event as DifyMessageEvent;
                        fullContent += msgEvent.answer;

                        setMessages(prev => prev.map(msg =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: fullContent }
                                : msg
                        ));
                        break;
                    }

                    case 'message_end': {
                        const endEvent = event as DifyMessageEndEvent;
                        conversationId = endEvent.conversation_id;

                        // Save conversation ID for session continuity
                        if (conversationId) {
                            setSessionConversationId(conversationId);
                        }

                        if (endEvent.metadata?.retriever_resources) {
                            citations = endEvent.metadata.retriever_resources;
                        }

                        addLog('response', 'ワークフロー完了', endEvent.metadata);
                        break;
                    }

                    case 'node_started': {
                        const nodeEvent = event as DifyNodeStartedEvent;
                        const stepName = nodeEvent.data.title;
                        setThinkingSteps(prev => [...prev, stepName]);
                        addLog('node', `ノード開始: ${stepName}`, nodeEvent.data);
                        break;
                    }

                    case 'node_finished': {
                        const nodeEvent = event as DifyNodeFinishedEvent;
                        addLog('node', `ノード完了: ${nodeEvent.data.title}`, nodeEvent.data);
                        break;
                    }

                    case 'workflow_started': {
                        addLog('system', 'ワークフロー開始', event);
                        break;
                    }

                    case 'error': {
                        addLog('error', 'エラー発生', event);
                        throw new Error((event as { message: string }).message);
                    }
                }
            }

            // Finalize message
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, content: fullContent, citations, isStreaming: false }
                    : msg
            ));

            setThinkingSteps([]);

            // Add to history
            const historyEntry: HistoryEntry = {
                id: generateId(),
                timestamp: Date.now(),
                inputs,
                query,
                response: fullContent,
                logs: [...logs],
                conversationId,
            };
            addHistoryEntry(historyEntry);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'リクエストに失敗しました';
            addLog('error', 'エラー', { error: message });
            setError(message);

            // Update message to show error
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, content: `エラー: ${message}`, isStreaming: false }
                    : msg
            ));
        } finally {
            setIsProcessing(false);
            currentMessageIdRef.current = null;
        }
    }, [config, addLog, addHistoryEntry, logs, sessionConversationId, setSessionConversationId]);

    // Clear messages
    const clearMessages = useCallback(() => {
        setMessages([]);
        setLogs([]);
        setThinkingSteps([]);
        setError(null);
    }, []);

    return {
        messages,
        logs,
        thinkingSteps,
        isProcessing,
        error,
        sendMessage,
        uploadFile,
        clearMessages,
    };
}
