import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Plus, Trash2 } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { useApp } from '../../../context/AppContext';
import type { FileSearchStore } from '../../../types';

interface KnowledgeStoresSectionProps {
    isOpen: boolean;
    onToggle: () => void;
    stores: FileSearchStore[];
    currentStore?: FileSearchStore | null;
    onStoreSelect?: (storeName: string) => void;
    onCreateStore?: (displayName: string) => Promise<void>;
    onDeleteStore?: (storeName: string) => Promise<void>;
    isLoadingStores?: boolean;
}

export function KnowledgeStoresSection({
    isOpen,
    onToggle,
    stores,
    onStoreSelect,
    onCreateStore,
    onDeleteStore,
    isLoadingStores = false,
}: KnowledgeStoresSectionProps) {
    const [newStoreName, setNewStoreName] = useState('');
    const [isCreatingStore, setIsCreatingStore] = useState(false);
    const [isAddingStore, setIsAddingStore] = useState(false);

    // AppContext連携
    const { selectedStoreId, setSelectedStore } = useApp();

    const handleCreateStore = async () => {
        if (!onCreateStore || !newStoreName.trim()) return;
        setIsCreatingStore(true);
        try {
            await onCreateStore(newStoreName.trim());
            setNewStoreName('');
            setIsAddingStore(false);
        } finally {
            setIsCreatingStore(false);
        }
    };

    // ストア選択ハンドラー
    const handleStoreClick = (store: FileSearchStore) => {
        // AppContextに選択状態を設定
        setSelectedStore(store.storeName, store.displayName);
        // 既存のonStoreSelectも呼び出し
        onStoreSelect?.(store.storeName);
    };

    return (
        <SidebarSection
            title="① ストア選択"
            icon={<Database className="w-4 h-4 text-action-primary" />}
            isOpen={isOpen}
            onToggle={onToggle}
            action={
                onCreateStore && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingStore(!isAddingStore);
                        }}
                        className={`
                            p-1 rounded transition-colors
                            ${isAddingStore
                                ? 'bg-action-primary text-white'
                                : 'hover:bg-sys-bg-alt text-sys-text-tertiary'
                            }
                        `}
                        title={isAddingStore ? "キャンセル" : "新規ストア作成"}
                    >
                        <Plus
                            className={`
                                w-3.5 h-3.5 transition-transform duration-200
                                ${isAddingStore ? 'rotate-45' : ''}
                            `}
                        />
                    </button>
                )
            }
        >
            {/* Loading State */}
            {isLoadingStores ? (
                <div className="py-4 text-center">
                    <div className="w-5 h-5 border-2 border-action-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : stores.length === 0 ? (
                <p className="text-footnote text-sys-text-tertiary py-2">
                    ストアがありません
                </p>
            ) : (
                <div className="space-y-1 relative">
                    {stores.map((store) => {
                        const isSelected = selectedStoreId === store.storeName;
                        return (
                            <button
                                key={store.storeName}
                                onClick={() => handleStoreClick(store)}
                                className={`
                                    w-full text-left px-3 py-2 rounded-button 
                                    transition-all duration-200 relative
                                    flex items-center gap-2 group
                                    ${isSelected
                                        ? 'text-action-primary'
                                        : 'hover:bg-sys-bg-alt'
                                    }
                                `}
                            >
                                {/* Liquid Glass 選択背景 */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="store-selection-highlight"
                                        className="absolute inset-0 rounded-button bg-action-primary/10 backdrop-blur-sm"
                                        style={{
                                            backdropFilter: 'blur(20px) saturate(180%)',
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                {/* 左インジケータ */}
                                {isSelected && (
                                    <motion.div
                                    />
                                )}
                                <Database className="w-4 h-4 text-action-primary flex-shrink-0" />
                                <span className="text-footnote truncate flex-1 relative z-10 text-sys-text-primary">
                                    {store.displayName}
                                </span>

                                {/* Delete Button */}
                                {onDeleteStore && (
                                    <div
                                        role="button"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`「${store.displayName}」を削除してもよろしいですか？\n※この操作は取り消せません。`)) {
                                                await onDeleteStore(store.storeName);
                                            }
                                        }}
                                        className={`
                                            p-1 rounded opacity-0 group-hover:opacity-100
                                            transition-all duration-200
                                            hover:bg-feedback-danger/10 hover:text-feedback-danger
                                            text-sys-text-tertiary relative z-20
                                        `}
                                        title="ストアを削除"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Create Store Form */}
            <AnimatePresence>
                {onCreateStore && isAddingStore && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 border-t border-sys-separator">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="新規ストア名..."
                                    value={newStoreName}
                                    onChange={(e) => setNewStoreName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateStore()}
                                    autoFocus
                                    className="
                                        flex-1 px-3 py-1.5 rounded-lg
                                        bg-sys-bg-base border border-sys-separator
                                        text-footnote text-sys-text-primary
                                        placeholder:text-sys-text-tertiary
                                        focus:outline-none focus:ring-2 focus:ring-action-primary/30 focus:ring-inset focus:border-action-primary
                                    "
                                    disabled={isCreatingStore}
                                />
                                <button
                                    onClick={handleCreateStore}
                                    disabled={!newStoreName.trim() || isCreatingStore}
                                    className="
                                        px-3 py-1.5 rounded-lg
                                        bg-action-primary text-white text-footnote
                                        hover:bg-action-hover transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                >
                                    {isCreatingStore ? '...' : '作成'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SidebarSection>
    );
}

