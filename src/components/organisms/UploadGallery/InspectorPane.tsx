/**
 * InspectorPane Component
 * メタデータ入力フォーム（右側パネル）
 * 選択状態に応じてフォーム内容を切り替え
 */

import { useMemo } from 'react';
import { Settings, FileText, Layers } from 'lucide-react';
import { Select } from '../../atoms';
import type { FileUploadItem, GlobalMetadata, FileItemMetadata } from '../../../types/upload';
import type { FileSearchStore } from '../../../types';
import { METADATA_OPTIONS } from '../../../types';

// ============================================
// Types
// ============================================

interface InspectorPaneProps {
    items: FileUploadItem[];
    selectedIds: string[];
    globalMetadata: GlobalMetadata;
    stores: FileSearchStore[];
    isUploading: boolean;
    onGlobalMetadataChange: (metadata: Partial<GlobalMetadata>) => void;
    onItemMetadataChange: (id: string, metadata: Partial<FileItemMetadata>) => void;
    onBulkMetadataChange: (ids: string[], metadata: Partial<FileItemMetadata>) => void;
}

// ============================================
// Component
// ============================================

export function InspectorPane({
    items,
    selectedIds,
    globalMetadata,
    stores,
    isUploading,
    onGlobalMetadataChange,
    onItemMetadataChange,
    onBulkMetadataChange,
}: InspectorPaneProps) {

    // 選択状態に基づくモード判定
    const mode = useMemo(() => {
        if (selectedIds.length === 0) return 'global' as const;
        if (selectedIds.length === 1) return 'single' as const;
        return 'multi' as const;
    }, [selectedIds.length]);

    const selectedItems = useMemo(() => {
        return items.filter(item => selectedIds.includes(item.id));
    }, [items, selectedIds]);

    const singleItem = mode === 'single' ? selectedItems[0] : null;

    // ストア選択肢
    const storeOptions = useMemo(() => [
        { value: '', label: 'ストアを選択...' },
        ...stores.map(s => ({
            value: s.storeName,
            label: s.displayName || s.storeName,
        })),
    ], [stores]);

    // ============================================
    // Handlers
    // ============================================

    const handleStoreChange = (value: string) => {
        if (mode === 'global') {
            onGlobalMetadataChange({ storeName: value });
        } else if (mode === 'single' && singleItem) {
            onItemMetadataChange(singleItem.id, { storeName: value });
        } else {
            onBulkMetadataChange(selectedIds, { storeName: value });
        }
    };

    const handleCompanyChange = (value: string) => {
        if (mode === 'global') {
            onGlobalMetadataChange({ company: value });
        } else if (mode === 'single' && singleItem) {
            onItemMetadataChange(singleItem.id, { company: value });
        } else {
            onBulkMetadataChange(selectedIds, { company: value });
        }
    };

    const handleDepartmentChange = (value: string) => {
        if (mode === 'global') {
            onGlobalMetadataChange({ department: value });
        } else if (mode === 'single' && singleItem) {
            onItemMetadataChange(singleItem.id, { department: value });
        } else {
            onBulkMetadataChange(selectedIds, { department: value });
        }
    };

    const handleFiletypeChange = (value: string) => {
        if (mode === 'global') {
            onGlobalMetadataChange({ filetype: value });
        } else if (mode === 'single' && singleItem) {
            onItemMetadataChange(singleItem.id, { filetype: value });
        } else {
            onBulkMetadataChange(selectedIds, { filetype: value });
        }
    };

    // 表示値の取得 (個別 ?? グローバル)
    const getValue = (field: keyof FileItemMetadata & keyof GlobalMetadata): string => {
        if (mode === 'global') {
            return globalMetadata[field] || '';
        }
        if (mode === 'single' && singleItem) {
            return singleItem.metadata[field] || '';
        }
        // 複数選択時: 共通値があれば表示、なければ空
        const values = selectedItems.map(item => item.metadata[field]).filter(Boolean);
        const unique = [...new Set(values)];
        return unique.length === 1 ? (unique[0] || '') : '';
    };

    const getPlaceholder = (field: keyof GlobalMetadata): string => {
        if (mode !== 'global' && globalMetadata[field]) {
            return `一括: ${globalMetadata[field]}`;
        }
        return '選択...';
    };

    // ============================================
    // Render
    // ============================================

    const HeaderIcon = mode === 'global' ? Settings : mode === 'single' ? FileText : Layers;
    const headerTitle = mode === 'global'
        ? '一括設定'
        : mode === 'single'
            ? singleItem?.metadata.displayName || singleItem?.file.name || 'ファイル詳細'
            : `${selectedIds.length}項目を編集`;
    const headerSubtitle = mode === 'global'
        ? '全ファイルに適用されます'
        : mode === 'single'
            ? '個別設定（空欄は一括設定を継承）'
            : '選択したファイルに適用';

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 p-4 pb-3 border-b border-sys-separator">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-action-primary/10">
                        <HeaderIcon className="w-4 h-4 text-action-primary" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-subheadline font-semibold text-sys-text-primary truncate">
                            {headerTitle}
                        </h3>
                        <p className="text-caption-1 text-sys-text-tertiary">
                            {headerSubtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Store Picker */}
                <Select
                    label="アップロード先ストア"
                    value={getValue('storeName')}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    options={storeOptions}
                    disabled={isUploading}
                />

                <div className="h-px bg-sys-separator" />

                {/* Metadata Fields */}
                <div className="space-y-3">
                    <p className="text-caption-1 font-medium text-sys-text-secondary uppercase tracking-wider">
                        メタデータ
                    </p>

                    <Select
                        label="会社"
                        value={getValue('company')}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                        options={[
                            { value: '', label: getPlaceholder('company') },
                            ...METADATA_OPTIONS.company.map(v => ({ value: v, label: v })),
                        ]}
                        disabled={isUploading}
                    />

                    <Select
                        label="部署"
                        value={getValue('department')}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        options={[
                            { value: '', label: getPlaceholder('department') },
                            ...METADATA_OPTIONS.department.map(v => ({ value: v, label: v })),
                        ]}
                        disabled={isUploading}
                    />

                    <Select
                        label="ファイル種別"
                        value={getValue('filetype')}
                        onChange={(e) => handleFiletypeChange(e.target.value)}
                        options={[
                            { value: '', label: getPlaceholder('filetype') },
                            ...METADATA_OPTIONS.filetype.map(v => ({ value: v, label: v })),
                        ]}
                        disabled={isUploading}
                    />
                </div>

                {/* Selection hint */}
                {items.length > 0 && mode === 'global' && (
                    <div className="mt-4 p-3 finder-card">
                        <p className="text-caption-1 text-sys-text-tertiary">
                            💡 ファイルをクリックすると個別設定ができます。
                            Ctrl/⌘+Clickで複数選択可能です。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InspectorPane;
