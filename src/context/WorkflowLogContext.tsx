/**
 * Workflow Log Context
 * Manages Backend B workflow debug logs for InspectorPanel
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LogEntry } from '../types';

// ============================================
// Context Types
// ============================================

interface WorkflowLogContextValue {
    logs: LogEntry[];
    addLog: (type: LogEntry['type'], title: string, data: unknown) => void;
    clearLogs: () => void;
}

// ============================================
// Context
// ============================================

const WorkflowLogContext = createContext<WorkflowLogContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface WorkflowLogProviderProps {
    children: ReactNode;
}

export function WorkflowLogProvider({ children }: WorkflowLogProviderProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = useCallback((type: LogEntry['type'], title: string, data: unknown) => {
        const entry: LogEntry = {
            id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            type,
            title,
            data,
            backendId: 'backend-b',  // Workflow backend
        };

        // Also log to console for debugging
        console.log(`[WorkflowLog] ${type.toUpperCase()}: ${title}`, data);

        setLogs(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    // Listen for workflow-log custom events from DifyWorkflowClient
    useEffect(() => {
        const handleWorkflowLog = (event: Event) => {
            const customEvent = event as CustomEvent<{ type: 'request' | 'response' | 'error'; title: string; data: unknown }>;
            addLog(customEvent.detail.type, customEvent.detail.title, customEvent.detail.data);
        };

        window.addEventListener('workflow-log', handleWorkflowLog);
        return () => window.removeEventListener('workflow-log', handleWorkflowLog);
    }, [addLog]);

    return (
        <WorkflowLogContext.Provider value={{ logs, addLog, clearLogs }}>
            {children}
        </WorkflowLogContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useWorkflowLog(): WorkflowLogContextValue {
    const context = useContext(WorkflowLogContext);
    if (!context) {
        throw new Error('useWorkflowLog must be used within a WorkflowLogProvider');
    }
    return context;
}

// ============================================
// Optional Hook (returns null if not in provider)
// ============================================

export function useWorkflowLogOptional(): WorkflowLogContextValue | null {
    return useContext(WorkflowLogContext);
}
