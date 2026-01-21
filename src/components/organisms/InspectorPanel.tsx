import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import type { LogEntry } from '../../types';
import { Badge } from '../atoms';

// ============================================
// Inspector Panel Component
// ============================================

interface InspectorPanelProps {
    logs: LogEntry[];
}

export function InspectorPanel({ logs }: InspectorPanelProps) {
    const { isInspectorOpen, toggleInspector } = useApp();

    if (!isInspectorOpen) {
        return null;
    }

    return (
        <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="h-full flex flex-col glass-hud border-l border-sys-separator"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-sys-separator">
                <h2 className="text-headline text-sys-text-primary">Inspector</h2>
                <button
                    onClick={toggleInspector}
                    className="p-1.5 hover:bg-sys-bg-alt rounded-button transition-colors"
                >
                    <X className="w-4 h-4 text-sys-text-secondary" />
                </button>
            </div>

            {/* Log List */}
            <div className="flex-1 overflow-y-auto">
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-footnote text-sys-text-tertiary">
                            ログがありません
                        </p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        <AnimatePresence initial={false}>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <LogItem log={log} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Export Button */}
            {logs.length > 0 && (
                <div className="p-3 border-t border-sys-separator">
                    <ExportButton logs={logs} />
                </div>
            )}
        </motion.aside>
    );
}

// ============================================
// Log Item
// ============================================

interface LogItemProps {
    log: LogEntry;
}

function LogItem({ log }: LogItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const typeColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
        request: 'info',
        response: 'success',
        system: 'default',
        error: 'danger',
        node: 'warning',
    };

    const typeLabels: Record<string, string> = {
        request: 'REQ',
        response: 'RES',
        system: 'SYS',
        error: 'ERR',
        node: 'NODE',
    };

    const time = new Date(log.timestamp).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <div className="bg-sys-bg-base/50 rounded-card overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-sys-bg-alt/50 transition-colors"
            >
                {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-sys-text-tertiary flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-sys-text-tertiary flex-shrink-0" />
                )}
                <Badge variant={typeColors[log.type]}>{typeLabels[log.type]}</Badge>
                <span className="flex-1 text-footnote text-sys-text-primary truncate">
                    {log.title}
                </span>
                <span className="text-caption-2 text-sys-text-tertiary flex-shrink-0">
                    {time}
                </span>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3">
                            <JsonViewer data={log.data} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// JSON Viewer
// ============================================

interface JsonViewerProps {
    data: unknown;
}

function JsonViewer({ data }: JsonViewerProps) {
    const [copied, setCopied] = useState(false);
    const jsonStr = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(jsonStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-sys-bg-alt rounded-button hover:bg-sys-separator transition-colors"
                title="コピー"
            >
                {copied ? (
                    <Check className="w-3.5 h-3.5 text-feedback-success" />
                ) : (
                    <Copy className="w-3.5 h-3.5 text-sys-text-tertiary" />
                )}
            </button>
            <pre className="p-3 bg-sys-bg-alt rounded-card overflow-x-auto text-caption-1 font-mono text-sys-text-primary max-h-60">
                {jsonStr}
            </pre>
        </div>
    );
}

// ============================================
// Export Button
// ============================================

interface ExportButtonProps {
    logs: LogEntry[];
}

function ExportButton({ logs }: ExportButtonProps) {
    const handleExport = () => {
        const markdown = generateMarkdownReport(logs);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-report-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            className="w-full py-2 px-4 bg-action-primary text-white text-footnote font-medium rounded-button hover:bg-action-hover transition-colors"
        >
            Markdownレポート出力
        </button>
    );
}

// ============================================
// Markdown Report Generator
// ============================================

function generateMarkdownReport(logs: LogEntry[]): string {
    const now = new Date().toISOString();

    let md = `# Verification Report\n\n`;
    md += `**Generated:** ${now}\n\n`;
    md += `---\n\n`;
    md += `## Log Entries\n\n`;

    for (const log of logs) {
        const time = new Date(log.timestamp).toISOString();
        md += `### ${log.type.toUpperCase()}: ${log.title}\n`;
        md += `**Time:** ${time}\n\n`;
        md += `\`\`\`json\n${JSON.stringify(log.data, null, 2)}\n\`\`\`\n\n`;
    }

    return md;
}
