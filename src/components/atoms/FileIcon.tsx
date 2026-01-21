/**
 * FileIcon Component
 * Displays an icon based on the file MIME type or extension.
 * Uses Lucide React icons with macOS Finder-inspired colors.
 */
import {
    FileText,
    FileSpreadsheet,
    FileImage,
    Presentation,
    FileCode,
    File,
    FileJson
} from 'lucide-react';

interface FileIconProps {
    mimeType: string;
    className?: string;
}

export function FileIcon({ mimeType, className = '' }: FileIconProps) {
    // Normalize mime type for simpler checking
    const type = mimeType.toLowerCase();

    // Helper to determine icon and color
    const getIconData = () => {
        if (type.includes('pdf')) {
            return { Icon: FileText, color: 'text-red-500' };
        }
        if (type.includes('word') || type.includes('document') || type.includes('msword')) {
            return { Icon: FileText, color: 'text-blue-500' };
        }
        if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
            return { Icon: FileSpreadsheet, color: 'text-green-500' };
        }
        if (type.includes('presentation') || type.includes('powerpoint')) {
            return { Icon: Presentation, color: 'text-orange-500' };
        }
        if (type.includes('image') || type.includes('png') || type.includes('jpeg') || type.includes('jpg')) {
            return { Icon: FileImage, color: 'text-purple-500' };
        }
        if (type.includes('json')) {
            return { Icon: FileJson, color: 'text-yellow-600' };
        }
        if (type.includes('xml') || type.includes('html') || type.includes('css') || type.includes('javascript') || type.includes('typescript')) {
            return { Icon: FileCode, color: 'text-zinc-500' };
        }
        if (type.includes('text') || type.includes('plain')) {
            return { Icon: FileText, color: 'text-sys-text-secondary' };
        }

        // Default
        return { Icon: File, color: 'text-sys-text-tertiary' };
    };

    const { Icon, color } = getIconData();

    return (
        <div className={`${color} ${className} flex items-center justify-center`}>
            <Icon className="w-full h-full stroke-[1.5]" />
        </div>
    );
}

export default FileIcon;
