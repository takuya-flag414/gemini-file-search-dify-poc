import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Activity, X, Maximize2, Minimize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatPanel } from './ChatPanel';
import { InspectorPanel } from './InspectorPanel';
import type { ChatMessage, LogEntry } from '../../types';

// ============================================
// Right Panel Content with Tab Switching
// ============================================

type RightPanelTab = 'chat' | 'inspector';

interface RightPanelContentProps {
    // Chat props
    messages: ChatMessage[];
    thinkingSteps?: string[];
    isProcessing?: boolean;
    onSearchSubmit?: (query: string, storeId: string) => void;
    // Inspector props
    logs: LogEntry[];
}

export function RightPanelContent({
    messages,
    thinkingSteps,
    isProcessing = false,
    onSearchSubmit,
    logs,
}: RightPanelContentProps) {
    const [activeTab, setActiveTab] = useState<RightPanelTab>('chat');
    const { toggleRightPanel, isRightPanelExpanded, toggleRightPanelExpanded } = useApp();

    return (
        <div className="h-full flex flex-col">
            {/* Tab Header (Segment Control) with Action Buttons */}
            <div className="flex-shrink-0 px-3 py-2 border-b border-sys-separator flex items-center gap-2">
                <div className="flex flex-1 bg-sys-bg-alt/50 rounded-lg p-1">
                    <TabButton
                        isActive={activeTab === 'chat'}
                        onClick={() => setActiveTab('chat')}
                        icon={<MessageSquare className="w-4 h-4" />}
                        label="Chat"
                    />
                    <TabButton
                        isActive={activeTab === 'inspector'}
                        onClick={() => setActiveTab('inspector')}
                        icon={<Activity className="w-4 h-4" />}
                        label="Inspector"
                    />
                </div>
                {/* Maximize/Minimize Button */}
                <button
                    onClick={toggleRightPanelExpanded}
                    className="p-1.5 hover:bg-sys-bg-alt rounded-button transition-colors flex-shrink-0"
                    title={isRightPanelExpanded ? '縮小' : '最大化'}
                >
                    {isRightPanelExpanded ? (
                        <Minimize2 className="w-4 h-4 text-sys-text-secondary" />
                    ) : (
                        <Maximize2 className="w-4 h-4 text-sys-text-secondary" />
                    )}
                </button>
                {/* Close Button */}
                <button
                    onClick={toggleRightPanel}
                    className="p-1.5 hover:bg-sys-bg-alt rounded-button transition-colors flex-shrink-0"
                    title="パネルを閉じる"
                >
                    <X className="w-4 h-4 text-sys-text-secondary" />
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute inset-0"
                    >
                        <ChatPanel
                            messages={messages}
                            thinkingSteps={thinkingSteps}
                            isProcessing={isProcessing}
                            onSearchSubmit={onSearchSubmit}
                        />
                    </motion.div>
                )}
                {activeTab === 'inspector' && (
                    <motion.div
                        key="inspector"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute inset-0"
                    >
                        <InspectorPanel logs={logs} />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// ============================================
// Tab Button Component
// ============================================

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function TabButton({ isActive, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md
                text-footnote font-medium transition-all duration-200
                ${isActive
                    ? 'bg-white dark:bg-white/20 text-sys-text-primary shadow-sm'
                    : 'text-sys-text-secondary hover:text-sys-text-primary'
                }
            `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
