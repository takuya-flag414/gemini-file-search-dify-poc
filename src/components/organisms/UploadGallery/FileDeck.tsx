/**
 * FileDeck Component
 * ファイル一覧をグリッド表示し、選択操作を提供する
 * UploadGallery の左側パネル
 */

import { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileCard } from './FileCard';
import { FileDropZone } from '../../molecules/FileDropZone';
import type { FileUploadItem } from '../../../types/upload';

// ============================================
// Types
// ============================================

interface FileDeckProps {
    items: FileUploadItem[];
    selectedIds: string[];
    isUploading: boolean;
    onSelect: (id: string) => void;
    onToggle: (id: string) => void;
    onClearSelection: () => void;
    onRemove: (id: string) => void;
    onAddFiles: (files: File[]) => void;
}

// ============================================
// Component
// ============================================

export function FileDeck({
    items,
    selectedIds,
    isUploading,
    onSelect,
    onToggle,
    onClearSelection,
    onRemove,
    onAddFiles,
}: FileDeckProps) {

    const handleCardClick = useCallback((id: string, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            onToggle(id);
        } else {
            onSelect(id);
        }
    }, [onSelect, onToggle]);

    const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
        // カード以外をクリックした場合のみ全選択解除
        if (e.target === e.currentTarget) {
            onClearSelection();
        }
    }, [onClearSelection]);

    return (
        <div
            className="flex flex-col h-full overflow-hidden"
            onClick={handleBackgroundClick}
        >
            {/* File Grid */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        <AnimatePresence mode="popLayout">
                            {items.map(item => (
                                <FileCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedIds.includes(item.id)}
                                    onClick={(e) => handleCardClick(item.id, e)}
                                    onRemove={() => onRemove(item.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-sys-text-tertiary">
                        <p className="text-footnote">ファイルを追加してください</p>
                    </div>
                )}
            </div>

            {/* Drop Zone (Compact, always visible) */}
            {!isUploading && (
                <div className="flex-shrink-0 p-3 pt-0">
                    <FileDropZone
                        onFilesDrop={onAddFiles}
                        isUploading={false}
                        multiple={true}
                        compact={true}
                    />
                </div>
            )}
        </div>
    );
}

export default FileDeck;
