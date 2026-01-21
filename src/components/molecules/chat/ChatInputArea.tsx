import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Search } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

// ============================================
// Chat Input Area Component
// Apple Intelligence風のフローティング入力欄
// ============================================

interface ChatInputAreaProps {
    onSubmit: (query: string, storeId: string) => void;
    isProcessing?: boolean;
}

export function ChatInputArea({ onSubmit, isProcessing = false }: ChatInputAreaProps) {
    const [query, setQuery] = useState('');
    const { selectedStoreId, selectedStoreName, clearSelectedStore } = useApp();

    const isReady = Boolean(selectedStoreId && query.trim());

    const handleSubmit = useCallback(() => {
        if (!isReady || !selectedStoreId) return;
        onSubmit(query.trim(), selectedStoreId);
        setQuery('');
    }, [query, selectedStoreId, isReady, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="p-4 border-t border-sys-separator">
            {/* Context Badge */}
            <AnimatePresence>
                {selectedStoreName && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="mb-3"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-action-primary/10 border border-action-primary/20">
                            <span className="text-sm">📂</span>
                            <span className="text-footnote text-action-primary font-medium">
                                {selectedStoreName}
                            </span>
                            <button
                                onClick={clearSelectedStore}
                                className="p-0.5 rounded-full hover:bg-action-primary/20 transition-colors"
                                title="選択解除"
                            >
                                <X className="w-3 h-3 text-action-primary" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Container - Apple Intelligence風 */}
            <div
                className={`
                    relative flex items-center gap-2 p-2
                    rounded-[22px] transition-all duration-300
                    ${selectedStoreId
                        ? 'bg-white/65 dark:bg-black/40 backdrop-blur-[50px] shadow-lg'
                        : 'bg-sys-bg-alt'
                    }
                `}
                style={{
                    backdropFilter: selectedStoreId ? 'blur(50px) saturate(200%)' : undefined,
                }}
            >
                {/* Search Icon */}
                <div className="pl-2">
                    <Search className="w-4 h-4 text-sys-text-tertiary" />
                </div>

                {/* Text Input */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        selectedStoreId
                            ? "③ 指示を入力..."
                            : "サイドバーでストアを選択してください"
                    }
                    disabled={!selectedStoreId || isProcessing}
                    className={`
                        flex-1 bg-transparent border-none outline-none
                        text-body text-sys-text-primary
                        placeholder:text-sys-text-tertiary
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                />

                {/* Submit Button */}
                <motion.button
                    onClick={handleSubmit}
                    disabled={!isReady || isProcessing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                        p-2 rounded-full transition-all duration-200
                        ${isReady && !isProcessing
                            ? 'bg-action-primary text-white shadow-md hover:bg-action-hover'
                            : 'bg-sys-bg-alt text-sys-text-tertiary'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </motion.button>
            </div>

            {/* Hint Text */}
            {!selectedStoreId && (
                <p className="mt-2 text-caption-1 text-sys-text-tertiary text-center">
                    左のサイドバーからナレッジストアを選択してください
                </p>
            )}
        </div>
    );
}
