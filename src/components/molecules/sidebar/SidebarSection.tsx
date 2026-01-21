import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarSectionProps {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export function SidebarSection({ title, icon, isOpen, onToggle, action, children }: SidebarSectionProps) {
    return (
        <div className="mb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2 py-2 text-left group"
            >
                {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-sys-text-tertiary" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-sys-text-tertiary" />
                )}
                {icon}
                <span className="flex-1 text-footnote font-medium text-sys-text-secondary uppercase tracking-wide">
                    {title}
                </span>
                {action}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="pl-5 mt-1 overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
