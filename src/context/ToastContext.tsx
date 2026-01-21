/**
 * Toast Context
 * Provides toast notifications throughout the app
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Toast, type ToastType } from '../components/atoms/Toast';

// ============================================
// Types
// ============================================

interface ToastState {
    message: string;
    type: ToastType;
    id: number;
}

interface ToastContextValue {
    showToast: (message: string, type: ToastType) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
}

// ============================================
// Context
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface ToastProviderProps {
    children: ReactNode;
}

const AUTO_CLOSE_DELAY = 4000; // 4 seconds

export function ToastProvider({ children }: ToastProviderProps) {
    const [toast, setToast] = useState<ToastState | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Auto-close timer
    useEffect(() => {
        if (toast) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                // Clear toast after animation completes
                setTimeout(() => setToast(null), 300);
            }, AUTO_CLOSE_DELAY);
            return () => clearTimeout(timer);
        }
    }, [toast?.id]);

    const showToast = useCallback((message: string, type: ToastType) => {
        setToast({ message, type, id: Date.now() });
    }, []);

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success');
    }, [showToast]);

    const showError = useCallback((message: string) => {
        showToast(message, 'error');
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast(message, 'info');
    }, [showToast]);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => setToast(null), 300);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={isVisible}
                    onClose={handleClose}
                />
            )}
        </ToastContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
