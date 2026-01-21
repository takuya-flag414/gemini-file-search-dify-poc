import { useRef, useEffect, useState } from 'react';
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
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle scroll events to detect manual scrolling
    const handleScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // Threshold 100px

        // Determine if user is manually scrolling up
        if (isAtBottom) {
            setIsAutoScrollEnabled(true);
        } else {
            setIsAutoScrollEnabled(false);
        }
    };

    // Auto-scroll effect
    useEffect(() => {
        if (isAutoScrollEnabled) {
            scrollToBottom();
        }
    }, [messages, thinkingSteps, isAutoScrollEnabled]);

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
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth"
        >
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

            {/* Invisible element to scroll to */}
            <div ref={bottomRef} className="h-1" />
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
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Lists
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    // Headings
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-3" {...props} />,
                                    h4: ({ node, ...props }) => <h4 className="text-sm font-bold mb-2 mt-3" {...props} />,
                                    // Links
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="underline hover:opacity-80 transition-opacity"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            {...props}
                                        />
                                    ),
                                    // Blockquote
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote className="border-l-4 border-sys-separator pl-4 italic my-2 opacity-80" {...props} />
                                    ),
                                    // Tables
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto -mx-1 px-1 my-2">
                                            <table className="min-w-full border-collapse text-left" {...props} />
                                        </div>
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th className="border-b border-sys-separator p-2 font-semibold" {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td className="border-b border-sys-separator p-2" {...props} />
                                    ),
                                    // Code
                                    pre: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-2 rounded-lg bg-black/5 dark:bg-white/10 p-3">
                                            <pre className="text-sm font-mono" {...props} />
                                        </div>
                                    ),
                                    code: ({ node, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const isInline = !match && !String(children).includes('\n');
                                        return isInline ? (
                                            <code className="bg-black/5 dark:bg-white/10 rounded px-1 py-0.5 text-sm font-mono" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
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
