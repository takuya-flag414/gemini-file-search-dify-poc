/**
 * Inspector Panel with Hierarchical Log Display
 * Groups logs by backend (A: Chatflow, B: Workflow) and workflow runs
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Copy, Check, FileText, Server, Cpu } from 'lucide-react';
import { dump } from 'js-yaml';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import type { LogEntry, BackendId } from '../../types';
import { Badge } from '../atoms';

// ============================================
// Types for Hierarchical Grouping
// ============================================

interface WorkflowRunGroup {
    workflowRunId: string;
    logs: LogEntry[];
    startTime: number;
    endTime: number;
}

interface OperationGroup {
    id: string;             // Stable unique ID for React key
    operationName: string;  // e.g., "ストア一覧取得"
    logs: LogEntry[];       // REQ + RES pair
    startTime: number;
    endTime: number;
}

interface BackendGroup {
    backendId: BackendId;
    displayName: string;
    workflowRuns: WorkflowRunGroup[];      // For Backend A
    operationGroups: OperationGroup[];      // For Backend B
    ungroupedLogs: LogEntry[];              // Logs that couldn't be grouped
    totalCount: number;
}

// ============================================
// Utility: Group Logs by Backend and Workflow
// ============================================

/**
 * Group logs by backend and workflow runs
 * REQ logs without workflowRunId are matched to runs by timestamp proximity
 */
function groupLogsByBackend(logs: LogEntry[]): BackendGroup[] {
    const MAX_TIME_DIFF_MS = 500; // REQ logs within 500ms before workflow start are included

    const backendA: BackendGroup = {
        backendId: 'backend-a',
        displayName: 'AI検索 (Chat)',
        workflowRuns: [],
        operationGroups: [],
        ungroupedLogs: [],
        totalCount: 0,
    };

    const backendB: BackendGroup = {
        backendId: 'backend-b',
        displayName: 'ファイル操作',
        workflowRuns: [],
        operationGroups: [],
        ungroupedLogs: [],
        totalCount: 0,
    };

    // Separate logs by backend
    const logsA = logs.filter(l => l.backendId === 'backend-a');
    const logsB = logs.filter(l => l.backendId === 'backend-b');
    const logsUnknown = logs.filter(l => !l.backendId);

    // First pass: Group logs with workflowRunId
    const workflowRunsA = new Map<string, LogEntry[]>();
    const ungroupedReqLogs: LogEntry[] = [];

    logsA.forEach(log => {
        if (log.workflowRunId) {
            const existing = workflowRunsA.get(log.workflowRunId) || [];
            existing.push(log);
            workflowRunsA.set(log.workflowRunId, existing);
        } else if (log.type === 'request') {
            // REQ logs without workflowRunId - try to match later
            ungroupedReqLogs.push(log);
        } else {
            backendA.ungroupedLogs.push(log);
        }
    });

    // Build initial workflow runs
    const tempRuns: WorkflowRunGroup[] = [];
    workflowRunsA.forEach((runLogs, runId) => {
        const sortedLogs = runLogs.sort((a, b) => a.timestamp - b.timestamp);
        tempRuns.push({
            workflowRunId: runId,
            logs: sortedLogs,
            startTime: sortedLogs[0]?.timestamp || 0,
            endTime: sortedLogs[sortedLogs.length - 1]?.timestamp || 0,
        });
    });

    // Second pass: Match REQ logs to workflow runs by timestamp proximity
    ungroupedReqLogs.forEach(reqLog => {
        // Find a workflow run that starts within MAX_TIME_DIFF_MS after this REQ
        const matchingRun = tempRuns.find(run => {
            const timeDiff = run.startTime - reqLog.timestamp;
            return timeDiff >= 0 && timeDiff <= MAX_TIME_DIFF_MS;
        });

        if (matchingRun) {
            // Insert REQ at the beginning of the run's logs
            matchingRun.logs.unshift(reqLog);
            // Update start time if REQ is earlier
            if (reqLog.timestamp < matchingRun.startTime) {
                matchingRun.startTime = reqLog.timestamp;
            }
        } else {
            // No matching run found, keep as ungrouped
            backendA.ungroupedLogs.push(reqLog);
        }
    });

    // Re-sort logs within each run after adding REQs (newest first for consistency)
    tempRuns.forEach(run => {
        run.logs.sort((a, b) => b.timestamp - a.timestamp);
    });

    // Sort workflow runs by start time (newest first)
    backendA.workflowRuns = tempRuns.sort((a, b) => b.startTime - a.startTime);
    backendA.totalCount = logsA.length;

    // Backend B: Group REQ/RES pairs into OperationGroups
    // Sort by timestamp (ascending) first to pair correctly
    const sortedLogsB = [...logsB].sort((a, b) => a.timestamp - b.timestamp);

    // Create OperationGroups from REQ/RES pairs
    const tempOperationGroups: OperationGroup[] = [];
    const usedIndices = new Set<number>();
    const MAX_PAIR_TIME_MS = 5000;

    sortedLogsB.forEach((log, idx) => {
        if (usedIndices.has(idx)) return;

        if (log.type === 'request') {
            // Extract operation name from title (remove [Mock] prefix)
            const operationName = log.title.replace(/^\[Mock\]\s*/, '');

            // Look for matching RES within 5 seconds
            const resIdx = sortedLogsB.findIndex((resLog, rIdx) =>
                rIdx > idx &&
                !usedIndices.has(rIdx) &&
                resLog.type === 'response' &&
                resLog.timestamp - log.timestamp <= MAX_PAIR_TIME_MS
            );

            const groupLogs: LogEntry[] = [log];
            usedIndices.add(idx);

            let endTime = log.timestamp;
            if (resIdx !== -1) {
                groupLogs.push(sortedLogsB[resIdx]);
                usedIndices.add(resIdx);
                endTime = sortedLogsB[resIdx].timestamp;
            }

            tempOperationGroups.push({
                id: log.id,  // Use first log's ID as stable key
                operationName,
                logs: groupLogs.sort((a, b) => b.timestamp - a.timestamp), // Newest first within group
                startTime: log.timestamp,
                endTime,
            });
        } else {
            // Orphan RES (no matching REQ) - create a group just for it
            const operationName = log.title.replace(/^\[Mock\]\s*/, '');
            usedIndices.add(idx);

            tempOperationGroups.push({
                id: log.id,  // Use log's ID as stable key
                operationName,
                logs: [log],
                startTime: log.timestamp,
                endTime: log.timestamp,
            });
        }
    });

    // Sort operation groups by start time (newest first)
    backendB.operationGroups = tempOperationGroups.sort((a, b) => b.startTime - a.startTime);
    backendB.totalCount = logsB.length;

    // Add unknown logs to Backend A (legacy)
    logsUnknown.forEach(log => {
        backendA.ungroupedLogs.push(log);
        backendA.totalCount++;
    });

    const groups: BackendGroup[] = [];
    if (backendA.totalCount > 0) groups.push(backendA);
    if (backendB.totalCount > 0) groups.push(backendB);

    return groups;
}

// ============================================
// Inspector Panel Component
// ============================================

interface InspectorPanelProps {
    logs: LogEntry[];
}

export function InspectorPanel({ logs }: InspectorPanelProps) {
    const { isInspectorOpen, toggleInspector } = useApp();

    // Track if component has mounted to enable differential animation
    const hasMounted = useRef(false);
    useEffect(() => {
        // Small delay to ensure initial render is complete before enabling animations
        const timer = setTimeout(() => {
            hasMounted.current = true;
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const groupedLogs = useMemo(() => groupLogsByBackend(logs), [logs]);

    if (!isInspectorOpen) {
        return null;
    }

    return (
        <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
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
                    <div className="p-2 space-y-2">
                        {groupedLogs.map(group => (
                            <BackendSection key={group.backendId} group={group} animateNewItems={hasMounted.current} />
                        ))}
                    </div>
                )}
            </div>

            {/* Export Button */}
            {logs.length > 0 && (
                <div className="p-3 border-t border-sys-separator">
                    <CopyYamlButton logs={logs} />
                </div>
            )}
        </motion.aside>
    );
}

// ============================================
// Backend Section (Top-level Accordion)
// ============================================

interface BackendSectionProps {
    group: BackendGroup;
    animateNewItems: boolean;
}

function BackendSection({ group, animateNewItems }: BackendSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const isBackendA = group.backendId === 'backend-a';
    const badgeColor = isBackendA ? 'warning' : 'info';
    const IconComponent = isBackendA ? Cpu : Server;

    return (
        <div className="rounded-card overflow-hidden border border-sys-separator/50 bg-sys-bg-base/30">
            {/* Section Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${isExpanded ? 'bg-sys-bg-alt/50' : 'hover:bg-sys-bg-alt/30'
                    }`}
            >
                <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-sys-text-tertiary" />
                </motion.div>
                <IconComponent className={`w-4 h-4 ${isBackendA ? 'text-feedback-warning' : 'text-feedback-info'}`} />
                <span className="flex-1 text-subhead font-medium text-sys-text-primary">
                    {group.displayName}
                </span>
                <Badge variant={badgeColor} size="sm">{group.totalCount}</Badge>
            </button>

            {/* Section Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-2 pb-2 space-y-1">
                            {/* Workflow Runs (Backend A) */}
                            {group.workflowRuns.map(run => (
                                <WorkflowRunSection key={run.workflowRunId} run={run} animateEntry={animateNewItems} />
                            ))}

                            {/* Operation Groups (Backend B) */}
                            {group.operationGroups.map(op => (
                                <OperationSection key={op.id} operation={op} animateEntry={animateNewItems} />
                            ))}

                            {/* Ungrouped Logs */}
                            {group.ungroupedLogs.map(log => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                >
                                    <LogItem log={log} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// Workflow Run Section (Nested Accordion)
// ============================================

interface WorkflowRunSectionProps {
    run: WorkflowRunGroup;
    animateEntry: boolean;
}

function WorkflowRunSection({ run, animateEntry }: WorkflowRunSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const startTimeStr = new Date(run.startTime).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    // Truncate workflow run ID for display
    const shortRunId = run.workflowRunId.length > 12
        ? `${run.workflowRunId.slice(0, 8)}...`
        : run.workflowRunId;

    return (
        <motion.div
            initial={animateEntry ? { opacity: 0, y: -10, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            layout
            className="rounded-md overflow-hidden bg-sys-bg-base/50 border border-sys-separator/30"
        >
            {/* Run Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-sys-bg-alt/30 transition-colors"
            >
                {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-sys-text-tertiary flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-sys-text-tertiary flex-shrink-0" />
                )}
                <span className="flex-1 text-footnote font-medium text-sys-text-secondary truncate">
                    Run: {shortRunId}
                </span>
                <span className="text-caption-2 text-sys-text-tertiary">{startTimeStr}</span>
                <Badge variant="default" size="sm">{run.logs.length}</Badge>
            </button>

            {/* Run Logs */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pl-4 pr-2 pb-2 space-y-0.5">
                            {run.logs.map((log, index) => (
                                <div key={log.id} className="flex">
                                    {/* Tree Line */}
                                    <div className="flex flex-col items-center w-4 mr-1">
                                        <div className={`w-px flex-1 ${index === 0 ? 'bg-transparent' : 'bg-sys-separator'}`} />
                                        <div className="w-2 h-px bg-sys-separator" />
                                        <div className={`w-px flex-1 ${index === run.logs.length - 1 ? 'bg-transparent' : 'bg-sys-separator'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <LogItem log={log} compact />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============================================
// Operation Section (Backend B Nested Accordion)
// ============================================

interface OperationSectionProps {
    operation: OperationGroup;
    animateEntry: boolean;
}

function OperationSection({ operation, animateEntry }: OperationSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const startTimeStr = new Date(operation.startTime).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <motion.div
            initial={animateEntry ? { opacity: 0, y: -10, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            layout
            className="rounded-button overflow-hidden bg-sys-bg-alt/20"
        >
            {/* Operation Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${isExpanded ? 'bg-sys-bg-alt/50' : 'hover:bg-sys-bg-alt/30'
                    }`}
            >
                <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.15 }}
                >
                    <ChevronRight className="w-3 h-3 text-sys-text-tertiary" />
                </motion.div>
                <FileText className="w-3.5 h-3.5 text-feedback-info" />
                <span className="flex-1 text-footnote text-sys-text-primary truncate">
                    {operation.operationName}
                </span>
                <span className="text-caption-2 text-sys-text-tertiary">{startTimeStr}</span>
                <Badge variant="default" size="sm">{operation.logs.length}</Badge>
            </button>

            {/* Operation Logs */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pl-4 pr-2 pb-2 space-y-0.5">
                            {operation.logs.map((log, index) => (
                                <div key={log.id} className="flex">
                                    {/* Tree Line */}
                                    <div className="flex flex-col items-center w-4 mr-1">
                                        <div className={`w-px flex-1 ${index === 0 ? 'bg-transparent' : 'bg-sys-separator'}`} />
                                        <div className="w-2 h-px bg-sys-separator" />
                                        <div className={`w-px flex-1 ${index === operation.logs.length - 1 ? 'bg-transparent' : 'bg-sys-separator'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <LogItem log={log} compact />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============================================
// Log Item
// ============================================

interface LogItemProps {
    log: LogEntry;
    compact?: boolean;
}

function LogItem({ log, compact = false }: LogItemProps) {
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
        <div className={`rounded-md overflow-hidden ${compact ? 'bg-sys-bg-alt/30' : 'bg-sys-bg-base/50'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center gap-1.5 text-left hover:bg-sys-bg-alt/50 transition-colors ${compact ? 'px-2 py-1.5' : 'px-3 py-2'
                    }`}
            >
                {isExpanded ? (
                    <ChevronDown className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sys-text-tertiary flex-shrink-0`} />
                ) : (
                    <ChevronRight className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sys-text-tertiary flex-shrink-0`} />
                )}
                <Badge variant={typeColors[log.type]} size={compact ? 'sm' : 'md'}>{typeLabels[log.type]}</Badge>
                <span className={`flex-1 text-sys-text-primary truncate ${compact ? 'text-caption-1' : 'text-footnote'}`}>
                    {log.title}
                </span>
                {!compact && (
                    <span className="text-caption-2 text-sys-text-tertiary flex-shrink-0">
                        {time}
                    </span>
                )}
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
                        <div className={compact ? 'px-2 pb-2' : 'px-3 pb-3'}>
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
// Copy YAML Button
// ============================================

interface CopyYamlButtonProps {
    logs: LogEntry[];
}

/**
 * Convert grouped logs to a YAML-friendly hierarchical structure
 */
function buildHierarchicalYamlData(logs: LogEntry[]) {
    const groups = groupLogsByBackend(logs);

    const result: Record<string, unknown> = {};

    for (const group of groups) {
        const backendData: Record<string, unknown> = {
            displayName: group.displayName,
            totalLogs: group.totalCount,
        };

        // Add workflow runs if any (Backend A)
        if (group.workflowRuns.length > 0) {
            backendData.workflowRuns = group.workflowRuns.map(run => ({
                workflowRunId: run.workflowRunId,
                startTime: new Date(run.startTime).toLocaleTimeString('ja-JP'),
                endTime: new Date(run.endTime).toLocaleTimeString('ja-JP'),
                logs: run.logs.map(log => ({
                    type: log.type,
                    title: log.title,
                    timestamp: new Date(log.timestamp).toISOString(),
                    data: log.data,
                })),
            }));
        }

        // Add operation groups if any (Backend B)
        if (group.operationGroups.length > 0) {
            backendData.operations = group.operationGroups.map(op => ({
                operationName: op.operationName,
                startTime: new Date(op.startTime).toLocaleTimeString('ja-JP'),
                endTime: new Date(op.endTime).toLocaleTimeString('ja-JP'),
                logs: op.logs.map(log => ({
                    type: log.type,
                    title: log.title,
                    timestamp: new Date(log.timestamp).toISOString(),
                    data: log.data,
                })),
            }));
        }

        // Add ungrouped logs if any
        if (group.ungroupedLogs.length > 0) {
            backendData.logs = group.ungroupedLogs.map(log => ({
                type: log.type,
                title: log.title,
                timestamp: new Date(log.timestamp).toISOString(),
                data: log.data,
            }));
        }

        result[group.backendId] = backendData;
    }

    return result;
}

function CopyYamlButton({ logs }: CopyYamlButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyYaml = async () => {
        try {
            // Convert to hierarchical structure
            const hierarchicalData = buildHierarchicalYamlData(logs);

            const yamlStr = dump(hierarchicalData, {
                indent: 2,
                lineWidth: -1,
                noRefs: true,
            });
            await navigator.clipboard.writeText(yamlStr);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy YAML:', err);
        }
    };

    return (
        <button
            onClick={handleCopyYaml}
            className="w-full py-2 px-4 bg-action-primary text-white text-footnote font-medium rounded-button hover:bg-action-hover transition-colors flex items-center justify-center gap-2"
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>コピーしました</span>
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4" />
                    <span>YAMLをコピー</span>
                </>
            )}
        </button>
    );
}
