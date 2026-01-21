/**
 * Toast Component
 * macOS Sequoia-style toast notification
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// ============================================
// Types
// ============================================

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

// ============================================
// Icon Map
// ============================================

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
};

const COLORS = {
    success: {
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        border: 'border-green-500/30',
        icon: 'text-green-500',
        text: 'text-green-700 dark:text-green-300',
    },
    error: {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        border: 'border-red-500/30',
        icon: 'text-red-500',
        text: 'text-red-700 dark:text-red-300',
    },
    info: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30',
        icon: 'text-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
    },
};

// ============================================
// Component
// ============================================

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
    const Icon = ICONS[type];
    const colors = COLORS[type];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                    }}
                    className={`
                        fixed top-4 right-4 z-[9999]
                        flex items-center gap-3 px-4 py-3
                        rounded-xl border shadow-lg
                        backdrop-blur-xl
                        ${colors.bg} ${colors.border}
                        max-w-md
                    `}
                >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${colors.icon}`} />
                    <span className={`text-sm font-medium ${colors.text}`}>
                        {message}
                    </span>
                    <button
                        onClick={onClose}
                        className="ml-2 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Toast;
