import { useApp } from '../../context/AppContext';
import { ChatTimeline } from './ChatTimeline';
import { ChatInputArea } from '../molecules/chat/ChatInputArea';
import type { ChatMessage } from '../../types';

// ============================================
// Chat Panel Component (Right Panel Tab Content)
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
    const { selectedStoreName } = useApp();

    const handleSearchSubmit = (query: string, storeId: string) => {
        if (onSearchSubmit) {
            onSearchSubmit(query, storeId);
        }
    };

    // Render as content within RightPanelContent (no header - tab provides label)
    return (
        <div className="h-full flex flex-col">
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
        </div>
    );
}
