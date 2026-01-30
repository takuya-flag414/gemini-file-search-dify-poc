/**
 * FilterChips Component
 * Toggleable metadata filter chips for Knowledge Finder
 * DESIGN_RULE.md compliant Spring animations
 */

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface ActiveFilters {
    company: string[];
    department: string[];
    filetype: string[];
}

interface FilterChipsProps {
    activeFilters: ActiveFilters;
    availableValues: {
        company: string[];
        department: string[];
        filetype: string[];
    };
    onChange: (filters: ActiveFilters) => void;
}

// ============================================
// Filter Category Config
// ============================================

const CATEGORY_CONFIG = {
    company: { label: '会社', icon: '🏢' },
    department: { label: '部署', icon: '📂' },
    filetype: { label: '種類', icon: '📄' },
} as const;

type FilterCategory = keyof typeof CATEGORY_CONFIG;

// ============================================
// Single Chip Component
// ============================================

interface ChipProps {
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

function Chip({ label, icon, isActive, onClick }: ChipProps) {
    return (
        <motion.button
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            onClick={onClick}
            className={`
                px-2.5 py-1 rounded-full
                text-caption-1 font-medium
                flex items-center gap-1
                transition-colors cursor-pointer
                border
                ${isActive
                    ? 'bg-action-primary text-white border-action-primary'
                    : 'bg-sys-bg-alt/60 text-sys-text-secondary border-sys-separator hover:bg-sys-bg-alt hover:border-sys-separator/80'
                }
            `}
        >
            <span className="text-xs">{icon}</span>
            <span className="truncate max-w-[100px]">{label}</span>
        </motion.button>
    );
}

// ============================================
// Clear All Button
// ============================================

interface ClearAllButtonProps {
    onClick: () => void;
}

function ClearAllButton({ onClick }: ClearAllButtonProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            onClick={onClick}
            className="
                px-2.5 py-1 rounded-full
                text-caption-1 font-medium
                flex items-center gap-1
                bg-feedback-danger/10 text-feedback-danger
                border border-feedback-danger/20
                hover:bg-feedback-danger/20
                transition-colors cursor-pointer
            "
        >
            <X className="w-3 h-3" />
            <span>解除</span>
        </motion.button>
    );
}

// ============================================
// Main Component
// ============================================

export function FilterChips({
    activeFilters,
    availableValues,
    onChange,
}: FilterChipsProps) {
    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return (
            activeFilters.company.length > 0 ||
            activeFilters.department.length > 0 ||
            activeFilters.filetype.length > 0
        );
    }, [activeFilters]);

    // Toggle a single filter value
    const toggleFilter = useCallback(
        (category: FilterCategory, value: string) => {
            const currentValues = activeFilters[category];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];

            onChange({
                ...activeFilters,
                [category]: newValues,
            });
        },
        [activeFilters, onChange]
    );

    // Clear all filters
    const clearAll = useCallback(() => {
        onChange({
            company: [],
            department: [],
            filetype: [],
        });
    }, [onChange]);

    // If no available values, don't render
    const hasAvailableValues =
        availableValues.company.length > 0 ||
        availableValues.department.length > 0 ||
        availableValues.filetype.length > 0;

    if (!hasAvailableValues) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: 'spring',
                stiffness: 250,
                damping: 25,
            }}
            className="flex flex-wrap items-center gap-2 px-6 py-2 border-b border-sys-separator/50 bg-sys-bg-base/50"
        >
            {/* Render chips by category */}
            {(Object.keys(CATEGORY_CONFIG) as FilterCategory[]).map((category) => {
                const config = CATEGORY_CONFIG[category];
                const values = availableValues[category];

                if (values.length === 0) return null;

                return values.map((value) => (
                    <Chip
                        key={`${category}-${value}`}
                        label={value}
                        icon={config.icon}
                        isActive={activeFilters[category].includes(value)}
                        onClick={() => toggleFilter(category, value)}
                    />
                ));
            })}

            {/* Clear All Button */}
            <AnimatePresence>
                {hasActiveFilters && <ClearAllButton onClick={clearAll} />}
            </AnimatePresence>
        </motion.div>
    );
}

export default FilterChips;
