/**
 * KnowledgeFinder Component
 * Phase A: macOS Finder-style file browser for Knowledge Stores
 * Supports Grid and List view modes with Metadata Wizard for uploads
 * Enhanced with Search and Filter functionality
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FileSearchStore, StoredFile, FinderViewMode } from '../../types';
import { FileCard } from '../atoms/FileCard';
import { FileListItem } from '../atoms/FileListItem';
import { SearchBar } from '../atoms/SearchBar';
import { FilterChips, type ActiveFilters } from '../atoms/FilterChips';
import { FileDetailPanel } from '../molecules/FileDetailPanel';
import { FileContextMenu } from '../molecules/FileContextMenu';
import { MetadataWizard, type FileMetadata } from '../molecules/upload';

// ============================================
// Props
// ============================================

interface KnowledgeFinderProps {
    store: FileSearchStore;
    files: StoredFile[];
    isLoading: boolean;
    isUploading: boolean;
    onBack: () => void;
    onDeleteFile: (file: StoredFile) => Promise<void>;
    onUploadClick: () => void;
    /** New: Upload with metadata support */
    onUploadWithMetadata?: (file: File, metadata: Record<string, string>) => Promise<void>;
}

// ============================================
// View Toggle Button
// ============================================

interface ViewToggleProps {
    mode: FinderViewMode;
    onChange: (mode: FinderViewMode) => void;
}

function ViewToggle({ mode, onChange }: ViewToggleProps) {
    return (
        <div className="flex bg-sys-bg-alt rounded-lg p-1 gap-1">
            <button
                onClick={() => onChange('grid')}
                className={`
                    px-3 py-1.5 rounded-md text-footnote transition-all
                    ${mode === 'grid'
                        ? 'bg-sys-bg-base text-sys-text-primary shadow-sm'
                        : 'text-sys-text-secondary hover:text-sys-text-primary'
                    }
                `}
            >
                ⊞ Grid
            </button>
            <button
                onClick={() => onChange('list')}
                className={`
                    px-3 py-1.5 rounded-md text-footnote transition-all
                    ${mode === 'list'
                        ? 'bg-sys-bg-base text-sys-text-primary shadow-sm'
                        : 'text-sys-text-secondary hover:text-sys-text-primary'
                    }
                `}
            >
                ☰ List
            </button>
        </div>
    );
}

// ============================================
// Empty State
// ============================================

interface EmptyStateProps {
    hasFilters?: boolean;
}

function EmptyState({ hasFilters = false }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-16"
        >
            <div className="text-6xl opacity-50">{hasFilters ? '🔍' : '📂'}</div>
            <h3 className="text-headline text-sys-text-secondary">
                {hasFilters ? '該当するファイルがありません' : 'ファイルがありません'}
            </h3>
            <p className="text-footnote text-sys-text-tertiary text-center max-w-xs">
                {hasFilters
                    ? '検索条件を変更してお試しください'
                    : '① 右上のボタンからファイルをアップロードしてください'
                }
            </p>
        </motion.div>
    );
}

// ============================================
// Loading Skeleton
// ============================================

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="finder-card p-4 min-h-[140px] animate-pulse"
                >
                    <div className="w-12 h-12 bg-sys-bg-alt rounded-lg mx-auto mb-3" />
                    <div className="h-4 bg-sys-bg-alt rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-sys-bg-alt rounded w-1/2 mx-auto" />
                </div>
            ))}
        </div>
    );
}

// ============================================
// Component
// ============================================

export function KnowledgeFinder({
    store,
    files,
    isLoading,
    isUploading,
    onDeleteFile,
    onUploadClick,
    onUploadWithMetadata,
}: KnowledgeFinderProps) {
    const [viewMode, setViewMode] = useState<FinderViewMode>('grid');
    const [selectedFiles, setSelectedFiles] = useState<StoredFile[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

    // Context Menu State
    const [contextMenuFile, setContextMenuFile] = useState<StoredFile | null>(null);
    const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        company: [],
        department: [],
        filetype: [],
    });

    // Extract available metadata values from files
    const availableValues = useMemo(() => {
        const companies = new Set<string>();
        const departments = new Set<string>();
        const filetypes = new Set<string>();

        files.forEach((file) => {
            const meta = file.customMetadata;
            if (meta?.metadata_company) companies.add(String(meta.metadata_company));
            if (meta?.metadata_department) departments.add(String(meta.metadata_department));
            if (meta?.metadata_filetype) filetypes.add(String(meta.metadata_filetype));
        });

        return {
            company: Array.from(companies).sort(),
            department: Array.from(departments).sort(),
            filetype: Array.from(filetypes).sort(),
        };
    }, [files]);

    // Filter files based on search query and active filters
    const filteredFiles = useMemo(() => {
        return files.filter((file) => {
            // Search query filter (file name)
            const matchesSearch =
                !searchQuery ||
                file.displayName.toLowerCase().includes(searchQuery.toLowerCase());

            // Metadata filters
            const meta = file.customMetadata;
            const matchesCompany =
                activeFilters.company.length === 0 ||
                activeFilters.company.includes(String(meta?.metadata_company || ''));
            const matchesDepartment =
                activeFilters.department.length === 0 ||
                activeFilters.department.includes(String(meta?.metadata_department || ''));
            const matchesFiletype =
                activeFilters.filetype.length === 0 ||
                activeFilters.filetype.includes(String(meta?.metadata_filetype || ''));

            return matchesSearch && matchesCompany && matchesDepartment && matchesFiletype;
        });
    }, [files, searchQuery, activeFilters]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return (
            searchQuery.length > 0 ||
            activeFilters.company.length > 0 ||
            activeFilters.department.length > 0 ||
            activeFilters.filetype.length > 0
        );
    }, [searchQuery, activeFilters]);

    // Open wizard for upload with metadata
    const handleUploadButtonClick = useCallback(() => {
        if (onUploadWithMetadata) {
            setIsWizardOpen(true);
        } else {
            // Fallback to original behavior
            onUploadClick();
        }
    }, [onUploadWithMetadata, onUploadClick]);

    // Handle upload with metadata from wizard
    const handleUploadWithMetadata = useCallback(async (file: File, metadata: FileMetadata) => {
        if (onUploadWithMetadata) {
            const metadataRecord: Record<string, string> = {};
            if (metadata.company) metadataRecord.metadata_company = metadata.company;
            if (metadata.department) metadataRecord.metadata_department = metadata.department;
            if (metadata.filetype) metadataRecord.metadata_filetype = metadata.filetype;
            await onUploadWithMetadata(file, metadataRecord);
        }
    }, [onUploadWithMetadata]);

    // Handle file selection (supports Ctrl/Cmd + click for multi-select)
    const handleSelectFile = useCallback((file: StoredFile, event?: React.MouseEvent) => {
        const isMultiSelect = event?.ctrlKey || event?.metaKey;
        const isRangeSelect = event?.shiftKey;

        if (isMultiSelect) {
            // Toggle selection
            setSelectedFiles(prev => {
                const isSelected = prev.some(f => f.documentId === file.documentId);
                if (isSelected) {
                    return prev.filter(f => f.documentId !== file.documentId);
                } else {
                    return [...prev, file];
                }
            });
        } else if (isRangeSelect && selectedFiles.length > 0) {
            // Range selection
            const lastSelected = selectedFiles[selectedFiles.length - 1];
            const lastIndex = filteredFiles.findIndex(f => f.documentId === lastSelected.documentId);
            const currentIndex = filteredFiles.findIndex(f => f.documentId === file.documentId);
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeFiles = filteredFiles.slice(start, end + 1);
            setSelectedFiles(rangeFiles);
        } else {
            // Single selection
            setSelectedFiles([file]);
        }
    }, [selectedFiles, filteredFiles]);

    // Handle right-click context menu
    const handleContextMenu = useCallback((file: StoredFile, event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenuFile(file);
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setIsContextMenuOpen(true);
        // Also select the file if not already selected
        if (!selectedFiles.some(f => f.documentId === file.documentId)) {
            setSelectedFiles([file]);
        }
    }, [selectedFiles]);

    const handleDeleteFile = useCallback(async (file: StoredFile) => {
        if (window.confirm(`「${file.displayName}」を削除しますか？`)) {
            await onDeleteFile(file);
            setSelectedFiles(prev => prev.filter(f => f.documentId !== file.documentId));
        }
    }, [onDeleteFile]);

    // Bulk delete selected files
    const handleBulkDelete = useCallback(async () => {
        if (selectedFiles.length === 0) return;
        const count = selectedFiles.length;
        if (window.confirm(`選択した ${count} 件のファイルを削除しますか？`)) {
            for (const file of selectedFiles) {
                await onDeleteFile(file);
            }
            setSelectedFiles([]);
        }
    }, [selectedFiles, onDeleteFile]);

    // Clear selection
    const handleClearSelection = useCallback(() => {
        setSelectedFiles([]);
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Space - Quick Look
            if (e.code === 'Space' && selectedFiles.length === 1 && !isDetailPanelOpen) {
                e.preventDefault();
                setIsDetailPanelOpen(true);
            }

            // Escape - Clear selection or close modal
            if (e.key === 'Escape') {
                if (isDetailPanelOpen) {
                    setIsDetailPanelOpen(false);
                } else if (isContextMenuOpen) {
                    setIsContextMenuOpen(false);
                } else {
                    setSelectedFiles([]);
                }
            }

            // Delete/Backspace - Delete selected files
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFiles.length > 0) {
                e.preventDefault();
                if (selectedFiles.length === 1) {
                    handleDeleteFile(selectedFiles[0]);
                } else {
                    handleBulkDelete();
                }
            }

            // Ctrl/Cmd + A - Select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                setSelectedFiles(filteredFiles);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedFiles, isDetailPanelOpen, isContextMenuOpen, filteredFiles, handleDeleteFile, handleBulkDelete]);

    // Handle delete from detail panel
    const handleDeleteFromPanel = useCallback(async (file: StoredFile) => {
        await onDeleteFile(file);
        setSelectedFiles([]);
        setIsDetailPanelOpen(false);
    }, [onDeleteFile]);

    // Context menu handlers
    const handleContextPreview = useCallback((file: StoredFile) => {
        setSelectedFiles([file]);
        setIsDetailPanelOpen(true);
    }, []);

    const handleContextCopyName = useCallback((_file: StoredFile) => {
        // Already copied by the context menu component
    }, []);

    const handleContextDelete = useCallback((file: StoredFile) => {
        handleDeleteFile(file);
    }, [handleDeleteFile]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full bg-sys-bg-base"
        >
            {/* Header / Toolbar */}
            <div className="
                flex items-center justify-between gap-4
                px-6 py-4 border-b border-sys-separator
                glass-header
            ">
                {/* Left: Store Name */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-subheadline text-sys-text-primary font-medium">
                        {store.displayName}
                    </span>
                </div>

                {/* Center: Search Bar */}
                <div className="flex-1 max-w-md">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="ファイル名で検索..."
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <ViewToggle mode={viewMode} onChange={setViewMode} />

                    <button
                        onClick={handleUploadButtonClick}
                        disabled={isUploading}
                        className="
                            px-4 py-2 rounded-lg
                            bg-action-primary text-white
                            text-footnote font-medium
                            hover:bg-action-hover transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center gap-2
                        "
                    >
                        {isUploading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                アップロード中...
                            </>
                        ) : (
                            <>
                                <span>+</span>
                                アップロード
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Chips */}
            <FilterChips
                activeFilters={activeFilters}
                availableValues={availableValues}
                onChange={setActiveFilters}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : files.length === 0 ? (
                    <EmptyState />
                ) : filteredFiles.length === 0 ? (
                    <EmptyState hasFilters={hasActiveFilters} />
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                        <AnimatePresence mode="popLayout">
                            {filteredFiles.map(file => (
                                <div
                                    key={file.documentId}
                                    onContextMenu={(e) => handleContextMenu(file, e)}
                                >
                                    <FileCard
                                        file={file}
                                        isSelected={selectedFiles.some(f => f.documentId === file.documentId)}
                                        onSelect={(f) => handleSelectFile(f)}
                                        onDelete={handleDeleteFile}
                                    />
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* List View */
                    <div className="flex flex-col">
                        {/* List Header */}
                        <div className="
                            flex items-center gap-4 px-4 py-2
                            border-b border-sys-separator
                            text-caption-1 text-sys-text-tertiary uppercase
                        ">
                            <div className="w-8" /> {/* Icon spacer */}
                            <div className="flex-1">名前</div>
                            <div className="w-20 text-right">サイズ</div>
                            <div className="w-24 text-right">日付</div>
                            <div className="w-16 text-right">状態</div>
                            <div className="w-7" /> {/* Delete button spacer */}
                        </div>

                        {/* List Items */}
                        <AnimatePresence mode="popLayout">
                            {filteredFiles.map(file => (
                                <div
                                    key={file.documentId}
                                    onContextMenu={(e) => handleContextMenu(file, e)}
                                >
                                    <FileListItem
                                        file={file}
                                        isSelected={selectedFiles.some(f => f.documentId === file.documentId)}
                                        onSelect={(f) => handleSelectFile(f)}
                                        onDelete={handleDeleteFile}
                                    />
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedFiles.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 250,
                            damping: 25,
                        }}
                        className="
                            fixed bottom-6 left-1/2 -translate-x-1/2
                            flex items-center gap-4
                            px-5 py-3 rounded-2xl
                            bg-sys-bg-base/95 backdrop-blur-xl
                            border border-sys-separator/50
                            shadow-2xl
                        "
                    >
                        <span className="text-subheadline text-sys-text-primary">
                            {selectedFiles.length} 件選択中
                        </span>
                        <button
                            onClick={handleBulkDelete}
                            className="
                                px-3 py-1.5 rounded-lg
                                bg-feedback-danger/10 text-feedback-danger
                                text-footnote font-medium
                                hover:bg-feedback-danger/20
                                transition-colors
                                flex items-center gap-1.5
                            "
                        >
                            🗑 削除
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="
                                px-3 py-1.5 rounded-lg
                                text-sys-text-secondary
                                text-footnote
                                hover:bg-sys-bg-alt
                                transition-colors
                            "
                        >
                            × 選択解除
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Context Menu */}
            <FileContextMenu
                file={contextMenuFile}
                position={contextMenuPosition}
                isOpen={isContextMenuOpen}
                onClose={() => setIsContextMenuOpen(false)}
                onPreview={handleContextPreview}
                onCopyName={handleContextCopyName}
                onDelete={handleContextDelete}
            />

            {/* Quick Look Detail Panel */}
            <FileDetailPanel
                file={selectedFiles.length === 1 ? selectedFiles[0] : null}
                isOpen={isDetailPanelOpen}
                onClose={() => setIsDetailPanelOpen(false)}
                onDelete={handleDeleteFromPanel}
            />

            {/* Metadata Wizard Modal */}
            <MetadataWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onUpload={handleUploadWithMetadata}
                isUploading={isUploading}
            />
        </motion.div>
    );
}

export default KnowledgeFinder;
