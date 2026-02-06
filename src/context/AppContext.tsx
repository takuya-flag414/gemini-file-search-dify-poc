import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppConfig, HistoryEntry } from '../types';
import { DEFAULT_CONFIG } from '../types';

// ============================================
// Context Types
// ============================================

interface AppContextValue {
    // Config
    config: AppConfig;
    updateConfig: (config: Partial<AppConfig>) => void;
    isConfigured: boolean;

    // Mock Mode
    toggleMockMode: () => void;

    // History
    history: HistoryEntry[];
    addHistoryEntry: (entry: HistoryEntry) => void;
    clearHistory: () => void;

    // Theme
    isDarkMode: boolean;
    toggleDarkMode: () => void;

    // Inspector
    isInspectorOpen: boolean;
    toggleInspector: () => void;

    // Chat Panel (legacy - kept for compatibility)
    isChatPanelOpen: boolean;
    toggleChatPanel: () => void;
    openChatPanel: () => void;

    // Right Panel (unified Chat + Inspector)
    isRightPanelOpen: boolean;
    toggleRightPanel: () => void;
    isRightPanelExpanded: boolean;
    toggleRightPanelExpanded: () => void;

    // Selected Store (Context Injection)
    selectedStoreId: string | null;
    selectedStoreName: string | null;
    setSelectedStore: (storeId: string | null, storeName: string | null) => void;
    clearSelectedStore: () => void;

    // Session Conversation (Chat Continuity)
    sessionConversationId: string | null;
    setSessionConversationId: (id: string | null) => void;
    clearSessionConversation: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEYS = {
    CONFIG: 'dify_app_config_v1',
    HISTORY: 'dify_app_history_v1',
    DARK_MODE: 'dify_app_dark_mode',
    SESSION_CONVERSATION_ID: 'dify_session_conversation_id',
};

// ============================================
// Provider Component
// ============================================

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    // Config State
    const [config, setConfig] = useState<AppConfig>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
            if (stored) {
                return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to parse config from localStorage:', e);
        }
        return DEFAULT_CONFIG;
    });

    // History State
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to parse history from localStorage:', e);
        }
        return [];
    });

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
            if (stored !== null) {
                return stored === 'true';
            }
            // Default to system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch {
            return false;
        }
    });

    // Inspector State
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);

    // Chat Panel State (legacy - kept for compatibility)
    const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

    // Right Panel State (unified toggle for the right panel)
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(false);

    // Selected Store State (Context Injection)
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [selectedStoreName, setSelectedStoreName] = useState<string | null>(null);

    // Session Conversation State (Chat Continuity)
    const [sessionConversationId, setSessionConversationIdState] = useState<string | null>(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_CONVERSATION_ID);
            return stored || null;
        } catch {
            return null;
        }
    });

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDarkMode));
    }, [isDarkMode]);

    // Persist config to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }, [config]);

    // Persist history to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }, [history]);

    // Check if configured
    const isConfigured = Boolean(config.apiKey && config.apiKey.startsWith('app-'));

    // Update config
    const updateConfig = useCallback((updates: Partial<AppConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    // Add history entry
    const addHistoryEntry = useCallback((entry: HistoryEntry) => {
        setHistory(prev => [entry, ...prev].slice(0, 50)); // Keep last 50 entries
    }, []);

    // Clear history
    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // Toggle inspector
    const toggleInspector = useCallback(() => {
        setIsInspectorOpen(prev => !prev);
    }, []);

    // Toggle chat panel (legacy)
    const toggleChatPanel = useCallback(() => {
        setIsChatPanelOpen(prev => !prev);
    }, []);

    // Open chat panel (for workflow execution - legacy)
    const openChatPanel = useCallback(() => {
        setIsChatPanelOpen(true);
    }, []);

    // Toggle right panel (unified Chat + Inspector)
    const toggleRightPanel = useCallback(() => {
        setIsRightPanelOpen(prev => {
            const willClose = prev;
            // Reset expanded state when closing the panel
            if (willClose) {
                setIsRightPanelExpanded(false);
            }
            return !prev;
        });
    }, []);

    // Toggle right panel expanded (maximize/minimize)
    const toggleRightPanelExpanded = useCallback(() => {
        setIsRightPanelExpanded(prev => !prev);
    }, []);

    // Toggle mock mode
    const toggleMockMode = useCallback(() => {
        setConfig(prev => ({ ...prev, mockMode: !prev.mockMode }));
    }, []);

    // Set selected store
    const setSelectedStore = useCallback((storeId: string | null, storeName: string | null) => {
        setSelectedStoreId(storeId);
        setSelectedStoreName(storeName);
    }, []);

    // Clear selected store
    const clearSelectedStore = useCallback(() => {
        setSelectedStoreId(null);
        setSelectedStoreName(null);
    }, []);

    // Set session conversation ID
    const setSessionConversationId = useCallback((id: string | null) => {
        setSessionConversationIdState(id);
        try {
            if (id) {
                sessionStorage.setItem(STORAGE_KEYS.SESSION_CONVERSATION_ID, id);
            } else {
                sessionStorage.removeItem(STORAGE_KEYS.SESSION_CONVERSATION_ID);
            }
        } catch (e) {
            console.warn('Failed to save session conversation ID to sessionStorage:', e);
        }
    }, []);

    // Clear session conversation (start new conversation)
    const clearSessionConversation = useCallback(() => {
        setSessionConversationIdState(null);
        try {
            sessionStorage.removeItem(STORAGE_KEYS.SESSION_CONVERSATION_ID);
        } catch (e) {
            console.warn('Failed to clear session conversation ID from sessionStorage:', e);
        }
    }, []);

    const value: AppContextValue = {
        config,
        updateConfig,
        isConfigured,
        toggleMockMode,
        history,
        addHistoryEntry,
        clearHistory,
        isDarkMode,
        toggleDarkMode,
        isInspectorOpen,
        toggleInspector,
        isChatPanelOpen,
        toggleChatPanel,
        openChatPanel,
        isRightPanelOpen,
        toggleRightPanel,
        isRightPanelExpanded,
        toggleRightPanelExpanded,
        selectedStoreId,
        selectedStoreName,
        setSelectedStore,
        clearSelectedStore,
        sessionConversationId,
        setSessionConversationId,
        clearSessionConversation,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useApp(): AppContextValue {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
