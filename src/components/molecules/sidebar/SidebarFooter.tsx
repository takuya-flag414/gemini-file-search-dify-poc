import { Moon, Sun } from 'lucide-react';
import { MockModeToggle } from '../../atoms';

interface SidebarFooterProps {
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

export function SidebarFooter({ isDarkMode, onToggleDarkMode }: SidebarFooterProps) {
    return (
        <div className="p-4 border-t border-sys-separator space-y-2">
            {/* Mock Mode Toggle */}
            <MockModeToggle />

            {/* Dark Mode Toggle */}
            <button
                onClick={onToggleDarkMode}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-button hover:bg-sys-bg-alt transition-colors"
            >
                {isDarkMode ? (
                    <Sun className="w-4 h-4 text-sys-text-secondary" />
                ) : (
                    <Moon className="w-4 h-4 text-sys-text-secondary" />
                )}
                <span className="text-subheadline text-sys-text-primary">
                    {isDarkMode ? 'ライトモード' : 'ダークモード'}
                </span>
            </button>
        </div>
    );
}
