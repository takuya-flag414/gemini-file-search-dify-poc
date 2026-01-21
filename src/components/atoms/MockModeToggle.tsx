/**
 * MockModeToggle Component
 * macOS Sequoia-style toggle switch for enabling/disabling mock mode
 * Uses Apple Intelligence gradient when enabled
 */

import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

// ============================================
// Component
// ============================================

export function MockModeToggle() {
    const { config, toggleMockMode } = useApp();
    const isEnabled = config.mockMode;

    return (
        <button
            onClick={toggleMockMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 dark:hover:bg-black/20"
            title={isEnabled ? 'モックモード: ON' : 'モックモード: OFF'}
        >
            {/* Label */}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                🧪
            </span>

            {/* Toggle Track */}
            <div
                className={`
                    relative w-10 h-6 rounded-full transition-all duration-300 ease-out
                    ${isEnabled
                        ? 'bg-[#34C759] dark:bg-[#30D158] shadow-sm'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }
                `}
            >
                {/* Toggle Knob */}
                <motion.div
                    className={`
                        absolute top-1 w-4 h-4 rounded-full shadow-md
                        ${isEnabled ? 'bg-white' : 'bg-white dark:bg-gray-200'}
                    `}
                    animate={{
                        left: isEnabled ? '22px' : '4px',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            </div>

            {/* Status text */}
            <span className={`
                text-xs font-medium transition-colors duration-200
                ${isEnabled
                    ? 'text-[#34C759] dark:text-[#30D158]'
                    : 'text-gray-500 dark:text-gray-500'
                }
            `}>
                Mock
            </span>
        </button>
    );
}
