/**
 * SearchBar Component
 * Spotlight-style instant search bar for Knowledge Finder
 * DESIGN_RULE.md compliant Spring animations
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

// ============================================
// Props
// ============================================

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// ============================================
// Component
// ============================================

export function SearchBar({
    value,
    onChange,
    placeholder = 'ファイル名・メタデータで検索...',
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    return (
        <motion.div
            initial={false}
            animate={{
                scale: isFocused ? 1.02 : 1,
                boxShadow: isFocused
                    ? '0 0 0 2px rgba(0, 122, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)'
                    : '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
            transition={{
                type: 'spring',
                stiffness: 250,
                damping: 25,
            }}
            className={`
                relative flex items-center gap-2
                px-3 py-2 rounded-lg
                bg-sys-bg-alt/80 backdrop-blur-sm
                border transition-colors
                ${isFocused
                    ? 'border-action-primary'
                    : 'border-sys-separator hover:border-sys-separator/80'
                }
            `}
        >
            {/* Search Icon */}
            <Search
                className={`
                    w-4 h-4 flex-shrink-0 transition-colors
                    ${isFocused ? 'text-action-primary' : 'text-sys-text-tertiary'}
                `}
            />

            {/* Input Field */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="
                    flex-1 bg-transparent outline-none
                    text-subheadline text-sys-text-primary
                    placeholder:text-sys-text-tertiary
                    min-w-[120px]
                "
            />

            {/* Clear Button */}
            <AnimatePresence>
                {value && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                        }}
                        onClick={handleClear}
                        className="
                            w-5 h-5 rounded-full flex-shrink-0
                            bg-sys-text-tertiary/20 hover:bg-sys-text-tertiary/30
                            flex items-center justify-center
                            transition-colors
                        "
                        title="検索をクリア"
                    >
                        <X className="w-3 h-3 text-sys-text-secondary" />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default SearchBar;
