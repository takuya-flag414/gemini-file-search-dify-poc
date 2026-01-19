import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Loader2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { Badge } from '../atoms';

// ============================================
// Chat Timeline Component
// ============================================

interface ChatTimelineProps {
    messages: ChatMessageType[];
    thinkingSteps?: string[];
}

export function ChatTimeline({ messages, thinkingSteps }: ChatTimelineProps) {
    if (messages.length === 0 && !thinkingSteps?.length) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-subheadline text-sys-text-tertiary">
                        ワークフローを実行すると結果がここに表示されます
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <AnimatePresence initial={false}>
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <MessageBlock message={message} />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Thinking Steps */}
            {thinkingSteps && thinkingSteps.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-ai-cyan/20 flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-4 h-4 text-ai-cyan animate-spin" />
                    </div>
                    <div className="flex-1 bg-sys-bg-alt rounded-card p-4">
                        <p className="text-footnote text-sys-text-secondary mb-2">
                            処理中...
                        </p>
                        <div className="space-y-1">
                            {thinkingSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan" />
                                    <span className="text-caption-1 text-sys-text-secondary">
                                        {step}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ============================================
// Message Block
// ============================================

interface MessageBlockProps {
    message: ChatMessageType;
}

function MessageBlock({ message }: MessageBlockProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser
                        ? 'bg-action-primary text-white'
                        : 'bg-gradient-to-br from-ai-cyan via-ai-magenta to-ai-blue text-white'
                    }
        `}
            >
                {isUser ? (
                    <User className="w-4 h-4" />
                ) : (
                    <Bot className="w-4 h-4" />
                )}
            </div>

            {/* Content */}
            <div
                className={`
          flex-1 max-w-[80%] rounded-card p-4
          ${isUser
                        ? 'bg-action-primary text-white'
                        : 'bg-sys-bg-alt text-sys-text-primary'
                    }
        `}
            >
                {message.isStreaming ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-subheadline">{message.content || '回答を生成中...'}</span>
                    </div>
                ) : (
                    <>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-sys-separator">
                                <p className="text-caption-1 text-sys-text-secondary mb-2">
                                    参照元:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {message.citations.map((citation, index) => (
                                        <Badge key={index} variant="info">
                                            [{index + 1}] {citation.document_name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Timestamp */}
                <p
                    className={`
            text-caption-2 mt-2
            ${isUser ? 'text-white/70' : 'text-sys-text-tertiary'}
          `}
                >
                    {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        </div>
    );
}
