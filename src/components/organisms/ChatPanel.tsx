import { X, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ChatTimeline } from './ChatTimeline';
import { ChatInputArea } from '../molecules/chat/ChatInputArea';
import type { ChatMessage } from '../../types';

// ============================================
// Chat Panel Component
// ============================================

interface ChatPanelProps {
    messages: ChatMessage[];
    thinkingSteps?: string[];
    isProcessing?: boolean;
    onSearchSubmit?: (query: string, storeId: string) => void;
}

export function ChatPanel({
    messages,
    thinkingSteps,
    isProcessing = false,
    onSearchSubmit,
}: ChatPanelProps) {
    const { isChatPanelOpen, toggleChatPanel, isChatExpanded, toggleChatExpanded, selectedStoreName } = useApp();

    if (!isChatPanelOpen) {
        return null;
    }

    const handleSearchSubmit = (query: string, storeId: string) => {
        if (onSearchSubmit) {
            onSearchSubmit(query, storeId);
        }
    };

    return (
        <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{
                width: isChatExpanded ? 'auto' : 360,
                flex: isChatExpanded ? 1 : 'none',
                opacity: 1
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="h-full flex flex-col glass-hud border-l border-sys-separator"
            style={{ minWidth: isChatExpanded ? 0 : 360 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-sys-separator">
                <h2 className="text-headline text-sys-text-primary">Chat</h2>
                <div className="flex items-center gap-1">
                    {/* Expand/Collapse Button */}
                    <button
                        onClick={toggleChatExpanded}
                        className="p-1.5 hover:bg-sys-bg-alt rounded-button transition-colors"
                        title={isChatExpanded ? '縮小' : '拡大'}
                    >
                        {isChatExpanded ? (
                            <Minimize2 className="w-4 h-4 text-sys-text-secondary" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-sys-text-secondary" />
                        )}
                    </button>
                    {/* Close Button */}
                    <button
                        onClick={toggleChatPanel}
                        className="p-1.5 hover:bg-sys-bg-alt rounded-button transition-colors"
                    >
                        <X className="w-4 h-4 text-sys-text-secondary" />
                    </button>
                </div>
            </div>

            {/* Chat Timeline */}
            <ChatTimeline
                messages={messages}
                thinkingSteps={thinkingSteps}
                selectedStoreName={selectedStoreName}
            />

            {/* Chat Input Area (Footer) */}
            <ChatInputArea
                onSubmit={handleSearchSubmit}
                isProcessing={isProcessing}
            />
        </motion.aside>
    );
}

