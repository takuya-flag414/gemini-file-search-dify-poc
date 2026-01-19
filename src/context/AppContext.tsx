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
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEYS = {
    CONFIG: 'dify_app_config_v1',
    HISTORY: 'dify_app_history_v1',
    DARK_MODE: 'dify_app_dark_mode',
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
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);

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

    const value: AppContextValue = {
        config,
        updateConfig,
        isConfigured,
        history,
        addHistoryEntry,
        clearHistory,
        isDarkMode,
        toggleDarkMode,
        isInspectorOpen,
        toggleInspector,
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
