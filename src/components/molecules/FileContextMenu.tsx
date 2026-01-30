/**
 * FileContextMenu Component
 * Right-click context menu for file operations
 * DESIGN_RULE.md compliant with Spring animations
 */

import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoredFile } from '../../types';

// ============================================
// Types
// ============================================

interface MenuPosition {
    x: number;
    y: number;
}

interface FileContextMenuProps {
    file: StoredFile | null;
    position: MenuPosition | null;
    isOpen: boolean;
    onClose: () => void;
    onPreview: (file: StoredFile) => void;
    onCopyName: (file: StoredFile) => void;
    onDelete: (file: StoredFile) => void;
}

// ============================================
// Menu Item Component
// ============================================

interface MenuItemProps {
    icon: string;
    label: string;
    shortcut?: string;
    isDanger?: boolean;
    onClick: () => void;
}

function MenuItem({ icon, label, shortcut, isDanger = false, onClick }: MenuItemProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ backgroundColor: isDanger ? 'rgba(255, 69, 58, 0.15)' : 'rgba(0, 122, 255, 0.1)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`
                w-full flex items-center gap-3 px-3 py-2
                text-left text-subheadline
                rounded-md
                transition-colors
                ${isDanger ? 'text-feedback-danger' : 'text-sys-text-primary'}
            `}
        >
            <span className="w-5 text-center">{icon}</span>
            <span className="flex-1">{label}</span>
            {shortcut && (
                <span className="text-caption-1 text-sys-text-tertiary">
                    {shortcut}
                </span>
            )}
        </motion.button>
    );
}

// ============================================
// Divider Component
// ============================================

function Divider() {
    return <div className="h-px bg-sys-separator/50 my-1" />;
}

// ============================================
// Main Component
// ============================================

export function FileContextMenu({
    file,
    position,
    isOpen,
    onClose,
    onPreview,
    onCopyName,
    onDelete,
}: FileContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handlePreview = useCallback(() => {
        if (file) {
            onPreview(file);
            onClose();
        }
    }, [file, onPreview, onClose]);

    const handleCopyName = useCallback(async () => {
        if (file) {
            await navigator.clipboard.writeText(file.displayName);
            onCopyName(file);
            onClose();
        }
    }, [file, onCopyName, onClose]);

    const handleDelete = useCallback(() => {
        if (file) {
            onDelete(file);
            onClose();
        }
    }, [file, onDelete, onClose]);

    if (!file || !position) return null;

    // Calculate menu position to keep it within viewport
    const adjustedPosition = {
        x: Math.min(position.x, window.innerWidth - 200),
        y: Math.min(position.y, window.innerHeight - 180),
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                    }}
                    style={{
                        position: 'fixed',
                        left: adjustedPosition.x,
                        top: adjustedPosition.y,
                        zIndex: 100,
                    }}
                    className="
                        min-w-[180px]
                        bg-sys-bg-base/95 backdrop-blur-xl
                        border border-sys-separator/50
                        rounded-xl shadow-2xl
                        py-1.5 px-1.5
                    "
                >
                    <MenuItem
                        icon="👁️"
                        label="プレビュー"
                        shortcut="Space"
                        onClick={handlePreview}
                    />

                    <Divider />

                    <MenuItem
                        icon="📋"
                        label="名前をコピー"
                        onClick={handleCopyName}
                    />

                    <Divider />

                    <MenuItem
                        icon="🗑"
                        label="削除"
                        isDanger
                        onClick={handleDelete}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default FileContextMenu;
